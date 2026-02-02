// =========================================
// AUTHENTICATION MODULE
// Módulo de autenticación con Firebase
// =========================================

import { auth } from './firebase-config.js';
import {
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// =========================================
// INICIAR SESIÓN CON GOOGLE
// =========================================
/**
 * Inicia sesión usando una cuenta de Google
 * @returns {Promise<UserCredential>} Credenciales del usuario
 */
export async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        const result = await signInWithPopup(auth, provider);
        console.log('Usuario autenticado con Google:', result.user.email);
        return result;
    } catch (error) {
        console.error('Error al iniciar sesión con Google:', error);
        throw error;
    }
}

// =========================================
// REGISTRO CON EMAIL Y PASSWORD
// =========================================
/**
 * Registra un nuevo usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<UserCredential>} Credenciales del usuario
 */
export async function signUpWithEmail(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Usuario registrado:', result.user.email);
        return result;
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        throw error;
    }
}

// =========================================
// INICIAR SESIÓN CON EMAIL Y PASSWORD
// =========================================
/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<UserCredential>} Credenciales del usuario
 */
export async function signInWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('Usuario autenticado:', result.user.email);
        return result;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
}

// =========================================
// CERRAR SESIÓN
// =========================================
/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<void>}
 */
export async function logout() {
    try {
        await signOut(auth);
        console.log('Sesión cerrada correctamente');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
    }
}

// =========================================
// LISTENER DE CAMBIOS DE AUTENTICACIÓN
// =========================================
/**
 * Escucha los cambios en el estado de autenticación
 * @param {Function} callback - Función que se ejecuta cuando cambia el estado
 * @returns {Function} Función para desuscribirse del listener
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// =========================================
// OBTENER USUARIO ACTUAL
// =========================================
/**
 * Obtiene el usuario actualmente autenticado
 * @returns {User|null} Usuario actual o null si no hay sesión
 */
export function getCurrentUser() {
    return auth.currentUser;
}

// =========================================
// VERIFICAR SI NECESITA ONBOARDING
// =========================================
/**
 * Verifica si el usuario necesita completar el onboarding
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>} true si necesita onboarding
 */
export async function necesitaOnboarding(userId) {
    try {
        // Importar dinámicamente para evitar dependencias circulares
        const { tienePerfilCompleto } = await import('./profile-manager.js');
        const perfilCompleto = await tienePerfilCompleto(userId);
        return !perfilCompleto;
    } catch (error) {
        console.error('Error al verificar onboarding:', error);
        // En caso de error, asumir que necesita onboarding
        return true;
    }
}

// =========================================
// CREAR PERFIL INICIAL AL REGISTRARSE
// =========================================
/**
 * Crea un perfil inicial cuando un usuario se registra
 * @param {User} user - Usuario de Firebase Auth
 * @returns {Promise<void>}
 */
export async function crearPerfilInicialUsuario(user) {
    try {
        // Importar dinámicamente
        const { crearPerfilInicial } = await import('./profile-manager.js');
        await crearPerfilInicial(user.uid, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL
        });
        console.log('✅ Perfil inicial creado para nuevo usuario');
    } catch (error) {
        console.error('❌ Error al crear perfil inicial:', error);
    }
}
