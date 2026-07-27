/**
 * Utility for generating iCalendar (.ics) files and direct web calendar links
 * (Google Calendar, Apple Calendar, Outlook, Yahoo)
 */

// Formata data ISO ou objeto Date para o formato UTC do iCal: YYYYMMDDTHHMMSSZ
const formatIcalDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Escapa caracteres especiais para o formato do iCalendar (RFC 5545)
const escapeIcalText = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
};

/**
 * Gera uma string VCALENDAR (.ics) contendo um ou mais eventos
 * @param {Array|Object} events - Um objeto de evento ou array de eventos
 * @param {string} calendarName - Nome do calendário (padrão: "OsSystem Agenda")
 * @returns {string} String formatada no padrão iCalendar
 */
export const generateIcsString = (events, calendarName = 'OsSystem Agenda Automotiva') => {
  const eventsList = Array.isArray(events) ? events : [events];
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OsSystem PWA//Automotive Management//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcalText(calendarName)}`,
    'X-WR-TIMEZONE:America/Sao_Paulo'
  ];

  eventsList.forEach((ev, idx) => {
    if (!ev.start) return;
    
    const startDate = new Date(ev.start);
    // Se end não for informado, define duração padrão de 2 horas
    const endDate = ev.end ? new Date(ev.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const dtStart = formatIcalDate(startDate);
    const dtEnd = formatIcalDate(endDate);
    const dtStamp = formatIcalDate(new Date());
    const uid = ev.id ? `os-${ev.id}-${dtStamp}@ossystem.app` : `event-${idx}-${dtStamp}@ossystem.app`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeIcalText(ev.title || 'Agendamento Automotivo')}`,
      `DESCRIPTION:${escapeIcalText(ev.description || 'Serviço automotivo agendado no OsSystem.')}`,
      `LOCATION:${escapeIcalText(ev.location || 'Loja de Estética Automotiva')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
};

/**
 * Cria um arquivo blob .ics e dispara o download automático no navegador
 * @param {string} filename - Nome do arquivo (ex: 'agenda-loja.ics')
 * @param {string} icsContent - Conteúdo gerado por generateIcsString
 */
export const downloadIcsFile = (filename = 'agendamento.ics', icsContent) => {
  if (!icsContent) return;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Gera URL direta do Google Calendar para adição em 1 clique
 * @param {Object} ev - { title, start, end, description, location }
 * @returns {string} URL formatada para o Google Calendar
 */
export const getGoogleCalendarUrl = (ev) => {
  if (!ev || !ev.start) return '#';
  
  const startDate = new Date(ev.start);
  const endDate = ev.end ? new Date(ev.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  // O formato do Google Calendar usa datas em UTC sem hifens ou dois pontos: YYYYMMDDTHHMMSSZ
  const datesStr = `${formatIcalDate(startDate)}/${formatIcalDate(endDate)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title || 'Agendamento Automotivo',
    dates: datesStr,
    details: ev.description || '',
    location: ev.location || '',
    sprop: 'website:ossystem.app'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Gera URL direta do Outlook / Microsoft 365 para adição em 1 clique
 * @param {Object} ev - { title, start, end, description, location }
 * @returns {string} URL formatada
 */
export const getOutlookCalendarUrl = (ev) => {
  if (!ev || !ev.start) return '#';
  
  const startDate = new Date(ev.start);
  const endDate = ev.end ? new Date(ev.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: ev.title || 'Agendamento Automotivo',
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: ev.description || '',
    location: ev.location || ''
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Formata um agendamento do banco (ordens_servico) para a estrutura do calendarUtils
 * @param {Object} os - Ordem de serviço do banco
 * @param {string} shopName - Nome da loja (brand.name)
 * @returns {Object} Objeto ev estruturado
 */
export const formatOrderForCalendar = (os, shopName = 'Estética Automotiva') => {
  if (!os) return null;
  
  const clienteNome = os.clientes?.nome || os.cliente_nome || 'Cliente VIP';
  const clienteTel = os.clientes?.telefone || os.cliente_telefone || 'Não informado';
  const veiculoDesc = os.veiculos ? `${os.veiculos.marca || ''} ${os.veiculos.modelo || ''}`.trim() : (os.veiculo_desc || 'Veículo');
  const placa = os.veiculos?.placa || os.placa || 'SEM PLACA';
  
  const title = `🚗 OS #${os.id} - ${veiculoDesc} (${placa}) - ${shopName}`;
  
  const description = 
    `📌 Serviço: ${os.servico || 'Manutenção Automotiva'}\n` +
    `👤 Cliente: ${clienteNome} | Tel/WhatsApp: ${clienteTel}\n` +
    `💰 Valor Estimado: R$ ${Number(os.valor_total || 0).toFixed(2)}\n` +
    `📋 Status: ${os.status || 'Agendado'}\n` +
    `${os.observacoes ? '\n📝 Observações:\n' + os.observacoes : ''}\n\n` +
    `🌐 Agendado via OsSystem — Gestão Automotiva Inteligente.`;

  return {
    id: os.id,
    title,
    start: os.data_agendamento || os.created_at,
    description,
    location: shopName
  };
};

/**
 * Exporta toda a agenda futura (ou ativa) da loja para um arquivo .ics único
 * @param {Array} orders - Lista completa de ordens
 * @param {string} shopName - Nome da loja
 */
export const exportShopAgendaIcs = (orders = [], shopName = 'Estética Automotiva') => {
  const agendamentos = orders
    .filter(o => o.data_agendamento && ['AGUARDANDO', 'ORCAMENTO', 'EM EXECUÇÃO', 'EM_ANDAMENTO'].includes(o.status))
    .map(o => formatOrderForCalendar(o, shopName))
    .filter(Boolean);

  if (agendamentos.length === 0) return 0;

  const icsString = generateIcsString(agendamentos, `Agenda ${shopName}`);
  const dataHoje = new Date().toISOString().split('T')[0];
  downloadIcsFile(`Agenda-${shopName.replace(/\s+/g, '-')}-${dataHoje}.ics`, icsString);
  return agendamentos.length;
};
