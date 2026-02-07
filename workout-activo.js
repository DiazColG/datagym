// ================================================
// WORKOUT ACTIVO - STRONG STYLE REDESIGN
// ================================================

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { obtenerEjercicios } from './exercises-db.js';
import { buscarHistorialEjercicio } from './workout-manager.js';

// ================================================
// ESTADO GLOBAL
// ================================================

let currentUser = null;
let userId = null;
let workoutId = null;
let workoutData = null;
let ejerciciosDelWorkout = []; // {exerciseId, exerciseName, series: [{peso, reps, completada, timestamp}]}
let tiempoInicio = null;
let timerInterval = null;
let tiempoDescansoActual = 120; // 2 minutos por defecto
let ejerciciosDisponibles = [];

// ================================================
// INICIALIZACIÓN
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            userId = user.uid;
            console.log('✅ Usuario autenticado:', userId);
            inicializar();
        } else {
            console.log('❌ No hay usuario autenticado');
            window.location.href = 'auth.html';
        }
    });
});

async function inicializar() {
    // Obtener workoutId de URL
    const urlParams = new URLSearchParams(window.location.search);
    workoutId = urlParams.get('workoutId');
    
    if (!workoutId) {
        console.error('❌ No workoutId en URL');
        mostrarToast('Error: No se encontró el workout');
        setTimeout(() => window.location.href = 'entrenar.html', 2000);
        return;
    }
    
    console.log('🚀 Workout activo:', workoutId);
    
    try {
        // Cargar workout y ejercicios en paralelo
        const [workout, ejercicios] = await Promise.all([
            cargarWorkout(),
            obtenerEjercicios()
        ]);
        
        if (!workout) {
            throw new Error('Workout no encontrado');
        }
        
        ejerciciosDisponibles = ejercicios;
        tiempoInicio = Date.now();
        
        configurarEventListeners();
        renderizarWorkout();
        actualizarTimer();
        
    } catch (error) {
        console.error('❌ Error al inicializar:', error);
        mostrarToast('Error al cargar entrenamiento');
        setTimeout(() => window.location.href = 'entrenar.html', 2000);
    }
}

// ================================================
// CARGAR WORKOUT
// ================================================

async function cargarWorkout() {
    try {
        const workoutRef = doc(db, 'workouts', workoutId);
        const workoutSnap = await getDoc(workoutRef);
        
        if (!workoutSnap.exists()) {
            throw new Error('Workout no encontrado');
        }
        
        workoutData = { id: workoutSnap.id, ...workoutSnap.data() };
        console.log('✅ Workout cargado:', workoutData);
        
        // Inicializar ejerciciosDelWorkout desde workoutData
        if (workoutData.ejercicios && workoutData.ejercicios.length > 0) {
            ejerciciosDelWorkout = workoutData.ejercicios.map(ej => ({
                exerciseId: ej.exerciseId,
                exerciseName: ej.exerciseName,
                series: ej.series || []
            }));
        } else {
            ejerciciosDelWorkout = [];
        }
        
        return workoutData;
        
    } catch (error) {
        console.error('Error al cargar workout:', error);
        return null;
    }
}

// ================================================
// RENDERIZAR WORKOUT
// ================================================

function renderizarWorkout() {
    // Título del workout
    const workoutTitle = document.getElementById('workoutTitle');
    if (workoutTitle) {
        workoutTitle.textContent = workoutData.nombre || 'Entrenamiento';
    }
    
    // Renderizar ejercicios
    renderizarEjercicios();
}

function renderizarEjercicios() {
    const container = document.getElementById('exercisesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (ejerciciosDelWorkout.length === 0) {
        container.innerHTML = `
            <div class="empty-workout">
                <i class="fas fa-dumbbell"></i>
                <p>Agrega ejercicios para comenzar</p>
            </div>
        `;
        return;
    }
    
    ejerciciosDelWorkout.forEach((ejercicio, index) => {
        const card = crearCardEjercicio(ejercicio, index);
        container.appendChild(card);
    });
}

function crearCardEjercicio(ejercicio, index) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.dataset.index = index;
    
    // Crear tabla de series
    const seriesHTML = ejercicio.series.map((serie, setIndex) => {
        const isCompleted = serie.completada || false;
        return `
            <tr class="set-row ${isCompleted ? 'set-row-completed' : ''}" data-set-index="${setIndex}">
                <td>${setIndex + 1}</td>
                <td>
                    <input 
                        type="number" 
                        class="set-input" 
                        placeholder="-" 
                        value="${serie.peso || ''}"
                        data-type="peso"
                        ${isCompleted ? 'disabled' : ''}
                    >
                </td>
                <td>
                    <input 
                        type="number" 
                        class="set-input" 
                        placeholder="-" 
                        value="${serie.reps || ''}"
                        data-type="reps"
                        ${isCompleted ? 'disabled' : ''}
                    >
                </td>
                <td>
                    <button class="set-checkbox ${isCompleted ? 'checked' : ''}" ${isCompleted ? 'disabled' : ''}>
                        ${isCompleted ? '<i class="fas fa-check"></i>' : ''}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    card.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-title">
                <h4>${ejercicio.exerciseName}</h4>
                <button class="exercise-menu-btn">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </div>
        
        <table class="sets-table">
            <thead>
                <tr>
                    <th>SET</th>
                    <th>KG</th>
                    <th>REPS</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${seriesHTML}
            </tbody>
        </table>
        
        <button class="btn-add-set">
            <i class="fas fa-plus"></i> Agregar Serie
            <span class="rest-time-indicator">(2:00)</span>
        </button>
    `;
    
    // Event listeners para inputs
    const inputs = card.querySelectorAll('.set-input');
    inputs.forEach(input => {
        input.addEventListener('blur', (e) => {
            const row = e.target.closest('.set-row');
            const setIndex = parseInt(row.dataset.setIndex);
            const tipo = e.target.dataset.type;
            const valor = parseFloat(e.target.value) || 0;
            
            actualizarSerie(index, setIndex, tipo, valor);
        });
    });
    
    // Event listeners para checkboxes
    const checkboxes = card.querySelectorAll('.set-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            const row = e.target.closest('.set-row');
            const setIndex = parseInt(row.dataset.setIndex);
            completarSerie(index, setIndex, row);
        });
    });
    
    // Event listener para agregar serie
    const btnAddSet = card.querySelector('.btn-add-set');
    if (btnAddSet) {
        btnAddSet.addEventListener('click', () => {
            agregarSerie(index);
        });
    }
    
    // Event listener para menú
    const menuBtn = card.querySelector('.exercise-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            // TODO: Menú contextual (eliminar ejercicio, notas, etc.)
            console.log('Menú ejercicio:', index);
        });
    }
    
    return card;
}

// ================================================
// GESTIÓN DE SERIES
// ================================================

function actualizarSerie(exerciseIndex, setIndex, tipo, valor) {
    const ejercicio = ejerciciosDelWorkout[exerciseIndex];
    if (!ejercicio) return;
    
    const serie = ejercicio.series[setIndex];
    if (!serie) return;
    
    if (tipo === 'peso') {
        serie.peso = valor;
    } else if (tipo === 'reps') {
        serie.reps = valor;
    }
    
    console.log(`📝 Serie actualizada: E${exerciseIndex} S${setIndex} ${tipo}=${valor}`);
    
    // No guardar en Firestore hasta que se complete (checkbox)
}

async function completarSerie(exerciseIndex, setIndex, rowElement) {
    const ejercicio = ejerciciosDelWorkout[exerciseIndex];
    if (!ejercicio) return;
    
    const serie = ejercicio.series[setIndex];
    if (!serie) return;
    
    // Validar que tenga datos
    if (!serie.peso || !serie.reps) {
        mostrarToast('Completa peso y reps antes de marcar');
        return;
    }
    
    // Marcar como completada
    serie.completada = true;
    serie.timestamp = serverTimestamp();
    
    // Actualizar UI
    rowElement.classList.add('set-row-completed');
    const checkbox = rowElement.querySelector('.set-checkbox');
    checkbox.classList.add('checked');
    checkbox.innerHTML = '<i class="fas fa-check"></i>';
    checkbox.disabled = true;
    
    // Deshabilitar inputs
    const inputs = rowElement.querySelectorAll('.set-input');
    inputs.forEach(input => input.disabled = true);
    
    console.log(`✅ Serie completada: E${exerciseIndex} S${setIndex}`);
    
    // Guardar en Firestore
    await guardarWorkoutEnFirestore();
    
    // INICIAR TIMER DE DESCANSO
    iniciarTimerDescanso(tiempoDescansoActual);
}

async function agregarSerie(exerciseIndex) {
    const ejercicio = ejerciciosDelWorkout[exerciseIndex];
    if (!ejercicio) return;
    
    // Buscar última serie para pre-cargar datos
    const ultimaSerie = ejercicio.series[ejercicio.series.length - 1];
    
    // Pre-cargar con datos de última serie si existe
    const nuevaSerie = {
        peso: ultimaSerie?.peso || 0,
        reps: ultimaSerie?.reps || 0,
        completada: false,
        timestamp: null
    };
    
    ejercicio.series.push(nuevaSerie);
    
    console.log(`➕ Serie agregada a ${ejercicio.exerciseName}`);
    
    // Re-renderizar solo este ejercicio
    renderizarEjercicios();
}

// ================================================
// TIMER DE DESCANSO
// ================================================

function iniciarTimerDescanso(segundos) {
    // Detener timer anterior si existe
    detenerTimerDescanso();
    
    const container = document.getElementById('restTimerContainer');
    const progress = document.getElementById('restTimerProgress');
    const timeText = document.getElementById('restTimerTime');
    
    if (!container || !progress || !timeText) return;
    
    // Mostrar container
    container.style.display = 'flex';
    
    let tiempoRestante = segundos;
    const tiempoTotal = segundos;
    
    // Función para actualizar UI
    const actualizarUI = () => {
        const minutos = Math.floor(tiempoRestante / 60);
        const segs = tiempoRestante % 60;
        timeText.textContent = `${minutos}:${segs.toString().padStart(2, '0')}`;
        
        // Actualizar barra de progreso
        const porcentaje = (tiempoRestante / tiempoTotal) * 100;
        progress.style.width = `${porcentaje}%`;
    };
    
    // Actualizar inmediatamente
    actualizarUI();
    
    // Intervalo cada segundo
    timerInterval = setInterval(() => {
        tiempoRestante--;
        
        if (tiempoRestante <= 0) {
            detenerTimerDescanso();
            // TODO: Notificación sonora/vibración
            mostrarToast('¡Descanso terminado!');
            return;
        }
        
        actualizarUI();
    }, 1000);
}

function detenerTimerDescanso() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const container = document.getElementById('restTimerContainer');
    if (container) {
        container.style.display = 'none';
    }
    
    // Resetear barra
    const progress = document.getElementById('restTimerProgress');
    if (progress) {
        progress.style.width = '100%';
    }
}

// ================================================
// AGREGAR EJERCICIO
// ================================================

async function abrirModalAgregarEjercicio() {
    const modal = document.getElementById('modalAddExercise');
    if (!modal) return;
    
    // Renderizar lista de ejercicios
    renderizarListaEjercicios();
    
    modal.classList.add('active');
}

function cerrarModalAgregarEjercicio() {
    const modal = document.getElementById('modalAddExercise');
    if (modal) {
        modal.classList.remove('active');
    }
}

function renderizarListaEjercicios() {
    const container = document.getElementById('exercisesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    ejerciciosDisponibles.forEach(ejercicio => {
        const item = document.createElement('div');
        item.className = 'exercise-list-item';
        item.innerHTML = `
            <div class="exercise-list-info">
                <div class="exercise-list-name">${ejercicio.name}</div>
                <div class="exercise-list-muscle">${ejercicio.musculo}</div>
            </div>
            <button class="exercise-list-add-btn">
                <i class="fas fa-plus"></i>
            </button>
        `;
        
        const addBtn = item.querySelector('.exercise-list-add-btn');
        addBtn.addEventListener('click', async () => {
            await agregarEjercicioAlWorkout(ejercicio);
        });
        
        container.appendChild(item);
    });
}

async function agregarEjercicioAlWorkout(ejercicio) {
    try {
        // Verificar si ya está agregado
        const yaExiste = ejerciciosDelWorkout.find(e => e.exerciseId === ejercicio.id);
        if (yaExiste) {
            mostrarToast('Este ejercicio ya está en el workout');
            return;
        }
        
        // Buscar historial para pre-cargar datos
        const historial = await buscarHistorialEjercicio(userId, ejercicio.id);
        
        let seriesIniciales = [];
        
        if (historial && historial.series && historial.series.length > 0) {
            // PRE-CARGAR: Usuario ya hizo este ejercicio antes
            console.log('📊 Pre-cargando datos de historial:', historial);
            seriesIniciales = historial.series.map(s => ({
                peso: s.peso || 0,
                reps: s.reps || 0,
                completada: false,
                timestamp: null
            }));
        } else {
            // SIN PRE-CARGA: Nunca hizo este ejercicio
            console.log('📝 Sin historial, iniciando en blanco');
            seriesIniciales = [{
                peso: 0,
                reps: 0,
                completada: false,
                timestamp: null
            }];
        }
        
        // Agregar al workout
        ejerciciosDelWorkout.push({
            exerciseId: ejercicio.id,
            exerciseName: ejercicio.name,
            series: seriesIniciales
        });
        
        console.log(`✅ Ejercicio agregado: ${ejercicio.name}`);
        
        // Guardar en Firestore
        await guardarWorkoutEnFirestore();
        
        // Re-renderizar
        renderizarEjercicios();
        
        // Cerrar modal
        cerrarModalAgregarEjercicio();
        
        mostrarToast(`${ejercicio.name} agregado`);
        
    } catch (error) {
        console.error('Error al agregar ejercicio:', error);
        mostrarToast('Error al agregar ejercicio');
    }
}

// ================================================
// GUARDAR EN FIRESTORE
// ================================================

async function guardarWorkoutEnFirestore() {
    try {
        const workoutRef = doc(db, 'workouts', workoutId);
        
        await updateDoc(workoutRef, {
            ejercicios: ejerciciosDelWorkout,
            ultimaActualizacion: serverTimestamp()
        });
        
        console.log('💾 Workout guardado en Firestore');
        
    } catch (error) {
        console.error('Error al guardar workout:', error);
        // No mostrar toast para no interrumpir flujo
    }
}

// ================================================
// TERMINAR WORKOUT
// ================================================

async function terminarWorkout() {
    try {
        console.log('🏁 Terminando workout...');
        
        // Calcular duración
        const duracion = Math.floor((Date.now() - tiempoInicio) / 1000); // segundos
        
        // Calcular stats
        const totalSeries = ejerciciosDelWorkout.reduce((sum, ej) => 
            sum + ej.series.filter(s => s.completada).length, 0);
        
        const totalVolumen = ejerciciosDelWorkout.reduce((sum, ej) => 
            sum + ej.series.filter(s => s.completada).reduce((vol, s) => 
                vol + (s.peso * s.reps), 0), 0);
        
        // Actualizar workout en Firestore
        const workoutRef = doc(db, 'workouts', workoutId);
        await updateDoc(workoutRef, {
            estado: 'completado',
            fechaFin: serverTimestamp(),
            duracion: duracion,
            ejercicios: ejerciciosDelWorkout,
            stats: {
                totalEjercicios: ejerciciosDelWorkout.length,
                totalSeries: totalSeries,
                volumenTotal: totalVolumen
            }
        });
        
        console.log('✅ Workout completado:', {
            duracion,
            ejercicios: ejerciciosDelWorkout.length,
            series: totalSeries,
            volumen: totalVolumen
        });
        
        mostrarToast('¡Entrenamiento completado!');
        
        // Redirigir a historial o dashboard
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al terminar workout:', error);
        mostrarToast('Error al completar entrenamiento');
    }
}

function confirmarCancelarWorkout() {
    const modal = document.getElementById('modalCancelWorkout');
    if (modal) {
        modal.classList.add('active');
    }
}

function cerrarModalCancelar() {
    const modal = document.getElementById('modalCancelWorkout');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function cancelarWorkout() {
    try {
        console.log('❌ Cancelando workout...');
        
        const workoutRef = doc(db, 'workouts', workoutId);
        await updateDoc(workoutRef, {
            estado: 'cancelado',
            fechaCancelacion: serverTimestamp()
        });
        
        mostrarToast('Entrenamiento cancelado');
        
        setTimeout(() => {
            window.location.href = 'entrenar.html';
        }, 1000);
        
    } catch (error) {
        console.error('Error al cancelar workout:', error);
        mostrarToast('Error al cancelar');
    }
}

// ================================================
// TIMER DEL WORKOUT
// ================================================

function actualizarTimer() {
    const timerElement = document.getElementById('workoutTimer');
    if (!timerElement) return;
    
    setInterval(() => {
        const duracion = Math.floor((Date.now() - tiempoInicio) / 1000);
        const horas = Math.floor(duracion / 3600);
        const minutos = Math.floor((duracion % 3600) / 60);
        const segundos = duracion % 60;
        
        if (horas > 0) {
            timerElement.textContent = `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        } else {
            timerElement.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// ================================================
// EVENT LISTENERS
// ================================================

function configurarEventListeners() {
    // Botón volver
    const btnBack = document.getElementById('btnBackToTraining');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            if (confirm('¿Seguro que quieres salir? El progreso se guardará automáticamente.')) {
                window.location.href = 'entrenar.html';
            }
        });
    }
    
    // Botón terminar
    const btnFinish = document.getElementById('btnFinishWorkout');
    if (btnFinish) {
        btnFinish.addEventListener('click', terminarWorkout);
    }
    
    // Botón agregar ejercicio
    const btnAddExercise = document.getElementById('btnAddExercise');
    if (btnAddExercise) {
        btnAddExercise.addEventListener('click', abrirModalAgregarEjercicio);
    }
    
    // Botón cancelar workout
    const btnCancel = document.getElementById('btnCancelWorkout');
    if (btnCancel) {
        btnCancel.addEventListener('click', confirmarCancelarWorkout);
    }
    
    // Botones modales
    const btnCloseExerciseModal = document.getElementById('btnCloseExerciseModal');
    if (btnCloseExerciseModal) {
        btnCloseExerciseModal.addEventListener('click', cerrarModalAgregarEjercicio);
    }
    
    const btnConfirmCancel = document.getElementById('btnConfirmCancel');
    if (btnConfirmCancel) {
        btnConfirmCancel.addEventListener('click', cancelarWorkout);
    }
    
    const btnKeepWorkout = document.getElementById('btnKeepWorkout');
    if (btnKeepWorkout) {
        btnKeepWorkout.addEventListener('click', cerrarModalCancelar);
    }
    
    // Buscador de ejercicios
    const searchInput = document.getElementById('exerciseSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filtrarEjercicios(query);
        });
    }
    
    // Click en timer para detener
    const restTimerContainer = document.getElementById('restTimerContainer');
    if (restTimerContainer) {
        restTimerContainer.addEventListener('click', detenerTimerDescanso);
    }
}

function filtrarEjercicios(query) {
    const items = document.querySelectorAll('.exercise-list-item');
    
    items.forEach(item => {
        const nombre = item.querySelector('.exercise-list-name').textContent.toLowerCase();
        const musculo = item.querySelector('.exercise-list-muscle').textContent.toLowerCase();
        
        if (nombre.includes(query) || musculo.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ================================================
// UTILIDADES
// ================================================

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) {
        console.log('Toast:', mensaje);
        return;
    }
    
    toastMessage.textContent = mensaje;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Auto-guardar cada 30 segundos
setInterval(() => {
    if (workoutId && ejerciciosDelWorkout.length > 0) {
        guardarWorkoutEnFirestore();
    }
}, 30000);
