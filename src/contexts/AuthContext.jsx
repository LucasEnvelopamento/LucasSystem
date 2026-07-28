import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialized = React.useRef(false);

  useEffect(() => {
    if (!supabase) return;

    // Função para buscar dados iniciais
    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, (p) => setProfile(p));
          return;
        }


      } catch (error) {
        console.error('Erro na inicialização do Auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listener de mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log ('Auth Event omitido em prod');
      const currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(currentUser);
        if (currentUser) {
          // Busca perfil no modo background (sem mostrar a tela de loading)
          fetchProfile(currentUser.id, (p) => setProfile(p), true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId, onSuccess, background = false) => {
    if (!userId) {
      if (!background) setLoading(false);
      return;
    }
    
    try {
      if (!background) setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, cargo, status, avatar_url, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error.message);
        onSuccess(null);
      } else {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Falha crítica ao buscar perfil:', error.message);
      onSuccess(null);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (password || '').trim();

    let data = null;
    let error = null;

    try {
      const res = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });
      data = res.data;
      error = res.error;
    } catch (err) {
      error = err;
    }
    
    if (error) {
      setLoading(false);
      throw error;
    }

    // Busca o perfil imediatamente para agilizar o redirecionamento
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, nome, email, cargo, status, avatar_url, created_at')
      .eq('id', data.user.id)
      .maybeSingle();
    
    localStorage.removeItem('oss_session_contingency');
    
    setProfile(profileData);
    setUser(data.user);
    setLoading(false);
    
    return { user: data.user, profile: profileData };
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('oss_session_contingency');
      // Limpamos o estado local imediatamente para a UI reagir
      setUser(null);
      setProfile(null);
      setLoading(false);
      
      // Chamamos o signOut do Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao sair:', error.message);
    } finally {
      // Garantimos um "hard reset" da rota
      window.location.href = '/login';
    }
  };

  // Funções de verificação de cargo
  const isAdmin = profile?.cargo === 'ADM';
  const isGestor = profile?.cargo === 'GESTOR' || profile?.cargo === 'ADM';
  const isOperador = profile?.cargo === 'OPERADOR';

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, (p) => setProfile(p));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signIn, 
      signOut, 
      refreshProfile,
      isAdmin, 
      isGestor, 
      isOperador 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
