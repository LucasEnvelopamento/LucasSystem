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

// Funções Utilitárias Nativas
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
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
  
  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getEndOfMonth());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('TODOS');
  const [hideValues, setHideValues] = useState(false);

  const serviceOptions = useMemo(() => {
    if (!orders) return [];
    const unique = [...new Set(orders.map(os => os.servico || 'Serviços Gerais'))];
    return ['TODOS', ...unique.sort()];
  }, [orders]);

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

  const stats = useMemo(() => {
    const total = filteredData.reduce((acc, os) => acc + (Number(os.valor_total) || 0), 0);
    const count = filteredData.length;
    const finishedCount = filteredData.filter(os => 
      ['CONCLUÍDO', 'ENTREGUE'].includes(String(os.status || '').toUpperCase())
    ).length;
    return { total, count, finishedCount, ticketMedio: count > 0 ? total / count : 0 };
  }, [filteredData]);

  const technicianPerformance = useMemo(() => {
    if (!profiles || !filteredData) return [];
    const technicians = (profiles || []).filter(p => ['OPERADOR', 'ADM', 'GESTOR'].includes(String(p.cargo || '').toUpperCase()));
    return technicians.map(tech => {
      const techOrders = filteredData.filter(os => os.tecnico_id === tech.id);
      const totalValue = techOrders.reduce((acc, os) => acc + (Number(os.valor_total) || 0), 0);
      return { nome: tech.nome || tech.email?.split('@')[0], count: techOrders.length, totalValue };
    }).filter(t => t.count > 0).sort((a, b) => b.totalValue - a.totalValue);
  }, [profiles, filteredData]);

  const servicePerformance = useMemo(() => {
    const services = {};
    filteredData.forEach(os => {
      const name = os.servico || 'Serviços Gerais';
      if (!services[name]) services[name] = { total: 0, count: 0 };
      services[name].total += Number(os.valor_total) || 0;
      services[name].count += 1;
    });
    return Object.entries(services).map(([nome, data]) => ({ nome, ...data })).sort((a, b) => b.total - a.total);
  }, [filteredData]);

  if (ordersLoading || profilesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 font-black">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Sincronizando Dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 fade-in">
      
      {/* Header Página (Desktop Only) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-primary/5 text-primary rounded-[1.5rem] flex items-center justify-center border border-primary/10">
              <BarChart3 size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Relatórios</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Inteligência Estratégica de Negócio</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-1 shadow-inner">
             <div className="flex items-center gap-2 px-3 py-2 border-r border-slate-200">
                <Wrench size={12} className="text-primary" />
                <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="text-[10px] font-black text-slate-600 outline-none bg-transparent uppercase max-w-[120px]">
                  {serviceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
             </div>
             <div className="flex items-center gap-2 px-3 py-2 border-r border-slate-200">
                <Calendar size={12} className="text-primary" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-[10px] font-black text-slate-600 outline-none bg-transparent uppercase"/>
             </div>
             <div className="flex items-center gap-2 px-3 py-2">
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-[10px] font-black text-slate-600 outline-none bg-transparent uppercase"/>
             </div>
          </div>

          <label className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
            <input type="checkbox" checked={hideValues} onChange={(e) => setHideValues(e.target.checked)} className="w-4 h-4 rounded-lg border-2 border-slate-200 text-primary accent-primary"/>
            <span className="text-[10px] font-black uppercase text-slate-500">Ocultar Valores</span>
          </label>

          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 shadow-lg active:scale-95 no-print">
            <Printer size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI & Gráficos (Desktop Only) */}
      <div className="no-print space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Faturamento Bruto', value: `R$ ${stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'emerald' },
            { label: 'Total Serviços', value: stats.count, icon: Wrench, color: 'blue' },
            { label: 'Ticket Médio', value: `R$ ${stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: FileText, color: 'amber' },
            { label: 'Finalizados', value: stats.finishedCount, icon: Users, color: 'indigo' }
          ].map((kpi, idx) => (
            <div key={idx} className={`card-premium p-6 border-b-4 border-b-${kpi.color}-500 shadow-sm`}>
               <div className={`w-10 h-10 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-2xl flex items-center justify-center mb-4`}>
                  <kpi.icon size={20} />
               </div>
               <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</h3>
               <p className="text-xl font-black text-slate-800 italic tracking-tighter truncate">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
           <div className="card-premium p-8 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 mb-8">
                 <Users size={18} className="text-primary" /> Performance Equipe
              </h3>
              <div className="space-y-6">
                {technicianPerformance.map((tech, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                      <span>{tech.nome}</span>
                      <span>R$ {tech.totalValue.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(tech.totalValue / (stats.total || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="card-premium p-8 bg-slate-900 text-white border-0 shadow-xl">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-tighter flex items-center gap-3 mb-8">
                 <TrendingUp size={18} className="text-emerald-400" /> Faturamento por Serviço
              </h3>
              <div className="space-y-6">
                {servicePerformance.map((serv, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                      <span>{serv.nome}</span>
                      <span className="text-emerald-400">R$ {serv.total.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${(serv.total / (stats.total || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* GRADE DE SERVIÇOS - ÁREA DE IMPRESSÃO PRINCIPAL */}
      <div id="audit-report" className="card-premium p-0 border border-slate-100 shadow-sm print:shadow-none print:border-0 print:p-0">
         
         {/* Cabeçalho que aparece no topo do GRID (Tanto na tela quanto no papel) */}
         <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/30 print:bg-transparent print:p-0 print:mb-8">
            <div>
               <h3 className="text-base font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 print:text-black print:text-xl">
                  <FileText size={20} className="text-primary no-print" /> Relatório Detalhado de Atividades
               </h3>
               {/* Informação do período para o papel */}
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 print:text-slate-600 print:text-xs">
                 Período: {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
               </p>
            </div>
            
            <div className="relative w-full sm:w-80 no-print">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="BUSCAR CLIENTE OU PLACA..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-[1.2rem] py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm"
               />
            </div>
         </div>

         {/* GRID DE DADOS (PAGINÁVEL NO PAPEL) */}
         <div className="overflow-x-auto print:overflow-visible custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px] print:min-w-full">
              <thead className="print:table-header-group">
                <tr className="bg-slate-50/80 border-b border-slate-100 print:bg-slate-200 print:border-b-2 print:border-black">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 print:text-black print:font-bold uppercase tracking-widest">Data OS</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 print:text-black print:font-bold uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 print:text-black print:font-bold uppercase tracking-widest">Veículo / Placa</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 print:text-black print:font-bold uppercase tracking-widest">Serviço Realizado</th>
                  {!hideValues && <th className="px-8 py-6 text-[10px] font-black text-slate-400 print:text-black print:font-bold uppercase tracking-widest text-right">Valor</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 print:divide-slate-300">
                {filteredData.map((os) => (
                  <tr key={os.id} className="hover:bg-slate-50/30 transition-colors print:page-break-inside-avoid">
                    <td className="px-8 py-5">
                       <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-[0.8rem] uppercase print:bg-transparent print:p-0 print:text-black">
                         {new Date(os.data_agendamento || os.created_at).toLocaleDateString('pt-BR')}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[11px] font-black text-slate-700 uppercase print:text-black">{os.cliente_nome}</span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-800 uppercase leading-none mb-1 print:text-black">{os.veiculo_desc}</span>
                          <span className="text-[10px] font-bold text-primary flex items-center gap-1 print:text-black">{os.placa || 'SEM PLACA'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[10px] font-bold text-slate-400 uppercase italic print:text-black">
                         {os.servico || 'Serviços Gerais'}
                       </span>
                    </td>
                    {!hideValues && (
                      <td className="px-8 py-5 text-right font-mono">
                        <span className="text-xs font-black text-slate-800 print:text-black">
                          R$ {Number(os.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {filteredData.length > 0 && !hideValues && (
                <tfoot className="bg-slate-50/50 border-t-2 border-slate-100 print:border-black print:table-footer-group">
                   <tr>
                     <td colSpan={4} className="px-8 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] text-right print:text-black">Faturamento Total do Período</td>
                     <td className="px-8 py-8 text-xl font-black text-primary italic text-right tracking-tighter print:text-black">
                       R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </td>
                   </tr>
                </tfoot>
              )}
            </table>
         </div>

         {/* ESTILO DE IMPRESSÃO DEFINITIVO (VISIBILIDADE CIRÚRGICA) */}
         <style dangerouslySetInnerHTML={{ __html: `
           @media print {
             @page { size: landscape; margin: 10mm; }
             
             /* 1. Esconder TUDO por padrão */
             body * { visibility: hidden !important; }
             
             /* 2. Mostrar APENAS o Relatório de Auditoria e seus filhos */
             #audit-report, #audit-report * { visibility: visible !important; }
             
             /* 3. Posicionar o Relatório no pixel (0,0) da folha */
             #audit-report { 
               position: absolute !important; 
               left: 0 !important; 
               top: 0 !important; 
               width: 100% !important; 
               padding: 0 !important;
               margin: 0 !important;
               border: none !important;
               box-shadow: none !important;
               display: block !important;
             }

             /* 4. Reset de Página e Tabelas */
             html, body { height: auto !important; overflow: visible !important; }
             table { 
               border-collapse: collapse !important; 
               width: 100% !important; 
               page-break-inside: auto !important; 
               margin-top: 5mm !important;
               table-layout: auto !important;
             }
             thead { display: table-header-group !important; }
             tr { page-break-inside: avoid !important; page-break-after: auto !important; border-bottom: 0.5pt solid #000 !important; }
             th, td { padding: 8px !important; border: 0.5pt solid #000 !important; font-size: 8pt !important; color: #000 !important; }
             
             /* Forçar quebra de página se necessário */
             .print-area { overflow: visible !important; display: block !important; }
           }
         `}} />
      </div>
    </div>
  );
};

export default Relatorios;
