import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Car, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  LayoutGrid
} from 'lucide-react';
import { useOrders } from '../hooks/useData';
import { useBrand } from '../contexts/BrandContext';

const MonitorTV = () => {
  const { name, youtubeId, logoUrl } = useBrand();
  const { orders, loading } = useOrders();
  const [currentTime, setCurrentTime] = useState(new Date());
  const showVideo = !!youtubeId;

  // Filtra ordens para exibição: ORCAMENTO, CANCELADO e ENTREGUE não aparecem
  const producao = orders
    .filter(os => ['AGUARDANDO', 'EM EXECUÇÃO', 'CONCLUÍDO'].includes(os.status))
    .sort((a, b) => {
        // Priorizar Em Execução, depois Aguardando
        if (a.status === 'EM EXECUÇÃO' && b.status !== 'EM EXECUÇÃO') return -1;
        if (a.status !== 'EM EXECUÇÃO' && b.status === 'EM EXECUÇÃO') return 1;
        return 0;
    })
    .slice(0, showVideo ? 3 : 4); // 3 com vídeo, 4 sem vídeo conforme pedido

  // Atualiza relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-xs">Sincronizando Painel...</p>
        </div>
    );
  }

    const getEmbedUrl = (id) => {
      if (!id) return '';
      // Se começar com PL ou tiver mais de 15 caracteres (geralmente playlists são longas), trata como playlist
      const isPlaylist = id.startsWith('PL') || id.length > 20;
      if (isPlaylist) {
        return `https://www.youtube.com/embed/videoseries?list=${id}&autoplay=1&mute=1&controls=0&loop=1&modestbranding=1&rel=0`;
      }
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&rel=0`;
    };

    return (
      <div className="h-screen text-white overflow-hidden flex flex-col font-sans p-6 lg:p-8 gap-6 lg:gap-8" style={{ backgroundColor: 'var(--color-monitor-bg, #0f172a)' }}>
        
        {/* Top Bar / Branding */}
        <header className="flex items-center justify-between bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
               {logoUrl ? (
                 <img src={logoUrl} alt={name} className="w-full h-full object-contain p-2" />
               ) : (
                 <Car size={36} className="text-white" />
               )}
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">{name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">Painel de Controle de Produção</p>
              </div>
            </div>
          </div>
  
          <div className="flex items-center gap-8 bg-black/20 px-8 py-4 rounded-2xl border border-white/5">
            <div className="text-right">
              <p className="text-6xl font-black font-mono tracking-tighter tabular-nums text-primary/90">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
            </div>
          </div>
        </header>
  
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-0">
          
          {/* Espaço para o YouTube - Metade da tela */}
          {showVideo && (
            <div className="flex-1 bg-black rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
              <iframe 
                className="w-full h-full aspect-video"
                src={getEmbedUrl(youtubeId)}
                title="YouTube video player" 
                frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
            </div>
        )}

          {/* Produção Dynamic Layout */}
        <div className={`flex-1 overflow-hidden min-h-0 ${
            showVideo 
              ? 'grid grid-cols-1 grid-rows-3 gap-4 w-full lg:w-1/2' // Com vídeo: Metade da tela, 3 slots verticais fixos
              : 'grid grid-cols-2 grid-rows-2 gap-6 lg:gap-8 w-full' // Sem vídeo: Grade 4 slots (2x2)
          }`}>
          {producao.length > 0 ? producao.map((item) => (
            <div 
              key={item.id}
              className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl flex transition-all duration-700 ${
                showVideo ? 'flex-1' : ''
              }`}
            >
              {/* Lado Esquerdo - Info (Fundo Azul) */}
              <div className="w-[45%] bg-blue-600 p-6 lg:p-8 flex flex-col justify-between text-white relative">
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black bg-black/20 px-2 py-0.5 rounded-md uppercase tracking-widest text-white/50">OS #{item.id}</span>
                       <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === 'CONCLUÍDO' ? 'bg-emerald-400' : 'bg-white'}`}></div>
                    </div>
                    <h2 className={`font-black uppercase tracking-tighter leading-none truncate mb-1 ${
                      showVideo ? 'text-xl lg:text-2xl' : 'text-3xl lg:text-4xl'
                    }`}>
                      {item.veiculo_desc || item.veiculo}
                    </h2>
                    <p className={`text-white/70 font-bold uppercase tracking-widest truncate ${
                      showVideo ? 'text-[9px]' : 'text-xs lg:text-sm'
                    }`}>
                      {item.cliente_nome || item.cliente}
                    </p>
                 </div>
 
                 <div className="mt-auto relative z-10 text-right space-y-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 leading-none mb-1">Progresso Total</p>
                    <span className={`font-black italic leading-none text-white ${
                        showVideo ? 'text-3xl lg:text-4xl' : 'text-4xl lg:text-6xl'
                    }`}>{item.progresso}%</span>
                 </div>

                 {/* Marca d'água de fundo */}
                 <div className="absolute -bottom-4 -left-4 text-9xl font-black text-black/10 select-none pointer-events-none italic">
                   {item.id}
                 </div>
              </div>

              {/* Lado Direito - Serviços (Fundo Escuro) */}
              <div className="flex-1 bg-slate-900/40 backdrop-blur-md p-6 lg:p-8 flex flex-col justify-center gap-4 lg:gap-6 min-w-0">
                  {item.servicos_detalhados && Array.isArray(item.servicos_detalhados) && item.servicos_detalhados.length > 0 ? (
                    <div className="space-y-4 lg:space-y-6">
                      {item.servicos_detalhados.map((sub, sIdx) => (
                        <div key={sIdx} className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] lg:text-xs font-black text-slate-300 uppercase tracking-widest truncate max-w-[150px]">{sub.nome}</span>
                            <span className="text-xs lg:text-sm font-black text-white italic">{sub.progresso}%</span>
                          </div>
                          <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-1">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                                sub.progresso === 100 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                                'bg-blue-500'
                              }`}
                              style={{ width: `${sub.progresso}%` }}
                            >
                               {sub.progresso > 0 && sub.progresso < 100 && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                               )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] lg:text-xs font-black text-slate-300 uppercase tracking-widest">Execução Geral</span>
                          <span className="text-xs lg:text-sm font-black text-white italic">{item.progresso}%</span>
                        </div>
                        <div className="h-6 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-1.5 shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                              item.status === 'CONCLUÍDO' ? 'bg-emerald-500' : 'bg-primary'
                            }`}
                            style={{ width: `${item.progresso}%` }}
                          >
                            {item.status === 'EM EXECUÇÃO' && (
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            )}
                          </div>
                        </div>
                    </div>
                  )}
              </div>
            </div>
          )) : (
            <div className="col-span-full h-full flex flex-col items-center justify-center bg-slate-900/40 rounded-[3rem] border border-white/5 border-dashed p-12 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <LayoutGrid size={40} className="text-slate-700" />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">Pátio Limpo. Aguardando produção.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="h-10 flex items-center justify-between px-4 border-t border-white/5 pt-4 flex-shrink-0 mt-auto opacity-50">
         <div className="flex items-center gap-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <span>{name} OsSystem</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
            <span>Real-time Sync Active</span>
         </div>
         <p className="text-[10px] font-black uppercase tracking-widest">Painel 01</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}} />
    </div>
  );
};

export default MonitorTV;
