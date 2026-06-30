import LiveryMark from '@/components/ui/LiveryMark'
import FlagEmoji from '@/components/ui/FlagEmoji'
import { formatCountryName } from '@/lib/country'

export type StandingPreviewDriver = {
  driverId: string
  driverName: string
  driverSeasonYear?: number
  driverNationalityCode?: string
  teamName: string
  teamCountryCode?: string
  points: number
}

export type StandingPreviewConstructor = {
  teamId: string
  teamName: string
  teamCountryCode?: string
  carName?: string
  carSeasonYear?: number
  carLiveryPrimaryColor?: string
  carLiverySecondaryColor?: string
  carLiveryAccentColor?: string
  points: number
}

export default function TopStandingsPreview({
  topDrivers,
  topConstructors,
  titleDrivers,
  titleConstructors,
  locale,
}: {
  topDrivers: StandingPreviewDriver[]
  topConstructors: StandingPreviewConstructor[]
  titleDrivers: string
  titleConstructors: string
  locale: string
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="border border-[var(--border-subtle)] bg-[var(--background-panel)] p-4">
        <div className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
          {titleDrivers}
        </div>
        <ol className="space-y-2">
          {topDrivers.map((driver, index) => (
            <li
              key={`${driver.driverId}-${index}`}
              className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-2 last:border-b-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="text-sm font-mono uppercase tracking-widest text-[var(--text-main)] truncate">
                  <span className="mr-2 text-[var(--text-muted)]">{index + 1}.</span>
                  <FlagEmoji code={driver.driverNationalityCode} className="mr-1" />
                  {driver.driverName} {driver.driverSeasonYear ?? ''}
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  {driver.teamName} · {formatCountryName(driver.teamCountryCode, locale)}
                </div>
              </div>
              <div className="text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">
                {driver.points}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="border border-[var(--border-subtle)] bg-[var(--background-panel)] p-4">
        <div className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
          {titleConstructors}
        </div>
        <ol className="space-y-2">
          {topConstructors.map((team, index) => (
            <li
              key={`${team.teamId}-${index}`}
              className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-[var(--text-muted)]">{index + 1}.</span>
                <LiveryMark
                  size="xs"
                  primaryColor={team.carLiveryPrimaryColor}
                  secondaryColor={team.carLiverySecondaryColor}
                  accentColor={team.carLiveryAccentColor}
                  label={team.carName || team.teamName}
                />
                <div className="min-w-0">
                  <div className="text-sm font-mono uppercase tracking-widest text-[var(--text-main)] truncate">
                    <FlagEmoji code={team.teamCountryCode} className="mr-1" /> {team.teamName}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    {team.carName} {team.carSeasonYear ?? ''}
                  </div>
                </div>
              </div>
              <div className="text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">
                {team.points}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
