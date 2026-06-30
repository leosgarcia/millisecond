# millisecond — Team Philosophies

As filosofias de equipe são escolhas estratégicas do Draft que ajustam o comportamento do pacote ao longo da temporada sem quebrar o determinismo do simulador.

## Filosofias

### balanced

- Sem grande bônus ou penalidade.
- Recomendação neutra quando não há encaixe claro.

### aggressive

- Busca poles, vitórias e ultrapassagens.
- Aumenta risco de erro, desgaste e abandono.

### conservative

- Prioriza terminar corridas, preservar pneus e evitar perdas.
- Boa escolha para pacotes frágeis ou campanhas de construtores.

### qualifying_focused

- Favorece volta rápida e posição de largada.
- Mais forte em pistas com ultrapassagem difícil, como Monaco e Singapore.

### development_focused

- Sacrifica desempenho inicial para ganhar força ao longo da temporada.
- Em `quick`, a recomendação cai porque há poucas corridas para colher o retorno.

## Fit

O jogo usa `evaluatePhilosophyFit(selection, philosophy, championshipFormat)` para sugerir uma filosofia com base em:

- confiabilidade do carro e motor;
- consistência e risco do piloto principal;
- força técnica da dupla de chefe e diretor técnico;
- formato do campeonato.

## Progressão de `development_focused`

- Corridas 1–4: penalidade inicial.
- Corridas 5–8: recuperação parcial.
- Corridas 9+ : ganho claro de performance e confiabilidade.

## Ghost Teams

Os Ghost Teams escolhem filosofia de forma determinística e coerente com o arquétipo:

- `balanced_constructor` -> `balanced`
- `aero_monster` -> `qualifying_focused` ou `aggressive`
- `straight_line_rocket` -> `aggressive`
- `wet_weather_specialists` -> `conservative` ou `balanced`
- `reliability_machine` -> `conservative`
- `qualifying_kings` -> `qualifying_focused`
- `elite_driver_underdog_car` -> `conservative` ou `development_focused`

## Boas práticas

- Não usar labels abreviados em inglês na UI pt-BR.
- Não tratar filosofia como bônus fixo.
- Sempre considerar o contexto da pista e do formato.
