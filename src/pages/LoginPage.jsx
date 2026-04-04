import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { Car, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, user, profile, loading, isOperador } = useAuth();
  const { whatsapp, name } = useBrand();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      if (isOperador) {
        navigate('/operador', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, loading, isOperador, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { user: newUser, profile: newProfile } = await signIn(email, password);
      
      // Navegação imediata para evitar necessidade de F5
      if (newUser && newProfile) {
        if (newProfile.cargo === 'OPERADOR') {
          navigate('/operador', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      let msg = 'Credenciais inválidas ou erro na conexão.';
      
      if (err.message === 'Email not confirmed') {
        msg = 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
      } else if (err.message === 'Invalid login credentials') {
        msg = 'E-mail ou senha incorretos.';
      } else if (err.message?.includes('network')) {
        msg = 'Erro de conexão. Verifique sua internet.';
      }

      setError(msg);
      console.error('Erro de Login:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se estiver carregando inicialmente ou após o login (buscando perfil)
  const isInitialLoading = loading && !user && !isSubmitting;
  const isProfileFetching = loading && user;

  if (isInitialLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-lg px-6 flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20 rotate-3">
              <Car className="text-white w-10 h-10" />
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">OsSystem</h1>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Premium Detailing Management</p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white/70 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-700 delay-200">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm font-medium">Acesse sua conta para gerenciar sua loja.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all font-bold text-sm text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all font-bold text-sm text-slate-700"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-black uppercase tracking-wider text-center border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-emerald-700 text-white rounded-2xl py-5 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center bg-slate-50 py-3 rounded-2xl border border-slate-100/50">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Esqueceu sua senha? <br />
              <a 
                href={whatsapp ? `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=Olá, esqueci minha senha no sistema ${name}. Pode me ajudar?` : '#'} 
                target={whatsapp ? "_blank" : "_self"}
                rel="noreferrer"
                className="text-primary font-black cursor-pointer hover:bg-primary/5 px-2 py-0.5 rounded transition-all inline-block mt-1"
              >
                Contate o Administrador
              </a>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center opacity-40">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Powered by OsSystem Premium v2.5</p>
        </div>
      </div>

      {isProfileFetching && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-slate-800 font-black uppercase tracking-widest text-[10px]">Preparando seu ambiente...</p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
