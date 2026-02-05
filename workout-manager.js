// =========================================
// GESTOR DE WORKOUTS
// Sistema de tracking de entrenamientos en tiempo real
// =========================================

import { db } from './firebase-config.js';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { calcularEstadisticasEjercicio, calcularVolumenWorkout, estimarCalorias } from './workout-calculator.js';
import { obtenerEjercicioPorId } from './exercises-db.js';

// =========================================
// INICIAR WORKOUT
// =========================================

/**
 * Iniciar un nuevo workout
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina (puede ser null para workout libre)
 * @param {Object} rutina - Datos de la rutina
 * @returns {Promise<string>} - ID del workout creado
 */
export async function iniciarWorkout(userId, rutinaId = null, rutina = null) {
    try {
        const workoutRef = doc(collection(db, 'users', userId, 'workouts'));
        
        const ahora = new Date();
        const fechaISO = ahora.toISOString().split('T')[0];
        
        // Preparar ejercicios con estructura de series vacías
        const ejercicios = [];
        if (rutina && rutina.ejercicios) {
            for (const ej of rutina.ejercicios) {
                const exerciseData = await obtenerEjercicioPorId(ej.exerciseId);
                
                // Crear series vacías según la configuración
                const series = [];
                for (let i = 1; i <= ej.series; i++) {
                    series.push({
                        set: i,
                        reps: 0,
                        peso: 0,
                        completado: false,
                        timestamp: null
                    });
                }
                
                ejercicios.push({
                    exerciseId: ej.exerciseId,
                    nombreEjercicio: exerciseData ? exerciseData.nombre : ej.exerciseId,
                    orden: ej.orden,
                    series: series,
                    pesoMaximo: 0,
                    volumenTotal: 0,
                    oneRepMax: 0,
                    repsTotal: 0,
                    notas: ''
                });
            }
        }
        
        const nuevoWorkout = {
            fecha: Timestamp.now(),
            fechaISO: fechaISO,
            rutinaId: rutinaId,
            nombreRutina: rutina ? rutina.nombre : 'Workout Libre',
            estado: 'en_progreso',
            horaInicio: Timestamp.now(),
            horaFin: null,
            duracion: 0,
            ejercicios: ejercicios,
            estadisticas: {
                volumenTotal: 0,
                caloriasEstimadas: 0,
                seriesCompletadas: 0,
                ejerciciosCompletados: 0
            },
            notas: '',
            ubicacion: ''
        };
        
        await setDoc(workoutRef, nuevoWorkout);
        
        console.log('✅ Workout iniciado:', workoutRef.id);
        return workoutRef.id;
    } catch (error) {
        console.error('❌ Error al iniciar workout:', error);
        throw error;
    }
}

// =========================================
// GUARDAR SERIE
// =========================================

/**
 * Guardar una serie completada en un workout activo
 * 
 * @param {string} userId - ID del usuario
 * @param {string} workoutId - ID del workout
 * @param {string} exerciseId - ID del ejercicio
 * @param {number} setNumber - Número de la serie (1-indexed)
 * @param {Object} serieData - Datos de la serie {reps, peso}
 * @returns {Promise<boolean>}
 */
export async function guardarSerie(userId, workoutId, exerciseId, setNumber, serieData) {
    try {
        const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
        const workoutSnap = await getDoc(workoutRef);
        
        if (!workoutSnap.exists()) {
            throw new Error('Workout no encontrado');
        }
        
        const workout = workoutSnap.data();
        const ejercicios = [...workout.ejercicios];
        
        // Encontrar el ejercicio
        const ejercicioIndex = ejercicios.findIndex(e => e.exerciseId === exerciseId);
        if (ejercicioIndex === -1) {
            throw new Error('Ejercicio no encontrado en workout');
        }
        
        const ejercicio = ejercicios[ejercicioIndex];
        
        // Actualizar la serie específica
        const serieIndex = ejercicio.series.findIndex(s => s.set === setNumber);
        if (serieIndex !== -1) {
            ejercicio.series[serieIndex] = {
                set: setNumber,
                reps: serieData.reps,
                peso: serieData.peso,
                completado: true,
                timestamp: Timestamp.now()
            };
        }
        
        // Recalcular estadísticas del ejercicio
        const stats = calcularEstadisticasEjercicio(ejercicio.series);
        ejercicio.pesoMaximo = stats.pesoMaximo;
        ejercicio.volumenTotal = stats.volumenTotal;
        ejercicio.oneRepMax = stats.oneRepMax;
        ejercicio.repsTotal = stats.repsTotal;
        
        // Actualizar ejercicio en el array
        ejercicios[ejercicioIndex] = ejercicio;
        
        // Recalcular estadísticas del workout
        const volumenTotal = calcularVolumenWorkout(ejercicios);
        const seriesCompletadas = ejercicios.reduce((sum, e) => 
            sum + e.series.filter(s => s.completado).length, 0
        );
        
        await updateDoc(workoutRef, {
            ejercicios,
            'estadisticas.volumenTotal': volumenTotal,
            'estadisticas.seriesCompletadas': seriesCompletadas
        });
        
        console.log('✅ Serie guardada:', { exerciseId, setNumber });
        return true;
    } catch (error) {
        console.error('❌ Error al guardar serie:', error);
        throw error;
    }
}

// =========================================
// COMPLETAR WORKOUT
// =========================================

/**
 * Completar un workout y calcular estadísticas finales
 * 
 * @param {string} userId - ID del usuario
 * @param {string} workoutId - ID del workout
 * @param {Object} datosFinales - Datos opcionales finales {notas, ubicacion}
 * @returns {Promise<Object>} - Workout completado con estadísticas
 */
export async function completarWorkout(userId, workoutId, datosFinales = {}) {
    try {
        const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
        const workoutSnap = await getDoc(workoutRef);
        
        if (!workoutSnap.exists()) {
            throw new Error('Workout no encontrado');
        }
        
        const workout = workoutSnap.data();
        const horaFin = Timestamp.now();
        
        // Calcular duración en minutos
        const duracionSegundos = horaFin.seconds - workout.horaInicio.seconds;
        const duracionMinutos = Math.round(duracionSegundos / 60);
        
        // Calcular estadísticas finales
        const volumenTotal = calcularVolumenWorkout(workout.ejercicios);
        const caloriasEstimadas = estimarCalorias(duracionMinutos, volumenTotal);
        
        const seriesCompletadas = workout.ejercicios.reduce((sum, e) => 
            sum + e.series.filter(s => s.completado).length, 0
        );
        
        const ejerciciosCompletados = workout.ejercicios.filter(e =>
            e.series.some(s => s.completado)
        ).length;
        
        const datosActualizados = {
            estado: 'completado',
            horaFin: horaFin,
            duracion: duracionMinutos,
            estadisticas: {
                volumenTotal,
                caloriasEstimadas,
                seriesCompletadas,
                ejerciciosCompletados
            },
            notas: datosFinales.notas || workout.notas || '',
            ubicacion: datosFinales.ubicacion || workout.ubicacion || ''
        };
        
        await updateDoc(workoutRef, datosActualizados);
        
        console.log('✅ Workout completado:', workoutId);
        
        // Retornar workout completado
        return {
            id: workoutId,
            ...workout,
            ...datosActualizados
        };
    } catch (error) {
        console.error('❌ Error al completar workout:', error);
        throw error;
    }
}

// =========================================
// OBTENER WORKOUTS
// =========================================

/**
 * Obtener workout activo (en progreso)
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} - Workout activo o null
 */
export async function obtenerWorkoutActivo(userId) {
    try {
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const q = query(
            workoutsRef,
            where('estado', '==', 'en_progreso'),
            orderBy('horaInicio', 'desc'),
            limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return null;
        }
        
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('❌ Error al obtener workout activo:', error);
        return null;
    }
}

/**
 * Obtener historial de workouts
 * 
 * @param {string} userId - ID del usuario
 * @param {number} limite - Número máximo de workouts a obtener
 * @returns {Promise<Array>} - Array de workouts
 */
export async function obtenerHistorialWorkouts(userId, limite = 20) {
    try {
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const q = query(
            workoutsRef,
            where('estado', '==', 'completado'),
            orderBy('fecha', 'desc'),
            limit(limite)
        );
        
        const snapshot = await getDocs(q);
        
        const workouts = [];
        snapshot.forEach((doc) => {
            workouts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return workouts;
    } catch (error) {
        console.error('❌ Error al obtener historial:', error);
        return [];
    }
}

/**
 * Obtener último workout de una rutina específica
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @returns {Promise<Object|null>} - Último workout o null
 */
export async function obtenerUltimoWorkout(userId, rutinaId) {
    try {
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const q = query(
            workoutsRef,
            where('rutinaId', '==', rutinaId),
            where('estado', '==', 'completado'),
            orderBy('fecha', 'desc'),
            limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return null;
        }
        
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('❌ Error al obtener último workout:', error);
        return null;
    }
}

/**
 * Obtener último registro de un ejercicio específico
 * 
 * @param {string} userId - ID del usuario
 * @param {string} exerciseId - ID del ejercicio
 * @returns {Promise<Object|null>} - Último registro del ejercicio
 */
export async function obtenerUltimoRegistro(userId, exerciseId) {
    try {
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const q = query(
            workoutsRef,
            where('estado', '==', 'completado'),
            orderBy('fecha', 'desc'),
            limit(10) // Obtener últimos 10 para buscar el ejercicio
        );
        
        const snapshot = await getDocs(q);
        
        // Buscar el workout más reciente que contenga este ejercicio
        for (const doc of snapshot.docs) {
            const workout = doc.data();
            const ejercicio = workout.ejercicios?.find(e => e.exerciseId === exerciseId);
            
            if (ejercicio && ejercicio.series.some(s => s.completado)) {
                // Encontrar la mejor serie (más peso)
                const seriesCompletadas = ejercicio.series.filter(s => s.completado);
                const mejorSerie = seriesCompletadas.reduce((best, s) => 
                    (s.peso > best.peso) ? s : best
                , seriesCompletadas[0]);
                
                return {
                    workoutId: doc.id,
                    fecha: workout.fecha,
                    fechaISO: workout.fechaISO,
                    peso: mejorSerie.peso,
                    reps: mejorSerie.reps,
                    volumen: ejercicio.volumenTotal,
                    series: seriesCompletadas
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error al obtener último registro:', error);
        return null;
    }
}

// =========================================
// OPERACIONES ADICIONALES
// =========================================

/**
 * Cancelar un workout en progreso
 * 
 * @param {string} userId - ID del usuario
 * @param {string} workoutId - ID del workout
 * @returns {Promise<boolean>}
 */
export async function cancelarWorkout(userId, workoutId) {
    try {
        const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
        
        await updateDoc(workoutRef, {
            estado: 'cancelado',
            horaFin: Timestamp.now()
        });
        
        console.log('✅ Workout cancelado:', workoutId);
        return true;
    } catch (error) {
        console.error('❌ Error al cancelar workout:', error);
        return false;
    }
}

/**
 * Actualizar notas de un ejercicio en workout activo
 * 
 * @param {string} userId - ID del usuario
 * @param {string} workoutId - ID del workout
 * @param {string} exerciseId - ID del ejercicio
 * @param {string} notas - Notas del ejercicio
 * @returns {Promise<boolean>}
 */
export async function actualizarNotasEjercicio(userId, workoutId, exerciseId, notas) {
    try {
        const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
        const workoutSnap = await getDoc(workoutRef);
        
        if (!workoutSnap.exists()) {
            throw new Error('Workout no encontrado');
        }
        
        const workout = workoutSnap.data();
        const ejercicios = [...workout.ejercicios];
        
        const ejercicioIndex = ejercicios.findIndex(e => e.exerciseId === exerciseId);
        if (ejercicioIndex !== -1) {
            ejercicios[ejercicioIndex].notas = notas;
            
            await updateDoc(workoutRef, { ejercicios });
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('❌ Error al actualizar notas:', error);
        return false;
    }
}

/**
 * Obtener workouts de una fecha específica
 * 
 * @param {string} userId - ID del usuario
 * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Promise<Array>} - Workouts del día
 */
export async function obtenerWorkoutsPorFecha(userId, fechaISO) {
    try {
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const q = query(
            workoutsRef,
            where('fechaISO', '==', fechaISO),
            orderBy('horaInicio', 'desc')
        );
        
        const snapshot = await getDocs(q);
        
        const workouts = [];
        snapshot.forEach((doc) => {
            workouts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return workouts;
    } catch (error) {
        console.error('❌ Error al obtener workouts por fecha:', error);
        return [];
    }
}

/**
 * Obtener estadísticas de workouts de la semana
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Estadísticas semanales
 */
export async function obtenerEstadisticasSemanales(userId) {
    try {
        // Calcular fecha de hace 7 días
        const hoy = new Date();
        const hace7Dias = new Date(hoy);
        hace7Dias.setDate(hoy.getDate() - 7);
        const fechaISO = hace7Dias.toISOString().split('T')[0];
        
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const q = query(
            workoutsRef,
            where('estado', '==', 'completado'),
            where('fechaISO', '>=', fechaISO),
            orderBy('fechaISO', 'desc')
        );
        
        const snapshot = await getDocs(q);
        
        let totalWorkouts = 0;
        let volumenTotal = 0;
        let caloriasTotal = 0;
        let duracionTotal = 0;
        
        snapshot.forEach((doc) => {
            const workout = doc.data();
            totalWorkouts++;
            volumenTotal += workout.estadisticas?.volumenTotal || 0;
            caloriasTotal += workout.estadisticas?.caloriasEstimadas || 0;
            duracionTotal += workout.duracion || 0;
        });
        
        return {
            totalWorkouts,
            volumenTotal,
            caloriasTotal,
            duracionTotal,
            promedioVolumen: totalWorkouts > 0 ? Math.round(volumenTotal / totalWorkouts) : 0,
            promedioCalorias: totalWorkouts > 0 ? Math.round(caloriasTotal / totalWorkouts) : 0,
            promedioDuracion: totalWorkouts > 0 ? Math.round(duracionTotal / totalWorkouts) : 0
        };
    } catch (error) {
        console.error('❌ Error al obtener estadísticas semanales:', error);
        return {
            totalWorkouts: 0,
            volumenTotal: 0,
            caloriasTotal: 0,
            duracionTotal: 0,
            promedioVolumen: 0,
            promedioCalorias: 0,
            promedioDuracion: 0
        };
    }
}
