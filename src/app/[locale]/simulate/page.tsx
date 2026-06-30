'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import AppShell from '@/components/ui/AppShell'
import SectionHeader from '@/components/ui/SectionHeader'
import ResultTable from '@/components/ui/ResultTable'
import RaceRevealModal from '@/components/ui/RaceRevealModal'
import FinalResultHero from '@/components/results/FinalResultHero'
import CampaignStatsCards from '@/components/results/CampaignStatsCards'
import TopStandingsPreview from '@/components/results/TopStandingsPreview'
import TechnicalDiagnosisPanel from '@/components/results/TechnicalDiagnosisPanel'
import RaceTimeline from '@/components/results/RaceTimeline'
import FullTablesSection from '@/components/results/FullTablesSection'
import ActionsBar from '@/components/results/ActionsBar'
import FlagEmoji from '@/components/ui/FlagEmoji'
import { formatCountryName } from '@/lib/country'
import { resolveHistoricalLivery } from '@/lib/livery'

type DriverStanding = {
  driverId: string
  driverName: string
  driverSeasonYear?: number
  driverNationalityCode?: string
  teamId: string
  teamName: string
  teamCountryCode?: string
  points: number
  wins: number
  podiums: number
  dnfs: number
  bestResult: number
}

type ConstructorStanding = {
  teamId: string
  teamName: string
  teamCountryCode?: string
  carName?: string
  carSeasonYear?: number
  carLiveryPrimaryColor?: string
  carLiverySecondaryColor?: string
  carLiveryAccentColor?: string
  points: number
  wins: number
  podiums: number
}

type RaceEntry = {
  teamId: string
  teamName: string
  teamCountryCode?: string
  driverId: string
  driverName: string
  driverSeasonYear?: number
  driverNationalityCode?: string
  isSecondary: boolean
  qualifyingScore: number
  raceScore: number
  didFinish: boolean
  dnfReason?: string
  carName?: string
  carSeasonYear?: number
  carLiveryPrimaryColor?: string
  carLiverySecondaryColor?: string
  carLiveryAccentColor?: string
}

type RaceResult = {
  circuitId: string
  circuitName: string
  circuitCountry: string
  raceNumber: number
  entries: RaceEntry[]
  qualifyingOrder: RaceEntry[]
  conditions: { isWet: boolean; hasSafetyCar: boolean; tireStressLevel: 'low' | 'medium' | 'high' }
  explanations: string[]
  podium: {
    position: number
    driverName: string
    driverDisplayName: string
    driverSeasonYear?: number
    teamName: string
    teamCountryCode?: string
    countryCode: string
    carName?: string
    carSeasonYear?: number
    carLiveryPrimaryColor?: string
    carLiverySecondaryColor?: string
    carLiveryAccentColor?: string
  }[]
}

type ChampionshipResult = {
  seed: number
  races: RaceResult[]
  driverStandings: DriverStanding[]
  constructorStandings: ConstructorStanding[]
  championshipExplanations: string[]
  diagnostics?: { season: any; explanations: any }
  snapshotVersion?: number
}

type SelectionState = {
  championshipFormat: 'quick' | 'standard'
  difficulty: 'casual' | 'standard' | 'hard' | 'legend'
  driverPrimaryId: string
  driverSecondaryId: string
  carId: string
  engineId: string
  teamPrincipalId: string
  technicalDirectorId: string
  philosophyId: string
}

function hashStringToSeed(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

function getPositionLabel(position: number, t: (key: string, params?: any) => string) {
  if (position === 1) return t('youAreConstructorsChampion')
  return t('youFinishedPosition', { position })
}

function computeDynamicStandings(races: RaceResult[], limit: number) {
  const driverMap = new Map<string, DriverStanding>()
  const constructorMap = new Map<string, ConstructorStanding>()

  if (limit === 0 || races.length === 0) return { drivers: [], constructors: [] }

  for (const entry of races[0].entries) {
    if (!constructorMap.has(entry.teamId)) {
      constructorMap.set(entry.teamId, {
        teamId: entry.teamId,
        teamName: entry.teamName,
        teamCountryCode: entry.teamCountryCode,
        carName: entry.carName,
        carSeasonYear: entry.carSeasonYear,
        carLiveryPrimaryColor: entry.carLiveryPrimaryColor,
        carLiverySecondaryColor: entry.carLiverySecondaryColor,
        carLiveryAccentColor: entry.carLiveryAccentColor,
        points: 0,
        wins: 0,
        podiums: 0,
      })
    }
    driverMap.set(entry.driverId, {
      driverId: entry.driverId,
      driverName: entry.driverName,
      driverSeasonYear: entry.driverSeasonYear,
      driverNationalityCode: entry.driverNationalityCode,
      teamId: entry.teamId,
      teamName: entry.teamName,
      teamCountryCode: entry.teamCountryCode,
      points: 0,
      wins: 0,
      podiums: 0,
      dnfs: 0,
      bestResult: 99,
    })
  }

  for (let i = 0; i < limit; i++) {
    const race = races[i]
    for (let pos = 0; pos < race.entries.length; pos++) {
      const entry = race.entries[pos]
      const pts = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1][pos] || 0

      const d = driverMap.get(entry.driverId)
      const c = constructorMap.get(entry.teamId)
      if (!d || !c) continue

      d.points += pts
      if (pos === 0) d.wins++
      if (pos < 3 && entry.didFinish) d.podiums++
      if (!entry.didFinish) d.dnfs++
      if (entry.didFinish && pos + 1 < d.bestResult) d.bestResult = pos + 1

      c.points += pts
      if (pos === 0 && !entry.isSecondary) c.wins++
      if (pos < 3 && entry.didFinish) c.podiums++
    }
  }

  return {
    drivers: Array.from(driverMap.values()).sort((a, b) => b.points - a.points || a.bestResult - b.bestResult),
    constructors: Array.from(constructorMap.values()).sort((a, b) => b.points - a.points),
  }
}

function shortSentence(text: string, maxLength = 110) {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  const firstSentence = trimmed.split(/(?<=[.!?])\s+/)[0] ?? trimmed
  if (firstSentence.length <= maxLength) return firstSentence
  return `${firstSentence.slice(0, maxLength - 1).trimEnd()}…`
}

export default function SimulatePage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('results')
  const tSim = useTranslations('Simulate')
  const tDraft = useTranslations('Draft')
  const tRev = useTranslations('raceReveal')
  const tNar = useTranslations('Narrator')

  const [draft, setDraft] = useState<SelectionState | null>(null)
  const [result, setResult] = useState<ChampionshipResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const [selectedRace, setSelectedRace] = useState(0)

  useEffect(() => {
    const stored = sessionStorage.getItem('ms-draft')
    if (!stored) {
      router.push('/draft')
      return
    }

    setDraft(JSON.parse(stored))
  }, [router])

  useEffect(() => {
    if (draft && !result && !loading && !error) {
      void handleSimulate(draft)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  async function handleSimulate(currentDraft: SelectionState) {
    setLoading(true)
    setError('')

    try {
      const seed = hashStringToSeed(JSON.stringify(currentDraft))
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed,
          campaignName: 'Campaign',
          selectedTeam: currentDraft,
          difficulty: currentDraft.difficulty || 'standard',
          championshipFormat: currentDraft.championshipFormat || 'standard',
          persist: process.env.NEXT_PUBLIC_ENABLE_DB_PERSIST === 'true',
        }),
      })

      if (!res.ok) {
        const payload = await res.json()
        if (payload.errorCode === 'budget_cap_exceeded' && payload.breakdown) {
          throw new Error(`${tDraft('budgetExceeded')}: ${payload.breakdown.used}/${payload.breakdown.limit} ms`)
        }
        throw new Error(payload.error || 'Unknown error')
      }

      const data: ChampionshipResult = await res.json()
      setResult(data)
      setSelectedRace(0)
      setRevealedCount(0)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const playerTeamId = 'player-team'
  const totalRaces = result?.races.length ?? (draft?.championshipFormat === 'quick' ? 7 : 12)
  const totalTeams = draft?.championshipFormat === 'quick' ? 5 : 10
  const isRevealing = !!result && revealedCount < result.races.length
  const budgetSummary = (result as any)?.budgetSummary as { used: number; limit: number; remaining: number } | undefined

  const dynamicStandings = useMemo(() => {
    if (!result) return null
    if (!isRevealing) {
      return { drivers: result.driverStandings, constructors: result.constructorStandings }
    }
    return computeDynamicStandings(result.races, revealedCount)
  }, [result, revealedCount, isRevealing])

  const playerConstructor = result?.constructorStandings.find((entry) => entry.teamId === playerTeamId)
  const playerDrivers = result?.driverStandings.filter((entry) => entry.teamId === playerTeamId) ?? []
  const championDriver = result?.driverStandings[0]
  const championConstructor = result?.constructorStandings[0]
  const playerConstructorPos = result ? result.constructorStandings.findIndex((entry) => entry.teamId === playerTeamId) + 1 : 0

  const playerRaceSummaries = useMemo(() => {
    if (!result) return []
    return result.races.map((race) => {
      const playerEntries = race.entries.filter((entry) => entry.teamId === playerTeamId)
      const points = playerEntries.reduce((sum, entry, index) => sum + ([25, 18, 15, 12, 10, 8, 6, 4, 2, 1][race.entries.findIndex((e) => e.driverId === entry.driverId)] || 0), 0)
      return { race, points, position: playerEntries[0]?.raceScore ?? 0 }
    })
  }, [result])

  const bestRace = [...playerRaceSummaries].sort((a, b) => b.points - a.points)[0]
  const worstRace = [...playerRaceSummaries].sort((a, b) => a.points - b.points)[0]
  const budgetEfficiency = result?.diagnostics?.season?.budgetEfficiency ?? 0
  const difficultyLabel =
    draft?.difficulty === 'casual'
      ? tDraft('diffCasual')
      : draft?.difficulty === 'hard'
        ? tDraft('diffHard')
        : draft?.difficulty === 'legend'
          ? tDraft('diffLegend')
          : tDraft('diffStandard')
  const formatLabel = draft?.championshipFormat === 'quick' ? tDraft('formatQuick') : tDraft('formatStandard')

  function handleShare() {
    if (!result || !draft || !playerConstructor) return

    const text = [
      `millisecond`,
      `${getPositionLabel(playerConstructorPos, t)}: ${playerConstructor.teamName}`,
      `${t('points')}: ${playerConstructor.points}`,
      `${t('campaignDifficulty')}: ${difficultyLabel}`,
      `${t('campaignFormat')}: ${formatLabel}`,
      `${t('budgetUsed')}: ${budgetSummary ? `${budgetSummary.used}/${budgetSummary.limit} ms` : 'N/A'}`,
      `${t('driversChampion')}: ${championDriver ? `${championDriver.driverName} ${championDriver.driverSeasonYear ?? ''} (${formatCountryName(championDriver.driverNationalityCode, locale)})` : ''}`,
      `${t('constructorsChampion')}: ${championConstructor ? `${championConstructor.teamName} (${formatCountryName(championConstructor.teamCountryCode, locale)})` : ''}`,
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const selectedRaceData = result?.races[selectedRace]
  const raceRevealCards = result?.diagnostics
    ? [
        {
          title: t('campaignStats'),
          body: shortSentence(tNar(result.diagnostics.explanations.championshipSummary.key.replace('Narrator.', '') as any, result.diagnostics.explanations.championshipSummary.params as any)),
        },
        {
          title: t('technicalDiagnosis'),
          body: shortSentence(tNar(result.diagnostics.explanations.bottleneckSummary.key.replace('Narrator.', '') as any, result.diagnostics.explanations.bottleneckSummary.params as any)),
        },
        {
          title: t('budgetEfficiency'),
          body: shortSentence(tNar(result.diagnostics.explanations.budgetSummary.key.replace('Narrator.', '') as any, result.diagnostics.explanations.budgetSummary.params as any)),
        },
        {
          title: t('decidingRace'),
          body: shortSentence(tNar(result.diagnostics.explanations.decisiveMoment.key.replace('Narrator.', '') as any, result.diagnostics.explanations.decisiveMoment.params as any)),
        },
      ]
    : []

  const finalHeroTone = playerConstructorPos === 1 ? 'victory' : playerConstructorPos <= 3 ? 'strong' : playerConstructorPos <= 5 ? 'mixed' : 'rescue'

  const playerConstructorLivery = resolveHistoricalLivery({
    name: playerConstructor?.carName,
    teamName: playerConstructor?.teamName,
    liveryPrimaryColor: playerConstructor?.carLiveryPrimaryColor,
    liverySecondaryColor: playerConstructor?.carLiverySecondaryColor,
    liveryAccentColor: playerConstructor?.carLiveryAccentColor,
  })

  if (loading && !result) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="animate-pulse font-mono text-sm uppercase tracking-[0.35em] text-[var(--accent-telemetry)]">
            {tSim('simulating')}
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <SectionHeader
        title={t('finalResult')}
        subtitle={draft ? tSim('subtitle', { races: totalRaces, teams: totalTeams }) : undefined}
      />

      {error && (
        <div className="mb-6 border border-[var(--accent-speed)] bg-[rgba(255,45,45,0.1)] p-4 text-sm font-mono uppercase text-[var(--accent-speed)]">
          {error}
        </div>
      )}

      {result && isRevealing && selectedRaceData && (
        <RaceRevealModal
          race={selectedRaceData}
          onNext={() => {
            setRevealedCount((prev) => prev + 1)
            setSelectedRace((prev) => Math.min(prev + 1, result.races.length - 1))
          }}
          onRevealAll={() => {
            setRevealedCount(result.races.length)
            setSelectedRace(result.races.length - 1)
          }}
          isLastRace={revealedCount === result.races.length - 1}
          totalRaces={result.races.length}
        />
      )}

      {result && playerConstructor && championDriver && championConstructor && (
        <div className="space-y-8">
          <FinalResultHero
            title={t('finalResult')}
            positionLabel={getPositionLabel(playerConstructorPos, t)}
            teamName={playerConstructor.teamName}
            teamCountryCode={playerConstructor.teamCountryCode}
            pointsLabel={`${playerConstructor.points} ${t('points')}`}
            difficultyLabel={difficultyLabel}
            formatLabel={formatLabel}
            budgetLabel={budgetSummary ? `${budgetSummary.used} / ${budgetSummary.limit} ms` : `${playerConstructor.points} ms`}
            championDriverName={championDriver.driverName}
            championDriverCountryCode={championDriver.driverNationalityCode}
            championDriverSeasonYear={championDriver.driverSeasonYear}
            championConstructorName={championConstructor.teamName}
            championConstructorCountryCode={championConstructor.teamCountryCode}
            championConstructorLivery={{
              primaryColor: championConstructor.carLiveryPrimaryColor,
              secondaryColor: championConstructor.carLiverySecondaryColor,
              accentColor: championConstructor.carLiveryAccentColor,
            }}
            decisiveRaceName={result.diagnostics?.season?.decisiveRaceId ? result.races.find((race) => race.circuitId === result.diagnostics!.season.decisiveRaceId)?.circuitName : undefined}
            decisiveRaceCountryCode={result.diagnostics?.season?.decisiveRaceId ? result.races.find((race) => race.circuitId === result.diagnostics!.season.decisiveRaceId)?.circuitCountry : undefined}
            pointsTitle={t('points')}
            budgetTitle={t('budgetUsed')}
            difficultyTitle={t('campaignDifficulty')}
            formatTitle={t('campaignFormat')}
            constructorsTitle={t('constructorsChampion')}
            driversTitle={t('driversChampion')}
            decisiveRaceTitle={t('decidingRace')}
            livery={playerConstructorLivery}
            tone={finalHeroTone}
          />

          <CampaignStatsCards
            stats={[
              {
                label: t('wins'),
                value: playerConstructor.wins,
                detail: t('winsDetail'),
                tone: 'speed',
              },
              {
                label: t('podiums'),
                value: playerConstructor.podiums,
                detail: t('podiumsDetail'),
                tone: 'performance',
              },
              {
                label: t('dnfs'),
                value: playerDrivers.reduce((sum, driver) => sum + driver.dnfs, 0),
                detail: t('dnfsDetail'),
                tone: 'warning',
              },
              {
                label: t('points'),
                value: playerConstructor.points,
                detail: t('constructorsTotal'),
                tone: 'telemetry',
              },
              {
                label: t('budgetEfficiency'),
                value: `${budgetEfficiency.toFixed(1)}`,
                detail: tSim('pointsPer100ms'),
                tone: 'budget',
              },
              {
                label: t('bestRace'),
                value: bestRace ? `${bestRace.race.circuitName}` : '—',
                detail: bestRace ? `${bestRace.points} ${t('points')}` : t('bestRaceDetail'),
                tone: 'telemetry',
              },
              {
                label: t('worstRace'),
                value: worstRace ? `${worstRace.race.circuitName}` : '—',
                detail: worstRace ? `${worstRace.points} ${t('points')}` : t('worstRaceDetail'),
                tone: 'warning',
              },
            ]}
          />

          <TechnicalDiagnosisPanel title={t('technicalDiagnosis')} cards={raceRevealCards} />

          <TopStandingsPreview
            titleDrivers={t('topDrivers')}
            titleConstructors={t('topConstructors')}
            locale={locale}
            topDrivers={(dynamicStandings?.drivers ?? []).slice(0, 5)}
            topConstructors={(dynamicStandings?.constructors ?? []).slice(0, 5)}
          />

          <RaceTimeline
            title={t('raceByRace')}
            races={result.races}
            selectedRaceIndex={selectedRace}
            onSelectRace={setSelectedRace}
          />

          <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
            {t('fullStandings')}
          </div>

          <FullTablesSection
            titleDrivers={t('topDrivers')}
            titleConstructors={t('topConstructors')}
            labelPos={tSim('tablePos')}
            labelDriver={tSim('tableDriver')}
            labelTeam={tSim('tableTeam')}
            labelCar={tSim('tableCar')}
            labelPoints={tSim('tablePts')}
            drivers={result.driverStandings}
            constructors={result.constructorStandings}
            playerTeamId={playerTeamId}
          />

          {selectedRaceData && (
            <section className="border border-[var(--border-subtle)] bg-[var(--background-card)] p-4">
              <div className="mb-4 flex flex-col gap-2 border-b border-[var(--border-subtle)] pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xl font-bold uppercase tracking-widest text-[var(--text-main)]">
                    <FlagEmoji code={selectedRaceData.circuitCountry} className="mr-2" /> {selectedRaceData.circuitName}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-[var(--text-muted)]">
                    {tRev('condition')}: {selectedRaceData.conditions.isWet ? tRev('wetRace') : tRev('dryRace')} · {tRev('safetyCar')}: {selectedRaceData.conditions.hasSafetyCar ? tRev('withSafetyCar') : tRev('noSafetyCar')} · {tRev('tireStress')}: {selectedRaceData.conditions.tireStressLevel === 'low' ? tRev('tireLow') : selectedRaceData.conditions.tireStressLevel === 'medium' ? tRev('tireMedium') : tRev('tireHigh')}
                  </div>
                </div>
              </div>

              <div className="mb-6 overflow-x-auto pb-4">
                <ResultTable
                  columns={[
                    { key: 'pos', label: tSim('tablePos') },
                    { key: 'driver', label: tSim('tableDriver') },
                    { key: 'team', label: tSim('tableTeam') },
                    { key: 'status', label: tSim('tableStatus'), align: 'right' },
                  ]}
                  data={selectedRaceData.entries.map((entry, pos) => ({
                    pos: pos + 1,
                    driver: (
                      <span className={entry.teamId === playerTeamId ? 'text-[var(--accent-performance)] font-bold' : entry.didFinish ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] line-through'}>
                        <FlagEmoji code={entry.driverNationalityCode} className="mr-1" /> {entry.driverName} {entry.driverSeasonYear ?? ''}
                      </span>
                    ),
                    team: (
                      <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                        <FlagEmoji code={entry.teamCountryCode} className="mr-1" /> {entry.teamName}
                      </span>
                    ),
                    status: (
                      <span className={entry.didFinish ? 'text-[var(--text-main)]' : 'font-bold text-[var(--accent-speed)]'}>
                        {entry.didFinish ? entry.raceScore.toFixed(1) : `DNF (${entry.dnfReason})`}
                      </span>
                    ),
                  }))}
                />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
                  {t('technicalDiagnosis')}
                </div>
                <div className="flex flex-col gap-2">
                  {(result.diagnostics?.explanations.raceSummaries[selectedRace] || selectedRaceData.explanations.map((exp) => ({ key: '', params: undefined, fallback: exp } as any))).map((event: any, i: number) => (
                    <div key={i} className="border-l-2 border-[var(--accent-telemetry)] bg-[var(--background-panel)] p-3 text-xs font-mono text-[var(--text-main)]">
                      {event.key
                        ? tNar(event.key.replace('Narrator.', '') as any, event.params as any)
                        : event.fallback || event}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <ActionsBar
            copyLabel={t('actions.copySummary')}
            copiedLabel={t('copied')}
            simulateAgainLabel={t('actions.simulateAgain')}
            newTeamLabel={t('actions.newTeam')}
            copied={copied}
            onCopy={handleShare}
            onSimulateAgain={() => {
              setResult(null)
              setError('')
              setRevealedCount(0)
              setSelectedRace(0)
              if (draft) void handleSimulate(draft)
            }}
            onNewTeam={() => router.push('/draft')}
          />
        </div>
      )}
    </AppShell>
  )
}
