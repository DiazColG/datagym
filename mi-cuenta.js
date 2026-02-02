// =========================================
// MODAL MI CUENTA - LÓGICA
// =========================================

import { auth } from './firebase-config.js';
import { onAuthChange } from './auth.js';
import { 
    obtenerPerfilCompleto,
    actualizarDatosPerfil
} from './profile-manager.js';
import { calcularEdad, calcularIMC } from './profile-calculator.js';

// =========================================
// VARIABLES GLOBALES
// =========================================

let userId = null;
let perfilActual = null;
let modal = null;

// =========================================
// INICIALIZACIÓN
// =========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Modal Mi Cuenta iniciando...');
    
    modal = document.getElementById('modalMiCuenta');
    
    // Verificar autenticación
    onAuthChange((user) => {
        if (user) {
            userId = user.uid;
            console.log('Usuario autenticado en modal:', user.email);
        }
    });
    
    // Configurar tabs
    configurarTabs();
    
    // Configurar botones
    configurarBotones();
    
    // Configurar listeners de formularios
    configurarFormularios();
});

// =========================================
// ABRIR/CERRAR MODAL
// =========================================

export async function abrirModalCuenta() {
    if (!modal) {
        modal = document.getElementById('modalMiCuenta');
    }
    
    if (!userId) {
        console.error('No hay usuario autenticado');
        return;
    }
    
    try {
        // Cargar perfil del usuario
        perfilActual = await obtenerPerfilCompleto(userId);
        
        if (!perfilActual) {
            console.error('No se pudo cargar el perfil');
            return;
        }
        
        // Cargar datos en las tabs
        cargarDatosPerfil();
        cargarDatosObjetivos();
        cargarDatosConfiguracion();
        
        // Mostrar modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error al abrir modal:', error);
    }
}

export function cerrarModalCuenta() {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Hacer funciones globales
window.abrirModalCuenta = abrirModalCuenta;
window.cerrarModalCuenta = cerrarModalCuenta;

// =========================================
// CONFIGURACIÓN DE TABS
// =========================================

function configurarTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            cambiarTab(tabName);
        });
    });
}

function cambiarTab(tabName) {
    // Desactivar todos los tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activar tab seleccionado
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// =========================================
// CONFIGURACIÓN DE BOTONES
// =========================================

function configurarBotones() {
    // Botón cerrar modal
    const btnCerrar = document.getElementById('btnCerrarModal');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarModalCuenta);
    }
    
    // Cerrar al hacer clic fuera del modal
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModalCuenta();
            }
        });
    }
    
    // Botón cancelar edición
    const btnCancelar = document.getElementById('btnCancelarEdicion');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            cargarDatosPerfil(); // Recargar datos originales
        });
    }
    
    // Botón guardar configuración
    const btnGuardarConfig = document.getElementById('btnGuardarConfig');
    if (btnGuardarConfig) {
        btnGuardarConfig.addEventListener('click', guardarConfiguracion);
    }
    
    // Botón resetear perfil
    const btnReset = document.getElementById('btnResetearPerfil');
    if (btnReset) {
        btnReset.addEventListener('click', resetearPerfil);
    }
}

// =========================================
// CONFIGURACIÓN DE FORMULARIOS
// =========================================

function configurarFormularios() {
    // Formulario de editar perfil
    const formPerfil = document.getElementById('formEditarPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async function(e) {
            e.preventDefault();
            await guardarCambiosPerfil();
        });
    }
    
    // Listener para actualizar edad
    const fechaNac = document.getElementById('editFechaNacimiento');
    if (fechaNac) {
        fechaNac.addEventListener('change', actualizarEdadDisplay);
    }
    
    // Listeners para actualizar IMC
    const altura = document.getElementById('editAltura');
    const peso = document.getElementById('editPesoActual');
    
    if (altura && peso) {
        altura.addEventListener('input', actualizarIMCDisplay);
        peso.addEventListener('input', actualizarIMCDisplay);
    }
}

// =========================================
// CARGAR DATOS DEL PERFIL
// =========================================

function cargarDatosPerfil() {
    if (!perfilActual) return;
    
    // Avatar y nombre
    const avatar = document.getElementById('profileAvatar');
    const nombre = document.getElementById('profileNombre');
    const email = document.getElementById('profileEmail');
    
    if (avatar) {
        const user = auth.currentUser;
        if (user && user.photoURL) {
            avatar.src = user.photoURL;
        } else {
            avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(perfilActual.nombre)}&background=3b82f6&color=fff`;
        }
    }
    
    if (nombre) nombre.textContent = perfilActual.nombre;
    if (email) email.textContent = perfilActual.email;
    
    // Formulario de edición
    const form = {
        nombre: document.getElementById('editNombre'),
        fechaNacimiento: document.getElementById('editFechaNacimiento'),
        edad: document.getElementById('editEdad'),
        altura: document.getElementById('editAltura'),
        pesoActual: document.getElementById('editPesoActual'),
        pesoObjetivo: document.getElementById('editPesoObjetivo'),
        nivelActividad: document.getElementById('editNivelActividad'),
        objetivoPrincipal: document.getElementById('editObjetivoPrincipal')
    };
    
    if (form.nombre) form.nombre.value = perfilActual.nombre || '';
    if (form.fechaNacimiento) form.fechaNacimiento.value = perfilActual.fechaNacimiento || '';
    if (form.edad) form.edad.value = perfilActual.edad ? `${perfilActual.edad} años` : '';
    if (form.altura) form.altura.value = perfilActual.altura || '';
    if (form.pesoActual) form.pesoActual.value = perfilActual.pesoActual || '';
    if (form.pesoObjetivo) form.pesoObjetivo.value = perfilActual.pesoObjetivo || '';
    if (form.nivelActividad) form.nivelActividad.value = perfilActual.nivelActividad || 'moderado';
    if (form.objetivoPrincipal) form.objetivoPrincipal.value = perfilActual.objetivoPrincipal || 'mantenimiento';
    
    // Género (radio buttons)
    const genero = perfilActual.genero;
    const radioGenero = document.querySelector(`input[name="editGenero"][value="${genero}"]`);
    if (radioGenero) {
        radioGenero.checked = true;
    }
    
    // Actualizar IMC
    actualizarIMCDisplay();
}

// =========================================
// CARGAR DATOS DE OBJETIVOS
// =========================================

function cargarDatosObjetivos() {
    if (!perfilActual) return;
    
    // Objetivos diarios
    const calorias = document.getElementById('objCalorias');
    const proteinas = document.getElementById('objProteinas');
    const agua = document.getElementById('objAgua');
    const aguaLitros = document.getElementById('objAguaLitros');
    
    if (calorias) calorias.textContent = perfilActual.caloriasObjetivo || 0;
    if (proteinas) proteinas.textContent = perfilActual.proteinasObjetivo || 0;
    
    if (perfilActual.aguaObjetivo) {
        if (agua) agua.textContent = perfilActual.aguaObjetivo.vasos || 0;
        if (aguaLitros) aguaLitros.textContent = perfilActual.aguaObjetivo.litros || 0;
    }
    
    // Progreso de peso
    const pesoActual = document.getElementById('progPesoActual');
    const pesoObjetivo = document.getElementById('progPesoObjetivo');
    const diferencia = document.getElementById('progDiferencia');
    const estimacion = document.getElementById('estimacionTexto');
    
    if (pesoActual) pesoActual.textContent = `${perfilActual.pesoActual} kg`;
    if (pesoObjetivo) pesoObjetivo.textContent = `${perfilActual.pesoObjetivo} kg`;
    
    const diff = Math.abs(perfilActual.pesoActual - perfilActual.pesoObjetivo);
    if (diferencia) {
        const direccion = perfilActual.pesoActual > perfilActual.pesoObjetivo ? 'perder' : 'ganar';
        diferencia.textContent = `${diff.toFixed(1)} kg a ${direccion}`;
    }
    
    // Estimación de tiempo
    if (estimacion && perfilActual.objetivoSemanal && perfilActual.objetivoSemanal !== 0) {
        const semanas = Math.ceil(diff / Math.abs(perfilActual.objetivoSemanal));
        estimacion.textContent = `Tiempo estimado: ${semanas} semanas`;
    } else if (estimacion) {
        estimacion.textContent = 'Objetivo de mantenimiento';
    }
}

// =========================================
// CARGAR DATOS DE CONFIGURACIÓN
// =========================================

function cargarDatosConfiguracion() {
    if (!perfilActual) return;
    
    // Unidades
    const unidadPeso = document.getElementById('configUnidadPeso');
    const unidadAltura = document.getElementById('configUnidadAltura');
    
    if (unidadPeso) unidadPeso.value = perfilActual.unidadPeso || 'kg';
    if (unidadAltura) unidadAltura.value = perfilActual.unidadAltura || 'cm';
    
    // Modo oscuro y notificaciones (cargar de localStorage o defaults)
    const modoOscuro = document.getElementById('configModoOscuro');
    const notifAgua = document.getElementById('configNotifAgua');
    const notifEjercicio = document.getElementById('configNotifEjercicio');
    
    if (modoOscuro) {
        modoOscuro.checked = localStorage.getItem('modoOscuro') === 'true';
    }
    
    if (notifAgua) {
        notifAgua.checked = localStorage.getItem('notifAgua') !== 'false'; // true por defecto
    }
    
    if (notifEjercicio) {
        notifEjercicio.checked = localStorage.getItem('notifEjercicio') !== 'false'; // true por defecto
    }
}

// =========================================
// ACTUALIZAR EDAD DISPLAY
// =========================================

function actualizarEdadDisplay() {
    const fechaNac = document.getElementById('editFechaNacimiento').value;
    const edadDisplay = document.getElementById('editEdad');
    
    if (fechaNac && edadDisplay) {
        try {
            const edad = calcularEdad(fechaNac);
            edadDisplay.value = `${edad} años`;
        } catch (error) {
            edadDisplay.value = '';
        }
    }
}

// =========================================
// ACTUALIZAR IMC DISPLAY
// =========================================

function actualizarIMCDisplay() {
    const altura = parseFloat(document.getElementById('editAltura').value);
    const peso = parseFloat(document.getElementById('editPesoActual').value);
    
    const valorIMC = document.getElementById('editImcValor');
    const categoriaIMC = document.getElementById('editImcCategoria');
    
    if (altura && peso && altura > 0 && peso > 0) {
        try {
            const resultado = calcularIMC(peso, altura);
            
            if (valorIMC) valorIMC.textContent = resultado.imc;
            
            if (categoriaIMC) {
                categoriaIMC.className = `imc-categoria ${resultado.categoria}`;
                categoriaIMC.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    <span>${resultado.descripcion}</span>
                `;
            }
        } catch (error) {
            if (valorIMC) valorIMC.textContent = '-';
            if (categoriaIMC) {
                categoriaIMC.className = 'imc-categoria';
                categoriaIMC.innerHTML = '<i class="fas fa-info-circle"></i><span>-</span>';
            }
        }
    }
}

// =========================================
// GUARDAR CAMBIOS DEL PERFIL
// =========================================

async function guardarCambiosPerfil() {
    if (!userId) return;
    
    try {
        mostrarLoading(true);
        
        // Recopilar datos del formulario
        const datos = {
            nombre: document.getElementById('editNombre').value.trim(),
            fechaNacimiento: document.getElementById('editFechaNacimiento').value,
            genero: document.querySelector('input[name="editGenero"]:checked').value,
            altura: parseFloat(document.getElementById('editAltura').value),
            pesoActual: parseFloat(document.getElementById('editPesoActual').value),
            pesoObjetivo: parseFloat(document.getElementById('editPesoObjetivo').value),
            nivelActividad: document.getElementById('editNivelActividad').value,
            objetivoPrincipal: document.getElementById('editObjetivoPrincipal').value
        };
        
        // Validar datos
        if (!datos.nombre || !datos.fechaNacimiento || !datos.genero) {
            mostrarError('Por favor completa todos los campos requeridos');
            mostrarLoading(false);
            return;
        }
        
        // Actualizar en Firestore
        await actualizarDatosPerfil(userId, datos);
        
        // Actualizar perfil actual
        perfilActual = await obtenerPerfilCompleto(userId);
        
        // Recargar datos en todas las tabs
        cargarDatosPerfil();
        cargarDatosObjetivos();
        
        mostrarExito('Perfil actualizado correctamente');
        mostrarLoading(false);
        
        // Disparar evento personalizado para que otras páginas se actualicen
        window.dispatchEvent(new CustomEvent('perfilActualizado', { 
            detail: perfilActual 
        }));
        
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        mostrarError('Error al guardar los cambios');
        mostrarLoading(false);
    }
}

// =========================================
// GUARDAR CONFIGURACIÓN
// =========================================

async function guardarConfiguracion() {
    if (!userId) return;
    
    try {
        mostrarLoading(true);
        
        // Recopilar configuración
        const config = {
            unidadPeso: document.getElementById('configUnidadPeso').value,
            unidadAltura: document.getElementById('configUnidadAltura').value
        };
        
        // Guardar en Firestore
        await actualizarDatosPerfil(userId, config);
        
        // Guardar preferencias locales
        const modoOscuro = document.getElementById('configModoOscuro').checked;
        const notifAgua = document.getElementById('configNotifAgua').checked;
        const notifEjercicio = document.getElementById('configNotifEjercicio').checked;
        
        localStorage.setItem('modoOscuro', modoOscuro);
        localStorage.setItem('notifAgua', notifAgua);
        localStorage.setItem('notifEjercicio', notifEjercicio);
        
        // Aplicar modo oscuro si está activado
        if (modoOscuro) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        mostrarExito('Configuración guardada correctamente');
        mostrarLoading(false);
        
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        mostrarError('Error al guardar la configuración');
        mostrarLoading(false);
    }
}

// =========================================
// RESETEAR PERFIL
// =========================================

async function resetearPerfil() {
    const confirmacion = confirm(
        '¿Estás seguro de que deseas restablecer tu perfil?\n\n' +
        'Se borrarán todos tus datos de perfil y deberás completar el onboarding nuevamente.\n\n' +
        'Esta acción NO puede deshacerse.'
    );
    
    if (!confirmacion) return;
    
    try {
        mostrarLoading(true);
        
        // Actualizar perfil marcándolo como incompleto
        await actualizarDatosPerfil(userId, { perfilCompleto: false });
        
        mostrarExito('Perfil restablecido. Redirigiendo al onboarding...');
        
        setTimeout(() => {
            window.location.href = 'onboarding.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al resetear perfil:', error);
        mostrarError('Error al restablecer el perfil');
        mostrarLoading(false);
    }
}

// =========================================
// UTILIDADES
// =========================================

function mostrarLoading(mostrar) {
    // Crear o remover overlay de loading
    let overlay = document.getElementById('loadingModalOverlay');
    
    if (mostrar) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingModalOverlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                    <p style="color: #374151; font-weight: 600;">Guardando...</p>
                </div>
            `;
            
            const modalContainer = document.querySelector('.modal-container');
            if (modalContainer) {
                modalContainer.style.position = 'relative';
                modalContainer.appendChild(overlay);
            }
        }
    } else {
        if (overlay) {
            overlay.remove();
        }
    }
}

function mostrarExito(mensaje) {
    mostrarToast(mensaje, 'success');
}

function mostrarError(mensaje) {
    mostrarToast(mensaje, 'error');
}

function mostrarToast(mensaje, tipo) {
    const toast = document.createElement('div');
    const backgroundColor = tipo === 'success' ? '#10b981' : '#ef4444';
    const icon = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 100000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        ${mensaje}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Añadir estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
