import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  User, 
  Calendar, 
  FileText, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Percent,
  Check,
  Edit2
} from 'lucide-react';
import { toast } from '../../utils/toast';

const ComissoesExtrato = ({ profiles = [], orders = [] }) => {
  const [mesAno, setMesAno] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [tempVal, setTempVal] = useState('10');
  const [tempTipo, setTempTipo] = useState('PERCENTUAL'); // PERCENTUAL ou FIXO

  // Obter configurações de comissão (persistidas no localStorage ou profile)
  const getComissaoConfig = (profileId) => {
    const salvo = localStorage.getItem(`ossystem_comissao_cfg_${profileId}`);
    if (salvo) {
      try { return JSON.parse(salvo); } catch(e) {}
    }
    return { val: 10, tipo: 'PERCENTUAL' }; // 10% por padrão
  };

  const saveComissaoConfig = (profileId) => {
    const valNum = Number(tempVal);
    if (isNaN(valNum) || valNum < 0) {
      toast.error('Valor de comissão inválido!');
      return;
    }
    localStorage.setItem(`ossystem_comissao_cfg_${profileId}`, JSON.stringify({ val: valNum, tipo: tempTipo }));
    setEditingId(null);
    toast.success('Regra de remuneração atualizada para este especialista!');
  };

  // Calcular comissões para o período
  const comissoesData = useMemo(() => {
    return profiles.map(profile => {
      const cfg = getComissaoConfig(profile.id);
      
      // Filtrar OS concluídas/entregues no período
      const ordensTecnico = (orders || []).filter(os => {
        if (!os || os.tecnico_id !== profile.id) return false;
        const st = String(os.status || '').toUpperCase().trim();
        if (st !== 'CONCLUÍDO' && st !== 'ENTREGUE') return false;
        const dataRef = os.data_fim || os.data_agendamento || os.created_at || '';
        return String(dataRef).startsWith(mesAno);
      });

      let totalFaturadoOs = 0;
      let totalComissaoCalculada = 0;

      const itensComissao = ordensTecnico.map(os => {
        const valOs = Number(os.valor_total || os.valor_pago || 0);
        totalFaturadoOs += valOs;

        let valComissao = 0;
        if (cfg.tipo === 'PERCENTUAL') {
          valComissao = (valOs * (cfg.val / 100));
        } else {
          valComissao = Number(cfg.val); // Valor fixo por OS
        }
        totalComissaoCalculada += valComissao;

        return {
          id: os.id,
          veiculo: os.veiculo_desc || 'Veículo',
          cliente: os.cliente_nome || 'Cliente',
          data: os.data_fim || os.data_agendamento || os.created_at,
          valorOs: valOs,
          valorComissao: valComissao
        };
      });

      return {
        ...profile,
        cfg,
        totalOs: ordensTecnico.length,
        totalFaturadoOs,
        totalComissaoCalculada,
        itensComissao
      };
    }).sort((a, b) => b.totalComissaoCalculada - a.totalComissaoCalculada);
  }, [profiles, orders, mesAno, editingId]);

  const formatMoney = (val) => {
    return `R$ ${Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalGeralComissoes = comissoesData.reduce((acc, c) => acc + c.totalComissaoCalculada, 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Cabeçalho de Controle de Comissões */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <DollarSign size={22} />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
              Controle de Comissões e Remuneração
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Cálculo automático de comissão (porcentagem ou valor fixo por serviço) para fechamento de folha no final do período.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 no-print w-full md:w-auto mt-2 md:mt-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex-1">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Mês:</span>
            </div>
            <input 
              type="month" 
              value={mesAno} 
              onChange={(e) => setMesAno(e.target.value)}
              className="text-xs font-black text-slate-800 dark:text-white bg-transparent outline-none uppercase cursor-pointer"
            />
          </div>

          <button 
            onClick={() => window.print()} 
            className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 shadow-lg active:scale-95 text-xs font-black uppercase tracking-wider flex-1"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI Total Comissões no Mês */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-100">Total a Pagar de Comissões ({mesAno.split('-').reverse().join('/')})</p>
          <h3 className="text-3xl font-black mt-1 tracking-tight">{formatMoney(totalGeralComissoes)}</h3>
        </div>
        <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
          <TrendingUp size={32} />
        </div>
      </div>

      {/* Lista de Técnicos com Comissões */}
      <div className="space-y-4">
        {comissoesData.map((tec) => {
          const isExpanded = expandedId === tec.id;
          const isEditing = editingId === tec.id;

          return (
            <div 
              key={tec.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-all"
            >
              {/* Linha Principal do Técnico */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-lg text-slate-700 dark:text-white">
                    {tec.avatar_url ? (
                      <img src={tec.avatar_url} alt={tec.nome} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      tec.nome ? tec.nome.charAt(0).toUpperCase() : <User size={22} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-800 dark:text-white text-base">
                        {tec.nome || tec.email?.split('@')[0]}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-primary/10 text-primary uppercase">
                        {tec.cargo}
                      </span>
                    </div>
                    
                    {/* Regra de comissão exibida ou modo de edição */}
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      {isEditing ? (
                        <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 no-print mt-2 sm:mt-0">
                          <input 
                            type="number" 
                            value={tempVal} 
                            onChange={(e) => setTempVal(e.target.value)}
                            className="w-16 px-2 py-1 text-xs font-black border rounded bg-white dark:bg-slate-900 dark:text-white text-center outline-none"
                            placeholder="Valor"
                          />
                          <select 
                            value={tempTipo} 
                            onChange={(e) => setTempTipo(e.target.value)}
                            className="text-[10px] font-bold px-2 py-1 border rounded bg-white dark:bg-slate-900 dark:text-white outline-none"
                          >
                            <option value="PERCENTUAL">% por OS</option>
                            <option value="FIXO">R$ fixo/OS</option>
                          </select>
                          <button 
                            onClick={() => saveComissaoConfig(tec.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Salvar Regra"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                          <span>Regra:</span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-black border border-amber-200 dark:border-amber-800/40">
                            {tec.cfg.tipo === 'PERCENTUAL' ? `${tec.cfg.val}% da OS` : `R$ ${tec.cfg.val} fixo por OS`}
                          </span>
                          <button 
                            onClick={() => {
                              setTempVal(String(tec.cfg.val));
                              setTempTipo(tec.cfg.tipo);
                              setEditingId(tec.id);
                            }}
                            className="text-slate-400 hover:text-primary transition-all p-1 no-print"
                            title="Alterar Porcentagem ou Valor de Comissão"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 sm:gap-6 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 border-slate-100 dark:border-slate-800 w-full md:w-auto">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">OS Concluídas</p>
                    <p className="font-black text-slate-800 dark:text-white">{tec.totalOs} OS</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Comissão Acumulada</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {formatMoney(tec.totalComissaoCalculada)}
                    </p>
                  </div>

                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : tec.id)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all no-print"
                    title="Ver Extrato de OS"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Tabela Expandida com Detalhes das OS do Técnico */}
              {isExpanded && (
                <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-black uppercase text-slate-600 dark:text-slate-300 tracking-wider flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <span>Extrato Analítico de Serviços — {tec.nome || 'Especialista'}</span>
                    </h5>
                    <span className="text-[10px] font-black uppercase bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                      {tec.itensComissao.length} registros no período
                    </span>
                  </div>

                  {tec.itensComissao.length > 0 ? (
                    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-black uppercase text-slate-400">
                            <th className="p-3">OS #</th>
                            <th className="p-3">Veículo / Cliente</th>
                            <th className="p-3">Data</th>
                            <th className="p-3 text-right">Valor da OS</th>
                            <th className="p-3 text-right">Comissão Gerada</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                          {tec.itensComissao.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="p-3 font-black text-primary">#{item.id}</td>
                              <td className="p-3">
                                <p className="font-bold text-slate-800 dark:text-white">{item.veiculo}</p>
                                <p className="text-[10px] text-slate-400">{item.cliente}</p>
                              </td>
                              <td className="p-3 text-slate-500">
                                {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}
                              </td>
                              <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">
                                {formatMoney(item.valorOs)}
                              </td>
                              <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                                {formatMoney(item.valorComissao)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-800 dark:text-white border-t-2 border-slate-200 dark:border-slate-700">
                            <td colSpan="3" className="p-3 text-right uppercase text-[11px]">Total Acumulado na Competência:</td>
                            <td className="p-3 text-right">{formatMoney(tec.totalFaturadoOs)}</td>
                            <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 text-sm">{formatMoney(tec.totalComissaoCalculada)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-xs">
                      Nenhuma ordem de serviço concluída por este profissional em {mesAno.split('-').reverse().join('/')}.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComissoesExtrato;
