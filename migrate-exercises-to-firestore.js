// ================================================
// SCRIPT DE MIGRACIÓN: SUBIR EJERCICIOS A FIRESTORE
// ================================================
// Ejecutar: node migrate-exercises-to-firestore.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { EXERCISES_DB_EXTENDED } from './exercises-db-extended.js';

// Configuración Firebase (reemplazar con tu config)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateExercises() {
    console.log('🚀 Iniciando migración de ejercicios a Firestore...');
    console.log(`📊 Total de ejercicios a migrar: ${EXERCISES_DB_EXTENDED.length}`);
    
    try {
        // Firestore permite max 500 operaciones por batch
        const BATCH_SIZE = 500;
        let migrated = 0;
        
        for (let i = 0; i < EXERCISES_DB_EXTENDED.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const chunk = EXERCISES_DB_EXTENDED.slice(i, i + BATCH_SIZE);
            
            chunk.forEach(exercise => {
                const docRef = doc(db, 'exercises', exercise.id);
                
                // Agregar campos de metadata
                const exerciseData = {
                    ...exercise,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    migratedFrom: 'exercises-db-extended.js',
                    version: '2.0'
                };
                
                batch.set(docRef, exerciseData);
            });
            
            await batch.commit();
            migrated += chunk.length;
            console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} completado - ${migrated}/${EXERCISES_DB_EXTENDED.length} ejercicios migrados`);
        }
        
        console.log('🎉 ¡Migración completada exitosamente!');
        console.log(`📈 Total migrado: ${migrated} ejercicios`);
        
        // Verificar
        console.log('\n🔍 Verificando migración...');
        const exercisesRef = collection(db, 'exercises');
        const snapshot = await getDocs(exercisesRef);
        console.log(`✅ Ejercicios en Firestore: ${snapshot.size}`);
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    }
}

// Ejecutar migración
migrateExercises()
    .then(() => {
        console.log('✅ Script finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script falló:', error);
        process.exit(1);
    });
