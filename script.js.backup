// =========================================
// DATAGYM - APLICACIÓN DE SALUD FÍSICA
// Código principal en JavaScript
// =========================================

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================
    // INICIALIZACIÓN
    // =========================================
    
    inicializarApp();
    
    // =========================================
    // FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
    // =========================================
    
    function inicializarApp() {
        // Configurar navegación
        configurarNavegacion();
        
        // Configurar fecha actual en formularios
        configurarFechasActuales();
        
        // Cargar datos guardados
        cargarDatosGuardados();
        
        // Actualizar dashboard
        actualizarDashboard();
        
        // Configurar formularios
        configurarFormularios();
        
        // Configurar botones
        configurarBotones();
        
        // Actualizar historial
        actualizarHistorial();
        
        // Actualizar gráficos
        actualizarGraficos();
        
        // Verificar reset de agua
        verificarResetAgua();
        
        console.log('DataGym iniciado correctamente');
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
                navMenu.classList.remove('active');
                
                // Scroll al inicio
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Actualizar gráficos si es la sección de gráficos o peso
                if (sectionId === 'graficos') {
                    actualizarGraficos();
                }
                if (sectionId === 'peso') {
                    actualizarGraficoPeso();
                }
            });
        });
        
        // Toggle menú móvil
        if (navToggle) {
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
        
        // Fecha y hora actual para ejercicio
        const fechaEjercicio = document.getElementById('fechaEjercicio');
        if (fechaEjercicio) {
            const isoString = ahora.toISOString().slice(0, 16);
            fechaEjercicio.value = isoString;
        }
        
        // Fecha actual para peso
        const fechaPeso = document.getElementById('fechaPeso');
        if (fechaPeso) {
            const isoDate = ahora.toISOString().slice(0, 10);
            fechaPeso.value = isoDate;
        }
    }
    
    // =========================================
    // ALMACENAMIENTO LOCAL
    // =========================================
    
    // Obtener ejercicios del localStorage
    function obtenerEjercicios() {
        const ejercicios = localStorage.getItem('ejercicios');
        return ejercicios ? JSON.parse(ejercicios) : [];
    }
    
    // Guardar ejercicios en localStorage
    function guardarEjercicios(ejercicios) {
        localStorage.setItem('ejercicios', JSON.stringify(ejercicios));
    }
    
    // Obtener pesajes del localStorage
    function obtenerPesajes() {
        const pesajes = localStorage.getItem('pesajes');
        return pesajes ? JSON.parse(pesajes) : [];
    }
    
    // Guardar pesajes en localStorage
    function guardarPesajes(pesajes) {
        localStorage.setItem('pesajes', JSON.stringify(pesajes));
    }
    
    // Obtener contador de agua
    function obtenerAgua() {
        return parseInt(localStorage.getItem('agua') || '0');
    }
    
    // Guardar contador de agua
    function guardarAgua(cantidad) {
        localStorage.setItem('agua', cantidad.toString());
    }
    
    // Obtener fecha del último reset de agua
    function obtenerUltimoResetAgua() {
        return localStorage.getItem('ultimoResetAgua');
    }
    
    // Guardar fecha del último reset de agua
    function guardarUltimoResetAgua(fecha) {
        localStorage.setItem('ultimoResetAgua', fecha);
    }
    
    // =========================================
    // CARGAR DATOS GUARDADOS
    // =========================================
    
    function cargarDatosGuardados() {
        // Cargar ejercicios del día
        mostrarEjerciciosHoy();
        
        // Cargar contador de agua
        actualizarVistaAgua();
        
        // Cargar historial de peso
        mostrarHistorialPeso();
    }
    
    // =========================================
    // DASHBOARD (PÁGINA DE INICIO)
    // =========================================
    
    function actualizarDashboard() {
        const hoy = new Date().toISOString().slice(0, 10);
        const ejercicios = obtenerEjercicios();
        const ejerciciosHoy = ejercicios.filter(e => e.fecha.startsWith(hoy));
        
        // Ejercicios realizados hoy
        document.getElementById('ejerciciosHoy').textContent = ejerciciosHoy.length;
        
        // Calorías quemadas hoy
        const caloriasHoy = ejerciciosHoy.reduce((total, e) => total + e.calorias, 0);
        document.getElementById('caloriasHoy').textContent = caloriasHoy;
        
        // Agua consumida hoy
        const aguaHoy = obtenerAgua();
        document.getElementById('aguaHoy').textContent = `${aguaHoy}/8`;
        
        // Tiempo total hoy
        const tiempoHoy = ejerciciosHoy.reduce((total, e) => total + e.duracion, 0);
        document.getElementById('tiempoHoy').textContent = tiempoHoy;
        
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
        document.getElementById('mensajeMotivacional').textContent = mensajeAleatorio;
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
            filtroFecha.addEventListener('change', function() {
                actualizarHistorial();
            });
        }
    }
    
    // =========================================
    // REGISTRO DE EJERCICIOS
    // =========================================
    
    function agregarEjercicio() {
        const nombre = document.getElementById('nombreEjercicio').value.trim();
        const duracion = parseInt(document.getElementById('duracionEjercicio').value);
        const calorias = parseInt(document.getElementById('caloriasEjercicio').value);
        const fecha = document.getElementById('fechaEjercicio').value;
        
        if (!nombre || !duracion || !calorias || !fecha) {
            alert('Por favor, completa todos los campos');
            return;
        }
        
        const ejercicio = {
            id: Date.now(),
            nombre: nombre,
            duracion: duracion,
            calorias: calorias,
            fecha: fecha
        };
        
        const ejercicios = obtenerEjercicios();
        ejercicios.push(ejercicio);
        guardarEjercicios(ejercicios);
        
        // Limpiar formulario
        document.getElementById('formEjercicio').reset();
        configurarFechasActuales();
        
        // Actualizar vistas
        mostrarEjerciciosHoy();
        actualizarDashboard();
        actualizarHistorial();
        
        // Mensaje de confirmación
        mostrarNotificacion('¡Ejercicio agregado correctamente!');
    }
    
    function mostrarEjerciciosHoy() {
        const hoy = new Date().toISOString().slice(0, 10);
        const ejercicios = obtenerEjercicios();
        const ejerciciosHoy = ejercicios.filter(e => e.fecha.startsWith(hoy));
        
        const lista = document.getElementById('listaEjerciciosHoy');
        
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
                <button class="btn btn-danger" onclick="eliminarEjercicio(${ejercicio.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
    
    // Hacer la función global para que el onclick funcione
    window.eliminarEjercicio = function(id) {
        if (confirm('¿Estás seguro de eliminar este ejercicio?')) {
            let ejercicios = obtenerEjercicios();
            ejercicios = ejercicios.filter(e => e.id !== id);
            guardarEjercicios(ejercicios);
            
            mostrarEjerciciosHoy();
            actualizarDashboard();
            actualizarHistorial();
            
            mostrarNotificacion('Ejercicio eliminado');
        }
    };
    
    // =========================================
    // HISTORIAL DE EJERCICIOS
    // =========================================
    
    function actualizarHistorial() {
        const ejercicios = obtenerEjercicios();
        const filtroFecha = document.getElementById('filtroFecha').value;
        
        let ejerciciosFiltrados = ejercicios;
        
        if (filtroFecha) {
            ejerciciosFiltrados = ejercicios.filter(e => e.fecha.startsWith(filtroFecha));
        }
        
        // Ordenar por fecha (más reciente primero)
        ejerciciosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // Calcular totales
        const totalEjercicios = ejerciciosFiltrados.length;
        const totalTiempo = ejerciciosFiltrados.reduce((total, e) => total + e.duracion, 0);
        const totalCalorias = ejerciciosFiltrados.reduce((total, e) => total + e.calorias, 0);
        
        document.getElementById('totalEjercicios').textContent = totalEjercicios;
        document.getElementById('totalTiempo').textContent = totalTiempo;
        document.getElementById('totalCalorias').textContent = totalCalorias;
        
        // Mostrar lista
        const listaHistorial = document.getElementById('listaHistorial');
        
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
                <button class="btn btn-danger" onclick="eliminarEjercicio(${ejercicio.id})">
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
            alert('Por favor, ingresa valores válidos');
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
        resultadoIMC.innerHTML = `
            <div class="imc-value">${imc.toFixed(1)}</div>
            <div class="imc-categoria ${colorClass}">${categoria}</div>
            <p style="margin-top: 1rem; color: var(--gray-600);">
                Basado en tu altura de ${alturaCm} cm y peso de ${peso} kg
            </p>
        `;
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
            btnLimpiarFiltro.addEventListener('click', function() {
                document.getElementById('filtroFecha').value = '';
                actualizarHistorial();
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
        
        // Controles del timer
        configurarTimer();
    }
    
    function agregarAgua() {
        let cantidad = obtenerAgua();
        
        if (cantidad >= 8) {
            alert('¡Ya alcanzaste tu meta de 8 vasos! 🎉');
            return;
        }
        
        cantidad++;
        guardarAgua(cantidad);
        actualizarVistaAgua();
        actualizarDashboard();
        
        if (cantidad === 8) {
            mostrarNotificacion('¡Felicidades! Alcanzaste tu meta de hidratación 💧');
        }
    }
    
    function resetearAgua() {
        if (confirm('¿Quieres reiniciar el contador de agua?')) {
            guardarAgua(0);
            actualizarVistaAgua();
            actualizarDashboard();
            mostrarNotificacion('Contador de agua reiniciado');
        }
    }
    
    function actualizarVistaAgua() {
        const cantidad = obtenerAgua();
        const porcentaje = (cantidad / 8) * 100;
        
        document.getElementById('vasosActuales').textContent = cantidad;
        document.getElementById('aguaNivel').style.height = `${porcentaje}%`;
        document.getElementById('aguaProgreso').style.width = `${porcentaje}%`;
        document.getElementById('aguaTexto').textContent = `${Math.round(porcentaje)}% completado`;
    }
    
    function verificarResetAgua() {
        const hoy = new Date().toISOString().slice(0, 10);
        const ultimoReset = obtenerUltimoResetAgua();
        
        if (ultimoReset !== hoy) {
            guardarAgua(0);
            guardarUltimoResetAgua(hoy);
            actualizarVistaAgua();
        }
    }
    
    // =========================================
    // REGISTRO DE PESO
    // =========================================
    
    function agregarPeso() {
        const peso = parseFloat(document.getElementById('pesoCorporal').value);
        const fecha = document.getElementById('fechaPeso').value;
        
        if (!peso || !fecha || peso <= 0) {
            alert('Por favor, completa todos los campos correctamente');
            return;
        }
        
        const registro = {
            id: Date.now(),
            peso: peso,
            fecha: fecha
        };
        
        const pesajes = obtenerPesajes();
        pesajes.push(registro);
        guardarPesajes(pesajes);
        
        // Limpiar formulario
        document.getElementById('formPeso').reset();
        configurarFechasActuales();
        
        // Actualizar vistas
        mostrarHistorialPeso();
        actualizarTendenciaPeso();
        actualizarGraficoPeso();
        
        mostrarNotificacion('¡Peso registrado correctamente!');
    }
    
    function mostrarHistorialPeso() {
        const pesajes = obtenerPesajes();
        const lista = document.getElementById('historialPeso');
        
        if (pesajes.length === 0) {
            lista.innerHTML = '<p class="empty-state">No hay pesajes registrados</p>';
            return;
        }
        
        // Ordenar por fecha (más reciente primero)
        pesajes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        lista.innerHTML = pesajes.map(pesaje => `
            <div class="peso-item">
                <div>
                    <div class="peso-valor">${pesaje.peso} kg</div>
                    <div class="peso-fecha">${formatearFecha(pesaje.fecha)}</div>
                </div>
                <button class="btn btn-danger" onclick="eliminarPeso(${pesaje.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        actualizarTendenciaPeso();
    }
    
    window.eliminarPeso = function(id) {
        if (confirm('¿Estás seguro de eliminar este registro?')) {
            let pesajes = obtenerPesajes();
            pesajes = pesajes.filter(p => p.id !== id);
            guardarPesajes(pesajes);
            
            mostrarHistorialPeso();
            actualizarGraficoPeso();
            
            mostrarNotificacion('Registro eliminado');
        }
    };
    
    function actualizarTendenciaPeso() {
        const pesajes = obtenerPesajes();
        const contenedor = document.getElementById('tendenciaPeso');
        
        if (pesajes.length < 2) {
            contenedor.innerHTML = '<p class="empty-state">Registra al menos 2 pesajes para ver la tendencia</p>';
            return;
        }
        
        // Ordenar por fecha
        pesajes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        const pesoInicial = pesajes[0].peso;
        const pesoFinal = pesajes[pesajes.length - 1].peso;
        const diferencia = pesoFinal - pesoInicial;
        
        let icono = '';
        let texto = '';
        let clase = '';
        
        if (diferencia > 0.5) {
            icono = '<i class="fas fa-arrow-trend-up tendencia-icon tendencia-subiendo"></i>';
            texto = `<p class="tendencia-text tendencia-subiendo">Has ganado ${diferencia.toFixed(1)} kg</p>`;
            clase = 'tendencia-subiendo';
        } else if (diferencia < -0.5) {
            icono = '<i class="fas fa-arrow-trend-down tendencia-icon tendencia-bajando"></i>';
            texto = `<p class="tendencia-text tendencia-bajando">Has perdido ${Math.abs(diferencia).toFixed(1)} kg</p>`;
            clase = 'tendencia-bajando';
        } else {
            icono = '<i class="fas fa-minus tendencia-icon tendencia-estable"></i>';
            texto = `<p class="tendencia-text tendencia-estable">Tu peso se mantiene estable</p>`;
            clase = 'tendencia-estable';
        }
        
        contenedor.innerHTML = `
            ${icono}
            ${texto}
            <p style="color: var(--gray-600); margin-top: 0.5rem;">
                Desde ${formatearFecha(pesajes[0].fecha)}
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
    
    function actualizarGraficos() {
        actualizarGraficoCaloriasSemana();
        actualizarGraficoMinutosSemana();
        actualizarGraficoAguaSemana();
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
    
    function actualizarGraficoCaloriasSemana() {
        const canvas = document.getElementById('graficoCaloriasSemana');
        if (!canvas) return;
        
        // Verificar si Chart.js está disponible
        if (typeof Chart === 'undefined') {
            canvas.parentElement.innerHTML = '<p class="empty-state">Chart.js no está disponible. Por favor, verifica tu conexión a internet.</p>';
            return;
        }
        
        const dias = obtenerUltimos7Dias();
        const ejercicios = obtenerEjercicios();
        
        const datos = dias.map(dia => {
            const ejerciciosDia = ejercicios.filter(e => e.fecha.startsWith(dia));
            return ejerciciosDia.reduce((total, e) => total + e.calorias, 0);
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
    
    function actualizarGraficoMinutosSemana() {
        const canvas = document.getElementById('graficoMinutosSemana');
        if (!canvas) return;
        
        // Verificar si Chart.js está disponible
        if (typeof Chart === 'undefined') {
            canvas.parentElement.innerHTML = '<p class="empty-state">Chart.js no está disponible. Por favor, verifica tu conexión a internet.</p>';
            return;
        }
        
        const dias = obtenerUltimos7Dias();
        const ejercicios = obtenerEjercicios();
        
        const datos = dias.map(dia => {
            const ejerciciosDia = ejercicios.filter(e => e.fecha.startsWith(dia));
            return ejerciciosDia.reduce((total, e) => total + e.duracion, 0);
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
    
    function actualizarGraficoAguaSemana() {
        const canvas = document.getElementById('graficoAguaSemana');
        if (!canvas) return;
        
        // Verificar si Chart.js está disponible
        if (typeof Chart === 'undefined') {
            canvas.parentElement.innerHTML = '<p class="empty-state">Chart.js no está disponible. Por favor, verifica tu conexión a internet.</p>';
            return;
        }
        
        // Por simplicidad, mostramos datos simulados para el agua
        // En una app real, guardaríamos el historial de agua diario
        const dias = obtenerUltimos7Dias();
        const labels = dias.map(dia => {
            const fecha = new Date(dia + 'T12:00:00');
            return fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
        });
        
        // Datos simulados - en una app real se guardarían
        const datos = [6, 7, 5, 8, 7, 6, obtenerAgua()];
        
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
    }
    
    function actualizarGraficoPeso() {
        const canvas = document.getElementById('graficoPeso');
        if (!canvas) return;
        
        // Verificar si Chart.js está disponible
        if (typeof Chart === 'undefined') {
            canvas.parentElement.innerHTML = '<p class="empty-state">Chart.js no está disponible. Por favor, verifica tu conexión a internet.</p>';
            return;
        }
        
        const pesajes = obtenerPesajes();
        
        if (pesajes.length === 0) {
            if (graficos.peso) {
                graficos.peso.destroy();
                graficos.peso = null;
            }
            return;
        }
        
        // Ordenar por fecha
        pesajes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        const labels = pesajes.map(p => {
            const fecha = new Date(p.fecha + 'T12:00:00');
            return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        });
        
        const datos = pesajes.map(p => p.peso);
        
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
    
    function registrarRutina(tipo) {
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
            const ejercicio = {
                id: Date.now(),
                nombre: rutina.nombre,
                duracion: rutina.duracion,
                calorias: rutina.calorias,
                fecha: new Date().toISOString().slice(0, 16)
            };
            
            const ejercicios = obtenerEjercicios();
            ejercicios.push(ejercicio);
            guardarEjercicios(ejercicios);
            
            mostrarEjerciciosHoy();
            actualizarDashboard();
            actualizarHistorial();
            
            mostrarNotificacion('¡Rutina registrada correctamente! 💪');
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
            alert('Por favor, configura el tiempo del timer');
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
        
        mostrarNotificacion('¡Timer terminado! ⏰');
        
        // Vibrar si está disponible
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }
    
    // =========================================
    // FUNCIONES AUXILIARES
    // =========================================
    
    function formatearFecha(fechaISO) {
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
    
    function mostrarNotificacion(mensaje) {
        // Crear elemento de notificación
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        notif.textContent = mensaje;
        
        document.body.appendChild(notif);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notif);
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
    
});
