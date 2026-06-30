# Balance Validation Suite

Esta suíte executa simulações determinísticas em volume controlado para medir se o balanceamento do jogo continua coerente após ajustes de dataset, fórmula ou sensibilidade por pista.

## Objetivo

- medir dominância de pilotos, chassis, motores, chefes, diretores e filosofias;
- verificar se circuitos diferentes premiam pacotes diferentes;
- medir impacto de componentes por comparação pareada;
- gerar alertas e recomendações sem alterar dados automaticamente.

## Comandos

```bash
npm run balance:smoke
npm run balance:validate
npm run balance:deep
```

Também é possível parametrizar:

```bash
npm run balance:validate -- --runs=500 --difficulty=hard --format=standard
```

## Modos

- `smoke`: amostra pequena para verificação rápida.
- `standard`: rodada padrão para auditoria cotidiana.
- `deep`: volume alto para revisão mais pesada, quando o tempo permitir.

## Estratégia

A suíte combina:

- amostragem determinística com seeds derivadas de `balance-validation-{mode}-{index}`;
- cenários de arquétipo fixos;
- comparações pareadas por componente;
- leitura de alertas por thresholds.

## Arquivos gerados

- `reports/balance-validation.json`
- `reports/balance-validation.md`
- `reports/balance-validation-summary.csv`

## Alertas

Os alertas ficam classificados como:

- `info`
- `warning`
- `critical`

Exemplos:

- piloto dominante;
- chassi dominante;
- motor dominante;
- segundo piloto irrelevante;
- filosofia agressiva sem risco;
- desenvolvimento sem progressão;
- circuito de potência sem recompensa clara;
- mesmo pacote dominando todas as pistas auditadas.

## Como interpretar

- se o mesmo pacote vence tudo, a sensibilidade por pista está fraca;
- se o jogador vence demais em `standard` ou `hard`, a dificuldade está baixa;
- se o segundo piloto quase não altera o campeonato, o peso construtores/dupla precisa revisão;
- se `development_focused` não melhora no fim da temporada, a progressão por fase precisa reforço.

## Regra de ouro

A suíte mede e recomenda. Ela não altera dataset, fórmulas nem budget sozinha.
