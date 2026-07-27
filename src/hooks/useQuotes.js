import { useState, useEffect } from 'react';
import { supabase, hasRealConnection } from '../lib/supabase';

export const useQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    if (hasRealConnection()) {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*, clientes(nome, telefone), veiculos(modelo, marca, placa, ano), tecnico_ref:profiles!ordens_servico_tecnico_id_fkey(nome)')
        .in('status', ['ORCAMENTO', 'AGUARDANDO', 'EM EXECUÇÃO', 'CONCLUÍDO', 'ENTREGUE', 'CANCELADO'])
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setQuotes(data.map(q => {
          const veiculoObj = Array.isArray(q.veiculos) ? q.veiculos[0] : q.veiculos;
          const clienteObj = Array.isArray(q.clientes) ? q.clientes[0] : q.clientes;

          return {
            ...q,
            cliente_nome: clienteObj?.nome || 'Cliente',
            cliente_telefone: clienteObj?.telefone,
            veiculo_desc: veiculoObj ? `${veiculoObj.marca || ''} ${veiculoObj.modelo || ''} ${veiculoObj.ano ? '(' + veiculoObj.ano + ')' : ''}`.trim() || 'Veículo' : 'Veículo',
            placa: veiculoObj?.placa,
            valor: Number(q.valor_total) || 0,
            desconto: Number(q.desconto) || 0,
            tecnico: q.tecnico_ref?.nome || q.tecnico || 'Nenhum', // Prioriza o nome da tabela profiles
            valor_pago: Number(q.valor_pago) || 0,
            saldo_devedor: (Number(q.valor_total) || 0) - (Number(q.valor_pago) || 0),
            historico_pagamentos: q.historico_pagamentos || []
          };
        }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
    if (hasRealConnection()) {
      const channel = supabase
          .channel('quotes-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_servico' }, fetchQuotes)
          .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, []);

  const saveQuote = async (quoteData) => {
    if (hasRealConnection()) {
      const { data, error } = await supabase
        .from('ordens_servico')
        .insert([{ 
          ...quoteData, 
          status: quoteData.status || 'ORCAMENTO',
          created_at: new Date().toISOString() 
        }])
        .select();
      if (!error) await fetchQuotes();
      return { success: !error, error, data: data?.[0] };
    }
    return { success: true };
  };

  const approveQuote = async (appointmentData) => {
    if (hasRealConnection()) {
      const updates = { 
        status: 'AGUARDANDO',
        data_agendamento: appointmentData.data_agendamento,
        tecnico_id: appointmentData.tecnico_id,
        valor_total: appointmentData.valor_total, // Permite ajuste de preço na aprovação
        data_inicio: new Date().toISOString()
      };

      // Se houver adiantamento
      if (appointmentData.valor_pago_agora > 0) {
        updates.valor_pago = Number(appointmentData.valor_pago_agora);
        updates.historico_pagamentos = [{
          valor: Number(appointmentData.valor_pago_agora),
          metodo: appointmentData.metodo_pagamento || 'PIX',
          data: new Date().toISOString(),
          tipo: 'ADIANTAMENTO'
        }];
      }

      const { error } = await supabase
        .from('ordens_servico')
        .update(updates)
        .eq('id', appointmentData.id);
      if (!error) await fetchQuotes();
      return { success: !error, error };
    }
    return { success: true };
  };

  const registerPayment = async (osId, valor, metodo) => {
    if (hasRealConnection()) {
      try {
        const { error } = await supabase.rpc('registrar_pagamento_atomico', {
          p_os_id: osId,
          p_valor_recebido: Number(valor),
          p_metodo: metodo
        });

        if (error) throw error;

        await fetchQuotes();
        return { success: true };
      } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        return { success: false, error };
      }
    }
    return { success: true };
  };

  const deleteQuote = async (quoteId) => {
    if (hasRealConnection()) {
      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', quoteId);
      if (!error) await fetchQuotes();
      return { success: !error, error };
    }
    return { success: true };
  };

  const cancelQuote = async (quoteId) => {
    if (hasRealConnection()) {
      const { error } = await supabase
        .from('ordens_servico')
        .update({ status: 'CANCELADO' })
        .eq('id', quoteId);
      if (!error) await fetchQuotes();
      return { success: !error, error };
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
        await fetchQuotes();
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    }
    return { success: true };
  };

  const reopenQuote = async (quoteId) => {
    if (hasRealConnection()) {
      const { error } = await supabase
        .from('ordens_servico')
        .update({ 
          status: 'ORCAMENTO',
          data_agendamento: null,
          tecnico_id: null,
          data_inicio: null
        })
        .eq('id', quoteId);
      if (!error) await fetchQuotes();
      return { success: !error, error };
    }
    return { success: true };
  };

  const updateQuoteServices = async (quoteId, newServices, newTotal) => {
    if (hasRealConnection()) {
      try {
        const { error } = await supabase
          .from('ordens_servico')
          .update({
            servicos_detalhados: newServices,
            valor_total: newTotal,
            servico: newServices.map(s => s.nome).join(', ')
          })
          .eq('id', quoteId);

        if (error) throw error;
        await fetchQuotes();
        return { success: true };
      } catch (error) {
        console.error('Erro ao atualizar serviços do orçamento:', error);
        return { success: false, error };
      }
    }
    return { success: true };
  };

  return { quotes, loading, fetchQuotes, saveQuote, approveQuote, reopenQuote, deleteQuote, cancelQuote, registerPayment, deletePayment, updateQuoteServices };
};
