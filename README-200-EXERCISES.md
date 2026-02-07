# 🏋️ DataGym - Base de Datos de 200 Ejercicios

## 📋 Resumen

Se ha completado la expansión de la base de datos de ejercicios de **100 a 200 ejercicios**, con estructura completa de 27 campos por ejercicio.

---

## 🎯 Distribución de Ejercicios

| Grupo Muscular | Cantidad | Archivos |
|----------------|----------|----------|
| PECHO | 20 | exercises-complete-part1.js |
| ESPALDA | 30 | exercises-complete-part1.js |
| PIERNAS | 35 | exercises-complete-part2.js |
| HOMBROS | 20 | exercises-complete-part3.js |
| BÍCEPS | 15 | exercises-complete-part3.js |
| TRÍCEPS | 15 | exercises-complete-part3.js |
| CORE | 20 | exercises-complete-part4.js |
| GLÚTEOS | 15 | exercises-complete-part4.js |
| CARDIO | 15 | exercises-complete-part4.js |
| ACCESORIOS | 15 | exercises-complete-part4.js |
| **TOTAL** | **200** | |

---

## 📁 Estructura de Archivos

```
datagym/
├── exercises-complete-part1.js  (50 ejercicios: Pecho + Espalda)
├── exercises-complete-part2.js  (35 ejercicios: Piernas)
├── exercises-complete-part3.js  (50 ejercicios: Hombros + Bíceps + Tríceps)
├── exercises-complete-part4.js  (65 ejercicios: Core + Glúteos + Cardio + Accesorios)
├── exercises-db-complete-200.js (Master: Importa y combina todos)
├── exercises-db.js              (Archivo principal - ACTUALIZADO)
├── migrate-browser.js           (Script de migración para navegador)
├── test-200-exercises.js        (Tests de verificación)
├── MIGRATION-INSTRUCTIONS.md    (Instrucciones completas)
└── README-200-EXERCISES.md      (Este archivo)
```

---

## 🔧 Estructura de Datos

Cada ejercicio tiene **27 campos completos**:

### Campos Básicos (17)
```javascript
{
  id: 'press_banca',
  nombre: 'Press de banca',
  nombreEN: 'Bench Press',
  alias: ['press banca', 'bench press', 'press plano'],
  grupoMuscular: 'pecho',
  musculosSecundarios: ['triceps', 'hombros'],
  tipo: 'compuesto',
  equipamiento: 'barra',
  mecanica: 'empuje',
  dificultad: 'intermedio',
  tipoMedicion: 'peso_reps',
  unidadPeso: 'kg',
  icono: '💪',
  descripcion: 'Ejercicio fundamental...',
  popularidad: 98,
  orden: 1,
  activo: true
}
```

### Campos Avanzados (10)
```javascript
{
  // URLs de videos demostrativos
  video_url: 'https://youtube.com/watch?v=...',
  
  // Tags para búsqueda y categorización
  tags: ['basico', 'powerlifting', 'fuerza'],
  
  // Objetivo principal del ejercicio
  objetivo_primario: 'fuerza', // fuerza|hipertrofia|resistencia|potencia|movilidad
  
  // Plano de movimiento anatómico
  plano_movimiento: 'sagital', // sagital|frontal|transversal|multiplanar
  
  // Descansos sugeridos por objetivo (segundos)
  descanso_sugerido: {
    fuerza: 240,
    hipertrofia: 120,
    resistencia: 60
  },
  
  // Rangos de repeticiones óptimos por objetivo
  rango_reps_optimo: {
    fuerza: [1, 5],
    hipertrofia: [8, 12],
    resistencia: [15, 20]
  },
  
  // Nivel de dificultad técnica (1-5)
  nivel_tecnica: 3,
  
  // Tipo de simetría del ejercicio
  simetria: 'bilateral', // unilateral|bilateral|alternado
  
  // Frecuencia semanal recomendada
  frecuencia_semanal_sugerida: {
    min: 1,
    max: 3,
    optimo: 2
  },
  
  // IDs de ejercicios variantes relacionados
  variantes: ['press_banca_inclinado', 'press_mancuernas', 'press_suelo']
}
```

---

## 🚀 Migración a Firestore

### Opción 1: Script Automatizado (Recomendado)

1. **Abre la aplicación:**
   ```
   https://datagym.vercel.app
   ```

2. **Inicia sesión** (importante para permisos)

3. **Abre la consola del navegador:**
   - Windows/Linux: `F12` o `Ctrl + Shift + J`
   - Mac: `Cmd + Option + J`

4. **Ejecuta el test de verificación:**
   ```javascript
   // Copia y pega en la consola:
   import('./test-200-exercises.js');
   ```
   
   Deberías ver:
   ```
   ✅ Test 1: Importación exitosa
   ✅ Test 2: Cantidad correcta (200 ejercicios)
   ✅ Test 3: Estructura de campos completa
   ...
   ```

5. **Ejecuta la migración:**
   - Abre el archivo `migrate-browser.js`
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - Pégalo en la consola del navegador
   - Presiona Enter
   - Espera ~2 minutos

6. **Verifica el resultado:**
   - En la consola verás: "🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!"
   - Ve a [Firebase Console](https://console.firebase.google.com/project/datagym-gdcrp/firestore/data/exercises)
   - Deberías ver 200 documentos en la colección `exercises`

### Opción 2: Manual (si falla la automática)

Ver [MIGRATION-INSTRUCTIONS.md](./MIGRATION-INSTRUCTIONS.md) para pasos detallados.

---

## 🔒 Desplegar Firestore Rules

**IMPORTANTE:** Después de la migración, actualiza las reglas de seguridad:

1. Ve a [Firestore Rules](https://console.firebase.google.com/project/datagym-gdcrp/firestore/rules)

2. Copia el contenido de `firestore.rules`

3. Pégalo en el editor

4. Haz clic en **"Publicar"**

---

## ✅ Verificación Post-Migración

### 1. Test en la Aplicación

- Inicia un nuevo entrenamiento
- Haz clic en "Agregar ejercicio"
- Deberías ver los 200 ejercicios disponibles
- Prueba la búsqueda: "press", "sentadilla", "curl"
- Prueba los filtros por grupo muscular

### 2. Test de Búsqueda

```javascript
// En consola del navegador:
import('./exercises-db.js').then(module => {
  console.log('Total:', module.EXERCISES_DB.length);
  console.log('Búsqueda "press":', module.buscarEjercicios('press').length);
  console.log('Búsqueda "sentadilla":', module.buscarEjercicios('sentadilla').length);
});
```

### 3. Test de Pre-carga

- Completa un set de "Press de banca"
- Crea un nuevo entrenamiento
- El ejercicio debe aparecer en los sugeridos

---

## 📊 Ejercicios Destacados por Categoría

### Top 10 Más Populares
1. Peso muerto convencional (99)
2. Sentadilla barra (99)
3. Press de banca (98)
4. Hip thrust (98)
5. Plancha (98)
6. Dominadas pronas (96)
7. Press militar (96)
8. Burpees (95)
9. Curl barra Z (95)
10. Remo barra (94)

### Por Equipamiento

**Sin equipamiento (15):**
- Flexiones, Dominadas, Fondos, Sentadillas búlgaras, Plancha, etc.

**Con barra (50):**
- Press banca, Sentadilla, Peso muerto, Press militar, Remo, etc.

**Con mancuernas (45):**
- Press mancuernas, Curl, Press hombros, Remo, etc.

**Máquinas/Cables (40):**
- Prensa, Smith, Poleas, Extensiones, etc.

**Accesorios (35):**
- TRX, Kettlebell, Bandas, Foam roller, etc.

**Cardio/Funcional (15):**
- Burpees, Saltos, Sprints, Battle ropes, etc.

---

## 🛠️ Uso en el Código

### Importar ejercicios

```javascript
import { EXERCISES_DB, obtenerEjercicioPorId, buscarEjercicios } from './exercises-db.js';

// Obtener todos los ejercicios
console.log(EXERCISES_DB.length); // 200

// Buscar por ID
const pressaBanca = obtenerEjercicioPorId('press_banca');
console.log(pressaBanca.nombre); // "Press de banca"

// Buscar por término
const resultados = buscarEjercicios('sentadilla');
console.log(resultados.length); // ~10 variantes de sentadilla
```

### Filtrar por grupo muscular

```javascript
const ejerciciosPecho = EXERCISES_DB.filter(e => e.grupoMuscular === 'pecho');
console.log(ejerciciosPecho.length); // 20
```

### Ordenar por popularidad

```javascript
const topEjercicios = [...EXERCISES_DB]
  .sort((a, b) => b.popularidad - a.popularidad)
  .slice(0, 10);
```

### Filtrar por nivel técnico

```javascript
// Ejercicios para principiantes (nivel 1-2)
const principiantes = EXERCISES_DB.filter(e => e.nivel_tecnica <= 2);

// Ejercicios avanzados (nivel 4-5)
const avanzados = EXERCISES_DB.filter(e => e.nivel_tecnica >= 4);
```

### Obtener variantes de un ejercicio

```javascript
const pressaBanca = obtenerEjercicioPorId('press_banca');
const variantes = pressaBanca.variantes.map(id => obtenerEjercicioPorId(id));
console.log(variantes.map(v => v.nombre));
// ["Press inclinado", "Press con mancuernas", "Press en suelo"]
```

---

## 🎨 Casos de Uso

### 1. Recomendación de Ejercicios

```javascript
function recomendarEjercicios(grupoMuscular, nivel) {
  return EXERCISES_DB
    .filter(e => e.grupoMuscular === grupoMuscular)
    .filter(e => e.nivel_tecnica <= nivel)
    .sort((a, b) => b.popularidad - a.popularidad)
    .slice(0, 5);
}

// Ejercicios de pecho para principiantes
const recomendados = recomendarEjercicios('pecho', 2);
```

### 2. Planificación de Descansos

```javascript
function calcularDescanso(ejercicioId, objetivo) {
  const ejercicio = obtenerEjercicioPorId(ejercicioId);
  return ejercicio.descanso_sugerido[objetivo] || 90;
}

// ¿Cuánto descansar después de press banca para hipertrofia?
const descanso = calcularDescanso('press_banca', 'hipertrofia'); // 120 segundos
```

### 3. Generador de Rutinas

```javascript
function generarRutinaPush() {
  const pecho = EXERCISES_DB
    .filter(e => e.grupoMuscular === 'pecho')
    .slice(0, 3);
  
  const hombros = EXERCISES_DB
    .filter(e => e.grupoMuscular === 'hombros')
    .slice(0, 2);
  
  const triceps = EXERCISES_DB
    .filter(e => e.grupoMuscular === 'triceps')
    .slice(0, 2);
  
  return [...pecho, ...hombros, ...triceps];
}
```

---

## 📚 Fuentes de Ejercicios

Los ejercicios fueron seleccionados de programas y fuentes reconocidas:

- **StrongLifts 5x5** - Ejercicios básicos de fuerza
- **nSuns 531** - Variantes de powerlifting
- **Reddit PPL** - Rutina Push/Pull/Legs popular
- **Starting Strength** - Fundamentos de Mark Rippetoe
- **Bodybuilding.com** - Biblioteca de ejercicios
- **AthleanX** - Ejercicios funcionales y correctivos
- **Jeff Nippard** - Enfoque científico en hipertrofia
- **Renaissance Periodization** - Volumen y frecuencia óptimos

---

## 🔄 Próximos Pasos

1. ✅ Ejercicios creados (200 completos)
2. ✅ Estructura de 27 campos implementada
3. ✅ Scripts de migración creados
4. ⏳ **Ejecutar migración a Firestore**
5. ⏳ Desplegar Firestore Rules
6. ⏳ Testing completo en producción
7. ⏳ Commit y deploy a Vercel

---

## 🐛 Troubleshooting

### Error: "Firebase no está inicializado"
- Asegúrate de estar en https://datagym.vercel.app
- Recarga la página (F5)
- Verifica que firebase-config.js se haya cargado

### Error: "No se pudieron cargar los ejercicios"
- Verifica que exercises-db-complete-200.js exista
- Prueba la Opción 2 (manual) de migración
- Revisa la consola para errores de importación

### Los ejercicios no aparecen en la app
- Verifica que la migración se haya completado en Firebase Console
- Limpia caché del navegador (Ctrl+Shift+R)
- Revisa que exercises-db.js esté importando EXERCISES_DB_COMPLETE
- Verifica las Firestore Rules

### La búsqueda no funciona bien
- Verifica que los campos `alias` y `tags` estén completos
- Revisa la función `buscarEjercicios` en exercises-db.js
- Asegúrate de que `nombreEN` esté en minúsculas

---

## 📞 Contacto

Para reportar problemas o sugerencias:
- GitHub Issues: [github.com/DiazColG/datagym/issues](https://github.com/DiazColG/datagym/issues)
- Email: (tu email aquí)

---

## 📄 Licencia

(Tu licencia aquí)

---

**¡DataGym ahora tiene 200 ejercicios completos listos para producción! 🎉**
