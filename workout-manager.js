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
        console.log('🔥 Iniciando workout...', { userId, rutinaId, rutina: rutina?.nombre });
        
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const workoutRef = doc(workoutsRef);
        
        console.log('📝 WorkoutRef creado:', workoutRef.id);
        
        const ahora = new Date();
        const fechaISO = ahora.toISOString().split('T')[0];
        
        // Preparar ejercicios con estructura de series vacías
        const ejercicios = [];
        if (rutina && rutina.ejercicios && rutina.ejercicios.length > 0) {
            console.log('📋 Procesando', rutina.ejercicios.length, 'ejercicios de la rutina...');
            
            for (const ej of rutina.ejercicios) {
                const exerciseData = await obtenerEjercicioPorId(ej.exerciseId);
                
                // Crear series vacías según la configuración
                const series = [];
                for (let i = 1; i <= (ej.series || 3); i++) {
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
                    exerciseName: exerciseData ? exerciseData.name : ej.exerciseId,
                    orden: ej.orden || ejercicios.length,
                    series: series
                });
            }
        } else {
            console.log('📭 Workout vacío - sin ejercicios');
        }
        
        const nuevoWorkout = {
            fecha: Timestamp.now(),
            fechaISO: fechaISO,
            rutinaId: rutinaId,
            nombre: rutina ? rutina.nombre : 'Entrenamiento Libre',
            estado: 'en_progreso',
            horaInicio: Timestamp.now(),
            horaFin: null,
            duracion: 0,
            ejercicios: ejercicios,
            stats: {
                volumenTotal: 0,
                seriesCompletadas: 0,
                ejerciciosCompletados: 0
            }
        };
        
        console.log('💾 Guardando workout en Firestore...');
        await setDoc(workoutRef, nuevoWorkout);
        
        console.log('✅ Workout guardado exitosamente:', workoutRef.id);
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
        
        // Consulta simple sin índice compuesto
        const q = query(
            workoutsRef,
            where('estado', '==', 'completado'),
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
        
        // Ordenar manualmente por fecha
        workouts.sort((a, b) => {
            const fechaA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha || 0);
            const fechaB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha || 0);
            return fechaB - fechaA;
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

// ================================================
// PROGRESO POR EJERCICIO
// ================================================

/**
 * Obtiene todos los workouts que contienen un ejercicio específico
 * @param {string} userId - ID del usuario
 * @param {string} exerciseId - ID del ejercicio
 * @param {number} limite - Número máximo de workouts a retornar
 * @returns {Promise<Array>} - Array de workouts con el ejercicio
 */
export async function obtenerWorkoutsConEjercicio(userId, exerciseId, limite = 50) {
    try {
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const q = query(
            workoutsRef,
            where('estado', '==', 'completado'),
            orderBy('fechaISO', 'desc'),
            limit(limite)
        );
        
        const snapshot = await getDocs(q);
        const workouts = [];
        
        snapshot.forEach(doc => {
            const workout = { id: doc.id, ...doc.data() };
            
            // Verificar si este workout contiene el ejercicio
            const ejercicio = workout.ejercicios?.find(e => e.exerciseId === exerciseId);
            
            if (ejercicio) {
                workouts.push({
                    id: workout.id,
                    fecha: workout.fecha?.toDate ? workout.fecha.toDate() : new Date(workout.fechaISO),
                    fechaISO: workout.fechaISO,
                    rutinaId: workout.rutinaId,
                    rutinaNombre: workout.rutinaNombre,
                    ejercicio: ejercicio,
                    duracion: workout.duracion,
                    estadisticas: workout.estadisticas
                });
            }
        });
        
        console.log(`✅ Encontrados ${workouts.length} workouts con ejercicio ${exerciseId}`);
        return workouts.reverse(); // Orden cronológico ascendente
    } catch (error) {
        console.error('❌ Error al obtener workouts con ejercicio:', error);
        throw error;
    }
}

/**
 * Obtiene el progreso de un ejercicio con estadísticas
 * @param {string} userId - ID del usuario
 * @param {string} exerciseId - ID del ejercicio
 * @returns {Promise<Object>} - Datos de progreso del ejercicio
 */
export async function obtenerProgresoEjercicio(userId, exerciseId) {
    try {
        const workouts = await obtenerWorkoutsConEjercicio(userId, exerciseId);
        
        if (workouts.length === 0) {
            return {
                totalWorkouts: 0,
                fechas: [],
                pesoMaximo: [],
                volumenTotal: [],
                mejorSerie: null,
                tendencia: 'sin-datos'
            };
        }
        
        const fechas = [];
        const pesoMaximo = [];
        const volumenTotal = [];
        let mejorPeso = 0;
        let mejorSerie = null;
        
        workouts.forEach(w => {
            const ejercicio = w.ejercicio;
            fechas.push(w.fechaISO);
            
            // Peso máximo en ese workout
            const maxPeso = ejercicio.pesoMaximo || 0;
            pesoMaximo.push(maxPeso);
            
            // Volumen total del ejercicio en ese workout
            const volumen = ejercicio.volumenTotal || 0;
            volumenTotal.push(volumen);
            
            // Tracking de mejor serie
            if (maxPeso > mejorPeso) {
                mejorPeso = maxPeso;
                mejorSerie = {
                    fecha: w.fechaISO,
                    peso: maxPeso,
                    reps: ejercicio.repsMaximo || 0
                };
            }
        });
        
        // Calcular tendencia simple
        let tendencia = 'estable';
        if (pesoMaximo.length >= 3) {
            const recientes = pesoMaximo.slice(-3);
            const promReciente = recientes.reduce((a, b) => a + b, 0) / recientes.length;
            const antiguos = pesoMaximo.slice(0, 3);
            const promAntiguo = antiguos.reduce((a, b) => a + b, 0) / antiguos.length;
            
            if (promReciente > promAntiguo * 1.1) tendencia = 'mejorando';
            else if (promReciente < promAntiguo * 0.9) tendencia = 'declinando';
        }
        
        return {
            totalWorkouts: workouts.length,
            fechas,
            pesoMaximo,
            volumenTotal,
            mejorSerie,
            tendencia
        };
    } catch (error) {
        console.error('❌ Error al obtener progreso de ejercicio:', error);
        throw error;
    }
}

// =========================================
// CALCULAR STREAK (RACHA DE DÍAS CONSECUTIVOS)
// =========================================

/**
 * Calcula la racha de días consecutivos con entrenamiento
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<number>} - Número de días consecutivos
 */
export async function calcularStreak(userId) {
    try {
        const q = query(
            collection(db, 'users', userId, 'workouts'),
            where('estado', '==', 'completado'),
            orderBy('fecha', 'desc'),
            limit(365) // Revisar último año
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return 0;
        }
        
        // Obtener fechas únicas (sin horas)
        const fechasSet = new Set();
        snapshot.forEach(doc => {
            const fecha = doc.data().fecha;
            let fechaISO;
            
            if (fecha?.toDate) {
                fechaISO = fecha.toDate().toISOString().split('T')[0];
            } else if (typeof fecha === 'string') {
                fechaISO = fecha.split('T')[0];
            } else if (fecha instanceof Date) {
                fechaISO = fecha.toISOString().split('T')[0];
            }
            
            if (fechaISO) fechasSet.add(fechaISO);
        });
        
        const fechasOrdenadas = Array.from(fechasSet).sort().reverse();
        
        // Calcular streak desde hoy hacia atrás
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let fechaActual = new Date(hoy);
        
        for (const fechaStr of fechasOrdenadas) {
            const fecha = new Date(fechaStr + 'T00:00:00');
            const diffDias = Math.floor((fechaActual - fecha) / (1000 * 60 * 60 * 24));
            
            if (diffDias === 0 || diffDias === 1) {
                streak++;
                fechaActual = new Date(fecha);
            } else {
                break;
            }
        }
        
        return streak;
    } catch (error) {
        console.error('❌ Error al calcular streak:', error);
        return 0;
    }
}

// =========================================
// OBTENER PERSONAL RECORDS (PRs)
// =========================================

/**
 * Obtiene los mejores records personales del usuario
 * 
 * @param {string} userId - ID del usuario
 * @param {number} limite - Número de PRs a obtener
 * @returns {Promise<Array>} - Array de PRs
 */
export async function obtenerPersonalRecords(userId, limite = 5) {
    try {
        const q = query(
            collection(db, 'users', userId, 'workouts'),
            where('estado', '==', 'completado'),
            orderBy('fecha', 'desc'),
            limit(100) // Analizar últimos 100 workouts
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return [];
        }
        
        // Mapa para almacenar el mejor registro de cada ejercicio
        const recordsPorEjercicio = new Map();
        
        snapshot.forEach(doc => {
            const workout = doc.data();
            
            if (!workout.ejercicios) return;
            
            workout.ejercicios.forEach(ej => {
                if (!ej.series || ej.series.length === 0) return;
                
                // Buscar el mejor peso/reps del ejercicio en este workout
                let mejorSerie = null;
                let mejorValor = 0;
                
                ej.series.forEach(serie => {
                    if (!serie.completada) return;
                    
                    let valor = 0;
                    
                    // Calcular valor según tipo de medición
                    if (ej.tipoMedicion === 'peso') {
                        valor = (serie.peso || 0) * (serie.reps || 1);
                    } else if (ej.tipoMedicion === 'reps') {
                        valor = serie.reps || 0;
                    } else if (ej.tipoMedicion === 'tiempo') {
                        valor = serie.tiempo || 0;
                    }
                    
                    if (valor > mejorValor) {
                        mejorValor = valor;
                        mejorSerie = {
                            ...serie,
                            fecha: workout.fecha
                        };
                    }
                });
                
                if (!mejorSerie) return;
                
                // Comparar con el record actual de este ejercicio
                const recordActual = recordsPorEjercicio.get(ej.exerciseId);
                
                if (!recordActual || mejorValor > recordActual.valor) {
                    recordsPorEjercicio.set(ej.exerciseId, {
                        exerciseId: ej.exerciseId,
                        exerciseName: ej.exerciseName,
                        grupoMuscular: ej.grupoMuscular,
                        tipoMedicion: ej.tipoMedicion,
                        valor: mejorValor,
                        serie: mejorSerie,
                        fecha: workout.fecha
                    });
                }
            });
        });
        
        // Convertir a array y ordenar por valor
        const records = Array.from(recordsPorEjercicio.values())
            .sort((a, b) => b.valor - a.valor)
            .slice(0, limite);
        
        return records;
        
    } catch (error) {
        console.error('❌ Error al obtener personal records:', error);
        return [];
    }
}

// =========================================
// BUSCAR HISTORIAL DE EJERCICIO
// =========================================

/**
 * Buscar la última vez que el usuario hizo un ejercicio específico
 * Para pre-cargar datos en workout activo
 * 
 * @param {string} userId - ID del usuario
 * @param {string} exerciseId - ID del ejercicio
 * @returns {Promise<Object|null>} - Datos del ejercicio de la última vez o null
 */
export async function buscarHistorialEjercicio(userId, exerciseId) {
    try {
        console.log(`🔍 Buscando historial de ejercicio ${exerciseId}...`);
        
        // Obtener workouts completados ordenados por fecha
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const q = query(
            workoutsRef,
            where('estado', '==', 'completado'),
            orderBy('fecha', 'desc'),
            limit(50) // Buscar en los últimos 50 workouts
        );
        
        const snapshot = await getDocs(q);
        
        // Buscar el ejercicio en los workouts
        for (const docSnap of snapshot.docs) {
            const workout = docSnap.data();
            
            if (!workout.ejercicios) continue;
            
            // Buscar si este workout tiene el ejercicio
            const ejercicio = workout.ejercicios.find(ej => ej.exerciseId === exerciseId);
            
            if (ejercicio && ejercicio.series && ejercicio.series.length > 0) {
                // Encontrado! Retornar solo las series completadas
                const seriesCompletadas = ejercicio.series.filter(s => s.completada);
                
                if (seriesCompletadas.length > 0) {
                    console.log(`✅ Historial encontrado: ${seriesCompletadas.length} series`);
                    return {
                        exerciseId: ejercicio.exerciseId,
                        exerciseName: ejercicio.exerciseName,
                        series: seriesCompletadas,
                        fecha: workout.fecha
                    };
                }
            }
        }
        
        console.log('❌ No se encontró historial para este ejercicio');
        return null;
        
    } catch (error) {
        console.error('Error al buscar historial de ejercicio:', error);
        return null;
    }
}
