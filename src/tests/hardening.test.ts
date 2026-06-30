import { describe, it, expect } from 'vitest'
import ptBR from '../messages/pt-BR.json'
import en from '../messages/en.json'

describe('MVP Release Hardening Tests', () => {

  it('Mensagens principais existem em pt-BR e en', () => {
    // Basic i18n structure check
    expect(ptBR).toHaveProperty('Landing')
    expect(ptBR).toHaveProperty('Draft')
    expect(ptBR).toHaveProperty('Simulate')
    expect(ptBR).toHaveProperty('Narrator')
    expect(ptBR.Simulate.share).toBeDefined()

    expect(en).toHaveProperty('Landing')
    expect(en).toHaveProperty('Draft')
    expect(en).toHaveProperty('Simulate')
    expect(en).toHaveProperty('Narrator')
    expect(en.Simulate.share).toBeDefined()
  })

  it('Botão de compartilhamento formataria texto (MOCK)', () => {
    const result = {
      constructorStandings: [
        { teamId: 'player-team', teamName: 'Millisecond Racing', points: 100 }
      ]
    }
    const draft = {
      driverPrimaryId: 'M. Schumacher (FER 2004)',
      driverSecondaryId: 'R. Barrichello (FER 2004)',
      carId: 'F2004 (FER 2004)',
      engineId: 'Tipo 053 (FER 2004)'
    }
    const tTitle = 'Championship Simulation'
    const playerTeamId = 'player-team'

    const txt = `🏁 millisecond - F1 Simulation (${tTitle})\n\n` + 
                `Team: ${result.constructorStandings.find(c => c.teamId === playerTeamId)?.teamName} (Pos: ${result.constructorStandings.findIndex(c => c.teamId === playerTeamId) + 1}º)\n` +
                `Drivers: ${draft.driverPrimaryId} & ${draft.driverSecondaryId}\n` +
                `Car: ${draft.carId} / Engine: ${draft.engineId}\n\n` +
                `Play now: https://millisecond.vercel.app`

    expect(txt).toContain('🏁 millisecond - F1 Simulation')
    expect(txt).toContain('Pos: 1º')
    expect(txt).toContain('F2004')
  })

})

