# Absensi Sekolahku Todo List

## High Priority
- [/] Refactor project architecture to be more readable and maintainable
    - [x] Follow Feature-Driven structure in `client/src/features/` (Auth, Teacher, Admin, & Master Data)
    - [x] Separate logic into `components/`, `forms/`, `services/`, `hooks/`, `interfaces/`, and `validations/` (Complete!)
    - [x] Move cross-cutting concerns to `client/src/shared/`
    - [x] Implement Formik for forms and Yup for validations as per `project_rules.md` (Complete!)
    - [x] Ensure strong typing (no `any`)
    - [x] Use TanStack Query for all API interactions (Complete!)

## UI/UX Improvements
- [x] Revamp Guru Home (Mobile-first, Premium design)
- [x] Revamp Login Page (Glassmorphism, Modern UI)
- [x] Revamp Attendance Page (Apple-style Camera Interface)
- [x] Revamp Admin Dashboard (Bento Grid, SaaS style)
- [x] Revamp Admin Sidebar (Modern Dark Theme)
- [x] Revamp Admin Activities (Clean Data Table)

## Features
- [x] Master Data Management (Guru, Kelas, Pelajaran, Schedule)
    - [x] Tambahkan jumlah jam pelajaran di Master Pelajaran (kuota/alokasi jam per guru)
- [x] Schedule Management Improvements
    - [x] View per kelas di flow Assign Master Schedule (indikator terassign/belum)
- [x] Core Optimizations
    - [x] Server-side Pagination implementation (Express + Sequelize)
    - [x] Client-side Pagination integration (TanStack Query + UI Pagination)
    - [x] Specific Pagination Targets:
        - [x] Admin Activities (High Volume)
        - [x] Master Guru
        - [x] Master Kelas & Pelajaran
- [x] Report Generation (Export to Excel/PDF)
    - [x] Advanced Filtering (Guru, Pelajaran, Kelas, Date Range, Status)
    - [x] Export to Excel with custom styling

## Infrastructure & Security
- [ ] Migrate all Primary Keys and Foreign Keys to UUID V4
    - [ ] Update Sequelize models in `server/models/index.js`
    - [ ] Update Frontend interfaces (change `number` to `string` for IDs)
    - [ ] Re-sync database and regenerate seed data
