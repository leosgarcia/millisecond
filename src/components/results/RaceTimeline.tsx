import LiveryMark from '@/components/ui/LiveryMark'
import FlagEmoji from '@/components/ui/FlagEmoji'

export type RaceTimelineEntry = {
  circuitId: string
  circuitName: string
  circuitCountry: string
  raceNumber: number
  winnerDriverDisplayName?: string
  winnerDriverSeasonYear?: number
  winnerCountryCode?: string
  winnerTeamName?: string
  winnerCarName?: string
  winnerCarSeasonYear?: number
  winnerCarLiveryPrimaryColor?: string
  winnerCarLiverySecondaryColor?: string
  winnerCarLiveryAccentColor?: string
  podium: {
    driverDisplayName: string
    driverSeasonYear?: number
    teamName: string
    countryCode: string
    carName?: string
    carSeasonYear?: number
    carLiveryPrimaryColor?: string
    carLiverySecondaryColor?: string
    carLiveryAccentColor?: string
  }[]
}

export default function RaceTimeline({
  title,
  races,
  selectedRaceIndex,
  onSelectRace,
}: {
  title: string
  races: RaceTimelineEntry[]
  selectedRaceIndex: number
  onSelectRace: (index: number) => void
}) {
  return (
    <section>
      <div className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
        {title}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {races.map((race, index) => {
          const winner = race.podium[0]
          return (
            <button
              key={race.circuitId}
              type="button"
              onClick={() => onSelectRace(index)}
              className={`text-left border p-4 transition-colors ${
                selectedRaceIndex === index
                  ? 'border-[var(--accent-telemetry)] bg-[rgba(56,189,248,0.06)]'
                  : 'border-[var(--border-subtle)] bg-[var(--background-card)] hover:bg-[var(--background-panel)]'
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
                  {race.raceNumber} · <FlagEmoji code={race.circuitCountry} className="ml-1" />
                </div>
              </div>
              <div className="mb-2 text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">
                {race.circuitName}
              </div>
              <div className="flex items-start gap-3">
                {winner && (
                  <LiveryMark
                    size="xs"
                    primaryColor={winner.carLiveryPrimaryColor}
                    secondaryColor={winner.carLiverySecondaryColor}
                    accentColor={winner.carLiveryAccentColor}
                    label={winner.carName}
                  />
                )}
                <div className="min-w-0 space-y-1">
                  {winner && (
                    <div className="text-xs font-mono uppercase tracking-widest text-[var(--text-main)] truncate">
                      🥇 <FlagEmoji code={winner.countryCode} className="mr-1" /> {winner.driverDisplayName}
                    </div>
                  )}
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    {winner?.teamName}
                    {winner?.carSeasonYear ? ` · ${winner.carName} ${winner.carSeasonYear}` : winner?.carName}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
