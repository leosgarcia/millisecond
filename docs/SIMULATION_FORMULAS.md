# millisecond — Fórmulas de Simulação

Este documento descreve todas as fórmulas usadas na simulação, seus pesos e justificativas de design.

---

## Funções de Fit

> Observação de balanceamento: atributos muito altos são levemente comprimidos nos componentes diretamente pilotados para evitar que poucos 99s dominem toda a temporada.

### Filosofias de equipe

As filosofias deixam de ser um bônus cosmético e passam a alterar a leitura contextual do pacote:

- `balanced`: neutra, sem inclinação forte.
- `aggressive`: ganha classificação, ritmo e ultrapassagem, mas aumenta risco e desgaste.
- `conservative`: reduz risco, melhora confiabilidade e preserva pneus.
- `qualifying_focused`: favorece pistas de baixa ultrapassagem e alta importância de grid.
- `development_focused`: começa fraca e cresce por fase da temporada, com retorno maior no fim.

Os modificadores da filosofia são aplicados por corrida com base em `raceIndex`, `totalRaces` e, quando relevante, no `circuit`. Isso mantém o motor determinístico e evita que a filosofia seja apenas um número fixo no draft.

### Track Profiles

Os circuitos podem receber um ou mais `trackProfiles` para explicitar a identidade técnica da pista sem depender apenas dos campos de demanda brutos.

Perfis disponíveis:

- `power_track`
- `street_circuit`
- `high_downforce`
- `high_speed_aero`
- `technical_flow`
- `mixed_classic`
- `tire_limited`
- `wet_prone`
- `braking_heavy`

Os perfis são usados como camada principal de contexto para `calculateCarTrackFit` e `calculateEngineTrackFit`. O `overall` continua existindo, mas como âncora leve, não como força dominante.

### `calculateCarTrackFit(car, circuit)`

Mede o quanto o carro se adapta ao circuito, priorizando o perfil de pista.

```
carTrackFit = weightedAvg([
  [overall, 0.16],
  [profileSpecificFit, 0.84],
])
```

**Regra prática por perfil:**
- `power_track`: `straightLineSpeed`, `braking`, `setupWindow`
- `street_circuit`: `slowCorner`, `mechanicalGrip`, `braking`, `setupWindow`
- `high_downforce`: `aeroEfficiency`, `slowCorner`, `mediumCorner`
- `high_speed_aero`: `aeroEfficiency`, `fastCorner`, `mediumCorner`
- `technical_flow`: `mediumCorner`, `fastCorner`, `setupWindow`, `mechanicalGrip`
- `tire_limited`: `tireWear`, `reliability`, `setupWindow`
- `braking_heavy`: `braking`, `mechanicalGrip`, `reliability`

**Justificativa:** O `overall` não deve decidir sozinho o resultado. Circuitos diferentes precisam premiar capacidades diferentes, e o perfil da pista é a forma mais estável de expressar isso sem aleatoriedade.

---

### `calculateEngineTrackFit(engine, circuit)`

Também usa `trackProfiles` como primeiro filtro de contexto.

```
engineTrackFit = weightedAvg([
  [overall, 0.20],
  [profileSpecificFit, 0.80],
])
```

**Regra prática por perfil:**
- `power_track`: `power`, `racePaceSustainability`, `qualifyingMode`
- `braking_heavy`: `torqueDelivery`, `drivability`, `reliability`
- `street_circuit`: `drivability`, `torqueDelivery`, penalidade contextual de `coolingDemand`
- `tire_limited`: `drivability`, `fuelEfficiency`, `racePaceSustainability`
- `wet_prone`: `drivability`, `torqueDelivery`, entrega suave

**Justificativa:** Motores potentes precisam aparecer mais em pistas de reta longa, enquanto circuitos travados exigem tração, entrega e confiabilidade. `coolingDemand` é sempre interpretado como risco: alto é pior.

---

### `calculateDriverCarCompatibility(driver, car)`

```
bonus = 0
Para cada trait em driver.preferredCarTraits:
  bonus += carTraits[trait] × 5        // até +5 por trait preferido
Para cada trait em driver.weakCarTraits:
  bonus -= carTraits[trait] × 5        // até -5 por trait fraco
bonus = clamp(bonus, -10, +10)
```

**Justificativa:** Pilotos como Senna preferiam carro com `stableRear`. Colocar Senna em um carro com `nervousRear` alto deve penalizá-lo.

---

### `calculateDriverPairSynergy(primary, secondary)`

```
avgTeamPlay = (primary.teamPlay + secondary.teamPlay) / 2
avgTension = (primary.politicalTension + secondary.politicalTension) / 2
synergy = (avgTeamPlay - avgTension) / 100  // -1.0 a +1.0
synergy = clamp(synergy × 5, -5, +5)        // -5 a +5
```

**Justificativa:** Alta tensão política (ex: Senna vs Prost) prejudica o campeonato de construtores porque os pilotos não colaboram.

---

### `calculateSetupFit(car, driver, td)`

```
setupFit = weightedAvg([
  [car.setupWindow, 0.4],
  [driver.technicalFeedback, 0.35],
  [td.setupUnderstanding, 0.25],
])
```

**Justificativa:** Um carro com amplo setup window + piloto com bom feedback técnico + TD experiente em setup = configuração ótima.

---

## Fórmulas de Score

### `calculateQualifyingScore`

```
QualifyingScore =
  softenElite(driver.qualifyingPace) × 0.14
+ carTrackFit × 0.31
+ engineTrackFit × 0.30
+ setupFit × 0.10
+ softenElite(driver.pressureHandling) × 0.06
+ teamOperationalBonus × 0.11

QualifyingScore = applyModifier(QualifyingScore, philosophy.qualifyingModifier)
QualifyingScore += driverCarCompatibility × 0.2
QualifyingScore = clamp(QualifyingScore, 0, 100)
```

**Pesos e Justificativa:**
- `qualifyingPace (22%)`: Uma volta de qualificação ainda é primariamente habilidade do piloto, mas não sozinha.
- `carTrackFit (31%)`: O carro precisa ser competitivo naquele traçado.
- `engineTrackFit (30%)`: Motor e modo de classificação importam mais em pistas de alta demanda.
- `setupFit (10%)`: Setup ótimo contribui significativamente.
- `pressureHandling (6%)`: Pressão de classificação.
- `teamOpBonus (11%)`: Eficiência operacional (reação rápida, engenheiros).

---

### `calculateRaceScore`

```
RaceScore =
  softenElite(driver.racePace) × 0.06
+ carTrackFit × 0.26
+ engineTrackFit × 0.33
+ softenElite(driver.tireManagement) × 0.08
+ softenElite(driver.consistency) × 0.07
+ strategyFit × 0.10
+ teamPrincipalBonus × 0.05
+ technicalDirectorBonus × 0.08

RaceScore = applyModifier(RaceScore, philosophy.raceModifier)
if isWet: RaceScore += (driver.wetSkill - 50) × 0.15   // -7.5 a +7.5
RaceScore += driverPairSynergy × 0.7 + driverCarCompatibility × 0.1
RaceScore = clamp(RaceScore, 0, 100)
```

**Pesos e Justificativa:**
- `racePace (6%)`: Velocidade sustentada é importante, mas não domina sozinha.
- `carTrackFit (26%)`: O carro ainda é o maior modulador de ritmo real.
- `engineTrackFit (33%)`: Motor e sustentabilidade do pacote importam de verdade.
- `tireManagement (8%)`: Em corridas longas, gestão de pneus é crucial.
- `consistency (7%)`: Pilotos consistentes mantêm ritmo.
- `strategyFit (10%)`: Estratégia importa (pits, agressividade).
- `TP + TD bonus (5% + 8%)`: Time de apoio importa em decisões táticas.

---

## Fórmulas de Risco

### `calculateReliabilityRisk`

```
avgReliability = (car.reliability + engine.reliability) / 2
stressedReliability = avgReliability × (1 - circuit.reliabilityStress / 200)
withPhilosophy = applyModifier(stressedReliability, philosophy.reliabilityModifier)
DNFProb = clamp(30 - withPhilosophy × 0.29) / 100
DNFProb = clamp(DNFProb, 0, 0.30)
```

**Faixa:** 0% (confiabilidade 100, sem stress) a 30% (confiabilidade mínima, alta stress)
**Justificativa:** 30% máximo de DNF é razoável historicamente.

---

### `calculateErrorRisk`

```
errorRisk = (driver.errorProneness / 100) × (circuit.driverErrorStress / 100)
errorRisk = clamp(errorRisk, 0, 0.20)
```

**Faixa:** 0% a 20%
**Justificativa:** Em Mônaco (errorStress=92) + piloto propenso a erros (70) = ~12.9% de chance de erro.

---

## Semântica dos Atributos Ambíguos

Para manter seed, docs e simulador consistentes:

- `reliability`: alto é bom.
- `tireWear`: alto é bom e representa melhor preservação dos pneus.
- `coolingDemand`: alto é ruim e aumenta a exigência de refrigeração.
- `errorProneness`: alto é ruim.
- `incidentRisk`: alto é ruim.
- `politicalTension`: alto é ruim.

**Nota importante:** `overall` não substitui leitura contextual de pista. Ele serve só como âncora para evitar extremos artificiais quando o perfil de pista é incompleto.

---

## Sistema de Pontos

| Posição | Pontos |
|---------|--------|
| 1º | 25 |
| 2º | 18 |
| 3º | 15 |
| 4º | 12 |
| 5º | 10 |
| 6º | 8 |
| 7º | 6 |
| 8º | 4 |
| 9º | 2 |
| 10º | 1 |
| 11º+ | 0 |

*Sistema atual da F1 (desde 2010), escolhido por familiaridade.*

---

## Variação Determinística

Para preservar o determinismo mas adicionar pequena variação natural:

```
QualifyingScore final = baseScore + rngRange(driverRng, -3, 3)
RaceScore final = baseScore + rngRange(driverRng, -4, 4)
```

O RNG é derivado deterministicamente:
```
driverSeed = deriveSeed(raceSeed, `r-race${raceIndex}-${teamId}-${driverId}`)
driverRng = createRng(driverSeed)
```

**Justificativa:** Variação de ±3/±4 pontos é suficiente para criar spread realista sem dominar a lógica base (scores variam de 0–100).
