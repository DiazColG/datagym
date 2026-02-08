# Índices de Firestore Requeridos

Los siguientes índices son necesarios para que las queries funcionen correctamente.

## 📋 Índices Necesarios

### 1. Workouts - Calcular Streak
**Colección**: `users/{userId}/workouts`
- Campo 1: `estado` (Ascending)
- Campo 2: `fecha` (Descending)

**Query scope**: Collection group

### 2. Workouts - Personal Records
**Colección**: `users/{userId}/workouts`
- Campo 1: `estado` (Ascending)
- Campo 2: `fecha` (Descending)

**Query scope**: Collection group

## 🔧 Cómo Crear los Índices

### Opción 1: Crear Automáticamente (Recomendado)

1. Usa la app normalmente
2. Cuando veas errores en la consola que digan "The query requires an index"
3. Haz clic en el link que aparece en el error
4. Firebase te llevará directamente a crear el índice
5. Haz clic en "Crear índice"
6. Espera 2-5 minutos a que se complete

### Opción 2: Crear Manualmente

1. Ve a [Firebase Console](https://console.firebase.google.com/project/datagym-gdcrp/firestore/indexes)
2. Haz clic en "Crear índice"
3. Configura:
   - **Collection ID**: `workouts`
   - **Query scope**: Collection group
   - **Fields to index**:
     - Campo 1: `estado` → Ascending
     - Campo 2: `fecha` → Descending
4. Haz clic en "Crear"
5. Espera a que se complete la creación (2-5 minutos)

## ✅ Verificación

Una vez creados los índices, verifica que funcionan:

```javascript
// En la consola del navegador:
await calcularStreak(auth.currentUser.uid)
await obtenerPersonalRecords(auth.currentUser.uid, 5)
```

Si no hay errores, los índices están funcionando correctamente.

## 📝 Notas

- Los índices se crean una sola vez y quedan permanentes
- Son necesarios para queries compuestas (múltiples where/orderBy)
- Firestore no permite queries sin índices por rendimiento
- Los links de error te llevan directo a crear el índice correcto

## 🔗 Links Útiles

- [Firestore Indexes Console](https://console.firebase.google.com/project/datagym-gdcrp/firestore/indexes)
- [Documentación oficial](https://firebase.google.com/docs/firestore/query-data/indexing)
