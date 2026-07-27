import { useState, useEffect } from 'react';
import { supabase, hasRealConnection } from '../lib/supabase';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchNotifications();
    if (hasRealConnection()) {
      const channel = supabase
        .channel('notificacoes-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notificacoes' }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return { notifications, loading, markAsRead, markAllAsRead, clearNotification, fetchNotifications };
};

export const createNotification = async (data) => {
  if (hasRealConnection()) {
    const { error } = await supabase.from('notificacoes').insert(data);
    return { success: !error, error };
  }
  return { success: true };
};
