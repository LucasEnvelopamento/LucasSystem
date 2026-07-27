# 🌐 Controle de Repositórios e Fluxo de Deploy Git

Este arquivo define a estrutura de versionamento e as regras obrigatórias de deploy para o ecossistema **OsSystem / LucasSystem**.

---

## 🔗 Mapeamento de Repositórios

Existem **2 (dois) repositórios Git** distintos e separados no projeto:

### 1. 🛠️ Nosso Ambiente de Desenvolvimento (OsSystem)
* **URL:** `https://github.com/cf95souza/OsSystem.git`
* **Tipo:** Ambiente de Desenvolvimento e Testes (Homologação Interna).
* **Função:** É o nosso laboratório principal. **Toda e qualquer alteração de código, nova skill, correção de bug ou melhoria DEVE ser enviada (pushed) primeiro para este repositório.**

---

### 2. 🏢 Ambiente Produtivo do Cliente (Lucas Envelopamento / LucasSystem)
* **URL:** `https://github.com/LucasEnvelopamento/LucasSystem.git`
* **Tipo:** Ambiente de PRODUÇÃO ATIVO.
* **Função:** Este repositório atende diretamente a loja do cliente (*Lucas Envelopamento*) e já está em funcionamento em ambiente produtivo com usuários reais.

---

## 🚨 REGRA DE OURO DO FLUXO DE TRABALHO (NÃO VIOLAR)

> [!CAUTION]
> **NOSSO CLIENTE SO VAMOS ENVIAR DEPOIS DE TUDO PRONTO E TESTADO!**

1. **Primeira Etapa (Desenvolvimento):** Sobe-se o código **exclusivamente** para o repositório de desenvolvimento (`https://github.com/cf95souza/OsSystem.git`).
2. **Segunda Etapa (Validação):** O código é testado rigorosamente localmente e em nosso ambiente de homologação.
3. **Terceira Etapa (Deploy Cliente):** **Somente** após a validação e confirmação de que tudo está 100% testado, sem bugs ou regressões, é que as alterações podem ser sincronizadas e enviadas (pushed) para o repositório produtivo do cliente (`https://github.com/LucasEnvelopamento/LucasSystem.git`).

---

## 📋 Resumo de Comandos Git

* **Atualizar nosso desenvolvimento:** `git push origin main` (onde `origin` aponta para `cf95souza/OsSystem.git`).
* **Enviar para o cliente (apenas quando 100% testado e aprovado):** `git push client main` (onde `client` aponta para `LucasEnvelopamento/LucasSystem.git`).
