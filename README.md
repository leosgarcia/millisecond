<div align="center">
  <h1>🚀 Millisecond</h1>
  <p><strong>A blazing fast, robust, and modern Next.js web application</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![SQLite](https://img.shields.io/badge/SQLite-Better_SQLite3-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)
  [![Vitest](https://img.shields.io/badge/Vitest-4.1.9-729B1B?style=for-the-badge&logo=vitest)](https://vitest.dev/)
</div>

<br/>

## 📖 About The Project

**Millisecond** is engineered for speed, reliability, and developer experience. Built on top of the latest features of **Next.js 16** and **React 19**, it ensures optimal performance right out of the box. The project adopts **Tailwind CSS v4** for sleek, utility-first styling and leverages **Prisma** with a **Better-SQLite3** adapter for an incredibly fast and type-safe database layer. 

Data validation is strictly handled by **Zod**, and code quality is maintained automatically via **ESLint** and **Prettier**.

---

## ✨ Features

- **Blazing Fast UI**: Powered by React 19 and Next.js 16.
- **Type-Safe ORM**: Prisma perfectly integrated with TypeScript.
- **Rapid Styling**: Next-generation utility classes with TailwindCSS v4.
- **Robust Testing**: Fast and concurrent unit testing powered by Vitest.
- **Strict Linting & Formatting**: Pre-configured ESLint and Prettier setup.
- **Built-in Scripts**: Out-of-the-box audit and validation scripts to guarantee data and component integrity.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local environment:
- **Node.js** (v18.17 or higher recommended)
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/leosgarcia/millisecond.git
   cd millisecond
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory (if not already present) with your local database URL:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize the Database:**
   Run Prisma migrations to create the SQLite database and generate the Prisma Client:
   ```bash
   npm run db:migrate
   ```
   *Optional: If you have seed data, run the seeder:*
   ```bash
   npm run db:seed
   ```

---

## 💻 Running Locally

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

---

## 🛠 Available Commands

The following npm scripts are available for managing the application:

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Next.js development server. |
| `npm run build` | Builds the application for production. |
| `npm run start` | Starts the production server. |
| `npm run lint` | Runs ESLint to check for code issues. |
| `npm run format` | Runs Prettier to format the codebase. |
| `npm run test` | Runs the Vitest test suite. |
| `npm run db:studio` | Opens Prisma Studio to visually interact with your database. |
| `npm run db:migrate` | Applies Prisma migrations and generates the client. |

---

## 📂 Project Structure

```text
millisecond/
├── src/            # Application source code (Pages, Components, API, Lib)
├── prisma/         # Prisma schema and database migrations
├── scripts/        # Custom audit and validation utilities
├── public/         # Static assets (images, icons, etc.)
├── docs/           # Additional project documentation
└── reports/        # Output from audit and validation scripts
```

---

## 📜 License

This project is licensed under the **MIT License**.
