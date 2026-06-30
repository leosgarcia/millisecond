import { RaceResult } from '@/domain/simulation/types'
import FlagEmoji from '@/components/ui/FlagEmoji'
import { formatCountryName } from '@/lib/country'
import LiveryMark from './LiveryMark'
import { useLocale, useTranslations } from 'next-intl'

interface Props {
  race: RaceResult
  onNext: () => void
  onRevealAll: () => void
  isLastRace: boolean
  totalRaces: number
}

export default function RaceRevealModal({ race, onNext, onRevealAll, isLastRace, totalRaces }: Props) {
  const t = useTranslations('raceReveal')
  const locale = useLocale()

  const wetLabel = race.conditions.isWet ? t('wetRace') : t('dryRace')
  const safetyCarLabel = race.conditions.hasSafetyCar ? t('withSafetyCar') : t('noSafetyCar')
  const tireStressLabel =
    race.conditions.tireStressLevel === 'low'
      ? t('tireLow')
      : race.conditions.tireStressLevel === 'medium'
        ? t('tireMedium')
        : t('tireHigh')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,5,7,0.9)] backdrop-blur-md p-4">
      <div className="w-full max-w-3xl border border-[var(--border-subtle)] bg-[var(--background-panel)]">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--background-card)] p-4 md:p-5">
          <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.35em] text-[var(--accent-telemetry)]">
            {t('roundOfTotal', { round: race.raceNumber, total: totalRaces })}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-mono uppercase tracking-widest text-[var(--text-muted)]">
            <FlagEmoji code={race.circuitCountry} className="mr-1" />
            <span>{race.circuitName}</span>
            <span>·</span>
            <span>{formatCountryName(race.circuitCountry, locale)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-muted)]">
            <span>{t('condition')}: {wetLabel}</span>
            <span>·</span>
            <span>{t('tireStress')}: {tireStressLabel}</span>
            <span>·</span>
            <span>{t('safetyCar')}: {safetyCarLabel}</span>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="mb-5 text-center text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
            {t('podium')}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {race.podium.map((podiumEntry) => {
              const medal =
                podiumEntry.position === 1 ? '🥇' : podiumEntry.position === 2 ? '🥈' : '🥉'

              return (
                <div
                  key={`${podiumEntry.position}-${podiumEntry.driverName}`}
                  className={`border p-3 ${
                    podiumEntry.position === 1
                      ? 'border-[var(--accent-speed)] bg-[rgba(255,45,45,0.05)]'
                      : 'border-[var(--border-subtle)] bg-[var(--background-card)]'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-xl">{medal}</div>
                    {podiumEntry.carName && (
                      <LiveryMark
                        size="xs"
                        primaryColor={podiumEntry.carLiveryPrimaryColor}
                        secondaryColor={podiumEntry.carLiverySecondaryColor}
                        accentColor={podiumEntry.carLiveryAccentColor}
                        label={podiumEntry.carName}
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">
                      <FlagEmoji code={podiumEntry.countryCode} className="mr-1" /> {podiumEntry.driverDisplayName}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                      {podiumEntry.driverSeasonYear ?? ''}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                      {podiumEntry.teamName}
                    </div>
                    {podiumEntry.carName && (
                      <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                        {podiumEntry.carName} {podiumEntry.carSeasonYear ?? ''}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] p-4 flex flex-col gap-3 md:flex-row">
          <button className="button-outline flex-1 text-xs" onClick={onRevealAll}>
            {t('revealAll')}
          </button>
          <button className="button-primary flex-1" onClick={onNext}>
            {isLastRace ? t('close') : t('nextRace')}
          </button>
        </div>
      </div>
    </div>
  )
}
