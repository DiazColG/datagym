// =========================================
// EXPLORAR PROGRAMAS - LÓGICA
// =========================================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { obtenerProgramasPublicos, filtrarProgramasPublicos } from './programas-publicos.js';
import { copiarProgramaPublico, obtenerProgramas, iniciarPrograma, pausarPrograma, reanudarPrograma } from './programas-manager.js';

// =========================================
// VARIABLES GLOBALES
// =========================================

let currentUser = null;
let userId = null;
let programasPublicos = [];
let filtrosActivos = {
    nivel: 'todos',
    objetivo: 'todos',
    duracion: 'todos'
};

// =========================================
// INICIALIZACIÓN
// =========================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userId = user.uid;
        console.log('✅ Usuario autenticado:', userId);
        inicializar();
    } else {
        console.log('❌ No hay usuario autenticado');
        window.location.href = 'login.html';
    }
});

function inicializar() {
    // Cargar programas públicos
    programasPublicos = obtenerProgramasPublicos();
    renderizarProgramas();
    
    // Event listeners
    configurarEventListeners();
}

// =========================================
// EVENT LISTENERS
// =========================================

function configurarEventListeners() {
    // Botones de filtro
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const filtro = pill.dataset.filtro;
            const valor = pill.dataset.valor;
            
            // Actualizar estado activo
            const grupo = pill.parentElement;
            grupo.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            // Actualizar filtros
            filtrosActivos[filtro] = valor;
            
            // Re-renderizar
            renderizarProgramas();
        });
    });
    
    // Botón Mis Programas
    const btnMisProgramas = document.getElementById('btnMisProgramas');
    if (btnMisProgramas) {
        btnMisProgramas.addEventListener('click', mostrarMisProgramas);
    }
    
    // Cerrar modales
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', cerrarModal);
    
    const btnCerrarMisProgramas = document.getElementById('btnCerrarMisProgramas');
    const modalMisProgramasBackdrop = document.getElementById('modalMisProgramasBackdrop');
    if (btnCerrarMisProgramas) btnCerrarMisProgramas.addEventListener('click', cerrarModalMisProgramas);
    if (modalMisProgramasBackdrop) modalMisProgramasBackdrop.addEventListener('click', cerrarModalMisProgramas);
    
    // Nav toggle para móvil
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// =========================================
// RENDERIZAR PROGRAMAS
// =========================================

function renderizarProgramas() {
    const programasGrid = document.getElementById('programasGrid');
    const contadorResultados = document.getElementById('contadorResultados');
    
    if (!programasGrid) return;
    
    // Filtrar programas
    let programasFiltrados = [...programasPublicos];
    
    if (filtrosActivos.nivel !== 'todos') {
        programasFiltrados = programasFiltrados.filter(p => p.nivelDificultad === filtrosActivos.nivel);
    }
    
    if (filtrosActivos.objetivo !== 'todos') {
        programasFiltrados = programasFiltrados.filter(p => p.objetivo === filtrosActivos.objetivo);
    }
    
    if (filtrosActivos.duracion !== 'todos') {
        if (filtrosActivos.duracion === 'corto') {
            programasFiltrados = programasFiltrados.filter(p => p.duracionSemanas <= 6);
        } else if (filtrosActivos.duracion === 'medio') {
            programasFiltrados = programasFiltrados.filter(p => p.duracionSemanas > 6 && p.duracionSemanas <= 10);
        } else if (filtrosActivos.duracion === 'largo') {
            programasFiltrados = programasFiltrados.filter(p => p.duracionSemanas > 10);
        }
    }
    
    // Actualizar contador
    if (contadorResultados) {
        contadorResultados.textContent = programasFiltrados.length;
    }
    
    // Limpiar grid
    programasGrid.innerHTML = '';
    
    // Renderizar tarjetas
    if (programasFiltrados.length === 0) {
        programasGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-500);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No se encontraron programas con los filtros seleccionados</p>
            </div>
        `;
        return;
    }
    
    programasFiltrados.forEach(programa => {
        const card = crearTarjetaPrograma(programa);
        programasGrid.appendChild(card);
    });
}

function crearTarjetaPrograma(programa) {
    const card = document.createElement('div');
    card.className = 'programa-card';
    
    // Etiquetas de nivel
    const nivelLabels = {
        'principiante': 'Principiante',
        'intermedio': 'Intermedio',
        'avanzado': 'Avanzado'
    };
    
    const objetivoLabels = {
        'hipertrofia': 'Hipertrofia',
        'fuerza': 'Fuerza',
        'hibrido': 'Híbrido',
        'resistencia': 'Resistencia'
    };
    
    card.innerHTML = `
        <div class="programa-header">
            <div class="programa-icon">${programa.imagen}</div>
            <h3>${programa.nombre}</h3>
            <div class="programa-duracion">
                <i class="fas fa-calendar-week"></i>
                ${programa.duracionSemanas} semanas
            </div>
        </div>
        <div class="programa-body">
            <p class="programa-descripcion">${programa.descripcion}</p>
            <div class="programa-badges">
                <span class="badge badge-nivel">
                    <i class="fas fa-signal"></i>
                    ${nivelLabels[programa.nivelDificultad]}
                </span>
                <span class="badge badge-objetivo">
                    <i class="fas fa-bullseye"></i>
                    ${objetivoLabels[programa.objetivo]}
                </span>
                ${programa.frecuenciaSemanal ? `
                    <span class="badge badge-frecuencia">
                        <i class="fas fa-dumbbell"></i>
                        ${programa.frecuenciaSemanal}x/semana
                    </span>
                ` : ''}
            </div>
            <div class="programa-stats">
                <div class="stat-item">
                    <div class="stat-value">${programa.duracionSemanas}</div>
                    <div class="stat-label">Semanas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${programa.semanas.length}</div>
                    <div class="stat-label">Fases</div>
                </div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => mostrarDetallePrograma(programa));
    
    return card;
}

// =========================================
// MODAL DE DETALLE
// =========================================

function mostrarDetallePrograma(programa) {
    const modal = document.getElementById('modalDetallePrograma');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalBody) return;
    
    const nivelLabels = {
        'principiante': 'Principiante',
        'intermedio': 'Intermedio',
        'avanzado': 'Avanzado'
    };
    
    const objetivoLabels = {
        'hipertrofia': 'Hipertrofia',
        'fuerza': 'Fuerza',
        'hibrido': 'Híbrido',
        'resistencia': 'Resistencia'
    };
    
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Total de workouts
    const totalWorkouts = programa.semanas.reduce((acc, sem) => {
        return acc + sem.rutinas.filter(r => r.tipo !== 'descanso').length;
    }, 0);
    
    modalBody.innerHTML = `
        <div class="programa-detalle-header">
            <div class="programa-detalle-icon">${programa.imagen}</div>
            <h2>${programa.nombre}</h2>
            <p class="programa-detalle-descripcion">${programa.descripcion}</p>
            
            <div class="programa-detalle-badges">
                <span class="badge badge-nivel">
                    <i class="fas fa-signal"></i>
                    ${nivelLabels[programa.nivelDificultad]}
                </span>
                <span class="badge badge-objetivo">
                    <i class="fas fa-bullseye"></i>
                    ${objetivoLabels[programa.objetivo]}
                </span>
                ${programa.frecuenciaSemanal ? `
                    <span class="badge badge-frecuencia">
                        <i class="fas fa-dumbbell"></i>
                        ${programa.frecuenciaSemanal} días/semana
                    </span>
                ` : ''}
            </div>
            
            <div class="programa-detalle-stats">
                <div class="detalle-stat-card">
                    <i class="fas fa-calendar-week"></i>
                    <div class="detalle-stat-value">${programa.duracionSemanas}</div>
                    <div class="detalle-stat-label">Semanas</div>
                </div>
                <div class="detalle-stat-card">
                    <i class="fas fa-layer-group"></i>
                    <div class="detalle-stat-value">${programa.semanas.length}</div>
                    <div class="detalle-stat-label">Fases</div>
                </div>
                <div class="detalle-stat-card">
                    <i class="fas fa-dumbbell"></i>
                    <div class="detalle-stat-value">${totalWorkouts}</div>
                    <div class="detalle-stat-label">Workouts</div>
                </div>
            </div>
        </div>
        
        <div class="programa-semanas">
            <h3><i class="fas fa-list-ol"></i> Estructura del Programa</h3>
            ${programa.semanas.map(semana => `
                <div class="semana-item">
                    <div class="semana-header">
                        <div class="semana-numero">${semana.numero}</div>
                        <div class="semana-info">
                            <h4>${semana.nombre}</h4>
                            <p>${semana.descripcion}</p>
                        </div>
                    </div>
                    <div class="semana-rutinas">
                        ${semana.rutinas.map(rutina => `
                            <div class="rutina-item">
                                <div class="rutina-dia">${diasSemana[rutina.dia]}</div>
                                <div class="rutina-info">
                                    <h5>${rutina.nombre}</h5>
                                    <p class="rutina-tipo">${rutina.tipo || ''}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="programa-actions">
            <button class="btn-copiar-programa" id="btnCopiarPrograma">
                <i class="fas fa-copy"></i>
                Copiar a Mis Programas
            </button>
        </div>
    `;
    
    // Event listener para copiar
    const btnCopiar = document.getElementById('btnCopiarPrograma');
    if (btnCopiar) {
        btnCopiar.addEventListener('click', async () => {
            await copiarPrograma(programa);
        });
    }
    
    modal.classList.add('active');
}

function cerrarModal() {
    const modal = document.getElementById('modalDetallePrograma');
    if (modal) {
        modal.classList.remove('active');
    }
}

// =========================================
// COPIAR PROGRAMA
// =========================================

async function copiarPrograma(programa) {
    try {
        mostrarToast('Copiando programa...');
        
        await copiarProgramaPublico(userId, programa);
        
        mostrarToast('✅ Programa copiado exitosamente');
        cerrarModal();
        
    } catch (error) {
        console.error('Error al copiar programa:', error);
        mostrarToast('❌ Error al copiar programa');
    }
}

// =========================================
// MIS PROGRAMAS
// =========================================

async function mostrarMisProgramas() {
    try {
        const programas = await obtenerProgramas(userId);
        
        const modal = document.getElementById('modalMisProgramas');
        const modalBody = document.getElementById('modalMisProgramasBody');
        
        if (!modal || !modalBody) return;
        
        if (programas.length === 0) {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--gray-500);">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Aún no tienes programas guardados</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Explora los programas disponibles y copia uno para comenzar</p>
                </div>
            `;
        } else {
            modalBody.innerHTML = `
                <div class="mis-programas-grid">
                    ${programas.map(programa => crearTarjetaMiPrograma(programa)).join('')}
                </div>
            `;
            
            // Agregar event listeners para botones
            programas.forEach(programa => {
                const btnIniciar = document.getElementById(`btnIniciar_${programa.id}`);
                const btnPausar = document.getElementById(`btnPausar_${programa.id}`);
                const btnReanudar = document.getElementById(`btnReanudar_${programa.id}`);
                
                if (btnIniciar) {
                    btnIniciar.addEventListener('click', async () => {
                        await iniciarPrograma(userId, programa.id);
                        mostrarToast('✅ Programa iniciado');
                        mostrarMisProgramas();
                    });
                }
                
                if (btnPausar) {
                    btnPausar.addEventListener('click', async () => {
                        await pausarPrograma(userId, programa.id);
                        mostrarToast('⏸️ Programa pausado');
                        mostrarMisProgramas();
                    });
                }
                
                if (btnReanudar) {
                    btnReanudar.addEventListener('click', async () => {
                        await reanudarPrograma(userId, programa.id);
                        mostrarToast('▶️ Programa reanudado');
                        mostrarMisProgramas();
                    });
                }
            });
        }
        
        modal.classList.add('active');
        
    } catch (error) {
        console.error('Error al cargar mis programas:', error);
        mostrarToast('❌ Error al cargar programas');
    }
}

function crearTarjetaMiPrograma(programa) {
    const progreso = calcularProgreso(programa);
    
    const estadoLabels = {
        'no_iniciado': { texto: 'No iniciado', clase: '' },
        'activo': { texto: 'Activo', clase: 'estado-activo' },
        'completado': { texto: 'Completado', clase: 'estado-completado' },
        'pausado': { texto: 'Pausado', clase: 'estado-pausado' }
    };
    
    const estadoInfo = estadoLabels[programa.estado] || estadoLabels['no_iniciado'];
    
    return `
        <div class="mi-programa-card">
            <div class="mi-programa-icon">${programa.imagen}</div>
            <div class="mi-programa-info">
                <h4>${programa.nombre}</h4>
                <div class="programa-badges">
                    <span class="badge badge-nivel">
                        <i class="fas fa-calendar-week"></i>
                        ${programa.duracionSemanas} semanas
                    </span>
                    <span class="programa-estado ${estadoInfo.clase}">
                        ${estadoInfo.texto}
                    </span>
                </div>
                ${programa.estado !== 'no_iniciado' ? `
                    <div class="mi-programa-progreso">
                        <div class="progreso-bar">
                            <div class="progreso-fill" style="width: ${progreso}%"></div>
                        </div>
                        <p class="progreso-text">
                            Semana ${programa.progreso?.semanaActual || 0} de ${programa.duracionSemanas} 
                            • ${programa.progreso?.workoutsCompletados || 0} workouts completados
                        </p>
                    </div>
                ` : ''}
            </div>
            <div class="mi-programa-actions">
                ${programa.estado === 'no_iniciado' ? `
                    <button class="btn btn-primary btn-small" id="btnIniciar_${programa.id}">
                        <i class="fas fa-play"></i> Iniciar
                    </button>
                ` : ''}
                ${programa.estado === 'activo' ? `
                    <button class="btn btn-secondary btn-small" id="btnPausar_${programa.id}">
                        <i class="fas fa-pause"></i> Pausar
                    </button>
                ` : ''}
                ${programa.estado === 'pausado' ? `
                    <button class="btn btn-primary btn-small" id="btnReanudar_${programa.id}">
                        <i class="fas fa-play"></i> Reanudar
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function calcularProgreso(programa) {
    if (!programa.progreso || programa.progreso.semanaActual === 0) {
        return 0;
    }
    
    const porcentaje = (programa.progreso.semanaActual / programa.duracionSemanas) * 100;
    return Math.min(100, Math.round(porcentaje));
}

function cerrarModalMisProgramas() {
    const modal = document.getElementById('modalMisProgramas');
    if (modal) {
        modal.classList.remove('active');
    }
}

// =========================================
// TOAST NOTIFICATION
// =========================================

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
