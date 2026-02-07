# 🔥 INSTRUCCIONES PARA ARREGLAR FIRESTORE PERMISSIONS

## Problema
```
FirebaseError: Missing or insufficient permissions
```

## Solución (2 minutos)

### Paso 1: Abrir Firebase Console
1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **datagym**

### Paso 2: Aplicar Reglas
1. En el menú izquierdo → **Firestore Database**
2. Click en pestaña **"Reglas"** (Rules)
3. **BORRA TODO** el contenido actual
4. **COPIA Y PEGA** el contenido del archivo `firestore.rules` que está en la raíz del proyecto
5. Click en **"Publicar"** (Publish)

### Paso 3: Verificar
1. Recarga la app: https://datagym.vercel.app/
2. Intenta iniciar un entrenamiento vacío
3. Debería funcionar ✅

---

## ¿Qué hacen estas reglas?

✅ **Colecciones públicas** (solo lectura):
- `exercises` - Ejercicios del catálogo
- `rutinasPublicas` - Plantillas de rutinas
- `programasPublicos` - Plantillas de programas

🔒 **Datos privados** (cada usuario solo ve lo suyo):
- `users/{userId}/workouts` - Entrenamientos
- `users/{userId}/rutinas` - Rutinas personales
- `users/{userId}/programas` - Programas personales
- `users/{userId}/profile` - Perfil
- `users/{userId}/records` - Personal records

---

## Tiempo estimado: 2 minutos ⏱️
