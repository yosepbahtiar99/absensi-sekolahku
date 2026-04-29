---
trigger: always_on
---

# Absensi Sekolahku Monorepo Project Rules

Strictly follow these rules for all development tasks in client repository.

## 1. Naming Conventions

- **Files**: Use PascalCase for components and camelCase for hooks and utilities.
- **Interfaces**: Prefix with `I` or use descriptive names.

## 2. Project Architecture

- **Features**: Group related code in `src/features/[feature-name]`.
  - `components/`: UI components (dialogs, tables, etc.).
  - `forms/`: Formik-based forms.
  - `services/`: API services.
  - `hooks/`: Feature-specific hooks.
  - `interfaces/`: Type definitions.
  - `validations/`: Yup schemas.
- **Shared**: Use `src/shared` for cross-cutting concerns (UI primitives, core logic, common hooks).

## 3. Technology Stack Rules

- **Framework**: React 19 (use latest hooks and patterns).
- **Styling**: Tailwind CSS 4 (avoid inline styles unless absolutely necessary).
- **Forms**: Always use **Formik** for state management and **Yup** for validation.
- **State**: Use **Zustand** for global/complex state management.
- **Data Fetching**: Use **TanStack Query** (React Query) for API interactions.
- **UI Primitives**: Prefer **Radix UI** components and **Lucide React** icons.
- **Date Handling**: Use `date-fns` or `moment` as established in the components.

## 4. Coding Standards

- **Strong Typing**: Absolute Requirement. No `any` unless unavoidable.
- **Accessibility**: Ensure components follow ARIA best practices (utilize Radix UI props).
- **Performance**: Use `memo`, `useMemo`, and `useCallback` appropriately in complex components.

## 5. Environment & Workflow

- **Package Manager**: Use `npm` for all package installations as per `MEMORY[npm-work-space.md]`.
- **Node Version**: Use `nvm use 22` if node is not found.
- **Git**: Follow conventional commits (configured via commitlint).
