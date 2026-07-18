import React, { useState, useEffect } from 'react';

const SUPABASE_URL = "https://harpdcqmrqdgckcuhxfr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ppzSXi7DuN7v0racT9l98A_JxK5-MGG";
const headers = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

const mediaNetwork = [
    { name: "NutrisiDietMu", icon: "🌱", cat: "Media Kesehatan & Gizi", desc: "Portal edukasi gizi klinis.", link: "https://nutrisidietmu.vercel.app" },
    { name: "BolaGass", icon: "⚽", cat: "Media Jurnalisme Olahraga", desc: "Platform jurnalisme sepak bola.", link: "#" },
    { name: "GlowLogika", icon: "✨", cat: "Edukasi Skincare & Beauty", desc: "Media literasi kesehatan kulit.", link: "#" },
    { name: "CuanPintar", icon: "💰", cat: "Literasi Finansial & Investasi", desc: "Portal perencanaan keuangan.", link: "#" },
    { name: "DakwahBerkah", icon: "🌙", cat: "Media Dakwah & Islami", desc: "Portal edukasi agama dan ibadah.", link: "#" }
];

const App = () => {
    const [view, setView] = useState('home');
    const [portalMode, setPortalMode] = useState('login');
    const [ceoTab, setCeoTab] = useState('approval');
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    const fetchSupabaseData = async () => {
        try {
            const resU = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users?select=*`, { headers });
            const resA = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?select=*`, { headers });
            if (resU.ok) setUsers(await resU.json());
            if (resA.ok) setArticles(await resA.json());
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchSupabaseData(); }, []);

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
                            <div style={{ flex: '2', backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px' }}>
                                <h2>📝 SENSOR ARTIKEL (Pending)</h2>
                                {articles.filter(a => a.status === 'Pending Review').map(a => (
                                    <div key={a.id} style={{ padding: '10px', borderBottom: '1px solid #334155' }}>
                                        <p>{a.title}</p>
                                        <button onClick={() => approveArticle(a.id)}>Terbitkan</button>
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
                                        {editingId === a.id ? <button onClick={() => updateArticle(a.id)}>Simpan</button> : <button onClick={() => { setEditingId(a.id); setEditTitle(a.title); }}>Edit</button>}
                                        <button onClick={() => deleteArticle(a.id)} style={{ color: 'red', marginLeft: '10px' }}>Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
            <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <span>RAYLIZIIE MEDIA DIGITAL</span>
                <button onClick={() => setView('portal')}>Portal Admin & Relawan</button>
            </header>
            <div style={{ padding: '40px' }}>
                <h1>Navigasi Masa Depan</h1>
                <p>Ekosistem Media Siber Terintegrasi</p>
            </div>
        </div>
    );
};

export default App;
