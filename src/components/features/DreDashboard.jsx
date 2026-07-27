import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Briefcase, 
  Layers, 
  Sparkles,
  Printer,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Filter,
  HelpCircle
} from 'lucide-react';
import { useInventory } from '../../hooks/useData';
import { toast } from '../../utils/toast';

const DreDashboard = ({ orders = [] }) => {
  const { materials } = useInventory();
  
  // Período de Filtro (padrão mês atual)
  const [mesAno, setMesAno] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Despesas Fixas / Operacionais interativas (aluguel, folha, luz, marketing)
  const [despesasFixas, setDespesasFixas] = useState(() => {
    return Number(localStorage.getItem('ossystem_dre_despesas_fixas') || 5000);
  });
  const [isEditingDespesas, setIsEditingDespesas] = useState(false);
  const [tempDespesas, setTempDespesas] = useState(despesasFixas);

  const saveDespesas = () => {
    setDespesasFixas(Number(tempDespesas));
    localStorage.setItem('ossystem_dre_despesas_fixas', Number(tempDespesas));
    setIsEditingDespesas(false);
    toast.success('Despesas fixas atualizadas no DRE!');
  };

  // 1. Filtrar OS do período selecionado
  const ordensFiltradas = useMemo(() => {
    return (orders || []).filter(os => {
      if (!os) return false;
      const dataRef = os.data_fim || os.data_agendamento || os.created_at;
      if (!dataRef) return false;
      return String(dataRef).startsWith(mesAno);
    });
  }, [orders, mesAno]);

  // 2. Cálculos Financeiros (DRE)
  const dreStats = useMemo(() => {
    let receitaBruta = 0;
    let custoInsumos = 0;
    let fluxoCaixaProjetado = 0;
    let totalOsConcluidas = 0;
    let totalOsEmAndamento = 0;

    // Mapa rápido de custo dos materiais por ID ou Nome
    const custoMatMap = {};
    (materials || []).forEach(m => {
      const custo = Number(m.preco_custo || 0);
      if (m.id) custoMatMap[String(m.id)] = custo;
      if (m.nome) custoMatMap[m.nome.toLowerCase().trim()] = custo;
    });

    ordensFiltradas.forEach(os => {
      const st = String(os.status || '').toUpperCase().trim();
      const val = Number(os.valor_total || os.valor_pago || 0);

      // OS Concluídas ou Entregues geram Receita Realizada
      if (st === 'CONCLUÍDO' || st === 'ENTREGUE') {
        receitaBruta += val;
        totalOsConcluidas += 1;

        // Deduzir Custo de Materiais dessa OS
        if (os.servicos_detalhados && Array.isArray(os.servicos_detalhados)) {
          os.servicos_detalhados.forEach(serv => {
            if (serv.materiais && Array.isArray(serv.materiais)) {
              serv.materiais.forEach(mat => {
                const qtd = Number(mat.quantidade_utilizada || 0);
                if (qtd > 0) {
                  let custoUnitario = Number(mat.preco_custo || 0);
                  if (custoUnitario === 0) {
                    const chaveId = mat.material_id || mat.id;
                    const chaveNome = mat.nome ? mat.nome.toLowerCase().trim() : null;
                    if (chaveId && custoMatMap[String(chaveId)] !== undefined) {
                      custoUnitario = custoMatMap[String(chaveId)];
                    } else if (chaveNome && custoMatMap[chaveNome] !== undefined) {
                      custoUnitario = custoMatMap[chaveNome];
                    }
                  }
                  custoInsumos += (qtd * custoUnitario);
                }
              });
            }
          });
        }
      } 
      // OS em Andamento / Aprovadas geram Projeção de Fluxo de Caixa Futuro
      else if (['AGUARDANDO', 'APROVADO', 'EM EXECUÇÃO', 'ORCAMENTO'].includes(st)) {
        fluxoCaixaProjetado += val;
        totalOsEmAndamento += 1;
      }
    });

    const lucroBruto = receitaBruta - custoInsumos;
    const margemBrutaPct = receitaBruta > 0 ? ((lucroBruto / receitaBruta) * 100) : 0;
    const lucroLiquido = lucroBruto - despesasFixas;
    const margemLiquidaPct = receitaBruta > 0 ? ((lucroLiquido / receitaBruta) * 100) : 0;
    const ticketMedio = totalOsConcluidas > 0 ? (receitaBruta / totalOsConcluidas) : 0;

    return {
      receitaBruta,
      custoInsumos,
      lucroBruto,
      margemBrutaPct,
      despesasFixas,
      lucroLiquido,
      margemLiquidaPct,
      fluxoCaixaProjetado,
      totalOsConcluidas,
      totalOsEmAndamento,
      ticketMedio
    };
  }, [ordensFiltradas, materials, despesasFixas]);

  const formatMoney = (val) => {
    return `R$ ${Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Cabeçalho DRE & Seletor de Mês */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <PieChart size={22} />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
              DRE & Inteligência Financeira
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Demonstrativo de Resultados do Exercício deduzindo custos reais de almoxarifado por Ordem de Serviço.
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <Calendar size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Competência:</span>
            <input 
              type="month" 
              value={mesAno} 
              onChange={(e) => setMesAno(e.target.value)}
              className="text-xs font-black text-slate-800 dark:text-white bg-transparent outline-none uppercase cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Grid de KPIs - 4 Pilares DRE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pilar 1: Receita Bruta */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Receita Bruta</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-2xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
            {formatMoney(dreStats.receitaBruta)}
          </h4>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>{dreStats.totalOsConcluidas} OS Concluídas/Entregues</span>
          </p>
        </div>

        {/* Pilar 2: Custo de Materiais (Deduzido) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Custo de Insumos</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-2xl">
              <Layers size={20} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight mb-1">
            - {formatMoney(dreStats.custoInsumos)}
          </h4>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Baixa automática por consumo</span>
          </p>
        </div>

        {/* Pilar 3: Lucro Bruto Operacional */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Lucro Bruto (OS)</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-2xl">
              <Briefcase size={20} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
            {formatMoney(dreStats.lucroBruto)}
          </h4>
          <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <span>Margem Bruta: </span>
            <span className="underline font-black">{dreStats.margemBrutaPct.toFixed(1)}%</span>
          </p>
        </div>

        {/* Pilar 4: Projeção de Fluxo de Caixa Futuro */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Projeção Futura</span>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-2xl">
              <Sparkles size={20} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-white tracking-tight mb-1">
            {formatMoney(dreStats.fluxoCaixaProjetado)}
          </h4>
          <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
            <AlertCircle size={12} className="text-amber-400" />
            <span>{dreStats.totalOsEmAndamento} OS em andamento/aprovadas</span>
          </p>
        </div>
      </div>

      {/* Bloco DRE Consolidado com Despesas Fixas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela Resumo DRE */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                Demonstrativo Contábil Simplificado (DRE)
              </h4>
              <p className="text-xs text-slate-500">Resumo analítico de lucratividade da oficina automotiva.</p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
              {mesAno.split('-').reverse().join('/')}
            </span>
          </div>

          <div className="space-y-3 font-medium text-sm">
            {/* Linha 1: Receita Bruta */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
              <span className="font-bold text-slate-700 dark:text-slate-200">(+) Receita Bruta de Serviços</span>
              <span className="font-black text-slate-800 dark:text-white">{formatMoney(dreStats.receitaBruta)}</span>
            </div>

            {/* Linha 2: Custo Insumos */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 text-rose-600 dark:text-rose-400">
              <span className="flex items-center gap-1.5 font-bold">
                <span>(-) Custo de Materiais e Insumos</span>
                <span className="text-[10px] bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded font-black text-rose-600">Almoxarifado</span>
              </span>
              <span className="font-black">- {formatMoney(dreStats.custoInsumos)}</span>
            </div>

            {/* Linha 3: Lucro Bruto */}
            <div className="flex items-center justify-between py-3 bg-slate-50 dark:bg-slate-800/50 px-4 rounded-2xl font-black text-slate-800 dark:text-white">
              <span>(=) Lucro Bruto Operacional</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-extrabold">({dreStats.margemBrutaPct.toFixed(1)}% Margem)</span>
                <span className="text-base">{formatMoney(dreStats.lucroBruto)}</span>
              </div>
            </div>

            {/* Linha 4: Despesas Fixas */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <span className="font-bold">(-) Despesas Fixas e Operacionais (Mão de obra, Aluguel, Luz)</span>
                <button 
                  onClick={() => { setTempDespesas(despesasFixas); setIsEditingDespesas(!isEditingDespesas); }}
                  className="text-[10px] font-black underline hover:text-amber-700 transition-all no-print"
                >
                  {isEditingDespesas ? 'Cancelar' : 'Ajustar Valor'}
                </button>
              </div>
              {isEditingDespesas ? (
                <div className="flex items-center gap-2 no-print">
                  <input 
                    type="number" 
                    value={tempDespesas} 
                    onChange={(e) => setTempDespesas(e.target.value)}
                    className="w-24 px-2 py-1 text-xs font-black border rounded bg-white dark:bg-slate-800 dark:text-white text-right outline-none"
                  />
                  <button 
                    onClick={saveDespesas}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-black hover:bg-amber-700 transition-all"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <span className="font-black">- {formatMoney(dreStats.despesasFixas)}</span>
              )}
            </div>

            {/* Linha 5: Lucro Líquido */}
            <div className={`flex items-center justify-between py-4 px-5 rounded-2xl font-black text-white shadow-lg ${
              dreStats.lucroLiquido >= 0 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-500/20' 
                : 'bg-gradient-to-r from-rose-600 to-red-700 shadow-rose-500/20'
            }`}>
              <div className="flex items-center gap-2">
                {dreStats.lucroLiquido >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                <span className="text-base uppercase tracking-wider">(=) Lucro Líquido do Exercício</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-black">
                  {dreStats.margemLiquidaPct.toFixed(1)}% Margem Líquida
                </span>
                <span className="text-xl tracking-tight">{formatMoney(dreStats.lucroLiquido)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Lateral de Saúde Financeira & Dicas */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <Sparkles size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Auditoria Inteligente</span>
            </div>
            <h4 className="text-lg font-black text-white mb-2">Saúde Contábil da Oficina</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Com base nos consumíveis deduzidos automaticamente pelas Ordens de Serviço concluídas em <strong>{mesAno.split('-').reverse().join('/')}</strong>:
            </p>

            <div className="mt-6 space-y-3 text-xs">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-start gap-3">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Ticket Médio Real</p>
                  <p className="text-slate-400">Cada veículo gerou em média <strong>{formatMoney(dreStats.ticketMedio)}</strong> em faturamento no período.</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-start gap-3">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg mt-0.5">
                  <Wrench size={14} />
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Impacto do Almoxarifado</p>
                  <p className="text-slate-400">O custo de insumos representa <strong>{dreStats.receitaBruta > 0 ? ((dreStats.custoInsumos / dreStats.receitaBruta) * 100).toFixed(1) : 0}%</strong> da receita bruta faturada.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            * Dica: Mantenha o custo unitário (<span className="text-slate-400">preço de custo</span>) dos materiais atualizado no menu Almoxarifado para máxima precisão no DRE.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreDashboard;
