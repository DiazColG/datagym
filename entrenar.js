// ================================================
// MÓDULO DE PÁGINA DE ENTRENAR
// Gestión de rutinas y navegación a workouts
// ================================================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { obtenerRutinas, calcularDuracionEstimada } from './rutinas-manager.js';
import { obtenerEjercicioPorId } from './exercises-db.js';

let usuarioActual = null;
let rutinasUsuario = [];
let filtroActual = 'all';

// ================================================
// INICIALIZACIÓN
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    configurarNavegacion();
    configurarEventos();
    
    // Mostrar overlay de carga inicial
    mostrarOverlayAuth(true);
    
    onAuthStateChanged(auth, (usuario) => {
        if (usuario) {
            usuarioActual = usuario;
            mostrarOverlayAuth(false);
            cargarDatosEntrenar();
        } else {
            // Mostrar mensaje y redirigir después de un breve delay
            const overlay = document.getElementById('authOverlay');
            if (overlay) {
                const mensaje = overlay.querySelector('p');
                if (mensaje) {
                    mensaje.textContent = 'Debes iniciar sesión para acceder';
                }
            }
            
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 1500);
        }
    });
});

// ================================================
// FUNCIONES DE UI
// ================================================

function mostrarOverlayAuth(mostrar) {
    const overlay = document.getElementById('authOverlay');
    if (overlay) {
        overlay.style.display = mostrar ? 'flex' : 'none';
    }
}

// ================================================
// CONFIGURACIÓN DE EVENTOS
// ================================================

function configurarEventos() {
    const btnQuickWorkout = document.getElementById('btnQuickWorkout');
    const btnNewRoutine = document.getElementById('btnNewRoutine');
    const btnCreateFirstRoutine = document.getElementById('btnCreateFirstRoutine');
    
    if (btnQuickWorkout) {
        btnQuickWorkout.addEventListener('click', iniciarWorkoutRapido);
    }
    
    if (btnNewRoutine) {
        btnNewRoutine.addEventListener('click', irACrearRutina);
    }
    
    if (btnCreateFirstRoutine) {
        btnCreateFirstRoutine.addEventListener('click', irACrearRutina);
    }
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(boton => {
        boton.addEventListener('click', () => {
            filtroActual = boton.dataset.filter;
            filterButtons.forEach(b => b.classList.remove('active'));
            boton.classList.add('active');
            renderizarRutinas();
        });
    });
}

// ================================================
// NAVEGACIÓN
// ================================================

function configurarNavegacion() {
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
}

function iniciarWorkoutRapido() {
    localStorage.setItem('workoutType', 'quick');
    localStorage.removeItem('selectedRoutineId');
    window.location.href = 'workout-activo.html';
}

function irACrearRutina() {
    window.location.href = 'crear-rutina.html';
}

function iniciarRutina(rutinaId) {
    localStorage.setItem('workoutType', 'routine');
    localStorage.setItem('selectedRoutineId', rutinaId);
    window.location.href = 'workout-activo.html';
}

function editarRutina(rutinaId) {
    window.location.href = `crear-rutina.html?id=${rutinaId}`;
}

// ================================================
// CARGA DE DATOS
// ================================================

async function cargarDatosEntrenar() {
    await cargarRutinas();
    await cargarEstadisticasSemanales();
    renderizarCalendarioSemanal();
}

async function cargarRutinas() {
    const contenedor = document.getElementById('routinesContainer');
    const emptyState = document.getElementById('emptyRoutines');
    
    try {
        rutinasUsuario = await obtenerRutinas(usuarioActual.uid, { activa: true });
        
        if (rutinasUsuario.length === 0) {
            contenedor.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            contenedor.style.display = 'grid';
            emptyState.style.display = 'none';
            renderizarRutinas();
        }
    } catch (error) {
        console.error('Error cargando rutinas:', error);
        mostrarError('No se pudieron cargar las rutinas');
    }
}

function renderizarRutinas() {
    const contenedor = document.getElementById('routinesContainer');
    
    let rutinasFiltradas = rutinasUsuario;
    if (filtroActual === 'favorites') {
        rutinasFiltradas = rutinasUsuario.filter(r => r.favorita);
    }
    
    if (rutinasFiltradas.length === 0 && filtroActual === 'favorites') {
        contenedor.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <p>No tienes rutinas marcadas como favoritas</p>
            </div>
        `;
        return;
    }
    
    contenedor.innerHTML = rutinasFiltradas.map(rutina => crearTarjetaRutina(rutina)).join('');
    
    document.querySelectorAll('.btn-start-routine').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rutinaId = e.currentTarget.dataset.rutinaId;
            iniciarRutina(rutinaId);
        });
    });
    
    document.querySelectorAll('.btn-edit-routine').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rutinaId = e.currentTarget.dataset.rutinaId;
            editarRutina(rutinaId);
        });
    });
}

function crearTarjetaRutina(rutina) {
    const duracionEstimada = calcularDuracionEstimada(rutina);
    const numEjercicios = rutina.ejercicios ? rutina.ejercicios.length : 0;
    const vecesCompletada = rutina.vecesCompletada || 0;
    
    const ultimaVezTexto = rutina.ultimaVez 
        ? formatearFechaRelativa(rutina.ultimaVez.toDate())
        : 'Nunca';
    
    const favoriteBadge = rutina.favorita ? '<div class="favorite-badge">⭐</div>' : '';
    
    return `
        <div class="routine-card-wrapper ${rutina.favorita ? 'favorite' : ''}">
            <div class="routine-card-top" style="background: ${rutina.color || '#3b82f6'};">
                ${favoriteBadge}
                <div class="routine-icon">${rutina.icono || '💪'}</div>
                <h3 class="routine-name">${rutina.nombre}</h3>
            </div>
            <div class="routine-card-content">
                ${rutina.descripcion ? `<p class="routine-description">${rutina.descripcion}</p>` : ''}
                
                <div class="routine-meta">
                    <div class="meta-item">
                        <i class="fas fa-dumbbell"></i>
                        <span>${numEjercicios} ejercicio${numEjercicios !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>~${duracionEstimada} min</span>
                    </div>
                </div>
                
                <div class="routine-stats">
                    <div class="stat-box">
                        <strong>${vecesCompletada}</strong>
                        <span>Completada</span>
                    </div>
                    <div class="stat-box">
                        <strong>${ultimaVezTexto}</strong>
                        <span>Última vez</span>
                    </div>
                </div>
                
                <div class="routine-actions">
                    <button class="btn-start-routine" data-rutina-id="${rutina.id}">
                        <i class="fas fa-play"></i> Entrenar
                    </button>
                    <button class="btn-edit-routine" data-rutina-id="${rutina.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ================================================
// ESTADÍSTICAS SEMANALES
// ================================================

async function cargarEstadisticasSemanales() {
    const workoutsElement = document.getElementById('workoutsThisWeek');
    const caloriesElement = document.getElementById('caloriesThisWeek');
    const minutesElement = document.getElementById('minutesThisWeek');
    
    try {
        const inicioSemana = obtenerInicioSemana();
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 7);
        
        // Obtener workouts de esta semana
        const { obtenerHistorialWorkouts } = await import('./workout-manager.js');
        const workouts = await obtenerHistorialWorkouts(usuarioActual.uid, 100);
        
        // Filtrar solo workouts de esta semana
        const workoutsSemana = workouts.filter(w => {
            const fechaWorkout = w.fecha?.toDate ? w.fecha.toDate() : new Date(w.fecha);
            return fechaWorkout >= inicioSemana && fechaWorkout < finSemana;
        });
        
        // Calcular estadísticas reales
        const totalWorkouts = workoutsSemana.length;
        const totalCalorias = workoutsSemana.reduce((sum, w) => sum + (w.estadisticas?.calorias || 0), 0);
        const totalMinutos = workoutsSemana.reduce((sum, w) => sum + (w.duracion || 0), 0);
        
        workoutsElement.textContent = totalWorkouts;
        caloriesElement.textContent = totalCalorias.toLocaleString();
        minutesElement.textContent = totalMinutos;
        
        // Guardar para el calendario
        window.workoutsSemanaData = workoutsSemana;
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        workoutsElement.textContent = '0';
        caloriesElement.textContent = '0';
        minutesElement.textContent = '0';
    }
}

function renderizarCalendarioSemanal() {
    const calendarioContainer = document.getElementById('weekCalendar');
    const hoy = new Date();
    const inicioDeSemana = obtenerInicioSemana();
    
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const workoutsSemana = window.workoutsSemanaData || [];
    
    let htmlCalendario = '';
    for (let i = 0; i < 7; i++) {
        const diaActual = new Date(inicioDeSemana);
        diaActual.setDate(inicioDeSemana.getDate() + i);
        
        const esHoy = diaActual.toDateString() === hoy.toDateString();
        
        // Verificar si hay workouts en este día
        const tieneWorkout = workoutsSemana.some(w => {
            const fechaWorkout = w.fecha?.toDate ? w.fecha.toDate() : new Date(w.fecha);
            return fechaWorkout.toDateString() === diaActual.toDateString();
        });
        
        htmlCalendario += `
            <div class="calendar-day ${esHoy ? 'today' : ''} ${tieneWorkout ? 'completed' : ''}">
                <div class="calendar-day-name">${diasSemana[i]}</div>
                <div class="calendar-day-number">${diaActual.getDate()}</div>
                ${tieneWorkout ? '<i class="fas fa-check"></i>' : ''}
            </div>
        `;
    }
    
    calendarioContainer.innerHTML = htmlCalendario;
}

// ================================================
// UTILIDADES
// ================================================

function obtenerInicioSemana() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diferencia);
    lunes.setHours(0, 0, 0, 0);
    return lunes;
}

function formatearFechaRelativa(fecha) {
    const ahora = new Date();
    const diferenciaDias = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias === 0) return 'Hoy';
    if (diferenciaDias === 1) return 'Ayer';
    if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`;
    if (diferenciaDias < 30) {
        const semanas = Math.floor(diferenciaDias / 7);
        return `Hace ${semanas} semana${semanas > 1 ? 's' : ''}`;
    }
    
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function mostrarError(mensaje) {
    console.error(mensaje);
}
