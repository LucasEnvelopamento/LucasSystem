import React, { useState, useMemo } from 'react';
import { Camera, Eye, Trash2, Loader2, ShieldCheck, Plus, AlertCircle, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { PHOTO_PHASES, PHOTO_ANGLES, getPhaseInfo, getAngleInfo } from '../../utils/photoConstants';
import PhotoComparisonModal from './PhotoComparisonModal';

const PhotoGuideGallery = ({
  photos = [],
  onUpload,
  onDelete,
  isReadOnly = false,
  loading = false,
  vehicleDesc = 'Veículo',
  osId
}) => {
  const [activePhase, setActivePhase] = useState('durante');
  const [uploadingSlot, setUploadingSlot] = useState(null); // 'fase:angulo'
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  // Verifica se há fotos de antes e depois para liberar o botão comparador
  const hasComparison = useMemo(() => {
    return PHOTO_ANGLES.some(ang => {
      const temAntes = photos.some(p => p.angulo === ang.id && p.fase_execucao === 'antes');
      const temDepois = photos.some(p => p.angulo === ang.id && p.fase_execucao === 'depois');
      return temAntes && temDepois;
    });
  }, [photos]);

  // Handle Upload individual por slot
  const handleSlotUpload = async (e, fase, angulo) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    const slotKey = `${fase}:${angulo}`;
    setUploadingSlot(slotKey);
    try {
      await onUpload(file, fase, angulo);
    } finally {
      setUploadingSlot(null);
      e.target.value = ''; // limpa input
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Barra Superior: Status do Rastreamento e Botão Comparador */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-primary animate-pulse" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
              Vistoria Guiada 360° & Acabamento
            </h4>
          </div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {isReadOnly 
              ? 'Acompanhe a documentação fotográfica do veículo separada por fase e ângulo.' 
              : 'Selecione a fase (Antes, Durante, Depois) e registre os 5 ângulos corporativos.'}
          </p>
        </div>

        {/* Botão de Comparação Antes x Depois */}
        <button
          onClick={() => setIsComparing(true)}
          disabled={!hasComparison}
          className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-md shrink-0 ${
            hasComparison
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-105 shadow-emerald-500/20 cursor-pointer animate-pulse'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
          }`}
          title={hasComparison ? 'Abra o comparador visual' : 'Registre ao menos uma foto ANTES e DEPOIS do mesmo ângulo para ativar o comparador'}
        >
          <span className="text-base">⚖️</span>
          <span>Comparar Antes x Depois</span>
          {!hasComparison && <span className="text-[9px] font-bold opacity-75">(Pendente)</span>}
        </button>
      </div>

      {/* Abas de Fase (Antes | Durante | Depois) */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 bg-slate-100 dark:bg-slate-900/80 p-2 rounded-3xl border border-slate-200/60 dark:border-slate-800">
        {PHOTO_PHASES.map((ph) => {
          const count = photos.filter(p => p.fase_execucao === ph.id).length;
          const isActive = activePhase === ph.id;
          return (
            <button
              key={ph.id}
              onClick={() => setActivePhase(ph.id)}
              className={`flex-1 min-w-[100px] py-3 px-2 md:py-3.5 md:px-5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2.5 shadow-sm ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-primary dark:text-white shadow-md scale-[1.02] border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className="text-base">{ph.icon}</span>
              <span>{ph.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Descrição da Fase Ativa */}
      <div className="px-2 flex items-center justify-between">
        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
          {getPhaseInfo(activePhase).icon} {getPhaseInfo(activePhase).description}
        </span>
        <span className="text-[10px] font-bold text-slate-400 italic">
          Clique no card para ver ou enviar fotos
        </span>
      </div>

      {/* Grid de Ângulos Guiados */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="text-primary animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Carregando fotos da vistoria...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PHOTO_ANGLES.map((ang) => {
            const slotPhotos = photos.filter(p => p.fase_execucao === activePhase && p.angulo === ang.id);
            const mainPhoto = slotPhotos[0];
            const slotKey = `${activePhase}:${ang.id}`;
            const isUploadingThis = uploadingSlot === slotKey;

            return (
              <div
                key={ang.id}
                className={`group relative rounded-[2rem] overflow-hidden border transition-all flex flex-col ${
                  mainPhoto
                    ? 'bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                    : 'bg-slate-50/80 dark:bg-slate-900/40 border-dashed border-2 border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50'
                }`}
              >
                {/* Header do Cartão */}
                <div className="p-3.5 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 via-black/20 to-transparent absolute top-0 inset-x-0 pointer-events-none">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 drop-shadow-md">
                    <span>{ang.icon}</span> <span>{ang.label}</span>
                  </span>
                  {mainPhoto && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <CheckCircle2 size={12} />
                    </span>
                  )}
                </div>

                {/* Corpo do Cartão: Imagem ou Dropzone */}
                <div className="aspect-[4/3] w-full relative flex items-center justify-center overflow-hidden">
                  {isUploadingThis ? (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white z-20">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Enviando...</span>
                    </div>
                  ) : null}

                  {mainPhoto ? (
                    <>
                      <img
                        src={mainPhoto.url}
                        alt={ang.label}
                        onClick={() => setLightboxPhoto(mainPhoto)}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Badge de contador se houver mais de 1 foto no slot */}
                      {slotPhotos.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl border border-white/20 backdrop-blur-md">
                          +{slotPhotos.length - 1} foto{slotPhotos.length > 2 ? 's' : ''}
                        </span>
                      )}
                    </>
                  ) : (
                    /* Dropzone Vazia */
                    <div className="text-center p-6 flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl opacity-40 group-hover:scale-110 transition-transform duration-300">{ang.icon}</span>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 max-w-[120px] leading-tight">
                        {ang.description}
                      </p>
                      {!isReadOnly && (
                        <span className="mt-2 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                          + Fotografar
                        </span>
                      )}
                    </div>
                  )}

                  {/* Input de Arquivo Invisível (Se não for readOnly e o usuário clicar no card para add/trocar) */}
                  {!isReadOnly && onUpload && (
                    <label className="absolute inset-0 cursor-pointer z-10" title={`Adicionar foto em ${ang.label}`}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingThis}
                        onChange={(e) => handleSlotUpload(e, activePhase, ang.id)}
                      />
                    </label>
                  )}
                </div>

                {/* Footer de Ações Rápidas (Apenas quando já tem foto) */}
                {mainPhoto && (
                  <div className="p-2.5 bg-slate-900/90 dark:bg-slate-950/90 border-t border-white/5 flex items-center justify-between relative z-20">
                    <button
                      onClick={() => setLightboxPhoto(mainPhoto)}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Eye size={12} /> Ampliar
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Botão de Add foto extra ao slot */}
                      {!isReadOnly && onUpload && (
                        <label className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" title="Adicionar outra foto a este ângulo">
                          <Plus size={14} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSlotUpload(e, activePhase, ang.id)}
                          />
                        </label>
                      )}

                      {/* Botão de Deletar */}
                      {!isReadOnly && onDelete && (
                        <button
                          onClick={() => onDelete(mainPhoto.id, mainPhoto.url)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white/10 rounded-lg transition-colors"
                          title="Excluir esta foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lista Secundária de Fotos Extras (se o usuário mandou várias para o mesmo ângulo ou ângulo livre) */}
      {photos.filter(p => p.fase_execucao === activePhase).length > 5 && (
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h5 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            📷 Todas as Fotos Registradas na Fase — {getPhaseInfo(activePhase).label}
          </h5>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {photos.filter(p => p.fase_execucao === activePhase).map((p, idx) => {
              const angInfo = getAngleInfo(p.angulo);
              return (
                <div
                  key={p.id || idx}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm hover:scale-105 transition-all cursor-pointer"
                  onClick={() => setLightboxPhoto(p)}
                >
                  <img src={p.url} alt={angInfo.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded truncate text-center">
                    {angInfo.icon} {angInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in" onClick={() => setLightboxPhoto(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            
            <div className="w-full flex items-center justify-between p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getAngleInfo(lightboxPhoto.angulo).icon}</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                    Fase: {getPhaseInfo(lightboxPhoto.fase_execucao).label}
                  </span>
                  <h4 className="text-lg font-black uppercase">
                    {getAngleInfo(lightboxPhoto.angulo).label}
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxPhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"
                  title="Baixar imagem original"
                >
                  <Download size={18} />
                </a>
                {!isReadOnly && onDelete && (
                  <button
                    onClick={() => { onDelete(lightboxPhoto.id, lightboxPhoto.url); setLightboxPhoto(null); }}
                    className="p-3 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-2xl transition-all"
                    title="Excluir imagem"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-black">
              <img src={lightboxPhoto.url} alt="Ampliador" className="max-w-full max-h-[75vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comparação Antes x Depois */}
      <PhotoComparisonModal
        isOpen={isComparing}
        onClose={() => setIsComparing(false)}
        photos={photos}
        vehicleDesc={vehicleDesc}
      />

    </div>
  );
};

export default PhotoGuideGallery;
