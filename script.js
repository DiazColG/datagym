// =========================================
// DATAGYM - APLICACIÓN DE SALUD FÍSICA
// Código principal en JavaScript con Firebase
// =========================================

// Importar módulos de Firebase
import { onAuthChange, logout as firebaseLogout } from './auth.js';
import {
    guardarEjercicio,
    obtenerEjercicios,
    eliminarEjercicio,
    escucharEjercicios,
    guardarPeso,
    obtenerHistorialPeso,
    escucharPeso,
    guardarAgua,
    obtenerAguaDelDia,
    incrementarVasoAgua,
    escucharAguaDelDia
} from './firestore.js';

// =========================================
// VARIABLES GLOBALES
// =========================================

let currentUser = null;
let userId = null;
let unsubscribeEjercicios = null;
let unsubscribePeso = null;
let unsubscribeAgua = null;
let fechaActual = new Date().toISOString().slice(0, 10);
let checkMidnightInterval = null;

// =========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =========================================

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DataGym iniciando...');
    
    // Escuchar cambios de autenticación
    onAuthChange(async (user) => {
        if (user) {
            // Usuario autenticado
            currentUser = user;
            userId = user.uid;
            console.log('Usuario autenticado:', user.email);
            
            // Mostrar información del usuario
            mostrarInfoUsuario(user);
            
            // Migrar datos locales a Firestore (solo una vez)
            await migrarDatosLocalesAFirestore();
            
            // Inicializar la aplicación
            inicializarApp();
            
            // Ocultar loading
            hideLoading();
        } else {
            // Usuario no autenticado - redirigir a login
            console.log('No hay usuario autenticado');
            window.location.href = 'auth.html';
        }
    });
});

// =========================================
// FUNCIONES DE AUTENTICACIÓN Y USUARIO
// =========================================

function mostrarInfoUsuario(user) {
    // Mostrar nombre del usuario en el mensaje de bienvenida
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        const nombre = user.displayName || user.email.split('@')[0];
        welcomeMessage.innerHTML = `<i class="fas fa-dumbbell"></i> Bienvenido, ${nombre}`;
    }
    
    // Mostrar avatar y nombre en header (si existe)
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.style.display = 'flex';
    }
    
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
        } else {
            // Avatar por defecto
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=3b82f6&color=fff`;
        }
    }
    
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = user.displayName || user.email;
    }
}

function configurarLogout() {
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                // Limpiar interval de verificación de medianoche
                if (checkMidnightInterval) {
                    clearInterval(checkMidnightInterval);
                }
                
                // Desuscribir listeners
                if (unsubscribeEjercicios) unsubscribeEjercicios();
                if (unsubscribePeso) unsubscribePeso();
                if (unsubscribeAgua) unsubscribeAgua();
                
                await firebaseLogout();
                window.location.href = 'auth.html';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                showToast('❌ Error al cerrar sesión', 'error');
            }
        });
    }
}

function hideLoading() {
    const appLoading = document.getElementById('appLoading');
    if (appLoading) {
        appLoading.style.display = 'none';
    }
}

// =========================================
// MIGRACIÓN DE DATOS LOCALES A FIRESTORE
// =========================================

async function migrarDatosLocalesAFirestore() {
    // Verificar si ya se migró anteriormente
    const yaMigrado = localStorage.getItem('dataMigrated');
    if (yaMigrado === 'true') {
        console.log('Datos ya migrados anteriormente');
        return;
    }
    
    try {
        console.log('Iniciando migración de datos locales a Firestore...');
        
        // Verificar si hay datos en Firestore
        const ejerciciosExistentes = await obtenerEjercicios(userId);
        if (ejerciciosExistentes.length > 0) {
            console.log('Ya hay datos en Firestore, saltando migración');
            localStorage.setItem('dataMigrated', 'true');
            return;
        }
        
        // Migrar ejercicios
        const ejerciciosLocal = localStorage.getItem('ejercicios');
        if (ejerciciosLocal) {
            const ejercicios = JSON.parse(ejerciciosLocal);
            console.log(`Migrando ${ejercicios.length} ejercicios...`);
            
            for (const ejercicio of ejercicios) {
                try {
                    await guardarEjercicio(userId, {
                        nombre: ejercicio.nombre,
                        duracion: ejercicio.duracion,
                        calorias: ejercicio.calorias,
                        fecha: ejercicio.fecha,
                        fechaISO: ejercicio.fecha.slice(0, 10)
                    });
                } catch (error) {
                    console.error('Error al migrar ejercicio:', error);
                }
            }
        }
        
        // Migrar pesajes
        const pesajesLocal = localStorage.getItem('pesajes');
        if (pesajesLocal) {
            const pesajes = JSON.parse(pesajesLocal);
            console.log(`Migrando ${pesajes.length} pesajes...`);
            
            for (const pesaje of pesajes) {
                try {
                    await guardarPeso(userId, pesaje.peso, pesaje.fecha.slice(0, 10));
                } catch (error) {
                    console.error('Error al migrar pesaje:', error);
                }
            }
        }
        
        // Migrar agua del día actual
        const aguaLocal = localStorage.getItem('agua');
        if (aguaLocal) {
            const vasos = parseInt(aguaLocal);
            if (vasos > 0) {
                const hoy = new Date().toISOString().slice(0, 10);
                try {
                    await guardarAgua(userId, vasos, hoy);
                    console.log(`Agua migrada: ${vasos} vasos`);
                } catch (error) {
                    console.error('Error al migrar agua:', error);
                }
            }
        }
        
        localStorage.setItem('dataMigrated', 'true');
        console.log('Migración completada exitosamente');
        showToast('✅ Datos migrados a la nube', 'success');
    } catch (error) {
        console.error('Error durante la migración:', error);
    }
}

// =========================================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// =========================================

function inicializarApp() {
    // Configurar navegación
    configurarNavegacion();
    
    // Configurar fecha actual en formularios
    configurarFechasActuales();
    
    // Configurar formularios
    configurarFormularios();
    
    // Configurar botones
    configurarBotones();
    
    // Configurar logout
    configurarLogout();
    
    // Configurar listeners en tiempo real
    configurarListenersFirestore();
    
    // Configurar timer
    configurarTimer();
    
    console.log('DataGym iniciado correctamente');
}

// =========================================
// LISTENERS EN TIEMPO REAL DE FIRESTORE
// =========================================

function configurarListenersFirestore() {
    // Listener de ejercicios
    unsubscribeEjercicios = escucharEjercicios(userId, (ejercicios) => {
        console.log('Ejercicios actualizados:', ejercicios.length);
        // Actualizar vistas con los nuevos datos
        actualizarDashboardConEjercicios(ejercicios);
        mostrarEjerciciosHoyConDatos(ejercicios);
        actualizarHistorialConEjercicios(ejercicios);
        actualizarGraficosConEjercicios(ejercicios);
    });
    
    // Listener de peso
    unsubscribePeso = escucharPeso(userId, (historial) => {
        console.log('Peso actualizado:', historial.length);
        mostrarHistorialPesoConDatos(historial);
        actualizarTendenciaPesoConDatos(historial);
        actualizarGraficoPesoConDatos(historial);
    });
    
    // Configurar listener de agua para el día actual
    configurarListenerAgua();
    
    // Verificar cambio de fecha cada minuto
    checkMidnightInterval = setInterval(() => {
        const nuevaFecha = new Date().toISOString().slice(0, 10);
        if (nuevaFecha !== fechaActual) {
            console.log('Cambio de fecha detectado, actualizando listener de agua...');
            fechaActual = nuevaFecha;
            // Reconfigurar listener de agua para el nuevo día
            if (unsubscribeAgua) {
                unsubscribeAgua();
            }
            configurarListenerAgua();
        }
    }, 60000); // Verificar cada minuto
}

function configurarListenerAgua() {
    fechaActual = new Date().toISOString().slice(0, 10);
    unsubscribeAgua = escucharAguaDelDia(userId, fechaActual, (datos) => {
        console.log('Agua actualizada:', datos.vasos);
        actualizarVistaAguaConDatos(datos);
    });
}

// =========================================
// NAVEGACIÓN ENTRE SECCIONES
// =========================================

function configurarNavegacion() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    // Navegación por enlaces
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al enlace actual
            this.classList.add('active');
            
            // Obtener la sección a mostrar
            const sectionId = this.getAttribute('data-section');
            
            // Ocultar todas las secciones
            sections.forEach(s => s.classList.remove('active'));
            
            // Mostrar la sección seleccionada
            document.getElementById(sectionId).classList.add('active');
            
            // Cerrar menú en móvil
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            
            // Scroll al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Toggle menú móvil
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// =========================================
// CONFIGURAR FECHAS ACTUALES
// =========================================

function configurarFechasActuales() {
    const ahora = new Date();
    const isoDateTime = ahora.toISOString().slice(0, 16);
    
    const fechaEjercicio = document.getElementById('fechaEjercicio');
    if (fechaEjercicio) {
        fechaEjercicio.value = isoDateTime;
    }
    
    const fechaPeso = document.getElementById('fechaPeso');
    if (fechaPeso) {
        const isoDate = ahora.toISOString().slice(0, 10);
        fechaPeso.value = isoDate;
    }
}

// =========================================
// DASHBOARD (PÁGINA DE INICIO)
// =========================================

function actualizarDashboardConEjercicios(ejercicios) {
    const hoy = new Date().toISOString().slice(0, 10);
    const ejerciciosHoy = ejercicios.filter(e => {
        const fechaISO = e.fechaISO || e.fecha?.slice(0, 10) || '';
        return fechaISO === hoy;
    });
    
    // Ejercicios realizados hoy
    const elem1 = document.getElementById('ejerciciosHoy');
    if (elem1) elem1.textContent = ejerciciosHoy.length;
    
    // Calorías quemadas hoy
    const caloriasHoy = ejerciciosHoy.reduce((total, e) => total + (e.calorias || 0), 0);
    const elem2 = document.getElementById('caloriasHoy');
    if (elem2) elem2.textContent = caloriasHoy;
    
    // Tiempo total hoy
    const tiempoHoy = ejerciciosHoy.reduce((total, e) => total + (e.duracion || 0), 0);
    const elem3 = document.getElementById('tiempoHoy');
    if (elem3) elem3.textContent = tiempoHoy;
    
    // Mensaje motivacional aleatorio
    const mensajes = [
        '¡Cada día es una nueva oportunidad para mejorar!',
        '¡Tu único límite eres tú mismo!',
        '¡El progreso es progreso, sin importar cuán pequeño!',
        '¡Sigue adelante, lo estás haciendo genial!',
        '¡La constancia es la clave del éxito!',
        '¡Hoy es un gran día para entrenar!',
        '¡Cuida tu cuerpo, es el único lugar donde tienes que vivir!',
        '¡No te rindas, estás más cerca de lo que crees!'
    ];
    const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];
    const elem4 = document.getElementById('mensajeMotivacional');
    if (elem4) elem4.textContent = mensajeAleatorio;
}

// =========================================
// FORMULARIOS
// =========================================

function configurarFormularios() {
    // Formulario de ejercicio
    const formEjercicio = document.getElementById('formEjercicio');
    if (formEjercicio) {
        formEjercicio.addEventListener('submit', function(e) {
            e.preventDefault();
            agregarEjercicio();
        });
    }
    
    // Formulario de IMC
    const formIMC = document.getElementById('formIMC');
    if (formIMC) {
        formIMC.addEventListener('submit', function(e) {
            e.preventDefault();
            calcularIMC();
        });
    }
    
    // Formulario de peso
    const formPeso = document.getElementById('formPeso');
    if (formPeso) {
        formPeso.addEventListener('submit', function(e) {
            e.preventDefault();
            agregarPeso();
        });
    }
    
    // Filtro de fecha en historial
    const filtroFecha = document.getElementById('filtroFecha');
    if (filtroFecha) {
        filtroFecha.addEventListener('change', async function() {
            const ejercicios = await obtenerEjercicios(userId);
            actualizarHistorialConEjercicios(ejercicios);
        });
    }
}

// =========================================
// REGISTRO DE EJERCICIOS
// =========================================

async function agregarEjercicio() {
    const nombre = document.getElementById('nombreEjercicio').value.trim();
    const duracion = parseInt(document.getElementById('duracionEjercicio').value);
    const calorias = parseInt(document.getElementById('caloriasEjercicio').value);
    const fecha = document.getElementById('fechaEjercicio').value;
    
    if (!nombre || !duracion || !calorias || !fecha) {
        showToast('❌ Por favor, completa todos los campos', 'error');
        return;
    }
    
    try {
        const ejercicio = {
            nombre: nombre,
            duracion: duracion,
            calorias: calorias,
            fecha: fecha,
            fechaISO: fecha.slice(0, 10)
        };
        
        await guardarEjercicio(userId, ejercicio);
        
        // Limpiar formulario
        document.getElementById('formEjercicio').reset();
        configurarFechasActuales();
        
        showToast('✅ Ejercicio guardado', 'success');
    } catch (error) {
        console.error('Error al guardar ejercicio:', error);
        showToast('❌ Error al guardar ejercicio', 'error');
    }
}

function mostrarEjerciciosHoyConDatos(ejercicios) {
    const hoy = new Date().toISOString().slice(0, 10);
    const ejerciciosHoy = ejercicios.filter(e => {
        const fechaISO = e.fechaISO || e.fecha?.slice(0, 10) || '';
        return fechaISO === hoy;
    });
    
    const lista = document.getElementById('listaEjerciciosHoy');
    if (!lista) return;
    
    if (ejerciciosHoy.length === 0) {
        lista.innerHTML = '<p class="empty-state">No hay ejercicios registrados hoy</p>';
        return;
    }
    
    lista.innerHTML = ejerciciosHoy.map(ejercicio => `
        <div class="ejercicio-item">
            <div class="ejercicio-info">
                <h4>${ejercicio.nombre}</h4>
                <div class="ejercicio-details">
                    <span><i class="fas fa-clock"></i> ${ejercicio.duracion} min</span>
                    <span><i class="fas fa-fire"></i> ${ejercicio.calorias} kcal</span>
                    <span><i class="fas fa-calendar"></i> ${formatearFecha(ejercicio.fecha)}</span>
                </div>
            </div>
            <button class="btn btn-danger" onclick="window.eliminarEjercicioFirestore('${ejercicio.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Hacer la función global para que el onclick funcione
window.eliminarEjercicioFirestore = async function(id) {
    if (confirm('¿Estás seguro de eliminar este ejercicio?')) {
        try {
            await eliminarEjercicio(userId, id);
            showToast('✅ Ejercicio eliminado', 'success');
        } catch (error) {
            console.error('Error al eliminar ejercicio:', error);
            showToast('❌ Error al eliminar ejercicio', 'error');
        }
    }
};

// =========================================
// HISTORIAL DE EJERCICIOS
// =========================================

function actualizarHistorialConEjercicios(ejercicios) {
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroFechaValue = filtroFecha ? filtroFecha.value : '';
    
    let ejerciciosFiltrados = ejercicios;
    
    if (filtroFechaValue) {
        ejerciciosFiltrados = ejercicios.filter(e => {
            const fechaISO = e.fechaISO || e.fecha?.slice(0, 10) || '';
            return fechaISO.startsWith(filtroFechaValue);
        });
    }
    
    // Calcular totales
    const totalEjercicios = ejerciciosFiltrados.length;
    const totalTiempo = ejerciciosFiltrados.reduce((total, e) => total + (e.duracion || 0), 0);
    const totalCalorias = ejerciciosFiltrados.reduce((total, e) => total + (e.calorias || 0), 0);
    
    const elem1 = document.getElementById('totalEjercicios');
    if (elem1) elem1.textContent = totalEjercicios;
    
    const elem2 = document.getElementById('totalTiempo');
    if (elem2) elem2.textContent = totalTiempo;
    
    const elem3 = document.getElementById('totalCalorias');
    if (elem3) elem3.textContent = totalCalorias;
    
    // Mostrar lista
    const listaHistorial = document.getElementById('listaHistorial');
    if (!listaHistorial) return;
    
    if (ejerciciosFiltrados.length === 0) {
        listaHistorial.innerHTML = '<p class="empty-state">No hay ejercicios registrados</p>';
        return;
    }
    
    listaHistorial.innerHTML = ejerciciosFiltrados.map(ejercicio => `
        <div class="ejercicio-item">
            <div class="ejercicio-info">
                <h4>${ejercicio.nombre}</h4>
                <div class="ejercicio-details">
                    <span><i class="fas fa-clock"></i> ${ejercicio.duracion} min</span>
                    <span><i class="fas fa-fire"></i> ${ejercicio.calorias} kcal</span>
                    <span><i class="fas fa-calendar"></i> ${formatearFecha(ejercicio.fecha)}</span>
                </div>
            </div>
            <button class="btn btn-danger" onclick="window.eliminarEjercicioFirestore('${ejercicio.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// =========================================
// CALCULADORA DE IMC
// =========================================

function calcularIMC() {
    const peso = parseFloat(document.getElementById('peso').value);
    const alturaCm = parseFloat(document.getElementById('altura').value);
    
    if (!peso || !alturaCm || peso <= 0 || alturaCm <= 0) {
        showToast('❌ Por favor, ingresa valores válidos', 'error');
        return;
    }
    
    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM);
    
    let categoria = '';
    let colorClass = '';
    
    if (imc < 18.5) {
        categoria = 'Bajo peso';
        colorClass = 'bajo-peso';
    } else if (imc < 25) {
        categoria = 'Peso normal';
        colorClass = 'normal';
    } else if (imc < 30) {
        categoria = 'Sobrepeso';
        colorClass = 'sobrepeso';
    } else {
        categoria = 'Obesidad';
        colorClass = 'obesidad';
    }
    
    const resultadoIMC = document.getElementById('resultadoIMC');
    if (resultadoIMC) {
        resultadoIMC.innerHTML = `
            <div class="imc-value">${imc.toFixed(1)}</div>
            <div class="imc-categoria ${colorClass}">${categoria}</div>
            <p style="margin-top: 1rem; color: var(--gray-600);">
                Basado en tu altura de ${alturaCm} cm y peso de ${peso} kg
            </p>
        `;
    }
}

// =========================================
// CONTADOR DE AGUA
// =========================================

function configurarBotones() {
    // Botón agregar agua
    const btnAgregarAgua = document.getElementById('btnAgregarAgua');
    if (btnAgregarAgua) {
        btnAgregarAgua.addEventListener('click', agregarAgua);
    }
    
    // Botón reset agua
    const btnResetAgua = document.getElementById('btnResetAgua');
    if (btnResetAgua) {
        btnResetAgua.addEventListener('click', resetearAgua);
    }
    
    // Botón limpiar filtro
    const btnLimpiarFiltro = document.getElementById('btnLimpiarFiltro');
    if (btnLimpiarFiltro) {
        btnLimpiarFiltro.addEventListener('click', async function() {
            const filtroFecha = document.getElementById('filtroFecha');
            if (filtroFecha) {
                filtroFecha.value = '';
                const ejercicios = await obtenerEjercicios(userId);
                actualizarHistorialConEjercicios(ejercicios);
            }
        });
    }
    
    // Botones de rutinas
    const botonesRutina = document.querySelectorAll('.btn-rutina');
    botonesRutina.forEach(btn => {
        btn.addEventListener('click', function() {
            const rutina = this.getAttribute('data-rutina');
            registrarRutina(rutina);
        });
    });
}

async function agregarAgua() {
    try {
        const hoy = new Date().toISOString().slice(0, 10);
        const datosActuales = await obtenerAguaDelDia(userId, hoy);
        
        if (datosActuales.vasos >= 8) {
            showToast('¡Ya alcanzaste tu meta de 8 vasos! 🎉', 'success');
            return;
        }
        
        await incrementarVasoAgua(userId, hoy);
        
        if (datosActuales.vasos + 1 === 8) {
            showToast('¡Felicidades! Alcanzaste tu meta de hidratación 💧', 'success');
        } else {
            showToast('💧 Vaso de agua agregado', 'success');
        }
        
        // Actualizar dashboard
        const ejercicios = await obtenerEjercicios(userId);
        actualizarDashboardConEjercicios(ejercicios);
    } catch (error) {
        console.error('Error al agregar agua:', error);
        showToast('❌ Error al agregar agua', 'error');
    }
}

async function resetearAgua() {
    if (confirm('¿Quieres reiniciar el contador de agua?')) {
        try {
            const hoy = new Date().toISOString().slice(0, 10);
            await guardarAgua(userId, 0, hoy);
            showToast('✅ Contador de agua reiniciado', 'success');
        } catch (error) {
            console.error('Error al resetear agua:', error);
            showToast('❌ Error al resetear agua', 'error');
        }
    }
}

function actualizarVistaAguaConDatos(datos) {
    const cantidad = datos.vasos || 0;
    const porcentaje = (cantidad / 8) * 100;
    
    const elem1 = document.getElementById('vasosActuales');
    if (elem1) elem1.textContent = cantidad;
    
    const elem2 = document.getElementById('aguaNivel');
    if (elem2) elem2.style.height = `${porcentaje}%`;
    
    const elem3 = document.getElementById('aguaProgreso');
    if (elem3) elem3.style.width = `${porcentaje}%`;
    
    const elem4 = document.getElementById('aguaTexto');
    if (elem4) elem4.textContent = `${Math.round(porcentaje)}% completado`;
    
    // Actualizar dashboard
    const elem5 = document.getElementById('aguaHoy');
    if (elem5) elem5.textContent = `${cantidad}/8`;
}

// =========================================
// REGISTRO DE PESO
// =========================================

async function agregarPeso() {
    const peso = parseFloat(document.getElementById('pesoCorporal').value);
    const fecha = document.getElementById('fechaPeso').value;
    
    if (!peso || !fecha || peso <= 0) {
        showToast('❌ Por favor, completa todos los campos correctamente', 'error');
        return;
    }
    
    try {
        await guardarPeso(userId, peso, fecha);
        
        // Limpiar formulario
        document.getElementById('formPeso').reset();
        configurarFechasActuales();
        
        showToast('✅ Peso actualizado', 'success');
    } catch (error) {
        console.error('Error al guardar peso:', error);
        showToast('❌ Error al guardar peso', 'error');
    }
}

function mostrarHistorialPesoConDatos(pesajes) {
    const lista = document.getElementById('historialPeso');
    if (!lista) return;
    
    if (pesajes.length === 0) {
        lista.innerHTML = '<p class="empty-state">No hay pesajes registrados</p>';
        return;
    }
    
    lista.innerHTML = pesajes.map(pesaje => {
        const pesoValor = obtenerValorPeso(pesaje);
        return `
            <div class="peso-item">
                <div>
                    <div class="peso-valor">${pesoValor} kg</div>
                    <div class="peso-fecha">${formatearFecha(pesaje.fechaISO)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function actualizarTendenciaPesoConDatos(pesajes) {
    const contenedor = document.getElementById('tendenciaPeso');
    if (!contenedor) return;
    
    if (pesajes.length < 2) {
        contenedor.innerHTML = '<p class="empty-state">Registra al menos 2 pesajes para ver la tendencia</p>';
        return;
    }
    
    // Los pesajes ya vienen ordenados por fecha descendente desde Firestore
    const pesajesOrdenados = [...pesajes].reverse(); // Invertir para tener el orden ascendente
    
    const pesoInicial = obtenerValorPeso(pesajesOrdenados[0]);
    const pesoFinal = obtenerValorPeso(pesajesOrdenados[pesajesOrdenados.length - 1]);
    const diferencia = pesoFinal - pesoInicial;
    
    let icono = '';
    let texto = '';
    
    if (diferencia > 0.5) {
        icono = '<i class="fas fa-arrow-trend-up tendencia-icon tendencia-subiendo"></i>';
        texto = `<p class="tendencia-text tendencia-subiendo">Has ganado ${diferencia.toFixed(1)} kg</p>`;
    } else if (diferencia < -0.5) {
        icono = '<i class="fas fa-arrow-trend-down tendencia-icon tendencia-bajando"></i>';
        texto = `<p class="tendencia-text tendencia-bajando">Has perdido ${Math.abs(diferencia).toFixed(1)} kg</p>`;
    } else {
        icono = '<i class="fas fa-minus tendencia-icon tendencia-estable"></i>';
        texto = `<p class="tendencia-text tendencia-estable">Tu peso se mantiene estable</p>`;
    }
    
    contenedor.innerHTML = `
        ${icono}
        ${texto}
        <p style="color: var(--gray-600); margin-top: 0.5rem;">
            Desde ${formatearFecha(pesajesOrdenados[0].fechaISO)}
        </p>
    `;
}

// =========================================
// GRÁFICOS
// =========================================

let graficos = {
    caloriaSemana: null,
    minutosSemana: null,
    aguaSemana: null,
    peso: null
};

function actualizarGraficosConEjercicios(ejercicios) {
    actualizarGraficoCaloriasSemanaConDatos(ejercicios);
    actualizarGraficoMinutosSemanaConDatos(ejercicios);
    actualizarGraficoAguaSemanaConDatos();
}

function obtenerUltimos7Dias() {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        dias.push(fecha.toISOString().slice(0, 10));
    }
    return dias;
}

function actualizarGraficoCaloriasSemanaConDatos(ejercicios) {
    const canvas = document.getElementById('graficoCaloriasSemana');
    if (!canvas) return;
    
    if (typeof Chart === 'undefined') {
        canvas.parentElement.innerHTML = '<p class="empty-state">Chart.js no está disponible. Por favor, verifica tu conexión a internet.</p>';
        return;
    }
    
    const dias = obtenerUltimos7Dias();
    
    const datos = dias.map(dia => {
        const ejerciciosDia = ejercicios.filter(e => {
            const fechaISO = e.fechaISO || e.fecha?.slice(0, 10) || '';
            return fechaISO === dia;
        });
        return ejerciciosDia.reduce((total, e) => total + (e.calorias || 0), 0);
    });
    
    const labels = dias.map(dia => {
        const fecha = new Date(dia + 'T12:00:00');
        return fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    });
    
    if (graficos.caloriaSemana) {
        graficos.caloriaSemana.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    graficos.caloriaSemana = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calorías quemadas',
                data: datos,
                backgroundColor: '#3b82f6',
                borderColor: '#1e40af',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function actualizarGraficoMinutosSemanaConDatos(ejercicios) {
    const canvas = document.getElementById('graficoMinutosSemana');
    if (!canvas) return;
    
    if (typeof Chart === 'undefined') {
        canvas.parentElement.innerHTML = '<p class="empty-state">Chart.js no está disponible. Por favor, verifica tu conexión a internet.</p>';
        return;
    }
    
    const dias = obtenerUltimos7Dias();
    
    const datos = dias.map(dia => {
        const ejerciciosDia = ejercicios.filter(e => {
            const fechaISO = e.fechaISO || e.fecha?.slice(0, 10) || '';
            return fechaISO === dia;
        });
        return ejerciciosDia.reduce((total, e) => total + (e.duracion || 0), 0);
    });
    
    const labels = dias.map(dia => {
        const fecha = new Date(dia + 'T12:00:00');
        return fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    });
    
    if (graficos.minutosSemana) {
        graficos.minutosSemana.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    graficos.minutosSemana = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Minutos de ejercicio',
                data: datos,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function actualizarGraficoAguaSemanaConDatos() {
    const canvas = document.getElementById('graficoAguaSemana');
    if (!canvas) return;
    
    if (typeof Chart === 'undefined') {
        canvas.parentElement.innerHTML = '<p class="empty-state">Chart.js no está disponible. Por favor, verifica tu conexión a internet.</p>';
        return;
    }
    
    const dias = obtenerUltimos7Dias();
    const labels = dias.map(dia => {
        const fecha = new Date(dia + 'T12:00:00');
        return fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    });
    
    // Datos simulados - en una versión futura se podrían obtener desde Firestore
    const datos = [6, 7, 5, 8, 7, 6, 0]; // El último se actualizará en tiempo real
    
    // Obtener el valor real del día actual
    const hoy = new Date().toISOString().slice(0, 10);
    obtenerAguaDelDia(userId, hoy).then(datosAgua => {
        datos[6] = datosAgua.vasos || 0;
        
        if (graficos.aguaSemana) {
            graficos.aguaSemana.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        graficos.aguaSemana = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vasos de agua',
                    data: datos,
                    backgroundColor: '#06b6d4',
                    borderColor: '#0891b2',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }).catch(error => {
        console.error('Error al obtener datos de agua:', error);
    });
}

function actualizarGraficoPesoConDatos(pesajes) {
    const canvas = document.getElementById('graficoPeso');
    if (!canvas) return;
    
    if (typeof Chart === 'undefined') {
        canvas.parentElement.innerHTML = '<p class="empty-state">Chart.js no está disponible. Por favor, verifica tu conexión a internet.</p>';
        return;
    }
    
    if (pesajes.length === 0) {
        if (graficos.peso) {
            graficos.peso.destroy();
            graficos.peso = null;
        }
        return;
    }
    
    // Los pesajes vienen ordenados descendente, invertir para el gráfico
    const pesajesOrdenados = [...pesajes].reverse();
    
    const labels = pesajesOrdenados.map(p => {
        const fecha = new Date(p.fechaISO + 'T12:00:00');
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    });
    
    const datos = pesajesOrdenados.map(p => obtenerValorPeso(p));
    
    if (graficos.peso) {
        graficos.peso.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    graficos.peso = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Peso (kg)',
                data: datos,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// =========================================
// RUTINAS PREDEFINIDAS
// =========================================

async function registrarRutina(tipo) {
    const rutinas = {
        cardio: {
            nombre: 'Cardio Intenso',
            duracion: 30,
            calorias: 300
        },
        fuerza: {
            nombre: 'Entrenamiento de Fuerza',
            duracion: 45,
            calorias: 350
        },
        flexibilidad: {
            nombre: 'Flexibilidad y Movilidad',
            duracion: 20,
            calorias: 100
        },
        hiit: {
            nombre: 'HIIT - Alta Intensidad',
            duracion: 20,
            calorias: 250
        },
        yoga: {
            nombre: 'Yoga Completo',
            duracion: 40,
            calorias: 150
        }
    };
    
    const rutina = rutinas[tipo];
    if (!rutina) return;
    
    if (confirm(`¿Quieres registrar la rutina "${rutina.nombre}"?\n\nDuración: ${rutina.duracion} min\nCalorías: ${rutina.calorias} kcal`)) {
        try {
            const ahora = new Date().toISOString().slice(0, 16);
            const ejercicio = {
                nombre: rutina.nombre,
                duracion: rutina.duracion,
                calorias: rutina.calorias,
                fecha: ahora,
                fechaISO: ahora.slice(0, 10)
            };
            
            await guardarEjercicio(userId, ejercicio);
            showToast('¡Rutina registrada correctamente! 💪', 'success');
        } catch (error) {
            console.error('Error al registrar rutina:', error);
            showToast('❌ Error al registrar rutina', 'error');
        }
    }
}

// =========================================
// TIMER PARA EJERCICIOS
// =========================================

let timerInterval = null;
let tiempoRestante = 0;
let timerIniciado = false;

function configurarTimer() {
    const btnIniciar = document.getElementById('btnIniciarTimer');
    const btnPausar = document.getElementById('btnPausarTimer');
    const btnReiniciar = document.getElementById('btnReiniciarTimer');
    
    if (btnIniciar) {
        btnIniciar.addEventListener('click', iniciarTimer);
    }
    
    if (btnPausar) {
        btnPausar.addEventListener('click', pausarTimer);
    }
    
    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', reiniciarTimer);
    }
}

function iniciarTimer() {
    if (timerIniciado) {
        // Reanudar
        timerIniciado = true;
        ejecutarTimer();
        document.getElementById('btnIniciarTimer').disabled = true;
        document.getElementById('btnPausarTimer').disabled = false;
        return;
    }
    
    const minutos = parseInt(document.getElementById('timerMinutos').value) || 0;
    const segundos = parseInt(document.getElementById('timerSegundos').value) || 0;
    
    if (minutos === 0 && segundos === 0) {
        showToast('❌ Por favor, configura el tiempo del timer', 'error');
        return;
    }
    
    tiempoRestante = minutos * 60 + segundos;
    timerIniciado = true;
    
    document.getElementById('btnIniciarTimer').disabled = true;
    document.getElementById('btnPausarTimer').disabled = false;
    document.getElementById('timerMinutos').disabled = true;
    document.getElementById('timerSegundos').disabled = true;
    
    ejecutarTimer();
}

function ejecutarTimer() {
    actualizarDisplayTimer();
    
    timerInterval = setInterval(() => {
        tiempoRestante--;
        actualizarDisplayTimer();
        
        if (tiempoRestante <= 0) {
            clearInterval(timerInterval);
            timerTerminado();
        }
    }, 1000);
}

function pausarTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    document.getElementById('btnIniciarTimer').disabled = false;
    document.getElementById('btnPausarTimer').disabled = true;
}

function reiniciarTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    tiempoRestante = 0;
    timerIniciado = false;
    
    document.getElementById('btnIniciarTimer').disabled = false;
    document.getElementById('btnPausarTimer').disabled = true;
    document.getElementById('timerMinutos').disabled = false;
    document.getElementById('timerSegundos').disabled = false;
    
    document.getElementById('timerDisplay').textContent = '00:00';
}

function actualizarDisplayTimer() {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    
    const display = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = display;
}

function timerTerminado() {
    document.getElementById('timerDisplay').textContent = '¡TERMINADO!';
    document.getElementById('btnIniciarTimer').disabled = false;
    document.getElementById('btnPausarTimer').disabled = true;
    document.getElementById('timerMinutos').disabled = false;
    document.getElementById('timerSegundos').disabled = false;
    
    timerIniciado = false;
    
    showToast('¡Timer terminado! ⏰', 'success');
    
    // Vibrar si está disponible
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
}

// =========================================
// FUNCIONES AUXILIARES
// =========================================

function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';
    
    const fecha = new Date(fechaISO);
    const opciones = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return fecha.toLocaleString('es-ES', opciones);
}

// Helper para obtener valor de peso de manera consistente
// Soporta tanto 'valor' (nuevo) como 'peso' (migrado de localStorage)
function obtenerValorPeso(pesaje) {
    return pesaje.valor || pesaje.peso || 0;
}

function showToast(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notif = document.createElement('div');
    const bgColor = tipo === 'success' ? '#10b981' : '#ef4444';
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        font-weight: 500;
    `;
    notif.textContent = mensaje;
    
    document.body.appendChild(notif);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            try {
                if (notif.parentNode) {
                    document.body.removeChild(notif);
                }
            } catch (error) {
                console.error('Error al remover notificación:', error);
            }
        }, 300);
    }, 3000);
}

// Añadir animaciones CSS para notificaciones
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
