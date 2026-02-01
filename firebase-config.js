// =========================================
// FIREBASE CONFIGURATION
// Configuración de Firebase SDK v10+
// =========================================

// Importar los módulos necesarios de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Configuración de Firebase
// Estas credenciales son públicas y van en el frontend
// La seguridad está garantizada por las reglas de Firestore
const firebaseConfig = {
    apiKey: "AIzaSyBFx3udq1-sUQnB9nyYuZ50E1ClZhZZNvo",
    authDomain: "datagym-gdcrp.firebaseapp.com",
    projectId: "datagym-gdcrp",
    storageBucket: "datagym-gdcrp.firebasestorage.app",
    messagingSenderId: "219326258867",
    appId: "1:219326258867:web:c7409f1559b2281bd05ac6",
    measurementId: "G-P4SH6G791D"
};

// Inicializar Firebase
let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    // Mostrar mensaje de error al usuario
    if (document.body) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:20px;border-radius:8px;z-index:9999;max-width:500px;text-align:center;';
        
        const title = document.createElement('h3');
        title.textContent = '⚠️ Error de configuración';
        
        const message = document.createElement('p');
        message.textContent = 'No se pudo conectar con Firebase. Por favor, recarga la página.';
        
        const button = document.createElement('button');
        button.textContent = 'Recargar página';
        button.style.cssText = 'margin-top:10px;padding:8px 16px;background:white;color:#ef4444;border:none;border-radius:4px;cursor:pointer;font-weight:bold;';
        button.addEventListener('click', () => location.reload());
        
        errorDiv.appendChild(title);
        errorDiv.appendChild(message);
        errorDiv.appendChild(button);
        document.body.appendChild(errorDiv);
    }
}

// Exportar instancias para uso en otros módulos
export { auth, db, app };
