# Sistema de Perfil de Usuario - DataGym

## 📋 Descripción General

Sistema completo de perfil de usuario profesional con onboarding guiado, cálculos nutricionales basados en ecuaciones científicas, y dashboard personalizado.

## 🏗️ Arquitectura

### Módulos Principales

1. **profile-calculator.js** - Calculadora profesional de métricas nutricionales
2. **profile-manager.js** - Gestor de perfiles en Firestore
3. **onboarding.html/js/css** - Wizard de configuración inicial (4 pasos)
4. **mi-cuenta.html/js/css** - Modal de gestión de cuenta con tabs

### Estructura de Datos en Firestore

```
users/{userId}/profile/info/
  - nombre: string
  - email: string
  - fechaNacimiento: string (ISO format)
  - edad: number (calculado)
  - genero: 'masculino' | 'femenino'
  
  // Datos físicos
  - altura: number (cm)
  - pesoActual: number (kg)
  - pesoObjetivo: number (kg)
  - imc: number
  - categoriaIMC: 'bajo-peso' | 'normal' | 'sobrepeso' | 'obesidad'
  
  // Actividad y objetivos
  - nivelActividad: 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muyActivo'
  - objetivoPrincipal: 'perdida' | 'mantenimiento' | 'ganancia'
  - objetivoSemanal: number (kg/semana)
  
  // Cálculos nutricionales
  - tmb: number (kcal/día - Tasa Metabólica Basal)
  - tdee: number (kcal/día - Gasto Energético Total Diario)
  - caloriasObjetivo: number (kcal/día)
  - proteinasObjetivo: number (g/día)
  - aguaObjetivo: {
      litros: number,
      mililitros: number,
      vasos: number
    }
  
  // Configuración
  - unidadPeso: 'kg' | 'lb'
  - unidadAltura: 'cm' | 'in'
  - perfilCompleto: boolean
  
  // Metadata
  - fechaRegistro: timestamp
  - fechaActualizacion: timestamp
```

## 🧮 Cálculos Profesionales

### 1. TMB (Tasa Metabólica Basal)
**Ecuación utilizada**: Mifflin-St Jeor (la más precisa según estudios)

**Hombres**:  
`TMB = (10 × peso kg) + (6.25 × altura cm) - (5 × edad años) + 5`

**Mujeres**:  
`TMB = (10 × peso kg) + (6.25 × altura cm) - (5 × edad años) - 161`

### 2. TDEE (Gasto Energético Total Diario)
`TDEE = TMB × Factor de Actividad`

**Factores de Actividad**:
- Sedentario: 1.2 (poco o ningún ejercicio)
- Ligero: 1.375 (ejercicio 1-3 días/semana)
- Moderado: 1.55 (ejercicio 3-5 días/semana)
- Activo: 1.725 (ejercicio intenso 6-7 días/semana)
- Muy Activo: 1.9 (ejercicio muy intenso, trabajo físico)

### 3. Calorías Objetivo
**Para perder peso**: TDEE - 500 kcal (pérdida ~0.5 kg/semana)  
**Para mantener**: TDEE  
**Para ganar peso**: TDEE + 500 kcal (ganancia ~0.5 kg/semana)

*Mínimo saludable*: 1200 kcal/día

### 4. Proteínas
Basado en peso corporal y nivel de actividad:
- Sedentario: 1.2 g/kg
- Ligero: 1.4 g/kg
- Moderado: 1.6 g/kg
- Activo: 1.8 g/kg
- Muy Activo: 2.0 g/kg

### 5. Agua
**Base**: 35 ml por kg de peso corporal  
**Ajustes**:
- Actividad moderada: +250 ml
- Actividad alta/muy alta: +500 ml

*Estándar de vaso*: 250 ml

### 6. IMC (Índice de Masa Corporal)
`IMC = peso (kg) / altura² (m)`

**Categorías OMS**:
- < 18.5: Bajo peso
- 18.5 - 24.9: Normal
- 25.0 - 29.9: Sobrepeso
- ≥ 30.0: Obesidad

## 🚀 Flujo de Usuario

### Nuevos Usuarios

1. **Registro/Login** → auth.html
2. **Verificación** → ¿Tiene perfil completo?
   - No → Redirigir a onboarding.html
   - Sí → Cargar index.html con dashboard personalizado
3. **Onboarding (4 pasos)**:
   - Paso 1: Información personal
   - Paso 2: Datos físicos
   - Paso 3: Actividad y objetivos
   - Paso 4: Resumen y confirmación
4. **Dashboard** → index.html con objetivos personalizados

### Usuarios Existentes

1. **Login** → auth.html
2. **Dashboard** → index.html
   - Saludo personalizado
   - Objetivos diarios visibles
   - Botón "Mi Cuenta" en navegación

## 🎨 Componentes UI

### Onboarding Wizard

**Archivo**: onboarding.html  
**Características**:
- Diseño minimalista con gradiente azul/morado
- 4 pasos con indicador de progreso
- Validaciones en tiempo real
- Preview de IMC al ingresar altura/peso
- Cálculo de edad automático
- Diseño responsive

**Navegación**:
- Botones Siguiente/Anterior
- Validación antes de avanzar
- No permite saltar pasos

### Modal Mi Cuenta

**Archivo**: mi-cuenta.html  
**Tabs**:

1. **Perfil**:
   - Edición de información personal
   - Datos físicos con preview de IMC
   - Nivel de actividad
   - Objetivo principal
   - Recálculo automático al guardar

2. **Objetivos**:
   - Vista de calorías diarias
   - Meta de proteínas
   - Objetivo de hidratación
   - Progreso hacia peso objetivo
   - Tiempo estimado para alcanzar meta

3. **Configuración**:
   - Unidades de medida (kg/lb, cm/in)
   - Modo oscuro (toggle)
   - Notificaciones (agua, ejercicio)
   - Botón para resetear perfil

**Características**:
- Modal overlay con backdrop
- Animaciones suaves
- Diseño responsive
- Cierre con Esc o click fuera
- Validación de datos antes de guardar

### Dashboard Personalizado

**Sección nueva**: Objetivos Personalizados  
**Elementos**:
- 3 tarjetas con objetivos diarios:
  - Calorías (icono fuego)
  - Proteínas (icono pollo)
  - Agua (icono vaso)
- Progreso hacia objetivo de peso:
  - Peso actual
  - Peso objetivo
  - Diferencia (kg a perder/ganar)
  - Tiempo estimado

## 🔧 Integración con App Principal

### auth.js
```javascript
// Nuevas funciones exportadas
necesitaOnboarding(userId) → Promise<boolean>
crearPerfilInicialUsuario(user) → Promise<void>
```

### index.html
- Script de protección actualizado para redirigir a onboarding
- Botón "Mi Cuenta" en navbar
- Sección de objetivos personalizados (oculta sin perfil)
- Contenedor para modal Mi Cuenta

### script.js
```javascript
// Nuevas importaciones
import { obtenerPerfilCompleto, obtenerObjetivosDiarios, 
         obtenerProgresoObjetivoPeso } from './profile-manager.js';

// Nueva variable global
let perfilUsuario = null;

// Nuevas funciones
cargarModalMiCuenta()
mostrarObjetivosPersonalizados()
actualizarMetaAgua()
```

### styles.css
- Estilos para `.objetivos-dashboard`
- Estilos para `.objetivo-card`
- Estilos para `.progreso-peso-dashboard`
- Estilos para `.btn-mi-cuenta`
- Media queries responsive

## 📱 Responsive Design

### Breakpoints

**Desktop** (> 768px):
- Modal: 900px max-width
- Objetivos: Grid 3 columnas
- Tabs: Texto visible
- Forms: 2 columnas

**Mobile** (≤ 768px):
- Modal: Full width con padding
- Objetivos: Grid 1 columna
- Tabs: Solo iconos
- Forms: 1 columna
- Stack buttons verticalmente

## 🎨 Paleta de Colores

```css
--primary-blue: #1e40af
--secondary-blue: #3b82f6
--success-green: #10b981
--danger-red: #ef4444
--warning-yellow: #f59e0b
--agua-cyan: #06b6d4
```

## ⚡ Rendimiento

### Optimizaciones
- Carga dinámica del modal Mi Cuenta (solo cuando se necesita)
- Cálculos realizados solo al cambiar datos relevantes
- Listeners desuscritos al cerrar modal
- Validación progresiva (no todo a la vez)

### Firestore
- Estructura optimizada: 1 documento por perfil
- Merge updates para no sobrescribir campos
- Server timestamps para sincronización
- Índices automáticos por subcollection

## 🔒 Seguridad

### Validaciones
1. **Cliente**:
   - Rangos de valores (peso: 30-300 kg, altura: 100-250 cm)
   - Edad mínima: 15 años
   - Todos los campos requeridos
   - Tipos de datos correctos

2. **Firestore Rules** (recomendadas):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null 
                        && request.auth.uid == userId;
    }
  }
}
```

### CodeQL
✅ Sin vulnerabilidades detectadas  
✅ Sin problemas de seguridad

## 📊 Testing

### Tests Unitarios Realizados

**Test Case 1**: Hombre, 30 años, 175cm, 70kg, moderado
- TMB: 1649 kcal ✓
- TDEE: 2556 kcal ✓
- IMC: 22.9 (normal) ✓
- Proteínas: 112 g ✓
- Agua: 11 vasos / 2.7 litros ✓

**Test Case 2**: Mujer, 25 años, 160cm, 55kg, ligero
- TMB: 1264 kcal ✓
- TDEE: 1738 kcal ✓
- IMC: 21.5 (normal) ✓
- Proteínas: 77 g ✓
- Agua: 8 vasos / 1.9 litros ✓

### Code Review
✅ 5 issues identificados y corregidos:
- Función async faltante
- Null checks defensivos
- Documentación de estándares
- Configuración de URLs externas
- Manejo de formatos variables

## 🚀 Uso

### Para Desarrolladores

1. **Importar módulos**:
```javascript
import { calcularPerfilCompleto } from './profile-calculator.js';
import { guardarPerfilCompleto, obtenerPerfilCompleto } from './profile-manager.js';
```

2. **Calcular perfil**:
```javascript
const datos = {
  peso: 70,
  altura: 175,
  fechaNacimiento: '1994-01-15',
  genero: 'masculino',
  nivelActividad: 'moderado',
  objetivoPrincipal: 'perdida'
};

const perfil = calcularPerfilCompleto(datos);
// {edad, imc, tmb, tdee, caloriasObjetivo, proteinasObjetivo, aguaObjetivo, ...}
```

3. **Guardar en Firestore**:
```javascript
await guardarPerfilCompleto(userId, {
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  ...datos
});
```

4. **Obtener perfil**:
```javascript
const perfil = await obtenerPerfilCompleto(userId);
if (perfil && perfil.perfilCompleto) {
  // Usar datos del perfil
}
```

## 📝 Mantenimiento

### Actualizar Cálculos
Para modificar fórmulas, editar `profile-calculator.js`:
- Factores en constantes al inicio del archivo
- Funciones puras sin efectos secundarios
- Documentación JSDoc completa

### Añadir Campos al Perfil
1. Actualizar estructura en `profile-manager.js`
2. Añadir campos en formularios HTML
3. Actualizar funciones de carga/guardado
4. Considerar recálculo si afecta métricas

### Personalizar UI
- Colores: Modificar variables CSS en `mi-cuenta.css` / `onboarding.css`
- Textos: Editar HTML directamente
- Animaciones: Ajustar transitions/animations en CSS

## 🐛 Troubleshooting

### Usuario no es redirigido a onboarding
- Verificar que `perfilCompleto: false` en Firestore
- Revisar console para errores en `necesitaOnboarding()`
- Verificar que auth.js está importado correctamente

### Modal no se abre
- Verificar que mi-cuenta.js está cargado
- Comprobar que `window.abrirModalCuenta` existe
- Revisar console para errores de carga

### Cálculos incorrectos
- Verificar rangos de entrada
- Comprobar unidades (cm, kg)
- Revisar console para excepciones
- Validar factores en profile-calculator.js

### Perfil no se guarda
- Verificar reglas de Firestore
- Comprobar autenticación del usuario
- Revisar permisos del usuario en Firebase Console
- Verificar network tab para errores 403

## 📚 Referencias

- [Ecuación Mifflin-St Jeor](https://en.wikipedia.org/wiki/Basal_metabolic_rate#Calculation)
- [Factores de Actividad TDEE](https://www.calculator.net/tdee-calculator.html)
- [Requerimientos de Proteína](https://examine.com/nutrition/how-much-protein-do-you-need/)
- [Hidratación Recomendada](https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256)
- [Categorías IMC OMS](https://www.who.int/health-topics/obesity)

## 🤝 Contribución

Para contribuir al sistema de perfiles:
1. Mantener validaciones estrictas
2. Seguir convenciones de código existentes
3. Comentar en español
4. Probar cálculos con casos reales
5. Actualizar esta documentación

## 📄 Licencia

Mismo que el proyecto principal DataGym
