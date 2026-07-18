import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Laptop, Sparkles, Flame, Box, Landmark, Moon, 
    ShieldCheck, ArrowUpRight, ArrowRight, Layers, 
    Users, X, Trash2, Plus, Wallet, FileText, 
    Eye, LogIn, CheckCircle2, Clock, Check, Radio, 
    UserPlus, Lock
} from 'lucide-react';

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
// DATA EKOSISTEM MEDIA
// ==========================================
const mediaNetwork = [
    { name: "NutrisiDietMu", code: "gizi", icon: Sparkles, cat: "Gizi & Kesehatan", color: "border-teal-550 text-teal-400 bg-teal-950/30", link: "https://nutrisidietmu.vercel.app" },
    { name: "BolaGass", code: "bola", icon: Flame, cat: "Jurnalisme Olahraga", color: "border-orange-550 text-orange-400 bg-orange-950/30", link: "#" },
    { name: "GlowLogika", code: "skincare", icon: Box, cat: "Skincare & Beauty", color: "border-pink-550 text-pink-400 bg-pink-950/30", link: "#" },
    { name: "CuanPintar", code: "keuangan", icon: Landmark, cat: "Literasi Finansial", color: "border-blue-550 text-blue-400 bg-blue-950/30", link: "#" },
    { name: "DakwahBerkah", code: "dakwah", icon: Moon, cat: "Edukasi Islami", color: "border-emerald-550 text-emerald-400 bg-emerald-950/30", link: "#" }
];

const TARIF_PER_ARTIKEL = 15000;
const TARIF_PER_1000_VIEWS = 5000;

const App = () => {
    // UI States
    const [view, setView] = useState('landing'); // landing, admin_ceo, dashboard_relawan
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [portalMode, setPortalMode] = useState('login'); // login, register, forgot
    const [ceoTab, setCeoTab] = useState('approval'); // approval, verifikasi, relawan
    
    // Cloud DB States
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Form States
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    
    // Form Artikel
    const [artTitle, setArtTitle] = useState('');
    const [artCategory, setArtCategory] = useState('gizi');
    const [artContent, setArtContent] = useState('');
    const [artImageUrl, setArtImageUrl] = useState('');

    // ==========================================
    // FUNGSI POLLING DATA REAL-TIME
    // ==========================================
    const fetchSupabaseData = async () => {
        if (!SUPABASE_URL) return;
        try {
            const resUsers = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users?select=*`, { headers });
            if (resUsers.ok) setUsers(await resUsers.json());

            const resArticles = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?select=*`, { headers });
            if (resArticles.ok) setArticles(await resArticles.json());
        } catch (err) {
            console.error("Koneksi Supabase terputus:", err);
        }
    };

    useEffect(() => {
        fetchSupabaseData();
        const interval = setInterval(fetchSupabaseData, 3000); 
        return () => clearInterval(interval);
    }, []);

    // ==========================================
    // SISTEM OTENTIKASI & USER
    // ==========================================
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (users.find(u => u.email.toLowerCase() === regEmail.toLowerCase()) || regEmail === 'admin') {
            alert('Email sudah terdaftar di server Supabase!');
            setLoading(false); return;
        }
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, approved: false })
            });
            if (!res.ok) throw new Error('Penolakan Supabase');
            alert(`Registrasi Berhasil! Akun ${regName} sedang menunggu Verifikasi CEO.`);
            setRegName(''); setRegEmail(''); setRegPassword(''); setPortalMode('login');
            fetchSupabaseData();
        } catch (err) {
            alert('Gagal menyambung ke server Supabase.');
        } finally { setLoading(false); }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginEmail === 'admin' && loginPassword === 'ceozie') {
            setView('admin_ceo');
            setShowLoginModal(false);
            setLoginEmail(''); setLoginPassword(''); 
            return;
        }

        const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
        if (!user) alert('Email tidak ditemukan di database Supabase!');
        else if (user.password !== loginPassword) alert('Password salah!');
        else if (!user.approved) alert('Akses Ditolak! Akun BELUM DI-APPROVE oleh CEO.');
        else {
            setCurrentUser(user);
            setView('dashboard_relawan');
            setShowLoginModal(false);
        }
        setLoginEmail(''); setLoginPassword('');
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        const user = users.find(u => u.email.toLowerCase() === forgotEmail.toLowerCase());
        if (user) {
            alert(`[Pemulihan Sistem]\nNama: ${user.name}\nPassword Akun Anda: ${user.password}`);
            setPortalMode('login');
        } else {
            alert('Email tidak terdaftar di database cloud!');
        }
        setForgotEmail('');
    };

    // ==========================================
    // SISTEM MANAJEMEN ARTIKEL & CEO
    // ==========================================
    const handleCreateArticle = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ 
                    title: artTitle, category: artCategory, content: artContent, 
                    image_url: artImageUrl, author: currentUser.name, status: 'Pending Review' 
                })
            });
            if (!res.ok) throw new Error('Gagal Kirim');
            alert('Artikel terkirim! Status: PENDING REVIEW di Central Server.');
            setArtTitle(''); setArtContent(''); setArtImageUrl('');
            fetchSupabaseData();
        } catch (err) { alert('Gagal mengirim draf artikel ke awan.'); } 
        finally { setLoading(false); }
    };

    const approveUser = async (id) => {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_users?id=eq.${id}`, {
                method: 'PATCH', headers, body: JSON.stringify({ approved: true })
            });
            fetchSupabaseData();
        } catch (err) { alert('Gagal verifikasi akun.'); }
    };

    const approveArticle = async (id) => {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?id=eq.${id}`, {
                method: 'PATCH', headers, body: JSON.stringify({ status: 'Published' })
            });
            fetchSupabaseData();
        } catch (err) { alert('Gagal mempublikasi artikel.'); }
    };

    const rejectArticle = async (id) => {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/rayliziie_articles?id=eq.${id}`, {
                method: 'DELETE', headers
            });
            fetchSupabaseData();
        } catch (err) { alert('Gagal menghapus draf.'); }
    };

    // ==========================================
    // MODAL OTENTIKASI GLOBAL
    // ==========================================
    const LoginModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="h-5 w-5"/></button>
                
                <h2 className="text-2xl font-900 text-white mb-2 uppercase">Portal Redaksi</h2>
                <div className="flex border-b border-slate-800 mb-6 mt-4">
                    <button onClick={() => setPortalMode('login')} className={`w-1/2 pb-3 font-800 text-xs tracking-wider uppercase transition-colors ${portalMode === 'login' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500'}`}>Log In</button>
                    <button onClick={() => setPortalMode('register')} className={`w-1/2 pb-3 font-800 text-xs tracking-wider uppercase transition-colors ${portalMode === 'register' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500'}`}>Daftar Baru</button>
                </div>

                {portalMode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-800 text-slate-400 mb-1.5 uppercase">Email Terdaftar / Admin</label>
                            <input type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="nama@email.com / admin" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-800 text-slate-400 mb-1.5 uppercase">Password Sandi</label>
                            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="••••••••" />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-800 py-3 rounded-lg text-sm mt-2 transition-colors">Akses Sistem</button>
                        <p onClick={() => setPortalMode('forgot')} className="text-center text-xs text-indigo-400 mt-4 cursor-pointer hover:underline">Lupa Password Akun?</p>
                    </form>
                )}

                {portalMode === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-800 text-slate-400 mb-1.5 uppercase">Nama Lengkap Relawan</label>
                            <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-800 text-slate-400 mb-1.5 uppercase">Alamat Email</label>
                            <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-800 text-slate-400 mb-1.5 uppercase">Buat Password</label>
                            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-800 py-3 rounded-lg text-sm mt-2 transition-colors">
                            {loading ? 'Mengirim ke DB...' : 'Kirim Pengajuan Relawan'}
                        </button>
                    </form>
                )}

                {portalMode === 'forgot' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <p className="text-xs text-slate-400 mb-4">Masukkan email Anda untuk mengambil password langsung dari database Supabase.</p>
                        <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Email terdaftar..." />
                        <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-800 py-3 rounded-lg text-sm">Cari Password</button>
                        <p onClick={() => setPortalMode('login')} className="text-center text-xs text-slate-500 mt-4 cursor-pointer hover:text-white">Kembali ke Login</p>
                    </form>
                )}
            </motion.div>
        </div>
    );

    // ==========================================
    // TAMPILAN 1: DASHBOARD CEO
    // ==========================================
    if (view === 'admin_ceo') {
        const pendingUsers = users.filter(u => !u.approved);
        const pendingArticles = articles.filter(a => a.status === 'Pending Review');

        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                        <div>
                            <h1 className="text-3xl font-900 text-white flex items-center gap-3"><ShieldCheck className="text-indigo-500 h-8 w-8" /> Central Control Server</h1>
                            <p className="text-slate-400 text-sm mt-1">Live Database: <span className="text-emerald-400 font-700">Supabase Cloud Aktif</span></p>
                        </div>
                        <button onClick={() => setView('landing')} className="bg-red-950/40 hover:bg-red-900/60 text-red-400 px-5 py-2.5 rounded-full text-sm font-800 transition-all flex items-center gap-2">Keluar Server</button>
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                        <button onClick={() => setCeoTab('approval')} className={`px-6 py-2.5 rounded-lg font-800 text-sm transition-all whitespace-nowrap flex items-center gap-2 ${ceoTab === 'approval' ? 'bg-orange-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                            Meja Sensor Artikel <span className="bg-orange-950/50 text-white px-2 py-0.5 rounded-full text-xs">{pendingArticles.length}</span>
                        </button>
                        <button onClick={() => setCeoTab('verifikasi')} className={`px-6 py-2.5 rounded-lg font-800 text-sm transition-all whitespace-nowrap flex items-center gap-2 ${ceoTab === 'verifikasi' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                            Verifikasi Akun Baru <span className="bg-indigo-950/50 text-white px-2 py-0.5 rounded-full text-xs">{pendingUsers.length}</span>
                        </button>
                        <button onClick={() => setCeoTab('relawan')} className={`px-6 py-2.5 rounded-lg font-800 text-sm transition-all whitespace-nowrap flex items-center gap-2 ${ceoTab === 'relawan' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                            Database SDM & Gaji
                        </button>
                    </div>

                    {ceoTab === 'approval' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800">
                                <h2 className="text-lg font-900 flex items-center gap-2"><Clock className="h-5 w-5 text-orange-400"/> Antrean Artikel Menunggu Keputusan</h2>
                            </div>
                            <div className="p-6 grid gap-4">
                                {pendingArticles.length === 0 && <p className="text-slate-500 text-center font-600 py-8">Server bersih. Belum ada artikel masuk.</p>}
                                {pendingArticles.map((art) => (
                                    <div key={art.id} className="border border-slate-800 bg-slate-950 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex gap-4 items-center">
                                            {art.image_url && <img src={art.image_url} alt="Cover" className="h-20 w-28 object-cover rounded-lg border border-slate-800" />}
                                            <div>
                                                <span className="text-[10px] font-900 text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-md uppercase tracking-widest">{art.category}</span>
                                                <h3 className="font-900 text-white text-lg mt-2 mb-1">{art.title}</h3>
                                                <p className="text-xs text-slate-400">Penulis: <span className="text-emerald-400 font-700">{art.author}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button onClick={() => approveArticle(art.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-800 flex items-center justify-center gap-2"><Check className="h-4 w-4"/> Terbitkan</button>
                                            <button onClick={() => rejectArticle(art.id)} className="flex-1 bg-red-950/50 hover:bg-red-900/80 text-red-400 px-5 py-2.5 rounded-lg text-sm font-800 flex items-center justify-center gap-2"><Trash2 className="h-4 w-4"/> Tolak</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {ceoTab === 'verifikasi' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800">
                                <h2 className="text-lg font-900 flex items-center gap-2"><UserPlus className="h-5 w-5 text-indigo-400"/> Pendaftar Relawan Baru</h2>
                            </div>
                            <div className="p-6 grid gap-4">
                                {pendingUsers.length === 0 && <p className="text-slate-500 text-center font-600 py-8">Tidak ada antrean pendaftar.</p>}
                                {pendingUsers.map(u => (
                                    <div key={u.id} className="border border-slate-800 bg-slate-950 p-4 rounded-xl flex justify-between items-center">
                                        <div>
                                            <h3 className="font-800 text-white text-base">{u.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{u.email}</p>
                                        </div>
                                        <button onClick={() => approveUser(u.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-800 transition-colors">Approve Akun</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {ceoTab === 'relawan' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800">
                                <h2 className="text-lg font-900 flex items-center gap-2"><Users className="h-5 w-5 text-emerald-400"/> Database Relawan & Hitung Gaji</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4">Nama Akun</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4 text-center">Artikel Lolos (PPS)</th>
                                            <th className="p-4 text-right">Estimasi Tagihan Gaji</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {users.filter(u => u.approved).map((u) => {
                                            // Hitung artikel untuk user ini
                                            const userArticles = articles.filter(a => a.author === u.name && a.status === 'Published').length;
                                            // Simulasi Views = 1500 per artikel terbit (karena belum ada view counter di DB)
                                            const simulatedViews = userArticles * 1500; 
                                            const gaji = (userArticles * TARIF_PER_ARTIKEL) + ((simulatedViews / 1000) * TARIF_PER_1000_VIEWS);
                                            
                                            return (
                                                <tr key={u.id} className="hover:bg-slate-800/30">
                                                    <td className="p-4 font-800 text-white">{u.name}</td>
                                                    <td className="p-4 text-xs text-slate-400">{u.email}</td>
                                                    <td className="p-4 text-center font-800 text-emerald-400">{userArticles} Artikel</td>
                                                    <td className="p-4 text-right font-900 text-indigo-400">Rp {gaji.toLocaleString('id-ID')}</td>
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
        );
    }

    // ==========================================
    // TAMPILAN 2: DASHBOARD RELAWAN
    // ==========================================
    if (view === 'dashboard_relawan' && currentUser) {
        // Kalkulasi gaji spesifik user ini
        const myArticles = articles.filter(a => a.author === currentUser.name && a.status === 'Published').length;
        const myDrafts = articles.filter(a => a.author === currentUser.name && a.status === 'Pending Review').length;
        const mySimulatedViews = myArticles * 1500;
        const totalPendapatan = (myArticles * TARIF_PER_ARTIKEL) + ((mySimulatedViews / 1000) * TARIF_PER_1000_VIEWS);

        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center text-emerald-400 font-900 text-xl">
                                {currentUser.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-900 text-white">Halo, {currentUser.name}!</h1>
                                <p className="text-slate-400 text-xs mt-0.5">Ruang Redaksi Kontributor</p>
                            </div>
                        </div>
                        <button onClick={() => { setView('landing'); setCurrentUser(null); }} className="bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-lg text-sm font-800 flex items-center gap-2"><LogIn className="h-4 w-4 rotate-180" /> Logout</button>
                    </div>

                    {/* Stats Gaji */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                            <FileText className="h-5 w-5 text-indigo-400 mb-2"/>
                            <p className="text-[10px] text-slate-400 font-800 mb-1 uppercase tracking-wider">Artikel Terbit</p>
                            <p className="text-2xl font-900 text-white">{myArticles}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                            <Clock className="h-5 w-5 text-orange-400 mb-2"/>
                            <p className="text-[10px] text-slate-400 font-800 mb-1 uppercase tracking-wider">Draf Menunggu</p>
                            <p className="text-2xl font-900 text-white">{myDrafts}</p>
                        </div>
                        <div className="col-span-2 bg-emerald-950/20 border border-emerald-900/50 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <Wallet className="h-5 w-5 text-emerald-400 mb-2"/>
                                <p className="text-[10px] text-emerald-500 font-800 mb-1 uppercase tracking-wider">Estimasi Pendapatan Cair</p>
                                <p className="text-3xl font-900 text-emerald-400">Rp {totalPendapatan.toLocaleString('id-ID')}</p>
                            </div>
                            <button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-800 text-sm shadow-lg">Tarik Dana</button>
                        </div>
                    </div>

                    {/* Area Nulis */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
                        <div className="p-6 border-b border-slate-800 bg-slate-950/30">
                            <h2 className="text-lg font-900 text-white flex items-center gap-2"><Plus className="h-5 w-5 text-indigo-400"/> Tulis Berita Baru</h2>
                        </div>
                        <form onSubmit={handleCreateArticle} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-900 text-slate-400 mb-2 uppercase tracking-widest">Judul Artikel</label>
                                <input type="text" value={artTitle} onChange={(e) => setArtTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Ketik judul menarik..." />
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-900 text-slate-400 mb-2 uppercase tracking-widest">URL Gambar Sampul</label>
                                    <input type="url" value={artImageUrl} onChange={(e) => setArtImageUrl(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors" placeholder="https://link-gambar.com/foto.jpg" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-900 text-slate-400 mb-2 uppercase tracking-widest">Pilih Divisi Penempatan</label>
                                    <select value={artCategory} onChange={(e) => setArtCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                                        {mediaNetwork.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-900 text-slate-400 mb-2 uppercase tracking-widest">Isi Konten Berita</label>
                                <textarea rows="8" value={artContent} onChange={(e) => setArtContent(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed" placeholder="Tulis liputan dan narasi berita Anda di sini..."></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-900 text-sm shadow-lg transition-all">
                                    {loading ? 'Menyimpan Draf...' : 'Ajukan Artikel ke Meja Redaksi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // TAMPILAN 3: PUBLIC LANDING PAGE
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-600 antialiased">
            {showLoginModal && <LoginModal />}
            
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/40"><Layers className="h-5 w-5 text-white" /></span>
                        <div>
                            <span className="font-display text-lg font-900 tracking-tight text-white block">RAYLIZIIE MEDIA DIGITAL</span>
                            <span className="text-[9px] font-800 tracking-widest text-indigo-400 uppercase block -mt-0.5">Rayliziie Grup Subsidiary</span>
                        </div>
                    </div>
                    <button onClick={() => setShowLoginModal(true)} className="rounded-full bg-white px-5 py-2.5 text-xs font-900 text-slate-900 transition-all hover:bg-indigo-500 hover:text-white flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5" /> Portal Tim Redaksi
                    </button>
                </div>
            </header>

            <section className="relative overflow-hidden pt-24 pb-16 text-center md:pt-32 md:pb-24">
                <div className="mx-auto max-w-4xl px-6 relative z-10">
                    <motion.span initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-4 py-1.5 text-xs font-700 uppercase tracking-wider text-indigo-400">
                        <Radio className="h-3.5 w-3.5 text-indigo-400" /> Ekosistem 5 Media Nasional Terintegrasi
                    </motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 font-display text-4xl font-950 leading-[1.1] tracking-tight text-white md:text-6xl">
                        Kendalikan Masa Depan <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Jurnalisme Siber Global</span>
                    </motion.h1>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-6 pb-28">
                <h2 className="text-xs font-900 tracking-widest text-slate-500 uppercase border-b border-slate-800 pb-4 mb-8">Digital Media Network & Published Contents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {mediaNetwork.map((item) => {
                        const publishedArts = articles.filter(a => a.category === item.code && a.status === 'Published');
                        
                        return (
                            <div key={item.name} className="flex flex-col bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all">
                                <div className="p-6 border-b border-slate-800/50">
                                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl border ${item.color} mb-4`}>
                                        <item.icon className="h-6 w-6" />
                                    </span>
                                    <h3 className="font-900 text-lg text-white">{item.name}</h3>
                                    <p className="text-[10px] text-indigo-400 font-800 uppercase tracking-widest mt-1">{item.cat}</p>
                                </div>
                                <div className="p-5 flex-1 bg-slate-900/30 space-y-4">
                                    {publishedArts.length === 0 && <p className="text-[10px] font-700 text-slate-600 uppercase text-center py-4">Belum ada artikel diterbitkan</p>}
                                    {publishedArts.map(art => (
                                        <div key={art.id} className="group cursor-pointer">
                                            {art.image_url && <img src={art.image_url} alt="Cover" className="w-full h-28 object-cover rounded-lg border border-slate-800 mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />}
                                            <h4 className="font-800 text-white text-sm leading-snug group-hover:text-indigo-400 transition-colors">{art.title}</h4>
                                            <p className="text-[10px] text-slate-500 font-600 mt-1.5">By <span className="text-emerald-400">{art.author}</span></p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-[10px]">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-900 text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1">Kunjungi Web <ArrowUpRight className="h-3 w-3"/></a>
                                    <span className="font-800 text-emerald-500 bg-emerald-950/30 px-2 py-0.5 rounded-full">LIVE</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
            
            <footer className="border-t border-slate-800 bg-slate-950/80">
                <div className="mx-auto max-w-7xl px-6 py-12 text-center">
                    <p className="text-xs text-slate-500 font-700">&copy; 2026 Rayliziie Media Digital. Hak Cipta Dilindungi.</p>
                    <p className="mt-1 text-[10px] font-800 tracking-widest text-indigo-400 uppercase">NutrisiDietMu &middot; BolaGass &middot; GlowLogika &middot; CuanPintar &middot; DakwahBerkah</p>
                </div>
            </footer>
        </div>
    );
};

export default App;
