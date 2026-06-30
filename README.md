# Millisecond

Projeto web focado em performance e robustez, utilizando uma stack moderna e ferramentas de validação de dados.

## 🛠 Tecnologias Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Estilização**: [React 19](https://react.dev/), [TailwindCSS v4](https://tailwindcss.com/)
- **Banco de Dados & ORM**: [SQLite](https://www.sqlite.org/), [Prisma](https://www.prisma.io/)
- **Testes**: [Vitest](https://vitest.dev/)
- **Validação e Ferramentas**: Zod, ESLint, Prettier

## 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18.17 ou superior recomendada)
- `npm` ou `yarn` ou `pnpm` ou `bun`

## 🚀 Instalação e Configuração

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/leosgarcia/millisecond.git
   cd millisecond
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Na raiz do projeto já é esperado um arquivo `.env`. Certifique-se de que ele contenha a configuração do seu banco de dados local:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Prepare o banco de dados:**
   Execute as migrações do Prisma e crie o banco de dados local:
   ```bash
   npm run db:migrate
   ```
   Caso haja um script de seed:
   ```bash
   npm run db:seed
   ```

## 💻 Rodando Localmente

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação rodando.

## 📁 Estrutura Básica

- `/src` - Código fonte principal (páginas, componentes e API)
- `/prisma` - Schema do banco de dados e migrações
- `/scripts` - Scripts úteis para o projeto, incluindo auditorias
- `/public` - Arquivos estáticos
- `/docs` - Documentação adicional

## 📜 Licença

Este projeto está licenciado sob a licença MIT - sinta-se à vontade para modificar a licença, caso necessário.
