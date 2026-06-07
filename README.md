# 📋 EasySLR: Systematic Literature Review Screener

EasySLR is a premium, responsive web application designed to streamline the Systematic Literature Review (SLR) screening workflow. Built with **Next.js 16 (App Router)**, **Material UI (MUI)**, **Tailwind CSS**, and **Prisma**, EasySLR empowers researchers, scientists, and students to import literature databases, screen records, track real-time progress, and export results with ease.

---

## ✨ Key Features

- 🔐 **Secure & Flexible Authentication**: Supports standard Email & Password credentials (signup, login) and one-click **GitHub OAuth** using NextAuth.
- 📁 **Multi-format Imports**: Easily ingest PubMed or literature exports from Excel or CSV files. Automatically parses standard columns: `Title`, `Abstract`, `PMID`, `DOI`, `Journal`, `Year`, and `Authors`.
- 📊 **Progress Analytics & Live Stats**: Interactive dashboard detailing total articles, screened records, and breakdown stats (Inclusion, Exclusion, Maybe decision metrics) with percentage progress bars.
- 🎯 **Advanced Screening Dashboard**:
  - Full-featured datagrid view (using MUI X-DataGrid) for searching, sorting, and pagination.
  - Dynamic detailed view panel (Abstract, authors, journal metadata).
  - One-click screening controls (`INCLUDE`, `EXCLUDE`, `MAYBE`) and editable research/screener notes.
- 🌗 **Light & Dark Mode**: Dynamic, modern glassmorphic look with fully integrated responsive UI matching both light and dark systems.
- 📤 **Clean CSV Export**: Export screened reviews with their screening decisions, notes, and reviewer details instantly.
- 📱 **Mobile & Tablet Responsive**: Seamless drawer layouts, adaptive statistics bars, and touch-optimized controls for literature screening on the go.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend library**: [React 18](https://react.dev/)
- **UI Design System & Components**: [Material UI (MUI) v9](https://mui.com/), `@mui/x-data-grid`
- **Styling**: Vanilla CSS, Tailwind CSS v4, Emotion (`@emotion/react`, `@emotion/styled`)
- **Database & ORM**: PostgreSQL, [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/)
- **Data Validation & Parsing**: [Zod](https://zod.dev/), [PapaParse](https://www.papaparse.com/) (CSV), [XLSX](https://sheetjs.com/) (Excel)

---

## 📂 Project Structure

```text
easyslr/
├── app/                  # Next.js App Router (pages & API routes)
│   ├── api/              # Backend API Endpoints (Articles, Auth, Projects)
│   ├── login/            # Custom Auth UI
│   ├── globals.css       # Global styles (Tailwind configuration context)
│   ├── layout.tsx        # App layout provider injection
│   └── page.tsx          # Main SLR Screening Dashboard
├── components/           # Reusable MUI & Tailwind React components
│   ├── ArticleTable.tsx  # Interactive datagrid & details layout
│   ├── ImportButton.tsx  # Ingest Excel/CSV files asynchronously
│   ├── Sidebar.tsx       # Responsive project list & navigation panel
│   ├── StatsBar.tsx      # SLR progress analytics & stats
│   ├── ThemeToggle.tsx   # System/Light/Dark Mode controller
│   └── NotesModal.tsx    # Modal to add screening notes
├── context/              # Context providers (e.g., ThemeContext)
├── lib/                  # Helper utilities (auth-guard, import-parser, prisma client)
├── prisma/               # Prisma Database Schema and migrations/seeds
│   ├── schema.prisma     # PostgreSQL data models
│   ├── seed.ts           # Development seed script
│   └── add-member.ts     # Developer script to assign project owners
├── package.json          # Project dependencies & script definitions
└── tsconfig.json         # TypeScript configuration
```

---

## 🗄️ Database Schema

EasySLR uses a relational database model in Prisma targeting PostgreSQL:

- **Organization**: Holds users and projects workspace scope.
- **User**: Screener profile with credentials (hashed using bcrypt) or OAuth providers.
- **Project**: Target Systematic Literature Review workspace.
- **Article**: PubMed database record holding fields (Title, PMID, DOI, Journal, Year, Abstract).
- **Review**: Junction table capturing a User's Screening Decision (`INCLUDE`, `EXCLUDE`, `MAYBE`) and Notes on a specific Article.
- **ProjectMember**: Tracks Project workspace access roles (`OWNER` or `REVIEWER`).

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (v18.x or above)
- [PostgreSQL](https://www.postgresql.org/) database running (or a cloud PostgreSQL instance like Neon)

---

### ⚙️ Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd easyslr
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and configure the environment variables:
   ```env
   # Database URL pointing to your PostgreSQL instance
   DATABASE_URL="postgresql://username:password@localhost:5432/easyslr?schema=public"

   # NextAuth session verification configuration
   NEXTAUTH_SECRET="generate-a-secure-random-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # GitHub OAuth client credentials (Optional for social login)
   GITHUB_CLIENT_ID="your-github-oauth-client-id"
   GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
   ```

4. **Initialize the Database**:
   Run the Prisma database migration to setup your database tables:
   ```bash
   npx prisma db push
   ```

5. **(Optional) Seed Development Data**:
   To seed a sample organization and an initial review project, run:
   ```bash
   npx prisma db seed
   ```

---

### 💻 Running the Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

- **To sign up/sign in**: Go to `/login` to create a new credentials account or use the GitHub login button.
- **To test screening**: Create a project, import a CSV/Excel file containing research articles, and start reviewing!

---

## 📝 Import Formats

When importing literature exports, the app parses files with column headers. The headers are case-insensitive and match close variants. Ensure your import files (Excel `.xlsx` or `.csv`) include at least these headers:
- `title` (Required)
- `abstract` / `abstract text`
- `pmid` / `pubmed id`
- `doi`
- `journal` / `journal title`
- `year` / `publication year`
- `authors`

---

## 🤖 Developer Scripts

- `npm run dev`: Runs the Next.js development server.
- `npm run build`: Compiles the React production bundle.
- `npm run start`: Runs the built production server.
- `npm run lint`: Performs ESLint checks.
- `npx prisma studio`: Launches the visual Prisma database editor tool at [http://localhost:5555](http://localhost:5555).
