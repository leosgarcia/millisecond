# millisecond — Guia de Dataset

Este documento explica como adicionar novos pilotos, carros, motores, chefes de equipe, diretores técnicos e circuitos ao jogo.

---

## Princípios do Dataset

1. **Todos os atributos são relativos entre si** — um piloto com `qualifyingPace: 100` deve ser o melhor qualificador da história (ex: Senna 1988).
2. **Não existe piloto/carro com todos os atributos máximos** — sempre há trade-offs.
3. **Use o campo `notes`** para registrar a fonte/justificativa dos ratings.
4. **Ratings preliminares devem ser marcados** com "Rating preliminar — " no campo `notes`.

---

## Adicionando um Piloto

### Critérios de Tier

| Tier | Critério |
|------|----------|
| S | Campeões mundiais de elite ou dominantes históricos (Senna, Schumacher, Prost, Clark) |
| A | Campeões mundiais ou pilotos vencedores regulares (Hill, Mansell, Berger, Coulthard) |
| B | Pilotos competitivos com vitórias ocasionais (Irvine, Herbert, Rosberg) |
| C | Pilotos de midfield / referência de lower grid |

### Template de Piloto Principal

```typescript
{
  id: 'driver-[sobrenome]',  // kebab-case, único
  name: 'Nome Completo',
  seasonYear: 1990,          // ano de referência do rating
  nationality: 'Nacionalidade',
  tier: 'A',
  role: 'primary',
  era: '90s',
  overall: 88,               // média ponderada subjetiva

  // Performance (0–100)
  qualifyingPace: 88,        // compare com Senna 1988 = 100
  racePace: 90,              // compare com Prost 1989 = 98
  wetSkill: 80,              // Senna = 100, piloto médio = 65
  tireManagement: 85,        // Prost = 98, agressivo = 60
  overtaking: 85,            // quão bem ultrapassa
  defending: 82,             // quão bem defende
  consistency: 88,           // Prost = 99, errático = 60
  adaptability: 85,          // adapta a diferentes carros/pistas
  technicalFeedback: 82,     // Lauda = 99, piloto intuitivo = 60
  pressureHandling: 88,      // sob pressão do campeonato
  aggression: 78,            // pilotagem agressiva
  teamPlay: 80,              // colaboração com o par

  // Risco (0–100, maior = mais arriscado)
  errorProneness: 15,        // < 20 = confiável, > 50 = propenso a erros
  incidentRisk: 18,          // risco de incidentes com outros
  politicalTension: 40,      // tensão política na equipe

  // Traits preferidos/fracos
  preferredCarTraits: ['stableRear'],
  weakCarTraits: ['nervousRear'],

  notes: 'Rating preliminar — descreva a fonte do rating aqui.',
}
```

### Template de Piloto Secundário

Igual ao principal, mas com `role: 'secondary'`.
Segundo pilotos tendem a ter `overall` 5–15 pontos abaixo e maior `teamPlay`.

---

## Adicionando um Carro

### Critérios de Tier

| Tier | Critério |
|------|----------|
| S | Carro dominante de uma era (MP4/4 1988, FW14B 1992) |
| A | Carro competitivo, capaz de vencer regularmente |
| B | Midfield, pode vencer em circunstâncias favoráveis |
| C | Backmarker / referência inferior |

### Template de Carro

```typescript
{
  id: 'car-[equipe-ano]',
  name: 'McLaren MP4/5',
  seasonYear: 1989,
  teamName: 'McLaren',
  tier: 'A',
  era: '80s',
  overall: 92,

  // Handling (0–100)
  aeroEfficiency: 90,       // downforce e eficiência global
  slowCorner: 82,           // chicanes, mônaco
  mediumCorner: 88,         // curvas técnicas
  fastCorner: 90,           // copse, 130R
  straightLineSpeed: 85,    // potência + drag
  mechanicalGrip: 88,       // grip independente de aero
  braking: 88,              // eficiência de frenagem

  // Confiabilidade
  tireWear: 82,             // maior = melhor preservação dos pneus; 80 = normal
  setupWindow: 80,          // 100 = muito flexível; 50 = estreito
  reliability: 88,          // menor = mais DNFs

  developmentPotential: 80, // velocidade de evolução mid-season

  // Traits (0.0 a 1.0)
  stableRear: 0.85,         // 1.0 = muito estável na traseira
  strongFrontEnd: 0.80,     // 1.0 = frente muito forte
  nervousRear: 0.15,        // 1.0 = traseira nervosa
  traction: 0.75,           // 1.0 = ótima tração

  strengths: 'Forte em curvas rápidas e médias',
  weaknesses: 'Setup estreito em pistas de baixo downforce',
  notes: 'Rating preliminar — baseado em desempenho histórico documentado.',
}
```

---

## Adicionando um Motor

```typescript
{
  id: 'engine-[fabricante-ano]',
  name: 'Honda RA109E',
  manufacturer: 'Honda',
  seasonYear: 1989,
  era: '80s',
  overall: 95,

  power: 95,                // potência máxima (HP relativo)
  torqueDelivery: 85,       // curva de torque (100 = suave e linear)
  drivability: 82,          // facilidade de condução
  fuelEfficiency: 78,       // menor = mais consumo
  energyRecovery: 0,        // 0 para eras pré-híbridas
  weightEfficiency: 85,     // menor = mais pesado
  reliability: 88,          // < 75 = muitos DNFs
  coolingDemand: 75,        // maior = sofre mais em pistas quentes
  qualifyingMode: 90,       // potência extra em modo quali
  racePaceSustainability: 88, // sustentação de potência na corrida

  compatibleEras: ['80s'],  // eras que fazem sentido para este motor

  notes: 'Rating preliminar — estimativa histórica.',
}
```

---

## Adicionando um Circuito

```typescript
{
  id: 'circuit-[nome-kebab]',
  name: 'Estoril',
  country: 'Portugal',

  // Demandas (0–100)
  straightDemand: 55,
  slowCornerDemand: 50,
  mediumCornerDemand: 70,
  fastCornerDemand: 75,
  brakingDemand: 72,
  mechanicalGripDemand: 68,
  aeroDemand: 78,
  tireStress: 65,

  // Fatores de corrida
  overtakingDifficulty: 55,
  qualifyingImportance: 68,
  rainProbability: 30,
  safetyCarProbability: 28,
  reliabilityStress: 48,
  driverErrorStress: 60,

  notes: 'Rating preliminar — circuito técnico português com bom histórico na F1.',
}
```

---

## Adicionando Equipes Fantasmas

Equipes fantasmas são montadas diretamente no código de `src/app/api/simulate/route.ts`.

Para adicionar uma nova equipe fantasma:
1. Certifique-se que todos os IDs referenciados existem no banco
2. Adicione um novo entry no array `ghostConfigs` com o novo time
3. Rode `npm run db:seed` para garantir que o banco tem os dados

---

## Balanceamento

### Regras de Ouro

1. O carro S-tier dominante deve vencer ~60-70% das corridas contra carros A-tier similares
2. Um piloto S-tier em carro B-tier ainda deve ser competitivo (top 5)
3. Um piloto C-tier em carro S-tier deve conseguir pódios ocasionais
4. A variação de ±4 pontos no score é pequena o suficiente para não inverter resultados absurdos

### Processo de Refinamento

1. Simule 10 campanhas diferentes com seeds variadas
2. Verifique se a hierarquia de equipes é plausível historicamente
3. Ajuste atributos individuais gradualmente (±5 por iteração)
4. Registre mudanças no campo `notes` com data e motivo
