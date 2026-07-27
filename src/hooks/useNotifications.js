import { useState, useEffect } from 'react';
import { supabase, hasRealConnection } from '../lib/supabase';

// Helper para tocar som suave de alerta (Web Audio API - 0 latência e 0 dependências)
export const playNotificationChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Ignora restrições de autoplay de áudio no navegador se ainda não houve interação na aba
  }
};

// Helper para disparar notificação nativa no navegador / PWA (Android, iOS, Desktop)
export const triggerNativePushNotification = (notification) => {
  playNotificationChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const options = {
        body: notification.mensagem || 'Nova atualização no sistema',
        icon: '/pwa-192x192.png',
        badge: '/mask-icon.svg',
        vibrate: [200, 100, 200],
        tag: `notif-${notification.id || Date.now()}`,
        requireInteraction: notification.tipo === 'ALERTA',
        data: notification
      };

      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(notification.titulo || 'OsSystem PWA', options);
        }).catch(() => {
          new Notification(notification.titulo || 'OsSystem PWA', options);
        });
      } else {
        new Notification(notification.titulo || 'OsSystem PWA', options);
      }
    } catch (err) {
      console.error('Erro ao disparar push nativo:', err);
    }
  }
};

export const getPushPermissionStatus = () => {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'unsupported';
};

// Solicitação interativa de permissão de notificações nativas
export const requestPushPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      playNotificationChime();
      triggerNativePushNotification({
        titulo: 'Notificações PWA Ativadas! 🔔',
        mensagem: 'Agora você receberá alertas de novas OS, estoque crítico e aprovações em tempo real no seu dispositivo.',
        tipo: 'SUCESSO'
      });
      return true;
    }
  }
  return false;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushPermission, setPushPermission] = useState(() => getPushPermissionStatus());

  const fetchNotifications = async () => {
    if (hasRealConnection()) {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (!error && data) setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    if (hasRealConnection()) {
      await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (hasRealConnection()) {
      await supabase.from('notificacoes').update({ lida: true }).eq('lida', false);
      fetchNotifications();
    }
  };

  const clearNotification = async (id) => {
    if (hasRealConnection()) {
      await supabase.from('notificacoes').delete().eq('id', id);
      fetchNotifications();
    }
  };

  const enablePush = async () => {
    const granted = await requestPushPermission();
    setPushPermission(getPushPermissionStatus());
    return granted;
  };

  useEffect(() => {
    fetchNotifications();
    if (hasRealConnection()) {
      const channel = supabase
        .channel('notificacoes-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notificacoes' }, (payload) => {
          fetchNotifications();
          if (payload.eventType === 'INSERT' && payload.new) {
            triggerNativePushNotification(payload.new);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    fetchNotifications,
    pushPermission,
    enablePush
  };
};

export const createNotification = async (data) => {
  if (hasRealConnection()) {
    const { error } = await supabase.from('notificacoes').insert(data);
    return { success: !error, error };
  } else {
    triggerNativePushNotification(data);
  }
  return { success: true };
};
