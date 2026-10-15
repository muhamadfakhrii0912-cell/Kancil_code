# 📜 Log Kronologis Rekayasa Prompt Pengembangan KancilCode
### *Development Prompt Engineering & Orchestration Log: From Inception to Production*

Dokumen ini mencatat seluruh rekam jejak instruksi, arahan arsitektur, dan rekayasa prompt yang memandu pengembangan platform **KancilCode** dari tahap inisiasi (*Sprint 1*) hingga tahap rilis produksi (*Sprint 5*), uji coba lapangan empiris (UAT), dan persiapan penilaian Dewan Juri.

Seluruh prompt telah disempurnakan ke dalam terminologi **Rekayasa Perangkat Lunak Profesional**, selaras dengan standar *Role-Context-Task-Constraint-Schema (RCTCS)* dan kaidah pedagogi komputasional anak usia sekolah dasar.

---

## 📌 Ringkasan Eksekutif Siklus Pengembangan

```mermaid
timeline
    title Alur Evolusi Pengembangan KancilCode (Sprint 1 - 5)
    Inisiasi & Sprint 1 : Audit Kebutuhan PRD v2.0
                        : Integrasi Google Blockly Zelos Nusantara
                        : Engine Simulator Canvas 2D 60 FPS
    Sprint 2 & 3        : AST Semantic Parser (0ms Linter)
                        : Asisten Suara Sokratik (Anti-Spoiler)
                        : Tangible Vision Scanner Kartu Fisik
                        : Offline-First PWA & IndexedDB Sync
    Sprint 4            : Supabase Cloud & RLS Security
                        : Dasbor Guru & Misconception Heatmap
                        : Generator Level & LKS PDF Siap Cetak
    Sprint 5 & QA       : Kampanye 20 Level Fabel Nusantara
                        : Uji Lapangan Empiris Siswa SD (SUS 91.5)
                        : Otentikasi Sekolah Mandiri & Halaman Prestasi /success
                        : Audit Desain Anti-Slop & Kesiapan Produksi Publik
```

---

## 📑 Katalog Rekayasa Prompt Pengembangan

---

### 1. Inisiasi Proyek & Penyelarasan Dokumen Kebutuhan (PRD)

* **Fase:** *Project Initiation & Architecture Assessment*
* **Tujuan Asli:** Memeriksa progres pengerjaan proyek KancilCode terhadap dokumen acuan PRD.
* **Formulasi Prompt Profesional:**
  ```text
  Lakukan audit komprehensif terhadap status pengembangan KancilCode saat ini berdasarkan 
  Product Requirements Document (PRD v2.0). Identifikasi seluruh capaian modul yang telah 
  selesai, daftar backlog teknis yang masih tertunda, serta kesenjangan arsitektural antara 
  target spesifikasi kompetensi komputasi dasar dan implementasi kode aktual.
  ```
* **Dampak & Luaran Teknis:**
  * Pemetaan matriks 5 Sprint Agile.
  * Penyelarasan arsitektur Next.js 15 App Router dengan kebutuhan Google Blockly dan Supabase PostgreSQL.

---

### 2. Integrasi Engine Pemrograman Visual Google Blockly Bertema Nusantara

* **Fase:** *Sprint 1 — Core Visual Coding Engine*
* **Tujuan Asli:** Memastikan blok visual kustom Blockly (Maju, Belok, Lompat, Ulangi, Jika) berfungsi 100%.
* **Formulasi Prompt Profesional:**
  ```text
  Lakukan verifikasi fungsional dan uji integrasi menyeluruh terhadap engine Google Blockly 
  (Renderer Zelos) dengan blok pemrograman kustom bertema fabel Nusantara:
  1. Balok Runtunan: `move_forward`, `turn_left`, `turn_right`, `jump`.
  2. Balok Perulangan: `repeat_n`, `repeat_until_goal`.
  3. Balok Percabangan: `if_obstacle`, `if_else_obstacle`.

  Pastikan generator kode JavaScript berjalan deterministik, isolasi styling workspace 
  bebas glitch hidrasi SSR, serta lokalisasi teks instruksi sepenuhnya berbahasa Indonesia ramah anak.
  ```
* **Dampak & Luaran Teknis:**
  * Modul `src/components/blockly/CustomBlocklyWorkspace.tsx` dengan lazy-loading SSR `dynamic()`.
  * Definisi balok visual ramah anak dengan palet warna terstandar Bebras.

---

### 3. Pembangunan Simulator Game Canvas 2D 60 FPS & Step-by-Step Debugger

* **Fase:** *Sprint 1 — Interactive Game Canvas Simulator*
* **Tujuan Asli:** Membangun simulasi animasi Kancil 2D di kanvas dengan kontrol langkah per langkah dan penyorotan balok aktif.
* **Formulasi Prompt Profesional:**
  ```text
  Implementasikan modul game simulator HTML5 Canvas 2D 60 FPS yang dilengkapi engine runner 
  langkah-per-langkah (step-by-step runner/debugger) dan visual aura highlighter pada balok 
  Blockly yang sedang dieksekusi.

  Grid simulator harus mampu me-render petak dinamis (tanah aman, rintangan batu, aliran sungai, 
  lubang jebakan, dan buah mentimun) dengan sprite Kancil teranimasi yang merespons orientasi 
  arah mata angin (Utara, Timur, Selatan, Barat).
  ```
* **Dampak & Luaran Teknis:**
  * Modul `src/components/canvas/GameCanvas.tsx` dengan loop requestAnimationFrame 60 FPS.
  * Fitur debugging interaktif: *Jalankan Penuh*, *Langkah Mandiri*, dan *Reset Simulasi*.

---

### 4. Perancangan Agen AI Game Level Designer & CS Curriculum Architect

* **Fase:** *Sprint 1 & Sprint 4 — Generative Curriculum Engine*
* **Tujuan Asli:** Membuat AI generator yang merancang level grid 2D yang dapat diselesaikan sesuai konsep komputasi dan target kelas SD.
* **Formulasi Prompt Profesional:**
  ```text
  Konfigurasikan persona agen AI: "Expert Game Level Designer & Computer Science Curriculum Architect".
  Tugas: Merancang level teka-teki labirin 2D berbasis grid (ukuran 6x6 hingga 10x10) dengan 
  solusi logis valid yang dapat diselesaikan oleh siswa SD kelas 4-6.

  Batasan Ketat & Schema:
  1. Petak grid: 0 (Tanah), 1 (Batu), 2 (Sungai), 3 (Mentimun), 4 (Jebakan).
  2. Pastikan jalur dari `kancil_start` ke `finish_target` terverifikasi secara algoritmik.
  3. Hitung `optimal_block_count` untuk tolok ukur efisiensi 3 bintang Bebras CT.
  4. Sertakan cerita fabel pengantar singkat (2-3 kalimat) bertema nilai budi pekerti.
  5. Format output wajib mematuhi skema JSON terkunci (Structured Outputs Gemini 2.5 Flash).
  ```
* **Dampak & Luaran Teknis:**
  * Endpoint API `src/app/api/ai/generate-level/route.ts`.
  * Integrasi kurikulum otomatis yang menghasilkan grid matriks siap dimainkan seketika.

---

### 5. AST Semantic Engine di Browser & Asisten Suara Sokratik (Sprint 2)

* **Fase:** *Sprint 2 — Browser-Level AST Linter & Socratic AI Mentor*
* **Tujuan Asli:** Mendeteksi infinite loop dan dead code di browser tanpa biaya API, serta membuat AI suara Kancil tanpa spoiler kode.
* **Formulasi Prompt Profesional:**
  ```text
  Eksekusi deliverable Sprint 2:
  1. Kembangkan parser semantik AST (Abstract Syntax Tree) di tingkat peramban (client-side) 
     untuk memvalidasi kode balok secara instan (0ms latensi) guna mendeteksi Infinite Loop, 
     Dead Code, dan Redundant Turns sebelum kode dijalankan.
  2. Bangun asisten bimbingan Sokratik "Tanya Kancil" menggunakan Gemini 2.5 Flash yang 
     menerapkan 3-Tier Scaffolding Guardrail (Tier 1: Observasi Konseptual, Tier 2: Lokasi Masalah, 
     Tier 3: Hubungan Sebab-Akibat) tanpa pernah membocorkan susunan kode jadi.
  3. Integrasikan Web Speech API berbahasa Indonesia (`id-ID`) dengan sinkronisasi ekspresi emosi 
     maskot vektor SVG (Thinking, Happy, Encouraging, Celebrating).
  ```
* **Dampak & Luaran Teknis:**
  * Engine `src/lib/ast-engine/parser.ts` dengan feedback instan tanpa kuota token.
  * Modul interaktif `src/components/socratic/SocraticDialog.tsx`.

---

### 6. Tangible Vision Code Scanner & PWA Offline-First 3T Ready (Sprint 3)

* **Fase:** *Sprint 3 — Computer Vision Unplugged & 3T Offline Architecture*
* **Tujuan Asli:** Memungkinkan siswa belajar koding pakai kartu fisik di meja lewat kamera, dan aplikasi bisa jalan tanpa internet.
* **Formulasi Prompt Profesional:**
  ```text
  Eksekusi deliverable Sprint 3:
  1. Rancang modul Tangible Vision Code Scanner yang memanfaatkan kamera peramban untuk menangkap 
     susunan kartu fisik Unplugged Coding di meja kelas nyata (pencahayaan 250-450 lux).
  2. Integrasikan pipeline Gemini Flash Vision untuk mentranspilasi foto urutan kartu fisik 
     menjadi balok Blockly di layar dalam waktu < 2 detik.
  3. Bangun arsitektur Progressive Web App (PWA) Offline-First: konfigurasikan Service Worker 
     CacheStorage untuk seluruh aset statis, serta IndexedDB lokal untuk menyimpan progres bintang 
     dan level saat jaringan internet 3T terputus, dilengkapi mekanisme Background Auto-Sync ke Supabase.
  ```
* **Dampak & Luaran Teknis:**
  * Komponen scanner webcam `src/components/tangible/TangibleScannerModal.tsx`.
  * Service worker manifest `src/app/manifest.ts` dan IndexedDB sync engine `src/lib/offline/db.ts`.

---

### 7. Portal Pengajar, Class Misconception Heatmap & Generator LKS PDF (Sprint 4)

* **Fase:** *Sprint 4 — Teacher Copilot & Offline Remedial Worksheet*
* **Tujuan Asli:** Membuat dasbor guru untuk memantau progres kelas, melihat heatmap kelemahan murid, dan mencetak LKS latihan luring.
* **Formulasi Prompt Profesional:**
  ```text
  Eksekusi deliverable Sprint 4:
  1. Integrasikan basis data relasional Supabase PostgreSQL dengan skema tabel `classrooms`, 
     `students`, `custom_levels`, dan `telemetry_logs` yang dilindungi Row Level Security (RLS).
  2. Bangun dasbor pendidik `Teacher Copilot` yang memuat visualisasi Class Misconception Heatmap 
     secara real-time guna mendiagnosis pilar logika yang paling memicu kegagalan siswa.
  3. Integrasikan generator Lembar Kerja Siswa (LKS) PDF berbasis AI yang menghasilkan materi 
     latihan remedial unplugged berformat A4 siap cetak (`window.print()`).
  ```
* **Dampak & Luaran Teknis:**
  * Portal lengkap guru di `src/app/teacher/page.tsx`.
  * Skema database relasional di `supabase/schema.sql`.

---

### 8. Integrasi & Sinkronisasi Cloud Supabase

* **Fase:** *Infrastructure & Cloud Database Sync*
* **Tujuan Asli:** Menghubungkan database ke proyek cloud Supabase `lpzpudxqnnbeneeiprcm`.
* **Formulasi Prompt Profesional:**
  ```text
  Lakukan integrasi dan sinkronisasi arsitektur data lokal dengan proyek cloud Supabase aktif 
  (ID: lpzpudxqnnbeneeiprcm). Pastikan variabel lingkungan `NEXT_PUBLIC_SUPABASE_URL` dan 
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` terkonfigurasi dengan benar, serta skema PostgreSQL beserta 
  kebijakan RLS terpasang untuk isolasi data kelas.
  ```
* **Dampak & Luaran Teknis:**
  * Koneksi cloud database Supabase aktif pada `.env.local` dan `src/lib/supabase/client.ts`.

---

### 9. Perancangan Matriks Pengujian Kualitas (QA) & Field Testing

* **Fase:** *Quality Assurance & Test Plan Formulation*
* **Tujuan Asli:** Menanyakan bagian mana saja yang perlu dites dan melakukan pengetesan menyeluruh.
* **Formulasi Prompt Profesional:**
  ```text
  Susun rencana pengujian komprehensif (Quality Assurance Test Suite) untuk memvalidasi seluruh 
  lapisan sistem KancilCode pasca-integrasi Sprint 1-4:
  1. Uji Fungsional Simulasi: Logika belok, maju, lompat air, dan deteksi rintangan batu.
  2. Uji AST Linter & Socratic AI: Responsivitas feedback 0ms dan guardrail anti-spoiler.
  3. Uji Vision AI: Ketahanan transpilasi kartu fisik pada berbagai orientasi kamera.
  4. Uji Offline PWA: Pemutusan jaringan internet dan verifikasi persistensi data di IndexedDB.
  5. Lakukan eksekusi pengetesan end-to-end dan laporkan hasilnya secara terstruktur.
  ```
* **Dampak & Luaran Teknis:**
  * Uji fungsionalitas menyeluruh dan penemuan area perbaikan pada antarmuka autentikasi dan alur navigasi.

---

### 10. Perbaikan Alur Navigasi, Launching Tantangan & Heuristik UI

* **Fase:** *User Experience Heuristic Evaluation*
* **Tujuan Asli:** Memperbaiki halaman awal yang belum memiliki tombol login atau tombol ke dashboard serta mempermudah cara menjalankan level.
* **Formulasi Prompt Profesional:**
  ```text
  Lakukan penataan ulang arsitektur informasi pada halaman beranda utama (`src/app/page.tsx`):
  1. Sediakan banner panduan cepat (*Quick Onboarding Guide*) yang menjelaskan alur drag-and-drop balok 
     hingga penekanan tombol 'Jalankan' bagi siswa SD pemula.
  2. Pasang titik navigasi autentikasi yang jelas pada header untuk memfasilitasi akses Siswa dan Guru.
  3. Berikan tombol navigasi langsung menuju Portal Dasbor Guru bagi penguji dan pengajar.
  ```
* **Dampak & Luaran Teknis:**
  * Penambahan banner instruksi Kurikulum Merdeka pada beranda.
  * Header interaktif dengan tombol masuk akun sekolah dan status sinkronisasi PWA.

---

### 11. Refinement Autentikasi Sekolah Mandiri & Proteksi Role Guard (Privasi Anak)

* **Fase:** *Security Hardening & Privacy Compliance (Zero-PII)*
* **Tujuan Asli:** Merapikan autentikasi login dan memastikan murid tidak bisa mengintip dasbor guru.
* **Formulasi Prompt Profesional:**
  ```text
  Sempurnakan sistem otentikasi agar mematuhi regulasi privasi anak (COPPA & UU PDP No. 27/2022):
  1. Terapkan arsitektur Zero-PII: Siswa masuk hanya menggunakan Kode Kelas, NISN, dan Nama Panggilan 
     tanpa meminta alamat email pribadi atau nomor telepon.
  2. Implementasikan Role Guard ketat pada rute `/teacher`: Blokir akses jika pengguna berstatus 'student' 
     dan tampilkan layar edukatif 'Akses Dibatasi' guna melindungi data evaluasi dan bank soal kelas.
  3. Perbaiki inkonsistensi status sesi autentikasi pada Zustand store.
  ```
* **Dampak & Luaran Teknis:**
  * Penguatan guard autentikasi pada `src/store/authStore.ts` dan `src/app/teacher/page.tsx`.
  * Tampilan edukatif ramah anak saat terjadi upaya lintas peran (*role mismatch*).

---

### 12. Sprint 5: Kampanye 20 Level, Pengujian Lapangan (UAT) & Berkas Kompetisi

* **Fase:** *Sprint 5 — Full Curriculum, Field Testing (UAT) & Competition Pack*
* **Tujuan Asli:** Pembuatan 20 level fabel (Babak 1-4), laporan UAT 32 siswa SD, dan berkas kompetisi dewan juri.
* **Formulasi Prompt Profesional:**
  ```text
  Eksekusi deliverable utama Sprint 5 (Final Competition Release):
  1. Konten Kurikulum 20 Level: Bangun 4 Babak fabel bertingkat (Babak 1: Runtunan Hutan, 
     Babak 2: Perulangan Jembatan Buaya, Babak 3: Percabangan Kebun Pak Tani, Babak 4: Algoritma Majemuk).
  2. Uji Coba Empiris (UAT): Susun laporan riset pengujian lapangan pada 32 siswa SD usia 9-12 tahun 
     dengan metodologi System Usability Scale (SUS) dan Task Completion Rate (TCR).
  3. Berkas Dewan Juri: Buat slide pitch deck 10 slide (`JURY_PITCH_DECK.md`) dan naskah video 
     walkthrough berdurasi 3-5 menit (`VIDEO_DEMO_SCRIPT.md`).
  ```
* **Dampak & Luaran Teknis:**
  * Dataset 20 level di `src/data/levels.ts`.
  * Dokumen resmi `docs/UAT_FIELD_TESTING_REPORT.md` (Skor SUS **91.5 / Grade A+**).
  * Dokumen `docs/JURY_PITCH_DECK.md` dan `docs/VIDEO_DEMO_SCRIPT.md`.

---

### 13. Pembangunan Halaman Prestasi `/success` & Portal Login Sekolah `/login`

* **Fase:** *Gamification, Digital Certificate & School Portal*
* **Tujuan Asli:** Membuat halaman murid sukses menyelesaikan tugas dengan sertifikat, serta halaman login khusus akun dan kata sandi dari sekolah.
* **Formulasi Prompt Profesional:**
  ```text
  Rancang dua halaman baru yang terintegrasi penuh:
  1. Portal Otentikasi Sekolah Mandiri (`/login`): Halaman login responsif dengan tab terpisah untuk 
     Murid SD (Kode Kelas, NISN, Kata Sandi Sekolah, dan pemilihan Avatar Fabel) serta Pendidik Guru 
     (Email terverifikasi dan sandi), dilengkapi tombol `⚡ 1-Klik Isi Demo` untuk kemudahan pengujian juri.
  2. Halaman Prestasi & Sertifikat Digital (`/success`): Halaman perayaan kelulusan level yang menampilkan 
     bintang Bebras CT, analisis efisiensi balok logika terpasang vs target optimal, pemutaran audio 
     apresiasi Kancil (Web Speech API), dan "Sertifikat Cerdik Nusantara" resmi berformat cetak (`window.print()`).
  ```
* **Dampak & Luaran Teknis:**
  * Halaman `src/app/login/page.tsx` dan `src/app/success/page.tsx`.
  * Penambahan validasi kata sandi sekolah (`sekolah123`) pada `src/store/authStore.ts`.

---

### 14. Pemetaan Keunggulan Kompetitif (7 Killer Features)

* **Fase:** *Competitive Strategy & Value Proposition Analysis*
* **Tujuan Asli:** Menganalisis fitur unik apa saja yang menjadi pembeda kuat KancilCode.
* **Formulasi Prompt Profesional:**
  ```text
  Lakukan analisis diferensiasi produk dan rumuskan "7 Fitur Pembeda Juara" (Killer Features) 
  KancilCode terhadap kompetitor global (Scratch, Code.org, dan Generic LLM chatbot). 
  Petakan keunggulan dalam matriks perbandingan komparatif yang mencakup aspek lokalisasi budaya, 
  transpilasi kartu fisik vision, guardrail pencegahan spoiler kode, ketahanan offline 3T, 
  diagnostik otomatis guru, dan keamanan privasi anak (Zero-PII).
  ```
* **Dampak & Luaran Teknis:**
  * Diagram pohon inovasi Mermaid dan matriks komparasi 7 parameter pada `README.md`.

---

### 15. Pembaruan Komprehensif Dokumentasi Utama Repositori (`README.md`)

* **Fase:** *Technical Documentation & Repository Showcase*
* **Tujuan Asli:** Memperbarui README mengenai keseluruhan proyek KancilCode.
* **Formulasi Prompt Profesional:**
  ```text
  Perbarui dokumentasi utama README.md secara menyeluruh dan berstandar profesional:
  1. Cantumkan tabel kredensial uji coba demo juri untuk Siswa, Guru, Peta Petualangan, dan Halaman Sertifikat.
  2. Tambahkan diagram sekuensial Alur Perjalanan Pengguna (User Journey Flow) dengan Mermaid.
  3. Dokumentasikan rincian teknis 7 Killer Features dan tabel kurikulum 20 level.
  4. Perbarui pohon struktur direktori riil dari Next.js 15 App Router.
  5. Sematkan tautan langsung ke seluruh berkas kompetisi di direktori `/docs`.
  ```
* **Dampak & Luaran Teknis:**
  * File `README.md` berstandar internasional dengan navigasi cepat, badge teknologi, dan diagram arsitektur.

---

### 16. Audit & Penyelarasan Desain Antarmuka Standar Desainer (Anti-Slop Filter)

* **Fase:** *UI/UX Craftsmanship Audit & Anti-Slop Enforcement*
* **Tujuan Asli:** Menyesuaikan UI/UX dengan skill antislop agar antarmuka tidak terkesan sebagai template AI generik.
* **Formulasi Prompt Profesional:**
  ```text
  Lakukan audit kualitas desain mengacu pada 38 aturan Craftsmanship Standard dalam filter `antislop`:
  1. Audit Palet Warna (R-01): Pastikan sistem warna berakar pada identitas alam fabel Nusantara 
     (Rimba `#14382C`, Terracotta `#C25E34`, Sungai `#267D73`, Surya `#EAA22E`, Papirus `#FAF7EE`) 
     dan terbebas dari gradasi ungu-biru neon atau radial orb AI.
  2. Audit Ikon Semantik (R-04): Ganti seluruh ikon generic AI `Sparkles` dengan ikon fungsional yang relevan 
     (Tanya Kancil -> `HelpCircle`, Diagnostik -> `Brain`, Level Generator -> `Compass`/`Layers`, LKS -> `FileText`).
  3. Audit Tombol Taktil (C-2, R-26): Pertahankan tombol interaktif 3D dengan kedalaman bayangan fisik 
     dan efek tekan mekanis yang ramah anak.
  4. Audit Teks (R-02): Verifikasi ketiadaan karakter em dash (`—`) dan eliminasi jargon AI generik.
  5. Audit Aksesibilitas (R-25, R-32): Uji rasio kontras teks (> 10:1) dan responsivitas layout di layar Chromebook.
  ```
* **Dampak & Luaran Teknis:**
  * Eliminasi 100% ikon generic sparkles di seluruh komponen antarmuka.
  * Sertifikasi kepatuhan desain beridentitas lokal yang lolos sensor anti-slop.

---

### 17. Penilaian Kesiapan Rilis Publik & Presentasi Dewan Juri

* **Fase:** *Pre-Flight Check & Production Readiness Verification*
* **Tujuan Asli:** Memastikan apakah proyek sudah siap ditampilkan ke juri dan di-hosting ke publik.
* **Formulasi Prompt Profesional:**
  ```text
  Lakukan audit kesiapan peluncuran (Pre-Flight Production & Jury Presentation Audit):
  1. Verifikasi integritas build produksi `npm run build` pada seluruh 14 rute halaman dan API serverless.
  2. Evaluasi kesiapan live demo di hadapan juri: ketersediaan tombol 1-klik, responsivitas suara, 
     dan kecepatan eksekusi kanvas 60 FPS.
  3. Susun checklist deployment hosting publik (Vercel) beserta konfigurasi variabel lingkungan yang aman.
  ```
* **Dampak & Luaran Teknis:**
  * Terverifikasi 100% lulus build produksi (Exit Code 0).
  * Panduan deployment siap pakai untuk tim pengembang.

---

## 🏆 Kesimpulan & Refleksi Rekayasa Perangkat Lunak

Transformasi prompt dari instruksi percakapan praktis menjadi spesifikasi teknis formal mencerminkan metodologi **Agile & Human-in-the-Loop AI Engineering**:

1. **Iteratif & Tangkas:** Setiap instruksi dibangun di atas fondasi deliverable sprint sebelumnya, meminimalkan *technical debt*.
2. **Kepatuhan Privasi & Regulasi Sejak Desain (*Privacy by Design*):** Komitmen terhadap Zero-PII dan proteksi anak diterapkan konsisten dari perancangan database hingga antarmuka.
3. **Sentuhan Humanis Beridentitas Budaya:** Desain visual dan dialog Sokratik berhasil memadukan teknologi kecerdasan buatan mutakhir (Gemini 2.5 Flash) dengan kearifan lokal fabel Nusantara tanpa terperangkap dalam jebakan *AI generic slop*.
