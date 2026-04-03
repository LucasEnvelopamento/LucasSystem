import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Printer, 
  Search, 
  TrendingUp, 
  Users, 
  Wrench,
  FileText,
  User,
  Car,
  ChevronDown
} from 'lucide-react';
import { useOrders, useProfiles } from '../hooks/useData';

// Funções Utilitárias Nativas (Substituindo date-fns)
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const getStartOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

const getEndOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
};

const isDateInInterval = (target, start, end) => {
  const t = new Date(target).setHours(0,0,0,0);
  const s = new Date(start).setHours(0,0,0,0);
  const e = new Date(end).setHours(23,59,59,999);
  return t >= s && t <= e;
};

const Relatorios = () => {
  const { orders, loading: ordersLoading } = useOrders();
  const { profiles, loading: profilesLoading } = useProfiles();
  
  // Estados de Filtro
  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getEndOfMonth());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('TODOS');
  const [hideValues, setHideValues] = useState(false);

  // Lista de Serviços Únicos para o Filtro
  const serviceOptions = useMemo(() => {
    if (!orders) return [];
    const unique = [...new Set(orders.map(os => os.servico || 'Serviços Gerais'))];
    return ['TODOS', ...unique.sort()];
  }, [orders]);

  // Lógica de Filtragem e Agregação
  const filteredData = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(os => {
      const osDate = os.data_agendamento || os.created_at;
      const inInterval = isDateInInterval(osDate, startDate, endDate);
      
      const matchesSearch = 
        os.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.servico?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesService = selectedService === 'TODOS' || os.servico === selectedService;
        
      return inInterval && matchesSearch && matchesService;
    });
  }, [orders, startDate, endDate, searchTerm, selectedService]);

  // Estatísticas do Período
  const stats = useMemo(() => {
    const total = filteredData.reduce((acc, os) => acc + (Number(os.valor_total) || 0), 0);
    const count = filteredData.length;
    const finishedCount = filteredData.filter(os => 
      ['CONCLUÍDO', 'ENTREGUE'].includes(String(os.status || '').toUpperCase())
    ).length;
    const ticketMedio = count > 0 ? total / count : 0;
    
    return { total, count, finishedCount, ticketMedio };
  }, [filteredData]);

  // Performance por Técnico (Agrupado por Valor e Quantidade)
  const technicianPerformance = useMemo(() => {
    if (!profiles || !filteredData) return [];
    
    const technicians = (profiles || []).filter(p => 
      ['OPERADOR', 'ADM', 'GESTOR'].includes(String(p.cargo || '').toUpperCase())
    );
    
    return technicians.map(tech => {
      const techOrders = filteredData.filter(os => os.tecnico_id === tech.id);
      const totalValue = techOrders.reduce((acc, os) => acc + (Number(os.valor_total) || 0), 0);
      return {
        nome: tech.nome || tech.email?.split('@')[0],
        count: techOrders.length,
        totalValue
      };
    }).filter(t => t.count > 0).sort((a, b) => b.totalValue - a.totalValue);
  }, [profiles, filteredData]);

  // Faturamento por Serviço (Agrupado por Nome do Serviço)
  const servicePerformance = useMemo(() => {
    const services = {};
    filteredData.forEach(os => {
      const name = os.servico || 'Serviços Gerais';
      if (!services[name]) services[name] = { total: 0, count: 0 };
      services[name].total += Number(os.valor_total) || 0;
      services[name].count += 1;
    });
    return Object.entries(services)
      .map(([nome, data]) => ({ nome, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [filteredData]);

  const handlePrint = () => {
    window.print();
  };

  if (ordersLoading || profilesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Relatórios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header e Filtros - Design Refinado */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-primary/5 text-primary rounded-[1.5rem] flex items-center justify-center border border-primary/10">
              <BarChart3 size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Inteligência Estratégica</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Visão geral de faturamento e produtividade</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-1 shadow-inner">
             <div className="flex items-center gap-2 px-3 py-2 border-r border-slate-200">
                <Wrench size={12} className="text-primary" />
                <select 
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="text-[10px] font-black text-slate-600 outline-none bg-transparent uppercase max-w-[120px]"
                >
                  {serviceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
             </div>
             
             <div className="flex items-center gap-2 px-3 py-2 border-r border-slate-200">
                <Calendar size={12} className="text-primary" />
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-[10px] font-black text-slate-600 outline-none bg-transparent uppercase"
                />
             </div>
             <div className="flex items-center gap-2 px-3 py-2">
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-[10px] font-black text-slate-600 outline-none bg-transparent uppercase"
                />
             </div>
          </div>

          <label className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all select-none">
            <input 
              type="checkbox" 
              checked={hideValues}
              onChange={(e) => setHideValues(e.target.checked)}
              className="w-4 h-4 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 accent-primary"
            />
            <span className="text-[10px] font-black uppercase text-slate-500">Ocultar Valores</span>
          </label>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 active:scale-95 no-print"
          >
            <Printer size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Grid Otimizado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print text-center sm:text-left">
        {[
          { label: 'Faturamento Bruto', value: `R$ ${stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'emerald', sub: 'Total no período' },
          { label: 'Serviços Realizados', value: stats.count, icon: Wrench, color: 'blue', sub: 'Volume de OS' },
          { label: 'Ticket Médio', value: `R$ ${stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FileText, color: 'amber', sub: 'Gasto médio / Cliente' },
          { label: 'Eficiência Equipe', value: stats.finishedCount, icon: Users, color: 'indigo', sub: 'OS Finalizadas' }
        ].map((kpi, idx) => (
          <div key={idx} className={`card-premium p-6 border-b-4 border-b-${kpi.color}-500 group hover:translate-y-[-4px] transition-all`}>
             <div className={`w-10 h-10 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={20} />
             </div>
             <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</h3>
             <p className="text-xl font-black text-slate-800 italic tracking-tighter truncate">{kpi.value}</p>
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Gráficos Gerenciais - Nova Disposição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
         
         {/* Gráfico 1: Performance Equipe */}
         <div className="card-premium p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                  <Users size={18} className="text-primary" /> Performance da Equipe
               </h3>
               <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Por Valor Gerado</span>
            </div>
            
            <div className="space-y-6">
              {technicianPerformance.map((tech, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span className="truncate max-w-[150px]">{tech.nome}</span>
                    <span className="text-slate-800">R$ {tech.totalValue.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 shadow-sm shadow-primary/20"
                      style={{ width: `${(tech.totalValue / (stats.total || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase text-right tracking-tighter">{tech.count} OS concluídas</p>
                </div>
              ))}
              {technicianPerformance.length === 0 && (
                <div className="py-12 text-center text-slate-300">
                  <Users size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem dados de produção</p>
                </div>
              )}
            </div>
         </div>

         {/* Gráfico 2: Faturamento por Serviço */}
         <div className="card-premium p-8 bg-slate-900 text-white border-0 shadow-2xl shadow-slate-900/10">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-black text-slate-100 uppercase tracking-tighter flex items-center gap-3">
                  <TrendingUp size={18} className="text-emerald-400" /> Faturamento por Serviço
               </h3>
               <span className="text-[9px] font-black text-slate-500 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">Rentabilidade</span>
            </div>
            
            <div className="space-y-6">
              {servicePerformance.map((serv, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span className="truncate max-w-[150px]">{serv.nome}</span>
                    <span className="text-emerald-400">R$ {serv.total.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                      style={{ width: `${(serv.total / (stats.total || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase">
                    <span>{((serv.total / (stats.total || 1)) * 100).toFixed(1)}% do total</span>
                    <span className="tracking-tighter">{serv.count} vendas</span>
                  </div>
                </div>
              ))}
              {servicePerformance.length === 0 && (
                <div className="py-12 text-center text-white/20">
                  <TrendingUp size={32} className="mx-auto mb-2 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem vendas registradas</p>
                </div>
              )}
            </div>
         </div>
      </div>

      {/* Tabela Detalhada - Largura Total */}
      <div className="card-premium p-0 overflow-hidden flex flex-col border border-slate-100">
         <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 no-print bg-slate-50/30">
            <div>
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-1 flex items-center gap-3">
                  <FileText size={20} className="text-slate-400" /> Relatório Detalhado de Atividades
               </h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Filtro dinâmico por período e busca</p>
            </div>
            <div className="relative w-full sm:w-80">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="BUSCAR CLIENTE OU PLACA..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-[1.2rem] py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
               />
            </div>
         </div>

         {/* View da Tabela com Scroll Horizontal Seguro */}
         <div className="print:block flex-1 overflow-x-auto custom-scrollbar relative">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm sticky top-0 z-10 no-print">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data OS</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Veículo / Placa</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviço Realizado</th>
                  {!hideValues && <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor Bruto</th>}
                </tr>
                {/* Header fixo para o print */}
                <tr className="hidden print:table-row">
                  <th colSpan="5" className="px-8 py-8 text-center">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Relatório de Serviços</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{formatDate(startDate)} até {formatDate(endDate)}</p>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((os) => (
                  <tr key={os.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                       <span className="text-[10px] font-black text-slate-500 bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary px-3 py-1.5 rounded-[0.8rem] uppercase tracking-tighter transition-all">
                         {new Date(os.data_agendamento || os.created_at).toLocaleDateString('pt-BR')}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[0.8rem] bg-slate-50 text-slate-400 flex items-center justify-center text-[10px] font-black border border-slate-100 group-hover:border-primary/20 group-hover:text-primary transition-all">
                             {os.cliente_nome?.charAt(0)}
                          </div>
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate max-w-[150px]">
                            {os.cliente_nome}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">{os.veiculo_desc}</span>
                          <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                             <Car size={10} className="opacity-50" /> {os.placa || 'PLACA NÃO INF.'}
                          </span>
                       </div>
                    </td>
                       <td className="px-6 py-5">
                       <span className="text-[10px] font-bold text-slate-400 uppercase italic line-clamp-1 max-w-[200px] group-hover:text-slate-600 transition-colors">
                         {os.servico || 'Serviços Gerais'}
                       </span>
                    </td>
                    {!hideValues && (
                      <td className="px-8 py-5 text-right font-mono">
                        <span className="text-xs font-black text-slate-800 italic">
                          R$ {Number(os.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-24 text-center opacity-10 no-print">
                      <BarChart3 size={64} className="mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-[0.4em]">Nenhum registro para exibir</p>
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredData.length > 0 && !hideValues && (
                <tfoot className="bg-slate-50/50 border-t-2 border-slate-100">
                   <tr>
                     <td colSpan="4" className="px-8 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Faturamento Total do Período</td>
                     <td className="px-8 py-8 text-xl font-black text-primary italic text-right whitespace-nowrap tracking-tighter">
                       R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </td>
                   </tr>
                </tfoot>
              )}
            </table>
         </div>

         {/* Estilo Customizado para Impressão e Responsividade */}
         <style dangerouslySetInnerHTML={{ __html: `
           @media print {
             @page { size: landscape; margin: 10mm; }
             body { background: white !important; }
             aside, nav, header, .no-print { display: none !important; }
             .print\\:block, table { visibility: visible !important; width: 100% !important; margin: 0 !important; }
             main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
             .card-premium { border: none !important; box-shadow: none !important; padding: 0 !important; }
             table { border-collapse: collapse; width: 100%; border: 1px solid #e2e8f0; }
             th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 8pt !important; }
             tfoot td { background: #f8fafc !important; border-top: 2px solid #cbd5e1; }
           }
           
           /* Scrollbar customizada para visual premium */
           .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
           .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
           .custom-scrollbar::-webkit-scrollbar-thumb { 
             background: #cbd5e1; 
             border-radius: 10px; 
           }
           .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
         `}} />
      </div>

    </div>
  );
};

export default Relatorios;
