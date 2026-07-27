import React, { useState, useMemo } from 'react';
import { X, Save, AlertCircle, Info, MousePointer2, Trash2, ShieldCheck, ChevronRight, Camera, QrCode, FileText } from 'lucide-react';
import { useBrand } from '../../contexts/BrandContext';
import { useOrders } from '../../hooks/useData';
import { sendWhatsApp, getVehicleReceivedMsg } from '../../utils/whatsappUtils';
import { toast } from '../../utils/toast';
import QRCodeModal from './QRCodeModal';
import VcrReportModal from './VcrReportModal';

const SignaturePad = ({ onSave, onCancel }) => {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Sincroniza a resolução interna com o tamanho de exibição real
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (isDrawing) {
      e.preventDefault();
      setIsDrawing(false);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-0 w-full aspect-[2/1] md:aspect-[3/1] overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
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
  const [activeView, setActiveView] = useState('superior');
  const [generalNotes, setGeneralNotes] = useState('');
  const [km, setKm] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showVcrModal, setShowVcrModal] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [signature, setSignature] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { saveOrderChecklist, uploadOsPhoto } = useOrders();
  
  const vehicleType = useMemo(() => {
    // Agora usamos o tipo explícito do banco de dados (carro ou moto)
    const type = osData?.tipo?.toLowerCase() || osData?.veiculo_tipo?.toLowerCase();
    if (type === 'moto') return 'moto';
    return 'car';
  }, [osData]);

  const views = useMemo(() => {
    if (vehicleType === 'moto') {
      return [
        { id: 'superior', label: 'Superior' },
        { id: 'frontal', label: 'Frontal' },
        { id: 'perfil_esq', label: 'Lateral Esq.' },
        { id: 'perfil_dir', label: 'Lateral Dir.' },
      ];
    }
    return [
      { id: 'superior', label: 'Superior' },
      { id: 'frontal', label: 'Frente' },
      { id: 'traseira', label: 'Traseira' },
      { id: 'lateral_esquerda', label: 'Lat. Esquerda' },
      { id: 'lateral_direita', label: 'Lat. Direita' },
    ];
  }, [vehicleType]);

  const getPointsCountForView = (viewId) => {
    return points.filter(p => p.view === viewId).length;
  };

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
    const newPoint = { 
      id: Date.now(), 
      view, 
      x, 
      y, 
      tipo: '⚡ Risco / Arranhão', 
      descricao: '', 
      fotoUrl: '' 
    };
    setPoints([...points, newPoint]);
    setSelectedPoint(newPoint);
  };

  const removePoint = (id) => setPoints(points.filter(p => p.id !== id));

  const handleFinalSave = async (signatureData) => {
    if (!osData?.id) {
      toast.error('Erro: ID da Ordem de Serviço não encontrado.');
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
      toast.error(`Erro ao salvar o checklist. Detalhe: ${result.error?.message || result.error?.details || 'Erro desconhecido no banco de dados.'}`);
    }
  };

  const ImageView = ({ title, viewId, className, imageClassName = "object-contain", containerClassName = "h-[200px] md:h-[240px]" }) => {
    const [imgError, setImgError] = useState(false);
    return (
      <div className={`relative flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100/50 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-all overflow-hidden group ${className}`}>
        <div className="flex items-center justify-between w-full px-2 z-10 shrink-0">
            <span className="text-[10px] md:text-xs font-black uppercase text-slate-500 dark:text-slate-300 tracking-[0.15em]">{title}</span>
            <Camera size={16} className="text-slate-200 dark:text-slate-600 group-hover:text-primary transition-colors" />
        </div>
        <div 
          style={{ backgroundColor: '#ffffff' }}
          className={`relative w-full cursor-crosshair rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner ${containerClassName}`} 
          onClick={(e) => handleContainerClick(e, viewId)}
        >
          {!imgError ? (
            <img src={`/assets/checklist/${vehicleType}/${viewId}.png`} alt={title} className={`w-full h-full p-4 mix-blend-multiply opacity-90 drop-shadow-xl select-none transition-transform duration-500 group-hover:scale-105 ${imageClassName}`} onError={() => setImgError(true)} />
          ) : (
             <div className="text-[10px] font-black text-slate-400 uppercase">Falta: {viewId}.png</div>
          )}
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md">
            {points.filter(p => p.view === viewId).map(p => {
              const ptIdx = points.findIndex(item => item.id === p.id) + 1;
              return (
                <g 
                  key={p.id} 
                  onClick={(e) => { e.stopPropagation(); setSelectedPoint(p); }} 
                  className="pointer-events-auto cursor-pointer transition-transform hover:scale-125 hover:drop-shadow-2xl"
                  title={`#${ptIdx} - ${p.tipo || 'Dano'} (Clique para detalhar)`}
                >
                  <circle cx={`${p.x}%`} cy={`${p.y}%`} r="14" className="fill-rose-500/30 stroke-rose-500 stroke-[3]" />
                  <circle cx={`${p.x}%`} cy={`${p.y}%`} r="10" className="fill-rose-600" />
                  <text x={`${p.x}%`} y={`${p.y}%`} textAnchor="middle" dy=".3em" className="fill-white text-[9px] font-black pointer-events-none">
                    {ptIdx > 0 ? ptIdx : ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-2 md:p-6 overflow-hidden font-sans">
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] w-full max-w-7xl h-full flex flex-col overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800 max-h-[95vh]">
        
        {/* Header Fixo */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl">
                <ShieldCheck size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Laudo de Inspeção Digital</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-300 font-bold uppercase tracking-widest mt-1">
                 {osData?.cliente || 'Cliente'} <span className="mx-2 opacity-30">|</span> {osData?.veiculo || 'Veículo'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all group">
            <X size={28} className="text-slate-200 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/10 dark:bg-slate-900/10">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
             <p className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest animate-pulse">Carregando dados da inspeção...</p>
          </div>
        ) : (
          /* ROLAGEM ÚNICA DE TODO O CONTEÚDO (Evita dois scrolls separados) */
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-950/50">
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
              
              {/* Seção Principal de Imagens */}
              <div className="flex-1 w-full min-w-0">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-5 md:p-6 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-300 tracking-widest mb-6 px-1 flex items-center gap-2">
                    <MousePointer2 size={12} className="text-primary animate-pulse" />
                    Danos no Veículo (Toque na imagem correspondente para registrar)
                  </h4>
                  
                  {vehicleType === 'moto' ? (
                    // Layout Simétrico de Moto (Laterais em destaque total)
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <ImageView title="Visão Superior" viewId="superior" className="md:col-span-2" containerClassName="h-[260px] md:h-[340px] lg:h-[380px]" />
                      <ImageView title="Vista Frontal" viewId="frontal" containerClassName="h-[220px] md:h-[280px] lg:h-[300px]" />
                      <ImageView title="Lateral Esquerda" viewId="perfil_esq" className="md:col-span-2" containerClassName="h-[260px] md:h-[340px] lg:h-[380px]" />
                      <ImageView title="Lateral Direita" viewId="perfil_dir" className="md:col-span-2" containerClassName="h-[260px] md:h-[340px] lg:h-[380px]" />
                    </div>
                  ) : (
                    // Layout Simétrico com Destaque Superior e Laterais Amplas (Carro)
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      {/* Vista Superior com Destaque Expandido */}
                      <ImageView 
                        title="Visão Superior" 
                        viewId="superior" 
                        className="md:col-span-2" 
                        containerClassName="h-[340px] md:h-[460px] lg:h-[500px]" 
                      />
                      
                      {/* Vista Frontal e Vista Traseira Lado a Lado */}
                      <ImageView title="Vista Frontal" viewId="frontal" containerClassName="h-[220px] md:h-[280px] lg:h-[300px]" />
                      <ImageView title="Vista Traseira" viewId="traseira" containerClassName="h-[220px] md:h-[280px] lg:h-[300px]" />
                      
                      {/* Lateral Esquerda Expandida (Destaque de Detalhes) */}
                      <ImageView 
                        title="Lateral Esquerda" 
                        viewId="lateral_esquerda" 
                        className="md:col-span-2" 
                        containerClassName="h-[340px] md:h-[460px] lg:h-[500px]" 
                      />
                      
                      {/* Lateral Direita Expandida (Destaque de Detalhes) */}
                      <ImageView 
                        title="Lateral Direita" 
                        viewId="lateral_direita" 
                        className="md:col-span-2" 
                        containerClassName="h-[340px] md:h-[460px] lg:h-[500px]" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Seção Lateral do Formulário (Fica sticky no desktop enquanto rola a página) */}
              <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-6 lg:self-start">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-300 tracking-widest">Resumo do Laudo</h4>
                      <div className="px-3 py-1 bg-rose-500 text-white rounded-full text-[9px] font-black">{points.length} Avarias</div>
                  </div>

                  <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-300 tracking-widest mb-2 block">Relato Técnico Geral</label>
                        <textarea 
                            className="w-full min-h-[120px] p-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-bold placeholder:text-slate-300 resize-none shadow-inner"
                            value={generalNotes}
                            placeholder="Escreva observações gerais do veículo..."
                            onChange={(e) => setGeneralNotes(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-300 tracking-widest block mb-2">Quilometragem (KM)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            className="w-full p-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                            placeholder="Ex: 45.000"
                            value={km}
                            onChange={(e) => setKm(e.target.value)}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase">KM</span>
                        </div>
                      </div>
                      
                      {signature && (
                        <div className="p-4 bg-white rounded-2xl border border-slate-200" style={{ backgroundColor: '#ffffff' }}>
                          <p className="text-[8px] font-black uppercase text-slate-600 mb-2">Assinatura:</p>
                          <img src={signature} alt="Signature" className="h-10 object-contain opacity-90" />
                        </div>
                      )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
                      <button 
                        type="button"
                        onClick={() => setShowVcrModal(true)}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                          <FileText size={16} /> Ver Laudo Digital (VCR PDF)
                      </button>

                      <button 
                        onClick={() => setShowSignature(true)}
                        disabled={isSaving}
                        className={`w-full py-4 bg-slate-900 dark:bg-primary hover:bg-black dark:hover:bg-primary-light text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                          {isSaving ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Salvando...
                            </div>
                          ) : (
                            <><Save size={14} /> Finalizar e Assinar</>
                          )}
                      </button>
                      <button onClick={onClose} className="w-full mt-1 py-2 text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all">Cancelar</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Modal de Assinatura Digital */}
      {showSignature && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] rounded-[3rem] w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 dark:border-slate-800 max-h-[90vh]">
            <div className="p-6 md:p-10 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Assinatura do Cliente</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-300 font-bold uppercase tracking-widest mt-1">Confirmação do laudo visual de entrada.</p>
              </div>
              <button 
                onClick={() => setShowSignature(false)} 
                className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              <SignaturePad 
                onSave={handleFinalSave} 
                onCancel={() => setShowSignature(false)} 
              />

              <div className="mt-8 flex items-center gap-4 p-6 bg-amber-50 dark:bg-amber-950/30 rounded-3xl border border-amber-100 dark:border-amber-900/50 italic text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                <Info size={16} /> "Este laudo garante a integridade do veículo durante a permanência na loja."
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Envio de WhatsApp */}
      {showWhatsAppPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[400] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] rounded-[3rem] p-6 md:p-8 max-w-md w-full shadow-2xl text-center border border-white/20 dark:border-slate-800">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheck size={40} />
            </div>
            <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase mb-2 tracking-tight">Checklist Salvo!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-300 font-bold mb-8 px-4 leading-relaxed">
              Laudo assinado eletronicamente e veículo confirmado na loja. Deseja enviar o link do painel de produção ao cliente?
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setShowWhatsAppPrompt(false);
                  setShowQRModal(true);
                }}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <QrCode size={16} /> Exibir QR Code na Recepção
              </button>
              <button 
                onClick={() => {
                  const cleanPhone = (osData.cliente_telefone || '').replace(/\D/g, '');
                  sendWhatsApp(cleanPhone || '11999999999', getVehicleReceivedMsg(osData.cliente_nome, osData.veiculo_desc, osData.tracking_token || osData.id));
                  setShowWhatsAppPrompt(false);
                  onClose();
                }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Enviar Link por WhatsApp
              </button>
              <button 
                onClick={() => {
                  setShowWhatsAppPrompt(false);
                  onClose();
                }}
                className="w-full py-4 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-800"
              >
                Não Enviar Desta Vez
              </button>
            </div>
          </div>
        </div>
      )}

      {showQRModal && (
        <QRCodeModal 
          os={osData} 
          onClose={() => {
            setShowQRModal(false);
            onClose();
          }} 
        />
      )}

      {showVcrModal && (
        <VcrReportModal 
          isOpen={showVcrModal}
          onClose={() => setShowVcrModal(false)}
          osData={osData}
          points={points}
          generalNotes={generalNotes}
          km={km}
          signature={signature}
        />
      )}

      {selectedPoint && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center">
                  {points.findIndex(p => p.id === selectedPoint.id) + 1 || '#'}
                </span>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
                  Registrar Avaria — {(selectedPoint.view || '').toUpperCase()}
                </h4>
              </div>
              <button onClick={() => setSelectedPoint(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tipo de Avaria</label>
              <div className="grid grid-cols-2 gap-2">
                {['⚡ Risco / Arranhão', '🔨 Amassado / Mossa', '🎨 Pintura Queimada', '🪟 Trinca / Vidro', '🫧 Mancha / Resina', '❓ Outro / Desgaste'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const updated = points.map(p => p.id === selectedPoint.id ? { ...p, tipo: t } : p);
                      setPoints(updated);
                      setSelectedPoint({ ...selectedPoint, tipo: t });
                    }}
                    className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase text-left truncate border transition-all ${
                      (selectedPoint.tipo || '⚡ Risco / Arranhão') === t 
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Descrição / Observação</label>
              <input
                type="text"
                value={selectedPoint.descricao || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const updated = points.map(p => p.id === selectedPoint.id ? { ...p, descricao: val } : p);
                  setPoints(updated);
                  setSelectedPoint({ ...selectedPoint, descricao: val });
                }}
                placeholder="Ex: Risco profundo de 5cm perto da maçaneta"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Foto da Avaria (Opcional)</label>
              <div className="flex items-center gap-3">
                {selectedPoint.fotoUrl ? (
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={selectedPoint.fotoUrl} alt="Avaria" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        const updated = points.map(p => p.id === selectedPoint.id ? { ...p, fotoUrl: '' } : p);
                        setPoints(updated);
                        setSelectedPoint({ ...selectedPoint, fotoUrl: '' });
                      }}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : null}

                <label className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-600 transition-all">
                  {isUploadingPhoto ? (
                    <span className="animate-pulse">Enviando...</span>
                  ) : (
                    <>
                      <Camera size={16} className="text-primary" />
                      <span>{selectedPoint.fotoUrl ? 'Trocar Foto' : 'Anexar Foto da Avaria'}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={isUploadingPhoto}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingPhoto(true);
                      try {
                        const res = await uploadOsPhoto(osData.id, file, 'antes', 'livre');
                        if (res.success && res.url) {
                          const updated = points.map(p => p.id === selectedPoint.id ? { ...p, fotoUrl: res.url } : p);
                          setPoints(updated);
                          setSelectedPoint({ ...selectedPoint, fotoUrl: res.url });
                          toast.success("Foto da avaria anexada!");
                        } else {
                          toast.error("Erro ao enviar foto: " + (res.error?.message || 'Tente novamente'));
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("Erro ao enviar foto.");
                      } finally {
                        setIsUploadingPhoto(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  removePoint(selectedPoint.id);
                  setSelectedPoint(null);
                }}
                className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Excluir Ponto
              </button>

              <button
                type="button"
                onClick={() => setSelectedPoint(null)}
                className="py-2.5 px-6 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-primary/20 hover:scale-105 transition-all"
              >
                Confirmar Dano
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
