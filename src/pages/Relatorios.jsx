import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  Search, 
  TrendingUp, 
  Users, 
  Wrench,
  FileText,
  User,
  Car
} from 'lucide-react';
import { useOrders, useProfiles } from '../hooks/useData';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Relatorios = () => {
  const { orders, loading: ordersLoading } = useOrders();
  const { profiles, loading: profilesLoading } = useProfiles();
  
  // Estados de Filtro
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica de Filtragem e Agregação
  const filteredData = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(os => {
      const osDate = parseISO(os.data_agendamento || os.created_at);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      const inInterval = isWithinInterval(osDate, { start, end });
      const matchesSearch = 
        os.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.servico?.toLowerCase().includes(searchTerm.toLowerCase());
        
      return inInterval && matchesSearch;
    });
  }, [orders, startDate, endDate, searchTerm]);

  // Estatísticas do Período
  const stats = useMemo(() => {
    const total = filteredData.reduce((acc, os) => acc + (Number(os.valor_total) || 0), 0);
    const count = filteredData.length;
    const finishedCount = filteredData.filter(os => ['CONCLUÍDO', 'ENTREGUE'].includes(String(os.status).toUpperCase())).length;
    const ticketMedio = count > 0 ? total / count : 0;
    
    return { total, count, finishedCount, ticketMedio };
  }, [filteredData]);

  // Performance por Técnico
  const technicianPerformance = useMemo(() => {
    if (!profiles || !filteredData) return [];
    
    const technicians = (profiles || []).filter(p => p.cargo === 'OPERADOR' || p.cargo === 'ADM');
    
    return technicians.map(tech => {
      const techOrders = filteredData.filter(os => os.tecnico_id === tech.id);
      const totalValue = techOrders.reduce((acc, os) => acc + (Number(os.valor_total) || 0), 0);
      return {
        nome: tech.nome || tech.email?.split('@')[0],
        count: techOrders.length,
        totalValue
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
  }, [profiles, filteredData]);

  const handlePrint = () => {
    window.print();
  };

  if (ordersLoading || profilesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header e Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Relatórios</h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <BarChart3 size={14} className="text-primary" /> Inteligência de Negócio e Histórico
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
             <div className="flex items-center gap-2 px-3 py-2">
                <Calendar size={14} className="text-slate-400" />
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs font-bold text-slate-600 outline-none bg-transparent"
                />
             </div>
             <div className="h-4 w-[1px] bg-slate-100 mx-1"></div>
             <div className="flex items-center gap-2 px-3 py-2">
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs font-bold text-slate-600 outline-none bg-transparent"
                />
             </div>
          </div>

          <button 
            onClick={handlePrint}
            className="btn-premium py-2.5 px-5 bg-slate-800 text-white flex items-center gap-2"
          >
            <Printer size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        <div className="card-premium p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <TrendingUp size={20} />
             </div>
             <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">FREQUÊNCIA MENSAL</span>
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Faturamento Bruto</h3>
          <p className="text-2xl font-black text-slate-800 italic">R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="card-premium p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Wrench size={20} />
             </div>
             <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">EXECUTADOS</span>
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total de Serviços</h3>
          <p className="text-2xl font-black text-slate-800 italic">{stats.count}</p>
        </div>

        <div className="card-premium p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <FileText size={20} />
             </div>
             <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">CONVERSÃO</span>
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ticket Médio</h3>
          <p className="text-2xl font-black text-slate-800 italic">R$ {stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="card-premium p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Users size={20} />
             </div>
             <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">CONCLUÍDOS</span>
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Eficiência Equipe</h3>
          <p className="text-2xl font-black text-slate-800 italic">{stats.finishedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         
         {/* Performance de Técnicos */}
         <div className="card-premium p-8 no-print">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-3">
               <Users size={20} className="text-primary" /> Performance da Equipe
            </h3>
            <div className="space-y-6">
              {technicianPerformance.map((tech, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="truncate max-w-[150px]">{tech.nome}</span>
                    <span className="text-slate-800">R$ {tech.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(tech.totalValue / (stats.total || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase text-right">{tech.count} serviços concluídos</p>
                </div>
              ))}
              {technicianPerformance.length === 0 && (
                <p className="text-[10px] text-center text-slate-400 italic py-8">Nenhum dado de produtividade no período.</p>
              )}
            </div>
         </div>

         {/* Relatório Detalhado (Tabela) */}
         <div className="lg:col-span-2 card-premium p-0 overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
               <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-1 flex items-center gap-3">
                     <FileText size={20} className="text-primary" /> Relatório Detalhado de Serviços
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lista completa para auditoria e conferência</p>
               </div>
               <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="BUSCAR CLIENTE OU PLACA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
               </div>
            </div>

            {/* View de Impressão (Só aparece no print ou no desktop) */}
            <div className="print:block flex-1 overflow-x-auto relative">
               <table className="w-full text-left border-collapse min-w-[700px]">
                 <thead>
                   <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Veículo / Placa</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviço</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {filteredData.map((os) => (
                     <tr key={os.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-4">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-tighter">
                            {os.data_agendamento ? format(parseISO(os.data_agendamento), 'dd/MM/yyyy') : format(parseISO(os.created_at), 'dd/MM/yyyy')}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <User size={12} className="text-slate-300" />
                             <span className="text-[11px] font-black text-slate-700 uppercase truncate max-w-[120px]" title={os.cliente_nome}>
                               {os.cliente_nome}
                             </span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">{os.veiculo_desc}</span>
                             <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                <Car size={10} /> {os.placa || 'S/ PLACA'}
                             </span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase italic line-clamp-1 max-w-[180px]">
                            {os.servico || 'Serviços Gerais'}
                          </span>
                       </td>
                       <td className="px-8 py-4 text-right">
                          <span className="text-xs font-black text-slate-800 italic">
                            R$ {Number(os.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                       </td>
                     </tr>
                   ))}
                   {filteredData.length === 0 && (
                     <tr>
                       <td colSpan="5" className="py-20 text-center opacity-20 no-print">
                         <BarChart3 size={48} className="mx-auto mb-4" />
                         <p className="text-xs font-black uppercase tracking-widest">Nenhum serviço encontrado neste período</p>
                       </td>
                     </tr>
                   )}
                 </tbody>
                 {filteredData.length > 0 && (
                   <tfoot className="bg-slate-50/30 border-t border-slate-100">
                      <tr>
                        <td colSpan="4" className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Total Acumulado</td>
                        <td className="px-8 py-6 text-sm font-black text-primary italic text-right whitespace-nowrap">
                          R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                   </tfoot>
                 )}
               </table>
            </div>

            {/* Estilo para Impressão */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * { visibility: hidden; }
                .print\\:block, .print\\:block * { visibility: visible; }
                .print\\:block { 
                  position: absolute; 
                  left: 0; 
                  top: 0; 
                  width: 100%; 
                  background: white;
                }
                .no-print { display: none !important; }
                table { width: 100%; border: 1px solid #e2e8f0; }
                th, td { border-bottom: 1px solid #e2e8f0; font-size: 10pt !important; }
                .shadow-none-print { box-shadow: none !important; }
              }
            `}} />
         </div>
      </div>

    </div>
  );
};

export default Relatorios;
