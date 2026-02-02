// =========================================
// CALCULADORA DE PERFIL PROFESIONAL
// Módulo para cálculos nutricionales y de salud
// =========================================

/**
 * FACTORES DE ACTIVIDAD según nivel de actividad física
 */
export const FACTORES_ACTIVIDAD = {
    sedentario: 1.2,      // Poco o ningún ejercicio
    ligero: 1.375,        // Ejercicio ligero 1-3 días/semana
    moderado: 1.55,       // Ejercicio moderado 3-5 días/semana
    activo: 1.725,        // Ejercicio intenso 6-7 días/semana
    muyActivo: 1.9        // Ejercicio muy intenso, trabajo físico
};

/**
 * FACTORES DE OBJETIVO para ajuste calórico
 */
export const FACTORES_OBJETIVO = {
    perdida: -500,        // Déficit de 500 kcal (perder ~0.5kg/semana)
    mantenimiento: 0,     // Sin cambio
    ganancia: 500         // Superávit de 500 kcal (ganar ~0.5kg/semana)
};

/**
 * PROTEÍNAS POR KG según nivel de actividad
 */
export const PROTEINAS_POR_KG = {
    sedentario: 1.2,      // g/kg peso corporal
    ligero: 1.4,
    moderado: 1.6,
    activo: 1.8,
    muyActivo: 2.0
};

/**
 * Calcula la Tasa Metabólica Basal (TMB) usando la ecuación Mifflin-St Jeor
 * Esta es una de las fórmulas más precisas para calcular el TMB
 * 
 * @param {number} peso - Peso en kilogramos
 * @param {number} altura - Altura en centímetros
 * @param {number} edad - Edad en años
 * @param {string} genero - 'masculino' o 'femenino'
 * @returns {number} TMB en kilocalorías por día
 */
export function calcularTMB(peso, altura, edad, genero) {
    // Validar inputs
    if (!peso || !altura || !edad || !genero) {
        throw new Error('Todos los parámetros son requeridos');
    }
    
    if (peso <= 0 || altura <= 0 || edad <= 0) {
        throw new Error('Los valores deben ser positivos');
    }
    
    // Ecuación de Mifflin-St Jeor
    // Hombres: TMB = (10 × peso kg) + (6.25 × altura cm) - (5 × edad años) + 5
    // Mujeres: TMB = (10 × peso kg) + (6.25 × altura cm) - (5 × edad años) - 161
    
    const baseCalculo = (10 * peso) + (6.25 * altura) - (5 * edad);
    
    const tmb = genero === 'masculino' 
        ? baseCalculo + 5 
        : baseCalculo - 161;
    
    return Math.round(tmb);
}

/**
 * Calcula el Gasto Energético Total Diario (TDEE)
 * TDEE = TMB × Factor de Actividad
 * 
 * @param {number} tmb - Tasa Metabólica Basal
 * @param {string} nivelActividad - Nivel de actividad física
 * @returns {number} TDEE en kilocalorías por día
 */
export function calcularTDEE(tmb, nivelActividad) {
    if (!tmb || !nivelActividad) {
        throw new Error('TMB y nivel de actividad son requeridos');
    }
    
    const factor = FACTORES_ACTIVIDAD[nivelActividad];
    
    if (!factor) {
        throw new Error('Nivel de actividad inválido');
    }
    
    return Math.round(tmb * factor);
}

/**
 * Calcula las calorías objetivo según el objetivo del usuario
 * 
 * @param {number} tdee - Gasto Energético Total Diario
 * @param {string} objetivo - 'perdida', 'mantenimiento' o 'ganancia'
 * @returns {number} Calorías objetivo por día
 */
export function calcularCaloriasObjetivo(tdee, objetivo) {
    if (!tdee || !objetivo) {
        throw new Error('TDEE y objetivo son requeridos');
    }
    
    const ajuste = FACTORES_OBJETIVO[objetivo];
    
    if (ajuste === undefined) {
        throw new Error('Objetivo inválido');
    }
    
    const calorias = tdee + ajuste;
    
    // No permitir menos de 1200 kcal (mínimo saludable)
    return Math.max(Math.round(calorias), 1200);
}

/**
 * Calcula la ingesta diaria recomendada de proteínas
 * 
 * @param {number} peso - Peso en kilogramos
 * @param {string} nivelActividad - Nivel de actividad física
 * @returns {number} Proteínas en gramos por día
 */
export function calcularProteinas(peso, nivelActividad) {
    if (!peso || !nivelActividad) {
        throw new Error('Peso y nivel de actividad son requeridos');
    }
    
    const proteinasPorKg = PROTEINAS_POR_KG[nivelActividad];
    
    if (!proteinasPorKg) {
        throw new Error('Nivel de actividad inválido');
    }
    
    return Math.round(peso * proteinasPorKg);
}

/**
 * Calcula el consumo diario recomendado de agua
 * Base: 35 ml por kg de peso corporal
 * Ajuste: +500ml por nivel de actividad moderado/alto
 * 
 * @param {number} peso - Peso en kilogramos
 * @param {string} nivelActividad - Nivel de actividad física
 * @returns {Object} { litros, mililitros, vasos }
 */
export function calcularAgua(peso, nivelActividad) {
    if (!peso || !nivelActividad) {
        throw new Error('Peso y nivel de actividad son requeridos');
    }
    
    // Base: 35 ml por kg
    let mililitros = peso * 35;
    
    // Ajuste por actividad
    if (nivelActividad === 'activo' || nivelActividad === 'muyActivo') {
        mililitros += 500; // +500ml para actividad intensa
    } else if (nivelActividad === 'moderado') {
        mililitros += 250; // +250ml para actividad moderada
    }
    
    const litros = mililitros / 1000;
    const vasos = Math.ceil(mililitros / 250); // 1 vaso = 250ml
    
    return {
        litros: Math.round(litros * 10) / 10, // Redondear a 1 decimal
        mililitros: Math.round(mililitros),
        vasos: vasos
    };
}

/**
 * Calcula el Índice de Masa Corporal (IMC)
 * IMC = peso (kg) / altura² (m)
 * 
 * @param {number} peso - Peso en kilogramos
 * @param {number} altura - Altura en centímetros
 * @returns {Object} { imc, categoria, descripcion }
 */
export function calcularIMC(peso, altura) {
    if (!peso || !altura) {
        throw new Error('Peso y altura son requeridos');
    }
    
    if (peso <= 0 || altura <= 0) {
        throw new Error('Los valores deben ser positivos');
    }
    
    // Convertir altura de cm a metros
    const alturaMetros = altura / 100;
    
    // Calcular IMC
    const imc = peso / (alturaMetros * alturaMetros);
    const imcRedondeado = Math.round(imc * 10) / 10;
    
    // Determinar categoría según estándares OMS
    let categoria, descripcion;
    
    if (imc < 18.5) {
        categoria = 'bajo-peso';
        descripcion = 'Bajo peso';
    } else if (imc < 25) {
        categoria = 'normal';
        descripcion = 'Peso normal';
    } else if (imc < 30) {
        categoria = 'sobrepeso';
        descripcion = 'Sobrepeso';
    } else {
        categoria = 'obesidad';
        descripcion = 'Obesidad';
    }
    
    return {
        imc: imcRedondeado,
        categoria: categoria,
        descripcion: descripcion
    };
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * 
 * @param {string} fechaNacimiento - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {number} Edad en años
 */
export function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) {
        throw new Error('Fecha de nacimiento es requerida');
    }
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    if (isNaN(nacimiento.getTime())) {
        throw new Error('Fecha de nacimiento inválida');
    }
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    // Ajustar si aún no ha cumplido años este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad;
}

/**
 * Calcula el objetivo semanal de pérdida/ganancia en kg
 * 
 * @param {string} objetivo - 'perdida', 'mantenimiento' o 'ganancia'
 * @returns {number} Cambio de peso esperado por semana en kg
 */
export function calcularObjetivoSemanal(objetivo) {
    const objetivos = {
        perdida: -0.5,        // Perder 0.5 kg por semana
        mantenimiento: 0,     // Mantener peso
        ganancia: 0.5         // Ganar 0.5 kg por semana
    };
    
    return objetivos[objetivo] || 0;
}

/**
 * Calcula el perfil nutricional completo del usuario
 * 
 * @param {Object} datos - Datos del usuario
 * @returns {Object} Perfil completo con todos los cálculos
 */
export function calcularPerfilCompleto(datos) {
    const {
        peso,
        altura,
        fechaNacimiento,
        genero,
        nivelActividad,
        objetivoPrincipal
    } = datos;
    
    // Validar datos requeridos
    if (!peso || !altura || !fechaNacimiento || !genero || !nivelActividad || !objetivoPrincipal) {
        throw new Error('Todos los datos del perfil son requeridos');
    }
    
    try {
        // Calcular edad
        const edad = calcularEdad(fechaNacimiento);
        
        // Calcular IMC
        const imc = calcularIMC(peso, altura);
        
        // Calcular TMB
        const tmb = calcularTMB(peso, altura, edad, genero);
        
        // Calcular TDEE
        const tdee = calcularTDEE(tmb, nivelActividad);
        
        // Calcular calorías objetivo
        const caloriasObjetivo = calcularCaloriasObjetivo(tdee, objetivoPrincipal);
        
        // Calcular proteínas
        const proteinasObjetivo = calcularProteinas(peso, nivelActividad);
        
        // Calcular agua
        const aguaObjetivo = calcularAgua(peso, nivelActividad);
        
        // Calcular objetivo semanal
        const objetivoSemanal = calcularObjetivoSemanal(objetivoPrincipal);
        
        return {
            edad,
            imc: imc.imc,
            categoriaIMC: imc.categoria,
            descripcionIMC: imc.descripcion,
            tmb,
            tdee,
            caloriasObjetivo,
            proteinasObjetivo,
            aguaObjetivo,
            objetivoSemanal
        };
    } catch (error) {
        console.error('Error al calcular perfil completo:', error);
        throw error;
    }
}
