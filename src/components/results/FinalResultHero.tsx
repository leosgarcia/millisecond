import LiveryMark from '@/components/ui/LiveryMark'
import FlagEmoji from '@/components/ui/FlagEmoji'

export type FinalResultHeroProps = {
  title: string
  positionLabel: string
  teamName: string
  teamCountryCode?: string
  pointsLabel: string
  difficultyLabel: string
  formatLabel: string
  budgetLabel: string
  championDriverName: string
  championDriverCountryCode?: string
  championDriverSeasonYear?: number
  championConstructorName: string
  championConstructorCountryCode?: string
  championConstructorLivery?: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
  }
  decisiveRaceName?: string
  decisiveRaceCountryCode?: string
  pointsTitle: string
  budgetTitle: string
  difficultyTitle: string
  formatTitle: string
  constructorsTitle: string
  driversTitle: string
  decisiveRaceTitle: string
  livery?: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
  }
  tone?: 'victory' | 'strong' | 'mixed' | 'rescue'
}

export default function FinalResultHero({
  title,
  positionLabel,
  teamName,
  teamCountryCode,
  pointsLabel,
  difficultyLabel,
  formatLabel,
  budgetLabel,
  championDriverName,
  championDriverCountryCode,
  championDriverSeasonYear,
  championConstructorName,
  championConstructorCountryCode,
  championConstructorLivery,
  decisiveRaceName,
  decisiveRaceCountryCode,
  pointsTitle,
  budgetTitle,
  difficultyTitle,
  formatTitle,
  constructorsTitle,
  driversTitle,
  decisiveRaceTitle,
  livery,
  tone = 'mixed',
}: FinalResultHeroProps) {
  const heroAccent =
    tone === 'victory'
      ? 'bg-[var(--accent-performance)]'
      : tone === 'strong'
        ? 'bg-[var(--accent-telemetry)]'
        : tone === 'rescue'
          ? 'bg-[var(--accent-warning)]'
          : 'bg-[var(--accent-budget)]'

  return (
    <section className="overflow-hidden border border-[var(--border-subtle)] bg-[linear-gradient(135deg,rgba(17,19,24,0.98),rgba(5,5,7,0.98))]">
      <div className={`h-1 ${heroAccent}`} />
      <div className="grid gap-5 p-5 md:grid-cols-[1.5fr_1fr] md:gap-6 md:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--background-panel)] text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
              {title}
            </span>
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
                {teamName}
              </div>
              <div className="text-2xl font-semibold uppercase tracking-tight text-[var(--text-main)] md:text-[2.15rem]">
                {positionLabel}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">
            <FlagEmoji code={teamCountryCode} className="mr-1" />
            <span>{teamName}</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded border border-[var(--border-subtle)] bg-[var(--background-panel)] p-3">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">{pointsTitle}</div>
              <div className="mt-1 text-xl font-mono uppercase tracking-tight text-[var(--text-main)]">{pointsLabel}</div>
            </div>
            <div className="rounded border border-[var(--border-subtle)] bg-[var(--background-panel)] p-3">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">{budgetTitle}</div>
              <div className="mt-1 text-xl font-mono uppercase tracking-tight text-[var(--text-main)]">{budgetLabel}</div>
            </div>
            <div className="rounded border border-[var(--border-subtle)] bg-[var(--background-panel)] p-3">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">{difficultyTitle}</div>
              <div className="mt-1 text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">{difficultyLabel}</div>
            </div>
            <div className="rounded border border-[var(--border-subtle)] bg-[var(--background-panel)] p-3">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">{formatTitle}</div>
              <div className="mt-1 text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">{formatLabel}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded border border-[var(--border-subtle)] bg-[var(--background-panel)] p-3">
            <div className="mb-2 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
              {constructorsTitle}
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <LiveryMark
                  size="xs"
                  primaryColor={championConstructorLivery?.primaryColor ?? livery?.primaryColor}
                  secondaryColor={championConstructorLivery?.secondaryColor ?? livery?.secondaryColor}
                  accentColor={championConstructorLivery?.accentColor ?? livery?.accentColor}
                  label={championConstructorName}
                />
                <div className="min-w-0">
                  <div className="text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">
                    <FlagEmoji code={championConstructorCountryCode} className="mr-1" />
                    {championConstructorName}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    {constructorsTitle}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FlagEmoji code={championDriverCountryCode} className="mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">
                    {championDriverName} {championDriverSeasonYear ?? ''}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    {driversTitle}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {decisiveRaceName && (
            <div className="rounded border border-[var(--border-subtle)] bg-[var(--background-panel)] p-3">
              <div className="mb-2 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
                {decisiveRaceTitle}
              </div>
              <div className="flex items-start gap-3">
                <FlagEmoji code={decisiveRaceCountryCode} className="mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">
                    {decisiveRaceName}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    {decisiveRaceTitle}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
