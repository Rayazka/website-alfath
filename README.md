# LDK Al-Fath Telkom University — Website Profil & Artikel

### Minggu ke-2 (W2) — Struktur HTML tanpa CSS

Fokus: kerangka semantik semua halaman, belum ada styling.

| File         | Halaman                                  | Screenshot                              |
| ------------ | ---------------------------------------- | --------------------------------------- |
| `w2_1.png` | Beranda (`index.html`) polos           | ![W2 Beranda](assets/progress/w2_1.png) |
| `w2_2.png` | Detail artikel (`artikel.html`) polos  | ![W2 Artikel](assets/progress/w2_2.png) |
| `w2_3.png` | Panel admin (`form-upload.html`) polos | ![W2 Admin](assets/progress/w2_3.png)   |

Minggu ke-3 (W3) — Styling Pure CSS + Responsive

**1. Beranda**

| Desktop                                         | Mobile (responsive)                             |
| ----------------------------------------------- | ----------------------------------------------- |
| ![W3 Beranda Desktop](assets/progress/w3_1.png) | ![W3 Beranda Mobile](assets/progress/w3_1b.png) |

**2. Detail Artikel**

| Desktop                                         | Mobile (responsive)                             |
| ----------------------------------------------- | ----------------------------------------------- |
| ![W3 Artikel Desktop](assets/progress/w3_2.png) | ![W3 Artikel Mobile](assets/progress/w3_2b.png) |

**3. Panel Admin**

| Desktop                                       | Mobile (responsive)                           |
| --------------------------------------------- | --------------------------------------------- |
| ![W3 Admin Desktop](assets/progress/w3_3.png) | ![W3 Admin Mobile](assets/progress/w3_3b.png) |

### Minggu ke-4 (W4) — Refactor Tailwind CSS + Kerangka Halaman Responsif

Fokus: migrasi dari pure CSS (`style/*.css` jadi arsip) ke Tailwind CDN Play dengan
kustomisasi leluasa (`tailwind.config` inline: `alfath-maroon #9B1C1C`).
Belum terhubung ke backend/database — semua data masih dummy statis.

| File | Halaman | Fungsi syarat tugas |
| ---- | ------- | ------------------- |
| `index.html` | Beranda publik | Dashboard/grid utama publik: stat `grid-cols-1 sm:2 xl:4` + artikel `1 / md:2 / lg:3` |
| `dashboard.html` | Dashboard admin | Grid admin: 4 kartu statistik + `lg:grid-cols-3` (tabel ringkas + aktivitas) |
| `data.html` | Daftar data | Tabel responsif `overflow-x-auto` + search/filter/pagination dummy (pisahan dari form) |
| `form-upload.html` | Form tambah artikel | Form tambah data: judul, kategori, tanggal, file, textarea |
| `login.html` | Form login | Form login centered `max-w-sm` (dummy → `dashboard.html`) |
| `artikel.html` | Detail artikel | Detail + `<ul>` list info kegiatan |

Navigasi responsif:

- Publik (`index.html`, `artikel.html`): navbar atas `sticky`, `hidden md:flex`, hamburger → toggle `#nav-mobile`.
- Admin (`dashboard.html`, `data.html`, `form-upload.html`): sidebar `fixed -translate-x-full lg:translate-x-0` + overlay + topbar hamburger.
- Login: tanpa nav, hanya link kembali.

Uji responsif (minimal 2 ukuran, kami uji 3):

- 375px mobile: 1 kolom, drawer nav, tabel scroll horizontal.
- 768px tablet: 2 kolom kartu/artikel, toolbar mulai row.
- 1280px desktop: 4 kolom kartu, sidebar permanen.

Cara jalankan: buka file `.html` langsung di browser atau `npx serve .`.
Screenshot progress W4 simpan di `assets/progress/` (mis. `w4_dashboard.png`, `w4_data.png`, dsb).
