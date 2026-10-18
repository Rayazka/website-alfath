/**
 * @file script.js
 * @brief Connect article storage, DOM rendering, and jQuery interactions.
 * @author ray
 * @created 2026-10-18
 * @todo none
 */
'use strict';

{
    const STORAGE_KEY = 'alfath.articles.w5.v1';
    const PAGE_SIZE = 5;
    const FORM_FIELDS = ['judul', 'kategori', 'tanggal', 'gambar', 'isi'];
    const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    let articleList = [];
    let currentPage = 1;
    let detailArticleId = null;
    let detailTrigger = null;
    let sidebarOpen = false;

    // Durasi nol menghormati preferensi pengguna yang sensitif terhadap gerakan.
    function effectDuration() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
    }

    // Pesan storage bertahan agar mode memori tidak disalahartikan sebagai penyimpanan permanen.
    function showStorageWarning(message) {
        document.getElementById('storage-warning').textContent = message;
        $('#storage-warning').show();
        document.getElementById('storage-status').textContent = 'Mode data sementara · periksa pesan penyimpanan';
    }

    // Boundary storage menampilkan kegagalan akses/quota secara eksplisit pada UI.
    function persistArticles() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(articleList));
            $('#storage-warning').hide();
            document.getElementById('storage-status').textContent = 'Tersimpan di browser ini · localStorage · tanpa backend';
            return true;
        } catch (error) {
            showStorageWarning(`Penyimpanan browser gagal (${error.name}). Perubahan hanya ada di halaman ini dan dapat hilang saat pindah halaman atau refresh.`);
            return false;
        }
    }

    // Seed hanya digunakan untuk key yang belum ada; [] tetap dipertahankan sebagai data sah.
    function loadArticles() {
        try {
            const serialized = window.localStorage.getItem(STORAGE_KEY);
            articleList = serialized === null ? ArticleData.getInitialArticles() : ArticleData.parseStoredArticles(serialized);
            if (serialized === null) persistArticles();
            else document.getElementById('storage-status').textContent = 'Tersimpan di browser ini · localStorage · tanpa backend';
        } catch (error) {
            articleList = ArticleData.getInitialArticles();
            showStorageWarning(`Data lokal tidak dapat dibaca (${error.message}). Menampilkan data demo sementara. Gunakan Reset Data Demo di halaman Data Artikel untuk memulihkan penyimpanan.`);
        }
    }

    // Notifikasi tidak ditutup otomatis supaya hasil interaksi mudah dibaca dan didokumentasikan.
    function showNotification(message, kind = 'success') {
        const notice = document.getElementById('notification');
        notice.textContent = message;
        notice.classList.remove('notice-success', 'notice-error');
        notice.classList.add(kind === 'error' ? 'notice-error' : 'notice-success');
        $('#notification').stop(true, true).hide().fadeIn(effectDuration());
    }

    // textContent memastikan judul/isi artikel diperlakukan sebagai teks, bukan HTML aktif.
    function createElement(tag, text, className = '') {
        const element = document.createElement(tag);
        element.textContent = text;
        element.className = className;
        return element;
    }

    // Sel konsisten memudahkan penggunaan renderer yang sama pada tabel utama dan dashboard.
    function createCell(text, extraClass = '') {
        return createElement('td', text, `px-5 py-3 ${extraClass}`);
    }

    // UTC menghindari pergeseran tanggal akibat zona waktu perangkat.
    function formatDate(isoDate) {
        return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
    }

    // Badge kategori memakai kelas utuh agar Tailwind CDN dapat mendeteksi warnanya.
    function createCategoryCell(article) {
        const palette = {
            kajian: 'bg-red-100 text-alfath-maroon', kegiatan: 'bg-emerald-100 text-emerald-800', opini: 'bg-sky-100 text-sky-800'
        };
        const cell = createCell('');
        cell.append(createElement('span', ArticleData.CATEGORIES[article.kategori],
            `inline-block px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${palette[article.kategori]}`));
        return cell;
    }

    // Atribut data menyambungkan tombol hasil render dengan event delegation jQuery.
    function createActionButton(article, action) {
        const isDetail = action === 'detail';
        const button = createElement('button', isDetail ? 'Detail' : 'Hapus',
            `font-semibold px-1 py-2 ${isDetail ? 'text-sky-700' : 'text-red-700'}`);
        button.type = 'button';
        button.dataset.action = action;
        button.dataset.articleId = String(article.id);
        button.setAttribute('aria-label', `${isDetail ? 'Detail' : 'Hapus'} artikel ${article.judul}`);
        if (isDetail) {
            button.setAttribute('aria-controls', 'article-detail');
            button.setAttribute('aria-expanded', 'false');
        }
        return button;
    }

    // Teks status dipisahkan dari kategori untuk mendukung artikel draft pada semua kategori.
    function createStatusCell(article) {
        const cell = createCell('');
        const palette = article.dipublikasikan ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-100 text-amber-800';
        cell.append(createElement('span', article.dipublikasikan ? 'Terbit' : 'Draft',
            `px-2 py-1 rounded-full text-xs font-semibold ${palette}`));
        return cell;
    }

    // Baris dibangun melalui DOM JavaScript murni agar rubrik render dinamis terlihat jelas.
    function createArticleRow(article) {
        const row = createElement('tr', '', 'hover:bg-gray-50');
        const actions = createCell('', 'whitespace-nowrap');
        actions.append(createActionButton(article, 'detail'), createElement('span', ' | ', 'text-gray-300'),
            createActionButton(article, 'delete'));
        row.append(createCell(String(article.id)), createCell(article.judul, 'font-medium article-title'),
            createCategoryCell(article), createCell(formatDate(article.tanggal), 'text-gray-500 whitespace-nowrap'),
            createStatusCell(article), actions);
        return row;
    }

    // Empty state tetap berada dalam tabel agar struktur kolom dan pembacaan aksesibel terjaga.
    function appendEmptyRow(container, message, columnCount) {
        const row = document.createElement('tr');
        const cell = createCell(message, 'text-center text-gray-500 py-10');
        cell.colSpan = columnCount;
        row.append(cell);
        container.append(row);
    }

    // Label jumlah hasil membedakan pencarian kosong dengan keseluruhan data yang memang kosong.
    function renderPagination(page, filteredCount) {
        const start = filteredCount === 0 ? 0 : page.start + 1;
        const end = page.start + page.items.length;
        document.getElementById('result-count').textContent = `Menampilkan ${start}–${end} dari ${filteredCount} hasil · ${articleList.length} total artikel`;
        document.getElementById('page-info').textContent = `Halaman ${page.page} dari ${page.totalPages}`;
        document.getElementById('prev-page').disabled = page.page === 1;
        document.getElementById('next-page').disabled = page.page === page.totalPages;
    }

    // Filter selalu dijalankan sebelum pagination agar hasil antarhalaman tidak terlewat.
    function renderArticleTable() {
        const query = document.getElementById('article-search').value;
        const category = document.getElementById('category-filter').value;
        const filtered = ArticleData.sortArticles(ArticleData.filterArticles(articleList, query, category));
        const page = ArticleData.paginateArticles(filtered, currentPage, PAGE_SIZE);
        currentPage = page.page;
        const body = document.getElementById('article-table-body');
        body.replaceChildren();
        for (const article of page.items) body.append(createArticleRow(article));
        if (page.items.length === 0) {
            appendEmptyRow(body, articleList.length ? 'Artikel tidak ditemukan. Coba kata kunci atau kategori lain.' : 'Belum ada artikel. Tambahkan artikel baru atau reset data demo.', 6);
        }
        renderPagination(page, filtered.length);
    }

    // Dashboard memakai renderer ringkas tanpa tombol admin yang tidak diperlukan di sini.
    function renderRecentArticles() {
        const body = document.getElementById('recent-articles');
        body.replaceChildren();
        for (const article of ArticleData.sortArticles(articleList).slice(0, 3)) {
            const row = document.createElement('tr');
            row.append(createCell(`${article.judul}${article.dipublikasikan ? '' : ' (Draft)'}`, 'font-medium article-title'),
                createCategoryCell(article), createCell(formatDate(article.tanggal), 'text-gray-500 whitespace-nowrap'));
            body.append(row);
        }
        if (articleList.length === 0) appendEmptyRow(body, 'Belum ada artikel. Tambahkan melalui menu Tambah Artikel.', 3);
    }

    // Semua kartu diturunkan dari satu sumber sehingga angka berubah setelah tambah/hapus.
    function renderDashboard() {
        const stats = ArticleData.getArticleStats(articleList);
        for (const [name, count] of Object.entries(stats)) {
            document.getElementById(`stat-${name}`).textContent = String(count);
        }
        document.getElementById('publication-summary').textContent = `${stats.total - stats.draft} artikel terbit dan ${stats.draft} draft. Total ${stats.total} artikel dalam pengelolaan Al-Fath.`;
        renderRecentArticles();
    }

    // Script bersama hanya menjalankan renderer yang sesuai dengan container halaman aktif.
    function renderCurrentPage() {
        if (document.getElementById('article-table-body')) renderArticleTable();
        if (document.getElementById('recent-articles')) renderDashboard();
    }

    // Isi detail diganti sebagai teks agar artikel dengan markup tetap aman dibaca.
    function populateDetail(article) {
        document.getElementById('detail-title').textContent = article.judul;
        document.getElementById('detail-meta').textContent = `${ArticleData.CATEGORIES[article.kategori]} · ${formatDate(article.tanggal)} · ${article.dipublikasikan ? 'Terbit' : 'Draft'}`;
        document.getElementById('detail-content').textContent = article.isi;
        document.getElementById('detail-cover').textContent = `Metadata sampul: ${article.namaGambar} · Berkas gambar tidak disimpan atau diunggah.`;
    }

    // Fokus menuju heading membantu pengguna keyboard menemukan panel yang baru terbuka.
    function focusDetailTitle() {
        document.getElementById('detail-title').focus();
    }

    // Tombol yang sama men-toggle panel, sedangkan tombol artikel lain mengganti isinya.
    function handleDetailClick(event) {
        const button = event.currentTarget;
        const id = Number(button.dataset.articleId);
        if (detailArticleId === id) {
            closeDetail();
            return;
        }
        const article = findArticle(id);
        if (!article) return;
        closeDetail();
        detailArticleId = id;
        detailTrigger = button;
        populateDetail(article);
        button.setAttribute('aria-expanded', 'true');
        $('#article-detail').stop(true, true).slideToggle(effectDuration(), focusDetailTitle);
    }

    // Menutup panel juga membersihkan state ARIA agar tidak tertinggal setelah tabel dirender ulang.
    function closeDetail() {
        $('#article-detail').stop(true, true).hide();
        $('#article-table-body [data-action="detail"]').attr('aria-expanded', 'false');
        detailArticleId = null;
    }

    // Fokus dikembalikan ke tombol pemicu saat pengguna menutup detail secara eksplisit.
    function handleCloseDetail() {
        $('#article-detail').stop(true, true).slideToggle(effectDuration());
        $('#article-table-body [data-action="detail"]').attr('aria-expanded', 'false');
        detailArticleId = null;
        if (detailTrigger && detailTrigger.isConnected) detailTrigger.focus();
    }

    // Pencarian ID terpusat mencegah perbedaan identitas antara event dan data domain.
    function findArticle(id) {
        for (const article of articleList) {
            if (article.id === id) return article;
        }
        return null;
    }

    // Konfirmasi dilakukan sebelum mutasi, sehingga pembatalan tidak menyentuh storage.
    function handleDeleteClick(event) {
        const article = findArticle(Number(event.currentTarget.dataset.articleId));
        if (!article || !window.confirm(`Hapus artikel "${article.judul}"?`)) return;
        const remaining = [];
        for (const item of articleList) {
            if (item.id !== article.id) remaining.push(item);
        }
        articleList = remaining;
        const persisted = persistArticles();
        closeDetail();
        renderArticleTable();
        showNotification(`Artikel "${article.judul}" dihapus${persisted ? ' dari data lokal.' : ' dari halaman ini (mode sementara).'}`);
    }

    // Halaman kembali ke awal ketika filter berubah agar hasil baru langsung terlihat.
    function handleFilterChange() {
        currentPage = 1;
        closeDetail();
        renderArticleTable();
    }

    // Tombol sebelumnya dan berikutnya menggunakan satu jalur navigasi yang dijepit renderer.
    function handlePageChange(event) {
        currentPage += event.currentTarget.id === 'next-page' ? 1 : -1;
        closeDetail();
        renderArticleTable();
    }

    // Reset eksplisit memulihkan demo, termasuk ketika storage sebelumnya rusak.
    function handleResetData() {
        if (!window.confirm('Reset semua perubahan dan kembalikan 8 artikel demo awal?')) return;
        articleList = ArticleData.getInitialArticles();
        const persisted = persistArticles();
        document.getElementById('article-search').value = '';
        document.getElementById('category-filter').value = '';
        handleFilterChange();
        showNotification(persisted ? 'Data demo direset ke 8 artikel awal.' : 'Data demo direset di halaman ini saja (mode sementara).');
    }

    // Nilai diambil sekali saat submit agar validasi dan pembuatan artikel memakai snapshot yang sama.
    function readFormValues() {
        const values = {};
        for (const name of FORM_FIELDS) {
            if (name !== 'gambar') values[name] = document.getElementById(name).value;
        }
        return values;
    }

    // State validasi lama dibersihkan sebelum penilaian ulang sehingga error tidak menumpuk.
    function clearFormErrors() {
        for (const name of FORM_FIELDS) {
            document.getElementById(`error-${name}`).textContent = '';
            document.getElementById(name).removeAttribute('aria-invalid');
        }
    }

    // Urutan field mengikuti tampilan form, bukan urutan properti object error.
    function displayFormErrors(errors) {
        for (const name of FORM_FIELDS) {
            if (!errors[name]) continue;
            document.getElementById(`error-${name}`).textContent = errors[name];
            document.getElementById(name).setAttribute('aria-invalid', 'true');
        }
        showNotification('Artikel belum disimpan. Periksa field yang ditandai di bawah.', 'error');
        for (const name of FORM_FIELDS) {
            if (errors[name]) {
                document.getElementById(name).focus();
                break;
            }
        }
    }

    // Submit tetap di client; data baru hanya dibuat setelah semua field lolos validasi.
    function handleFormSubmit(event) {
        event.preventDefault();
        $('#form-success').hide();
        clearFormErrors();
        const values = readFormValues();
        const file = document.getElementById('gambar').files[0];
        const errors = ArticleData.validateArticleInput(values, file);
        if (Object.keys(errors).length > 0) {
            displayFormErrors(errors);
            return;
        }
        articleList = [...articleList, ArticleData.createArticle(articleList, values, file)];
        const persisted = persistArticles();
        event.currentTarget.reset();
        showNotification(persisted ? `Artikel "${values.judul.trim()}" berhasil disimpan di browser ini.`
            : 'Artikel ditambahkan ke memori halaman ini. Penyimpanan gagal; data belum tersedia di halaman lain.', persisted ? 'success' : 'error');
        if (persisted) $('#form-success').fadeIn(effectDuration());
        document.getElementById('notification').scrollIntoView({ block: 'center' });
    }

    // Error field diperbarui selama koreksi, tanpa menampilkan error baru sebelum submit pertama.
    function handleFieldCorrection(event) {
        const field = event.target;
        if (field.getAttribute('aria-invalid') !== 'true') return;
        const errors = ArticleData.validateArticleInput(readFormValues(), document.getElementById('gambar').files[0]);
        document.getElementById(`error-${field.id}`).textContent = errors[field.id] || '';
        if (!errors[field.id]) field.removeAttribute('aria-invalid');
    }

    // Sidebar tetap konsisten dengan breakpoint lg W4 dan tidak mengunci scroll desktop.
    function syncSidebarLayout() {
        const isMobile = window.matchMedia('(max-width: 1023px)').matches;
        if (!isMobile) sidebarOpen = false;
        $('#sidebar').toggleClass('-translate-x-full', !sidebarOpen).prop('inert', isMobile && !sidebarOpen);
        $('#admin-content').prop('inert', isMobile && sidebarOpen);
        $('#sidebar-overlay').toggleClass('hidden', !isMobile || !sidebarOpen);
        $('#sidebar-toggle').attr('aria-expanded', String(sidebarOpen));
        document.body.style.overflow = isMobile && sidebarOpen ? 'hidden' : '';
    }

    // Fokus masuk ke navigasi setelah drawer mobile dibuka.
    function openSidebar() {
        sidebarOpen = true;
        syncSidebarLayout();
        document.querySelector('#sidebar a').focus();
    }

    // Overlay dan Escape menutup drawer melalui jalur yang sama.
    function closeSidebar() {
        sidebarOpen = false;
        syncSidebarLayout();
        document.getElementById('sidebar-toggle').focus();
    }

    // Escape menyediakan jalan keluar keyboard dari drawer maupun detail.
    function handleEscape(event) {
        if (event.key !== 'Escape') return;
        if (sidebarOpen) closeSidebar();
        else if (detailArticleId !== null) handleCloseDetail();
    }

    // Perubahan tab lain dibaca kembali supaya dashboard tidak mempertahankan angka lama.
    function handleStorageChange(event) {
        const changedKey = event.originalEvent.key;
        if (changedKey !== STORAGE_KEY && changedKey !== null) return;
        $('#storage-warning').hide();
        loadArticles();
        closeDetail();
        renderCurrentPage();
    }

    // Seluruh interaksi memakai jQuery; delegasi menangani tombol tabel yang dibuat ulang.
    function bindEvents() {
        $('#article-search').on('input', handleFilterChange);
        $('#category-filter').on('change', handleFilterChange);
        $('#prev-page, #next-page').on('click', handlePageChange);
        $('#article-table-body').on('click', '[data-action="detail"]', handleDetailClick);
        $('#article-table-body').on('click', '[data-action="delete"]', handleDeleteClick);
        $('#close-detail').on('click', handleCloseDetail);
        $('#reset-data').on('click', handleResetData);
        $('#article-form').on('submit', handleFormSubmit).on('input change', 'input, select, textarea', handleFieldCorrection);
        $('#sidebar-toggle').on('click', openSidebar);
        $('#sidebar-overlay').on('click', closeSidebar);
        $(document).on('keydown', handleEscape);
        $(window).on('resize', syncSidebarLayout).on('storage', handleStorageChange);
    }

    // Pengecekan library memberi pesan yang bisa ditindaklanjuti ketika CDN tidak terjangkau.
    function initializeApp() {
        if (typeof window.jQuery !== 'function' || typeof ArticleData === 'undefined') {
            const warning = document.getElementById('storage-warning');
            warning.textContent = 'Library aplikasi belum termuat. Periksa koneksi internet untuk jQuery CDN, lalu muat ulang halaman.';
            warning.style.display = 'block';
            return;
        }
        loadArticles();
        renderCurrentPage();
        bindEvents();
        syncSidebarLayout();
    }

    initializeApp();
}
