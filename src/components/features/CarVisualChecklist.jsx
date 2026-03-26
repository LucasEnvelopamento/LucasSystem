import React, { useState, useMemo } from 'react';
import { X, Save, AlertCircle, Info, MousePointer2, Trash2, ShieldCheck, ChevronRight, Camera } from 'lucide-react';
import { useBrand } from '../../contexts/BrandContext';
import { useOrders } from '../../hooks/useData';
import { sendWhatsApp, getVehicleReceivedMsg } from '../../utils/whatsappUtils';

const SignaturePad = ({ onSave, onCancel }) => {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-4 w-full">
        <canvas 
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-auto cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-4 mt-6 w-full">
        <button onClick={clear} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">Limpar</button>
        <button onClick={() => onSave(canvasRef.current.toDataURL())} className="flex-[2] py-4 bg-primary text-white text-[10px] font-black uppercase rounded-2xl shadow-lg shadow-primary/20">Confirmar Assinatura</button>
      </div>
    </div>
  );
};

const CarVisualChecklist = ({ onClose, osData }) => {
  const { name } = useBrand();
  const [points, setPoints] = useState([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [km, setKm] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);
  const [signature, setSignature] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { saveOrderChecklist } = useOrders();
  
  const vehicleType = useMemo(() => {
    // Agora usamos o tipo explícito do banco de dados (carro ou moto)
    const type = osData?.tipo?.toLowerCase() || osData?.veiculo_tipo?.toLowerCase();
    if (type === 'moto') return 'moto';
    return 'car';
  }, [osData]);

  React.useEffect(() => {
    const loadSavedChecklist = async () => {
      if (!osData?.id) return;
      try {
        setIsLoading(true);
        // import supabase para chamadas diretas
        const { supabase, hasRealConnection } = await import('../../lib/supabase');
        if (hasRealConnection()) {
          const { data: checklistData } = await supabase
            .from('checklist_avarias')
            .select('*')
            .eq('os_id', osData.id)
            .single();

          if (checklistData) {
            setPoints(checklistData.pontos_avaria || []);
            
            // Extract KM from notes if it was saved via fallback, or use km column
            let notes = checklistData.notas || '';
            let savedKm = checklistData.quilometragem || '';
            
            const kmMatch = notes.match(/\[KM: (.*?)\]/);
            if (kmMatch) {
              savedKm = kmMatch[1] === 'N/A' ? '' : kmMatch[1];
              notes = notes.replace(/\[KM: .*?\]\s*/, '');
            }
            
            setGeneralNotes(notes);
            setKm(savedKm);
          }

          const { data: mediaData } = await supabase
            .from('os_midia')
            .select('*')
            .eq('os_id', osData.id)
            .eq('tipo', 'assinatura')
            .single();

          if (mediaData) {
            setSignature(mediaData.url);
          }
        }
      } catch (err) {
        console.error('Error loading checklist data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedChecklist();
  }, [osData]);

  const handleContainerClick = (e, view) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints([...points, { id: Date.now(), view, x, y }]);
  };

  const removePoint = (id) => setPoints(points.filter(p => p.id !== id));

  const handleFinalSave = async (signatureData) => {
    if (!osData?.id) {
      alert('Erro: ID da Ordem de Serviço não encontrado.');
      return;
    }

    setIsSaving(true);
    const result = await saveOrderChecklist(
      osData.id, 
      { points, generalNotes, km }, 
      signatureData
    );
    
    setIsSaving(false);
    if (result.success) {
      setSignature(signatureData);
      setShowSignature(false);
      
      // Abre o modal de opção de envio
      setShowWhatsAppPrompt(true);
      
    } else {
      console.error('LOG DE ERRO DO CHECKLIST:', result.error);
      alert(`Erro ao salvar o checklist.\nDetalhe: ${result.error?.message || result.error?.details || 'Erro desconhecido no banco de dados.'}`);
    }
  };

  const ImageView = ({ title, viewId, className }) => {
    const [imgError, setImgError] = useState(false);
    return (
      <div className={`relative flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all ${className}`}>
        <div className="flex items-center justify-between w-full px-1">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.1em]">{title}</span>
            <Camera size={10} className="text-slate-200" />
        </div>
        <div className="relative w-full aspect-video cursor-crosshair rounded-xl overflow-hidden bg-white flex items-center justify-center" onClick={(e) => handleContainerClick(e, viewId)}>
          {!imgError ? (
            <img src={`/assets/checklist/${vehicleType}/${viewId}.png`} alt={title} className="w-full h-full object-contain mix-blend-multiply p-2" onError={() => setImgError(true)} />
          ) : (
             <div className="text-[8px] font-black text-slate-200 uppercase">Falta: {viewId}.png</div>
          )}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {points.filter(p => p.view === viewId).map(p => (
              <g key={p.id} onClick={(e) => { e.stopPropagation(); removePoint(p.id); }} className="pointer-events-auto cursor-pointer">
                <circle cx={`${p.x}%`} cy={`${p.y}%`} r="8" className="fill-rose-500/30 stroke-rose-600 stroke-2" />
                <circle cx={`${p.x}%`} cy={`${p.y}%`} r="2" className="fill-rose-600" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-2 md:p-6 overflow-hidden font-sans">
      <div className="bg-white rounded-[3rem] w-full max-w-7xl h-full flex flex-col overflow-hidden shadow-2xl border border-white/20">
        
        {/* Header Profissional */}
        <div className="p-8 bg-white flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
                <ShieldCheck size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Laudo de Inspeção Digital</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                 {osData?.cliente || 'Cliente'} <span className="mx-2 opacity-30">|</span> {osData?.veiculo || 'Veículo'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-full transition-all group">
            <X size={28} className="text-slate-200 group-hover:text-slate-900" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/10">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Carregando dados da inspeção...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50/10">
            {/* Layout de Imagens Denso e Profissional */}
            <div className="flex-1 p-3 md:p-6 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-3 md:space-y-4">
              
              {/* TOP ROW: Superior Left (Large), Front/Rear Right Stacked */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
                <ImageView 
                  title="Visão Superior" 
                  viewId="superior" 
                  className="md:col-span-3 min-h-[220px] md:min-h-[320px]" 
                />
                <div className="md:col-span-2 grid grid-cols-1 gap-3 md:gap-4">
                   <ImageView title="Vista Frontal" viewId="frontal" className="min-h-[100px] md:min-h-[150px]" />
                   {vehicleType !== 'moto' && (
                     <ImageView title="Vista Traseira" viewId="traseira" className="min-h-[100px] md:min-h-[150px]" />
                   )}
                </div>
              </div>

              {/* BOTTOM ROW: Laterals side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                 <ImageView title="Lateral Esquerda" viewId={vehicleType === 'moto' ? 'perfil_esq' : 'lateral_esquerda'} className="min-h-[100px] md:min-h-[150px]" />
                 <ImageView title="Lateral Direita" viewId={vehicleType === 'moto' ? 'perfil_dir' : 'lateral_direita'} className="min-h-[100px] md:min-h-[150px]" />
              </div>

            </div>
          </div>

          {/* Painel Lateral - Compacto para Tablet */}
          <div className="w-full lg:w-72 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.02)] min-h-[250px] lg:min-h-0">
            <div className="p-5 md:p-6 border-b border-slate-50 flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Resumo do Laudo</h4>
                <div className="px-3 py-1 bg-rose-500 text-white rounded-full text-[9px] font-black">{points.length} Avarias</div>
            </div>

            <div className="flex-1 p-5 md:p-6 flex flex-col overflow-y-auto">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Relato Técnico Geral</label>
                <textarea 
                    className="flex-1 min-h-[100px] w-full p-5 border-2 border-slate-50 rounded-[2rem] text-sm bg-slate-50 focus:border-primary/20 focus:bg-white outline-none transition-all font-bold placeholder:text-slate-200 resize-none shadow-inner"
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                />
                
                <div className="mt-4 space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block ml-1">Quilometragem (KM)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full p-4 border-2 border-slate-50 rounded-2xl text-sm font-black bg-slate-50 focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                      placeholder="Ex: 45.000"
                      value={km}
                      onChange={(e) => setKm(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">KM</span>
                  </div>
                </div>
                
                {signature && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black uppercase text-slate-400 mb-2">Assinatura:</p>
                    <img src={signature} alt="Signature" className="h-10 object-contain mix-blend-multiply opacity-60" />
                  </div>
                )}
            </div>

            <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => setShowSignature(true)}
                  disabled={isSaving}
                  className={`w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Salvando...
                      </div>
                    ) : (
                      <>
                        <Save size={14} /> Finalizar e Assinar
                      </>
                    )}
                </button>
                <button onClick={onClose} className="w-full mt-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all">Cancelar</button>
            </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal de Assinatura Digital */}
      {showSignature && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[300] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h4 className="text-2xl font-black text-slate-800 uppercase">Assinatura do Cliente</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ao assinar, o cliente confirma o laudo visual de entrada.</p>
               </div>
               <button onClick={() => setShowSignature(false)} className="p-4 hover:bg-slate-50 rounded-full transition-all group">
                  <X size={24} className="text-slate-200 group-hover:text-slate-800" />
               </button>
            </div>

            <SignaturePad 
              onSave={handleFinalSave} 
              onCancel={() => setShowSignature(false)} 
            />

            <div className="mt-8 flex items-center gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100 italic text-[10px] text-amber-700 font-bold">
               <Info size={16} /> "Este laudo garante a integridade do veículo durante a permanência na loja."
            </div>
          </div>
        </div>
      )}

      {/* Modal de Envio de WhatsApp */}
      {showWhatsAppPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[400] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-8 max-w-md w-full shadow-2xl text-center border border-white/20">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl border border-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheck size={40} />
            </div>
            <h4 className="text-2xl font-black text-slate-800 uppercase mb-2 tracking-tight">Checklist Salvo!</h4>
            <p className="text-xs text-slate-500 font-bold mb-8 px-4 leading-relaxed">
              Laudo assinado eletronicamente e veículo confirmado na loja. Deseja enviar o link do painel de produção ao cliente?
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const cleanPhone = (osData.cliente_telefone || '').replace(/\D/g, '');
                  sendWhatsApp(cleanPhone || '11999999999', getVehicleReceivedMsg(osData.cliente_nome, osData.veiculo_desc, osData.id));
                  setShowWhatsAppPrompt(false);
                  onClose();
                }}
                className="w-full py-5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all"
              >
                Enviar Link por WhatsApp
              </button>
              <button 
                onClick={() => {
                  setShowWhatsAppPrompt(false);
                  onClose();
                }}
                className="w-full py-5 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-100"
              >
                Não Enviar Desta Vez
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}} />
    </div>
  );
};

export default CarVisualChecklist;
