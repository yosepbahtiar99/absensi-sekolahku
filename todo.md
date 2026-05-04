# Absensi Sekolahku Todo List

## High Priority
- [/] Refactor project architecture to be more readable and maintainable
    - [x] Follow Feature-Driven structure in `client/src/features/` (Auth, Teacher, Admin, & Master Data)
    - [x] Separate logic into `components/`, `forms/`, `services/`, `hooks/`, `interfaces/`, and `validations/` (Complete!)
    - [x] Move cross-cutting concerns to `client/src/shared/`
    - [x] Implement Formik for forms and Yup for validations as per `project_rules.md` (Complete!)
    - [x] Ensure strong typing (no `any`)
    - [x] Use TanStack Query for all API interactions (Complete!)

## Future Roadmap: Super App Evolution 🚀

### Phase 1: Structural Integrity (Academic Year & Time Slots)
- [x] Implement `AcademicYear` Model (id, name, isActive, startDate, endDate)
- [x] Implement `TimeSlot` (Jam Pelajaran) Model
    - [x] Link to `AcademicYear`
    - [x] Define `day`, `label`, `startTime`, `endTime`, `periodNumber`
- [x] Refactor `Schedule` Model:
    - [x] Add `academicYearId`
    - [x] Add `timeSlotId`
    - [x] Remove/Deprecate manual `startTime` & `endTime`
- [x] Refactor `Activity` Model:
    - [x] Add `academicYearId` to ensure historical filtering
    - [x] Implement Data Snapshotting (Store `className`, `lessonName`, `teacherName` at creation time)

### Phase 2: Master Data Management UI
- [x] Create UI for Managing Academic Years (Add/Edit/Set Active)
- [x] Create UI for Managing Time Slots (Template Jam Pelajaran per Hari)
    - [x] Support different slot structures for different days (e.g., Monday Ceremony, Friday Short Day)

### Phase 3: Advanced Scheduling (Matrix Grid)
- [x] Revamp Schedule Page to "Matrix Grid" Visualization
    - [x] X-Axis: Time Slots (Jam 1, Jam 2, dst)
    - [x] Y-Axis: Classes (X-A, X-B, dst)
    - [x] Interactivity: Drag & Drop teachers/lessons into the grid
- [x] Conflict Detection: Visual indicator if a teacher is already assigned in another class at the same time slot
- [x] Cloning Feature: "Import Schedule from Previous Period" (Deep copy of schedules to new academic year)

### Phase 4: History & Analytics
- [x] Global Period Selector in Admin Dashboard (View data for current/past academic years)
- [x] Reporting Consistency: Ensure reports pull from the snapshotted data in `Activity`

## UI/UX Improvements
- [x] Revamp Guru Home (Mobile-first, Premium design)
- [x] Revamp Login Page (Glassmorphism, Modern UI)
- [x] Revamp Attendance Page (Apple-style Camera Interface)
- [x] Revamp Admin Dashboard (Bento Grid, SaaS style)
- [x] Revamp Admin Sidebar (Modern Dark Theme)
- [x] Revamp Admin Activities (Clean Data Table)

## Features Completed
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
- [x] Migrate all Primary Keys and Foreign Keys to UUID V4
    - [x] Update Sequelize models in `server/models/index.js`
    - [x] Update Frontend interfaces (change `number` to `string` for IDs)
    - [x] Re-sync database and regenerate seed data
