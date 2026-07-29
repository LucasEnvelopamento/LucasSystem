import React, { useMemo, useState } from 'react';
import { 
  Award, 
  Star, 
  TrendingUp, 
  Clock, 
  Flame, 
  Zap, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  Trophy, 
  Medal,
  Calendar,
  Sparkles,
  Filter
} from 'lucide-react';

const TecnicosRanking = ({ profiles = [], orders = [] }) => {
  const [periodo, setPeriodo] = useState('ALL'); // ALL, MES

  // Calcular ranking e métricas por colaborador
  const rankingData = useMemo(() => {
    const mesAtual = new Date().toISOString().slice(0, 7);
    
    // Pegar avaliações NPS locais / remotas
    const npsLocal = JSON.parse(localStorage.getItem('pesquisas_nps_local') || '[]');
    const npsMap = {}; // os_id -> nota
    npsLocal.forEach(fb => {
      if (fb.os_id && fb.nota !== undefined) {
        npsMap[String(fb.os_id)] = Number(fb.nota);
      }
    });

    const stats = profiles.map(profile => {
      // Filtrar ordens concluídas/entregues por este técnico
      const ordensTecnico = (orders || []).filter(os => {
        if (!os || os.tecnico_id !== profile.id) return false;
        const st = String(os.status || '').toUpperCase().trim();
        if (st !== 'CONCLUÍDO' && st !== 'ENTREGUE') return false;
        if (periodo === 'MES') {
          const dataRef = os.data_fim || os.data_agendamento || os.created_at || '';
          return String(dataRef).startsWith(mesAtual);
        }
        return true;
      });

      const totalOs = ordensTecnico.length;
      const totalReceitaGerada = ordensTecnico.reduce((acc, os) => acc + Number(os.valor_total || os.valor_pago || 0), 0);

      // Calcular NPS Médio
      let somaNps = 0;
      let countNps = 0;
      ordensTecnico.forEach(os => {
        if (npsMap[String(os.id)] !== undefined) {
          somaNps += npsMap[String(os.id)];
          countNps += 1;
        } else if (os.nps_nota !== undefined) {
          somaNps += Number(os.nps_nota);
          countNps += 1;
        }
      });
      // Média real de NPS (sem mock para demo)
      const mediaNps = countNps > 0 ? (somaNps / countNps) : 0;

      // Ler Streak real do localStorage (dias sem retrabalho no QA)
      const streakLocal = Number(localStorage.getItem(`ossystem_tecnico_streak_${profile.id}`) || 0);

      // Badges baseadas estritamente no histórico operacional real
      const badges = [];
      if (mediaNps >= 9.5 && countNps > 0) {
        badges.push({ nome: 'Mestre do Acabamento', icon: Star, cor: 'text-amber-400 bg-amber-500/10 border-amber-500/30' });
      }
      if (streakLocal >= 10) {
        badges.push({ nome: `Invicto ${streakLocal} Dias`, icon: Flame, cor: 'text-rose-500 bg-rose-500/10 border-rose-500/30' });
      }
      if (totalOs >= 5) {
        badges.push({ nome: 'Rápido no Gatilho', icon: Zap, cor: 'text-blue-500 bg-blue-500/10 border-blue-500/30' });
      }

      return {
        ...profile,
        totalOs,
        totalReceitaGerada,
        mediaNps,
        streak: streakLocal,
        badges
      };
    });

    // Ordenar por volume de OS (e desempate por NPS)
    return stats
      .filter(s => s.cargo === 'OPERADOR' || s.totalOs > 0)
      .sort((a, b) => {
        if (b.totalOs !== a.totalOs) return b.totalOs - a.totalOs;
        return b.mediaNps - a.mediaNps;
      });
  }, [profiles, orders, periodo]);

  const top3 = rankingData.slice(0, 3);
  const demais = rankingData.slice(3);

  const getPodiumStyle = (pos) => {
    if (pos === 0) return {
      border: 'border-amber-400 dark:border-amber-500 ring-4 ring-amber-400/20 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900',
      badge: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/30',
      trophyColor: 'text-amber-500',
      label: '🥇 1º LUGAR — LÍDER DA OFICINA'
    };
    if (pos === 1) return {
      border: 'border-slate-300 dark:border-slate-600 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/30 dark:to-slate-900',
      badge: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900 font-black shadow-md',
      trophyColor: 'text-slate-400',
      label: '🥈 2º LUGAR — DESTAQUE TÉCNICO'
    };
    return {
      border: 'border-amber-700/50 dark:border-amber-800 bg-gradient-to-b from-orange-50/30 to-white dark:from-orange-950/10 dark:to-slate-900',
      badge: 'bg-gradient-to-r from-amber-700 to-amber-600 text-white font-black shadow-md',
      trophyColor: 'text-amber-700',
      label: '🥉 3º LUGAR — EXCELÊNCIA'
    };
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Cabeçalho de Gamificação */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-inner">
            <Trophy size={36} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-widest border border-emerald-500/30">
                Gamificação Ativa
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
              Ranking de Especialistas
            </h3>
            <p className="text-xs text-slate-300 font-medium max-w-xl mt-1">
              Quadro de produtividade e excelência técnica. Conquiste badges, mantenha sua sequência invicta sem retrabalho no QA e lidere a oficina!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setPeriodo('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
              periodo === 'ALL' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Histórico Geral
          </button>
          <button
            onClick={() => setPeriodo('MES')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
              periodo === 'MES' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mês Atual
          </button>
        </div>
      </div>

      {/* PÓDIO TOP 3 */}
      {top3.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {top3.map((tec, idx) => {
            const estilo = getPodiumStyle(idx);
            return (
              <div 
                key={tec.id}
                className={`p-6 rounded-3xl border-2 shadow-xl flex flex-col justify-between relative transition-all hover:-translate-y-1 ${estilo.border}`}
              >
                <div>
                  {/* Selo do Pódio */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-xl text-[10px] tracking-wider ${estilo.badge}`}>
                      {estilo.label}
                    </span>
                    <Trophy size={24} className={estilo.trophyColor} />
                  </div>

                  {/* Avatar e Nome */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-primary/20 flex items-center justify-center font-black text-2xl text-slate-700 dark:text-white shadow-inner overflow-hidden">
                      {tec.avatar_url ? (
                        <img src={tec.avatar_url} alt={tec.nome} className="w-full h-full object-cover" />
                      ) : (
                        tec.nome ? tec.nome.charAt(0).toUpperCase() : <User size={28} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                        {tec.nome || tec.email?.split('@')[0] || 'Técnico'}
                      </h4>
                      <p className="text-xs font-extrabold text-primary uppercase mt-0.5">
                        {tec.cargo}
                      </p>
                    </div>
                  </div>

                  {/* Badges do Técnico */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {tec.badges.map((b, bi) => {
                      const Icone = b.icon;
                      return (
                        <span key={bi} className={`px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 ${b.cor}`}>
                          <Icone size={12} />
                          <span>{b.nome}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Grid de Métricas Rápida */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Volume</p>
                    <p className="text-base font-black text-slate-800 dark:text-white">{tec.totalOs} <span className="text-[10px] font-bold">OS</span></p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">NPS Média</p>
                    <p className="text-base font-black text-amber-500 flex items-center justify-center gap-0.5">
                      <span>{tec.mediaNps > 0 ? tec.mediaNps.toFixed(1) : '-'}</span>
                      <Star size={12} className="fill-amber-500" />
                    </p>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-500/20">
                    <p className="text-[9px] font-black text-rose-500 uppercase">Streak QA</p>
                    <p className="text-base font-black text-rose-600 dark:text-rose-400 flex items-center justify-center gap-0.5">
                      <span>{tec.streak}d</span>
                      <Flame size={12} className="fill-rose-500" />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Award size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 font-bold uppercase text-xs">Nenhum técnico com OS concluída no período selecionado.</p>
        </div>
      )}

      {/* DEMAIS TÉCNICOS NO RANKING */}
      {demais.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
              Outros Profissionais no Ranking
            </h4>
            <span className="text-xs font-bold text-slate-400">{demais.length} membros</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {demais.map((tec, idx) => (
              <div key={tec.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-sm flex items-center justify-center">
                    {idx + 4}º
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-white">
                    {tec.nome ? tec.nome.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-800 dark:text-white text-sm">
                      {tec.nome || tec.email?.split('@')[0]}
                    </h5>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{tec.cargo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Concluídas</p>
                    <p className="font-black text-slate-800 dark:text-white">{tec.totalOs} OS</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">NPS</p>
                    <p className="font-black text-amber-500 flex items-center justify-end gap-1">
                      <span>{tec.mediaNps > 0 ? tec.mediaNps.toFixed(1) : '-'}/10</span>
                      <Star size={12} className="fill-amber-500" />
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Streak</p>
                    <p className="font-black text-rose-500 flex items-center justify-end gap-1">
                      <span>{tec.streak} dias</span>
                      <Flame size={12} className="fill-rose-500" />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TecnicosRanking;
