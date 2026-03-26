import React from 'react';
import { Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useOrders, useClients, useCatalog } from '../hooks/useData';

const StatCard = ({ icon: Icon, label, value, trend, color, loading }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="card-premium p-5 flex items-start gap-4">
      <div className={`p-3 rounded-md ${colors[color] || colors.blue}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg"></div>
        ) : (
          <h4 className="text-2xl font-black text-slate-800 py-0.5">{value}</h4>
        )}
        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{trend}</p>
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
  const { orders, loading: loadingOrders } = useOrders();
  const { clients, loading: loadingClients } = useClients();
  const { services, loading: loadingCatalog } = useCatalog();

  // Cálculos Padronizados com Vendas
  const ordensAtivas = (orders || []).filter(os => os && os.status !== 'ORCAMENTO' && os.status !== 'CANCELADO');
  
  const totalFaturamento = ordensAtivas.reduce((acc, os) => acc + (Number(os.valor_total) || 0), 0);

  const aguardando = ordensAtivas.filter(os => String(os.status || '').toUpperCase().includes('AGUARDA')).length;
  const emExecucao = ordensAtivas.filter(os => String(os.status || '').toUpperCase().includes('EXECU')).length;
  const concluidas = ordensAtivas.filter(os => String(os.status || '').toUpperCase().includes('CONCLU')).length;

  // Cálculo de Performance de Serviços Real
  const performanceData = (services || [])
    .filter(s => s && s.nome)
    .map(service => {
      const count = (orders || []).filter(o => o && o.servico === service.nome).length;
      const totalOrders = (orders || []).length;
      const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
      return {
        label: service.nome,
        value: Math.round(percentage)
      };
    })
    .sort((a, b) => b.value - a.value).slice(0, 5);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fade-in space-y-8 pb-10">
      {/* Grid de KPIs Dinâmicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          label="Faturamento Convertido" 
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
          label="Concluídas Total" 
          value={concluidas} 
          trend="Histórico completo" 
          color="purple" 
          loading={loadingOrders} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ordens Recentes Reais */}
        <div className="card-premium p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight flex items-center gap-3">
              <Clock size={20} className="text-primary" /> Ordens Recentes
            </h3>
          </div>
          
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar overflow-x-hidden">
            {(ordensAtivas.length === 0 && !loadingOrders) && (
              <p className="text-center text-slate-400 py-10 font-bold uppercase tracking-widest text-xs">Nenhuma ordem em andamento</p>
            )}
            {ordensAtivas.slice(0, 6).map((os) => os && (
              <div key={os.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all px-4 rounded-2xl -mx-2 group gap-3">
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
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    String(os.status || '').toUpperCase().includes('EXECU') ? 'bg-blue-100 text-blue-600' : 
                    String(os.status || '').toUpperCase().includes('AGUARDA') ? 'bg-amber-100 text-amber-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {os.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desempenho Real (Performance de Serviços) */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight flex items-center gap-3">
              <TrendingUp size={20} className="text-primary" /> Performance de Serviços
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
              (performanceData || []).map((item, idx) => item && (
                <CategoryStat 
                  key={idx} 
                  label={item.label} 
                  value={item.value} 
                  color={idx === 0 ? 'bg-primary' : 'bg-slate-400'} 
                />
              ))
            )}
          </div>
          
          <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
              <strong>Nota:</strong> Dados baseados no mix de serviços criados no seu catálogo e registrados em OS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
