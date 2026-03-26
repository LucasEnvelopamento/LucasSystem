-- SQL para Configuração do Banco de Dados no Supabase

-- 1. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Veículos
CREATE TABLE IF NOT EXISTS public.veiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    placa TEXT UNIQUE NOT NULL,
    cor TEXT,
    ano INTEGER,
    tipo TEXT NOT NULL CHECK (tipo IN ('carro', 'moto')), -- Determina o checklist e precificação
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Serviços (Catálogo)
CREATE TABLE IF NOT EXISTS public.servicos_catalogo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    descricao TEXT,
    preco_base DECIMAL(10,2),
    preco_tipo TEXT DEFAULT 'fixo' CHECK (preco_tipo IN ('fixo', 'estimado')), -- 'estimado' ativa o "A partir de"
    garantia_meses INTEGER DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Agenda/Ordens de Serviço
CREATE TABLE IF NOT EXISTS public.ordens_servico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id),
    veiculo_id UUID REFERENCES public.veiculos(id),
    servico_id UUID REFERENCES public.servicos_catalogo(id),
    data_agendamento DATE NOT NULL,
    horario_agendamento TIME NOT NULL,
    status TEXT DEFAULT 'agendado' CHECK (status IN ('orcamento', 'agendado', 'em_execucao', 'concluido', 'cancelado')),
    valor_total DECIMAL(10,2),
    checklist_concluido BOOLEAN DEFAULT FALSE, -- Trava de segurança para o Operador
    checkpoint_avarias JSONB, -- Dados do Checklist Digital
    assinatura_cliente TEXT, -- Base64 da assinatura
    fotos_antes TEXT[],
    fotos_depois TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabelas de Materiais/Estoque
CREATE TABLE IF NOT EXISTS public.materiais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    marca TEXT,
    quantidade_metros DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;

-- Exemplo de política: Permitir acesso total para usuários autenticados (Simplificado para o plano free)
CREATE POLICY "Acesso total autenticado" ON public.clientes FOR ALL USING (auth.role() = 'authenticated');
-- Repetir para as outras tabelas conforme necessário
