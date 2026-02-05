// ================================================
// WORKOUT ACTIVO - Registrar entrenamiento en vivo
// ================================================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { iniciarWorkout, guardarSerie, completarWorkout, obtenerWorkoutActivo } from './workout-manager.js';
import { obtenerRutina, incrementarVecesCompletada } from './rutinas-manager.js';
import { EXERCISES_DB } from './exercises-db.js';

let userActual = null;
let workoutActual = null;
let workoutId = null;
let rutinaActual = null;
let ejercicioActualIdx = 0;
let serieActualIdx = 0;
let pesoActual = 0;
let repsActuales = 0;
let tiempoInicio = null;
let timerInterval = null;

// ================================================
// INICIALIZACIÓN
// ================================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userActual = user;
        await inicializarWorkout();
    } else {
        window.location.href = 'auth.html';
    }
});

async function inicializarWorkout() {
    const workoutType = localStorage.getItem('workoutType');
    const routineId = localStorage.getItem('selectedRoutineId');

    try {
        if (workoutType === 'routine' && routineId) {
            rutinaActual = await obtenerRutina(userActual.uid, routineId);
            workoutId = await iniciarWorkout(userActual.uid, routineId, rutinaActual);
        } else {
            workoutId = await iniciarWorkout(userActual.uid, null, { nombre: 'Workout Rápido', ejercicios: [] });
        }

        workoutActual = await obtenerWorkoutActivo(userActual.uid);
        if (!workoutActual) {
            throw new Error('No se pudo cargar el workout activo');
        }
        tiempoInicio = new Date();
        
        configurarInterfaz();
        iniciarTimer();
        renderizarEjercicioActual();
    } catch (error) {
        console.error('Error iniciando workout:', error);
        alert('Error al iniciar el entrenamiento');
        window.location.href = 'entrenar.html';
    }
}

// ================================================
// CONFIGURACIÓN DE INTERFAZ
// ================================================

function configurarInterfaz() {
    document.getElementById('workoutTitle').textContent = workoutActual.nombreRutina;
    document.getElementById('workoutSubtitle').textContent = `${workoutActual.ejercicios.length} ejercicios`;
    document.getElementById('totalExercisesNum').textContent = workoutActual.ejercicios.length;

    document.getElementById('btnBackWorkout').addEventListener('click', () => {
        if (confirm('¿Salir sin guardar el entrenamiento?')) {
            window.location.href = 'entrenar.html';
        }
    });

    document.getElementById('btnCompleteSet').addEventListener('click', completarSerieActual);
    document.getElementById('btnPrevExercise').addEventListener('click', ejercicioAnterior);
    document.getElementById('btnNextExercise').addEventListener('click', ejercicioSiguiente);
    document.getElementById('btnFinishWorkout').addEventListener('click', mostrarModalFinalizar);
    document.getElementById('btnCancelFinish').addEventListener('click', cerrarModalFinalizar);
    document.getElementById('btnConfirmFinish').addEventListener('click', confirmarFinalizacion);

    document.querySelectorAll('.btn-weight-adj').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cambio = parseFloat(e.currentTarget.dataset.change);
            ajustarPeso(cambio);
        });
    });

    document.getElementById('weightInput').addEventListener('input', (e) => {
        pesoActual = parseFloat(e.target.value) || 0;
        actualizarDisplayPeso();
    });

    document.getElementById('repsInput').addEventListener('input', (e) => {
        repsActuales = parseInt(e.target.value) || 0;
    });

    renderizarBotonesReps();
}

// ================================================
// BOTONES DE REPS
// ================================================

function renderizarBotonesReps() {
    const grid = document.getElementById('repsGrid');
    const botones = [];
    for (let i = 1; i <= 15; i++) {
        botones.push(`<button class="btn-rep" data-reps="${i}">${i}</button>`);
    }
    grid.innerHTML = botones.join('');

    grid.querySelectorAll('.btn-rep').forEach(btn => {
        btn.addEventListener('click', (e) => {
            repsActuales = parseInt(e.currentTarget.dataset.reps);
            document.getElementById('repsInput').value = repsActuales;
            grid.querySelectorAll('.btn-rep').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
}

// ================================================
// TEMPORIZADOR
// ================================================

function iniciarTimer() {
    timerInterval = setInterval(() => {
        const ahora = new Date();
        const diff = ahora - tiempoInicio;
        const minutos = Math.floor(diff / 60000);
        const segundos = Math.floor((diff % 60000) / 1000);
        document.getElementById('timerDisplay').textContent = 
            `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }, 1000);
}

// ================================================
// RENDERIZAR EJERCICIO ACTUAL
// ================================================

function renderizarEjercicioActual() {
    if (!workoutActual.ejercicios || workoutActual.ejercicios.length === 0) {
        document.getElementById('currentExerciseCard').innerHTML = 
            '<div class="empty-state"><p>No hay ejercicios en este workout</p></div>';
        return;
    }

    const ejercicio = workoutActual.ejercicios[ejercicioActualIdx];
    const datosEjercicio = EXERCISES_DB.find(e => e.id === ejercicio.exerciseId);

    document.getElementById('currentExerciseNum').textContent = ejercicioActualIdx + 1;
    document.getElementById('exerciseEmoji').textContent = datosEjercicio?.icono || '💪';
    document.getElementById('exerciseName').textContent = datosEjercicio?.nombre || ejercicio.nombreEjercicio;
    document.getElementById('exerciseMuscle').textContent = datosEjercicio?.grupoMuscular.toUpperCase() || '';

    actualizarProgressBar();
    renderizarSeries();
    actualizarBotonesNavegacion();
}

// ================================================
// RENDERIZAR SERIES
// ================================================

function renderizarSeries() {
    const ejercicio = workoutActual.ejercicios[ejercicioActualIdx];
    const tracker = document.getElementById('setsTracker');
    
    tracker.innerHTML = ejercicio.series.map((serie, idx) => {
        let estadoClass = 'pending';
        let icono = '⏳';
        
        if (serie.completado) {
            estadoClass = 'completed';
            icono = '✅';
        } else if (idx === serieActualIdx) {
            estadoClass = 'current';
            icono = '🔵';
        }

        return `
            <div class="set-badge ${estadoClass}">
                <div class="set-badge-icon">${icono}</div>
                <div class="set-badge-num">S${serie.set}</div>
                ${serie.completado ? `<div class="set-badge-data">${serie.peso}kg × ${serie.reps}</div>` : ''}
            </div>
        `;
    }).join('');
}

// ================================================
// PESO
// ================================================

function ajustarPeso(cambio) {
    pesoActual = Math.max(0, pesoActual + cambio);
    actualizarDisplayPeso();
    document.getElementById('weightInput').value = pesoActual;
}

function actualizarDisplayPeso() {
    document.getElementById('weightDisplay').textContent = pesoActual.toFixed(1);
}

// ================================================
// COMPLETAR SERIE
// ================================================

async function completarSerieActual() {
    if (repsActuales === 0) {
        alert('Ingresa las repeticiones realizadas');
        return;
    }

    try {
        const ejercicioActual = workoutActual.ejercicios[ejercicioActualIdx];
        const setNumber = serieActualIdx + 1;
        
        await guardarSerie(userActual.uid, workoutId, ejercicioActual.exerciseId, setNumber, {
            reps: repsActuales,
            peso: pesoActual
        });

        workoutActual = await obtenerWorkoutActivo(userActual.uid);
        
        const ejercicio = workoutActual.ejercicios[ejercicioActualIdx];
        const siguienteSerieIncompleta = ejercicio.series.findIndex((s, idx) => idx > serieActualIdx && !s.completado);
        
        if (siguienteSerieIncompleta !== -1) {
            serieActualIdx = siguienteSerieIncompleta;
            renderizarSeries();
            document.getElementById('currentSetNumber').textContent = serieActualIdx + 1;
        } else {
            if (ejercicioActualIdx < workoutActual.ejercicios.length - 1) {
                ejercicioSiguiente();
            } else {
                alert('¡Has completado todos los ejercicios!');
            }
        }
    } catch (error) {
        console.error('Error completando serie:', error);
        alert('Error al guardar la serie');
    }
}

// ================================================
// NAVEGACIÓN ENTRE EJERCICIOS
// ================================================

function ejercicioAnterior() {
    if (ejercicioActualIdx > 0) {
        ejercicioActualIdx--;
        serieActualIdx = 0;
        resetearInputs();
        renderizarEjercicioActual();
    }
}

function ejercicioSiguiente() {
    if (ejercicioActualIdx < workoutActual.ejercicios.length - 1) {
        ejercicioActualIdx++;
        serieActualIdx = 0;
        resetearInputs();
        renderizarEjercicioActual();
    }
}

function resetearInputs() {
    pesoActual = 0;
    repsActuales = 0;
    document.getElementById('weightInput').value = '';
    document.getElementById('repsInput').value = '';
    actualizarDisplayPeso();
    document.querySelectorAll('.btn-rep').forEach(b => b.classList.remove('active'));
}

function actualizarBotonesNavegacion() {
    const btnPrev = document.getElementById('btnPrevExercise');
    const btnNext = document.getElementById('btnNextExercise');
    
    btnPrev.disabled = ejercicioActualIdx === 0;
    btnNext.disabled = ejercicioActualIdx === workoutActual.ejercicios.length - 1;
}

// ================================================
// PROGRESS BAR
// ================================================

function actualizarProgressBar() {
    const porcentaje = ((ejercicioActualIdx + 1) / workoutActual.ejercicios.length) * 100;
    document.getElementById('progressFillBar').style.width = `${porcentaje}%`;
}

// ================================================
// MODAL FINALIZAR
// ================================================

function mostrarModalFinalizar() {
    const ahora = new Date();
    const duracionMs = ahora - tiempoInicio;
    const minutos = Math.floor(duracionMs / 60000);
    
    document.getElementById('summaryDuration').textContent = `${minutos} min`;
    document.getElementById('summaryVolume').textContent = '0 kg';
    document.getElementById('summaryCalories').textContent = '0 kcal';
    
    document.getElementById('modalFinishWorkout').classList.add('active');
}

function cerrarModalFinalizar() {
    document.getElementById('modalFinishWorkout').classList.remove('active');
}

async function confirmarFinalizacion() {
    try {
        const notas = document.getElementById('workoutNotes').value;
        await completarWorkout(userActual.uid, workoutId, { notas });
        
        if (rutinaActual) {
            await incrementarVecesCompletada(userActual.uid, localStorage.getItem('selectedRoutineId'));
        }
        
        clearInterval(timerInterval);
        localStorage.removeItem('workoutType');
        localStorage.removeItem('selectedRoutineId');
        
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error finalizando workout:', error);
        alert('Error al finalizar el entrenamiento');
    }
}
