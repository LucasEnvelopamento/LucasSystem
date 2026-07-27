import { useState, useEffect } from 'react';
import { supabase, hasRealConnection } from '../lib/supabase';

export const useVehicles = (clienteId) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    if (hasRealConnection() && clienteId) {
      const { data, error } = await supabase.from('veiculos').select('*').eq('cliente_id', clienteId);
      if (!error) setVehicles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, [clienteId]);

  const saveVehicle = async (vehicleData) => {
    if (hasRealConnection()) {
      const { data, error } = await supabase.from('veiculos').insert([{ ...vehicleData, cliente_id: clienteId }]).select();
      if (!error) await fetchVehicles(); // Força atualização local imediata
      return { success: !error, error, data: data?.[0] };
    }
    return { success: true };
  };

  const updateVehicle = async (id, vehicleData) => {
    if (hasRealConnection()) {
      const { error } = await supabase.from('veiculos').update(vehicleData).eq('id', id);
      if (!error) await fetchVehicles();
      return { success: !error, error };
    }
    return { success: true };
  };

  const deleteVehicle = async (id) => {
    if (hasRealConnection()) {
      const { error } = await supabase.from('veiculos').delete().eq('id', id);
      if (!error) await fetchVehicles();
      return { success: !error, error };
    }
    return { success: true };
  };

  return { vehicles, loading, saveVehicle, updateVehicle, deleteVehicle };
};
