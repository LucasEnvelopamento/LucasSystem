import React, { useState } from 'react';
import { User, Mail, Lock, Save, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfiles } from '../hooks/useData';
import { supabase } from '../lib/supabase';

const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { updateProfile } = useProfiles();
  
  const [nome, setNome] = useState(profile?.nome || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      // 1. Atualizar Nome no Perfil (Tabela Profiles)
      if (nome !== profile?.nome) {
        const { success, error } = await updateProfile(profile.id, { nome });
        if (!success) throw error;
      }

      // 2. Atualizar Senha (Auth Supabase)
      if (password) {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }

        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        
        setPassword('');
        setConfirmPassword('');
      }

      await refreshProfile();
      setStatus({ type: 'success', message: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Erro ao atualizar perfil.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in max-w-md mx-auto space-y-6 pt-4">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow-xl">
          <User size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Meu Perfil</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{profile?.cargo || 'Colaborador'}</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slide-up ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-[11px] font-black uppercase tracking-tight">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Email - Read Only */}
        <div className="card-premium p-6 space-y-4 border-slate-100">
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">E-mail de Acesso</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                value={user?.email || ''} 
                disabled 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all"
                placeholder="Seu nome"
              />
            </div>
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="card-premium p-6 space-y-4 border-slate-100">
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Lock size={14} className="text-primary" /> Alterar Senha
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-12 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Nova senha (mín. 6 chars)"
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password && (
              <div className="relative animate-in fade-in slide-in-from-top-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type={showPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!!password}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Confirme a nova senha"
                />
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit"
          disabled={saving || (!password && nome === profile?.nome)}
          className="w-full bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} />
              Salvar Alterações
            </>
          )}
        </button>
      </form>

      <p className="text-[9px] text-slate-400 text-center font-medium italic mt-4">
        As alterações de nome refletirão imediatamente nos relatórios de OS.
      </p>
    </div>
  );
};

export default ProfilePage;
