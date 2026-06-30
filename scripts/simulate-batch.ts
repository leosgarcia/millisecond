import { simulateChampionship } from '../src/domain/simulation/engine'
import { prisma } from '../src/lib/prisma'
import { buildGhostTeams } from '../src/domain/simulation/ghosts'
import { DifficultyMode, DIFFICULTY_CONFIG } from '../src/domain/simulation/types'
import fs from 'fs'
import path from 'path'
import { getTeamPhilosophies } from '../src/domain/teams/philosophies'

const args = process.argv.slice(2)
const runsMatch = args.find(a => a.startsWith('--runs='))
const RUNS = runsMatch ? parseInt(runsMatch.split('=')[1], 10) : 50

async function batchSimulate() {
  console.log(`\n🏁 Iniciando Batch Simulator (${RUNS} runs por dificuldade)\n`)

  const drivers = await prisma.driver.findMany()
  const cars = await prisma.car.findMany()
  const engines = await prisma.engine.findMany()
  const tps = await prisma.teamPrincipal.findMany()
  const tds = await prisma.technicalDirector.findMany()
  const philosophies = getTeamPhilosophies()

  const bestDrivers = [...drivers].sort((a, b) => b.overall - a.overall)
  const p1 = bestDrivers[0]
  const p2 = bestDrivers[1]
  const bestCar = [...cars].sort((a, b) => b.overall - a.overall)[0]
  const bestEngine = [...engines].sort((a, b) => b.overall - a.overall)[0]
  const bestTp = [...tps].sort((a, b) => b.leadership - a.leadership)[0]
  const bestTd = [...tds].sort((a, b) => b.aerodynamics - a.aerodynamics)[0]
  const bestPhil = philosophies.find((p) => p.key === 'balanced') ?? philosophies[0]

  const circuits = (await prisma.circuit.findMany({ orderBy: { name: 'asc' }, take: 7 })).map((c) => ({
    ...c,
    countryCode: c.countryCode ?? undefined,
  })) as any

  function parseDriver(d: any) {
    return { ...d, preferredCarTraits: typeof d.preferredCarTraits === 'string' ? JSON.parse(d.preferredCarTraits) : d.preferredCarTraits, weakCarTraits: typeof d.weakCarTraits === 'string' ? JSON.parse(d.weakCarTraits) : d.weakCarTraits }
  }
  function parseEngine(e: any) {
    return { ...e, compatibleEras: typeof e.compatibleEras === 'string' ? JSON.parse(e.compatibleEras) : e.compatibleEras }
  }

  const fakePlayerTeam = {
    id: 'player-team',
    name: `${bestCar.teamName} Fake Base`,
    driverPrimary: parseDriver(p1),
    driverSecondary: parseDriver(p2),
    car: bestCar,
    engine: parseEngine(bestEngine),
    teamPrincipal: bestTp,
    technicalDirector: bestTd,
    philosophy: bestPhil,
    isGhost: false,
  } as any

  const difficulties: DifficultyMode[] = ['casual', 'standard', 'hard', 'legend']
  const globalReport: any[] = []

  for (const diff of difficulties) {
    console.log(`\nSimulando Dificuldade: ${diff.toUpperCase()}`)
    let playerWins = 0
    const championNames: Record<string, number> = {}
    let totalPlayerPoints = 0
    const popularParts: Record<string, number> = {}

    for (let i = 0; i < RUNS; i++) {
      const seed = 10000 + i + (diff.charCodeAt(0) * 100)
      const ghostTeamsData = await buildGhostTeams(seed, diff)

      const result = simulateChampionship({
        seed,
        playerTeam: fakePlayerTeam,
        ghostTeams: ghostTeamsData as any,
        circuits,
        difficulty: diff
      })

      const champ = result.constructorStandings[0]
      if (champ.teamId === 'player-team') {
        playerWins++
      }
      championNames[champ.teamName] = (championNames[champ.teamName] || 0) + 1
      totalPlayerPoints += result.constructorStandings.find(c => c.teamId === 'player-team')?.points || 0

      if (champ.teamId === 'player-team') {
        popularParts[bestCar.name] = (popularParts[bestCar.name] || 0) + 1
      } else {
        popularParts[champ.teamName] = (popularParts[champ.teamName] || 0) + 1
      }
    }

    const reportOutput = {
      difficulty: diff,
      playerWinRate: ((playerWins / RUNS) * 100).toFixed(1),
      playerAvgPoints: (totalPlayerPoints / RUNS).toFixed(1),
      championDistribution: Object.entries(championNames).sort((a, b) => b[1] - a[1]).map(([name, wins]) => ({ name, wins, percentage: ((wins / RUNS) * 100).toFixed(1) })),
    }
    
    globalReport.push(reportOutput)
    console.log(` -> Taxa de Vitória (Jogador Base): ${reportOutput.playerWinRate}% | Média Pontos: ${reportOutput.playerAvgPoints}`)
  }

  // Exportar relatórios
  const reportsDir = path.join(process.cwd(), 'reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  fs.writeFileSync(path.join(reportsDir, 'balance-report.json'), JSON.stringify(globalReport, null, 2))
  
  const mdContent = `# Balance Report Multi-Difficulty\n**Date:** ${new Date().toISOString()}\n**Simulations per Diff:** ${RUNS}\n\n` + globalReport.map(r => `## ${r.difficulty.toUpperCase()}\n- **Win Rate:** ${r.playerWinRate}%\n- **Avg Points:** ${r.playerAvgPoints}\n- **Top Champs:**\n${r.championDistribution.slice(0,3).map((c: any) => `  - ${c.name}: ${c.wins} (${c.percentage}%)`).join('\n')}`).join('\n\n')
  
  fs.writeFileSync(path.join(reportsDir, 'balance-report.md'), mdContent)
  console.log(`\n✅ Relatórios salvos em /reports`)
  process.exit(0)
}

batchSimulate().catch(console.error)
