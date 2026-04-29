# Absensi Sekolahku Todo List

## High Priority
- [ ] Refactor project architecture to be more readable and maintainable
    - [ ] Follow Feature-Driven structure in `client/src/features/`
    - [ ] Separate logic into `components/`, `forms/`, `services/`, `hooks/`, `interfaces/`, and `validations/`
    - [ ] Move cross-cutting concerns to `client/src/shared/`
    - [ ] Implement Formik for forms and Yup for validations as per `project_rules.md`
    - [ ] Ensure strong typing (no `any`)
    - [ ] Use TanStack Query for all API interactions

## UI/UX Improvements
- [x] Revamp Guru Home (Mobile-first, Premium design)
- [x] Revamp Login Page (Glassmorphism, Modern UI)
- [x] Revamp Attendance Page (Apple-style Camera Interface)
- [x] Revamp Admin Dashboard (Bento Grid, SaaS style)
- [x] Revamp Admin Sidebar (Modern Dark Theme)
- [x] Revamp Admin Activities (Clean Data Table)

## Features
- [ ] Implement Approval workflow for Admin
- [ ] Master Data Management (Guru, Kelas, Pelajaran, Schedule)
    - [ ] Tambahkan jumlah jam pelajaran di Master Pelajaran (kuota/alokasi jam per guru)
- [ ] Schedule Management Improvements
    - [ ] View per kelas di flow Assign Master Schedule (indikator terassign/belum) -> **Perlu Diskusi**
- [ ] Core Optimizations
    - [ ] Implementasi Pagination (Server side & Client side)
- [ ] Report Generation (Export to Excel/PDF)
