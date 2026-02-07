# 🚀 Instrucciones de Migración - 200 Ejercicios a Firestore

## Paso 1: Preparación
✅ Ya completado: 200 ejercicios creados con estructura completa (27 campos cada uno)

## Paso 2: Ejecutar Migración en Navegador

### Opción A: Script Automático (Recomendado)

1. **Abre la aplicación en tu navegador:**
   ```
   https://datagym.vercel.app
   ```

2. **Asegúrate de estar autenticado** (si no, inicia sesión primero)

3. **Abre la consola del navegador:**
   - Windows/Linux: `F12` o `Ctrl + Shift + J`
   - Mac: `Cmd + Option + J`
   - O clic derecho → "Inspeccionar" → pestaña "Console"

4. **Copia TODO el contenido de `migrate-browser.js`** (Ctrl+A, Ctrl+C en ese archivo)

5. **Pega en la consola del navegador** y presiona Enter

6. **Espera a que termine** (~2 minutos para 200 ejercicios)
   - Verás el progreso en tiempo real
   - Al finalizar mostrará: "🎉 ¡MIGRACIÓN COMPLETADA!"

### Opción B: Manual (si falla la automática)

Si el script no puede importar automáticamente los ejercicios:

1. Abre `exercises-db-complete-200.js`
2. Copia el array `EXERCISES_DB_COMPLETE` completo
3. En la consola, ejecuta:
   ```javascript
   window.EXERCISES_TO_MIGRATE = [... pega aquí el array completo ...];
   ```
4. Luego ejecuta el script de migración (Opción A, pasos 4-6)

## Paso 3: Verificar Migración

1. **En la consola del navegador** verás un resumen:
   ```
   ✅ 200 ejercicios migrados correctamente
   
   📊 Resumen por grupo muscular:
      PIERNAS: 35 ejercicios
      ESPALDA: 30 ejercicios
      PECHO: 20 ejercicios
      ...etc
   ```

2. **En Firebase Console:**
   - Ve a: https://console.firebase.google.com/project/datagym-93dfa/firestore/data/exercises
   - Deberías ver 200 documentos en la colección `exercises`
   - Verifica algunos ejercicios aleatorios que tengan todos los campos

3. **En la aplicación:**
   - Inicia un nuevo entrenamiento
   - Haz clic en "Agregar ejercicio"
   - Deberías ver los 200 ejercicios en el modal
   - Prueba buscar algunos ejercicios específicos
   - Prueba filtrar por grupo muscular

## Paso 4: Actualizar exercises-db.js

Una vez verificada la migración, actualiza el archivo principal:

```javascript
// En exercises-db.js, línea ~10:
import { EXERCISES_DB_COMPLETE } from './exercises-db-complete-200.js';

// Cambia la constante de 100 a 200:
const EXERCISES_DB = EXERCISES_DB_COMPLETE;
```

## Paso 5: Desplegar Reglas de Firestore

**IMPORTANTE:** Las reglas deben desplegarse manualmente en Firebase Console.

1. Ve a: https://console.firebase.google.com/project/datagym-93dfa/firestore/rules

2. Copia el contenido completo de `firestore.rules`

3. Pégalo en el editor de reglas

4. Clic en "Publicar"

5. Verifica que las reglas estén activas

## Paso 6: Commit y Deploy

```bash
git add .
git commit -m "✅ 200 ejercicios completos + migración a Firestore"
git push origin main
```

Vercel desplegará automáticamente.

## Paso 7: Testing Final

1. **Test de carga:**
   - Ve a https://datagym.vercel.app
   - Inicia sesión
   - Crea un nuevo entrenamiento
   - Verifica que los 200 ejercicios carguen rápido

2. **Test de búsqueda:**
   - Busca: "press banca" → Debe mostrar press_banca, press_banca_inclinado, etc.
   - Busca: "sentadilla" → Debe mostrar todas las variantes de sentadillas
   - Busca: "curl" → Debe mostrar todos los curls de bíceps

3. **Test de filtros:**
   - Filtra por "PECHO" → 20 ejercicios
   - Filtra por "ESPALDA" → 30 ejercicios
   - Filtra por "PIERNAS" → 35 ejercicios

4. **Test de pre-carga:**
   - Completa un set de press_banca
   - Crea un nuevo entrenamiento
   - Verifica que press_banca aparezca en los sugeridos

5. **Test de analytics:**
   - Verifica que los campos nuevos funcionen:
     - video_url debe abrir videos
     - nivel_tecnica debe mostrar estrellas
     - descanso_sugerido debe autocompletar tiempos
     - variantes debe mostrar ejercicios relacionados

---

## 📊 Estructura de Datos

Cada ejercicio tiene 27 campos:

### Campos Básicos (17)
- id, nombre, nombreEN, alias
- grupoMuscular, musculosSecundarios, tipo, equipamiento
- mecanica, dificultad, tipoMedicion, unidadPeso, icono
- descripcion, popularidad, orden, activo

### Campos Avanzados (10)
- video_url (string)
- tags (array)
- objetivo_primario (string)
- plano_movimiento (string)
- descanso_sugerido (object)
- rango_reps_optimo (object)
- nivel_tecnica (number 1-5)
- simetria (string)
- frecuencia_semanal_sugerida (object)
- variantes (array)

---

## 🎯 Distribución de Ejercicios

| Grupo Muscular | Cantidad |
|----------------|----------|
| PECHO          | 20       |
| ESPALDA        | 30       |
| PIERNAS        | 35       |
| HOMBROS        | 20       |
| BÍCEPS         | 15       |
| TRÍCEPS        | 15       |
| CORE           | 20       |
| GLÚTEOS        | 15       |
| CARDIO         | 15       |
| ACCESORIOS     | 15       |
| **TOTAL**      | **200**  |

---

## ❓ Troubleshooting

### "Firebase no está inicializado"
- Asegúrate de estar en https://datagym.vercel.app (no localhost)
- Verifica que la página haya cargado completamente
- Revisa que firebase-config.js se haya importado correctamente

### "No se pudieron cargar los ejercicios"
- Usa la Opción B (manual)
- Copia el array completo de exercises-db-complete-200.js
- Ejecútalo en la consola como `window.EXERCISES_TO_MIGRATE`

### "Error en batch X"
- Revisa la consola para el mensaje de error específico
- Verifica permisos en Firestore Rules
- Asegúrate de estar autenticado

### La migración se completó pero no veo ejercicios en la app
- Verifica en Firebase Console que los documentos existan
- Limpia caché del navegador (Ctrl+Shift+R)
- Verifica que exercises-db.js esté importando el array correcto
- Revisa las Firestore Rules

---

## 📞 Soporte

Si algo falla:
1. Revisa la consola del navegador (F12)
2. Verifica Firebase Console
3. Revisa los logs de Vercel
4. Documenta el error específico que ves
