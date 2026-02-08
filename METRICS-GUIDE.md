# 📊 GUÍA DE MÉTRICAS - RUTINAS PÚBLICAS

## 🎯 Resumen

Ahora que las rutinas están en Firestore, tienes 3 métricas profesionales:
- **Vistas:** Cada vez que alguien abre el detalle de una rutina
- **Copias:** Cada vez que alguien copia la rutina a sus rutinas personales  
- **Likes:** (Sistema para implementar luego - por ahora en 0)

---

## 📈 CÓMO VER TUS MÉTRICAS

### **Método 1: Firebase Console (Visual)**

1. **Acceso:**
   ```
   https://console.firebase.google.com/project/datagym-gdcrp/firestore/data/rutinasPublicas
   ```

2. **Qué verás:**
   - Lista de 20 rutinas (después de ejecutar migración)
   - Click en cualquier rutina para ver detalles
   - Campos de métricas:
     * `vistas` - Cuántas veces se abrió el detalle
     * `copias` - Cuántas veces fue copiada
     * `likes` - Me gusta (futuro)

3. **Vista organizada:**
   - Ordena por columna "copias" → Ver las más copiadas
   - Ordena por "vistas" → Ver las más vistas
   - Busca por ID específico

---

### **Método 2: Ejecutar Query en Consola del Navegador**

1. **Abrir tu app:** https://datagym.vercel.app
2. **Login:** Inicia sesión
3. **Abrir consola:** F12
4. **Ejecutar query:**

```javascript
// Ver métricas de TODAS las rutinas
const queryRutinas = await firebase.firestore()
  .collection('rutinasPublicas')
  .orderBy('copias', 'desc')
  .get();

queryRutinas.docs.forEach(doc => {
  const data = doc.data();
  console.log(`${data.nombre}:
    📋 ${data.copias || 0} copias
    👁️  ${data.vistas || 0} vistas  
    ❤️  ${data.likes || 0} likes`);
});
```

5. **Ver top 5 más copiadas:**

```javascript
const queryTop = await firebase.firestore()
  .collection('rutinasPublicas')
  .orderBy('copias', 'desc')
  .limit(5)
  .get();

console.table(queryTop.docs.map(doc => ({
  nombre: doc.data().nombre,
  copias: doc.data().copias || 0,
  vistas: doc.data().vistas || 0,
  nivel: doc.data().nivel
})));
```

---

### **Método 3: Dashboard Personalizado (Script)**

Copia y pega esto en la consola (con la app abierta):

```javascript
(async () => {
  const db = window.db;
  
  const snapshot = await db.collection('rutinasPublicas').get();
  
  const rutinas = snapshot.docs.map(doc => ({
    nombre: doc.data().nombre,
    nivel: doc.data().nivel,
    copias: doc.data().copias || 0,
    vistas: doc.data().vistas || 0,
    likes: doc.data().likes || 0
  }));
  
  // Ordenar por engagement (copias * 3 + vistas)
  const sorted = rutinas.sort((a, b) => 
    (b.copias * 3 + b.vistas) - (a.copias * 3 + a.vistas)
  );
  
  console.log('═══════════════════════════════════════');
  console.log('  📊 MÉTRICAS DE RUTINAS PÚBLICAS');
  console.log('═══════════════════════════════════════\n');
  
  sorted.forEach((r, i) => {
    const engagement = r.copias * 3 + r.vistas;
    console.log(`${i+1}. ${r.nombre}`);
    console.log(`   📋 ${r.copias} copias | 👁️ ${r.vistas} vistas`);
    console.log(`   💡 Engagement: ${engagement} | Nivel: ${r.nivel}\n`);
  });
  
  // Totales
  const totales = {
    copias: rutinas.reduce((sum, r) => sum + r.copias, 0),
    vistas: rutinas.reduce((sum, r) => sum + r.vistas, 0),
    likes: rutinas.reduce((sum, r) => sum + r.likes, 0)
  };
  
  console.log('═══════════════════════════════════════');
  console.log(`TOTALES: ${totales.copias} copias | ${totales.vistas} vistas`);
  console.log('═══════════════════════════════════════');
})();
```

---

## 🚀 PASOS PARA ACTIVAR MÉTRICAS

### **1. Ejecutar la migración**

1. Abrir: https://datagym.vercel.app
2. Iniciar sesión
3. Abrir consola (F12)
4. **Importante:** Primero carga las rutinas:
   ```javascript
   import("./rutinas-publicas.js").then(m => { 
     window.RUTINAS_PUBLICAS = m.RUTINAS_PUBLICAS; 
     console.log("✅ Rutinas listas:", window.RUTINAS_PUBLICAS.length); 
   })
   ```
5. Esperar mensaje: `✅ Rutinas listas: 20`
6. Copiar **TODO** el script [migrate-routines-browser.js](migrate-routines-browser.js)
7. Pegar en consola
8. Presionar Enter
9. Esperar 5 segundos (confirmación)
10. **Resultado:** 20 rutinas migradas a Firestore

### **2. Verificar migración**

```
https://console.firebase.google.com/project/datagym-gdcrp/firestore/data/rutinasPublicas
```

Deberías ver 20 documentos con:
- `activa: true`
- `copias: 0`
- `vistas: 0`
- `likes: 0`
- `createdAt: (timestamp)`

### **3. Probar la app**

1. Recargar: https://datagym.vercel.app
2. Ir a **Explorar Rutinas**
3. Debería cargar las 20 rutinas desde Firestore
4. Abrir detalle de una rutina → ✅ +1 vista
5. Copiar una rutina → ✅ +1 copia
6. Verificar métricas en Firebase Console

---

## 📊 INTERPRETACIÓN DE MÉTRICAS

### **Vistas**
- **Alta:** Rutina llamativa, buen nombre/descripción
- **Baja:** Mala visibilidad o poco atractiva
- **Acción:** Mejorar nombre, descripción, icono

### **Copias**
- **Alta:** Rutina útil y relevante
- **Baja:** No cumple expectativas o mal diseñada
- **Ratio vistas/copias:** 
  - 10:1 = Excelente (10% conversión)
  - 50:1 = Normal
  - 100:1 = Mala (revisar contenido)

### **Engagement Score**
```
Score = (copias × 3) + (vistas × 1) + (likes × 2)
```
- Copias pesan más (acción concreta)
- Vistas = interés inicial
- Likes = satisfacción (futuro)

---

## 🎯 EJEMPLOS DE ANÁLISIS

### **Caso 1: Rutina con muchas vistas pero pocas copias**
```
📊 "PPL Hipertrofia"
   - 500 vistas
   - 10 copias
   - Ratio: 2% conversión ❌
   
🔍 Problema: Interés inicial alto pero no convence
💡 Solución: Revisar ejercicios, mejorar descripción
```

### **Caso 2: Pocas vistas pero muchas copias**
```
📊 "Fuerza 5×5"
   - 50 vistas
   - 20 copias
   - Ratio: 40% conversión ✅
   
🔍 Análisis: Baja visibilidad pero alta calidad
💡 Solución: Marcar como "destacada", mejor posicionamiento
```

### **Caso 3: Dormida (no se usa)**
```
📊 "Crossfit WODs"
   - 5 vistas
   - 0 copias
   - Ratio: 0% ❌
   
🔍 Problema: Nadie la encuentra o no interesa
💡 Solución: Mejorar SEO interno, cambiar nivel/objetivo
```

---

## 🔥 QUERIES ÚTILES

### **Top 5 más copiadas**
```javascript
const query = firebase.firestore()
  .collection('rutinasPublicas')
  .orderBy('copias', 'desc')
  .limit(5);
```

### **Rutinas sin copias (a revisar)**
```javascript
const query = firebase.firestore()
  .collection('rutinasPublicas')
  .where('copias', '==', 0)
  .get();
```

### **Rutinas con mejor ratio (vistas > 10)**
```javascript
const snapshot = await firebase.firestore()
  .collection('rutinasPublicas')
  .where('vistas', '>', 10)
  .get();

const rutinas = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    nombre: data.nombre,
    ratio: ((data.copias / data.vistas) * 100).toFixed(1) + '%',
    copias: data.copias,
    vistas: data.vistas
  };
}).sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio));

console.table(rutinas);
```

### **Métricas por nivel**
```javascript
const snapshot = await firebase.firestore()
  .collection('rutinasPublicas')
  .get();

const porNivel = {};
snapshot.docs.forEach(doc => {
  const nivel = doc.data().nivel;
  if (!porNivel[nivel]) {
    porNivel[nivel] = { copias: 0, vistas: 0, count: 0 };
  }
  porNivel[nivel].copias += doc.data().copias || 0;
  porNivel[nivel].vistas += doc.data().vistas || 0;
  porNivel[nivel].count += 1;
});

console.table(porNivel);
```

---

## 💡 PRÓXIMOS PASOS

### **Corto plazo (implementar ahora):**
1. ✅ Migrar rutinas a Firestore
2. ✅ Sistema de vistas funcional
3. ✅ Sistema de copias funcional
4. ⏳ Agregar botón de "Like" en detalle de rutina
5. ⏳ Dashboard interno para ver métricas en la app

### **Mediano plazo:**
- Analytics de cuándo se usan más las rutinas (día/hora)
- Trending rutinas (últimos 7 días)
- Recomendaciones basadas en comportamiento
- Notificaciones "Tu rutina favorita tiene nuevas copias"

### **Largo plazo:**
- Sistema de comentarios/reviews
- Ratings (estrellas)
- Rutinas comunitarias (users pueden crear públicas)
- Monetización (rutinas premium)

---

## 🐛 TROUBLESHOOTING

### **No aparecen métricas en Firebase**
```
❌ Problema: Campos copias/vistas en 0 o undefined
✅ Solución: Ejecutar la migración primero
```

### **App carga lento**
```
❌ Problema: Lee Firestore cada vez
✅ Solución: Caché de 5min está implementado, verifica localStorage
```

### **Métricas no se actualizan**
```
❌ Problema: Caché viejo
✅ Solución: 
   - Espera 5 minutos (TTL)
   - O ejecuta: localStorage.removeItem('datagym_public_routines')
```

---

## 📚 DOCUMENTACIÓN TÉCNICA

### **Estructura de datos**
```javascript
rutinasPublicas/{rutinaId} = {
  // Datos de rutina
  nombre: string,
  descripcion: string,
  nivel: 'principiante' | 'intermedio' | 'avanzado',
  objetivo: 'fuerza' | 'hipertrofia' | 'definicion' | etc,
  ejercicios: array,
  
  // Métricas (SE INCREMENTAN AUTOMÁTICAMENTE)
  copias: number,    // increment() al copiar
  vistas: number,    // increment() al abrir detalle
  likes: number,     // increment() al dar like
  
  // Metadata
  activa: boolean,
  destacada: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Funciones principales**
```javascript
// rutinas-manager.js
obtenerRutinasPublicas(filtros)      // GET con caché 5min
incrementarMetricaRutina(id, tipo)   // +1 a copias/vistas/likes
copiarRutinaPublica(userId, rutina)  // Copia + incrementa
```

### **Caché**
- **Key:** `datagym_public_routines`
- **TTL:** 5 minutos (300000ms)
- **Invalidación:** Manual o automática al incrementar métricas

---

¿Preguntas? Ejecuta la migración y prueba! 🚀
