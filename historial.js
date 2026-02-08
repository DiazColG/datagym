// ================================================
// MÓDULO DE HISTORIAL
// Visualización de workouts completados y progreso
// ================================================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { obtenerHistorialWorkouts, obtenerWorkoutsConEjercicio, obtenerProgresoEjercicio } from './workout-manager.js';
import { exercisesService } from './exercises-db.js';

let usuarioActual = null;
let todosLosWorkouts = [];
let workoutsFiltrados = [];
let chartPeso = null;
let chartVolumen = null;
let ejerciciosCache = []; // Caché de ejercicios para uso sincrónico

// ================================================
// HELPER: Obtener ejercicio de caché
// ================================================
function obtenerEjercicioPorId(id) {
    return ejerciciosCache.find(e => e.id === id);
}

// ================================================
// INICIALIZACIÓN
// ================================================

document.addEventListener('DOMContentLoaded', async () => {
    configurarNavegacion();
    configurarEventos();
    
    // Pre-cargar ejercicios al inicio (con caché)
    try {
        ejerciciosCache = await exercisesService.getExercises();
        console.log('✅ Ejercicios precargados:', ejerciciosCache.length);
    } catch (error) {
        console.error('Error precargando ejercicios:', error);
    }
    
    onAuthStateChanged(auth, (usuario) => {
        if (usuario) {
            usuarioActual = usuario;
            cargarHistorial();
        } else {
            window.location.href = 'auth.html';
        }
    });
});

// ================================================
// CONFIGURACIÓN DE EVENTOS
// ================================================

function configurarEventos() {
    // Navegación
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navMiCuenta = document.getElementById('navMiCuenta');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    if (navMiCuenta) {
        navMiCuenta.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'mi-cuenta.html';
        });
    }
    
    // Filtros
    document.getElementById('filterPeriodo').addEventListener('change', aplicarFiltros);
    document.getElementById('filterRutina').addEventListener('change', aplicarFiltros);
    document.getElementById('searchEjercicio').addEventListener('input', aplicarFiltros);
    document.getElementById('btnResetFilters').addEventListener('click', resetearFiltros);
    
    // Tabs de visualización
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => cambiarVista(btn.dataset.view));
    });
    
    // Selector de ejercicio para gráfico
    document.getElementById('ejercicioGrafico').addEventListener('change', (e) => {
        if (e.target.value) {
            cargarGraficoEjercicio(e.target.value);
        }
    });
}

function configurarNavegacion() {
    // Ya configurado en eventos
}

// ================================================
// CARGA DE DATOS
// ================================================

async function cargarHistorial() {
    try {
        mostrarCargando(true);
        
        // Obtener todos los workouts
        todosLosWorkouts = await obtenerHistorialWorkouts(usuarioActual.uid, 100);
        workoutsFiltrados = [...todosLosWorkouts];
        
        // Calcular estadísticas generales
        calcularEstadisticasGenerales();
        
        // Llenar filtros
        llenarFiltroRutinas();
        llenarSelectorEjercicios();
        
        // Renderizar lista
        renderizarWorkouts();
        
        mostrarCargando(false);
    } catch (error) {
        console.error('❌ Error al cargar historial:', error);
        mostrarError('Error al cargar el historial');
        mostrarCargando(false);
    }
}

function calcularEstadisticasGenerales() {
    const stats = {
        total: todosLosWorkouts.length,
        volumen: 0,
        calorias: 0,
        tiempo: 0
    };
    
    todosLosWorkouts.forEach(workout => {
        stats.volumen += workout.estadisticas?.volumenTotal || 0;
        stats.calorias += workout.estadisticas?.caloriasQuemadas || 0;
        stats.tiempo += workout.duracion || 0;
    });
    
    document.getElementById('totalWorkouts').textContent = stats.total;
    document.getElementById('totalVolumen').textContent = Math.round(stats.volumen).toLocaleString();
    document.getElementById('totalCalorias').textContent = Math.round(stats.calorias).toLocaleString();
    document.getElementById('totalTiempo').textContent = Math.round(stats.tiempo);
}

function llenarFiltroRutinas() {
    const rutinasUnicas = new Set();
    todosLosWorkouts.forEach(w => {
        if (w.rutinaNombre) {
            rutinasUnicas.add(JSON.stringify({ id: w.rutinaId, nombre: w.rutinaNombre }));
        }
    });
    
    const select = document.getElementById('filterRutina');
    select.innerHTML = '<option value="all">Todas las rutinas</option>';
    
    Array.from(rutinasUnicas).forEach(rutinaStr => {
        const rutina = JSON.parse(rutinaStr);
        const option = document.createElement('option');
        option.value = rutina.id;
        option.textContent = rutina.nombre;
        select.appendChild(option);
    });
}

function llenarSelectorEjercicios() {
    const ejerciciosUsados = new Set();
    todosLosWorkouts.forEach(workout => {
        workout.ejercicios?.forEach(ej => {
            ejerciciosUsados.add(ej.exerciseId);
        });
    });
    
    const select = document.getElementById('ejercicioGrafico');
    select.innerHTML = '<option value="">Selecciona un ejercicio</option>';
    
    // Cargar ejercicios async
    const ejercicios = await exercisesService.getExercises();
    
    Array.from(ejerciciosUsados).forEach(exerciseId => {
        const ejercicio = ejercicios.find(e => e.id === exerciseId);
        if (ejercicio) {
            const option = document.createElement('option');
            option.value = exerciseId;
            option.textContent = `${ejercicio.icono} ${ejercicio.nombre}`;
            select.appendChild(option);
        }
    });
}

// ================================================
// FILTROS
// ================================================

function aplicarFiltros() {
    const periodo = document.getElementById('filterPeriodo').value;
    const rutinaId = document.getElementById('filterRutina').value;
    const busqueda = document.getElementById('searchEjercicio').value.toLowerCase();
    
    workoutsFiltrados = todosLosWorkouts.filter(workout => {
        // Filtro por período
        if (periodo !== 'all') {
            const dias = parseInt(periodo);
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            const fechaWorkout = workout.fecha?.toDate ? workout.fecha.toDate() : new Date(workout.fechaISO);
            if (fechaWorkout < fechaLimite) return false;
        }
        
        // Filtro por rutina
        if (rutinaId !== 'all' && workout.rutinaId !== rutinaId) {
            return false;
        }
        
        // Búsqueda por ejercicio
        if (busqueda) {
            const tieneEjercicio = workout.ejercicios?.some(ej => {
                const ejercicio = obtenerEjercicioPorId(ej.exerciseId);
                return ejercicio && ejercicio.nombre.toLowerCase().includes(busqueda);
            });
            if (!tieneEjercicio) return false;
        }
        
        return true;
    });
    
    renderizarWorkouts();
}

function resetearFiltros() {
    document.getElementById('filterPeriodo').value = '30';
    document.getElementById('filterRutina').value = 'all';
    document.getElementById('searchEjercicio').value = '';
    aplicarFiltros();
}

// ================================================
// RENDERIZADO
// ================================================

function renderizarWorkouts() {
    const lista = document.getElementById('workoutsList');
    const emptyState = document.getElementById('emptyState');
    
    if (workoutsFiltrados.length === 0) {
        lista.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    lista.style.display = 'grid';
    emptyState.style.display = 'none';
    lista.innerHTML = '';
    
    workoutsFiltrados.forEach(workout => {
        const card = crearWorkoutCard(workout);
        lista.appendChild(card);
    });
}

function crearWorkoutCard(workout) {
    const card = document.createElement('div');
    card.className = 'workout-card';
    
    const fecha = workout.fecha?.toDate ? workout.fecha.toDate() : new Date(workout.fechaISO);
    const fechaFormato = fecha.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    const duracion = workout.duracion ? `${workout.duracion} min` : 'N/A';
    const volumen = workout.estadisticas?.volumenTotal 
        ? `${Math.round(workout.estadisticas.volumenTotal).toLocaleString()} kg`
        : '0 kg';
    const calorias = workout.estadisticas?.caloriasQuemadas 
        ? `${Math.round(workout.estadisticas.caloriasQuemadas)} kcal`
        : '0 kcal';
    
    card.innerHTML = `
        <div class="workout-card-header">
            <div class="workout-title-section">
                <h3>${workout.rutinaNombre || 'Workout Rápido'}</h3>
                <span class="workout-fecha">${fechaFormato}</span>
            </div>
            <div class="workout-badge">
                <i class="fas fa-check-circle"></i> Completado
            </div>
        </div>
        
        <div class="workout-stats-mini">
            <div class="stat-mini">
                <i class="fas fa-clock"></i>
                <span>${duracion}</span>
            </div>
            <div class="stat-mini">
                <i class="fas fa-weight-hanging"></i>
                <span>${volumen}</span>
            </div>
            <div class="stat-mini">
                <i class="fas fa-fire"></i>
                <span>${calorias}</span>
            </div>
            <div class="stat-mini">
                <i class="fas fa-dumbbell"></i>
                <span>${workout.ejercicios?.length || 0} ejercicios</span>
            </div>
        </div>
        
        <div class="workout-ejercicios-preview">
            ${renderizarEjerciciosPreview(workout.ejercicios)}
        </div>
        
        <button class="btn-ver-detalle" onclick="verDetalleWorkout('${workout.id}')">
            <i class="fas fa-eye"></i> Ver detalles
        </button>
    `;
    
    return card;
}

function renderizarEjerciciosPreview(ejercicios) {
    if (!ejercicios || ejercicios.length === 0) return '<p>Sin ejercicios</p>';
    
    return ejercicios.slice(0, 3).map(ej => {
        const ejercicio = obtenerEjercicioPorId(ej.exerciseId);
        if (!ejercicio) return '';
        
        return `
            <div class="ejercicio-preview-item">
                <span class="ejercicio-emoji">${ejercicio.icono}</span>
                <span class="ejercicio-nombre">${ejercicio.nombre}</span>
                <span class="ejercicio-sets">${ej.series?.length || 0} series</span>
            </div>
        `;
    }).join('') + (ejercicios.length > 3 ? `<small>+${ejercicios.length - 3} más...</small>` : '');
}

// ================================================
// VISTAS
// ================================================

function cambiarVista(vista) {
    // Actualizar tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === vista);
    });
    
    // Mostrar/ocultar contenido
    document.querySelectorAll('.view-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (vista === 'lista') {
        document.getElementById('vistaLista').classList.add('active');
    } else if (vista === 'graficos') {
        document.getElementById('vistaGraficos').classList.add('active');
    }
}

// ================================================
// GRÁFICOS
// ================================================

async function cargarGraficoEjercicio(exerciseId) {
    try {
        const progreso = await obtenerProgresoEjercicio(usuarioActual.uid, exerciseId);
        const ejercicio = obtenerEjercicioPorId(exerciseId);
        
        if (!ejercicio) return;
        
        // Mostrar/ocultar elementos
        document.getElementById('noExerciseSelected').style.display = 'none';
        document.querySelector('.charts-grid').style.display = 'grid';
        
        // Gráfico de peso
        renderizarGraficoPeso(progreso, ejercicio.nombre);
        
        // Gráfico de volumen
        renderizarGraficoVolumen(progreso, ejercicio.nombre);
        
        // Mostrar mejor serie
        if (progreso.mejorSerie) {
            const card = document.getElementById('bestSetCard');
            card.style.display = 'block';
            document.getElementById('bestPeso').textContent = progreso.mejorSerie.peso;
            document.getElementById('bestReps').textContent = progreso.mejorSerie.reps;
            document.getElementById('bestFecha').textContent = new Date(progreso.mejorSerie.fecha).toLocaleDateString('es-ES');
        }
    } catch (error) {
        console.error('❌ Error al cargar gráfico:', error);
    }
}

function renderizarGraficoPeso(progreso, nombreEjercicio) {
    const ctx = document.getElementById('chartPesoProgreso');
    
    if (chartPeso) {
        chartPeso.destroy();
    }
    
    chartPeso = new Chart(ctx, {
        type: 'line',
        data: {
            labels: progreso.fechas.map(f => new Date(f).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Peso máximo (kg)',
                data: progreso.pesoMaximo,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: nombreEjercicio
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Peso (kg)'
                    }
                }
            }
        }
    });
}

function renderizarGraficoVolumen(progreso, nombreEjercicio) {
    const ctx = document.getElementById('chartVolumen');
    
    if (chartVolumen) {
        chartVolumen.destroy();
    }
    
    chartVolumen = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: progreso.fechas.map(f => new Date(f).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Volumen total (kg)',
                data: progreso.volumenTotal,
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Volumen (kg)'
                    }
                }
            }
        }
    });
}

// ================================================
// UTILIDADES
// ================================================

function mostrarCargando(mostrar) {
    const lista = document.getElementById('workoutsList');
    if (mostrar) {
        lista.innerHTML = '<div class="loading-spinner"><div class="spinner-large"></div><p>Cargando historial...</p></div>';
    }
}

function mostrarError(mensaje) {
    const lista = document.getElementById('workoutsList');
    lista.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>${mensaje}</p>
        </div>
    `;
}

// Función global para ver detalle de workout
window.verDetalleWorkout = function(workoutId) {
    // Por ahora, mostrar alerta (en el futuro, modal con detalles)
    const workout = workoutsFiltrados.find(w => w.id === workoutId);
    if (workout) {
        alert(`Detalles del workout:\n\nFecha: ${workout.fechaISO}\nRutina: ${workout.rutinaNombre || 'Workout Rápido'}\nEjercicios: ${workout.ejercicios?.length || 0}\n\n(En desarrollo: modal con detalles completos)`);
    }
};
