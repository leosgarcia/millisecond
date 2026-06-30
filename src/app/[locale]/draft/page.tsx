'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import AppShell from '@/components/ui/AppShell'
import SectionHeader from '@/components/ui/SectionHeader'
import BudgetMeter from '@/components/ui/BudgetMeter'
import TimingBar from '@/components/ui/TimingBar'
import FlagEmoji from '@/components/ui/FlagEmoji'
import LiveryMark from '@/components/ui/LiveryMark'

import { DifficultyMode, DIFFICULTY_CONFIG } from '@/domain/simulation/types'
import { evaluatePhilosophyFit, getPhilosophyModifiersForRace, getTeamPhilosophyById, getTeamPhilosophies } from '@/domain/teams/philosophies'
import {
  formatDriverName,
  formatCarName,
  formatEngineName,
  formatTeamPrincipalName,
  formatTechnicalDirectorName
} from '@/domain/display/formatters'

type SelectionState = {
  championshipFormat: 'quick' | 'standard'
  difficulty: DifficultyMode
  driverPrimaryId: string
  driverSecondaryId: string
  carId: string
  engineId: string
  teamPrincipalId: string
  technicalDirectorId: string
  philosophyId: string
}

const EMPTY: SelectionState = {
  championshipFormat: 'standard',
  difficulty: 'standard',
  driverPrimaryId: '',
  driverSecondaryId: '',
  carId: '',
  engineId: '',
  teamPrincipalId: '',
  technicalDirectorId: '',
  philosophyId: '',
}

const WIZARD_STEPS = [
  'FORMAT_DIFFICULTY',
  'CAR',
  'ENGINE',
  'DRIVER_PRIMARY',
  'DRIVER_SECONDARY',
  'TEAM_PRINCIPAL',
  'TECHNICAL_DIRECTOR',
  'PHILOSOPHY',
  'REVIEW'
]

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center mb-1">
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono text-[var(--text-main)]">{value}</span>
    </div>
  )
}

function EntityCard({
  item,
  selected,
  onClick,
  label,
  subLabel,
  stats,
  tier,
  budgetCost,
  countryCode,
  mark,
  t
}: {
  item: { id: string }
  selected: boolean
  onClick: () => void
  label: string
  subLabel?: string
  stats?: { label: string; value: number }[]
  tier?: string
  budgetCost?: number
  countryCode?: string
  mark?: ReactNode
  t: any
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`bg-[var(--background-card)] border ${selected ? 'border-[var(--accent-performance)] shadow-[0_0_8px_rgba(57,255,136,0.1)]' : 'border-[var(--border-subtle)]'} p-4 cursor-pointer relative group transition-colors hover:bg-[var(--background-panel)] flex flex-col`}
    >
      {selected && (
        <div className="absolute top-0 right-0 w-2 h-full bg-[var(--accent-performance)]" />
      )}
      <div className="mb-3">
        <div className="font-mono text-sm text-[var(--text-main)] uppercase flex items-center gap-2 leading-tight">
          {mark}
          {countryCode && <FlagEmoji code={countryCode} className="mr-1" />}
          <span>{label}</span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] uppercase mt-1 flex gap-2 items-center tracking-wider">
          {subLabel && <span>{subLabel}</span>}
          {tier && (
            <>
              <span>·</span>
              <span>Tier {tier}</span>
            </>
          )}
          {budgetCost !== undefined && (
            <>
              <span>·</span>
              <span className="text-[var(--accent-budget)]">{budgetCost} MS</span>
            </>
          )}
        </div>
      </div>
      
      {stats && stats.length > 0 && (
        <div className="mt-auto border-t border-[var(--border-subtle)] pt-3">
          {stats.map((s, i) => (
            <StatRow key={i} label={s.label} value={s.value} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DraftPage() {
  const router = useRouter()
  const t = useTranslations('Draft')
  const tp = useTranslations('philosophy')
  const normalizePhilosophyKey = (key?: string | null) => {
    if (!key) return ''
    return key.startsWith('philosophy.') ? key.slice('philosophy.'.length) : key
  }
  const tc = useTranslations('common')
  const [selection, setSelection] = useState<SelectionState>(EMPTY)
  const [stepIndex, setStepIndex] = useState(0)
  
  const [data, setData] = useState<{
    primaryDrivers: any[]
    secondaryDrivers: any[]
    cars: any[]
    engines: any[]
    teamPrincipals: any[]
    technicalDirectors: any[]
    philosophies: any[]
  }>({
    primaryDrivers: [],
    secondaryDrivers: [],
    cars: [],
    engines: [],
    teamPrincipals: [],
    technicalDirectors: [],
    philosophies: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const [drivers, cars, engines, tps, tds, philosophies] = await Promise.all([
        fetch('/api/drivers').then((r) => r.json()),
        fetch('/api/cars').then((r) => r.json()),
        fetch('/api/engines').then((r) => r.json()),
        fetch('/api/team-principals').then((r) => r.json()),
        fetch('/api/technical-directors').then((r) => r.json()),
        fetch('/api/philosophies').then((r) => r.json()),
      ])
      setData({
        primaryDrivers: drivers.filter((d: any) => d.role === 'primary'),
        secondaryDrivers: drivers.filter((d: any) => d.role === 'secondary'),
        cars,
        engines,
        teamPrincipals: tps,
        technicalDirectors: tds,
        philosophies,
      })
      setLoading(false)
    }
    fetchAll()
  }, [])

  const set = (key: keyof SelectionState) => (val: any) =>
    setSelection((s) => ({ ...s, [key]: val }))

  const usedBudget = 
    (data.primaryDrivers.find(d => d.id === selection.driverPrimaryId)?.budgetCost || 0) +
    (data.secondaryDrivers.find(d => d.id === selection.driverSecondaryId)?.budgetCost || 0) +
    (data.cars.find(c => c.id === selection.carId)?.budgetCost || 0) +
    (data.engines.find(e => e.id === selection.engineId)?.budgetCost || 0) +
    (data.teamPrincipals.find(tp => tp.id === selection.teamPrincipalId)?.budgetCost || 0) +
    (data.technicalDirectors.find(td => td.id === selection.technicalDirectorId)?.budgetCost || 0)
    
  const playerBudgetLimit = DIFFICULTY_CONFIG[selection.difficulty].playerBudgetLimit
  const isOverBudget = usedBudget > playerBudgetLimit
  const totalRaces = selection.championshipFormat === 'quick' ? 7 : 12

  const selectedPrimary = data.primaryDrivers.find((d) => d.id === selection.driverPrimaryId)
  const selectedSecondary = data.secondaryDrivers.find((d) => d.id === selection.driverSecondaryId)
  const selectedCar = data.cars.find((c) => c.id === selection.carId)
  const selectedEngine = data.engines.find((e) => e.id === selection.engineId)
  const selectedTP = data.teamPrincipals.find((tp) => tp.id === selection.teamPrincipalId)
  const selectedTD = data.technicalDirectors.find((td) => td.id === selection.technicalDirectorId)

  const selectedTeamFit = selectedPrimary && selectedSecondary && selectedCar && selectedEngine && selectedTP && selectedTD
    ? {
        driverPrimary: selectedPrimary,
        driverSecondary: selectedSecondary,
        car: selectedCar,
        engine: selectedEngine,
        teamPrincipal: selectedTP,
        technicalDirector: selectedTD,
      }
    : null

  const philosophyCatalog = data.philosophies.length > 0 ? data.philosophies : getTeamPhilosophies()
  const philosophyEvaluations = selectedTeamFit
    ? philosophyCatalog.map((philosophy) => ({
        philosophy,
        fit: evaluatePhilosophyFit(selectedTeamFit as any, philosophy, selection.championshipFormat),
      }))
    : philosophyCatalog.map((philosophy) => ({
        philosophy,
        fit: {
          rating: 'neutral' as const,
          score: 50,
          reasons: [],
        },
      }))
  const bestPhilosophyId = philosophyEvaluations.slice().sort((a, b) => b.fit.score - a.fit.score)[0]?.philosophy.id
  const currentPhilosophy = getTeamPhilosophyById(selection.philosophyId)

  const currentStep = WIZARD_STEPS[stepIndex]

  function canAdvance() {
    if (isOverBudget) return false
    switch (currentStep) {
      case 'FORMAT_DIFFICULTY': return true
      case 'CAR': return !!selection.carId
      case 'ENGINE': return !!selection.engineId
      case 'DRIVER_PRIMARY': return !!selection.driverPrimaryId
      case 'DRIVER_SECONDARY': return !!selection.driverSecondaryId
      case 'TEAM_PRINCIPAL': return !!selection.teamPrincipalId
      case 'TECHNICAL_DIRECTOR': return !!selection.technicalDirectorId
      case 'PHILOSOPHY': return !!selection.philosophyId
      case 'REVIEW': return true
      default: return false
    }
  }

  function handleNext() {
    if (canAdvance() && stepIndex < WIZARD_STEPS.length - 1) {
      setStepIndex(stepIndex + 1)
      window.scrollTo(0, 0)
    }
  }

  function handlePrev() {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
      window.scrollTo(0, 0)
    }
  }

  function handleSimulate() {
    if (!canAdvance() || isOverBudget) return
    sessionStorage.setItem('ms-draft', JSON.stringify(selection))
    router.push('/simulate')
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-[var(--accent-telemetry)] uppercase font-mono tracking-widest text-sm animate-pulse">{t('loadingTelemetry')}</div>
        </div>
      </AppShell>
    )
  }

  const stepKeys = {
    FORMAT_DIFFICULTY: 'stepFormatTitle',
    CAR: 'stepCarTitle',
    ENGINE: 'stepEngineTitle',
    DRIVER_PRIMARY: 'stepPrimaryTitle',
    DRIVER_SECONDARY: 'stepSecondaryTitle',
    TEAM_PRINCIPAL: 'stepTPTitle',
    TECHNICAL_DIRECTOR: 'stepTDTitle',
    PHILOSOPHY: 'stepPhilosophyTitle',
    REVIEW: 'stepReviewTitle'
  }
  
  const stepDescKeys = {
    CAR: 'stepCarDesc',
    ENGINE: 'stepEngineDesc',
    DRIVER_PRIMARY: 'stepPrimaryDesc',
    DRIVER_SECONDARY: 'stepSecondaryDesc',
    TEAM_PRINCIPAL: 'stepTPDesc',
    TECHNICAL_DIRECTOR: 'stepTDDesc',
    PHILOSOPHY: 'stepPhilosophyDesc',
    REVIEW: 'stepReviewDesc'
  }

  const stepName = t(stepKeys[currentStep as keyof typeof stepKeys] as any)
  const stepDesc = stepDescKeys[currentStep as keyof typeof stepDescKeys] ? t(stepDescKeys[currentStep as keyof typeof stepDescKeys] as any) : null

  return (
    <div className="pb-32">
      <AppShell>
        <SectionHeader 
          title={t('title')} 
          subtitle={t('subtitle', { step: stepIndex + 1, total: WIZARD_STEPS.length, stepName })} 
        />

        {stepDesc && (
          <div className="mb-6 text-sm text-[var(--text-muted)] max-w-2xl font-mono uppercase tracking-wide">
            {stepDesc}
          </div>
        )}

        {/* Budget Overlay */}
        <div className="sticky top-0 z-10 bg-[rgba(5,5,7,0.95)] backdrop-blur-md pb-4 mb-8 border-b border-[var(--border-subtle)] pt-4">
          <BudgetMeter used={usedBudget} total={playerBudgetLimit} />
        </div>

        {currentStep === 'FORMAT_DIFFICULTY' && (
          <div className="max-w-xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-mono text-[var(--text-main)] uppercase mb-4">{t('difficulty')}</h3>
              <div className="grid gap-4">
                {[
                  { id: 'casual', label: t('diffCasual'), budget: 1050, desc: t('diffCasualDesc') },
                  { id: 'standard', label: t('diffStandard'), budget: 1000, desc: t('diffStandardDesc') },
                  { id: 'hard', label: t('diffHard'), budget: 950, desc: t('diffHardDesc') },
                  { id: 'legend', label: t('diffLegend'), budget: 900, desc: t('diffLegendDesc') }
                ].map(opt => (
                  <div key={opt.id} onClick={() => set('difficulty')(opt.id)} className={`p-4 border cursor-pointer ${selection.difficulty === opt.id ? 'border-[var(--accent-performance)] bg-[var(--background-panel)]' : 'border-[var(--border-subtle)] bg-[var(--background-card)] hover:bg-[var(--background-panel)]'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[var(--text-main)] uppercase">{opt.label}</span>
                      <span className="font-mono text-[var(--accent-budget)] text-sm">{opt.budget} MS</span>
                    </div>
                    <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-mono text-[var(--text-main)] uppercase mb-4">{t('championshipFormat')}</h3>
              <div className="grid gap-4">
                {[
                { id: 'quick', label: t('formatQuick'), desc: t('formatQuickDesc') },
                { id: 'standard', label: t('formatStandard'), desc: t('formatStandardDesc') }
                ].map(opt => (
                  <div key={opt.id} onClick={() => set('championshipFormat')(opt.id)} className={`p-4 border cursor-pointer ${selection.championshipFormat === opt.id ? 'border-[var(--accent-performance)] bg-[var(--background-panel)]' : 'border-[var(--border-subtle)] bg-[var(--background-card)] hover:bg-[var(--background-panel)]'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[var(--text-main)] uppercase">{opt.label}</span>
                    </div>
                    <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'CAR' && (
          <div className="technical-grid">
            {data.cars.map((c) => (
              <EntityCard
                key={c.id} item={c} selected={selection.carId === c.id} onClick={() => set('carId')(c.id)}
                label={formatCarName(c)} subLabel={t('car')} tier={c.overall >= 95 ? 'S' : c.overall >= 90 ? 'A' : 'B'}
                stats={[
                  { label: t('statAero'), value: c.aeroEfficiency },
                  { label: t('statMech'), value: c.mechanicalGrip },
                  { label: t('statRel'), value: c.reliability },
                  { label: t('statTire'), value: c.tireWear }
                ]}
                budgetCost={c.budgetCost} countryCode={c.teamCountryCode} mark={<LiveryMark size="xs" primaryColor={c.liveryPrimaryColor} secondaryColor={c.liverySecondaryColor} accentColor={c.liveryAccentColor} label={formatCarName(c)} />} t={t}
              />
            ))}
          </div>
        )}

        {currentStep === 'ENGINE' && (
          <div className="technical-grid">
            {data.engines.map((e) => (
              <EntityCard
                key={e.id} item={e} selected={selection.engineId === e.id} onClick={() => set('engineId')(e.id)}
                label={formatEngineName(e)} subLabel={t('engine')} tier={e.overall >= 95 ? 'S' : e.overall >= 90 ? 'A' : 'B'}
                stats={[
                  { label: t('statPower'), value: e.power },
                  { label: t('statRel'), value: e.reliability },
                  { label: t('statCooling'), value: e.coolingDemand },
                  { label: t('statQuali'), value: e.qualifyingMode }
                ]}
                budgetCost={e.budgetCost} countryCode={e.manufacturerCountryCode} t={t}
              />
            ))}
          </div>
        )}

        {currentStep === 'DRIVER_PRIMARY' && (
          <div className="technical-grid">
            {data.primaryDrivers.map((d) => (
              <EntityCard
                key={d.id} item={d} selected={selection.driverPrimaryId === d.id} onClick={() => set('driverPrimaryId')(d.id)}
                label={formatDriverName(d)} subLabel={t('primaryDriver')} tier={d.overall >= 95 ? 'S' : d.overall >= 90 ? 'A' : 'B'}
                stats={[
                  { label: t('statPace'), value: d.racePace },
                  { label: t('statQuali'), value: d.qualifyingPace },
                  { label: t('statCons'), value: d.consistency },
                  { label: t('statRain'), value: d.wetSkill }
                ]}
                budgetCost={d.budgetCost} countryCode={d.nationalityCode} t={t}
              />
            ))}
          </div>
        )}

        {currentStep === 'DRIVER_SECONDARY' && (
          <div className="technical-grid">
            {data.secondaryDrivers.map((d) => {
              const primaryCanon = data.primaryDrivers.find(p => p.id === selection.driverPrimaryId)?.canonicalDriverId
              if (primaryCanon && d.canonicalDriverId === primaryCanon) return null

              return (
                <EntityCard
                  key={d.id} item={d} selected={selection.driverSecondaryId === d.id} onClick={() => set('driverSecondaryId')(d.id)}
                label={formatDriverName(d)} subLabel={t('secondaryDriver')} tier={d.overall >= 90 ? 'A' : d.overall >= 80 ? 'B' : 'C'}
                stats={[
                  { label: t('statCons'), value: d.consistency },
                  { label: t('statTire'), value: d.tireManagement },
                  { label: t('statDef'), value: d.defending },
                  { label: t('statTeam'), value: d.teamPlay }
                ]}
                budgetCost={d.budgetCost} countryCode={d.nationalityCode} t={t}
              />
              )
            })}
          </div>
        )}

        {currentStep === 'TEAM_PRINCIPAL' && (
          <div className="technical-grid">
            {data.teamPrincipals.map((tp) => (
              <EntityCard
                key={tp.id} item={tp} selected={selection.teamPrincipalId === tp.id} onClick={() => set('teamPrincipalId')(tp.id)}
                label={formatTeamPrincipalName(tp)} subLabel={t('teamPrincipal')} tier="-"
                stats={[
                  { label: t('statLeadership'), value: tp.leadership },
                  { label: t('statOperationalDiscipline'), value: tp.operationalDiscipline },
                  { label: t('statDriverManagement'), value: tp.driverManagement }
                ]}
                budgetCost={tp.budgetCost} countryCode={tp.nationalityCode} t={t}
              />
            ))}
          </div>
        )}

        {currentStep === 'TECHNICAL_DIRECTOR' && (
          <div className="technical-grid">
            {data.technicalDirectors.map((td) => (
                <EntityCard
                  key={td.id} item={td} selected={selection.technicalDirectorId === td.id} onClick={() => set('technicalDirectorId')(td.id)}
                label={formatTechnicalDirectorName(td)} subLabel={t('technicalDirector')} tier="-"
                stats={[
                  { label: t('statAero'), value: td.aerodynamics },
                  { label: t('statMechanicalDesign'), value: td.mechanicalDesign },
                  { label: t('statInnovation'), value: td.innovation },
                  { label: t('statRel'), value: td.reliabilityFocus }
                  ]}
                  budgetCost={td.budgetCost} countryCode={td.nationalityCode} t={t}
                />
            ))}
          </div>
        )}

        {currentStep === 'PHILOSOPHY' && (
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h3 className="text-lg font-mono text-[var(--text-main)] uppercase mb-2">{tp('headline')}</h3>
                <p className="text-sm text-[var(--text-muted)] max-w-3xl leading-relaxed">
                  {tp('intro')}
                </p>
              </div>
              <div className="text-right font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                <div>{tp('budget')} {usedBudget} / {playerBudgetLimit} ms</div>
                <div className="text-[var(--accent-performance)] mt-1">{tp('expectedImpact')}</div>
              </div>
            </div>

            <div className="technical-grid">
              {philosophyEvaluations.map(({ philosophy, fit }) => {
                const modifiers = getPhilosophyModifiersForRace(philosophy, 0, totalRaces)
                const isSelected = selection.philosophyId === philosophy.id
                const isBest = philosophy.id === bestPhilosophyId
                const fitLabel = tp(fit.rating)
                const fitReasonKey = fit.reasons[0]?.key
                const fitReason = fitReasonKey ? tp(normalizePhilosophyKey(fitReasonKey), fit.reasons[0]?.params as any) : tp('compatibleWithYourTeam')
                const effectRows = [
                  [tp('tags.qualifying'), modifiers.qualifyingModifier],
                  [tp('tags.race'), modifiers.raceModifier],
                  [tp('tags.reliability'), modifiers.reliabilityModifier],
                  [tp('tags.tires'), modifiers.tireModifier],
                  [tp('tags.overtaking'), modifiers.overtakingModifier],
                  [tp('tags.error'), modifiers.errorRiskModifier],
                  [tp('tags.development'), modifiers.developmentModifier],
                ] as Array<[string, number]>
                const filteredEffectRows = effectRows.filter(([, value]) => Math.abs(value) > 0.001)

                return (
                  <div
                    key={philosophy.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => set('philosophyId')(philosophy.id)}
                    className={`bg-[var(--background-card)] border ${isSelected ? 'border-[var(--accent-performance)] shadow-[0_0_0_1px_rgba(57,255,136,0.1)]' : 'border-[var(--border-subtle)]'} p-4 cursor-pointer relative hover:bg-[var(--background-panel)] flex flex-col min-h-[280px]`}
                  >
                    {isSelected && <div className="absolute top-0 right-0 w-2 h-full bg-[var(--accent-performance)]" />}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="font-mono text-sm text-[var(--text-main)] uppercase tracking-wider">
                          {tp(normalizePhilosophyKey(philosophy.nameKey))}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] uppercase mt-1 tracking-[0.25em]">
                          {fitLabel}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {isBest && !isSelected && (
                          <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--accent-performance)] border border-[var(--accent-performance)] px-2 py-1">
                            {tp('recommended')}
                          </div>
                        )}
                        <div className={`text-[10px] uppercase tracking-[0.25em] font-mono px-2 py-1 border ${
                          fit.rating === 'recommended'
                            ? 'text-[var(--accent-performance)] border-[var(--accent-performance)]'
                            : fit.rating === 'risky'
                              ? 'text-[var(--accent-speed)] border-[var(--accent-speed)]'
                              : fit.rating === 'not_recommended'
                                ? 'text-[var(--accent-danger)] border-[var(--accent-danger)]'
                                : 'text-[var(--text-muted)] border-[var(--border-subtle)]'
                        }`}>
                          {Math.round(fit.score)}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {tp(normalizePhilosophyKey(philosophy.descriptionKey))}
                    </div>

                    <div className="grid grid-cols-1 gap-3 mt-4">
                      <div className="border-l-2 border-[var(--accent-performance)] pl-3">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)] mb-1">{tp('bestFor')}</div>
                        <div className="text-xs text-[var(--text-main)] leading-relaxed">{tp(normalizePhilosophyKey(philosophy.bestForKey))}</div>
                      </div>
                      <div className="border-l-2 border-[var(--accent-speed)] pl-3">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)] mb-1">{tp('risk')}</div>
                        <div className="text-xs text-[var(--text-main)] leading-relaxed">{tp(normalizePhilosophyKey(philosophy.riskKey))}</div>
                      </div>
                      <div className="border-l-2 border-[var(--border-subtle)] pl-3">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)] mb-1">{tp('compatibleWithYourTeam')}</div>
                        <div className="text-xs text-[var(--text-main)] leading-relaxed">
                          {fitReason}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {(philosophy.tags ?? []).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[9px] uppercase font-mono px-2 py-1 border border-[var(--border-subtle)] text-[var(--text-muted)]"
                        >
                          {tp(`tags.${tag}`)}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto border-t border-[var(--border-subtle)] pt-3 mt-4 space-y-1">
                      {filteredEffectRows.map(([label, value]) => (
                        <div key={label} className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                          <span className="text-[var(--text-muted)]">{label}</span>
                          <span className={value > 0 ? 'text-[var(--accent-performance)]' : 'text-[var(--accent-speed)]'}>
                            {value > 0 ? '+' : ''}{Math.round(value * 100)}%
                          </span>
                        </div>
                      ))}
                      {philosophy.key === 'development_focused' && philosophy.progressionModel && (
                        <div className="pt-2 space-y-2">
                          {philosophy.progressionModel.phases.map((phase: { startRace: number; endRace: number; labelKey: string }) => (
                            <div key={`${phase.startRace}-${phase.endRace}`} className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                              {tp(normalizePhilosophyKey(phase.labelKey))}: {phase.startRace}-{phase.endRace}
                            </div>
                          ))}
                          {selection.championshipFormat === 'quick' && philosophy.progressionModel.quickWarningKey && (
                            <div className="text-[10px] text-[var(--accent-warning)] uppercase tracking-wide">
                              {tp(normalizePhilosophyKey(philosophy.progressionModel.quickWarningKey))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {currentStep === 'REVIEW' && (() => {
          const cCar = data.cars.find(c => c.id === selection.carId)
          const cEngine = data.engines.find(e => e.id === selection.engineId)
          const cP1 = data.primaryDrivers.find(d => d.id === selection.driverPrimaryId)
          const cP2 = data.secondaryDrivers.find(d => d.id === selection.driverSecondaryId)
          const cTP = data.teamPrincipals.find(tp => tp.id === selection.teamPrincipalId)
          const cTD = data.technicalDirectors.find(td => td.id === selection.technicalDirectorId)
          const cPhil = currentPhilosophy ?? data.philosophies.find(p => p.id === selection.philosophyId)

          return (
            <div className="max-w-3xl mx-auto text-center space-y-6">
                <div className="bg-[var(--background-panel)] border border-[var(--border-subtle)] p-6 text-left grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('primaryDriver')}</span>
                  <span className="font-mono text-sm text-[var(--text-main)] uppercase">
                    <FlagEmoji code={cP1?.nationalityCode} className="mr-1" />
                    {formatDriverName(cP1, tc)}
                  </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('secondaryDriver')}</span>
                  <span className="font-mono text-sm text-[var(--text-main)] uppercase">
                    <FlagEmoji code={cP2?.nationalityCode} className="mr-1" />
                    {formatDriverName(cP2, tc)}
                  </span>
                  </div>
                  <div>
                <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('car')}</span>
                  <span className="font-mono text-sm text-[var(--text-main)] uppercase">
                    <LiveryMark size="xs" primaryColor={cCar?.liveryPrimaryColor} secondaryColor={cCar?.liverySecondaryColor} accentColor={cCar?.liveryAccentColor} label={formatCarName(cCar, tc)} className="mr-2" />
                    {formatCarName(cCar, tc)}
                  </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('engine')}</span>
                  <span className="font-mono text-sm text-[var(--text-main)] uppercase">
                    <FlagEmoji code={cEngine?.manufacturerCountryCode} className="mr-1" />
                    {formatEngineName(cEngine, tc)}
                  </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('teamPrincipal')}</span>
                  <span className="font-mono text-sm text-[var(--text-main)] uppercase">
                    <FlagEmoji code={cTP?.nationalityCode} className="mr-1" />
                    {formatTeamPrincipalName(cTP, tc)}
                  </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('technicalDirector')}</span>
                  <span className="font-mono text-sm text-[var(--text-main)] uppercase">
                    <FlagEmoji code={cTD?.nationalityCode} className="mr-1" />
                    {formatTechnicalDirectorName(cTD, tc)}
                  </span>
                  </div>
                <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('philosophy')}</span>
                    <span className="font-mono text-sm text-[var(--text-main)] uppercase">{cPhil?.name || tc('notFound')}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('championshipFormat')}</span>
                    <span className="font-mono text-sm text-[var(--text-main)] uppercase">{selection.championshipFormat === 'quick' ? t('formatQuick') : t('formatStandard')}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('difficulty')}</span>
                    <span className="font-mono text-sm text-[var(--text-main)] uppercase">
                      {selection.difficulty === 'casual' ? t('diffCasual') : selection.difficulty === 'standard' ? t('diffStandard') : selection.difficulty === 'hard' ? t('diffHard') : t('diffLegend')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        <div className="fixed bottom-0 left-0 right-0 bg-[rgba(5,5,7,0.95)] border-t border-[var(--border-subtle)] p-4 flex justify-between items-center backdrop-blur-md z-20 mx-auto">
          <button 
            className="button-outline"
            onClick={handlePrev}
            disabled={stepIndex === 0}
          >
            {t('prev')}
          </button>

          {isOverBudget && (
             <div className="text-[10px] text-[var(--accent-warning)] uppercase tracking-widest text-center">{t('budgetExceeded')}</div>
          )}

          {currentStep === 'REVIEW' ? (
            <button
              className="button-primary"
              disabled={!canAdvance()}
              onClick={handleSimulate}
            >
              {t('continue')}
            </button>
          ) : (
            <button
              className="button-primary"
              disabled={!canAdvance()}
              onClick={handleNext}
            >
              {t('next')}
            </button>
          )}
        </div>
      </AppShell>
    </div>
  )
}
