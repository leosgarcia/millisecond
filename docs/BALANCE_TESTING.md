# millisecond — Balance Testing

Este guia descreve como validar se o simulador continua determinístico e se a distribuição do grid está coerente após ajustes de rating, custo ou fórmulas.

## Auditorias disponíveis

```bash
pnpm audit:dataset
pnpm audit:track-sensitivity
pnpm audit:component-impact
pnpm audit:budget-efficiency
npm run balance:smoke
npm run balance:validate
npm run balance:deep
```

## O que cada relatório responde

- `dataset-audit`: médias, medianas, desvios, top/bottom e outliers por atributo.
- `wet-skill-audit`: distribuição de chuva e candidatos a revisão.
- `track-sensitivity`: se circuitos diferentes estão premiando pacotes diferentes.
- `component-impact`: quanto cada componente realmente mexe no campeonato.
- `budget-efficiency`: quais itens parecem caros, baratos ou mal precificados.
- `balance-validation`: suíte de validação em massa para campeonatos, componentes, filosofias e pistas.

## Leitura rápida da rodada atual

- `wetSkill` saiu de um topo inflado para uma distribuição mais rara no extremo.
- `component-impact` ainda aponta piloto principal e carro como maiores alavancas, mas o motor voltou a importar.
- `track-sensitivity` ganhou mais contraste, mas agora acende um alerta crítico em Monaco porque `power_package` ainda está forte demais para uma rua tão travada.

## Regra prática

1. Se o mesmo pacote vence todas as pistas, a sensibilidade por circuito ainda está fraca.
2. Se o piloto principal domina sozinho, a fórmula está concentrando peso demais em um único eixo.
3. Se o motor quase não altera o campeonato, o powertrain precisa de mais presença nas fórmulas ou no dataset.
4. Se `wetSkill` fica muito concentrado perto do topo, a chuva perdeu valor como diferencial.
5. Se um componente sobe demais depois de uma compressão de ratings, o próximo passo é mexer em pesos ou reequilíbrio do dataset, não aumentar ruído.
6. Se um mesmo pacote vence várias pistas diferentes, mas por motivos coerentes com a pista, isso é aceitável enquanto não houver domínio universal.
7. Se a suíte de balanceamento acusa um alerta crítico, a próxima ação é entender a causa antes de mexer em fórmula ou dataset.

## Determinismo

As auditorias devem sempre rodar com o mesmo seed quando o objetivo for comparação direta.
Isso evita ruído e permite diferenciar mudança real de simples variação amostral.

## Balance Validation

Use `npm run balance:smoke` para uma checagem rápida, `npm run balance:validate` para a rodada padrão e `npm run balance:deep` quando precisar de uma amostragem mais pesada.
Os relatórios gerados servem como base para decidir se vale mexer em `budgetCost`, nas fórmulas de track fit ou em ratings do dataset.
