import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { countryCodeToFlagEmoji } from '@/lib/country'
import LiveryMark from '@/components/ui/LiveryMark'
import FinalResultHero from '@/components/results/FinalResultHero'
import CampaignStatsCards from '@/components/results/CampaignStatsCards'
import TopStandingsPreview from '@/components/results/TopStandingsPreview'
import RaceTimeline from '@/components/results/RaceTimeline'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const messages: Record<string, string> = {
      roundOfTotal: `Race ${params?.round} of ${params?.total}`,
      condition: 'Condition',
      tireStress: 'Tire stress',
      safetyCar: 'Safety Car',
      podium: 'Podium',
      nextRace: 'Next race',
      revealAll: 'Reveal all',
      close: 'View championship',
      dryRace: 'Dry',
      wetRace: 'Wet',
      noSafetyCar: 'No',
      withSafetyCar: 'Yes',
      tireLow: 'Low',
      tireMedium: 'Medium',
      tireHigh: 'High',
      finalResult: 'Final result',
      points: 'Points',
      budgetUsed: 'Budget used',
      campaignDifficulty: 'Difficulty',
      campaignFormat: 'Format',
      constructorsChampion: 'Constructors champion',
      driversChampion: 'Drivers champion',
      decidingRace: 'Deciding race',
      winners: 'Winners',
      topDrivers: 'Top 5 drivers',
      topConstructors: 'Top 5 constructors',
      raceByRace: 'Race by race',
      technicalDiagnosis: 'Technical diagnosis',
      winsDetail: 'Race wins scored by your team',
      podiumsDetail: 'Top 3 finishes scored by your team',
      dnfsDetail: 'DNFs from your drivers',
      constructorsTotal: 'Total in the Constructors\' Championship',
      bestRaceDetail: 'Best campaign score',
      worstRaceDetail: 'Lowest campaign score',
      pointsPer100ms: 'Points per 100 ms',
      copySummary: 'Copy summary',
      simulateAgain: 'Simulate again',
      newTeam: 'New team',
    }

    if (key === 'roundOfTotal' && (!params || params.round == null || params.total == null)) {
      throw new Error('Missing params for roundOfTotal')
    }

    return messages[key] ?? key
  },
  useLocale: () => 'pt-BR',
}))

import RaceRevealModal from '@/components/ui/RaceRevealModal'

describe('Presentation helpers', () => {
  it('returns globe fallback for unknown country codes', () => {
    expect(countryCodeToFlagEmoji('BR')).toBe('🇧🇷')
    expect(countryCodeToFlagEmoji(undefined)).toBe('🌐')
    expect(countryCodeToFlagEmoji('??')).toBe('🌐')
  })

  it('renders LiveryMark with fallback neutral colors', () => {
    const html = renderToStaticMarkup(<LiveryMark label="Ferrari" />)

    expect(html).toContain('#64748B')
    expect(html).toContain('#1F2937')
    expect(html).toContain('#CBD5E1')
    expect(html).toContain('data-livery-mark="true"')
  })

  it('renders LiveryMark with provided colors', () => {
    const html = renderToStaticMarkup(
      <LiveryMark primaryColor="#DC0000" secondaryColor="#111111" accentColor="#FFFFFF" label="Ferrari F2004" />
    )

    expect(html).toContain('#DC0000')
    expect(html).toContain('#111111')
    expect(html).toContain('#FFFFFF')
  })

  it('renders FinalResultHero with player position and champion context', () => {
    const html = renderToStaticMarkup(
      <FinalResultHero
        title="RESULTADO FINAL"
        positionLabel="Você terminou em 6º nos construtores"
        teamName="Mercedes Lendária"
        teamCountryCode="DE"
        pointsLabel="121 pontos"
        difficultyLabel="Padrão"
        formatLabel="12 corridas · 10 equipes"
        budgetLabel="986 / 1000 ms"
        championDriverName="Lewis Hamilton"
        championDriverCountryCode="GB"
        championDriverSeasonYear={2020}
        championConstructorName="Ferrari 2004"
        championConstructorCountryCode="IT"
        championConstructorLivery={{ primaryColor: '#DC0000', secondaryColor: '#111111', accentColor: '#FFFFFF' }}
        decisiveRaceName="Suzuka"
        decisiveRaceCountryCode="JP"
        pointsTitle="Pontos"
        budgetTitle="Budget"
        difficultyTitle="Dificuldade"
        formatTitle="Formato"
        constructorsTitle="Campeão de construtores"
        driversTitle="Campeão de pilotos"
        decisiveRaceTitle="Corrida decisiva"
        livery={{ primaryColor: '#050505', secondaryColor: '#00D2BE', accentColor: '#C0C0C0' }}
      />
    )

    expect(html).toContain('Você terminou em 6º nos construtores')
    expect(html).toContain('Lewis Hamilton')
    expect(html).toContain('Campeão de construtores')
    expect(html).toContain('data-livery-mark="true"')
  })

  it('renders campaign stats without mixed-up country labels', () => {
    const html = renderToStaticMarkup(
      <CampaignStatsCards
        stats={[
          { label: 'Vitórias', value: 2, detail: 'Corridas vencidas pela sua equipe', tone: 'speed' },
          { label: 'Pódios', value: 3, detail: 'Top 3 conquistados pela sua equipe', tone: 'performance' },
          { label: 'Abandonos', value: 1, detail: 'DNFs dos seus pilotos', tone: 'warning' },
          { label: 'Pontos', value: 121, detail: 'Total no Mundial de Construtores', tone: 'telemetry' },
          { label: 'Eficiência', value: '12.3', detail: 'Pontos por 100 ms', tone: 'budget' },
          { label: 'Melhor corrida', value: 'Suzuka', detail: '28 pontos', tone: 'telemetry' },
          { label: 'Pior corrida', value: 'Monza', detail: '0 pontos', tone: 'warning' },
        ]}
      />
    )

    expect(html).toContain('DNFs dos seus pilotos')
    expect(html).toContain('Total no Mundial de Construtores')
    expect(html).not.toContain('Alemanha')
    expect(html).not.toContain('campeão de pilotos')
  })

  it('renders top standings preview and race timeline with livery marks', () => {
    const standingsHtml = renderToStaticMarkup(
      <TopStandingsPreview
        titleDrivers="Top 5 pilotos"
        titleConstructors="Top 5 construtores"
        locale="pt-BR"
        topDrivers={[
          {
            driverId: 'd1',
            driverName: 'Lewis Hamilton',
            driverSeasonYear: 2020,
            driverNationalityCode: 'GB',
            teamName: 'Mercedes',
            teamCountryCode: 'DE',
            points: 201,
          },
        ]}
        topConstructors={[
          {
            teamId: 'c1',
            teamName: 'Ferrari',
            teamCountryCode: 'IT',
            carName: 'Ferrari F2004',
            carSeasonYear: 2004,
            carLiveryPrimaryColor: '#DC0000',
            carLiverySecondaryColor: '#111111',
            carLiveryAccentColor: '#FFFFFF',
            points: 253,
          },
        ]}
      />
    )

    expect(standingsHtml).toContain('Top 5 pilotos')
    expect(standingsHtml).toContain('data-livery-mark="true"')

    const timelineHtml = renderToStaticMarkup(
      <RaceTimeline
        title="Corrida a corrida"
        selectedRaceIndex={0}
        onSelectRace={() => {}}
        races={Array.from({ length: 12 }, (_, index) => ({
          circuitId: `c${index + 1}`,
          circuitName: `Circuit ${index + 1}`,
          circuitCountry: 'IT',
          raceNumber: index + 1,
          podium: [
            {
              driverDisplayName: 'Lewis Hamilton',
              driverSeasonYear: 2020,
              teamName: 'Mercedes',
              countryCode: 'GB',
              carName: 'Mercedes W11',
              carSeasonYear: 2020,
              carLiveryPrimaryColor: '#050505',
              carLiverySecondaryColor: '#00D2BE',
              carLiveryAccentColor: '#C0C0C0',
            },
          ],
        }))}
      />
    )

    expect(timelineHtml).toContain('Circuit 1')
    expect(timelineHtml).toContain('data-livery-mark="true"')
  })

  it('renders the race reveal modal without missing placeholder params', () => {
    const html = renderToStaticMarkup(
      <RaceRevealModal
        race={{
          circuitId: 'c1',
          circuitName: 'Monza',
          circuitCountry: 'IT',
          raceNumber: 1,
          conditions: { isWet: false, hasSafetyCar: true, tireStressLevel: 'high' },
          explanations: [],
          qualifyingOrder: [],
          entries: [],
          podium: [
            {
              position: 1,
              driverName: 'Michael Schumacher',
              driverDisplayName: 'Michael Schumacher',
              driverSeasonYear: 2002,
              teamName: 'Ferrari',
              teamCountryCode: 'IT',
              countryCode: 'DE',
              carName: 'Ferrari F2004',
              carSeasonYear: 2004,
              carLiveryPrimaryColor: '#DC0000',
              carLiverySecondaryColor: '#111111',
              carLiveryAccentColor: '#FFFFFF',
            },
            {
              position: 2,
              driverName: 'Ayrton Senna',
              driverDisplayName: 'Ayrton Senna',
              driverSeasonYear: 1988,
              teamName: 'McLaren',
              teamCountryCode: 'GB',
              countryCode: 'BR',
              carName: 'McLaren MP4/4',
              carSeasonYear: 1988,
              carLiveryPrimaryColor: '#FFFFFF',
              carLiverySecondaryColor: '#E10600',
              carLiveryAccentColor: '#111111',
            },
            {
              position: 3,
              driverName: 'Max Verstappen',
              driverDisplayName: 'Max Verstappen',
              driverSeasonYear: 2023,
              teamName: 'Red Bull',
              teamCountryCode: 'AT',
              countryCode: 'NL',
              carName: 'Red Bull RB19',
              carSeasonYear: 2023,
              carLiveryPrimaryColor: '#0600EF',
              carLiverySecondaryColor: '#DC0000',
              carLiveryAccentColor: '#FCD700',
            },
          ],
        }}
        onNext={() => {}}
        onRevealAll={() => {}}
        isLastRace={false}
        totalRaces={12}
      />
    )

    expect(html).toContain('Race 1 of 12')
    expect(html).toContain('Michael Schumacher')
    expect(html).toContain('Ferrari F2004')
  })
})
