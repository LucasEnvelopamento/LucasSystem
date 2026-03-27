import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [brand, setBrand] = useState({
    name: import.meta.env.VITE_APP_NAME || 'OsSystem',
    primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#059669',
    secondaryColor: import.meta.env.VITE_SECONDARY_COLOR || '#1e293b',
    accentColor: import.meta.env.VITE_ACCENT_COLOR || '#4f46e5',
    logoUrl: import.meta.env.VITE_LOGO_URL || '',
    youtubeId: import.meta.env.VITE_YOUTUBE_ID || '',
  });

  const initialized = React.useRef(false);

  useEffect(() => {
    if (!supabase || initialized.current) return;
    initialized.current = true;

    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('loja_config')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar config:', error);
          return;
        }

        if (data) {
          setBrand(prev => ({
            ...prev,
            name: data.nome_loja || prev.name,
            primaryColor: data.primary_color || prev.primaryColor,
            secondaryColor: data.secondary_color || prev.secondaryColor,
            accentColor: data.accent_color || prev.accentColor,
            logoUrl: data.logo_url || prev.logoUrl,
            youtubeId: data.youtube_id || prev.youtubeId,
          }));
        }
      } catch (err) {
        console.error('Falha na sincronização inicial:', err);
      }
    };

    fetchConfig();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'loja_config' }, 
        (payload) => {
          const newData = payload.new;
          setBrand(prev => ({
            ...prev,
            name: newData.nome_loja || prev.name,
            primaryColor: newData.primary_color || prev.primaryColor,
            secondaryColor: newData.secondary_color || prev.secondaryColor,
            accentColor: newData.accent_color || prev.accentColor,
            logoUrl: newData.logo_url || prev.logoUrl,
            youtubeId: newData.youtube_id || prev.youtubeId,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateConfig = async (newData) => {
    try {
      const { data: existingData } = await supabase.from('loja_config').select('id').limit(1).maybeSingle();
      
      const payloadToUpdate = {
          nome_loja: newData.nome_loja,
          youtube_id: newData.youtube_id,
          primary_color: newData.primary_color,
          secondary_color: newData.secondary_color,
          updated_at: new Date().toISOString()
      };

      if (newData.logo_url !== undefined) {
          payloadToUpdate.logo_url = newData.logo_url;
      }

      let error;
      if (existingData?.id) {
          // Atualiza registro existente
          const { error: updateError } = await supabase
            .from('loja_config')
            .update(payloadToUpdate)
            .eq('id', existingData.id);
          error = updateError;
      } else {
          // Cria o primeiro registro se não houver
          const { error: insertError } = await supabase
            .from('loja_config')
            .insert([payloadToUpdate]);
          error = insertError;
      }

      if (error) throw error;
      
      setBrand(prev => ({
          ...prev,
          name: newData.nome_loja,
          primaryColor: newData.primary_color,
          secondaryColor: newData.secondary_color,
          youtubeId: newData.youtube_id,
          ...(newData.logo_url !== undefined ? { logoUrl: newData.logo_url } : {})
      }));

      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar config:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', brand.primaryColor);
    root.style.setProperty('--color-secondary', brand.secondaryColor);
    root.style.setProperty('--color-accent', brand.accentColor);
    root.style.setProperty('--color-primary-light', brand.primaryColor + '15');
  }, [brand]);

  return (
    <BrandContext.Provider value={{ ...brand, updateConfig }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => useContext(BrandContext);
