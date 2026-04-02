import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, User, Car, Loader2 } from 'lucide-react';
import { useOrders, useQuotes } from '../hooks/useData';
import NovoOrcamentoModal from '../components/features/NovoOrcamentoModal';
import AgendamentoModal from '../components/features/AgendamentoModal';
import { getStatusStyle } from '../utils/statusUtils';

const AgendaView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { orders, loading, fetchOrders } = useOrders();
  const { saveQuote, approveQuote } = useQuotes();
  
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [selectedOS, setSelectedOS] = useState(null);

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Helper properties per month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleDayClick = (day) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  // Função utilitária para comparação de datas segura (ignora horário)
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  };

  // Filtra agendamentos reais da lista de OS para o dia selecionado
  const agendamentos = orders
    .filter(os => {
       if (!['AGUARDANDO', 'EM EXECUÇÃO', 'CONCLUÍDO', 'ENTREGUE'].includes(os.status)) return false;
       return isSameDay(os.data_agendamento, currentDate);
    })
    .sort((a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento));


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Sincronizando Agenda...</p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6 pb-20">
      {/* Header Agenda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button onClick={handlePrevMonth} className="p-3 hover:bg-slate-50 transition-colors border-r border-slate-100 text-slate-400"><ChevronLeft size={18} /></button>
            <div className="px-6 py-2 font-black text-xs text-slate-700 min-w-[160px] text-center uppercase tracking-widest">
              {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <button onClick={handleNextMonth} className="p-3 hover:bg-slate-50 transition-colors border-l border-slate-100 text-slate-400"><ChevronRight size={18} /></button>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Hoje</button>
        </div>
        <button onClick={() => setShowNovoModal(true)} className="btn-primary shadow-xl shadow-primary/20 flex items-center gap-2">
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Calendário Lateral (Simplificado/Estético) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium p-6 border-0 shadow-xl shadow-slate-200/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Selecione o Dia</h3>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {diasSemana.map(d => <span key={d} className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">{d}</span>)}
              
              {/* Células vazias do início do mês */}
              {Array.from({ length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}

              {/* Dias do mês */}
              {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                const day = i + 1;
                const dDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const isSelected = day === currentDate.getDate();
                const isToday = isSameDay(dDate, new Date());
                
                // Busca se há agendamentos para este dia específico para mostrar um indicador
                const dayAgendamentos = orders.filter(os => 
                  ['AGUARDANDO', 'EM EXECUÇÃO'].includes(os.status) && 
                  isSameDay(os.data_agendamento, dDate)
                );

                return (
                  <button 
                    key={i} 
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square text-xs font-black rounded-xl flex flex-col items-center justify-center transition-all relative ${
                      isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10' 
                      : isToday ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' 
                      : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span>{day}</span>
                    {dayAgendamentos.length > 0 && !isSelected && (
                      <div className="absolute bottom-1.5 flex gap-0.5">
                        {dayAgendamentos.slice(0, 3).map((_, idx) => (
                          <div key={idx} className="w-1 h-1 bg-primary rounded-full"></div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-premium p-6 bg-primary text-white border-0 shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">Próxima OS</h4>
               {agendamentos.length > 0 ? (
                 <>
                   <p className="font-black text-xl py-2 italic tracking-tighter uppercase">{agendamentos[0].cliente_nome}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-90">{agendamentos[0].veiculo_desc} • {agendamentos[0].servico}</p>
                 </>
               ) : (
                 <p className="font-black text-lg py-2 uppercase tracking-tighter opacity-60">Nenhuma OS pendente</p>
               )}
            </div>
            <Clock className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12" />
          </div>
        </div>

        {/* Timeline do Dia Selecionado */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Agenda de Produção</h3>
            <span className="text-[10px] font-black text-primary uppercase bg-primary/5 px-3 py-1 rounded-full">{agendamentos.length} Serviços</span>
          </div>
          
          {agendamentos.map((item) => {
            const timeString = new Date(item.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return (
            <div key={item.id} className="card-premium p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-slate-50/50 border-0 shadow-lg shadow-slate-200/40 transition-all hover:translate-x-1">
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center justify-center min-w-[70px] border-r border-slate-100 pr-6">
                  <span className="text-xl font-black text-slate-800 tracking-tighter font-mono">{timeString}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Início</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-primary" />
                    <span className="text-base font-black text-slate-800 tracking-tight uppercase italic">{item.cliente_nome}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Car size={16} className="text-slate-400" />
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">{item.veiculo_desc} • <span className="text-primary font-black">{item.servico}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(item.status)}`}>
                  {item.status}
                </span>
                <button 
                  onClick={() => { setSelectedOS(item); setShowAgendaModal(true); }}
                  className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                >
                  Alterar Agenda
                </button>
              </div>
            </div>
            );
          })}

          {agendamentos.length === 0 && (
            <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
               <Clock size={48} className="mx-auto mb-4" />
               <p className="font-black uppercase tracking-widest text-xs">Sem serviços agendados para hoje</p>
            </div>
          )}

          {/* Adicionar Horário */}
          <button onClick={() => setShowNovoModal(true)} className="w-full py-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-3 group">
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Novo Registro na Agenda</span>
          </button>
        </div>
      </div>
      
      {showNovoModal && (
         <NovoOrcamentoModal 
           onClose={() => setShowNovoModal(false)}
           onSave={saveQuote}
           defaultStatus="AGUARDANDO"
           defaultDate={currentDate}
           existingOrders={orders}
         />
      )}

      {showAgendaModal && selectedOS && (
         <AgendamentoModal 
           quote={selectedOS}
           onClose={() => setShowAgendaModal(false)}
           onConfirm={async (data) => {
              const res = await approveQuote(data);
              if (res.success) {
                  setShowAgendaModal(false);
                  fetchOrders();
              }
           }}
         />
      )}
    </div>
  );
};

export default AgendaView;
