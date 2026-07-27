import { useState, useEffect } from 'react';
import { supabase, hasRealConnection } from '../lib/supabase';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (hasRealConnection()) {
      const { data, error } = await supabase.from('clientes').select('*').order('nome');
      if (!error) setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
    if (hasRealConnection()) {
      const channel = supabase
        .channel('clients-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, fetchClients)
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, []);

  const saveClient = async (clientData) => {
    if (hasRealConnection()) {
      // Normalização
      const normalizedPhone = (clientData.telefone || '').replace(/\D/g, '');
      const normalizedName = (clientData.nome || '').toUpperCase().trim();
      
      const cleanData = {
        ...clientData,
        nome: normalizedName,
        telefone: normalizedPhone
      };

      // Verificação de Duplicidade
      const { data: existing } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('telefone', normalizedPhone);
      
      if (existing && existing.length > 0) {
        return { 
          success: false, 
          error: { message: `Este telefone já está cadastrado para: ${existing[0].nome}` } 
        };
      }

      const { data, error } = await supabase.from('clientes').insert([cleanData]).select();
      return { success: !error, error, data: data?.[0] };
    }
    return { success: true };
  };

  const updateClient = async (id, clientData) => {
    if (hasRealConnection()) {
      // Normalização
      const normalizedPhone = (clientData.telefone || '').replace(/\D/g, '');
      const normalizedName = (clientData.nome || '').toUpperCase().trim();
      
      const cleanData = {
        ...clientData,
        nome: normalizedName,
        telefone: normalizedPhone
      };

      // Verificação de Duplicidade (Exceto o próprio registro sendo editado)
      const { data: existing } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('telefone', normalizedPhone)
        .neq('id', id);
      
      if (existing && existing.length > 0) {
        return { 
          success: false, 
          error: { message: `Este telefone já pertence ao cliente: ${existing[0].nome}` } 
        };
      }
      const { error } = await supabase.from('clientes').update(cleanData).eq('id', id);
      if (!error) await fetchClients();
      return { success: !error, error };
    }
    return { success: true };
  };

  const deleteClient = async (id) => {
    if (hasRealConnection()) {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (!error) await fetchClients();
      return { success: !error, error };
    }
    return { success: true };
  };

  return { clients, loading, saveClient, updateClient, deleteClient };
};
