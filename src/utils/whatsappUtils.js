/**
 * Utilitário para integração rápida com WhatsApp via Deep Links
 */

export const formatWhatsAppLink = (phone, message) => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  // Adiciona código do país se não houver
  const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${finalPhone}?text=${encodedMessage}`;
};

export const getBudgetMsg = (cliente, veiculo, valor, servicosDetalhados = [], servicoFallback = '') => {
  let listaServicos = '';

  if (servicosDetalhados && Array.isArray(servicosDetalhados) && servicosDetalhados.length > 0) {
    servicosDetalhados.forEach(s => {
      listaServicos += `${s.nome} - R$ ${Number(s.preco_base).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    });
  } else {
    // Para orçamentos legados
    listaServicos = `${servicoFallback} (Verifique valores individualmente no PDF)\n`;
  }

  return `Olá ${cliente}! 
Concluímos o orçamento para seu veículo *${veiculo}*.

*SERVIÇOS SELECIONADOS:*
${listaServicos}
*Total dos serviços R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*

Podemos agendar a execução do serviço?`;
};

export const getFinishedMsg = (cliente, veiculo) => {
  return `Olá ${cliente}! 👋
Boas notícias! O serviço no seu veículo *${veiculo}* foi concluído com sucesso. ✅

Seu veículo já está pronto para retirada. Aguardamos você!`;
};

export const getServiceFinishedMsg = (cliente, veiculo, osId) => {
  return `Olá ${cliente}! 👋
Temos ótimas notícias: o serviço no seu *${veiculo}* foi concluído com sucesso! ✅

Seu veículo já está pronto para retirada. Também geramos seu *Certificado de Garantia Digital* que você poderá visualizar em nosso sistema.

Acesse o resumo e o status final pelo link:
${window.location.origin}/status/${osId}

Até breve!`;
};

export const getAppointmentMsg = (cliente, data, hora, servico) => {
  return `Olá ${cliente}! 👋
Passando para confirmar seu agendamento no dia *${data}* às *${hora}* para o serviço de *${servico}*.

Podemos confirmar?`;
};

export const getVehicleReceivedMsg = (cliente, veiculo, osId) => {
  return `Olá ${cliente}! 🚗
Veículo *${veiculo}* recebido com sucesso na loja e checklist visual assinado!

A partir de agora, você pode acompanhar a execução dos nossos serviços em tempo real através do seu painel exclusivo:
${window.location.origin}/status/${osId}

Qualquer novidade avisaremos por aqui.`;
};

export const sendWhatsApp = (phone, message) => {
  if (!phone) {
    alert('Telefone do cliente não cadastrado.');
    return;
  }
  const link = formatWhatsAppLink(phone, message);
  window.open(link, '_blank');
};
