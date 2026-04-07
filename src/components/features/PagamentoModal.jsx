import React, { useState } from 'react';
import { X, DollarSign, Wallet, Calendar, ArrowRight, CheckCircle2, History, Trash2 } from 'lucide-react';
import { toast } from '../../utils/toast';
import { confirmDialog } from '../../utils/confirm';

const PagamentoModal = ({ os, onClose, onSave, onDelete }) => {
  const [valor, setValor] = useState(os.saldo_devedor || 0);
  const [metodo, setMetodo] = useState('PIX');
  const [isSaving, setIsSaving] = useState(false);

  const metodos = [
    { id: 'PIX', label: 'PIX', icon: '⚡' },
    { id: 'DINHEIRO', label: 'Dinheiro', icon: '💵' },
    { id: 'CREDITO', label: 'Cartão de Crédito', icon: '💳' },
    { id: 'CREDITO_PARCELADO', label: 'Crédito Parcelado', icon: '🗓️' },
    { id: 'DEBITO', label: 'Cartão de Débito', icon: '🏧' },
  ];

  const handleSave = async () => {
    if (valor <= 0) {
      toast.warning('O valor deve ser maior que zero');
      return;
    }

    setIsSaving(true);
    const success = await onSave(os.id, {
      valor: Number(valor),
      metodo,
      tipo: os.valor_pago === 0 ? 'ADIANTAMENTO' : (Number(valor) >= os.saldo_devedor ? 'QUITAÇÃO' : 'PARCIAL')
    });

    if (success) {
      toast.success('Pagamento registrado com sucesso!');
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh]">
        {/* Header Fixo */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Registrar Pagamento</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">OS #{os.id} • {os.cliente_nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
            <X size={24} className="text-slate-300 hover:text-slate-800" />
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          {/* Card de Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Total</span>
              <span className="text-lg font-black text-slate-700">R$ {os.valor_total?.toLocaleString('pt-BR')}</span>
            </div>
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Pago</span>
              <span className="text-lg font-black text-emerald-600">R$ {os.valor_pago?.toLocaleString('pt-BR')}</span>
            </div>
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Saldo Devedor</span>
              <span className="text-lg font-black text-primary">R$ {os.saldo_devedor?.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulário de Pagamento */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor a Receber Agora</label>
                <div className="relative group">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300">R$</div>
                   <input 
                    type="number" 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[2rem] outline-none transition-all text-2xl font-black text-slate-800"
                    placeholder="0,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                   />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de Pagamento</label>
                <div className="grid grid-cols-1 gap-2">
                  {metodos.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMetodo(m.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        metodo === m.id 
                          ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                          : 'border-slate-50 hover:border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-xs font-black uppercase tracking-widest">{m.label}</span>
                      {metodo === m.id && <CheckCircle2 size={16} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Histórico de Pagamentos */}
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <History size={14} /> Histórico desta OS
               </label>
               <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 space-y-4 min-h-[300px]">
                 {os.historico_pagamentos && os.historico_pagamentos.length > 0 ? (
                    os.historico_pagamentos.map((p, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <DollarSign size={14} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">R$ {p.valor?.toLocaleString('pt-BR')}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase">{p.metodo} • {new Date(p.data).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[7px] font-black uppercase rounded-md border border-slate-100">
                            {p.tipo}
                          </span>
                          <button 
                            onClick={async () => {
                              const confirm = await confirmDialog(
                                'Estornar Pagamento',
                                `Deseja remover este registro de R$ ${p.valor?.toLocaleString('pt-BR')}? O valor pago da OS será reduzido.`,
                                'Remover',
                                'Voltar'
                              );
                              if (confirm) {
                                const res = await onDelete(os.id, idx);
                                if (res.success) toast.success('Pagamento removido!');
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remover este lançamento"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                      <Wallet size={48} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nenhum pagamento registrado</p>
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="p-8 border-t border-slate-50 bg-white flex items-center gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 transition-all hover:bg-emerald-600 active:scale-[0.98]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><ArrowRight size={18} /> Confirmar Recebimento</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagamentoModal;
