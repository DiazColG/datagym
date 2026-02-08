// =========================================
// GESTOR DE RUTINAS
// CRUD completo para rutinas de usuario
// =========================================

import { db } from './firebase-config.js';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    increment
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// =========================================
// CACHÉ PARA RUTINAS PÚBLICAS
// =========================================

const CACHE_KEY_ROUTINES = 'datagym_public_routines';
const CACHE_TTL_ROUTINES = 5 * 60 * 1000; // 5 minutos

function guardarEnCache(data) {
    const cacheData = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY_ROUTINES, JSON.stringify(cacheData));
}

function obtenerDeCache() {
    try {
        const cached = localStorage.getItem(CACHE_KEY_ROUTINES);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const edad = Date.now() - timestamp;
        
        if (edad < CACHE_TTL_ROUTINES) {
            console.log(`✅ Rutinas públicas desde caché (${Math.round(edad/1000)}s)`);            return data;
        }
        
        // Caché expirado
        localStorage.removeItem(CACHE_KEY_ROUTINES);
        return null;
    } catch (error) {
        console.error('Error leyendo caché:', error);
        return null;
    }
}

export function invalidarCacheRutinasPublicas() {
    localStorage.removeItem(CACHE_KEY_ROUTINES);
    console.log('🗑️ Caché de rutinas públicas invalidado');
}

// =========================================
// CREAR RUTINA
// =========================================

/**
 * Crear una nueva rutina para el usuario
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} rutina - Datos de la rutina
 * @returns {Promise<string>} - ID de la rutina creada
 */
export async function crearRutina(userId, rutina) {
    try {
        // Generar ID único para la rutina
        const rutinaRef = doc(collection(db, 'users', userId, 'rutinas'));
        
        const nuevaRutina = {
            nombre: rutina.nombre || 'Mi Rutina',
            descripcion: rutina.descripcion || '',
            color: rutina.color || '#3b82f6',
            icono: rutina.icono || '💪',
            ejercicios: rutina.ejercicios || [],
            activa: rutina.activa !== undefined ? rutina.activa : true,
            favorita: rutina.favorita || false,
            vecesCompletada: 0,
            ultimaVez: null,
            fechaCreacion: Timestamp.now(),
            ultimaModificacion: Timestamp.now()
        };
        
        await setDoc(rutinaRef, nuevaRutina);
        
        console.log('✅ Rutina creada:', rutinaRef.id);
        return rutinaRef.id;
    } catch (error) {
        console.error('❌ Error al crear rutina:', error);
        throw error;
    }
}

// =========================================
// OBTENER RUTINAS
// =========================================

/**
 * Obtener todas las rutinas del usuario
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Array>} - Array de rutinas
 */
export async function obtenerRutinas(userId, filtros = {}) {
    try {
        const rutinasRef = collection(db, 'users', userId, 'rutinas');
        
        // Query simple sin where + orderBy para evitar error de índices
        let q = query(rutinasRef, orderBy('fechaCreacion', 'desc'));
        
        const snapshot = await getDocs(q);
        
        let rutinas = [];
        snapshot.forEach((doc) => {
            rutinas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Aplicar filtros en el cliente
        if (filtros.activa !== undefined) {
            rutinas = rutinas.filter(r => r.activa === filtros.activa);
        }
        
        if (filtros.favorita !== undefined) {
            rutinas = rutinas.filter(r => r.favorita === filtros.favorita);
        }
        
        return rutinas;
    } catch (error) {
        console.error('❌ Error al obtener rutinas:', error);
        return [];
    }
}

/**
 * Obtener una rutina específica
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @returns {Promise<Object|null>} - Datos de la rutina
 */
export async function obtenerRutina(userId, rutinaId) {
    try {
        const rutinaRef = doc(db, 'users', userId, 'rutinas', rutinaId);
        const rutinaSnap = await getDoc(rutinaRef);
        
        if (rutinaSnap.exists()) {
            return {
                id: rutinaSnap.id,
                ...rutinaSnap.data()
            };
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error al obtener rutina:', error);
        return null;
    }
}

// =========================================
// ACTUALIZAR RUTINA
// =========================================

/**
 * Actualizar una rutina existente
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
export async function actualizarRutina(userId, rutinaId, datos) {
    try {
        const rutinaRef = doc(db, 'users', userId, 'rutinas', rutinaId);
        
        const datosActualizados = {
            ...datos,
            ultimaModificacion: Timestamp.now()
        };
        
        await updateDoc(rutinaRef, datosActualizados);
        
        console.log('✅ Rutina actualizada:', rutinaId);
        return true;
    } catch (error) {
        console.error('❌ Error al actualizar rutina:', error);
        throw error;
    }
}

// =========================================
// ELIMINAR RUTINA
// =========================================

/**
 * Eliminar una rutina
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export async function eliminarRutina(userId, rutinaId) {
    try {
        const rutinaRef = doc(db, 'users', userId, 'rutinas', rutinaId);
        await deleteDoc(rutinaRef);
        
        console.log('✅ Rutina eliminada:', rutinaId);
        return true;
    } catch (error) {
        console.error('❌ Error al eliminar rutina:', error);
        throw error;
    }
}

// =========================================
// OPERACIONES ESPECIALES
// =========================================

/**
 * Incrementar contador de veces completada
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @returns {Promise<boolean>}
 */
export async function incrementarVecesCompletada(userId, rutinaId) {
    try {
        const rutinaRef = doc(db, 'users', userId, 'rutinas', rutinaId);
        
        await updateDoc(rutinaRef, {
            vecesCompletada: increment(1),
            ultimaVez: Timestamp.now()
        });
        
        console.log('✅ Contador incrementado para rutina:', rutinaId);
        return true;
    } catch (error) {
        console.error('❌ Error al incrementar contador:', error);
        return false;
    }
}

/**
 * Marcar rutina como favorita/no favorita
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @param {boolean} favorita - true para marcar como favorita
 * @returns {Promise<boolean>}
 */
export async function toggleFavorita(userId, rutinaId, favorita) {
    try {
        const rutinaRef = doc(db, 'users', userId, 'rutinas', rutinaId);
        
        await updateDoc(rutinaRef, {
            favorita,
            ultimaModificacion: Timestamp.now()
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error al cambiar favorita:', error);
        return false;
    }
}

/**
 * Activar/desactivar rutina
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @param {boolean} activa - true para activar
 * @returns {Promise<boolean>}
 */
export async function toggleActiva(userId, rutinaId, activa) {
    try {
        const rutinaRef = doc(db, 'users', userId, 'rutinas', rutinaId);
        
        await updateDoc(rutinaRef, {
            activa,
            ultimaModificacion: Timestamp.now()
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error al cambiar estado activa:', error);
        return false;
    }
}

// =========================================
// OPERACIONES CON EJERCICIOS
// =========================================

/**
 * Agregar ejercicio a una rutina
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @param {Object} ejercicio - Datos del ejercicio
 * @returns {Promise<boolean>}
 */
export async function agregarEjercicioARutina(userId, rutinaId, ejercicio) {
    try {
        const rutina = await obtenerRutina(userId, rutinaId);
        if (!rutina) throw new Error('Rutina no encontrada');
        
        const ejercicios = rutina.ejercicios || [];
        
        // Determinar orden del nuevo ejercicio
        const maxOrden = ejercicios.length > 0 
            ? Math.max(...ejercicios.map(e => e.orden || 0))
            : 0;
        
        const nuevoEjercicio = {
            exerciseId: ejercicio.exerciseId,
            orden: maxOrden + 1,
            series: ejercicio.series || 3,
            repsObjetivo: ejercicio.repsObjetivo || '8-12',
            descanso: ejercicio.descanso || 60,
            notas: ejercicio.notas || ''
        };
        
        ejercicios.push(nuevoEjercicio);
        
        await actualizarRutina(userId, rutinaId, { ejercicios });
        
        return true;
    } catch (error) {
        console.error('❌ Error al agregar ejercicio:', error);
        return false;
    }
}

/**
 * Eliminar ejercicio de una rutina
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @param {string} exerciseId - ID del ejercicio a eliminar
 * @returns {Promise<boolean>}
 */
export async function eliminarEjercicioDeRutina(userId, rutinaId, exerciseId) {
    try {
        const rutina = await obtenerRutina(userId, rutinaId);
        if (!rutina) throw new Error('Rutina no encontrada');
        
        const ejercicios = (rutina.ejercicios || []).filter(
            e => e.exerciseId !== exerciseId
        );
        
        // Reordenar ejercicios
        ejercicios.forEach((e, index) => {
            e.orden = index + 1;
        });
        
        await actualizarRutina(userId, rutinaId, { ejercicios });
        
        return true;
    } catch (error) {
        console.error('❌ Error al eliminar ejercicio:', error);
        return false;
    }
}

/**
 * Reordenar ejercicios en una rutina
 * 
 * @param {string} userId - ID del usuario
 * @param {string} rutinaId - ID de la rutina
 * @param {Array} nuevosEjercicios - Array de ejercicios en nuevo orden
 * @returns {Promise<boolean>}
 */
export async function reordenarEjercicios(userId, rutinaId, nuevosEjercicios) {
    try {
        // Actualizar orden
        const ejerciciosOrdenados = nuevosEjercicios.map((e, index) => ({
            ...e,
            orden: index + 1
        }));
        
        await actualizarRutina(userId, rutinaId, { ejercicios: ejerciciosOrdenados });
        
        return true;
    } catch (error) {
        console.error('❌ Error al reordenar ejercicios:', error);
        return false;
    }
}

// =========================================
// ESTADÍSTICAS
// =========================================

/**
 * Obtener estadísticas de rutinas del usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Estadísticas
 */
export async function obtenerEstadisticasRutinas(userId) {
    try {
        const rutinas = await obtenerRutinas(userId);
        
        const totalRutinas = rutinas.length;
        const rutinasActivas = rutinas.filter(r => r.activa).length;
        const rutinasFavoritas = rutinas.filter(r => r.favorita).length;
        
        const totalCompletadas = rutinas.reduce((sum, r) => 
            sum + (r.vecesCompletada || 0), 0
        );
        
        // Rutina más usada
        const rutinaMasUsada = rutinas.reduce((max, r) => 
            (r.vecesCompletada || 0) > (max.vecesCompletada || 0) ? r : max
        , rutinas[0] || null);
        
        return {
            totalRutinas,
            rutinasActivas,
            rutinasFavoritas,
            totalCompletadas,
            rutinaMasUsada
        };
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        return {
            totalRutinas: 0,
            rutinasActivas: 0,
            rutinasFavoritas: 0,
            totalCompletadas: 0,
            rutinaMasUsada: null
        };
    }
}

/**
 * Calcular duración estimada de una rutina (minutos)
 * 
 * @param {Object} rutina - Rutina con ejercicios
 * @returns {number} - Duración estimada en minutos
 */
export function calcularDuracionEstimada(rutina) {
    if (!rutina || !rutina.ejercicios) return 0;
    
    let duracionTotal = 0;
    
    rutina.ejercicios.forEach(ejercicio => {
        const series = ejercicio.series || 3;
        const descanso = ejercicio.descanso || 60; // segundos
        
        // Tiempo por serie: ~45 segundos de ejecución + descanso
        const tiempoPorSerie = 45 + descanso; // segundos
        const tiempoEjercicio = series * tiempoPorSerie;
        
        duracionTotal += tiempoEjercicio;
    });
    
    // Convertir a minutos y redondear
    const minutos = Math.round(duracionTotal / 60);
    
    // Agregar 5 minutos de setup inicial
    return minutos + 5;
}

// =========================================
// RUTINAS PÚBLICAS - FIRESTORE
// =========================================

/**
 * Obtener todas las rutinas públicas de Firestore con caché
 * 
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Array>} - Array de rutinas públicas
 */
export async function obtenerRutinasPublicas(filtros = {}) {
    try {
        // Intentar obtener de caché
        const cached = obtenerDeCache();
        if (cached && !filtros.forzarRecarga) {
            return aplicarFiltrosLocales(cached, filtros);
        }
        
        console.log('📥 Cargando rutinas públicas desde Firestore...');
        
        const rutinasRef = collection(db, 'rutinasPublicas');
        let q = query(rutinasRef, where('activa', '==', true), orderBy('createdAt', 'desc'));
        
        const snapshot = await getDocs(q);
        
        const rutinas = [];
        snapshot.forEach((doc) => {
            rutinas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Guardar en caché
        guardarEnCache(rutinas);
        
        console.log(`✅ ${rutinas.length} rutinas públicas cargadas`);
        
        return aplicarFiltrosLocales(rutinas, filtros);
    } catch (error) {
        console.error('❌ Error al obtener rutinas públicas:', error);
        // Intentar devolver caché aunque esté expirado
        const cached = localStorage.getItem(CACHE_KEY_ROUTINES);
        if (cached) {
            console.log('⚠️ Devolviendo caché expirado como fallback');
            return JSON.parse(cached).data || [];
        }
        return [];
    }
}

/**
 * Aplicar filtros a rutinas ya cargadas
 */
function aplicarFiltrosLocales(rutinas, filtros) {
    let resultado = [...rutinas];
    
    if (filtros.nivel && filtros.nivel !== 'todos') {
        resultado = resultado.filter(r => r.nivel === filtros.nivel);
    }
    
    if (filtros.objetivo && filtros.objetivo !== 'todos') {
        resultado = resultado.filter(r => r.objetivo === filtros.objetivo);
    }
    
    if (filtros.dias && filtros.dias !== 'todos') {
        const dias = parseInt(filtros.dias);
        resultado = resultado.filter(r => r.diasSemana === dias);
    }
    
    if (filtros.destacada) {
        resultado = resultado.filter(r => r.destacada);
    }
    
    if (filtros.busqueda) {
        const termino = filtros.busqueda.toLowerCase();
        resultado = resultado.filter(r =>
            r.nombre.toLowerCase().includes(termino) ||
            r.descripcion.toLowerCase().includes(termino)
        );
    }
    
    return resultado;
}

/**
 * Obtener una rutina pública específica
 * 
 * @param {string} rutinaId - ID de la rutina pública
 * @returns {Promise<Object|null>} - Datos de la rutina
 */
export async function obtenerRutinaPublica(rutinaId) {
    try {
        const rutinaRef = doc(db, 'rutinasPublicas', rutinaId);
        const rutinaSnap = await getDoc(rutinaRef);
        
        if (rutinaSnap.exists()) {
            return {
                id: rutinaSnap.id,
                ...rutinaSnap.data()
            };
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error al obtener rutina pública:', error);
        return null;
    }
}

/**
 * Incrementar métrica de una rutina pública
 * 
 * @param {string} rutinaId - ID de la rutina pública
 * @param {string} metrica - 'likes', 'vistas' o 'copias'
 * @returns {Promise<boolean>}
 */
export async function incrementarMetricaRutina(rutinaId, metrica) {
    try {
        const rutinaRef = doc(db, 'rutinasPublicas', rutinaId);
        
        const actualizacion = {
            [metrica]: increment(1),
            updatedAt: Timestamp.now()
        };
        
        await updateDoc(rutinaRef, actualizacion);
        
        console.log(`✅ ${metrica} incrementada para rutina ${rutinaId}`);
        
        // Invalidar caché para reflejar cambios
        invalidarCacheRutinasPublicas();
        
        return true;
    } catch (error) {
        console.error(`❌ Error al incrementar ${metrica}:`, error);
        return false;
    }
}

/**
 * Obtener rutinas más populares (por likes + copias)
 * 
 * @param {number} limite - Cantidad de rutinas a devolver
 * @returns {Promise<Array>}
 */
export async function obtenerRutinasPopulares(limite = 6) {
    try {
        const rutinas = await obtenerRutinasPublicas();
        
        // Ordenar por score = likes * 2 + copias * 3 + vistas
        return rutinas
            .map(r => ({
                ...r,
                popularityScore: (r.likes || 0) * 2 + (r.copias || 0) * 3 + (r.vistas || 0)
            }))
            .sort((a, b) => b.popularityScore - a.popularityScore)
            .slice(0, limite);
    } catch (error) {
        console.error('❌ Error al obtener rutinas populares:', error);
        return [];
    }
}

// =========================================
// COPIAR RUTINA PÚBLICA
// =========================================

/**
 * Copiar una rutina pública a la colección personal del usuario
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} rutinaPublica - Datos de la rutina pública
 * @returns {Promise<string>} - ID de la rutina copiada
 */
export async function copiarRutinaPublica(userId, rutinaPublica) {
    try {
        // Crear copia de la rutina con metadatos del usuario
        const rutinaCopia = {
            nombre: rutinaPublica.nombre,
            descripcion: rutinaPublica.descripcion,
            color: rutinaPublica.color,
            icono: rutinaPublica.icono,
            ejercicios: rutinaPublica.ejercicios,
            activa: true,
            favorita: false,
            vecesCompletada: 0,
            ultimaVez: null,
            fechaCreacion: Timestamp.now(),
            ultimaModificacion: Timestamp.now(),
            // Metadata de origen
            origen: 'publica',
            rutinaPublicaId: rutinaPublica.id,
            nivel: rutinaPublica.nivel,
            objetivo: rutinaPublica.objetivo,
            diasSemana: rutinaPublica.diasSemana,
            duracionEstimada: rutinaPublica.duracionEstimada,
            gruposMusculares: rutinaPublica.gruposMusculares
        };
        
        const rutinaId = await crearRutina(userId, rutinaCopia);
        
        // Incrementar contador de copias en la rutina pública
        if (rutinaPublica.id) {
            await incrementarMetricaRutina(rutinaPublica.id, 'copias').catch(err => {
                console.warn('⚠️ No se pudo incrementar contador de copias:', err);
            });
        }
        
        console.log('✅ Rutina pública copiada exitosamente:', rutinaId);
        return rutinaId;
        
    } catch (error) {
        console.error('❌ Error al copiar rutina pública:', error);
        throw error;
    }
}
