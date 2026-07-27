# Documentação do Projeto: OsSystem

Este documento serve como o escopo central, manual técnico e registro histórico de conquistas do **OsSystem**, um PWA White Label premium voltado para estética automotiva, vitrificação, aplicação de PPF, insulfilm e detalhamento veicular.

---

## 🎨 Identidade Visual e Cores Principais

A interface do OsSystem foi projetada com base nos princípios do `ui-design-system`, utilizando uma paleta de cores sóbria, elegante e de alto contraste, com foco no verde esmeralda premium.

1. **Cor Primária (Tema Emerald):** `#059669` (Emerald 600) - Utilizada para botões de ação primária, destaques de status concluído, elementos de progresso ativos e acentos visuais importantes.
2. **Cor Secundária (Fundo e Contraste):** `#f8fafc` (Slate 50) / `#ffffff` (White) - Garante que as tabelas de dados, formulários e cartões fiquem limpos, legíveis e com excelente espaçamento.
3. **Cor de Destaque / Alertas:**
   - `#d97706` (Amber 600) - Status de Orçamento / Aguardando / Pendente.
   - `#e11d48` (Rose 600) - Status Crítico de Estoque / Cancelamentos / Alertas de Exclusão.
   - `#2563eb` (Blue 600) - Status Em Execução / Técnicos / Ações operacionais.

---

## 🛠️ Tecnologias Utilizadas

A fundação do OsSystem é moderna, rápida e altamente escalável para rodar localmente ou em nuvem com alta resiliência offline (PWA):

- **Core Frontend:** React.js (com Vite como bundler ultrarrápido).
- **Estilização:** Tailwind CSS (seguindo à risca o `ui-design-system`).
- **Ícones:** Lucide React (biblioteca elegante e padronizada).
- **Banco de Dados & Backend:** Supabase (PostgreSQL com Row Level Security (RLS) habilitado, RPC para transações financeiras atômicas e sincronização de estoque, além de canais de Realtime ativos).
- **Roteamento:** React Router DOM.
- **Notificações e Avisos:** React-Toastify (mensagens toast não-bloqueantes) e diálogos customizados e acessíveis (`confirmDialog`).

---

## 📈 Escopo de Módulos Implementados

O sistema já passou por 52 fases históricas de desenvolvimento de alta maturidade, integrando:

1. **Dashboard Executivo (no-print):** KPIs de faturamento bruto, ticket médio e taxa de conversão.
2. **Fila Operacional do Técnico (OperadorHome / ExecutorView):** Interface limpa para os profissionais visualizarem as ordens de serviço do dia por ordem cronológica.
3. **Gestão de Clientes e Veículos (Clientes):** Cadastro integrado com vinculação de múltiplos veículos e controle de histórico de ordens de serviço.
4. **Vendas e Propostas (Vendas):** Geração de orçamentos, aprovação com sinal/adiantamento e aviso automático integrado com WhatsApp API.
5. **Produção (Ordens de Serviço):** Registro de avarias via checklist interativo com lousa gráfica de assinatura, emissão de certificado de garantia impresso ou em PDF com token criptográfico (anti-IDOR).
6. **Almoxarifado (Materiais / Estoque):** Gerenciamento inteligente de consumíveis com alerta crítico automático de reposição.
7. **Relatórios Gerenciais (Relatorios):** Filtros dinâmicos de período, busca detalhada e formatação perfeita para impressão física ou PDF.

---

## 📈 Fase Concluída: Fase 53 - Paginação Premium e Sincronizada 🚀

Para evitar tabelas e grids sobrecarregados visualmente e manter a densidade profissional de dados exigida pelo `dashboard-layout` e `responsive-design`, a **Fase 53** foi completamente implementada nas 6 principais telas de dados da aplicação:
- **Clientes**: Navegação limpa removendo o limite estático anterior, com reset dinâmico da página ao buscar.
- **Vendas e Orçamentos**: Fatiamento de propostas sincronizadas com múltiplos filtros de busca e status.
- **Ordens de Serviço**: Paginação sobre as ordens gerenciadas na listagem de OS.
- **Catálogo de Serviços**: Paginação em grid de cartões com layout responsivo impecável.
- **Controle de Materiais**: Paginação no inventário de insumos com contadores dinâmicos de itens em tempo real.
- **Relatórios**: Paginação no histórico detalhado de faturamento e atividades, oculta automaticamente ao gerar impressões físicas ou PDF.

## 📈 Fase Concluída: Fase 54 - Otimização da Fila do Operador e Auto-Início 🚀

Para desobstruir o fluxo de trabalho do operador técnico e otimizar a usabilidade em smartphones, implementamos a **Fase 54**:
- **Alerta de Checklist na Fila**: Adicionados crachás claros `SEM CHECKLIST` (vermelho) e `CHECKLIST OK` (verde) nos cartões de serviço do operador, indicando instantaneamente o status do veículo.
- **Botão Iniciar Habilitado**: Botão sempre ativo e visível para o operador poder clicar e abrir os detalhes do serviço diretamente.
- **Auto-Início Inteligente**: Ao entrar nos detalhes do serviço, caso o checklist já esteja OK, o sistema ativa automaticamente o status `EM EXECUÇÃO` e inicia o cronômetro local do técnico, registrando-o atómicamente no banco.
- **Remoção de Controles Volumosos**: O cartão escuro de play, pause e status foi completamente removido de dentro da tela de execução, otimizando mais de 40% de área útil vertical em dispositivos móveis e permitindo que o técnico foque no checklist e na documentação fotográfica.
- **Aviso Informativo**: Se o checklist de entrada ainda não foi assinado, um banner em vermelho no topo da tela do operador o instrui a solicitar o preenchimento pelo gestor.
- **Progresso Médio Inteligente**: O cartão de serviço na fila de tarefas do operador agora exibe uma barra de progresso horizontal e um indicador percentual em tempo real. Se a Ordem de Serviço incluir mais de um sub-serviço detalhado, o sistema calcula dinamicamente a média aritmética de todos eles para apresentar o percentual exato do progresso geral.

## 📈 Fase Concluída: Fase 55 - Checklist Digital Ampliado com Rolagem Unificada e Laterais Gigantes 🚀

Para otimizar e aprimorar a usabilidade do técnico ao utilizar tablets (iPad ou Android) na vistoria do veículo, implementamos a **Fase 55**:
- **Rolagem Unificada do Formulário**: O laudo visual e o formulário (relato técnico, KM e assinatura) agora rolam juntos de forma fluida em um único fluxo contínuo sob uma mesma barra de rolagem.
- **Visões Laterais Equivalentes à Superior**: A Lateral Esquerda e a Lateral Direita agora ocupam toda a largura da coluna (`md:col-span-2`), com uma altura massiva de `500px` no desktop/tablet e `340px` no mobile, igualando-se exatamente à Visão Superior. Isso fornece aos técnicos a maior área possível e escala uniforme para apontar danos nos perfis do veículo.
- **Visão Superior Expandida**: A Visão Superior continua com destaque total (`md:col-span-2`) e altura máxima ampliada para `500px` no desktop e `340px` no mobile.
- **Vista Frontal e Vista Traseira Ampliadas**: Lado a lado com altura de `300px` no desktop e `220px` no mobile.
- **Design Responsivo e Sticky Lateral**: O card de resumo lateral acompanha a rolagem como um painel flutuante (sticky) no desktop, e se empilha de forma totalmente responsiva no final da página em telas menores.

## 🛡️ Fase Concluída: Fase 56 - Hardening de Segurança e Modularização
### Item Concluído: Validação de Uploads de Mídia 🚀
Para garantir a conformidade com a *BaaS Security Constitution* em um cenário de deploy serverless (Vercel + Supabase), implementamos a validação de segurança na camada de cliente antes do envio de arquivos para os buckets do Storage (`os-photos` e `trabalhos-recentes`):
- **Utilitário Dedicado (`validateMediaUpload`)**: Criado módulo limpo em `src/utils/fileValidation.js` para padronizar e modularizar a checagem de arquivos em todo o ecossistema.
- **Whitelist Rigorosa de MIME Types**: Aceitação estrita apenas de formatos de imagem seguros (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/heic`, `image/heif`), prevenindo upload de scripts, binários ou documentos perigosos.
- **Limite Máximo de Tamanho (10MB)**: Bloqueio na origem com mensagem explicativa contendo o tamanho real do arquivo, evitando exaustão de armazenamento e consumo indevido de banda no Supabase.
- **Tratamento de Erros Amigável (Event-Driven)**: Integração com o sistema global de Toasts para notificar o operador e o gestor em tempo real caso um arquivo inválido ou excedente seja selecionado.

### Item Concluído: Restrição de RLS para Operadores com Suporte a Emergências 🔒
Refinamos as políticas de segurança no banco de dados (`database.md`) para a tabela `ordens_servico`, substituindo a permissão genérica `FOR ALL` por permissões granulares de mínimo privilégio, equilibrando rigor com a realidade operacional da oficina:
- **Leitura Total de OS (`SELECT`)**: O operador mantém permissão irrestrita de leitura em `ordens_servico`, permitindo visualizar a **Fila Geral de Loja** (ordens disponíveis sem técnico atribuído) e atuar em **situações de emergência** em ordens de outros colegas da equipe.
- **Atualização Protegida (`UPDATE`)**: O operador pode assumir ou atualizar o progresso de ordens de serviço ativas. No entanto, adicionamos trava de segurança no RLS impedindo qualquer modificação por parte do operador em ordens que já estejam com status `CONCLUÍDO`, `ENTREGUE` ou `CANCELADO`.
- **Negação de Exclusão e Criação (`DELETE` / `INSERT`)**: Operadores não possuem mais permissão para criar novas ordens (função exclusiva de ADM/Gestor via Orçamento) e nem para deletar ordens de serviço do banco.
- **Políticas para Checklist e Mídias**: Adicionadas políticas formais no script SQL para as tabelas `checklist_avarias` e `os_midia`, prevenindo bloqueios acidentais e garantindo que o técnico possa registrar vistorias e fotos sem falhas de permissão.

### Item Concluído: Modularização do `useData.js` 🚀
Aplicando nossa skill especializada em evolução de arquitetura (*Lean Refactor Specialist*), eliminamos uma das maiores fontes de dívida técnica e acoplamento do projeto ao refatorar o hook monolítico `useData.js` (1.164 linhas):
- **Desmembramento em 9 Módulos Especializados**: Criamos hooks coesos dentro de `src/hooks/` isolando cada domínio de negócio: `useOrders`, `useClients`, `useQuotes`, `useVehicles`, `useCatalog`, `useProfiles`, `useInventory`, `useNotifications` (com `createNotification`) e `useWorks`.
- **Compatibilidade Retroativa Absoluta (Zero Breaking Changes)**: Mantivemos o arquivo `useData.js` funcionando como um agregador limpo (index re-export) com apenas 10 linhas, re-exportando todos os novos módulos. Com isso, os 22 arquivos e telas do ecossistema continuam importando sem qualquer alteração ou quebra visual.
- **Otimização de Build e Code-Splitting**: O bundler de produção (Vite) agora separa cada hook em chunks isolados na pasta `dist/assets/`, reduzindo o tamanho dos pacotes carregados em tempo de execução e facilitando futuras manutenções e code reviews da equipe.

### Item Concluído: Criação Segura de Usuários 🔒
Para contornar a limitação do gatilho padrão do banco de dados (`handle_new_user`), que fixa o cargo inicial de qualquer novo cadastro como `OPERADOR`, implementamos uma arquitetura híbrida de criação segura de colaboradores em `src/pages/Colaboradores.jsx`:
- **Edge Function com `service_role`**: Criada a função `supabase/functions/create-user/index.ts` que checa no servidor se o requisitante é `ADM` ou `GESTOR`, chama a Admin API (`auth.admin.createUser`) com e-mail já auto-confirmado e atualiza a tabela `profiles` de forma privilegiada com o cargo escolhido no modal (`ADM`, `GESTOR` ou `OPERADOR`).
- **Fallback Local Resiliente**: Caso a Edge Function não esteja deployada no ambiente de desenvolvimento, o frontend faz o fallback graciosamente para `signUp()` com instância anônima isolada e imediatamente aplica um `updateProfile` na sessão do ADM para garantir que o cargo escolhido seja sempre persistido sem limitação.

### Item Concluído (Fase 57): Preço Dinâmico por Classe de Veículo ⚡
Para aumentar a competitividade comercial da oficina e agilizar a elaboração de propostas padronizadas, implementamos a precificação inteligente por porte em todo o ecossistema:
- **Catálogo Inteligente (`Servicos.jsx`)**: O gestor pode opcionalmente cadastrar faixas de preço diferenciadas por porte (`Hatch`, `Sedan`, `SUV`, `Pickup`, `Esportivo`, `Moto`) na coluna `precos_por_classe` (formato JSONB). Os cards do catálogo exibem o badge reativo "⚡ X Portes" quando há precificação dinâmica configurada.
- **Identificação de Porte (`Clientes.jsx` e `NovoOrcamentoModal.jsx`)**: A entidade veículo ganhou a coluna `porte`, configurável de forma rápida com botões em formato de grid ou select no cadastro/edição do veículo.
- **Sugestão Instantânea em Orçamentos (`NovoOrcamentoModal.jsx`)**: No momento em que o gestor seleciona os serviços no orçamento ou OS (Step 3), o sistema verifica o porte do veículo selecionado e substitui automaticamente o preço base pelo preço dinâmico correspondente (com indicação visual ⚡ e preço original riscado), mantendo a total liberdade do gestor de alterar o valor customizado no Step 4 se necessário.

### Item Concluído (Fase 57): Pacotes e Combos de Serviços 🎁
Para impulsionar as vendas casadas (upselling) e oferecer descontos promocionais atrativos, criamos o sistema nativo de pacotes de serviços:
- **Agrupamento Promocional no Catálogo (`Servicos.jsx`)**: Ao criar ou editar um serviço, o gestor pode ativar a opção **"🎁 Este Serviço é um Pacote / Combo Promocional?"** (persistido nas colunas `is_combo` e `itens_combo` em JSONB).
- **Cálculo Automático de Economia em Tempo Real**: Uma lista interativa exibe todos os serviços avulsos disponíveis. Conforme o gestor marca os itens do combo, o sistema calcula dinamicamente a soma dos valores avulsos, compara com o preço promocional do combo e exibe um painel em destaque com o valor economizado e a porcentagem de desconto (ex: **`🔥 Economia para o Cliente: R$ 700,00 (15% OFF)`**).
- **Importação Inteligente de Insumos (`Zap`)**: Se os serviços inclusos no pacote exigirem materiais do almoxarifado (ex: metros de PPF e frascos de vitrificador), o gestor pode clicar no botão **"⚡ Importar Insumos do Combo"** para agregar e somar automaticamente todos os materiais e quantidades necessários diretamente para o controle de estoque do pacote.
- **Destaque Visual nos Orçamentos e Cards**: Os cards no catálogo ganharam a tag roxa **`🎁 Combo (X itens)`** e o selo **`🔥 X% OFF`**. Na abertura de orçamento (`NovoOrcamentoModal.jsx`), os combos são exibidos com selos exclusivos nas etapas de seleção e resumo, facilitando a identificação imediata pelo cliente e pela recepção.

### Item Concluído (Fase 57): QR Code Instantâneo na Recepção 📱
Para eliminar a necessidade de envio manual do link de acompanhamento e encantar o cliente no momento da entrega do veículo na recepção, implementamos o sistema de QR Code dinâmico:
- **Geração Pura e Responsiva (`QRCodeModal.jsx`)**: Criamos um modal interativo que gera o QR Code apontando diretamente para a rota pública e segura de rastreamento da OS (`/status/:tracking_token`), usando o `QRCodeSVG` da biblioteca nativa `qrcode.react`.
- **Acesso Multi-Ponto na Operação**:
  - Na listagem geral de Ordens de Serviço (`OrdensServico.jsx`), adicionamos um botão dedicado em formato de QR Code roxo ao lado da visualização de detalhes, permitindo ao gestor ou recepcionista abrir o código na tela do computador com um clique.
  - No encerramento do Checklist Visual de Recepção (`CarVisualChecklist.jsx`), ao assinar o laudo de recebimento do veículo, o modal de notificação oferece o botão **"📱 Exibir QR Code na Recepção"**, possibilitando que o cliente aponte o celular e já saia com o painel aberto.
- **Etiqueta Imprimível e Compartilhamento**: O modal inclui o botão **"🖨️ Imprimir Etiqueta"**, que gera automaticamente uma tag formatada com as informações da OS, veículo, cliente e QR Code pronta para ser impressa e fixada no envelope de chaves ou painel do veículo. Há também ações rápidas para cópia de link e disparo via WhatsApp Web/Desktop.

### Item Concluído (Fase 57): Dark Mode Nativo (Painel Gerencial) 🌙
Para proporcionar conforto visual em ambientes com pouca iluminação, reduzir a fadiga ocular em operações de turno e conferir um acabamento estético de altíssimo nível, implementamos o Modo Escuro de alto contraste em todo o painel:
- **Gestão Global de Tema (`ThemeContext.jsx`)**: Criamos um contexto persistente que salva a preferência do usuário no `localStorage` (com verificação inteligente de preferência do sistema operacional via `prefers-color-scheme`), aplicando e alternando dinamicamente a classe `dark` no elemento raiz da aplicação.
- **Alternador Rápido no Cabeçalho (`Header.jsx`)**: Um botão de comutação animado com ícones de Sol e Lua foi posicionado na barra superior fixa do painel de controle, com tooltip descritivo e transição suave.
- **Conversão Inteligente do Design System (`src/index.css` & Tailwind)**: Configurado `darkMode: 'class'` no Tailwind e adicionadas regras globais de auto-conversão. Elementos com `bg-white`, `bg-slate-50`, `border-slate-200` e `text-slate-800` (incluindo cards premium, tabelas, modais e barra lateral) são transformados automaticamente em um tema escuro profundo (`#0b0f19` para o body e `#111827` para cards e painéis), mantendo o alto contraste e a consistência visual corporativa sem necessidade de reescrever centenas de componentes.
- **Refinamento Avançado de Contraste e Acabamento (Fase 57 Concluída)**:
  - *Sombras Suaves*: Neutralizadas as sombras brancas/claras no tema escuro que causavam efeito "estourado" (halo branco ao redor de cards e botões).
  - *Grids e Tabelas*: Aplicado fundo escuro (`#0f172a`) no cabeçalho (`thead`) e rodapé (`tfoot`) de todas as tabelas, com tipografia em branco puro (`#ffffff`) de alto contraste para leitura clara das colunas.
  - *Tratamento de Hovers (`hover:bg-slate-50`)*: Implementada regra global em CSS e nos cards (como Ordens Recentes no Dashboard) para que, ao passar o mouse em modo escuro, o fundo adote um tom azul-marinho sutil (`rgba(30, 41, 59, 0.7)`), eliminando qualquer clarão branco na interface.
  - *Diagramas no Checklist Digital (`CarVisualChecklist.jsx`)*: Blindagem com estilo inline (`style={{ backgroundColor: '#ffffff' }}`) garantindo fundo branco fixo na área de desenho dos veículos em qualquer tema, preservando 100% da nitidez dos contornos pretos para marcação de avarias.
  - *QR Code da Recepção (`QRCodeModal.jsx`)*: Ajuste do cabeçalho no modo escuro para eliminar transparências leitosas, utilizando degradê dark puro e textos de alto contraste.

### Fase 58: Documentação Visual Avançada & VCR (Vehicle Condition Report) 📸
Para elevar a transparência para o proprietário do veículo, otimizar o controle técnico e prover blindagem jurídica em serviços automotivos, criamos uma suíte completa de inspeção visual:
- **Guias de Ângulos Corporativos (`photoConstants.js`)**: Padronização em 5 ângulos estratégicos: Frontal 🏎️, Lateral Esquerda 🚗, Lateral Direita 🚙, Traseira 🚘 e Detalhe/Livre 📷, segmentados nas abas de fase: **Antes (Recepção)**, **Durante (Processo)** e **Depois (Acabamento)**.
- **Galeria Guiada 360° (`PhotoGuideGallery.jsx`)**: Componente interativo que exibe dropzones tracejadas e thumbnails em alta resolução com suporte a lightbox, download e exclusão controlada.
- **Comparador Visual Interativo (`PhotoComparisonModal.jsx`)**: Modal com duplo modo de inspeção (Deslizante/Slider e Lado a Lado/Split).
- **Inspeção Digital Enriquecida (`CarVisualChecklist.jsx`)**: Os pontos de avaria marcados nos diagramas (Carro ou Moto) agora são numerados (1, 2, 3...) e interativos. Ao clicar ou criar um ponto, abre-se um modal de detalhamento que permite atribuir o **Tipo do Dano** (⚡ Risco, 🔨 Amassado, 🎨 Pintura Queimada, 🪟 Trinca, 🫧 Mancha, ❓ Outro), uma **Descrição Técnica** e **Anexar uma Foto Fotográfica Específica do Dano** (vinculada ao bucket `os-photos` e salva no array JSONB da vistoria sem necessidade de alteração de schema SQL).
- **Laudo Digital de Inspeção (VCR - `VcrReportModal.jsx`)**: Gerador de relatório A4 completo, contendo cabeçalho corporativo com token/QR Code anti-IDOR, dados completos do cliente e veículo, mapa de avarias, tabela detalhada com miniaturas das fotos dos danos, termo de consentimento formal e quadro de assinatura digital.
  - *Impressão e Exportação*: Suporte nativo a impressão física e salvar em PDF (`window.print()`).
  - *Disparo via WhatsApp*: Botão dedicado que formata um resumo profissional da vistoria e envia via API do WhatsApp Web/Mobile com o link direto de acompanhamento.
- **Push Notifications PWA & Web Audio API (`useNotifications.js` / `Header.jsx`)**: Sistema de alertas nativos em tempo real operando via Supabase Realtime no navegador e em dispositivos móveis (Android/iOS PWA e Desktop):
  - *Chime de Áudio Zero-Latência*: Implementação nativa usando **Web Audio API** (`playNotificationChime`), gerando um sinal harmônico duplo (D5 + A5) diretamente pelo oscilador do navegador sem necessidade de carregamento de arquivos MP3 externos.
  - *Disparo Push Nativo*: Integração via `ServiceWorkerRegistration.showNotification` e fallback `new Notification()` ativados por permissão interativa no Header do PWA (`[ 🔔 Ativar Alertas Push no Celular ]`).
  - *Eventos Críticos Mapeados*: 
    1. **Nova OS Atribuída**: Disparado automaticamente na aprovação de orçamento ou designação de técnico em `useQuotes.js` e `useOrders.js`.
    2. **Alerta de Estoque Mínimo**: Disparado na transição de status para `ENTREGUE` caso o consumo de materiais reduza o estoque abaixo de `minimo_alerta` na tabela `estoque_materiais`.
    3. **Aprovação de Orçamento**: Disparado sempre que o status de uma O.S. avança para `AGUARDANDO` ou `APROVADO`.
  - *Democratização de Acesso*: Desbloqueado o sino de notificações para usuários com cargo `OPERADOR`, permitindo acompanhamento instantâneo de suas novas OS atribuídas no celular.

### Fase 59: Portal do Cliente "Meu Veículo" & Self-Booking 🌐
Para transformar a captação de clientes em um fluxo 100% automatizado, transparente e que funciona 24 horas por dia, implementamos o portal público de **Auto-Agendamento Online (`/agendar` ou `/reserva`)**:
- **Pública e Isolada (`SelfBooking.jsx`)**: Página interativa sem necessidade de login prévio, acessível diretamente por link na bio do Instagram, WhatsApp da loja ou site.
- **Wizard Interativo em 5 Etapas**:
  1. *Identificação do Veículo*: Seleção de categoria por cartões (Hatch, Sedan, SUV, Pickup, Esportivo, Moto) com marca/modelo e ano.
  2. *Catálogo de Serviços e Combos*: Leitura em tempo real da tabela `servicos` via política pública, permitindo seleção múltipla de serviços individuais ou combos promocionais com estimativa de valor em tempo real.
  3. *Calendário Inteligente com Checagem de Conflitos*: Exibição dinâmica de dias úteis com seletor de horários. O sistema consulta a tabela `ordens_servico` e **bloqueia automaticamente (badge "Ocupado 🔒")** horários que já possuam agendamentos ativos na data.
  4. *Resumo e Contato*: Validação de telefone e nome do cliente com card lateral resumo.
  5. *Tela de Confirmação & WhatsApp*: Geração automática da solicitação como uma Ordem de Serviço em status `ORCAMENTO` (sujeita à aprovação da gerência), disparo imediato de alerta em tempo real e push na central de notificações do Gestor (`notificacoes`), e botão para o cliente enviar uma mensagem pré-formatada para o WhatsApp da loja.
- **Divulgação na Agenda (`Agenda.jsx`)**: Adicionado banner explicativo na aba de Agenda do painel gerencial com botão **`[ 📋 Copiar Link ]`** para o gestor copiar instantaneamente a URL do portal e enviar para clientes.
- **Portal VIP do Cliente — "Meu Veículo" (`/meu-veiculo` ou `/portal`)**:
  - *Autenticação 2-em-1 Sem Atrito (`ClientPortal.jsx`)*: Sistema seguro de login por WhatsApp OTP ou acesso instantâneo via Placa + Telefone, persistido em `localStorage` para navegação contínua no celular.
  - *Seletor de Frota ("Minha Frota")*: Filtro visual por cartões de todos os veículos vinculados ao cliente, permitindo visualização unificada ou individual por carro.
  - *Timeline Cronológica Interativa*: Exibição vertical animada de todas as visitas à loja, detalhando data, investimento, status e descrição técnica dos serviços.
  - *Evidências Fotográficas & Lightbox*: Integração com a tabela `os_midia` que exibe miniaturas das fotos Antes, Durante e Depois do serviço, abrindo em zoom de alta definição ao clicar.
  - *Garantia Digital Ativa*: Para serviços concluídos ou entregues, disponibiliza o botão **`[ 📜 Certificado de Garantia ]`** que abre o nosso laudo oficial (`CertificadoGarantia.jsx`) para impressão ou salvamento em PDF.
  - *Banner em Clientes (`Clientes.jsx`)*: Adicionada área de compartilhamento rápido no topo da listagem de clientes para envio instantâneo do link do portal pelo WhatsApp.
- **Sincronização Universal de Calendário (`calendarUtils.js` & `CalendarSyncModal.jsx`)**:
  - *Exportação Padrão RFC 5545 (iCalendar / `.ics`)*: Utilitário para formatação de datas em UTC, sanitização e montagem do feed VCALENDAR/VEVENT.
  - *Integração Web em 1 Clique*: Geração dinâmica de URLs diretas para abertura com campos preenchidos no Google Calendar (`calendar.google.com/calendar/render?action=TEMPLATE...`) e Microsoft Outlook / 365.
  - *Para o Gestor (`Agenda.jsx`)*: Botão **`[ 📅 Sincronizar Google/Apple ]`** no cabeçalho da agenda da loja que permite exportar em lote todos os futuros agendamentos e ordens em andamento em um único arquivo `.ics` para importação no celular do gerente ou gestor.
  - *Para o Cliente*: Botões de adição rápida à agenda integrados na tela final de sucesso do Auto-Agendamento Online (`SelfBooking.jsx`) e em cada card da timeline do Portal "Meu Veículo" (`ClientPortal.jsx`), evitando esquecimentos de horários.

- **Motor de Retenção & Pós-Venda Ativo — Pesquisa NPS Automática (`Fase 60`)**:
  - *Banco de Dados (`pesquisas_nps`)*: Criada tabela dedicada com chave estrangeira para `ordens_servico(id)`, armazenando nota de 0 a 10, comentário e classificação automática em Promotor (9-10), Neutro (7-8) ou Detrator (0-6), com fallback de resiliência em `localStorage` para operação offline/demo.
  - *Pública e Sem Atrito (`PesquisaNPS.jsx` & `/nps/:osId`)*: Interface interativa e otimizada para o cliente avaliar seu atendimento em 1 clique sem necessidade de login. Apresenta feedback visual dinâmico com emoticons e cores de acordo com a nota e convite final para compartilhamento no Instagram ou WhatsApp da loja.
  - *Painel Analítico Gerencial (`NpsDashboard.jsx` & `Relatorios.jsx`)*: Incorporada nova aba **`[ ⭐ NPS & Retenção Ativa (24h) ]`** na Central de Relatórios.
  - *Cálculo Real-Time de Net Promoter Score*: Medição automática da fórmula `(% Promotores - % Detratores)` indicando em tempo real se a loja opera em Zona de Excelência (75 a 100), Zona de Qualidade (50 a 74), Zona de Aperfeiçoamento (0 a 49) ou Zona Crítica (< 0).
  - *Automação de Disparo no WhatsApp*: Fila ativa que monitora serviços entregues recentemente e disponibiliza botões de disparo individual ou em massa no WhatsApp com link personalizado contendo nome e veículo do cliente prontas para envio.
  - *Alerta e Tratativa de Detratores*: Destacamento visual em vermelho pulsante para clientes que avaliaram com nota de 0 a 6, incluindo botão **`[ 🚨 Tratar Detrator ]`** que abre o WhatsApp com mensagem empática propondo agendamento de retorno para ajuste imediato e sem custo da garantia automotiva.
  - *Garantia Ativa & Revisões Preventivas (`GarantiaAtivaDashboard.jsx`)*: Incorporada a aba **`[ 🛡️ Garantias & Manutenções Preventivas ]`** na Central de Relatórios.
  - *Cálculo Inteligente de Ciclos de Vida*: Leitura dinâmica dos serviços entregues para computar o vencimento da garantia (ex: 12 meses, 3 anos, 10 anos) e emissão automática de alertas segmentados: Alerta Gestor (30 dias antes), Alerta Cliente (15 e 7 dias antes) e Alerta Urgente.
  - *Lembretes de Manutenção Preventiva*: Detecção automática de serviços que necessitam de cuidados cíclicos para preservação de performance — ex: inspeção anual de bordas e regeneração em películas PPF (12 meses) e manutenção de repelência e hidrofobia em vitrificações cerâmicas 9H (6 meses).
  - *Ações em 1 Clique*: Disparo individual ou em massa no WhatsApp com textos consultivos de pós-venda, gerando novas oportunidades de faturamento e agendamento contínuo de revisões, além do botão de acesso ao laudo digital do Certificado de Garantia.

---

## 🌐 Controle de Repositórios e Fluxo de Deploy Git

Para garantir a estabilidade do sistema em produção no nosso cliente e manter um ambiente de desenvolvimento seguro para experimentação e homologação, o ecossistema é dividido em dois repositórios oficiais (detalhados no arquivo dedicado [repositorios.md](file:///d:/Repositorios/OsSystem/repositorios.md)):

1. **Repositório de Desenvolvimento (Nosso Laboratório):**
   - **URL:** `https://github.com/cf95souza/OsSystem.git`
   - **Regra:** Todas as novas funcionalidades, testes, skills e ajustes devem ser enviados **primeiro** para este repositório (`git push origin main` / `dev`).

2. **Repositório de Produção (Ambiente do Cliente):**
   - **URL:** `https://github.com/LucasEnvelopamento/LucasSystem.git`
   - **Regra de Ouro:** **NOSSO CLIENTE SÓ VAMOS ENVIAR DEPOIS DE TUDO PRONTO E TESTADO!** Nunca subir código direto sem validação prévia. O envio para este repositório (`git push client main`) é realizado apenas após homologação total.

---
*Última revisão da documentação: 27/07/2026 - Fase 60 100% concluída (Motor de Retenção & Pós-Venda Ativo: Pesquisa NPS Automática, Central de Garantias Ativas e Lembretes de Manutenção Preventiva - Build 100% OK).*
