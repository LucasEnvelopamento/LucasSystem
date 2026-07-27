import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { 
  Monitor, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  Star, 
  Car, 
  DollarSign, 
  Package, 
  Flame, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useOrders, useInventory } from '../../hooks/useData';
import { useBrand } from '../../contexts/BrandContext';
import { supabase, hasRealConnection } from '../../lib/supabase';

const Tv360OfficeView = ({ onClose }) => {
  const { orders } = useOrders();
  const { materials } = useInventory();
  const brand = useBrand();
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  // Relógio ao vivo em segundos
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Busca avaliações NPS para exibir em tempo real na TV
  useEffect(() => {
    const fetchNps = async () => {
      try {
        let remoteFbs = [];
        if (hasRealConnection()) {
          const { data, error } = await supabase
            .from('pesquisas_nps')
            .select('nota')
            .order('created_at', { ascending: false });
          if (!error && data) remoteFbs = data;
        }
        const localFbs = JSON.parse(localStorage.getItem('pesquisas_nps_local') || '[]');
        const combined = [...remoteFbs, ...localFbs];
        setFeedbacks(combined);
      } catch (e) {
        console.error('Erro NPS TV:', e);
      }
    };
    fetchNps();
    const timerNps = setInterval(fetchNps, 30000);
    return () => clearInterval(timerNps);
  }, []);

  const npsStats = useMemo(() => {
    const total = feedbacks.length;
    if (total === 0) return { media: '--', pPromotores: 0, total: 0 };
    const soma = feedbacks.reduce((acc, f) => acc + Number(f.nota || 0), 0);
    const media = (soma / total).toFixed(1);
    const promotores = feedbacks.filter(f => Number(f.nota || 0) >= 9).length;
    const pPromotores = Math.round((promotores / total) * 100);
    return { media, pPromotores, total };
  }, [feedbacks]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // 1. Métricas Financeiras RÁPIDAS
  const mesAtualStr = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}`;
  const ordensMes = (orders || []).filter(os => {
    const dataRef = os.data_fim || os.data_agendamento || os.created_at || '';
    return String(dataRef).startsWith(mesAtualStr);
  });

  const faturadoMes = ordensMes.reduce((acc, os) => {
    const st = String(os.status || '').toUpperCase().trim();
    if (st === 'CONCLUÍDO' || st === 'ENTREGUE') {
      return acc + Number(os.valor_total || os.valor_pago || 0);
    }
    return acc;
  }, 0);

  const metaMensal = 100000; // R$ 100k de meta
  const progressoMeta = Math.min(100, Math.round((faturadoMes / metaMensal) * 100));

  // 2. Grid de Ocupação (Ordens Ativas em Execução)
  const ordensEmProducao = (orders || []).filter(os => {
    const st = String(os.status || '').toUpperCase().trim();
    return st === 'EM EXECUÇÃO' || st === 'AGUARDANDO PEÇA' || st === 'LAVAGEM' || st === 'POLIMENTO';
  });

  // 3. Alertas Críticos de Estoque
  const estoqueCritico = (materials || []).filter(m => {
    return Number(m.quantidade || 0) <= Number(m.estoque_minimo || 2);
  });

  const formatMoney = (val) => {
    return `R$ ${Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-[#0a0f1d] text-white z-[99999] flex flex-col p-6 overflow-hidden select-none animate-fadeIn font-sans m-0">
      {/* CABEÇALHO TV 360° */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Monitor size={26} className="text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase tracking-widest border border-emerald-500/30">
                ● AO VIVO • VISÃO 360° OFFICE (FASE 63)
              </span>
              <span className="text-xs text-slate-400 font-mono">Atualização em tempo real</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight mt-1 text-white">
              Central de Comando & Produção da Oficina
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right font-mono">
            <p className="text-3xl font-black tracking-tight text-white">
              {time.toLocaleTimeString('pt-BR')}
            </p>
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              {time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleFullscreen}
              className="p-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all"
              title="Alternar Tela Cheia"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
              >
                Sair do Modo TV
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORPO DO MONITOR 360° */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        
        {/* COLUNA 1 & 2: GRID DE OCUPAÇÃO DE BOX / SERVIÇOS EM PRODUÇÃO */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
          {/* TICKER FINANCEIRO DO DIA & MÊS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800/90 p-5 rounded-3xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Faturado no Mês (Real)</p>
                <h3 className="text-3xl font-black text-emerald-400 mt-1">{formatMoney(faturadoMes)}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                  <span>Meta: {formatMoney(metaMensal)}</span>
                  <span className="text-emerald-400">({progressoMeta}%)</span>
                </p>
              </div>
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <DollarSign size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800/90 p-5 rounded-3xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carros em Produção</p>
                <h3 className="text-3xl font-black text-white mt-1">{ordensEmProducao.length} Veículos</h3>
                <p className="text-xs font-bold text-amber-400 mt-1 flex items-center gap-1">
                  <span>🔥 Ocupação da Loja</span>
                </p>
              </div>
              <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <Car size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800/90 p-5 rounded-3xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Satisfação NPS (Média 24h)</p>
                <h3 className="text-3xl font-black text-amber-400 mt-1">{npsStats.total > 0 ? `${npsStats.media} / 10` : 'N/A'}</h3>
                <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <span>{npsStats.total > 0 ? `⭐ ${npsStats.pPromotores}% Promotores (${npsStats.total} av.)` : '⭐ Aguardando 1ª avaliação'}</span>
                </p>
              </div>
              <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <Star size={32} className="fill-amber-400" />
              </div>
            </div>
          </div>

          {/* GRID DE BOX / ESTANDES */}
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800/80 p-6 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Wrench size={18} className="text-primary" />
                <span>Ocupação dos Box de Produção ao Vivo</span>
              </h3>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                Sincronizado via Supabase WebSocket
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
              {ordensEmProducao.length > 0 ? (
                ordensEmProducao.map((os, idx) => (
                  <div key={os.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-700/80 hover:border-emerald-500/50 transition-all shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/30">
                        BOX #{idx + 1}
                      </span>
                      <span className="text-xs font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {os.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight truncate" title={os.veiculo_desc}>
                        {os.veiculo_desc || 'Veículo em Produção'}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 truncate mt-0.5">
                        Cliente: {os.cliente_nome || 'Cliente'} • OS #{os.id}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Users size={14} className="text-primary" />
                        <span>Resp: <strong className="text-white font-black">{os.tecnico || os.tecnico_nome || 'Especialista'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-emerald-400">
                        <Clock size={14} />
                        <span>SLA: em dia</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 opacity-60">
                  <CheckCircle2 size={48} className="mb-3 text-emerald-500" />
                  <p className="text-sm font-black uppercase tracking-widest">Todos os pátios livres no momento</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA 3: ALERTAS DE ESTOQUE & FEED DE ATIVIDADES */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-rose-500/30 flex-1 flex flex-col overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-500 animate-bounce" />
                <span>Alerta Crítico de Estoque</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-black text-[10px]">
                {estoqueCritico.length} Insumos
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
              {estoqueCritico.length > 0 ? (
                estoqueCritico.map(m => (
                  <div key={m.id} className="p-4 bg-slate-950/80 rounded-2xl border border-rose-900/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white uppercase">{m.nome}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Cat: {m.categoria || 'Geral'}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-mono font-black text-xs">
                        {m.quantidade} {m.unidade || 'un'}
                      </span>
                      <p className="text-[9px] text-rose-400 mt-1 font-bold">Mínimo: {m.estoque_minimo}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500 opacity-60">
                  <Package size={36} className="mx-auto mb-2 text-emerald-500" />
                  <p className="text-xs font-black uppercase">Nenhum alerta de estoque crítico!</p>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-center flex-shrink-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modo TV 360° • {brand.name || 'OsSystem'} v{brand.version || '2.5'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default Tv360OfficeView;
