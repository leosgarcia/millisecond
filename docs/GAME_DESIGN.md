# millisecond — Game Design Document

## Conceito

**millisecond** é um jogo web de simulação de Fórmula 1 histórica, focado em **lógica, determinismo e explicabilidade**.

> "Monte uma equipe lendária da Fórmula 1 e descubra se ela venceria por milésimos."

O jogador não enfrenta aleatoriedade pura. Cada resultado tem uma causa racional e explicável — baseada em compatibilidade entre elementos, perfil do circuito, sinergia de pilotos e filosofia de equipe.

---

## Loop Principal (MVP)

```
Landing Page
    ↓
Draft (Montagem da equipe)
  - Piloto Principal
  - Segundo Piloto
  - Chassi
  - Motor
  - Chefe de Equipe
  - Diretor Técnico
  - Filosofia
    ↓
Simulação de Campeonato (7 corridas)
  - Grid fantasma (4 equipes históricas)
  - Qualifying + Race por circuito
  - DNFs por confiabilidade e erros do piloto
    ↓
Resultados
  - Classificação de pilotos
  - Classificação de construtores
  - Explicações textuais por corrida
  - Explicação do campeonato
```

---

## Princípios de Design

### 1. Determinismo Total
- A mesma combinação de `(seed, equipe, circuitos)` sempre produz o mesmo resultado
- Nenhum `Math.random()` na lógica de negócio
- PRNG seeded (mulberry32) para variação controlada

### 2. Surpresa pela Combinação, Não pela Sorte
A variação interessante vem de:
- Compatibilidade piloto × carro (preferredCarTraits / weakCarTraits)
- Fit do carro no circuito (curvas lentas vs rápidas vs retas)
- Sinergia entre pilotos (politicalTension vs teamPlay)
- Filosofia de equipe aplicada sobre os atributos base
- Condições climáticas determinadas por seed

### 3. Explicabilidade Obrigatória
Cada resultado gera texto explicando **por que** aconteceu:
- "Seu carro foi forte em curvas rápidas, por isso teve vantagem em Silverstone."
- "O segundo piloto marcou poucos pontos, prejudicando o campeonato de construtores."
- "A filosofia conservadora reduziu abandonos, mas limitou vitórias."

### 4. Dados Históricos Plausíveis
Todos os pilotos, carros e motores são inspirados em eras reais da F1.
Os ratings são **preliminares** e devem ser refinados com balanceamento.

---

## MVP — Escopo Atual

| Feature | Status |
|---------|--------|
| Draft de equipe (7 slots) | ✅ |
| Grid fantasma (4 equipes) | ✅ |
| Simulação de 7 corridas | ✅ |
| Qualifying determinístico | ✅ |
| Race determinístico | ✅ |
| DNF por confiabilidade/erro | ✅ |
| Condições climáticas | ✅ |
| Pontuação F1 (25-18-15...) | ✅ |
| Classificação de pilotos | ✅ |
| Classificação de construtores | ✅ |
| Explicações por corrida | ✅ |
| Explicação do campeonato | ✅ |
| Seed data histórico | ✅ |
| Testes de determinismo | ✅ |

---

## Modos Futuros (Pós-MVP)

### Modo Temporada Longa
- 16-21 corridas (calendário completo histórico)
- Atualização do carro mid-season via development curve

### Modo Head-to-Head
- Dois jogadores montam equipes diferentes
- Simulam contra o mesmo grid fantasma com mesma seed

### Modo Draft Competitivo
- Pool limitado de ativos — cada ativo só pode ser escolhido por um jogador
- A etapa de filosofia deixa de ser um bônus genérico e passa a ser uma decisão estratégica com compatibilidade de pacote, risco e progressão ao longo da temporada

### Balance Validation Suite
- Rodadas determinísticas em lote para medir dominância, diversidade e eficiência por componente
- Não altera dataset nem fórmulas automaticamente
- Serve como gate antes de novos passes de balanceamento
- Gera relatórios em JSON, Markdown e CSV para análise técnica

### Modo Campanha Histórica
- Reviver temporadas reais: 1988, 1994, 2007...
- Desafio: derrotar o time dominante daquela era

### Leaderboard por Seed
- Compartilhar link com seed fixo
- Ver quem montou a melhor equipe para aquela seed específica

---

## Decisões de Arquitetura

- **Next.js App Router**: Server components + route handlers
- **Prisma + SQLite**: Dados locais no desenvolvimento
- **Zod**: Validação de input da API e tipos compartilhados
- **Vitest**: Testes unitários da lógica de domínio (isolada da UI)
- Toda simulação vive em `src/domain/simulation/` — sem acoplamento React
- JSON storage para resultados de campanha (simples para MVP)
