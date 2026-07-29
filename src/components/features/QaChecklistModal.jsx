import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Star, 
  Car, 
  User, 
  Sparkles, 
  Flame, 
  ThumbsUp, 
  ThumbsDown,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { toast } from '../../utils/toast';

const QaChecklistModal = ({ os, onClose, onApprove, onReject }) => {
  const [checks, setChecks] = useState({
    acabamento: false,
    bordas: false,
    montagem: false,
    vcr: false
  });
  const [qaScore, setQaScore] = useState(5);
  const [observacao, setObservacao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!os) return null;

  const allChecked = checks.acabamento && checks.bordas && checks.montagem && checks.vcr;

  const handleToggle = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAprovar = async () => {
    if (!allChecked) {
      toast.warning('Atenção: Todos os pontos de vistoria de qualidade devem ser checados!');
      return;
    }
    setIsSubmitting(true);
    try {
      // Incrementar o Streak do técnico
      if (os.tecnico_id) {
        const key = `ossystem_tecnico_streak_${os.tecnico_id}`;
        const atual = Number(localStorage.getItem(key) || 12);
        localStorage.setItem(key, String(atual + 1));
      }

      // Salvar histórico de QA aprovado no localStorage para auditoria
      const reg = {
        os_id: os.id,
        tecnico_id: os.tecnico_id,
        tecnico_nome: os.tecnico || os.tecnico_nome || 'Especialista',
        veiculo: os.veiculo_desc || 'Veículo',
        score: qaScore,
        obs: observacao,
        status: 'APROVADO',
        data: new Date().toISOString()
      };
      const hist = JSON.parse(localStorage.getItem('ossystem_qa_history') || '[]');
      localStorage.setItem('ossystem_qa_history', JSON.stringify([reg, ...hist]));

      await onApprove(qaScore, observacao);
      toast.success('Vistoria QA Aprovada! Veículo liberado e streak do técnico incrementado 🔥');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao aprovar vistoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReprovar = async () => {
    if (!observacao.trim()) {
      toast.warning('Para solicitar retrabalho, descreva o motivo ou defeito na observação.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Zerar o Streak do técnico por retrabalho
      if (os.tecnico_id) {
        const key = `ossystem_tecnico_streak_${os.tecnico_id}`;
        localStorage.setItem(key, '0');
      }

      // Salvar histórico de QA reprovado
      const reg = {
        os_id: os.id,
        tecnico_id: os.tecnico_id,
        tecnico_nome: os.tecnico || os.tecnico_nome || 'Especialista',
        veiculo: os.veiculo_desc || 'Veículo',
        score: 1,
        obs: observacao,
        status: 'RETRABALHO',
        data: new Date().toISOString()
      };
      const hist = JSON.parse(localStorage.getItem('ossystem_qa_history') || '[]');
      localStorage.setItem('ossystem_qa_history', JSON.stringify([reg, ...hist]));

      await onReject(observacao);
      toast.error('Serviço reprovado no QA. Devolvido para retrabalho e sequência zerada!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao registrar retrabalho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[250] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-6 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck size={26} />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] uppercase tracking-widest border border-emerald-500/30">
                QA • Vistoria de Qualidade
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight mt-0.5">
                Liberação de OS #{os.id}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Resumo Rápido da OS */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs px-6">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
            <Car size={15} className="text-primary" />
            <span>{os.veiculo_desc || 'Veículo'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <User size={14} />
            <span>Resp: <strong className="text-slate-800 dark:text-white font-black">{os.tecnico || os.tecnico_nome || 'Especialista'}</strong></span>
          </div>
        </div>

        {/* Corpo do Checklist */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-primary" />
              <span>Itens Obrigatórios de Auditoria</span>
            </h4>

            <div className="space-y-2.5">
              {/* Item 1 */}
              <div 
                onClick={() => handleToggle('acabamento')}
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  checks.acabamento 
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 transition-all ${
                  checks.acabamento ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-slate-50'
                }`}>
                  {checks.acabamento && <CheckCircle2 size={14} />}
                </div>
                <div>
                  <p className="text-xs font-black uppercase">🧼 Acabamento & Limpeza</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Sem resíduos de composto polidor, cola, poeira interna ou marcas de dedo.</p>
                </div>
              </div>

              {/* Item 2 */}
              <div 
                onClick={() => handleToggle('bordas')}
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  checks.bordas 
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 transition-all ${
                  checks.bordas ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-slate-50'
                }`}>
                  {checks.bordas && <CheckCircle2 size={14} />}
                </div>
                <div>
                  <p className="text-xs font-black uppercase">🔍 Bordas, Cantos & Arremates</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Películas e PPF devidamente aderidos nos cantos, sem bolhas, poeiras ou descolamento.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div 
                onClick={() => handleToggle('montagem')}
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  checks.montagem 
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 transition-all ${
                  checks.montagem ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-slate-50'
                }`}>
                  {checks.montagem && <CheckCircle2 size={14} />}
                </div>
                <div>
                  <p className="text-xs font-black uppercase">⚡ Montagem & Encaixes</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Maçanetas, retrovisores, borrachas, vidros e acabamentos reinstalados perfeitamente sem ruídos.</p>
                </div>
              </div>

              {/* Item 4 */}
              <div 
                onClick={() => handleToggle('vcr')}
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  checks.vcr 
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 transition-all ${
                  checks.vcr ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-slate-50'
                }`}>
                  {checks.vcr && <CheckCircle2 size={14} />}
                </div>
                <div>
                  <p className="text-xs font-black uppercase">📋 Conformidade Inicial (VCR)</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Veículo intacto, sem nenhuma nova avaria ou arranhão gerado na oficina.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Avaliação QA Score pro Técnico */}
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Nota de Qualidade do Especialista</span>
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-500 text-white">
                {qaScore} / 5
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((nota) => (
                <button
                  key={nota}
                  type="button"
                  onClick={() => setQaScore(nota)}
                  className={`p-2 rounded-xl transition-all ${
                    nota <= qaScore ? 'text-amber-500 scale-110' : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                  }`}
                  title={`Nota ${nota}`}
                >
                  <Star size={24} className={nota <= qaScore ? 'fill-amber-500' : ''} />
                </button>
              ))}
            </div>
          </div>

          {/* Observações / Defeito para Retrabalho */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
              Parecer / Motivo de Retrabalho (Opcional se aprovado)
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Descreva detalhes do acabamento ou o que precisa ser corrigido caso reprovado..."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Rodapé - Botões Ação */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleReprovar}
            className="flex-1 py-3.5 px-4 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/60 transition-all active:scale-95 disabled:opacity-50"
          >
            <ThumbsDown size={16} />
            <span>Reprovar (Retrabalho)</span>
          </button>

          <button
            type="button"
            disabled={!allChecked || isSubmitting}
            onClick={handleAprovar}
            className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
              allChecked 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30' 
                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ThumbsUp size={16} />
            <span>Aprovar QA & Entregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QaChecklistModal;
