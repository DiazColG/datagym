// ================================================
// BASE DE DATOS COMPLETA: 247 EJERCICIOS
// Estructura optimizada para analytics y tracking
// ================================================

// Importar todos los grupos desde los archivos de partes
import { EXERCISES_DB_EXTENDED as EXERCISES_PECHO_ESPALDA } from './exercises-complete-part1.js';
import { EXERCISES_PIERNAS } from './exercises-complete-part2.js';
import { EXERCISES_HOMBROS, EXERCISES_BICEPS, EXERCISES_TRICEPS } from './exercises-complete-part3.js';
import { EXERCISES_CORE, EXERCISES_GLUTEOS, EXERCISES_CARDIO, EXERCISES_ACCESORIOS } from './exercises-complete-part4.js';

// Importar ejercicios faltantes (reparación integridad rutinas)
import { EXERCISES_MISSING_48 } from './exercises-missing-48.js';

// Combinar todos los ejercicios
export const EXERCISES_DB_COMPLETE = [
    ...EXERCISES_PECHO_ESPALDA,
    ...EXERCISES_PIERNAS,
    ...EXERCISES_HOMBROS,
    ...EXERCISES_BICEPS,
    ...EXERCISES_TRICEPS,
    ...EXERCISES_CORE,
    ...EXERCISES_GLUTEOS,
    ...EXERCISES_CARDIO,
    ...EXERCISES_ACCESORIOS,
    ...EXERCISES_MISSING_48
];

// Estadísticas de la base de datos
export const DB_STATS = {
    total: 247,
    por_grupo: {
        pecho: 24,
        espalda: 39,
        piernas: 44,
        hombros: 23,
        biceps: 17,
        triceps: 17,
        core: 25,
        gluteos: 19,
        cardio: 17,
        antebrazos: 9,
        fullbody: 7,
        accesorios: 6
    },
    equipamiento: {
        'peso_corporal': 55,
        'barra': 50,
        'mancuerna': 42,
        'maquina': 35,
        'cable': 28,
        'accesorios': 22,
        'banda': 10,
        'kettlebell': 5
    },
    nivel_tecnica: {
        principiante: 95,
        intermedio: 95,
        avanzado: 57
    }
};

export default EXERCISES_DB_COMPLETE;
