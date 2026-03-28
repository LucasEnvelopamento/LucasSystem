import React, { useState } from 'react';
import { X, Calendar, Clock, User, Save, Bell } from 'lucide-react';
import { useProfiles, useOrders } from '../../hooks/useData';

const AgendamentoModal = ({ quote, onClose, onConfirm }) => {
  const { profiles, loading: loadingProfiles } = useProfiles();
  const { orders } = useOrders(); // Para ver conflitos
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filtra ordens agendadas para o dia selecionado
  const conflitosDoDia = (orders || []).filter(os => {
    if (!data || !os.data_agendamento) return false;
    const dateStr = new Date(os.data_agendamento).toISOString().split('T')[0];
    return dateStr === data;
  });

  const handleConfirm = async () => {
    if (!data || !hora) {
      alert('Data e Hora são obrigatórias');
      return;
    }
    
    setIsSaving(true);
    // Combina data e hora para formatar como timestamp
    const dataAgendamento = new Date(`${data}T${hora}:00`).toISOString();
    
    await onConfirm({
      id: quote.id,
      data_agendamento: dataAgendamento,
      tecnico_id: tecnicoId || null,
      status: 'AGUARDANDO' // Move de ORCAMENTO para AGUARDANDO (Agenda)
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg flex flex-col overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh]">
        {/* Header Fixo */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Agendar Serviço</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Defina a data e o técnico responsável.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
            <X size={24} className="text-slate-300 hover:text-slate-800" />
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-xs text-slate-500">
            <strong>Orçamento #{quote.id}:</strong> {quote.veiculo_desc} - {quote.cliente_nome}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Início</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
              <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="time" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Técnico Responsável (Opcional)</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm appearance-none"
                value={tecnicoId}
                onChange={(e) => setTecnicoId(e.target.value)}
              >
                <option value="">Selecione um colaborador...</option>
                {profiles.map(p => {
                  const displayName = (p.nome && p.nome.includes('@')) || !p.nome 
                    ? p.email.split('@')[0].split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                    : p.nome;
                  return <option key={p.id} value={p.id}>{displayName}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Visão de Conflitos */}
          {data && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Bell size={12} className="text-amber-500" /> Ocupação em {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}
              </h4>
              {conflitosDoDia.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {conflitosDoDia.map(os => (
                    <div key={os.id} className="flex items-center justify-between text-[10px] bg-white p-2 rounded-lg border border-slate-100 italic">
                      <span className="font-bold text-slate-700">
                        {new Date(os.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-slate-500 truncate ml-2 flex-1">{os.veiculo_desc} ({os.cliente_nome})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-emerald-600 font-bold italic">Nenhum serviço agendado para este dia.</p>
              )}
            </div>
          )}
        </div>

        {/* Rodapé Fixo */}
        <div className="p-8 border-t border-slate-50 shrink-0 bg-white">
          <button 
            onClick={handleConfirm}
            disabled={isSaving}
            className="w-full py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><Save size={18} /> Confirmar Agendamento e Aprovar</>
            )}
          </button>
          <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
             <Bell size={10} /> O status mudará automaticamente para 'AGUARDANDO'
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgendamentoModal;
