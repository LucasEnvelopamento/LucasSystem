import React, { useState } from 'react';
import { 
  Plus, 
  Users, 
  Star, 
  Award, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  ShieldCheck, 
  UserCog, 
  UserMinus, 
  UserPlus, 
  Loader2,
  Lock,
  Edit2,
  Trophy,
  DollarSign,
  Key,
  MessageCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useProfiles, useOrders } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../utils/toast';
import { supabase } from '../lib/supabase';
import TecnicosRanking from '../components/features/TecnicosRanking';
import ComissoesExtrato from '../components/features/ComissoesExtrato';

const ColaboradoresView = () => {
  const { profiles, loading, updateProfile, fetchProfiles } = useProfiles();
  const { orders } = useOrders();
  const { profile: currentUserProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('MEMBROS'); // 'MEMBROS', 'RANKING', 'COMISSOES'
  const [updatingId, setUpdatingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingColab, setEditingColab] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetingColab, setResetingColab] = useState(null);
  const [newManualPassword, setNewManualPassword] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', password: '', cargo: 'OPERADOR' });
  const [isCreating, setIsCreating] = useState(false);

  const toggleStatus = async (user) => {
    // Regra: Somente ADM pode desativar/ativar usuários
    if (!isAdmin) {
      toast.warning("Apenas administradores podem gerenciar o status da equipe.");
      return;
    }

    // Regra: Não permitir que um ADM desative a si mesmo (para não perder acesso total)
    if (user.id === currentUserProfile.id) {
      toast.warning("Você não pode desativar seu próprio perfil de administrador.");
      return;
    }

    setUpdatingId(user.id);
    try {
      const { success, error } = await updateProfile(user.id, { status: !user.status });
      if (!success) throw error;
      toast.success('Status atualizado com sucesso!');
      // Realtime lidará com a atualização da lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do colaborador.');
    } finally {
      setUpdatingId(null);
    }
  };

  const changeRole = async (user, newRole) => {
    if (!isAdmin) return;
    
    // Regra: Não permitir que o próprio usuário logado mude seu cargo (evita auto-rebaixamento acidental)
    if (user.id === currentUserProfile.id && newRole !== 'ADM') {
        toast.warning("Você não pode alterar seu próprio cargo de administrador.");
        return;
    }

    setUpdatingId(user.id);
    try {
      const { success, error } = await updateProfile(user.id, { cargo: newRole });
      if (!success) throw error;
      toast.success(`Cargo do colaborador atualizado para ${newRole}!`);
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      toast.error('Erro ao atualizar cargo.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Carregando equipe...</p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Equipe de Especialistas</h2>
          <p className="text-sm text-slate-500 font-medium">Gerencie os profissionais e permissões de acesso.</p>
        </div>
        <button 
          onClick={() => {
            setNewUser({ nome: '', email: '', password: '', cargo: 'OPERADOR' });
            setShowAddModal(true);
          }}
          className="btn-primary shadow-xl shadow-primary/20 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      {/* Abas de Navegação - Fase 61 */}
      <div className="flex flex-wrap items-center gap-3 pb-2 no-print w-full">
        <button
          type="button"
          onClick={() => setActiveTab('MEMBROS')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'MEMBROS' ? 'bg-slate-900 text-white shadow-xl ring-2 ring-primary/30' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users size={16} />
          <span>👥 Membros & Acessos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RANKING')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'RANKING' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-950/20 ring-2 ring-emerald-400' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Trophy size={16} className={activeTab === 'RANKING' ? 'text-amber-300' : ''} />
          <span>🏆 Ranking & Gamificação</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMISSOES')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'COMISSOES' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xl shadow-amber-950/20 ring-2 ring-amber-400' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <DollarSign size={16} className={activeTab === 'COMISSOES' ? 'text-white' : ''} />
          <span>💰 Extrato de Comissões</span>
        </button>
      </div>

      {activeTab === 'MEMBROS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((colab) => (
          <div key={colab.id} className={`card-premium p-6 text-center group border-0 shadow-xl shadow-slate-200/50 transition-all duration-500 ${!colab.status ? 'opacity-50 grayscale' : 'hover:shadow-2xl hover:shadow-primary/5'}`}>
            <div className="relative inline-block mb-6">
              <div className={`w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-slate-100 shadow-inner bg-slate-50 uppercase font-black text-2xl`}>
                {colab.nome?.charAt(0) || 'U'}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${colab.status ? 'bg-emerald-500' : 'bg-slate-400'} border-4 border-white rounded-full shadow-lg flex items-center justify-center`}>
                {colab.cargo === 'ADM' && <Lock size={12} className="text-white" />}
              </div>
            </div>
            
            <h4 className="font-black text-slate-800 text-lg leading-tight mb-1">{colab.nome}</h4>
            <div className="flex flex-col items-center gap-2 mb-6">
              <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em] bg-primary/5 px-3 py-1 rounded-full">{colab.cargo}</span>
              <p className="text-[11px] text-slate-400 font-bold truncate max-w-full">{colab.email}</p>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 mb-8 bg-slate-50 py-3 rounded-2xl border border-slate-100/50">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-slate-700">5.0</span>
              <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-widest">• 0 serviços</span>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleStatus(colab)}
                  disabled={updatingId === colab.id}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${
                    colab.status 
                      ? 'bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border-slate-100 hover:border-red-100' 
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                  }`}
                >
                  {updatingId === colab.id ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : colab.status ? (
                    <><UserMinus size={14} /> Inativar</>
                  ) : (
                    <><UserPlus size={14} /> Ativar</>
                  )}
                </button>
                
                <div className="relative group/menu ml-2">
                  <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-100 transition-all">
                    <UserCog size={18} />
                  </button>
                  <div className="absolute right-full bottom-0 mr-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 hidden group-hover/menu:block animate-in fade-in slide-in-from-right-2 z-50">
                     <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Trocar Cargo</p>
                     {['ADM', 'GESTOR', 'OPERADOR'].map(role => (
                       <button
                         key={role}
                         onClick={() => changeRole(colab, role)}
                         className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${colab.cargo === role ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                       >
                         {role}
                       </button>
                     ))}
                  </div>
                </div>

                <button 
                  onClick={() => { setEditingColab(colab); setShowEditModal(true); }}
                  className="p-3 bg-slate-50 hover:text-primary hover:bg-primary/10 text-slate-500 rounded-xl border border-slate-100 transition-all ml-2"
                  title="Editar Perfil (Nome/Telefone)"
                >
                  <Edit2 size={18} />
                </button>

                <button 
                  onClick={() => { setResetingColab(colab); setNewManualPassword(Math.random().toString(36).slice(-8)); setShowResetModal(true); }}
                  className="p-3 bg-slate-50 hover:text-amber-600 hover:bg-amber-50 text-slate-500 rounded-xl border border-slate-100 transition-all ml-2"
                  title="Gerenciar Acesso & Redefinir Senha"
                >
                  <Key size={18} />
                </button>
              </div>
            )}
          </div>
        ))}

        {profiles.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-30">
            <Users size={48} className="mx-auto mb-3" />
            <p className="font-black uppercase tracking-widest text-xs">Nenhum colaborador encontrado</p>
          </div>
        )}
      </div>
      ) : activeTab === 'RANKING' ? (
        <TecnicosRanking profiles={profiles} orders={orders} />
      ) : (
        <ComissoesExtrato profiles={profiles} orders={orders} />
      )}

      {showEditModal && editingColab && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-scaleUp">
            <h3 className="text-xl font-black text-slate-800 uppercase mb-6 tracking-tighter">Editar Perfil</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const nome = e.target.nome.value;
              const telefone = e.target.telefone.value;
              setUpdatingId(editingColab.id);
              setShowEditModal(false);
              await updateProfile(editingColab.id, { nome, telefone });
              setUpdatingId(null);
            }} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">E-mail (Login Protegido)</label>
                <div className="flex items-center gap-2 mt-1 p-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 font-bold opacity-70">
                   <Lock size={14} />
                   <span className="text-sm">{editingColab.email}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Nome Completo</label>
                <input name="nome" defaultValue={editingColab.nome || ''} required className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all" placeholder="Ex: Lucas Henrique" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">WhatsApp</label>
                <input name="telefone" defaultValue={editingColab.telefone || ''} className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all" placeholder="(11) 99999-9999" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-xl font-black uppercase text-[10px] hover:bg-slate-100 tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-primary/20 hover:bg-emerald-600 tracking-widest">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal Redefinir Senha & Acesso do Operador */}
      {showResetModal && resetingColab && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-scaleUp space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                     <Key className="text-amber-500" size={22} />
                     Redefinir Acesso
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Colaborador: <span className="text-slate-800">{resetingColab.nome}</span></p>
               </div>
               <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-black text-[10px] rounded-xl uppercase tracking-wider">Segurança</span>
            </div>

            {/* Opção 1: E-mail Oficial */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-3">
               <div className="flex items-center gap-2 font-black text-xs text-slate-700 uppercase tracking-wider">
                  <Mail size={16} className="text-primary" />
                  <span>Opção 1: Link Oficial por E-mail</span>
               </div>
               <p className="text-[11px] text-slate-500 font-medium leading-relaxed">O Supabase enviará um link de recuperação para <strong className="text-slate-700">{resetingColab.email}</strong> alterar a senha com segurança.</p>
               <button
                  type="button"
                  disabled={isSendingReset}
                  onClick={async () => {
                     setIsSendingReset(true);
                     try {
                        const { error } = await supabase.auth.resetPasswordForEmail(resetingColab.email, {
                           redirectTo: window.location.origin + '/reset-password'
                        });
                        if (error) throw error;
                        toast.success(`Link de recuperação enviado para ${resetingColab.email}!`);
                        setShowResetModal(false);
                     } catch (err) {
                        console.error(err);
                        toast.error(err.message || 'Erro ao enviar e-mail de redefinição.');
                     } finally {
                        setIsSendingReset(false);
                     }
                  }}
                  className="w-full py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
               >
                  {isSendingReset ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                  <span>Disparar Link de Redefinição</span>
               </button>
            </div>

            {/* Opção 2: Senha Temporária / WhatsApp */}
            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/60 space-y-3">
               <div className="flex items-center gap-2 font-black text-xs text-amber-900 uppercase tracking-wider">
                  <MessageCircle size={16} className="text-emerald-600" />
                  <span>Opção 2: Senha de Oficina & WhatsApp</span>
               </div>
               <p className="text-[11px] text-amber-800 font-medium leading-relaxed">Para técnicos na bancada que perderam o e-mail: defina uma senha temporária de contingência e envie pelo WhatsApp.</p>
               
               <div>
                  <label className="text-[9px] font-black uppercase text-amber-700 px-1 tracking-widest">Nova Senha Temporária</label>
                  <div className="flex gap-2 mt-1">
                     <input
                        type="text"
                        value={newManualPassword}
                        onChange={(e) => setNewManualPassword(e.target.value)}
                        className="flex-1 p-3 bg-white border border-amber-300 rounded-xl font-mono font-black text-sm text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/30"
                        placeholder="Ex: oficina123"
                     />
                     <button
                        type="button"
                        onClick={() => setNewManualPassword(Math.random().toString(36).slice(-8))}
                        className="px-3 bg-amber-200/70 hover:bg-amber-300/80 text-amber-900 rounded-xl font-black text-xs transition-all"
                        title="Gerar outra senha aleatória"
                     >
                        🎲 Gerar
                     </button>
                  </div>
               </div>

               <button
                  type="button"
                  onClick={async () => {
                     if (!newManualPassword || newManualPassword.length < 6) {
                        toast.warning('A senha deve ter pelo menos 6 caracteres.');
                        return;
                     }
                     try {
                        try {
                           const { data: edgeData, error: edgeError } = await supabase.functions.invoke('reset-password', {
                             body: {
                               userId: resetingColab.id,
                               newPassword: newManualPassword
                             }
                           });
                           
                           if (edgeError) throw edgeError;
                           if (edgeData?.error) throw new Error(edgeData.error);
                           
                           toast.success('Senha atualizada com sucesso no servidor!');
                        } catch (edgeErr) {
                           console.error('Erro ao resetar senha via Edge Function:', edgeErr);
                           toast.error(edgeErr.message || 'Erro ao registrar nova senha.');
                           return;
                        }
                        
                        const tel = (resetingColab.telefone || '').replace(/\D/g, '');
                        const texto = encodeURIComponent(
                           `Olá *${resetingColab.nome}*! 🛠️\n\nSua senha de acesso ao sistema *OsSystem* foi redefinida pela gerência.\n\n🔐 *E-mail de Login:* ${resetingColab.email}\n🔑 *Nova Senha Temporária:* ${newManualPassword}\n\nAcesse o sistema com estes dados!`
                        );
                        if (tel) {
                           window.open(`https://api.whatsapp.com/send?phone=55${tel}&text=${texto}`, '_blank');
                        } else {
                           toast.info(`Copie e envie a senha para ${resetingColab.nome}: ${newManualPassword}`);
                        }
                        setShowResetModal(false);
                     } catch (err) {
                        console.error(err);
                        toast.error('Erro ao registrar senha temporária.');
                     }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
               >
                  <MessageCircle size={15} />
                  <span>Salvar & Notificar no WhatsApp</span>
               </button>
            </div>

            {/* Dica de Suporte */}
            <div className="bg-slate-100/80 p-4 rounded-xl border border-slate-200/50">
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed text-center">
                  💡 <strong>Dica de Suporte:</strong> Se o operador trocou de e-mail e não consegue logar nem com o e-mail antigo, você pode inativar o perfil antigo e criar um login novo na aba "+ Novo Usuário".
               </p>
            </div>

            <button
               type="button"
               onClick={() => setShowResetModal(false)}
               className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
            >
               Fechar
            </button>
          </div>
        </div>
      )}


      {/* Modal Novo Usuário */}
      {showAddModal && !editingColab && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-scaleUp">
            <h3 className="text-xl font-black text-slate-800 uppercase mb-6 tracking-tighter">Novo Colaborador</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsCreating(true);
              
              try {
                // 1. Tentar criar via Edge Function (com service_role no servidor para superar o gatilho padrão)
                let edgeSuccess = false;
                try {
                  const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-user', {
                    body: {
                      email: newUser.email,
                      password: newUser.password,
                      nome: newUser.nome,
                      cargo: newUser.cargo
                    }
                  });

                  if (!edgeError && edgeData?.success) {
                    edgeSuccess = true;
                    toast.success(edgeData.message || 'Usuário criado com sucesso!');
                  } else if (edgeError) {
                    console.warn('Edge Function create-user indisponível ou erro, usando fallback local:', edgeError);
                  }
                } catch (edgeEx) {
                  console.warn('Fallback local ativado para criação de colaborador:', edgeEx);
                }

                // 2. Fallback Seguro (caso Edge Function não esteja deployada no ambiente)
                if (!edgeSuccess) {
                  const tempSupabase = createClient(
                    import.meta.env.VITE_SUPABASE_URL,
                    import.meta.env.VITE_SUPABASE_ANON_KEY,
                    { 
                      auth: { 
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                      } 
                    }
                  );

                  const { data, error } = await tempSupabase.auth.signUp({
                    email: newUser.email,
                    password: newUser.password,
                    options: {
                      data: {
                        full_name: newUser.nome,
                        cargo: newUser.cargo
                      }
                    }
                  });

                  if (error) throw error;

                  // Superar o gatilho padrão que força OPERADOR atualizando imediatamente via sessão do ADM
                  if (data?.user) {
                    await updateProfile(data.user.id, { cargo: newUser.cargo, nome: newUser.nome, status: true });
                  }

                  toast.success('Usuário criado com sucesso!');
                  toast.info('Se o login falhar, verifique o e-mail para confirmação da conta.');
                }

                setShowAddModal(false);
                fetchProfiles(); // Atualiza a lista da equipe
              } catch (err) {
                console.error(err);
                toast.error(err.message || 'Erro ao criar colaborador.');
              } finally {
                setIsCreating(false);
              }
            }} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Nome Completo</label>
                <input 
                  required 
                  value={newUser.nome}
                  onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                  className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all" 
                  placeholder="Ex: Carlos Silva" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">E-mail Corporativo</label>
                <input 
                  type="email" 
                  required 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all" 
                  placeholder="carlos@detailing.com" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Senha Temporária</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all" 
                  placeholder="••••••••" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Cargo / Permissão</label>
                <select 
                  value={newUser.cargo}
                  onChange={(e) => setNewUser({...newUser, cargo: e.target.value})}
                  className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all"
                >
                  <option value="OPERADOR">OPERADOR</option>
                  <option value="GESTOR">GESTOR</option>
                  <option value="ADM">ADMINISTRADOR</option>
                </select>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-2">
                <p className="text-[9px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed text-center">
                  ⚠️ Importante: Se o e-mail não abrir o sistema, peça ao colaborador para confirmar o e-mail na caixa de entrada.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-xl font-black uppercase text-[10px] hover:bg-slate-100 tracking-widest">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="flex-1 py-4 bg-primary text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-primary/20 hover:bg-emerald-600 tracking-widest flex items-center justify-center gap-2"
                >
                  {isCreating ? <Loader2 className="animate-spin" size={14} /> : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColaboradoresView;
