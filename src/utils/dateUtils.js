/**
 * Utilitários de Data para prevenir o Bug de Timezone (UTC) do JavaScript.
 * Garante que datas salvas no Supabase ou ISOs não retrocedam um dia 
 * ao serem exibidas no fuso horário local (ex: pt-BR).
 */

/**
 * Converte de forma segura uma string ou objeto Date para o formato DD/MM/YYYY local.
 * Impede o recuo de -3 horas de datas YYYY-MM-DD.
 * 
 * @param {string|Date} dateInput Data a ser formatada
 * @param {boolean} includeTime Se verdadeiro, inclui HH:MM
 * @returns {string} String formatada
 */
export const formatDateBR = (dateInput, includeTime = false) => {
  if (!dateInput) return '--/--/----';
  
  let date;
  
  if (typeof dateInput === 'string') {
    // Se a string for exata 'YYYY-MM-DD', forçamos o horário T12:00:00 (Meio-dia)
    // Isso evita que o fuso horário BR retorne a data para as 21h do dia anterior
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = new Date(`${dateInput}T12:00:00`);
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return '--/--/----';

  if (includeTime) {
    return date.toLocaleString('pt-BR', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  });
};

/**
 * Converte de forma segura uma string ou objeto Date para o formato apenas de Hora (HH:MM).
 * 
 * @param {string|Date} dateInput Data a ser extraída a hora
 * @returns {string} String formatada de hora
 */
export const formatTimeBR = (dateInput) => {
  if (!dateInput) return '--:--';
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '--:--';

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit', 
    minute: '2-digit'
  });
};

/**
 * Normaliza qualquer data string para um objeto Date seguro, forçando meio-dia se for YYYY-MM-DD.
 * Útil para comparações.
 */
export const normalizeDate = (dateInput) => {
  if (!dateInput) return new Date();
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(`${dateInput}T12:00:00`);
  }
  return new Date(dateInput);
};
