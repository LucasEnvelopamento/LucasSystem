import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  Calendar, 
  Package, 
  Wrench, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  MousePointer2,
  HelpCircle,
  PlayCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const CategoryCard = ({ icon: Icon, title, description, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-500 group ${
      active 
        ? 'bg-primary border-primary shadow-2xl shadow-primary/20 -translate-y-1' 
        : 'bg-white border-slate-50 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50'
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
      active ? 'bg-white/20 text-white rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary'
    }`}>
      <Icon size={24} />
    </div>
    <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${active ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
    <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed ${active ? 'text-white/70' : 'text-slate-400'}`}>{description}</p>
  </button>
);

const HelpAccordion = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all hover:border-slate-200 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left group"
      >
        <span className="text-sm font-black text-slate-700 uppercase tracking-tight group-hover:text-primary transition-colors">{title}</span>
        <ChevronDown size={18} className={`text-slate-300 transition-transform duration-500 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-8 pb-8 animate-fadeIn">
          <div className="text-xs text-slate-500 font-bold leading-relaxed space-y-4 whitespace-pre-line">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

const AjudaPage = () => {
  const [activeCategory, setActiveCategory] = useState('vendas');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { 
      id: 'vendas', 
      title: 'Vendas & Orçamentos', 
      icon: TrendingUp, 
      description: 'Como gerar propostas e converter em ordens de serviço.',
      content: [
        { 
          q: "Como transformar um orçamento em Ordem de Serviço (OS)?", 
          a: "Acesse a tela de Vendas, localize o orçamento desejado e clique nos três pontinhos (Ações). Selecione 'Aprovar Proposta'. Você será direcionado para o modal de agendamento onde poderá definir data, hora e técnico. Após confirmar, o orçamento vira uma OS no status 'AGUARDANDO'." 
        },
        { 
          q: "Posso editar o valor de um serviço já pré-definido?", 
          a: "Sim! No Passo 4 (Resumo) do Novo Orçamento, você pode clicar no campo de valor do serviço para ajustá-lo manualmente. Além disso, gestores podem editar valores de OS em andamento pelo menu de Ações em Vendas." 
        },
        { 
          q: "Como enviar o orçamento para o cliente via WhatsApp?", 
          a: "Após salvar o orçamento, clique nos três pontinhos e selecione 'Enviar Orçamento'. O sistema abrirá o WhatsApp Web com uma mensagem formatada contendo todos os detalhes e valores." 
        }
      ]
    },
    { 
      id: 'agenda', 
      title: 'Agenda & Produção', 
      icon: Calendar, 
      description: 'Gestão de horários, ocupação da oficina e agendamentos.',
      content: [
        { 
          q: "Como visualizar a ocupação do dia antes de agendar?", 
          a: "Ao abrir o modal de agendamento, o sistema exibe automaticamente uma seção chamada 'Ocupação deste dia' na lateral ou rodapé, mostrando todos os serviços já marcados para o mesmo horário para evitar conflitos." 
        },
        { 
          q: "Consigo trocar o técnico de uma OS já agendada?", 
          a: "Sim. Na Agenda, localize o serviço, clique nele e selecione 'Alterar Agenda'. Você poderá escolher um novo responsável e o sistema atualizará a fila do Operador em tempo real." 
        }
      ]
    },
    { 
      id: 'checklist', 
      title: 'Checklist & Vistoria', 
      icon: ShieldCheck, 
      description: 'Uso do mapa visual de avarias e assinatura digital.',
      content: [
        { 
          q: "Para que serve o Checklist Visual?", 
          a: "O Checklist é a sua segurança jurídica. Ele permite marcar no desenho do veículo (Carro ou Moto) onde já existem riscos ou amassados antes de você iniciar o trabalho, evitando que o cliente alegue que o dano ocorreu na sua loja." 
        },
        { 
          q: "O cliente precisa assinar no celular?", 
          a: "Sim. Ao finalizar a vistoria de entrada, o sistema solicita a assinatura digital do cliente diretamente na tela do tablet ou celular. Essa assinatura é salva junto com as avarias para conferência futura." 
        }
      ]
    },
    { 
      id: 'operador', 
      title: 'Módulo do Operador (PWA)', 
      icon: Smartphone, 
      description: 'Orientações para os técnicos na linha de frente.',
      content: [
        { 
          q: "Como o Operador coleta um serviço disponível?", 
          a: "Na tela inicial (Tarefas), o operador verá a aba 'Disponíveis'. Basta clicar no serviço desejado e selecionar 'Coletar'. A OS passará imediatamente para o status 'EM EXECUÇÃO' e o cronômetro será iniciado." 
        },
        { 
          q: "Como registrar fotos durante a execução?", 
          a: "Dentro de uma OS em aberto, o operador pode clicar em 'Adicionar Foto' e usar a câmera do celular para registrar etapas críticas do processo. Essas fotos ficam vinculadas à OS no histórico do Gestor." 
        }
      ]
    },
    { 
      id: 'tv', 
      title: 'Monitor TV & Branding', 
      icon: Monitor, 
      description: 'Configuração da TV da oficina e identidade visual.',
      content: [
        { 
          q: "Como alterar o vídeo que passa na TV?", 
          a: "Vá em Configurações > TV e Marketing. Insira o ID do vídeo do YouTube (os caracteres após 'v=' no link) e salve. O monitor da loja atualizará automaticamente em poucos segundos." 
        },
        { 
          q: "Minha logomarca não aparece no Certificado de Garantia.", 
          a: "Certifique-se de que fez o upload da Logomarca em Configurações > Identidade Visual. O sistema utiliza esse mesmo arquivo para a TV, os Certificados de Garantia e o Link de acompanhamento do cliente." 
        }
      ]
    },
  ];

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div className="fade-in space-y-10 pb-20">
      {/* Hero Section */}
      <section className="relative p-10 md:p-14 bg-slate-900 rounded-[3rem] overflow-hidden text-white shadow-2xl shadow-slate-200">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
            <LifeBuoy size={14} /> Central de Treinamento
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase">Como podemos te ajudar hoje?</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Explore os manuais e tire suas dúvidas sobre o ecossistema OsSystem.</p>
          
          <div className="relative group max-w-md pt-4">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar guia ou dúvida..."
              className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl outline-none focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-primary/20 transition-all font-bold text-sm tracking-tight"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <HelpCircle className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
      </section>

      {/* Categories Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <CategoryCard 
            key={cat.id}
            icon={cat.icon}
            title={cat.title}
            description={cat.description}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          />
        ))}
      </section>

      {/* Topic Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 min-h-[400px]">
        {/* Left Column: FAQ/Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-6 mb-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Perguntas Frequentes: {activeCategoryData?.title}</h3>
          </div>
          {activeCategoryData?.content
            .filter(item => 
              item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
              item.a.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item, idx) => (
              <HelpAccordion key={idx} title={item.q} content={item.a} />
          ))}
          {activeCategoryData?.content.filter(item => 
              item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
              item.a.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
            <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <Search size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Nenhum resultado para sua busca</p>
            </div>
          )}
        </div>

        {/* Right Column: Quick Links / Video */}
        <div className="space-y-6">
          <div className="card-premium p-8 bg-primary/5 border-primary/10 shadow-none rounded-[2.5rem]">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
              <PlayCircle size={18} /> Vídeo Aula Rápida
            </h4>
            <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer shadow-xl">
               <div className="w-14 h-14 bg-white text-primary rounded-full flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110">
                 <PlayCircle size={32} />
               </div>
               <p className="mt-4 text-[9px] font-black text-white uppercase tracking-widest opacity-60">Assistir Treinamento</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <MousePointer2 size={18} className="text-primary" /> Links Úteis
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Suporte via WhatsApp', icon: ExternalLink },
                { label: 'Canal de Novidades', icon: ExternalLink },
                { label: 'Termos de Uso', icon: ShieldCheck },
              ].map((link, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-primary/5 hover:border-primary/20 transition-all font-bold text-xs text-slate-600">
                  <span className="group-hover:text-primary transition-colors">{link.label}</span>
                  <link.icon size={16} className="text-slate-300 group-hover:text-primary transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Footer */}
      <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="space-y-2">
          <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Não encontrou o que precisava?</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nossa equipe de suporte está online para te atender agora.</p>
        </div>
        <button className="px-10 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
           Falar com Especialista <ChevronRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default AjudaPage;
