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

        // Contingência / Modo Oficina: Se o Supabase Auth não tem sessão ativa, verifica se há sessão temporária salva
        const contSession = JSON.parse(localStorage.getItem('oss_session_contingency') || 'null');
        if (contSession && contSession.user && contSession.profile) {
          setUser(contSession.user);
          setProfile(contSession.profile);
          await fetchProfile(contSession.user.id, (p) => {
            if (p && p.status !== false) {
              setProfile(p);
              localStorage.setItem('oss_session_contingency', JSON.stringify({ user: contSession.user, profile: p }));
            } else if (p && p.status === false) {
              localStorage.removeItem('oss_session_contingency');
              setUser(null);
              setProfile(null);
            }
          }, true);
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
      console.log('Auth Event:', event);
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
        .select('*')
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
      // Contingência / Modo Oficina: Verificar se a senha corresponde à senha_temporaria gravada no Supabase ou localStorage
      try {
        const localPass = localStorage.getItem(`oss_temp_pass_${cleanEmail}`);
        const registry = JSON.parse(localStorage.getItem('oss_temp_passwords_registry') || '{}');
        let regEntry = registry[cleanEmail];
        
        // Se não achou pelo e-mail exato, busca em qualquer item do registro pela senha ou e-mail aproximado
        if (!regEntry) {
          regEntry = Object.values(registry).find(item => 
            (item.password && item.password.trim() === cleanPass) || 
            (item.email && item.email.toLowerCase().trim() === cleanEmail)
          );
        }

        const matchLocal = (localPass && localPass.trim() === cleanPass) || (regEntry && regEntry.password && regEntry.password.trim() === cleanPass);

        console.log('[Auth Contingência] Tentando login:', { cleanEmail, matchLocal, temReg: !!regEntry });

        let tempProfile = null;
        try {
          const { data: pData } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();
          if (pData && (pData.senha_temporaria === cleanPass || matchLocal)) {
            tempProfile = pData;
          } else if (pData && matchLocal) {
            tempProfile = pData;
          }
        } catch (dbErr) {
          console.log('Verificação DB contingência (ignorado em modo anônimo):', dbErr);
        }

        if (tempProfile || matchLocal) {
          let targetProfile = tempProfile;
          if (!targetProfile) {
            try {
              const { data: pData } = await supabase.from('profiles').select('*').ilike('email', cleanEmail).maybeSingle();
              targetProfile = pData;
            } catch (e) {}
          }

          if (!targetProfile && matchLocal) {
            targetProfile = {
              id: (regEntry && regEntry.profileId) || 'contingencia-' + Math.random().toString(36).substring(2, 9),
              email: (regEntry && regEntry.email) || cleanEmail,
              nome: (regEntry && regEntry.nome) || cleanEmail.split('@')[0] || 'Operador',
              cargo: (regEntry && regEntry.cargo) || 'OPERADOR',
              status: true
            };
          }

          if (targetProfile && targetProfile.status !== false) {
            const fakeUser = {
              id: targetProfile.id,
              email: targetProfile.email,
              user_metadata: { name: targetProfile.nome, cargo: targetProfile.cargo },
              role: 'authenticated'
            };
            setUser(fakeUser);
            setProfile(targetProfile);
            localStorage.setItem('oss_session_contingency', JSON.stringify({ user: fakeUser, profile: targetProfile }));
            setLoading(false);
            console.log('[Auth Contingência] Login de contingência realizado com sucesso!');
            return { user: fakeUser, profile: targetProfile };
          }
        }
      } catch (contErr) {
        console.error('Erro na verificação de contingência:', contErr);
      }

      setLoading(false);
      throw error;
    }

    // Busca o perfil imediatamente para agilizar o redirecionamento
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
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
