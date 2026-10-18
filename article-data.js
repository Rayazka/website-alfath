/**
 * @file article-data.js
 * @brief Process dummy articles with pure, testable functions.
 * @author ray
 * @created 2026-10-18
 * @todo none
 */
'use strict';

// Namespace dibekukan setelah inisialisasi; blok menjaga helper internal dari global browser.
const ArticleData = {};
{
    const CATEGORIES = Object.freeze({
        kajian: 'Kajian Islam', kegiatan: 'Berita Kegiatan', opini: 'Opini & Edukasi'
    });
    const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

    // Seed dikembalikan sebagai objek baru agar reset tidak terpengaruh perubahan pengguna.
    function getInitialArticles() {
        return [
            { id: 1, judul: 'Kajian Rutin Pekanan Mahasiswa', kategori: 'kajian', tanggal: '2026-10-01', dipublikasikan: true,
                isi: 'Kajian pekanan LDK Al-Fath mengajak mahasiswa memperkuat pemahaman Islam dan ukhuwah. Kegiatan berlangsung di Masjid Syamsul Ulum setelah salat Magrib.', namaGambar: 'kajian-pekanan.jpg' },
            { id: 2, judul: 'Syiar Kampus & Pembinaan Karakter', kategori: 'kegiatan', tanggal: '2026-09-28', dipublikasikan: true,
                isi: 'Relawan Al-Fath menyelenggarakan pembinaan karakter melalui diskusi, mentoring, dan aksi kepedulian di lingkungan Telkom University.', namaGambar: 'syiar-kampus.jpg' },
            { id: 3, judul: 'Kepemimpinan Islam Generasi Muda', kategori: 'opini', tanggal: '2026-09-20', dipublikasikan: true,
                isi: 'Amanah, kejujuran, dan kepedulian menjadi bekal kepemimpinan mahasiswa. Artikel ini mengajak pembaca menerapkannya dalam organisasi kampus.', namaGambar: 'kepemimpinan.jpg' },
            { id: 4, judul: 'Mabit Akbar Muslim Tel-U', kategori: 'kegiatan', tanggal: '2026-09-15', dipublikasikan: false,
                isi: 'Rancangan kegiatan malam bina iman dan takwa: tilawah, kajian bersama, serta refleksi diri. Jadwal dan susunan acara masih menunggu review pengurus.', namaGambar: 'mabit.jpg' },
            { id: 5, judul: 'Tabligh Akbar Menyambut Ramadhan', kategori: 'kegiatan', tanggal: '2026-09-10', dipublikasikan: true,
                isi: 'Persiapan menyambut Ramadhan dimulai dengan menata niat dan memperluas ilmu. Panitia mengundang sivitas kampus mengikuti tabligh akbar Al-Fath.', namaGambar: 'tabligh-akbar.jpg' },
            { id: 6, judul: 'Kajian Adab Menuntut Ilmu', kategori: 'kajian', tanggal: '2026-10-08', dipublikasikan: true,
                isi: 'Kajian membahas adab kepada guru, menghargai teman belajar, dan menjaga konsistensi. Peserta dapat membawa catatan serta pertanyaan untuk sesi diskusi.', namaGambar: 'adab-ilmu.jpg' },
            { id: 7, judul: 'Menjaga Keseimbangan Kuliah dan Ibadah', kategori: 'opini', tanggal: '2026-10-12', dipublikasikan: true,
                isi: 'Mengatur prioritas membantu mahasiswa memenuhi amanah akademik dan menjaga ibadah. Mulai dari jadwal realistis, istirahat cukup, dan dukungan teman yang baik.', namaGambar: 'kuliah-ibadah.jpg' },
            { id: 8, judul: 'Kajian Fikih Keseharian Mahasiswa', kategori: 'kajian', tanggal: '2026-10-16', dipublikasikan: false,
                isi: 'Materi fikih keseharian mahasiswa sedang disiapkan tim syiar. Pertanyaan seputar ibadah di kampus akan dihimpun sebelum artikel dipublikasikan.', namaGambar: 'fikih-mahasiswa.jpg' }
        ];
    }

    // Pencarian dan kategori diproses bersama tanpa mengubah array sumber.
    function filterArticles(articles, query, category) {
        const normalizedQuery = query.trim().toLocaleLowerCase('id-ID');
        // Predicate lokal mempertahankan konteks pencarian tanpa state global.
        return articles.filter(function matchesFilters(article) {
            return article.judul.toLocaleLowerCase('id-ID').includes(normalizedQuery)
                && (!category || article.kategori === category);
        });
    }

    // Salinan array menjaga urutan sumber tetap stabil ketika dashboard diurutkan.
    function sortArticles(articles) {
        // Tanggal ISO bisa dibandingkan langsung; ID memecahkan tanggal yang sama.
        return [...articles].sort(function compareLatest(first, second) {
            return second.tanggal.localeCompare(first.tanggal) || second.id - first.id;
        });
    }

    // Halaman dijepit ke batas valid agar penghapusan tidak menyisakan halaman kosong.
    function paginateArticles(articles, requestedPage, pageSize) {
        const totalPages = Math.max(1, Math.ceil(articles.length / pageSize));
        const page = Math.max(1, Math.min(requestedPage, totalPages));
        const start = (page - 1) * pageSize;
        return { page, totalPages, items: articles.slice(start, start + pageSize), start };
    }

    // Status publikasi dihitung terpisah dari kategori agar draft tidak menjadi kategori.
    function getArticleStats(articles) {
        const stats = { total: articles.length, kajian: 0, kegiatan: 0, draft: 0 };
        for (const article of articles) {
            if (article.kategori === 'kajian') stats.kajian += 1;
            if (article.kategori === 'kegiatan') stats.kegiatan += 1;
            if (!article.dipublikasikan) stats.draft += 1;
        }
        return stats;
    }

    // Perbandingan balik ISO menolak tanggal kalender seperti 30 Februari.
    function isValidDate(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const parsed = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }

    // Pemeriksaan MIME dan ekstensi melengkapi accept pada input file sisi browser.
    function getImageError(file) {
        if (!file) return 'Pilih gambar sampul PNG atau JPG.';
        if (!['image/png', 'image/jpeg'].includes(file.type) || !/\.(png|jpe?g)$/i.test(file.name)) {
            return 'Gambar harus berformat PNG atau JPG.';
        }
        if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return 'Ukuran gambar harus lebih dari 0 dan maksimal 2 MB.';
        return '';
    }

    // Error per field mendukung pesan inline dan pemindahan fokus ke input pertama.
    function validateArticleInput(values, file) {
        const errors = {};
        if (!values.judul.trim()) errors.judul = 'Judul artikel wajib diisi, bukan hanya spasi.';
        if (!Object.hasOwn(CATEGORIES, values.kategori)) errors.kategori = 'Pilih kategori artikel yang tersedia.';
        if (!isValidDate(values.tanggal)) errors.tanggal = 'Isi tanggal terbit yang valid.';
        if (!values.isi.trim()) errors.isi = 'Isi artikel wajib diisi, bukan hanya spasi.';
        const imageError = getImageError(file);
        if (imageError) errors.gambar = imageError;
        return errors;
    }

    // ID berdasarkan nilai terbesar, bukan panjang array yang berubah setelah hapus.
    function createArticle(articles, values, file) {
        let largestId = 0;
        for (const article of articles) largestId = Math.max(largestId, article.id);
        return {
            id: largestId + 1, judul: values.judul.trim(), kategori: values.kategori,
            tanggal: values.tanggal, isi: values.isi.trim(), dipublikasikan: true,
            namaGambar: file.name
        };
    }

    // Data dari storage diperiksa sebelum diberikan ke renderer dan fungsi domain.
    function isValidArticle(article) {
        return article !== null && typeof article === 'object'
            && Number.isSafeInteger(article.id) && article.id > 0
            && typeof article.judul === 'string' && article.judul.trim().length > 0
            && Object.hasOwn(CATEGORIES, article.kategori) && isValidDate(article.tanggal)
            && typeof article.isi === 'string' && article.isi.trim().length > 0
            && typeof article.dipublikasikan === 'boolean' && typeof article.namaGambar === 'string';
    }

    // Array kosong tetap sah; payload rusak atau ID ganda dilaporkan ke batas UI.
    function parseStoredArticles(serialized) {
        const parsed = JSON.parse(serialized);
        if (!Array.isArray(parsed)) throw new Error('Data artikel tersimpan bukan sebuah array.');
        const seenIds = new Set();
        for (const article of parsed) {
            if (!isValidArticle(article) || seenIds.has(article.id)) {
                throw new Error('Data artikel tersimpan memiliki format tidak valid atau ID ganda.');
            }
            seenIds.add(article.id);
        }
        return parsed;
    }

    Object.assign(ArticleData, { CATEGORIES, getInitialArticles, filterArticles, sortArticles,
        paginateArticles, getArticleStats, validateArticleInput, createArticle, parseStoredArticles });
    Object.freeze(ArticleData);
}

if (typeof module !== 'undefined' && module.exports) module.exports = ArticleData;
