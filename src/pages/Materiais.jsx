import React, { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, ArrowUpRight, History, Loader2, Edit2, Trash2, X } from 'lucide-react';
import { useInventory } from '../hooks/useData';
import { toast } from '../utils/toast';
import { confirmDialog } from '../utils/confirm';

const MateriaisView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { inventory, loading, saveItem, updateItem, deleteItem } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [repondoItem, setRepondoItem] = useState(null);

  const filteredInventory = inventory.filter(i => 
    i.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItens = inventory.length;
  const estoqueCritico = inventory.filter(i => Number(i.quantidade) <= Number(i.minimo_alerta)).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-slate-500 font-bold animate-pulse text-xs uppercase tracking-widest">Sincronizando estoque...</p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Controle de Materiais</h2>
          <p className="text-sm text-slate-500 font-medium">Gerencie seu estoque de películas, PPF e produtos químicos.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <History size={18} /> Histórico
          </button>
          <button 
             onClick={() => { setEditingItem(null); setShowAddModal(true); }}
             className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} /> Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-premium p-5 flex items-center gap-4 border-0 shadow-lg shadow-emerald-500/5 bg-emerald-50/20 text-emerald-600">
           <div className="p-3 bg-emerald-100/50 rounded-2xl"><Package size={24} /></div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest">Itens em Estoque</p>
             <h4 className="text-2xl font-black text-slate-800">{totalItens}</h4>
           </div>
        </div>
        <div className="card-premium p-5 flex items-center gap-4 border-0 shadow-lg shadow-rose-500/5 bg-rose-50/20 text-rose-600">
           <div className="p-3 bg-rose-100/50 rounded-2xl"><AlertTriangle size={24} /></div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest">Estoque Crítico</p>
             <h4 className="text-2xl font-black text-slate-800">{String(estoqueCritico).padStart(2, '0')}</h4>
           </div>
        </div>
      </div>

      <div className="card-premium overflow-hidden border-0 shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Quantidade</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((m) => {
                const isCritico = Number(m.quantidade) <= Number(m.minimo_alerta);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{m.nome}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-[11px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">{m.unidade}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800 text-center">{m.quantidade}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        isCritico ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isCritico ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {isCritico ? 'Crítico' : 'Ok'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setRepondoItem(m)}
                          className="text-emerald-500 hover:text-emerald-700 p-2 hover:bg-emerald-100 rounded-xl transition-all font-bold flex items-center gap-1"
                          title="Repor Estoque Rápidamente"
                        >
                          <Plus size={16} /> 
                        </button>
                        <button 
                          onClick={() => { setEditingItem(m); setShowAddModal(true); }}
                          className="text-slate-400 hover:text-primary p-2 hover:bg-primary/10 rounded-xl transition-all"
                          title="Editar Material"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                             const confirm = await confirmDialog(
                               'Excluir Material',
                               `Tem certeza que deseja remover "${m.nome}" permanentemente do estoque?`,
                               'Excluir',
                               'Cancelar'
                             );
                             if (confirm) {
                                const res = await deleteItem(m.id);
                                if (res.success) {
                                   toast.success('Material removido do cadastro.');
                                } else {
                                   toast.error('Erro ao excluir material.');
                                }
                             }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-100 rounded-xl transition-all"
                          title="Excluir Material"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-30">
                    <Package size={48} className="mx-auto mb-3" />
                    <p className="font-black uppercase tracking-widest text-xs">Inventário Vazio</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 zoom-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase tracking-tighter">
                {editingItem ? 'Editar Material' : 'Novo Material'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} className="text-slate-400 hover:text-slate-600 tracking-widest text-xs font-bold">FECHAR</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());
              
              let res;
              if (editingItem) {
                 res = await updateItem(editingItem.id, data);
              } else {
                 res = await saveItem(data);
              }

              if (res.success) {
                  toast.success(editingItem ? 'Material atualizado!' : 'Material adicionado ao estoque!');
                  setShowAddModal(false);
                  setEditingItem(null);
              } else {
                  toast.error('Erro ao salvar. Verifique o banco!');
              }
            }} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nome do Material</label>
                <input name="nome" defaultValue={editingItem?.nome || ''} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold shadow-inner" placeholder="Ex: PPF Suntek" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Unidade</label>
                  <select name="unidade" defaultValue={editingItem?.unidade || 'm'} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold">
                    <option value="m">Metros (m)</option>
                    <option value="un">Unidade (un)</option>
                    <option value="l">Litros (L)</option>
                    <option value="ml">Mililitros (ml)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Qtd Inicial/Atual</label>
                  <input name="quantidade" type="number" step="0.01" defaultValue={editingItem?.quantidade || ''} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mínimo para Alerta Crítico</label>
                <input name="minimo_alerta" type="number" step="0.01" defaultValue={editingItem?.minimo_alerta || '5'} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-sm font-bold shadow-inner" />
              </div>
              <button type="submit" className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-primary/20 mt-4 flex items-center justify-center gap-2">
                <Package size={20} /> {editingItem ? 'Salvar Alterações' : 'Adicionar ao Estoque'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Reposição de Estoque (Premium) */}
      {repondoItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-8 text-center bg-emerald-50/50 border-b border-emerald-100/50">
               <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                  <ArrowUpRight size={28} />
               </div>
               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Reposição de Estoque</h3>
               <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">{repondoItem.nome}</p>
            </div>
            
            <form onSubmit={async (e) => {
               e.preventDefault();
               const val = parseFloat(e.target.qtd.value.replace(',', '.'));
               if (!isNaN(val) && val > 0) {
                 const newTotal = (parseFloat(repondoItem.quantidade) || 0) + val;
                 const res = await updateItem(repondoItem.id, { quantidade: newTotal });
                 if (res.success) {
                   toast.success(`Estoque atualizado: +${val} ${repondoItem.unidade}`);
                   setRepondoItem(null);
                 }
               } else {
                 toast.warning("Insira uma quantidade válida.");
               }
            }} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Quantidade que chegou ({repondoItem.unidade})</label>
                <input 
                  autoFocus
                  name="qtd"
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0,00"
                  className="w-full text-3xl font-black text-center py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-200"
                />
              </div>
              
              <div className="flex gap-3">
                <button type="button" onClick={() => setRepondoItem(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">Confirmar Entrada</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MateriaisView;
