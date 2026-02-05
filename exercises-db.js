// =========================================
// BASE DE DATOS DE EJERCICIOS
// 50 ejercicios esenciales para el sistema de rutinas
// =========================================

import { db } from './firebase-config.js';
import { collection, doc, setDoc, getDocs, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// =========================================
// BASE DE DATOS DE 50 EJERCICIOS
// =========================================

export const EXERCISES_DB = [
    // ========== PECHO (6) ==========
    {
        id: 'press_banca',
        nombre: 'Press de banca',
        nombreEN: 'Bench Press',
        alias: ['press banca', 'bench press', 'press plano'],
        grupoMuscular: 'pecho',
        musculosSecundarios: ['triceps', 'hombros'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Ejercicio fundamental para desarrollo de pecho, fuerza general y masa muscular.',
        popularidad: 95,
        orden: 1,
        activo: true
    },
    {
        id: 'press_inclinado',
        nombre: 'Press inclinado',
        nombreEN: 'Incline Bench Press',
        alias: ['press inclinado', 'incline press', 'press inclinado barra'],
        grupoMuscular: 'pecho',
        musculosSecundarios: ['hombros', 'triceps'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Enfatiza la parte superior del pecho y hombros frontales.',
        popularidad: 90,
        orden: 2,
        activo: true
    },
    {
        id: 'press_declinado',
        nombre: 'Press declinado',
        nombreEN: 'Decline Bench Press',
        alias: ['press declinado', 'decline press'],
        grupoMuscular: 'pecho',
        musculosSecundarios: ['triceps'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Trabaja la parte inferior del pecho.',
        popularidad: 75,
        orden: 3,
        activo: true
    },
    {
        id: 'press_mancuernas',
        nombre: 'Press con mancuernas',
        nombreEN: 'Dumbbell Press',
        alias: ['press mancuernas', 'dumbbell press', 'press plano mancuernas'],
        grupoMuscular: 'pecho',
        musculosSecundarios: ['triceps', 'hombros'],
        tipo: 'compuesto',
        equipamiento: 'mancuerna',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Mayor rango de movimiento y trabajo de estabilización.',
        popularidad: 88,
        orden: 4,
        activo: true
    },
    {
        id: 'aperturas_mancuernas',
        nombre: 'Aperturas con mancuernas',
        nombreEN: 'Dumbbell Flyes',
        alias: ['aperturas', 'flyes', 'aperturas pecho'],
        grupoMuscular: 'pecho',
        musculosSecundarios: ['hombros'],
        tipo: 'aislamiento',
        equipamiento: 'mancuerna',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Estiramiento y contracción máxima del pecho.',
        popularidad: 85,
        orden: 5,
        activo: true
    },
    {
        id: 'fondos_paralelas',
        nombre: 'Fondos en paralelas',
        nombreEN: 'Dips',
        alias: ['fondos', 'dips', 'fondos pecho'],
        grupoMuscular: 'pecho',
        musculosSecundarios: ['triceps', 'hombros'],
        tipo: 'compuesto',
        equipamiento: 'peso_corporal',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🤸',
        descripcion: 'Excelente para pecho inferior y tríceps.',
        popularidad: 82,
        orden: 6,
        activo: true
    },

    // ========== ESPALDA (8) ==========
    {
        id: 'dominadas',
        nombre: 'Dominadas',
        nombreEN: 'Pull-ups',
        alias: ['dominadas', 'pull ups', 'pullups'],
        grupoMuscular: 'espalda',
        musculosSecundarios: ['biceps', 'hombros'],
        tipo: 'compuesto',
        equipamiento: 'peso_corporal',
        mecanica: 'traccion',
        dificultad: 'avanzado',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏋️',
        descripcion: 'Rey de los ejercicios de espalda y fuerza relativa.',
        popularidad: 92,
        orden: 7,
        activo: true
    },
    {
        id: 'remo_barra',
        nombre: 'Remo con barra',
        nombreEN: 'Barbell Row',
        alias: ['remo barra', 'barbell row', 'remo'],
        grupoMuscular: 'espalda',
        musculosSecundarios: ['biceps', 'hombros'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'traccion',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏋️',
        descripcion: 'Desarrollo completo del grosor de la espalda.',
        popularidad: 89,
        orden: 8,
        activo: true
    },
    {
        id: 'peso_muerto',
        nombre: 'Peso muerto',
        nombreEN: 'Deadlift',
        alias: ['peso muerto', 'deadlift', 'peso muerto convencional'],
        grupoMuscular: 'espalda',
        musculosSecundarios: ['piernas', 'core', 'trapecio'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'traccion',
        dificultad: 'avanzado',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏋️',
        descripcion: 'El ejercicio más completo, trabaja todo el cuerpo.',
        popularidad: 98,
        orden: 9,
        activo: true
    },
    {
        id: 'remo_mancuerna',
        nombre: 'Remo con mancuerna',
        nombreEN: 'Dumbbell Row',
        alias: ['remo mancuerna', 'remo unilateral'],
        grupoMuscular: 'espalda',
        musculosSecundarios: ['biceps', 'core'],
        tipo: 'compuesto',
        equipamiento: 'mancuerna',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏋️',
        descripcion: 'Permite aislar cada lado de la espalda.',
        popularidad: 86,
        orden: 10,
        activo: true
    },
    {
        id: 'jalon_pecho',
        nombre: 'Jalón al pecho',
        nombreEN: 'Lat Pulldown',
        alias: ['jalon', 'lat pulldown', 'jalon pecho'],
        grupoMuscular: 'espalda',
        musculosSecundarios: ['biceps'],
        tipo: 'compuesto',
        equipamiento: 'maquina',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏋️',
        descripcion: 'Excelente para desarrollar amplitud de espalda.',
        popularidad: 84,
        orden: 11,
        activo: true
    },
    {
        id: 'remo_cable',
        nombre: 'Remo en polea',
        nombreEN: 'Cable Row',
        alias: ['remo cable', 'cable row', 'remo sentado'],
        grupoMuscular: 'espalda',
        musculosSecundarios: ['biceps'],
        tipo: 'compuesto',
        equipamiento: 'cable',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏋️',
        descripcion: 'Tensión constante en toda la espalda.',
        popularidad: 80,
        orden: 12,
        activo: true
    },
    {
        id: 'pullover',
        nombre: 'Pullover',
        nombreEN: 'Dumbbell Pullover',
        alias: ['pullover', 'pullover mancuerna'],
        grupoMuscular: 'espalda',
        musculosSecundarios: ['pecho'],
        tipo: 'aislamiento',
        equipamiento: 'mancuerna',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏋️',
        descripcion: 'Expande la caja torácica y trabaja dorsales.',
        popularidad: 70,
        orden: 13,
        activo: true
    },
    {
        id: 'face_pulls',
        nombre: 'Face pulls',
        nombreEN: 'Face Pulls',
        alias: ['face pulls', 'facepulls', 'tirones cara'],
        grupoMuscular: 'espalda',
        musculosSecundarios: ['hombros'],
        tipo: 'aislamiento',
        equipamiento: 'cable',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏋️',
        descripcion: 'Crucial para salud de hombros y postura.',
        popularidad: 78,
        orden: 14,
        activo: true
    },

    // ========== PIERNAS (10) ==========
    {
        id: 'sentadilla',
        nombre: 'Sentadilla',
        nombreEN: 'Squat',
        alias: ['sentadilla', 'squat', 'sentadilla trasera'],
        grupoMuscular: 'piernas',
        musculosSecundarios: ['core', 'espalda'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'El rey de los ejercicios de pierna.',
        popularidad: 96,
        orden: 15,
        activo: true
    },
    {
        id: 'sentadilla_frontal',
        nombre: 'Sentadilla frontal',
        nombreEN: 'Front Squat',
        alias: ['sentadilla frontal', 'front squat'],
        grupoMuscular: 'piernas',
        musculosSecundarios: ['core'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'avanzado',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'Mayor énfasis en cuádriceps y core.',
        popularidad: 78,
        orden: 16,
        activo: true
    },
    {
        id: 'peso_muerto_rumano',
        nombre: 'Peso muerto rumano',
        nombreEN: 'Romanian Deadlift',
        alias: ['peso muerto rumano', 'rdl', 'romanian deadlift'],
        grupoMuscular: 'piernas',
        musculosSecundarios: ['espalda', 'core'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'traccion',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'Excelente para femorales y glúteos.',
        popularidad: 85,
        orden: 17,
        activo: true
    },
    {
        id: 'prensa',
        nombre: 'Prensa de piernas',
        nombreEN: 'Leg Press',
        alias: ['prensa', 'leg press', 'prensa piernas'],
        grupoMuscular: 'piernas',
        musculosSecundarios: [],
        tipo: 'compuesto',
        equipamiento: 'maquina',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'Segura y efectiva para desarrollar piernas.',
        popularidad: 88,
        orden: 18,
        activo: true
    },
    {
        id: 'zancadas',
        nombre: 'Zancadas',
        nombreEN: 'Lunges',
        alias: ['zancadas', 'lunges', 'estocadas'],
        grupoMuscular: 'piernas',
        musculosSecundarios: ['core'],
        tipo: 'compuesto',
        equipamiento: 'mancuerna',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'Trabajo unilateral y funcional de piernas.',
        popularidad: 82,
        orden: 19,
        activo: true
    },
    {
        id: 'bulgaro',
        nombre: 'Sentadilla búlgara',
        nombreEN: 'Bulgarian Split Squat',
        alias: ['bulgaro', 'sentadilla bulgara', 'split squat'],
        grupoMuscular: 'piernas',
        musculosSecundarios: ['core'],
        tipo: 'compuesto',
        equipamiento: 'mancuerna',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'Excelente para glúteos y cuádriceps unilateral.',
        popularidad: 76,
        orden: 20,
        activo: true
    },
    {
        id: 'curl_femoral',
        nombre: 'Curl femoral',
        nombreEN: 'Leg Curl',
        alias: ['curl femoral', 'leg curl', 'curl piernas'],
        grupoMuscular: 'piernas',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'maquina',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'Aislamiento directo de femorales.',
        popularidad: 80,
        orden: 21,
        activo: true
    },
    {
        id: 'extension_cuadriceps',
        nombre: 'Extensión de cuádriceps',
        nombreEN: 'Leg Extension',
        alias: ['extension cuadriceps', 'leg extension'],
        grupoMuscular: 'piernas',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'maquina',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'Aislamiento directo de cuádriceps.',
        popularidad: 79,
        orden: 22,
        activo: true
    },
    {
        id: 'pantorrillas_pie',
        nombre: 'Elevación de pantorrillas de pie',
        nombreEN: 'Standing Calf Raise',
        alias: ['pantorrillas pie', 'calf raise', 'gemelos'],
        grupoMuscular: 'piernas',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'maquina',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'Desarrollo de gemelos (gastrocnemio).',
        popularidad: 72,
        orden: 23,
        activo: true
    },
    {
        id: 'pantorrillas_sentado',
        nombre: 'Elevación de pantorrillas sentado',
        nombreEN: 'Seated Calf Raise',
        alias: ['pantorrillas sentado', 'seated calf'],
        grupoMuscular: 'piernas',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'maquina',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦵',
        descripcion: 'Trabaja el sóleo de las pantorrillas.',
        popularidad: 68,
        orden: 24,
        activo: true
    },

    // ========== HOMBROS (6) ==========
    {
        id: 'press_militar',
        nombre: 'Press militar',
        nombreEN: 'Overhead Press',
        alias: ['press militar', 'overhead press', 'press hombros'],
        grupoMuscular: 'hombros',
        musculosSecundarios: ['triceps', 'core'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦾',
        descripcion: 'Fundamental para desarrollo de hombros y fuerza.',
        popularidad: 91,
        orden: 25,
        activo: true
    },
    {
        id: 'press_arnold',
        nombre: 'Press Arnold',
        nombreEN: 'Arnold Press',
        alias: ['press arnold', 'arnold press'],
        grupoMuscular: 'hombros',
        musculosSecundarios: ['triceps'],
        tipo: 'compuesto',
        equipamiento: 'mancuerna',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦾',
        descripcion: 'Rotación que trabaja todos los deltoides.',
        popularidad: 75,
        orden: 26,
        activo: true
    },
    {
        id: 'elevaciones_laterales',
        nombre: 'Elevaciones laterales',
        nombreEN: 'Lateral Raises',
        alias: ['elevaciones laterales', 'lateral raises', 'pajaros laterales'],
        grupoMuscular: 'hombros',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'mancuerna',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦾',
        descripcion: 'Esencial para amplitud de hombros.',
        popularidad: 89,
        orden: 27,
        activo: true
    },
    {
        id: 'elevaciones_frontales',
        nombre: 'Elevaciones frontales',
        nombreEN: 'Front Raises',
        alias: ['elevaciones frontales', 'front raises'],
        grupoMuscular: 'hombros',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'mancuerna',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦾',
        descripcion: 'Trabaja el deltoides frontal.',
        popularidad: 73,
        orden: 28,
        activo: true
    },
    {
        id: 'pajaros',
        nombre: 'Pájaros',
        nombreEN: 'Rear Delt Flyes',
        alias: ['pajaros', 'rear delt', 'deltoides posterior'],
        grupoMuscular: 'hombros',
        musculosSecundarios: ['espalda'],
        tipo: 'aislamiento',
        equipamiento: 'mancuerna',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦾',
        descripcion: 'Crucial para deltoides posterior y postura.',
        popularidad: 81,
        orden: 29,
        activo: true
    },
    {
        id: 'remo_alto',
        nombre: 'Remo alto',
        nombreEN: 'Upright Row',
        alias: ['remo alto', 'upright row'],
        grupoMuscular: 'hombros',
        musculosSecundarios: ['trapecio'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'traccion',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🦾',
        descripcion: 'Desarrollo de hombros y trapecios.',
        popularidad: 70,
        orden: 30,
        activo: true
    },

    // ========== BÍCEPS (5) ==========
    {
        id: 'curl_barra',
        nombre: 'Curl con barra',
        nombreEN: 'Barbell Curl',
        alias: ['curl barra', 'barbell curl', 'curl'],
        grupoMuscular: 'biceps',
        musculosSecundarios: ['antebrazos'],
        tipo: 'aislamiento',
        equipamiento: 'barra',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Clásico para masa de bíceps.',
        popularidad: 90,
        orden: 31,
        activo: true
    },
    {
        id: 'curl_mancuernas',
        nombre: 'Curl con mancuernas',
        nombreEN: 'Dumbbell Curl',
        alias: ['curl mancuernas', 'dumbbell curl', 'curl alterno'],
        grupoMuscular: 'biceps',
        musculosSecundarios: ['antebrazos'],
        tipo: 'aislamiento',
        equipamiento: 'mancuerna',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Permite supinación completa y trabajo unilateral.',
        popularidad: 87,
        orden: 32,
        activo: true
    },
    {
        id: 'curl_martillo',
        nombre: 'Curl martillo',
        nombreEN: 'Hammer Curl',
        alias: ['curl martillo', 'hammer curl'],
        grupoMuscular: 'biceps',
        musculosSecundarios: ['antebrazos'],
        tipo: 'aislamiento',
        equipamiento: 'mancuerna',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Enfatiza braquial y braquiorradial.',
        popularidad: 84,
        orden: 33,
        activo: true
    },
    {
        id: 'curl_predicador',
        nombre: 'Curl predicador',
        nombreEN: 'Preacher Curl',
        alias: ['curl predicador', 'preacher curl', 'curl scott'],
        grupoMuscular: 'biceps',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'barra',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Aislamiento estricto del bíceps.',
        popularidad: 76,
        orden: 34,
        activo: true
    },
    {
        id: 'curl_cable',
        nombre: 'Curl en polea',
        nombreEN: 'Cable Curl',
        alias: ['curl cable', 'cable curl', 'curl polea'],
        grupoMuscular: 'biceps',
        musculosSecundarios: ['antebrazos'],
        tipo: 'aislamiento',
        equipamiento: 'cable',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Tensión constante en todo el rango.',
        popularidad: 78,
        orden: 35,
        activo: true
    },

    // ========== TRÍCEPS (5) ==========
    {
        id: 'press_cerrado',
        nombre: 'Press banca agarre cerrado',
        nombreEN: 'Close Grip Bench Press',
        alias: ['press cerrado', 'close grip', 'press agarre cerrado'],
        grupoMuscular: 'triceps',
        musculosSecundarios: ['pecho'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'El mejor ejercicio para masa de tríceps.',
        popularidad: 85,
        orden: 36,
        activo: true
    },
    {
        id: 'fondos_triceps',
        nombre: 'Fondos para tríceps',
        nombreEN: 'Triceps Dips',
        alias: ['fondos triceps', 'tricep dips'],
        grupoMuscular: 'triceps',
        musculosSecundarios: ['pecho'],
        tipo: 'compuesto',
        equipamiento: 'peso_corporal',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Excelente para desarrollo completo de tríceps.',
        popularidad: 82,
        orden: 37,
        activo: true
    },
    {
        id: 'extensiones_polea',
        nombre: 'Extensiones en polea',
        nombreEN: 'Cable Pushdown',
        alias: ['extensiones polea', 'pushdown', 'jalones triceps'],
        grupoMuscular: 'triceps',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'cable',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Aislamiento clásico de tríceps.',
        popularidad: 88,
        orden: 38,
        activo: true
    },
    {
        id: 'extensiones_frances',
        nombre: 'Extensiones francesas',
        nombreEN: 'Skull Crushers',
        alias: ['extensiones francesas', 'skull crushers', 'press frances'],
        grupoMuscular: 'triceps',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Gran estiramiento de la cabeza larga del tríceps.',
        popularidad: 79,
        orden: 39,
        activo: true
    },
    {
        id: 'patada_triceps',
        nombre: 'Patada de tríceps',
        nombreEN: 'Triceps Kickback',
        alias: ['patada triceps', 'kickback', 'extensiones traseras'],
        grupoMuscular: 'triceps',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'mancuerna',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '💪',
        descripcion: 'Aislamiento del tríceps con contracción máxima.',
        popularidad: 72,
        orden: 40,
        activo: true
    },

    // ========== CORE (5) ==========
    {
        id: 'plancha',
        nombre: 'Plancha',
        nombreEN: 'Plank',
        alias: ['plancha', 'plank', 'plancha abdominal'],
        grupoMuscular: 'core',
        musculosSecundarios: ['hombros'],
        tipo: 'estatico',
        equipamiento: 'peso_corporal',
        mecanica: 'estatico',
        dificultad: 'principiante',
        tipoMedicion: 'tiempo',
        unidadPeso: 'segundos',
        icono: '🔥',
        descripcion: 'El mejor ejercicio para estabilidad del core.',
        popularidad: 92,
        orden: 41,
        activo: true
    },
    {
        id: 'crunches',
        nombre: 'Crunches',
        nombreEN: 'Crunches',
        alias: ['crunches', 'abdominales', 'crunch'],
        grupoMuscular: 'core',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'peso_corporal',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'reps',
        unidadPeso: 'repeticiones',
        icono: '🔥',
        descripcion: 'Clásico para abdominales superiores.',
        popularidad: 85,
        orden: 42,
        activo: true
    },
    {
        id: 'elevacion_piernas',
        nombre: 'Elevación de piernas',
        nombreEN: 'Leg Raises',
        alias: ['elevacion piernas', 'leg raises', 'elevaciones'],
        grupoMuscular: 'core',
        musculosSecundarios: [],
        tipo: 'aislamiento',
        equipamiento: 'peso_corporal',
        mecanica: 'traccion',
        dificultad: 'intermedio',
        tipoMedicion: 'reps',
        unidadPeso: 'repeticiones',
        icono: '🔥',
        descripcion: 'Excelente para abdomen inferior.',
        popularidad: 83,
        orden: 43,
        activo: true
    },
    {
        id: 'russian_twist',
        nombre: 'Russian twist',
        nombreEN: 'Russian Twist',
        alias: ['russian twist', 'giros rusos', 'twist'],
        grupoMuscular: 'core',
        musculosSecundarios: ['oblicuos'],
        tipo: 'aislamiento',
        equipamiento: 'peso_corporal',
        mecanica: 'traccion',
        dificultad: 'principiante',
        tipoMedicion: 'reps',
        unidadPeso: 'repeticiones',
        icono: '🔥',
        descripcion: 'Trabaja oblicuos y rotación del core.',
        popularidad: 80,
        orden: 44,
        activo: true
    },
    {
        id: 'mountain_climbers',
        nombre: 'Mountain climbers',
        nombreEN: 'Mountain Climbers',
        alias: ['mountain climbers', 'escaladores'],
        grupoMuscular: 'core',
        musculosSecundarios: ['cardio'],
        tipo: 'compuesto',
        equipamiento: 'peso_corporal',
        mecanica: 'empuje',
        dificultad: 'principiante',
        tipoMedicion: 'reps',
        unidadPeso: 'repeticiones',
        icono: '🔥',
        descripcion: 'Combina core y cardio intenso.',
        popularidad: 78,
        orden: 45,
        activo: true
    },

    // ========== FULLBODY (5) ==========
    {
        id: 'burpees',
        nombre: 'Burpees',
        nombreEN: 'Burpees',
        alias: ['burpees', 'burpee'],
        grupoMuscular: 'fullbody',
        musculosSecundarios: ['cardio'],
        tipo: 'compuesto',
        equipamiento: 'peso_corporal',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'reps',
        unidadPeso: 'repeticiones',
        icono: '🏃',
        descripcion: 'Ejercicio explosivo de cuerpo completo.',
        popularidad: 86,
        orden: 46,
        activo: true
    },
    {
        id: 'thruster',
        nombre: 'Thruster',
        nombreEN: 'Thruster',
        alias: ['thruster', 'thrusters'],
        grupoMuscular: 'fullbody',
        musculosSecundarios: ['cardio'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'avanzado',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏃',
        descripcion: 'Sentadilla frontal + press en un movimiento.',
        popularidad: 75,
        orden: 47,
        activo: true
    },
    {
        id: 'clean_press',
        nombre: 'Clean & Press',
        nombreEN: 'Clean and Press',
        alias: ['clean press', 'cargada y press', 'clean and press'],
        grupoMuscular: 'fullbody',
        musculosSecundarios: ['cardio'],
        tipo: 'compuesto',
        equipamiento: 'barra',
        mecanica: 'empuje',
        dificultad: 'avanzado',
        tipoMedicion: 'peso_reps',
        unidadPeso: 'kg',
        icono: '🏃',
        descripcion: 'Movimiento olímpico de potencia total.',
        popularidad: 72,
        orden: 48,
        activo: true
    },
    {
        id: 'kettlebell_swing',
        nombre: 'Swing con kettlebell',
        nombreEN: 'Kettlebell Swing',
        alias: ['kettlebell swing', 'swing', 'balanceo kettlebell'],
        grupoMuscular: 'fullbody',
        musculosSecundarios: ['cardio'],
        tipo: 'compuesto',
        equipamiento: 'mancuerna',
        mecanica: 'empuje',
        dificultad: 'intermedio',
        tipoMedicion: 'reps',
        unidadPeso: 'repeticiones',
        icono: '🏃',
        descripcion: 'Potencia de cadera y acondicionamiento.',
        popularidad: 81,
        orden: 49,
        activo: true
    },
    {
        id: 'farmers_walk',
        nombre: 'Farmer\'s walk',
        nombreEN: 'Farmer\'s Walk',
        alias: ['farmers walk', 'caminata granjero', 'paseo granjero'],
        grupoMuscular: 'fullbody',
        musculosSecundarios: ['core', 'antebrazos'],
        tipo: 'compuesto',
        equipamiento: 'mancuerna',
        mecanica: 'estatico',
        dificultad: 'principiante',
        tipoMedicion: 'distancia',
        unidadPeso: 'metros',
        icono: '🏃',
        descripcion: 'Fuerza de agarre y estabilidad total.',
        popularidad: 77,
        orden: 50,
        activo: true
    }
];

// =========================================
// FUNCIONES DE INICIALIZACIÓN
// =========================================

/**
 * Inicializar ejercicios en Firestore (ejecutar solo una vez)
 * Sube los 50 ejercicios a la colección 'exercises'
 */
export async function inicializarEjerciciosEnFirestore() {
    try {
        console.log('🏋️ Inicializando base de datos de ejercicios en Firestore...');
        
        const exercisesRef = collection(db, 'exercises');
        let contador = 0;
        
        for (const exercise of EXERCISES_DB) {
            await setDoc(doc(exercisesRef, exercise.id), exercise);
            contador++;
            console.log(`✅ ${contador}/${EXERCISES_DB.length}: ${exercise.nombre}`);
        }
        
        console.log(`🎉 ¡${contador} ejercicios inicializados correctamente!`);
        return { success: true, count: contador };
    } catch (error) {
        console.error('❌ Error al inicializar ejercicios:', error);
        throw error;
    }
}

/**
 * Verificar si los ejercicios ya están inicializados
 */
export async function ejerciciosYaInicializados() {
    try {
        const exercisesRef = collection(db, 'exercises');
        const snapshot = await getDocs(exercisesRef);
        return snapshot.size >= 50;
    } catch (error) {
        console.error('Error al verificar ejercicios:', error);
        return false;
    }
}

// =========================================
// FUNCIONES DE CONSULTA
// =========================================

/**
 * Obtener todos los ejercicios (con cache)
 */
export async function obtenerEjercicios() {
    try {
        const exercisesRef = collection(db, 'exercises');
        const snapshot = await getDocs(exercisesRef);
        
        const ejercicios = [];
        snapshot.forEach((doc) => {
            ejercicios.push({ id: doc.id, ...doc.data() });
        });
        
        // Ordenar por popularidad y orden
        ejercicios.sort((a, b) => {
            if (b.popularidad !== a.popularidad) {
                return b.popularidad - a.popularidad;
            }
            return a.orden - b.orden;
        });
        
        return ejercicios;
    } catch (error) {
        console.error('❌ Error al obtener ejercicios:', error);
        // Fallback a datos locales
        return EXERCISES_DB;
    }
}

/**
 * Obtener un ejercicio por ID
 */
export async function obtenerEjercicioPorId(exerciseId) {
    try {
        const exerciseRef = doc(db, 'exercises', exerciseId);
        const exerciseSnap = await getDoc(exerciseRef);
        
        if (exerciseSnap.exists()) {
            return { id: exerciseSnap.id, ...exerciseSnap.data() };
        }
        
        // Fallback a datos locales
        return EXERCISES_DB.find(ex => ex.id === exerciseId);
    } catch (error) {
        console.error('Error al obtener ejercicio:', error);
        return EXERCISES_DB.find(ex => ex.id === exerciseId);
    }
}

/**
 * Buscar ejercicios por query y filtros
 */
export function buscarEjercicios(query = '', filtros = {}) {
    let ejercicios = [...EXERCISES_DB];
    
    // Filtrar por query (nombre, alias)
    if (query) {
        const queryLower = query.toLowerCase();
        ejercicios = ejercicios.filter(ej => {
            const nombreMatch = ej.nombre.toLowerCase().includes(queryLower);
            const nombreENMatch = ej.nombreEN.toLowerCase().includes(queryLower);
            const aliasMatch = ej.alias.some(a => a.toLowerCase().includes(queryLower));
            return nombreMatch || nombreENMatch || aliasMatch;
        });
    }
    
    // Filtrar por grupo muscular
    if (filtros.grupoMuscular) {
        ejercicios = ejercicios.filter(ej => ej.grupoMuscular === filtros.grupoMuscular);
    }
    
    // Filtrar por equipamiento
    if (filtros.equipamiento) {
        ejercicios = ejercicios.filter(ej => ej.equipamiento === filtros.equipamiento);
    }
    
    // Filtrar por tipo
    if (filtros.tipo) {
        ejercicios = ejercicios.filter(ej => ej.tipo === filtros.tipo);
    }
    
    // Filtrar por dificultad
    if (filtros.dificultad) {
        ejercicios = ejercicios.filter(ej => ej.dificultad === filtros.dificultad);
    }
    
    return ejercicios;
}

/**
 * Agrupar ejercicios por grupo muscular
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

// =========================================
// EXPORTAR CONSTANTES
// =========================================

export const GRUPOS_MUSCULARES = [
    'pecho', 'espalda', 'piernas', 'hombros', 
    'biceps', 'triceps', 'core', 'fullbody'
];

export const EQUIPAMIENTOS = [
    'barra', 'mancuerna', 'maquina', 'cable', 'peso_corporal'
];

export const TIPOS = ['compuesto', 'aislamiento', 'estatico'];

export const DIFICULTADES = ['principiante', 'intermedio', 'avanzado'];
