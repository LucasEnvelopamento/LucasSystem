import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  Tag, 
  Layers, 
  ShieldCheck, 
  Car, 
  Search, 
  Filter, 
  ExternalLink,
  PlusCircle,
  FileText
} from 'lucide-react';
import { toast } from '../../utils/toast';
import { supabase } from '../../lib/supabase';

const TemplatesMarketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [importedIds, setImportedIds] = useState(() => {
    const salvo = localStorage.getItem('ossystem_imported_templates');
    if (salvo) {
      try { return JSON.parse(salvo); } catch(e) {}
    }
    return [];
  });
  const [importingId, setImportingId] = useState(null);

  const categorias = ['TODOS', 'ENVELOPAMENTO & PPF', 'ESTÉTICA & DETALHAMENTO', 'VISTORIA & LAUDOS'];

  const templatesCurados = [
    {
      id: 'tpl_ppf_911',
      titulo: 'Pacote PPF Frontal Porsche 911 / GT3',
      categoria: 'ENVELOPAMENTO & PPF',
      descricao: 'Proteção completa da dianteira (capô, paralamas, para-choque frontal e faróis) com filme de poliuretano auto-regenerativo 200 micras.',
      preco_sugerido: 8500.00,
      garantia_meses: 60,
      tempo_estimado_horas: 16,
      rating: 4.9,
      downloads: 342,
      destaque: true,
      tags: ['PPF', 'Porsche', 'Alta Gama', 'Regenerativo']
    },
    {
      id: 'tpl_vitrificacao_9h',
      titulo: 'Vitrificação Cerâmica 9H Tripla Camada',
      categoria: 'ESTÉTICA & DETALHAMENTO',
      descricao: 'Lavagem técnica de descontaminação ferrosa, polimento de correção de pintura em 3 etapas e aplicação de coating cerâmico 9H com garantia 5 anos.',
      preco_sugerido: 3200.00,
      garantia_meses: 60,
      tempo_estimado_horas: 24,
      rating: 5.0,
      downloads: 518,
      destaque: true,
      tags: ['Ceramic 9H', 'Polimento', 'Hidrofobia']
    },
    {
      id: 'tpl_chrome_delete',
      titulo: 'Chrome Delete & Black Piano Completo',
      categoria: 'ENVELOPAMENTO & PPF',
      descricao: 'Envelopamento de frisos das portas, grade dianteira, emblemas, rack de teto e ponteiras de escapamento utilizando vinil cast preto alto brilho premium.',
      preco_sugerido: 1800.00,
      garantia_meses: 36,
      tempo_estimado_horas: 8,
      rating: 4.8,
      downloads: 289,
      destaque: false,
      tags: ['Chrome Delete', 'Black Piano', 'Esportividade']
    },
    {
      id: 'tpl_vistoria_superesportivos',
      titulo: 'Checklist Vistoria de Superesportivos (28 Pontos)',
      categoria: 'VISTORIA & LAUDOS',
      descricao: 'Modelo de laudo pré-serviço especializado para veículos exóticos com inspeção minuciosa de peças em fibra de carbono, rodas forjadas e pinças de freio de cerâmica.',
      preco_sugerido: 0.00,
      garantia_meses: 0,
      tempo_estimado_horas: 1,
      rating: 4.9,
      downloads: 410,
      destaque: false,
      tags: ['Laudo VCR', 'Supercarros', 'Auditoria']
    },
    {
      id: 'tpl_ppf_full_wrap',
      titulo: 'Envelopamento PPF Full Body (Corpo Inteiro)',
      categoria: 'ENVELOPAMENTO & PPF',
      descricao: 'Proteção total e blindagem da pintura 360° em todas as peças externas do veículo contra pedradas, arranhões, fezes de aves e vandalismo.',
      preco_sugerido: 18000.00,
      garantia_meses: 120,
      tempo_estimado_horas: 40,
      rating: 5.0,
      downloads: 195,
      destaque: true,
      tags: ['Full PPF', 'Ultra Premium', '10 Anos']
    },
    {
      id: 'tpl_higienização_couro',
      titulo: 'Higienização Interna & Vitrificação de Couro',
      categoria: 'ESTÉTICA & DETALHAMENTO',
      descricao: 'Limpeza profunda a vapor de carpetes e teto, tratamento antifungo e aplicação de selante UV para bancos de couro sintético ou natural.',
      preco_sugerido: 1200.00,
      garantia_meses: 12,
      tempo_estimado_horas: 6,
      rating: 4.7,
      downloads: 264,
      destaque: false,
      tags: ['Interior', 'Couro', 'A vapor']
    }
  ];

  const templatesFiltrados = templatesCurados.filter(tpl => {
    const matchCat = selectedCategory === 'TODOS' || tpl.categoria === selectedCategory;
    const matchSearch = tpl.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tpl.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tpl.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Importar para o catálogo da loja
  const handleImportTemplate = async (tpl) => {
    setImportingId(tpl.id);
    try {
      // 1. Tentar salvar na tabela 'servicos' do Supabase
      const novoServico = {
        nome: tpl.titulo,
        descricao: `${tpl.descricao} (Importado via Marketplace)`,
        preco: tpl.preco_sugerido,
        garantia_meses: tpl.garantia_meses,
        categoria: tpl.categoria,
        ativo: true
      };

      const { error } = await supabase.from('servicos').insert([novoServico]);
      if (error) console.warn('Falha remota ao salvar no Supabase, mantendo cache local:', error);

      // 2. Persistir na lista local de importados
      const novosImportados = [...importedIds, tpl.id];
      setImportedIds(novosImportados);
      localStorage.setItem('ossystem_imported_templates', JSON.stringify(novosImportados));

      // 3. Adicionar também no localStorage geral de serviços caso seja operado em offline
      const servicosAtuais = JSON.parse(localStorage.getItem('ossystem_servicos_custom') || '[]');
      localStorage.setItem('ossystem_servicos_custom', JSON.stringify([{ id: Date.now(), ...novoServico }, ...servicosAtuais]));

      toast.success(`"${tpl.titulo}" importado para o catálogo de Serviços da sua loja com sucesso! 🚀`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao importar template.');
    } finally {
      setImportingId(null);
    }
  };

  const formatMoney = (val) => {
    if (!val || val === 0) return 'Gratuito / Laudo';
    return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Banner Superior do Marketplace */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl font-black shadow-lg shadow-emerald-500/20 mt-1">
            <ShoppingBag size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] uppercase tracking-widest border border-emerald-500/30">
                Rede de Parceiros • Ecossistema
              </span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mt-1">
              Marketplace de Templates & Checklists
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
              Descubra e importe pacotes de serviços precificados, laudos de vistoria VCR e receitas de detalhamento validadas por oficinas líderes da rede diretamente para o seu catálogo em 1 clique!
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center flex-shrink-0">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Templates Disponíveis</p>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">{templatesCurados.length} Modelos</p>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtro por Categoria */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por PPF, Vitrificação, Porsche, Chrome Delete..."
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:text-white shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templatesFiltrados.map(tpl => {
          const isImported = importedIds.includes(tpl.id);
          const isBusy = importingId === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl ${
                tpl.destaque ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-primary/10 text-primary tracking-wider font-mono">
                    {tpl.categoria}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                    <Star size={14} className="fill-amber-500" />
                    <span>{tpl.rating}</span>
                    <span className="text-slate-400 text-[10px] font-medium">({tpl.downloads})</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-800 dark:text-white tracking-tight leading-snug">
                    {tpl.titulo}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">
                    {tpl.descricao}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tpl.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Preço Sugerido</p>
                    <p className="font-black text-slate-800 dark:text-white text-sm">
                      {formatMoney(tpl.preco_sugerido)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Garantia / Tempo</p>
                    <p className="font-bold text-slate-600 dark:text-slate-300 text-xs">
                      {tpl.garantia_meses ? `${tpl.garantia_meses / 12} Anos` : 'N/A'} • {tpl.tempo_estimado_horas}h
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleImportTemplate(tpl)}
                  disabled={isImported || isBusy}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-80 ${
                    isImported
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-primary hover:bg-emerald-600 text-white shadow-primary/20'
                  }`}
                >
                  {isBusy ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Importando...</span>
                    </>
                  ) : isImported ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Instalado no Catálogo</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Importar para Loja</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {templatesFiltrados.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <ShoppingBag size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <p className="font-black uppercase text-xs text-slate-400">Nenhum template encontrado com esses filtros.</p>
        </div>
      )}
    </div>
  );
};

export default TemplatesMarketplace;
