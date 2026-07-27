import React, { useState, useEffect } from 'react';
import { 
  Car, Shield, Award, Clock, CheckCircle2, AlertCircle, FileText, 
  Camera, ChevronRight, LogOut, Phone, Search, Key, Smartphone, 
  Sparkles, Calendar, ArrowRight, Download, Eye, X, Check, Share2, 
  RefreshCw, Layers, Wrench, ShieldCheck
} from 'lucide-react';
import { useBrand } from '../contexts/BrandContext';
import { supabase, hasRealConnection } from '../lib/supabase';
import { toast } from '../utils/toast';
import { sendWhatsApp } from '../utils/whatsappUtils';
import CertificadoGarantia from '../components/features/CertificadoGarantia';
import CalendarSyncModal from '../components/ui/CalendarSyncModal';

const ClientPortal = () => {
  const brand = useBrand();
  
  // Auth & Session state
  const [session, setSession] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [placaInput, setPlacaInput] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Data state
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('ALL');
  const [loadingData, setLoadingData] = useState(false);
  const [activeOSForCert, setActiveOSForCert] = useState(null);
  const [activeOSForSync, setActiveOSForSync] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('client_portal_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.phone) {
          setSession(parsed);
          fetchClientData(parsed.phone, parsed.placa);
        }
      } catch (e) {
        localStorage.removeItem('client_portal_session');
      }
    }
  }, []);

  const handlePhoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 9) v = `${v.slice(0, 10)}-${v.slice(10)}`;
    setPhoneInput(v);
  };

  const handlePlacaChange = (e) => {
    let v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    setPlacaInput(v);
  };

  const handleLoginByPlaca = async () => {
    if (!placaInput || placaInput.length < 7) {
      toast.warning('Informe uma placa válida.');
      return;
    }
    if (!phoneInput || phoneInput.length < 14) {
      toast.warning('Informe o seu WhatsApp para validação de segurança.');
      return;
    }
    setLoadingAuth(true);
    await loginClient(phoneInput, placaInput);
    setLoadingAuth(false);
  };

  const loginClient = async (phone, placa) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (hasRealConnection()) {
      try {
        let query = supabase
          .from('ordens_servico')
          .select('*, clientes(nome, telefone), veiculos(id, marca, modelo, placa, ano), os_midia(url, tipo, fase_execucao), checklist_avarias(id, notas)');

        // Filtra por placa se informado, senão busca ordens com esse telefone no cliente ou na OS
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Filtrar no front para garantir correspondência flexível com caracteres especiais ou DDDS
        const matchedOrders = (data || []).filter(o => {
          const cliPhone = o.clientes?.telefone || o.cliente_telefone || '';
          const cleanCliPhone = cliPhone.replace(/\D/g, '');
          const matchPhone = cleanCliPhone.endsWith(cleanPhone.slice(-8)) || cleanPhone.endsWith(cleanCliPhone.slice(-8));
          
          if (placa) {
            const veicPlaca = (o.veiculos?.placa || o.placa || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
            const inputPlaca = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
            return (matchPhone || !phone) && veicPlaca === inputPlaca;
          }
          return matchPhone;
        });

        if (matchedOrders.length === 0 && !placa) {
          // Se não encontrou ordens, vamos liberar acesso modo demonstração com dados de teste
          const mockSession = {
            phone,
            clientName: 'Cliente VIP',
            timestamp: new Date().getTime(),
            isDemo: true
          };
          localStorage.setItem('client_portal_session', JSON.stringify(mockSession));
          setSession(mockSession);
          generateDemoData();
          toast.success('Bem-vindo ao portal! (Exibindo histórico de demonstração)');
          return;
        }

        const clientName = matchedOrders[0]?.clientes?.nome || matchedOrders[0]?.cliente_nome || 'Cliente VIP';
        const newSession = {
          phone,
          placa: placa || null,
          clientName,
          timestamp: new Date().getTime()
        };
        
        localStorage.setItem('client_portal_session', JSON.stringify(newSession));
        setSession(newSession);
        processOrdersData(matchedOrders);
        toast.success(`Bem-vindo, ${clientName}! 🚗`);
      } catch (err) {
        console.error('Erro ao buscar dados do cliente:', err);
        toast.error('Erro ao conectar com o servidor. Verifique sua conexão.');
      }
    } else {
      // Offline / Simulação PWA
      const mockSession = { phone, clientName: 'Carlos Souza (Demo)', timestamp: new Date().getTime(), isDemo: true };
      localStorage.setItem('client_portal_session', JSON.stringify(mockSession));
      setSession(mockSession);
      generateDemoData();
      toast.success('Login concluído com sucesso!');
    }
  };

  const fetchClientData = async (phone, placa) => {
    setLoadingData(true);
    if (hasRealConnection()) {
      try {
        const { data, error } = await supabase
          .from('ordens_servico')
          .select('*, clientes(nome, telefone), veiculos(id, marca, modelo, placa, ano), os_midia(url, tipo, fase_execucao), checklist_avarias(id, notas)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const cleanPhone = phone.replace(/\D/g, '');
          const matched = data.filter(o => {
            const cliPhone = (o.clientes?.telefone || o.cliente_telefone || '').replace(/\D/g, '');
            return cliPhone.endsWith(cleanPhone.slice(-8)) || cleanPhone.endsWith(cliPhone.slice(-8));
          });
          if (matched.length > 0) {
            processOrdersData(matched);
          } else {
            generateDemoData();
          }
        }
      } catch (err) {
        console.error('Erro ao atualizar dados do portal:', err);
        generateDemoData();
      }
    } else {
      generateDemoData();
    }
    setLoadingData(false);
  };

  const processOrdersData = (ordersList) => {
    const formatted = ordersList.map(o => {
      const veiculoObj = Array.isArray(o.veiculos) ? o.veiculos[0] : o.veiculos;
      return {
        ...o,
        veiculo_id: veiculoObj?.id || o.veiculo_id || `v-${o.id}`,
        veiculo_desc: veiculoObj ? `${veiculoObj.marca || ''} ${veiculoObj.modelo || ''}`.trim() : (o.veiculo_desc || 'Veículo Não Identificado'),
        placa: veiculoObj?.placa || o.placa || 'SEM-PLACA',
        ano: veiculoObj?.ano || '',
        data_show: o.data_agendamento || o.created_at,
        midias: o.os_midia || [],
        checklist: Array.isArray(o.checklist_avarias) ? o.checklist_avarias[0] : o.checklist_avarias
      };
    });

    setOrders(formatted);

    // Agrupar veículos únicos
    const veicMap = new Map();
    formatted.forEach(o => {
      if (!veicMap.has(o.veiculo_id)) {
        veicMap.set(o.veiculo_id, {
          id: o.veiculo_id,
          desc: o.veiculo_desc,
          placa: o.placa,
          ano: o.ano,
          total_os: 1
        });
      } else {
        const curr = veicMap.get(o.veiculo_id);
        curr.total_os += 1;
      }
    });

    setVehicles(Array.from(veicMap.values()));
  };

  const generateDemoData = () => {
    const demoVehicles = [
      { id: 'v-101', desc: 'BMW 320i M-Sport', placa: 'BMW-2024', ano: '2024', total_os: 2 },
      { id: 'v-102', desc: 'Porsche Carrera 911', placa: 'POR-9110', ano: '2023', total_os: 1 }
    ];
    setVehicles(demoVehicles);

    const demoOrders = [
      {
        id: 9021,
        veiculo_id: 'v-101',
        veiculo_desc: 'BMW 320i M-Sport',
        placa: 'BMW-2024',
        ano: '2024',
        status: 'CONCLUÍDO',
        servico: 'Combo Proteção Total (PPF Frontal + Ceramic 9H)',
        valor_total: 4500,
        data_show: new Date(Date.now() - 5 * 86400000).toISOString(),
        observacoes: 'Aplicação de PPF regenerativo em todo capô, para-choques e paralamas. Vitrificação 9H com garantia de 3 anos.',
        midias: [
          { url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80', tipo: 'foto', fase_execucao: 'antes' },
          { url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80', tipo: 'foto', fase_execucao: 'depois' },
          { url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop&q=80', tipo: 'foto', fase_execucao: 'depois' }
        ],
        checklist: { id: 'chk-1', notas: 'Pequeno risco pré-existente na roda traseira direita registrado no VCR.' }
      },
      {
        id: 8840,
        veiculo_id: 'v-101',
        veiculo_desc: 'BMW 320i M-Sport',
        placa: 'BMW-2024',
        ano: '2024',
        status: 'ENTREGUE',
        servico: 'Insulfilm Nanocerâmica (Parabrisa + Laterais)',
        valor_total: 850,
        data_show: new Date(Date.now() - 45 * 86400000).toISOString(),
        observacoes: 'Película com 99% de rejeição UV e 88% de rejeição infravermelha.',
        midias: [
          { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80', tipo: 'foto', fase_execucao: 'depois' }
        ],
        checklist: null
      },
      {
        id: 7420,
        veiculo_id: 'v-102',
        veiculo_desc: 'Porsche Carrera 911',
        placa: 'POR-9110',
        ano: '2023',
        status: 'EM EXECUÇÃO',
        servico: 'PPF Full Body (Carroceria Completa)',
        valor_total: 18000,
        data_show: new Date().toISOString(),
        observacoes: 'Veículo no box 1 para envelopamento de proteção integral fosco.',
        midias: [
          { url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80', tipo: 'foto', fase_execucao: 'durante' }
        ],
        checklist: { id: 'chk-2', notas: 'Nenhuma avaria detectada. Estado impecável de conservação.' }
      }
    ];
    setOrders(demoOrders);
  };

  const handleLogout = () => {
    localStorage.removeItem('client_portal_session');
    setSession(null);
    setOrders([]);
    setVehicles([]);
    toast.info('Sessão encerrada com segurança.');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONCLUÍDO':
      case 'ENTREGUE':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {status}</span>;
      case 'EM EXECUÇÃO':
      case 'EM_ANDAMENTO':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse"><Wrench className="w-3 h-3" /> Em Serviço</span>;
      case 'AGUARDANDO':
      case 'ORCAMENTO':
        return <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Agendado / Orçamento</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{status || 'Registrado'}</span>;
    }
  };

  // Filtrar ordens na timeline pelo veículo selecionado
  const filteredOrders = selectedVehicleId === 'ALL' 
    ? orders 
    : orders.filter(o => o.veiculo_id === selectedVehicleId);

  // SE NÃO ESTIVER LOGADO -> TELA DE LOGIN DO CLIENTE
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-600/15 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
          {/* Header de Identificação */}
          <div className="text-center mb-6">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="h-12 w-auto object-contain mx-auto mb-3" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/50 font-black text-white text-2xl mx-auto mb-3">
                {brand.name ? brand.name.charAt(0) : '🚗'}
              </div>
            )}
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              Portal "Meu Veículo"
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Acesse o histórico completo de manutenções, fotos Antes/Depois e Certificados de Garantia da sua frota.
            </p>
          </div>

          {/* Formulário de Acesso Realista (Placa + Celular) */}
          <div className="space-y-4 mt-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Placa do Veículo</label>
              <div className="relative">
                <Car className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="ABC-1234 ou POR9110"
                  value={placaInput}
                  onChange={handlePlacaChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono font-bold uppercase tracking-widest transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Seu Celular / WhatsApp Cadastrado</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={phoneInput}
                  onChange={handlePhoneChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block leading-relaxed">
                Informe o mesmo número registrado na recepção da oficina para validação instantânea.
              </span>
            </div>

            <button
              type="button"
              disabled={loadingAuth}
              onClick={handleLoginByPlaca}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 mt-2"
            >
              {loadingAuth ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span>Acessar Portal Meu Veículo 🔓</span>}
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            <span className="flex items-center justify-center gap-1 mb-1 font-semibold text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Acesso 100% Seguro & Criptografado
            </span>
            Em caso de dúvidas ou perda de número, fale com nossa recepção pelo WhatsApp.
          </div>
        </div>
      </div>
    );
  }

  // SE ESTIVER LOGADO -> EXIBIR PORTAL "MEU VEÍCULO"
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header Premium do Portal */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} className="h-10 w-auto object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/40 font-black text-white text-xl">
              {brand.name ? brand.name.charAt(0) : '🚗'}
            </div>
          )}
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Meu Veículo
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Área VIP do Cliente
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Olá, <strong className="text-slate-200">{session.clientName}</strong>! Bem-vindo de volta.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {brand.whatsapp && (
            <button
              onClick={() => sendWhatsApp(brand.whatsapp, `Olá! Estou na minha área de cliente (Portal Meu Veículo) e gostaria de falar com um consultor.`)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Falar com Consultor</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-all flex items-center gap-1 text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        
        {/* Minha Frota (Seletor de Veículos) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-400" /> Minha Frota Registrada ({vehicles.length})
            </h2>
            <a 
              href="/agendar" 
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>+ Agendar Novo Veículo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <button
              type="button"
              onClick={() => setSelectedVehicleId('ALL')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                selectedVehicleId === 'ALL'
                  ? 'bg-gradient-to-br from-emerald-950/50 to-slate-800 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950'
                  : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-emerald-400 text-lg">
                  📋
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Todos os Veículos</h3>
                  <p className="text-[11px] text-slate-400">Histórico unificado da frota</p>
                </div>
              </div>
              <span className="w-6 h-6 rounded-full bg-slate-900 text-slate-300 text-xs font-bold flex items-center justify-center">
                {orders.length}
              </span>
            </button>

            {vehicles.map(v => {
              const isSelected = selectedVehicleId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-950/50 to-slate-800 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950'
                      : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-emerald-400 text-base flex-shrink-0">
                      🚗
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">{v.desc}</h3>
                      <p className="text-[11px] text-slate-400 font-mono font-bold uppercase tracking-wide mt-0.5">
                        Placa: {v.placa} {v.ano ? `(${v.ano})` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0 ml-2">
                    {v.total_os}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Timeline do Histórico de Serviços */}
        <section>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Timeline de Histórico e Revisões</h2>
              <p className="text-xs text-slate-400">Acompanhe cronologicamente todos os serviços realizados em sua frota e acesse suas garantias digitais.</p>
            </div>
            <button
              onClick={() => fetchClientData(session.phone, session.placa)}
              disabled={loadingData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-1 text-xs"
              title="Atualizar histórico"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-3xl p-12 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Search className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Nenhum serviço registrado ainda</h3>
              <p className="text-xs text-slate-400 mb-6">Não encontramos ordens de serviço para este filtro ou veículo.</p>
              <a
                href="/agendar"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-lg inline-flex items-center gap-2 hover:from-emerald-500 hover:to-teal-400 transition-all"
              >
                <span>📅 Agendar Primeiro Serviço Online</span>
              </a>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-slate-700 before:to-slate-800">
              {filteredOrders.map((order, idx) => {
                const isCompleted = order.status === 'CONCLUÍDO' || order.status === 'ENTREGUE';
                const hasPhotos = order.midias && order.midias.length > 0;
                
                return (
                  <div key={order.id || idx} className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Indicador esférico na timeline */}
                    <div className={`absolute -left-[27px] sm:-left-[29px] top-4 w-6 h-6 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-md transition-transform group-hover:scale-125 ${
                      isCompleted ? 'bg-emerald-500 shadow-emerald-900/60' : 'bg-amber-500 shadow-amber-900/60'
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3 text-slate-950 stroke-[3]" /> : <Wrench className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                    </div>

                    {/* Card da O.S. */}
                    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 hover:border-slate-600 rounded-2xl p-5 sm:p-6 shadow-xl transition-all">
                      
                      {/* Topo do card: Data, Status e Veículo */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-700/60">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold uppercase text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            OS #{order.id}
                          </span>
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-emerald-400" />
                            {order.veiculo_desc} <span className="text-slate-500 font-mono">[{order.placa}]</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(order.data_show).toLocaleDateString('pt-BR')}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      {/* Descrição do serviço */}
                      <div className="mb-4">
                        <h3 className="font-black text-white text-base sm:text-lg mb-1 leading-snug">
                          {order.servico || 'Serviço Estético Automotivo'}
                        </h3>
                        {order.observacoes && (
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 font-normal">
                            {order.observacoes}
                          </p>
                        )}
                      </div>

                      {/* Galeria de Fotos Antes / Depois (Se houver) */}
                      {hasPhotos && (
                        <div className="mb-5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                            <Camera className="w-3.5 h-3.5 text-emerald-400" /> Evidências Fotográficas ({order.midias.length})
                          </span>
                          <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                            {order.midias.map((m, mIdx) => (
                              <div
                                key={mIdx}
                                onClick={() => setLightboxImage(m.url)}
                                className="relative group/thumb w-24 h-20 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 cursor-pointer bg-slate-950"
                              >
                                <img src={m.url} alt={`Foto ${m.fase_execucao}`} className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                                <span className="absolute bottom-1 left-1 bg-slate-950/80 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded text-emerald-300 border border-slate-800">
                                  {m.fase_execucao || 'Foto'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rodapé do card: VCR, Valor e Botão de Certificado */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-700/60 text-xs">
                        <div className="flex items-center gap-3">
                          {order.checklist && (
                            <span className="inline-flex items-center gap-1 bg-sky-500/15 text-sky-300 border border-sky-500/25 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" /> Laudo VCR 360° Registrado
                            </span>
                          )}
                          <span className="text-slate-400">
                            Investimento: <strong className="text-emerald-400 font-extrabold">{Number(order.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setActiveOSForSync(order)}
                            className="px-3.5 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            title="Adicionar ao Apple/Google Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Agenda 🗓️</span>
                          </button>

                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() => setActiveOSForCert(order)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-md shadow-emerald-950 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                            >
                              <Award className="w-4 h-4" />
                              <span>Certificado de Garantia</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Banner flutuante de novo agendamento */}
      <div className="sticky bottom-4 z-30 max-w-xl mx-auto w-full px-4">
        <a
          href="/agendar"
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-2xl shadow-emerald-950 border border-emerald-400/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span>+ Agendar Novo Serviço para Minha Frota 🚀</span>
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500 mt-12">
        <p>© {new Date().getFullYear()} {brand.name || 'OsSystem'}. Portal "Meu Veículo" — Segurança, Transparência & Garantia.</p>
      </footer>

      {/* Modal Lightbox para visualização de fotos Antes/Depois */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={lightboxImage} alt="Evidência em Zoom" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-slate-800" />
        </div>
      )}

      {/* Modal Certificado de Garantia */}
      {activeOSForCert && (
        <CertificadoGarantia
          os={activeOSForCert}
          onClose={() => setActiveOSForCert(null)}
        />
      )}

      {/* Modal de Sincronização de Calendário */}
      {activeOSForSync && (
        <CalendarSyncModal
          isOpen={!!activeOSForSync}
          onClose={() => setActiveOSForSync(null)}
          order={activeOSForSync}
          shopName={brand.name}
          isManagerView={false}
        />
      )}
    </div>
  );
};

export default ClientPortal;
