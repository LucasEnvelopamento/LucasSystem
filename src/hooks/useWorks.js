import { useState, useEffect } from 'react';
import { supabase, hasRealConnection } from '../lib/supabase';
import { validateMediaUpload } from '../utils/fileValidation';

export const useWorks = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorks = async () => {
    if (hasRealConnection()) {
      const { data, error } = await supabase
        .from('trabalhos_recentes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setWorks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorks();
    if (hasRealConnection()) {
      const channel = supabase
        .channel('works-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trabalhos_recentes' }, fetchWorks)
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, []);

  const uploadWork = async (file, titulo, categoria) => {
    const validation = validateMediaUpload(file);
    if (!validation.valid) {
      return { success: false, error: { message: validation.error } };
    }

    if (hasRealConnection()) {
      try {
        // Sanitiza a extensão do arquivo (força minúsculo e remove query strings)
        const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
        const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'].includes(rawExt) ? rawExt : 'jpg';
        
        // Nome único e seguro (sem espaços, acentos ou caracteres especiais)
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${safeExt}`;

        // 1. Upload para o Bucket 'trabalhos-recentes' com content-type explícito
        const { error: uploadError } = await supabase.storage
          .from('trabalhos-recentes')
          .upload(fileName, file, {
            contentType: file.type || `image/${safeExt}`,
            upsert: false
          });

        if (uploadError) throw uploadError;

        // 2. Pegar URL Pública
        const { data: { publicUrl } } = supabase.storage
          .from('trabalhos-recentes')
          .getPublicUrl(fileName);

        // 3. Salvar na Tabela 'trabalhos_recentes'
        const { error: dbError } = await supabase
          .from('trabalhos_recentes')
          .insert({
            titulo: titulo || file.name.split('.')[0],
            url: publicUrl,
            storage_path: fileName,
            categoria: categoria || 'Geral'
          });

        if (dbError) throw dbError;

        await fetchWorks();
        return { success: true, url: publicUrl };
      } catch (error) {
        console.error('Erro no upload do trabalho:', error);
        return { success: false, error };
      }
    }
    return { success: true };
  };

  const deleteWork = async (workId, storagePath) => {
    if (hasRealConnection()) {
      try {
        console.log('Iniciando exclusão do trabalho:', { workId, storagePath });
        
        // 1. Deleta do Storage
        if (storagePath) {
          const { error: storageError } = await supabase.storage
            .from('trabalhos-recentes')
            .remove([storagePath]);
          
          if (storageError) {
            console.error('Erro ao remover do storage:', storageError);
            // Se for erro de permissão (403), paramos por aqui para não deixar o DB órfão
            if (storageError.status === 403 || storageError.message?.includes('Permission')) {
              return { success: false, error: 'Sem permissão no Storage (403). Verifique as Políticas.' };
            }
            // Outros erros de storage apenas avisamos e continuamos
          }
        }

        // 2. Deleta do DB
        const { error: dbError } = await supabase
          .from('trabalhos_recentes')
          .delete()
          .eq('id', workId);

        if (dbError) {
          console.error('Erro ao remover do banco:', dbError);
          throw dbError;
        }

        await fetchWorks();
        return { success: true };
      } catch (error) {
        console.error('Erro crítico ao excluir trabalho:', error);
        return { success: false, error: error.message || 'Erro inesperado ao excluir.' };
      }
    }
    return { success: true };
  };

  const renameWork = async (workId, newTitle) => {
    if (hasRealConnection()) {
      const { error } = await supabase
        .from('trabalhos_recentes')
        .update({ titulo: newTitle })
        .eq('id', workId);
      
      if (!error) await fetchWorks();
      return { success: !error, error };
    }
    return { success: true };
  };

  return { works, loading, uploadWork, deleteWork, renameWork, fetchWorks };
};
