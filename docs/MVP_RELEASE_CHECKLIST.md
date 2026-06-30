# MVP Release Checklist

## Status Atual
✅ Concluído. O projeto passou pelo Hardening de MVP com sucesso, mitigando problemas de UX e responsividade móvel.
Avançamos para a etapa de **Closed Beta Playtest Pack** visando deploy Vercel e feedback orgânico.

## UX & Mobile Responsiveness
✅ Tabelas com `overflow-x-auto` no layout mobile.
- [ ] A Landing Page não apresenta scroll horizontal no celular.
- [ ] O Header e o Language Switcher condensam bem.
- [ ] Na tela de Draft, os cards (pilotos, carros) ficam empilhados verticalmente e ocupam 100% da largura (`grid-cols-1`).
- [ ] O componente `BudgetMeter` (fixo no rodapé) é responsivo e não encobre botões.
- [ ] Na tela Simulate, as `ResultTable` estão com scroll horizontal ativado (`overflow-x-auto`) e não amassam colunas vitais.
- [ ] Botões de ação (Simulate, Continue, Share) possuem área de toque de no mínimo `44x44px`.

## 🌍 i18n & Conteúdo
- [ ] Os dicionários em `pt-BR` e `en` contêm as mesmas chaves (sem chaves faltantes causando renders com fallback).
- [ ] Nomes de pilotos, carros, equipes ou circuitos no banco de dados não estão traduzidos (comportamento correto).
- [ ] Mensagens de Erro, Notificações de Loading e Botões têm tradução.

## 🏎️ Simulação e Fluxo
- [ ] A tela Simulate só é alcançável se o Draft estiver 100% preenchido.
- [ ] O jogador não pode exceder o Budget Cap (1000 ms).
- [ ] Estados legados (`snapshotVersion < 2`) disparam warnings amigáveis, não erros 500 ou telas em branco.
- [ ] É exibido um sumário rápido antes de apertar "Simular Campeonato".

## 🔗 Compartilhamento
- [ ] Botão "Copiar Resumo" no final dos resultados gera um formato de texto claro e sucinto.
- [ ] Textos longos de compartilhamento testados em mensageiros comuns (WhatsApp, X, Discord).

## 🔎 SEO & Metadados
✅ Configuração básica de `metadata` em `layout.tsx`.
✅ Geração de `sitemap.xml` dinâmico cobrindo locales.
✅ Geração de `robots.txt` com restrições corretas de API.

## ⚖️ Balanceamento (MVP)
✅ Setup do script `simulate-batch.ts` para testes rápidos de milhares de runs.

## 🚀 Deploy Futuro
- [ ] A plataforma alvo suporta Node e Next.js SSR (Vercel, Railway, etc).
- [ ] Variáveis de ambiente configuradas no destino.
- [ ] Script de build validado localmente (`npm run build`).
