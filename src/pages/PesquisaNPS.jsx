import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  Sparkles, 
  Car, 
  Award, 
  ArrowLeft,
  Smile,
  Meh,
  Frown,
  ThumbsUp
} from 'lucide-react';
import { supabase, hasRealConnection } from '../lib/supabase';
import { useBrand } from '../contexts/BrandContext';
import { toast } from '../utils/toast';

const PesquisaNPS = () => {
  const { osId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const brand = useBrand();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState(null);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);

  // Fallback info via URL query params se a OS não for achada online (ou demo)
  const queryNome = searchParams.get('cliente') || 'Cliente VIP';
  const queryVeiculo = searchParams.get('veiculo') || 'Seu Veículo';
  const queryServico = searchParams.get('servico') || 'Trabalho Automotivo';

  useEffect(() => {
    const fetchOrderAndFeedback = async () => {
      setLoading(true);
      try {
        let osData = null;
        let fbData = null;

        if (hasRealConnection()) {
          // 1. Tentar buscar a OS no Supabase
          if (osId && osId !== 'demo') {
            const { data: osRes } = await supabase
              .from('ordens_servico')
              .select('*')
              .eq('id', osId)
              .maybeSingle();
            
            if (osRes) osData = osRes;

            // 2. Checar se já existe avaliação para essa OS
            const { data: fbRes } = await supabase
              .from('pesquisas_nps')
              .select('*')
              .eq('os_id', osId)
              .maybeSingle();

            if (fbRes) fbData = fbRes;
          }
        }

        // Fallback no localStorage
        if (!osData && osId && osId !== 'demo') {
          const localOrders = JSON.parse(localStorage.getItem('ordens_servico_local') || '[]');
          osData = localOrders.find(o => String(o.id) === String(osId));
        }

        if (!fbData && osId) {
          const localFbs = JSON.parse(localStorage.getItem('pesquisas_nps_local') || '[]');
          fbData = localFbs.find(f => String(f.os_id) === String(osId));
        }

        // Configurar estado
        if (osData) {
          setOrder(osData);
        } else {
          // Usar dados padrão / URL
          setOrder({
            id: osId || 'DEMO-100',
            cliente_nome: queryNome,
            veiculo_desc: queryVeiculo,
            servico: queryServico,
            status: 'ENTREGUE'
          });
        }

        if (fbData) {
          setExistingFeedback(fbData);
          setNota(fbData.nota);
          setComentario(fbData.comentario || '');
          setSubmitted(true);
        }

      } catch (err) {
        console.error('Erro ao buscar dados NPS:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndFeedback();
  }, [osId, queryNome, queryVeiculo, queryServico]);

  // Classificação do NPS
  const getClassificacao = (val) => {
    if (val === null || val === undefined) return null;
    if (val >= 9) return { label: 'PROMOTOR 🤩', color: 'emerald', desc: 'Uau! Que incrível saber que você amou nossa entrega!' };
    if (val >= 7) return { label: 'NEUTRO 😐', color: 'amber', desc: 'Obrigado pela confiança! O que podemos fazer para alcançar a nota 10 na próxima?' };
    return { label: 'DETRATOR 😡', color: 'rose', desc: 'Poxa, lamentamos não atingir suas expectativas. Nos conte o que houve para corrigirmos imediatamente!' };
  };

  const currentClass = getClassificacao(nota);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nota === null) {
      toast.warning('Por favor, selecione uma nota de 0 a 10 antes de enviar.');
      return;
    }

    setSubmitting(true);
    const classLabel = nota >= 9 ? 'PROMOTOR' : (nota >= 7 ? 'NEUTRO' : 'DETRATOR');

    const feedbackPayload = {
      os_id: order?.id || osId || 'DEMO',
      cliente_nome: order?.cliente_nome || queryNome,
      cliente_telefone: order?.cliente_telefone || '',
      veiculo_texto: order?.veiculo_desc || order?.veiculo_texto || queryVeiculo,
      servico_texto: order?.servico || queryServico,
      nota: Number(nota),
      comentario: comentario.trim(),
      classificacao: classLabel,
      respondido_em: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    try {
      if (hasRealConnection()) {
        const { error } = await supabase
          .from('pesquisas_nps')
          .insert([feedbackPayload]);
        
        if (error) {
          console.warn('Falha no insert Supabase, salvando local:', error);
        }
      }

      // Salvar sempre em localStorage também
      const localFbs = JSON.parse(localStorage.getItem('pesquisas_nps_local') || '[]');
      const updatedLocal = [...localFbs.filter(f => String(f.os_id) !== String(feedbackPayload.os_id)), feedbackPayload];
      localStorage.setItem('pesquisas_nps_local', JSON.stringify(updatedLocal));

      // Se existir a OS no local, marcar nps_respondido = true
      const localOrders = JSON.parse(localStorage.getItem('ordens_servico_local') || '[]');
      const orderIdx = localOrders.findIndex(o => String(o.id) === String(feedbackPayload.os_id));
      if (orderIdx !== -1) {
        localOrders[orderIdx].nps_respondido = true;
        localOrders[orderIdx].nps_nota = Number(nota);
        localStorage.setItem('ordens_servico_local', JSON.stringify(localOrders));
      }

      setSubmitted(true);
      toast.success('Sua avaliação foi enviada com sucesso! Muito obrigado 🌟');
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      toast.error('Ocorreu um erro ao enviar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Olá, equipe da *${brand.name || 'OsSystem'}*! Acabei de avaliar meu atendimento da O.S. #${order?.id || osId} com nota *${nota}/10* (${nota >= 9 ? '🤩 Excelente!' : 'Agradeço o atendimento!'}). ${comentario ? `\n💬 Meu comentário: "${comentario}"` : ''}`;
    const url = `https://wa.me/${brand.whatsapp ? brand.whatsapp.replace(/\D/g, '') : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando pesquisa de satisfação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-400">
      
      {/* Efeitos de Luz de Fundo */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header com Logo */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/60 text-white font-black">
            <Star className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">{brand.name || 'OsSystem'}</h1>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Pesquisa de Satisfação NPS</span>
          </div>
        </div>
        <a 
          href="/meu-veiculo" 
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 transition-all"
        >
          <Car className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Portal</span> Meu Veículo
        </a>
      </header>

      {/* Card Principal */}
      <main className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl z-10 animate-in zoom-in-95 duration-300">
        
        {/* Informações da O.S. */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
              Avaliação de Entrega — O.S. #{order?.id || osId}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{order?.veiculo_desc || order?.veiculo_texto || queryVeiculo}</span>
            </h2>
            <p className="text-xs text-emerald-400 font-bold mt-0.5">{order?.servico || queryServico}</p>
          </div>
          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Cliente:</span>
            <span className="text-sm font-extrabold text-white">{order?.cliente_nome || queryNome}</span>
          </div>
        </div>

        {submitted ? (
          /* TELA DE AGRADECIMENTO / CONFIRMAÇÃO */
          <div className="text-center py-6 space-y-6 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/15 shadow-xl shadow-emerald-950 font-black text-3xl animate-bounce">
              {nota >= 9 ? '🤩' : (nota >= 7 ? '😊' : '🙏')}
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                Avaliação Registrada
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Muito Obrigado, {order?.cliente_nome?.split(' ')[0] || queryNome?.split(' ')[0]}!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Sua nota <strong className="text-emerald-400 text-lg">{nota}/10</strong> é fundamental para evoluirmos sempre nosso padrão de qualidade, transparência e acabamento.
              </p>
            </div>

            {comentario && (
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 max-w-md mx-auto text-left text-xs italic text-slate-400">
                "{comentario}"
              </div>
            )}

            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>Enviar Depoimento no WhatsApp da Loja</span>
              </button>

              <a
                href="/meu-veiculo"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <span>Acessar Histórico da Minha Frota 🚗</span>
              </a>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO INTERATIVO DE AVALIAÇÃO */
          <form onSubmit={handleSubmit} className="space-y-8 text-center">
            
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                De 0 a 10, qual a probabilidade de você recomendar nossa loja para um amigo ou familiar?
              </h3>
              <p className="text-xs text-slate-400">
                Sua resposta espontânea nos ajuda a manter a excelência automotiva.
              </p>
            </div>

            {/* Escala de 0 a 10 */}
            <div className="space-y-3">
              <div className="grid grid-cols-11 gap-1 sm:gap-2 max-w-xl mx-auto">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = nota === num;
                  let btnStyle = "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500";
                  
                  if (isSelected) {
                    if (num >= 9) btnStyle = "bg-emerald-500 border-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/30 scale-110 z-10 ring-2 ring-white/20";
                    else if (num >= 7) btnStyle = "bg-amber-400 border-amber-300 text-slate-950 font-black shadow-lg shadow-amber-400/30 scale-110 z-10 ring-2 ring-white/20";
                    else btnStyle = "bg-rose-500 border-rose-400 text-white font-black shadow-lg shadow-rose-500/30 scale-110 z-10 ring-2 ring-white/20";
                  }

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNota(num)}
                      className={`h-11 sm:h-12 rounded-xl border font-bold text-sm sm:text-base transition-all flex items-center justify-center ${btnStyle}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Rótulos da Escala */}
              <div className="flex justify-between text-[11px] font-bold text-slate-500 max-w-xl mx-auto px-1">
                <span className="flex items-center gap-1 text-rose-400/80">
                  <span>😡 0 - Pouco provável</span>
                </span>
                <span className="hidden sm:inline text-amber-400/80">😐 7-8 Neutro</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span>🤩 10 - Com certeza!</span>
                </span>
              </div>
            </div>

            {/* Feedback Visual Dinâmico */}
            {currentClass && (
              <div className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
                currentClass.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                currentClass.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="font-black text-xs uppercase tracking-wider mb-1">{currentClass.label}</div>
                <p className="text-xs text-slate-300">{currentClass.desc}</p>
              </div>
            )}

            {/* Caixa de Comentário Opcional */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-slate-300">
                O que motivou sua nota? <span className="text-slate-500 font-normal">(Opcional)</span>
              </label>
              <textarea
                rows="3"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte o que mais gostou (brilho, acabamento, atendimento) ou como podemos melhorar ainda mais..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={submitting || nota === null}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                nota === null ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60' :
                'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-950 transform hover:-translate-y-0.5'
              }`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>Enviar Avaliação NPS</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* Footer minimalista */}
      <footer className="w-full max-w-2xl mx-auto mt-8 text-center text-xs text-slate-500 z-10">
        <p>© {new Date().getFullYear()} {brand.name || 'OsSystem'}. Excelência, Acabamento & Garantia Automotiva.</p>
      </footer>
    </div>
  );
};

export default PesquisaNPS;
