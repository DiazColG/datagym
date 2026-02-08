// =========================================
// BASE DE DATOS DE EJERCICIOS - HÍBRIDO PRO
// Sistema inteligente con caché + Firestore + Bundle estático
// =========================================

// =========================================
// 🚀 NUEVO SISTEMA (RECOMENDADO)
// =========================================
// Usa el servicio para obtener ejercicios con caché inteligente
// Este es el método profesional que deberías usar en código nuevo
export { 
    exercisesService,           // Servicio completo
    obtenerEjercicioPorId,      // Función helper
    buscarEjercicios            // Función helper
} from './exercises-service.js';

// =========================================
// 📦 BUNDLE ESTÁTICO (FALLBACK)
// =========================================
// Se mantiene para:
// 1. Compatibilidad con código legacy que usa EXERCISES_DB directamente
// 2. Fallback si Firestore falla
// 3. Funciona 100% offline
import { EXERCISES_DB_COMPLETE } from './exercises-db-complete-200.js';

export const EXERCISES_DB = EXERCISES_DB_COMPLETE;

// =========================================
// 📊 CONSTANTES Y UTILIDADES
// =========================================

export const GRUPOS_MUSCULARES = [
    'pecho', 'espalda', 'piernas', 'hombros', 
    'biceps', 'triceps', 'core', 'gluteos', 'cardio', 
    'accesorios', 'fullbody'
];

export const EQUIPAMIENTOS = [
    'barra', 'mancuerna', 'maquina', 'cable', 'peso_corporal'
];

export const TIPOS = ['compuesto', 'aislamiento', 'estatico'];

export const DIFICULTADES = ['principiante', 'intermedio', 'avanzado'];

// =========================================
// 🔧 FUNCIONES UTILITARIAS
// =========================================

/**
 * Agrupar ejercicios por grupo muscular
 * @param {Array} ejercicios - Lista de ejercicios (opcional, usa EXERCISES_DB por defecto)
 * @returns {Object} Objeto con ejercicios agrupados por grupo muscular
 */
export function agruparEjerciciosPorGrupo(ejercicios = EXERCISES_DB) {
    const grupos = {};
    
    ejercicios.forEach(ej => {
        if (!grupos[ej.grupoMuscular]) {
            grupos[ej.grupoMuscular] = [];
        }
        grupos[ej.grupoMuscular].push(ej);
    });
    
    return grupos;
}

/**
 * Obtener ejercicios por popularidad
 * @param {number} limit - Número de ejercicios a retornar
 * @returns {Array} Ejercicios ordenados por popularidad
 */
export function obtenerEjerciciosMasPopulares(limit = 10) {
    return [...EXERCISES_DB]
        .sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0))
        .slice(0, limit);
}

/**
 * Obtener ejercicios recomendados para un nivel
 * @param {string} nivel - 'principiante', 'intermedio', 'avanzado'
 * @returns {Array} Ejercicios filtrados por nivel
 */
export function obtenerEjerciciosPorNivel(nivel) {
    const nivelMap = {
        'principiante': ex => (ex.nivel_tecnica || ex.dificultad) <= 2,
        'intermedio': ex => (ex.nivel_tecnica || 3) >= 2 && (ex.nivel_tecnica || 3) <= 4,
        'avanzado': ex => (ex.nivel_tecnica || 5) >= 4
    };

    const filterFn = nivelMap[nivel];
    if (!filterFn) return [];

    return EXERCISES_DB.filter(filterFn);
}

// =========================================
// 💡 GUÍA DE USO
// =========================================

/**
 * EJEMPLO DE USO NUEVO (RECOMENDADO):
 * 
 * import { exercisesService } from './exercises-db.js';
 * 
 * // Obtener todos (con caché inteligente)
 * const exercises = await exercisesService.getExercises();
 * 
 * // Buscar por ID
 * const exercise = await exercisesService.getExerciseById('press_banca');
 * 
 * // Buscar con filtros
 * const results = await exercisesService.searchExercises('press', {
 *     grupoMuscular: 'pecho',
 *     equipamiento: 'barra'
 * });
 * 
 * // Forzar refresh desde Firestore
 * const fresh = await exercisesService.forceRefresh();
 * 
 * // Ver info del caché
 * exercisesService.debugCacheInfo();
 */

/**
 * EJEMPLO DE USO LEGACY (SIGUE FUNCIONANDO):
 * 
 * import { EXERCISES_DB, obtenerEjercicioPorId, buscarEjercicios } from './exercises-db.js';
 * 
 * // Acceso directo al array (estático)
 * const ejercicios = EXERCISES_DB;
 * 
 * // Buscar por ID (ahora usa el servicio internamente)
 * const ejercicio = await obtenerEjercicioPorId('press_banca');
 * 
 * // Buscar (ahora usa el servicio internamente)
 * const resultados = await buscarEjercicios('press', { grupoMuscular: 'pecho' });
 */

// =========================================
// 🎯 MIGRACIÓN GRADUAL
// =========================================
console.log('✅ exercises-db.js cargado (Híbrido PRO)');
console.log('💡 Usa exercisesService para caché inteligente');
console.log('📦 EXERCISES_DB disponible para compatibilidad');
