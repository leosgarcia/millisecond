# Deploying millisecond on Vercel

O projeto foi projetado para rodar primariamente em ambientes serverless como a Vercel. 
Devido às restrições do Vercel Serverless Functions com SQLite (que não permite escrita durável em disco sem uso de volumes persistentes avançados), introduzimos o **Modo Beta (Sem Persistência)**.

## Variáveis de Ambiente Necessárias
Configure as seguintes variáveis de ambiente no painel da Vercel:

```env
# URL para onde o testador será redirecionado para enviar feedback (ex: Google Forms, Typeform)
NEXT_PUBLIC_FEEDBACK_URL="https://forms.gle/exemplo"

# Desabilita a escrita no SQLite SQLite em ambiente serverless. O motor de simulação roda normalmente e retorna na UI, apenas não persiste o histórico de campanha.
NEXT_PUBLIC_ENABLE_DB_PERSIST="false"
```

## Checklist Pré-Deploy
1. **Instalação:** `pnpm install`
2. **Setup do banco local:** O arquivo `prisma/dev.db` precisa ser commitado no repositório apenas para servir como um *Read-only Database* em produção para a Vercel ler os Ratings dos pilotos e carros na inicialização da Rota.
   - Rode `npx prisma db push` e `npx tsx prisma/seed.ts` antes de commitar se o banco estiver vazio.
3. **Build local:** `pnpm build` para garantir que o Next.js e o Next-Intl conseguem pré-renderizar tudo sem crashes do Prisma.
4. **Testes:** `pnpm test`

## Checklist Pós-Deploy
1. Acesse a URL gerada pela Vercel.
2. Complete um draft.
3. Inicie uma simulação.
4. Confirme que a página carrega os resultados e exibe a faixa do "Feedback" sem erros HTTP 500.

## Alternativa Futura (Banco Remoto)
Para o release final, será necessário trocar o `provider = "sqlite"` por `provider = "postgresql"` no `schema.prisma` e usar um banco como Vercel Postgres, Supabase ou Neon, eliminando a restrição de "Read Only" e setando `NEXT_PUBLIC_ENABLE_DB_PERSIST="true"`.
