# Checklist do Beta Release (Closed Playtest)

Siga este checklist rigorosamente antes de compartilhar a URL pública com os 10 testadores.

## 1. Verificações Locais
- [ ] `pnpm install` finaliza sem erros críticos de peer dependency.
- [ ] `pnpm lint` não acusa violações impeditivas.
- [ ] `pnpm test` aprova os 49 testes de unidade (Budget, Determinismo, Explainer, Formulas, etc).
- [ ] `pnpm build` compila com sucesso os artefatos `.next`.
- [ ] Script de balanceamento: `npx tsx scripts/simulate-batch.ts --runs=10` salva os relatórios com sucesso em `/reports`.

## 2. Verificações de UX (Dev ou Staging Local)
- [ ] Rota raiz (`/`) redireciona ou atende o locale (`/pt-BR` ou `/en`).
- [ ] Draft completo (100% dos slots) em `/pt-BR/draft` funciona perfeitamente.
- [ ] Draft completo (100% dos slots) em `/en/draft` funciona perfeitamente com todas as tags traduzidas.
- [ ] Prevenção de Budget Cap bloqueia visualmente caso o usuário passe dos 1000ms.
- [ ] Layout fluido no dev tools responsivo (iPhone SE, Galaxy S8) sem overflow-x quebrando a tela.

## 3. Verificações de Robustez e Integração
- [ ] Fluxo segue para simulação sem *crashing* mesmo definindo no ambiente `.env.local` que `NEXT_PUBLIC_ENABLE_DB_PERSIST="false"`.
- [ ] O componente explicativo das corridas gera narrativas que condizem com o locale ativo (ex: *The team executed perfectly* no EN).
- [ ] A função "Share Summary" (Clipboard) cola texto puro (sem formatação HTML estranha) com o link ativo.
- [ ] Painel inferior exibe a frase "Enviar Feedback" apenas se `NEXT_PUBLIC_FEEDBACK_URL` existir no `.env.local`.

## 4. Verificações de SEO Básicas
- [ ] `sitemap.xml` acessível e listando as rotas `/pt-BR/draft` etc.
- [ ] `robots.txt` acessível e bloqueando `/api/`.
- [ ] `<link rel="canonical" ... />` está presente no `<head>` usando a URL oficial (`https://millisecond.vercel.app`).
