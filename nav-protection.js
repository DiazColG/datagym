// ================================================
// PROTECCIÓN DE NAVEGACIÓN
// Verifica autenticación antes de navegar a páginas protegidas
// ================================================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

let authChecked = false;
let isAuthenticated = false;

// Verificar estado de autenticación al cargar
onAuthStateChanged(auth, (usuario) => {
    authChecked = true;
    isAuthenticated = !!usuario;
});

/**
 * Protege la navegación a páginas que requieren autenticación
 * @param {Event} event - Evento de click
 * @param {string} url - URL destino
 * @returns {boolean} - true si se permite la navegación
 */
export function protegerNavegacion(event, url) {
    // Lista de páginas que requieren autenticación
    const paginasProtegidas = ['entrenar.html', 'crear-rutina.html', 'workout-activo.html', 'mi-cuenta.html'];
    
    // Verificar si la URL es una página protegida
    const esProtegida = paginasProtegidas.some(pagina => url.includes(pagina));
    
    if (esProtegida && !isAuthenticated) {
        event.preventDefault();
        
        // Mostrar mensaje y redirigir a auth
        const mensaje = document.createElement('div');
        mensaje.className = 'auth-required-toast';
        mensaje.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-lock"></i>
                <span>Debes iniciar sesión para acceder</span>
            </div>
        `;
        document.body.appendChild(mensaje);
        
        // Animar entrada
        setTimeout(() => mensaje.classList.add('show'), 100);
        
        // Redirigir después de mostrar mensaje
        setTimeout(() => {
            window.location.href = 'auth.html?redirect=' + encodeURIComponent(url);
        }, 1500);
        
        return false;
    }
    
    return true;
}

/**
 * Inicializa la protección en todos los enlaces del navbar
 */
export function inicializarProteccionNav() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="entrenar"], a[href*="crear-rutina"], a[href*="workout-activo"], a[href*="mi-cuenta"]');
        
        if (link && link.href) {
            const url = link.getAttribute('href');
            if (url && !url.startsWith('#')) {
                // Solo proteger si ya se verificó el auth y no está autenticado
                if (authChecked && !isAuthenticated) {
                    protegerNavegacion(e, url);
                }
                // Si está autenticado o aún no se verificó, dejar navegar normalmente
            }
        }
    });
}
