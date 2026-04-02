import React, { useState } from 'react';
import { Users, TrendingUp, Clock, CheckCircle, ExternalLink, X, Calendar, User, Car, DollarSign, Activity } from 'lucide-react';
import { useOrders, useClients, useCatalog } from '../hooks/useData';
import { getStatusStyle, formatCurrency } from '../utils/statusUtils';

const StatCard = ({ icon: Icon, label, value, trend, color, loading }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="card-premium p-4 flex items-center gap-4 hover:scale-[1.02] transition-all duration-300">
      <div className={`p-3 rounded-xl ${colors[color] || colors.blue} shadow-sm shrink-0`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{label}</p>
        {loading ? (
          <div className="h-6 w-16 bg-slate-100 animate-pulse rounded-lg"></div>
        ) : (
          <h4 className="text-xl font-black text-slate-800 tracking-tight truncate">{value}</h4>
        )}
      </div>
    </div>
  );
};

const CategoryStat = ({ label, value, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
      <span className="text-slate-500">{label}</span>
      <span className="text-primary">{value}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { orders, loading: loadingOrders } = useOrders();
  const { clients, loading: loadingClients } = useClients();
  const { services, loading: loadingCatalog } = useCatalog();

  // Cálculos Padronizados com Vendas
  const ordensAtivas = (orders || []).filter(os => os && os.status !== 'ORCAMENTO' && os.status !== 'CANCELADO');
  
  const totalFaturamento = ordensAtivas.reduce((acc, os) => acc + (Number(os.valor_total) || 0), 0);

  const aguardando = ordensAtivas.filter(os => String(os.status || '').toUpperCase().includes('AGUARDA')).length;
  const emExecucao = ordensAtivas.filter(os => String(os.status || '').toUpperCase().includes('EXECU')).length;
  const concluidas = ordensAtivas.filter(os => String(os.status || '').toUpperCase().includes('CONCLU')).length;
  const entregues = ordensAtivas.filter(os => String(os.status || '').toUpperCase() === 'ENTREGUE').length;

  // Cálculo de Performance de Serviços Real (Baseado no total de serviços prestados)
  const performanceRaw = (services || [])
    .filter(s => s && s.nome)
    .map(service => {
      const count = ordensAtivas.filter(o => 
        o && o.servico && (
          o.servico === service.nome || 
          o.servico.split(', ').includes(service.nome)
        )
      ).length;
      return { label: service.nome, count };
    });

  const totalServicesCount = performanceRaw.reduce((acc, current) => acc + current.count, 0);

  const performanceData = performanceRaw
    .map(item => ({
      label: item.label,
      value: totalServicesCount > 0 ? Math.round((item.count / totalServicesCount) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value).slice(0, 6);

  return (
    <div className="fade-in space-y-8 pb-10">
      {/* Grid de KPIs Dinâmicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          icon={Users} 
          label="Total de Clientes" 
          value={(clients || []).length} 
          trend="Total na base" 
          color="blue" 
          loading={loadingClients} 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Fat. Convertido" 
          value={formatCurrency(totalFaturamento)} 
          trend="Soma de OS Aprovadas" 
          color="emerald" 
          loading={loadingOrders} 
        />
        <StatCard 
          icon={Clock} 
          label="Aguardando Início" 
          value={aguardando} 
          trend={`${emExecucao} em execução agora`} 
          color="amber" 
          loading={loadingOrders} 
        />
        <StatCard 
          icon={CheckCircle} 
          label="Concluídas" 
          value={concluidas} 
          trend="Aguardando entrega" 
          color="purple" 
          loading={loadingOrders} 
        />
        <StatCard 
          icon={ExternalLink} 
          label="Entregues" 
          value={entregues} 
          trend="Histórico para PDF" 
          color="blue" 
          loading={loadingOrders} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
        {/* Ordens Recentes Reais */}
        <div className="xl:col-span-2 card-premium p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 text-xl uppercase tracking-tight flex items-center gap-3">
              <Clock size={24} className="text-primary" /> Ordens Recentes
            </h3>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[450px] pr-4 custom-scrollbar overflow-x-hidden">
            {(ordensAtivas.length === 0 && !loadingOrders) && (
              <p className="text-center text-slate-400 py-10 font-bold uppercase tracking-widest text-xs">Nenhuma ordem em andamento</p>
            )}
            {ordensAtivas.slice(0, 6).map((os) => os && (
              <div 
                key={os.id} 
                onClick={() => setSelectedOrder(os)}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all px-4 rounded-2xl -mx-2 group gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                    OS#{os.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 leading-none mb-1 truncate">{os.cliente_nome}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                      {os.veiculo_desc} • <span className="text-slate-300">{os.servico || 'Não especificado'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-start sm:justify-end shrink-0">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(os.status)}`}>
                    {os.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desempenho Real (Performance de Serviços) */}
        <div className="card-premium p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 text-xl uppercase tracking-tight flex items-center gap-3">
              <TrendingUp size={24} className="text-primary" /> Performance de Serviços
            </h3>
          </div>
          
          <div className="space-y-8 mt-10">
            {loadingCatalog ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-slate-100 animate-pulse rounded-full"></div>
                ))}
              </div>
            ) : performanceData.length === 0 ? (
              <p className="text-center text-slate-400 py-10 font-bold uppercase tracking-widest text-xs">Nenhum serviço cadastrado no catálogo</p>
            ) : (
              (performanceData || []).map((item, idx) => {
                const colors = ['bg-primary', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-emerald-500'];
                return item && (
                  <CategoryStat 
                    key={idx} 
                    label={item.label} 
                    value={item.value} 
                    color={colors[idx % colors.length]} 
                  />
                );
              })
            )}
          </div>
          
          <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
              <strong>Nota:</strong> Dados baseados no mix de serviços criados no seu catálogo e registrados em OS.
            </p>
          </div>
        </div>
      </div>
      {/* Modal de Detalhes da Ordem */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Fixo */}
            <div className="p-8 bg-slate-900 flex items-center justify-between shrink-0 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Activity className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-xs tracking-widest leading-none mb-1">Detalhes da Ordem</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">OS #{selectedOrder.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-3 hover:bg-white/10 rounded-full transition-all group"
              >
                <X size={24} className="text-slate-500 group-hover:text-white" />
              </button>
            </div>

            {/* Conteúdo Rolável */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Seção Cliente/Veículo */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                    <User size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cliente</p>
                    <p className="text-sm font-black text-slate-800 truncate">{selectedOrder.cliente_nome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                    <Car size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Veículo</p>
                    <p className="text-sm font-black text-slate-800 truncate">{selectedOrder.veiculo_desc}</p>
                  </div>
                </div>
              </div>

              {/* Seção Info Execução */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Agendamento</span>
                  </div>
                  <p className="text-sm font-black text-blue-900 leading-none">
                    {selectedOrder.data_agendamento ? new Date(selectedOrder.data_agendamento).toLocaleDateString('pt-BR') : 'Sem data'}
                  </p>
                </div>

                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-amber-500" />
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Status</span>
                  </div>
                  <p className="text-sm font-black text-amber-900 leading-none uppercase truncate">
                    {selectedOrder.status}
                  </p>
                </div>
              </div>

              {/* Serviços Detalhados */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Detalhamento de Serviços</h4>
                <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                  <div className="p-6 space-y-4">
                    {selectedOrder.servicos_detalhados && Array.isArray(selectedOrder.servicos_detalhados) && selectedOrder.servicos_detalhados.length > 0 ? (
                      selectedOrder.servicos_detalhados.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center group/item">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/item:bg-primary transition-colors"></div>
                            <span className="text-sm font-bold text-slate-600">{s.nome}</span>
                          </div>
                          <span className="text-sm font-black text-slate-800 font-mono italic">
                            {formatCurrency(Number(s.preco_base || s.preco || s.valor || 0))}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                          <span className="text-sm font-bold text-slate-600">{selectedOrder.servico || 'Serviços Gerais'}</span>
                        </div>
                        <span className="text-sm font-black text-slate-800 font-mono italic">
                          {formatCurrency(Number(selectedOrder.valor_total || selectedOrder.valor || 0))}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Totalizador Interno */}
                  <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                    <div>
                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total da Ordem</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">OS #{selectedOrder.id}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black tracking-tighter text-white font-mono italic">
                        {formatCurrency(Number(selectedOrder.valor_total || selectedOrder.valor || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Fixo */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
               <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full py-5 bg-white border-2 border-slate-200 text-slate-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
               >
                 Fechar Detalhes
               </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
         @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
         .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}} />
    </div>
  );
};

export default Dashboard;
