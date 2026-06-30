# UI Style Guide: Timing Tower UI

O **Timing Tower UI** é o conceito estético central do projeto millisecond. É projetado para evocar a atmosfera fria, focada e técnica de um Pit Wall de Fórmula 1 ou de uma torre cronométrica. 

## 🚫 O Que Evitar (Regra de Ouro)
- **Zero Imagens ou Ilustrações**: Não dependa de banners generativos, ilustrações 3D ou IA geradora. 
- **Sem visual SaaS B2B**: Botões arredondados em excesso, sombras massivas (drop-shadow exageradas) ou fontes "felizes".
- **Sem Emojis exagerados**: Use ícones de emoji estritamente quando necessário para denotar status (como 🏁 ou 🚨).

## 🎨 Paleta de Cores
Tudo flutua num fundo quase preto com bordas sutis cinza e grid minimalista.
- `background-main`: `#050507` (Fundo global e do site)
- `background-panel`: `#0B0D10` (Painéis secundários, cabeçalhos de tabela)
- `background-card`: `#111318` (Cards ativos)
- `border-subtle`: `#242833`
- `text-main`: `#F4F4F5`
- `text-muted`: `#9CA3AF`

### Accents (Neon Tecnológico)
Usados de forma cirúrgica para chamar atenção para métricas importantes.
- `accent-speed` (Vermelho F1): `#FF2D2D`
- `accent-budget` (Laranja): `#FF8A00`
- `accent-performance` (Verde Telemetria): `#39FF88`
- `accent-telemetry` (Azul Display): `#38BDF8`
- `accent-warning` (Amarelo FIA): `#FACC15`

## 🧱 Componentes Reutilizáveis
- **`AppShell`**: O container base para as páginas, fixando a largura máxima de 1200px, fundo grid CSS e footer técnico.
- **`SectionHeader`**: Cabeçalhos de seção, usando `uppercase` e tracking extra (`tracking-widest`).
- **`TelemetryCard`**: Cartão com indicador colorido na borda esquerda, título em caixa alta pequeno (`text-[10px]`) e número em fonte mono.
- **`TimingBar`**: Barra de progresso contínua minimalista (`h-1`).
- **`BudgetMeter`**: Indicador global de consumo, muda a cor da barra de laranja para vermelho caso ultrapasse o cap.
- **`ResultTable`**: Tabelas de classificação, visual semelhante a um monitor de tempos (headers discretos, linhas demarcadas, texto mono-espaçado).

## 📐 Tipografia
O texto geral usa a família base sans-serif, mas todos os números, títulos, labels descritivas ou métricas (PTS, MS, POS) devem utilizar **Font Mono** (`font-mono`) misturado com `uppercase` e espaçamento amplo entre letras (`tracking-widest`).
