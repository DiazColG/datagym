// =========================================
// FIRESTORE DATABASE MODULE
// Módulo de base de datos con Firestore
// =========================================

import { db } from './firebase-config.js';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    increment,
    serverTimestamp,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// =========================================
// EJERCICIOS
// =========================================

/**
 * Guarda un nuevo ejercicio en Firestore
 * @param {string} userId - ID del usuario
 * @param {Object} ejercicio - Datos del ejercicio
 * @returns {Promise<DocumentReference>}
 */
export async function guardarEjercicio(userId, ejercicio) {
    try {
        const ejerciciosRef = collection(db, 'users', userId, 'ejercicios');
        const docRef = await addDoc(ejerciciosRef, {
            ...ejercicio,
            fecha: Timestamp.fromDate(new Date(ejercicio.fecha)),
            timestamp: Date.now()
        });
        console.log('Ejercicio guardado con ID:', docRef.id);
        return docRef;
    } catch (error) {
        console.error('Error al guardar ejercicio:', error);
        throw error;
    }
}

/**
 * Obtiene los ejercicios de un usuario
 * @param {string} userId - ID del usuario
 * @param {number} limite - Número máximo de ejercicios a obtener
 * @returns {Promise<Array>} Array de ejercicios
 */
export async function obtenerEjercicios(userId, limite = 100) {
    try {
        const ejerciciosRef = collection(db, 'users', userId, 'ejercicios');
        const q = query(ejerciciosRef, orderBy('timestamp', 'desc'), limit(limite));
        const querySnapshot = await getDocs(q);
        
        const ejercicios = [];
        querySnapshot.forEach((doc) => {
            ejercicios.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return ejercicios;
    } catch (error) {
        console.error('Error al obtener ejercicios:', error);
        throw error;
    }
}

/**
 * Obtiene los ejercicios de una fecha específica
 * @param {string} userId - ID del usuario
 * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Promise<Array>} Array de ejercicios
 */
export async function obtenerEjerciciosPorFecha(userId, fechaISO) {
    try {
        const ejerciciosRef = collection(db, 'users', userId, 'ejercicios');
        const q = query(ejerciciosRef, where('fechaISO', '==', fechaISO));
        const querySnapshot = await getDocs(q);
        
        const ejercicios = [];
        querySnapshot.forEach((doc) => {
            ejercicios.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return ejercicios;
    } catch (error) {
        console.error('Error al obtener ejercicios por fecha:', error);
        throw error;
    }
}

/**
 * Elimina un ejercicio
 * @param {string} userId - ID del usuario
 * @param {string} ejercicioId - ID del ejercicio
 * @returns {Promise<void>}
 */
export async function eliminarEjercicio(userId, ejercicioId) {
    try {
        const ejercicioRef = doc(db, 'users', userId, 'ejercicios', ejercicioId);
        await deleteDoc(ejercicioRef);
        console.log('Ejercicio eliminado:', ejercicioId);
    } catch (error) {
        console.error('Error al eliminar ejercicio:', error);
        throw error;
    }
}

/**
 * Escucha cambios en tiempo real de los ejercicios
 * @param {string} userId - ID del usuario
 * @param {Function} callback - Función que se ejecuta cuando hay cambios
 * @returns {Function} Función para desuscribirse
 */
export function escucharEjercicios(userId, callback) {
    const ejerciciosRef = collection(db, 'users', userId, 'ejercicios');
    const q = query(ejerciciosRef, orderBy('timestamp', 'desc'), limit(100));
    
    return onSnapshot(q, (querySnapshot) => {
        const ejercicios = [];
        querySnapshot.forEach((doc) => {
            ejercicios.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(ejercicios);
    }, (error) => {
        console.error('Error en listener de ejercicios:', error);
    });
}

// =========================================
// PESO
// =========================================

/**
 * Guarda un registro de peso
 * @param {string} userId - ID del usuario
 * @param {number} peso - Peso en kg
 * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Promise<void>}
 */
export async function guardarPeso(userId, peso, fechaISO) {
    try {
        const pesoRef = doc(db, 'users', userId, 'peso', fechaISO);
        await setDoc(pesoRef, {
            valor: peso,
            fecha: Timestamp.fromDate(new Date(fechaISO)),
            unidad: 'kg'
        });
        console.log('Peso guardado:', peso, 'kg');
    } catch (error) {
        console.error('Error al guardar peso:', error);
        throw error;
    }
}

/**
 * Obtiene el historial de peso
 * @param {string} userId - ID del usuario
 * @param {number} limite - Número de registros a obtener
 * @returns {Promise<Array>} Array de registros de peso
 */
export async function obtenerHistorialPeso(userId, limite = 30) {
    try {
        const pesoRef = collection(db, 'users', userId, 'peso');
        const q = query(pesoRef, orderBy('fecha', 'desc'), limit(limite));
        const querySnapshot = await getDocs(q);
        
        const historial = [];
        querySnapshot.forEach((doc) => {
            historial.push({
                fechaISO: doc.id,
                ...doc.data()
            });
        });
        
        return historial;
    } catch (error) {
        console.error('Error al obtener historial de peso:', error);
        throw error;
    }
}

/**
 * Obtiene el peso más reciente
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} Registro de peso o null
 */
export async function obtenerPesoReciente(userId) {
    try {
        const historial = await obtenerHistorialPeso(userId, 1);
        return historial.length > 0 ? historial[0] : null;
    } catch (error) {
        console.error('Error al obtener peso reciente:', error);
        throw error;
    }
}

/**
 * Escucha cambios en tiempo real del peso
 * @param {string} userId - ID del usuario
 * @param {Function} callback - Función que se ejecuta cuando hay cambios
 * @returns {Function} Función para desuscribirse
 */
export function escucharPeso(userId, callback) {
    const pesoRef = collection(db, 'users', userId, 'peso');
    const q = query(pesoRef, orderBy('fecha', 'desc'), limit(30));
    
    return onSnapshot(q, (querySnapshot) => {
        const historial = [];
        querySnapshot.forEach((doc) => {
            historial.push({
                fechaISO: doc.id,
                ...doc.data()
            });
        });
        callback(historial);
    }, (error) => {
        console.error('Error en listener de peso:', error);
    });
}

// =========================================
// AGUA
// =========================================

/**
 * Guarda el consumo de agua del día
 * @param {string} userId - ID del usuario
 * @param {number} vasos - Número de vasos
 * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Promise<void>}
 */
export async function guardarAgua(userId, vasos, fechaISO) {
    try {
        const aguaRef = doc(db, 'users', userId, 'agua', fechaISO);
        await setDoc(aguaRef, {
            vasos: vasos,
            objetivo: 8,
            fecha: Timestamp.fromDate(new Date(fechaISO)),
            mililitros: vasos * 250
        });
        console.log('Agua guardada:', vasos, 'vasos');
    } catch (error) {
        console.error('Error al guardar agua:', error);
        throw error;
    }
}

/**
 * Incrementa el contador de vasos de agua
 * @param {string} userId - ID del usuario
 * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Promise<void>}
 */
export async function incrementarVasoAgua(userId, fechaISO) {
    try {
        const aguaRef = doc(db, 'users', userId, 'agua', fechaISO);
        
        // Verificar si existe el documento
        const docSnap = await getDoc(aguaRef);
        
        if (docSnap.exists()) {
            // Si existe, incrementar
            const vasosActuales = docSnap.data().vasos || 0;
            await setDoc(aguaRef, {
                vasos: vasosActuales + 1,
                objetivo: 8,
                fecha: Timestamp.fromDate(new Date(fechaISO)),
                mililitros: (vasosActuales + 1) * 250
            });
        } else {
            // Si no existe, crear con 1 vaso
            await guardarAgua(userId, 1, fechaISO);
        }
        
        console.log('Vaso de agua agregado');
    } catch (error) {
        console.error('Error al incrementar vaso de agua:', error);
        throw error;
    }
}

/**
 * Obtiene el consumo de agua del día
 * @param {string} userId - ID del usuario
 * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Promise<Object>} Datos del consumo de agua
 */
export async function obtenerAguaDelDia(userId, fechaISO) {
    try {
        const aguaRef = doc(db, 'users', userId, 'agua', fechaISO);
        const docSnap = await getDoc(aguaRef);
        
        if (docSnap.exists()) {
            return {
                fechaISO: docSnap.id,
                ...docSnap.data()
            };
        } else {
            return {
                fechaISO: fechaISO,
                vasos: 0,
                objetivo: 8,
                mililitros: 0
            };
        }
    } catch (error) {
        console.error('Error al obtener agua del día:', error);
        throw error;
    }
}

/**
 * Escucha cambios en tiempo real del agua del día
 * @param {string} userId - ID del usuario
 * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
 * @param {Function} callback - Función que se ejecuta cuando hay cambios
 * @returns {Function} Función para desuscribirse
 */
export function escucharAguaDelDia(userId, fechaISO, callback) {
    const aguaRef = doc(db, 'users', userId, 'agua', fechaISO);
    
    return onSnapshot(aguaRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({
                fechaISO: docSnap.id,
                ...docSnap.data()
            });
        } else {
            callback({
                fechaISO: fechaISO,
                vasos: 0,
                objetivo: 8,
                mililitros: 0
            });
        }
    }, (error) => {
        console.error('Error en listener de agua:', error);
    });
}

// =========================================
// PERFIL DE USUARIO
// =========================================

/**
 * Crea el perfil de un nuevo usuario
 * @param {string} userId - ID del usuario
 * @param {Object} datos - Datos del perfil (nombre, email, fotoURL)
 * @returns {Promise<void>}
 */
export async function crearPerfilUsuario(userId, datos) {
    try {
        const perfilRef = doc(db, 'users', userId, 'profile', 'info');
        await setDoc(perfilRef, {
            nombre: datos.nombre || datos.email,
            email: datos.email,
            fechaRegistro: serverTimestamp(),
            fotoURL: datos.fotoURL || ''
        });
        console.log('Perfil de usuario creado');
    } catch (error) {
        console.error('Error al crear perfil:', error);
        throw error;
    }
}

/**
 * Obtiene el perfil de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} Datos del perfil o null
 */
export async function obtenerPerfil(userId) {
    try {
        const perfilRef = doc(db, 'users', userId, 'profile', 'info');
        const docSnap = await getDoc(perfilRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        throw error;
    }
}

/**
 * Actualiza el perfil de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<void>}
 */
export async function actualizarPerfil(userId, datos) {
    try {
        const perfilRef = doc(db, 'users', userId, 'profile', 'info');
        await setDoc(perfilRef, datos, { merge: true });
        console.log('Perfil actualizado');
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        throw error;
    }
}
