import { formatDateBR } from '../utils/dateUtils';
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Car, CheckCircle2, Shield, Award, 
  Sparkles, ArrowRight, ArrowLeft, Send, MessageCircle, AlertCircle, 
  Check, Phone, Mail, User, FileText, ChevronRight, Zap, Star
} from 'lucide-react';
import { useBrand } from '../contexts/BrandContext';
import { supabase, hasRealConnection } from '../lib/supabase';
import { toast } from '../utils/toast';
import { sendWhatsApp } from '../utils/whatsappUtils';
import CalendarSyncModal from '../components/ui/CalendarSyncModal';

const VEHICLE_CLASSES = [
  { id: 'Hatch', label: 'Hatch Compacto', icon: '🚗', desc: 'Ex: Onix, HB20, Polo, Gol' },
  { id: 'Sedan', label: 'Sedan / Coupé', icon: '🚙', desc: 'Ex: Corolla, Civic, BMW 320i' },
  { id: 'SUV', label: 'SUV / Crossover', icon: '🚜', desc: 'Ex: Compass, Tiguan, SW4' },
  { id: 'Pickup', label: 'Pickup / Caminhonete', icon: '🛻', desc: 'Ex: Hilux, Ranger, Toro, S10' },
  { id: 'Esportivo', label: 'Esportivo / Luxo', icon: '🏎️', desc: 'Ex: Porsche 911, Mustang, Ferrari' },
  { id: 'Moto', label: 'Motocicleta', icon: '🏍️', desc: 'Ex: BMW GS 1250, Harley, CBR' }
];

const DEFAULT_SERVICES = [
  { id: 'serv-1', nome: 'Combo Proteção Total (PPF Frontal + Ceramic 9H)', categoria: 'Combos Especiais', preco: 4500, tempo_estimado: '2 a 3 dias', is_combo: true, desc: 'Proteção máxima contra pedras, riscos e raios UV com desconto de combo.' },
  { id: 'serv-2', nome: 'PPF Frontal (Capô, Para-choque e Paralamas)', categoria: 'PPF (Paint Protection Film)', preco: 3200, tempo_estimado: '2 dias', is_combo: false, desc: 'Filme regenerativo ultra transparente com 10 anos de garantia.' },
  { id: 'serv-3', nome: 'Vitrificação Ceramic Coating 9H (Pintura + Rodas)', categoria: 'Estética & Proteção', preco: 1800, tempo_estimado: '1 a 2 dias', is_combo: false, desc: 'Brilho espelhado intenso, hidrofobia extrema e proteção por 3 anos.' },
  { id: 'serv-4', nome: 'Insulfilm Nanocerâmica (Alta Rejeição UV/IR)', categoria: 'Películas Solares', preco: 850, tempo_estimado: '4 horas', is_combo: false, desc: 'Bloqueio de até 99% dos raios UV e conforto térmico incomparável.' },
  { id: 'serv-5', nome: 'Envelopamento Teto Black Piano (High Gloss)', categoria: 'Envelopamento Premium', preco: 600, tempo_estimado: '3 horas', is_combo: false, desc: 'Acabamento Black Piano ultrabrigo importado com visual esportivo.' },
  { id: 'serv-6', nome: 'Detalhamento Interno & Oxi-Sanitização', categoria: 'Estética & Proteção', preco: 550, tempo_estimado: '1 dia', is_combo: false, desc: 'Limpeza profunda de couro, plásticos e eliminação total de odores.' }
];

const TIME_SLOTS = [
  '08:00', '09:30', '11:00', '13:30', '15:00', '16:30'
];

const SelfBooking = () => {
  const brand = useBrand();
  const [step, setStep] = useState(1);
  const [servicesCatalog, setServicesCatalog] = useState(DEFAULT_SERVICES);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [existingOrders, setExistingOrders] = useState([]);

  // Form States
  const [vehicleClass, setVehicleClass] = useState('Hatch');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Carregar catálogo de serviços e agendamentos existentes
  useEffect(() => {
    const fetchData = async () => {
      if (hasRealConnection()) {
        setLoadingCatalog(true);
        try {
          // Buscar serviços
          const { data: servData } = await supabase
            .from('servicos')
            .select('*')
            .order('categoria', { ascending: true });
            
          if (servData && servData.length > 0) {
            const formatted = servData.map(s => ({
              id: s.id || s.nome,
              nome: s.nome,
              categoria: s.categoria || 'Serviços Gerais',
              preco: Number(s.preco_padrao || s.preco || 0),
              tempo_estimado: s.tempo_estimado || '1 dia',
              is_combo: s.is_combo || false,
              desc: s.descricao || 'Serviço automotivo de alta precisão e acabamento premium.'
            }));
            setServicesCatalog(formatted);
          }

          // Buscar agendamentos futuros para checar conflitos
          const hoje = new Date().toISOString().split('T')[0];
          const { data: ordData } = await supabase
            .from('ordens_servico')
            .select('data_agendamento, status')
            .gte('data_agendamento', hoje)
            .in('status', ['ORCAMENTO', 'AGUARDANDO', 'EM EXECUÇÃO', 'EM_ANDAMENTO']);
            
          if (ordData) {
            setExistingOrders(ordData);
          }
        } catch (err) {
          console.error('Erro ao buscar dados para self-booking:', err);
        } finally {
          setLoadingCatalog(false);
        }
      }
    };
    fetchData();
  }, []);

  // Gerar datas disponíveis (próximos 14 dias úteis)
  const getAvailableDays = () => {
    const days = [];
    let curr = new Date();
    curr.setDate(curr.getDate() + 1); // Começa amanhã
    
    while (days.length < 14) {
      const dayOfWeek = curr.getDay();
      if (dayOfWeek !== 0) { // Exclui domingo
        const dateStr = curr.toISOString().split('T')[0];
        const dayName = formatDateBR(curr);
        const dayNum = formatDateBR(curr);
        days.push({ dateStr, dayName: dayName.toUpperCase(), dayNum, dayOfWeek });
      }
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  };

  const availableDays = getAvailableDays();

  // Checar se um horário está ocupado no dia selecionado
  const isTimeSlotTaken = (timeStr) => {
    if (!selectedDate) return false;
    return existingOrders.some(ord => {
      if (!ord.data_agendamento) return false;
      const [ordDate, ordTime] = ord.data_agendamento.split('T');
      if (ordDate !== selectedDate) return false;
      const formattedOrdTime = ordTime?.substring(0, 5);
      return formattedOrdTime === timeStr;
    });
  };

  // Manipular seleção de serviços
  const toggleService = (id) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter(item => item !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  // Cálculos do resumo
  const selectedServicesList = servicesCatalog.filter(s => selectedServiceIds.includes(s.id));
  const totalEstimated = selectedServicesList.reduce((acc, curr) => acc + (curr.preco || 0), 0);

  // Formatação de telefone
  const handlePhoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 9) v = `${v.slice(0, 10)}-${v.slice(10)}`;
    setClientPhone(v);
  };

  // Submissão do agendamento online
  const handleSubmitBooking = async () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      toast.warning('Por favor, informe seu Nome e Telefone WhatsApp.');
      return;
    }
    if (selectedServiceIds.length === 0) {
      toast.warning('Selecione ao menos um serviço para agendar.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.warning('Selecione o Dia e o Horário do agendamento.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataAgendamentoIso = `${selectedDate}T${selectedTime}:00.000Z`;
      const veiculoTexto = `${vehicleModel || 'Veículo'} (${vehicleClass}) ${vehicleYear ? '-' + vehicleYear : ''} ${vehiclePlate ? '[' + vehiclePlate.toUpperCase() + ']' : ''}`.trim();

      const newOrderPayload = {
        status: 'ORCAMENTO', // Requer aprovação do Gestor
        progresso: 0,
        servico: selectedServicesList.map(s => s.nome).join(' + '),
        servicos_detalhados: selectedServicesList.map(s => ({
          nome: s.nome,
          preco: s.preco,
          categoria: s.categoria
        })),
        valor_total: totalEstimated,
        desconto: 0,
        data_agendamento: dataAgendamentoIso,
        observacoes: `🌐 SELF-BOOKING ONLINE:\n👤 Cliente: ${clientName} (${clientPhone})\n🚗 Veículo: ${veiculoTexto}\n📅 Agendado para: ${selectedDate.split('-').reverse().join('/')} às ${selectedTime}\n${notes ? '📝 Obs do Cliente: ' + notes : ''}`,
        created_at: new Date().toISOString()
      };

      if (hasRealConnection()) {
        try {
          const cleanPhone = (clientPhone || '').replace(/\D/g, '');
          
          const { error: rpcError } = await supabase.rpc('criar_agendamento_publico', {
            p_cliente_nome: clientName.trim(),
            p_cliente_telefone: cleanPhone,
            p_cliente_email: clientEmail ? clientEmail.trim() : null,
            p_veiculo_modelo: vehicleModel || 'Veículo',
            p_veiculo_marca: vehicleClass || 'Automóvel',
            p_veiculo_placa: vehiclePlate ? vehiclePlate.toUpperCase().trim() : null,
            p_veiculo_ano: vehicleYear || null,
            p_servico_texto: newOrderPayload.servico,
            p_servicos_detalhados: newOrderPayload.servicos_detalhados,
            p_valor_total: newOrderPayload.valor_total,
            p_data_agendamento: newOrderPayload.data_agendamento,
            p_observacoes: newOrderPayload.observacoes
          });

          if (rpcError) throw rpcError;

        } catch (errSync) {
          console.error('Erro ao salvar agendamento:', errSync);
          toast.error('Ocorreu um erro ao registrar seu agendamento no sistema principal.');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Modo offline / demonstração
        setSubmittedOrder({ ...newOrderPayload, id: Math.floor(Math.random() * 1000), clientName, clientPhone, veiculoTexto });
      }

      setStep(5); // Tela de Sucesso
      toast.success('Agendamento solicitado com sucesso!');
    } catch (err) {
      console.error('Erro ao enviar agendamento online:', err);
      toast.error('Não foi possível enviar sua solicitação. Tente novamente ou chame no WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsAppShop = () => {
    const zap = brand.whatsapp || '5511999999999';
    const msg = `Olá! Acabei de solicitar um agendamento online no *${brand.name || 'OsSystem'}*.\n\n` +
      `👤 *Nome:* ${clientName}\n` +
      `🚗 *Veículo:* ${vehicleModel || 'Meu Veículo'} (${vehicleClass})\n` +
      `🛠️ *Serviço(s):* ${selectedServicesList.map(s => s.nome).join(', ')}\n` +
      `📅 *Data Escolhida:* ${selectedDate.split('-').reverse().join('/')} às ${selectedTime}\n\n` +
      `Gostaria de confirmar minha reserva! 🚀`;
    sendWhatsApp(zap, msg);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Glassmorphic */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} className="h-10 w-auto object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/40 font-black text-white text-xl">
              {brand.name ? brand.name.charAt(0) : 'O'}
            </div>
          )}
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              {brand.name || 'OsSystem'}
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Self-Booking
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Agendamento Online Rápido e Inteligente</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {brand.whatsapp && (
            <button 
              onClick={() => sendWhatsApp(brand.whatsapp, `Olá, estou no agendamento online e gostaria de tirar uma dúvida.`)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Ajuda pelo WhatsApp</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {step < 5 && (
          <div className="mb-8">
            {/* Wizard Progress Bar */}
            <div className="flex items-center justify-between relative max-w-2xl mx-auto mb-4 px-2 sm:px-6">
              <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-6 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
              {[
                { num: 1, label: 'Veículo', icon: Car },
                { num: 2, label: 'Serviços', icon: Sparkles },
                { num: 3, label: 'Data & Hora', icon: CalendarIcon },
                { num: 4, label: 'Resumo', icon: FileText }
              ].map((s) => {
                const IconComp = s.icon;
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center relative z-10">
                    <button
                      type="button"
                      disabled={step < s.num && step !== s.num}
                      onClick={() => s.num < step && setStep(s.num)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg ${
                        isDone ? 'bg-emerald-500 text-slate-950 shadow-emerald-900/50 scale-105' :
                        isActive ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-500/20 scale-110 shadow-emerald-950' :
                        'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : <IconComp className="w-4 h-4" />}
                    </button>
                    <span className={`text-[11px] font-bold mt-2 tracking-wide uppercase ${isActive ? 'text-emerald-400 font-extrabold' : isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Escolha do Veículo */}
        {step === 1 && (
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Qual é o seu veículo?</h2>
              <p className="text-slate-400 text-sm">Selecione a categoria e informe o modelo para um atendimento super personalizado e estimativa precisa.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-8">
              {VEHICLE_CLASSES.map((vc) => {
                const isSelected = vehicleClass === vc.id;
                return (
                  <button
                    key={vc.id}
                    type="button"
                    onClick={() => setVehicleClass(vc.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all group ${
                      isSelected 
                        ? 'bg-gradient-to-br from-emerald-500/15 to-teal-500/5 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/50' 
                        : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{vc.icon}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{vc.label}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{vc.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6 mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-400" /> Identificação do Veículo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Marca / Modelo do Veículo *</label>
                  <input
                    type="text"
                    placeholder="Ex: BMW 320i, Toyota Corolla, Onix 1.0..."
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ano (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 2024"
                    maxLength="4"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!vehicleModel.trim()) {
                    toast.warning('Por favor, informe a marca e modelo do veículo.');
                    return;
                  }
                  setStep(2);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Avançar para Escolha de Serviços</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Escolha de Serviços */}
        {step === 2 && (
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-700/80">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">O que deseja fazer no veículo?</h2>
                <p className="text-slate-400 text-sm">Selecione um ou mais serviços ou aproveite nossos combos com preço promocional.</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-700/80 px-4 py-2 rounded-xl flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Selecionado</span>
                  <span className="text-lg font-black text-emerald-400">
                    {totalEstimated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {selectedServiceIds.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-[500px] overflow-y-auto pr-1">
              {servicesCatalog.map((serv) => {
                const isChecked = selectedServiceIds.includes(serv.id);
                return (
                  <div
                    key={serv.id}
                    onClick={() => toggleService(serv.id)}
                    className={`p-5 rounded-xl border cursor-pointer flex flex-col justify-between gap-4 transition-all relative ${
                      isChecked
                        ? 'bg-gradient-to-br from-emerald-950/40 to-slate-800/90 border-emerald-500/80 ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/50'
                        : 'bg-slate-900/50 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60'
                    }`}
                  >
                    {serv.is_combo && (
                      <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" /> Combo Promocional
                      </span>
                    )}

                    <div className="flex items-start gap-3.5">
                      <div className={`w-6 h-6 rounded-lg border mt-0.5 flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 bg-slate-950'
                      }`}>
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 block mb-0.5">
                          {serv.categoria}
                        </span>
                        <h3 className="font-bold text-white text-base leading-snug">{serv.nome}</h3>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{serv.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                      <span className="flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> Estimativa: {serv.tempo_estimado}
                      </span>
                      <span className="font-black text-white text-sm bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        A partir de {Number(serv.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-700/80">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedServiceIds.length === 0) {
                    toast.warning('Selecione pelo menos um serviço para continuar.');
                    return;
                  }
                  setStep(3);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Escolher Data e Horário</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Escolha de Data e Horário */}
        {step === 3 && (
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-xl mb-6 pb-4 border-b border-slate-700/80">
              <h2 className="text-2xl font-black text-white tracking-tight">Quando deseja nos visitar?</h2>
              <p className="text-slate-400 text-sm">Selecione o melhor dia e horário. Nossa equipe reservará sua vaga de imediato.</p>
            </div>

            {/* Carrossel / Grid de Dias */}
            <div className="mb-8">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-emerald-400" /> 1. Escolha o Dia da Semana
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {availableDays.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.dateStr);
                        setSelectedTime(''); // Reseta horário ao trocar dia
                      }}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-950/60 scale-105'
                          : 'bg-slate-900/70 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {d.dayName}
                      </span>
                      <span className="text-base font-extrabold mt-0.5">{d.dayNum}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Deseja agendar para uma data posterior?</span>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Grid de Horários */}
            <div className="mb-8">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" /> 2. Escolha o Horário de Chegada
              </label>
              {!selectedDate ? (
                <div className="p-6 rounded-xl bg-slate-900/40 border border-dashed border-slate-700 text-center text-slate-500 text-sm">
                  👆 Selecione um dia acima para visualizar os horários disponíveis.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const taken = isTimeSlotTaken(slot);
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={taken}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all relative ${
                          taken
                            ? 'bg-slate-950/60 border-slate-800/80 text-slate-600 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950 ring-2 ring-emerald-500/30 font-black'
                            : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        {slot}
                        {taken && (
                          <span className="block text-[9px] font-extrabold uppercase text-rose-500 mt-0.5">
                            Ocupado 🔒
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-700/80">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedDate || !selectedTime) {
                    toast.warning('Selecione uma data e um horário para continuar.');
                    return;
                  }
                  setStep(4);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Preencher Meus Dados</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Seus Dados & Resumo Final */}
        {step === 4 && (
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-xl mb-6 pb-4 border-b border-slate-700/80">
              <h2 className="text-2xl font-black text-white tracking-tight">Estamos quase lá!</h2>
              <p className="text-slate-400 text-sm">Informe seus dados para contato e confira o resumo da sua solicitação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Formulário do Cliente */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Seu Nome Completo *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Ex: Carlos Eduardo de Souza"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">WhatsApp / Celular *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="(11) 99999-9999"
                        value={clientPhone}
                        onChange={handlePhoneChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">E-mail (Opcional)</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Observações ou Pedidos Especiais</label>
                  <textarea
                    rows="3"
                    placeholder="Ex: Gostaria de prioridade na entrega, o carro possui pequenos riscos na lateral direita..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 resize-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
                  <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200 block mb-0.5">Agendamento Sujeito à Confirmação</span>
                    Sua solicitação enviará um alerta em tempo real para a gerência da loja. Entraremos em contato via WhatsApp em minutos para validar sua reserva.
                  </div>
                </div>
              </div>

              {/* Card de Resumo Lateral */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between h-fit shadow-xl">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Resumo da Solicitação
                  </h3>

                  <div className="space-y-3.5 mb-6 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold uppercase block text-[10px]">Veículo Selecionado</span>
                      <p className="font-bold text-white text-sm mt-0.5">{vehicleModel || 'Veículo Não Especificado'}</p>
                      <span className="text-slate-400 text-[11px]">{vehicleClass} {vehicleYear ? `(${vehicleYear})` : ''}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-bold uppercase block text-[10px]">Data & Horário</span>
                      <p className="font-bold text-emerald-400 text-sm mt-0.5 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {selectedDate ? selectedDate.split('-').reverse().join('/') : ''} às {selectedTime}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-bold uppercase block text-[10px] mb-1">Serviços ({selectedServicesList.length})</span>
                      <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {selectedServicesList.map(s => (
                          <li key={s.id} className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                            <span className="font-medium truncate pr-2" title={s.nome}>{s.nome}</span>
                            <span className="font-bold text-slate-200 whitespace-nowrap">
                              {Number(s.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-semibold">Valor Estimado:</span>
                    <span className="text-xl font-black text-emerald-400">
                      {totalEstimated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitBooking}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 stroke-[2.5]" />
                        <span>Confirmar Agendamento</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-4 border-t border-slate-700/80">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Sucesso / Confirmação */}
        {step === 5 && submittedOrder && (
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-500/10 shadow-lg shadow-emerald-950">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-3 inline-block">
              Solicitação Recebida!
            </span>

            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Agendamento Solicitado com Sucesso!</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
              Olá, <strong className="text-white">{submittedOrder.clientName}</strong>! Nós já recebemos seu agendamento para o veículo <strong className="text-emerald-400">{submittedOrder.veiculoTexto}</strong> e enviamos um alerta em tempo real para o gestor.
            </p>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-8 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 font-semibold">Status:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Aguardando Validação
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 font-semibold">Data e Hora:</span>
                <span className="text-white font-bold">
                  {selectedDate.split('-').reverse().join('/')} às {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Valor Estimado:</span>
                <span className="text-emerald-400 font-extrabold text-sm">
                  {totalEstimated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => setShowSyncModal(true)}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-sm border border-emerald-500/30 flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <CalendarIcon className="w-5 h-5 text-emerald-400" />
                <span>Adicionar ao Meu Calendário 🗓️</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsAppShop}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>Confirmar no WhatsApp da Loja</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSelectedServiceIds([]);
                  setClientName('');
                  setClientPhone('');
                  setNotes('');
                  setSelectedTime('');
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-700 transition-all"
              >
                Fazer Novo Agendamento
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer minimalista */}
      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {brand.name || 'OsSystem'}. Todos os direitos reservados. Powered by White Label PWA.</p>
      </footer>

      {/* Modal Sincronização iCal / Google */}
      {submittedOrder && (
        <CalendarSyncModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          order={{
            id: submittedOrder.id,
            servico: submittedOrder.servico,
            data_agendamento: `${selectedDate}T${selectedTime}:00`,
            valor_total: totalEstimated,
            clientes: { nome: submittedOrder.clientName, telefone: clientPhone },
            veiculos: { marca: vehicleClass, modelo: vehicleModel, placa: vehiclePlate }
          }}
          shopName={brand.name || 'OsSystem Automotivo'}
          isManagerView={false}
        />
      )}
    </div>
  );
};

export default SelfBooking;
