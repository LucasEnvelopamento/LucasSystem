# Estrutura do Banco de Dados - OsSystem (Produção)

Este arquivo contém o script mestre para a criação completa do banco de dados em um novo ambiente Supabase.

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
    garantia TEXT DEFAULT '12 meses'
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.checklist_avarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id INTEGER REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    pontos_avaria JSONB DEFAULT '[]',
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.os_midia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id INTEGER REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    tipo TEXT,
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

-- 3. TRIGGERS
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

-- 4. SEGURANÇA (RLS)
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

-- POLÍTICAS
CREATE POLICY "Gestão total para ADM e GESTOR" ON public.loja_config FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE cargo IN ('ADM', 'GESTOR')));
CREATE POLICY "Gestão total para ADM e GESTOR" ON public.clientes FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE cargo IN ('ADM', 'GESTOR')));
CREATE POLICY "Gestão total para ADM e GESTOR" ON public.veiculos FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE cargo IN ('ADM', 'GESTOR')));
CREATE POLICY "Gestão total para ADM e GESTOR" ON public.ordens_servico FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE cargo IN ('ADM', 'GESTOR')));
CREATE POLICY "Gestão total para ADM e GESTOR" ON public.notificacoes FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE cargo IN ('ADM', 'GESTOR')));

CREATE POLICY "Leitura essencial para Operador" ON public.servicos FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE cargo = 'OPERADOR'));
CREATE POLICY "Gestão de OS para Operador" ON public.ordens_servico FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE cargo = 'OPERADOR'));

CREATE POLICY "Monitor TV Config Pública" ON public.loja_config FOR SELECT USING (true);
CREATE POLICY "Monitor TV OS Pública" ON public.ordens_servico FOR SELECT USING (true);

-- 5. STORAGE
-- Criar bucket 'os-photos' manualmente como PUBLIC.

-- 6. ADMIN PROMOTION
-- UPDATE public.profiles SET cargo = 'ADM' WHERE email = 'cf95.souza@gmail.com';

-- 7. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE ordens_servico, loja_config, notificacoes, estoque_materiais;
```

## 📋 Passo a Passo de Deploy
1. Crie um novo projeto no Supabase.
2. Rode o script SQL acima no SQL Editor.
3. Crie o bucket `os-photos` no Storage (Público).
4. Realize o cadastro inicial do administrador (`cf95.souza@gmail.com`).
5. Rode o comando de promoção SQL (item 6 do script).
