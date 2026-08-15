# Luxera Provenance — Development & Contributing Guide

This document provides setup instructions, coding conventions, and testing practices for developers contributing to **Luxera Provenance**.

---

## 1. Local Development Environment

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

### Setup Commands
```bash
# Clone the repository
git clone https://github.com/luxera-provenance/luxera-provenance.git
cd luxera-provenance

# Install dependencies
npm install

# Setup environment configuration
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000`.

---

## 2. Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server on port 3000 |
| `npm run build` | Builds production application bundle |
| `npm run start` | Runs production server |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## 3. Code Quality & Guidelines

- **TypeScript Strict Mode**: Enforce complete type annotations. Avoid using `any` unless strictly required.
- **Tailwind CSS 4**: Use utility-first styling with dark slate theme variables.
- **Component Isolation**: Modularize client components into `/components/console` or `/components/site`.
- **API Security**: Ensure all external SDK invocations occur within `/app/api` server routes.
