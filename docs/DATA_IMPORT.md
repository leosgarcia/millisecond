# Importação de Dados: pipeline de Seed

Em *millisecond*, o banco de dados não é populado através de grandes arquivos `.ts` contendo objetos hardcoded, mas sim através de uma pipeline de importação estruturada que lê os dados curados em JSON e os valida com rigor.

## Como funciona

O script `prisma/seed.ts` atua como um **Data Importer**.
Quando você roda o comando de seed, as seguintes etapas ocorrem:

1. **Wipe do Ambiente**: No ambiente de desenvolvimento (SQLite local), todas as instâncias existentes (Campanhas, Pilotos, Carros, etc) são apagadas (`deleteMany()`) para evitar conflitos de IDs e estados fantasmas. **Atenção:** isso significa que os dados de teste das campanhas são resetados a cada seed.
2. **Parsing & Zod Validation**: O script busca os arquivos localizados em `data/curated/*.v1.json`. Antes de enviar para o Prisma, cada arquivo é validado através de schemas estritos do Zod.
3. **Regras de Negócio enforced**:
   - Todo atributo de performance deve obrigatoriamente ser um número entre `50` e `100`.
   - Modificadores de filosofia de equipe (`TeamPhilosophy`) devem ser entre `-1.0` e `1.0`.
   - Atributos Boolean-like (ex: `stableRear`, `strongFrontEnd`) devem ser estritamente `0` ou `1`.
   - Propriedades textuais `notes` e `confidence_level` são requeridas para manter a sanidade e rastreabilidade da curadoria (embora `confidence_level` seja filtrado antes de inserir no banco, pois é apenas um metadado de curadoria).
4. **Inserção em Massa**: Os dados validados são inseridos via `prisma.[model].createMany()`.

## Como executar

Para rodar a importação de ponta a ponta e popular o seu banco de dados:

```bash
npm run db:seed
```

Se o seed falhar por erros do Zod, o terminal apontará exatamente qual arquivo e qual atributo quebrou as regras.

## Como testar o schema

O importador possui testes próprios em `src/tests/importer.test.ts`. Para verificar se os arquivos quebram as regras e se a lógica de falha está correta, rode:

```bash
npx vitest run src/tests/importer.test.ts
```
