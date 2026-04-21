import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  CheckCircle2, 
  Camera, 
  MessageSquare, 
  Clock,
  Car,
  AlertTriangle,
  X,
  Loader2,
  Wrench
} from 'lucide-react';

import { useOrders } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../utils/toast';

const ExecutorView = ({ os, onBack, onComplete }) => {
  const { updateOrderProgress, uploadOsPhoto, fetchOsPhotos } = useOrders();
  const { profile } = useAuth();
  
  // Novos estados para múltiplos serviços
  const [servicosDetalhados, setServicosDetalhados] = useState(() => {
    if (os.servicos_detalhados && Array.isArray(os.servicos_detalhados) && os.servicos_detalhados.length > 0) {
      return os.servicos_detalhados;
    }
    // Inicializa a partir da string comma-separated
    return (os.servico || '').split(',').map(s => ({
      nome: s.trim(),
      progresso: 0
    })).filter(s => s.nome);
  });

  const [progress, setProgress] = useState(os.progresso || 0);
  const [isRunning, setIsRunning] = useState(String(os.status).toUpperCase() === 'EM EXECUÇÃO');
  const [time, setTime] = useState(Number(os.tempo_decorrido) || 0);
  const [notes, setNotes] = useState(os.obs_tecnico || '');
  const [photos, setPhotos] = useState([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Busca fotos iniciais da OS
  useEffect(() => {
    const loadPhotos = async () => {
       const res = await fetchOsPhotos(os.id);
       if (res.success) {
          // Filtra para mostrar apenas fotos de execução, removendo assinaturas da galeria
          setPhotos(res.data
            .filter(p => p.tipo !== 'assinatura')
            .map(p => p.url)
          );
       }
    };
    loadPhotos();
  }, [os.id]);

  // Simulação de cronômetro
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(t => Number(t) + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalProgress = (items) => {
    if (!items.length) return 0;
    const sum = items.reduce((acc, curr) => acc + curr.progresso, 0);
    return Math.round(sum / items.length);
  };

  const handleStart = async () => {
    if (!os.has_checklist) {
        toast.warning('Realize o checklist de entrada antes de iniciar.');
        return;
    }
    
    const additionalData = {};
    if (!os.tecnico_id) {
      additionalData.tecnico_id = profile?.id;
      additionalData.tecnico = profile?.nome;
    }

    const result = await updateOrderProgress(os.id, { 
      progresso: progress, 
      status: 'EM EXECUÇÃO', 
      servicos_detalhados: servicosDetalhados,
      ...additionalData 
    });
    if (result.success) setIsRunning(true);
  };

  const handlePause = async () => {
    const result = await updateOrderProgress(os.id, { 
      progresso: progress, 
      status: 'PAUSADO', 
      tempo_decorrido: time,
      servicos_detalhados: servicosDetalhados
    });
    if (result.success) setIsRunning(false);
  };

  const handleComplete = async () => {
    setIsFinishing(true);
    setShowConfirmFinish(false);
    
    const additionalData = {};
    if (!os.tecnico_id) {
      additionalData.tecnico_id = profile?.id;
      additionalData.tecnico = profile?.nome;
    }

    const result = await updateOrderProgress(os.id, { 
      progresso: 100, 
      status: 'CONCLUÍDO',
      obs_tecnico: notes, 
      data_fim: new Date().toISOString(),
      tempo_decorrido: time,
      servicos_detalhados: servicosDetalhados.map(s => ({ ...s, progresso: 100 })),
      ...additionalData
    });
    
    if (result.success) {
        toast.success('Serviço concluído com sucesso!');
        onComplete();
    } else {
        toast.error('Erro ao finalizar OS: ' + (result.error?.message || 'Erro desconhecido. Verifique a conexão.'));
    }
    setIsFinishing(false);
  };

  const handleSubServiceProgress = async (idx, val) => {
    const newItems = servicosDetalhados.map((item, i) => 
      i === idx ? { ...item, progresso: val } : item
    );
    setServicosDetalhados(newItems);
    
    const newTotal = calculateTotalProgress(newItems);
    setProgress(newTotal);

    const updateData = { 
        progresso: newTotal,
        servicos_detalhados: newItems
    };
    if (isRunning) updateData.status = 'EM EXECUÇÃO';
    
    await updateOrderProgress(os.id, updateData);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadOsPhoto(os.id, file);
      if (res.success) {
        setPhotos(prev => [res.url, ...prev]);
        toast.success('Foto enviada com sucesso!');
      } else {
        toast.error('Erro ao enviar foto: ' + (res.error?.message || 'Falha no upload'));
      }
    } catch (error) {
      console.error('Erro no handlePhotoUpload:', error);
      toast.error('Erro inesperado no upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header Fixo */}
      <div className="p-6 md:p-8 bg-white border-b border-slate-50 flex items-center justify-between shrink-0">
        <button 
          onClick={onBack}
          className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-2xl transition-all shadow-sm flex items-center gap-2 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Voltar</span>
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">OS #{os.id}</p>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
            {os.carro} {os.veiculos?.ano ? `(${os.veiculos.ano})` : ''}
          </h2>
        </div>
      </div>

      {/* Conteúdo Rolável */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
        {/* Card de Controle Rápido (Simplificado sem Cronômetro) */}
        <div className="bg-slate-900 rounded-[3rem] py-10 px-8 text-center shadow-2xl shadow-slate-900/40 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          
          <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="flex flex-col items-center gap-1">
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] opacity-70">
                  Status da Operação
                </p>
                <div className={`mt-2 px-4 py-2 rounded-xl flex items-center gap-2 border ${isRunning ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{isRunning ? 'Em Execução' : 'Pausado'}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                  {!isRunning ? (
                    <button 
                      onClick={handleStart}
                      className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl active:scale-95 transition-all ${
                          os.has_checklist 
                          ? 'bg-primary text-white shadow-primary/30 hover:scale-105' 
                          : 'bg-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <Play size={32} fill="currentColor" />
                    </button>
                  ) : (
                    <button 
                      onClick={handlePause}
                      className="w-20 h-20 bg-amber-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-500/30 active:scale-95 transition-all hover:scale-105"
                    >
                      <Pause size={32} fill="currentColor" />
                    </button>
                  )}
              </div>
          </div>
        </div>

        {/* Lista de Serviços */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10">
          <div className="flex justify-between items-end border-b border-slate-50 pb-6">
            <div>
               <h4 className="text-[12px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Status de Entrega</h4>
               <p className="text-sm font-bold text-slate-600 italic">Atualize o progresso de cada item individualmente.</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-primary font-black text-4xl tracking-tighter leading-none">{progress}%</span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Geral Concluído</span>
            </div>
          </div>

          {/* Instruções do Gestor (Read-only para o técnico) */}
          {os.observacoes && (
            <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50">
              <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <MessageSquare size={14} /> Instruções do Gestor
              </h5>
              <p className="text-xs font-bold text-amber-700/70 italic leading-relaxed">
                "{os.observacoes}"
              </p>
            </div>
          )}
          
          <div className="divide-y divide-slate-50">
            {servicosDetalhados.map((s, idx) => (
              <div key={idx} className="py-8 first:pt-0 last:pb-0 group">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full shadow-sm transition-all duration-500 ${s.progresso === 100 ? 'bg-emerald-500' : s.progresso > 0 ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
                    <p className="text-base font-black text-slate-800 uppercase tracking-tight">{s.nome}</p>
                  </div>
                  <span className={`text-sm font-black italic ${s.progresso === 100 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {s.progresso}%
                  </span>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex-1 relative h-4 bg-slate-50 rounded-full border border-slate-100 p-1 flex items-center">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      value={s.progresso}
                      onChange={(e) => handleSubServiceProgress(idx, parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${s.progresso === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                      style={{ width: `${s.progresso}%` }}
                    />
                  </div>
                  <button 
                    onClick={() => handleSubServiceProgress(idx, 100)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      s.progresso === 100 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-white text-slate-400 border border-slate-200 hover:border-primary hover:text-primary shadow-sm'
                    }`}
                  >
                    Feito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentação */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[12px] font-black uppercase text-slate-400 tracking-[0.2em]">Relatório Técnico</h4>
            <div className="flex gap-2">
                <label className={`p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all cursor-pointer shadow-sm ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                   <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
                   {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                </label>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-105 bg-slate-50">
                  <img src={url} alt={`Foto ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-inner focus-within:bg-white focus-within:border-primary/20 transition-all">
             <textarea 
              id="notes-area"
              className="w-full text-base bg-transparent border-none outline-none resize-none font-bold text-slate-700 placeholder:text-slate-300 placeholder:italic leading-relaxed"
              placeholder="Descreva detalhes importantes da execução, dificuldades ou observações para o cliente..."
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
             />
          </div>
        </div>
        
        <div className="h-10" />
      </div>

      {/* Footer Fixo */}
      <div className="p-6 md:p-8 bg-white border-t border-slate-50 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => setShowConfirmFinish(true)}
          disabled={progress < 100 || isFinishing}
          className={`w-full py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl ${
            progress === 100 && !isFinishing
              ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:-translate-y-1 active:translate-y-0' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          {isFinishing ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
              <><CheckCircle2 size={24} strokeWidth={3} /> Finalizar Ordem de Serviço</>
          )}
        </button>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmFinish && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center border border-white/20">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
              <CheckCircle2 size={48} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Tudo Pronto?</h3>
            <p className="text-xs text-slate-500 font-bold mb-10 leading-relaxed px-4">
               Ao finalizar, o cliente será notificado e o veículo será movido para o histórico de concluídos.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleComplete} 
                className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-200 hover:-translate-y-1 transition-all"
              >
                 Confirmar Entrega
              </button>
              <button 
                disabled={isFinishing}
                onClick={() => setShowConfirmFinish(false)} 
                className="w-full py-5 bg-slate-50 text-slate-400 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all font-bold"
              >
                Voltar e Revisar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutorView;
