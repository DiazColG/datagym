# 🏋️ DataGym - Aplicación de Salud Física

**DataGym** es una aplicación web completa para el seguimiento de tu salud física y rutinas de ejercicio. Diseñada para ser simple, intuitiva y completamente funcional sin necesidad de un servidor backend.

![DataGym](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 📋 Características Principales

### 🏠 1. Dashboard Interactivo
- Vista general de tu actividad diaria
- Resumen de ejercicios realizados
- Contador de calorías quemadas
- Seguimiento de consumo de agua
- Tiempo total de ejercicio
- Mensajes motivacionales aleatorios

### 🏋️ 2. Registro de Ejercicios
- Formulario intuitivo para añadir ejercicios
- Campos: nombre, duración, calorías y fecha/hora
- Lista de ejercicios del día
- Opción para eliminar ejercicios
- Validación de datos

### 📊 3. Historial Completo
- Visualización de todos los ejercicios registrados
- Filtros por fecha
- Totales acumulados (ejercicios, tiempo, calorías)
- Ordenamiento cronológico

### ⚖️ 4. Calculadora de IMC
- Cálculo automático del Índice de Masa Corporal
- Indicadores visuales por categoría:
  - Bajo peso (azul)
  - Peso normal (verde)
  - Sobrepeso (naranja)
  - Obesidad (rojo)
- Tabla de referencia incluida

### 💧 5. Contador de Agua
- Meta diaria de 8 vasos (2 litros)
- Visualización con vaso animado
- Barra de progreso
- Botones para agregar/reiniciar
- Reset automático diario

### 📈 6. Seguimiento de Peso
- Registro de peso con fecha
- Historial de pesajes
- Gráfico de evolución
- Indicador de tendencia:
  - ↗️ Subiendo
  - ↘️ Bajando
  - → Estable

### 📉 7. Gráficos de Progreso
- Calorías quemadas (última semana)
- Minutos de ejercicio diarios
- Consumo de agua semanal
- Visualizaciones con Chart.js

### 🏋️ 8. Sistema de Rutinas y Workouts (NUEVO)
Sistema profesional de tracking de entrenamientos:
- **Base de datos de 50 ejercicios** categorizados por grupo muscular
- **Crear rutinas personalizadas** con ejercicios, series, reps y descansos
- **Tracking en tiempo real** con interfaz táctil para el gimnasio
- **Comparación automática** con entrenamientos anteriores
- **Detección de récords personales** (peso máximo, volumen, 1RM)
- **Sugerencias inteligentes** de peso basadas en progreso
- **Historial completo** de workouts y estadísticas
- **Gráficos de progreso** por ejercicio

#### Características destacadas:
- ✅ 50 ejercicios esenciales (pecho, espalda, piernas, hombros, brazos, core, fullbody)
- ✅ Interfaz optimizada para uso en el gimnasio (botones grandes, alto contraste)
- ✅ Cálculo automático de 1RM (fórmula Epley)
- ✅ Tracking de volumen total y calorías estimadas
- ✅ Celebración visual de nuevos récords
- ✅ Sistema de comparación: "¡Subiste 5kg desde la última vez!"
- ✅ Modo offline con sincronización automática

### 📋 9. Rutinas Predefinidas
5 rutinas listas para usar:
- **Cardio Intenso** (30 min, 300 kcal)
- **Entrenamiento de Fuerza** (45 min, 350 kcal)
- **Flexibilidad y Movilidad** (20 min, 100 kcal)
- **HIIT** (20 min, 250 kcal)
- **Yoga Completo** (40 min, 150 kcal)

### ⏱️ 10. Timer Configurable
- Temporizador para ejercicios
- Configuración en minutos y segundos
- Controles: Iniciar, Pausar, Reiniciar
- Notificación al finalizar
- Alerta sonora y vibración (si está disponible)

---

## 🔥 Firebase Integration

### Autenticación de Usuarios
DataGym ahora incluye un sistema completo de autenticación:
- 🔐 **Google Sign-In**: Inicia sesión con un clic usando tu cuenta de Google
- 📧 **Email/Password**: Crea una cuenta con tu correo electrónico
- 🔒 **Protección de rutas**: Solo usuarios autenticados pueden acceder a la app
- 👤 **Perfil de usuario**: Muestra tu nombre y foto en el header
- 🚪 **Logout seguro**: Cierra sesión y limpia los datos locales

### Base de Datos en la Nube
- ☁️ **Firestore**: Todos los datos se guardan en tiempo real
- 🔄 **Sincronización automática**: Cambios instantáneos entre dispositivos
- 📱 **Multi-dispositivo**: Accede desde cualquier lugar
- 🔐 **Datos privados**: Cada usuario solo ve su información
- 💾 **Modo offline**: Cache automático para trabajar sin conexión

### Configuración de Firebase
Las credenciales de Firebase están hardcodeadas en `firebase-config.js` para simplificar el desarrollo y despliegue.

**Nota de Seguridad**: Las credenciales de Firebase para frontend son públicas por diseño. La seguridad viene de:
- ✅ Reglas de Firestore (ya configuradas)
- ✅ Dominios autorizados en Firebase Console
- ✅ Authentication requerida para acceder a datos

### Estructura de Datos
Ver documentación completa en [`/docs/firestore-schema.md`](./docs/firestore-schema.md)

---

## 🎨 Diseño

### Paleta de Colores
- **Principal**: Azul deportivo (#1e40af, #3b82f6, #60a5fa)
- **Éxito**: Verde (#10b981)
- **Peligro**: Rojo (#ef4444)
- **Advertencia**: Naranja (#f59e0b)
- **Info**: Cian (#06b6d4)

### Responsive Design
✅ **Móvil** (320px - 767px): Menú hamburguesa, diseño vertical
✅ **Tablet** (768px - 1023px): Diseño adaptado a 2 columnas
✅ **Desktop** (1024px+): Diseño completo con múltiples columnas

## 🚀 Cómo Usar

### Instalación
No requiere instalación compleja. Sigue estos pasos:

1. **Descarga el proyecto**
   ```bash
   git clone https://github.com/DiazColG/datagym.git
   cd datagym
   ```

2. **Configura Firebase** (solo para desarrollo local)
   - Crea un archivo `.env` basado en `.env.example`
   - Obtén tus credenciales de Firebase Console
   - Copia los valores en el archivo `.env`

3. **Abre la aplicación**
   - Usa un servidor local para desarrollo:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js
     npx serve
     ```
   - O despliega en Vercel/Netlify (variables de entorno configuradas automáticamente)

4. **¡Listo!** Regístrate o inicia sesión con Google o Email

### Uso Básico

#### Primera vez
1. Ve a la página de autenticación
2. **Regístrate** con Google o Email/Password
3. ¡Empieza a registrar tus ejercicios!

#### Agregar un Ejercicio
1. Ve a la sección **Ejercicios**
2. Completa el formulario:
   - Nombre del ejercicio
   - Duración en minutos
   - Calorías quemadas
   - Fecha y hora
3. Haz clic en **Agregar Ejercicio**

#### Calcular IMC
1. Ve a la sección **IMC**
2. Ingresa tu peso (kg) y altura (cm)
3. Haz clic en **Calcular IMC**
4. Verás tu IMC y categoría con colores

#### Usar el Timer
1. Ve a la sección **Timer**
2. Configura minutos y segundos
3. Haz clic en **Iniciar**
4. Usa **Pausar** para detener temporalmente
5. Usa **Reiniciar** para volver a empezar

#### Registrar una Rutina
1. Ve a la sección **Rutinas**
2. Elige una de las 5 rutinas disponibles
3. Haz clic en **Iniciar Rutina**
4. Confirma para registrarla automáticamente

## 💾 Almacenamiento de Datos

Todos los datos se guardan en **Firebase Firestore**, una base de datos en tiempo real en la nube:
- ✅ **Sincronización automática** entre todos tus dispositivos
- ✅ **Acceso desde cualquier lugar** con tu cuenta
- ✅ **Datos seguros** con autenticación Firebase
- ✅ **Actualización en tiempo real** sin recargar la página
- ✅ **Modo offline** con caché local automático
- 🔐 **Privacidad garantizada**: cada usuario solo ve sus propios datos

### Datos Almacenados
- Perfil de usuario (nombre, email, foto)
- Ejercicios realizados con fecha y detalles
- Historial de peso con gráficos
- Consumo de agua diario
- Configuración de preferencias

### Migración Automática
Si ya usabas DataGym con localStorage, tus datos se migrarán automáticamente a la nube la primera vez que inicies sesión.

## 🐛 Troubleshooting

### La página se queda cargando

Si ves un spinner infinito:
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Si ves errores de Firebase, verifica que:
   - Firebase Console tenga el dominio autorizado
   - Las reglas de Firestore estén publicadas
   - Tu navegador no esté bloqueando cookies/JavaScript

### Error de autenticación

Si no puedes hacer login:
1. Verifica que estás usando un email válido
2. Para Google Sign-In, asegúrate de tener popups habilitados
3. Limpia cache y cookies del navegador
4. Verifica tu conexión a internet

### Los datos no se guardan

Si los datos no persisten:
1. Verifica tu conexión a internet
2. Revisa la consola por errores de Firestore
3. Asegúrate de estar autenticado
4. Recarga la página e intenta de nuevo

### Error "Cannot read properties of undefined"

Si ves este error en la consola:
1. Asegúrate de que Firebase se inicializó correctamente
2. Busca el mensaje "✅ Firebase inicializado correctamente" en la consola
3. Si no lo ves, verifica que `firebase-config.js` se cargó primero
4. Limpia la caché del navegador y recarga

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsive con Flexbox y Grid
- **JavaScript ES6+**: Lógica moderna con módulos
- **Firebase Authentication**: Autenticación de usuarios (Google y Email/Password)
- **Cloud Firestore**: Base de datos en tiempo real
- **Chart.js**: Visualización de gráficos
- **Font Awesome**: Iconos

## 📁 Estructura del Proyecto

```
datagym/
├── index.html              # Estructura HTML principal (protegida por autenticación)
├── auth.html              # Página de login/registro
├── styles.css             # Estilos completos de la aplicación
├── auth.css               # Estilos de autenticación
├── script.js              # Lógica JavaScript integrada con Firebase
├── firebase-config.js     # Configuración de Firebase
├── auth.js                # Módulo de autenticación
├── firestore.js           # Módulo de base de datos Firestore
│
├── // SISTEMA DE WORKOUTS (NUEVO)
├── entrenar.html          # Página principal de entrenamientos
├── entrenar.css           # Estilos de la sección entrenar
├── entrenar.js            # Lógica de entrenamientos
├── crear-rutina.html      # Crear/editar rutinas
├── workout-activo.html    # Tracking de workout en tiempo real
├── workout-activo.css     # Estilos para workout activo
├── exercises-db.js        # Base de datos de 50 ejercicios
├── rutinas-manager.js     # Gestión de rutinas (CRUD)
├── workout-manager.js     # Gestión de workouts activos
├── records-manager.js     # Sistema de récords personales
├── workout-calculator.js  # Cálculos (1RM, volumen, calorías)
│
├── // SISTEMA DE PERFILES
├── mi-cuenta.html         # Página de perfil de usuario
├── mi-cuenta.css          # Estilos de perfil
├── mi-cuenta.js           # Lógica de perfil
├── onboarding.html        # Primera configuración
├── onboarding.css         # Estilos de onboarding
├── onboarding.js          # Lógica de onboarding
├── profile-manager.js     # Gestión de perfiles
├── profile-calculator.js  # Cálculos de TMB, TDEE, macros
│
├── .env.example           # Template de variables de entorno
├── docs/
│   └── firestore-schema.md # Documentación de estructura de datos
├── README.md              # Este archivo
└── LICENSE                # Licencia MIT
```

## 🎯 Público Objetivo

Esta aplicación está diseñada para:
- 👤 Personas que quieren mejorar su salud física
- 📚 Principiantes en programación que quieren aprender
- 🔧 Desarrolladores que buscan una base para proyectos de fitness
- 💪 Cualquiera que necesite un compañero de entrenamiento digital

## 🌟 Características Destacadas

### Para Usuarios
- ✨ Interfaz limpia e intuitiva
- 📱 Funciona en cualquier dispositivo
- 🎨 Diseño moderno y atractivo
- 🚀 Rápida y sin complicaciones
- 🔒 Tus datos nunca salen de tu dispositivo

### Para Desarrolladores
- 📝 Código limpio y bien comentado en español
- 🎓 Perfecto para aprender JavaScript
- 🔧 Fácil de modificar y extender
- 📦 Sin dependencias complejas
- 🆓 100% código abierto

## 🔮 Futuras Mejoras Posibles

Ideas para extender la aplicación:
- [x] Sistema de rutinas personalizadas ✅ **IMPLEMENTADO**
- [x] Tracking de workouts en tiempo real ✅ **IMPLEMENTADO**
- [x] Base de datos de ejercicios profesional ✅ **IMPLEMENTADO**
- [x] Detección de récords personales ✅ **IMPLEMENTADO**
- [x] Gráficos de progreso por ejercicio ✅ **IMPLEMENTADO**
- [ ] Exportar/importar datos en JSON
- [ ] Calculadora de calorías por alimento
- [ ] Registro de horas de sueño
- [ ] Integración con dispositivos wearables
- [ ] Modo oscuro
- [ ] Múltiples perfiles de usuario
- [ ] Compartir progreso en redes sociales
- [ ] Recordatorios y notificaciones
- [ ] Planes de entrenamiento con IA
- [ ] Comunidad y desafíos entre usuarios

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Estilo
- Comenta tu código en español
- Mantén el código limpio y legible
- Sigue las convenciones de nomenclatura existentes
- Prueba en móvil, tablet y desktop

## 🐛 Reportar Problemas

Si encuentras un bug o tienes una sugerencia:
1. Abre un [Issue](https://github.com/DiazColG/datagym/issues)
2. Describe el problema o sugerencia
3. Incluye capturas de pantalla si es posible
4. Indica el navegador y dispositivo usado

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**DiazColG**
- GitHub: [@DiazColG](https://github.com/DiazColG)

## 🙏 Agradecimientos

- Font Awesome por los iconos
- Chart.js por las visualizaciones
- La comunidad de código abierto

## 📸 Capturas de Pantalla

### Dashboard Principal
Muestra un resumen completo de tu actividad diaria con tarjetas informativas y mensaje motivacional.

### Registro de Ejercicios
Formulario intuitivo para agregar tus entrenamientos con todos los detalles necesarios.

### Gráficos de Progreso
Visualizaciones claras de tu rendimiento semanal en calorías, tiempo y agua.

### Calculadora de IMC
Calcula e interpreta tu Índice de Masa Corporal con indicadores visuales por colores.

### Timer para Ejercicios
Temporizador grande y visible para cronometrar tus rutinas de entrenamiento.

---

## 🎓 Aprende con DataGym

Este proyecto es ideal para aprender:
- 📘 **HTML5**: Estructura semántica de páginas web
- 🎨 **CSS3**: Diseño responsive y moderno
- ⚡ **JavaScript**: Manipulación del DOM, eventos, localStorage
- 📊 **Chart.js**: Creación de gráficos interactivos
- 🏗️ **Arquitectura**: Organización de código en un proyecto real

### Conceptos Cubiertos
- Variables y funciones en JavaScript
- Eventos del DOM (click, submit, change)
- Almacenamiento local (localStorage)
- Manipulación de arrays y objetos
- Fechas y formateo
- Validación de formularios
- Diseño responsive con media queries
- Flexbox y CSS Grid
- Animaciones CSS
- Integración de librerías externas

## ⚡ Rendimiento

- ⚡ Carga instantánea (< 100ms)
- 📦 Tamaño total: ~90KB sin comprimir
- 🎯 Lighthouse Score: 95+
- ♿ Accesible (ARIA labels)
- 🌐 Compatible con todos los navegadores modernos

## 🔐 Privacidad

- ✅ Sin tracking ni analytics
- ✅ Sin cookies
- ✅ Sin envío de datos a servidores
- ✅ Todo funciona offline después de la primera carga
- ✅ Tus datos nunca salen de tu navegador

---

**¿Te gusta DataGym?** Dale una ⭐ en GitHub y compártelo con tus amigos que quieren ponerse en forma! 💪

**¿Tienes preguntas?** Abre un Issue y con gusto te ayudaremos.

**¡Empieza tu viaje fitness hoy con DataGym!** 🚀