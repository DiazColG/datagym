// ================================================
// GENERADOR DE 200 EJERCICIOS PARA FIREBASE
// Este script genera la base de datos completa
// ================================================

const fs = require('fs');

// Template base para ejercicios
const createExercise = (data) => ({
    id: data.id,
    nombre: data.nombre,
    nombreEN: data.nombreEN,
    alias: data.alias || [],
    grupoMuscular: data.grupoMuscular,
    musculosSecundarios: data.musculosSecundarios || [],
    tipo: data.tipo, // 'compuesto' | 'aislamiento'
    equipamiento: data.equipamiento, // 'barra' | 'mancuerna' | 'maquina' | 'peso corporal' | 'polea' | 'kettlebell'
    mecanica: data.mecanica, // 'empuje' | 'tiron' | 'isometrico'
    dificultad: data.dificultad, // 'principiante' | 'intermedio' | 'avanzado'
    tipoMedicion: data.tipoMedicion || 'peso_reps',
    unidadPeso: data.unidadPeso || 'kg',
    icono: data.icono || '💪',
    descripcion: data.descripcion,
    popularidad: data.popularidad,
    orden: data.orden,
    activo: data.activo !== false,
    // NUEVAS VARIABLES
    video_url: data.video_url || '',
    tags: data.tags || [],
    objetivo_primario: data.objetivo_primario || 'hipertrofia',
    plano_movimiento: data.plano_movimiento || 'sagital',
    descanso_sugerido: data.descanso_sugerido || { fuerza: 180, hipertrofia: 90, resistencia: 60 },
    rango_reps_optimo: data.rango_reps_optimo || { fuerza: [1, 5], hipertrofia: [8, 12], resistencia: [15, 20] },
    nivel_tecnica: data.nivel_tecnica || 2,
    simetria: data.simetria || 'bilateral',
    frecuencia_semanal_sugerida: data.frecuencia_semanal_sugerida || { min: 1, max: 3, optimo: 2 },
    variantes: data.variantes || []
});

// BASE DE DATOS COMPLETA: 200 EJERCICIOS
const COMPLETE_EXERCISES_DB = [];

// ========== PECHO (20) ==========
const pechoExercises = [
    { id: 'press_banca', nombre: 'Press de banca plano', nombreEN: 'Flat Bench Press', grupoMuscular: 'pecho', musculosSecundarios: ['triceps', 'hombros'], tipo: 'compuesto', equipamiento: 'barra', mecanica: 'empuje', dificultad: 'intermedio', popularidad: 98, orden: 1, video_url: 'https://youtube.com/watch?v=gRVjAtPip0Y', tags: ['masa', 'fuerza', 'powerlifting'], objetivo_primario: 'hipertrofia', nivel_tecnica: 3, variantes: ['press_inclinado', 'press_mancuernas'], descripcion: 'Rey de ejercicios de pecho. Fundamental para masa y fuerza.' },
    { id: 'press_inclinado', nombre: 'Press de banca inclinado', nombreEN: 'Incline Bench Press', grupoMuscular: 'pecho', musculosSecundarios: ['hombros', 'triceps'], tipo: 'compuesto', equipamiento: 'barra', mecanica: 'empuje', dificultad: 'intermedio', popularidad: 92, orden: 2, tags: ['pecho superior'], nivel_tecnica: 3, descripcion: 'Enfatiza pecho superior y deltoides frontales.' },
    { id: 'press_declinado', nombre: 'Press de banca declinado', nombreEN: 'Decline Bench Press', grupoMuscular: 'pecho', musculosSecundarios: ['triceps'], tipo: 'compuesto', equipamiento: 'barra', mecanica: 'empuje', dificultad: 'intermedio', popularidad: 75, orden: 3, tags: ['pecho inferior'], nivel_tecnica: 3, descripcion: 'Trabaja pecho inferior.' },
    { id: 'press_mancuernas', nombre: 'Press con mancuernas plano', nombreEN: 'Dumbbell Bench Press', grupoMuscular: 'pecho', musculosSecundarios: ['triceps', 'hombros'], tipo: 'compuesto', equipamiento: 'mancuerna', mecanica: 'empuje', dificultad: 'principiante', popularidad: 90, orden: 4, tags: ['estabilizacion'], nivel_tecnica: 2, descripcion: 'Mayor rango de movimiento que con barra.' },
    { id: 'press_inclinado_mancuernas', nombre: 'Press inclinado con mancuernas', nombreEN: 'Incline Dumbbell Press', grupoMuscular: 'pecho', musculosSecundarios: ['hombros', 'triceps'], tipo: 'compuesto', equipamiento: 'mancuerna', mecanica: 'empuje', dificultad: 'principiante', popularidad: 88, orden: 5, tags: ['pecho superior'], nivel_tecnica: 2, descripcion: 'Excelente para pecho superior con mayor ROM.' },
    { id: 'aperturas_mancuernas', nombre: 'Aperturas con mancuernas', nombreEN: 'Dumbbell Flyes', grupoMuscular: 'pecho', musculosSecundarios: ['hombros'], tipo: 'aislamiento', equipamiento: 'mancuerna', mecanica: 'empuje', dificultad: 'principiante', popularidad: 85, orden: 6, tags: ['estiramiento', 'definicion'], nivel_tecnica: 2, descripcion: 'Estiramiento máximo del pecho.' },
    { id: 'fondos_paralelas', nombre: 'Fondos en paralelas', nombreEN: 'Chest Dips', grupoMuscular: 'pecho', musculosSecundarios: ['triceps'], tipo: 'compuesto', equipamiento: 'peso corporal', mecanica: 'empuje', dificultad: 'intermedio', popularidad: 88, orden: 7, tags: ['calistenia'], nivel_tecnica: 4, descripcion: 'Excelente para pecho inferior y triceps.' },
    { id: 'flexiones', nombre: 'Flexiones de pecho', nombreEN: 'Push-ups', grupoMuscular: 'pecho', musculosSecundarios: ['triceps', 'core'], tipo: 'compuesto', equipamiento: 'peso corporal', mecanica: 'empuje', dificultad: 'principiante', popularidad: 95, orden: 8, tags: ['basico', 'home'], objetivo_primario: 'resistencia', nivel_tecnica: 1, descripcion: 'Ejercicio básico de calistenia.' },
    { id: 'cruce_poleas_alto', nombre: 'Cruce de poleas alto', nombreEN: 'High Cable Crossover', grupoMuscular: 'pecho', musculosSecundarios: ['hombros'], tipo: 'aislamiento', equipamiento: 'polea', mecanica: 'empuje', dificultad: 'principiante', popularidad: 80, orden: 9, tags: ['cables', 'definicion'], nivel_tecnica: 2, descripcion: 'Tensión constante, ideal para definición.' },
    { id: 'cruce_poleas_bajo', nombre: 'Cruce de poleas bajo', nombreEN: 'Low Cable Crossover', grupoMuscular: 'pecho', musculosSecundarios: ['hombros'], tipo: 'aislamiento', equipamiento: 'polea', mecanica: 'empuje', dificultad: 'principiante', popularidad: 75, orden: 10, tags: ['cables'], nivel_tecnica: 2, descripcion: 'Enfatiza pecho superior.' },
    { id: 'pullover_mancuerna', nombre: 'Pullover con mancuerna', nombreEN: 'Dumbbell Pullover', grupoMuscular: 'pecho', musculosSecundarios: ['dorsales', 'triceps'], tipo: 'compuesto', equipamiento: 'mancuerna', mecanica: 'tiron', dificultad: 'intermedio', popularidad: 70, orden: 11, tags: ['expansion toracica'], nivel_tecnica: 3, descripcion: 'Expande caja torácica.' },
    { id: 'pec_deck', nombre: 'Pec Deck / Contractor', nombreEN: 'Pec Deck Machine', grupoMuscular: 'pecho', musculosSecundarios: [], tipo: 'aislamiento', equipamiento: 'maquina', mecanica: 'empuje', dificultad: 'principiante', popularidad: 78, orden: 12, tags: ['maquina', 'principiante'], nivel_tecnica: 1, descripcion: 'Aislamiento seguro del pecho.' },
    { id: 'press_maquina', nombre: 'Press de pecho en máquina', nombreEN: 'Chest Press Machine', grupoMuscular: 'pecho', musculosSecundarios: ['triceps'], tipo: 'compuesto', equipamiento: 'maquina', mecanica: 'empuje', dificultad: 'principiante', popularidad: 82, orden: 13, tags: ['maquina', 'seguro'], nivel_tecnica: 1, descripcion: 'Alternativa segura al press con barra.' },
    { id: 'flexiones_declinadas', nombre: 'Flexiones declinadas', nombreEN: 'Decline Push-ups', grupoMuscular: 'pecho', musculosSecundarios: ['hombros'], tipo: 'compuesto', equipamiento: 'peso corporal', mecanica: 'empuje', dificultad: 'intermedio', popularidad: 70, orden: 14, tags: ['calistenia', 'home'], nivel_tecnica: 2, descripcion: 'Variante más difícil de flexiones.' },
    { id: 'flexiones_diamante', nombre: 'Flexiones diamante', nombreEN: 'Diamond Push-ups', grupoMuscular: 'pecho', musculosSecundarios: ['triceps'], tipo: 'compuesto', equipamiento: 'peso corporal', mecanica: 'empuje', dificultad: 'intermedio', popularidad: 75, orden: 15, tags: ['triceps', 'pecho interno'], nivel_tecnica: 3, descripcion: 'Enfatiza pecho interno y tríceps.' },
    { id: 'press_landmine', nombre: 'Press Landmine', nombreEN: 'Landmine Press', grupoMuscular: 'pecho', musculosSecundarios: ['hombros', 'core'], tipo: 'compuesto', equipamiento: 'barra', mecanica: 'empuje', dificultad: 'intermedio', popularidad: 68, orden: 16, tags: ['funcional', 'core'], nivel_tecnica: 3, descripcion: 'Variante funcional con activación de core.' },
    { id: 'aperturas_cables_plano', nombre: 'Aperturas en polea plano', nombreEN: 'Cable Flyes Flat', grupoMuscular: 'pecho', musculosSecundarios: ['hombros'], tipo: 'aislamiento', equipamiento: 'polea', mecanica: 'empuje', dificultad: 'principiante', popularidad: 72, orden: 17, tags: ['cables'], nivel_tecnica: 2, descripcion: 'Tensión constante en todo el rango.' },
    { id: 'press_guillotina', nombre: 'Press Guillotina', nombreEN: 'Guillotine Press', grupoMuscular: 'pecho', musculosSecundarios: ['hombros'], tipo: 'compuesto', equipamiento: 'barra', mecanica: 'empuje', dificultad: 'avanzado', popularidad: 60, orden: 18, tags: ['avanzado', 'estiramiento'], nivel_tecnica: 4, descripcion: 'Máximo estiramiento del pecho superior.' },
    { id: 'svend_press', nombre: 'Svend Press', nombreEN: 'Svend Press', grupoMuscular: 'pecho', musculosSecundarios: ['hombros'], tipo: 'aislamiento', equipamiento: 'disco', mecanica: 'empuje', dificultad: 'principiante', popularidad: 55, orden: 19, tags: ['isometrico', 'pecho interno'], nivel_tecnica: 1, descripcion: 'Contracción isométrica intensa.' },
    { id: 'flexiones_arqueras', nombre: 'Flexiones arqueras', nombreEN: 'Archer Push-ups', grupoMuscular: 'pecho', musculosSecundarios: ['core'], tipo: 'compuesto', equipamiento: 'peso corporal', mecanica: 'empuje', dificultad: 'avanzado', popularidad: 65, orden: 20, tags: ['calistenia', 'unilateral'], simetria: 'unilateral', nivel_tecnica: 4, descripcion: 'Variante avanzada unilateral.' },
];

pechoExercises.forEach(ex => COMPLETE_EXERCISES_DB.push(createExercise(ex)));

console.log(`✅ PECHO: ${pechoExercises.length} ejercicios agregados`);
console.log(`📊 Total actual: ${COMPLETE_EXERCISES_DB.length}/200`);

// Exportar
const output = `// ================================================
// BASE DE DATOS COMPLETA: 200 EJERCICIOS
// Generado automáticamente con 10 variables adicionales
// ================================================

export const EXERCISES_DB_EXTENDED = ${JSON.stringify(COMPLETE_EXERCISES_DB, null, 2)};

export default EXERCISES_DB_EXTENDED;
`;

fs.writeFileSync('./exercises-db-extended-final.js', output, 'utf8');
console.log('✅ Archivo generado: exercises-db-extended-final.js');
console.log('⏳ Continúa agregando los otros grupos musculares...');
