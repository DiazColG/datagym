// =========================================
// TEST RÁPIDO - VERIFICAR 200 EJERCICIOS
// =========================================
// Ejecutar en consola del navegador para verificar la integración

console.log('🧪 TEST: Verificando integración de 200 ejercicios...');
console.log('');

// Test 1: Importar desde exercises-db.js
import('./exercises-db.js').then(module => {
  const { EXERCISES_DB, GRUPOS_MUSCULARES, obtenerEjercicioPorId, buscarEjercicios } = module;
  
  console.log('✅ Test 1: Importación exitosa');
  console.log(`   Total ejercicios: ${EXERCISES_DB.length}`);
  console.log('');
  
  // Test 2: Verificar cantidad
  if (EXERCISES_DB.length === 200) {
    console.log('✅ Test 2: Cantidad correcta (200 ejercicios)');
  } else {
    console.error(`❌ Test 2 FALLÓ: Se esperaban 200, se encontraron ${EXERCISES_DB.length}`);
  }
  console.log('');
  
  // Test 3: Verificar estructura de campos
  const primeraEj = EXERCISES_DB[0];
  const camposRequeridos = [
    'id', 'nombre', 'grupoMuscular', 'video_url', 'tags', 
    'objetivo_primario', 'nivel_tecnica', 'variantes'
  ];
  
  const camposFaltantes = camposRequeridos.filter(campo => !(campo in primeraEj));
  if (camposFaltantes.length === 0) {
    console.log('✅ Test 3: Estructura de campos completa');
  } else {
    console.error(`❌ Test 3 FALLÓ: Faltan campos: ${camposFaltantes.join(', ')}`);
  }
  console.log('');
  
  // Test 4: Distribución por grupo muscular
  console.log('📊 Test 4: Distribución por grupo muscular:');
  const distribucion = {};
  EXERCISES_DB.forEach(ej => {
    distribucion[ej.grupoMuscular] = (distribucion[ej.grupoMuscular] || 0) + 1;
  });
  
  const esperado = {
    pecho: 20, espalda: 30, piernas: 35, hombros: 20,
    biceps: 15, triceps: 15, core: 20, gluteos: 15,
    cardio: 15, accesorios: 15
  };
  
  Object.entries(esperado).forEach(([grupo, cantidad]) => {
    const actual = distribucion[grupo] || 0;
    const emoji = actual === cantidad ? '✅' : '❌';
    console.log(`   ${emoji} ${grupo}: ${actual}/${cantidad}`);
  });
  console.log('');
  
  // Test 5: Buscar ejercicios populares
  console.log('🔍 Test 5: Búsqueda de ejercicios populares:');
  const busquedas = [
    'press banca',
    'sentadilla',
    'peso muerto',
    'dominadas',
    'curl'
  ];
  
  busquedas.forEach(termino => {
    const resultados = buscarEjercicios(termino);
    console.log(`   "${termino}": ${resultados.length} resultados`);
  });
  console.log('');
  
  // Test 6: Verificar ejercicios específicos
  console.log('🎯 Test 6: Verificar ejercicios clave:');
  const ejerciciosClave = [
    'press_banca',
    'sentadilla_barra',
    'peso_muerto_convencional',
    'dominadas_pronas',
    'hip_thrust'
  ];
  
  ejerciciosClave.forEach(id => {
    const ej = obtenerEjercicioPorId(id);
    const emoji = ej ? '✅' : '❌';
    console.log(`   ${emoji} ${id}: ${ej ? ej.nombre : 'NO ENCONTRADO'}`);
  });
  console.log('');
  
  // Test 7: Grupos musculares
  console.log('💪 Test 7: Grupos musculares disponibles:');
  console.log(`   ${GRUPOS_MUSCULARES.join(', ')}`);
  console.log(`   Total: ${GRUPOS_MUSCULARES.length} grupos`);
  console.log('');
  
  // Test 8: Campos avanzados
  console.log('🔬 Test 8: Verificar campos avanzados:');
  const ejercicioTest = EXERCISES_DB.find(e => e.id === 'press_banca');
  if (ejercicioTest) {
    console.log(`   video_url: ${ejercicioTest.video_url ? '✅' : '❌'}`);
    console.log(`   tags: ${Array.isArray(ejercicioTest.tags) && ejercicioTest.tags.length > 0 ? '✅' : '❌'}`);
    console.log(`   nivel_tecnica: ${ejercicioTest.nivel_tecnica ? '✅' : '❌'}`);
    console.log(`   descanso_sugerido: ${ejercicioTest.descanso_sugerido ? '✅' : '❌'}`);
    console.log(`   variantes: ${Array.isArray(ejercicioTest.variantes) ? '✅' : '❌'}`);
  }
  console.log('');
  
  // RESUMEN FINAL
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('         RESUMEN DE TESTS');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('Si todos los tests muestran ✅, la integración');
  console.log('está lista para producción.');
  console.log('');
  console.log('Siguiente paso: Ejecutar migrate-browser.js');
  console.log('para migrar a Firestore.');
  console.log('');
  
}).catch(error => {
  console.error('❌ ERROR al importar exercises-db.js:');
  console.error(error);
});
