// =========================================
// EXERCISES SERVICE - ARQUITECTURA PROFESIONAL
// Híbrido: Bundle estático + Firestore + Caché inteligente
// =========================================

import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// =========================================
// CONSTANTES DE CONFIGURACIÓN
// =========================================

const CONFIG = {
    CACHE_KEY: 'datagym_exercises_cache',
    VERSION_KEY: 'datagym_exercises_version',
    TIMESTAMP_KEY: 'datagym_exercises_timestamp',
    CURRENT_VERSION: '2.0.0',
    TTL: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
    SYNC_INTERVAL: 24 * 60 * 60 * 1000, // Revisar cada 24 horas si necesita sync
};

// =========================================
// CLASE PRINCIPAL DEL SERVICIO
// =========================================

class ExercisesService {
    constructor() {
        // Caché en memoria (más rápido)
        this.memoryCache = {
            exercises: null,
            timestamp: null,
            version: null,
        };

        // Estado de sincronización
        this.syncInProgress = false;
        this.lastSyncAttempt = null;

        // Listeners para cambios
        this.listeners = [];

        console.log('🏋️ ExercisesService inicializado');
    }

    // =========================================
    // MÉTODO PRINCIPAL: OBTENER EJERCICIOS
    // =========================================

    /**
     * Obtiene los ejercicios usando estrategia de caché inteligente
     * @returns {Promise<Array>} Lista de ejercicios
     */
    async getExercises() {
        console.group('📚 ExercisesService.getExercises()');

        try {
            // NIVEL 1: Caché en memoria (instantáneo)
            if (this.memoryCache.exercises && this.isCacheValid(this.memoryCache.timestamp)) {
                console.log('✅ Usando caché en memoria (0ms)');
                console.groupEnd();
                this.scheduleSyncIfNeeded();
                return this.memoryCache.exercises;
            }

            // NIVEL 2: localStorage (muy rápido)
            const localCache = this.getLocalCache();
            if (localCache && this.isCacheValid(localCache.timestamp)) {
                console.log('✅ Usando localStorage (~5ms)');
                this.memoryCache = localCache;
                console.groupEnd();
                this.scheduleSyncIfNeeded();
                return localCache.exercises;
            }

            // NIVEL 3: Bundle estático (fallback rápido)
            console.log('⚠️ Caché expirado o inexistente');
            console.log('🔄 Intentando cargar desde Firestore...');
            
            const staticBundle = await this.loadStaticBundle();

            // Intentar Firestore en paralelo pero no bloquear
            this.fetchFromFirestoreAsync()
                .then(firestoreExercises => {
                    if (firestoreExercises && firestoreExercises.length > 0) {
                        console.log('✅ Firestore sync completado en background');
                        this.saveCache(firestoreExercises);
                        this.notifyListeners(firestoreExercises);
                    }
                })
                .catch(error => {
                    console.warn('⚠️ Firestore sync falló, usando bundle estático:', error.message);
                });

            // Retornar bundle estático inmediatamente (no esperar Firestore)
            console.log('✅ Retornando bundle estático (fallback)');
            console.groupEnd();
            return staticBundle;

        } catch (error) {
            console.error('❌ Error en getExercises:', error);
            console.groupEnd();
            
            // Último recurso: intentar bundle estático
            try {
                return await this.loadStaticBundle();
            } catch (bundleError) {
                console.error('❌ Error crítico: no se pueden cargar ejercicios');
                throw new Error('No se pudieron cargar los ejercicios desde ninguna fuente');
            }
        }
    }

    // =========================================
    // MÉTODOS DE CACHÉ
    // =========================================

    /**
     * Verifica si el caché es válido según el TTL
     */
    isCacheValid(timestamp) {
        if (!timestamp) return false;
        const age = Date.now() - timestamp;
        return age < CONFIG.TTL;
    }

    /**
     * Obtiene el caché de localStorage
     */
    getLocalCache() {
        try {
            const cached = localStorage.getItem(CONFIG.CACHE_KEY);
            const version = localStorage.getItem(CONFIG.VERSION_KEY);
            const timestamp = parseInt(localStorage.getItem(CONFIG.TIMESTAMP_KEY));

            if (!cached || !version || !timestamp) {
                return null;
            }

            // Verificar versión
            if (version !== CONFIG.CURRENT_VERSION) {
                console.log('⚠️ Versión de caché desactualizada, limpiando...');
                this.clearCache();
                return null;
            }

            return {
                exercises: JSON.parse(cached),
                timestamp,
                version,
            };
        } catch (error) {
            console.warn('⚠️ Error leyendo caché local:', error);
            return null;
        }
    }

    /**
     * Guarda ejercicios en caché (memoria + localStorage)
     */
    saveCache(exercises) {
        try {
            const timestamp = Date.now();

            // Guardar en memoria
            this.memoryCache = {
                exercises,
                timestamp,
                version: CONFIG.CURRENT_VERSION,
            };

            // Guardar en localStorage
            localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(exercises));
            localStorage.setItem(CONFIG.VERSION_KEY, CONFIG.CURRENT_VERSION);
            localStorage.setItem(CONFIG.TIMESTAMP_KEY, timestamp.toString());

            console.log(`💾 Caché guardado: ${exercises.length} ejercicios`);
        } catch (error) {
            console.warn('⚠️ Error guardando caché:', error);
        }
    }

    /**
     * Limpia el caché
     */
    clearCache() {
        this.memoryCache = { exercises: null, timestamp: null, version: null };
        localStorage.removeItem(CONFIG.CACHE_KEY);
        localStorage.removeItem(CONFIG.VERSION_KEY);
        localStorage.removeItem(CONFIG.TIMESTAMP_KEY);
        console.log('🗑️ Caché limpiado');
    }

    // =========================================
    // CARGA DESDE DIFERENTES FUENTES
    // =========================================

    /**
     * Carga el bundle estático de JavaScript
     */
    async loadStaticBundle() {
        try {
            const module = await import('./exercises-db-complete-200.js');
            const exercises = module.EXERCISES_DB_COMPLETE;
            
            if (!exercises || exercises.length === 0) {
                throw new Error('Bundle estático vacío');
            }

            console.log(`📦 Bundle estático cargado: ${exercises.length} ejercicios`);
            return exercises;
        } catch (error) {
            console.error('❌ Error cargando bundle estático:', error);
            throw error;
        }
    }

    /**
     * Obtiene ejercicios desde Firestore (async, no bloquea)
     */
    async fetchFromFirestoreAsync() {
        if (this.syncInProgress) {
            console.log('⏳ Sync ya en progreso, saltando...');
            return null;
        }

        this.syncInProgress = true;
        this.lastSyncAttempt = Date.now();

        try {
            const exercisesRef = collection(db, 'exercises');
            const q = query(exercisesRef, orderBy('orden', 'asc'));
            const snapshot = await getDocs(q);

            const exercises = [];
            snapshot.forEach(doc => {
                exercises.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            console.log(`🔥 Firestore: ${exercises.length} ejercicios obtenidos`);
            return exercises;
        } catch (error) {
            console.warn('⚠️ Error en fetchFromFirestore:', error.message);
            return null;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Fuerza un refresh desde Firestore (útil para admin)
     */
    async forceRefresh() {
        console.log('🔄 Forzando refresh desde Firestore...');
        this.clearCache();
        const exercises = await this.fetchFromFirestoreAsync();
        
        if (exercises && exercises.length > 0) {
            this.saveCache(exercises);
            this.notifyListeners(exercises);
            return exercises;
        } else {
            // Fallback al bundle
            return await this.loadStaticBundle();
        }
    }

    // =========================================
    // SINCRONIZACIÓN EN BACKGROUND
    // =========================================

    /**
     * Programa una sincronización en background si es necesario
     */
    scheduleSyncIfNeeded() {
        // No sincronizar si ya hay uno en progreso
        if (this.syncInProgress) return;

        // No sincronizar si lo intentamos hace menos de 1 hora
        if (this.lastSyncAttempt && Date.now() - this.lastSyncAttempt < 60 * 60 * 1000) {
            return;
        }

        // Verificar si el caché está cerca de expirar (últimas 24 horas)
        const cacheAge = Date.now() - (this.memoryCache.timestamp || 0);
        const shouldSync = cacheAge > CONFIG.TTL - CONFIG.SYNC_INTERVAL;

        if (shouldSync) {
            console.log('🔄 Programando sync en background...');
            setTimeout(() => this.syncInBackground(), 5000); // 5 segundos delay
        }
    }

    /**
     * Sincroniza en background sin bloquear la UI
     */
    async syncInBackground() {
        try {
            console.log('🔄 Background sync iniciado...');
            const freshExercises = await this.fetchFromFirestoreAsync();

            if (freshExercises && freshExercises.length > 0) {
                this.saveCache(freshExercises);
                this.notifyListeners(freshExercises);
                console.log('✅ Background sync completado');
            }
        } catch (error) {
            console.warn('⚠️ Background sync falló (no crítico):', error.message);
        }
    }

    // =========================================
    // MÉTODOS DE BÚSQUEDA Y FILTRADO
    // =========================================

    /**
     * Obtiene un ejercicio por su ID
     */
    async getExerciseById(id) {
        const exercises = await this.getExercises();
        return exercises.find(ex => ex.id === id);
    }

    /**
     * Busca ejercicios por nombre o alias
     */
    async searchExercises(searchTerm, filters = {}) {
        const exercises = await this.getExercises();
        const term = searchTerm.toLowerCase().trim();

        let results = exercises;

        // Filtro por texto
        if (term) {
            results = results.filter(ex => {
                const matchNombre = ex.nombre?.toLowerCase().includes(term);
                const matchAlias = ex.alias?.some(a => a.toLowerCase().includes(term));
                const matchGrupo = ex.grupoMuscular?.toLowerCase().includes(term);
                return matchNombre || matchAlias || matchGrupo;
            });
        }

        // Filtro por grupo muscular
        if (filters.grupoMuscular) {
            results = results.filter(ex => ex.grupoMuscular === filters.grupoMuscular);
        }

        // Filtro por equipamiento
        if (filters.equipamiento) {
            results = results.filter(ex => ex.equipamiento === filters.equipamiento);
        }

        // Filtro por dificultad
        if (filters.dificultad) {
            results = results.filter(ex => ex.dificultad === filters.dificultad);
        }

        return results;
    }

    /**
     * Obtiene ejercicios por grupo muscular
     */
    async getExercisesByGroup(grupoMuscular) {
        const exercises = await this.getExercises();
        return exercises.filter(ex => ex.grupoMuscular === grupoMuscular);
    }

    // =========================================
    // LISTENERS PARA CAMBIOS
    // =========================================

    /**
     * Suscribe un listener para cambios en ejercicios
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notifica a todos los listeners
     */
    notifyListeners(exercises) {
        this.listeners.forEach(callback => {
            try {
                callback(exercises);
            } catch (error) {
                console.error('Error en listener:', error);
            }
        });
    }

    // =========================================
    // ESTADÍSTICAS Y DEBUG
    // =========================================

    /**
     * Obtiene información del estado del caché
     */
    getCacheInfo() {
        const localCache = this.getLocalCache();
        const cacheAge = localCache ? Date.now() - localCache.timestamp : null;

        return {
            hasMemoryCache: !!this.memoryCache.exercises,
            hasLocalCache: !!localCache,
            cacheAge: cacheAge ? Math.floor(cacheAge / 1000 / 60) : null, // minutos
            cacheValid: localCache ? this.isCacheValid(localCache.timestamp) : false,
            exercisesCount: this.memoryCache.exercises?.length || localCache?.exercises?.length || 0,
            version: CONFIG.CURRENT_VERSION,
            ttlDays: CONFIG.TTL / (24 * 60 * 60 * 1000),
        };
    }

    /**
     * Debug: imprime información del caché
     */
    debugCacheInfo() {
        const info = this.getCacheInfo();
        console.group('🔍 Cache Debug Info');
        console.table(info);
        console.groupEnd();
    }
}

// =========================================
// INSTANCIA SINGLETON
// =========================================

export const exercisesService = new ExercisesService();

// =========================================
// EXPORTS PARA COMPATIBILIDAD
// =========================================

/**
 * Función legacy para compatibilidad con código existente
 * @deprecated Usar exercisesService.getExerciseById()
 */
export async function obtenerEjercicioPorId(id) {
    return await exercisesService.getExerciseById(id);
}

/**
 * Función legacy para compatibilidad con código existente
 * @deprecated Usar exercisesService.searchExercises()
 */
export async function buscarEjercicios(searchTerm, filters) {
    return await exercisesService.searchExercises(searchTerm, filters);
}

// =========================================
// COMANDOS DE DEBUG (consola)
// =========================================

if (typeof window !== 'undefined') {
    window.exercisesService = exercisesService;
    console.log('💡 Tip: Usa window.exercisesService para debug');
    console.log('   • exercisesService.debugCacheInfo()');
    console.log('   • exercisesService.forceRefresh()');
    console.log('   • exercisesService.clearCache()');
}
