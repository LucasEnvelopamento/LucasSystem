import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, hasRealConnection } from '../lib/supabase';
import { Car, Activity, CheckCircle2, ShieldCheck, LayoutGrid } from 'lucide-react';
import { useBrand } from '../contexts/BrandContext';

const CustomerStatus = () => {
  const { id } = useParams();
  const { name } = useBrand();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // O ID agora é o identificador único para buscar a OS correta (evita conflito histórico)
  const targetId = Number(id);

  const fetchCustomerOrders = async () => {
    if (!hasRealConnection()) {
      setLoading(false);
      return;
    }

    if (!targetId || isNaN(targetId)) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      // Busca a OS específica pelo ID, garantindo isolamento histórico
      const { data: ordens, error: osError } = await supabase
        .from('ordens_servico')
        .select('*, veiculos(marca, modelo)')
        .eq('id', targetId);

      if (osError) throw osError;

      if (!ordens || ordens.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const formattedOrders = ordens.map(os => {
        const veiculoObj = Array.isArray(os.veiculos) ? os.veiculos[0] : os.veiculos;
        return {
          ...os,
          veiculo_desc: veiculoObj ? `${veiculoObj.marca || ''} ${veiculoObj.modelo || ''}`.trim() : 'Veículo',
        };
      });

      setOrders(formattedOrders);
    } catch (err) {
      console.error("Erro ao buscar status do cliente:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
    
    if (hasRealConnection()) {
      const channel = supabase
        .channel('public-customer-status')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_servico', filter: `id=eq.${targetId}` }, fetchCustomerOrders)
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-6">
         <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
         <p className="text-white font-bold animate-pulse tracking-widest text-sm uppercase">Buscando seu veículo...</p>
      </div>
    );
  }

  if (error || (orders.length === 0 && !loading)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <LayoutGrid size={48} className="text-slate-600" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Serviço Não Encontrado</h2>
        <p className="text-slate-400 font-medium">Verifique se o link de acompanhamento está correto ou se a Ordem de Serviço foi excluída.</p>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-8">OS Nº: #{targetId || 'Inválida'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      
      {/* Header Premium PWA */}
      <header className="mb-8 flex items-center justify-center flex-col gap-4 text-center mt-4">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Car size={36} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">{name}</h1>
          <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mt-1">Acompanhamento Ao Vivo</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {orders.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
             
             {/* Fita de Status */}
             <div className={`absolute top-0 left-0 w-2 h-full ${
               item.status === 'CONCLUÍDO' || item.status === 'ENTREGUE' ? 'bg-emerald-500' : 
               item.status === 'EM EXECUÇÃO' ? 'bg-primary' : 'bg-amber-500'
             }`}></div>

             <div className="flex items-center justify-between mb-6 pl-4">
               <div>
                  <h2 className="text-xl font-black uppercase text-white tracking-tight">{item.veiculo_desc}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-md uppercase tracking-widest text-slate-300">OS #{item.id}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                       item.status === 'CONCLUÍDO' || item.status === 'ENTREGUE' ? 'text-emerald-400' : 
                       item.status === 'EM EXECUÇÃO' ? 'text-primary' : 'text-amber-400'
                    }`}>{item.status}</span>
                  </div>
               </div>
               {item.status === 'CONCLUÍDO' || item.status === 'ENTREGUE' ? (
                 <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                   <CheckCircle2 size={24} />
                 </div>
               ) : (
                 <div className="bg-white/5 py-1 px-3 rounded-xl min-w-[4rem] text-center border border-white/5">
                   <span className="text-xl font-black italic">{item.progresso}%</span>
                 </div>
               )}
             </div>

             {/* Barras de Progresso Múltiplas */}
             <div className="bg-black/40 rounded-3xl p-5 border border-white/5 ml-4">
                {item.servicos_detalhados && Array.isArray(item.servicos_detalhados) && item.servicos_detalhados.length > 0 ? (
                  <div className="space-y-4">
                    {item.servicos_detalhados.map((sub, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{sub.nome}</span>
                          <span className="text-xs font-black text-white italic">{sub.progresso}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                              sub.progresso === 100 ? 'bg-emerald-500' : 'bg-primary'
                            }`}
                            style={{ width: `${sub.progresso}%` }}
                          >
                            {sub.progresso > 0 && sub.progresso < 100 && (
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Activity size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.servico || 'Serviços Gerais'}</span>
                      </div>
                      <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                            item.status === 'CONCLUÍDO' || item.status === 'ENTREGUE' ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${item.progresso}%` }}
                        >
                           {item.status === 'EM EXECUÇÃO' && (
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                           )}
                        </div>
                      </div>
                   </div>
                )}
             </div>

             {/* Footer do Card */}
             {(item.status === 'CONCLUÍDO' || item.status === 'ENTREGUE') && (
               <div className="mt-6 ml-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-center gap-2">
                 <ShieldCheck size={18} className="text-emerald-500" />
                 <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Serviço Finalizado! Venha buscar.</span>
               </div>
             )}

          </div>
        ))}
      </div>

       <footer className="mt-12 text-center opacity-40">
         <p className="text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-slate-500">
           <ShieldCheck size={12} /> Protegido por SSL
         </p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />

    </div>
  );
};

export default CustomerStatus;
