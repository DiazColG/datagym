// ================================================
// SCRIPT DE VALIDACIÓN - INTEGRIDAD DE RUTINAS
// Detectar ejercicios inexistentes en rutinas
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

(async function validateRoutinesIntegrity() {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  🔍 VALIDACIÓN - INTEGRIDAD DE RUTINAS');
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
      console.log('Recarga la página (F5) y espera a que cargue completamente');
      return;
    }
    
    if (!auth || !auth.currentUser) {
      console.error('❌ ERROR: No hay usuario autenticado');
      console.log('');
      console.log('Inicia sesión en la aplicación antes de ejecutar este script');
      return;
    }
    
    console.log(`   ✅ Firebase OK`);
    console.log(`   ✅ Usuario: ${auth.currentUser.email}`);
    console.log('');
    
    // ============================================
    // PASO 2: IMPORTAR MÓDULOS
    // ============================================
    console.log('📦 Paso 2: Cargando módulos...');
    
    let collection, getDocs;
    
    try {
      const firestoreModule = await import(
        'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'
      );
      collection = firestoreModule.collection;
      getDocs = firestoreModule.getDocs;
      
      console.log('   ✅ Módulos Firestore cargados');
    } catch (error) {
      console.error('❌ Error cargando módulos Firestore:', error);
      return;
    }
    console.log('');
    
    // ============================================
    // PASO 3: CARGAR RUTINAS PÚBLICAS
    // ============================================
    console.log('💪 Paso 3: Cargando rutinas públicas desde Firestore...');
    
    const rutinasSnapshot = await getDocs(collection(db, 'rutinasPublicas'));
    const rutinas = [];
    
    rutinasSnapshot.forEach(doc => {
      rutinas.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`   ✅ ${rutinas.length} rutinas cargadas`);
    console.log('');
    
    // ============================================
    // PASO 4: CARGAR BASE DE DATOS DE EJERCICIOS
    // ============================================
    console.log('🏋️ Paso 4: Cargando base de datos de ejercicios...');
    
    let BD_EJERCICIOS;
    
    // Método 1: Desde exercisesService (sistema actual)
    if (window.exercisesService) {
      try {
        console.log('   Obteniendo ejercicios desde exercisesService...');
        BD_EJERCICIOS = await window.exercisesService.getExercises();
        console.log('   ✅ Ejercicios cargados desde exercisesService');
      } catch (serviceError) {
        console.error('   ⚠️ Error en exercisesService:', serviceError.message);
        BD_EJERCICIOS = null;
      }
    }
    
    // Método 2: Desde EXERCISES_DB (bundle estático)
    if (!BD_EJERCICIOS && window.EXERCISES_DB && Array.isArray(window.EXERCISES_DB)) {
      BD_EJERCICIOS = window.EXERCISES_DB;
      console.log('   ✅ Ejercicios cargados desde EXERCISES_DB (bundle estático)');
    }
    
    // Método 3: Import dinámico del bundle
    if (!BD_EJERCICIOS) {
      try {
        const baseUrl = window.location.origin;
        console.log(`   Intentando cargar bundle desde: ${baseUrl}/exercises-db.js`);
        
        const module = await import(`${baseUrl}/exercises-db.js`);
        BD_EJERCICIOS = module.EXERCISES_DB;
        
        if (BD_EJERCICIOS && BD_EJERCICIOS.length > 0) {
          console.log('   ✅ Ejercicios cargados via import del bundle');
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
        console.log('Por favor ejecuta este comando primero:');
        console.log('');
        console.log('   import("./exercises-db.js").then(m => { window.EXERCISES_DB = m.EXERCISES_DB; console.log("✅ Ejercicios listos:", window.EXERCISES_DB.length); })');
        console.log('');
        console.log('Luego ejecuta este script nuevamente.');
        console.log('');
        return;
      }
    }
    
    if (!BD_EJERCICIOS || BD_EJERCICIOS.length === 0) {
      console.error('❌ No se pudieron cargar los ejercicios');
      return;
    }
    
    console.log(`   ✅ ${BD_EJERCICIOS.length} ejercicios en la base de datos`);
    console.log('');
    
    // ============================================
    // PASO 5: VALIDAR INTEGRIDAD
    // ============================================
    console.log('🔍 Paso 5: Validando integridad referencial...');
    console.log('');
    
    // Crear mapa de ejercicios existentes para búsqueda rápida
    const ejerciciosMap = new Map();
    BD_EJERCICIOS.forEach(ej => {
      ejerciciosMap.set(ej.id, ej);
    });
    
    const problemas = [];
    const ejerciciosFaltantes = new Set();
    let totalEjerciciosValidados = 0;
    
    // Validar cada rutina
    rutinas.forEach(rutina => {
      const problemaRutina = {
        rutinaId: rutina.id,
        rutinaNombre: rutina.nombre,
        nivel: rutina.nivel,
        objetivo: rutina.objetivo,
        ejerciciosFaltantes: [],
        totalEjercicios: 0
      };
      
      // Recorrer ejercicios de la rutina (estructura plana)
      if (rutina.ejercicios && Array.isArray(rutina.ejercicios)) {
        problemaRutina.totalEjercicios = rutina.ejercicios.length;
        
        rutina.ejercicios.forEach((ejercicio, ejIndex) => {
          totalEjerciciosValidados++;
          
          // El ID del ejercicio está en 'exerciseId', no 'id'
          const ejercicioId = ejercicio.exerciseId || ejercicio.id;
          
          if (!ejercicioId) {
            problemaRutina.ejerciciosFaltantes.push({
              dia: ejercicio.notas || 'Sin día especificado',
              diaNombre: ejercicio.notas || 'Sin día',
              ejercicioId: 'SIN_ID',
              posicion: ejIndex + 1,
              detalles: 'Ejercicio sin ID'
            });
            ejerciciosFaltantes.add('SIN_ID');
          } else {
            // Verificar si el ejercicio existe en la BD
            if (!ejerciciosMap.has(ejercicioId)) {
              problemaRutina.ejerciciosFaltantes.push({
                dia: ejercicio.notas || 'Sin día especificado',
                diaNombre: ejercicio.notas || 'Sin día',
                ejercicioId: ejercicioId,
                posicion: ejIndex + 1
              });
              
              ejerciciosFaltantes.add(ejercicioId);
            }
          }
        });
      }
      
      // Si hay problemas, agregar al reporte
      if (problemaRutina.ejerciciosFaltantes.length > 0) {
        problemas.push(problemaRutina);
      }
    });
    
    // ============================================
    // RESULTADO FINAL
    // ============================================
    console.log('');
    console.log('═══════════════════════════════════════');
    if (problemas.length === 0) {
      console.log('  ✅ ¡TODAS LAS RUTINAS SON VÁLIDAS!');
    } else {
      console.log('  ⚠️  PROBLEMAS DE INTEGRIDAD DETECTADOS');
    }
    console.log('═══════════════════════════════════════');
    console.log('');
    
    console.log('📊 Resumen:');
    console.log(`   • Total de rutinas analizadas: ${rutinas.length}`);
    console.log(`   • Total de ejercicios validados: ${totalEjerciciosValidados}`);
    console.log(`   • Ejercicios únicos en BD: ${BD_EJERCICIOS.length}`);
    console.log(`   • Rutinas con problemas: ${problemas.length}`);
    console.log(`   • Ejercicios faltantes únicos: ${ejerciciosFaltantes.size}`);
    console.log('');
    
    if (problemas.length > 0) {
      console.log('═══════════════════════════════════════');
      console.log('  🚨 DETALLE DE PROBLEMAS');
      console.log('═══════════════════════════════════════');
      console.log('');
      
      problemas.forEach((problema, index) => {
        console.log(`${index + 1}. 📋 ${problema.rutinaNombre}`);
        console.log(`   ID: ${problema.rutinaId}`);
        console.log(`   Nivel: ${problema.nivel} | Objetivo: ${problema.objetivo}`);
        console.log(`   Total ejercicios: ${problema.totalEjercicios}`);
        console.log(`   Ejercicios faltantes: ${problema.ejerciciosFaltantes.length}`);
        console.log('');
        
        problema.ejerciciosFaltantes.forEach((faltante, i) => {
          console.log(`   ${i + 1}. ❌ ${faltante.diaNombre} (posición ${faltante.posicion})`);
          console.log(`      ID faltante: ${faltante.ejercicioId}`);
        });
        
        console.log('');
      });
      
      console.log('═══════════════════════════════════════');
      console.log('  📋 LISTA DE IDs FALTANTES');
      console.log('═══════════════════════════════════════');
      console.log('');
      
      const ejerciciosFaltantesArray = Array.from(ejerciciosFaltantes);
      ejerciciosFaltantesArray.forEach((id, index) => {
        console.log(`   ${index + 1}. ${id}`);
      });
      
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('  💡 RECOMENDACIONES');
      console.log('═══════════════════════════════════════');
      console.log('');
      console.log('Opciones para resolver:');
      console.log('');
      console.log('1. AGREGAR EJERCICIOS FALTANTES:');
      console.log('   • Crear los ejercicios en bd-ejercicios.js');
      console.log('   • Usar los IDs exactos listados arriba');
      console.log('   • Re-desplegar la aplicación');
      console.log('');
      console.log('2. REEMPLAZAR CON EJERCICIOS EQUIVALENTES:');
      console.log('   • Editar las rutinas en Firestore');
      console.log('   • Cambiar IDs faltantes por ejercicios existentes');
      console.log('   • Mantener mismos grupos musculares');
      console.log('');
      console.log('3. ELIMINAR EJERCICIOS ROTOS:');
      console.log('   • Editar rutinas afectadas en Firestore');
      console.log('   • Remover ejercicios con IDs inexistentes');
      console.log('   • Ajustar estructura de días si es necesario');
      console.log('');
      console.log('4. AUTOMATIZAR CORRECCIÓN:');
      console.log('   • Crear script de reparación automática');
      console.log('   • Mapear ejercicios faltantes → equivalentes');
      console.log('   • Ejecutar corrección en batch');
      console.log('');
      
      // Guardar reporte en window para acceso posterior
      window.REPORTE_INTEGRIDAD = {
        timestamp: new Date().toISOString(),
        totalRutinas: rutinas.length,
        rutinasConProblemas: problemas.length,
        ejerciciosFaltantes: ejerciciosFaltantesArray,
        detalleProblemas: problemas
      };
      
      console.log('💾 Reporte guardado en: window.REPORTE_INTEGRIDAD');
      console.log('');
      console.log('Exportar a JSON:');
      console.log('   copy(JSON.stringify(window.REPORTE_INTEGRIDAD, null, 2))');
      console.log('');
      
    } else {
      console.log('✨ Todas las rutinas tienen referencias válidas a ejercicios existentes.');
      console.log('');
    }
    
    // ============================================
    // ESTADÍSTICAS ADICIONALES
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('  📈 ESTADÍSTICAS ADICIONALES');
    console.log('═══════════════════════════════════════');
    console.log('');
    
    // Grupos musculares más usados
    const gruposMusculares = {};
    BD_EJERCICIOS.forEach(ej => {
      const grupo = ej.grupoMuscular || 'sin_grupo';
      gruposMusculares[grupo] = (gruposMusculares[grupo] || 0) + 1;
    });
    
    console.log('Ejercicios por grupo muscular:');
    Object.entries(gruposMusculares)
      .sort((a, b) => b[1] - a[1])
      .forEach(([grupo, count]) => {
        console.log(`   • ${grupo}: ${count} ejercicios`);
      });
    
    console.log('');
    
    // Rutinas por nivel
    const rutinasNivel = {};
    rutinas.forEach(r => {
      const nivel = r.nivel || 'sin_nivel';
      rutinasNivel[nivel] = (rutinasNivel[nivel] || 0) + 1;
    });
    
    console.log('Rutinas por nivel:');
    Object.entries(rutinasNivel).forEach(([nivel, count]) => {
      console.log(`   • ${nivel}: ${count} rutinas`);
    });
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════');
    console.error('  ❌ ERROR FATAL EN LA VALIDACIÓN');
    console.error('═══════════════════════════════════════');
    console.error('');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('');
  }
  
})();
