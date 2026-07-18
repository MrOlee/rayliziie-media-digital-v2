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

const TARIF_PER_ARTIKEL = 15000;
const TARIF_PER_1000_VIEWS = 900;

const App = () => {
    const [view, setView] = useState('home');
    const [portalMode, setPortalMode] = useState('login');
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [ceoTab, setCeoTab] = useState('approval');

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [artTitle, setArtTitle] = useState('');
    const [artCategory, setArtCategory] = useState('gizi');
    const [artContent, setArtContent] = useState('');
    const [artImageUrl, setArtImageUrl] = useState('');

    const fetchSupabaseData = async () => {
        if (!SUPABASE_URL || SUPABASE_URL.includes("XYZ_GANTI")) return;
        try {
            const resUsers = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users?select=*`, { headers });
            if (resUsers.ok) setUsers(await resUsers.json());
            const resArticles = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?select=*`, { headers });
            if (resArticles.ok) setArticles(await resArticles.json());
        } catch (err) { console.error("Koneksi Supabase terputus:", err); }
    };

    useEffect(() => {
        fetchSupabaseData();
        const interval = setInterval(fetchSupabaseData, 3000);
        return () => clearInterval(interval);
    }, []);

    // FUNGSI CRUD
    const deleteArticle = async (id) => {
        if (!confirm("Hapus artikel ini permanen?")) return;
        await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?id=eq.${id}`, { method: 'DELETE', headers });
        fetchSupabaseData();
    };

    const updateArticle = async (id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?id=eq.${id}`, {
            method: 'PATCH', headers, body: JSON.stringify({ title: editTitle })
        });
        setEditingId(null);
        fetchSupabaseData();
    };

    const approveArticle = async (id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?id=eq.${id}`, {
            method: 'PATCH', headers, body: JSON.stringify({ status: 'Published' })
        });
        fetchSupabaseData();
    };

    const rejectArticle = async (id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?id=eq.${id}`, { method: 'DELETE', headers });
        fetchSupabaseData();
    };

    const approveUser = async (id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users?id=eq.${id}`, {
            method: 'PATCH', headers, body: JSON.stringify({ approved: true })
        });
        fetchSupabaseData();
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, approved: false })
            });
            alert('Registrasi Berhasil!');
            setPortalMode('login');
            fetchSupabaseData();
        } catch (err) { alert('Gagal.'); } finally { setLoading(false); }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginEmail === 'admin' && loginPassword === 'ceozie') {
            setView('admin-dashboard');
        } else {
            const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
            if (user && user.password === loginPassword && user.approved) {
                setCurrentUser(user);
            } else {
                alert('Gagal login/Akun belum di-approve.');
            }
        }
    };

    const handleCreateArticle = async (e) => {
        e.preventDefault();
        await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ title: artTitle, category: artCategory, content: artContent, image_url: artImageUrl, author: currentUser.name, status: 'Pending Review' })
        });
        alert('Artikel dikirim!');
        fetchSupabaseData();
    };

    // ==========================================
    // VIEW: ADMIN DASHBOARD
    // ==========================================
    if (view === 'admin-dashboard') {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', padding: '24px', fontFamily: 'sans-serif' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h1>⚙️ CENTRAL CONTROL SERVER</h1>
                        <button onClick={() => setView('home')} style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}>Keluar</button>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <button onClick={() => setCeoTab('approval')} style={{ padding: '10px 20px', background: ceoTab === 'approval' ? '#4f46e5' : '#1e293b', border: 'none', color: '#fff', cursor: 'pointer', marginRight: '10px' }}>Kurasi Artikel</button>
                        <button onClick={() => setCeoTab('published')} style={{ padding: '10px 20px', background: ceoTab === 'published' ? '#059669' : '#1e293b', border: 'none', color: '#fff', cursor: 'pointer' }}>Lihat Semua Published</button>
                    </div>

                    {ceoTab === 'approval' && (
                        <div style={{ display: 'flex', gap: '20px' }}>
                            {/* Kolom Verifikasi User */}
                            <div style={{ flex: '1', backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px' }}>
                                <h2>👥 VERIFIKASI AKUN</h2>
                                {users.filter(u => !u.approved).map(u => (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #334155' }}>
                                        <span>{u.name}</span>
                                        <button onClick={() => approveUser(u.id)}>Approve</button>
                                    </div>
                                ))}
                            </div>
                            {/* Kolom Sensor Artikel */}
                            <div style={{ flex: '2', backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px' }}>
                                <h2>📝 SENSOR ARTIKEL</h2>
                                {articles.filter(a => a.status === 'Pending Review').map(a => (
                                    <div key={a.id} style={{ padding: '10px', borderBottom: '1px solid #334155' }}>
                                        <p>{a.title}</p>
                                        <button onClick={() => approveArticle(a.id)}>Terbitkan</button>
                                        <button onClick={() => rejectArticle(a.id)}>Tolak</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {ceoTab === 'published' && (
                        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px' }}>
                            <h2>Daftar Artikel Terbit</h2>
                            {articles.filter(a => a.status === 'Published').map(a => (
                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #334155' }}>
                                    {editingId === a.id ? (
                                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ color: '#000' }} />
                                    ) : (
                                        <span>{a.title}</span>
                                    )}
                                    <div>
                                        {editingId === a.id ? (
                                            <button onClick={() => updateArticle(a.id)}>Simpan</button>
                                        ) : (
                                            <button onClick={() => { setEditingId(a.id); setEditTitle(a.title); }}>Edit</button>
                                        )}
                                        <button onClick={() => deleteArticle(a.id)} style={{ color: 'red' }}>Hapus</button>
                                    </div>
                                </div>
                            ))}
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
            <header style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>RAYLIZIIE MEDIA DIGITAL</span>
                        <span style={{ fontSize: '9px', color: '#818cf8', display: 'block', fontWeight: '700' }}>RAYLIZIIE GRUP SUBSIDIARY</span>
                    </div>
                    <button onClick={() => setView('portal')} style={{ backgroundColor: '#fff', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer' }}>Portal Admin & Relawan</button>
                </div>
            </header>

            <section style={{ textAlign: 'center', padding: '60px 20px' }}>
                <span style={{ fontSize: '11px', color: '#818cf8', border: '1px solid #334155', padding: '6px 12px', borderRadius: '20px', fontWeight: '600' }}>🛡️ DIVISI INFORMASI & TEKNOLOGI GLOBAL</span>
                <h1 style={{ fontSize: '40px', fontWeight: '950', color: '#fff', marginTop: '20px' }}>Navigasi Masa Depan</h1>
                <p style={{ fontSize: '28px', fontWeight: '900', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Ekosistem Media Siber Terintegrasi</p>
            </section>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px 20px' }}>
                <h2 style={{ fontSize: '12px', color: '#64748b', letterSpacing: '2px', borderBottom: '1px solid #1e293b', paddingBottom: '10px', marginBottom: '30px' }}>DIGITAL MEDIA NETWORK</h2>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
                    {mediaNetwork.map((item) => (
                        <div key={item.name} style={{ flex: '1', minWidth: '280px', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>{item.name}</h3>
                                        <p style={{ fontSize: '10px', color: '#818cf8', margin: 0, fontWeight: '700' }}>{item.cat}</p>
                                    </div>
                                </div>
                                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginTop: '14px' }}>{item.desc}</p>
                                
                                <div style={{ marginTop: '15px' }}>
                                    {articles.filter(a => a.category === (item.name === 'NutrisiDietMu' ? 'gizi' : item.name === 'BolaGass' ? 'bola' : item.name === 'GlowLogika' ? 'skincare' : item.name === 'DakwahBerkah' ? 'dakwah' : 'keuangan') && a.status === 'Published').map(art => (
                                        <div key={art.id} style={{ padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px', fontSize: '12px', marginTop: '8px' }}>
                                            {art.image_url && <img src={art.image_url} width="100%" style={{ borderRadius: '4px', marginBottom: '5px' }} />}
                                            <h4 style={{ margin: 0, color: '#f1f5f9', fontWeight: '700' }}>{art.title}</h4>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#64748b' }}>Oleh: {art.author}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #0f172a', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontWeight: '600' }}>Kunjungi Platform ↗</a>
                                <span style={{ color: '#34d399', fontSize: '10px', fontWeight: '700' }}>● Active Server</span>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 style={{ fontSize: '12px', color: '#64748b', letterSpacing: '2px', borderBottom: '1px solid #1e293b', paddingBottom: '10px', marginBottom: '30px' }}>DIGITAL BUSINESS SERVICES</h2>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {businessServices.map((item) => (
                        <div key={item.name} style={{ flex: '1', minWidth: '280px', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>{item.icon} {item.name}</h3>
                            <p style={{ fontSize: '10px', color: '#c084fc', margin: '4px 0 0 0', fontWeight: '700' }}>{item.cat}</p>
                            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginTop: '14px' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer style={{ borderTop: '1px solid #1e293b', backgroundColor: '#020617', padding: '40px 20px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontWeight: '700' }}>&copy; 2026 Rayliziie Media Digital. Seluruh Hak Cipta Dilindungi.</p>
                <p style={{ margin: 0, color: '#6366f1', fontWeight: '600' }}>Menaungi Brand Pilihan: NutrisiDietMu &middot; BolaGass &middot; GlowLogika &middot; CuanPintar &middot; DakwahBerkah</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#475569' }}>Subsidiary Corporate Office: Rayliziie Grup &middot; Medan, Sumatera Utara</p>
            </footer>
        </div>
    );
};

export default App;
