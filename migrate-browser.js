// ================================================
// SCRIPT DE MIGRACIÓN A FIRESTORE - EJECUTAR EN CONSOLA DEL NAVEGADOR
// ================================================
// 
// INSTRUCCIONES:
// 1. Abre https://datagym.vercel.app en tu navegador
// 2. Asegúrate de estar autenticado (inicia sesión si es necesario)
// 3. Abre la consola del navegador (F12 → Console)
// 4. Copia TODO este código
// 5. Pégalo en la consola y presiona Enter
// 6. Espera a que termine la migración (~2 minutos)
//
// ================================================

(async function migrateExercisesToFirestore() {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  🚀 MIGRACIÓN DE EJERCICIOS A FIRESTORE');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  try {
    // Paso 1: Verificar Firebase
    console.log('📋 Paso 1: Verificando Firebase...');
    const { db, auth } = window;
    
    if (!db) {
      console.error('❌ ERROR: Firebase no está inicializado.');
      console.log('');
      console.log('Posibles soluciones:');
      console.log('  1. Asegúrate de estar en https://datagym.vercel.app');
      console.log('  2. Recarga la página (F5)');
      console.log('  3. Verifica que firebase-config.js se haya cargado');
      return;
    }
    
    if (!auth.currentUser) {
      console.warn('⚠️  ADVERTENCIA: No hay usuario autenticado.');
      console.log('   Inicia sesión antes de continuar.');
      console.log('');
      return;
    }
    
    console.log(`   ✅ Firebase OK (Usuario: ${auth.currentUser.email})`);
    console.log('');
    
    // Paso 2: Importar módulos de Firestore
    console.log('📦 Paso 2: Cargando módulos de Firestore...');
    const { collection, writeBatch, doc, serverTimestamp } = await import(
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'
    );
    console.log('   ✅ Módulos cargados');
    console.log('');
    
    // Paso 3: Cargar ejercicios
    console.log('📚 Paso 3: Cargando base de datos de ejercicios...');
    const { EXERCISES_DB } = await import('./exercises-db.js');
    
    if (!EXERCISES_DB || EXERCISES_DB.length === 0) {
      console.error('❌ ERROR: No se pudieron cargar los ejercicios.');
      console.log('');
      console.log('Verifica que exercises-db.js esté accesible.');
      return;
    }
    
    console.log(`   ✅ ${EXERCISES_DB.length} ejercicios cargados`);
    console.log('');
    
    // Mostrar resumen
    console.log('📊 Resumen de ejercicios:');
    const grupos = {};
    EXERCISES_DB.forEach(ex => {
      grupos[ex.grupoMuscular] = (grupos[ex.grupoMuscular] || 0) + 1;
    });
    Object.entries(grupos).sort((a, b) => b[1] - a[1]).forEach(([group, count]) => {
      console.log(`   • ${group}: ${count} ejercicios`);
    });
    console.log('');
    
    // Confirmar
    console.log('⏳ Iniciando migración en 3 segundos...');
    console.log('   (Puedes cancelar cerrando esta pestaña)');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('');
    
    // Paso 4: Migración por batches
    console.log('🔄 Paso 4: Migrando a Firestore...');
    console.log('');
    
    const BATCH_SIZE = 500; // Límite de Firestore
    let totalMigrated = 0;
    let batchNumber = 1;
    const startTime = Date.now();
    
    // Dividir en batches
    for (let i = 0; i < EXERCISES_DB.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const currentBatch = EXERCISES_DB.slice(i, i + BATCH_SIZE);
      
      console.log(`   📝 Batch ${batchNumber}: Ejercicios ${i + 1}-${Math.min(i + BATCH_SIZE, EXERCISES_DB.length)}`);
      
      for (const exercise of currentBatch) {
        const exerciseRef = doc(collection(db, 'exercises'), exercise.id);
        
        const exerciseData = {
          ...exercise,
          // Metadata de migración
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          migratedFrom: 'exercises-db-complete-200',
          version: '2.0.0',
          migratedBy: auth.currentUser.uid
        };
        
        batch.set(exerciseRef, exerciseData);
        totalMigrated++;
      }
      
      try {
        await batch.commit();
        console.log(`   ✅ Batch ${batchNumber} completado (${currentBatch.length} ejercicios)`);
      } catch (error) {
        console.error(`   ❌ Error en batch ${batchNumber}:`, error);
        throw error;
      }
      
      batchNumber++;
      
      // Progress bar visual
      const progress = Math.round((totalMigrated / EXERCISES_DB.length) * 100);
      const barLength = 30;
      const filledLength = Math.round((progress / 100) * barLength);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      console.log(`   [${bar}] ${progress}%`);
      console.log('');
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // RESULTADO FINAL
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log(`✅ ${totalMigrated} ejercicios migrados`);
    console.log(`⏱️  Tiempo: ${duration} segundos`);
    console.log('');
    console.log('📊 Distribución por grupo muscular:');
    Object.entries(grupos).sort((a, b) => b[1] - a[1]).forEach(([group, count]) => {
      console.log(`   • ${group}: ${count} ejercicios`);
    });
    console.log('');
    console.log('🔍 Verificación:');
    console.log('   1. Ve a Firebase Console:');
    console.log('      https://console.firebase.google.com/project/datagym-gdcrp/firestore/data/exercises');
    console.log('');
    console.log('   2. Deberías ver 200 documentos en la colección "exercises"');
    console.log('');
    console.log('   3. Prueba la app:');
    console.log('      • Inicia un nuevo entrenamiento');
    console.log('      • Haz clic en "Agregar ejercicio"');
    console.log('      • Deberías ver los 200 ejercicios disponibles');
    console.log('');
    console.log('🚀 Siguiente paso:');
    console.log('   Actualizar Firestore Rules en Firebase Console');
    console.log('   (Ver firestore.rules en el repositorio)');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════');
    console.error('  ❌ ERROR FATAL EN LA MIGRACIÓN');
    console.error('═══════════════════════════════════════');
    console.error('');
    console.error('Detalles del error:');
    console.error(error);
    console.error('');
    console.error('Posibles causas:');
    console.error('  1. Permisos insuficientes en Firestore');
    console.error('  2. Límite de escritura alcanzado');
    console.error('  3. Problema de red');
    console.error('');
    console.error('Soluciones:');
    console.error('  • Verifica las Firestore Rules');
    console.error('  • Espera unos minutos y vuelve a intentar');
    console.error('  • Revisa la consola de Firebase para más detalles');
    console.error('');
  }
  
})();
