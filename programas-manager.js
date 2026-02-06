// =========================================
// GESTOR DE PROGRAMAS MULTI-SEMANA
// Sistema de programas de entrenamiento a largo plazo
// =========================================

import { db } from './firebase-config.js';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// =========================================
// ESTRUCTURA DE UN PROGRAMA
// =========================================

/**
 * Estructura de un programa:
 * {
 *   id: string,
 *   nombre: string,
 *   descripcion: string,
 *   duracionSemanas: number,
 *   nivelDificultad: 'principiante' | 'intermedio' | 'avanzado',
 *   objetivo: string, // 'hipertrofia', 'fuerza', 'resistencia', 'hibrido'
 *   imagen: string,
 *   semanas: [
 *     {
 *       numero: number,
 *       nombre: string,
 *       descripcion: string,
 *       rutinas: [
 *         {
 *           dia: number, // 1-7 (lunes a domingo)
 *           rutinaId: string, // ID de rutina predefinida
 *           nombre: string,
 *           descripcion: string
 *         }
 *       ]
 *     }
 *   ],
 *   fechaCreacion: Timestamp,
 *   esPublico: boolean
 * }
 */

// =========================================
// CREAR PROGRAMA DE USUARIO
// =========================================

/**
 * Crea un nuevo programa de entrenamiento para el usuario
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} programaData - Datos del programa
 * @returns {Promise<string>} - ID del programa creado
 */
export async function crearPrograma(userId, programaData) {
    try {
        const programaRef = doc(collection(db, 'users', userId, 'programas'));
        
        const programa = {
            id: programaRef.id,
            nombre: programaData.nombre,
            descripcion: programaData.descripcion || '',
            duracionSemanas: programaData.duracionSemanas,
            nivelDificultad: programaData.nivelDificultad || 'intermedio',
            objetivo: programaData.objetivo || 'hipertrofia',
            imagen: programaData.imagen || '💪',
            semanas: programaData.semanas || [],
            fechaCreacion: Timestamp.now(),
            esPublico: false,
            estado: 'no_iniciado', // 'no_iniciado', 'activo', 'completado', 'pausado'
            progreso: {
                semanaActual: 0,
                diaActual: 0,
                workoutsCompletados: 0,
                fechaInicio: null,
                fechaUltimoWorkout: null
            }
        };
        
        await setDoc(programaRef, programa);
        
        console.log('✅ Programa creado:', programaRef.id);
        return programaRef.id;
        
    } catch (error) {
        console.error('❌ Error al crear programa:', error);
        throw error;
    }
}

// =========================================
// OBTENER PROGRAMAS DEL USUARIO
// =========================================

/**
 * Obtiene todos los programas del usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Array de programas
 */
export async function obtenerProgramas(userId) {
    try {
        const q = query(
            collection(db, 'users', userId, 'programas'),
            orderBy('fechaCreacion', 'desc')
        );
        
        const snapshot = await getDocs(q);
        
        const programas = [];
        snapshot.forEach(doc => {
            programas.push(doc.data());
        });
        
        return programas;
        
    } catch (error) {
        console.error('❌ Error al obtener programas:', error);
        return [];
    }
}

// =========================================
// OBTENER PROGRAMA POR ID
// =========================================

/**
 * Obtiene un programa específico
 * 
 * @param {string} userId - ID del usuario
 * @param {string} programaId - ID del programa
 * @returns {Promise<Object|null>} - Datos del programa
 */
export async function obtenerPrograma(userId, programaId) {
    try {
        const docRef = doc(db, 'users', userId, 'programas', programaId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Error al obtener programa:', error);
        return null;
    }
}

// =========================================
// INICIAR PROGRAMA
// =========================================

/**
 * Inicia un programa de entrenamiento
 * 
 * @param {string} userId - ID del usuario
 * @param {string} programaId - ID del programa
 * @returns {Promise<boolean>} - True si se inició correctamente
 */
export async function iniciarPrograma(userId, programaId) {
    try {
        const docRef = doc(db, 'users', userId, 'programas', programaId);
        
        await updateDoc(docRef, {
            estado: 'activo',
            'progreso.semanaActual': 1,
            'progreso.diaActual': 1,
            'progreso.fechaInicio': Timestamp.now()
        });
        
        console.log('✅ Programa iniciado');
        return true;
        
    } catch (error) {
        console.error('❌ Error al iniciar programa:', error);
        return false;
    }
}

// =========================================
// ACTUALIZAR PROGRESO DEL PROGRAMA
// =========================================

/**
 * Actualiza el progreso del programa después de completar un workout
 * 
 * @param {string} userId - ID del usuario
 * @param {string} programaId - ID del programa
 * @param {number} semana - Número de semana completada
 * @param {number} dia - Día completado
 * @returns {Promise<boolean>} - True si se actualizó correctamente
 */
export async function actualizarProgresoPrograma(userId, programaId, semana, dia) {
    try {
        const docRef = doc(db, 'users', userId, 'programas', programaId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            throw new Error('Programa no encontrado');
        }
        
        const programa = docSnap.data();
        const workoutsCompletados = (programa.progreso?.workoutsCompletados || 0) + 1;
        
        // Verificar si completó todas las semanas
        const completado = semana >= programa.duracionSemanas;
        
        await updateDoc(docRef, {
            estado: completado ? 'completado' : 'activo',
            'progreso.semanaActual': semana,
            'progreso.diaActual': dia,
            'progreso.workoutsCompletados': workoutsCompletados,
            'progreso.fechaUltimoWorkout': Timestamp.now()
        });
        
        console.log('✅ Progreso actualizado');
        return true;
        
    } catch (error) {
        console.error('❌ Error al actualizar progreso:', error);
        return false;
    }
}

// =========================================
// OBTENER PROGRAMA ACTIVO
// =========================================

/**
 * Obtiene el programa actualmente activo del usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} - Programa activo o null
 */
export async function obtenerProgramaActivo(userId) {
    try {
        const q = query(
            collection(db, 'users', userId, 'programas'),
            where('estado', '==', 'activo')
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return null;
        }
        
        // Retornar el primer programa activo
        return snapshot.docs[0].data();
        
    } catch (error) {
        console.error('❌ Error al obtener programa activo:', error);
        return null;
    }
}

// =========================================
// COPIAR PROGRAMA PÚBLICO
// =========================================

/**
 * Copia un programa público a la colección del usuario
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} programaPublico - Datos del programa público
 * @returns {Promise<string>} - ID del programa creado
 */
export async function copiarProgramaPublico(userId, programaPublico) {
    try {
        const programaRef = doc(collection(db, 'users', userId, 'programas'));
        
        const programaCopia = {
            ...programaPublico,
            id: programaRef.id,
            fechaCreacion: Timestamp.now(),
            esPublico: false,
            estado: 'no_iniciado',
            programaOrigenId: programaPublico.id,
            progreso: {
                semanaActual: 0,
                diaActual: 0,
                workoutsCompletados: 0,
                fechaInicio: null,
                fechaUltimoWorkout: null
            }
        };
        
        await setDoc(programaRef, programaCopia);
        
        console.log('✅ Programa público copiado');
        return programaRef.id;
        
    } catch (error) {
        console.error('❌ Error al copiar programa público:', error);
        throw error;
    }
}

// =========================================
// PAUSAR PROGRAMA
// =========================================

/**
 * Pausa un programa activo
 * 
 * @param {string} userId - ID del usuario
 * @param {string} programaId - ID del programa
 * @returns {Promise<boolean>} - True si se pausó correctamente
 */
export async function pausarPrograma(userId, programaId) {
    try {
        const docRef = doc(db, 'users', userId, 'programas', programaId);
        
        await updateDoc(docRef, {
            estado: 'pausado'
        });
        
        console.log('✅ Programa pausado');
        return true;
        
    } catch (error) {
        console.error('❌ Error al pausar programa:', error);
        return false;
    }
}

// =========================================
// REANUDAR PROGRAMA
// =========================================

/**
 * Reanuda un programa pausado
 * 
 * @param {string} userId - ID del usuario
 * @param {string} programaId - ID del programa
 * @returns {Promise<boolean>} - True si se reanudó correctamente
 */
export async function reanudarPrograma(userId, programaId) {
    try {
        const docRef = doc(db, 'users', userId, 'programas', programaId);
        
        await updateDoc(docRef, {
            estado: 'activo'
        });
        
        console.log('✅ Programa reanudado');
        return true;
        
    } catch (error) {
        console.error('❌ Error al reanudar programa:', error);
        return false;
    }
}
