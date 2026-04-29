# Absensi Sekolahku 🏫

Aplikasi manajemen absensi guru berbasis web dengan pendekatan **Mobile-First** untuk guru dan **Desktop/Dashboard** untuk admin.

## 🚀 Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** TailwindCSS, Shadcn UI
- **Icons:** Lucide React
- **DND:** dnd-kit / react-beautiful-dnd

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT
- **File Upload:** Multer (Local Storage)

## 🛠️ Persiapan
1. Pastikan **MySQL Server** sudah berjalan.
2. Buat database: `absen_sekolahku`.
3. Atur konfigurasi database di `server/.env`.

## 🏃‍♂️ Cara Menjalankan
Dari root folder (`absensi-sekolahku`), jalankan:

```bash
npm run dev
```
Perintah ini akan menjalankan backend (port 3001) dan frontend (Vite) secara bersamaan menggunakan `concurrently`.

## 📋 Fitur Utama
- **Admin Dashboard**: Master Data (Guru, Pelajaran, Kelas), Assign Jadwal via Drag & Drop, Approval, dan Export.
- **Guru Mobile App**: Dashboard jadwal harian, Absen dengan foto selfie & foto kelas (auto-timestamp), Pengajuan jam mengajar tambahan.
- **Audit Trail**: Mencatat setiap perubahan data master dan jadwal.
