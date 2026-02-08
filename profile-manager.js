// =========================================
// GESTOR DE PERFILES DE USUARIO
// Módulo para gestionar perfiles en Firestore
// =========================================

import { db } from './firebase-config.js';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { calcularPerfilCompleto } from './profile-calculator.js';

/**
 * Guarda el perfil completo del usuario en Firestore
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} datos - Datos del perfil
 * @returns {Promise<void>}
 */
export async function guardarPerfilCompleto(userId, datos) {
    try {
        // Calcular todos los valores derivados
        const calculosNutricionales = calcularPerfilCompleto({
            peso: datos.pesoActual,
            altura: datos.altura,
            fechaNacimiento: datos.fechaNacimiento,
            genero: datos.genero,
            nivelActividad: datos.nivelActividad,
            objetivoPrincipal: datos.objetivoPrincipal
        });
        
        // Preparar datos completos del perfil
        const perfilCompleto = {
            // Datos personales
            nombre: datos.nombre,
            email: datos.email,
            fechaNacimiento: datos.fechaNacimiento,
            edad: calculosNutricionales.edad,
            genero: datos.genero,
            
            // Datos físicos
            altura: datos.altura,
            pesoActual: datos.pesoActual,
            pesoObjetivo: datos.pesoObjetivo,
            imc: calculosNutricionales.imc,
            categoriaIMC: calculosNutricionales.categoriaIMC,
            
            // Actividad y objetivos
            nivelActividad: datos.nivelActividad,
            objetivoPrincipal: datos.objetivoPrincipal,
            objetivoSemanal: calculosNutricionales.objetivoSemanal,
            
            // Cálculos nutricionales
            tmb: calculosNutricionales.tmb,
            tdee: calculosNutricionales.tdee,
            caloriasObjetivo: calculosNutricionales.caloriasObjetivo,
            proteinasObjetivo: calculosNutricionales.proteinasObjetivo,
            
            // Preferencias
            unidadPeso: datos.unidadPeso || 'kg',
            unidadAltura: datos.unidadAltura || 'cm',
            
            // Metadata
            perfilCompleto: true,
            fechaActualizacion: serverTimestamp()
        };
        
        // Guardar en Firestore
        const perfilRef = doc(db, 'users', userId, 'profile', 'info');
        await setDoc(perfilRef, perfilCompleto, { merge: true });
        
        console.log('✅ Perfil completo guardado exitosamente');
        return perfilCompleto;
    } catch (error) {
        console.error('❌ Error al guardar perfil completo:', error);
        throw error;
    }
}

/**
 * Obtiene el perfil completo del usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} Datos del perfil o null si no existe
 */
export async function obtenerPerfilCompleto(userId) {
    try {
        const perfilRef = doc(db, 'users', userId, 'profile', 'info');
        const docSnap = await getDoc(perfilRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error('❌ Error al obtener perfil:', error);
        throw error;
    }
}

/**
 * Verifica si el usuario tiene un perfil completo
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>} true si el perfil está completo
 */
export async function tienePerfilCompleto(userId) {
    try {
        const perfil = await obtenerPerfilCompleto(userId);
        return perfil && perfil.perfilCompleto === true;
    } catch (error) {
        console.error('❌ Error al verificar perfil:', error);
        return false;
    }
}

/**
 * Actualiza datos específicos del perfil
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<void>}
 */
export async function actualizarDatosPerfil(userId, datos) {
    try {
        // Si se actualizan datos que afectan los cálculos, recalcular
        const camposQueAfectanCalculos = [
            'pesoActual', 
            'altura', 
            'fechaNacimiento', 
            'genero', 
            'nivelActividad', 
            'objetivoPrincipal'
        ];
        
        const necesitaRecalculo = camposQueAfectanCalculos.some(
            campo => datos.hasOwnProperty(campo)
        );
        
        if (necesitaRecalculo) {
            // Obtener perfil actual para completar datos faltantes
            const perfilActual = await obtenerPerfilCompleto(userId);
            
            if (!perfilActual) {
                throw new Error('No se puede actualizar: perfil no existe');
            }
            
            // Combinar datos actuales con nuevos datos
            const datosCompletos = {
                pesoActual: datos.pesoActual || perfilActual.pesoActual,
                altura: datos.altura || perfilActual.altura,
                fechaNacimiento: datos.fechaNacimiento || perfilActual.fechaNacimiento,
                genero: datos.genero || perfilActual.genero,
                nivelActividad: datos.nivelActividad || perfilActual.nivelActividad,
                objetivoPrincipal: datos.objetivoPrincipal || perfilActual.objetivoPrincipal
            };
            
            // Recalcular valores nutricionales
            const calculosNutricionales = calcularPerfilCompleto(datosCompletos);
            
            // Añadir cálculos a los datos de actualización
            datos = {
                ...datos,
                edad: calculosNutricionales.edad,
                imc: calculosNutricionales.imc,
                categoriaIMC: calculosNutricionales.categoriaIMC,
                tmb: calculosNutricionales.tmb,
                tdee: calculosNutricionales.tdee,
                caloriasObjetivo: calculosNutricionales.caloriasObjetivo,
                proteinasObjetivo: calculosNutricionales.proteinasObjetivo,
                objetivoSemanal: calculosNutricionales.objetivoSemanal
            };
        }
        
        // Actualizar en Firestore
        const perfilRef = doc(db, 'users', userId, 'profile', 'info');
        await updateDoc(perfilRef, {
            ...datos,
            fechaActualizacion: serverTimestamp()
        });
        
        console.log('✅ Perfil actualizado exitosamente');
    } catch (error) {
        console.error('❌ Error al actualizar perfil:', error);
        throw error;
    }
}

/**
 * Crea un perfil inicial básico (para nuevos usuarios)
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} datosAuth - Datos de autenticación (email, nombre, foto)
 * @returns {Promise<void>}
 */
export async function crearPerfilInicial(userId, datosAuth) {
    try {
        const perfilRef = doc(db, 'users', userId, 'profile', 'info');
        await setDoc(perfilRef, {
            nombre: datosAuth.displayName || datosAuth.email.split('@')[0],
            email: datosAuth.email,
            fotoURL: datosAuth.photoURL || '',
            perfilCompleto: false,
            fechaRegistro: serverTimestamp()
        });
        
        console.log('✅ Perfil inicial creado');
    } catch (error) {
        console.error('❌ Error al crear perfil inicial:', error);
        throw error;
    }
}

/**
 * Obtiene un resumen del progreso hacia el objetivo de peso
 * 
 * @param {Object} perfil - Datos del perfil
 * @returns {Object} Información del progreso
 */
export function obtenerProgresoObjetivoPeso(perfil) {
    if (!perfil || !perfil.pesoActual || !perfil.pesoObjetivo) {
        return null;
    }
    
    const pesoActual = perfil.pesoActual;
    const pesoObjetivo = perfil.pesoObjetivo;
    const diferencia = pesoActual - pesoObjetivo;
    const objetivoSemanal = perfil.objetivoSemanal || 0;
    
    // Calcular semanas estimadas para alcanzar el objetivo
    let semanasEstimadas = 0;
    if (objetivoSemanal !== 0) {
        semanasEstimadas = Math.abs(diferencia / objetivoSemanal);
    }
    
    return {
        pesoActual,
        pesoObjetivo,
        diferencia: Math.abs(diferencia),
        direccion: diferencia > 0 ? 'perder' : diferencia < 0 ? 'ganar' : 'mantener',
        semanasEstimadas: Math.ceil(semanasEstimadas),
        objetivoSemanal
    };
}

/**
 * Obtiene estadísticas diarias personalizadas
 * 
 * @param {Object} perfil - Datos del perfil
 * @returns {Object} Objetivos diarios
 */
export function obtenerObjetivosDiarios(perfil) {
    if (!perfil || !perfil.perfilCompleto) {
        return {
            calorias: 2000,
            proteinas: 150
        };
    }
    
    return {
        calorias: perfil.caloriasObjetivo,
        proteinas: perfil.proteinasObjetivo
    };
}
