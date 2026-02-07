# 🏋️ MIGRACIÓN: 200 EJERCICIOS A FIREBASE

## Estado Actual
✅ **Estructura definida** con 10 nuevas variables  
✅ **20 ejercicios de PECHO** completados y documentados  
⏳ **Pendiente**: 180 ejercicios restantes

---

## 📊 Distribución Propuesta (200 ejercicios)

| Grupo Muscular | Cantidad | Ejemplos Principales |
|----------------|----------|---------------------|
| **Pecho** | 20 | Press banca, Fondos, Aperturas |
| **Espalda** | 30 | Dominadas, Peso muerto, Remos |
| **Piernas** | 35 | Sentadilla, Prensa, Peso muerto rumano |
| **Hombros** | 20 | Press militar, Elevaciones, Face pulls |
| **Bíceps** | 15 | Curl barra, Curl martillo, Predicador |
| **Tríceps** | 15 | Press francés, Fondos, Extensiones |
| **Core** | 20 | Plancha, Crunch, Elevación piernas |
| **Glúteos** | 15 | Hip thrust, Patadas, Abductores |
| **Cardio/Funcional** | 15 | Burpees, Mountain climbers, Box jumps |
| **Antebrazos/Accesorios** | 15 | Farmer walks, Wrist curls, Dead hangs |

---

## ✨ 10 Nuevas Variables Agregadas

1. **video_url** - Link a tutorial en YouTube
2. **tags** - Array de etiquetas para búsqueda avanzada
3. **objetivo_primario** - fuerza / hipertrofia / resistencia / potencia / movilidad
4. **plano_movimiento** - sagital / frontal / transversal / multiplanar
5. **descanso_sugerido** - Objeto con tiempos según objetivo
6. **rango_reps_optimo** - Objeto con rangos según objetivo
7. **nivel_tecnica** - 1-5 (complejidad de ejecución)
8. **simetria** - unilateral / bilateral / alternado
9. **frecuencia_semanal_sugerida** - Min/max/óptimo
10. **variantes** - Array de IDs de ejercicios similares

---

## 🚀 Pasos para Completar

### Opción A: Manual (Recomendada para calidad)
1. Completar `exercises-db-extended.js` con 180 ejercicios restantes
2. Seguir estructura de los 20 ejemplos de PECHO
3. Buscar ejercicios populares en:
   - StrongLifts 5x5
   - Starting Strength
   - nSuns programs
   - Reddit r/Fitness Wiki
   - Bodybuilding.com Exercise Database

### Opción B: Semi-Automática
1. Yo genero un dataset base con los 180 ejercicios más conocidos
2. Tú revisas y ajustas los valores de popularidad/orden
3. Ejecutamos migración

### Opción C: Incremental
1. Subir los 20 de PECHO primero a Firebase
2. Agregar grupos musculares por semana
3. Ir mejorando con feedback de usuarios

---

## 📝 Template para Agregar Ejercicios

```javascript
{
    id: 'nombre_ejercicio',
    nombre: 'Nombre en Español',
    nombreEN: 'Name in English',
    alias: ['variante1', 'variante2'],
    grupoMuscular: 'grupo',
    musculosSecundarios: ['aux1', 'aux2'],
    tipo: 'compuesto' | 'aislamiento',
    equipamiento: 'barra' | 'mancuerna' | 'maquina' | 'peso corporal' | 'polea',
    mecanica: 'empuje' | 'tiron' | 'isometrico',
    dificultad: 'principiante' | 'intermedio' | 'avanzado',
    tipoMedicion: 'peso_reps',
    unidadPeso: 'kg',
    icono: '💪',
    descripcion: 'Descripción breve',
    popularidad: 1-100,
    orden: numero,
    activo: true,
    video_url: 'https://youtube.com/...',
    tags: ['tag1', 'tag2'],
    objetivo_primario: 'hipertrofia',
    plano_movimiento: 'sagital',
    descanso_sugerido: { fuerza: 180, hipertrofia: 90, resistencia: 60 },
    rango_reps_optimo: { fuerza: [1,5], hipertrofia: [8,12], resistencia: [15,20] },
    nivel_tecnica: 1-5,
    simetria: 'bilateral',
    frecuencia_semanal_sugerida: { min: 1, max: 3, optimo: 2 },
    variantes: ['id1', 'id2']
}
```

---

## ⚡ Comando para Ejecutar Migración

```bash
# 1. Completar exercises-db-extended.js
# 2. Ejecutar:
node migrate-exercises-to-firestore.js
```

---

## 🎯 Próximos Pasos

**¿Qué prefieres?**

1. **YO completo los 180 ejercicios** (toma ~30 min)
2. **TÚ completas** siguiendo el template
3. **Subimos los 20 de PECHO ahora** y vamos agregando gradualmente

Dime qué opción prefieres y continúo.
