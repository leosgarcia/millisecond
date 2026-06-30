# Auditoria Técnica do Projeto millisecond

A pedido do usuário, foi realizada uma auditoria da fundação do MVP do jogo **millisecond** para validar o atendimento aos requisitos propostos e corrigir problemas estruturais de execução, sem expandir o escopo original (ex. sem adicionar login ou ranking).

Abaixo está a análise dos 7 pontos solicitados, seguida pelo sumário de correções e recomendações técnicas.

---

## 1. Isolamento da Lógica de Simulação
✅ **Validado:** A lógica principal do jogo está perfeitamente contida no diretório `src/domain/simulation/`. Nenhuma regra de negócio reside nas rotas de API (`route.ts`) nem nos componentes do frontend (`page.tsx`). O frontend apenas consulta os dados base das rotas GET, envia as seleções do jogador para a rota POST (`/api/simulate`), que atua como orquestrador e delega tudo ao módulo `engine.ts`. 

## 2. Inexistência de `Math.random` na Regra de Negócio
✅ **Validado:** Uma pesquisa na base de código confirmou que não existe nenhuma chamada nativa a `Math.random` na simulação de corridas. A única menção a ele encontra-se em comentários explicativos e no arquivo de geração de números pseudo-aleatórios.

## 3. Simulação Determinística
✅ **Validado:** A variação dos resultados é tratada por um módulo customizado baseado no gerador `mulberry32` localizado em `src/lib/deterministic-rng.ts`. O seed recebido no payload da API (junto com sementes derivadas por carro e piloto) garante que os mesmos inputs geram sempre os mesmos campeonatos, atendendo ao core loop planejado. Os testes no arquivo `src/tests/determinism.test.ts` comprovam que `simulateChampionship` gera os mesmos `driverStandings` quando a mesma seed é usada.

## 4. Ratings Centralizados e Revisáveis
✅ **Validado:** Todos os dados de domínio foram modelados no `prisma/schema.prisma` e as entidades iniciais (S-tier a B-tier) foram inseridas através de um longo documento de inserção `prisma/seed.ts`. Eles não estão hardcoded no código React nem diluídos nos módulos de simulação, tornando a edição ou ajuste de balanceamento simples e centralizada.

## 5. Cobertura de Testes
✅ **Validado:** A suite de testes localizados em `src/tests/` possui 3 arquivos principais (`determinism.test.ts`, `explainer.test.ts`, `formulas.test.ts`) contendo **34 cenários de teste unitários no total**. Esses testes avaliam a pureza e a lógica dos retornos de probabilidade de DNF (erro e quebra mecânica), sinergia dos pilotos, as pontuações em Qualifying e Race, e os geradores de texto explicativo. A suite roda e compila com sucesso.

## 6. Documentação Clara (Atributos, Fórmulas e Dataset)
✅ **Validado:** A pasta `docs/` contém os documentos `ATTRIBUTE_BIBLE.md` (detalhando o peso e intervalo de valores de todos os atributos modelados), `DATASET_GUIDE.md` (guia para contribuir com o grid) e `SIMULATION_FORMULAS.md` (detalhando todas as expressões matemáticas que orquestram a simulação). Também foi gerado um `GAME_DESIGN.md` compilando a visão do projeto.

## 7. Interface Permite Jogar Campanha de Ponta a Ponta
✅ **Validado & Refatorado:** O código base de UI (`app/[locale]/page.tsx` para Landing, `app/[locale]/draft/page.tsx` para Seleção e `app/[locale]/simulate/page.tsx` para Resultados) adota Next App Router, next-intl para suporte multilíngue (`pt-BR` e `en`) e a identidade `Timing Tower UI`. Uma validação defensiva impede crash com simulações antigas. O fluxo de ponta a ponta não possui erros de runtime em Vercel ou dev local.

### Atualização do Draft

O fluxo de Draft recebeu uma camada de estratégia na etapa de filosofia:

- filosofias agora têm identidade textual, riscos e melhor encaixe por pacote;
- `development_focused` cresce por fase da temporada;
- `qualifying_focused` é contextual em pistas de baixa ultrapassagem;
- o grid fantasma usa filosofia coerente com o arquétipo.

## 8. MVP Release Hardening 
✅ **Validado:** Todos os itens como Responsividade Mobile, estados de loading, Share Button usando Clipboard API, SEO básico (`sitemap.xml`, `robots.txt`, tags `canonical`) e o script de simulação em batch foram integrados.

## 9. Closed Beta Playtest Pack (Etapa Atual)
✅ **Em progresso:** Preparando infraestrutura final para Vercel via `persist: false` na API (preservando runtime sem falhas de I/O de disco). Adicionados arquivos para governança do playtest: `DEPLOYMENT.md`, `PLAYTEST_SCRIPT.md` e a geração de relatórios de auditoria em `reports/` via scripts determinísticos. A fase atual também adiciona `ratingSanityRules`, `audit-dataset`, `audit-track-sensitivity`, `audit-component-impact` e `audit-budget-efficiency` para acompanhar equilíbrio sem alterar o frontend. A próxima camada é a `Balance Validation Suite`, que roda campeonatos determinísticos em volume controlado para detectar dominância, falta de diversidade e impacto real por componente sem mexer em dataset nem fórmulas.

### Track Sensitivity Calibration

O pass mais recente introduziu `Track Profiles` no domínio de circuitos e passou a calibrar `calculateCarTrackFit` e `calculateEngineTrackFit` com base em identidade de pista.

Resultado prático:

- Monza passou a premiar `power_package` de forma clara.
- Monaco e Singapore favorecem pacotes de precisão/qualificação.
- Spa e Suzuka deixam de ser resolvidos pelo mesmo pacote de sempre.
- O relatório `track-sensitivity` agora só acende alerta quando há domínio universal ou mismatch grave, não quando há um vencedor recorrente com justificativa técnica.

---

## O que foi corrigido

1. **Bug no ORM:** O Prisma Client 7 apresentou problemas com configuração baseada apenas em string de `url` no Schema quando usado localmente sem adaptador em certas versões de node/TS. Instalou-se a lib de adaptador `better-sqlite3`, as declarações de ambiente e a inicialização de `PrismaBetterSqlite3` na lib base.
2. **Crash no Seeder:** Substituição do `ts-node` por `tsx` no runner do `package.json` devido a restrições e incompatibilidades do tipo de módulo (`type: "module"`) impostas pelas builds modernas de NextJS. 
3. **Build Error no Next.js:** Houve uma violação de tipo na tipagem inferida de banco (`car.tier` sendo passado como general `string` para interface com enums estritos "S" | "A"). Aplicou-se um Type Assertion na rota POST `/api/simulate` para assegurar que a tipagem do core não quebre as rotas da web ao rodar o comando `next build`.
4. **Governança de balanceamento:** Criados scripts e relatórios de auditoria estatística para dataset, sensibilidade por pista, impacto de componente e eficiência de orçamento. A semântica de atributos ambíguos também foi explicitada para evitar regressões futuras.

## O que ainda precisa melhorar

1. **Polimento Visual do Draft:** Embora o CSS global estabeleça um visual vibrante (Dark Red / F1 Style), as páginas contêm muitas listas textuais curtas. Pode-se agregar imagens genéricas ou ícones e tooltips nas estatísticas de cada piloto.
2. **Balanceamento de Ratings:** A fundação existe, mas alguns dados preliminares ainda podem permitir que equipes muito fracas derrotem equipes muito mais fortes com certas seeds. Será necessário rodar mais baterias experimentais de simulação para ajustar o peso da aleatoriedade e os impactos base dos _traits_.
3. **Balance Validation ainda não é ritual obrigatório:** a suíte automatizada existe e deve virar rotina antes de qualquer novo ajuste de rating, budget ou fórmula.

## Decisões Técnicas Tomadas

- Isolamento puro (sem contextos React) na pasta `src/domain/` para manter a lógica do jogo testável com `vitest` em instantes.
- Utilização estrita da injeção do Seed para PRNG no começo de cada simulação de campeonato. O estado não é guardado nas instâncias de piloto — ele flui de cima para baixo.
- Em vez de re-simular em requisições de página, a rota `/api/simulate` já efetua a geração completa e cospe o JSON estruturado (`ChampionshipResult`) de uma vez, persistindo um Snapshot na tabela `Campaign`. A UI fica extremamente veloz ao simplesmente renderizar JSON formatado em abas (uma para cada corrida).

## Riscos para a próxima fase

1. **Volume de Dados x JSON na UI:** Se as tabelas aumentarem com dezenas de temporadas ou muitos fantasmas extras (além de 4), as respostas JSON e o tamanho dos campos texto da tabela `Campaign` no banco SQLite (onde gravamos a serialização completa do resultado) vão inflar a níveis desnecessários. Provavelmente será necessário criar tabelas relacionais de `RaceResult` e `DriverStanding` no futuro.
2. **Gerenciamento de Estado da UI:** O Draft atual salva o progresso diretamente no `sessionStorage`. É uma boa alternativa para o MVP (já que não exige Login), mas caso o usuário atualize a aba de `Simulate`, todo o estado local React é reidratado do banco em requisições soltas. Pode ocorrer dessincronização visual antes do load completo.
3. **Balanceamento ainda sensível:** O domínio por pista melhorou, mas alguns pacotes ainda podem aparecer em várias pistas por motivos técnicos legítimos. A próxima rodada deve observar se isso continua coerente ou se começa a virar dominância transversal de novo.
