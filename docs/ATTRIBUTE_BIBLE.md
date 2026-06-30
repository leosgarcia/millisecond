# millisecond — Bíblia de Atributos

Este documento descreve cada atributo do jogo, seu intervalo de valores e como ele impacta a simulação.

---

## Atributos de Piloto

Todos os atributos numéricos de piloto estão no intervalo **0–100**.

| Atributo | Descrição | Uso na simulação |
|----------|-----------|-----------------|
| `overall` | Avaliação geral sintética | Ordenação/exibição |
| `qualifyingPace` | Velocidade pura em uma volta | Peso 35% no QualifyingScore |
| `racePace` | Velocidade sustentada na corrida | Peso 25% no RaceScore |
| `wetSkill` | Habilidade em condições de chuva | Bônus/penalidade quando `isWet = true` |
| `tireManagement` | Capacidade de gerir pneus | Peso 10% no RaceScore |
| `overtaking` | Capacidade de ultrapassar | Futuro: overtaking in race |
| `defending` | Capacidade de defender posição | Futuro: defending in race |
| `consistency` | Constância entre voltas | Peso 10% no RaceScore |
| `adaptability` | Adapta-se a diferentes carros/pistas | Futura mecânica de setup |
| `technicalFeedback` | Qualidade do feedback para engenheiros | Peso no setupFit |
| `pressureHandling` | Performance sob pressão do campeonato | Peso 5% no QualifyingScore |
| `aggression` | Agressividade na pilotagem | Impacto em overtaking/incidentRisk |
| `teamPlay` | Colaboração com o segundo piloto | Contribui para synergy |
| `errorProneness` | Propensão a erros de pilotagem | Base do errorRisk |
| `incidentRisk` | Risco de incidentes com outros carros | Futura mecânica de contato |
| `politicalTension` | Tensão política na equipe | Reduz sinergia do par |

### Semântica de direção

- `reliability`: alto é bom.
- `tireWear`: alto é bom e representa melhor preservação dos pneus.
- `coolingDemand`: alto é ruim e representa maior exigência de refrigeração.
- `errorProneness`: alto é ruim.
- `incidentRisk`: alto é ruim.
- `politicalTension`: alto é ruim.

### Compatibilidade de Carro

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `preferredCarTraits` | string[] | Traits de carro que este piloto aprecia — gera bônus |
| `weakCarTraits` | string[] | Traits que penalizam este piloto — gera desconto |

**Traits disponíveis:** `stableRear`, `strongFrontEnd`, `nervousRear`, `traction`

---

## Atributos de Carro (Chassi)

| Atributo | Descrição | Uso na simulação |
|----------|-----------|-----------------|
| `aeroEfficiency` | Eficiência aerodinâmica geral | carTrackFit (demanda aero) |
| `slowCorner` | Performance em curvas lentas | carTrackFit (slowCornerDemand) |
| `mediumCorner` | Performance em curvas médias | carTrackFit (mediumCornerDemand) |
| `fastCorner` | Performance em curvas rápidas | carTrackFit (fastCornerDemand) |
| `straightLineSpeed` | Velocidade em retas | carTrackFit (straightDemand) |
| `mechanicalGrip` | Grip mecânico geral | carTrackFit (mechanicalGripDemand) |
| `braking` | Eficiência de frenagem | carTrackFit (brakingDemand) |
| `tireWear` | Preservação de pneus | carTrackFit (tireStress) / futura mecânica de pit stop |
| `setupWindow` | Amplitude do espaço de setup | setupFit |
| `reliability` | Confiabilidade mecânica | reliabilityRisk |
| `developmentPotential` | Potencial de evolução mid-season | Futura curva de desenvolvimento |
| `stableRear` | 0–1: rear estável → pilotos preferem | driverCarCompatibility |
| `strongFrontEnd` | 0–1: frente forte → pilotos com esta preferência ganham bônus | driverCarCompatibility |
| `nervousRear` | 0–1: rear nervoso → pilotos com weakCarTraits nervousRear são penalizados | driverCarCompatibility |
| `traction` | 0–1: boa tração de saída de curva | driverCarCompatibility |

---

## Atributos de Motor

| Atributo | Descrição | Uso na simulação |
|----------|-----------|-----------------|
| `power` | Potência bruta | engineTrackFit (straightDemand) |
| `torqueDelivery` | Curva de torque | engineTrackFit (slowCornerDemand) |
| `drivability` | Facilidade de condução | engineTrackFit (slowCornerDemand) |
| `fuelEfficiency` | Consumo de combustível | Futura mecânica de gestão |
| `energyRecovery` | Recuperação de energia (ERS) | Futuro (era híbrida) |
| `weightEfficiency` | Peso relativo do motor | Impacto indireto no handling |
| `reliability` | Confiabilidade do motor | reliabilityRisk |
| `coolingDemand` | Exigência de refrigeração | Penalidade em pistas quentes (tireStress alto); alto é ruim |
| `qualifyingMode` | Modo de classificação | Futura mecânica |
| `racePaceSustainability` | Sustentabilidade de potência na corrida | engineTrackFit |

### Semântica de refrigeração

- O campo do dataset é `coolingDemand`, não `coolingPerformance`.
- `coolingDemand` alto significa maior exigência térmica e pior comportamento em calor.
- Quando o design pedir "performance de refrigeração", a leitura correta é o inverso de `coolingDemand`:
  - maior desempenho térmico = menor `coolingDemand`
  - maior `coolingDemand` = mais risco de penalidade em pistas quentes ou travadas
- A fórmula de simulação deve tratar esse atributo como risco contextual, não como bônus.

---

## Atributos de Chefe de Equipe

| Atributo | Descrição | Uso na simulação |
|----------|-----------|-----------------|
| `leadership` | Liderança geral | Contribui para teamPrincipalBonus |
| `politics` | Habilidade política | Futura mecânica (regulamentos, contratos) |
| `crisisManagement` | Gestão de crises | teamPrincipalBonus |
| `driverManagement` | Gestão de pilotos | teamPrincipalBonus |
| `operationalDiscipline` | Disciplina operacional | teamOperationalBonus (60%) |
| `strategicPatience` | Paciência estratégica | teamPrincipalBonus |
| `riskTolerance` | Tolerância ao risco | teamPrincipalBonus |
| `developmentCulture` | Cultura de desenvolvimento | Futura curva de dev |

### Semântica de direção

- `leadership`: alto é bom e representa comando, carisma e direção.
- `politics`: alto é bom e representa negociação, bastidores e influência institucional.
- `crisisManagement`: alto é bom e representa controle em momentos críticos.
- `driverManagement`: alto é bom e representa hierarquia, estabilidade e gestão de duplas.
- `operationalDiscipline`: alto é bom e representa execução, processos e consistência.
- `strategicPatience`: alto é bom e representa leitura de campeonato e decisões de longo prazo.
- `riskTolerance`: alto é bom e representa disposição para assumir risco competitivo, técnico ou político.
- `developmentCulture`: alto é bom e representa construção técnica e evolução do time.
- `budgetCost`: alto é ruim e representa maior custo para obter o chefe.

---

## Atributos de Diretor Técnico

| Atributo | Descrição | Uso na simulação |
|----------|-----------|-----------------|
| `aerodynamics` | Expertise em aerodinâmica | technicalDirectorBonus |
| `mechanicalDesign` | Design mecânico | technicalDirectorBonus |
| `innovation` | Capacidade de inovação | teamOperationalBonus |
| `reliabilityFocus` | Foco em confiabilidade | technicalDirectorBonus |
| `developmentSpeed` | Velocidade de desenvolvimento | Futura curva de dev |
| `regulationExploitation` | Exploração de brechas regulamentares | Futura mecânica |
| `setupUnderstanding` | Compreensão de setup | setupFit / technicalDirectorBonus |
| `riskProfile` | Perfil de risco nas decisões técnicas | Futura mecânica |

### Semântica de diretor técnico

- `aerodynamics`: alto é bom e representa eficiência de downforce, fluxo e performance de alta carga.
- `mechanicalDesign`: alto é bom e representa arquitetura mecânica, suspensão, integração e equilíbrio do carro.
- `innovation`: alto é bom e representa teto técnico, soluções criativas e capacidade disruptiva.
- `reliabilityFocus`: alto é bom e representa prioridade em robustez, durabilidade e execução segura.
- `developmentSpeed`: alto é bom e representa ritmo de evolução do pacote ao longo da temporada.
- `regulationExploitation`: alto é bom e representa leitura de regulamento, brechas e interpretação criativa.
- `setupUnderstanding`: alto é bom e representa facilidade de acerto e leitura operacional do carro.
- `riskProfile`: alto é mais radical e arriscado; valores mais baixos representam perfil mais seguro e conservador.
- `budgetCost`: alto é ruim e representa maior custo para contratar o diretor.

---

## Atributos de Circuito

Todos em **0–100**, representando a **intensidade da demanda** naquele aspecto.

| Atributo | Descrição |
|----------|-----------|
| `straightDemand` | Importância das retas (ex: Monza = 98) |
| `slowCornerDemand` | Importância de curvas lentas (ex: Mônaco = 95) |
| `mediumCornerDemand` | Importância de curvas médias |
| `fastCornerDemand` | Importância de curvas rápidas (ex: Silverstone = 92) |
| `brakingDemand` | Exigência de frenagem |
| `mechanicalGripDemand` | Importância de grip mecânico |
| `aeroDemand` | Importância de downforce aerodinâmico |
| `tireStress` | Estresse nos pneus (desgaste/temperatura) |
| `overtakingDifficulty` | Dificuldade de ultrapassagem (Mônaco = 98) |
| `qualifyingImportance` | Peso da posição de largada no resultado |
| `rainProbability` | Probabilidade de chuva (0–100 = 0%–100%) |
| `safetyCarProbability` | Probabilidade de safety car |
| `reliabilityStress` | Estresse mecânico no carro |
| `driverErrorStress` | Propensão a erros de pilotagem |

---

## Modificadores de Filosofia

Valores em **-1.0 a +1.0**, aplicados como percentual sobre o score base.

| Modificador | Efeito |
|-------------|--------|
| `qualifyingModifier` | ± sobre QualifyingScore |
| `raceModifier` | ± sobre RaceScore |
| `reliabilityModifier` | ± sobre reliabilityRisk (positivo = menos falhas) |
| `tireModifier` | ± sobre componente de gestão de pneus |
| `aggressionModifier` | ± sobre risco de incidentes |
| `developmentModifier` | ± sobre curva de desenvolvimento mid-season |

### Filosofias de equipe

- `balanced`: referência neutra.
- `aggressive`: melhora voltas rápidas e ritmo, mas aumenta risco e desgaste.
- `conservative`: reduz risco e melhora preservação.
- `qualifying_focused`: maximiza grid e é mais forte em pistas de ultrapassagem difícil.
- `development_focused`: privilegia evolução por fase da temporada e exige horizonte mais longo.

Os modificadores são contextuais por corrida. Em especial, `development_focused` cresce ao longo da temporada e `qualifying_focused` ganha peso em pistas com `qualifyingImportance` alta e `overtakingDifficulty` alta.
