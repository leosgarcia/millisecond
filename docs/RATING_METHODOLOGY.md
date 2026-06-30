# Metodologia de Ratings - millisecond

Este documento explica os princípios fundamentais por trás da curadoria de atributos para pilotos, carros e equipes em *millisecond*. O objetivo central da base de dados não é fornecer o "ranking definitivo da história da Fórmula 1", mas sim viabilizar uma simulação de jogo rica, equilibrada, determinística e explicável.

## 1. Como os ratings são definidos

Os ratings em *millisecond* não nascem de cálculos puros sobre tempos de volta ou pontuação histórica estrita, pois carros modernos são infinitamente mais rápidos que os clássicos. Em vez disso, os ratings são definidos por **Força Relativa e Dominância**.

Avaliamos as qualidades do piloto ou do carro em seu respectivo pico ou no contexto da temporada em questão, focando nos *traits* comportamentais (ex: estilo de guiada, ritmo de classificação, desgaste de pneus). O "overall" é apenas um índice guia, a simulação se alimenta diretamente dos micro-atributos.

## 2. Escala de 50 a 100

Todos os atributos numéricos (exceto quando explicitamente notado) usam a escala global do jogo:
- **98–100**: Nível Histórico Absoluto / Definidor de Era (Ex: Senna em Quali, Schumacher em Consistência).
- **94–97**: Elite Dominante (Excelente, mas não um outlier total).
- **90–93**: Campeão Mundial / Elite Forte.
- **85–89**: Muito Forte (Piloto consistente, carro que vence corridas).
- **80–84**: Bom Nível Competitivo (Pontuador regular, carro de pódio esporádico).
- **75–79**: Mediano Competitivo (Meio de grid consistente).
- **70–74**: Limitado (Padrão histórico fraco, fundão de grid da época).
- **60–69**: Fraco (Muito abaixo do padrão histórico aceitável em top tiers).
- **< 60**: Reservado apenas para casos extremos e catastróficos (ex: carros que não conseguiam classificar para a corrida).

## 3. Diferenças entre Eras

O "Princípio de Era" dita que um carro de 1988 será julgado pela sua eficácia em 1988.
A McLaren MP4/4 não perde pontos de *Aero Efficiency* apenas porque a Red Bull RB19 tem mais downforce num túnel de vento moderno. A MP4/4 tem um atributo massivo de *Aero Efficiency* porque dominou o arrasto e downforce *na sua respectiva era*.
Se uma simulação colocar Senna 1988 no grid contra Verstappen 2023, os algoritmos do jogo tratarão seus atributos de forma equiparada na escala de "força".

## 4. Rating Histórico vs Balanceamento de Jogo

Existem concessões necessárias para que o jogo seja divertido. 
Um carro infame por quebrar 80% das vezes (Reliability muito baixo) pode destruir a experiência de um jogador se simulado na exata mesma proporção. Nós impomos "soft caps" no balanceamento para que as penalidades, embora presentes, obedeçam a curva de diversão. A nota registrada no dataset em `data/curated/` reflete a visão do Designer de Jogo, não a de um historiador acadêmico purista.

## 5. Notas e Grau de Confiança

Todos os registros possuem duas tags vitais para a equipe de desenvolvimento:
- `evidence_notes`: Uma pequena explicação em texto do motivo daquelas notas (Ex: "Ayrton Senna teve poles consecutivas em 88 e 89, justificando 99 em Qualifying").
- `confidence_level`: (low, medium, high) - Representa o quão cimentado está esse rating. Pilotos com pouca documentação ou temporadas nebulosas recebem *low* ou *medium* e servem como aviso para revisões futuras da comunidade.

## 6. Revisão Contínua

O dataset V1 (Versão 1) não é final. À medida que o motor de simulação (`engine.ts` e `formulas.ts`) for testado exaustivamente em playtests, atributos inteiros podem ser nerfados (reduzidos) ou buffados (aumentados). Sugere-se nunca encostar no motor de simulação apenas para consertar um piloto que parece estar performando mal — altere as notas do piloto no dataset primeiro.
