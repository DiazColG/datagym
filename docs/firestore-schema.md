# Firestore Database Schema

Esta documentación describe la estructura de datos de **DataGym** en Cloud Firestore.

## 📚 Estructura General

```
firestore/
└── users/                           # Colección de usuarios
    └── {userId}/                    # Documento de usuario (ID de Firebase Auth)
        ├── profile/                 # Subcolección de perfil
        │   └── info                 # Documento con información del usuario
        │
        ├── ejercicios/             # Subcolección de ejercicios
        │   └── {ejercicioId}       # Documentos individuales de ejercicios
        │
        ├── peso/                   # Subcolección de registros de peso
        │   └── {fechaISO}          # Documentos por fecha (YYYY-MM-DD)
        │
        ├── agua/                   # Subcolección de consumo de agua
        │   └── {fechaISO}          # Documentos por fecha (YYYY-MM-DD)
        │
        └── config/                 # Subcolección de configuración
            └── preferencias        # Documento con preferencias del usuario
```

---

## 🔐 1. Perfil de Usuario

**Ruta**: `users/{userId}/profile/info`

### Campos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `nombre` | `string` | Nombre del usuario | `"Juan Pérez"` |
| `email` | `string` | Correo electrónico | `"juan@email.com"` |
| `fechaRegistro` | `timestamp` | Fecha de registro | `Timestamp` |
| `fotoURL` | `string` | URL de la foto de perfil | `"https://..."` |

### Ejemplo

```javascript
{
  nombre: "Juan Pérez",
  email: "juan@email.com",
  fechaRegistro: Timestamp(2024-01-15T10:30:00Z),
  fotoURL: "https://lh3.googleusercontent.com/..."
}
```

---

## 🏋️ 2. Ejercicios

**Ruta**: `users/{userId}/ejercicios/{ejercicioId}`

### Campos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `nombre` | `string` | Nombre del ejercicio | `"Correr"` |
| `duracion` | `number` | Duración en minutos | `30` |
| `calorias` | `number` | Calorías quemadas | `250` |
| `fecha` | `timestamp` | Fecha y hora del ejercicio | `Timestamp` |
| `fechaISO` | `string` | Fecha en formato ISO | `"2024-01-15"` |
| `timestamp` | `number` | Timestamp de creación | `1705320600000` |

### Consultas Comunes

```javascript
// Obtener ejercicios ordenados por fecha (más recientes primero)
query(ejerciciosRef, orderBy('timestamp', 'desc'), limit(100))

// Obtener ejercicios de una fecha específica
query(ejerciciosRef, where('fechaISO', '==', '2024-01-15'))
```

---

## ⚖️ 3. Registro de Peso

**Ruta**: `users/{userId}/peso/{fechaISO}`

### Campos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `valor` | `number` | Peso en kilogramos | `75.5` |
| `fecha` | `timestamp` | Fecha del pesaje | `Timestamp` |
| `unidad` | `string` | Unidad de medida | `"kg"` |

---

## 💧 4. Consumo de Agua

**Ruta**: `users/{userId}/agua/{fechaISO}`

### Campos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `vasos` | `number` | Número de vasos consumidos | `5` |
| `objetivo` | `number` | Meta de vasos diarios | `8` |
| `fecha` | `timestamp` | Fecha del registro | `Timestamp` |
| `mililitros` | `number` | Total en mililitros | `1250` |

---

## 🔒 Reglas de Seguridad de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🔄 Sincronización en Tiempo Real

DataGym utiliza listeners de Firestore para sincronización automática:

```javascript
escucharEjercicios(userId, (ejercicios) => {
  actualizarUIEjercicios(ejercicios);
});
```

---

**Versión de DataGym**: 2.0.0 (Firebase Edition)
