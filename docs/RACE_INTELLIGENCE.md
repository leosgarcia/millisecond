# Race Intelligence & Season Narrator

## Arquitetura de Explicabilidade

O jogo **millisecond** utiliza um motor de simulação determinístico. Para explicar os resultados de forma coerente e baseada em dados sem recorrer a IAs externas (como ChatGPT ou LLMs genéricos, para preservar determinismo e evitar "alucinações" que contrariam o motor do jogo), desenvolvemos um sistema híbrido de "diagnóstico e narrativa":

### 1. `diagnostics.ts`
Extrai dados puros (pontuações) e fatores lógicos (`ScoreBreakdown`) do motor, mapeando-os para `RaceDiagnostics` e `TeamSeasonDiagnostics`.
Neste módulo, o jogo define quantitativamente:
- **Gargalos:** "Qual peça segurou o time?" (Ex: Chassi teve low track fit em 5/7 provas).
- **Forças e Fraquezas:** Analisando os limites superiores/inferiores daquela corrida.
- **Eficiência de Budget:** "Quantos pontos por ms?"
- **Impacto de Piloto:** "O piloto valeu os 300ms investidos?"

### 2. `narrator.ts`
Recebe o _Output_ puro de `diagnostics.ts` e gera frases consistentes.
Por ser baseado em regras (`if / else`), o narrador garante:
- **Sem falsas causas:** A narrativa nunca diz "perdeu por batida" se a causa matemática do DNF foi motor.
- **Determinismo:** O texto é 100% igual se os mesmos diagnósticos forem alcançados.
- **Explicabilidade Racional:** A frustração de derrota é minimizada ao expor exatamente onde a equipe pode ser melhorada (ex: "gargalo no motor em retas longas").

## Fluxo de Execução
1. API recebe requisição e simula a temporada.
2. Motor (`engine.ts`) coleta `ScoreBreakdown` de todas as entradas e gera a hierarquia de resultados.
3. `engine.ts` mapeia todos os breakdowns via `buildRaceDiagnostics`.
4. `engine.ts` chama `buildTeamSeasonDiagnostics`.
5. O pacote de dados é enviado para `narrator.ts`, que gera os _summaries_.
6. A API retorna `SimulationDiagnostics` completo, consumido na UI para guiar o jogador em suas próximas estratégias.
