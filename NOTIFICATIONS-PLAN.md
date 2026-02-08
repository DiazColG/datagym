# 📬 Sistema de Notificaciones Push - Plan de Implementación

## 🎯 Objetivo
Sistema inteligente de notificaciones para motivar y mantener engagement del usuario con el tracking de peso corporal.

---

## 📋 Triggers y Notificaciones

### 1️⃣ RECORDATORIO DIARIO DE PESO
```javascript
{
  id: 'daily_weight_reminder',
  trigger: 'Cron diario 8:00 AM',
  condition: 'Usuario NO registró peso HOY',
  delay: '0 horas',
  priority: 5,
  message: '⚖️ ¡Buenos días! ¿Ya te pesaste hoy?',
  action: 'Abrir modal de registro de peso',
  frequency: 'Una vez por día (8 AM)',
  implementation: 'Cloud Function + FCM'
}
```

### 2️⃣ CELEBRACIÓN DE STREAK
```javascript
{
  id: 'streak_milestone',
  trigger: 'Al registrar peso exitosamente',
  condition: 'Streak múltiplo de 7 (7, 14, 21, 30, 60, 90)',
  delay: 'Inmediato (0 segundos)',
  priority: 2,
  messages: {
    7: '🔥 ¡7 días seguidos! Estás en racha',
    14: '🔥🔥 ¡2 semanas consecutivas! Sos imparable',
    21: '🔥🔥🔥 ¡21 días! Ya formaste un hábito',
    30: '👑 ¡UN MES COMPLETO! Sos una máquina',
    60: '🏆 ¡2 MESES! Nivel legendario',
    90: '💎 ¡3 MESES! Sos un ejemplo para todos'
  },
  action: 'Mostrar confetti + toast + sonido',
  frequency: 'Solo en milestones específicos',
  implementation: 'Cliente (localStorage streak check)'
}
```

### 3️⃣ OBJETIVO ALCANZADO
```javascript
{
  id: 'goal_achieved',
  trigger: 'Al registrar peso',
  condition: 'peso_actual <= peso_objetivo (si objetivo es bajar) || peso_actual >= peso_objetivo (si objetivo es subir)',
  delay: 'Inmediato',
  priority: 1,
  message: '🎉 ¡FELICITACIONES! Alcanzaste tu objetivo de {peso_objetivo}kg',
  action: 'Abrir Mi Progreso + confetti + sonido épico',
  frequency: 'Una vez por objetivo (flag: goalAchievedNotified)',
  implementation: 'Cliente + Firestore flag'
}
```

### 4️⃣ PROGRESO SIGNIFICATIVO
```javascript
{
  id: 'significant_progress',
  trigger: 'Al registrar peso',
  condition: 'abs(peso_actual - peso_inicial) >= 2kg',
  delay: 'Inmediato',
  priority: 3,
  message: '💪 ¡{diferencia}kg de progreso! Vas increíble',
  action: 'Mostrar gráfico de evolución',
  frequency: 'Cada 2kg de cambio (notificar 2kg, 4kg, 6kg, etc)',
  implementation: 'Cliente (calcular diferencia vs inicio)'
}
```

### 5️⃣ STREAK ROTO (Recuperación motivacional)
```javascript
{
  id: 'streak_broken_recovery',
  trigger: 'Cron diario 8:00 PM',
  condition: 'streak_anterior >= 7 && NO registró peso HOY',
  delay: '0 horas',
  priority: 4,
  message: '⚠️ Tenías {dias} días de racha. ¡No la pierdas! Aún podés registrar hoy',
  action: 'Abrir modal de registro',
  frequency: 'Una vez al día (8 PM) solo si streak >= 7',
  implementation: 'Cloud Function + FCM'
}
```

### 6️⃣ USUARIO INACTIVO (3+ días)
```javascript
{
  id: 'inactive_user',
  trigger: 'Cron diario 9:00 AM',
  condition: 'Último registro > 3 días atrás',
  delay: '0 horas',
  priority: 6,
  message: '👋 Hace 3 días que no te vemos. ¿Todo bien? Tu progreso te está esperando',
  action: 'Abrir Mi Progreso',
  frequency: 'Cada 3 días de inactividad (días 3, 6, 9...)',
  implementation: 'Cloud Function + FCM'
}
```

### 7️⃣ ESTANCAMIENTO (Plateau)
```javascript
{
  id: 'weight_plateau',
  trigger: 'Análisis semanal (lunes 9:00 AM)',
  condition: 'Peso sin cambios (+/- 0.5kg) durante 14+ días',
  delay: '0 horas',
  priority: 7,
  message: '💡 Tu peso está estable hace 2 semanas. ¿Querés ajustar tu objetivo o estrategia?',
  action: 'Abrir configuración de objetivo',
  frequency: 'Cada 2 semanas de plateau',
  implementation: 'Cloud Function + Análisis de tendencia'
}
```

### 8️⃣ CORRELACIÓN CON ENTRENAMIENTOS
```javascript
{
  id: 'training_weight_correlation',
  trigger: 'Fin de semana (domingo 7:00 PM)',
  condition: 'workouts_semana >= 4 && peso_bajó >= 0.3kg',
  delay: '0 horas',
  priority: 6,
  message: '🔥 Entrenaste {veces} esta semana y bajaste {kg}kg. ¡La consistencia paga!',
  action: 'Mostrar stats semanales',
  frequency: 'Semanal (solo si cumple condiciones)',
  implementation: 'Cloud Function + Análisis semanal'
}
```

---

## 🎚️ Sistema de Prioridades

```javascript
const PRIORITY_ORDER = {
  1: 'goal_achieved',           // P1 - MÁS IMPORTANTE
  2: 'streak_milestone',         // P2 - Celebraciones
  3: 'significant_progress',     // P3 - Motivacional
  4: 'streak_broken_recovery',   // P4 - Retención
  5: 'daily_weight_reminder',    // P5 - Recordatorios
  6: 'training_weight_correlation', // P6 - Insights
  7: 'weight_plateau',           // P7 - Sugerencias
  8: 'inactive_user'             // P8 - Re-engagement
};
```

**Regla**: Si 2+ notificaciones se disparan al mismo tiempo, solo enviar la de mayor prioridad.

---

## 🚫 Límites Anti-Spam

```javascript
const NOTIFICATION_LIMITS = {
  maxPerDay: 2,              // Máximo 2 notificaciones por día
  cooldownHours: 6,          // Mínimo 6 horas entre notificaciones
  silentHoursStart: 22,      // No notificar desde las 10 PM
  silentHoursEnd: 7,         // hasta las 7 AM
  respectDoNotDisturb: true, // Respetar configuración del dispositivo
};
```

---

## 📊 Almacenamiento (Firestore)

### Colección: `users/{userId}/notifications_log`

```javascript
{
  notificationId: 'daily_weight_reminder',
  sentAt: Timestamp,
  read: false,
  clicked: false,
  dismissed: false
}
```

### Campo en `users/{userId}`

```javascript
{
  notifications: {
    enabled: true,
    lastSent: Timestamp,
    goalAchievedNotified: false,
    streakMilestones: [7, 14, 21], // Ya notificados
  }
}
```

---

## 🔧 Implementación Técnica

### Fase 1: Cliente (Ahora - MVP)
```javascript
// ✅ Toast notifications in-app
// ✅ Confetti en milestones
// ✅ Modal prompts
// ✅ Sonidos de celebración
```

### Fase 2: Firebase Cloud Functions (Futuro)
```javascript
// ⏳ Scheduled functions (cron jobs)
// ⏳ FCM Push Notifications
// ⏳ Email notifications (opcional)
// ⏳ Analytics de engagement
```

---

## 📱 Experiencia de Usuario

### In-App (Cliente)
```javascript
// Registrar peso → Check inmediato
if (isStreakMilestone(currentStreak)) {
  showConfetti();
  showToast(streakMessages[currentStreak]);
  playSound('celebration.mp3');
}

if (isGoalAchieved(currentWeight, goalWeight)) {
  showConfetti();
  showModal('goalAchieved');
  playSound('epic-win.mp3');
}
```

### Push Notifications (Futuro)
```javascript
// Background cuando app cerrada
FCM.send({
  title: '⚖️ DataGym',
  body: '¡Buenos días! ¿Ya te pesaste hoy?',
  icon: '/icon-192x192.png',
  badge: '/badge-72x72.png',
  click_action: 'https://datagym.vercel.app/mi-progreso.html'
});
```

---

## 🎯 Métricas de Éxito

```javascript
// KPIs a trackear:
- Engagement rate (% usuarios que registran peso diariamente)
- Streak promedio
- Tasa de alcance de objetivos
- Click-through rate de notificaciones
- Retention a 7, 30, 90 días
```

---

## 🔮 Futuras Mejoras

1. **Notificaciones personalizadas por horario preferido**
2. **Integración con smart scales (Bluetooth)**
3. **Recordatorios inteligentes basados en rutina**
4. **Grupos de apoyo / desafíos entre amigos**
5. **Notificaciones de cumpleaños / aniversarios**
6. **AI predictions: "A este ritmo llegarás en X semanas"**

---

## ✅ Checklist de Implementación

### MVP (Ahora)
- [x] Documentar sistema completo
- [ ] Implementar toasts in-app
- [ ] Implementar confetti en milestones
- [ ] Implementar sonidos de celebración
- [ ] Logging local de notificaciones mostradas

### V2 (Después)
- [ ] Cloud Functions setup
- [ ] FCM integration
- [ ] Cron jobs para recordatorios
- [ ] Dashboard de analytics
- [ ] A/B testing de mensajes

---

**Última actualización**: Febrero 8, 2026  
**Status**: 📋 Documentado - Listo para implementación MVP
