// ================================================
// WEIGHT MANAGER - Gestión optimizada de peso corporal
// ================================================
// Sistema con caché inteligente para minimizar lecturas de Firestore

import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// ================================================
// CONFIGURACIÓN
// ================================================

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos para perfil
const WEIGHT_HISTORY_DAYS = 90; // Traer últimos 90 días

// ================================================
// OBTENER/CREAR PERFIL DE USUARIO
// ================================================

/**
 * Obtiene el perfil del usuario (con caché)
 * Incluye: altura, peso inicial, objetivo, configuración
 */
export async function getUserProfile(userId, forceRefresh = false) {
    try {
        // Verificar caché
        if (!forceRefresh) {
            const cached = localStorage.getItem(`profile_${userId}`);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_TTL) {
                    console.log('✅ Perfil cargado desde caché');
                    return data;
                }
            }
        }

        console.log('🔄 Cargando perfil desde Firestore...');
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const profile = docSnap.data();
            
            // Guardar en caché
            localStorage.setItem(`profile_${userId}`, JSON.stringify({
                data: profile,
                timestamp: Date.now()
            }));

            return profile;
        } else {
            // Usuario sin perfil, retornar estructura vacía
            return {
                weightProfile: {
                    height: null,
                    initialWeight: null,
                    goalWeight: null,
                    goalType: null, // 'lose' | 'gain' | 'maintain'
                    startDate: null
                }
            };
        }
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return null;
    }
}

/**
 * Guarda o actualiza el perfil de peso del usuario
 */
export async function saveWeightProfile(userId, profileData) {
    try {
        console.log('💾 Guardando perfil de peso...');
        
        const userRef = doc(db, 'users', userId);
        const now = Date.now();

        await setDoc(userRef, {
            weightProfile: {
                ...profileData,
                startDate: profileData.startDate || now,
                updatedAt: now
            }
        }, { merge: true });

        // Invalidar caché
        localStorage.removeItem(`profile_${userId}`);

        console.log('✅ Perfil guardado');
        return true;
    } catch (error) {
        console.error('Error al guardar perfil:', error);
        return false;
    }
}

// ================================================
// REGISTRO DE PESO
// ================================================

/**
 * Registra el peso del usuario para hoy
 * Solo permite 1 registro por día
 */
export async function recordWeight(userId, weight) {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        console.log(`💾 Registrando peso: ${weight}kg para ${today}`);

        // Guardar en subcollection weights
        const weightRef = doc(db, 'users', userId, 'weights', today);
        await setDoc(weightRef, {
            weight: parseFloat(weight),
            date: today,
            timestamp: Date.now(),
            recordedAt: new Date().toISOString()
        });

        // Actualizar último peso en perfil principal
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            'weightProfile.lastWeight': parseFloat(weight),
            'weightProfile.lastWeightDate': today,
            'weightProfile.lastWeightTimestamp': Date.now()
        });

        // Invalidar cachés
        localStorage.removeItem(`weights_${userId}`);
        localStorage.removeItem(`profile_${userId}`);
        localStorage.removeItem(`todayWeight_${userId}_${today}`);

        console.log('✅ Peso registrado exitosamente');
        return { success: true, date: today };
    } catch (error) {
        console.error('Error al registrar peso:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verifica si ya registró peso hoy
 */
export async function hasWeightToday(userId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Verificar caché primero
        const cacheKey = `todayWeight_${userId}_${today}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Consultar Firestore
        const weightRef = doc(db, 'users', userId, 'weights', today);
        const weightSnap = await getDoc(weightRef);

        const hasWeight = weightSnap.exists();
        
        // Guardar en caché (válido hasta medianoche)
        const midnightToday = new Date();
        midnightToday.setHours(23, 59, 59, 999);
        const ttl = midnightToday.getTime() - Date.now();
        
        setTimeout(() => {
            localStorage.removeItem(cacheKey);
        }, ttl);

        localStorage.setItem(cacheKey, JSON.stringify(hasWeight));

        return hasWeight;
    } catch (error) {
        console.error('Error al verificar peso de hoy:', error);
        return false;
    }
}

// ================================================
// HISTORIAL DE PESO
// ================================================

/**
 * Obtiene el historial de peso (últimos 90 días)
 * Usa caché agresivo para minimizar lecturas
 */
export async function getWeightHistory(userId, days = WEIGHT_HISTORY_DAYS, forceRefresh = false) {
    try {
        // Verificar caché
        if (!forceRefresh) {
            const cached = localStorage.getItem(`weights_${userId}`);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_TTL) {
                    console.log('✅ Historial cargado desde caché');
                    return data;
                }
            }
        }

        console.log('🔄 Cargando historial desde Firestore...');

        // Calcular fecha de inicio
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        // Query optimizada: ordenar por fecha desc, limitar a 'days' registros
        const weightsRef = collection(db, 'users', userId, 'weights');
        const q = query(
            weightsRef,
            where('date', '>=', startDateStr),
            orderBy('date', 'desc'),
            limit(days)
        );

        const snapshot = await getDocs(q);
        const weights = [];

        snapshot.forEach(doc => {
            weights.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Ordenar ascendente para gráficos
        weights.sort((a, b) => a.date.localeCompare(b.date));

        // Guardar en caché
        localStorage.setItem(`weights_${userId}`, JSON.stringify({
            data: weights,
            timestamp: Date.now()
        }));

        console.log(`✅ ${weights.length} registros de peso cargados`);
        return weights;
    } catch (error) {
        console.error('Error al obtener historial:', error);
        return [];
    }
}

// ================================================
// ESTADÍSTICAS Y CÁLCULOS
// ================================================

/**
 * Calcula estadísticas del progreso
 */
export function calculateStats(weights, profile) {
    if (!weights || weights.length === 0) {
        return null;
    }

    const currentWeight = weights[weights.length - 1].weight;
    const initialWeight = profile?.weightProfile?.initialWeight || weights[0].weight;
    const goalWeight = profile?.weightProfile?.goalWeight;

    // Stats básicas
    const allWeights = weights.map(w => w.weight);
    const minWeight = Math.min(...allWeights);
    const maxWeight = Math.max(...allWeights);
    const avgWeight = allWeights.reduce((a, b) => a + b, 0) / allWeights.length;

    // Progreso
    const totalChange = currentWeight - initialWeight;
    const progressPercent = goalWeight 
        ? ((initialWeight - currentWeight) / (initialWeight - goalWeight)) * 100 
        : 0;

    // Tendencia (últimos 7 días)
    const last7Days = weights.slice(-7);
    let trend = 0;
    if (last7Days.length >= 2) {
        const firstWeight = last7Days[0].weight;
        const lastWeight = last7Days[last7Days.length - 1].weight;
        trend = lastWeight - firstWeight;
    }

    // Tendencia semanal
    const weeklyRate = trend / (last7Days.length / 7);

    return {
        current: currentWeight,
        initial: initialWeight,
        goal: goalWeight,
        min: minWeight,
        max: maxWeight,
        average: Math.round(avgWeight * 10) / 10,
        totalChange: Math.round(totalChange * 10) / 10,
        progressPercent: Math.round(progressPercent),
        trend: Math.round(trend * 10) / 10,
        weeklyRate: Math.round(weeklyRate * 10) / 10,
        daysTracking: weights.length
    };
}

/**
 * Calcula IMC (Índice de Masa Corporal)
 */
export function calculateBMI(weight, heightCm) {
    if (!weight || !heightCm) return null;
    
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
        category = 'Bajo peso';
        color = '#fbbf24';
    } else if (bmi < 25) {
        category = 'Saludable';
        color = '#10b981';
    } else if (bmi < 30) {
        category = 'Sobrepeso';
        color = '#f59e0b';
    } else {
        category = 'Obesidad';
        color = '#ef4444';
    }

    return {
        value: Math.round(bmi * 10) / 10,
        category,
        color
    };
}

/**
 * Calcula el streak de pesaje
 */
export function calculateWeightStreak(weights) {
    if (!weights || weights.length === 0) return 0;

    // Ordenar por fecha descendente
    const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));
    
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date(today);

    for (const weight of sorted) {
        const weightDate = new Date(weight.date);
        const diffDays = Math.floor((currentDate - weightDate) / (1000 * 60 * 60 * 24));

        if (diffDays === streak) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (diffDays > streak) {
            break;
        }
    }

    return streak;
}

// ================================================
// NOTIFICACIONES IN-APP
// ================================================

/**
 * Verifica y muestra notificaciones según el contexto
 */
export function checkNotifications(userId, weights, profile) {
    const notifications = [];

    if (!weights || weights.length === 0) return notifications;

    const stats = calculateStats(weights, profile);
    const streak = calculateWeightStreak(weights);

    // Streak milestone
    if ([7, 14, 21, 30, 60, 90].includes(streak)) {
        const messages = {
            7: '🔥 ¡7 días seguidos! Estás en racha',
            14: '🔥🔥 ¡2 semanas consecutivas! Sos imparable',
            21: '🔥🔥🔥 ¡21 días! Ya formaste un hábito',
            30: '👑 ¡UN MES COMPLETO! Sos una máquina',
            60: '🏆 ¡2 MESES! Nivel legendario',
            90: '💎 ¡3 MESES! Sos un ejemplo'
        };
        notifications.push({
            type: 'streak_milestone',
            message: messages[streak],
            action: 'confetti'
        });
    }

    // Objetivo alcanzado
    if (stats.goal && stats.progressPercent >= 100) {
        notifications.push({
            type: 'goal_achieved',
            message: `🎉 ¡FELICITACIONES! Alcanzaste tu objetivo de ${stats.goal}kg`,
            action: 'confetti'
        });
    }

    // Progreso significativo (cada 2kg)
    if (Math.abs(stats.totalChange) >= 2 && Math.abs(stats.totalChange) % 2 < 0.5) {
        notifications.push({
            type: 'significant_progress',
            message: `💪 ¡${Math.abs(stats.totalChange)}kg de progreso! Vas increíble`,
            action: 'toast'
        });
    }

    return notifications;
}

// ================================================
// UTILIDADES
// ================================================

/**
 * Invalida todos los cachés de peso de un usuario
 */
export function invalidateWeightCaches(userId) {
    localStorage.removeItem(`profile_${userId}`);
    localStorage.removeItem(`weights_${userId}`);
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`todayWeight_${userId}_${today}`);
    console.log('✅ Cachés de peso invalidados');
}

/**
 * Formatea fecha para mostrar
 */
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const yesterdayOnly = yesterday.toISOString().split('T')[0];

    if (dateOnly === todayOnly) return 'Hoy';
    if (dateOnly === yesterdayOnly) return 'Ayer';

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
