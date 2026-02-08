// ================================================
// EXPLORAR RUTINAS - Lógica Principal
// ================================================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    RUTINAS_PUBLICAS,
    filtrarRutinasPublicas,
    obtenerRutinaPublica,
    obtenerRutinasPopulares 
} from './rutinas-publicas.js';
import { copiarRutinaPublica } from './rutinas-manager.js';
import { exercisesService } from './exercises-db.js';

// ================================================
// ESTADO GLOBAL
// ================================================

let currentUser = null;
let filtrosActivos = {
    nivel: 'todos',
    objetivo: 'todos',
    dias: 'todos',
    busqueda: ''
};
let rutinasCopiadas = [];
let rutinaSeleccionada = null;
let ejerciciosCache = []; // Caché local para acceso sincrónico

// Helper para obtener ejercicio de caché
function obtenerEjercicioPorId(id) {
    return ejerciciosCache.find(e => e.id === id);
}

// ================================================
// INICIALIZACIÓN
// ================================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        inicializarApp();
    } else {
        window.location.href = 'login.html';
    }
});

async function inicializarApp() {
    // Pre-cargar ejercicios con caché
    try {
        ejerciciosCache = await exercisesService.getExercises();
        console.log('✅ Ejercicios precargados:', ejerciciosCache.length);
    } catch (error) {
        console.error('Error precargando ejercicios:', error);
    }
    
    configurarEventos();
    await cargarRutinasCopiadas();
    renderizarRutinas();
    actualizarEstadisticas();
}

// ================================================
// CONFIGURACIÓN DE EVENTOS
// ================================================

function configurarEventos() {
    // Mi Cuenta
    const navMiCuenta = document.getElementById('navMiCuenta');
    if (navMiCuenta) {
        navMiCuenta.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'mi-cuenta.html';
        });
    }

    // Nav Toggle (Mobile)
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Ir a Mis Rutinas
    document.getElementById('misRutinasBtn').addEventListener('click', () => {
        window.location.href = 'entrenar.html#rutinas';
    });

    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce((e) => {
        filtrosActivos.busqueda = e.target.value;
        aplicarFiltros();
    }, 300));

    // Filter Pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const filterType = e.target.dataset.filter;
            const filterValue = e.target.dataset.value;
            
            // Toggle active en el grupo
            const group = e.target.closest('.filter-group');
            group.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            
            // Actualizar filtros
            filtrosActivos[filterType] = filterValue;
            aplicarFiltros();
        });
    });

    // Clear Filters
    document.getElementById('clearFiltersBtn').addEventListener('click', resetearFiltros);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetearFiltros);

    // Modal
    document.getElementById('closeModal').addEventListener('click', cerrarModal);
    document.getElementById('modalCloseBtn').addEventListener('click', cerrarModal);
    document.getElementById('copiarRutinaBtn').addEventListener('click', copiarRutina);

    // Cerrar modal al hacer clic fuera
    document.getElementById('detalleModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            cerrarModal();
        }
    });
}

// ================================================
// RENDERIZADO DE RUTINAS
// ================================================

function renderizarRutinas() {
    const grid = document.getElementById('rutinasGrid');
    const emptyState = document.getElementById('emptyState');
    
    // Aplicar filtros
    const rutinas = filtrarRutinasPublicas(filtrosActivos);
    
    // Mostrar empty state si no hay resultados
    if (rutinas.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Renderizar cards
    grid.innerHTML = rutinas.map(rutina => crearRutinaCard(rutina)).join('');
    
    // Eventos de los cards
    document.querySelectorAll('.rutina-card').forEach(card => {
        card.addEventListener('click', () => {
            const rutinaId = card.dataset.rutinaId;
            mostrarDetalleRutina(rutinaId);
        });
    });
    
    // Eventos de botones copiar
    document.querySelectorAll('.btn-copy-quick').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const rutinaId = btn.dataset.rutinaId;
            await copiarRutinaDirecta(rutinaId);
        });
    });
}

function crearRutinaCard(rutina) {
    const estaCopiada = rutinasCopiadas.includes(rutina.id);
    const popularBadge = rutina.popular ? '<span class="badge badge-popular">⭐ Popular</span>' : '';
    const copiadaBadge = estaCopiada ? '<span class="badge badge-copied">✓ Guardada</span>' : '';
    
    return `
        <div class="rutina-card" data-rutina-id="${rutina.id}" style="border-left: 4px solid ${rutina.color}">
            <div class="rutina-card-header">
                <div class="rutina-icon" style="background: ${rutina.color}20">
                    ${rutina.icono}
                </div>
                <div class="rutina-badges">
                    ${popularBadge}
                    ${copiadaBadge}
                </div>
            </div>
            
            <div class="rutina-card-body">
                <h3 class="rutina-title">${rutina.nombre}</h3>
                <p class="rutina-description">${rutina.descripcion}</p>
                
                <div class="rutina-meta">
                    <div class="meta-item">
                        <span class="meta-icon">📊</span>
                        <span class="meta-text">${capitalizar(rutina.nivel)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">🎯</span>
                        <span class="meta-text">${capitalizar(rutina.objetivo)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">📅</span>
                        <span class="meta-text">${rutina.diasSemana} días/semana</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">⏱️</span>
                        <span class="meta-text">${rutina.duracionEstimada} min</span>
                    </div>
                </div>
                
                <div class="rutina-stats-mini">
                    <div class="stat-mini">
                        <span class="stat-mini-number">${rutina.ejercicios.length}</span>
                        <span class="stat-mini-label">Ejercicios</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-mini-number">${calcularSeriesTotales(rutina)}</span>
                        <span class="stat-mini-label">Series</span>
                    </div>
                </div>
            </div>
            
            <div class="rutina-card-footer">
                <button class="btn btn-outline btn-sm btn-view" onclick="event.stopPropagation()">
                    Ver detalles
                </button>
                ${!estaCopiada ? `
                    <button class="btn btn-primary btn-sm btn-copy-quick" data-rutina-id="${rutina.id}">
                        <span>📋</span> Copiar
                    </button>
                ` : `
                    <button class="btn btn-success btn-sm" disabled>
                        <span>✓</span> Ya guardada
                    </button>
                `}
            </div>
        </div>
    `;
}

// ================================================
// MODAL DETALLE
// ================================================

function mostrarDetalleRutina(rutinaId) {
    rutinaSeleccionada = obtenerRutinaPublica(rutinaId);
    if (!rutinaSeleccionada) return;
    
    const estaCopiada = rutinasCopiadas.includes(rutinaSeleccionada.id);
    
    const modal = document.getElementById('detalleModal');
    const modalBody = document.getElementById('modalBody');
    const copiarBtn = document.getElementById('copiarRutinaBtn');
    
    // Actualizar botón copiar
    if (estaCopiada) {
        copiarBtn.innerHTML = '<span>✓</span> Ya guardada';
        copiarBtn.disabled = true;
        copiarBtn.classList.remove('btn-primary');
        copiarBtn.classList.add('btn-success');
    } else {
        copiarBtn.innerHTML = '<span>📋</span> Copiar a Mis Rutinas';
        copiarBtn.disabled = false;
        copiarBtn.classList.add('btn-primary');
        copiarBtn.classList.remove('btn-success');
    }
    
    // Renderizar contenido
    modalBody.innerHTML = crearDetalleRutina(rutinaSeleccionada);
    
    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function crearDetalleRutina(rutina) {
    const ejerciciosHTML = rutina.ejercicios.map((ej, index) => {
        const ejercicio = obtenerEjercicioPorId(ej.exerciseId);
        if (!ejercicio) {
            return `
                <div class="ejercicio-item-detalle error">
                    <span class="ejercicio-numero">${index + 1}</span>
                    <div class="ejercicio-info-detalle">
                        <strong>${ej.exerciseId}</strong>
                        <span class="error-text">Ejercicio no encontrado</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="ejercicio-item-detalle">
                <span class="ejercicio-numero">${index + 1}</span>
                <div class="ejercicio-icon-detalle">${ejercicio.icono}</div>
                <div class="ejercicio-info-detalle">
                    <strong>${ejercicio.nombre}</strong>
                    <div class="ejercicio-parametros">
                        <span class="param"><strong>Series:</strong> ${ej.series}</span>
                        <span class="param"><strong>Reps:</strong> ${ej.reps}</span>
                        <span class="param"><strong>Descanso:</strong> ${ej.descanso}s</span>
                    </div>
                    ${ej.notas ? `<p class="ejercicio-notas">📝 ${ej.notas}</p>` : ''}
                </div>
                <div class="ejercicio-badges-detalle">
                    <span class="badge-mini" style="background: ${obtenerColorGrupo(ejercicio.grupoMuscular)}">
                        ${ejercicio.grupoMuscular}
                    </span>
                    <span class="badge-mini badge-dificultad-${ejercicio.dificultad}">
                        ${ejercicio.dificultad}
                    </span>
                </div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="rutina-detalle-header" style="background: linear-gradient(135deg, ${rutina.color}20, ${rutina.color}10)">
            <div class="rutina-detalle-icon" style="background: ${rutina.color}">
                ${rutina.icono}
            </div>
            <div class="rutina-detalle-info">
                <h2>${rutina.nombre}</h2>
                <p>${rutina.descripcion}</p>
                <div class="rutina-detalle-meta">
                    <span class="badge badge-nivel-${rutina.nivel}">${capitalizar(rutina.nivel)}</span>
                    <span class="badge badge-objetivo">${capitalizar(rutina.objetivo)}</span>
                    <span class="badge">${rutina.diasSemana} días/semana</span>
                    <span class="badge">${rutina.duracionEstimada} minutos</span>
                </div>
            </div>
        </div>
        
        <div class="rutina-detalle-stats">
            <div class="stat-card-detalle">
                <span class="stat-icon-detalle">💪</span>
                <div>
                    <strong>${rutina.ejercicios.length}</strong>
                    <span>Ejercicios</span>
                </div>
            </div>
            <div class="stat-card-detalle">
                <span class="stat-icon-detalle">📊</span>
                <div>
                    <strong>${calcularSeriesTotales(rutina)}</strong>
                    <span>Series totales</span>
                </div>
            </div>
            <div class="stat-card-detalle">
                <span class="stat-icon-detalle">⏱️</span>
                <div>
                    <strong>${calcularTiempoEstimado(rutina)}</strong>
                    <span>Minutos aprox.</span>
                </div>
            </div>
            <div class="stat-card-detalle">
                <span class="stat-icon-detalle">🎯</span>
                <div>
                    <strong>${rutina.gruposMusculares.length}</strong>
                    <span>Grupos musculares</span>
                </div>
            </div>
        </div>
        
        <div class="rutina-detalle-section">
            <h3>Grupos Musculares Trabajados</h3>
            <div class="grupos-musculares-tags">
                ${rutina.gruposMusculares.map(grupo => `
                    <span class="grupo-tag" style="background: ${obtenerColorGrupo(grupo)}">
                        ${capitalizar(grupo)}
                    </span>
                `).join('')}
            </div>
        </div>
        
        <div class="rutina-detalle-section">
            <h3>Ejercicios (${rutina.ejercicios.length})</h3>
            <div class="ejercicios-lista-detalle">
                ${ejerciciosHTML}
            </div>
        </div>
        
        <div class="rutina-detalle-footer">
            <p class="rutina-autor">👤 Creada por: <strong>${rutina.autor}</strong></p>
        </div>
    `;
}

function cerrarModal() {
    const modal = document.getElementById('detalleModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    rutinaSeleccionada = null;
}

// ================================================
// COPIAR RUTINA
// ================================================

async function copiarRutina() {
    if (!rutinaSeleccionada) return;
    
    try {
        mostrarToast('Copiando rutina...', 'info');
        
        await copiarRutinaPublica(currentUser.uid, rutinaSeleccionada);
        
        // Actualizar estado
        rutinasCopiadas.push(rutinaSeleccionada.id);
        localStorage.setItem(`rutinasCopiadas_${currentUser.uid}`, JSON.stringify(rutinasCopiadas));
        
        // Actualizar UI
        actualizarEstadisticas();
        renderizarRutinas();
        cerrarModal();
        
        mostrarToast('✓ Rutina copiada exitosamente a tus rutinas', 'success');
        
    } catch (error) {
        console.error('Error al copiar rutina:', error);
        mostrarToast('Error al copiar rutina. Intenta nuevamente.', 'error');
    }
}

async function copiarRutinaDirecta(rutinaId) {
    const rutina = obtenerRutinaPublica(rutinaId);
    if (!rutina) return;
    
    try {
        mostrarToast('Copiando rutina...', 'info');
        
        await copiarRutinaPublica(currentUser.uid, rutina);
        
        // Actualizar estado
        rutinasCopiadas.push(rutina.id);
        localStorage.setItem(`rutinasCopiadas_${currentUser.uid}`, JSON.stringify(rutinasCopiadas));
        
        // Actualizar UI
        actualizarEstadisticas();
        renderizarRutinas();
        
        mostrarToast(`✓ "${rutina.nombre}" copiada exitosamente`, 'success');
        
    } catch (error) {
        console.error('Error al copiar rutina:', error);
        mostrarToast('Error al copiar rutina. Intenta nuevamente.', 'error');
    }
}

async function cargarRutinasCopiadas() {
    const stored = localStorage.getItem(`rutinasCopiadas_${currentUser.uid}`);
    rutinasCopiadas = stored ? JSON.parse(stored) : [];
}

// ================================================
// FILTROS
// ================================================

function aplicarFiltros() {
    renderizarRutinas();
    actualizarFiltrosActivos();
}

function actualizarFiltrosActivos() {
    const activeFiltersContainer = document.getElementById('activeFilters');
    const activeFiltersList = document.getElementById('activeFiltersList');
    
    const filtrosAplicados = [];
    
    if (filtrosActivos.nivel !== 'todos') {
        filtrosAplicados.push({tipo: 'nivel', valor: filtrosActivos.nivel});
    }
    if (filtrosActivos.objetivo !== 'todos') {
        filtrosAplicados.push({tipo: 'objetivo', valor: filtrosActivos.objetivo});
    }
    if (filtrosActivos.dias !== 'todos') {
        filtrosAplicados.push({tipo: 'dias', valor: filtrosActivos.dias + ' días'});
    }
    if (filtrosActivos.busqueda) {
        filtrosAplicados.push({tipo: 'busqueda', valor: filtrosActivos.busqueda});
    }
    
    if (filtrosAplicados.length === 0) {
        activeFiltersContainer.style.display = 'none';
        return;
    }
    
    activeFiltersContainer.style.display = 'flex';
    activeFiltersList.innerHTML = filtrosAplicados.map(f => `
        <span class="active-filter-tag">
            ${capitalizar(f.tipo)}: ${f.valor}
        </span>
    `).join('');
}

function resetearFiltros() {
    filtrosActivos = {
        nivel: 'todos',
        objetivo: 'todos',
        dias: 'todos',
        busqueda: ''
    };
    
    // Reset UI
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.classList.remove('active');
        if (pill.dataset.value === 'todos') {
            pill.classList.add('active');
        }
    });
    
    aplicarFiltros();
}

// ================================================
// ESTADÍSTICAS
// ================================================

function actualizarEstadisticas() {
    document.getElementById('totalRutinas').textContent = RUTINAS_PUBLICAS.length;
    document.getElementById('popularRutinas').textContent = obtenerRutinasPopulares().length;
    document.getElementById('copiedRutinas').textContent = rutinasCopiadas.length;
}

// ================================================
// UTILIDADES
// ================================================

function calcularSeriesTotales(rutina) {
    return rutina.ejercicios.reduce((total, ej) => total + ej.series, 0);
}

function calcularTiempoEstimado(rutina) {
    return rutina.duracionEstimada || 60;
}

function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function obtenerColorGrupo(grupo) {
    const colores = {
        pecho: '#3b82f6',
        espalda: '#10b981',
        piernas: '#f59e0b',
        hombros: '#8b5cf6',
        biceps: '#ec4899',
        triceps: '#ef4444',
        core: '#06b6d4',
        fullbody: '#6366f1'
    };
    return colores[grupo] || '#6b7280';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo} show`;
    
    const iconos = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
        warning: '⚠'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${iconos[tipo]}</span>
        <span class="toast-message">${mensaje}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
