# Laporan verifikasi Minggu 05

Tanggal pengujian: 18 Oktober 2026. Server: `http://127.0.0.1:8000`.

## Pengujian unit

Perintah: `node --test tests/article-data.test.js` — **10 lulus, 0 gagal**.

1. Seed 8 artikel merupakan objek independen.
2. Pencarian case-insensitive dan kategori berlaku bersamaan.
3. Pagination mengapit halaman yang sudah tidak ada dan menangani daftar kosong.
4. Statistik kategori dan status draft dihitung terpisah.
5. Pengurutan tanggal tidak memutasi sumber.
6. Form menolak field kosong/spasi serta gambar yang belum dipilih.
7. Form menerima input valid, menolak tanggal mustahil serta gambar berekstensi/MIME/ukuran tidak sesuai.
8. Artikel baru memakai ID yang tidak bertabrakan, field di-trim, sumber tidak dimutasi.
9. Payload localStorage mempertahankan `[]` dan record valid.
10. JSON rusak, root bukan array, ID ganda, dan record/tanggal tidak valid ditolak.

## Pengujian browser aktual

Dijalankan melalui Playwright pada Chromium dengan browser context terpisah dari sesi pengguna.
**51 checkpoint lulus**, terdiri dari:

### Alur utama — 23 checkpoint

- Render 8 data awal; pencarian+kategori menghasilkan 3 artikel kajian.
- Detail sesuai artikel; penutupan mengatur kembali `aria-expanded`.
- Empty search state; halaman berikutnya berisi 3 data; pembatalan hapus tidak mengubah jumlah.
- Submit kosong menandai 5 field; fokus berpindah ke field pertama; judul spasi ditolak.
- SVG serta PNG lebih dari 2 MB ditolak.
- Submit valid menyimpan artikel; form dikosongkan; artikel muncul lintas halaman.
- Markup dalam isi artikel tampil sebagai teks literal dan tidak mengeksekusi script.
- Refresh mempertahankan data.
- Statistik kategori serta urutan artikel terbaru dashboard berubah.
- Konfirmasi hapus mengurangi jumlah; dashboard mengikuti penghapusan.
- Tidak ada uncaught JavaScript error pada alur utama.

### Kasus batas dan responsif — 22 checkpoint

- Menghapus item terakhir halaman 2 mengembalikan pagination ke halaman 1.
- Menghapus semua data menampilkan empty state; refresh mempertahankan array kosong; dashboard ikut kosong.
- Reset memulihkan 8 artikel.
- Event storage memperbarui dashboard pada tab lain.
- JSON tersimpan rusak menghasilkan pesan; reset memperbaikinya.
- Tidak ada overflow halaman pada **3 halaman × 3 viewport**: 375, 768, dan 1280 px.
- Sidebar mobile terbuka; Escape menutup dan menonaktifkan fokus navigasi tersembunyi.
- Detail berfungsi pada preferensi reduced motion.
- Penolakan penulisan storage menghasilkan pesan; penghapusan tidak diklaim tersimpan permanen.

### Perbaikan aksesibilitas hasil review — 6 checkpoint

- Konten di belakang drawer mobile dibuat inert.
- Tab tidak masuk ke konten yang tertutup overlay.
- Escape mengaktifkan kembali konten halaman.
- Heading detail yang dibuka bergulir masuk viewport mobile.
- Menutup detail mengembalikan fokus ke tombol pemicu.
- Sidebar desktop tetap interaktif setelah perubahan viewport.

## Bukti visual dan media

- Screenshot menggunakan kondisi halaman nyata; empat pasangan sebelum/sesudah disertakan di README.
- Tambahan screenshot: dashboard, mobile 375 px, notifikasi sukses form, dan hasil hapus.
- Video `docs/screenshots/w5-demo.webm` berhasil dimuat melalui HTTP 200 dan metadata berhasil didekode browser:
  **53,24 detik**, **1280 × 900**, **3.046.990 byte**.
- Console Tailwind menampilkan peringatan penggunaan CDN untuk development, sesuai setup W4.
- Smoke test terakhir setelah perapian namespace tetap lulus; 30 tautan lokal dokumentasi/media diperiksa melalui HTTP tanpa tautan rusak.

## Pemeriksaan statis

```bash
node --check article-data.js
node --check script.js
node --check tests/article-data.test.js
git diff --check
```

Tidak ada dependency build atau backend yang ditambahkan. Verifikasi ini tidak mencakup upload layanan video eksternal,
push GitHub, maupun pengumpulan LMS; langkah tersebut memerlukan akun pemilik repository.
