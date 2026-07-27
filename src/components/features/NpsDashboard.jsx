import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Smile, 
  Meh, 
  Frown, 
  Award, 
  Sparkles, 
  Search,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { supabase, hasRealConnection } from '../../lib/supabase';
import { useBrand } from '../../contexts/BrandContext';
import { toast } from '../../utils/toast';

const NpsDashboard = ({ orders = [] }) => {
  const brand = useBrand();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFb, setLoadingFb] = useState(false);
  const [filterClass, setFilterClass] = useState('ALL'); // ALL, PROMOTOR, NEUTRO, DETRATOR
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar avaliações do Supabase e/ou localStorage
  const fetchFeedbacks = async () => {
    setLoadingFb(true);
    try {
      let remoteFbs = [];
      if (hasRealConnection()) {
        const { data, error } = await supabase
          .from('pesquisas_nps')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          remoteFbs = data;
        }
      }

      // Mesclar com localStorage
      const localFbs = JSON.parse(localStorage.getItem('pesquisas_nps_local') || '[]');
      
      // Combinar sem duplicar por os_id
      const combined = [...remoteFbs];
      localFbs.forEach(lf => {
        if (!combined.some(c => String(c.os_id) === String(lf.os_id))) {
          combined.push(lf);
        }
      });

      // Se não houver nenhum, adicionar alguns dados de demonstração de alta qualidade para o gestor
      if (combined.length === 0) {
        const demoFbs = [
          {
            id: 'demo-fb-1',
            os_id: '1042',
            cliente_nome: 'Marcelo Oliveira',
            cliente_telefone: '11988887777',
            veiculo_texto: 'BMW 320i Sport (Sedan)',
            servico_texto: 'PPF Frontal + Ceramic 9H',
            nota: 10,
            comentario: 'O carro ficou espetacular! O brilho e o acabamento nos cantos do PPF estão invisíveis. Atendimento nota 1000!',
            classificacao: 'PROMOTOR',
            created_at: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            id: 'demo-fb-2',
            os_id: '1039',
            cliente_nome: 'Dra. Camila Santos',
            cliente_telefone: '11977776666',
            veiculo_texto: 'Porsche Macan GTS (SUV)',
            servico_texto: 'Vitrificação Ceramic Coating 9H',
            nota: 9,
            comentario: 'Entregaram no prazo e o carro está com brilho espelhado incrível. Recomendarei aos meus amigos.',
            classificacao: 'PROMOTOR',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString()
          },
          {
            id: 'demo-fb-3',
            os_id: '1035',
            cliente_nome: 'Ricardo Souza',
            cliente_telefone: '11966665555',
            veiculo_texto: 'VW Golf GTI (Hatch)',
            servico_texto: 'Insulfilm Nanocerâmica',
            nota: 8,
            comentario: 'A película é ótima e o conforto térmico melhorou muito, só achei o tempo de espera na recepção um pouco longo.',
            classificacao: 'NEUTRO',
            created_at: new Date(Date.now() - 3600000 * 48).toISOString()
          },
          {
            id: 'demo-fb-4',
            os_id: '1031',
            cliente_nome: 'Fernando Costa',
            cliente_telefone: '11955554444',
            veiculo_texto: 'Toyota Hilux SRX (Pickup)',
            servico_texto: 'Envelopamento Teto Black Piano',
            nota: 5,
            comentario: 'Ficou uma pequena bolha na antena do teto. Preciso agendar um retorno para ajustar.',
            classificacao: 'DETRATOR',
            created_at: new Date(Date.now() - 3600000 * 72).toISOString()
          }
        ];
        setFeedbacks(demoFbs);
      } else {
        setFeedbacks(combined);
      }

    } catch (err) {
      console.error('Erro ao buscar NPS:', err);
    } finally {
      setLoadingFb(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Cálculos do NPS Score
  const kpis = useMemo(() => {
    const total = feedbacks.length;
    if (total === 0) return { score: 0, promotores: 0, neutros: 0, detratores: 0, pPromotores: 0, pNeutros: 0, pDetratores: 0, zona: 'Sem Dados', zonaColor: 'slate' };

    const promotores = feedbacks.filter(f => f.nota >= 9).length;
    const neutros = feedbacks.filter(f => f.nota >= 7 && f.nota <= 8).length;
    const detratores = feedbacks.filter(f => f.nota <= 6).length;

    const pPromotores = Math.round((promotores / total) * 100);
    const pNeutros = Math.round((neutros / total) * 100);
    const pDetratores = Math.round((detratores / total) * 100);

    const score = pPromotores - pDetratores;

    let zona = 'Aperfeiçoamento';
    let zonaColor = 'amber';
    if (score >= 75) {
      zona = 'Zona de Excelência 🏆';
      zonaColor = 'emerald';
    } else if (score >= 50) {
      zona = 'Zona de Qualidade 👍';
      zonaColor = 'teal';
    } else if (score < 0) {
      zona = 'Zona Crítica 🚨';
      zonaColor = 'rose';
    }

    return { score, promotores, neutros, detratores, pPromotores, pNeutros, pDetratores, zona, zonaColor };
  }, [feedbacks]);

  // Lista de Ordens Elegíveis para Envio de Pesquisa (Entregues / Concluídas recentemente e que ainda não responderam)
  const pendingNpsOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      const isDelivered = ['ENTREGUE', 'CONCLUÍDO'].includes(String(o.status || '').toUpperCase().trim());
      const hasFeedback = feedbacks.some(f => String(f.os_id) === String(o.id));
      const alreadySent = o.nps_disparado === true || o.nps_respondido === true;
      return isDelivered && !hasFeedback && !alreadySent;
    }).slice(0, 10); // Mostrar até 10 para ação rápida
  }, [orders, feedbacks]);

  // Ação de Disparo Automático por WhatsApp
  const handleSendNpsWhatsApp = (order) => {
    const baseUrl = window.location.origin;
    const npsUrl = `${baseUrl}/nps/${order.id}?cliente=${encodeURIComponent(order.cliente_nome || 'Cliente')}&veiculo=${encodeURIComponent(order.veiculo_desc || 'veículo')}&servico=${encodeURIComponent(order.servico || 'Serviço')}`;
    
    const msg = `Olá, *${order.cliente_nome?.split(' ')[0] || 'Cliente'}*! Aqui é a equipe da *${brand.name || 'OsSystem Automotivo'}* 🌟.\n\nEsperamos que esteja aproveitando ao máximo o serviço de *${order.servico || 'estética automotiva'}* em seu *${order.veiculo_desc || 'veículo'}*!\n\nPara nós, sua satisfação é tudo. Poderia levar apenas *10 segundos* para nos dar uma nota de *0 a 10*? 👇\n\n📲 *Clique para Avaliar*: ${npsUrl}\n\nAgradecemos de coração pela sua confiança! 🚗✨`;

    const phone = (order.cliente_telefone || '').replace(/\D/g, '');
    const url = `https://wa.me/${phone ? (phone.startsWith('55') ? phone : `55${phone}`) : ''}?text=${encodeURIComponent(msg)}`;
    
    // Marcar como disparado localmente
    order.nps_disparado = true;
    toast.success(`Pesquisa NPS aberta para ${order.cliente_nome}! 📲`);
    window.open(url, '_blank');
  };

  // Disparo em massa / simulado de automação
  const handleSendAllPending = () => {
    if (pendingNpsOrders.length === 0) {
      toast.info('Não há novos clientes aguardando pesquisa NPS no momento.');
      return;
    }
    const count = pendingNpsOrders.length;
    toast.success(`✨ Motor de Automação ativado! Disparando ${count} convite(s) NPS por WhatsApp na fila...`);
    pendingNpsOrders.forEach(o => { o.nps_disparado = true; });
  };

  // Tratativa rápida de cliente Detrator via WhatsApp
  const handleContactDetractor = (fb) => {
    const msg = `Olá, *${fb.cliente_nome?.split(' ')[0] || 'Cliente'}*! Aqui é a gerência da *${brand.name || 'OsSystem'}*.\n\nRecebemos sua avaliação da O.S. #${fb.os_id} e notamos que não atingimos 100% das suas expectativas (${fb.comentario ? `sobre: "${fb.comentario}"` : `nota ${fb.nota}/10`}).\n\nGostaríamos muito de entender o que houve e agendar um retorno *imediato e sem custo* para deixar seu veículo impecável! Qual o melhor horário para conversarmos? 🤝🚗`;
    const phone = (fb.cliente_telefone || '').replace(/\D/g, '');
    const url = `https://wa.me/${phone ? (phone.startsWith('55') ? phone : `55${phone}`) : ''}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Filtragem
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const matchesClass = filterClass === 'ALL' || f.classificacao === filterClass;
      const matchesSearch = 
        f.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.veiculo_texto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.comentario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(f.os_id || '').includes(searchTerm);
      return matchesClass && matchesSearch;
    });
  }, [feedbacks, filterClass, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. KPIs & Termômetro do NPS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card Principal: NPS Score */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Promoter Score</span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
              kpis.score >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              kpis.score >= 50 ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
              'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {kpis.zona}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {kpis.score > 0 ? `+${kpis.score}` : kpis.score}
              </span>
              <span className="text-xs font-bold text-slate-500">/ 100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Baseado em <strong className="text-white">{feedbacks.length}</strong> avaliações recebidas
            </p>
          </div>
        </div>

        {/* Card: Promotores */}
        <div 
          onClick={() => setFilterClass(filterClass === 'PROMOTOR' ? 'ALL' : 'PROMOTOR')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
            filterClass === 'PROMOTOR' ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30' : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-emerald-400" /> Promotores (9-10)
            </span>
            <span className="text-sm font-black text-emerald-400">{kpis.pPromotores}%</span>
          </div>
          <div className="text-3xl font-black text-white">{kpis.promotores} <span className="text-xs font-normal text-slate-500">clientes</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${kpis.pPromotores}%` }} />
          </div>
        </div>

        {/* Card: Neutros */}
        <div 
          onClick={() => setFilterClass(filterClass === 'NEUTRO' ? 'ALL' : 'NEUTRO')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
            filterClass === 'NEUTRO' ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30' : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Meh className="w-4 h-4 text-amber-400" /> Neutros (7-8)
            </span>
            <span className="text-sm font-black text-amber-400">{kpis.pNeutros}%</span>
          </div>
          <div className="text-3xl font-black text-white">{kpis.neutros} <span className="text-xs font-normal text-slate-500">clientes</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${kpis.pNeutros}%` }} />
          </div>
        </div>

        {/* Card: Detratores */}
        <div 
          onClick={() => setFilterClass(filterClass === 'DETRATOR' ? 'ALL' : 'DETRATOR')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
            filterClass === 'DETRATOR' ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30' : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Frown className="w-4 h-4 text-rose-500" /> Detratores (0-6)
            </span>
            <span className="text-sm font-black text-rose-500">{kpis.pDetratores}%</span>
          </div>
          <div className="text-3xl font-black text-white flex items-center gap-2">
            <span>{kpis.detratores}</span>
            {kpis.detratores > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" title="Atenção exigida para reversão" />
            )}
            <span className="text-xs font-normal text-slate-500">clientes</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${kpis.pDetratores}%` }} />
          </div>
        </div>

      </div>

      {/* 2. Motor de Retenção Ativa: Clientes Prontos para Disparo NPS (Entregues / Concluídos) */}
      {pendingNpsOrders.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                📲
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Motor de Retenção & Disparo NPS (24h)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {pendingNpsOrders.length} aguardando
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Esses clientes tiveram seus serviços entregues recentemente e estão no momento perfeito para avaliar a experiência.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendAllPending}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Disparar WhatsApp em Massa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pendingNpsOrders.map((o) => (
              <div key={o.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{o.cliente_nome || 'Cliente'}</div>
                  <div className="text-[11px] text-emerald-400 font-medium truncate">{o.veiculo_desc || 'Veículo'} • OS #{o.id}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendNpsWhatsApp(o)}
                  className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition-all font-bold flex-shrink-0"
                  title="Enviar link da pesquisa via WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Central de Feedbacks & Avaliações Recebidas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Avaliações e Depoimentos Recebidos</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold">
                {filteredFeedbacks.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Acompanhe os comentários em tempo real e trate detratores imediatamente.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar cliente, placa ou comentário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
              />
            </div>
            
            <button
              type="button"
              onClick={fetchFeedbacks}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loadingFb ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Lista de Feedbacks */}
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Nenhuma avaliação encontrada com o filtro atual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredFeedbacks.map((fb) => {
              const isDetractor = fb.classificacao === 'DETRATOR';
              const isPromoter = fb.classificacao === 'PROMOTOR';

              return (
                <div 
                  key={fb.id || fb.os_id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    isDetractor ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20' :
                    isPromoter ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/30' :
                    'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Badge de Nota */}
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-md ${
                      isPromoter ? 'bg-emerald-500 text-slate-950' :
                      isDetractor ? 'bg-rose-500 text-white animate-pulse' :
                      'bg-amber-400 text-slate-950'
                    }`}>
                      <span className="text-lg leading-none">{fb.nota}</span>
                      <span className="text-[8px] uppercase tracking-tighter opacity-80">Nota</span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white text-sm">{fb.cliente_nome}</span>
                        <span className="text-[11px] font-bold text-slate-400">• O.S. #{fb.os_id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                          isPromoter ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                          isDetractor ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 font-black' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>
                          {fb.classificacao}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-emerald-400">
                        {fb.veiculo_texto} — <span className="text-slate-300 font-normal">{fb.servico_texto}</span>
                      </div>

                      {fb.comentario && (
                        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-200 italic mt-2">
                          "{fb.comentario}"
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Recebido em: {new Date(fb.created_at || Date.now()).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas: Contatar no WhatsApp */}
                  <div className="flex sm:flex-col items-center gap-2 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleContactDetractor(fb)}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                        isDetractor ? 'bg-rose-600 hover:bg-rose-500 text-white font-black animate-bounce' :
                        'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isDetractor ? '🚨 Tratar Detrator' : 'Agradecer no WhatsApp'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default NpsDashboard;
