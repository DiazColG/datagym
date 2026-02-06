// =========================================
// PROGRAMAS PÚBLICOS - TEMPLATES
// Programas predefinidos multi-semana
// =========================================

/**
 * Obtiene todos los programas públicos disponibles
 * @returns {Array} Array de programas públicos
 */
export function obtenerProgramasPublicos() {
    return PROGRAMAS_PUBLICOS;
}

/**
 * Obtiene un programa público por ID
 * @param {string} id - ID del programa
 * @returns {Object|null} Programa o null
 */
export function obtenerProgramaPublico(id) {
    return PROGRAMAS_PUBLICOS.find(p => p.id === id) || null;
}

/**
 * Filtra programas por criterios
 * @param {Object} filtros - {nivel, objetivo, duracion}
 * @returns {Array} Programas filtrados
 */
export function filtrarProgramasPublicos(filtros = {}) {
    let resultados = [...PROGRAMAS_PUBLICOS];
    
    if (filtros.nivel) {
        resultados = resultados.filter(p => p.nivelDificultad === filtros.nivel);
    }
    
    if (filtros.objetivo) {
        resultados = resultados.filter(p => p.objetivo === filtros.objetivo);
    }
    
    if (filtros.duracion) {
        if (filtros.duracion === 'corto') {
            resultados = resultados.filter(p => p.duracionSemanas <= 6);
        } else if (filtros.duracion === 'medio') {
            resultados = resultados.filter(p => p.duracionSemanas > 6 && p.duracionSemanas <= 10);
        } else if (filtros.duracion === 'largo') {
            resultados = resultados.filter(p => p.duracionSemanas > 10);
        }
    }
    
    return resultados;
}

// =========================================
// PROGRAMAS PÚBLICOS
// =========================================

const PROGRAMAS_PUBLICOS = [
    // ========== PROGRAMA 1: PPL 6 Semanas ==========
    {
        id: 'prog_ppl_6_semanas',
        nombre: 'PPL Hipertrofia 6 Semanas',
        descripcion: 'Programa Push/Pull/Legs progresivo enfocado en hipertrofia. Aumenta volumen e intensidad cada 2 semanas.',
        duracionSemanas: 6,
        nivelDificultad: 'intermedio',
        objetivo: 'hipertrofia',
        imagen: '💪',
        frecuenciaSemanal: 6, // días por semana
        semanas: [
            {
                numero: 1,
                nombre: 'Semana 1-2: Fase de Técnica',
                descripcion: 'Enfoque en forma perfecta y conexión mente-músculo. Volumen moderado.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_ppl_push_1', nombre: 'Push A - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 2, rutinaId: 'rutina_ppl_pull_1', nombre: 'Pull A - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 3, rutinaId: 'rutina_ppl_legs_1', nombre: 'Legs A - Piernas Completo', tipo: 'legs' },
                    { dia: 4, rutinaId: 'rutina_ppl_push_2', nombre: 'Push B - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 5, rutinaId: 'rutina_ppl_pull_2', nombre: 'Pull B - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 6, rutinaId: 'rutina_ppl_legs_2', nombre: 'Legs B - Piernas Completo', tipo: 'legs' },
                    { dia: 7, nombre: 'Descanso', tipo: 'descanso' }
                ]
            },
            {
                numero: 2,
                nombre: 'Semana 2: Continuación Fase Técnica',
                descripcion: 'Mantener el enfoque en técnica. Incremento leve de cargas.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_ppl_push_1', nombre: 'Push A - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 2, rutinaId: 'rutina_ppl_pull_1', nombre: 'Pull A - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 3, rutinaId: 'rutina_ppl_legs_1', nombre: 'Legs A - Piernas Completo', tipo: 'legs' },
                    { dia: 4, rutinaId: 'rutina_ppl_push_2', nombre: 'Push B - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 5, rutinaId: 'rutina_ppl_pull_2', nombre: 'Pull B - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 6, rutinaId: 'rutina_ppl_legs_2', nombre: 'Legs B - Piernas Completo', tipo: 'legs' },
                    { dia: 7, nombre: 'Descanso', tipo: 'descanso' }
                ]
            },
            {
                numero: 3,
                nombre: 'Semana 3-4: Fase de Volumen',
                descripcion: 'Aumento de volumen de entrenamiento. Más series y repeticiones.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_ppl_push_volumen', nombre: 'Push Volumen - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 2, rutinaId: 'rutina_ppl_pull_volumen', nombre: 'Pull Volumen - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 3, rutinaId: 'rutina_ppl_legs_volumen', nombre: 'Legs Volumen - Piernas Completo', tipo: 'legs' },
                    { dia: 4, rutinaId: 'rutina_ppl_push_volumen', nombre: 'Push Volumen - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 5, rutinaId: 'rutina_ppl_pull_volumen', nombre: 'Pull Volumen - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 6, rutinaId: 'rutina_ppl_legs_volumen', nombre: 'Legs Volumen - Piernas Completo', tipo: 'legs' },
                    { dia: 7, nombre: 'Descanso', tipo: 'descanso' }
                ]
            },
            {
                numero: 4,
                nombre: 'Semana 4: Continuación Fase Volumen',
                descripcion: 'Mantener alto volumen. Cargas moderadas.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_ppl_push_volumen', nombre: 'Push Volumen - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 2, rutinaId: 'rutina_ppl_pull_volumen', nombre: 'Pull Volumen - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 3, rutinaId: 'rutina_ppl_legs_volumen', nombre: 'Legs Volumen - Piernas Completo', tipo: 'legs' },
                    { dia: 4, rutinaId: 'rutina_ppl_push_volumen', nombre: 'Push Volumen - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 5, rutinaId: 'rutina_ppl_pull_volumen', nombre: 'Pull Volumen - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 6, rutinaId: 'rutina_ppl_legs_volumen', nombre: 'Legs Volumen - Piernas Completo', tipo: 'legs' },
                    { dia: 7, nombre: 'Descanso', tipo: 'descanso' }
                ]
            },
            {
                numero: 5,
                nombre: 'Semana 5-6: Fase de Intensidad',
                descripcion: 'Reducción de volumen, aumento de intensidad. Cargas pesadas.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_ppl_push_intensidad', nombre: 'Push Intensidad - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 2, rutinaId: 'rutina_ppl_pull_intensidad', nombre: 'Pull Intensidad - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 3, rutinaId: 'rutina_ppl_legs_intensidad', nombre: 'Legs Intensidad - Piernas Completo', tipo: 'legs' },
                    { dia: 4, rutinaId: 'rutina_ppl_push_intensidad', nombre: 'Push Intensidad - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 5, rutinaId: 'rutina_ppl_pull_intensidad', nombre: 'Pull Intensidad - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 6, rutinaId: 'rutina_ppl_legs_intensidad', nombre: 'Legs Intensidad - Piernas Completo', tipo: 'legs' },
                    { dia: 7, nombre: 'Descanso', tipo: 'descanso' }
                ]
            },
            {
                numero: 6,
                nombre: 'Semana 6: Peak Week',
                descripcion: 'Última semana de intensidad máxima y prueba de PR.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_ppl_push_intensidad', nombre: 'Push Intensidad - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 2, rutinaId: 'rutina_ppl_pull_intensidad', nombre: 'Pull Intensidad - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 3, rutinaId: 'rutina_ppl_legs_intensidad', nombre: 'Legs Intensidad - Piernas Completo', tipo: 'legs' },
                    { dia: 4, rutinaId: 'rutina_ppl_push_intensidad', nombre: 'Push Intensidad - Pecho/Hombros/Tríceps', tipo: 'push' },
                    { dia: 5, rutinaId: 'rutina_ppl_pull_intensidad', nombre: 'Pull Intensidad - Espalda/Bíceps', tipo: 'pull' },
                    { dia: 6, rutinaId: 'rutina_ppl_legs_intensidad', nombre: 'Legs Intensidad - Piernas Completo', tipo: 'legs' },
                    { dia: 7, nombre: 'Descanso', tipo: 'descanso' }
                ]
            }
        ]
    },
    
    // ========== PROGRAMA 2: Fuerza 5x5 - 12 Semanas ==========
    {
        id: 'prog_fuerza_5x5_12',
        nombre: 'Fuerza 5×5 - 12 Semanas',
        descripcion: 'Programa clásico de fuerza enfocado en los grandes levantamientos. Progresión lineal de 12 semanas.',
        duracionSemanas: 12,
        nivelDificultad: 'intermedio',
        objetivo: 'fuerza',
        imagen: '🏋️',
        frecuenciaSemanal: 3,
        semanas: [
            {
                numero: 1,
                nombre: 'Semana 1-4: Fase de Adaptación',
                descripcion: 'Cargas al 70-75% del 1RM. Enfoque en técnica perfecta.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_fuerza_a', nombre: 'Día A - Sentadilla/Press Banca', tipo: 'fuerza' },
                    { dia: 3, rutinaId: 'rutina_fuerza_b', nombre: 'Día B - Peso Muerto/Press Militar', tipo: 'fuerza' },
                    { dia: 5, rutinaId: 'rutina_fuerza_a', nombre: 'Día A - Sentadilla/Press Banca', tipo: 'fuerza' }
                ]
            },
            {
                numero: 5,
                nombre: 'Semana 5-8: Fase de Desarrollo',
                descripcion: 'Cargas al 75-85% del 1RM. Construcción de fuerza.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_fuerza_a_med', nombre: 'Día A - Sentadilla/Press Banca', tipo: 'fuerza' },
                    { dia: 3, rutinaId: 'rutina_fuerza_b_med', nombre: 'Día B - Peso Muerto/Press Militar', tipo: 'fuerza' },
                    { dia: 5, rutinaId: 'rutina_fuerza_a_med', nombre: 'Día A - Sentadilla/Press Banca', tipo: 'fuerza' }
                ]
            },
            {
                numero: 9,
                nombre: 'Semana 9-11: Fase Intensiva',
                descripcion: 'Cargas al 85-92% del 1RM. Fuerza máxima.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_fuerza_a_pesado', nombre: 'Día A - Sentadilla/Press Banca', tipo: 'fuerza' },
                    { dia: 3, rutinaId: 'rutina_fuerza_b_pesado', nombre: 'Día B - Peso Muerto/Press Militar', tipo: 'fuerza' },
                    { dia: 5, rutinaId: 'rutina_fuerza_a_pesado', nombre: 'Día A - Sentadilla/Press Banca', tipo: 'fuerza' }
                ]
            },
            {
                numero: 12,
                nombre: 'Semana 12: Testing Week',
                descripcion: 'Deload y prueba de 1RM. Evaluación de progreso.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_fuerza_deload', nombre: 'Deload Ligero', tipo: 'fuerza' },
                    { dia: 3, rutinaId: 'rutina_fuerza_test', nombre: 'Test de 1RM', tipo: 'fuerza' },
                    { dia: 5, nombre: 'Descanso Activo', tipo: 'recuperacion' }
                ]
            }
        ]
    },
    
    // ========== PROGRAMA 3: Híbrido 8 Semanas ==========
    {
        id: 'prog_hibrido_8',
        nombre: 'Híbrido Fuerza/Hipertrofia - 8 Semanas',
        descripcion: 'Programa que combina trabajo de fuerza y hipertrofia. Ideal para atletas intermedios-avanzados.',
        duracionSemanas: 8,
        nivelDificultad: 'avanzado',
        objetivo: 'hibrido',
        imagen: '⚡',
        frecuenciaSemanal: 5,
        semanas: [
            {
                numero: 1,
                nombre: 'Semana 1-2: Fase de Acondicionamiento',
                descripcion: 'Mezcla balanceada de fuerza (compuestos) e hipertrofia (accesorios).',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_hibrido_fuerza_superior', nombre: 'Fuerza Superior', tipo: 'fuerza' },
                    { dia: 2, rutinaId: 'rutina_hibrido_fuerza_inferior', nombre: 'Fuerza Inferior', tipo: 'fuerza' },
                    { dia: 3, nombre: 'Descanso', tipo: 'descanso' },
                    { dia: 4, rutinaId: 'rutina_hibrido_hiper_push', nombre: 'Hipertrofia Push', tipo: 'hipertrofia' },
                    { dia: 5, rutinaId: 'rutina_hibrido_hiper_pull', nombre: 'Hipertrofia Pull', tipo: 'hipertrofia' },
                    { dia: 6, rutinaId: 'rutina_hibrido_accesorios', nombre: 'Accesorios/Core', tipo: 'accesorio' }
                ]
            },
            {
                numero: 3,
                nombre: 'Semana 3-5: Fase de Intensificación',
                descripcion: 'Mayor énfasis en fuerza. Cargas pesadas en compuestos.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_hibrido_fuerza_superior_pesado', nombre: 'Fuerza Superior Pesado', tipo: 'fuerza' },
                    { dia: 2, rutinaId: 'rutina_hibrido_fuerza_inferior_pesado', nombre: 'Fuerza Inferior Pesado', tipo: 'fuerza' },
                    { dia: 3, nombre: 'Descanso', tipo: 'descanso' },
                    { dia: 4, rutinaId: 'rutina_hibrido_hiper_push_volumen', nombre: 'Hipertrofia Push Alto Volumen', tipo: 'hipertrofia' },
                    { dia: 5, rutinaId: 'rutina_hibrido_hiper_pull_volumen', nombre: 'Hipertrofia Pull Alto Volumen', tipo: 'hipertrofia' },
                    { dia: 6, rutinaId: 'rutina_hibrido_accesorios', nombre: 'Accesorios/Core', tipo: 'accesorio' }
                ]
            },
            {
                numero: 6,
                nombre: 'Semana 6-7: Fase de Volumen',
                descripcion: 'Más énfasis en hipertrofia. Alto volumen de trabajo.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_hibrido_fuerza_superior_medio', nombre: 'Fuerza Superior Moderado', tipo: 'fuerza' },
                    { dia: 2, rutinaId: 'rutina_hibrido_fuerza_inferior_medio', nombre: 'Fuerza Inferior Moderado', tipo: 'fuerza' },
                    { dia: 3, nombre: 'Descanso', tipo: 'descanso' },
                    { dia: 4, rutinaId: 'rutina_hibrido_hiper_push_volumen_max', nombre: 'Hipertrofia Push Volumen Máximo', tipo: 'hipertrofia' },
                    { dia: 5, rutinaId: 'rutina_hibrido_hiper_pull_volumen_max', nombre: 'Hipertrofia Pull Volumen Máximo', tipo: 'hipertrofia' },
                    { dia: 6, rutinaId: 'rutina_hibrido_accesorios_volumen', nombre: 'Accesorios/Core Alto Volumen', tipo: 'accesorio' }
                ]
            },
            {
                numero: 8,
                nombre: 'Semana 8: Deload & Test',
                descripcion: 'Semana de descarga y evaluación de progreso.',
                rutinas: [
                    { dia: 1, rutinaId: 'rutina_hibrido_deload_superior', nombre: 'Deload Superior', tipo: 'deload' },
                    { dia: 2, rutinaId: 'rutina_hibrido_deload_inferior', nombre: 'Deload Inferior', tipo: 'deload' },
                    { dia: 3, nombre: 'Descanso', tipo: 'descanso' },
                    { dia: 4, rutinaId: 'rutina_hibrido_test', nombre: 'Test de PRs', tipo: 'test' },
                    { dia: 5, nombre: 'Recuperación Activa', tipo: 'recuperacion' }
                ]
            }
        ]
    }
];

export default PROGRAMAS_PUBLICOS;
