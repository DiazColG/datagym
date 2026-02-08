# Índices de Firestore Requeridos

Los siguientes índices son necesarios para que las queries funcionen correctamente.

## 📋 Índices Necesarios

### 1. Workouts - Calcular Streak (Query 1)
**Colección**: `users/{userId}/workouts`
**Campos**:
- Campo 1: `estado` (Ascending)
- Campo 2: `fecha` (Ascending)  ← Nota: Aunque ordenamos DESC en código, el índice necesita Ascending
**Query scope**: Collection

### 2. Workouts - Personal Records (Query 2)
**Colección**: `users/{userId}/workouts`
**Campos**:
- Campo 1: `estado` (Ascending)
- Campo 2: `fecha` (Descending)
**Query scope**: Collection

## 🔧 Cómo Crear los Índices (MUY FÁCIL)

### 🎯 Opción 1: Crear Automáticamente desde el Error (Recomendado)

1. **Recarga la app** en https://datagym.vercel.app
2. **Abre la consola** (F12)
3. Verás errores que dicen: `"The query requires an index. You can create it here:"`
4. **Haz clic en el link azul** que aparece en el error
5. Firebase te llevará directo a crear el índice
6. **Haz clic en "Create Index"** (botón morado)
7. Espera 2-5 minutos mientras se crea
8. **Recarga la app** y ya funciona! ✅

**Ejemplo del link que verás**:
```
https://console.firebase.google.com/v1/r/project/datagym-gdcrp/firestore/indexes?create_composite=...
```

### 📝 Opción 2: Crear Manualmente

Si prefieres crearlos manualmente:

1. Ve a [Firebase Console - Indexes](https://console.firebase.google.com/project/datagym-gdcrp/firestore/indexes)
2. Haz clic en **"Create Index"**
3. Configura el primer índice:
   - **Collection ID**: `workouts`
   - **Query scope**: Collection
   - **Fields to index**:
     - Campo 1: `estado` → Ascending
     - Campo 2: `fecha` → Ascending
4. Haz clic en **"Create"**
5. Repite para el segundo índice (mismo proceso pero `fecha` en Descending)
6. Espera a que ambos se completen (estado: "Enabled")

## ✅ Verificación

Una vez creados los índices (espera 2-5 minutos), verifica que funcionan:

```javascript
// En la consola del navegador (F12):
await calcularStreak(auth.currentUser.uid)  // Debería devolver un número
await obtenerPersonalRecords(auth.currentUser.uid, 5)  // Debería devolver array de PRs
```

**Si no hay errores rojos**, los índices están funcionando correctamente! 🎉

## 🚀 Optimizaciones Implementadas

Para reducir costos y mejorar velocidad:

✅ **Caché de 24 horas**: Streak y PRs se calculan una vez al día
✅ **Límite de queries**: Solo últimos 60 días (streak) y 50 workouts (PRs)  
✅ **Fallback a caché expirado**: Si Firestore falla, usa caché viejo
✅ **Invalidación automática**: Al terminar workout, se limpia el caché

**Resultado**: De 365 documentos leídos → 30-50 documentos leídos (85% menos)

## 📝 Notas Técnicas

- Los índices se crean **una sola vez** y quedan permanentes
- Son necesarios para queries con `where` + `orderBy` combinados
- Firestore no permite estas queries sin índices (por rendimiento)
- El link del error te lleva directo al índice correcto pre-configurado
- Los índices son específicos por colección, no afectan otras queries

## 🔗 Links Útiles

- [Firestore Indexes Console](https://console.firebase.google.com/project/datagym-gdcrp/firestore/indexes)
- [Documentación oficial de índices](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Entender Composite Indexes](https://firebase.google.com/docs/firestore/query-data/index-overview)

