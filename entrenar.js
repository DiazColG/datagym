// ================================================
// ENTRENAR - STRONG STYLE REDESIGN
// ================================================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { obtenerRutinas } from './rutinas-manager.js';
import { iniciarWorkout, obtenerHistorialWorkouts } from './workout-manager.js';

let currentUser = null;
let userId = null;
let todasLasRutinas = [];
let workoutsRecientes = [];

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
    configurarEventListeners();
    await cargarDatos();
}

// ================================================
// CARGAR DATOS
// ================================================

async function cargarDatos() {
    try {
        // Cargar rutinas y workouts recientes en paralelo
        const [rutinas, workouts] = await Promise.all([
            obtenerRutinas(userId),
            obtenerHistorialWorkouts(userId, 50)
        ]);

        todasLasRutinas = rutinas;
        
        // Procesar workouts recientes (últimos 15 días)
        const hace15Dias = new Date();
        hace15Dias.setDate(hace15Dias.getDate() - 15);
        
        workoutsRecientes = workouts.filter(w => {
            const fechaWorkout = w.fecha?.toDate ? w.fecha.toDate() : new Date(w.fecha);
            return fechaWorkout >= hace15Dias;
        });

        // Renderizar
        renderizarRecientes();
        renderizarTemplates();

    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarToast('Error al cargar datos');
    }
}

// ================================================
// RENDERIZAR ENTRENAMIENTOS RECIENTES
// ================================================

function renderizarRecientes() {
    const grid = document.getElementById('recentWorkoutsGrid');
    const countBadge = document.getElementById('recentCount');
    const section = document.getElementById('recentWorkoutsSection');
    
    if (!grid) return;
    
    // Si no hay recientes, ocultar sección
    if (workoutsRecientes.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    countBadge.textContent = workoutsRecientes.length;
    
    // Limpiar
    grid.innerHTML = '';
    
    // Agrupar por rutinaId para evitar duplicados (mostrar solo último de cada rutina)
    const rutinasUnicas = new Map();
    
    workoutsRecientes.forEach(workout => {
        if (workout.rutinaId && !rutinasUnicas.has(workout.rutinaId)) {
            rutinasUnicas.set(workout.rutinaId, workout);
        }
    });
    
    // Limitar a 6 más recientes
    const recientesParaMostrar = Array.from(rutinasUnicas.values()).slice(0, 6);
    
    recientesParaMostrar.forEach(workout => {
        const card = crearCardReciente(workout);
        grid.appendChild(card);
    });
}

function crearCardReciente(workout) {
    const card = document.createElement('div');
    card.className = 'recent-workout-card';
    
    // Calcular días desde el workout
    const fechaWorkout = workout.fecha?.toDate ? workout.fecha.toDate() : new Date(workout.fecha);
    const hoy = new Date();
    const diffDias = Math.floor((hoy - fechaWorkout) / (1000 * 60 * 60 * 24));
    
    let textoFecha = '';
    if (diffDias === 0) textoFecha = 'Hoy';
    else if (diffDias === 1) textoFecha = 'Ayer';
    else textoFecha = `${diffDias}d`;
    
    // Buscar la rutina para obtener nombre
    const rutina = todasLasRutinas.find(r => r.id === workout.rutinaId);
    const nombreRutina = rutina ? rutina.nombre : workout.rutinaNombre || 'Entrenamiento';
    
    card.innerHTML = `
        <div class="recent-workout-icon">💪</div>
        <div class="recent-workout-name">${nombreRutina}</div>
        <div class="recent-workout-date">${textoFecha}</div>
        ${diffDias === 0 ? '<div class="recent-workout-badge">HOY</div>' : ''}
    `;
    
    card.addEventListener('click', () => {
        if (rutina) {
            iniciarWorkoutDesdeRutina(rutina);
        }
    });
    
    return card;
}

// ================================================
// RENDERIZAR PLANTILLAS / RUTINAS
// ================================================

function renderizarTemplates() {
    const grid = document.getElementById('templatesGrid');
    const countBadge = document.getElementById('templatesCount');
    const emptyState = document.getElementById('emptyTemplates');
    
    if (!grid) return;
    
    // Si no hay rutinas, mostrar empty state
    if (todasLasRutinas.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        countBadge.textContent = '0';
        return;
    }
    
    grid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';
    countBadge.textContent = todasLasRutinas.length;
    
    // Limpiar
    grid.innerHTML = '';
    
    // Ordenar por fecha de creación (más reciente primero)
    const rutinasOrdenadas = [...todasLasRutinas].sort((a, b) => {
        const fechaA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate() : new Date(a.fechaCreacion || 0);
        const fechaB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate() : new Date(b.fechaCreacion || 0);
        return fechaB - fechaA;
    });
    
    rutinasOrdenadas.forEach(rutina => {
        const card = crearCardTemplate(rutina);
        grid.appendChild(card);
    });
}

function crearCardTemplate(rutina) {
    const card = document.createElement('div');
    card.className = 'template-card';
    
    const numEjercicios = rutina.ejercicios?.length || 0;
    
    // Última vez realizada
    const workoutsDeEstaRutina = workoutsRecientes.filter(w => w.rutinaId === rutina.id);
    let textoUltimaVez = '';
    
    if (workoutsDeEstaRutina.length > 0) {
        const ultimo = workoutsDeEstaRutina[0];
        const fecha = ultimo.fecha?.toDate ? ultimo.fecha.toDate() : new Date(ultimo.fecha);
        const diffDias = Math.floor((new Date() - fecha) / (1000 * 60 * 60 * 24));
        
        if (diffDias === 0) textoUltimaVez = 'Última vez: Hoy';
        else if (diffDias === 1) textoUltimaVez = 'Última vez: Ayer';
        else textoUltimaVez = `Última vez: ${diffDias} días atrás`;
    }
    
    // Mostrar primeros 3 ejercicios
    const ejerciciosParaMostrar = (rutina.ejercicios || []).slice(0, 3);
    
    card.innerHTML = `
        <div class="template-header">
            <div class="template-title">
                <h4>${rutina.nombre}</h4>
                <p class="template-exercises-count">${numEjercicios} ejercicio${numEjercicios !== 1 ? 's' : ''}</p>
            </div>
            <button class="template-menu-btn" data-rutina-id="${rutina.id}">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        </div>
        
        ${ejerciciosParaMostrar.length > 0 ? `
            <div class="template-exercises">
                ${ejerciciosParaMostrar.map(ej => `
                    <div class="template-exercise-item">
                        <i class="fas fa-circle"></i>
                        ${ej.exerciseName}
                    </div>
                `).join('')}
                ${numEjercicios > 3 ? `<div class="template-exercise-item"><i class="fas fa-ellipsis-h"></i> +${numEjercicios - 3} más</div>` : ''}
            </div>
        ` : ''}
        
        <div class="template-meta">
            ${textoUltimaVez ? `
                <div class="template-meta-item">
                    <i class="fas fa-history"></i>
                    ${textoUltimaVez}
                </div>
            ` : ''}
            <div class="template-meta-item">
                <i class="fas fa-dumbbell"></i>
                ${workoutsDeEstaRutina.length} ${workoutsDeEstaRutina.length === 1 ? 'vez' : 'veces'}
            </div>
        </div>
    `;
    
    // Click en card (no en menú) = iniciar workout
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.template-menu-btn')) {
            iniciarWorkoutDesdeRutina(rutina);
        }
    });
    
    // Click en menú
    const menuBtn = card.querySelector('.template-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // TODO: Mostrar menú contextual (editar, eliminar, etc.)
            console.log('Menú de rutina:', rutina.id);
        });
    }
    
    return card;
}

// ================================================
// INICIAR WORKOUT
// ================================================

async function iniciarWorkoutVacio() {
    try {
        console.log('🚀 Iniciando workout vacío...');
        console.log('👤 UserId:', userId);
        
        if (!userId) {
            throw new Error('No hay userId disponible');
        }
        
        // Crear workout vacío
        console.log('📞 Llamando a iniciarWorkout...');
        const workoutId = await iniciarWorkout(userId, null, {
            nombre: 'Entrenamiento Libre',
            ejercicios: []
        });
        
        if (!workoutId) {
            throw new Error('iniciarWorkout no devolvió workoutId');
        }
        
        console.log('✅ Workout vacío creado:', workoutId);
        
        // Navegar a workout-activo
        const url = `workout-activo.html?workoutId=${workoutId}&empty=true`;
        console.log('🔀 Navegando a:', url);
        window.location.href = url;
        
    } catch (error) {
        console.error('❌ Error al iniciar workout vacío:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error message:', error.message);
        mostrarToast('Error al iniciar entrenamiento: ' + error.message);
    }
}

async function iniciarWorkoutDesdeRutina(rutina) {
    try {
        console.log('🚀 Iniciando workout desde rutina:', rutina.nombre);
        
        const workoutId = await iniciarWorkout(userId, rutina.id, rutina);
        
        console.log('✅ Workout creado:', workoutId);
        
        // Navegar a workout-activo
        window.location.href = `workout-activo.html?workoutId=${workoutId}`;
        
    } catch (error) {
        console.error('❌ Error al iniciar workout:', error);
        mostrarToast('Error al iniciar entrenamiento');
    }
}

// ================================================
// EVENT LISTENERS
// ================================================

function configurarEventListeners() {
    // Botón hero: Iniciar vacío
    const btnStartEmpty = document.getElementById('btnStartEmptyWorkout');
    if (btnStartEmpty) {
        btnStartEmpty.addEventListener('click', iniciarWorkoutVacio);
    }
    
    // Botón nueva rutina
    const btnNewRoutine = document.getElementById('btnNewRoutine');
    const btnCreateFirst = document.getElementById('btnCreateFirstRoutine');
    
    [btnNewRoutine, btnCreateFirst].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                // TODO: Navegar a creador de rutinas
                console.log('Crear nueva rutina');
                // window.location.href = 'crear-rutina.html';
            });
        }
    });
    
    // Botón gestionar rutinas
    const btnManage = document.getElementById('btnManageRoutines');
    if (btnManage) {
        btnManage.addEventListener('click', () => {
            // TODO: Mostrar modal de gestión
            console.log('Gestionar rutinas');
        });
    }
    
    // Nav toggle (mobile)
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Link Mi Cuenta
    const navMiCuenta = document.getElementById('navMiCuenta');
    if (navMiCuenta) {
        navMiCuenta.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'mi-cuenta.html';
        });
    }
}

// ================================================
// UTILIDADES
// ================================================

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = mensaje;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
