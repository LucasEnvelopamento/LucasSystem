import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { supabase, hasRealConnection } from '../lib/supabase';

export const useCatalog = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCatalog = async () => {
    if (hasRealConnection()) {
      const { data, error } = await supabase.from('servicos').select().order('nome');
      if (!error) setServices(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCatalog();
    if (hasRealConnection()) {
      const channel = supabase
        .channel('services-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'servicos' }, fetchCatalog)
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, []);

  const saveService = async (serviceData) => {
    if (hasRealConnection()) {
      const { data, error } = await supabase.from('servicos').insert([serviceData]).select();
      
      if (error) {
        if (error.code === '42703') {
          const safeData = { ...serviceData };
          
          if (error.message?.includes('garantia')) {
             delete safeData.garantia;
          }
          if (error.message?.includes('materiais')) {
             delete safeData.materiais;
             toast.warning("Aviso: Os MATERIAIS não foram salvos pois a coluna 'materiais' não foi encontrada!");
          }

          const { data: retryData, error: retryError } = await supabase.from('servicos').insert([safeData]).select();
          if (!retryError) {
             await fetchCatalog();
             return { success: true, data: retryData?.[0] };
          }
          toast.error('Erro no fallback de serviço: ' + retryError.message);
          return { success: false, error: retryError };
        }
        toast.error('Erro ao salvar serviço: ' + error.message);
        return { success: false, error };
      }

      await fetchCatalog();
      return { success: !error, error, data: data?.[0] };
    }
    return { success: true };
  };

  const updateService = async (id, serviceData) => {
    if (hasRealConnection()) {
      const { error } = await supabase.from('servicos').update(serviceData).eq('id', id);
      
      if (error) {
        if (error.code === '42703') {
          const safeData = { ...serviceData };
          
          if (error.message?.includes('garantia')) {
             delete safeData.garantia;
          }
          if (error.message?.includes('materiais')) {
             delete safeData.materiais;
             toast.warning("Aviso: Os MATERIAIS não foram atualizados pois a coluna 'materiais' não foi encontrada!");
          }

          const { error: retryError } = await supabase.from('servicos').update(safeData).eq('id', id);
          if (!retryError) {
             await fetchCatalog();
             return { success: true };
          }
          toast.error('Erro no fallback de atualizar serviço: ' + retryError.message);
          return { success: false, error: retryError };
        }
        toast.error('Erro ao atualizar serviço: ' + error.message);
        return { success: false, error };
      }

      await fetchCatalog();
      return { success: !error, error };
    }
    return { success: true };
  };

  const deleteService = async (id) => {
    if (hasRealConnection()) {
      const { error } = await supabase.from('servicos').delete().eq('id', id);
      if (!error) await fetchCatalog();
      return { success: !error, error };
    }
    return { success: true };
  };

  return { services, loading, saveService, updateService, deleteService };
};
