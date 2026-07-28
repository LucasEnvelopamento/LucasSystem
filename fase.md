# Guia de Desenvolvimento - OsSystem (White Label PWA)

Este documento é a bússola do projeto. Ele define as fases, objetivos e o progresso em tempo real. **Consultar este arquivo antes de qualquer nova implementação.**

## 🎯 Objetivo Geral
Criar uma aplicação White Label para estética automotiva (PPF, Insulfilm, Envelopamento) com:
- **PWA Mobile:** Para o Operador realizar checklists e gerir OS.
- **Web Dashboard:** Para o Gestor controlar a loja, estoque e faturamento.
- **TV Real-time:** Para exibição do status de produção na loja.
- **Infra:** Supabase (Auth/DB/Realtime) + Vercel (Hospedagem).

---

## 🛠️ Stack Tecnológica
- **Frontend:** React + Vite
- **Estilização:** Tailwind CSS (Baseado no `ui-design-system` e `dashboard-layout`)
- **Backend:** Supabase (PostgreSQL + Realtime)
- **PWA:** Vite PWA Plugin

---

## 🚀 Fases e Funcionalidades Detalhadas

### ✅ Fase 1: Setup e Fundação (Concluída)

### ✅ Fase 2: Design System e App Shell (Concluída)
- [x] Criação do `Sidebar` e `Header` profissionais (Skill: `dashboard-layout`).
- [x] Implementação de **Variáveis de Ambiente (.env)** para personalização.
- [x] **BrandContext:** Sistema de cores e logos dinâmicos.
- [x] Layouts base para Desktop (Gestor) e Mobile (Operador).
- [x] Ajustar layout do Certificado para A4 (Compactação Cirúrgica)
- [x] Implementar cálculo dinâmico de garantia (Anos/Meses) com base no serviço
- [x] Corrigir persistência do prazo de garantia na criação da OS
- [x] Sincronizar atualizações nos repositórios principal e do cliente

**Próxima Fase**: Monitoramento e Suporte de Produção.

### ✅ Fase 3: Módulo Gestor - Ordens de Serviço e Checklist (Concluída)
- [x] **Cadastros:** Clientes, Veículos, Serviços e Materiais/Estoque.
- [x] **Agenda Inteligente:** Calendário interativo para gestão de horários.
- [x] **Vendas/Orçamentos:** Fluxo de orçamento que vira OS após aprovação.
- [x] **Checklist Digital de Avarias (O Diferencial):** Mapa visual do veículo (SVG interativo) onde o gestor marca pontos de dano antes de iniciar.
- [x] **Certificado de Garantia:** Geração automática de PDF baseado no tempo de garantia do serviço. [x]
- [x] **Integração WhatsApp:** Botões de um clique para enviar confirmação de agenda e aviso de conclusão de serviço. [x]

### ✅ Fase 4: Módulo Operador (PWA Mobile)
- [x] **Dashboard Real:** KPIs de Fila Geral, Atribuídos e Finalizados (Histórico).
- [x] **Fila Organizada:** Divisão entre "Meus Serviços" e "Disponíveis para Coleta".
- [x] **Perfil:** Edição de Nome, E-mail e Troca de Senha.
- [x] **Execução Técnica:** Botão de Observação funcional e Sincronização Real-time com a TV.
- [x] **Finalização:** Registro de tempo de execução e mudança de status real para histórico.

### ✅ Fase 5: Visualização TV (Experiência do Cliente) (Concluída)
- [x] **Painel Real-time:** Status dos carros em produção com animações de progresso.
- [x] **Identificação:** Nome do cliente, Veículo e Serviço.
- [x] **Relógio e Data:** Estética premium sincronizada.

### ✅ Fase 6: Configurações e Persistência de Marca (Concluída)
- [x] **Tabela de Configurações:** Criar tabela no Supabase para armazenar ID do YouTube, Cores e Logo.
- [x] **Painel do Gestor:** Tela para editar o link da Playlist/Vídeo do YouTube.
- [x] **Integração Dinâmica:** Monitor TV passa a ler o vídeo do banco de dados, permitindo trocas sem novo deploy.
- [x] **White Label Real:** Gestão completa de identidade visual via interface.

### ✅ Fase 7: Autenticação e RBAC (Supabase Auth) - CONCLUÍDO
- [x] Implementação do Supabase Auth (E-mail/Senha).
- [x] Criação da tabela `perfis` e Trigger de auto-criação.
- [x] Desenvolvimento do `AuthContext` e Hook `useAuth`.
- [x] Criação da Tela de Login Premium.
- [x] Proteção de Rotas por Cargo (ADM, Gestor, Operador).
- [x] Garantia de acesso público ao Monitor TV.

### ✅ Fase 8: Gestão de Colaboradores e Realismo de Dados (Concluída)
- [x] **Painel de Usuários:** Refatoração completa da tela de `Colaboradores` integrada ao Supabase.
- [x] Fase 8: Dashboard em Tempo Real e Desmockagem
    - [x] Substituir dados mockados no Dashboard por métricas reais (Supabase)
    - [x] Fase 10: Orçamentos e OS Inteligentes 🚗🏍️💡
    - [x] Padronizar tipos de veículos no banco (CARRO/MOTO)
    - [x] Implementar filtragem dinâmica no modal de orçamento
    - [x] Implementar campos de Desconto e ajuste de preços finais
    - [x] Integrar Agendamento (Data e Técnico) ao fluxo de Aprovação
    - [x] Especializar Checklist Digital para Carro ou Moto
    - [x] Estabilizar Dashboard e Listas contra dados inconsistentes (Null Guards)
áficos
- [x] Fase 9: Especialização de Serviços por Veículo 🚗🏍️
    - [x] Adicionar distinção entre Carro, Moto ou Ambos no catálogo
    - [x] Implementar badges visuais de aplicabilidade nos cards
    - [x] Refinamento visual corporativo (Bordas, Sombras e Tipografia) conforme design system
    - [x] Validar persistência no Supabase após migração SQL
- [x] **Regras de Proteção:** Implementação da regra de ouro (ADM não desativa a si mesmo).
- [x] **Gestão de Marca:** White Label dinâmico e centralizado no `BrandContext` com persistência em banco.
- [x] **Sincronização Real-time:** Ativação de WebSockets em todas as tabelas principais para espelhamento instantâneo.
- [x] **Estabilização de Auth & Redirecionamento (F5 Fix):** Resolução definitiva de loops e atrasos no login/logout com redirecionamento RBAC instantâneo.
- [x] **Dashboard Real-time:** Desmockagem da Performance de Serviços e KPIs baseados em dados reais de catálogo e OS.

### ✅ Fase 11: Refinamentos de UX e Sincronização Final - CONCLUÍDO
- [x] Correção do link WhatsApp para usar o telefone real do cliente.
- [x] Implementação de Desconto em Porcentagem (%) com cálculo automático.
- [x] Retenção de orçamentos aprovados na tela de Vendas para acompanhamento.
- [x] Agenda de Conflitos: Visualização de ocupação do dia no modal de agendamento.
- [x] Limpeza de nomes de técnicos (remover e-mails e cargos do select).
- [x] Estabilização do salvamento de checklist e assinatura digital.

---

## 💎 Diferenciais Estratégicos (Onde vamos ganhar o mercado)

Para entregar um produto superior aos concorrentes, implementaremos:

1. **Checklist Visual 2D/3D:** Em vez de apenas texto, um desenho técnico do carro onde se clica para apontar riscos ou amassados. Isso gera confiança extrema no cliente.
2. **Histórico de Manutenção Pós-Venda:** O sistema avisará o gestor (e opcionalmente o cliente) após 6 meses/1 ano para uma "revisão de garantia" (ex: conferir se o PPF está levantando). Isso gera recorrência.
3. **Link de Acompanhamento para o Cliente:** Enviar um link único para o cliente ver o progresso do carro dele pelo celular, sem precisar ligar para a loja.
4. **Baixa Automática de Estoque:** Gastou 5 metros de PPF? O sistema já retira do estoque e avisa se estiver acabando.

---

## 🏢 Regras White Label (Versão Single-Tenant)
1. **Instância Única:** Cada cliente terá seu próprio deploy e seu próprio banco de dados Supabase.
2. **Cores/Logo:** Configuradas via `.env` ou Painel de Configurações do Gestor.

### ✅ Fase 12: Estabilização e Auditoria Técnica
- [x] **F5 Fix:** Correção definitiva da persistência de sessão no refresh da página.
- [x] **UI Serviços:** Novo formulário de cadastro (mais bonito), campo de Garantia e ajuste de Descrição.
- [x] **UI Vendas:** Menu de 3 pontos sem scroll, botão "APROVAR" e correção de texto no WhatsApp.
- [x] **Monitor TV PRO:** Melhorar legibilidade (texto maior), exibir 4 carros e vídeo reduzido.
- [x] **Lógica de Entrega:** Botão "Entregue" para limpar a TV e mover para histórico final.
- [x] **Configurações:** Corrigir persistência de cores, logo e vídeo no banco de dados.

### ✅ Fase 13: Diferenciais Estratégicos e Pós-Venda
- [x] **Garantia Digital:** Gerador de Certificado em PDF com dados da OS e prazos.
- [x] **Link do Cliente:** Página pública para o cliente acompanhar o progresso em tempo real. (Sincronizado via TV)
- [x] **Notificação Automática:** WhatsApp automático ao atingir 100% de conclusão.
- [x] **Estabilidade PWA:** Ajustes de contraste e fix do cronômetro (Fase 14/15 consolidada).
- [x] **Ergonomia Mobile:** Redução de escala do cronômetro (4xl) e correção de acessibilidade dos botões de ação para evitar sobreposição do menu.

### ✅ Fase 17: Múltiplos Serviços & Monitor Compacto (Concluído)
- [x] Controle granular de progresso por item e TV otimizada.

### ✅ Fase 18: Ajustes Habilidade Gestor - Parte 1 (Concluída)
- [x] **Dashboard:**
  - Corrigir a barra de rolagem horizontal indevida na listagem de Ordens Recentes.
  - Revisar e corrigir a lógica de todos os KPIs do Dashboard para garantir que os cálculos batam com a lista real e com a tela de Vendas.
- [x] **Vendas:**
  - Transformar o menu de ações de cada orçamento (os 3 pontinhos) em um pop-up flutuante (`absolute`/`fixed`) para não empurrar o layout para baixo nem gerar barras de rolagem.
- [x] **Ordens de Serviço:**
  - Substituir o `window.confirm` do fim do Checklist Visual por um pop-up React customizado e bonito com a opção "Enviar Link" e "Não Enviar".
  - Refatorar o botão "Ações / Enviar Link": Se a OS estiver em andamento, manda o acompanhamento sem precisar refazer checklist; se estiver concluída, exibe alerta "Serviço já concluído".
  - Criar o botão "Finalizar" para concluir a OS de fato (ex: retirando da TV e mudando status) e para liberar o gerador de Certificado de Garantia.

### ✅ Fase 18: Ajustes Habilidade Gestor - Parte 2 (Resoluções de Bug & CRUDs - Concluída)
- [x] **Clientes:**
  - Diagnosticar e resolver problema de demora no carregamento da lista (otimização de view/query).
  - Expandir as ações do cliente: criar painel ou modal de Edição de Cliente (permitir editar Nomes, Telefones e E-mails), além do Histórico já existente.
- [x] **Serviços:**
  - Corrigir o crash fatal da página (`ReferenceError: Type is not defined` na linha 430).
  - Restabelecer a funcionalidade de todos os botões (Novo Serviço, Detalhes/Edição, Excluir) permitindo ajuste de valor, nome, categorias e tipo de automóvel (Carro, Moto ou Ambos).
- [x] **Estoque:**
  - Dar vida à tela: conectar os botões inativos e finalizar o fluxo CRUD (Criar, Ler, Atualizar, Excluir) conectado à tabela real `estoque_materiais` já existente no Supabase.

### ✅ Fase 18: Ajustes Habilidade Gestor - Parte 3 (Colab & Configs - Concluída)
- [x] **Colaboradores:**
  - Habilitar edição/exibição correta do campo `nome` para os colaboradores (perfis).
  - Garantir que os select boxes de agendamento (ex: Vendas) utilizem esse Nome em vez de apenas o E-mail.
- [x] **Configurações da Loja:**
  - Diagnosticar por que as alterações de nome_loja, cores e vídeo não estão persistindo após dar F5 (Provável bug na query de Update do Supabase).
  - Adicionar campo para inserção/upload da Logo da loja (`logo_url`).
  - Refletir a Logo inserida em todo o ecossistema: TV, Certificado de Garantia e Link de Status da OS do cliente.

### ✅ Fase 19: Refinamento de UX, Responsividade e Sticky Modals (Concluída)
- [x] **Sticky Modals:** Refatoração de todos os modais extensos (`Agendamento`, `Novo Orcamento`, `Vendas`, `Serviços`, `Checklist`, `Certificado`) para usar cabeçalho e rodapé fixos.
- [x] **Responsividade Crítica:** Garantia de que botões de ação permaneçam visíveis em monitores pequenos (1366x768) e dispositivos móveis.
- [x] **Lógica de Faturamento:** Revisão dos contadores de `Vendas.jsx` e `Dashboard.jsx` para incluir ordens "Entregues" no total convertido.
- [x] **Visibilidade de Histórico:** Inclusão do status "ENTREGUE" na Agenda e telas de Gestão, garantindo que o carro não "suma" após a entrega.
- [x] **Ergonomia do Executor:** Refatoração da Folha de Obra do Operador para manter o botão "Finalizar" sempre acessível.

### ✅ Fase 20: Sincronização de Faturamento e Fluxo de Entrega (Concluída)
- [x] Correção do cálculo de faturamento total incluindo ordens "ENTREGUES".
- [x] Implementação do status "ENTREGUE" na Agenda e telas de Gestão.
- [x] Garantia de que a entrega remove o veículo da TV em tempo real.

### ✅ Fase 21: Ergonomia e Responsividade Pro (Concluída)
- [x] Modais com cabeçalho e rodapé fixos para melhor usabilidade em OS longas.
- [x] Ajuste de escala para resolução 1366x768 (Padrão corporativo).
- [x] Refatoração da Folha de Obra para manter o botão "Finalizar" sempre visível.

### ✅ Fase 22: Identidade Visual Avançada (Concluída)
- [x] Persistência da Logomarca dinâmica em todo o sistema (TV, Link Cliente, Certificado).
- [x] Implementação da Cor de Fundo do Monitor configurável via painel.
- [x] Sincronização global de marca via BrandContext.

### ✅ Fase 23: Monitor TV Real-time Precision (Concluída)
- [x] **Layout Dinâmico Inteligente**: 
    - Sem Vídeo: Grade 2x2 (4 slots) equilibrada.
    - Com Vídeo: Divisão 50/50 com 3 slots fixos verticais.
- [x] Refatoração do **Card Bicolor**: Lado Azul (Info) e Lado Escuro (Execução).
- [x] Tipografia Dinâmica: Ajuste automático de fontes dependendo do layout (Compacto vs. Full).

### ✅ Fase 24: Integração de Redes Sociais e WhatsApp (Concluída)
- [x] Expansão da tabela `loja_config` para suportar canais sociais.
- [x] Novos campos em Configurações: WhatsApp, Instagram, YouTube e TikTok.
- [x] Botões de contato dinâmicos no Link do Cliente (visibilidade condicional).

### ✅ Fase 27: Responsividade Global - Gestor Mobile & Tablet (Concluída)
- [x] **App Shell:** Refatoração do `DashboardLayout` e `Sidebar` com controle Offcanvas (Menu Hamburger).
- [x] **Grades Automáticas:** Layout do `Dashboard`, `Vendas` e `OrdensServico` configurado de `grid-cols-4` limitante para contêineres colapsáveis flexíveis (`sm:grid-cols-2`, `xl:grid-cols-4`).
- [x] **Prevenção de Quebra (Tabelas e Cards):** Implementação de rolagens nativas seguras horizontais (`overflow-x-auto`) nas telas de Clientes e Serviços.
- [x] **Ergonomia Modular:** Ajustes em modais de Orçamento (paddings variáveis `p-6 md:p-10`) e botões flexíveis expansíveis para acomodar o toque.

### ✅ Fase 28: Padronização UX e Estoque Avançado (Concluída)
- [x] **Padronização Visual:** Unificar as cores de status (Aguardando, Em Execução, Concluído, Entregue) em todas as telas (`Dashboard`, `Vendas`, `OrdensServico`, `Operador`, `TV` e `Agenda`).
- [x] **Fluxo de Vendas:** Novo botão de atalho "Ir para Ordem de Serviço" para propostas aprovadas, simplificando os próximos passos.
- [x] **Integração de Estoque na OS:** Habilitado flag `Controle de Estoque` no Catálogo de Serviços, vinculando materiais específicos (Ex: metros de PPF) diretamente à etapa do orçamento/OS com baixa automática na conclusão.
- [x] **Estoque Rápido:** Adição de atalho para "Repor Produto" diretamente na tela de listagem de materiais.
- [x] **Branding e PWA:** Inserção dinâmica da Logomarca (do Banco de Dados) como Favicon da aplicação em tempo real.

### ✅ Fase 28.1: Estoque Avançado - Automação Baseada no Catálogo (Concluída)
- [x] **Configuração Mestre:** Refatorada a interface de Catálogo de Serviços (`Servicos.jsx`) permitindo gerentes construírem "receitas" com múltiplos insumos necessários para execução de cada pacote.
- [x] **Redução de Fricção (Orçamento):** Retirada toda a carga dos Vendedores. O modal do Orçamento não exibe nem exige vínculo de múltiplos materiais (já são copiados ativamente e silenciosamente do catálogo em formato JSON Array).
- [x] **Lógica de Dedução:** A engine `updateOrderProgress` percorre a lista de produtos (injetada na OS) e faz os descontos sequenciais no estoque da corporação sem atrito.

### ✅ Fase 28.2: Refinamento Visual (Certificados e Logos) (Concluída)
- [x] **Impressão Cirúrgica:** Refatoração drástica (`window.open`) para emissão do Certificado de Garantia em PDF, injetando CSS dinâmico que ignora o layout pai e evita dores de cabeça como corte de páginas.
- [x] **Enquadramento A4:** Ajuste de paddings verticais e borders (`print:`) permitindo respiro visual na tela comum e encolhimento harmonioso no papel de 285mm.
- [x] **Design do Símbolo da Loja:** Conserto de variância de dados (`logoUrl`) e melhoria da UX de símbolos espalhados. Sidebar e TV agora abraçam perfeitamente as imagens de logotipo que o usuário manda, arredondando cantos estilo MacOS (App Icon).

### ✅ Fase 28.3: Sistema Global de Notificações - Toasts (Concluída)
- [x] Padrão Ouro: Desenvolver arquitetura Global de Popups Event-Driven para dispensar re-renders com uso de bibliotecas pesadas de fora.
- [x] Extermínio Inicial dos Alerts: Substituição de ~12 popups cinzas nativos.
- [x] Polir componentes (como Checklist Automotivo e persistência de Supabase) para se integrarem em silêncio de fundo disparando avisos laterais elegantes de "Sucesso".

- [x] **Ordens de Serviço**:
    - [x] Corrigir botões de "Entrega" e "Conclusão de Serviço".
    - [x] Garantir baixa única de estoque (Idempotência).

- [x] **Gestão de Clientes**:
    - [x] Implementar contador de serviços concluídos por cliente.
    - [x] Melhorar painel lateral de detalhes (perfil do cliente).
- [x] **Controle de Estoque**:
    - [x] Substituir `window.prompt` por modal de reposição premium.
    - [x] Validar entrada de quantidades (apenas números).
- [x] **Colaboradores**:
    - [x] Incluir campo "Nome" no modal de edição.
    - [x] Proteger campo "E-mail" (somente leitura com cadeado).
- [x] **Camada de Segurança & Estabilização**:
    - [x] Implementar Prevenção de IDOR (UUID Tracking Token) nos links de status dos clientes. **(Concluído)**
    - [x] Hardening de Banco (Habilitar RLS em todas as tabelas e configurar Políticas). **(Concluído - SQL Executado)**
    - [x] Padronização de Notificações (Auditoria completa de Toasts). **(Concluído - Sistema 100% Event-Driven)**
    - [x] Estabilizar Sessão no Refresh (Garantir persistência ao dar F5 no navegador).
    - [x] Corrigir Erros Críticos (ReferenceError: toast is not defined em múltiplos módulos).


---
### ✅ Fase 29: Estabilização Crítica e Segurança de Produção (Concluída)
- [x] **RLS & Recursion Fix:** Correção do loop infinito nas políticas de segurança da tabela `profiles`.
- [x] **Schema Profiles:** Adição das colunas `nome` e `telefone` na tabela `profiles` para suporte completo ao CRUD de colaboradores.
- [x] **Sincronização de Técnicos:** Implantação da desnormalização do nome do técnico nas Ordens de Serviço para persistência de exibição.
- [x] **Fix de Produção (Require Error):** Implementação de shims de compatibilidade (`global`, `process`, `require`) no `index.html` e `vite.config.js` para resolver crashes em dispositivos móveis (Safari/Vercel).
- [x] **Auditoria de Importações:** Correção de `ReferenceError` (useState, icons) em `Servicos.jsx` e `OrdensServico.jsx`.
- [x] **Versionamento Final:** Commit e Push de todas as melhorias para o repositório principal.

### ✅ Fase 30: Auditoria Técnica e PWA Pro (Concluída)
- [x] **PWA Update Prompt:** Troca de `autoUpdate` para `Prompt` com notificação de "Nova Versão" elegante (Toast).
- [x] **Performance (Lazy Loading):** Implementação de Code Splitting em todas as rotas principais.
- [x] **Segurança (RLS Hardening):** Pente-fino nas políticas de banco, protegendo dados anônimos via UUID.
- [x] **Maturidade de Código:** Limpeza de arquivos temporários e padronização da estrutura do projeto.
- [x] **Versionamento:** Sincronização final com o repositório Git.

### ✅ Fase 31: Módulo de Relatórios Estratégicos (Concluído)
- [x] **Data Aggregation:** Queries de filtragem reativa por período integrada ao hook `useOrders`.
- [x] **Relatórios UI:** Dashboard de análise com KPIs de Faturamento, Ticket Médio e Eficiência.
- [x] **Gráficos de Performance:** Barra de produtividade por técnico baseada em valor gerado.
- [x] **Multisseleção Pro:** Implementação de filtros de Status e Serviços com checkboxes (Check-all logic).
- [x] **Impressão Cirúrgica:** Refatoração de CSS global para focar apenas no grid de auditoria (A4 optimized).
- [x] **Ordenação Cronológica:** Exibição crescente por data para auditoria de linha do tempo.

### ✅ Fase 32: Flexibilidade de Preços nos Orçamentos (Concluída)
- [x] **Edição de Valor no Orçamento:** Permitir que o gestor altere o valor de um serviço manualmente no momento da criação do orçamento/OS, mesmo que exista um valor pré-definido no catálogo.
- [x] **Ajuste por Dificuldade:** Campo de entrada numérica que herda o preço padrão mas permite override manual.

### ✅ Fase 33: Controle Financeiro e Pagamentos (Concluída)
- [x] **Esquema de Pagamentos:** Adicionar colunas de controle financeiro na tabela `ordens_servico` (valor_pago, historico_pagamentos).
- [x] **Combo de Pagamento (Pop-up $):** Modal para registro de adiantamentos e saldo restante com seleção de método (PIX, Crédito, etc).
- [x] **Indicadores Financeiros:** Exibir saldo devedor e total pago nas listas de Vendas e OS.
- [x] **Flexibilidade Total:** Permitir que o serviço siga para execução mesmo sem pagamento inicial, conforme a necessidade do gestor.

---
### ✅ Fase 34: Estabilização e Customização White Label (Operador Focus) (Concluída)
- [x] **Privacidade Operacional**: Ocultação de cronômetro e notificações para o cargo de operador.
- [x] **Upload Real de Mídia**: Integração do Storage Supabase (bucket `os-photos`) para registro de execução.
- [x] **Infraestrutura**: Resolução de erros de WebSocket Realtime e limpeza de avisos de console (Router flags).
- [x] **Segurança de Dados**: Garantia de persistência de tempo decorrido mesmo com UI oculta.


---
### ✅ Fase 35: Segurança de Acesso, Gestão de Usuários e Notificações (Concluída)
- [x] **Segurança de Acesso**: Link "Esqueceu sua senha? Contate o Administrador" funcional via WhatsApp.
- [x] **Alteração de Senha**: Módulo de troca de senha (mín. 6 chars) no perfil do Operador e Gestor.
- [x] **Gestão de Equipe**: Implementação do modal "Novo Usuário" (Signup via ADM sem troca de sessão).
- [x] **Notificações Inteligentes (Sino)**: 
    - [x] Lógica de alertas proativos e retroativos para Estoque Baixo (< Mínimo Alerta).
    - [x] Interface do Sino no Header com filtro de apenas "Não Lidas" e botão "Limpar Tudo".
    - [x] Estabilização de UX: Painel limpo que some ao marcar como lido.

### ✅ Fase 36: Flexibilidade Administrativa e Edição de Valores (Concluída)
- [x] **Edição Dinâmica**: Implementar modal de ajuste individual de Preço e Garantia para cada item da OS/Orçamento.
- [x] **Recálculo em Tempo Real**: Atualização automática do Valor Total ao editar serviços.
- [x] **UX Gestão**: Centralização da funcionalidade no menu "Ações" (três pontinhos) da tela de Vendas.
- [x] **Segurança Financeira**: Bloqueio de edição para Operadores e avisos sobre pagamentos já registrados.

### ✅ Fase 37: Refinamento de Agenda e Atribuição de Técnicos (Concluída)
- [x] **Agendamento Direto**: Adicionada a opção de escolher o Técnico Responsável diretamente no modal de novo agendamento da Agenda.
- [x] **Padronização de Fluxo**: O fluxo de criação de agendamentos agora possui a mesma flexibilidade de atribuir operadores que o fluxo de aprovação de vendas.
- [x] **Desnormalização de Dados**: Garantia de que o nome do técnico seja salvo corretamente na OS para exibição instantânea.

### ✅ Fase 38: Central de Ajuda Interna (Concluída Localmente)
- [x] **Interface Premium**: Criação da página `Ajuda.jsx` com busca e categorias.
- [x] **Manuais de Treinamento**: FAQs detalhadas sobre Vendas, Agenda, Checklist e Módulo do Operador.
- [x] **Integração de Apoio**: Links de suporte e espaço para vídeo-aulas integrados ao Sidebar.

---
### ✅ Fase 39: Detalhamento Técnico e Certificação de Placa (Concluído)
- [x] **Certificado de Garantia**: Incluir a placa do veículo no layout de impressão (A4).
- [x] **Histórico do Cliente**: Implementar modal de detalhamento de serviço (Popup centralizado).
- [x] **Visibilidade 360°**: Separação de notas do gestor (`observacoes`) e do operador (`obs_tecnico`).
- [x] **Galeria Técnica**: Exibição de todas as fotos da execução no modal de detalhes.

---
*Última atualização: 07/04/2026 às 09:26 - STATUS: FASE 39 CONCLUÍDA LOCALMENTE 🚀*

### ✅ Fase 40: Integridade e Padronização de Dados (Concluído)
- [x] **Normalização de Nome**: Forçar `UPPERCASE` em todos os cadastros/edições de clientes.
- [x] **Normalização de Telefone**: Salvar apenas dígitos (remover formatos inconsistentes) para unificação.
- [x] **Prevenção de Duplicados**: Implementar verificação de telefone existente antes de novos cadastros.
- [x] **Tratamento de Erros**: Exibir alertas claros para o gestor quando houver conflito de dados.

---
*Última atualização: 07/04/2026 às 10:20 - STATUS: FASE 40 CONCLUÍDA LOCALMENTE 🚀*

### ✅ Fase 41: Ajustes e Estornos Operacionais (Concluída)
- [x] **Estorno de Pagamentos**: Permitir remoção de pagamentos incorretos com recalculo de saldo.
- [x] **Remoção de Serviços**: Permitir excluir serviços de uma OS mantendo pelo menos um item.
- [x] **Reversão de Estoque**: Devolver materiais ao estoque automaticamente ao remover serviços de OS entregues.
- [x] **Refinamento de Gatilho**: Mover a baixa definitiva de estoque apenas para o status `ENTREGUE`.

---
*Última atualização: 07/04/2026 às 14:27 - STATUS: FASE 41 CONCLUÍDA LOCALMENTE 🚀*

### ✅ Fase 42: Edição Dinâmica de Escopo (Concluído)
- [x] **Integração com Catálogo**: Permitir adicionar novos serviços a orçamentos existentes em Vendas.
- [x] **Customização Ad-Hoc**: Trazer valor e garantia padrão do catálogo com possibilidade de ajuste imediato.
- [x] **Remoção de Itens**: Permitir excluir serviços de orçamentos ou ordens não entregues.
- [x] **Trava de Segurança**: Ocultar edição para veículos já marcados como `ENTREGUE`.

---
*Última atualização: 07/04/2026 às 14:38 - STATUS: FASE 42 CONCLUÍDA LOCALMENTE 🚀*

### ✅ Fase 43: Gestão de Cancelamentos e UI Premium (Concluído)
- [x] **Novo Status**: Incluir `CANCELADO` para propostas que não evoluíram.
- [x] **Limpeza de KPIs**: Remover valores de itens cancelados do faturamento e aguardando.
- [x] **Ações Flexíveis**: Permitir "Cancelar" em propostas ativas e "Reabrir" em propostas canceladas.
- [x] **Filtro de Relatórios**: Adicionar o status cancelado para auditoria gerencial.
- [x] **UI/UX Modernization**: Substituição total de `alert()` e `confirm()` por `confirmDialog` e `toast`.

---
*Última atualização: 07/04/2026 às 15:52 - STATUS: FASE 43 CONCLUÍDA E PUSH REALIZADO 🚀*

### ✅ Fase 44: Gestão e Edição de Veículos (Concluída)
- [x] **Edição de Dados**: Permitir alterar Marca, Modelo e Placa diretamente na tela de Clientes.
- [x] **Correção de Erros**: Local centralizado para gerenciar a frota de cada cliente.
- [x] **Validação de Unicidade**: Garantir que as placas editadas mantenham a integridade do banco.
- [x] **UX Premium**: Seção dedicada "Meus Veículos" no perfil lateral do cliente.

---

### ✅ Fase 45: Sinal / Agendamento na Agenda (Concluída)
- [x] **Compromisso Financeiro**: Adicionar campo de entrada para sinal no agendamento direto.
- [x] **Fluxo Otimizado**: Registrar o valor pago já no momento da reserva.
- [x] **Integração Financeira**: Sincronizar automaticamente com o saldo devedor da OS.
- [x] **Histórico Formal**: Registro automático do sinal no histórico de pagamentos da OS.

---

### ✅ Fase 46: Refinamento da Fila Operacional (Concluída)
- [x] **Organização Cronológica**: Ordenar a fila do operador por data de agendamento crescente.
- [x] **Visibilidade de Prazos**: Exibir data e hora do agendamento nos cards da fila.
- [x] **Priorização Visual**: Destacar serviços agendados para hoje.
- [x] **UX Operacional**: Reduzir a poluição visual separando o que é imediato do que é futuro.

---

### ✅ Fase 47: Comprovante de Agendamento via WhatsApp (Concluída)
- [x] **Comunicação Transparente**: Gerar mensagem de confirmação com resumo financeiro.
- [x] **Resumo Financeiro**: Incluir Total, Sinal e Saldo Restante na mensagem.
- [x] **Integração na Agenda**: Permitir envio de WhatsApp logo após o agendamento direto.
- [x] **Padronização**: Unificar a mensagem de confirmação entre os módulos de Vendas e Agenda.

---

### ✅ Fase 48: Gestão Dinâmica de Responsáveis (Técnicos) (Concluída)
- [x] **Rastreabilidade Total**: Gravar automaticamente o ID do técnico ao finalizar OS da fila geral.
- [x] **Flexibilidade de Escala**: Permitir que gestores alterem o técnico responsável de uma OS ativa.
- [x] **Liberação de Carga**: Implementar opção de remover técnico, voltando a OS para a fila disponível.
- [x] **Interface Gestora**: Adicionar modal de atribuição rápida na lista de Ordens de Serviço.

---

### ✅ Fase 49: Galeria de Trabalhos Recentes (Concluída)
- [x] **Fase 49.1: Setup de Banco e Storage**
    - [x] Atualizar `estrutura_db.md` (Tabela `trabalhos_recentes` e RLS).
    - [x] Definir políticas de Storage (Preparação).
- [x] **Fase 49.2: Interface Base e Roteamento**
    - [x] Registro da rota `/trabalhos` no `App.jsx`.
    - [x] Adição de menu "Trabalhos" no `Sidebar.jsx`.
    - [x] Criação do esqueleto da página `Trabalhos.jsx`.
- [x] **Fase 49.3: Fluxo de Upload e Listagem**
    - [x] Implementação de upload para bucket `trabalhos-recentes`.
    - [x] Persistência no banco de dados com metadados.
    - [x] Grid responsivo de visualização.
- [x] **Fase 49.4: Gestão Avançada (Renomear e Excluir)**
    - [x] Modal de edição de título e categoria.
    - [x] Lógica de remoção física e lógica.
    - [x] Polimento Visual e Micro-animações.

---
---
### ✅ Fase 50: Módulo de Detalhamento Veicular (Ano) (Concluída)
- [x] **Infraestrutura**: Adição da coluna `ano` na tabela `veiculos` e atualização do hook `useData.js`.
- [x] **Cadastro ADM**: Inclusão do campo Ano no modal de `Novo Orçamento` e na edição de veículos em `Clientes`.
- [x] **Visibilidade Operacional**: Exibição do ano nos cards da `OperadorHome` e no cabeçalho da `ExecutorView`.
- [x] **Certificação**: Inclusão do "Ano do Veículo" no grid do `Certificado de Garantia`.

---
---
### ✅ Fase 51: UX Pro e Gestão Avançada de Clientes (Concluída)
- [x] **Otimização Operacional**: Implementação de Atualização Otimista na troca de técnicos para resposta instantânea.
- [x] **Ergonomia do Modal**: Refatoração do fechamento do modal de atribuição para evitar percepção de latência.
- [x] **Gestão de Clientes**: Implementação da exclusão de clientes com validação de serviços vinculados.
- [x] **Segurança de Dados**: Diálogo de confirmação com aviso dinâmico sobre veículos do cliente.
- [x] **UI Condicional**: Ocultação automática do botão de excluir para clientes com histórico ativo.

### ✅ Fase 52: Estabilização e Segurança de Produção (Concluída)
- [x] **Hardening de Segurança (IDOR)**: Bloqueio de acesso por ID sequencial no status do cliente (agora aceita apenas UUID Tracking Token).
- [x] **Privacidade Operacional**: Remoção de fallbacks de telefone hardcoded para evitar vazamento de dados.
- [x] **Integridade Financeira**: Implementação de funções atômicas (RPC SQL) para registro de pagamentos, prevenindo race conditions.
- [x] **Integridade de Estoque**: Migração da lógica de baixa de estoque para o banco de dados (Atomic transaction).
- [x] **Cleanup de Ambiente**: Limpeza do arquivo `.env` removendo credenciais de teste expostas.

### ✅ Fase 53: Paginação Premium e Sincronizada (Concluída)
- [x] **Componentização**: Criação do componente reusável `Pagination.jsx` integrado ao design system.
- [x] **Clientes**: Paginação reativa no frontend, removendo o limite anterior fixo de 50 registros.
- [x] **Vendas**: Faturamento instantâneo com slice dinâmico de propostas e resets ao buscar/filtrar.
- [x] **Ordens de Serviço**: Navegação premium por páginas de O.S. ativa.
- [x] **Catálogo de Serviços**: Paginação no grid/lista de cartões de serviços do almoxarifado.
- [x] **Controle de Materiais**: Paginação no inventário de insumos.
- [x] **Relatórios**: Controle dinâmico de páginas de atividades, com ocultamento automático no print via CSS.

### ✅ Fase 54: Otimização da Fila do Operador e Auto-Início (Concluída)
- [x] **Alertas de Checklist**: Implementação de badges visuais `SEM CHECKLIST` (em vermelho com efeito pulse) e `CHECKLIST OK` (em verde) ao lado do status do veículo na fila de tarefas do operador.
- [x] **Visibilidade do Botão**: Liberação do botão "Iniciar Atividade", mantendo-o sempre visível e ativo para transição à tela de execução.
- [x] **Desobstrução do Layout**: Remoção da caixa de controle de cronômetro, play e pause interna da OS, liberando mais de 40% do espaço útil da tela em dispositivos móveis.
- [x] **Auto-Início Inteligente**: Configuração de ativação automática do status de execução da OS ao carregar a tela, caso o checklist de entrada já esteja preenchido.
- [x] **Banner Informativo**: Adicionado banner de alerta amigável na tela de execução instruindo o operador caso o veículo ainda não tenha checklist de entrada preenchido.
- [x] **Progresso Médio Inteligente**: Exibição da porcentagem de progresso real e uma barra de carregamento no card do operador. Caso a O.S. tenha múltiplos serviços, o sistema calcula dinamicamente a média matemática de todos os sub-serviços para refletir o status real.

### ✅ Fase 55: Checklist Digital Ampliado com Rolagem Unificada e Laterais Gigantes (Concluída)
- [x] **Rolagem Unificada do Formulário**: O laudo visual agora se move como uma página contínua sob uma única barra de rolagem. As imagens do veículo e o formulário lateral (relato técnico/KM/assinatura) rolam juntos de forma natural e sem scrolls independentes.
- [x] **Laterais Iguais à Superior (Destaque Máximo)**: A Lateral Esquerda e a Lateral Direita do veículo foram ampliadas para ter **exatamente a mesma dimensão massiva da Visão Superior**: altura fixa de `500px` no desktop/tablet e `340px` no mobile, com largura total (`md:col-span-2`). Isso garante proporções uniformes perfeitas e altíssima riqueza de detalhes para registrar riscos e amassados nos perfis.
- [x] **Visão Superior em Destaque**: A Visão Superior conta com altura máxima de `500px` no desktop (`340px` no mobile) de largura total (`md:col-span-2`).
- [x] **Vista Frontal e Vista Traseira Ampliadas**: Dispostas lado a lado com altura aumentada para `300px` no desktop (`220px` no mobile) para perfeita simetria.
- [x] **Design Responsivo Avançado**: No celular ou tablet vertical, o formulário de resumo se posiciona perfeitamente abaixo das imagens, e no desktop/tablet horizontal, fica fixado na lateral de forma inteligente (sticky).

---
### 🛠️ Fase 56: Hardening de Segurança, Validação de Uploads e Modularização (`useData.js`) (Concluída)
- [x] **Validação de Uploads de Mídia**: Implementar verificação rigorosa de MIME Type whitelist (apenas imagens e mídias seguras) e limite de tamanho de 10MB no envio de fotos do operador para evitar injeção de arquivos perigosos.
- [x] **Restrição de RLS para Operadores**: Ajustar política `FOR ALL` na tabela `ordens_servico`, garantindo permissão de **leitura total** (`SELECT`) para visualização da Fila Geral e atuação em emergências, e permissão controlada de **atualização** (`UPDATE`) apenas para OS ativas (bloqueando modificações em OS Concluídas/Entregues/Canceladas e negando `INSERT`/`DELETE`).
- [x] **Modularização do `useData.js`**: Refatorar o arquivo monolítico de hooks em módulos limpos especializados (`useOrders`, `useClients`, `useCatalog`, `useMaterials`, etc.) facilitando code review e escalabilidade.
- [x] **Criação Segura de Usuários**: Implementar criação de colaboradores via Admin API / Edge Function com `service_role`, garantindo que o cargo escolhido no modal (ADM/GESTOR/OPERADOR) seja persistido sem limitações do trigger padrão.

### 🎯 Fase 57: Quick Wins Competitivos & Precificação Inteligente (Sprint 1 do Roadmap) (Concluída)
- [x] **Preço Dinâmico por Classe de Veículo**: Cadastrar faixas automáticas de preços variando por porte (Hatch, Sedan, SUV, Pickup, Esportivo, Moto) sugeridas ao gestor na abertura de orçamento/OS.
- [x] **Pacotes e Combos de Serviços**: Agrupar serviços no catálogo (Ex: PPF + Ceramic Coating + Insulfilm) aplicando descontos automáticos na seleção do combo.
- [x] **QR Code Instantâneo na Recepção**: Gerar QR Code único com `tracking_token` ao abrir a OS para leitura direta e acompanhamento instantâneo pelo celular do cliente na loja.
- [x] **Dark Mode Nativo**: Adicionar comutação de tema escuro de alto contraste em todo o painel gerencial (Dashboard do Gestor).

### 📸 Fase 58: Documentação Visual Avançada & VCR (Sprint 2 do Roadmap) (Concluída)
- [x] **Fotos Antes/Depois por Serviço**: Implementar registro fotográfico comparativo obrigatório ou opcional na execução com guias de ângulos visuais (frontal, lateral, traseira).
- [x] **Laudo de Inspeção Digital (VCR - Vehicle Condition Report)**: Evoluir o checklist para gerar um laudo em PDF com fotos vinculadas por ponto de avaria assinado digitalmente e enviável por WhatsApp.
- [x] **Push Notifications PWA**: Habilitar notificações nativas em tempo real no dispositivo do operador e gestor (nova OS atribuída, alerta de estoque mínimo, aprovação de orçamento).

### 🌐 Fase 59: Portal do Cliente "Meu Veículo" & Self-Booking (Sprint 3 do Roadmap) (Concluída)
- [x] **Auto-Agendamento Online (Self-Booking)**: Página pública de reservas onde o cliente escolhe veículo, serviço e horário disponível com checagem de conflitos em tempo real e aprovação pelo gestor.
- [x] **Portal "Meu Veículo" (Área do Cliente)**: Área logada por Magic Link ou WhatsApp OTP com timeline do histórico completo da frota, fotos Antes/Depois e download de Certificados de Garantia.
- [x] **Sincronização de Calendário**: Integração de agendamentos via iCal feed com Google Calendar e Apple Calendar.

### 🔄 Fase 60: Motor de Retenção & Pós-Venda Ativo (Sprint 4 do Roadmap) (Concluída)
- [x] **Pesquisa de Satisfação (NPS Automático)**: Disparo automático de mensagem via WhatsApp 24h após entrega perguntando nota de 0 a 10 com painel analítico de Detratores, Neutros e Promotores.
- [x] **Sistema de Garantia Ativa (Lembretes Automáticos)**: Automação que calcula término/revisão de garantia e alerta gestor (30 dias antes) e cliente por WhatsApp (15 e 7 dias antes) para agendar revisão.
- [x] **Lembretes de Manutenção Periódica**: Disparos preventivos periódicos por tipo de serviço (ex: inspeção de PPF a cada 12 meses, hidrofobia do Ceramic a cada 6 meses).

### 📈 Fase 61: Inteligência Financeira (DRE) & Gamificação da Equipe (Sprint 5 do Roadmap) (Concluída)
- [x] **Dashboard Financeiro Avançado (DRE Simplificado)**: Painel gerencial detalhando Receita Bruta, Custo de Materiais deduzidos por OS, Margem de Lucro por Serviço, Lucro Líquido e Projeção de Fluxo de Caixa.
- [x] **Ranking de Técnicos (Gamificação)**: Quadro de produtividade com troféus, badges, nota NPS recebida, tempo médio de execução e dias consecutivos sem retrabalho (streak).
- [x] **Controle de Comissões de Equipe**: Módulo de cálculo automático de porcentagem ou valor fixo por serviço para remuneração transparente aos técnicos no final do período.
- [x] **Checklist de Qualidade (QA pelo Gestor)**: Vistoria rápida de acabamento e limpeza obrigatória antes de transicionar a OS de concluída para entregue.

### 🚫 Fase 62: Programas de Fidelidade e Indicação (Descontinuada - Fora do Escopo Single-Tenant)
- [~] **Programa de Indicação ("Member Get Member")**: Excluído por decisão de escopo (modelo Single-Tenant vendido completo sem recorrência/assinatura).
- [~] **Programa de Fidelidade por Pontos**: Excluído por decisão de escopo (modelo Single-Tenant).

### 🔌 Fase 63: Ecossistema Aberto, APIs e Dashboard TV 360° (Sprint 7 do Roadmap) (CONCLUÍDA)
- [x] **API Pública RESTful + Swagger**: Abertura de endpoints seguros (`GET/POST /api/orders`, etc.) com documentação interativa para integração de ERPs externos.
- [x] **Webhooks de Eventos**: Disparo de eventos em tempo real para sistemas de contabilidade e automações (OS criada, entregue, pagamento recebido).
- [x] **Marketplace de Templates e Checklists**: Biblioteca de compartilhamento de receitas de serviços, laudos e checklists customizados entre lojas da rede.
- [x] **Dashboard Gerencial na TV (Visão 360° Office)**: Painel de TV focado na gestão do escritório com métricas de faturamento do dia, ocupação dos técnicos e alertas críticos de estoque.

---

### 🛡️ Fase 64: Hardening de Segurança Pré-Produção (Auditoria Estrutural)

> **Referência completa:** [`auditoria_seguranca_v2.md`](./auditoria_seguranca_v2.md)
> Esta fase foi criada a partir da auditoria de segurança realizada em 28/07/2026, que identificou 1 achado crítico, 2 de severidade alta, 2 de severidade média e 1 de severidade baixa. Cada item abaixo referencia a seção correspondente no relatório.

#### 🔴 Prioridade CRÍTICA

- [x] **64.1 — Remoção do Modo Contingência (Backdoor de Autenticação)**
  - 📋 **Ref. Auditoria:** Achado Crítico #1 — "Modo Contingência é um Backdoor"
  - 📂 **Arquivos:** `src/contexts/AuthContext.jsx` (linhas 124-194), `src/pages/Colaboradores.jsx` (linhas 378-400)
  - 🎯 **Ação:** Remover integralmente o bloco de login por contingência que cria `fakeUser` sem JWT válido. Remover toda lógica de `localStorage` que armazena senhas em texto puro (`oss_temp_pass_*`, `oss_temp_passwords_registry`, `oss_session_contingency`). Todo login deve passar obrigatoriamente pelo Supabase Auth.
  - ⚠️ **Impacto:** Operadores que dependiam do modo offline precisarão de login real via Supabase Auth.

- [x] **64.2 — Remoção da coluna `senha_temporaria` do banco de dados**
  - 📋 **Ref. Auditoria:** Achado Crítico #1 (continuação) + Achado #4
  - 📂 **Arquivos:** `database.md` (linha 101 — `ALTER TABLE profiles ADD COLUMN senha_temporaria`)
  - 🎯 **Ação:** Executar `ALTER TABLE public.profiles DROP COLUMN IF EXISTS senha_temporaria;` no Supabase SQL Editor. Atualizar o `database.md` removendo a referência a essa coluna.
  - 🔧 **SQL de Migração:**
    ```sql
    ALTER TABLE public.profiles DROP COLUMN IF EXISTS senha_temporaria;
    ```

- [x] **64.3 — Criar Edge Function para Reset de Senha Seguro**
  - 📋 **Ref. Auditoria:** Achado Crítico #1 (recomendação de substituição)
  - 📂 **Arquivos:** Novo arquivo `supabase/functions/reset-password/index.ts`, e refatorar `src/pages/Colaboradores.jsx` (modal de reset)
  - 🎯 **Ação:** Criar Edge Function server-side que recebe `userId` + `newPassword`, valida que o caller é ADM/GESTOR via JWT, e chama `auth.admin.updateUserById()` para alterar a senha real do Supabase Auth. Substituir o modal de "senha temporária" no frontend pelo novo fluxo seguro.

#### ⚠️ Prioridade ALTA

- [x] **64.4 — Restringir RLS da tabela `pesquisas_nps`**
  - 📋 **Ref. Auditoria:** Achado #2 — "RLS da tabela pesquisas_nps totalmente aberta"
  - 📂 **Arquivos:** `database.md` (linhas 388-390)
  - 🎯 **Ação:** Manter `INSERT WITH CHECK (true)` para permitir respostas públicas via WhatsApp. Substituir `SELECT USING (true)` e `UPDATE USING (true)` por políticas restritas a ADM/GESTOR usando `check_user_role()`. Impedir que usuários anônimos leiam nomes de clientes, notas e comentários.
  - 🔧 **SQL de Migração:**
    ```sql
    DROP POLICY IF EXISTS "NPS: Leitura Pública e Autenticada" ON public.pesquisas_nps;
    DROP POLICY IF EXISTS "NPS: Inserção Pública e Autenticada" ON public.pesquisas_nps;
    DROP POLICY IF EXISTS "NPS: Atualização para todos" ON public.pesquisas_nps;
    DROP POLICY IF EXISTS "NPS: Acesso Total" ON public.pesquisas_nps;

    CREATE POLICY "NPS: Inserção Pública" ON public.pesquisas_nps FOR INSERT WITH CHECK (true);
    CREATE POLICY "NPS: Leitura Gestores" ON public.pesquisas_nps FOR SELECT USING (public.check_user_role(ARRAY['ADM','GESTOR']));
    CREATE POLICY "NPS: Atualização Gestores" ON public.pesquisas_nps FOR UPDATE USING (public.check_user_role(ARRAY['ADM','GESTOR']));
    ```

- [x] **64.5 — Proteger INSERT público em `ordens_servico` via Function SECURITY DEFINER**
  - 📋 **Ref. Auditoria:** Achado #3 — "INSERT público em ordens_servico sem restrição"
  - 📂 **Arquivos:** `database.md` (linha 270), `src/pages/SelfBooking.jsx`
  - 🎯 **Ação:** Criar função `criar_agendamento_publico()` que aceita apenas campos seguros (nome, telefone, veículo, serviço, data) e fixa `status = 'ORÇAMENTO'` e `origem = 'ONLINE'`. Remover a política de INSERT público direto e substituir a chamada no SelfBooking por um `rpc('criar_agendamento_publico', {...})`.

#### ⚠️ Prioridade MÉDIA

- [x] **64.6 — Substituir `select('*')` por campos explícitos em `profiles`**
  - 📋 **Ref. Auditoria:** Achado #4 — "select('*') em profiles expõe senha_temporaria"
  - 📂 **Arquivos:** `src/hooks/useProfiles.js` (linha 10), `src/contexts/AuthContext.jsx` (linhas 84-88, 201-205)
  - 🎯 **Ação:** Trocar todos os `select('*')` que consultam a tabela `profiles` por `select('id, nome, email, cargo, status, avatar_url, created_at')`. Garantir que nenhum campo sensível trafegue para o frontend.

- [x] **64.7 — Restringir CORS da Edge Function `create-user`**
  - 📋 **Ref. Auditoria:** Achado #5 — "CORS com Allow-Origin: *"
  - 📂 **Arquivos:** `supabase/functions/create-user/index.ts` (linha 5)
  - 🎯 **Ação:** Substituir `'Access-Control-Allow-Origin': '*'` por leitura de variável de ambiente `ALLOWED_ORIGIN` com fallback para o domínio de produção da Vercel (`https://os-system-tau.vercel.app`).

#### 🟢 Prioridade BAIXA

- [x] **64.8 — Remover `console.log` sensíveis de produção**
  - 📋 **Ref. Auditoria:** Achado #6 — "Console Logs sensíveis em produção"
  - 📂 **Arquivos:** `src/contexts/AuthContext.jsx` (linhas 55, 140, 155, 188), `src/pages/Colaboradores.jsx` (linha 383), `src/hooks/useOrders.js` (linha 71)
  - 🎯 **Ação:** Remover todos os `console.log` que exponham eventos de autenticação, tentativas de login e dados de contingência. Opcionalmente, criar wrapper `debugLog()` condicionado a `import.meta.env.DEV` para uso futuro de depuração.

---

#### 🚀 Roteiro Obrigatório de Implantação nos Clientes (Update Guide)

> **ATENÇÃO:** Como esse patch envolve segurança de banco e edge functions, você precisará seguir estes passos **em cada cliente (instância Supabase)** no momento que for atualizar o código deles:

1. **SQL Editor (No painel do cliente):**
   ```sql
   -- Remover backdoor e regras antigas
   ALTER TABLE public.profiles DROP COLUMN IF EXISTS senha_temporaria;
   DROP POLICY IF EXISTS "NPS: Leitura Pública e Autenticada" ON public.pesquisas_nps;
   DROP POLICY IF EXISTS "NPS: Inserção Pública e Autenticada" ON public.pesquisas_nps;
   DROP POLICY IF EXISTS "NPS: Atualização para todos" ON public.pesquisas_nps;
   DROP POLICY IF EXISTS "NPS: Acesso Total" ON public.pesquisas_nps;
   DROP POLICY IF EXISTS "OS: Criação Pública para Agendamento Online" ON public.ordens_servico;
   DROP POLICY IF EXISTS "Notificacoes: Criação Pública para Agendamentos" ON public.notificacoes;
   ```
2. **Rodar o novo arquivo `database.md`** completo no SQL Editor do cliente (ele criará a `criar_agendamento_publico` e as novas policies do NPS).
3. **Fazer login no projeto do cliente no terminal:** `npx supabase login` e depois `npx supabase link --project-ref ID_DO_CLIENTE`
4. **Fazer deploy das funções no ambiente do cliente:**
   - `npx supabase functions deploy create-user`
   - `npx supabase functions deploy reset-password`

---

*Última atualização: 28/07/2026 - STATUS: FASE 64 CRIADA — HARDENING DE SEGURANÇA PRÉ-PRODUÇÃO BASEADO EM AUDITORIA ESTRUTURAL 🛡️*
