// ================================================
// SCRIPT DE MIGRACIÓN V2 - MÁS ROBUSTO
// ================================================
// 
// INSTRUCCIONES:
// 1. Abre https://datagym.vercel.app
// 2. Inicia sesión
// 3. Abre consola (F12)
// 4. Copia TODO este código y pégalo
// 5. Presiona Enter
//
// ================================================

(async function migrateExercisesToFirestore() {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  🚀 MIGRACIÓN V2 - EJERCICIOS A FIRESTORE');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  try {
    // ============================================
    // PASO 1: VERIFICAR FIREBASE
    // ============================================
    console.log('📋 Paso 1: Verificando Firebase...');
    
    if (typeof window === 'undefined') {
      console.error('❌ Este script debe ejecutarse en el navegador');
      return;
    }
    
    const { db, auth } = window;
    
    if (!db) {
      console.error('❌ ERROR: Firebase DB no está disponible');
      console.log('');
      console.log('Soluciones:');
      console.log('  1. Recarga la página (F5)');
      console.log('  2. Verifica que estés en https://datagym.vercel.app');
      console.log('  3. Espera a que la página cargue completamente');
      console.log('');
      console.log('Debug info:');
      console.log('  window.db:', typeof window.db);
      console.log('  window.auth:', typeof window.auth);
      return;
    }
    
    if (!auth || !auth.currentUser) {
      console.error('❌ ERROR: No hay usuario autenticado');
      console.log('');
      console.log('Por favor:');
      console.log('  1. Inicia sesión en la aplicación');
      console.log('  2. Espera a que cargue completamente');
      console.log('  3. Ejecuta este script nuevamente');
      return;
    }
    
    console.log(`   ✅ Firebase OK`);
    console.log(`   ✅ Usuario: ${auth.currentUser.email}`);
    console.log('');
    
    // ============================================
    // PASO 2: IMPORTAR MÓDULOS FIRESTORE
    // ============================================
    console.log('📦 Paso 2: Cargando módulos de Firestore...');
    
    let collection, writeBatch, doc, serverTimestamp;
    
    try {
      const firestoreModule = await import(
        'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'
      );
      collection = firestoreModule.collection;
      writeBatch = firestoreModule.writeBatch;
      doc = firestoreModule.doc;
      serverTimestamp = firestoreModule.serverTimestamp;
      
      console.log('   ✅ Módulos Firestore cargados');
    } catch (error) {
      console.error('❌ Error cargando módulos Firestore:', error);
      console.log('');
      console.log('Intentando método alternativo...');
      return;
    }
    console.log('');
    
    // ============================================
    // PASO 3: CARGAR EJERCICIOS
    // ============================================
    console.log('📚 Paso 3: Cargando ejercicios...');
    
    let EXERCISES_DB;
    
    // Método 1: Desde window (si ya está cargado)
    if (window.EXERCISES_DB && Array.isArray(window.EXERCISES_DB)) {
      EXERCISES_DB = window.EXERCISES_DB;
      console.log('   ✅ Ejercicios cargados desde window');
    } 
    // Método 2: Import dinámico con URL completa
    else {
      try {
        const baseUrl = window.location.origin;
        console.log(`   Intentando cargar desde: ${baseUrl}/exercises-db.js`);
        
        const module = await import(`${baseUrl}/exercises-db.js`);
        EXERCISES_DB = module.EXERCISES_DB;
        
        if (EXERCISES_DB && EXERCISES_DB.length > 0) {
          console.log('   ✅ Ejercicios cargados via import');
        }
      } catch (importError) {
        console.error('   ❌ Error en import:', importError.message);
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('  SOLUCIÓN ALTERNATIVA');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('El script no puede cargar automáticamente los ejercicios.');
        console.log('');
        console.log('Por favor sigue estos pasos:');
        console.log('');
        console.log('1. Abre la aplicación normalmente');
        console.log('2. Inicia un entrenamiento (para cargar exercises-db.js)');
        console.log('3. Ejecuta este comando en la consola:');
        console.log('');
        console.log('   import("./exercises-db.js").then(m => { window.EXERCISES_DB = m.EXERCISES_DB; console.log("✅ Ejercicios listos:", window.EXERCISES_DB.length); })');
        console.log('');
        console.log('4. Cuando veas "✅ Ejercicios listos: 200"');
        console.log('5. Ejecuta este script nuevamente');
        console.log('');
        return;
      }
    }
    
    if (!EXERCISES_DB || EXERCISES_DB.length === 0) {
      console.error('❌ No se pudieron cargar los ejercicios');
      return;
    }
    
    console.log(`   ✅ ${EXERCISES_DB.length} ejercicios listos para migración`);
    console.log('');
    
    // ============================================
    // MOSTRAR RESUMEN
    // ============================================
    console.log('📊 Resumen de ejercicios:');
    const grupos = {};
    EXERCISES_DB.forEach(ex => {
      const grupo = ex.grupoMuscular || 'sin_grupo';
      grupos[grupo] = (grupos[grupo] || 0) + 1;
    });
    
    Object.entries(grupos)
      .sort((a, b) => b[1] - a[1])
      .forEach(([group, count]) => {
        console.log(`   • ${group}: ${count} ejercicios`);
      });
    console.log('');
    
    // ============================================
    // CONFIRMACIÓN
    // ============================================
    console.log('⚠️  IMPORTANTE:');
    console.log('   Esta operación subirá ' + EXERCISES_DB.length + ' ejercicios a Firestore');
    console.log('   Los ejercicios existentes serán sobrescritos');
    console.log('');
    console.log('⏳ Iniciando en 5 segundos...');
    console.log('   (Cierra la pestaña para cancelar)');
    console.log('');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // ============================================
    // PASO 4: MIGRACIÓN
    // ============================================
    console.log('🔄 Paso 4: Migrando a Firestore...');
    console.log('');
    
    const BATCH_SIZE = 500;
    let totalMigrated = 0;
    let errores = [];
    const startTime = Date.now();
    
    // Dividir en batches
    const totalBatches = Math.ceil(EXERCISES_DB.length / BATCH_SIZE);
    
    for (let i = 0; i < EXERCISES_DB.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const currentBatch = EXERCISES_DB.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      console.log(`   📝 Batch ${batchNumber}/${totalBatches}: Procesando ejercicios ${i + 1}-${Math.min(i + BATCH_SIZE, EXERCISES_DB.length)}`);
      
      for (const exercise of currentBatch) {
        try {
          if (!exercise.id) {
            console.warn(`   ⚠️  Ejercicio sin ID, saltando:`, exercise.nombre || 'sin nombre');
            errores.push({ exercise: exercise.nombre, error: 'Sin ID' });
            continue;
          }
          
          const exerciseRef = doc(collection(db, 'exercises'), exercise.id);
          
          // Preparar datos (sin funciones, solo datos serializables)
          const exerciseData = {
            ...exercise,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            migratedFrom: 'exercises-db-complete-200',
            version: '2.0.0',
            migratedBy: auth.currentUser.uid,
            migratedAt: new Date().toISOString()
          };
          
          batch.set(exerciseRef, exerciseData);
          totalMigrated++;
        } catch (error) {
          console.error(`   ⚠️  Error preparando ejercicio ${exercise.id}:`, error.message);
          errores.push({ exercise: exercise.id, error: error.message });
        }
      }
      
      try {
        await batch.commit();
        console.log(`   ✅ Batch ${batchNumber} completado (${currentBatch.length} ejercicios)`);
        
        // Progress bar
        const progress = Math.round((totalMigrated / EXERCISES_DB.length) * 100);
        const barLength = 30;
        const filledLength = Math.round((progress / 100) * barLength);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        console.log(`   [${bar}] ${progress}%`);
        console.log('');
        
      } catch (error) {
        console.error(`   ❌ Error en commit del batch ${batchNumber}:`, error);
        console.error('   Error completo:', error);
        errores.push({ batch: batchNumber, error: error.message });
        
        // No lanzar error, continuar con siguientes batches
        console.log('   ⚠️  Continuando con siguiente batch...');
        console.log('');
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // ============================================
    // RESULTADO FINAL
    // ============================================
    console.log('');
    console.log('═══════════════════════════════════════');
    if (errores.length === 0) {
      console.log('  🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    } else {
      console.log('  ⚠️  MIGRACIÓN COMPLETADA CON ADVERTENCIAS');
    }
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log(`✅ ${totalMigrated} ejercicios migrados correctamente`);
    console.log(`⏱️  Tiempo total: ${duration} segundos`);
    
    if (errores.length > 0) {
      console.log(`⚠️  ${errores.length} errores encontrados`);
      console.log('');
      console.log('Errores:');
      errores.forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.exercise || e.batch}: ${e.error}`);
      });
    }
    
    console.log('');
    console.log('📊 Distribución por grupo muscular:');
    Object.entries(grupos)
      .sort((a, b) => b[1] - a[1])
      .forEach(([group, count]) => {
        console.log(`   • ${group}: ${count} ejercicios`);
      });
    
    console.log('');
    console.log('🔍 Verificación:');
    console.log('   1. Firebase Console:');
    console.log('      https://console.firebase.google.com/project/datagym-gdcrp/firestore/data/exercises');
    console.log('');
    console.log('   2. En la app:');
    console.log('      • Recarga la página (F5)');
    console.log('      • Inicia un nuevo entrenamiento');
    console.log('      • Abre el modal de ejercicios');
    console.log('      • Deberías ver ' + totalMigrated + ' ejercicios');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════');
    console.error('  ❌ ERROR FATAL EN LA MIGRACIÓN');
    console.error('═══════════════════════════════════════');
    console.error('');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('');
    console.error('Copia este error y compártelo para ayuda.');
    console.error('');
  }
  
})();
