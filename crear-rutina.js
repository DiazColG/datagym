// ================================================
// CREAR/EDITAR RUTINA
// ================================================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { crearRutina, obtenerRutina, actualizarRutina } from './rutinas-manager.js';
import { EXERCISES_DB, obtenerEjercicioPorId } from './exercises-db.js';

let currentUser = null;
let selectedExercises = [];
let editingExerciseIndex = null;
let selectedColor = '#3b82f6';
let selectedIcon = '💪';
let editingRoutineId = null;

const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
const iconos = ['💪', '🔥', '⚡', '🏋️', '🎯', '💯', '🚀', '⭐', '🥇', '👊', '🦾', '💥'];

// ================================================
// INICIALIZACIÓN
// ================================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const urlParams = new URLSearchParams(window.location.search);
        editingRoutineId = urlParams.get('id');
        
        if (editingRoutineId) {
            await cargarRutinaExistente();
        }
        
        inicializarPagina();
    } else {
        window.location.href = 'auth.html';
    }
});

// ================================================
// INICIALIZAR PÁGINA
// ================================================

function inicializarPagina() {
    renderColorPicker();
    renderIconPicker();
    configurarEventos();
    
    if (selectedExercises.length > 0) {
        renderExercisesList();
    }
}

async function cargarRutinaExistente() {
    try {
        const rutina = await obtenerRutina(currentUser.uid, editingRoutineId);
        if (rutina) {
            document.getElementById('routineName').value = rutina.nombre;
            document.getElementById('routineDescription').value = rutina.descripcion || '';
            selectedColor = rutina.color || '#3b82f6';
            selectedIcon = rutina.icono || '💪';
            selectedExercises = rutina.ejercicios || [];
            document.querySelector('.creator-header h1').innerHTML = '<i class="fas fa-edit"></i> Editar Rutina';
        }
    } catch (error) {
        console.error('Error cargando rutina:', error);
    }
}

// ================================================
// EVENTOS
// ================================================

function configurarEventos() {
    document.getElementById('btnAddExercise').addEventListener('click', abrirModalSeleccion);
    document.getElementById('btnCloseSelectModal').addEventListener('click', () => cerrarModal('modalSelectExercise'));
    document.getElementById('btnCloseConfigModal').addEventListener('click', () => cerrarModal('modalConfigExercise'));
    document.getElementById('searchExerciseInput').addEventListener('input', buscarEjercicios);
    document.getElementById('btnSaveExerciseConfig').addEventListener('click', guardarConfiguracionEjercicio);
    document.getElementById('btnCancel').addEventListener('click', () => window.location.href = 'entrenar.html');
    document.getElementById('btnSaveRoutine').addEventListener('click', guardarRutina);
}

// ================================================
// COLOR E ICONOS
// ================================================

function renderColorPicker() {
    const picker = document.getElementById('colorPicker');
    picker.innerHTML = colores.map(color => 
        `<div class="color-option ${color === selectedColor ? 'selected' : ''}" 
              style="background: ${color};" 
              data-color="${color}"></div>`
    ).join('');

    picker.querySelectorAll('.color-option').forEach(el => {
        el.addEventListener('click', () => {
            selectedColor = el.dataset.color;
            renderColorPicker();
        });
    });
}

function renderIconPicker() {
    const picker = document.getElementById('iconPicker');
    picker.innerHTML = iconos.map(icon => 
        `<div class="icon-option ${icon === selectedIcon ? 'selected' : ''}" 
              data-icon="${icon}">${icon}</div>`
    ).join('');

    picker.querySelectorAll('.icon-option').forEach(el => {
        el.addEventListener('click', () => {
            selectedIcon = el.dataset.icon;
            renderIconPicker();
        });
    });
}

// ================================================
// MODALES
// ================================================

function abrirModalSeleccion() {
    document.getElementById('modalSelectExercise').classList.add('active');
    renderizarEjerciciosDisponibles();
}

function cerrarModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ================================================
// EJERCICIOS DISPONIBLES
// ================================================

function renderizarEjerciciosDisponibles(filtro = '') {
    const grid = document.getElementById('exercisesGrid');
    const ejerciciosFiltrados = filtro 
        ? EXERCISES_DB.filter(ex => ex.nombre.toLowerCase().includes(filtro.toLowerCase()))
        : EXERCISES_DB;

    grid.innerHTML = ejerciciosFiltrados.slice(0, 30).map(ex => `
        <div class="exercise-option" data-exercise-id="${ex.id}">
            <h4>${ex.icono} ${ex.nombre}</h4>
            <p>${ex.grupoMuscular.toUpperCase()} - ${ex.equipamiento}</p>
        </div>
    `).join('');

    grid.querySelectorAll('.exercise-option').forEach(el => {
        el.addEventListener('click', () => seleccionarEjercicio(el.dataset.exerciseId));
    });
}

function buscarEjercicios(e) {
    renderizarEjerciciosDisponibles(e.target.value);
}

function seleccionarEjercicio(exerciseId) {
    cerrarModal('modalSelectExercise');
    editingExerciseIndex = null;
    document.getElementById('exerciseSets').value = 3;
    document.getElementById('exerciseReps').value = '8-12';
    document.getElementById('exerciseRest').value = 60;
    document.getElementById('exerciseNotes').value = '';
    
    document.getElementById('btnSaveExerciseConfig').dataset.exerciseId = exerciseId;
    document.getElementById('modalConfigExercise').classList.add('active');
}

// ================================================
// CONFIGURACIÓN DE EJERCICIOS
// ================================================

function guardarConfiguracionEjercicio() {
    const exerciseId = document.getElementById('btnSaveExerciseConfig').dataset.exerciseId;
    const sets = parseInt(document.getElementById('exerciseSets').value);
    const reps = document.getElementById('exerciseReps').value;
    const rest = parseInt(document.getElementById('exerciseRest').value);
    const notes = document.getElementById('exerciseNotes').value;

    const ejercicioConfig = {
        exerciseId,
        series: sets,
        repsObjetivo: reps,
        descanso: rest,
        notas: notes,
        orden: selectedExercises.length + 1
    };

    if (editingExerciseIndex !== null) {
        selectedExercises[editingExerciseIndex] = ejercicioConfig;
    } else {
        selectedExercises.push(ejercicioConfig);
    }

    renderExercisesList();
    cerrarModal('modalConfigExercise');
}

// ================================================
// LISTA DE EJERCICIOS SELECCIONADOS
// ================================================

function renderExercisesList() {
    const lista = document.getElementById('exercisesList');
    
    if (selectedExercises.length === 0) {
        lista.innerHTML = '<div class="empty-state"><p>No hay ejercicios agregados.</p></div>';
        return;
    }

    lista.innerHTML = selectedExercises.map((ex, idx) => {
        const ejercicio = EXERCISES_DB.find(e => e.id === ex.exerciseId);
        if (!ejercicio) return '';
        
        return `
            <div class="exercise-item">
                <div class="exercise-info">
                    <h4>${ejercicio.icono} ${ejercicio.nombre}</h4>
                    <div class="exercise-config">
                        <span><i class="fas fa-list"></i> ${ex.series} series</span>
                        <span><i class="fas fa-repeat"></i> ${ex.repsObjetivo} reps</span>
                        <span><i class="fas fa-clock"></i> ${ex.descanso}s descanso</span>
                    </div>
                </div>
                <div class="exercise-actions">
                    <button class="btn-icon edit" data-index="${idx}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" data-index="${idx}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lista.querySelectorAll('.btn-icon.edit').forEach(btn => {
        btn.addEventListener('click', (e) => editarEjercicio(parseInt(e.currentTarget.dataset.index)));
    });

    lista.querySelectorAll('.btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', (e) => eliminarEjercicio(parseInt(e.currentTarget.dataset.index)));
    });
}

function editarEjercicio(index) {
    const ex = selectedExercises[index];
    editingExerciseIndex = index;
    
    document.getElementById('exerciseSets').value = ex.series;
    document.getElementById('exerciseReps').value = ex.repsObjetivo;
    document.getElementById('exerciseRest').value = ex.descanso;
    document.getElementById('exerciseNotes').value = ex.notas || '';
    document.getElementById('btnSaveExerciseConfig').dataset.exerciseId = ex.exerciseId;
    
    document.getElementById('modalConfigExercise').classList.add('active');
}

function eliminarEjercicio(index) {
    if (confirm('¿Eliminar este ejercicio de la rutina?')) {
        selectedExercises.splice(index, 1);
        renderExercisesList();
    }
}

// ================================================
// GUARDAR RUTINA
// ================================================

async function guardarRutina() {
    const nombre = document.getElementById('routineName').value.trim();
    const descripcion = document.getElementById('routineDescription').value.trim();

    if (!nombre) {
        alert('Por favor ingresa un nombre para la rutina');
        return;
    }

    if (selectedExercises.length === 0) {
        alert('Agrega al menos un ejercicio a la rutina');
        return;
    }

    const datosRutina = {
        nombre,
        descripcion,
        color: selectedColor,
        icono: selectedIcon,
        ejercicios: selectedExercises,
        activa: true,
        favorita: false
    };

    try {
        if (editingRoutineId) {
            await actualizarRutina(currentUser.uid, editingRoutineId, datosRutina);
        } else {
            await crearRutina(currentUser.uid, datosRutina);
        }
        
        window.location.href = 'entrenar.html';
    } catch (error) {
        console.error('Error guardando rutina:', error);
        alert('Error al guardar la rutina');
    }
}
