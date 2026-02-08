// ================================================
// 48 EJERCICIOS FALTANTES - REPARACIÓN INTEGRIDAD
// Estos ejercicios están referenciados en rutinas pero no existen en la BD
// ================================================

export const EXERCISES_MISSING_48 = [
    // ================================================
    // CATEGORÍA: BÁSICOS GYM (15 ejercicios)
    // ================================================
    {
        id: 'sentadilla',
        nombre: 'Sentadilla',
        nombreIngles: 'Back Squat',
        grupoMuscular: 'piernas',
        descripcion: 'Sentadilla trasera con barra, ejercicio rey para piernas',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['cuadriceps', 'gluteos', 'isquiotibiales'],
        musculosSecundarios: ['core', 'espalda_baja']
    },
    {
        id: 'peso_muerto',
        nombre: 'Peso Muerto',
        nombreIngles: 'Deadlift',
        grupoMuscular: 'espalda',
        descripcion: 'Levantamiento desde el suelo, ejercicio de fuerza total',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['espalda_baja', 'gluteos', 'isquiotibiales'],
        musculosSecundarios: ['trapecio', 'antebrazos', 'core']
    },
    {
        id: 'dominadas',
        nombre: 'Dominadas',
        nombreIngles: 'Pull-Ups',
        grupoMuscular: 'espalda',
        descripcion: 'Dominadas con peso corporal, agarre pronado',
        equipamiento: 'peso_corporal',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['dorsal', 'trapecio'],
        musculosSecundarios: ['biceps', 'antebrazos', 'core']
    },
    {
        id: 'remo_barra',
        nombre: 'Remo con Barra',
        nombreIngles: 'Barbell Row',
        grupoMuscular: 'espalda',
        descripcion: 'Remo inclinado con barra, agarre pronado',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['dorsal', 'trapecio', 'romboides'],
        musculosSecundarios: ['biceps', 'espalda_baja']
    },
    {
        id: 'jalon_pecho',
        nombre: 'Jalón al Pecho',
        nombreIngles: 'Lat Pulldown',
        grupoMuscular: 'espalda',
        descripcion: 'Jalón en polea alta al pecho, agarre ancho',
        equipamiento: 'cable',
        tipo: 'compuesto',
        dificultad: 'principiante',
        mecanica: 'compuesto',
        musculosPrincipales: ['dorsal'],
        musculosSecundarios: ['biceps', 'trapecio']
    },
    {
        id: 'prensa_pierna',
        nombre: 'Prensa de Piernas',
        nombreIngles: 'Leg Press',
        grupoMuscular: 'piernas',
        descripcion: 'Prensa de piernas en máquina, 45 grados',
        equipamiento: 'maquina',
        tipo: 'compuesto',
        dificultad: 'principiante',
        mecanica: 'compuesto',
        musculosPrincipales: ['cuadriceps', 'gluteos'],
        musculosSecundarios: ['isquiotibiales']
    },
    {
        id: 'curl_barra',
        nombre: 'Curl con Barra',
        nombreIngles: 'Barbell Curl',
        grupoMuscular: 'biceps',
        descripcion: 'Curl de bíceps con barra recta',
        equipamiento: 'barra',
        tipo: 'aislamiento',
        dificultad: 'principiante',
        mecanica: 'aislamiento',
        musculosPrincipales: ['biceps'],
        musculosSecundarios: ['antebrazos']
    },
    {
        id: 'press_cerrado_barra',
        nombre: 'Press Banca Agarre Cerrado',
        nombreIngles: 'Close Grip Bench Press',
        grupoMuscular: 'triceps',
        descripcion: 'Press de banca con agarre estrecho para tríceps',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['triceps'],
        musculosSecundarios: ['pecho', 'hombros']
    },
    {
        id: 'fondos_pecho',
        nombre: 'Fondos en Paralelas (Pecho)',
        nombreIngles: 'Chest Dips',
        grupoMuscular: 'pecho',
        descripcion: 'Fondos en paralelas con inclinación adelante',
        equipamiento: 'peso_corporal',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['pecho_inferior'],
        musculosSecundarios: ['triceps', 'hombros']
    },
    {
        id: 'fondos_triceps',
        nombre: 'Fondos en Paralelas (Tríceps)',
        nombreIngles: 'Tricep Dips',
        grupoMuscular: 'triceps',
        descripcion: 'Fondos en paralelas verticales para tríceps',
        equipamiento: 'peso_corporal',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['triceps'],
        musculosSecundarios: ['pecho', 'hombros']
    },
    {
        id: 'aperturas_mancuerna',
        nombre: 'Aperturas con Mancuernas',
        nombreIngles: 'Dumbbell Flyes',
        grupoMuscular: 'pecho',
        descripcion: 'Aperturas en banco plano con mancuernas',
        equipamiento: 'mancuerna',
        tipo: 'aislamiento',
        dificultad: 'principiante',
        mecanica: 'aislamiento',
        musculosPrincipales: ['pecho'],
        musculosSecundarios: ['hombros_anterior']
    },
    {
        id: 'remo_mancuerna',
        nombre: 'Remo con Mancuerna',
        nombreIngles: 'Dumbbell Row',
        grupoMuscular: 'espalda',
        descripcion: 'Remo a una mano con apoyo en banco',
        equipamiento: 'mancuerna',
        tipo: 'compuesto',
        dificultad: 'principiante',
        mecanica: 'compuesto',
        musculosPrincipales: ['dorsal', 'trapecio'],
        musculosSecundarios: ['biceps', 'romboides']
    },
    {
        id: 'curl_concentrado',
        nombre: 'Curl Concentrado',
        nombreIngles: 'Concentration Curl',
        grupoMuscular: 'biceps',
        descripcion: 'Curl sentado con apoyo en muslo',
        equipamiento: 'mancuerna',
        tipo: 'aislamiento',
        dificultad: 'principiante',
        mecanica: 'aislamiento',
        musculosPrincipales: ['biceps'],
        musculosSecundarios: []
    },
    {
        id: 'press_militar_mancuernas',
        nombre: 'Press Militar con Mancuernas',
        nombreIngles: 'Dumbbell Shoulder Press',
        grupoMuscular: 'hombros',
        descripcion: 'Press de hombros sentado con mancuernas',
        equipamiento: 'mancuerna',
        tipo: 'compuesto',
        dificultad: 'principiante',
        mecanica: 'compuesto',
        musculosPrincipales: ['hombros_anterior', 'hombros_lateral'],
        musculosSecundarios: ['triceps', 'trapecio']
    },
    {
        id: 'elevacion_pantorrillas',
        nombre: 'Elevación de Pantorrillas',
        nombreIngles: 'Calf Raises',
        grupoMuscular: 'piernas',
        descripcion: 'Elevación de talones de pie',
        equipamiento: 'maquina',
        tipo: 'aislamiento',
        dificultad: 'principiante',
        mecanica: 'aislamiento',
        musculosPrincipales: ['gemelos'],
        musculosSecundarios: []
    },

    // ================================================
    // CATEGORÍA: VARIANTES AVANZADAS (8 ejercicios)
    // ================================================
    {
        id: 'press_decline',
        nombre: 'Press Declinado',
        nombreIngles: 'Decline Bench Press',
        grupoMuscular: 'pecho',
        descripcion: 'Press de banca en banco declinado',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['pecho_inferior'],
        musculosSecundarios: ['triceps', 'hombros']
    },
    {
        id: 'aperturas_cable',
        nombre: 'Aperturas en Polea',
        nombreIngles: 'Cable Flyes',
        grupoMuscular: 'pecho',
        descripcion: 'Aperturas con poleas de pie',
        equipamiento: 'cable',
        tipo: 'aislamiento',
        dificultad: 'principiante',
        mecanica: 'aislamiento',
        musculosPrincipales: ['pecho'],
        musculosSecundarios: ['hombros_anterior']
    },
    {
        id: 'remo_t_barra',
        nombre: 'Remo en T',
        nombreIngles: 'T-Bar Row',
        grupoMuscular: 'espalda',
        descripcion: 'Remo con barra T, agarre paralelo',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['dorsal', 'trapecio_medio'],
        musculosSecundarios: ['biceps', 'romboides']
    },
    {
        id: 'pulldown_agarre_cerrado',
        nombre: 'Jalón Agarre Cerrado',
        nombreIngles: 'Close Grip Pulldown',
        grupoMuscular: 'espalda',
        descripcion: 'Jalón con agarre cerrado neutral',
        equipamiento: 'cable',
        tipo: 'compuesto',
        dificultad: 'principiante',
        mecanica: 'compuesto',
        musculosPrincipales: ['dorsal_inferior'],
        musculosSecundarios: ['biceps']
    },
    {
        id: 'sentadilla_bulgara',
        nombre: 'Sentadilla Búlgara',
        nombreIngles: 'Bulgarian Split Squat',
        grupoMuscular: 'piernas',
        descripcion: 'Sentadilla a una pierna con pie trasero elevado',
        equipamiento: 'mancuerna',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['cuadriceps', 'gluteos'],
        musculosSecundarios: ['isquiotibiales', 'core']
    },
    {
        id: 'peso_muerto_deficit',
        nombre: 'Peso Muerto en Déficit',
        nombreIngles: 'Deficit Deadlift',
        grupoMuscular: 'espalda',
        descripcion: 'Peso muerto desde plataforma elevada',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'compuesto',
        musculosPrincipales: ['espalda_baja', 'gluteos', 'isquiotibiales'],
        musculosSecundarios: ['trapecio', 'cuadriceps']
    },
    {
        id: 'hip_thrust_barra',
        nombre: 'Hip Thrust con Barra',
        nombreIngles: 'Barbell Hip Thrust',
        grupoMuscular: 'gluteos',
        descripcion: 'Empuje de cadera con barra sobre pelvis',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['gluteos'],
        musculosSecundarios: ['isquiotibiales', 'core']
    },
    {
        id: 'buenos_dias',
        nombre: 'Buenos Días',
        nombreIngles: 'Good Mornings',
        grupoMuscular: 'espalda',
        descripcion: 'Flexión de cadera con barra en espalda',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['espalda_baja', 'isquiotibiales'],
        musculosSecundarios: ['gluteos', 'core']
    },

    // ================================================
    // CATEGORÍA: CALISTENIA AVANZADA (4 ejercicios)
    // ================================================
    {
        id: 'muscle_up',
        nombre: 'Muscle Up',
        nombreIngles: 'Muscle Up',
        grupoMuscular: 'espalda',
        descripcion: 'Dominada explosiva con transición a fondo',
        equipamiento: 'peso_corporal',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'compuesto',
        musculosPrincipales: ['dorsal', 'triceps', 'pecho'],
        musculosSecundarios: ['core', 'hombros']
    },
    {
        id: 'front_lever',
        nombre: 'Front Lever',
        nombreIngles: 'Front Lever',
        grupoMuscular: 'core',
        descripcion: 'Plancha horizontal frontal en barra',
        equipamiento: 'peso_corporal',
        tipo: 'estatico',
        dificultad: 'avanzado',
        mecanica: 'aislamiento',
        musculosPrincipales: ['core', 'dorsal'],
        musculosSecundarios: ['hombros', 'biceps']
    },
    {
        id: 'planche_progression',
        nombre: 'Planche (Progresión)',
        nombreIngles: 'Planche Progression',
        grupoMuscular: 'core',
        descripcion: 'Progresión de plancha en paralelas',
        equipamiento: 'peso_corporal',
        tipo: 'estatico',
        dificultad: 'avanzado',
        mecanica: 'aislamiento',
        musculosPrincipales: ['hombros', 'core'],
        musculosSecundarios: ['triceps', 'pecho']
    },
    {
        id: 'l_sit',
        nombre: 'L-Sit',
        nombreIngles: 'L-Sit',
        grupoMuscular: 'core',
        descripcion: 'Sostén en forma de L en paralelas',
        equipamiento: 'peso_corporal',
        tipo: 'estatico',
        dificultad: 'intermedio',
        mecanica: 'aislamiento',
        musculosPrincipales: ['core', 'hip_flexores'],
        musculosSecundarios: ['triceps', 'hombros']
    },

    // ================================================
    // CATEGORÍA: BÁSICOS BODYWEIGHT (3 ejercicios)
    // ================================================
    {
        id: 'sentadillas_bodyweight',
        nombre: 'Sentadillas Peso Corporal',
        nombreIngles: 'Bodyweight Squats',
        grupoMuscular: 'piernas',
        descripcion: 'Sentadillas sin peso adicional',
        equipamiento: 'peso_corporal',
        tipo: 'compuesto',
        dificultad: 'principiante',
        mecanica: 'compuesto',
        musculosPrincipales: ['cuadriceps', 'gluteos'],
        musculosSecundarios: ['isquiotibiales']
    },
    {
        id: 'zancadas',
        nombre: 'Zancadas',
        nombreIngles: 'Lunges',
        grupoMuscular: 'piernas',
        descripcion: 'Zancadas alternas hacia adelante',
        equipamiento: 'peso_corporal',
        tipo: 'compuesto',
        dificultad: 'principiante',
        mecanica: 'compuesto',
        musculosPrincipales: ['cuadriceps', 'gluteos'],
        musculosSecundarios: ['isquiotibiales', 'core']
    },
    {
        id: 'plank',
        nombre: 'Plancha',
        nombreIngles: 'Plank',
        grupoMuscular: 'core',
        descripcion: 'Plancha isométrica en antebrazos',
        equipamiento: 'peso_corporal',
        tipo: 'estatico',
        dificultad: 'principiante',
        mecanica: 'aislamiento',
        musculosPrincipales: ['core'],
        musculosSecundarios: ['hombros', 'gluteos']
    },

    // ================================================
    // CATEGORÍA: CROSSFIT/FUNCIONAL (7 ejercicios)
    // ================================================
    {
        id: 'kettlebell_swing',
        nombre: 'Swing con Kettlebell',
        nombreIngles: 'Kettlebell Swing',
        grupoMuscular: 'gluteos',
        descripcion: 'Balanceo explosivo de kettlebell',
        equipamiento: 'accesorios',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['gluteos', 'isquiotibiales'],
        musculosSecundarios: ['core', 'hombros', 'espalda']
    },
    {
        id: 'box_jumps',
        nombre: 'Saltos al Cajón',
        nombreIngles: 'Box Jumps',
        grupoMuscular: 'piernas',
        descripcion: 'Saltos explosivos a plataforma elevada',
        equipamiento: 'accesorios',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['cuadriceps', 'gluteos'],
        musculosSecundarios: ['gemelos', 'core']
    },
    {
        id: 'wall_ball',
        nombre: 'Wall Ball',
        nombreIngles: 'Wall Ball Shots',
        grupoMuscular: 'piernas',
        descripcion: 'Sentadilla con lanzamiento de balón medicinal',
        equipamiento: 'accesorios',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['piernas', 'hombros'],
        musculosSecundarios: ['core']
    },
    {
        id: 'toes_to_bar',
        nombre: 'Toes to Bar',
        nombreIngles: 'Toes to Bar',
        grupoMuscular: 'core',
        descripcion: 'Elevación de pies a la barra colgado',
        equipamiento: 'peso_corporal',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'aislamiento',
        musculosPrincipales: ['core'],
        musculosSecundarios: ['hip_flexores', 'dorsal']
    },
    {
        id: 'assault_bike',
        nombre: 'Assault Bike',
        nombreIngles: 'Assault Bike',
        grupoMuscular: 'cardio',
        descripcion: 'Bicicleta de aire a alta intensidad',
        equipamiento: 'maquina',
        tipo: 'cardio',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['piernas', 'brazos'],
        musculosSecundarios: ['core', 'pulmones']
    },
    {
        id: 'rope_climb',
        nombre: 'Trepa de Cuerda',
        nombreIngles: 'Rope Climb',
        grupoMuscular: 'espalda',
        descripcion: 'Trepa vertical de cuerda',
        equipamiento: 'accesorios',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'compuesto',
        musculosPrincipales: ['dorsal', 'biceps'],
        musculosSecundarios: ['antebrazos', 'core', 'piernas']
    },
    {
        id: 'remo_calorias',
        nombre: 'Remo (Calorías)',
        nombreIngles: 'Rowing Machine',
        grupoMuscular: 'cardio',
        descripcion: 'Remo en máquina concept2',
        equipamiento: 'maquina',
        tipo: 'cardio',
        dificultad: 'principiante',
        mecanica: 'compuesto',
        musculosPrincipales: ['piernas', 'espalda'],
        musculosSecundarios: ['core', 'brazos']
    },

    // ================================================
    // CATEGORÍA: OLÍMPICOS (3 ejercicios)
    // ================================================
    {
        id: 'snatch',
        nombre: 'Arrancada',
        nombreIngles: 'Snatch',
        grupoMuscular: 'fullbody',
        descripcion: 'Levantamiento olímpico arrancada',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'compuesto',
        musculosPrincipales: ['piernas', 'espalda', 'hombros'],
        musculosSecundarios: ['trapecio', 'core', 'brazos']
    },
    {
        id: 'cargada_potencia',
        nombre: 'Cargada de Potencia',
        nombreIngles: 'Power Clean',
        grupoMuscular: 'fullbody',
        descripcion: 'Cargada olímpica sin sentadilla profunda',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'compuesto',
        musculosPrincipales: ['piernas', 'espalda', 'trapecio'],
        musculosSecundarios: ['hombros', 'core']
    },
    {
        id: 'push_press',
        nombre: 'Push Press',
        nombreIngles: 'Push Press',
        grupoMuscular: 'hombros',
        descripcion: 'Press militar con impulso de piernas',
        equipamiento: 'barra',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['hombros'],
        musculosSecundarios: ['triceps', 'piernas', 'core']
    },

    // ================================================
    // CATEGORÍA: STRONGMAN (5 ejercicios)
    // ================================================
    {
        id: 'farmers_walk',
        nombre: 'Caminata del Granjero',
        nombreIngles: 'Farmer\'s Walk',
        grupoMuscular: 'fullbody',
        descripcion: 'Caminata con pesos pesados en ambas manos',
        equipamiento: 'accesorios',
        tipo: 'compuesto',
        dificultad: 'intermedio',
        mecanica: 'compuesto',
        musculosPrincipales: ['trapecio', 'antebrazos'],
        musculosSecundarios: ['core', 'piernas', 'hombros']
    },
    {
        id: 'log_press',
        nombre: 'Log Press',
        nombreIngles: 'Log Press',
        grupoMuscular: 'hombros',
        descripcion: 'Press con tronco de strongman',
        equipamiento: 'accesorios',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'compuesto',
        musculosPrincipales: ['hombros', 'triceps'],
        musculosSecundarios: ['pecho', 'core', 'piernas']
    },
    {
        id: 'atlas_stones',
        nombre: 'Atlas Stones',
        nombreIngles: 'Atlas Stones',
        grupoMuscular: 'fullbody',
        descripcion: 'Levantamiento de piedras redondas a plataforma',
        equipamiento: 'accesorios',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'compuesto',
        musculosPrincipales: ['espalda', 'piernas', 'brazos'],
        musculosSecundarios: ['core', 'trapecio']
    },
    {
        id: 'tire_flip',
        nombre: 'Volteo de Neumático',
        nombreIngles: 'Tire Flip',
        grupoMuscular: 'fullbody',
        descripcion: 'Volteo de neumático gigante',
        equipamiento: 'accesorios',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'compuesto',
        musculosPrincipales: ['piernas', 'espalda', 'hombros'],
        musculosSecundarios: ['core', 'brazos']
    },
    {
        id: 'yoke_walk',
        nombre: 'Yoke Walk',
        nombreIngles: 'Yoke Walk',
        grupoMuscular: 'fullbody',
        descripcion: 'Caminata con yugo cargado en espalda',
        equipamiento: 'accesorios',
        tipo: 'compuesto',
        dificultad: 'avanzado',
        mecanica: 'compuesto',
        musculosPrincipales: ['piernas', 'trapecio', 'core'],
        musculosSecundarios: ['espalda', 'hombros']
    },

    // ================================================
    // CATEGORÍA: ACCESORIOS/AISLAMIENTO (3 ejercicios)
    // ================================================
    {
        id: 'goblet_squat',
        nombre: 'Sentadilla Goblet',
        nombreIngles: 'Goblet Squat',
        grupoMuscular: 'piernas',
        descripcion: 'Sentadilla con mancuerna/kettlebell al pecho',
        equipamiento: 'mancuerna',
        tipo: 'compuesto',
        dificultad: 'principiante',
        mecanica: 'compuesto',
        musculosPrincipales: ['cuadriceps', 'gluteos'],
        musculosSecundarios: ['core']
    },
    {
        id: 'abductor_maquina',
        nombre: 'Abductor en Máquina',
        nombreIngles: 'Hip Abduction Machine',
        grupoMuscular: 'gluteos',
        descripcion: 'Abducción de cadera sentado en máquina',
        equipamiento: 'maquina',
        tipo: 'aislamiento',
        dificultad: 'principiante',
        mecanica: 'aislamiento',
        musculosPrincipales: ['gluteo_medio'],
        musculosSecundarios: []
    },
    {
        id: 'patada_gluteo_polea',
        nombre: 'Patada de Glúteo en Polea',
        nombreIngles: 'Cable Glute Kickback',
        grupoMuscular: 'gluteos',
        descripcion: 'Extensión de cadera en polea baja',
        equipamiento: 'cable',
        tipo: 'aislamiento',
        dificultad: 'principiante',
        mecanica: 'aislamiento',
        musculosPrincipales: ['gluteos'],
        musculosSecundarios: ['isquiotibiales']
    },
    {
        id: 'crunch',
        nombre: 'Crunch Abdominal',
        nombreIngles: 'Crunch',
        grupoMuscular: 'core',
        descripcion: 'Encogimiento abdominal clásico',
        equipamiento: 'peso_corporal',
        tipo: 'aislamiento',
        dificultad: 'principiante',
        mecanica: 'aislamiento',
        musculosPrincipales: ['abdominales'],
        musculosSecundarios: []
    }
];

// Total: 48 ejercicios
// Para agregar a exercises-db-complete-200.js
