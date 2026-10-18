/**
 * @file tests/article-data.test.js
 * @brief Verify article filtering, pagination, validation, and persistence payloads.
 * @author ray
 * @created 2026-10-18
 * @todo none
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const articles = require('../article-data.js');

// Pastikan perubahan data demo tidak mencemari seed pemuatan berikutnya.
test('seed articles are independent and contain eight records', function verifyIndependentSeed() {
    const first = articles.getInitialArticles();
    first[0].judul = 'Diubah';
    assert.equal(first.length, 8);
    assert.notEqual(articles.getInitialArticles()[0].judul, 'Diubah');
});

// Pencarian judul dan kategori harus berlaku bersamaan, termasuk input berspasi.
test('search is case insensitive and combines with category', function verifyCombinedFilter() {
    const seed = articles.getInitialArticles();
    const matches = articles.filterArticles(seed, '  KAJIAN  ', 'kajian');
    assert.ok(matches.length > 0);
    // Seluruh hasil harus memenuhi kedua kriteria, bukan hanya salah satunya.
    assert.ok(matches.every(function matchesKajian(article) {
        return article.kategori === 'kajian' && article.judul.toLowerCase().includes('kajian');
    }));
    assert.deepEqual(articles.filterArticles(seed, 'tidak ada judul ini', ''), []);
});

// Menghapus item terakhir di halaman akhir harus mengembalikan pengguna ke halaman valid.
test('pagination clamps stale pages after deletions and handles empty data', function verifyPaginationBounds() {
    const page = articles.paginateArticles(articles.getInitialArticles(), 9, 5);
    assert.equal(page.page, 2);
    assert.equal(page.items.length, 3);
    const empty = articles.paginateArticles([], 2, 5);
    assert.equal(empty.page, 1);
    assert.equal(empty.totalPages, 1);
    assert.deepEqual(empty.items, []);
});

// Dashboard harus menghitung status terpisah dari kategori, tanpa angka hardcoded.
test('statistics count categories and publication status independently', function verifyStats() {
    const seed = articles.getInitialArticles();
    const stats = articles.getArticleStats(seed);
    assert.deepEqual(stats, { total: 8, kajian: 3, kegiatan: 3, draft: 2 });
    assert.deepEqual(articles.getArticleStats([]), { total: 0, kajian: 0, kegiatan: 0, draft: 0 });
});

// Pengurutan dashboard tidak boleh mengubah urutan array sumber.
test('latest articles are sorted without mutating source', function verifyDateSort() {
    const seed = articles.getInitialArticles();
    // Snapshot identitas membuktikan bahwa pengurutan tidak memutasi input.
    function getId(article) { return article.id; }
    const previousIds = seed.map(getId);
    const sorted = articles.sortArticles(seed);
    assert.ok(sorted[0].tanggal >= sorted[1].tanggal);
    assert.deepEqual(seed.map(getId), previousIds);
});

// Validasi kustom diperlukan agar whitespace tidak lolos sebagai judul atau isi.
test('validation rejects blank fields and missing cover', function verifyRequiredFields() {
    const errors = articles.validateArticleInput({ judul: '  ', kategori: '', tanggal: '', isi: ' ' }, null);
    assert.deepEqual(Object.keys(errors).sort(), ['gambar', 'isi', 'judul', 'kategori', 'tanggal']);
});

// Menyamakan validasi ekstensi, MIME, ukuran, dan kalender mencegah input ambigu.
test('validation accepts valid input and rejects invalid files and dates', function verifyInputLimits() {
    const values = { judul: 'Kajian', kategori: 'kajian', tanggal: '2026-10-18', isi: 'Materi kajian' };
    const cover = { name: 'sampul.png', type: 'image/png', size: 1024 };
    assert.deepEqual(articles.validateArticleInput(values, cover), {});
    assert.ok(articles.validateArticleInput(values, { ...cover, size: 2097153 }).gambar);
    assert.ok(articles.validateArticleInput(values, { ...cover, type: 'image/svg+xml' }).gambar);
    assert.ok(articles.validateArticleInput(values, { ...cover, name: 'sampul.exe' }).gambar);
    assert.ok(articles.validateArticleInput({ ...values, tanggal: '2026-02-30' }, cover).tanggal);
    assert.ok(articles.validateArticleInput({ ...values, kategori: 'asing' }, cover).kategori);
});

// ID tidak boleh bertabrakan setelah penghapusan meninggalkan celah nomor.
test('new articles get unique IDs and trimmed fields without mutating the list', function verifyCreation() {
    const seed = articles.getInitialArticles();
    const created = articles.createArticle(seed, {
        judul: '  Artikel baru  ', kategori: 'opini', tanggal: '2026-10-18', isi: '  Isi  '
    }, { name: 'sampul.jpg' });
    assert.equal(created.id, 9);
    assert.equal(created.judul, 'Artikel baru');
    assert.equal(created.isi, 'Isi');
    assert.equal(created.dipublikasikan, true);
    assert.equal(created.namaGambar, 'sampul.jpg');
    assert.equal(seed.length, 8);
    assert.equal(articles.createArticle([], created, { name: 'sampul.jpg' }).id, 1);
});

// Array kosong tersimpan berarti pengguna memang telah menghapus semua artikel.
test('stored payload preserves empty arrays and valid records', function verifyValidPayload() {
    assert.deepEqual(articles.parseStoredArticles('[]'), []);
    const seed = articles.getInitialArticles();
    assert.deepEqual(articles.parseStoredArticles(JSON.stringify(seed)), seed);
});

// Payload rusak harus menghasilkan error eksplisit, bukan crash render yang tidak jelas.
test('stored payload rejects broken JSON, duplicates and invalid article shapes', function verifyCorruptPayload() {
    // JSON terpotong tidak boleh diteruskan ke renderer.
    assert.throws(function parseBrokenJson() { articles.parseStoredArticles('{'); });
    // Root object tidak sesuai kontrak daftar artikel.
    assert.throws(function parseObject() { articles.parseStoredArticles('{}'); });
    const seed = articles.getInitialArticles();
    // Identitas ganda membuat aksi detail/hapus ambigu.
    assert.throws(function parseDuplicateIds() { articles.parseStoredArticles(JSON.stringify([seed[0], seed[0]])); });
    // Record parsial ditolak sebelum fungsi statistik dijalankan.
    assert.throws(function parseInvalidRecord() { articles.parseStoredArticles('[{"id":1}]'); });
    // Tanggal kalender yang mustahil tidak boleh merusak pemformatan tanggal UI.
    assert.throws(function parseBadDate() {
        articles.parseStoredArticles(JSON.stringify([{ ...seed[0], tanggal: '2026-02-30' }]));
    });
});
