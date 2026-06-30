# millisecond — Dataset Audit

Este documento consolida a auditoria estatística do dataset histórico e as correções conservadoras aplicadas nesta rodada.

## Escopo

- `data/curated/drivers.v1.json`
- `data/curated/cars.v1.json`
- `data/curated/engines.v1.json`
- `data/curated/team_principals.v1.json`
- `data/curated/technical_directors.v1.json`

## Principais achados

1. `wetSkill` estava inflado no topo.
2. O piloto principal ainda concentrava influência demais na simulação.
3. O motor aparecia com impacto baixo demais.
4. A sensibilidade por pista ainda favorecia o mesmo pacote em todos os circuitos auditados.
5. Os papéis de apoio ainda precisavam de mais peso real para importar na temporada.

## Situação atual

- A distribuição de chuva foi trazida para uma faixa mais coerente com a meta da auditoria.
- O impacto de `engine` subiu após a ancoragem no `overall`, mas ainda é o principal ponto de observação.
- `driverPrimary` e `car` continuam acima da faixa ideal de compartilhamento de impacto, embora bem menos concentrados do que no início da fase.
- A auditoria de pista agora mostra vencedores diferentes por identidade de circuito; ainda há repetições coerentes, mas não mais domínio universal.

## Correções aplicadas nesta fase

- Redistribuição conservadora de `wetSkill` em alguns pilotos.
- Expansão do `EraSchema` para aceitar os valores de era compostos já presentes no dataset.
- Recalibração das fórmulas de `calculateQualifyingScore`, `calculateRaceScore`, `calculateCarTrackFit`, `calculateEngineTrackFit`, `calculateTeamPrincipalBonus`, `calculateTechnicalDirectorBonus` e `calculateStrategyFit`.
- Documentação explícita da semântica de `tireWear`, `coolingDemand`, `errorProneness`, `incidentRisk`, `politicalTension` e `reliability`.

## Sinais que permanecem abertos

- O impacto do piloto principal ainda está um pouco acima da faixa alvo da auditoria.
- O impacto do motor ainda pode crescer um pouco mais em circuitos de reta longa.
- Alguns pacotes ainda se repetem em mais de um circuito, mas agora por motivo técnico plausível, não por dominância cega.
- A sensibilidade por pista ainda merece ajuste fino em Monaco, onde o pacote de potência ficou competitivo demais.

## Track Profiles

Os circuitos agora podem ser lidos com `trackProfiles` explícitos ou inferidos em runtime. Isso ajuda a auditoria de pista a verificar se cada traçado está premiando o tipo certo de pacote sem depender apenas de `overall`.

## Relatórios gerados

- `reports/dataset-audit.json`
- `reports/dataset-audit.md`
- `reports/wet-skill-audit.md`
- `reports/track-sensitivity.json`
- `reports/track-sensitivity.md`
- `reports/component-impact.json`
- `reports/component-impact.md`
- `reports/budget-efficiency.json`
- `reports/budget-efficiency.md`
