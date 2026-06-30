# Balance Validation Report

## Configuração
- runs: 1
- difficulty: standard
- format: standard
- seed base: balance-validation-smoke
- data version: curated-v1

## Resumo Executivo
- status geral: Crítico
- total de simulações: 1
- win rate do jogador: 0%
- média de pontos do jogador: 119
- média de posição do jogador: 4
- principais alertas: CRITICAL Piloto dominante; CRITICAL Chassi dominante; WARNING Segundo piloto irrelevante; WARNING Development package sem progressão; WARNING Monza sem motor forte
- principais recomendações: Considere aliviar o peso do piloto principal ou aumentar a importância do chassi, do motor e da filosofia.; Considere revisar calculateCarTrackFit ou reduzir o impacto do overall do chassi em circuitos mistos.; Considere aumentar a sensibilidade de power_track, coolingDemand e racePaceSustainability.; Segundo piloto ainda contribui pouco para o Mundial. Vale revisar o peso de driverSecondary e teamPlay.; Development-focused não está deixando o carro mais forte no fim da temporada. Considere reforçar a progressão por fase.; Monza não está premiando potência o bastante. Reforce calculateEngineTrackFit para power_track.

## Distribuição de Campeões

### Pilotos
| Piloto | Vitórias | Share |
|---|---:|---:|
| Nick Heidfeld | 1 | 100% |
| Kimi Raikkonen | 0 | 0% |
| Riccardo Patrese | 0 | 0% |
| Ayrton Senna | 0 | 0% |
| Valtteri Bottas | 0 | 0% |
| Jacques Villeneuve | 0 | 0% |
| Damon Hill | 0 | 0% |
| Clay Regazzoni | 0 | 0% |
| Jim Clark | 0 | 0% |
| David Coulthard | 0 | 0% |

### Construtores
| Construtor | Vitórias | Share |
|---|---:|---:|
| McLaren MP4-20 | 1 | 100% |
| McLaren MP4/4 | 0 | 0% |
| Ferrari F2007 | 0 | 0% |
| Ferrari F1-75 | 0 | 0% |
| Mercedes-AMG F1 W11 EQ Performance | 0 | 0% |
| McLaren MP4-23 | 0 | 0% |
| McLaren MCL38 | 0 | 0% |
| Benetton B194 | 0 | 0% |

## Eficiência por Budget
### Melhores pilotos
| Piloto | Pontos médios | Pontos / 100ms |
|---|---:|---:|
| Nick Heidfeld | 174 | 1.6 |
| Alain Prost | 140 | 0.6 |
| Jacques Villeneuve | 132 | 0.8 |
| Damon Hill | 92 | 0.6 |
| Max Verstappen | 91 | 0.4 |
| Jackie Stewart | 76 | 0.4 |
| Kimi Raikkonen | 70 | 0.3 |
| Michael Schumacher | 66 | 0.3 |
| Ayrton Senna | 65 | 0.3 |
| Carlos Sainz | 60 | 0.5 |

### Melhores chassis
| Chassi | Pontos médios | Pontos / 100ms |
|---|---:|---:|
| McLaren MP4-20 | 212.5 | 0.9 |
| Ferrari F1-75 | 112 | 0.5 |
| Ferrari F2007 | 130 | 0.6 |
| Mercedes-AMG F1 W11 EQ Performance | 101 | 0.4 |
| Benetton B194 | 101 | 0.5 |
| McLaren MP4/4 | 93 | 0.4 |
| McLaren MP4-23 | 92 | 0.4 |
| McLaren MCL38 | 46 | 0.2 |

## Impacto por Componente
- driverPrimary: -6 pts médio (-3.5%). If the primary driver impact is too low, increase driverPrimary weight or sharpen qualifying/race score separation.
- driverSecondary: 24 pts médio (14.1%). If the second driver barely matters, increase teamPlay, constructor synergy, or secondary driver contribution.
- car: 15.3 pts médio (9.0%). If the car is too weak in sensitivity, increase track-fit weights or circuit-specific penalties.
- engine: 5.3 pts médio (3.1%). If engines do not shift results enough, increase power-track and cooling penalties.
- teamPrincipal: -1 pts médio (-0.6%). If team principals are negligible, increase operational and strategic influence.
- technicalDirector: -29.8 pts médio (-17.5%). If technical directors barely move the needle, strengthen development and setup factors.
- philosophy: -36.5 pts médio (-21.5%). If philosophy is flat, strengthen contextual modifiers and phased development growth.

## Filosofias
- aggressive: vitórias 1, DNFs 17, pontos médios 218
- balanced: vitórias 0, DNFs 19, pontos médios 128.3
- conservative: vitórias 0, DNFs 14, pontos médios 57
- qualifying-focused: vitórias 0, DNFs 5, pontos médios 92

## Sensibilidade por Pista
- Autodromo Nazionale Monza: vencedor high_speed_aero_package, vice power_package, gap 6. Monza should reward straight-line speed, engine power and braking conversion.
- Circuit de Monaco: vencedor high_speed_aero_package, vice power_package, gap 9.3. Monaco should reward slow-corner precision, grid position and setup quality.
- Circuit de Spa-Francorchamps: vencedor high_speed_aero_package, vice power_package, gap 12.0. Spa should reward aero balance, fast corners and wet versatility.
- Suzuka International Racing Course: vencedor high_speed_aero_package, vice power_package, gap 10.3. Suzuka should reward flow, mid-speed confidence and overall driver rhythm.
- Marina Bay Street Circuit: vencedor high_speed_aero_package, vice power_package, gap 1.7. Singapore should reward low-error packages, reliability and cooling control.
- Bahrain International Circuit: vencedor high_speed_aero_package, vice power_package, gap 3. Bahrain should reward strong engines, reliability and thermal management.

## Outliers
- [CRITICAL] Piloto dominante: Nick Heidfeld venceu mais de 35% dos campeonatos da bateria.
- [CRITICAL] Chassi dominante: McLaren MP4-20 aparece em mais de 35% dos campeões de construtores.
- [WARNING] Segundo piloto irrelevante: O segundo piloto aparece com menos de 15% da eficiência do líder do grid.
- [WARNING] Development package sem progressão: A filosofia development-focused não está superando a baseline no terço final esperado.
- [WARNING] Monza sem motor forte: Monza não está sendo claramente premiada por pacotes de potência.
- [CRITICAL] Mesmo pacote dominando tudo: O mesmo pacote venceu todos os circuitos auditados: high_speed_aero_package.
- [CRITICAL] Dominância excessiva de piloto: Nick Heidfeld está acima do limite de dominância.
- [CRITICAL] Dominância excessiva de chassi: McLaren MP4-20 está acima do limite de dominância.
- [CRITICAL] Dominância excessiva de motor: Renault EF15B 1.5 V6 Turbo 1986 está acima do limite de dominância.
- [WARNING] Filosofia dominante: aggressive está aparecendo demais entre os campeões.

## Recomendações
- Considere aliviar o peso do piloto principal ou aumentar a importância do chassi, do motor e da filosofia.
- Considere revisar calculateCarTrackFit ou reduzir o impacto do overall do chassi em circuitos mistos.
- Considere aumentar a sensibilidade de power_track, coolingDemand e racePaceSustainability.
- Segundo piloto ainda contribui pouco para o Mundial. Vale revisar o peso de driverSecondary e teamPlay.
- Development-focused não está deixando o carro mais forte no fim da temporada. Considere reforçar a progressão por fase.
- Monza não está premiando potência o bastante. Reforce calculateEngineTrackFit para power_track.
