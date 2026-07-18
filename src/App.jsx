import React, { useState, useEffect } from 'react';

// ==========================================
// KONEKSI DATABASE SUPABASE LIVE
// ==========================================
const SUPABASE_URL = "https://harpdcqmrqdgckcuhxfr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ppzSXi7DuN7v0racT9l98A_JxK5-MGG";

const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// ==========================================
// DATA EKOSISTEM MEDIA (TERMASUK DAKWAHBERKAH)
// ==========================================
const mediaNetwork = [
    { name: "NutrisiDietMu", icon: "🌱", cat: "Media Kesehatan & Gizi", desc: "Portal edukasi gizi klinis dan panduan kesehatan masyarakat.", link: "https://nutrisidietmu.vercel.app" },
    { name: "BolaGass", icon: "⚽", cat: "Media Jurnalisme Olahraga", desc: "Platform jurnalisme sepak bola dengan ulasan taktis mendalam.", link: "#" },
    { name: "GlowLogika", icon: "✨", cat: "Edukasi Skincare & Beauty", desc: "Media literasi kesehatan kulit berdasarkan sains serta fakta medis.", link: "#" },
    { name: "CuanPintar", icon: "💰", cat: "Literasi Finansial & Investasi", desc: "Portal perencanaan keuangan harian dan investasi anak muda.", link: "#" },
    { name: "DakwahBerkah", icon: "🌙", cat: "Media Dakwah & Islami", desc: "Portal edukasi agama, fiqih, dan panduan ibadah harian.", link: "#" }
];

const businessServices = [
    { name: "Web Dev & Techno", icon: "💻", cat: "Pengembangan IT", desc: "Layanan pembuatan website korporat dan infrastruktur sistem digital." },
    { name: "Rayliziie Digital Invitation", icon: "🌐", cat: "Undangan Digital Premium", desc: "Jasa perancangan undangan digital elegan untuk acara formal dan pernikahan." }
];

// TARIF GAJI RELAWAN
const TARIF_PER_ARTIKEL = 15000;
const TARIF_PER_1000_VIEWS = 5000;

const App = () => {
    const [view, setView] = useState('home');
    const [portalMode, setPortalMode] = useState('login');
    
    // Cloud DB States
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Toast Notification State
    const [toast, setToast] = useState(null);

    // Tabs States
    const [adminTab, setAdminTab] = useState('sensor'); // 'sensor', 'published', 'users', 'sdm'
    const [volTab, setVolTab] = useState('dashboard'); // 'dashboard', 'tulis', 'pending', 'published'

    // Form States (Login & Auth)
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    
    // Form States (Articles - For both Create and Edit)
    const [editMode, setEditMode] = useState(false);
    const [editArticleId, setEditArticleId] = useState(null);
    const [artTitle, setArtTitle] = useState('');
    const [artCategory, setArtCategory] = useState('gizi');
    const [artContent, setArtContent] = useState('');
    const [artImageUrl, setArtImageUrl] = useState('');

    // Withdraw States (Untuk Tarik Saldo)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawMethod, setWithdrawMethod] = useState('dana');
    const [withdrawAccount, setWithdrawAccount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    // Helper function for custom notifications (Replacing alerts)
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // AMBIL DATA DARI SUPABASE SECARA REAL-TIME
    const fetchSupabaseData = async () => {
        if (!SUPABASE_URL || SUPABASE_URL.includes("XYZ_GANTI")) return;
        try {
            const resUsers = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users?select=*`, { headers });
            if (resUsers.ok) {
                const dataUsers = await resUsers.json();
                if (Array.isArray(dataUsers)) setUsers(dataUsers);
            }

            const resArticles = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?select=*`, { headers });
            if (resArticles.ok) {
                const dataArticles = await resArticles.json();
                if (Array.isArray(dataArticles)) setArticles(dataArticles);
            }
        } catch (err) {
            console.error("Koneksi Supabase terputus:", err);
        }
    };

    useEffect(() => {
        fetchSupabaseData();
        const interval = setInterval(fetchSupabaseData, 3000);
        return () => clearInterval(interval);
    }, []);

    // REGISTRASI RELAWAN
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (users.find(u => u.email.toLowerCase() === regEmail.toLowerCase()) || regEmail === 'admin') {
            showToast('Email sudah terdaftar di server!', 'error');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, approved: false })
            });

            if (!res.ok) {
                const errData = await res.json();
                showToast(`Server Menolak: ${errData.message}`, 'error');
                setLoading(false); return;
            }

            showToast(`Registrasi Berhasil! Akun menunggu Approval CEO.`);
            setRegName(''); setRegEmail(''); setRegPassword(''); setPortalMode('login');
            fetchSupabaseData();
        } catch (err) {
            showToast('Gagal menyambung ke server Supabase.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // LOGIN CHECK
    const handleLogin = (e) => {
        e.preventDefault();
        if (loginEmail === 'admin') {
            if (loginPassword === 'ceozie') {
                setView('admin-dashboard');
                setAdminTab('sensor');
                showToast('Akses Root Diterima! Selamat Datang CEO.');
                setLoginEmail(''); setLoginPassword(''); return;
            } else {
                showToast('Sandi Admin Root Salah!', 'error');
                setLoginPassword(''); return;
            }
        }

        const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
        if (!user) {
            showToast('Email tidak ditemukan di database!', 'error');
        } else if (user.password !== loginPassword) {
            showToast('Password salah!', 'error');
        } else if (!user.approved) {
            showToast('Akses Ditolak! Akun BELUM DI-APPROVE.', 'error');
        } else {
            setCurrentUser(user);
            setView('portal');
            setVolTab('dashboard');
            showToast(`Selamat bekerja di redaksi, ${user.name}!`);
        }
        setLoginEmail(''); setLoginPassword('');
    };

    // LUPA PASSWORD
    const handleForgotPassword = (e) => {
        e.preventDefault();
        const user = users.find(u => u.email.toLowerCase() === forgotEmail.toLowerCase());
        if (user) {
            showToast(`Akun Ditemukan! Password: ${user.password}`);
            setPortalMode('login');
        } else {
            showToast('Email tidak terdaftar!', 'error');
        }
        setForgotEmail('');
    };

    // BUKA FORM EDIT ARTIKEL
    const startEditArticle = (article) => {
        setEditMode(true);
        setEditArticleId(article.id);
        setArtTitle(article.title);
        setArtCategory(article.category);
        setArtContent(article.content);
        setArtImageUrl(article.image_url || '');
        
        // Pindah ke tab tulis untuk relawan
        if (view === 'portal') setVolTab('tulis');
    };

    // BATAL EDIT
    const cancelEdit = () => {
        setEditMode(false);
        setEditArticleId(null);
        setArtTitle(''); setArtCategory('gizi'); setArtContent(''); setArtImageUrl('');
        if (view === 'portal') setVolTab('dashboard');
    };

    // SIMPAN ARTIKEL (BUAT BARU ATAU UPDATE)
    const handleSaveArticle = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title: artTitle,
                category: artCategory,
                content: artContent,
                image_url: artImageUrl
            };

            if (editMode && editArticleId) {
                // Proses Update/Edit
                const res = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?id=eq.${editArticleId}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Gagal update artikel");
                showToast('Artikel berhasil diperbarui!');
            } else {
                // Proses Create/Baru
                payload.author = currentUser.name;
                payload.status = 'Pending Review';

                const res = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Gagal kirim draf");
                showToast('Artikel terkirim! Status: PENDING REVIEW.');
            }

            // Reset form
            cancelEdit();
            fetchSupabaseData();
        } catch (err) {
            showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // HAPUS ARTIKEL PERMANEN
    const handleDeleteArticle = async (id) => {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?id=eq.${id}`, {
                method: 'DELETE', headers
            });
            if (res.ok) {
                showToast('Artikel dihapus permanen dari server.');
                fetchSupabaseData();
            } else {
                throw new Error("Gagal menghapus");
            }
        } catch (err) {
            showToast('Gagal menghapus data.', 'error');
        }
    };

    // FUNGSI CEO
    const approveUser = async (id) => {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users?id=eq.${id}`, {
                method: 'PATCH', headers, body: JSON.stringify({ approved: true })
            });
            showToast('Akun kontributor resmi diaktifkan!');
            fetchSupabaseData();
        } catch (err) { showToast('Gagal update database.', 'error'); }
    };

    const approveArticle = async (id) => {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?id=eq.${id}`, {
                method: 'PATCH', headers, body: JSON.stringify({ status: 'Published' })
            });
            showToast('Artikel live ke publik!');
            fetchSupabaseData();
        } catch (err) { showToast('Gagal meloloskan artikel.', 'error'); }
    };

    // FUNGSI PENARIKAN SALDO RELAWAN
    const handleWithdraw = (e) => {
        e.preventDefault();
        const userArticles = articles.filter(a => a.author === currentUser?.name && a.status === 'Published').length;
        const maxBalance = (userArticles * TARIF_PER_ARTIKEL) + (((userArticles * 1500) / 1000) * TARIF_PER_1000_VIEWS);

        if (Number(withdrawAmount) > maxBalance) {
            showToast("Gagal: Saldo tidak mencukupi!", "error");
            return;
        }
        if (Number(withdrawAmount) < 50000) {
            showToast("Gagal: Minimal penarikan Rp 50.000", "error");
            return;
        }
        if (!withdrawAccount) {
            showToast("Gagal: Nomor rekening/e-wallet wajib diisi", "error");
            return;
        }

        // Simulasi pengiriman permintaan ke Finance (CEO)
        showToast(`Request tarik tunai Rp ${Number(withdrawAmount).toLocaleString('id-ID')} via ${withdrawMethod.toUpperCase()} berhasil dikirim ke Finance.`);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawAccount('');
    };

    // RENDER TOAST
    const renderToast = () => {
        if (!toast) return null;
        return (
            <div style={{
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff',
                padding: '12px 24px', borderRadius: '8px', zIndex: 9999, fontWeight: '700',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '8px'
            }}>
                {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
            </div>
        );
    };

    // RENDER FORM ARTIKEL (Digunakan oleh Relawan dan Modal CEO)
    const renderArticleForm = () => (
        <form onSubmit={handleSaveArticle} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>JUDUL ARTIKEL</label>
                <input type="text" value={artTitle} onChange={(e) => setArtTitle(e.target.value)} placeholder="Judul berita..." required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>URL GAMBAR</label>
                    <input type="text" value={artImageUrl} onChange={(e) => setArtImageUrl(e.target.value)} placeholder="Link foto..." required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>TARGET DIVISI MEDIA</label>
                    <select value={artCategory} onChange={(e) => setArtCategory(e.target.value)} style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }}>
                        <option value="gizi">NutrisiDietMu</option>
                        <option value="bola">BolaGass</option>
                        <option value="skincare">GlowLogika</option>
                        <option value="keuangan">CuanPintar</option>
                        <option value="dakwah">DakwahBerkah</option>
                    </select>
                </div>
            </div>
            <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>ISI TULISAN BERITA</label>
                <textarea rows="6" value={artContent} onChange={(e) => setArtContent(e.target.value)} placeholder="Ketik narasi berita lengkap..." required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginTop: '6px', resize: 'none', boxSizing: 'border-box' }}></textarea>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {editMode && (
                    <button type="button" onClick={cancelEdit} style={{ backgroundColor: '#475569', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Batal</button>
                )}
                <button type="submit" disabled={loading} style={{ backgroundColor: editMode ? '#6366f1' : '#fff', color: editMode ? '#fff' : '#0f172a', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    {loading ? 'Memproses...' : (editMode ? 'Simpan Perubahan' : 'Ajukan Terbit')}
                </button>
            </div>
        </form>
    );

    // ==========================================
    // VIEW: DASHBOARD KENDALI ADMIN (CEO)
    // ==========================================
    if (view === 'admin-dashboard') {
        const pendingArticles = articles.filter(a => a.status === 'Pending Review');
        const publishedArticles = articles.filter(a => a.status === 'Published');
        const pendingUsers = users.filter(u => !u.approved);

        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: 'sans-serif' }}>
                {renderToast()}
                
                {/* CEO EDIT MODAL OVERLAY */}
                {editMode && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                        <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '800px', borderRadius: '16px', padding: '24px', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '800' }}>✏️ EDIT KONTEN SERVER</h2>
                                <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                            </div>
                            {renderArticleForm()}
                        </div>
                    </div>
                )}

                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Header CEO */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '20px' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>⚙️ RAYLIZIIE CENTRAL CONTROL SERVER</h1>
                            <p style={{ fontSize: '12px', color: '#a78bfa', margin: '5px 0 0 0' }}>DATABASE: <span style={{ color: '#10b981', fontWeight: '800' }}>● SUPABASE CLOUD LIVE</span></p>
                        </div>
                        <button onClick={() => setView('home')} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: '700' }}>Keluar Server</button>
                    </div>

                    {/* Navigasi Tab CEO */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', borderBottom: '1px solid #1e293b', overflowX: 'auto' }}>
                        {[
                            { id: 'sensor', label: `Sensor Artikel (${pendingArticles.length})` },
                            { id: 'published', label: `Semua Published (${publishedArticles.length})` },
                            { id: 'users', label: `Verifikasi Akun (${pendingUsers.length})` },
                            { id: 'sdm', label: 'Database SDM & Gaji' }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setAdminTab(tab.id)}
                                style={{
                                    padding: '12px 16px', background: 'none', border: 'none', borderBottom: adminTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                                    color: adminTab === tab.id ? '#fff' : '#64748b', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap'
                                }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content CEO */}
                    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '16px' }}>
                        
                        {adminTab === 'sensor' && (
                            <div>
                                <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 20px 0' }}>📝 ANTRIAN REVIEW ARTIKEL</h2>
                                {pendingArticles.length === 0 ? (
                                    <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Server bersih. Belum ada artikel masuk.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {pendingArticles.map(a => (
                                            <div key={a.id} style={{ padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '10px' }}>
                                                    <div style={{ flex: '1', minWidth: '250px' }}>
                                                        <span style={{ fontSize: '9px', fontWeight: '700', color: '#818cf8', backgroundColor: '#1e1b4b', padding: '2px 6px', borderRadius: '4px' }}>{a.category.toUpperCase()}</span>
                                                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0 4px 0', color: '#fff' }}>{a.title}</h3>
                                                        <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0' }}>Oleh: {a.author}</p>
                                                        {a.image_url && <img src={a.image_url} alt="Cover" style={{ maxWidth: '150px', height: 'auto', borderRadius: '6px', marginBottom: '10px' }} />}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => approveArticle(a.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Terbitkan</button>
                                                        <button onClick={() => startEditArticle(a)} style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Edit</button>
                                                        <button onClick={() => handleDeleteArticle(a.id)} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Tolak/Hapus</button>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', marginTop: '12px', whiteSpace: 'pre-wrap', backgroundColor: '#020617', padding: '12px', borderRadius: '8px' }}>{a.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {adminTab === 'published' && (
                            <div>
                                <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 20px 0' }}>📚 ARTIKEL LIVE (PUBLISHED)</h2>
                                {publishedArticles.length === 0 ? (
                                    <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Belum ada artikel yang terbit.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                        {publishedArticles.map(a => (
                                            <div key={a.id} style={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                                {a.image_url && <img src={a.image_url} alt="Cover" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
                                                <div style={{ padding: '16px', flex: 1 }}>
                                                    <span style={{ fontSize: '9px', fontWeight: '700', color: '#10b981', backgroundColor: '#064e3b', padding: '2px 6px', borderRadius: '4px' }}>PUBLISHED &bull; {a.category.toUpperCase()}</span>
                                                    <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '10px 0 6px 0', color: '#fff' }}>{a.title}</h3>
                                                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0' }}>Penulis: {a.author}</p>
                                                </div>
                                                <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', backgroundColor: '#020617' }}>
                                                    <button onClick={() => startEditArticle(a)} style={{ backgroundColor: '#1e293b', color: '#a78bfa', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px', flex: 1, marginRight: '8px' }}>Edit Draft</button>
                                                    <button onClick={() => handleDeleteArticle(a.id)} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px', flex: 1, marginLeft: '8px' }}>Takedown</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {adminTab === 'users' && (
                            <div>
                                <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 20px 0' }}>👥 VERIFIKASI AKUN BARU</h2>
                                {pendingUsers.length === 0 ? (
                                    <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Tidak ada antrean pendaftar.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                                        {pendingUsers.map(u => (
                                            <div key={u.id} style={{ padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px 0', color: '#fff' }}>{u.name}</p>
                                                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{u.email}</p>
                                                </div>
                                                <button onClick={() => approveUser(u.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Approve</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {adminTab === 'sdm' && (
                            <div>
                                <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 20px 0' }}>💰 DATABASE SDM & TAGIHAN GAJI RELAWAN</h2>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                                                <th style={{ padding: '12px 8px' }}>Nama Relawan</th>
                                                <th style={{ padding: '12px 8px' }}>Email</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Artikel Lolos</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Total Tagihan Gaji</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.filter(u => u.approved).map((u) => {
                                                const userArticles = articles.filter(a => a.author === u.name && a.status === 'Published').length;
                                                const simulatedViews = userArticles * 1500;
                                                const gaji = (userArticles * TARIF_PER_ARTIKEL) + ((simulatedViews / 1000) * TARIF_PER_1000_VIEWS);
                                                return (
                                                    <tr key={u.id} style={{ borderBottom: '1px solid #0f172a' }}>
                                                        <td style={{ padding: '16px 8px', fontWeight: '700', color: '#fff' }}>{u.name}</td>
                                                        <td style={{ padding: '16px 8px', color: '#64748b' }}>{u.email}</td>
                                                        <td style={{ padding: '16px 8px', textAlign: 'center', color: '#10b981', fontWeight: '800' }}>{userArticles} Artikel</td>
                                                        <td style={{ padding: '16px 8px', textAlign: 'right', color: '#818cf8', fontWeight: '800' }}>Rp {gaji.toLocaleString('id-ID')}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW: INTERFACE REDAKSI (LOGIN & DASHBOARD)
    // ==========================================
    if (view === 'portal') {
        const myPending = currentUser ? articles.filter(a => a.author === currentUser.name && a.status === 'Pending Review') : [];
        const myPublished = currentUser ? articles.filter(a => a.author === currentUser.name && a.status === 'Published') : [];

        // Hitung Saldo Secara Dinamis
        const myTotalPublished = myPublished.length;
        const myTotalViews = myTotalPublished * 1500;
        const myBalance = (myTotalPublished * TARIF_PER_ARTIKEL) + ((myTotalViews / 1000) * TARIF_PER_1000_VIEWS);

        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: 'sans-serif' }}>
                {renderToast()}
                
                {/* MODAL PENARIKAN SALDO RELAWAN */}
                {showWithdrawModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                        <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '800' }}>💸 TARIK SALDO PENDAPATAN</h2>
                                <button onClick={() => setShowWithdrawModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                            </div>
                            
                            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #047857' }}>
                                <p style={{ margin: 0, fontSize: '11px', color: '#34d399', fontWeight: '700' }}>SALDO TERSEDIA</p>
                                <h3 style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '24px', fontWeight: '900' }}>Rp {myBalance.toLocaleString('id-ID')}</h3>
                            </div>

                            <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>METODE PENARIKAN</label>
                                    <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)} style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginTop: '6px' }}>
                                        <optgroup label="E-Wallet">
                                            <option value="dana">DANA</option>
                                            <option value="gopay">GoPay</option>
                                            <option value="ovo">OVO</option>
                                            <option value="shopeepay">ShopeePay</option>
                                            <option value="linkaja">LinkAja</option>
                                        </optgroup>
                                        <optgroup label="Transfer Bank">
                                            <option value="bca">Bank BCA</option>
                                            <option value="mandiri">Bank Mandiri</option>
                                            <option value="bni">Bank BNI</option>
                                            <option value="bri">Bank BRI</option>
                                            <option value="bsi">Bank Syariah Indonesia (BSI)</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>NOMOR REKENING / NO. HP</label>
                                    <input type="text" value={withdrawAccount} onChange={(e) => setWithdrawAccount(e.target.value)} placeholder="Contoh: 0812xxxx / 1234xxxx" required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>NOMINAL PENARIKAN (Min. Rp 50.000)</label>
                                    <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Contoh: 50000" required min="50000" max={myBalance || 0} style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginTop: '6px', boxSizing: 'border-box' }} />
                                </div>
                                <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer', marginTop: '8px' }}>Proses Penarikan</button>
                            </form>
                        </div>
                    </div>
                )}

                <div style={{ maxWidth: currentUser ? '1000px' : '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>📁 RAYLIZIIE CMS PORTAL</h1>
                        <button onClick={() => { setView('home'); setCurrentUser(null); setEditMode(false); }} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '700' }}>Kembali Ke Home</button>
                    </div>

                    {!currentUser ? (
                        // BAGIAN FORM LOGIN / REGISTER
                        <div style={{ maxWidth: '400px', margin: '40px auto', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '16px' }}>
                            {portalMode !== 'forgot' && (
                                <div style={{ display: 'flex', borderBottom: '1px solid #334155', marginBottom: '24px' }}>
                                    <button onClick={() => setPortalMode('login')} style={{ width: '50%', paddingBottom: '12px', background: 'none', border: 'none', color: portalMode === 'login' ? '#fff' : '#64748b', fontWeight: '800', cursor: 'pointer', borderBottom: portalMode === 'login' ? '2px solid #6366f1' : '2px solid transparent', transition: 'all 0.2s' }}>LOG IN</button>
                                    <button onClick={() => setPortalMode('register')} style={{ width: '50%', paddingBottom: '12px', background: 'none', border: 'none', color: portalMode === 'register' ? '#fff' : '#64748b', fontWeight: '800', cursor: 'pointer', borderBottom: portalMode === 'register' ? '2px solid #6366f1' : '2px solid transparent', transition: 'all 0.2s' }}>DAFTAR RELAWAN</button>
                                </div>
                            )}

                            {portalMode === 'login' && (
                                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>EMAIL TERVERIFIKASI</label>
                                        <input type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email atau 'admin'..." required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
                                        <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Masukkan password..." required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                                    </div>
                                    <button type="submit" style={{ backgroundColor: '#fff', color: '#0f172a', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer', marginTop: '8px' }}>Masuk Panel</button>
                                    <span onClick={() => setPortalMode('forgot')} style={{ fontSize: '11px', color: '#a78bfa', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', marginTop: '10px' }}>Lupa Password Akun?</span>
                                </form>
                            )}

                            {portalMode === 'register' && (
                                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>NAMA LENGKAP</label>
                                        <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Nama Anda..." required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>ALAMAT EMAIL</label>
                                        <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="name@example.com" required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BUAT PASSWORD</label>
                                        <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Buat password..." required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                                    </div>
                                    <button type="submit" disabled={loading} style={{ backgroundColor: '#6366f1', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer', marginTop: '8px' }}>
                                        {loading ? 'Mengirim Data...' : 'Ajukan Relawan'}
                                    </button>
                                </form>
                            )}

                            {portalMode === 'forgot' && (
                                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>EMAIL TERDAFTAR</label>
                                        <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Cari email..." required style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                                    </div>
                                    <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Cari Akun Saya</button>
                                    <span onClick={() => setPortalMode('login')} style={{ fontSize: '11px', color: '#a78bfa', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', marginTop: '10px' }}>Kembali ke Login</span>
                                </form>
                            )}
                        </div>
                    ) : (
                        // BAGIAN DASHBOARD RELAWAN (KALAU UDAH LOGIN)
                        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' }}>
                            {/* Relawan Header & Nav */}
                            <div style={{ padding: '24px', borderBottom: '1px solid #334155', backgroundColor: '#0f172a' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#fff' }}>✍️ RUANG REDAKSI KONTRIBUTOR</h2>
                                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '800', backgroundColor: '#064e3b', padding: '4px 10px', borderRadius: '20px' }}>Sesi Aktif: {currentUser.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
                                    {[
                                        { id: 'dashboard', label: 'Ringkasan Gaji' },
                                        { id: 'tulis', label: editMode ? '📝 Update Artikel' : '➕ Tulis Artikel' },
                                        { id: 'pending', label: `Draf Pending (${myPending.length})` },
                                        { id: 'published', label: `Artikel Terbit (${myPublished.length})` }
                                    ].map(tab => (
                                        <button key={tab.id} onClick={() => { setVolTab(tab.id); if(tab.id !== 'tulis') cancelEdit(); }}
                                            style={{
                                                padding: '10px 16px', background: 'none', border: 'none', borderBottom: volTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                                                color: volTab === tab.id ? '#fff' : '#64748b', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap'
                                            }}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '24px' }}>
                                {volTab === 'dashboard' && (
                                    <div>
                                        <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#94a3b8' }}>KALKULATOR PENDAPATAN BULANAN</h3>
                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: '1', minWidth: '150px', backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ARTIKEL TERBIT (PPS)</p>
                                                <h3 style={{ margin: '8px 0 0 0', color: '#fff', fontSize: '28px', fontWeight: '900' }}>{myPublished.length}</h3>
                                            </div>
                                            <div style={{ flex: '1', minWidth: '150px', backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ESTIMASI VIEWS (PPV)</p>
                                                <h3 style={{ margin: '8px 0 0 0', color: '#fff', fontSize: '28px', fontWeight: '900' }}>{myTotalViews.toLocaleString('id-ID')}</h3>
                                            </div>
                                            <div style={{ flex: '2', minWidth: '250px', backgroundColor: '#064e3b', padding: '20px', borderRadius: '12px', border: '1px solid #047857', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '11px', color: '#a7f3d0', fontWeight: '700' }}>TOTAL SALDO PENDAPATAN</p>
                                                    <h3 style={{ margin: '8px 0 0 0', color: '#34d399', fontSize: '28px', fontWeight: '900' }}>
                                                        Rp {myBalance.toLocaleString('id-ID')}
                                                    </h3>
                                                </div>
                                                <button onClick={() => setShowWithdrawModal(true)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '13px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>Tarik Saldo</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {volTab === 'tulis' && (
                                    <div>
                                        <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#94a3b8' }}>{editMode ? 'FORM UPDATE ARTIKEL' : 'FORM DRAF ARTIKEL BARU'}</h3>
                                        {renderArticleForm()}
                                    </div>
                                )}

                                {volTab === 'pending' && (
                                    <div>
                                        <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#94a3b8' }}>DRAF MENUNGGU REVIEW CEO</h3>
                                        {myPending.length === 0 ? (
                                            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Tidak ada artikel berstatus pending.</p>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                                {myPending.map(a => (
                                                    <div key={a.id} style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                                                        <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '800' }}>⏳ PENDING &bull; {a.category.toUpperCase()}</span>
                                                        <h4 style={{ margin: '8px 0', color: '#fff', fontSize: '16px' }}>{a.title}</h4>
                                                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                                            <button onClick={() => startEditArticle(a)} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', flex: 1 }}>Edit</button>
                                                            <button onClick={() => handleDeleteArticle(a.id)} style={{ backgroundColor: '#7f1d1d', border: 'none', color: '#fca5a5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', flex: 1 }}>Hapus</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {volTab === 'published' && (
                                    <div>
                                        <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#94a3b8' }}>ARTIKEL SAYA YANG SUDAH TERBIT</h3>
                                        {myPublished.length === 0 ? (
                                            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Anda belum memiliki artikel yang terbit.</p>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                                {myPublished.map(a => (
                                                    <div key={a.id} style={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
                                                        {a.image_url && <img src={a.image_url} alt="Cover" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />}
                                                        <div style={{ padding: '16px' }}>
                                                            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '800' }}>✅ LIVE &bull; {a.category.toUpperCase()}</span>
                                                            <h4 style={{ margin: '8px 0 12px 0', color: '#fff', fontSize: '16px' }}>{a.title}</h4>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => startEditArticle(a)} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', flex: 1 }}>Edit</button>
                                                                <button onClick={() => handleDeleteArticle(a.id)} style={{ backgroundColor: '#7f1d1d', border: 'none', color: '#fca5a5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', flex: 1 }}>Hapus</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ==========================================
    // TAMPILAN DEPAN UTAMA PUBLIC WEBSITE
    // ==========================================
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
            {renderToast()}
            <header style={{ borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>RAYLIZIIE MEDIA DIGITAL</span>
                        <span style={{ fontSize: '9px', color: '#818cf8', display: 'block', fontWeight: '700', letterSpacing: '1px' }}>RAYLIZIIE GRUP SUBSIDIARY</span>
                    </div>
                    <button onClick={() => setView('portal')} style={{ backgroundColor: '#fff', color: '#0f172a', border: 'none', padding: '10px 24px', borderRadius: '24px', fontWeight: '800', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(255,255,255,0.1)' }}>Portal Admin & Relawan</button>
                </div>
            </header>

            <section style={{ textAlign: 'center', padding: '80px 20px' }}>
                <span style={{ fontSize: '11px', color: '#818cf8', border: '1px solid #334155', padding: '6px 16px', borderRadius: '20px', fontWeight: '800', letterSpacing: '1px', backgroundColor: 'rgba(51, 65, 85, 0.3)' }}>🛡️ DIVISI INFORMASI & TEKNOLOGI GLOBAL</span>
                <h1 style={{ fontSize: '48px', fontWeight: '950', color: '#fff', marginTop: '24px', marginBottom: '10px', lineHeight: '1.2' }}>Navigasi Masa Depan</h1>
                <p style={{ fontSize: '28px', fontWeight: '900', background: 'linear-gradient(to right, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Ekosistem Media Siber Terintegrasi</p>
            </section>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px 20px' }}>
                <h2 style={{ fontSize: '13px', color: '#94a3b8', letterSpacing: '2px', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '30px', fontWeight: '800' }}>DIGITAL MEDIA NETWORK</h2>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '60px' }}>
                    {mediaNetwork.map((item) => (
                        <div key={item.name} style={{ flex: '1', minWidth: '300px', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', transition: 'transform 0.3s' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '32px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px' }}>{item.icon}</span>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#fff' }}>{item.name}</h3>
                                        <p style={{ fontSize: '11px', color: '#818cf8', margin: '4px 0 0 0', fontWeight: '800' }}>{item.cat}</p>
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginTop: '20px' }}>{item.desc}</p>
                                
                                <div style={{ marginTop: '20px' }}>
                                    {articles.filter(a => a.category === (item.name === 'NutrisiDietMu' ? 'gizi' : item.name === 'BolaGass' ? 'bola' : item.name === 'GlowLogika' ? 'skincare' : item.name === 'DakwahBerkah' ? 'dakwah' : 'keuangan') && a.status === 'Published').map(art => (
                                        <div key={art.id} style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '12px', fontSize: '12px', marginTop: '10px', border: '1px solid #334155' }}>
                                            {art.image_url && <img src={art.image_url} alt="Cover" width="100%" style={{ borderRadius: '8px', marginBottom: '8px', height: '120px', objectFit: 'cover' }} />}
                                            <h4 style={{ margin: 0, color: '#f8fafc', fontWeight: '800', fontSize: '14px' }}>{art.title}</h4>
                                            <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Oleh: {art.author}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontWeight: '700', backgroundColor: '#334155', padding: '8px 16px', borderRadius: '20px' }}>Kunjungi Platform ↗</a>
                                <span style={{ color: '#34d399', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#34d399', borderRadius: '50%'}}></span> Active</span>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 style={{ fontSize: '13px', color: '#94a3b8', letterSpacing: '2px', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '30px', fontWeight: '800' }}>DIGITAL BUSINESS SERVICES</h2>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {businessServices.map((item) => (
                        <div key={item.name} style={{ flex: '1', minWidth: '300px', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '24px' }}>{item.icon}</span> {item.name}
                            </h3>
                            <p style={{ fontSize: '11px', color: '#c084fc', margin: '8px 0 0 0', fontWeight: '800' }}>{item.cat}</p>
                            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginTop: '16px' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer style={{ borderTop: '1px solid #1e293b', backgroundColor: '#020617', padding: '40px 20px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                <p style={{ margin: '0 0 12px 0', color: '#94a3b8', fontWeight: '800' }}>&copy; 2026 Rayliziie Media Digital. Seluruh Hak Cipta Dilindungi.</p>
                <p style={{ margin: 0, color: '#818cf8', fontWeight: '700' }}>Menaungi Brand Pilihan: NutrisiDietMu &middot; BolaGass &middot; GlowLogika &middot; CuanPintar &middot; DakwahBerkah</p>
                <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#475569', fontWeight: '600' }}>Subsidiary Corporate Office: Rayliziie Grup &middot; Medan, Sumatera Utara</p>
            </footer>
        </div>
    );
};

export default App;
