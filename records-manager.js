// =========================================
// GESTOR DE RÉCORDS PERSONALES
// Cálculo y gestión automática de récords por ejercicio
// =========================================

import { db } from './firebase-config.js';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { calcularOneRepMax } from './workout-calculator.js';
import { obtenerEjercicioPorId } from './exercises-db.js';

// =========================================
// ACTUALIZAR RÉCORDS
// =========================================

/**
 * Actualizar récords después de completar un workout
 * Analiza cada ejercicio y actualiza récords si es necesario
 * 
 * @param {string} userId - ID del usuario
 * @param {string} workoutId - ID del workout completado
 * @param {Object} workout - Datos del workout
 * @returns {Promise<Array>} - Array de récords batidos
 */
export async function actualizarRecords(userId, workoutId, workout) {
    try {
        const recordsBatidos = [];
        
        // Procesar cada ejercicio del workout
        for (const ejercicio of workout.ejercicios) {
            // Solo procesar si hay series completadas
            const seriesCompletadas = ejercicio.series.filter(s => s.completado);
            if (seriesCompletadas.length === 0) continue;
            
            const exerciseId = ejercicio.exerciseId;
            
            // Obtener récord actual
            const recordActual = await obtenerRecords(userId, exerciseId);
            
            // Calcular nuevos valores
            const pesoMaximo = Math.max(...seriesCompletadas.map(s => s.peso));
            const volumenTotal = ejercicio.volumenTotal;
            const repsMaximas = Math.max(...seriesCompletadas.map(s => s.reps));
            
            // Calcular mejor 1RM de este workout
            const mejorOneRM = Math.max(
                ...seriesCompletadas.map(s => calcularOneRepMax(s.peso, s.reps))
            );
            
            // Encontrar la serie con mejor peso
            const mejorSeriedePeso = seriesCompletadas.reduce((best, s) => 
                s.peso > best.peso ? s : best, seriesCompletadas[0]
            );
            
            // Encontrar la serie con más reps
            const mejorSerieReps = seriesCompletadas.reduce((best, s) => 
                s.reps > best.reps ? s : best, seriesCompletadas[0]
            );
            
            // Determinar qué récords se batieron
            const nuevosRecords = [];
            
            // Verificar récord de peso máximo
            if (!recordActual || pesoMaximo > (recordActual.maxPeso?.valor || 0)) {
                nuevosRecords.push('maxPeso');
            }
            
            // Verificar récord de volumen
            if (!recordActual || volumenTotal > (recordActual.maxVolumen?.valor || 0)) {
                nuevosRecords.push('maxVolumen');
            }
            
            // Verificar récord de reps
            if (!recordActual || repsMaximas > (recordActual.maxReps?.valor || 0)) {
                nuevosRecords.push('maxReps');
            }
            
            // Verificar récord de 1RM
            if (!recordActual || mejorOneRM > (recordActual.mejorOneRepMax?.valor || 0)) {
                nuevosRecords.push('mejorOneRepMax');
            }
            
            // Actualizar récord en Firestore
            const exerciseData = await obtenerEjercicioPorId(exerciseId);
            
            const nuevoRecord = {
                exerciseId: exerciseId,
                nombreEjercicio: exerciseData ? exerciseData.nombre : exerciseId,
                
                // Récord de peso máximo
                maxPeso: (nuevosRecords.includes('maxPeso') || !recordActual) ? {
                    valor: pesoMaximo,
                    reps: mejorSeriedePeso.reps,
                    fecha: Timestamp.now(),
                    workoutId: workoutId
                } : recordActual.maxPeso,
                
                // Récord de volumen
                maxVolumen: (nuevosRecords.includes('maxVolumen') || !recordActual) ? {
                    valor: volumenTotal,
                    fecha: Timestamp.now(),
                    workoutId: workoutId
                } : recordActual.maxVolumen,
                
                // Récord de repeticiones
                maxReps: (nuevosRecords.includes('maxReps') || !recordActual) ? {
                    valor: repsMaximas,
                    peso: mejorSerieReps.peso,
                    fecha: Timestamp.now(),
                    workoutId: workoutId
                } : recordActual.maxReps,
                
                // Mejor 1RM
                mejorOneRepMax: (nuevosRecords.includes('mejorOneRepMax') || !recordActual) ? {
                    valor: mejorOneRM,
                    fecha: Timestamp.now(),
                    workoutId: workoutId
                } : recordActual.mejorOneRepMax,
                
                // Estadísticas
                vecesRealizado: (recordActual?.vecesRealizado || 0) + 1,
                ultimaVez: Timestamp.now(),
                primerVez: recordActual?.primerVez || Timestamp.now(),
                
                // Historial reciente (últimos 10)
                historialReciente: actualizarHistorialReciente(
                    recordActual?.historialReciente || [],
                    {
                        fecha: workout.fechaISO,
                        pesoMax: pesoMaximo,
                        volumen: volumenTotal
                    }
                )
            };
            
            // Guardar en Firestore
            const recordRef = doc(db, 'users', userId, 'records', exerciseId);
            await setDoc(recordRef, nuevoRecord);
            
            // Si batió algún récord, agregarlo a la lista
            if (nuevosRecords.length > 0) {
                recordsBatidos.push({
                    exerciseId,
                    nombreEjercicio: nuevoRecord.nombreEjercicio,
                    recordsBatidos: nuevosRecords,
                    valores: {
                        maxPeso: nuevoRecord.maxPeso,
                        maxVolumen: nuevoRecord.maxVolumen,
                        maxReps: nuevoRecord.maxReps,
                        mejorOneRepMax: nuevoRecord.mejorOneRepMax
                    },
                    valoresAnteriores: recordActual ? {
                        maxPeso: recordActual.maxPeso,
                        maxVolumen: recordActual.maxVolumen,
                        maxReps: recordActual.maxReps,
                        mejorOneRepMax: recordActual.mejorOneRepMax
                    } : null
                });
            }
        }
        
        console.log('✅ Récords actualizados:', recordsBatidos.length);
        return recordsBatidos;
    } catch (error) {
        console.error('❌ Error al actualizar récords:', error);
        return [];
    }
}

/**
 * Actualizar historial reciente (mantener últimos 10)
 */
function actualizarHistorialReciente(historialActual, nuevoRegistro) {
    const historial = [...historialActual];
    historial.unshift(nuevoRegistro); // Agregar al inicio
    return historial.slice(0, 10); // Mantener solo últimos 10
}

// =========================================
// OBTENER RÉCORDS
// =========================================

/**
 * Obtener récords de un ejercicio específico
 * 
 * @param {string} userId - ID del usuario
 * @param {string} exerciseId - ID del ejercicio
 * @returns {Promise<Object|null>} - Récords del ejercicio
 */
export async function obtenerRecords(userId, exerciseId) {
    try {
        const recordRef = doc(db, 'users', userId, 'records', exerciseId);
        const recordSnap = await getDoc(recordRef);
        
        if (recordSnap.exists()) {
            return {
                id: recordSnap.id,
                ...recordSnap.data()
            };
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error al obtener récords:', error);
        return null;
    }
}

/**
 * Obtener todos los récords del usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Array de todos los récords
 */
export async function obtenerTodosLosRecords(userId) {
    try {
        const recordsRef = collection(db, 'users', userId, 'records');
        const q = query(recordsRef, orderBy('ultimaVez', 'desc'));
        
        const snapshot = await getDocs(q);
        
        const records = [];
        snapshot.forEach((doc) => {
            records.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return records;
    } catch (error) {
        console.error('❌ Error al obtener todos los récords:', error);
        return [];
    }
}

// =========================================
// DETECCIÓN DE RÉCORDS
// =========================================

/**
 * Detectar si hay nuevos récords comparando workout actual con récords existentes
 * (Usado para mostrar notificación en tiempo real durante el workout)
 * 
 * @param {Object} serieActual - Serie actual {exerciseId, peso, reps}
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Array de récords batidos en esta serie
 */
export async function detectarRecordEnSerie(serieActual, userId) {
    try {
        const { exerciseId, peso, reps } = serieActual;
        
        const recordActual = await obtenerRecords(userId, exerciseId);
        
        const recordsBatidos = [];
        
        // Verificar récord de peso
        if (!recordActual || peso > (recordActual.maxPeso?.valor || 0)) {
            recordsBatidos.push({
                tipo: 'maxPeso',
                valor: peso,
                anterior: recordActual?.maxPeso?.valor || 0
            });
        }
        
        // Verificar récord de 1RM
        const oneRM = calcularOneRepMax(peso, reps);
        if (!recordActual || oneRM > (recordActual.mejorOneRepMax?.valor || 0)) {
            recordsBatidos.push({
                tipo: 'mejorOneRepMax',
                valor: oneRM,
                anterior: recordActual?.mejorOneRepMax?.valor || 0
            });
        }
        
        return recordsBatidos;
    } catch (error) {
        console.error('❌ Error al detectar récord:', error);
        return [];
    }
}

// =========================================
// ESTADÍSTICAS DE RÉCORDS
// =========================================

/**
 * Obtener estadísticas generales de récords
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Estadísticas
 */
export async function obtenerEstadisticasRecords(userId) {
    try {
        const records = await obtenerTodosLosRecords(userId);
        
        const totalEjerciciosRealizados = records.length;
        
        // Total de veces que ha entrenado
        const totalSesiones = records.reduce((sum, r) => 
            sum + (r.vecesRealizado || 0), 0
        );
        
        // Ejercicio más frecuente
        const ejercicioMasFrecuente = records.reduce((max, r) => 
            (r.vecesRealizado || 0) > (max.vecesRealizado || 0) ? r : max
        , records[0] || null);
        
        // Récord de peso más alto
        const mejorPeso = records.reduce((max, r) => {
            const peso = r.maxPeso?.valor || 0;
            return peso > max.peso ? { ejercicio: r, peso } : max;
        }, { ejercicio: null, peso: 0 });
        
        // Récord de 1RM más alto
        const mejor1RM = records.reduce((max, r) => {
            const rm = r.mejorOneRepMax?.valor || 0;
            return rm > max.rm ? { ejercicio: r, rm } : max;
        }, { ejercicio: null, rm: 0 });
        
        return {
            totalEjerciciosRealizados,
            totalSesiones,
            ejercicioMasFrecuente,
            mejorPeso,
            mejor1RM
        };
    } catch (error) {
        console.error('❌ Error al obtener estadísticas de récords:', error);
        return {
            totalEjerciciosRealizados: 0,
            totalSesiones: 0,
            ejercicioMasFrecuente: null,
            mejorPeso: { ejercicio: null, peso: 0 },
            mejor1RM: { ejercicio: null, rm: 0 }
        };
    }
}

/**
 * Obtener récords recientes (últimos 30 días)
 * 
 * @param {string} userId - ID del usuario
 * @param {number} dias - Días hacia atrás a considerar
 * @returns {Promise<Array>} - Récords recientes
 */
export async function obtenerRecordsRecientes(userId, dias = 30) {
    try {
        const records = await obtenerTodosLosRecords(userId);
        
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        const timestampLimite = Timestamp.fromDate(fechaLimite);
        
        const recordsRecientes = [];
        
        for (const record of records) {
            const recordsNuevos = [];
            
            // Verificar cada tipo de récord
            if (record.maxPeso?.fecha && record.maxPeso.fecha.seconds > timestampLimite.seconds) {
                recordsNuevos.push({
                    tipo: 'maxPeso',
                    ...record.maxPeso,
                    exerciseId: record.exerciseId,
                    nombreEjercicio: record.nombreEjercicio
                });
            }
            
            if (record.maxVolumen?.fecha && record.maxVolumen.fecha.seconds > timestampLimite.seconds) {
                recordsNuevos.push({
                    tipo: 'maxVolumen',
                    ...record.maxVolumen,
                    exerciseId: record.exerciseId,
                    nombreEjercicio: record.nombreEjercicio
                });
            }
            
            if (record.maxReps?.fecha && record.maxReps.fecha.seconds > timestampLimite.seconds) {
                recordsNuevos.push({
                    tipo: 'maxReps',
                    ...record.maxReps,
                    exerciseId: record.exerciseId,
                    nombreEjercicio: record.nombreEjercicio
                });
            }
            
            if (record.mejorOneRepMax?.fecha && record.mejorOneRepMax.fecha.seconds > timestampLimite.seconds) {
                recordsNuevos.push({
                    tipo: 'mejorOneRepMax',
                    ...record.mejorOneRepMax,
                    exerciseId: record.exerciseId,
                    nombreEjercicio: record.nombreEjercicio
                });
            }
            
            recordsRecientes.push(...recordsNuevos);
        }
        
        // Ordenar por fecha descendente
        recordsRecientes.sort((a, b) => b.fecha.seconds - a.fecha.seconds);
        
        return recordsRecientes;
    } catch (error) {
        console.error('❌ Error al obtener récords recientes:', error);
        return [];
    }
}

// =========================================
// COMPARACIÓN Y ANÁLISIS
// =========================================

/**
 * Comparar desempeño actual vs récord personal
 * 
 * @param {Object} serieActual - Serie actual
 * @param {Object} record - Récord del ejercicio
 * @returns {Object} - Análisis de comparación
 */
export function compararConRecord(serieActual, record) {
    if (!record) {
        return {
            esNuevo: true,
            mensaje: '🆕 ¡Primera vez con este ejercicio!',
            porcentajePeso: 0,
            porcentaje1RM: 0
        };
    }
    
    const { peso, reps } = serieActual;
    const oneRM = calcularOneRepMax(peso, reps);
    
    const pesoRecord = record.maxPeso?.valor || 0;
    const rmRecord = record.mejorOneRepMax?.valor || 0;
    
    const porcentajePeso = pesoRecord > 0 ? ((peso / pesoRecord) * 100) : 0;
    const porcentaje1RM = rmRecord > 0 ? ((oneRM / rmRecord) * 100) : 0;
    
    let mensaje = '';
    let nivel = 'normal';
    
    if (peso >= pesoRecord) {
        mensaje = '🔥 ¡NUEVO RÉCORD DE PESO!';
        nivel = 'record';
    } else if (porcentajePeso >= 95) {
        mensaje = '💪 ¡Muy cerca de tu récord!';
        nivel = 'cerca';
    } else if (porcentajePeso >= 85) {
        mensaje = '✅ Buen peso, sigue así';
        nivel = 'bueno';
    } else if (porcentajePeso >= 70) {
        mensaje = '📊 Peso moderado';
        nivel = 'moderado';
    } else {
        mensaje = '⚠️ Peso por debajo de tu capacidad';
        nivel = 'bajo';
    }
    
    return {
        esNuevo: false,
        mensaje,
        nivel,
        porcentajePeso: Math.round(porcentajePeso),
        porcentaje1RM: Math.round(porcentaje1RM),
        pesoRecord,
        rmRecord
    };
}

/**
 * Generar mensaje motivacional basado en progreso
 * 
 * @param {Array} recordsBatidos - Récords batidos en el workout
 * @returns {string} - Mensaje motivacional
 */
export function generarMensajeRecords(recordsBatidos) {
    if (!recordsBatidos || recordsBatidos.length === 0) {
        return '✅ Buen trabajo, sigue entrenando!';
    }
    
    const totalRecords = recordsBatidos.reduce((sum, r) => 
        sum + r.recordsBatidos.length, 0
    );
    
    if (totalRecords === 1) {
        return '🏆 ¡Nuevo récord personal!';
    } else if (totalRecords <= 3) {
        return `🏆 ¡${totalRecords} nuevos récords!`;
    } else if (totalRecords <= 5) {
        return `🔥 ¡${totalRecords} récords batidos! ¡Excelente!`;
    } else {
        return `🎉 ¡INCREÍBLE! ${totalRecords} récords nuevos!`;
    }
}
