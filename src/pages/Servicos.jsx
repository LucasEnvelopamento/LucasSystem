import React, { useState } from 'react';
import { Plus, Search, Wrench, ShieldCheck, MoreHorizontal, DollarSign, Loader2, Type, Car, Trash2 } from 'lucide-react';
import { useCatalog } from '../hooks/useData';

const ServicosView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formService, setFormService] = useState({
    nome: '',
    descricao: '',
    preco_base: '',
    categoria: 'Geral',
    tipo_veiculo: 'AMBOS',
    garantia: '12 meses'
  });

  const { services, loading, saveService, updateService, deleteService } = useCatalog();

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormService({
      nome: service.nome || '',
      descricao: service.descricao || '',
      preco_base: service.preco_base || '',
      categoria: service.categoria || 'Geral',
      tipo_veiculo: service.tipo_veiculo || 'AMBOS',
      garantia: service.garantia || '12 meses'
    });
    setShowAddModal(true);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const serviceData = {
      ...formService,
      preco_base: parseFloat(formService.preco_base) || 0
    };

    let res;
    if (editingService) {
      res = await updateService(editingService.id, serviceData);
    } else {
      res = await saveService(serviceData);
    }

    setIsSaving(false);
    if (res.success) {
      setShowAddModal(false);
      setEditingService(null);
      setFormService({ nome: '', descricao: '', preco_base: '', categoria: 'Geral', tipo_veiculo: 'AMBOS', garantia: '12 meses' });
    }
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
          onClick={() => {
            setEditingService(null);
            setFormService({ nome: '', descricao: '', preco_base: '', categoria: 'Geral', tipo_veiculo: 'AMBOS', garantia: '12 meses' });
            setShowAddModal(true);
          }}
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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((s) => (
          <div key={s.id} className="bg-white p-8 flex flex-col justify-between border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                  <Wrench size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">{s.nome}</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-0.5 rounded-md">{s.categoria || 'Geral'}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      s.tipo_veiculo === 'MOTO' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                      s.tipo_veiculo === 'CARRO' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {s.tipo_veiculo === 'MOTO' ? 'Moto' : s.tipo_veiculo === 'CARRO' ? 'Carro' : 'Ambos'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={async () => {
                    if (window.confirm('Tem certeza que deseja excluir esse serviço?')) {
                      await deleteService(s.id);
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
                
                <div className="flex flex-col border-l border-slate-100 pl-6">
                   <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 items-center flex gap-1">
                    <DollarSign size={10} className="text-primary" /> Investimento
                  </span>
                  <span className="text-lg font-black text-slate-800 tracking-tighter">
                    {s.preco_base ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.preco_base) : '---'}
                  </span>
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

      {/* Modal - Novo Serviço / Edição */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh]">
            {/* Header Fixo */}
            <div className="p-8 md:p-10 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
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
                      <option value="Mecânica">Mecânica</option>
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
            </form>

            {/* Rodapé Fixo */}
            <div className="p-8 border-t border-slate-50 shrink-0 bg-white">
              <div className="flex gap-4">
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
