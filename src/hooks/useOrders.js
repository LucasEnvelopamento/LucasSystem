import { useState, useEffect } from 'react';
import { supabase, hasRealConnection } from '../lib/supabase';
import { validateMediaUpload } from '../utils/fileValidation';
import { createNotification } from './useNotifications';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (hasRealConnection()) {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*, clientes(nome, telefone), veiculos(modelo, marca, placa, tipo, ano), checklist_avarias(id), tecnico_ref:profiles!ordens_servico_tecnico_id_fkey(nome)')
        .order('id', { ascending: false });
      
      if (!error && data) {
        setOrders(data.map(os => {
          const veiculoObj = Array.isArray(os.veiculos) ? os.veiculos[0] : os.veiculos;
          const clienteObj = Array.isArray(os.clientes) ? os.clientes[0] : os.clientes;
          
          return {
            ...os,
            cliente_nome: clienteObj?.nome || 'Cliente',
            cliente_telefone: clienteObj?.telefone,
            veiculo_desc: veiculoObj ? `${veiculoObj.marca || ''} ${veiculoObj.modelo || ''} ${veiculoObj.ano ? '(' + veiculoObj.ano + ')' : ''}`.trim() || 'Veículo' : 'Veículo',
            veiculo_tipo: veiculoObj?.tipo || 'CARRO',
            placa: veiculoObj?.placa,
            valor_total: Number(os.valor_total) || 0,
            desconto: Number(os.desconto) || 0,
            has_checklist: Array.isArray(os.checklist_avarias) && os.checklist_avarias.length > 0,
            tecnico: os.tecnico_ref?.nome || os.tecnico || 'Nenhum', // Prioriza o nome da tabela profiles
            valor_pago: Number(os.valor_pago) || 0,
            saldo_devedor: (Number(os.valor_total) || 0) - (Number(os.valor_pago) || 0),
            historico_pagamentos: os.historico_pagamentos || []
          };
        }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    if (hasRealConnection()) {
        const channel = supabase
            .channel('os-changes-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_servico' }, (payload) => {
                console.log('Realtime update received:', payload);
                fetchOrders();
            })
            .subscribe((status) => {
                console.log('Realtime subscription status:', status);
                if (status === 'CHANNEL_ERROR') {
                    console.error('Falha na conexão Realtime. Verifique se o Realtime está habilitado no painel do Supabase para a tabela ordens_servico.');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, []);

  const saveOrderChecklist = async (osId, data, signatureBase64) => {
    if (hasRealConnection()) {
      const targetOsId = Number(osId);
      
      // 1. Limpa checklist anterior
      await supabase.from('checklist_avarias').delete().eq('os_id', targetOsId);

      // 2. Tenta salvar o novo checklist (estratégia resiliente)
      let checklistError;
      
      // Tentativa A: Com a coluna 'quilometragem'
      const { error: errorA } = await supabase
        .from('checklist_avarias')
        .insert({ 
          os_id: targetOsId, 
          pontos_avaria: data.points, 
          notas: data.generalNotes,
          quilometragem: data.km
        });
      
      checklistError = errorA;

      // Tentativa B: Fallback se a coluna não existir (salva KM dentro das notas)
      if (errorA && (errorA.code === '42703' || errorA.message?.includes('column "quilometragem" does not exist'))) {
        const { error: errorB } = await supabase
          .from('checklist_avarias')
          .insert({ 
            os_id: targetOsId, 
            pontos_avaria: data.points, 
            notas: `[KM: ${data.km || 'N/A'}] ${data.generalNotes || ''}`
          });
        checklistError = errorB;
      }

      // 3. Salva a assinatura se houver
      if (!checklistError && signatureBase64) {
        await supabase.from('os_midia').delete().eq('os_id', targetOsId).eq('tipo', 'assinatura');
        await supabase
          .from('os_midia')
          .insert({
            os_id: targetOsId,
            url: signatureBase64,
            tipo: 'assinatura'
          });
      }

      if (!checklistError) await fetchOrders();
      return { success: !checklistError, error: checklistError };
    }
    return { success: true };
  };

  const updateOrderProgress = async (id, data) => {
    if (hasRealConnection()) {
      // Atualização Otimista para resposta imediata na UI
      setOrders(current => current.map(os => os.id === id ? { ...os, ...data } : os));

      try {
        // Intercepta ENTREGA para dar baixa no estoque (Status Final)
        // O usuário solicitou que o estoque só seja movimentado quando marcado como ENTREGUE
        const isDelivered = data.status === 'ENTREGUE';
        if (isDelivered) {
           const { data: currentOs } = await supabase.from('ordens_servico').select('status, servicos_detalhados').eq('id', id).single();
           
           // Só abate se não estava Entregue antes (Evita duplicidade)
           const wasAlreadyDelivered = currentOs?.status === 'ENTREGUE';

           if (currentOs && !wasAlreadyDelivered && currentOs.servicos_detalhados) {
              for (const serv of currentOs.servicos_detalhados) {
                 if (serv.controle_estoque && Array.isArray(serv.materiais)) {
                    for (const mat of serv.materiais) {
                        if (mat.material_id && mat.quantidade_utilizada > 0) {
                          const { data: matData } = await supabase.from('estoque_materiais').select('quantidade, minimo_alerta, nome').eq('id', mat.material_id).single();
                          if (matData) {
                             const novoEstoque = Math.max(0, matData.quantidade - mat.quantidade_utilizada);
                             await supabase.from('estoque_materiais').update({ quantidade: novoEstoque }).eq('id', mat.material_id);
                             if (novoEstoque <= (Number(matData.minimo_alerta) || 5)) {
                               createNotification({
                                 titulo: 'Alerta de Estoque Crítico ⚠️',
                                 mensagem: `O material "${matData.nome || 'Item'}" atingiu o nível mínimo (${novoEstoque} restantes) após a OS #${id}.`,
                                 tipo: 'ALERTA',
                                 item_id: mat.material_id
                               });
                             }
                          }
                        }
                    }
                 }
              }
           }
        }

        const { error } = await supabase
          .from('ordens_servico')
          .update(data)
          .eq('id', id);

        if (error) {
           console.error('Erro ao atualizar OS:', error);
           // Rollback otimista em caso de erro crítico
           await fetchOrders();
           
           if (error.code === '42703' || error.message?.includes('column')) {
              const minimalData = { 
                status: data.status, 
                progresso: data.progresso || 100 
              };
              if (data.observacoes) minimalData.observacoes = data.observacoes;
              if (data.tecnico) minimalData.tecnico = data.tecnico;
              if (data.tecnico_id) minimalData.tecnico_id = data.tecnico_id;

              const { error: fallbackError } = await supabase
                .from('ordens_servico')
                .update(minimalData)
                .eq('id', id);
              
              if (fallbackError) throw fallbackError;
           } else {
             throw error;
           }
        }
        
        // Se não houver erro, o estado já foi atualizado otimisticamente
        // mas o fetchOrders garante que pegamos dados desnormalizados do banco (nomes, etc)
        fetchOrders(); 

        if (data.tecnico_id || data.tecnico) {
          createNotification({
            titulo: 'Nova OS Atribuída 👨‍🔧',
            mensagem: `A OS #${id} foi atribuída a um técnico para execução.`,
            tipo: 'OS'
          });
        }
        if (data.status === 'AGUARDANDO' || data.status === 'APROVADO') {
          createNotification({
            titulo: 'Orçamento Aprovado 🚀',
            mensagem: `A OS #${id} foi confirmada e agendada para execução!`,
            tipo: 'SUCESSO'
          });
        }
        return { success: true };
      } catch (error) {
        console.error('Falha crítica no hook useOrders:', error);
        return { success: false, error };
      }
    }
    return { success: true };
  };

  const deliverOrder = async (id) => {
    return await updateOrderProgress(id, { status: 'ENTREGUE', progresso: 100 });
  };

  const registerPayment = async (osId, paymentData) => {
    if (hasRealConnection()) {
      try {
        const { data: os, error: fetchError } = await supabase
          .from('ordens_servico')
          .select('valor_pago, historico_pagamentos')
          .eq('id', osId)
          .single();
        
        if (fetchError) throw fetchError;

        const currentPaid = Number(os.valor_pago) || 0;
        const currentHistory = os.historico_pagamentos || [];

        const newPaid = currentPaid + Number(paymentData.valor);
        const newHistory = [...currentHistory, {
          valor: Number(paymentData.valor),
          metodo: paymentData.metodo,
          tipo: paymentData.tipo || 'PARCIAL',
          data: new Date().toISOString()
        }];

        const { error: updateError } = await supabase
          .from('ordens_servico')
          .update({
            valor_pago: newPaid,
            historico_pagamentos: newHistory
          })
          .eq('id', osId);

        if (updateError) throw updateError;
        
        await fetchOrders();
        return { success: true };
      } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        return { success: false, error };
      }
    }
    return { success: true };
  };

  const deletePayment = async (osId, paymentIndex) => {
    if (hasRealConnection()) {
      try {
        const { data: os, error: fetchError } = await supabase
          .from('ordens_servico')
          .select('valor_pago, historico_pagamentos')
          .eq('id', osId)
          .single();
        
        if (fetchError) throw fetchError;

        const history = os.historico_pagamentos || [];
        const paymentToRemove = history[paymentIndex];

        if (!paymentToRemove) return { success: false, error: 'Pagamento não encontrado' };

        const newHistory = history.filter((_, idx) => idx !== paymentIndex);
        const newPaid = Math.max(0, (Number(os.valor_pago) || 0) - (Number(paymentToRemove.valor) || 0));

        const { error: updateError } = await supabase
          .from('ordens_servico')
          .update({
            valor_pago: newPaid,
            historico_pagamentos: newHistory
          })
          .eq('id', osId);

        if (updateError) throw updateError;
        await fetchOrders();
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    }
    return { success: true };
  };

  const removeServiceFromOrder = async (osId, serviceIndex) => {
    if (hasRealConnection()) {
      try {
        const { data: os, error: fetchError } = await supabase
          .from('ordens_servico')
          .select('*')
          .eq('id', osId)
          .single();
        
        if (fetchError) throw fetchError;

        const services = os.servicos_detalhados || [];
        if (services.length <= 1) return { success: false, error: 'Não é possível remover o único serviço da OS.' };

        const serviceToRemove = services[serviceIndex];
        const newServices = services.filter((_, idx) => idx !== serviceIndex);
        
        // 1. Reverter Estoque se a OS já estiver Entregue
        if (os.status === 'ENTREGUE' && serviceToRemove.controle_estoque && Array.isArray(serviceToRemove.materiais)) {
          for (const mat of serviceToRemove.materiais) {
            if (mat.material_id && mat.quantidade_utilizada > 0) {
              const { data: matData } = await supabase.from('estoque_materiais').select('quantidade').eq('id', mat.material_id).single();
              if (matData) {
                const novoEstoque = matData.quantidade + mat.quantidade_utilizada;
                await supabase.from('estoque_materiais').update({ quantidade: novoEstoque }).eq('id', mat.material_id);
              }
            }
          }
        }

        // 2. Recalcular Total e Título
        const newTotal = newServices.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
        const newServiceTitle = newServices.map(s => s.nome).join(', ');

        const { error: updateError } = await supabase
          .from('ordens_servico')
          .update({
            servicos_detalhados: newServices,
            valor_total: newTotal,
            servico: newServiceTitle
          })
          .eq('id', osId);

        if (updateError) throw updateError;
        await fetchOrders();
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    }
    return { success: true };
  };

  const uploadOsPhoto = async (osId, file, fase = 'durante', angulo = 'livre') => {
    const validation = validateMediaUpload(file);
    if (!validation.valid) {
      return { success: false, error: { message: validation.error } };
    }

    if (hasRealConnection()) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${osId}/${Date.now()}_${fase}_${angulo}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. Upload para o Bucket 'os-photos'
        const { error: uploadError, data } = await supabase.storage
          .from('os-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Pegar URL Pública
        const { data: { publicUrl } } = supabase.storage
          .from('os-photos')
          .getPublicUrl(filePath);

        // 3. Salvar na Tabela 'os_midia' com suporte resiliente às colunas de fase e ângulo
        const payload = {
          os_id: osId,
          url: publicUrl,
          tipo: `${fase}:${angulo}`,
          fase_execucao: fase,
          angulo: angulo
        };

        let { error: dbError, data: insertData } = await supabase
          .from('os_midia')
          .insert(payload)
          .select()
          .single();

        // Se falhar porque o usuário ainda não rodou o script SQL com as colunas, faz fallback no campo 'tipo'
        if (dbError && (dbError.code === '42703' || dbError.message?.includes('does not exist') || dbError.message?.includes('column'))) {
          const fallbackPayload = {
            os_id: osId,
            url: publicUrl,
            tipo: `${fase}:${angulo}`
          };
          const res = await supabase.from('os_midia').insert(fallbackPayload).select().single();
          dbError = res.error;
          insertData = res.data;
        }

        if (dbError) throw dbError;

        return { success: true, url: publicUrl, data: insertData || { url: publicUrl, fase_execucao: fase, angulo: angulo } };
      } catch (error) {
        console.error('Erro no upload de foto:', error);
        return { success: false, error };
      }
    }
    return { success: true, url: URL.createObjectURL(file), data: { url: URL.createObjectURL(file), fase_execucao: fase, angulo: angulo, id: Date.now() } };
  };

  const fetchOsPhotos = async (osId) => {
    if (hasRealConnection()) {
      const { data, error } = await supabase
        .from('os_midia')
        .select('*')
        .eq('os_id', osId)
        .order('created_at', { ascending: false });
      
      const filtered = (data || []).filter(item => item.tipo !== 'assinatura' && item.fase_execucao !== 'assinatura').map(item => {
        let fase = item.fase_execucao || 'durante';
        let ang = item.angulo || 'livre';
        if ((!item.fase_execucao || !item.angulo) && item.tipo && item.tipo.includes(':')) {
          const parts = item.tipo.split(':');
          fase = parts[0] || 'durante';
          ang = parts[1] || 'livre';
        }
        return {
          ...item,
          fase_execucao: fase,
          angulo: ang
        };
      });

      return { success: !error, data: filtered, error };
    }
    return { success: true, data: [] };
  };

  const deleteOsPhoto = async (photoId, url) => {
    if (hasRealConnection()) {
      try {
        if (url && url.includes('os-photos/')) {
          const filePath = url.split('os-photos/')[1];
          if (filePath) {
            await supabase.storage.from('os-photos').remove([filePath]);
          }
        }
        const { error } = await supabase.from('os_midia').delete().eq('id', photoId);
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Erro ao excluir foto:', error);
        return { success: false, error };
      }
    }
    return { success: true };
  };

  const updateOrderServices = async (osId, newServices, newTotal) => {
    if (hasRealConnection()) {
      try {
        const { error } = await supabase
          .from('ordens_servico')
          .update({
            servicos_detalhados: newServices,
            valor_total: newTotal,
            servico: newServices.map(s => s.nome).join(', ')
          })
          .eq('id', osId);

        if (error) throw error;
        await fetchOrders();
        return { success: true };
      } catch (error) {
        console.error('Erro ao atualizar serviços da OS:', error);
        return { success: false, error };
      }
    }
    return { success: true };
  };

  return { orders, loading, fetchOrders, updateOrderProgress, saveOrderChecklist, deliverOrder, registerPayment, deletePayment, removeServiceFromOrder, uploadOsPhoto, fetchOsPhotos, deleteOsPhoto, updateOrderServices };
};

