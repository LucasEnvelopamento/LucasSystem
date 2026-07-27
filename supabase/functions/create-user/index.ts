import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Tratar requisição CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração de ambiente incompleta no servidor (Edge Function).');
    }

    // 1. Verificar a identidade de quem está fazendo a requisição (Caller)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: Cabeçalho de autorização ausente.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: Usuário autenticado inválido.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Usar o client service_role para checar permissão (Deve ser ADM ou GESTOR)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: callerProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('cargo')
      .eq('id', callerUser.id)
      .single();

    if (profileError || !callerProfile || (callerProfile.cargo !== 'ADM' && callerProfile.cargo !== 'GESTOR')) {
      return new Response(
        JSON.stringify({ error: 'Permissão negada: Apenas Administradores ou Gestores podem criar colaboradores.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Receber os dados do novo usuário no body da requisição
    const { email, password, nome, cargo } = await req.json();

    if (!email || !password || !nome) {
      return new Response(
        JSON.stringify({ error: 'Dados incompletos: E-mail, senha e nome são obrigatórios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cargoValidado = ['ADM', 'GESTOR', 'OPERADOR'].includes(cargo) ? cargo : 'OPERADOR';

    // 4. Criar o usuário via Admin API (sem deslogar quem está chamando e já confirmando o e-mail)
    const { data: newUserAuth, error: createError } = await adminClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmação para evitar bloqueio do colaborador
      user_metadata: {
        full_name: nome,
        cargo: cargoValidado,
      },
    });

    if (createError) {
      throw createError;
    }

    if (!newUserAuth.user) {
      throw new Error('Falha ao gerar registro do usuário na autenticação.');
    }

    // 5. Garantir que o cargo e nome sejam persistidos na tabela profiles 
    // (superando a limitação do gatilho padrão que fixa como OPERADOR)
    const { error: updateProfileError } = await adminClient
      .from('profiles')
      .update({
        nome: nome,
        email: email,
        cargo: cargoValidado,
        status: true,
      })
      .eq('id', newUserAuth.user.id);

    if (updateProfileError) {
      console.error('Erro ao atualizar perfil com cargo e nome:', updateProfileError);
      // Não interrompe o fluxo, pois o usuário foi criado no Auth, mas retorna aviso logado
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Colaborador ${nome} criado com sucesso como ${cargoValidado}!`,
        user: {
          id: newUserAuth.user.id,
          email: newUserAuth.user.email,
          nome: nome,
          cargo: cargoValidado,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro na Edge Function create-user:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno no servidor ao criar usuário.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
