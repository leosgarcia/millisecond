import ResultTable from '@/components/ui/ResultTable'
import FlagEmoji from '@/components/ui/FlagEmoji'
import LiveryMark from '@/components/ui/LiveryMark'

type DriverStanding = {
  driverId: string
  driverName: string
  driverSeasonYear?: number
  driverNationalityCode?: string
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

export default function FullTablesSection({
  titleDrivers,
  titleConstructors,
  labelPos,
  labelDriver,
  labelTeam,
  labelCar,
  labelPoints,
  drivers,
  constructors,
  playerTeamId,
}: {
  titleDrivers: string
  titleConstructors: string
  labelPos: string
  labelDriver: string
  labelTeam: string
  labelCar: string
  labelPoints: string
  drivers: DriverStanding[]
  constructors: ConstructorStanding[]
  playerTeamId: string
}) {
  return (
    <section className="grid gap-8 xl:grid-cols-2">
      <div>
        <div className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
          {titleDrivers}
        </div>
        <ResultTable
          columns={[
            { key: 'pos', label: labelPos },
            { key: 'driver', label: labelDriver },
            { key: 'team', label: labelTeam },
            { key: 'pts', label: labelPoints, align: 'right' },
          ]}
          data={drivers.map((driver, index) => ({
            pos: index + 1,
            driver: <span className="text-[var(--text-main)]"><FlagEmoji code={driver.driverNationalityCode} className="mr-1" /> {driver.driverName} {driver.driverSeasonYear ?? ''}</span>,
            team: (
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                <FlagEmoji code={driver.teamCountryCode} className="mr-1" /> {driver.teamName}
              </span>
            ),
            pts: <span>{driver.points}</span>,
          }))}
        />
      </div>
      <div>
        <div className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
          {titleConstructors}
        </div>
        <ResultTable
          columns={[
            { key: 'pos', label: labelPos },
            { key: 'team', label: labelTeam },
            { key: 'car', label: labelCar },
            { key: 'pts', label: labelPoints, align: 'right' },
          ]}
          data={constructors.map((team, index) => ({
            pos: index + 1,
            team: (
              <span className={team.teamId === playerTeamId ? 'text-[var(--accent-performance)] font-bold' : ''}>
                <LiveryMark
                  size="xs"
                  primaryColor={team.carLiveryPrimaryColor}
                  secondaryColor={team.carLiverySecondaryColor}
                  accentColor={team.carLiveryAccentColor}
                  label={team.carName || team.teamName}
                  className="mr-2 align-middle"
                />
                <FlagEmoji code={team.teamCountryCode} className="mr-1" /> {team.teamName}
              </span>
            ),
            car: (
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {team.carName} {team.carSeasonYear ?? ''}
              </span>
            ),
            pts: <span>{team.points}</span>,
          }))}
        />
      </div>
    </section>
  )
}
