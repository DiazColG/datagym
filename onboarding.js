// =========================================
// ONBOARDING WIZARD - LÓGICA
// =========================================

import { auth } from './firebase-config.js';
import { onAuthChange } from './auth.js';
import { guardarPerfilCompleto } from './profile-manager.js';
import { calcularEdad, calcularIMC } from './profile-calculator.js';

// =========================================
// VARIABLES GLOBALES
// =========================================

let currentStep = 1;
let userId = null;
let userEmail = null;
const formData = {};

// =========================================
// INICIALIZACIÓN
// =========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Onboarding iniciando...');
    
    // Verificar autenticación
    onAuthChange((user) => {
        if (user) {
            userId = user.uid;
            userEmail = user.email;
            console.log('Usuario autenticado:', userEmail);
            
            // Pre-llenar nombre si está disponible
            const nombreInput = document.getElementById('nombre');
            if (user.displayName && nombreInput) {
                nombreInput.value = user.displayName;
            }
        } else {
            // No autenticado, redirigir a login
            window.location.href = 'auth.html';
        }
    });
    
    // Configurar fecha máxima (hoy)
    const fechaNacimiento = document.getElementById('fechaNacimiento');
    if (fechaNacimiento) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaNacimiento.max = hoy;
        
        // Listener para mostrar edad
        fechaNacimiento.addEventListener('change', mostrarEdad);
    }
    
    // Listeners para IMC preview
    const altura = document.getElementById('altura');
    const pesoActual = document.getElementById('pesoActual');
    
    if (altura && pesoActual) {
        altura.addEventListener('input', actualizarIMCPreview);
        pesoActual.addEventListener('input', actualizarIMCPreview);
    }
    
    // Listener para botón finalizar
    const btnFinalizar = document.getElementById('btnFinalizar');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', finalizarOnboarding);
    }
    
    // Hacer funciones globales para onclick
    window.nextStep = nextStep;
    window.previousStep = previousStep;
});

// =========================================
// NAVEGACIÓN ENTRE PASOS
// =========================================

function nextStep(step) {
    // Validar paso actual antes de avanzar
    if (!validarPasoActual(currentStep)) {
        return;
    }
    
    // Guardar datos del paso actual
    guardarDatosPaso(currentStep);
    
    // Si vamos al paso 4, mostrar resumen
    if (step === 4) {
        mostrarResumen();
    }
    
    // Cambiar a siguiente paso
    cambiarPaso(step);
}

function previousStep(step) {
    cambiarPaso(step);
}

function cambiarPaso(nuevoStep) {
    // Ocultar paso actual
    const pasoActual = document.getElementById(`step${currentStep}`);
    if (pasoActual) {
        pasoActual.classList.remove('active');
    }
    
    // Mostrar nuevo paso
    const pasoNuevo = document.getElementById(`step${nuevoStep}`);
    if (pasoNuevo) {
        pasoNuevo.classList.add('active');
    }
    
    // Actualizar indicador de progreso
    actualizarIndicadorProgreso(nuevoStep);
    
    // Actualizar paso actual
    currentStep = nuevoStep;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function actualizarIndicadorProgreso(step) {
    const dots = document.querySelectorAll('.step-dot');
    const lines = document.querySelectorAll('.step-line');
    
    dots.forEach((dot, index) => {
        const stepNum = index + 1;
        dot.classList.remove('active', 'completed');
        
        if (stepNum < step) {
            dot.classList.add('completed');
        } else if (stepNum === step) {
            dot.classList.add('active');
        }
    });
    
    lines.forEach((line, index) => {
        line.classList.remove('completed');
        if (index + 1 < step) {
            line.classList.add('completed');
        }
    });
}

// =========================================
// VALIDACIÓN
// =========================================

function validarPasoActual(step) {
    const form = document.querySelector(`#step${step} form`);
    if (!form) return true;
    
    const inputs = form.querySelectorAll('input[required]');
    let valido = true;
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            const name = input.name;
            const checked = form.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                valido = false;
                mostrarError(`Por favor selecciona una opción para ${name}`);
            }
        } else {
            if (!input.value.trim()) {
                valido = false;
                input.style.borderColor = '#ef4444';
                mostrarError('Por favor completa todos los campos requeridos');
            } else {
                input.style.borderColor = '#e5e7eb';
            }
        }
    });
    
    // Validaciones específicas por paso
    if (step === 1 && valido) {
        const fechaNac = document.getElementById('fechaNacimiento').value;
        try {
            const edad = calcularEdad(fechaNac);
            if (edad < 15 || edad > 100) {
                valido = false;
                mostrarError('La edad debe estar entre 15 y 100 años');
            }
        } catch (error) {
            valido = false;
            mostrarError('Fecha de nacimiento inválida');
        }
    }
    
    if (step === 2 && valido) {
        const altura = parseFloat(document.getElementById('altura').value);
        const peso = parseFloat(document.getElementById('pesoActual').value);
        const pesoObj = parseFloat(document.getElementById('pesoObjetivo').value);
        
        if (altura < 100 || altura > 250) {
            valido = false;
            mostrarError('La altura debe estar entre 100 y 250 cm');
        }
        
        if (peso < 30 || peso > 300) {
            valido = false;
            mostrarError('El peso debe estar entre 30 y 300 kg');
        }
        
        if (pesoObj < 30 || pesoObj > 300) {
            valido = false;
            mostrarError('El peso objetivo debe estar entre 30 y 300 kg');
        }
    }
    
    return valido;
}

function mostrarError(mensaje) {
    // Crear toast de error
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${mensaje}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function mostrarExito(mensaje) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${mensaje}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =========================================
// GUARDAR DATOS DEL PASO
// =========================================

function guardarDatosPaso(step) {
    switch (step) {
        case 1:
            formData.nombre = document.getElementById('nombre').value.trim();
            formData.fechaNacimiento = document.getElementById('fechaNacimiento').value;
            const generoChecked = document.querySelector('input[name="genero"]:checked');
            formData.genero = generoChecked ? generoChecked.value : '';
            break;
            
        case 2:
            formData.altura = parseFloat(document.getElementById('altura').value);
            formData.pesoActual = parseFloat(document.getElementById('pesoActual').value);
            formData.pesoObjetivo = parseFloat(document.getElementById('pesoObjetivo').value);
            break;
            
        case 3:
            formData.nivelActividad = document.querySelector('input[name="nivelActividad"]:checked').value;
            formData.objetivoPrincipal = document.querySelector('input[name="objetivoPrincipal"]:checked').value;
            break;
    }
}

// =========================================
// MOSTRAR EDAD
// =========================================

function mostrarEdad() {
    const fechaNac = document.getElementById('fechaNacimiento').value;
    const edadDisplay = document.querySelector('.edad-display');
    
    if (fechaNac && edadDisplay) {
        try {
            const edad = calcularEdad(fechaNac);
            edadDisplay.textContent = `Edad: ${edad} años`;
        } catch (error) {
            edadDisplay.textContent = '';
        }
    }
}

// =========================================
// PREVIEW DE IMC
// =========================================

function actualizarIMCPreview() {
    const altura = parseFloat(document.getElementById('altura').value);
    const peso = parseFloat(document.getElementById('pesoActual').value);
    const preview = document.getElementById('imcPreview');
    
    if (altura && peso && altura > 0 && peso > 0) {
        try {
            const resultado = calcularIMC(peso, altura);
            
            preview.style.display = 'block';
            document.getElementById('imcValor').textContent = resultado.imc;
            
            const categoria = document.getElementById('imcCategoria');
            categoria.className = `imc-categoria ${resultado.categoria}`;
            categoria.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>${resultado.descripcion}</span>
            `;
        } catch (error) {
            preview.style.display = 'none';
        }
    } else {
        preview.style.display = 'none';
    }
}

// =========================================
// MOSTRAR RESUMEN
// =========================================

async function mostrarResumen() {
    // Información personal
    document.getElementById('summaryNombre').textContent = formData.nombre;
    
    try {
        const edad = calcularEdad(formData.fechaNacimiento);
        document.getElementById('summaryEdad').textContent = `${edad} años`;
    } catch (error) {
        document.getElementById('summaryEdad').textContent = '-';
    }
    
    document.getElementById('summaryGenero').textContent = 
        formData.genero === 'masculino' ? 'Masculino' : 'Femenino';
    
    // Datos físicos
    document.getElementById('summaryAltura').textContent = `${formData.altura} cm`;
    document.getElementById('summaryPesoActual').textContent = `${formData.pesoActual} kg`;
    document.getElementById('summaryPesoObjetivo').textContent = `${formData.pesoObjetivo} kg`;
    
    // IMC
    try {
        const imc = calcularIMC(formData.pesoActual, formData.altura);
        document.getElementById('summaryIMC').textContent = 
            `${imc.imc} (${imc.descripcion})`;
    } catch (error) {
        document.getElementById('summaryIMC').textContent = '-';
    }
    
    // Calcular objetivos usando profile-calculator
    try {
        const { calcularPerfilCompleto } = await import('./profile-calculator.js');
        const perfil = calcularPerfilCompleto({
            peso: formData.pesoActual,
            altura: formData.altura,
            fechaNacimiento: formData.fechaNacimiento,
            genero: formData.genero,
            nivelActividad: formData.nivelActividad,
            objetivoPrincipal: formData.objetivoPrincipal
        });
        
        document.getElementById('summaryCalorias').textContent = perfil.caloriasObjetivo;
        document.getElementById('summaryProteinas').textContent = perfil.proteinasObjetivo;
        document.getElementById('summaryAgua').textContent = perfil.aguaObjetivo.vasos;
    } catch (error) {
        console.error('Error al calcular objetivos:', error);
    }
}

// =========================================
// FINALIZAR ONBOARDING
// =========================================

async function finalizarOnboarding() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const btnFinalizar = document.getElementById('btnFinalizar');
    
    try {
        // Mostrar loading
        loadingOverlay.style.display = 'flex';
        btnFinalizar.disabled = true;
        
        // Preparar datos completos
        const datosCompletos = {
            ...formData,
            email: userEmail,
            unidadPeso: 'kg',
            unidadAltura: 'cm'
        };
        
        console.log('Guardando perfil:', datosCompletos);
        
        // Guardar en Firestore
        await guardarPerfilCompleto(userId, datosCompletos);
        
        // Mostrar mensaje de éxito
        mostrarExito('¡Perfil creado exitosamente!');
        
        // Esperar un momento y redirigir
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al finalizar onboarding:', error);
        mostrarError('Error al guardar el perfil. Por favor, intenta de nuevo.');
        loadingOverlay.style.display = 'none';
        btnFinalizar.disabled = false;
    }
}

// =========================================
// ESTILOS DE ANIMACIÓN
// =========================================

// Añadir estilos de animación dinámicamente
const style = document.createElement('style');
style.textContent = `
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
