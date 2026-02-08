// ================================================
// BASE DE DATOS COMPLETA: 200 EJERCICIOS
// Estructura optimizada para analytics y tracking
// ================================================

// Importar todos los grupos desde los archivos de partes
import { EXERCISES_DB_EXTENDED as EXERCISES_PECHO_ESPALDA } from './exercises-complete-part1.js';
import { EXERCISES_PIERNAS } from './exercises-complete-part2.js';
import { EXERCISES_HOMBROS, EXERCISES_BICEPS, EXERCISES_TRICEPS } from './exercises-complete-part3.js';
import { EXERCISES_CORE, EXERCISES_GLUTEOS, EXERCISES_CARDIO, EXERCISES_ACCESORIOS } from './exercises-complete-part4.js';

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
    ...EXERCISES_ACCESORIOS
];

// Estadísticas de la base de datos
export const DB_STATS = {
    total: 200,
    por_grupo: {
        pecho: 20,
        espalda: 30,
        piernas: 35,
        hombros: 20,
        biceps: 15,
        triceps: 15,
        core: 20,
        gluteos: 15,
        cardio: 15,
        antebrazos: 15
    },
    equipamiento: {
        'peso corporal': 45,
        'barra': 40,
        'mancuerna': 35,
        'maquina': 30,
        'polea': 25,
        'banda': 10,
        'kettlebell': 5,
        'otros': 10
    },
    nivel_tecnica: {
        principiante: 80,
        intermedio: 75,
        avanzado: 45
    }
};

export default EXERCISES_DB_COMPLETE;
