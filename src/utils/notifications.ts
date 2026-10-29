import type { InAppNotification } from '../types';

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function sendBrowserNotification(title: string, body: string, icon = '/favicon.ico'): boolean {
  if (!isBrowserNotificationSupported()) {
    return false;
  }
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: 'focusfit-' + Date.now(),
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export const NOTIFICATION_TEMPLATES = {
  breakfast: {
    title: '🥗 Café da Manhã FOCUSFIT',
    message: 'Hora de nutrir seu corpo! Comece o dia com energia e confira seu planejamento alimentar.',
  },
  lunch: {
    title: '🥗 Hora do Almoço!',
    message: 'Hora de cuidar de você! Faça uma pausa, respire e monte um prato colorido e nutritivo.',
  },
  snack: {
    title: '🍎 Lanche da Tarde Consciente',
    message: 'Faça um lanche equilibrado para manter sua disposição e evitar comer por impulso mais tarde.',
  },
  dinner: {
    title: '🍽️ Jantar Equilibrado',
    message: 'Feche seu dia com leveza. Escolha uma refeição acolhedora e saudável.',
  },
  dailyReview: {
    title: '🌙 Finalize seu Dia no FOCUSFIT',
    message: 'Antes de encerrar o dia, confira seus hábitos e confirme seu progresso para salvar sua ofensiva!',
  },
  hydration: {
    title: '💧 Hora da Hidratação!',
    message: 'Já bebeu água recentemente? Faça uma pausa rápida, encha seu copo e confira suas metas.',
  },
  streakRisk: {
    title: '⚠️ Sua ofensiva está em risco!',
    message: 'Você se afastou da rotina ontem. Hoje é sua chance de retomar o controle com consistência!',
  },
  streakMilestone: {
    title: '🔥 Marco Histórico de Ofensiva!',
    message: 'Parabéns! Você alcançou uma sequência incrível de dias consecutivos!',
  },
};

export function createInAppNotification(
  title: string,
  message: string,
  type: InAppNotification['type']
): InAppNotification {
  return {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type,
  };
}
