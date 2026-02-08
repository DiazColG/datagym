// ================================================
// MI PROGRESO - LÓGICA PRINCIPAL
// Gestión de peso corporal con caché optimizado
// ================================================

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

import {
  getUserProfile,
  saveWeightProfile,
  recordWeight,
  hasWeightToday,
  getWeightHistory,
  calculateStats,
  calculateBMI,
  calculateWeightStreak,
  checkNotifications,
  invalidateWeightCaches,
  formatDate
} from './weight-manager.js';

// ================================================
// VARIABLES GLOBALES
// ================================================

let currentUser = null;
let userProfile = null;
let weightHistory = [];
let chartInstance = null;
let currentDays = 30;

// ================================================
// INICIALIZACIÓN
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initEventListeners();
});

// ================================================
// AUTENTICACIÓN
// ================================================

function initAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    currentUser = user;
    
    // Inicializar user circle
    const userInitials = document.getElementById('userInitials');
    if (userInitials && user.email) {
      userInitials.textContent = user.email.charAt(0).toUpperCase();
    }

    // Cargar datos
    await loadUserData();
  });
}

// ================================================
// CARGAR DATOS DEL USUARIO
// ================================================

async function loadUserData() {
  try {
    showLoading();

    // Cargar perfil (con caché de 5 minutos)
    userProfile = await getUserProfile(currentUser.uid);

    // Si no tiene perfil configurado, mostrar setup
    if (!userProfile || !userProfile.heightCm || !userProfile.initialWeight) {
      showEmptyState();
      showSetupModal();
      return;
    }

    // Cargar historial de pesos (con caché de 5 minutos)
    weightHistory = await getWeightHistory(currentUser.uid, 90);

    // Si no tiene registros, mostrar modal diario
    if (weightHistory.length === 0) {
      hideEmptyState();
      showDailyWeightModal();
      return;
    }

    // Renderizar toda la UI
    hideEmptyState();
    renderStats();
    renderProgressBar();
    renderChart(currentDays);
    renderHistory();

    // Verificar si debe registrar peso hoy
    const hasToday = await hasWeightToday(currentUser.uid);
    if (!hasToday) {
      // Mostrar toast sugiriendo registrar peso
      showToast('💡 ¡No olvides registrar tu peso de hoy!', 'info', 5000);
    }

    // Verificar notificaciones (streak, logros, etc)
    const notifications = await checkNotifications(currentUser.uid, weightHistory, userProfile);
    if (notifications && notifications.length > 0) {
      notifications.forEach(notif => {
        showToast(notif.message, notif.type || 'info', 6000);
        if (notif.celebration) {
          launchConfetti();
        }
      });
    }

    hideLoading();

  } catch (error) {
    console.error('Error cargando datos:', error);
    showToast('❌ Error cargando datos. Intenta recargar la página.', 'error');
    hideLoading();
  }
}

// ================================================
// RENDERIZAR ESTADÍSTICAS
// ================================================

function renderStats() {
  if (!userProfile || weightHistory.length === 0) return;

  // Calcular estadísticas
  const stats = calculateStats(weightHistory, userProfile);
  const latestWeight = weightHistory[0]?.weight || userProfile.initialWeight;
  const bmiData = calculateBMI(latestWeight, userProfile.heightCm);
  const streak = calculateWeightStreak(weightHistory);

  // Peso Actual
  const currentWeightEl = document.getElementById('currentWeight');
  if (currentWeightEl) {
    currentWeightEl.textContent = latestWeight.toFixed(1);
  }

  // Peso Objetivo
  const goalWeightEl = document.getElementById('goalWeight');
  if (goalWeightEl && userProfile.goalWeight) {
    goalWeightEl.textContent = userProfile.goalWeight.toFixed(1);
  }

  // IMC
  const bmiValueEl = document.getElementById('bmiValue');
  const bmiCategoryEl = document.getElementById('bmiCategory');
  if (bmiValueEl) {
    bmiValueEl.textContent = bmiData.value.toFixed(1);
  }
  if (bmiCategoryEl) {
    bmiCategoryEl.textContent = bmiData.category;
    bmiCategoryEl.className = `stat-badge ${bmiData.categoryClass}`;
  }

  // Racha
  const streakValueEl = document.getElementById('streakValue');
  if (streakValueEl) {
    streakValueEl.textContent = streak;
  }
}

// ================================================
// RENDERIZAR BARRA DE PROGRESO
// ================================================

function renderProgressBar() {
  if (!userProfile || !userProfile.goalWeight || weightHistory.length === 0) return;

  const initialWeight = userProfile.initialWeight;
  const goalWeight = userProfile.goalWeight;
  const currentWeight = weightHistory[0]?.weight || initialWeight;

  const totalChange = Math.abs(goalWeight - initialWeight);
  const currentChange = Math.abs(currentWeight - initialWeight);
  const progressPercent = totalChange > 0 ? (currentChange / totalChange) * 100 : 0;

  // Limitar entre 0-100%
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));

  // Actualizar UI
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  const initialWeightEl = document.getElementById('initialWeight');
  const goalWeightLabel = document.getElementById('goalWeightLabel');

  if (progressBar) {
    progressBar.style.width = `${clampedProgress}%`;
  }

  if (progressPercentage) {
    progressPercentage.textContent = `${clampedProgress.toFixed(0)}%`;
  }

  if (initialWeightEl) {
    initialWeightEl.textContent = `${initialWeight.toFixed(1)} kg`;
  }

  if (goalWeightLabel) {
    goalWeightLabel.textContent = `${goalWeight.toFixed(1)} kg`;
  }
}

// ================================================
// RENDERIZAR GRÁFICO
// ================================================

function renderChart(days = 30) {
  const canvas = document.getElementById('weightChart');
  if (!canvas) return;

  // Filtrar datos según días solicitados
  const filteredWeights = weightHistory.slice(0, days).reverse();

  if (filteredWeights.length === 0) {
    // No hay datos para mostrar
    return;
  }

  // Preparar datos para Chart.js
  const labels = filteredWeights.map(w => {
    const date = new Date(w.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const data = filteredWeights.map(w => w.weight);

  // Calcular min/max para el eje Y (con margen)
  const minWeight = Math.min(...data);
  const maxWeight = Math.max(...data);
  const margin = (maxWeight - minWeight) * 0.1 || 1;

  // Destruir gráfico anterior si existe
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Crear nuevo gráfico
  const ctx = canvas.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Peso (kg)',
        data: data,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#FFA500',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#FFA500',
        pointHoverBorderColor: '#FFD700',
        pointHoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          titleColor: '#FFD700',
          bodyColor: '#fff',
          borderColor: '#FFD700',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (context) => {
              const index = context[0].dataIndex;
              return formatDate(filteredWeights[index].date);
            },
            label: (context) => {
              return `${context.parsed.y.toFixed(1)} kg`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: '#888',
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          min: minWeight - margin,
          max: maxWeight + margin,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: '#888',
            callback: (value) => `${value.toFixed(1)} kg`
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });

  // Actualizar estadísticas del gráfico
  updateChartStats(filteredWeights);
}

function updateChartStats(weights) {
  if (weights.length === 0) return;

  const data = weights.map(w => w.weight);
  const minWeight = Math.min(...data);
  const maxWeight = Math.max(...data);
  const avgWeight = data.reduce((a, b) => a + b, 0) / data.length;
  const totalChange = weights[weights.length - 1].weight - weights[0].weight;

  const minWeightEl = document.getElementById('minWeight');
  const maxWeightEl = document.getElementById('maxWeight');
  const avgWeightEl = document.getElementById('avgWeight');
  const totalChangeEl = document.getElementById('totalChange');

  if (minWeightEl) minWeightEl.textContent = `${minWeight.toFixed(1)} kg`;
  if (maxWeightEl) maxWeightEl.textContent = `${maxWeight.toFixed(1)} kg`;
  if (avgWeightEl) avgWeightEl.textContent = `${avgWeight.toFixed(1)} kg`;
  
  if (totalChangeEl) {
    const sign = totalChange >= 0 ? '+' : '';
    totalChangeEl.textContent = `${sign}${totalChange.toFixed(1)} kg`;
    totalChangeEl.style.color = totalChange >= 0 ? '#4CAF50' : '#f44336';
  }
}

// ================================================
// RENDERIZAR HISTORIAL
// ================================================

function renderHistory() {
  const historyList = document.getElementById('historyList');
  const historyCount = document.getElementById('historyCount');

  if (!historyList) return;

  historyList.innerHTML = '';

  if (weightHistory.length === 0) {
    historyList.innerHTML = '<p style="text-align: center; color: #888; padding: 2rem;">No hay registros aún</p>';
    if (historyCount) historyCount.textContent = '0 registros';
    return;
  }

  // Actualizar contador
  if (historyCount) {
    historyCount.textContent = `${weightHistory.length} registro${weightHistory.length !== 1 ? 's' : ''}`;
  }

  // Renderizar cada registro
  weightHistory.forEach((record, index) => {
    const item = document.createElement('div');
    item.className = 'history-item';

    const date = document.createElement('div');
    date.className = 'history-date';
    date.textContent = formatDate(record.date);

    const weight = document.createElement('div');
    weight.className = 'history-weight';
    weight.textContent = `${record.weight.toFixed(1)} kg`;

    // Calcular cambio respecto al registro anterior
    const change = document.createElement('div');
    change.className = 'history-change';

    if (index < weightHistory.length - 1) {
      const prevWeight = weightHistory[index + 1].weight;
      const diff = record.weight - prevWeight;

      if (Math.abs(diff) < 0.05) {
        change.textContent = '=';
        change.classList.add('neutral');
      } else if (diff > 0) {
        change.textContent = `+${diff.toFixed(1)} kg`;
        change.classList.add('positive');
      } else {
        change.textContent = `${diff.toFixed(1)} kg`;
        change.classList.add('negative');
      }
    } else {
      change.textContent = 'Inicial';
      change.classList.add('neutral');
    }

    item.appendChild(date);
    item.appendChild(weight);
    item.appendChild(change);

    historyList.appendChild(item);
  });
}

// ================================================
// EVENT LISTENERS
// ================================================

function initEventListeners() {
  // Botón registrar peso
  const btnRegistrarPeso = document.getElementById('btnRegistrarPeso');
  if (btnRegistrarPeso) {
    btnRegistrarPeso.addEventListener('click', showDailyWeightModal);
  }

  // Botón configuración
  const btnConfiguracion = document.getElementById('btnConfiguracion');
  if (btnConfiguracion) {
    btnConfiguracion.addEventListener('click', showSetupModal);
  }

  // Botón start setup (empty state)
  const btnStartSetup = document.getElementById('btnStartSetup');
  if (btnStartSetup) {
    btnStartSetup.addEventListener('click', showSetupModal);
  }

  // Cerrar modales
  const closeSetup = document.getElementById('closeSetup');
  const setupOverlay = document.getElementById('setupOverlay');
  if (closeSetup) closeSetup.addEventListener('click', hideSetupModal);
  if (setupOverlay) setupOverlay.addEventListener('click', hideSetupModal);

  const closeDailyWeight = document.getElementById('closeDailyWeight');
  const dailyWeightOverlay = document.getElementById('dailyWeightOverlay');
  if (closeDailyWeight) closeDailyWeight.addEventListener('click', hideDailyWeightModal);
  if (dailyWeightOverlay) dailyWeightOverlay.addEventListener('click', hideDailyWeightModal);

  // Formularios
  const setupForm = document.getElementById('setupForm');
  if (setupForm) {
    setupForm.addEventListener('submit', handleSetupSubmit);
  }

  const dailyWeightForm = document.getElementById('dailyWeightForm');
  if (dailyWeightForm) {
    dailyWeightForm.addEventListener('submit', handleDailyWeightSubmit);
  }

  // Filtros del gráfico
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const days = parseInt(e.target.dataset.days);
      currentDays = days;

      // Actualizar botones activos
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      // Re-renderizar gráfico
      renderChart(days);
    });
  });

  // Cerrar sesión
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', handleLogout);
  }

  // Input de peso diario - actualizar diferencia en tiempo real
  const inputDailyWeight = document.getElementById('inputDailyWeight');
  if (inputDailyWeight) {
    inputDailyWeight.addEventListener('input', updateDailyWeightInfo);
  }
}

// ================================================
// HANDLERS DE FORMULARIOS
// ================================================

async function handleSetupSubmit(e) {
  e.preventDefault();

  const height = parseFloat(document.getElementById('inputHeight').value);
  const initialWeight = parseFloat(document.getElementById('inputInitialWeight').value);
  const goalWeight = parseFloat(document.getElementById('inputGoalWeight').value);

  // Validaciones
  if (!height || height < 100 || height > 250) {
    showToast('❌ Altura debe estar entre 100 y 250 cm', 'error');
    return;
  }

  if (!initialWeight || initialWeight < 30 || initialWeight > 300) {
    showToast('❌ Peso inicial debe estar entre 30 y 300 kg', 'error');
    return;
  }

  if (!goalWeight || goalWeight < 30 || goalWeight > 300) {
    showToast('❌ Peso objetivo debe estar entre 30 y 300 kg', 'error');
    return;
  }

  try {
    showLoading();

    // Guardar perfil
    await saveWeightProfile(currentUser.uid, {
      heightCm: height,
      initialWeight: initialWeight,
      goalWeight: goalWeight
    });

    // Registrar peso inicial si es la primera vez
    if (!userProfile || weightHistory.length === 0) {
      await recordWeight(currentUser.uid, initialWeight);
    }

    showToast('✅ Perfil configurado correctamente', 'success');
    hideSetupModal();

    // Recargar datos
    await loadUserData();

  } catch (error) {
    console.error('Error guardando configuración:', error);
    showToast('❌ Error guardando configuración: ' + error.message, 'error');
    hideLoading();
  }
}

async function handleDailyWeightSubmit(e) {
  e.preventDefault();

  const weight = parseFloat(document.getElementById('inputDailyWeight').value);

  // Validación
  if (!weight || weight < 30 || weight > 300) {
    showToast('❌ Peso debe estar entre 30 y 300 kg', 'error');
    return;
  }

  try {
    showLoading();

    // Registrar peso
    await recordWeight(currentUser.uid, weight);

    showToast('✅ Peso registrado correctamente', 'success');
    hideDailyWeightModal();

    // Recargar datos
    await loadUserData();

    // Verificar logros
    const notifications = await checkNotifications(currentUser.uid, weightHistory, userProfile);
    if (notifications && notifications.length > 0) {
      notifications.forEach(notif => {
        if (notif.celebration) {
          launchConfetti();
        }
      });
    }

  } catch (error) {
    console.error('Error registrando peso:', error);
    
    if (error.message.includes('Ya registraste')) {
      showToast('ℹ️ Ya registraste tu peso hoy', 'info');
    } else {
      showToast('❌ Error registrando peso: ' + error.message, 'error');
    }
    
    hideLoading();
  }
}

async function handleLogout(e) {
  e.preventDefault();
  
  try {
    await auth.signOut();
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    showToast('❌ Error cerrando sesión', 'error');
  }
}

// ================================================
// ACTUALIZAR INFO DE PESO DIARIO
// ================================================

function updateDailyWeightInfo() {
  const inputDailyWeight = document.getElementById('inputDailyWeight');
  const dailyInfo = document.getElementById('dailyInfo');

  if (!inputDailyWeight || !dailyInfo || weightHistory.length === 0) return;

  const newWeight = parseFloat(inputDailyWeight.value);

  if (!newWeight || newWeight < 30 || newWeight > 300) {
    dailyInfo.innerHTML = '';
    return;
  }

  const lastWeight = weightHistory[0].weight;
  const diff = newWeight - lastWeight;

  let html = '<div class="daily-info-text">Diferencia con último registro:</div>';
  
  if (Math.abs(diff) < 0.05) {
    html += '<div class="daily-info-value neutral">Sin cambios</div>';
  } else if (diff > 0) {
    html += `<div class="daily-info-value positive">+${diff.toFixed(1)} kg</div>`;
  } else {
    html += `<div class="daily-info-value negative">${diff.toFixed(1)} kg</div>`;
  }

  dailyInfo.innerHTML = html;
}

// ================================================
// MODALES
// ================================================

function showSetupModal() {
  const modal = document.getElementById('modalSetup');
  if (!modal) return;

  // Pre-llenar con datos actuales si existen
  if (userProfile) {
    const inputHeight = document.getElementById('inputHeight');
    const inputInitialWeight = document.getElementById('inputInitialWeight');
    const inputGoalWeight = document.getElementById('inputGoalWeight');

    if (inputHeight && userProfile.heightCm) inputHeight.value = userProfile.heightCm;
    if (inputInitialWeight && userProfile.initialWeight) inputInitialWeight.value = userProfile.initialWeight;
    if (inputGoalWeight && userProfile.goalWeight) inputGoalWeight.value = userProfile.goalWeight;
  }

  modal.classList.add('active');
}

function hideSetupModal() {
  const modal = document.getElementById('modalSetup');
  if (modal) modal.classList.remove('active');
}

function showDailyWeightModal() {
  const modal = document.getElementById('modalDailyWeight');
  if (!modal) return;

  // Actualizar fecha actual
  const currentDateEl = document.getElementById('currentDate');
  if (currentDateEl) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = today.toLocaleDateString('es-ES', options);
  }

  // Limpiar input y daily info
  const inputDailyWeight = document.getElementById('inputDailyWeight');
  const dailyInfo = document.getElementById('dailyInfo');
  if (inputDailyWeight) inputDailyWeight.value = '';
  if (dailyInfo) dailyInfo.innerHTML = '';

  modal.classList.add('active');
}

function hideDailyWeightModal() {
  const modal = document.getElementById('modalDailyWeight');
  if (modal) modal.classList.remove('active');
}

// ================================================
// EMPTY STATE
// ================================================

function showEmptyState() {
  const emptyState = document.getElementById('emptyState');
  const statsGrid = document.getElementById('statsGrid');
  const progressSection = document.getElementById('progressSection');

  if (emptyState) emptyState.classList.add('active');
  if (statsGrid) statsGrid.style.display = 'none';
  if (progressSection) progressSection.style.display = 'none';

  // Ocultar secciones de gráfico e historial
  const sections = document.querySelectorAll('.chart-section, .history-section');
  sections.forEach(section => section.style.display = 'none');
}

function hideEmptyState() {
  const emptyState = document.getElementById('emptyState');
  const statsGrid = document.getElementById('statsGrid');
  const progressSection = document.getElementById('progressSection');

  if (emptyState) emptyState.classList.remove('active');
  if (statsGrid) statsGrid.style.display = 'grid';
  if (progressSection) progressSection.style.display = 'block';

  // Mostrar secciones
  const sections = document.querySelectorAll('.chart-section, .history-section');
  sections.forEach(section => section.style.display = 'block');
}

// ================================================
// LOADING
// ================================================

function showLoading() {
  // Puedes implementar un spinner global si lo deseas
  document.body.style.cursor = 'wait';
}

function hideLoading() {
  document.body.style.cursor = 'default';
}

// ================================================
// TOAST NOTIFICATIONS
// ================================================

function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: '💡'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ================================================
// CONFETTI CELEBRATION
// ================================================

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = 100;
  const colors = ['#FFD700', '#FFA500', '#FF6347', '#4CAF50', '#2196F3', '#9C27B0'];

  // Crear partículas
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 2,
      d: Math.random() * particleCount,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }

  let animationFrame;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();

      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

      if (p.y > canvas.height) {
        particles[i] = {
          ...p,
          x: Math.random() * canvas.width,
          y: -10
        };
      }
    });

    animationFrame = requestAnimationFrame(draw);
  }

  draw();

  // Detener después de 3 segundos
  setTimeout(() => {
    cancelAnimationFrame(animationFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 3000);
}
