# O Teto de Gastos (Budget Cap)

A essência do **millisecond** não é apenas colocar lendas juntas para ver o que acontece. A graça do jogo reside nas escolhas táticas. É por isso que adotamos o sistema de **Budget Cap**.

## Por que a unidade é "ms" (milissegundos)?
Na Fórmula 1 histórica, orçamentos não eram controlados, mas o tempo de pista sempre foi o recurso mais valioso. Nós abstraímos o "valor" de uma lenda usando o "ms" (milissegundo). Quando você contrata o Adrian Newey ou o Michael Schumacher, você está literalmente pagando para reduzir seus tempos de volta na simulação.

## O Limite de 1000 ms
O teto orçamentário padrão de uma campanha é rigidamente estabelecido em **1000 ms**. O jogador precisa compor sua equipe (Carro, Motor, Piloto 1, Piloto 2, Chefe de Equipe, Diretor Técnico) sem ultrapassar esse valor.

### Como os custos são definidos?
A tabela de preços (*budgetCost*) não é puramente arbitrária. Ela foi escalada de acordo com as seguintes faixas:

- **Pilotos Principais:**
  - Tier S (Lendas absolutas): 190–230 ms
  - Tier A (Campeões e elite): 150–190 ms
  - Tier B (Muito fortes): 100–150 ms
  - Tier C (Gerais): 70–100 ms
- **Segundos Pilotos:** Elite (110-150 ms) até Baratos (50-80 ms)
- **Carros/Chassis:** 
  - Dominantes (ex: MP4/4, F2004): 210–250 ms
  - Campeões Fortes: 170–210 ms
  - Competitivos / Underdogs: 70–170 ms
- **Motores:** Variação de 40 a 180 ms.
- **Chefes e Diretores:** Variando de 40 até 150 ms (para cabeças lendárias como Todt ou Newey).

## Balanceamento Automático de Fantasmas
A mesma restrição se aplica para a IA (Fantasmas) gerada pela API do jogo na rota `POST /api/simulate`. Se a equipe de um fantasma histórico natural estourar o limite, o simulador irá tentar regerar uma equipe aleatória sob a mesma semente `seed` até encontrar uma equipe válida que gaste no máximo 1000 ms. Se após 50 tentativas nenhuma for encontrada (muito raro), uma equipe de "economia forçada" é atribuída (onde as peças mais baratas de cada prateleira são usadas).

## Explicabilidade 
O orçamento que você escolhe conta uma história!
Se o jogador gastar 60% dos 1000ms nos dois pilotos, o `explainer` gerará uma resposta dinâmica nas resenhas do fim do campeonato avisando que *"Sua equipe concentrou grande parte do orçamento nos pilotos. A falta de investimento no chassi limitou o teto..."*. O mesmo vale para altos gastos apenas em liderança ou focar num carro absurdo e pegar um piloto barato de 50ms que não fará jus à máquina.

## Validação de Back-end
Nunca confie no cliente (Frontend). Mesmo que a UI bloqueie a simulação quando passa de 1000ms, o endpoint `/api/simulate` sempre executará `validateBudgetCap(team)` e devolverá um `HTTP 400` caso malícias sejam enviadas, impedindo a engine de simular trapacas.
