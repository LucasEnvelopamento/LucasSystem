# 🛡️ Auditoria de Segurança — OsSystem

**Data:** 28/07/2026  
**Infraestrutura:** Supabase (BaaS) + Vercel (Frontend) + Git (Versionamento)  
**Escopo:** Análise de vazamento de dados, autenticação, RLS, storage, exposição de segredos e boas práticas.

---

## Resumo Executivo

| Categoria | Status | Achados |
|---|---|---|
| 🔑 Chaves e Segredos | ✅ OK | Nenhuma `service_role` exposta no frontend |
| 📁 .gitignore | ✅ OK | `.env` protegido, nunca entrou no histórico git |
| 🔐 RLS (Row Level Security) | ⚠️ ATENÇÃO | 3 brechas identificadas |
| 🔑 Autenticação | 🔴 CRÍTICO | "Modo Contingência" é um bypass de segurança |
| 💾 Storage (Fotos) | ⚠️ ATENÇÃO | Bucket público sem restrição de upload |
| 🌐 CORS Edge Function | ⚠️ ATENÇÃO | `Allow-Origin: *` |
| 📋 Console Logs | ⚠️ ATENÇÃO | Logs sensíveis em produção |
| 🏗️ Vercel | ✅ OK | Configuração limpa |
| 🔗 Tracking do Cliente | ✅ OK | Usa UUID (não-previsível) |

---

## 🔴 ACHADO CRÍTICO #1 — "Modo Contingência" é um Backdoor

> **Severidade: CRÍTICA** — Este é o maior risco de segurança do sistema.

### O que é
No arquivo `src/contexts/AuthContext.jsx` (linhas 124-194), existe um mecanismo chamado "Modo Contingência / Modo Oficina" que:

1. **Armazena senhas em texto puro no `localStorage`** do navegador (linhas 126-127, 385-389 do `Colaboradores.jsx`)
2. **Permite login sem passar pelo Supabase Auth** — cria um `fakeUser` com permissões reais
3. **Busca perfis pela tabela `profiles` usando `ilike` por email** sem estar autenticado
4. **A coluna `senha_temporaria` armazena senhas em texto puro** na tabela `profiles` no banco

### Por que é perigoso
- Qualquer pessoa com acesso físico ao celular/PC de um operador pode abrir o DevTools → Application → Local Storage e ver **todas as senhas em texto puro**.
- O `fakeUser` criado no modo contingência **não tem JWT válido**, portanto as políticas RLS do Supabase **não reconhecem** esse usuário. Isso significa que:
  - Ou as queries falham silenciosamente (dados não aparecem)
  - Ou o sistema funciona porque existem brechas de RLS abertas
- A coluna `senha_temporaria` na tabela `profiles` é legível por qualquer usuário autenticado (ADM, Gestor ou o próprio perfil), pois o `select('*')` traz **todos os campos**.

### Arquivos Afetados
- `src/contexts/AuthContext.jsx` — Linhas 124-194 (bloco de contingência inteiro)
- `src/pages/Colaboradores.jsx` — Linhas 378-400 (reset de senha manual + localStorage)

### Recomendação
1. **Remover todo o bloco de contingência** do `AuthContext.jsx` (linhas 124-194)
2. **Remover a coluna `senha_temporaria`** da tabela `profiles`
3. **Limpar `localStorage`** de chaves `oss_temp_pass_*` e `oss_temp_passwords_registry` nos navegadores dos operadores
4. O reset de senha deve ser feito via `supabase.auth.admin.updateUserById()` na Edge Function, alterando a senha real do Auth.

---

## ⚠️ ACHADO #2 — RLS da tabela `pesquisas_nps` totalmente aberta

> **Severidade: ALTA** — Qualquer pessoa na internet pode ler, inserir e alterar pesquisas NPS.

### O que acontece
No `database.md` (linhas 388-390):

```sql
CREATE POLICY "NPS: Leitura Pública e Autenticada" ON public.pesquisas_nps FOR SELECT USING (true);
CREATE POLICY "NPS: Inserção Pública e Autenticada" ON public.pesquisas_nps FOR INSERT WITH CHECK (true);
CREATE POLICY "NPS: Atualização para todos" ON public.pesquisas_nps FOR UPDATE USING (true);
```

### Arquivos Afetados
- `database.md` — Linhas 388-390

### Recomendação
```sql
-- Permitir INSERT público (necessário para link WhatsApp)
CREATE POLICY "NPS: Inserção Pública" ON public.pesquisas_nps 
  FOR INSERT WITH CHECK (true);

-- Leitura apenas para gestores autenticados
CREATE POLICY "NPS: Leitura Gestores" ON public.pesquisas_nps 
  FOR SELECT USING (public.check_user_role(ARRAY['ADM','GESTOR']));

-- Atualização apenas para gestores
CREATE POLICY "NPS: Atualização Gestores" ON public.pesquisas_nps 
  FOR UPDATE USING (public.check_user_role(ARRAY['ADM','GESTOR']));
```

---

## ⚠️ ACHADO #3 — INSERT público em `ordens_servico` sem restrição de campos

> **Severidade: ALTA** — Qualquer pessoa pode inserir OS com dados arbitrários.

### O que acontece
No `database.md` (linha 270):

```sql
CREATE POLICY "OS: Criação Pública para Agendamento Online" 
  ON public.ordens_servico FOR INSERT WITH CHECK (true);
```

Não há restrição de quais campos podem ser preenchidos. Um atacante pode inserir OS com `status = 'CONCLUÍDO'`, `valor_pago` e `valor_total` arbitrários ou definir `tecnico_id` para qualquer UUID.

### Arquivos Afetados
- `database.md` — Linha 270
- `src/pages/SelfBooking.jsx` — (componente que usa essa política)

### Recomendação
Criar uma **Function SECURITY DEFINER** para o agendamento público, que aceita apenas os campos seguros:

```sql
CREATE OR REPLACE FUNCTION public.criar_agendamento_publico(
  p_cliente_nome TEXT,
  p_cliente_telefone TEXT,
  p_veiculo_marca TEXT,
  p_veiculo_modelo TEXT,
  p_servico TEXT,
  p_data_agendamento TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.ordens_servico (servico, data_agendamento, status, origem)
  VALUES (p_servico, p_data_agendamento, 'ORÇAMENTO', 'ONLINE');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ⚠️ ACHADO #4 — `select('*')` em `profiles` expõe `senha_temporaria`

> **Severidade: MÉDIA** — Campos sensíveis são transmitidos ao frontend.

### O que acontece
No `src/hooks/useProfiles.js` (linha 10):

```javascript
const { data, error } = await supabase.from('profiles').select('*').order('nome');
```

O `select('*')` retorna **todos os campos** da tabela, incluindo `senha_temporaria`. Isso era exatamente o que o usuário viu no console do navegador ao acessar a tela de Colaboradores.

### Arquivos Afetados
- `src/hooks/useProfiles.js` — Linha 10
- `src/contexts/AuthContext.jsx` — Linhas 84-88 e 201-205

### Recomendação
```javascript
// Selecionar apenas campos necessários
const { data, error } = await supabase
  .from('profiles')
  .select('id, nome, email, cargo, status, avatar_url, created_at')
  .order('nome');
```

---

## ⚠️ ACHADO #5 — CORS da Edge Function com `Allow-Origin: *`

> **Severidade: MÉDIA** — Qualquer site pode chamar a Edge Function de criação de usuários.

### O que acontece
No `supabase/functions/create-user/index.ts` (linha 5):

```typescript
'Access-Control-Allow-Origin': '*',
```

### Arquivos Afetados
- `supabase/functions/create-user/index.ts` — Linha 5

### Recomendação
```typescript
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://os-system-tau.vercel.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

> **Nota:** Mesmo com CORS `*`, a Edge Function exige um JWT válido de ADM/GESTOR para funcionar, então o risco real é mitigado. Mas é boa prática restringir.

---

## ⚠️ ACHADO #6 — Console Logs sensíveis em produção

> **Severidade: BAIXA** — Facilita engenharia reversa para atacantes.

### O que acontece
No `src/contexts/AuthContext.jsx`:

```javascript
console.log('Auth Event:', event);                    // L55
console.log('[Auth Contingência] Tentando login:', {   // L140
  cleanEmail, matchLocal, temReg: !!regEntry 
});
```

Qualquer pessoa que abrir o DevTools vê os eventos de autenticação e tentativas de login.

### Arquivos Afetados
- `src/contexts/AuthContext.jsx` — Linhas 55, 140, 155, 188
- `src/pages/Colaboradores.jsx` — Linha 383
- `src/hooks/useOrders.js` — Linha 71

### Recomendação
Remover todos os `console.log` do código de produção ou usar uma flag:

```javascript
const isDev = import.meta.env.DEV;
if (isDev) console.log('Auth Event:', event);
```

---

## ✅ Pontos Positivos Confirmados

| Item | Status | Detalhe |
|---|---|---|
| `.env` fora do Git | ✅ | `.gitignore` correto. Histórico git limpo. |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Chave **anon** (pública por design). Segura. |
| `service_role` nunca no frontend | ✅ | Usada apenas na Edge Function server-side. |
| Tracking via UUID | ✅ | `/status/:tracking_token` usa UUID aleatório, não IDs sequenciais. |
| Edge Function com validação de caller | ✅ | Verifica JWT + cargo antes de criar usuário. |
| RLS em todas as tabelas principais | ✅ | 11 tabelas com `ENABLE ROW LEVEL SECURITY`. |
| `check_user_role` SECURITY DEFINER | ✅ | Previne recursão infinita no RLS. |
| Funções atômicas SECURITY DEFINER | ✅ | `registrar_pagamento_atomico` e `baixar_estoque_atomico`. |
| Vercel limpo | ✅ | Apenas rewrite para SPA. Sem headers expostos. |
| Compressão de imagens | ✅ | Canvas comprime antes do upload (economia de storage). |

---

*Documento gerado automaticamente em 28/07/2026 como parte da auditoria pré-produção do OsSystem.*
