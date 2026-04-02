export const getStatusStyle = (status) => {
  const s = String(status || '').toUpperCase();
  
  if (s.includes('ORCAMENTO') || s.includes('ORÇAMENTO')) {
    return 'bg-slate-100 text-slate-500 border-slate-200';
  }
  if (s.includes('APROVADO')) {
    // Aprovado no orçamento vira AGUARDANDO, mas se o status fixo for Aprovado:
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  }
  if (s.includes('PENDENTE')) {
    return 'bg-amber-50 text-amber-600 border-amber-100';
  }
  if (s.includes('REJEITADO') || s.includes('CANCELADO')) {
    return 'bg-rose-50 text-rose-600 border-rose-100';
  }
  if (s.includes('AGUARDA') || s.includes('AGENDADO')) {
    return 'bg-amber-100 text-amber-600 border-amber-200';
  }
  if (s.includes('EXECU')) {
    return 'bg-blue-100 text-blue-600 border-blue-200';
  }
  if (s.includes('CONCLU')) {
    return 'bg-purple-100 text-purple-600 border-purple-200';
  }
  if (s.includes('ENTREGUE')) {
    return 'bg-emerald-100 text-emerald-600 border-emerald-200';
  }
  if (s.includes('PAUSADO')) {
    return 'bg-orange-100 text-orange-600 border-orange-200';
  }

  return 'bg-slate-50 text-slate-600 border-slate-100';
};

export const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};
