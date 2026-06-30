import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { simulateChampionship } from '@/domain/simulation/engine'
import { validateBudgetCap, getBudgetBreakdown } from '@/domain/simulation/budget'
import { z } from 'zod'
import { DifficultyMode, GhostArchetype, DIFFICULTY_CONFIG } from '@/domain/simulation/types'
import { buildGhostTeams } from '@/domain/simulation/ghosts'
import { validateUniqueCanonicalDrivers } from '@/domain/simulation/validators'
import { getTeamPhilosophyById } from '@/domain/teams/philosophies'

const SimulateRequestSchema = z.object({
  seed: z.number().int().default(42),
  campaignName: z.string().default('Minha Campanha'),
  selectedTeam: z.object({
    driverPrimaryId: z.string(),
    driverSecondaryId: z.string(),
    carId: z.string(),
    engineId: z.string(),
    teamPrincipalId: z.string(),
    technicalDirectorId: z.string(),
    philosophyId: z.string(),
  }),
  difficulty: z.enum(['casual', 'standard', 'hard', 'legend']).default('standard'),
  championshipFormat: z.enum(['quick', 'standard']).default('standard'),
  persist: z.boolean().default(true),
})

function parseDriver(d: any) {
  return {
    ...d,
    preferredCarTraits: typeof d.preferredCarTraits === 'string'
      ? JSON.parse(d.preferredCarTraits)
      : d.preferredCarTraits,
    weakCarTraits: typeof d.weakCarTraits === 'string'
      ? JSON.parse(d.weakCarTraits)
      : d.weakCarTraits,
  }
}

function parseEngine(e: any) {
  return {
    ...e,
    compatibleEras: typeof e.compatibleEras === 'string'
      ? JSON.parse(e.compatibleEras)
      : e.compatibleEras,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = SimulateRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { seed, campaignName, selectedTeam, persist, difficulty, championshipFormat } = parsed.data as any

    const circuitTake = championshipFormat === 'quick' ? 7 : 12
    const ghostCount = championshipFormat === 'quick' ? 4 : 9

    // Fetch all resources
    const [
      driverPrimary,
      driverSecondary,
      car,
      engine,
      teamPrincipal,
      technicalDirector,
      circuits,
    ] = await Promise.all([
      prisma.driver.findUnique({ where: { id: selectedTeam.driverPrimaryId } }),
      prisma.driver.findUnique({ where: { id: selectedTeam.driverSecondaryId } }),
      prisma.car.findUnique({ where: { id: selectedTeam.carId } }),
      prisma.engine.findUnique({ where: { id: selectedTeam.engineId } }),
      prisma.teamPrincipal.findUnique({ where: { id: selectedTeam.teamPrincipalId } }),
      prisma.technicalDirector.findUnique({ where: { id: selectedTeam.technicalDirectorId } }),
      prisma.circuit.findMany({ orderBy: { name: 'asc' }, take: circuitTake }),
    ])

    const philosophy = getTeamPhilosophyById(selectedTeam.philosophyId)

    if (!driverPrimary || !driverSecondary || !car || !engine || !teamPrincipal || !technicalDirector || !philosophy) {
      return NextResponse.json({ error: 'One or more selected resources not found.' }, { status: 404 })
    }

    const playerTeam = {
      id: 'player-team',
      name: `${car.teamName} Lendária`,
      driverPrimary: parseDriver(driverPrimary),
      driverSecondary: parseDriver(driverSecondary),
      car,
      engine: parseEngine(engine),
      teamPrincipal,
      technicalDirector,
      philosophy,
      isGhost: false,
    } as any

    // PLAYER BUDGET CAP VALIDATION
    const playerBudgetLimit = DIFFICULTY_CONFIG[difficulty as DifficultyMode].playerBudgetLimit
    if (!validateBudgetCap(playerTeam, playerBudgetLimit)) {
      const breakdown = getBudgetBreakdown(playerTeam, playerBudgetLimit)
      return NextResponse.json({ 
        errorCode: 'budget_cap_exceeded',
        breakdown 
      }, { status: 400 })
    }

    // Build valid ghost teams from database combinations
    const excludedCanonicalDriverIds = [driverPrimary.canonicalDriverId, driverSecondary.canonicalDriverId]
    const ghostTeamsData = await buildGhostTeams(seed, difficulty as DifficultyMode, ghostCount, excludedCanonicalDriverIds)

    const validation = validateUniqueCanonicalDrivers([playerTeam, ...ghostTeamsData])
    if (!validation.valid) {
      console.error(`[Simulation] Canonical driver duplication: ${validation.duplicates.join(', ')}`)
    }

    const normalizedCircuits = circuits.map((c) => ({
      ...c,
      countryCode: c.countryCode ?? undefined,
    }))

    const result = simulateChampionship({
      seed,
      playerTeam,
      ghostTeams: ghostTeamsData as any,
      circuits: normalizedCircuits as any,
      difficulty: difficulty as DifficultyMode,
      championshipFormat: championshipFormat as any
    })

    result.campaignId = `campaign-${Date.now()}`
    result.snapshotVersion = 2

    // Include budget in result explanations for debugging/auditing
    const pBreakdown = getBudgetBreakdown(playerTeam)
    const budgetSummary = {
      used: pBreakdown.used,
      limit: pBreakdown.limit,
      remaining: pBreakdown.remaining,
    }
    result.championshipExplanations.push(
      `[BUDGET] Jogador: ${playerTeam.name} usou ${pBreakdown.used}/${pBreakdown.limit} ms.`
    )
    ghostTeamsData.forEach(g => {
      const ghostBudgetLimit = DIFFICULTY_CONFIG[difficulty as DifficultyMode].ghostBudgetLimit
      const gBreakdown = getBudgetBreakdown(g, ghostBudgetLimit)
      result.championshipExplanations.push(`[BUDGET] Fantasma (${g.archetype}): ${g.name} usou ${gBreakdown.used}/${gBreakdown.limit} ms.`)
    })

    // Save campaign only if persist is true
    if (persist) {
      try {
        await prisma.campaign.create({
          data: {
            name: campaignName,
            seed,
            raceCount: circuits.length,
            selectedTeam: JSON.stringify(selectedTeam),
            ghostTeams: JSON.stringify(ghostTeamsData.map((t) => ({ id: t.id, budget: getBudgetBreakdown(t).used }))),
            results: JSON.stringify(result),
          },
        })
      } catch (dbError) {
        console.warn('Could not persist campaign. Returning non-persisted result.', dbError)
      }
    }

    ;(result as any).budgetSummary = budgetSummary

    return NextResponse.json(result)
  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json({ error: 'Internal simulation error.' }, { status: 500 })
  }
}
