// ================================================
// RUTINAS PÚBLICAS PRE-CARGADAS
// 20 rutinas profesionales para usuarios
// ================================================

export const RUTINAS_PUBLICAS = [
    // ========== PRINCIPIANTES (4) ==========
    {
        id: 'fullbody-principiante',
        nombre: 'Full Body Principiante',
        descripcion: 'Rutina de cuerpo completo 3 días/semana ideal para comenzar',
        objetivo: 'fuerza',
        nivel: 'principiante',
        diasSemana: 3,
        duracionEstimada: 60,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: true,
        likes: 0,
        color: '#3b82f6',
        icono: '🏋️',
        ejercicios: [
            { exerciseId: 'sentadilla', series: 3, reps: '10-12', descanso: 120, notas: 'Técnica perfecta' },
            { exerciseId: 'press_banca', series: 3, reps: '10-12', descanso: 120, notas: 'Controla el descenso' },
            { exerciseId: 'remo_barra', series: 3, reps: '10-12', descanso: 120, notas: 'Espalda recta' },
            { exerciseId: 'press_militar', series: 3, reps: '10-12', descanso: 90, notas: 'Core apretado' },
            { exerciseId: 'peso_muerto', series: 3, reps: '8-10', descanso: 180, notas: 'Caderas atrás' },
            { exerciseId: 'curl_barra', series: 2, reps: '12-15', descanso: 60, notas: 'Sin balanceo' },
            { exerciseId: 'press_frances', series: 2, reps: '12-15', descanso: 60, notas: 'Codos fijos' },
            { exerciseId: 'plank', series: 3, reps: '30-45s', descanso: 60, notas: 'Línea recta' }
        ]
    },
    {
        id: 'upper-lower-principiante',
        nombre: 'Upper/Lower Split Básico',
        descripcion: 'Divide superior/inferior 4 días/semana',
        objetivo: 'hipertrofia',
        nivel: 'principiante',
        diasSemana: 4,
        duracionEstimada: 50,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: true,
        likes: 0,
        color: '#10b981',
        icono: '💪',
        ejercicios: [
            // Día Superior
            { exerciseId: 'press_banca', series: 3, reps: '8-10', descanso: 120, notas: 'Día Upper' },
            { exerciseId: 'remo_barra', series: 3, reps: '8-10', descanso: 120 },
            { exerciseId: 'press_militar_mancuernas', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'jalon_pecho', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'curl_barra', series: 2, reps: '10-12', descanso: 60 },
            { exerciseId: 'fondos_triceps', series: 2, reps: '10-12', descanso: 60 },
            // Día Inferior
            { exerciseId: 'sentadilla', series: 4, reps: '8-10', descanso: 180, notas: 'Día Lower' },
            { exerciseId: 'peso_muerto_rumano', series: 3, reps: '10-12', descanso: 120 },
            { exerciseId: 'prensa_pierna', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'curl_femoral', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'elevacion_pantorrillas', series: 3, reps: '15-20', descanso: 60 }
        ]
    },
    {
        id: 'gym-basico-3-dias',
        nombre: 'Rutina Gym Básica 3 Días',
        descripcion: 'Rutina simple y efectiva para principiantes',
        objetivo: 'general',
        nivel: 'principiante',
        diasSemana: 3,
        duracionEstimada: 45,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#f59e0b',
        icono: '🎯',
        ejercicios: [
            { exerciseId: 'goblet_squat', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'press_mancuernas', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'remo_maquina', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'press_arnold', series: 2, reps: '10-12', descanso: 75 },
            { exerciseId: 'curl_martillo', series: 2, reps: '12-15', descanso: 60 },
            { exerciseId: 'extension_triceps_polea', series: 2, reps: '12-15', descanso: 60 },
            { exerciseId: 'crunch', series: 3, reps: '15-20', descanso: 45 }
        ]
    },
    {
        id: 'calistenia-casa',
        nombre: 'Calistenia en Casa',
        descripcion: 'Sin equipo, solo peso corporal',
        objetivo: 'general',
        nivel: 'principiante',
        diasSemana: 4,
        duracionEstimada: 40,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: true,
        likes: 0,
        color: '#8b5cf6',
        icono: '🏠',
        ejercicios: [
            { exerciseId: 'flexiones', series: 4, reps: '10-15', descanso: 90 },
            { exerciseId: 'sentadillas_bodyweight', series: 4, reps: '20-25', descanso: 60 },
            { exerciseId: 'fondos_banco', series: 3, reps: '10-15', descanso: 75 },
            { exerciseId: 'zancadas', series: 3, reps: '12-15', descanso: 60 },
            { exerciseId: 'plank', series: 3, reps: '30-60s', descanso: 60 },
            { exerciseId: 'mountain_climbers', series: 3, reps: '20-30', descanso: 60 },
            { exerciseId: 'burpees', series: 3, reps: '10-15', descanso: 90 }
        ]
    },

    // ========== INTERMEDIOS (8) ==========
    {
        id: 'ppl-hipertrofia',
        nombre: 'Push Pull Legs - Hipertrofia',
        descripcion: 'Rutina PPL 6 días/semana para máximo crecimiento muscular',
        objetivo: 'hipertrofia',
        nivel: 'intermedio',
        diasSemana: 6,
        duracionEstimada: 75,
        gruposMusculares: ['pecho', 'espalda', 'piernas', 'hombros', 'biceps', 'triceps'],
        autor: 'DataGym Team',
        popular: true,
        likes: 0,
        color: '#ef4444',
        icono: '🔥',
        ejercicios: [
            // PUSH (Pecho, Hombros, Tríceps)
            { exerciseId: 'press_banca', series: 4, reps: '8-10', descanso: 120, notas: 'Día Push' },
            { exerciseId: 'press_inclinado', series: 4, reps: '8-12', descanso: 120 },
            { exerciseId: 'press_militar', series: 3, reps: '8-10', descanso: 90 },
            { exerciseId: 'aperturas_mancuerna', series: 3, reps: '12-15', descanso: 75 },
            { exerciseId: 'elevaciones_laterales', series: 3, reps: '12-15', descanso: 60 },
            { exerciseId: 'fondos_triceps', series: 3, reps: '10-12', descanso: 75 },
            { exerciseId: 'extension_triceps_polea', series: 3, reps: '12-15', descanso: 60 },
            // PULL (Espalda, Bíceps)
            { exerciseId: 'peso_muerto', series: 4, reps: '6-8', descanso: 180, notas: 'Día Pull' },
            { exerciseId: 'dominadas', series: 4, reps: '8-10', descanso: 120 },
            { exerciseId: 'remo_barra', series: 4, reps: '8-10', descanso: 120 },
            { exerciseId: 'jalon_pecho', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'remo_mancuerna', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'curl_barra', series: 3, reps: '10-12', descanso: 75 },
            { exerciseId: 'curl_martillo', series: 3, reps: '12-15', descanso: 60 },
            // LEGS (Piernas, Glúteos)
            { exerciseId: 'sentadilla', series: 4, reps: '8-10', descanso: 180, notas: 'Día Legs' },
            { exerciseId: 'prensa_pierna', series: 4, reps: '10-12', descanso: 120 },
            { exerciseId: 'peso_muerto_rumano', series: 3, reps: '10-12', descanso: 120 },
            { exerciseId: 'curl_femoral', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'extension_cuadriceps', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'hip_thrust_barra', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'elevacion_pantorrillas', series: 4, reps: '15-20', descanso: 60 }
        ]
    },
    {
        id: 'fuerza-5x5',
        nombre: 'Fuerza 5×5 StrongLifts',
        descripcion: 'Programa de fuerza 3 días/semana basado en 5 series de 5 reps',
        objetivo: 'fuerza',
        nivel: 'intermedio',
        diasSemana: 3,
        duracionEstimada: 60,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: true,
        likes: 0,
        color: '#7c3aed',
        icono: '⚡',
        ejercicios: [
            // Workout A
            { exerciseId: 'sentadilla', series: 5, reps: '5', descanso: 240, notas: 'Workout A' },
            { exerciseId: 'press_banca', series: 5, reps: '5', descanso: 240 },
            { exerciseId: 'remo_barra', series: 5, reps: '5', descanso: 240 },
            // Workout B
            { exerciseId: 'sentadilla', series: 5, reps: '5', descanso: 240, notas: 'Workout B' },
            { exerciseId: 'press_militar', series: 5, reps: '5', descanso: 240 },
            { exerciseId: 'peso_muerto', series: 1, reps: '5', descanso: 300 }
        ]
    },
    {
        id: 'definicion-circuito',
        nombre: 'Definición - Circuito HIIT',
        descripcion: 'Circuitos de alta intensidad para quemar grasa',
        objetivo: 'definicion',
        nivel: 'intermedio',
        diasSemana: 4,
        duracionEstimada: 45,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#f59e0b',
        icono: '🔥',
        ejercicios: [
            { exerciseId: 'burpees', series: 4, reps: '15-20', descanso: 30 },
            { exerciseId: 'kettlebell_swing', series: 4, reps: '20-25', descanso: 30 },
            { exerciseId: 'box_jumps', series: 4, reps: '15', descanso: 30 },
            { exerciseId: 'battle_ropes', series: 4, reps: '30s', descanso: 30 },
            { exerciseId: 'mountain_climbers', series: 4, reps: '30-40', descanso: 30 },
            { exerciseId: 'thruster', series: 4, reps: '12-15', descanso: 30 },
            { exerciseId: 'remo_calorias', series: 4, reps: '250m', descanso: 60 }
        ]
    },
    {
        id: 'torso-pierna',
        nombre: 'Torso Pierna 4 Días',
        descripcion: 'Split clásico europeo alternando torso y pierna',
        objetivo: 'hipertrofia',
        nivel: 'intermedio',
        diasSemana: 4,
        duracionEstimada: 70,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#06b6d4',
        icono: '💪',
        ejercicios: [
            // Torso 1
            { exerciseId: 'press_banca', series: 4, reps: '8-10', descanso: 120, notas: 'Torso 1' },
            { exerciseId: 'remo_barra', series: 4, reps: '8-10', descanso: 120 },
            { exerciseId: 'press_inclinado', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'dominadas', series: 3, reps: '8-12', descanso: 90 },
            { exerciseId: 'press_militar_mancuernas', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'curl_barra', series: 3, reps: '10-12', descanso: 60 },
            { exerciseId: 'press_frances', series: 3, reps: '10-12', descanso: 60 },
            // Pierna 1
            { exerciseId: 'sentadilla', series: 4, reps: '8-10', descanso: 180, notas: 'Pierna 1' },
            { exerciseId: 'peso_muerto', series: 4, reps: '6-8', descanso: 180 },
            { exerciseId: 'prensa_pierna', series: 3, reps: '12-15', descanso: 120 },
            { exerciseId: 'curl_femoral', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'extension_cuadriceps', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'elevacion_pantorrillas', series: 4, reps: '15-20', descanso: 60 }
        ]
    },
    {
        id: 'crossfit-wod',
        nombre: 'CrossFit WODs',
        descripcion: 'Workouts del día estilo CrossFit para condicionamiento',
        objetivo: 'resistencia',
        nivel: 'intermedio',
        diasSemana: 5,
        duracionEstimada: 60,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#dc2626',
        icono: '⚡',
        ejercicios: [
            { exerciseId: 'clean_and_press', series: 5, reps: '10', descanso: 60 },
            { exerciseId: 'thruster', series: 5, reps: '15', descanso: 60 },
            { exerciseId: 'burpees', series: 5, reps: '20', descanso: 60 },
            { exerciseId: 'kettlebell_swing', series: 5, reps: '25', descanso: 60 },
            { exerciseId: 'box_jumps', series: 5, reps: '15', descanso: 60 },
            { exerciseId: 'wall_ball', series: 5, reps: '20', descanso: 60 },
            { exerciseId: 'toes_to_bar', series: 5, reps: '15', descanso: 60 }
        ]
    },
    {
        id: 'hipertrofia-pecho-espalda',
        nombre: 'Especialización Pecho/Espalda',
        descripcion: 'Enfoque en desarrollo de torso superior',
        objetivo: 'hipertrofia',
        nivel: 'intermedio',
        diasSemana: 4,
        duracionEstimada: 70,
        gruposMusculares: ['pecho', 'espalda', 'hombros'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#0ea5e9',
        icono: '💪',
        ejercicios: [
            // Pecho
            { exerciseId: 'press_banca', series: 5, reps: '6-8', descanso: 180 },
            { exerciseId: 'press_inclinado', series: 4, reps: '8-10', descanso: 120 },
            { exerciseId: 'press_decline', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'aperturas_cable', series: 3, reps: '12-15', descanso: 75 },
            { exerciseId: 'fondos_pecho', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'pullover_mancuerna', series: 3, reps: '12-15', descanso: 75 },
            // Espalda
            { exerciseId: 'peso_muerto', series: 5, reps: '5-6', descanso: 240 },
            { exerciseId: 'dominadas', series: 4, reps: '6-10', descanso: 120 },
            { exerciseId: 'remo_barra', series: 4, reps: '8-10', descanso: 120 },
            { exerciseId: 'remo_t_barra', series: 3, reps: '10-12', descanso: 90 },
            { exerciseId: 'jalon_pecho', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'pulldown_agarre_cerrado', series: 3, reps: '12-15', descanso: 75 }
        ]
    },
    {
        id: 'piernas-gluteos-mujer',
        nombre: 'Piernas y Glúteos - Femenino',
        descripcion: 'Enfoque en tren inferior para mujeres',
        objetivo: 'hipertrofia',
        nivel: 'intermedio',
        diasSemana: 4,
        duracionEstimada: 60,
        gruposMusculares: ['piernas'],
        autor: 'DataGym Team',
        popular: true,
        likes: 0,
        color: '#ec4899',
        icono: '🍑',
        ejercicios: [
            { exerciseId: 'hip_thrust_barra', series: 4, reps: '10-12', descanso: 120 },
            { exerciseId: 'sentadilla_bulgara', series: 4, reps: '12-15', descanso: 90 },
            { exerciseId: 'peso_muerto_rumano', series: 4, reps: '10-12', descanso: 120 },
            { exerciseId: 'sentadilla_sumo', series: 3, reps: '12-15', descanso: 90 },
            { exerciseId: 'prensa_pierna', series: 3, reps: '15-20', descanso: 90 },
            { exerciseId: 'abductor_maquina', series: 3, reps: '15-20', descanso: 60 },
            { exerciseId: 'curl_femoral', series: 3, reps: '12-15', descanso: 75 },
            { exerciseId: 'patada_gluteo_polea', series: 3, reps: '15-20', descanso: 60 }
        ]
    },
    {
        id: 'brazos-explosivos',
        nombre: 'Brazos Explosivos',
        descripcion: 'Especialización en bíceps y tríceps',
        objetivo: 'hipertrofia',
        nivel: 'intermedio',
        diasSemana: 2,
        duracionEstimada: 50,
        gruposMusculares: ['biceps', 'triceps'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#f97316',
        icono: '💪',
        ejercicios: [
            { exerciseId: 'curl_barra', series: 4, reps: '8-10', descanso: 90 },
            { exerciseId: 'press_cerrado_barra', series: 4, reps: '8-10', descanso: 90 },
            { exerciseId: 'curl_predicador', series: 3, reps: '10-12', descanso: 75 },
            { exerciseId: 'fondos_triceps', series: 3, reps: '10-12', descanso: 75 },
            { exerciseId: 'curl_martillo', series: 3, reps: '12-15', descanso: 60 },
            { exerciseId: 'extension_triceps_polea', series: 3, reps: '12-15', descanso: 60 },
            { exerciseId: 'curl_concentrado', series: 3, reps: '12-15', descanso: 60 },
            { exerciseId: 'kickbacks', series: 3, reps: '15-20', descanso: 60 }
        ]
    },

    // ========== AVANZADOS (8) ==========
    {
        id: 'powerlifting-competicion',
        nombre: 'Powerlifting - Competición',
        descripcion: 'Enfoque en los 3 grandes: sentadilla, press banca, peso muerto',
        objetivo: 'fuerza',
        nivel: 'avanzado',
        diasSemana: 4,
        duracionEstimada: 90,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: true,
        likes: 0,
        color: '#7c3aed',
        icono: '🏆',
        ejercicios: [
            // Sentadilla
            { exerciseId: 'sentadilla', series: 5, reps: '3-5', descanso: 300, notas: 'Día Sentadilla' },
            { exerciseId: 'sentadilla_frontal', series: 3, reps: '6-8', descanso: 240 },
            { exerciseId: 'prensa_pierna', series: 3, reps: '10-12', descanso: 120 },
            // Press Banca
            { exerciseId: 'press_banca', series: 5, reps: '3-5', descanso: 300, notas: 'Día Press' },
            { exerciseId: 'press_inclinado', series: 3, reps: '6-8', descanso: 240 },
            { exerciseId: 'press_cerrado_barra', series: 3, reps: '6-8', descanso: 180 },
            // Peso Muerto
            { exerciseId: 'peso_muerto', series: 5, reps: '2-3', descanso: 360, notas: 'Día Peso Muerto' },
            { exerciseId: 'peso_muerto_deficit', series: 3, reps: '5-6', descanso: 240 },
            { exerciseId: 'buenos_dias', series: 3, reps: '8-10', descanso: 180 }
        ]
    },
    {
        id: 'volumen-aleman',
        nombre: 'Volumen Alemán 10×10',
        descripcion: 'Método de volumen extremo con 10 series de 10 reps',
        objetivo: 'hipertrofia',
        nivel: 'avanzado',
        diasSemana: 4,
        duracionEstimada: 75,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#ef4444',
        icono: '🔥',
        ejercicios: [
            // Día 1: Pecho/Espalda
            { exerciseId: 'press_banca', series: 10, reps: '10', descanso: 90, notas: 'Mismo peso' },
            { exerciseId: 'dominadas', series: 10, reps: '10', descanso: 90, notas: 'Mismo peso' },
            // Día 2: Piernas/Abs
            { exerciseId: 'sentadilla', series: 10, reps: '10', descanso: 90 },
            { exerciseId: 'peso_muerto_piernas_rigidas', series: 10, reps: '10', descanso: 90 },
            // Día 3: Hombros/Brazos
            { exerciseId: 'press_militar', series: 10, reps: '10', descanso: 90 },
            { exerciseId: 'curl_barra', series: 10, reps: '10', descanso: 60 },
            { exerciseId: 'fondos_triceps', series: 10, reps: '10', descanso: 60 }
        ]
    },
    {
        id: 'olimpicos-potencia',
        nombre: 'Levantamientos Olímpicos',
        descripcion: 'Desarrollo de potencia explosiva con ejercicios olímpicos',
        objetivo: 'fuerza',
        nivel: 'avanzado',
        diasSemana: 4,
        duracionEstimada: 80,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#fbbf24',
        icono: '⚡',
        ejercicios: [
            { exerciseId: 'clean_and_press', series: 5, reps: '3-5', descanso: 240 },
            { exerciseId: 'snatch', series: 5, reps: '2-3', descanso: 300 },
            { exerciseId: 'cargada_potencia', series: 4, reps: '3-5', descanso: 240 },
            { exerciseId: 'sentadilla_frontal', series: 4, reps: '5-6', descanso: 240 },
            { exerciseId: 'push_press', series: 4, reps: '5-6', descanso: 180 },
            { exerciseId: 'sentadilla_overhead', series: 3, reps: '5-6', descanso: 240 }
        ]
    },
    {
        id: 'calistenia-avanzada',
        nombre: 'Calistenia Avanzada',
        descripcion: 'Movimientos avanzados de peso corporal',
        objetivo: 'fuerza',
        nivel: 'avanzado',
        diasSemana: 5,
        duracionEstimada: 70,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: true,
        likes: 0,
        color: '#8b5cf6',
        icono: '🤸',
        ejercicios: [
            { exerciseId: 'muscle_up', series: 5, reps: '5-8', descanso: 180 },
            { exerciseId: 'front_lever', series: 4, reps: '10s hold', descanso: 120 },
            { exerciseId: 'planche_progression', series: 4, reps: '15s hold', descanso: 120 },
            { exerciseId: 'handstand_pushups', series: 4, reps: '8-12', descanso: 120 },
            { exerciseId: 'pistol_squat', series: 4, reps: '10-12', descanso: 90 },
            { exerciseId: 'dragon_flag', series: 3, reps: '8-10', descanso: 90 },
            { exerciseId: 'l_sit', series: 4, reps: '20-30s', descanso: 90 }
        ]
    },
    {
        id: 'hipertrofia-extrema',
        nombre: 'Hipertrofia Extrema',
        descripcion: 'Volumen máximo para culturismo',
        objetivo: 'hipertrofia',
        nivel: 'avanzado',
        diasSemana: 6,
        duracionEstimada: 90,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#dc2626',
        icono: '💥',
        ejercicios: [
            // Lunes: Pecho
            { exerciseId: 'press_banca', series: 5, reps: '8-10', descanso: 120 },
            { exerciseId: 'press_inclinado', series: 4, reps: '10-12', descanso: 90 },
            { exerciseId: 'press_decline', series: 4, reps: '10-12', descanso: 90 },
            { exerciseId: 'aperturas_mancuerna', series: 4, reps: '12-15', descanso: 75 },
            { exerciseId: 'aperturas_cable', series: 4, reps: '15-20', descanso: 60 },
            { exerciseId: 'pec_deck', series: 4, reps: '15-20', descanso: 60 },
            // Martes: Espalda
            { exerciseId: 'peso_muerto', series: 5, reps: '6-8', descanso: 180 },
            { exerciseId: 'dominadas', series: 4, reps: '8-12', descanso: 120 },
            { exerciseId: 'remo_barra', series: 4, reps: '8-10', descanso: 120 },
            { exerciseId: 'remo_t_barra', series: 4, reps: '10-12', descanso: 90 },
            { exerciseId: 'jalon_pecho', series: 4, reps: '12-15', descanso: 75 },
            { exerciseId: 'pullover_mancuerna', series: 4, reps: '12-15', descanso: 75 }
        ]
    },
    {
        id: 'strongman',
        nombre: 'Strongman Training',
        descripcion: 'Entrenamiento de hombre fuerte',
        objetivo: 'fuerza',
        nivel: 'avanzado',
        diasSemana: 4,
        duracionEstimada: 90,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#78350f',
        icono: '🏋️',
        ejercicios: [
            { exerciseId: 'peso_muerto', series: 5, reps: '3-5', descanso: 300 },
            { exerciseId: 'farmers_walk', series: 4, reps: '50m', descanso: 180 },
            { exerciseId: 'sled_push', series: 5, reps: '30m', descanso: 120 },
            { exerciseId: 'sled_pull', series: 5, reps: '30m', descanso: 120 },
            { exerciseId: 'log_press', series: 4, reps: '5-6', descanso: 240 },
            { exerciseId: 'atlas_stones', series: 3, reps: '3-5', descanso: 240 },
            { exerciseId: 'tire_flip', series: 4, reps: '8-10', descanso: 180 }
        ]
    },
    {
        id: 'funcional-crosstraining',
        nombre: 'Entrenamiento Funcional',
        descripcion: 'Movimientos funcionales variados de alta intensidad',
        objetivo: 'resistencia',
        nivel: 'avanzado',
        diasSemana: 5,
        duracionEstimada: 60,
        gruposMusculares: ['fullbody'],
        autor: 'DataGym Team',
        popular: false,
        likes: 0,
        color: '#059669',
        icono: '⚡',
        ejercicios: [
            { exerciseId: 'clean_and_press', series: 5, reps: '10', descanso: 60 },
            { exerciseId: 'burpees', series: 5, reps: '20', descanso: 45 },
            { exerciseId: 'box_jumps', series: 5, reps: '15', descanso: 60 },
            { exerciseId: 'kettlebell_swing', series: 5, reps: '25', descanso: 45 },
            { exerciseId: 'battle_ropes', series: 5, reps: '45s', descanso: 30 },
            { exerciseId: 'assault_bike', series: 5, reps: '15 cal', descanso: 60 },
            { exerciseId: 'rope_climb', series: 3, reps: '3-5', descanso: 120 }
        ]
    },
    {
        id: 'bodybuilding-clasico',
        nombre: 'Bodybuilding Clásico',
        descripcion: 'Rutina split de culturismo 5 días',
        objetivo: 'hipertrofia',
        nivel: 'avanzado',
        diasSemana: 5,
        duracionEstimada: 80,
        gruposMusculares: ['pecho', 'espalda', 'piernas', 'hombros', 'brazos'],
        autor: 'DataGym Team',
        popular: true,
        likes: 0,
        color: '#ea580c',
        icono: '🏆',
        ejercicios: [
            // Lunes: Pecho
            { exerciseId: 'press_banca', series: 4, reps: '8-12', descanso: 120, notas: 'Lunes' },
            { exerciseId: 'press_inclinado', series: 4, reps: '10-12', descanso: 90 },
            { exerciseId: 'aperturas_mancuerna', series: 3, reps: '12-15', descanso: 75 },
            { exerciseId: 'fondos_pecho', series: 3, reps: '12-15', descanso: 75 },
            // Martes: Espalda
            { exerciseId: 'dominadas', series: 4, reps: '8-12', descanso: 120, notas: 'Martes' },
            { exerciseId: 'remo_barra', series: 4, reps: '8-10', descanso: 120 },
            { exerciseId: 'peso_muerto', series: 3, reps: '8-10', descanso: 180 },
            { exerciseId: 'jalon_pecho', series: 3, reps: '12-15', descanso: 90 },
            // Miércoles: Piernas
            { exerciseId: 'sentadilla', series: 4, reps: '8-12', descanso: 180, notas: 'Miércoles' },
            { exerciseId: 'prensa_pierna', series: 4, reps: '12-15', descanso: 120 },
            { exerciseId: 'peso_muerto_rumano', series: 3, reps: '10-12', descanso: 120 },
            { exerciseId: 'extension_cuadriceps', series: 3, reps: '15-20', descanso: 75 },
            // Jueves: Hombros
            { exerciseId: 'press_militar', series: 4, reps: '8-10', descanso: 120, notas: 'Jueves' },
            { exerciseId: 'elevaciones_laterales', series: 4, reps: '12-15', descanso: 60 },
            { exerciseId: 'face_pulls', series: 4, reps: '15-20', descanso: 60 },
            // Viernes: Brazos
            { exerciseId: 'curl_barra', series: 4, reps: '10-12', descanso: 75, notas: 'Viernes' },
            { exerciseId: 'press_cerrado_barra', series: 4, reps: '10-12', descanso: 75 },
            { exerciseId: 'curl_martillo', series: 3, reps: '12-15', descanso: 60 },
            { exerciseId: 'extension_triceps_polea', series: 3, reps: '12-15', descanso: 60 }
        ]
    }
];

// ================================================
// FUNCIONES AUXILIARES
// ================================================

/**
 * Obtener rutina pública por ID
 */
export function obtenerRutinaPublica(rutinaId) {
    return RUTINAS_PUBLICAS.find(r => r.id === rutinaId);
}

/**
 * Filtrar rutinas públicas
 */
export function filtrarRutinasPublicas(filtros = {}) {
    let rutinas = [...RUTINAS_PUBLICAS];
    
    if (filtros.nivel) {
        rutinas = rutinas.filter(r => r.nivel === filtros.nivel);
    }
    
    if (filtros.objetivo) {
        rutinas = rutinas.filter(r => r.objetivo === filtros.objetivo);
    }
    
    if (filtros.diasSemana) {
        rutinas = rutinas.filter(r => r.diasSemana === filtros.diasSemana);
    }
    
    if (filtros.grupoMuscular) {
        rutinas = rutinas.filter(r => 
            r.gruposMusculares.includes(filtros.grupoMuscular)
        );
    }
    
    if (filtros.popular) {
        rutinas = rutinas.filter(r => r.popular);
    }
    
    if (filtros.busqueda) {
        const termino = filtros.busqueda.toLowerCase();
        rutinas = rutinas.filter(r =>
            r.nombre.toLowerCase().includes(termino) ||
            r.descripcion.toLowerCase().includes(termino)
        );
    }
    
    return rutinas;
}

/**
 * Agrupar rutinas por nivel
 */
export function agruparRutinasPorNivel() {
    const grupos = {
        principiante: [],
        intermedio: [],
        avanzado: []
    };
    
    RUTINAS_PUBLICAS.forEach(rutina => {
        grupos[rutina.nivel].push(rutina);
    });
    
    return grupos;
}

/**
 * Obtener rutinas populares
 */
export function obtenerRutinasPopulares(limite = 6) {
    return RUTINAS_PUBLICAS
        .filter(r => r.popular)
        .slice(0, limite);
}

/**
 * Obtener rutinas recomendadas según perfil
 */
export function obtenerRutinasRecomendadas(perfil) {
    const { nivel = 'principiante', objetivo = 'general' } = perfil;
    
    return RUTINAS_PUBLICAS
        .filter(r => r.nivel === nivel && r.objetivo === objetivo)
        .slice(0, 3);
}
