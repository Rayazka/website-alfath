# Panduan demo dan pengumpulan Minggu 05

## Video yang sudah tersedia

**[Video demo aktual — w5-demo.webm](screenshots/w5-demo.webm)**

- Durasi: 53,24 detik; resolusi 1280 × 900; format WebM; sekitar 3 MB.
- Tanpa narasi; seluruh interaksi direkam dari halaman aplikasi yang berjalan di server lokal.
- Isi: dashboard awal, pencarian/filter, buka/tutup detail, pagination, validasi form kosong,
  pengisian form valid, notifikasi sukses, artikel baru di tabel, persistensi setelah refresh,
  statistik dashboard bertambah, dan penghapusan artikel.
- Buka berkas langsung di Chrome/Edge/VLC atau jalankan server lalu buka
  `http://127.0.0.1:8000/docs/screenshots/w5-demo.webm`.
- Pada GitHub, pilih **View raw/Download** jika berkas tidak ditampilkan sebagai pemutar video.

## Mengulang demonstrasi dengan narasi sendiri

1. Jalankan `python -m http.server 8000 --bind 127.0.0.1` dari root repository.
2. Buka `http://127.0.0.1:8000/data.html`, klik **Reset Data Demo**, dan setujui konfirmasi.
3. Buka dashboard: total **8**, kajian **3**, kegiatan **3**, draft **2**.
4. Buka Data Artikel, ketik `kajian`, lalu pilih **Kajian Islam**: tampil **3 hasil**.
5. Klik **Detail** untuk membuka panel dengan efek jQuery; klik **Tutup**.
6. Kosongkan pencarian/filter dan klik **Next** untuk memperlihatkan pagination.
7. Buka Tambah Artikel lalu klik **Simpan Artikel** tanpa mengisi field: tunjukkan pesan error.
8. Isi contoh berikut:
   - Judul: `Kajian Akhlak Mahasiswa Al-Fath`.
   - Kategori: Kajian Islam.
   - Tanggal: 18 Oktober 2026.
   - Gambar: PNG/JPG valid maksimal 2 MB; logo PNG dalam folder `assets/` juga bisa digunakan.
   - Isi: `Kajian Al-Fath membahas adab pergaulan dan amanah organisasi mahasiswa.`
9. Simpan dan klik tautan **Lihat artikel yang ditambahkan**: total menjadi **9**.
10. Refresh untuk membuktikan persistensi, lalu buka dashboard: total **9**, kajian **4**.
11. Hapus artikel baru setelah konfirmasi: total kembali **8**.
12. Jika ingin mengulang dari awal, gunakan **Reset Data Demo**.

### Poin penjelasan kode saat presentasi

- `article-data.js`: array of object dan tipe number/string/boolean, fungsi filter/statistik,
  percabangan validasi, serta perulangan penghitung.
- `script.js`: perulangan render DOM murni, localStorage sebagai penyimpanan dummy lintas halaman,
  `.on()` sebagai event handling jQuery, `slideToggle()` dan `fadeIn()` sebagai efek UI.
- Gambar tidak diunggah atau disimpan isinya; hanya metadata nama file.
- Tidak ada backend, database, atau autentikasi sungguhan. Login masih mengikuti simulasi W4.

## Tautan video eksternal bila diwajibkan dosen

Video lokal sudah ditautkan dari README. Untuk menyediakan URL streaming publik:

1. Unggah `docs/screenshots/w5-demo.webm` ke Google Drive milik sendiri, atau ke YouTube dengan visibilitas **Unlisted**.
2. Untuk Drive, atur izin penonton menjadi **Anyone with the link / Siapa saja yang memiliki link**.
3. Tambahkan URL sebenarnya pada bagian **Video interaktivitas** di README.
4. Buka URL tersebut melalui jendela incognito untuk memastikan tidak membutuhkan login pemilik.

Belum ada URL Drive/YouTube yang dicantumkan karena rekaman belum diunggah ke layanan eksternal.

## GitHub dan LMS

- Periksa perubahan, lalu buat commit baru pada repository yang sama; jangan reset/amend histori W2–W4.
- Sertakan kode, screenshot, video, unit test, dan dokumentasi W5.
- Push dan pastikan README, seluruh gambar, serta tautan video dapat diakses dari GitHub.
- Salin tautan repository atau permalink commit terbaru sesuai format LMS, lalu kirim melalui akun sendiri.
