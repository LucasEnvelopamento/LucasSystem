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
  X
} from 'lucide-react';

import { useOrders } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';

const ExecutorView = ({ os, onBack, onComplete }) => {
  const { updateOrderProgress } = useOrders();
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
  const [notes, setNotes] = useState(os.observacoes || '');
  const [photos, setPhotos] = useState([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

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
        alert('Realize o checklist de entrada antes de iniciar.');
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
    
    const result = await updateOrderProgress(os.id, { 
      progresso: 100, 
      status: 'CONCLUÍDO',
      observacoes: notes, 
      data_fim: new Date().toISOString(),
      tempo_decorrido: time,
      servicos_detalhados: servicosDetalhados.map(s => ({ ...s, progresso: 100 }))
    });
    
    if (result.success) {
        onComplete();
    } else {
        alert('Erro ao finalizar OS: ' + (result.error?.message || 'Erro desconhecido. Verifique a conexão.'));
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

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    // Aqui no futuro implementaremos o upload real para o Bucket do Supabase
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...newPhotos]);
    alert('Fotos carregadas (Upload real em desenvolvimento)');
  };

  return (
    <div className="flex flex-col space-y-6 bg-white p-4">
      {/* OS ID: {os?.id} */}
      {/* Botão de Voltar e Header OS */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-3 -ml-2 text-slate-400 hover:text-primary active:bg-slate-100 rounded-full transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">OS #{os.id}</p>
          <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase">{os.carro}</h2>
        </div>
      </div>

      {/* Card do Cronômetro - Refinado para equilíbrio visual */}
      <div className="bg-slate-900 rounded-[2.5rem] py-10 px-6 text-center shadow-2xl shadow-slate-950 relative group min-h-[200px] flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 rounded-[2.5rem] pointer-events-none"></div>
        
        <p className="text-primary text-[9px] font-black uppercase tracking-[0.4em] mb-4 relative z-10 opacity-60">
          Temporizador
        </p>
        
        <div className="flex flex-col items-center gap-4 relative z-10">
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-black text-white font-mono tracking-tighter leading-none">
                {formatTime(time)}
              </span>
              <div className="px-4 py-1.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                  <span className="text-[9px] font-black text-white/70 uppercase tracking-widest leading-none">
                    {isRunning ? 'Executando' : 'Pausado'}
                  </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">

                {/* Main Action Button */}
                {!isRunning ? (
                  <button 
                    onClick={handleStart}
                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl active:scale-90 transition-all outline-none ${
                        os.has_checklist 
                        ? 'bg-primary text-white shadow-primary/30 hover:bg-emerald-400' 
                        : 'bg-slate-800 text-slate-600 opacity-30 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <Play size={28} fill="currentColor" />
                  </button>
                ) : (
                  <button 
                    onClick={handlePause}
                    className="w-16 h-16 bg-amber-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-amber-500/30 active:scale-95 transition-all hover:bg-amber-400 outline-none"
                  >
                    <Pause size={28} fill="currentColor" />
                  </button>
                )}
            </div>
        </div>
      </div>

      {/* Lista de Serviços Individuais com Progresso */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-8">
        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
          <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none">Status por Serviço</h4>
          <div className="flex flex-col items-end">
            <span className="text-primary font-black text-2xl tracking-tighter leading-none">{progress}%</span>
            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">Geral</span>
          </div>
        </div>
        
        <div className="space-y-10">
          {servicosDetalhados.map((s, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.progresso === 100 ? 'bg-emerald-500' : s.progresso > 0 ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{s.nome}</p>
                </div>
                <span className={`text-[11px] font-black ${s.progresso === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {s.progresso}%
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={s.progresso}
                  onChange={(e) => handleSubServiceProgress(idx, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <button 
                  onClick={() => handleSubServiceProgress(idx, 100)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                    s.progresso === 100 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-slate-300'
                  }`}
                >
                  Ffeito
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Técnicas */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">Documentação e Notas</h4>
        <div className="flex gap-4">
          <label className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all cursor-pointer hover:bg-slate-50/50">
            <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Camera size={24} />
            </div>
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Fotos</span>
          </label>
          <button 
            onClick={() => {
              const el = document.getElementById('notes-area');
              el?.focus();
            }}
            className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-slate-50/50"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-100">
              <MessageSquare size={24} />
            </div>
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Observação</span>
          </button>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm transition-all focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/20 group">
           <textarea 
            id="notes-area"
            className="w-full p-2 text-sm bg-transparent border-none outline-none resize-none font-medium text-slate-700 placeholder:text-slate-300 placeholder:italic"
            placeholder="Relate aqui detalhes técnicos relevantes, dificuldades ou observações importantes sobre o serviço..."
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
           />
        </div>
      </div>

      {/* Botão Finalizar Decisivo */}
      <button 
        onClick={() => setShowConfirmFinish(true)}
        disabled={progress < 100 || isFinishing}
        className={`w-full py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all ${
          progress === 100 && !isFinishing
            ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-600/30 active:scale-[0.98] hover:bg-emerald-500' 
            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
        }`}
      >
        {isFinishing ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
            <><CheckCircle2 size={24} /> Finalizar e Registrar</>
        )}
      </button>

      {/* Modal de Confirmação Customizado */}
      {showConfirmFinish && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scaleUp text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase mb-2">Finalizar Serviço?</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">Esta ação irá marcar a O.S como concluída e irá transferi-la para o histórico.</p>
            
            <div className="flex gap-3">
              <button 
                disabled={isFinishing}
                onClick={() => setShowConfirmFinish(false)} 
                className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-xl font-black uppercase text-[10px] hover:bg-slate-100 tracking-widest disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleComplete} 
                className="flex-[1.5] py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                 Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-20" />
    </div>
  );
};

export default ExecutorView;
