# Estrutura do Banco de Dados - OsSystem (Produção)

Este arquivo contém o script mestre para a criação completa do banco de dados em um novo ambiente Supabase. 

> [!IMPORTANT]
> Este script utiliza Funções Security Definer para evitar erros de "Infinite Recursion" nas políticas de segurança (RLS).

## 🚀 Script SQL Mestre
Copie e cole o conteúdo abaixo no **SQL Editor** do Supabase.

```sql
-- ============================================================================
-- SCRIPT MESTRE DE CRIAÇÃO DO BANCO DE DADOS - OSSYSTEM (VERSÃO PRODUÇÃO)
-- ============================================================================

-- 1. TIPOS E ENUMS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('ADM', 'GESTOR', 'OPERADOR');
  END IF;
END $$;

-- 2. TABELAS
CREATE TABLE IF NOT EXISTS public.loja_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_loja TEXT NOT NULL DEFAULT 'OsSystem',
    logo_url TEXT,
    youtube_id TEXT,
    primary_color TEXT DEFAULT '#059669',
    secondary_color TEXT DEFAULT '#1e293b',
    accent_color TEXT DEFAULT '#4f46e5',
    monitor_bg_color TEXT DEFAULT '#0f172a',
    whatsapp TEXT,
    instagram_url TEXT,
    youtube_social_url TEXT,
    tiktok_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    cpf_cnpj TEXT,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.veiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    modelo TEXT NOT NULL,
    marca TEXT,
    placa TEXT UNIQUE,
    cor TEXT,
    ano TEXT,
    tipo TEXT,
    porte TEXT DEFAULT 'Hatch',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    preco_base DECIMAL(10,2),
    tempo_estimado INTERVAL,
    categoria TEXT,
    tipo_veiculo TEXT DEFAULT 'AMBOS',
    garantia TEXT DEFAULT '12 meses',
    controle_estoque BOOLEAN DEFAULT false,
    materiais JSONB DEFAULT '[]',
    precos_por_classe JSONB DEFAULT '{}'::jsonb,
    is_combo BOOLEAN DEFAULT false,
    itens_combo JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.estoque_materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    quantidade DECIMAL(10,2) DEFAULT 0,
    unidade TEXT,
    preco_custo DECIMAL(10,2),
    minimo_alerta DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  nome text,
  email text,
  cargo public.user_role DEFAULT 'OPERADOR',
  status boolean DEFAULT true,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ordens_servico (
    id SERIAL PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes(id),
    veiculo_id UUID REFERENCES public.veiculos(id),
    status TEXT DEFAULT 'AGUARDANDO', 
    progresso INTEGER DEFAULT 0,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    valor_total DECIMAL(10,2),
    desconto DECIMAL(10,2) DEFAULT 0,
    servico TEXT,
    data_agendamento TIMESTAMP WITH TIME ZONE,
    tecnico_id UUID REFERENCES public.profiles(id),
    observacoes TEXT,
    tecnico TEXT,
    servicos_detalhados JSONB DEFAULT '[]',
    tempo_decorrido INTEGER DEFAULT 0,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    historico_pagamentos JSONB DEFAULT '[]',
    tracking_token UUID DEFAULT gen_random_uuid(),
    obs_tecnico TEXT,
    estoque_baixado BOOLEAN DEFAULT false,
    origem TEXT DEFAULT 'LOJA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.checklist_avarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id INTEGER REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    pontos_avaria JSONB DEFAULT '[]',
    notas TEXT,
    quilometragem TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.os_midia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id INTEGER REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    tipo TEXT,
    fase_execucao TEXT DEFAULT 'durante',
    angulo TEXT DEFAULT 'livre',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT DEFAULT 'ALERTA', 
    item_id UUID,
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.trabalhos_recentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    categoria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.pesquisas_nps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id INTEGER REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    cliente_nome TEXT,
    veiculo TEXT,
    nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 10),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.qa_auditorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id INTEGER REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    tecnico_id UUID REFERENCES public.profiles(id),
    score INTEGER DEFAULT 5 CHECK (score >= 1 AND score <= 5),
    observacoes TEXT,
    status TEXT DEFAULT 'APROVADO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. FUNÇÕES E TRIGGERS (CONEXÃO AUTH <-> PUBLIC)
-- ----------------------------------------------------------------------------

-- A. Gatilho para criar perfil automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, cargo)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'OPERADOR');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- B. Função de Verificação de Cargo (Prevenção de Loop Infinito RLS)
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles public.user_role[])
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (cargo = ANY(required_roles))
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B2. Sobrecarga universal para aceitar arrays de Texto (compatibilidade com qualquer banco)
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles text[])
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (cargo::text = ANY(required_roles))
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. SEGURANÇA (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.loja_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_avarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_midia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trabalhos_recentes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA ADM E GESTORES (Usando check_user_role para evitar recursão)
CREATE POLICY "Profiles: Próprio ou Gestores" ON public.profiles FOR ALL USING (auth.uid() = id OR public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "Config: Gestores total" ON public.loja_config FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "Clientes: Gestores total" ON public.clientes FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "Veiculos: Gestores total" ON public.veiculos FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "OS: Gestores total" ON public.ordens_servico FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "Servicos: Gestores total" ON public.servicos FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "Estoque: Gestores total" ON public.estoque_materiais FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "Notificacoes: Gestores total" ON public.notificacoes FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "Trabalhos: Gestores total" ON public.trabalhos_recentes FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));

-- POLÍTICAS PARA OPERADORES (Leitura Total para Fila Geral/Emergências e Atualização Controlada)
CREATE POLICY "Leitura essencial para Operador" ON public.servicos FOR SELECT USING (public.check_user_role(ARRAY['OPERADOR'::public.user_role]));
CREATE POLICY "OS: Leitura para Operador" ON public.ordens_servico FOR SELECT USING (public.check_user_role(ARRAY['OPERADOR'::public.user_role]));
CREATE POLICY "OS: Atualização para Operador" ON public.ordens_servico FOR UPDATE USING (public.check_user_role(ARRAY['OPERADOR'::public.user_role]) AND status NOT IN ('CONCLUÍDO', 'ENTREGUE', 'CANCELADO')) WITH CHECK (public.check_user_role(ARRAY['OPERADOR'::public.user_role]));

-- POLÍTICAS PARA CHECKLIST, MÍDIAS E NOTIFICAÇÕES (Gestão e Operação)
CREATE POLICY "Checklist: Gestores total" ON public.checklist_avarias FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "Checklist: Operadores gestão" ON public.checklist_avarias FOR ALL USING (public.check_user_role(ARRAY['OPERADOR'::public.user_role]));
CREATE POLICY "Midia: Gestores total" ON public.os_midia FOR ALL USING (public.check_user_role(ARRAY['ADM'::public.user_role, 'GESTOR'::public.user_role]));
CREATE POLICY "Midia: Operadores gestão" ON public.os_midia FOR ALL USING (public.check_user_role(ARRAY['OPERADOR'::public.user_role]));
CREATE POLICY "Notificacoes: Operadores gestão" ON public.notificacoes FOR ALL USING (public.check_user_role(ARRAY['OPERADOR'::public.user_role]));

-- Apenas via Edge Function ou SECURITY DEFINER (Function) é permitida para agendamentos externos.

-- Políticas para NPS e QA
ALTER TABLE public.pesquisas_nps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_auditorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NPS: Acesso Total" ON public.pesquisas_nps FOR ALL USING (true);
CREATE POLICY "QA: Gestores total" ON public.qa_auditorias FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND cargo::text IN ('ADM', 'GESTOR')
  )
);
CREATE POLICY "QA: Leitura Técnicos" ON public.qa_auditorias FOR SELECT USING (auth.uid() IS NOT NULL);


-- 5. STORAGE
-- Criar bucket 'os-photos' manualmente como PUBLIC.

-- 6. ADMIN PROMOTION
-- UPDATE public.profiles SET cargo = 'ADM' WHERE email = 'cf95.souza@gmail.com';

-- 7. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE ordens_servico, loja_config, notificacoes, estoque_materiais, trabalhos_recentes, pesquisas_nps, qa_auditorias;






-- 9. FUNÇÕES ATÔMICAS DE NEGÓCIO (PREVENÇÃO DE RACE CONDITIONS)

-- Registrar pagamento de forma atômica
CREATE OR REPLACE FUNCTION public.registrar_pagamento_atomico(
  p_os_id BIGINT,
  p_valor_recebido NUMERIC,
  p_metodo TEXT
) RETURNS VOID AS $$
DECLARE
  v_historico JSONB;
  v_novo_pagamento JSONB;
BEGIN
  -- Seleciona o histórico atual com lock de linha para evitar concorrência
  SELECT historico_pagamentos INTO v_historico
  FROM public.ordens_servico
  WHERE id = p_os_id
  FOR UPDATE;

  -- Cria o novo registro de pagamento
  v_novo_pagamento := jsonb_build_object(
    'id', (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
    'valor', p_valor_recebido,
    'metodo', p_metodo,
    'data', now()::TEXT
  );

  -- Atualiza a OS incrementando o valor e anexando ao histórico
  UPDATE public.ordens_servico
  SET 
    valor_pago = COALESCE(valor_pago, 0) + p_valor_recebido,
    historico_pagamentos = COALESCE(historico_pagamentos, '[]'::jsonb) || v_novo_pagamento
  WHERE id = p_os_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Baixar estoque de forma atômica (Idempotente)
CREATE OR REPLACE FUNCTION baixar_estoque_atomico(p_os_id BIGINT) 
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
DECLARE
  v_item RECORD;
  v_servico_item JSONB;
  v_estoque_baixado BOOLEAN;
BEGIN
  -- Verifica se já foi baixado
  SELECT estoque_baixado INTO v_estoque_baixado FROM public.ordens_servico WHERE id = p_os_id FOR UPDATE;
  
  IF v_estoque_baixado THEN
    RETURN QUERY SELECT FALSE, 'Estoque já foi baixado anteriormente.';
    RETURN;
  END IF;

  -- Percorre os serviços da OS para baixar materiais
  -- Nota: Esta lógica assume que os serviços e seus materiais estão salvos no JSONB da OS
  FOR v_servico_item IN SELECT jsonb_array_elements(servicos_detalhados) FROM public.ordens_servico WHERE id = p_os_id
  LOOP
    FOR v_item IN SELECT * FROM jsonb_to_recordset(v_servico_item->'produtos') AS x(id BIGINT, quantidade NUMERIC)
    LOOP
      UPDATE public.estoque_materiais
      SET quantidade = quantidade - v_item.quantidade
      WHERE id = v_item.id;
    END LOOP;
  END LOOP;

  -- Marca como baixado
  UPDATE public.ordens_servico SET estoque_baixado = TRUE WHERE id = p_os_id;
  
  RETURN QUERY SELECT TRUE, 'Estoque baixado com sucesso.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. TABELA DE PESQUISA DE SATISFAÇÃO (NPS E RETENÇÃO)
CREATE TABLE IF NOT EXISTS public.pesquisas_nps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id BIGINT REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT,
    veiculo_texto TEXT,
    servico_texto TEXT,
    nota INT NOT NULL CHECK (nota >= 0 AND nota <= 10),
    comentario TEXT,
    classificacao TEXT NOT NULL, -- 'PROMOTOR' (9-10), 'NEUTRO' (7-8), 'DETRATOR' (0-6)
    disparado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    respondido_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.pesquisas_nps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NPS: Inserção Pública" ON public.pesquisas_nps FOR INSERT WITH CHECK (true);
CREATE POLICY "NPS: Leitura Gestores" ON public.pesquisas_nps FOR SELECT USING (public.check_user_role(ARRAY['ADM','GESTOR']));
CREATE POLICY "NPS: Atualização Gestores" ON public.pesquisas_nps FOR UPDATE USING (public.check_user_role(ARRAY['ADM','GESTOR']));
```

## 📋 Passo a Passo de Deploy
1. Crie um novo projeto no Supabase.
2. Rode o script SQL acima no SQL Editor.
3. Crie o bucket `os-photos` no Storage (Público).
4. Realize o cadastro inicial do administrador.
5. Rode o comando de promoção SQL (item 6 do script).

---
### 📝 Histórico de Migrações
- **Fase 53 (18/05/2026)**: Paginação de dados no lado do cliente. Não houve necessidade de alterações nas tabelas, esquemas ou procedimentos SQL do banco de dados, visto que o fatiamento e paginação foram orquestrados inteiramente na interface React para manter a reatividade Supabase Realtime intacta.
- **Fase 54 (18/05/2026)**: Otimização da fila do operador e auto-início. Não houve alterações no banco de dados, visto que o auto-início e as validações de checklist foram integrados diretamente no fluxo de navegação do frontend React.

-- 10. Agendamento Público via Self-Booking
CREATE OR REPLACE FUNCTION public.criar_agendamento_publico(
  p_cliente_nome text,
  p_cliente_telefone text,
  p_cliente_email text,
  p_veiculo_modelo text,
  p_veiculo_marca text,
  p_veiculo_placa text,
  p_veiculo_ano text,
  p_servico_texto text,
  p_servicos_detalhados jsonb,
  p_valor_total numeric,
  p_data_agendamento timestamptz,
  p_observacoes text
) RETURNS void AS $$
DECLARE
  v_cliente_id uuid;
  v_veiculo_id uuid;
BEGIN
  -- 1. Cliente
  IF p_cliente_telefone IS NOT NULL AND p_cliente_telefone <> '' THEN
    SELECT id INTO v_cliente_id FROM public.clientes WHERE telefone = p_cliente_telefone LIMIT 1;
  END IF;
  
  IF v_cliente_id IS NULL THEN
    INSERT INTO public.clientes (nome, telefone, email) 
    VALUES (p_cliente_nome, p_cliente_telefone, p_cliente_email) 
    RETURNING id INTO v_cliente_id;
  END IF;

  -- 2. Veículo
  INSERT INTO public.veiculos (cliente_id, modelo, marca, placa, ano) 
  VALUES (v_cliente_id, p_veiculo_modelo, p_veiculo_marca, p_veiculo_placa, p_veiculo_ano) 
  RETURNING id INTO v_veiculo_id;

  -- 3. Ordem de Serviço
  INSERT INTO public.ordens_servico (
    cliente_id, veiculo_id, servico, servicos_detalhados, valor_total, 
    data_agendamento, status, origem, observacoes
  ) VALUES (
    v_cliente_id, v_veiculo_id, p_servico_texto, p_servicos_detalhados, p_valor_total, 
    p_data_agendamento, 'ORCAMENTO', 'ONLINE', p_observacoes
  );

  -- 4. Notificação
  INSERT INTO public.notificacoes (titulo, mensagem, tipo, read)
  VALUES (
    'Novo Agendamento Site', 
    p_cliente_nome || ' agendou ' || p_servico_texto,
    'agendamento', 
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;- **Fase 58 (27/07/2026)**: Suporte a fotos Antes/Depois com guias de ângulos visuais (frontal, lateral esquerda, lateral direita, traseira, livre). Adicionadas colunas `fase_execucao` e `angulo` em `os_midia`, além da política RLS `Midia: Leitura Pública` para permitir acesso anônimo seguro de clientes no acompanhamento do status.
- **Fase 60 (27/07/2026)**: Criação da tabela `pesquisas_nps` com colunas `os_id`, `nota` (0 a 10), `classificacao` (PROMOTOR, NEUTRO, DETRATOR) e políticas de RLS públicas/autenticadas para permitir a captação direta das avaliações de satisfação via link disparado por WhatsApp sem necessidade de login.
