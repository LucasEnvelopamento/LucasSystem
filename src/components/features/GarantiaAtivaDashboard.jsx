import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  MessageCircle, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Car, 
  Wrench, 
  Search, 
  Filter, 
  Sparkles, 
  RefreshCw,
  FileText,
  Award
} from 'lucide-react';
import { useBrand } from '../../contexts/BrandContext';
import { toast } from '../../utils/toast';
import CertificadoGarantia from './CertificadoGarantia';

const GarantiaAtivaDashboard = ({ orders = [] }) => {
  const brand = useBrand();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, WARNING_30, WARNING_15_7, PREVENTIVE, EXPIRED
  const [selectedOsForCert, setSelectedOsForCert] = useState(null);
  const [sentAlerts, setSentAlerts] = useState(() => {
    return JSON.parse(localStorage.getItem('garantias_alertas_enviados_local') || '{}');
  });

  // Função auxiliar para converter string de garantia ("12 meses", "3 anos", "6 meses") em meses
  const parseMonths = (garantiaStr = '') => {
    const str = String(garantiaStr).toLowerCase().trim();
    const num = parseInt(str.replace(/\D/g, ''), 10) || 12; // Padrão 12 meses
    if (str.includes('ano')) return num * 12;
    if (str.includes('dia')) return Math.max(1, Math.round(num / 30));
    return num;
  };

  // Calcular status das garantias e revisões preventivas
  const analyzedOrders = useMemo(() => {
    if (!orders) return [];

    const now = new Date();
    const dayMs = 24 * 3600 * 1000;

    return orders
      .filter(o => ['ENTREGUE', 'CONCLUÍDO'].includes(String(o.status || '').toUpperCase().trim()))
      .map(o => {
        // Encontrar garantia
        let garantiaStr = o.garantia || '12 Meses';
        if (o.servicos_detalhados && Array.isArray(o.servicos_detalhados) && o.servicos_detalhados.length > 0) {
          const s = o.servicos_detalhados[0];
          if (s.garantia) garantiaStr = s.garantia;
        }

        const mesesGarantia = parseMonths(garantiaStr);
        const dataBase = new Date(o.data_agendamento || o.created_at || Date.now());
        const dataValidade = new Date(dataBase.getTime() + mesesGarantia * 30 * dayMs);
        
        const diasDecorridos = Math.round((now - dataBase) / dayMs);
        const diasRestantes = Math.round((dataValidade - now) / dayMs);
        const progresso = Math.min(100, Math.max(0, Math.round((diasDecorridos / (mesesGarantia * 30)) * 100)));

        let status_garantia = 'ACTIVE';
        let label_alerta = 'Proteção Ativa';
        let desc_alerta = 'Veículo em período de garantia com cobertura completa.';
        let urgenciaColor = 'emerald';

        // 1. Verificar Manutenções Periódicas Preventivas (Ceramic 6m ou PPF 12m)
        const servicoDesc = (o.servico || '').toLowerCase();
        const isPPF = servicoDesc.includes('ppf');
        const isCeramic = servicoDesc.includes('ceramic') || servicoDesc.includes('vitrif') || servicoDesc.includes('9h');

        if (isPPF && diasDecorridos >= 345 && diasDecorridos <= 390) {
          status_garantia = 'PREVENTIVE';
          label_alerta = 'Revisão Preventiva (12 Meses)';
          desc_alerta = 'Inspeção de PPF (bordas e auto-regeneração) recomendada no 1º ano.';
          urgenciaColor = 'teal';
        } else if (isCeramic && diasDecorridos >= 165 && diasDecorridos <= 200) {
          status_garantia = 'PREVENTIVE';
          label_alerta = 'Revisão Hidrofóbica (6 Meses)';
          desc_alerta = 'Manutenção semestral recomendada para renovação da camada repelente a água.';
          urgenciaColor = 'teal';
        } 
        // 2. Verificar Alertas de Vencimento de Garantia (30 dias, 15 dias, 7 dias)
        else if (diasRestantes <= 0) {
          status_garantia = 'EXPIRED';
          label_alerta = 'Garantia Expirada';
          desc_alerta = 'Período de cobertura concluído. Oportunidade de oferecer renovação de proteção.';
          urgenciaColor = 'slate';
        } else if (diasRestantes <= 15) {
          status_garantia = 'WARNING_15_7';
          label_alerta = `Alerta Cliente — Restam ${diasRestantes} Dias`;
          desc_alerta = 'Período ideal para disparo de WhatsApp lembrando de agendar revisão de término de garantia.';
          urgenciaColor = 'rose';
        } else if (diasRestantes <= 30) {
          status_garantia = 'WARNING_30';
          label_alerta = `Alerta Gestor — Restam ${diasRestantes} Dias`;
          desc_alerta = 'Garantia entrando no último mês. Gestor deve preparar contato de acompanhamento.';
          urgenciaColor = 'amber';
        }

        return {
          ...o,
          data_base: dataBase.toISOString(),
          meses_garantia: mesesGarantia,
          status_garantia,
          label_alerta,
          desc_alerta,
          dias_restantes: diasRestantes,
          progresso,
          urgenciaColor
        };
      })
      .sort((a, b) => {
        // Priorizar alertas urgentes e preventivos
        const priority = { WARNING_15_7: 1, PREVENTIVE: 2, WARNING_30: 3, ACTIVE: 4, EXPIRED: 5 };
        return (priority[a.status_garantia] || 99) - (priority[b.status_garantia] || 99);
      });
  }, [orders]);

  // Cálculos de KPI
  const kpis = useMemo(() => {
    const total = analyzedOrders.length;
    const warning30 = analyzedOrders.filter(o => o.status_garantia === 'WARNING_30').length;
    const warning15 = analyzedOrders.filter(o => o.status_garantia === 'WARNING_15_7').length;
    const preventive = analyzedOrders.filter(o => o.status_garantia === 'PREVENTIVE').length;
    const active = analyzedOrders.filter(o => ['ACTIVE', 'WARNING_30', 'WARNING_15_7', 'PREVENTIVE'].includes(o.status_garantia)).length;
    return { total, warning30, warning15, preventive, active };
  }, [analyzedOrders]);

  // Filtragem
  const filteredOrders = useMemo(() => {
    return analyzedOrders.filter(o => {
      const matchesType = filterType === 'ALL' || o.status_garantia === filterType;
      const matchesSearch = 
        o.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.veiculo_desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.servico?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [analyzedOrders, filterType, searchTerm]);

  // Disparo de Lembrete Inteligente por WhatsApp
  const handleSendReminderWhatsApp = (o) => {
    const phone = (o.cliente_telefone || '').replace(/\D/g, '');
    let text = '';

    if (o.status_garantia === 'PREVENTIVE') {
      text = `Olá, *${o.cliente_nome?.split(' ')[0] || 'Cliente'}*! Aqui é a equipe técnica da *${brand.name || 'OsSystem Automotivo'}* 🌟.\n\nNotei aqui no nosso sistema que seu *${o.veiculo_desc || 'veículo'}* está completando o período para a nossa *${o.label_alerta}* do serviço de *${o.servico || 'estética'}*!\n\n${o.desc_alerta}\n\nPara garantirmos que o brilho espetacular e a proteção permaneçam 100% como no primeiro dia, que tal agendarmos sua revisão cortesia esta semana? 🚗✨\n\nQual o melhor dia ou horário para recebermos você na loja? 🤝`;
    } else if (o.status_garantia === 'WARNING_15_7' || o.status_garantia === 'WARNING_30') {
      text = `Olá, *${o.cliente_nome?.split(' ')[0] || 'Cliente'}*! Tudo bem? Aqui é a gestão da *${brand.name || 'OsSystem'}* 🛡️.\n\nPassando para lembrar que a garantia oficial do serviço *${o.servico}* no seu *${o.veiculo_desc}* está entrando nos últimos *${o.dias_restantes} dias*!\n\nAntes que o período expire, disponibilizamos uma *vistoria técnica cortesia* para checagem completa do acabamento e hidrofobia.\n\nGostaria de aproveitar e já deixar agendada sua verificação? Estamos à disposição! 🚗💨`;
    } else {
      text = `Olá, *${o.cliente_nome?.split(' ')[0] || 'Cliente'}*! Passando em nome da *${brand.name || 'OsSystem'}* para saber como está se comportando a proteção do serviço *${o.servico}* em seu *${o.veiculo_desc}*. Qualquer dúvida sobre a garantia ou cuidados de lavagem, estamos à sua disposição! ✨`;
    }

    // Salvar alerta como disparado
    const updated = { ...sentAlerts, [o.id]: Date.now() };
    setSentAlerts(updated);
    localStorage.setItem('garantias_alertas_enviados_local', JSON.stringify(updated));

    const url = `https://wa.me/${phone ? (phone.startsWith('55') ? phone : `55${phone}`) : ''}?text=${encodeURIComponent(text)}`;
    toast.success(`Lembrete gerado e aberto para ${o.cliente_nome}! 📲`);
    window.open(url, '_blank');
  };

  // Disparo em Massa
  const handleSendAllAlerts = () => {
    const alertOrders = analyzedOrders.filter(o => ['WARNING_30', 'WARNING_15_7', 'PREVENTIVE'].includes(o.status_garantia));
    if (alertOrders.length === 0) {
      toast.info('Não há garantias ou revisões com alerta pendente para disparo no momento.');
      return;
    }
    toast.success(`✨ Motor Ativo acionado! Preparando disparo para ${alertOrders.length} cliente(s)...`);
    const updated = { ...sentAlerts };
    alertOrders.forEach(o => { updated[o.id] = Date.now(); });
    setSentAlerts(updated);
    localStorage.setItem('garantias_alertas_enviados_local', JSON.stringify(updated));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Resumo de KPIs do Motor de Garantias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Protegido */}
        <div 
          onClick={() => setFilterType('ALL')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
            filterType === 'ALL' ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30' : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Garantias Ativas
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Ao Vivo</span>
          </div>
          <div className="text-3xl font-black text-white">{kpis.active} <span className="text-xs font-normal text-slate-500">veículos</span></div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Frota total sob cobertura na loja</p>
        </div>

        {/* Card 2: Alertas Gestor (30 dias) */}
        <div 
          onClick={() => setFilterType('WARNING_30')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
            filterType === 'WARNING_30' ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30' : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Alerta Gestão (30d)
            </span>
            <span className="text-sm font-black text-amber-400">{kpis.warning30}</span>
          </div>
          <div className="text-3xl font-black text-white">{kpis.warning30} <span className="text-xs font-normal text-slate-500">clientes</span></div>
          <p className="text-[11px] text-amber-300/80 mt-2 font-medium">Garantias entrando no último mês</p>
        </div>

        {/* Card 3: Alertas Cliente (15 e 7 dias) */}
        <div 
          onClick={() => setFilterType('WARNING_15_7')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
            filterType === 'WARNING_15_7' ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30' : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" /> Alerta Cliente (15/7d)
            </span>
            <span className="text-sm font-black text-rose-500">{kpis.warning15}</span>
          </div>
          <div className="text-3xl font-black text-white flex items-center gap-2">
            <span>{kpis.warning15}</span>
            {kpis.warning15 > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" title="Disparo prioritário via WhatsApp" />}
            <span className="text-xs font-normal text-slate-500">clientes</span>
          </div>
          <p className="text-[11px] text-rose-300/80 mt-2 font-medium">Aviso urgente de revisão / término</p>
        </div>

        {/* Card 4: Revisões Preventivas (6m e 12m) */}
        <div 
          onClick={() => setFilterType('PREVENTIVE')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
            filterType === 'PREVENTIVE' ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30' : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-teal-400" /> Manutenção Periódica
            </span>
            <span className="text-sm font-black text-teal-400">{kpis.preventive}</span>
          </div>
          <div className="text-3xl font-black text-white">{kpis.preventive} <span className="text-xs font-normal text-slate-500">veículos</span></div>
          <p className="text-[11px] text-teal-300/80 mt-2 font-medium">PPF (12m) e Vitrificação (6m)</p>
        </div>

      </div>

      {/* 2. Banner de Ação Rápida em Massa */}
      {(kpis.warning30 > 0 || kpis.warning15 > 0 || kpis.preventive > 0) && (
        <div className="bg-gradient-to-r from-teal-950/50 via-slate-900 to-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl flex-shrink-0">
              🛡️
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Motor de Garantia Ativa & Revisões Preventivas</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                  {kpis.warning30 + kpis.warning15 + kpis.preventive} alerta(s)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                O sistema calcula automaticamente o término de garantias e os ciclos ideais de manutenção para você reter 100% dos clientes!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendAllAlerts}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-950 flex items-center justify-center gap-2 transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>Disparar Alertas no WhatsApp</span>
          </button>
        </div>
      )}

      {/* 3. Central de Listagem e Controle de Veículos */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Busca e Filtros de Categorias */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Frota Monitoreada — Coberturas e Revisões</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold">
                {filteredOrders.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Acompanhe a barra de tempo restante e dispare mensagens personalizadas com 1 clique.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar cliente, veículo ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Lista de Cards da Garantia */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Nenhum veículo encontrado no filtro atual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((o) => {
              const isUrgent = o.status_garantia === 'WARNING_15_7';
              const isWarning = o.status_garantia === 'WARNING_30';
              const isPrev = o.status_garantia === 'PREVENTIVE';
              const isExpired = o.status_garantia === 'EXPIRED';
              const isSent = Boolean(sentAlerts[o.id]);

              return (
                <div 
                  key={o.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    isUrgent ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/10' :
                    isPrev ? 'bg-teal-950/20 border-teal-500/40 shadow-lg shadow-teal-950/10' :
                    isWarning ? 'bg-amber-950/20 border-amber-500/40' :
                    'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Dados do Cliente e Serviço */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-md ${
                      isUrgent ? 'bg-rose-500 text-white animate-pulse' :
                      isPrev ? 'bg-teal-500 text-slate-950' :
                      isWarning ? 'bg-amber-400 text-slate-950' :
                      isExpired ? 'bg-slate-700 text-slate-300' :
                      'bg-emerald-500 text-slate-950'
                    }`}>
                      <ShieldCheck className="w-6 h-6" />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white text-sm">{o.cliente_nome}</span>
                        <span className="text-xs font-bold text-emerald-400">• {o.veiculo_desc}</span>
                        <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 bg-slate-900 rounded-md border border-slate-800">{o.placa || 'SEM PLACA'}</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          isUrgent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-extrabold' :
                          isPrev ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                          isWarning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          isExpired ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {o.label_alerta}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-300 truncate">
                        {o.servico || 'Serviço de Estética Automotiva'} <span className="text-slate-500 font-normal">({o.garantia || 'Garantia de 12 Meses'})</span>
                      </div>

                      <p className="text-[11px] text-slate-400 italic">
                        {o.desc_alerta}
                      </p>

                      {/* Barra de Progresso do Tempo de Garantia */}
                      <div className="pt-2 max-w-md">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                          <span>Início: {new Date(o.data_base).toLocaleDateString('pt-BR')}</span>
                          <span>{o.dias_restantes > 0 ? `Restam ${o.dias_restantes} dias` : 'Vencido / Concluído'}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              isUrgent ? 'bg-rose-500' :
                              isPrev ? 'bg-teal-400' :
                              isWarning ? 'bg-amber-400' :
                              isExpired ? 'bg-slate-600' :
                              'bg-emerald-500'
                            }`} 
                            style={{ width: `${o.progresso}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações: Disparar WhatsApp e Ver Laudo */}
                  <div className="flex sm:flex-row md:flex-col items-center gap-2 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    
                    <button
                      type="button"
                      onClick={() => handleSendReminderWhatsApp(o)}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                        isUrgent || isPrev ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black' :
                        isWarning ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black' :
                        'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isSent ? '✅ Reenviar Lembrete' : '📲 Disparar WhatsApp'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOsForCert(o)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 flex items-center justify-center gap-1.5 transition-all"
                      title="Visualizar ou imprimir o Certificado Digital de Garantia"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver Garantia</span>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal do Certificado de Garantia Digital */}
      {selectedOsForCert && (
        <CertificadoGarantia 
          os={selectedOsForCert} 
          onClose={() => setSelectedOsForCert(null)} 
        />
      )}

    </div>
  );
};

export default GarantiaAtivaDashboard;
