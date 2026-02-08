// ================================================
// SCRIPT DE MIGRACIÓN - RUTINAS PÚBLICAS
// Migrar rutinas hardcodeadas a Firestore
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

(async function migrateRoutinesToFirestore() {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  🏋️ MIGRACIÓN - RUTINAS PÚBLICAS A FIRESTORE');
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
    // PASO 3: CARGAR RUTINAS
    // ============================================
    console.log('💪 Paso 3: Cargando rutinas...');
    
    let RUTINAS_PUBLICAS;
    
    // Método 1: Desde window (si ya está cargado)
    if (window.RUTINAS_PUBLICAS && Array.isArray(window.RUTINAS_PUBLICAS)) {
      RUTINAS_PUBLICAS = window.RUTINAS_PUBLICAS;
      console.log('   ✅ Rutinas cargadas desde window');
    } 
    // Método 2: Import dinámico
    else {
      try {
        const baseUrl = window.location.origin;
        console.log(`   Intentando cargar desde: ${baseUrl}/rutinas-publicas.js`);
        
        const module = await import(`${baseUrl}/rutinas-publicas.js`);
        RUTINAS_PUBLICAS = module.RUTINAS_PUBLICAS;
        
        if (RUTINAS_PUBLICAS && RUTINAS_PUBLICAS.length > 0) {
          console.log('   ✅ Rutinas cargadas via import');
        }
      } catch (importError) {
        console.error('   ❌ Error en import:', importError.message);
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('  SOLUCIÓN ALTERNATIVA');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('El script no puede cargar automáticamente las rutinas.');
        console.log('');
        console.log('Por favor ejecuta este comando primero:');
        console.log('');
        console.log('   import("./rutinas-publicas.js").then(m => { window.RUTINAS_PUBLICAS = m.RUTINAS_PUBLICAS; console.log("✅ Rutinas listas:", window.RUTINAS_PUBLICAS.length); })');
        console.log('');
        console.log('Luego ejecuta este script nuevamente.');
        console.log('');
        return;
      }
    }
    
    if (!RUTINAS_PUBLICAS || RUTINAS_PUBLICAS.length === 0) {
      console.error('❌ No se pudieron cargar las rutinas');
      return;
    }
    
    console.log(`   ✅ ${RUTINAS_PUBLICAS.length} rutinas listas para migración`);
    console.log('');
    
    // ============================================
    // MOSTRAR RESUMEN
    // ============================================
    console.log('📊 Resumen de rutinas:');
    const niveles = {};
    const objetivos = {};
    RUTINAS_PUBLICAS.forEach(rutina => {
      const nivel = rutina.nivel || 'sin_nivel';
      const objetivo = rutina.objetivo || 'sin_objetivo';
      niveles[nivel] = (niveles[nivel] || 0) + 1;
      objetivos[objetivo] = (objetivos[objetivo] || 0) + 1;
    });
    
    console.log('');
    console.log('   Por nivel:');
    Object.entries(niveles).forEach(([nivel, count]) => {
      console.log(`   • ${nivel}: ${count} rutinas`);
    });
    
    console.log('');
    console.log('   Por objetivo:');
    Object.entries(objetivos).forEach(([objetivo, count]) => {
      console.log(`   • ${objetivo}: ${count} rutinas`);
    });
    
    const rutinasPopulares = RUTINAS_PUBLICAS.filter(r => r.popular).length;
    console.log('');
    console.log(`   • Rutinas marcadas como populares: ${rutinasPopulares}`);
    console.log('');
    
    // ============================================
    // CONFIRMACIÓN
    // ============================================
    console.log('⚠️  IMPORTANTE:');
    console.log('   Esta operación subirá ' + RUTINAS_PUBLICAS.length + ' rutinas a Firestore');
    console.log('   Las rutinas existentes serán sobrescritas');
    console.log('   Se agregarán campos de métricas: likes, vistas, copias');
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
    
    let totalMigrated = 0;
    let errores = [];
    const startTime = Date.now();
    
    // Procesar en un solo batch (son solo 20 rutinas)
    const batch = writeBatch(db);
    
    for (const rutina of RUTINAS_PUBLICAS) {
      try {
        if (!rutina.id) {
          console.warn(`   ⚠️  Rutina sin ID, saltando:`, rutina.nombre || 'sin nombre');
          errores.push({ rutina: rutina.nombre, error: 'Sin ID' });
          continue;
        }
        
        const rutinaRef = doc(collection(db, 'rutinasPublicas'), rutina.id);
        
        // Preparar datos con campos de métricas
        const rutinaData = {
          ...rutina,
          // Métricas (inicializadas en 0)
          likes: 0,
          vistas: 0,
          copias: 0,
          // Metadata de migración
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          migratedFrom: 'rutinas-publicas-hardcoded',
          version: '1.0.0',
          migratedBy: auth.currentUser.uid,
          migratedAt: new Date().toISOString(),
          // Campos de gestión
          activa: true,
          destacada: rutina.popular || false
        };
        
        batch.set(rutinaRef, rutinaData);
        totalMigrated++;
        
        console.log(`   ✅ Preparada: ${rutina.nombre} (${rutina.nivel})`);
        
      } catch (error) {
        console.error(`   ⚠️  Error preparando rutina ${rutina.id}:`, error.message);
        errores.push({ rutina: rutina.id, error: error.message });
      }
    }
    
    // Commit del batch
    try {
      console.log('');
      console.log('   📝 Commiteando batch...');
      await batch.commit();
      console.log(`   ✅ Batch completado (${totalMigrated} rutinas)`);
    } catch (error) {
      console.error(`   ❌ Error en commit del batch:`, error);
      console.error('   Error completo:', error);
      errores.push({ batch: 'único', error: error.message });
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
    console.log(`✅ ${totalMigrated} rutinas migradas correctamente`);
    console.log(`⏱️  Tiempo total: ${duration} segundos`);
    
    if (errores.length > 0) {
      console.log(`⚠️  ${errores.length} errores encontrados`);
      console.log('');
      console.log('Errores:');
      errores.forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.rutina || e.batch}: ${e.error}`);
      });
    }
    
    console.log('');
    console.log('📊 Distribución final:');
    console.log('   Por nivel:');
    Object.entries(niveles).forEach(([nivel, count]) => {
      console.log(`   • ${nivel}: ${count} rutinas`);
    });
    
    console.log('');
    console.log('   Por objetivo:');
    Object.entries(objetivos).forEach(([objetivo, count]) => {
      console.log(`   • ${objetivo}: ${count} rutinas`);
    });
    
    console.log('');
    console.log('🔍 Verificación:');
    console.log('   1. Firebase Console:');
    console.log('      https://console.firebase.google.com/project/datagym-gdcrp/firestore/data/rutinasPublicas');
    console.log('');
    console.log('   2. En la app:');
    console.log('      • Recarga la página (F5)');
    console.log('      • Ve a Explorar Rutinas');
    console.log('      • Deberías ver ' + totalMigrated + ' rutinas con métricas');
    console.log('');
    console.log('📈 Próximos pasos:');
    console.log('   • Las rutinas ahora tienen campos: likes, vistas, copias');
    console.log('   • Actualizar explorar-rutinas.js para leer de Firestore');
    console.log('   • Implementar funciones de incremento de métricas');
    console.log('   • Agregar sistema de caché (localStorage 5min TTL)');
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
