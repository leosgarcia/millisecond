/**
 * millisecond — Explainer
 *
 * Generates human-readable explanations for race and championship results.
 * All logic is purely based on actual computed scores — no template randomness.
 */

import {
  RaceEntry,
  RaceResult,
  RaceConditions,
  DriverStanding,
  ConstructorStanding,
} from './types'
import { ResolvedTeam } from './types'
import { Circuit } from '../circuits/types'
import { calculateCarTrackFit, calculateEngineTrackFit, calculateDriverPairSynergy } from './formulas'
import { getPhilosophyModifiersForRace } from '../teams/philosophies'

// ─── RACE EXPLANATIONS ────────────────────────────────────────────────────────

export function explainRaceResult(
  finishOrder: RaceEntry[],
  teams: ResolvedTeam[],
  circuit: Circuit,
  conditions: RaceConditions,
  raceContext: { raceIndex: number; totalRaces: number } = { raceIndex: 0, totalRaces: 1 }
): string[] {
  const explanations: string[] = []
  const teamMap = new Map(teams.map((t) => [t.id, t]))

  // Condition context
  if (conditions.isWet) {
    explanations.push(
      `🌧️ A corrida em ${circuit.name} foi disputada sob chuva, favorecendo pilotos com alta habilidade em piso molhado.`
    )
  }
  if (conditions.hasSafetyCar) {
    explanations.push(`🚨 Safety car entrou em pista em ${circuit.name}, comprimindo o pelotão e aumentando a tensão estratégica.`)
  }
  if (conditions.tireStressLevel === 'high') {
    explanations.push(
      `🔥 ${circuit.name} é uma pista de alto desgaste de pneus — equipes conservadoras e pilotos com boa gestão tiveram vantagem.`
    )
  }

  // Winner explanation
  const winner = finishOrder[0]
  if (winner && winner.didFinish) {
    const team = teamMap.get(winner.teamId)
    if (team) {
      const carFit = calculateCarTrackFit(team.car, circuit)
      const engineFit = calculateEngineTrackFit(team.engine, circuit)

      if (carFit > 75) {
        explanations.push(
          `🏆 ${winner.driverName} venceu em ${circuit.name}. O carro ${team.car.name} foi excepcionalmente forte nesse traçado (fit: ${carFit.toFixed(1)}).`
        )
      } else if (engineFit > 75 && circuit.straightDemand > 60) {
        explanations.push(
          `🏆 ${winner.driverName} venceu aproveitando a superioridade de potência do motor ${team.engine.name} nas retas de ${circuit.name}.`
        )
      } else {
        explanations.push(
          `🏆 ${winner.driverName} venceu em ${circuit.name} com uma combinação equilibrada de carro, motor e pilotagem.`
        )
      }
    }
  }

  // DNF explanations
  const dnfs = finishOrder.filter((e) => !e.didFinish)
  for (const dnf of dnfs) {
    const team = teamMap.get(dnf.teamId)
    if (dnf.dnfReason === 'reliability') {
      explanations.push(
        `⚠️ ${dnf.driverName} (${team?.name ?? dnf.teamName}) abandonou por problema mecânico — a confiabilidade do carro/motor pesou nesta pista exigente.`
      )
    } else if (dnf.dnfReason === 'driver-error') {
      explanations.push(
        `💥 ${dnf.driverName} cometeu um erro de pilotagem em ${circuit.name} e saiu da corrida.`
      )
    }
  }

  // Wet skill highlight
  if (conditions.isWet) {
    const top3 = finishOrder.slice(0, 3).filter((e) => e.didFinish)
    for (const entry of top3) {
      const team = teamMap.get(entry.teamId)
      const driver =
        entry.isSecondary ? team?.driverSecondary : team?.driverPrimary
      if (driver && driver.wetSkill > 80) {
        explanations.push(
          `🌊 ${driver.name} demonstrou habilidade excepcional em condições de chuva (wetSkill: ${driver.wetSkill}), contribuindo para o resultado no top 3.`
        )
      }
    }
  }

  // Pair synergy note (only for player team or prominent teams)
  for (const team of teams) {
    const synergy = calculateDriverPairSynergy(team.driverPrimary, team.driverSecondary)
    if (synergy < -3) {
      explanations.push(
        `🔥 A dupla ${team.driverPrimary.name} / ${team.driverSecondary.name} da equipe ${team.name} tem alta tensão interna (sinergia: ${synergy.toFixed(1)}), o que prejudicou o desempenho.`
      )
    } else if (synergy > 3) {
      explanations.push(
        `🤝 A dupla ${team.driverPrimary.name} / ${team.driverSecondary.name} da equipe ${team.name} trabalhou bem em conjunto (sinergia: ${synergy.toFixed(1)}).`
      )
    }
  }

  // Circuit-specific note
  if (circuit.fastCornerDemand > 75) {
    explanations.push(
      `🏎️ ${circuit.name} exige muito nas curvas rápidas — carros com alta eficiência aerodinâmica tiveram vantagem clara.`
    )
  } else if (circuit.slowCornerDemand > 75) {
    explanations.push(
      `🔄 ${circuit.name} penalizou carros com baixo grip mecânico — a tração nas chicanes foi decisiva.`
    )
  }

  const playerTeam = teams[0]
  if (playerTeam) {
    const modifiers = getPhilosophyModifiersForRace(
      playerTeam.philosophy,
      raceContext.raceIndex,
      raceContext.totalRaces,
      circuit
    )

    if (playerTeam.philosophy.key === 'aggressive' && (modifiers.raceModifier > 0 || modifiers.errorRiskModifier > 0)) {
      explanations.push('⚡ A filosofia agressiva aumentou o ritmo, mas também elevou o risco de erro e abandono.')
    } else if (playerTeam.philosophy.key === 'conservative' && (modifiers.reliabilityModifier > 0 || modifiers.tireModifier > 0)) {
      explanations.push('🛡️ A filosofia conservadora reduziu perdas e preservou pneus nesta corrida.')
    } else if (playerTeam.philosophy.key === 'qualifying_focused' && (circuit.qualifyingImportance > 70 || circuit.overtakingDifficulty > 70)) {
      explanations.push('🎯 O foco em classificação converteu posição de largada em vantagem real nesta pista.')
    } else if (playerTeam.philosophy.key === 'development_focused') {
      const phase = raceContext.raceIndex < 4 ? 'early' : raceContext.raceIndex < 8 ? 'mid' : 'late'
      if (phase === 'early') {
        explanations.push('📈 O desenvolvimento começou devagar, sacrificando performance inicial para abrir caminho ao ganho futuro.')
      } else if (phase === 'late') {
        explanations.push('🚀 O foco em desenvolvimento começou a render na fase final da temporada.')
      }
    }
  }

  return explanations
}

// ─── CHAMPIONSHIP EXPLANATIONS ────────────────────────────────────────────────

export function explainChampionshipResult(
  driverStandings: DriverStanding[],
  constructorStandings: ConstructorStanding[],
  playerTeam: ResolvedTeam,
  races: RaceResult[]
): string[] {
  const explanations: string[] = []

  const champion = driverStandings[0]
  const constructorChampion = constructorStandings[0]

  // Champion
  if (champion) {
    explanations.push(
      `🏆 Campeão do Mundial de Pilotos: ${champion.driverName} (${champion.teamName}) com ${champion.points} pontos e ${champion.wins} vitória(s).`
    )
  }

  // Constructor champion
  if (constructorChampion) {
    explanations.push(
      `🏆 Campeão do Mundial de Construtores: ${constructorChampion.teamName} com ${constructorChampion.points} pontos.`
    )
  }

  // Player team position
  const playerDriverPrimary = driverStandings.find(
    (d) => d.teamId === playerTeam.id && !d.driverId.endsWith('-s')
  )
  const playerDriverStandingPos = driverStandings.findIndex((d) => d.teamId === playerTeam.id)
  const playerConstructorPos = constructorStandings.findIndex((c) => c.teamId === playerTeam.id)

  if (playerConstructorPos === 0) {
    explanations.push(`🥇 Sua equipe conquistou o campeonato de construtores!`)
  } else if (playerConstructorPos === 1) {
    explanations.push(
      `🥈 Sua equipe terminou em 2º no campeonato de construtores — ficou perto do título!`
    )
  } else {
    explanations.push(
      `📊 Sua equipe terminou em ${playerConstructorPos + 1}º no campeonato de construtores com ${constructorStandings[playerConstructorPos]?.points ?? 0} pontos.`
    )
  }

  // DNF analysis
  const totalRaces = races.length
  const playerPrimaryDnfs = driverStandings.find(
    (d) => d.teamId === playerTeam.id && d.driverId === playerTeam.driverPrimary.id
  )?.dnfs ?? 0

  const playerSecondaryDnfs = driverStandings.find(
    (d) => d.teamId === playerTeam.id && d.driverId === playerTeam.driverSecondary.id
  )?.dnfs ?? 0

  if (playerPrimaryDnfs > 1) {
    explanations.push(
      `⚠️ ${playerTeam.driverPrimary.name} teve ${playerPrimaryDnfs} abandono(s) ao longo do campeonato, o que custou pontos valiosos.`
    )
  }
  if (playerSecondaryDnfs > 1) {
    explanations.push(
      `⚠️ ${playerTeam.driverSecondary.name} também teve dificuldades, com ${playerSecondaryDnfs} abandono(s) no campeonato.`
    )
  }

  // Synergy note
  const synergy = calculateDriverPairSynergy(playerTeam.driverPrimary, playerTeam.driverSecondary)
  if (synergy < -2) {
    explanations.push(
      `🔥 A tensão entre ${playerTeam.driverPrimary.name} e ${playerTeam.driverSecondary.name} foi um fator limitante ao longo da temporada.`
    )
  } else if (synergy > 2) {
    explanations.push(
      `🤝 A parceria entre ${playerTeam.driverPrimary.name} e ${playerTeam.driverSecondary.name} funcionou bem, ajudando o campeonato de construtores.`
    )
  }

  // Philosophy note
  const phil = playerTeam.philosophy
  if (phil.key === 'development_focused') {
    explanations.push(
      `🧪 A filosofia "${phil.name}" priorizou evolução ao longo da temporada. Em campeonato longo, isso pode virar vantagem; em temporada curta, o custo inicial pesa mais.`
    )
  } else if (phil.reliabilityModifier > 0.05) {
    explanations.push(
      `🛡️ A filosofia "${phil.name}" priorizou confiabilidade, reduzindo abandonos mas possivelmente limitando velocidade pura.`
    )
  } else if (phil.raceModifier > 0.05) {
    explanations.push(
      `🚀 A filosofia "${phil.name}" focou em ritmo de corrida, o que pagou dividendos nas pistas mais exigentes.`
    )
  } else if (phil.aggressionModifier > 0.05) {
    explanations.push(
      `⚡ A filosofia "${phil.name}" foi agressiva — alto risco, alta recompensa ao longo da temporada.`
    )
  }

  // Second driver points note
  const secondaryStanding = driverStandings.find(
    (d) => d.teamId === playerTeam.id && d.driverId === playerTeam.driverSecondary.id
  )
  const primaryStanding = driverStandings.find(
    (d) => d.teamId === playerTeam.id && d.driverId === playerTeam.driverPrimary.id
  )

  if (secondaryStanding && primaryStanding) {
    const ratio = secondaryStanding.points / Math.max(primaryStanding.points, 1)
    if (ratio < 0.3) {
      explanations.push(
        `📉 ${playerTeam.driverSecondary.name} marcou poucos pontos (${secondaryStanding.points}) comparado ao piloto principal — isso prejudicou o campeonato de construtores.`
      )
    } else if (ratio > 0.8) {
      explanations.push(
        `✅ ${playerTeam.driverSecondary.name} foi um excelente segundo piloto, contribuindo fortemente para o campeonato de construtores.`
      )
    }
  }

  // Budget narrative
  const budget = playerTeam.driverPrimary.budgetCost + playerTeam.driverSecondary.budgetCost + playerTeam.car.budgetCost + playerTeam.engine.budgetCost + playerTeam.teamPrincipal.budgetCost + playerTeam.technicalDirector.budgetCost
  const driverCostRatio = (playerTeam.driverPrimary.budgetCost + playerTeam.driverSecondary.budgetCost) / budget
  const carEngineCostRatio = (playerTeam.car.budgetCost + playerTeam.engine.budgetCost) / budget
  const managementCostRatio = (playerTeam.teamPrincipal.budgetCost + playerTeam.technicalDirector.budgetCost) / budget

  if (driverCostRatio > 0.45) {
    explanations.push(
      `💸 Sua equipe concentrou grande parte do orçamento (${(driverCostRatio * 100).toFixed(0)}%) nos pilotos. A falta de investimento no chassi e motor limitou o teto da equipe.`
    )
  }
  if (carEngineCostRatio > 0.45 && playerTeam.driverPrimary.budgetCost < 150) {
    explanations.push(
      `💸 Vocês construíram um carro e motor extremamente caros (${(carEngineCostRatio * 100).toFixed(0)}% do orçamento), mas economizaram no piloto principal, resultando em desperdício do equipamento.`
    )
  }
  if (managementCostRatio > 0.25) {
    explanations.push(
      `🧠 O alto investimento em liderança técnica e esportiva garantiu estabilidade e maximizou as táticas de corrida.`
    )
  }

  return explanations
}
