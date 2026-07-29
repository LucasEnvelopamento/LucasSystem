import React, { useState } from 'react';
import { Plus, Search, Wrench, ShieldCheck, MoreHorizontal, DollarSign, Loader2, Type, Car, Trash2, X, Zap, AlertCircle } from 'lucide-react';
import { useCatalog, useInventory } from '../hooks/useData';
import Pagination from '../components/ui/Pagination';
import { toast } from '../utils/toast';
import { confirmDialog } from '../utils/confirm';

const ServicosView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formService, setFormService] = useState({
    nome: '',
    descricao: '',
    preco_base: '',
    categoria: 'Geral',
    tipo_veiculo: 'AMBOS',
    garantia: '12 meses',
    controle_estoque: false,
    materiais: [],
    precos_por_classe: {},
    is_combo: false,
    itens_combo: []
  });

  const { inventory } = useInventory();

  const { services, loading, saveService, updateService, deleteService } = useCatalog();

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormService({
      nome: service.nome || '',
      descricao: service.descricao || '',
      preco_base: service.preco_base || '',
      categoria: service.categoria || 'Geral',
      tipo_veiculo: service.tipo_veiculo || 'AMBOS',
      garantia: service.garantia || '12 meses',
      controle_estoque: service.controle_estoque || false,
      materiais: service.materiais || [],
      precos_por_classe: service.precos_por_classe || {},
      is_combo: service.is_combo || false,
      itens_combo: service.itens_combo || []
    });
    setShowAddModal(true);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const cleanedPrecos = {};
    if (formService.precos_por_classe) {
      Object.entries(formService.precos_por_classe).forEach(([key, val]) => {
        const num = parseFloat(val);
        if (num && num > 0) {
          cleanedPrecos[key] = num;
        }
      });
    }

    const serviceData = {
      ...formService,
      preco_base: parseFloat(formService.preco_base) || 0,
      precos_por_classe: cleanedPrecos,
      is_combo: formService.is_combo || false,
      itens_combo: formService.is_combo ? (formService.itens_combo || []) : []
    };

    let res;
    if (editingService) {
      res = await updateService(editingService.id, serviceData);
    } else {
      res = await saveService(serviceData);
    }

    setIsSaving(false);
    if (res.success) {
      toast.success(editingService ? 'Serviço atualizado com sucesso!' : 'Novo serviço adicionado ao catálogo!');
      setShowAddModal(false);
      setEditingService(null);
      setFormService({ nome: '', descricao: '', preco_base: '', categoria: 'Geral', tipo_veiculo: 'AMBOS', garantia: '12 meses', controle_estoque: false, materiais: [], precos_por_classe: {}, is_combo: false, itens_combo: [] });
    }
  };

  const handleOpenAdd = () => {
     setEditingService(null);
     setFormService({ nome: '', descricao: '', preco_base: '', categoria: 'Geral', tipo_veiculo: 'AMBOS', garantia: '12 meses', controle_estoque: false, materiais: [], precos_por_classe: {}, is_combo: false, itens_combo: [] });
     setShowAddModal(true);
  };

  const filteredServices = services.filter(s => 
    (s.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Carregando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Catálogo de Serviços</h2>
          <p className="text-sm text-slate-500 font-medium">Defina os serviços oferecidos e seus tempos de garantia.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-emerald-600 transition-all font-black uppercase text-[10px] tracking-widest"
        >
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      <div className="relative w-full">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar no catálogo..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm font-bold shadow-sm"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((s) => (
          <div key={s.id} className="bg-white p-8 flex flex-col justify-between border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                  <Wrench size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">{s.nome}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-0.5 rounded-md">{s.categoria || 'Geral'}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      s.tipo_veiculo === 'MOTO' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                      s.tipo_veiculo === 'CARRO' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {s.tipo_veiculo === 'MOTO' ? 'Moto' : s.tipo_veiculo === 'CARRO' ? 'Carro' : 'Ambos'}
                    </span>
                    {s.is_combo && (
                      <span className="text-[8px] font-black uppercase tracking-[0.1em] text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        🎁 Combo ({s.itens_combo?.length || 0} itens)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={async () => {
                    const confirm = await confirmDialog(
                      'Excluir Serviço',
                      `Tem certeza que deseja remover "${s.nome}" do catálogo?`,
                      'Excluir',
                      'Cancelar'
                    );
                    if (confirm) {
                      const res = await deleteService(s.id);
                      if (res.success) {
                        toast.success('Serviço excluído!');
                      } else {
                        toast.error('Erro ao excluir serviço.');
                      }
                    }
                  }}
                  className="text-slate-300 hover:text-rose-600 p-2 transition-colors rounded-full hover:bg-rose-50"
                  title="Excluir Serviço"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mb-8 line-clamp-3 font-medium leading-relaxed italic">{s.descricao || 'Sem descrição cadastrada.'}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 items-center flex gap-1">
                    <ShieldCheck size={10} className="text-emerald-500" /> Garantia
                  </span>
                  <span className="text-xs font-bold text-slate-600">{s.garantia || 'Consultar'}</span>
                </div>
                
                {s.controle_estoque && (
                  <div className="flex flex-col border-l border-slate-100 pl-6">
                     <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 items-center flex gap-1">
                      <ShieldCheck size={10} className="text-blue-500" /> Estoque
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest mt-0.5">Controlado</span>
                  </div>
                )}
                
                <div className="flex flex-col border-l border-slate-100 pl-6">
                   <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 items-center flex gap-1">
                    <DollarSign size={10} className="text-primary" /> Investimento
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-black text-slate-800 tracking-tighter">
                      {s.preco_base ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.preco_base) : '---'}
                    </span>
                    {s.precos_por_classe && Object.keys(s.precos_por_classe).length > 0 && (
                      <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded shadow-sm" title="Preços dinâmicos ativos por porte de veículo">
                        ⚡ {Object.keys(s.precos_por_classe).length} {Object.keys(s.precos_por_classe).length === 1 ? 'Porte' : 'Portes'}
                      </span>
                    )}
                    {(() => {
                      if (!s.is_combo || !s.itens_combo?.length) return null;
                      const somaAvulso = s.itens_combo.reduce((acc, id) => {
                        const srv = services.find(x => x.id === id);
                        return acc + (Number(srv?.preco_base) || 0);
                      }, 0);
                      if (somaAvulso > s.preco_base && s.preco_base > 0) {
                        const perc = Math.round(((somaAvulso - s.preco_base) / somaAvulso) * 100);
                        return (
                          <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded shadow-sm" title={`Valor avulso: R$ ${somaAvulso.toLocaleString('pt-BR')}`}>
                            🔥 {perc}% OFF
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleOpenEdit(s)}
                className="text-[10px] font-black text-primary hover:text-emerald-700 uppercase tracking-[0.2em] transition-all bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 hover:border-primary/30"
              >
                Detalhes
              </button>
            </div>
          </div>
        ))}
        {filteredServices.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-30">
            <Wrench size={48} className="mx-auto mb-3" />
            <p className="font-black uppercase tracking-widest text-xs">Nenhum serviço no catálogo</p>
          </div>
        )}
      </div>
      <Pagination 
        currentPage={currentPage}
        totalItems={filteredServices.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        className="rounded-[2rem] border border-slate-100 mt-4 shadow-sm"
      />

      {/* Modal - Novo Serviço / Edição */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh]">
            {/* Header Fixo */}
            <div className="p-6 md:p-10 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  {editingService ? 'Editar Serviço' : 'Cadastrar Serviço'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Configurações do Catálogo de Estética</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-800 transition-all group"
              >
                <Plus size={24} className="rotate-45 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            {/* Conteúdo Rolável */}
            <form onSubmit={handleAddService} className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Serviço</label>
                  <div className="relative group">
                    <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      required 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white font-bold text-sm transition-all shadow-inner" 
                      placeholder="Ex: PPF Capô Frontal"
                      value={formService.nome}
                      onChange={e => setFormService({...formService, nome: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <div className="relative group">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <select 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white font-bold text-sm appearance-none transition-all shadow-inner"
                      value={formService.categoria}
                      onChange={e => setFormService({...formService, categoria: e.target.value})}
                    >
                      <option value="Geral">Geral</option>
                      <option value="PPF">PPF</option>
                      <option value="Estética">Estética</option>
                      <option value="Insulfilm">Insulfilm</option>
                      <option value="Adesivagem">Adesivagem</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Veículos Compatíveis</label>
                  <div className="relative group">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <select 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white font-bold text-sm appearance-none transition-all shadow-inner"
                      value={formService.tipo_veiculo}
                      onChange={e => setFormService({...formService, tipo_veiculo: e.target.value})}
                    >
                      <option value="AMBOS">Todos (Carro & Moto)</option>
                      <option value="CARRO">Apenas Carros</option>
                      <option value="MOTO">Apenas Motos</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tempo de Garantia</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white font-bold text-sm transition-all shadow-inner" 
                      placeholder="Ex: 12 meses"
                      value={formService.garantia}
                      onChange={e => setFormService({...formService, garantia: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Base (R$)</label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary/40 group-focus-within:text-primary transition-colors">R$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white font-black text-sm transition-all shadow-inner" 
                      placeholder="0,00"
                      value={formService.preco_base}
                      onChange={e => setFormService({...formService, preco_base: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 pb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detalhamento Técnico / Descrição</label>
                <textarea 
                  className="w-full h-32 px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white font-bold text-sm resize-none shadow-inner transition-all" 
                  placeholder="Descreva os materiais inclusos e o que será feito..."
                  value={formService.descricao}
                  onChange={e => setFormService({...formService, descricao: e.target.value})}
                ></textarea>
              </div>

              {/* Seção de Preço Dinâmico por Porte (Fase 57) */}
              <div className="flex flex-col gap-4 bg-amber-50/50 p-6 rounded-[2rem] border border-amber-200/80 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={16} className="text-amber-500 fill-amber-500" /> Preço Dinâmico por Porte do Veículo (Opcional)
                  </label>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Defina valores diferenciados de acordo com o porte do automóvel. Se deixado em branco ou zero, o sistema utilizará o <strong>Preço Base</strong> automaticamente na abertura de orçamento/OS.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  {['Hatch', 'Sedan', 'SUV', 'Pickup', 'Esportivo', 'Moto'].map((porte) => (
                    <div key={porte} className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{porte}</label>
                      <div className="relative group">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs group-focus-within:text-amber-600 transition-colors">R$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full pl-9 pr-3 py-3 bg-white border border-amber-200/80 rounded-xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 font-bold text-xs transition-all shadow-sm"
                          placeholder="Base"
                          value={formService.precos_por_classe?.[porte] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormService({
                              ...formService,
                              precos_por_classe: {
                                ...(formService.precos_por_classe || {}),
                                [porte]: val
                              }
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção de Pacotes e Combos de Serviços (Fase 57.2) */}
              <div className="flex flex-col gap-4 bg-purple-50/50 p-6 rounded-[2rem] border border-purple-200/80 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      id="is_combo" 
                      className="w-6 h-6 rounded-lg text-purple-600 border-purple-300 focus:ring-purple-500/20 transition-all cursor-pointer"
                      checked={formService.is_combo || false}
                      onChange={(e) => setFormService({...formService, is_combo: e.target.checked, itens_combo: e.target.checked ? (formService.itens_combo || []) : []})}
                    />
                    <label htmlFor="is_combo" className="cursor-pointer select-none">
                      <span className="block text-sm font-black text-purple-900 tracking-tight flex items-center gap-1.5">
                        🎁 Este Serviço é um Pacote / Combo Promocional?
                      </span>
                      <span className="block text-[10px] font-bold text-purple-700 mt-0.5 uppercase tracking-widest">
                        Agrupa múltiplos serviços do catálogo com desconto promocional.
                      </span>
                    </label>
                  </div>
                </div>

                {formService.is_combo && (
                  <div className="pt-4 border-t border-purple-200/60 flex flex-col gap-3 animate-in fade-in slide-in-from-top-3">
                    <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest">
                      Selecione os Serviços Inclusos neste Combo:
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border border-purple-100 bg-white/80 p-3 rounded-2xl">
                      {services.filter(s => s.id !== editingService?.id && !s.is_combo).length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium py-2 text-center">Nenhum serviço avulso cadastrado para agrupar.</p>
                      ) : (
                        services.filter(s => s.id !== editingService?.id && !s.is_combo).map(srv => {
                          const isSelected = (formService.itens_combo || []).includes(srv.id);
                          return (
                            <div 
                              key={srv.id} 
                              onClick={() => {
                                const current = formService.itens_combo || [];
                                const next = isSelected ? current.filter(id => id !== srv.id) : [...current, srv.id];
                                setFormService({ ...formService, itens_combo: next });
                              }}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isSelected ? 'bg-purple-100/60 border-purple-300 text-purple-900 font-bold shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected} 
                                  onChange={() => {}} 
                                  className="w-4 h-4 rounded text-purple-600 border-slate-300 pointer-events-none" 
                                />
                                <div>
                                  <p className="text-xs">{srv.nome}</p>
                                  <p className="text-[9px] text-slate-400 font-black uppercase">{srv.categoria}</p>
                                </div>
                              </div>
                              <span className="text-xs font-black text-slate-800">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(srv.preco_base || 0)}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Cálculo Automático da Economia / Resumo */}
                    {(() => {
                      const somaAvulso = (formService.itens_combo || []).reduce((acc, id) => {
                        const srv = services.find(x => x.id === id);
                        return acc + (Number(srv?.preco_base) || 0);
                      }, 0);
                      const precoCombo = Number(formService.preco_base) || 0;
                      const economia = somaAvulso - precoCombo;
                      const percOff = somaAvulso > 0 ? Math.round((economia / somaAvulso) * 100) : 0;

                      return (
                        <div className="bg-purple-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md mt-1">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 block">Valor Avulso (Soma dos Itens)</span>
                            <span className="text-sm font-bold line-through text-purple-200">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(somaAvulso)}
                            </span>
                          </div>
                          <div className="sm:text-right">
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block">
                              {economia > 0 ? `🔥 Economia para o Cliente (${percOff}% OFF)` : 'Defina o Preço Base (Promocional)'}
                            </span>
                            <span className="text-lg font-black text-emerald-300">
                              {economia > 0 ? `Economize ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(economia)}` : '---'}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 transition-all">
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    id="controle_estoque" 
                    className="w-6 h-6 rounded-lg text-primary border-slate-300 focus:ring-primary/20 transition-all cursor-pointer"
                    checked={formService.controle_estoque}
                    onChange={(e) => setFormService({...formService, controle_estoque: e.target.checked})}
                  />
                  <label htmlFor="controle_estoque" className="cursor-pointer select-none">
                    <span className="block text-sm font-black text-slate-800 tracking-tight">Habilitar Controle de Estoque</span>
                    <span className="block text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Exige baixa obrigatória de material na OS (ex: Metros de PPF).</span>
                  </label>
                </div>

                {formService.controle_estoque && (
                  <div className="pt-4 border-t border-blue-100 flex flex-col mt-2 mb-2 animate-in fade-in slide-in-from-top-4">
                     <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2">
                         <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                             <Zap size={12} className="text-blue-500" /> Insumos Padrão do Serviço
                         </label>
                         {formService.is_combo && (
                           <button
                             type="button"
                             onClick={() => {
                               const combosMats = [];
                               (formService.itens_combo || []).forEach(srvId => {
                                 const srv = services.find(x => x.id === srvId);
                                 if (srv?.controle_estoque && srv.materiais?.length) {
                                   srv.materiais.forEach(m => {
                                     const existingIdx = combosMats.findIndex(x => x.material_id === m.material_id);
                                     if (existingIdx >= 0) {
                                       combosMats[existingIdx].quantidade = (Number(combosMats[existingIdx].quantidade) || 0) + (Number(m.quantidade) || 0);
                                     } else {
                                       combosMats.push({ ...m });
                                     }
                                   });
                                 }
                               });
                               if (combosMats.length > 0) {
                                 setFormService({ ...formService, materiais: combosMats });
                                 toast.success(`${combosMats.length} insumos importados dos serviços do combo!`);
                               } else {
                                 toast.info('Os serviços selecionados neste combo não exigem materiais controlados.');
                               }
                             }}
                             className="text-[9px] font-black text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all shadow-sm flex items-center gap-1"
                           >
                             ⚡ Importar Insumos do Combo
                           </button>
                         )}
                     </div>

                     {(formService.materiais || []).map((mat, matIdx) => (
                       <div key={mat.id || matIdx} className="flex items-end gap-3 mb-3">
                         <div className="flex-1 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Material do Almoxarifado</label>
                            <select 
                              className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 text-sm font-bold shadow-sm"
                              value={mat.material_id || ''}
                              onChange={e => {
                                 const next = [...(formService.materiais || [])];
                                 next[matIdx].material_id = e.target.value;
                                 setFormService({ ...formService, materiais: next });
                              }}
                            >
                              <option value="">Selecione o Produto...</option>
                              {inventory.map(inv => (
                                <option key={inv.id} value={inv.id}>{inv.nome} ({inv.quantidade} {inv.unidade})</option>
                              ))}
                            </select>
                         </div>
                         <div className="w-24 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Qtd</label>
                            <input 
                              type="number" 
                              min="0.1" 
                              step="any"
                              className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 text-sm font-bold shadow-sm text-center"
                              value={mat.quantidade}
                              onChange={e => {
                                 const next = [...(formService.materiais || [])];
                                 next[matIdx].quantidade = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                                 setFormService({ ...formService, materiais: next });
                              }}
                              placeholder="0"
                            />
                         </div>
                         <button 
                           type="button"
                           onClick={() => {
                              const next = (formService.materiais || []).filter((_, i) => i !== matIdx);
                              setFormService({ ...formService, materiais: next });
                           }}
                           className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-white border border-rose-100 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all font-black"
                           title="Remover Insumo"
                         >
                           <X size={16} strokeWidth={3} />
                         </button>
                       </div>
                     ))}

                     <button 
                       type="button"
                       onClick={() => {
                          const next = [...(formService.materiais || []), { id: Date.now(), material_id: '', quantidade: '' }];
                          setFormService({ ...formService, materiais: next });
                       }}
                       className="mt-2 text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 bg-white/50 hover:bg-white px-4 py-2.5 rounded-xl self-start flex items-center gap-2 transition-all border border-blue-200/50 shadow-sm"
                     >
                       <Plus size={14} /> Adicionar Item
                     </button>
                  </div>
                )}
              </div>
            </form>

            {/* Rodapé Fixo */}
            <div className="p-6 md:p-8 border-t border-slate-50 shrink-0 bg-white">
              <div className="flex flex-col-reverse md:flex-row gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddService}
                  disabled={isSaving}
                  className="flex-1 bg-primary text-white py-5 rounded-[2rem] shadow-xl shadow-primary/20 uppercase tracking-[0.2em] font-black text-[10px] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  {editingService ? 'Atualizar Serviço' : 'Salvar no Catálogo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicosView;
