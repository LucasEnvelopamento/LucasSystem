import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  Calendar, 
  Clock, 
  Shield, 
  CheckCircle2, 
  User, 
  Info,
  DollarSign,
  FileText,
  MessageSquare,
  Camera,
  Loader2,
  Trash2
} from 'lucide-react';
import { getStatusStyle, formatCurrency } from '../../utils/statusUtils';
import { useOrders } from '../../hooks/useData';
import { confirmDialog } from '../../utils/confirm';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../utils/toast';

const DetalhesServicoModal = ({ os, onClose }) => {
  const { fetchOsPhotos, removeServiceFromOrder } = useOrders();
  const { isGestor, isAdmin } = useAuth();
  const isManagement = isGestor || isAdmin;
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    const loadPhotos = async () => {
      if (!os?.id) return;
      setLoadingPhotos(true);
      const res = await fetchOsPhotos(os.id);
      if (res.success) {
        setPhotos(res.data.filter(p => p.tipo !== 'assinatura'));
      }
      setLoadingPhotos(false);
    };
    loadPhotos();
  }, [os?.id]);

  if (!os) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Histórico Detalhado</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ordem de Serviço #{os.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-50 rounded-full transition-all group"
          >
            <X size={24} className="text-slate-300 group-hover:text-slate-900" />
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
          
          {/* Info Veículo e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Car className="text-slate-400" size={18} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Veículo</span>
              </div>
              <p className="text-base font-black text-slate-800 uppercase leading-tight">{os.veiculo_desc}</p>
              <p className="text-[10px] font-black text-primary font-mono mt-2 uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg inline-block">
                Placa: {os.placa || 'N/A'}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-slate-400" size={18} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Progresso</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(os.status)}`}>
                  {os.status}
                </span>
                <span className="text-sm font-black text-primary italic">{os.progresso || 0}%</span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-100 p-0.5">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${os.progresso || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Seção de Observações Separadas */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                <MessageSquare size={14} className="text-amber-500" /> Instruções do Gestor
              </h4>
              <div className="bg-amber-50/30 p-6 rounded-3xl border-2 border-amber-100/20 italic">
                {os.observacoes ? (
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">
                    "{os.observacoes}"
                  </p>
                ) : (
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center py-2 italic">
                    Sem instruções adicionais do gestor.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                <Shield size={14} className="text-emerald-500" /> Relatório do Operador
              </h4>
              <div className="bg-emerald-50/30 p-6 rounded-3xl border-2 border-emerald-100/20 italic">
                {os.obs_tecnico ? (
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">
                    "{os.obs_tecnico}"
                  </p>
                ) : (
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center py-2 italic">
                    Nenhum apontamento técnico registrado.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Galeria de Fotos da Execução */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
              <Camera size={14} className="text-primary" /> Galeria de Execução
            </h4>
            {loadingPhotos ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={24} className="text-primary animate-spin" />
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo, i) => (
                  <div key={photo.id || i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:scale-[1.05] transition-all cursor-pointer bg-slate-50">
                    <img src={photo.url} alt={`Execução ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <Camera size={24} className="text-slate-300 mx-auto mb-2 opacity-30" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Nenhuma foto anexada pelo operador.</p>
              </div>
            )}
          </div>

          {/* Lista de Itens do Serviço */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" /> itens Concluídos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {os.servicos_detalhados && Array.isArray(os.servicos_detalhados) && os.servicos_detalhados.length > 0 ? (
                os.servicos_detalhados.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item.progresso === 100 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500'}`} />
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate">{item.nome}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-black text-primary italic">{item.progresso || 0}%</span>
                      {(isManagement && os.servicos_detalhados.length > 1) && (
                        <button 
                          onClick={async () => {
                            const confirm = await confirmDialog(
                              'Remover Serviço',
                              `Deseja remover o serviço "${item.nome}"? O valor total será recalculado e materiais serão devolvidos ao estoque se a OS estiver entregue.`,
                              'Remover',
                              'Cancelar'
                            );
                            if (confirm) {
                              const res = await removeServiceFromOrder(os.id, idx);
                              if (res.success) toast.success('Serviço removido com sucesso!');
                              else toast.error(res.error || 'Erro ao remover serviço');
                            }
                          }}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remover este serviço da OS"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">{os.servico}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between px-2">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Finalizado em</p>
              <p className="text-base font-black text-slate-800 italic">
                {os.data_fim ? new Date(os.data_fim).toLocaleDateString('pt-BR') : os.created_at ? new Date(os.created_at).toLocaleDateString('pt-BR') : '--/--/----'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total do Serviço</p>
              <p className="text-3xl font-black text-primary tracking-tighter">
                {formatCurrency(os.valor_total || os.valor || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-white border-t border-slate-50 shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
          >
            Fechar Relatório
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}} />
    </div>
  );
};

export default DetalhesServicoModal;
