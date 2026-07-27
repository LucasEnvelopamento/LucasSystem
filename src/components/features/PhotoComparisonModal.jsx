import React, { useState, useMemo } from 'react';
import { X, SlidersHorizontal, Eye, ShieldCheck, ArrowLeft, ArrowRight, Camera } from 'lucide-react';
import { PHOTO_ANGLES, getAngleInfo } from '../../utils/photoConstants';

const PhotoComparisonModal = ({ isOpen, onClose, photos = [], vehicleDesc = 'Veículo' }) => {
  const [selectedAngle, setSelectedAngle] = useState('frontal');
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'split'

  // Agrupa fotos por ângulo com antes e depois disponíveis
  const availableComparisons = useMemo(() => {
    const angles = [];
    PHOTO_ANGLES.forEach(ang => {
      const antes = photos.find(p => p.angulo === ang.id && p.fase_execucao === 'antes');
      const depois = photos.find(p => p.angulo === ang.id && p.fase_execucao === 'depois');
      if (antes && depois) {
        angles.push({
          ...ang,
          antesUrl: antes.url,
          depoisUrl: depois.url
        });
      }
    });
    return angles;
  }, [photos]);

  // Se o ângulo selecionado não tiver comparação disponível, seleciona o primeiro disponível
  React.useEffect(() => {
    if (availableComparisons.length > 0) {
      const currentExists = availableComparisons.some(c => c.id === selectedAngle);
      if (!currentExists) {
        setSelectedAngle(availableComparisons[0].id);
      }
    }
  }, [availableComparisons, selectedAngle]);

  if (!isOpen) return null;

  const currentComparison = availableComparisons.find(c => c.id === selectedAngle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#111827] w-full max-w-5xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header Fixo */}
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl shadow-inner">
              ⚖️
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                Inspeção Digital & Acabamento
              </span>
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                Comparador Antes x Depois — {vehicleDesc}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'slider' ? 'split' : 'slider')}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:border-primary transition-all flex items-center gap-2 shadow-sm"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">{viewMode === 'slider' ? 'Lado a Lado' : 'Modo Deslizante'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
          {availableComparisons.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                <Camera size={32} />
              </div>
              <h4 className="text-base font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">
                Nenhuma Comparação Completa Disponível
              </h4>
              <p className="text-xs font-bold text-slate-400 max-w-md mx-auto leading-relaxed">
                Para ativar o comparador de ângulos, é necessário registrar ao menos uma foto do mesmo guia visual (Ex: Frontal) na fase <b>Antes</b> e na fase <b>Depois</b>.
              </p>
            </div>
          ) : (
            <>
              {/* Seletor de Guias de Ângulo */}
              <div className="flex flex-wrap gap-2 justify-center pb-2 border-b border-slate-100 dark:border-slate-800">
                {availableComparisons.map((ang) => (
                  <button
                    key={ang.id}
                    onClick={() => { setSelectedAngle(ang.id); setSliderPos(50); }}
                    className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-sm ${
                      selectedAngle === ang.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{ang.icon}</span>
                    <span>{ang.label}</span>
                  </button>
                ))}
              </div>

              {/* Área de Exibição da Comparação */}
              {currentComparison && (
                <div className="space-y-4">
                  {viewMode === 'slider' ? (
                    /* Modo Deslizante (Slider) */
                    <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] md:aspect-[16/9] rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-2xl bg-black select-none">
                      {/* Foto Depois (Fundo) */}
                      <img
                        src={currentComparison.depoisUrl}
                        alt="Depois"
                        className="absolute inset-0 w-full h-full object-contain md:object-cover pointer-events-none"
                      />
                      <span className="absolute top-4 right-4 z-10 bg-emerald-600/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-1.5">
                        <ShieldCheck size={14} /> Depois (Acabado)
                      </span>

                      {/* Foto Antes (Cortada com clip-path sem distorção) */}
                      <div className="absolute inset-0 z-10 pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                        <img
                          src={currentComparison.antesUrl}
                          alt="Antes"
                          className="absolute inset-0 w-full h-full object-contain md:object-cover pointer-events-none"
                        />
                        <span className="absolute top-4 left-4 bg-amber-600/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-1.5">
                          📥 Antes (Recepção)
                        </span>
                      </div>

                      {/* Linha Divisória / Puxador */}
                      <div
                        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-full shadow-2xl border-2 border-primary flex items-center justify-center cursor-ew-resize hover:scale-110 transition-transform">
                          <div className="flex items-center gap-0.5">
                            <ArrowLeft size={12} />
                            <ArrowRight size={12} />
                          </div>
                        </div>
                      </div>

                      {/* Input Range Invisível Sobreposto */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPos}
                        onChange={(e) => setSliderPos(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      />
                    </div>
                  ) : (
                    /* Modo Lado a Lado (Split) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-xl flex items-center gap-2">
                            📥 Antes (Recepção)
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">{currentComparison.label}</span>
                        </div>
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black shadow-xl">
                          <img
                            src={currentComparison.antesUrl}
                            alt="Antes"
                            className="w-full h-full object-contain md:object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-xl flex items-center gap-2">
                            <ShieldCheck size={14} /> Depois (Acabado)
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">{currentComparison.label}</span>
                        </div>
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black shadow-xl">
                          <img
                            src={currentComparison.depoisUrl}
                            alt="Depois"
                            className="w-full h-full object-contain md:object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-center text-[11px] font-bold text-slate-400 italic">
                    {viewMode === 'slider' 
                      ? '💡 Arraste a linha central para a esquerda ou direita para comparar a transformação veicular.'
                      : '💡 Visualização simultânea de inspeção inicial e resultado de acabamento.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all"
          >
            Concluir Análise
          </button>
        </div>

      </div>
    </div>
  );
};

export default PhotoComparisonModal;
