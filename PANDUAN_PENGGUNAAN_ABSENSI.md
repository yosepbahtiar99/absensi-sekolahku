# Panduan Penggunaan Absensi (Corporate / Full Day) 📚

Dokumen ini menjelaskan alur kerja (*flow*) dan panduan penggunaan sistem absensi sekolah dengan mode **Corporate / Full Day**. Sistem ini dirancang untuk menyederhanakan proses absensi guru (cukup satu kali check-in di pagi hari dan satu kali check-out saat pulang), namun tetap terintegrasi secara cerdas dengan jadwal setiap kelas yang diajarkan oleh guru tersebut.

---

## 1. Flow Absensi Guru (Aplikasi Guru)

Sistem ini didesain agar guru tidak perlu melakukan absensi setiap kali masuk atau keluar kelas (pergantian jam pelajaran).

### A. Check-In (Jam Datang)
1. Guru login ke dalam aplikasi menggunakan akun masing-masing.
2. Di halaman Dashboard (beranda utama), terdapat area **Aktivitas Hari Ini**.
3. Guru menekan tombol **"Datang"** (Warna Hijau).
4. Guru mengambil foto *selfie* dan mengirimkan data kehadiran.
5. **Magic di Belakang Layar**:
   - Sistem akan mencatat "Jam Datang" untuk guru tersebut (contoh: 06:45).
   - Sistem akan secara *otomatis* mendistribusikan kehadiran guru tersebut ke **seluruh kelas** yang ia ajar hari itu.
   - Status setiap kelas (Hadir, Telat, atau Alpa) akan dikalkulasi secara mandiri berdasarkan perbandingan antara *Jam Datang (06:45)* dengan *Jam Mulai* masing-masing kelas, ditambah dengan *Toleransi Keterlambatan*.

### B. Check-Out (Jam Pulang)
1. Setelah seluruh kegiatan mengajar selesai, guru kembali ke Dashboard.
2. Guru menekan tombol **"Pulang"** (Warna Merah).
3. Sistem akan memverifikasi lokasi (Geolocation) guru sebagai bukti kepulangan tanpa perlu mengambil foto *selfie* ulang.
4. **Catatan Penting**: Jika guru melakukan check-out *sebelum* jadwal kelas terakhirnya selesai, maka sisa kelas yang belum terlaksana di hari tersebut akan secara otomatis ditandai sebagai **Alpa** (karena guru pulang sebelum waktunya).

---

## 2. Pengelolaan oleh Admin (Wallboard Admin)

Aplikasi menyediakan **Wallboard Admin** interaktif (*Dashboard -> Laporan Kehadiran Harian / Wallboard*) sebagai pusat komando absensi.

### A. Fitur "Set Hadir Manual" (Override Check-In)
Jika guru lupa melakukan absen di pagi hari, admin dapat membantunya dengan:
1. Menekan tombol **"+ Set Hadir Manual"** tepat di bawah nama guru terkait pada Wallboard.
2. Memasukkan jam kehadiran guru yang sebenarnya (contoh: 07:15).
3. Sistem Admin akan menggunakan kecerdasan buatan (*Time-Aware Algorithm*) yang sama persis dengan sistem guru:
   - Kelas jam 07:00 akan tercatat **Alpa** (karena jam kelas sudah habis sebelum guru diklaim hadir pada 07:15).
   - Kelas jam 07:30 akan tercatat **Hadir** (atau Telat jika melampaui ambang batas).
   - Waktu yang tercantum pada kartu jadwal kelas akan menyesuaikan secara otomatis agar sesuai dengan jadwal.

### B. Fitur "Set Pulang Manual" (Override Check-Out)
Sama halnya jika guru lupa absen pulang:
1. Arahkan kursor pada kartu utama guru. Akan muncul *tooltip* dengan status kehadiran dan tombol **"Set Pulang Manual"**.
2. Masukkan jam kepulangan guru tersebut.

### C. Mengedit Jam Kehadiran Secara Spesifik
- **Indikator M (Masuk) & K (Keluar)**: Di sebelah kiri dan kanan baris jadwal guru pada Wallboard, terdapat indikator berbentuk *badge* bertuliskan `M: HH:mm` dan `K: HH:mm`.
- Anda cukup mengarahkan kursor (*hover*) pada indikator `M` atau `K` tersebut. Sebuah ikon **Pensil (Edit)** akan muncul.
- Jika diklik, Admin dapat mengubah jam kedatangan atau kepulangan guru yang bersangkutan.
- **Auto Re-Calibrate (Hyper-Aware)**: Setelah jam M/K diubah, seluruh status kartu kelas di hari tersebut akan dihitung dan dikalibrasi ulang oleh sistem (berubah warna dari Hijau, Kuning, Merah) menyesuaikan dengan waktu yang baru diedit! Tidak perlu mengubah data satu per satu.

---

## 3. Laporan Ekspor Excel (Export Matrix)

Untuk keperluan rekapitulasi data bulanan, absensi dapat diekspor.
1. Masuk ke halaman **Report Absensi Guru**.
2. Klik tombol **Export Data** (warna biru/hijau) untuk mengunduh laporan.
3. Di dalam *file* Excel yang diunduh:
   - Terdapat kolom **Jam Datang** dan **Jam Pulang** yang ditarik 100% secara presisi dari rekaman pintu masuk gedung (semua editan *manual* atau *override* dari admin dijamin tersinkronisasi di kolom ini).
   - Matriks (deretan kolom jadwal pelajaran/waktu) hanya mencatat simbol-simbol (H, T, A, I) agar *HR/Kepala Sekolah* dapat memantau kedisiplinan dengan sangat mudah.

---
*Dokumen ini dibuat secara dinamis dan diperbarui sesuai dengan standar pengembangan terakhir.*
