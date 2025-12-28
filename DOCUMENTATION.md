# SmartClass Embedded System Project - Software Documentation

## Overview

This software is the frontend web application for the SmartClass Embedded System Project. It is built using Next.js (React), TypeScript, and modern UI components. The app provides a user interface for interacting with the SmartClass system, which may include features such as class management, device control, and real-time data visualization.

## How It Works

- **Frontend Framework:** The app uses Next.js for server-side rendering and routing, providing fast and SEO-friendly pages.
- **Component-Based:** UI is built with reusable React components located in the `components/` directory, including a set of UI primitives in `components/ui/`.
- **Styling:** Global styles are defined in `app/globals.css`. Component-level styles may be included within each component.
- **Configuration:** Project configuration files include `tsconfig.json` (TypeScript), `next.config.ts` (Next.js), and `eslint.config.mjs` (linting).
- **Utilities:** Common utility functions are in `lib/utils.ts`.
- **Public Assets:** Static files (images, icons, etc.) are in the `public/` directory.

## Getting Started

To set up the development environment for the SmartClass Embedded System Project, follow these steps:

1. **Start the Development Database (Postgres):**

   The project uses a local Postgres database for development, managed via Docker Compose. Make sure you have [Docker](https://www.docker.com/products/docker-desktop/) installed.

   ```bash
   docker compose up -d
   ```

   This will start a Postgres 18 database on port 5432 with default credentials (see `docker-compose.yml`).

2. **Install Dependencies:**

   ```bash
   cd software
   npm install
   ```

3. **Run the Development Server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

4. **Build for Production:**

   ```bash
   npm run build
   npm start
   ```

## Project Structure

- `app/` - Main application pages, layouts, and global styles
- `components/` - Reusable React components
- `components/ui/` - UI primitives (buttons, cards, dialogs, etc.)
- `lib/` - Utility functions
- `public/` - Static assets
- `*.config.*` - Configuration files

## Needed Documentation Files

To improve maintainability and onboarding, consider adding the following documentation files:

- `CONTRIBUTING.md` - Guidelines for contributing to the project
- `CODE_OF_CONDUCT.md` - Code of conduct for contributors
- `docs/` directory - For detailed guides, architecture, and API documentation
- `CHANGELOG.md` - Track changes and releases
- `SECURITY.md` - Security policy and reporting guidelines
- `LICENSE` - Already present, but ensure it is up to date

## Example: Adding a New Component

1. Create a new file in `components/`, e.g., `my-component.tsx`.
2. Export your React component.
3. Import and use it in a page or another component.

## Support

For questions or issues, please open an issue in the repository or contact the maintainers.
