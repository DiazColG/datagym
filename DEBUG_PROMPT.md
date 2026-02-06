# Prompt para Debugger Profesional

## Contexto del Proyecto
- **Aplicación:** DataGym - App web de fitness con Firebase Authentication
- **Stack:** HTML, CSS, JavaScript Vanilla con ES6 Modules
- **Hosting:** Vercel
- **URL:** https://datagym.vercel.app/
- **Repo:** https://github.com/DiazColG/datagym

## Problema Específico

### Síntoma
Cuando el usuario hace click en el enlace "Entrenar" del navbar en la página principal (`index.html`), **la navegación no ocurre**. La URL permanece en `https://datagym.vercel.app/` en lugar de ir a `https://datagym.vercel.app/entrenar.html`.

### Comportamiento Actual
- ❌ Click en navbar "Entrenar" → No navega, se queda en `/`
- ✅ Copiar y pegar URL directamente `https://datagym.vercel.app/entrenar.html` → Funciona perfectamente

### Comportamiento Esperado
- Click en "Entrenar" → Debería navegar a `entrenar.html` (con o sin auth, la página misma maneja la redirección)

## Código Relevante

### 1. Navbar en index.html (línea ~72)
```html
<li><a href="entrenar.html" class="nav-link">
    <i class="fas fa-dumbbell"></i> <span>Entrenar</span>
</a></li>
```

### 2. Sistema de Protección (nav-protection.js)
```javascript
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
```

### 3. Inicialización en index.html (línea ~746)
```html
<script type="module" src="nav-protection.js"></script>
<script type="module" src="script.js"></script>
<script type="module">
    import { inicializarProteccionNav } from './nav-protection.js';
    inicializarProteccionNav();
</script>
```

## Posibles Causas a Investigar

1. **Event Listener Conflicto:** 
   - ¿Hay otro event listener en `script.js` que está interceptando clicks del navbar?
   - ¿Algún `preventDefault()` que se está llamando inadvertidamente?

2. **Sistema de SPA (Single Page App):**
   - `script.js` parece manejar navegación entre secciones con `#`
   - ¿Está interceptando TODOS los clicks en el navbar, incluyendo links externos?

3. **Timing de Firebase Auth:**
   - `authChecked` podría ser `false` al momento del click
   - La verificación de auth es asíncrona

4. **Event Propagation:**
   - El click en el `<span>` o `<i>` dentro del `<a>` podría no burbujear correctamente
   - `e.target.closest()` debería manejarlo, pero revisar

5. **Módulos ES6 Carga:**
   - Posible race condition entre `nav-protection.js` y `script.js`

## Archivos Críticos para Revisar

1. **script.js** - Buscar:
   - Event listeners en navbar
   - Manejo de navegación SPA
   - Cualquier `preventDefault()` en clicks
   - Línea ~494, 599, 608, 617 (hay `preventDefault()`)

2. **nav-protection.js** - Archivo completo

3. **index.html** - Orden de carga de scripts (líneas 743-750)

## Información Adicional

### Console Errors
Por favor revisar en el navegador:
- Abrir DevTools (F12)
- Ir a Console
- Click en "Entrenar"
- Reportar cualquier error o warning

### Network Tab
- Verificar si se hace alguna request al hacer click
- Ver si el navegador intenta cargar `entrenar.html` pero falla

### Estado de Variables
En consola, después de cargar la página, ejecutar:
```javascript
// Ver si hay listeners en el link
document.querySelector('a[href="entrenar.html"]')
```

## Solución Esperada

Debe permitir la navegación normal a `entrenar.html` cuando se hace click en el navbar, y dejar que la página `entrenar.html` se encargue de verificar autenticación y redirigir si es necesario.

**Prioridad:** Alta - Feature principal de la app no funciona

## Testing

### Para Verificar el Fix
1. Ir a https://datagym.vercel.app/
2. Click en "Entrenar" en el navbar
3. **Esperado:** URL cambia a `https://datagym.vercel.app/entrenar.html`
4. La página carga (con o sin overlay de auth)

### Casos de Prueba
- Usuario NO autenticado → Click "Entrenar" → Navega a entrenar.html → Muestra overlay → Redirige a auth.html
- Usuario autenticado → Click "Entrenar" → Navega a entrenar.html → Muestra contenido

## Pregunta Específica

**¿Qué está bloqueando la navegación del link `<a href="entrenar.html">` en el navbar de index.html?**

Por favor proporcionar:
1. La línea exacta de código que está previniendo la navegación
2. El fix específico a aplicar
3. Explicación de por qué ocurre

---

**Nota:** Si necesitas acceso al código completo, está disponible en el repositorio GitHub mencionado arriba.
