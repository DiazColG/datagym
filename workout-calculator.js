// =========================================
// CALCULADORAS DE WORKOUT
// Cálculos de 1RM, volumen, calorías y sugerencias
// =========================================

// =========================================
// CÁLCULO DE 1RM (ONE REP MAX)
// =========================================

/**
 * Calcular 1RM usando la fórmula de Epley
 * OneRepMax = peso × (1 + reps / 30)
 * 
 * @param {number} peso - Peso levantado en kg
 * @param {number} reps - Número de repeticiones
 * @returns {number} - 1RM estimado redondeado a 1 decimal
 */
export function calcularOneRepMax(peso, reps) {
    if (!peso || peso <= 0) return 0;
    if (!reps || reps <= 0) return peso;
    
    // Para 1 rep, el 1RM es el peso mismo
    if (reps === 1) return peso;
    
    // Fórmula de Epley: más precisa para 1-10 reps
    const oneRM = peso * (1 + reps / 30);
    
    return Math.round(oneRM * 10) / 10;
}

// =========================================
// CÁLCULO DE VOLUMEN
// =========================================

/**
 * Calcular volumen de una serie (peso × reps)
 * 
 * @param {number} peso - Peso en kg
 * @param {number} reps - Número de repeticiones
 * @returns {number} - Volumen en kg
 */
export function calcularVolumenSerie(peso, reps) {
    if (!peso || !reps) return 0;
    return peso * reps;
}

/**
 * Calcular volumen total de un ejercicio (suma de todas las series)
 * 
 * @param {Array} series - Array de series con {peso, reps, completado}
 * @returns {number} - Volumen total en kg
 */
export function calcularVolumenEjercicio(series) {
    if (!series || !Array.isArray(series)) return 0;
    
    return series.reduce((total, serie) => {
        if (serie.completado) {
            return total + calcularVolumenSerie(serie.peso, serie.reps);
        }
        return total;
    }, 0);
}

/**
 * Calcular volumen total de un workout (suma de todos los ejercicios)
 * 
 * @param {Array} ejercicios - Array de ejercicios con series
 * @returns {number} - Volumen total del workout en kg
 */
export function calcularVolumenWorkout(ejercicios) {
    if (!ejercicios || !Array.isArray(ejercicios)) return 0;
    
    return ejercicios.reduce((total, ejercicio) => {
        return total + (ejercicio.volumenTotal || calcularVolumenEjercicio(ejercicio.series));
    }, 0);
}

// =========================================
// ESTADÍSTICAS DE SERIES
// =========================================

/**
 * Calcular estadísticas de un ejercicio
 * 
 * @param {Array} series - Array de series completadas
 * @returns {Object} - Estadísticas del ejercicio
 */
export function calcularEstadisticasEjercicio(series) {
    if (!series || !Array.isArray(series) || series.length === 0) {
        return {
            pesoMaximo: 0,
            volumenTotal: 0,
            oneRepMax: 0,
            repsTotal: 0,
            seriesCompletadas: 0
        };
    }
    
    const seriesCompletadas = series.filter(s => s.completado);
    
    // Peso máximo usado
    const pesoMaximo = Math.max(...seriesCompletadas.map(s => s.peso || 0));
    
    // Reps totales
    const repsTotal = seriesCompletadas.reduce((sum, s) => sum + (s.reps || 0), 0);
    
    // Volumen total
    const volumenTotal = calcularVolumenEjercicio(seriesCompletadas);
    
    // Encontrar el mejor 1RM de todas las series
    const mejoresRM = seriesCompletadas.map(s => 
        calcularOneRepMax(s.peso, s.reps)
    );
    const oneRepMax = Math.max(...mejoresRM, 0);
    
    return {
        pesoMaximo,
        volumenTotal,
        oneRepMax,
        repsTotal,
        seriesCompletadas: seriesCompletadas.length
    };
}

// =========================================
// ESTIMACIÓN DE CALORÍAS
// =========================================

/**
 * Estimar calorías quemadas en un workout
 * Basado en duración y volumen total
 * 
 * @param {number} duracionMinutos - Duración del workout en minutos
 * @param {number} volumenTotal - Volumen total movido en kg
 * @returns {number} - Calorías estimadas
 */
export function estimarCalorias(duracionMinutos, volumenTotal = 0) {
    if (!duracionMinutos || duracionMinutos <= 0) return 0;
    
    // Base: ~7 kcal/min para entrenamiento de fuerza
    const caloriasBase = duracionMinutos * 7;
    
    // Ajuste por intensidad (volumen / tiempo)
    // Si mueve mucho peso en poco tiempo = mayor intensidad
    const intensidad = volumenTotal / duracionMinutos;
    
    // Factor de ajuste: 1.0 a 1.3
    let factor = 1.0;
    if (intensidad > 300) {
        factor = 1.3; // Muy intenso
    } else if (intensidad > 200) {
        factor = 1.2; // Intenso
    } else if (intensidad > 100) {
        factor = 1.1; // Moderado-alto
    }
    
    const caloriasEstimadas = Math.round(caloriasBase * factor);
    
    return caloriasEstimadas;
}

// =========================================
// SUGERENCIAS INTELIGENTES
// =========================================

/**
 * Sugerir peso para próxima serie basado en último registro
 * 
 * @param {Object} ultimoRegistro - Último registro del ejercicio {peso, reps, fecha}
 * @param {Object} objetivo - Objetivo de reps {min, max} ej: {min: 8, max: 12}
 * @returns {number} - Peso sugerido en kg
 */
export function sugerirPeso(ultimoRegistro, objetivo = { min: 8, max: 12 }) {
    if (!ultimoRegistro || !ultimoRegistro.peso) {
        return 20; // Default inicial
    }
    
    const { peso, reps } = ultimoRegistro;
    
    // Si hizo más reps que el máximo objetivo, subir peso
    if (reps >= objetivo.max + 3) {
        // Mucho más del objetivo: subir 5kg o 10%
        return Math.round(peso * 1.1 * 2) / 2; // Redondear a 2.5kg
    } else if (reps > objetivo.max) {
        // Apenas sobre objetivo: subir 2.5kg
        return peso + 2.5;
    }
    
    // Si hizo menos reps que el mínimo objetivo, bajar peso
    if (reps < objetivo.min - 2) {
        // Muy por debajo: bajar 5kg o 10%
        return Math.round(peso * 0.9 * 2) / 2;
    } else if (reps < objetivo.min) {
        // Apenas debajo: bajar 2.5kg
        return Math.max(peso - 2.5, 2.5);
    }
    
    // En rango óptimo: mantener peso
    return peso;
}

/**
 * Sugerir peso basado en todas las series del último workout
 * 
 * @param {Array} ultimasSeries - Array de series del último workout
 * @param {Object} objetivo - Objetivo de reps
 * @returns {number} - Peso sugerido
 */
export function sugerirPesoDeUltimasSeries(ultimasSeries, objetivo = { min: 8, max: 12 }) {
    if (!ultimasSeries || ultimasSeries.length === 0) {
        return 20;
    }
    
    // Usar la serie con mejor desempeño (más peso en rango objetivo)
    const seriesEnRango = ultimasSeries.filter(s => 
        s.reps >= objetivo.min && s.reps <= objetivo.max
    );
    
    if (seriesEnRango.length > 0) {
        // Tomar el peso máximo de las series en rango
        const pesoMax = Math.max(...seriesEnRango.map(s => s.peso));
        return pesoMax;
    }
    
    // Si ninguna en rango, usar la última serie
    const ultimaSerie = ultimasSeries[ultimasSeries.length - 1];
    return sugerirPeso(ultimaSerie, objetivo);
}

/**
 * Generar mensaje motivacional basado en comparación
 * 
 * @param {number} pesoActual - Peso usado hoy
 * @param {number} pesoAnterior - Peso usado la última vez
 * @param {number} repsActual - Reps hechas hoy
 * @param {number} repsAnterior - Reps de la última vez
 * @returns {string} - Mensaje motivacional
 */
export function generarMensajeComparacion(pesoActual, pesoAnterior, repsActual, repsAnterior) {
    if (!pesoAnterior) {
        return '🆕 ¡Primera vez con este ejercicio!';
    }
    
    const difPeso = pesoActual - pesoAnterior;
    const difReps = repsActual - repsAnterior;
    
    // Subió peso
    if (difPeso > 0) {
        if (difReps >= 0) {
            return `🔥 ¡Subiste ${difPeso}kg y mantuviste/mejoraste reps!`;
        } else {
            return `💪 Subiste ${difPeso}kg (menos reps es normal)`;
        }
    }
    
    // Mantuvo peso
    if (difPeso === 0) {
        if (difReps > 0) {
            return `📈 ¡${difReps} reps más con el mismo peso!`;
        } else if (difReps === 0) {
            return `✅ Mantuviste el desempeño anterior`;
        } else {
            return `⚠️ Menos reps que la vez anterior`;
        }
    }
    
    // Bajó peso
    if (difPeso < 0) {
        if (difReps > 0) {
            return `📊 Menos peso pero más reps (buen volumen)`;
        } else {
            return `⚠️ Bajaste peso y reps - descansa más`;
        }
    }
}

// =========================================
// ANÁLISIS DE PROGRESO
// =========================================

/**
 * Detectar si hubo progreso comparando dos workouts
 * 
 * @param {Object} workoutActual - Workout de hoy
 * @param {Object} workoutAnterior - Último workout
 * @returns {Object} - Análisis de progreso
 */
export function analizarProgreso(workoutActual, workoutAnterior) {
    if (!workoutAnterior) {
        return {
            esProgreso: true,
            tipo: 'primer_workout',
            mensaje: '🎉 ¡Primer workout registrado!'
        };
    }
    
    const volumenActual = workoutActual.estadisticas?.volumenTotal || 0;
    const volumenAnterior = workoutAnterior.estadisticas?.volumenTotal || 0;
    
    const difVolumen = volumenActual - volumenAnterior;
    const pctVolumen = volumenAnterior > 0 ? (difVolumen / volumenAnterior) * 100 : 0;
    
    // Progreso significativo (>5% más volumen)
    if (pctVolumen > 5) {
        return {
            esProgreso: true,
            tipo: 'volumen_mayor',
            diferencia: difVolumen,
            porcentaje: pctVolumen,
            mensaje: `📈 ¡${Math.round(pctVolumen)}% más volumen que la última vez!`
        };
    }
    
    // Progreso moderado (0-5% más volumen)
    if (pctVolumen > 0) {
        return {
            esProgreso: true,
            tipo: 'mantenimiento',
            diferencia: difVolumen,
            porcentaje: pctVolumen,
            mensaje: '✅ Mantuviste el nivel del último workout'
        };
    }
    
    // Retroceso leve (-5% a 0%)
    if (pctVolumen > -5) {
        return {
            esProgreso: false,
            tipo: 'retroceso_leve',
            diferencia: difVolumen,
            porcentaje: pctVolumen,
            mensaje: '⚠️ Ligeramente por debajo del último workout'
        };
    }
    
    // Retroceso significativo (<-5%)
    return {
        esProgreso: false,
        tipo: 'retroceso',
        diferencia: difVolumen,
        porcentaje: pctVolumen,
        mensaje: '⚠️ Considera más descanso o reducir intensidad'
    };
}

/**
 * Calcular tendencia de progreso (últimos N workouts)
 * 
 * @param {Array} historial - Historial de workouts ordenados por fecha
 * @param {number} limite - Número de workouts a analizar
 * @returns {Object} - Tendencia general
 */
export function calcularTendencia(historial, limite = 5) {
    if (!historial || historial.length < 2) {
        return {
            tendencia: 'insuficiente',
            mensaje: 'Necesitas más datos para ver tendencia'
        };
    }
    
    const ultimos = historial.slice(0, Math.min(limite, historial.length));
    const volumenes = ultimos.map(w => w.estadisticas?.volumenTotal || 0);
    
    // Calcular pendiente (regresión lineal simple)
    let sumaX = 0, sumaY = 0, sumaXY = 0, sumaX2 = 0;
    const n = volumenes.length;
    
    for (let i = 0; i < n; i++) {
        sumaX += i;
        sumaY += volumenes[i];
        sumaXY += i * volumenes[i];
        sumaX2 += i * i;
    }
    
    const pendiente = (n * sumaXY - sumaX * sumaY) / (n * sumaX2 - sumaX * sumaX);
    const promedio = sumaY / n;
    const cambioRelativo = (pendiente / promedio) * 100;
    
    // Interpretar tendencia
    if (cambioRelativo > 2) {
        return {
            tendencia: 'subiendo',
            pendiente,
            cambioRelativo,
            icono: '📈',
            mensaje: '¡Vas en progreso constante!'
        };
    } else if (cambioRelativo < -2) {
        return {
            tendencia: 'bajando',
            pendiente,
            cambioRelativo,
            icono: '📉',
            mensaje: 'Volumen disminuyendo - revisa descanso'
        };
    } else {
        return {
            tendencia: 'estable',
            pendiente,
            cambioRelativo,
            icono: '➡️',
            mensaje: 'Manteniéndote estable'
        };
    }
}

// =========================================
// HELPERS DE FORMATO
// =========================================

/**
 * Formatear peso con unidad
 */
export function formatearPeso(peso, unidad = 'kg') {
    if (!peso) return '0 kg';
    return `${peso} ${unidad}`;
}

/**
 * Formatear volumen (en miles)
 */
export function formatearVolumen(volumen) {
    if (!volumen) return '0 kg';
    if (volumen >= 1000) {
        return `${(volumen / 1000).toFixed(1)}k kg`;
    }
    return `${volumen} kg`;
}

/**
 * Formatear duración en minutos a formato legible
 */
export function formatearDuracion(minutos) {
    if (!minutos) return '0 min';
    if (minutos < 60) {
        return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
}

/**
 * Formatear calorías
 */
export function formatearCalorias(calorias) {
    if (!calorias) return '0 kcal';
    return `${calorias} kcal`;
}
