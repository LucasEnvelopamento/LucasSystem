import { useState, useEffect } from 'react';
import { supabase, hasRealConnection } from '../lib/supabase';

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    if (hasRealConnection()) {
      const { data, error } = await supabase.from('estoque_materiais').select('*').order('nome');
      if (!error) setInventory(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
    if (hasRealConnection()) {
      const channel = supabase
        .channel('inventory-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_materiais' }, fetchInventory)
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, []);

  const saveItem = async (itemData) => {
    if (hasRealConnection()) {
      const { data, error } = await supabase.from('estoque_materiais').insert([itemData]).select();
      if (!error) await fetchInventory();
      return { success: !error, error, data: data?.[0] };
    }
    return { success: true };
  };

  const updateItem = async (id, itemData) => {
    if (hasRealConnection()) {
      const { error } = await supabase.from('estoque_materiais').update(itemData).eq('id', id);
      if (!error) await fetchInventory();
      return { success: !error, error };
    }
    return { success: true };
  };

  const deleteItem = async (id) => {
    if (hasRealConnection()) {
      const { error } = await supabase.from('estoque_materiais').delete().eq('id', id);
      if (!error) await fetchInventory();
      return { success: !error, error };
    }
    return { success: true };
  };

  return { inventory, loading, fetchInventory, saveItem, updateItem, deleteItem };
};
