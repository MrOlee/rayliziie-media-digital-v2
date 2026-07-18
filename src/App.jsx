import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Laptop, Sparkles, Flame, Box, Landmark, Moon, 
    ShieldCheck, ArrowUpRight, ArrowRight, Layers, 
    Users, X, Trash2, Plus, Wallet, FileText, 
    Eye, LogIn, CheckCircle2, Clock, Check, Radio
} from 'lucide-react';

// Ekosistem 5 Media (Termasuk DakwahBerkah)
const mediaNetwork = [
    { name: "NutrisiDietMu", icon: Sparkles, cat: "Gizi & Kesehatan", color: "border-teal-550 text-teal-400 bg-teal-950/30", link: "https://nutrisidietmu.vercel.app" },
    { name: "BolaGass", icon: Flame, cat: "Jurnalisme Olahraga", color: "border-orange-550 text-orange-400 bg-orange-950/30", link: "#" },
    { name: "GlowLogika", icon: Box, cat: "Skincare & Beauty", color: "border-pink-550 text-pink-400 bg-pink-950/30", link: "#" },
    { name: "CuanPintar", icon: Landmark, cat: "Literasi Finansial", color: "border-blue-550 text-blue-400 bg-blue-950/30", link: "#" },
    { name: "DakwahBerkah", icon: Moon, cat: "Dakwah & Edukasi Islami", color: "border-emerald-550 text-emerald-400 bg-emerald-950/30", link: "#" }
];

const App = () => {
    const [view, setView] = useState('landing');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [ceoTab, setCeoTab] = useState('relawan'); 
    
    // Database Dummy
    const [relawanList, setRelawanList] = useState([
        { id: 1, nama: "Muhammad Syuhada ar'rayyan", divisi: "NutrisiDietMu", role: "Manager", artikel: 34, views: 28000 },
        { id: 2, nama: "Amallea Fadhilla", divisi: "GlowLogika", role: "Relawan Penulis", artikel: 12, views: 4500 },
        { id: 3, nama: "Relawan Dakwah", divisi: "DakwahBerkah", role: "Relawan Penulis", artikel: 5, views: 1200 }
    ]);

    const [artikelDraft, setArtikelDraft] = useState([
        { id: 101, judul: "Mengenal Pola Makan Sehat Masyarakat Pesisir", penulis: "Amallea Fadhilla", divisi: "NutrisiDietMu", status: "pending", tanggal: "2026-07-18" },
        { id: 102, judul: "Keutamaan Sedekah Subuh", penulis: "Relawan Dakwah", divisi: "DakwahBerkah", status: "pending", tanggal: "2026-07-18" }
    ]);

    // Gaji Profesional
    const TARIF_PER_ARTIKEL = 15000;
    const TARIF_PER_1000_VIEWS = 5000;

    // Form Tambah Relawan CEO
    const [formData, setFormData] = useState({ nama: '', divisi: 'DakwahBerkah', role: 'Relawan Penulis' });

    const handleAddRelawan = (e) => {
        e.preventDefault();
        setRelawanList([{ id: Date.now(), ...formData, artikel: 0, views: 0 }, ...relawanList]);
        setFormData({ nama: '', divisi: 'DakwahBerkah', role: 'Relawan Penulis' });
    };

    const handleApprove = (id) => {
        setArtikelDraft(artikelDraft.map(art => 
            art.id === id ? { ...art, status: 'approved' } : art
        ));
        alert("Artikel di-Approve! Artikel akan terdistribusi ke website bersangkutan.");
    };

    const handleReject = (id) => {
        setArtikelDraft(artikelDraft.filter(art => art.id !== id));
    };

    const LoginModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="h-5 w-5"/></button>
                <h2 className="text-2xl font-900 text-white mb-2">Sistem Akses</h2>
                <p className="text-sm text-slate-400 mb-8">Pilih jalur login ekosistem Rayliziie.</p>
                <div className="space-y-4">
                    <button onClick={() => { setView('admin_ceo'); setShowLoginModal(false); }} className="w-full flex items-center justify-between bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-xl font-700 transition-all">
                        <span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5"/> Login CEO / Direksi</span>
                        <ArrowRight className="h-4 w-4"/>
                    </button>
                    <button onClick={() => { setView('dashboard_relawan'); setShowLoginModal(false); }} className="w-full flex items-center justify-between bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-700 transition-all">
                        <span className="flex items-center gap-3"><FileText className="h-5 w-5"/> Dashboard Kontributor</span>
                        <ArrowRight className="h-4 w-4"/>
                    </button>
                </div>
            </motion.div>
        </div>
    );

    if (view === 'admin_ceo') {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-6">
                        <div>
                            <h1 className="text-3xl font-900 text-white flex items-center gap-3"><ShieldCheck className="text-indigo-500 h-8 w-8" /> Executive Dashboard</h1>
                            <p className="text-slate-400 text-sm mt-1">Kontrol 5 Divisi Media Digital Rayliziie Grup</p>
                        </div>
                        <button onClick={() => setView('landing')} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-600 flex items-center gap-2"><X className="h-4 w-4" /> Keluar</button>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <button onClick={() => setCeoTab('relawan')} className={`px-6 py-2.5 rounded-lg font-700 text-sm transition-all ${ceoTab === 'relawan' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>Database Relawan & Keuangan</button>
                        <button onClick={() => setCeoTab('approval')} className={`px-6 py-2.5 rounded-lg font-700 text-sm transition-all flex items-center gap-2 ${ceoTab === 'approval' ? 'bg-orange-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                            Kurasi Artikel <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{artikelDraft.filter(a => a.status === 'pending').length}</span>
                        </button>
                    </div>

                    {ceoTab === 'relawan' && (
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit">
                                <h2 className="text-lg font-800 mb-5 flex items-center gap-2"><Plus className="h-5 w-5 text-indigo-400"/> Rekrut Relawan Baru</h2>
                                <form onSubmit={handleAddRelawan} className="space-y-4">
                                    <input required type="text" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white outline-none" placeholder="Nama Lengkap..." />
                                    <select value={formData.divisi} onChange={(e) => setFormData({...formData, divisi: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white outline-none">
                                        <option>NutrisiDietMu</option>
                                        <option>BolaGass</option>
                                        <option>GlowLogika</option>
                                        <option>CuanPintar</option>
                                        <option>DakwahBerkah</option>
                                    </select>
                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-700 py-2.5 rounded-lg text-sm mt-4">Tambahkan Personel</button>
                                </form>
                            </div>
                            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-slate-800">
                                    <h2 className="text-lg font-800 flex items-center gap-2"><Users className="h-5 w-5 text-emerald-400"/> Personel Kontributor Aktif</h2>
                                </div>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4">Personel</th>
                                            <th className="p-4">Performa (Sanity)</th>
                                            <th className="p-4 text-right">Estimasi Gaji</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {relawanList.map((r) => {
                                            const gaji = (r.artikel * TARIF_PER_ARTIKEL) + ((r.views / 1000) * TARIF_PER_1000_VIEWS);
                                            return (
                                                <tr key={r.id} className="hover:bg-slate-800/30">
                                                    <td className="p-4">
                                                        <p className="font-700 text-white">{r.nama}</p>
                                                        <p className="text-[10px] text-emerald-400">{r.divisi}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-xs text-white font-700">{r.artikel} Artikel</p>
                                                        <p className="text-[10px] text-slate-500">{r.views.toLocaleString()} Views</p>
                                                    </td>
                                                    <td className="p-4 text-right font-800 text-indigo-400">Rp {gaji.toLocaleString('id-ID')}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {ceoTab === 'approval' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800">
                                <h2 className="text-lg font-800 flex items-center gap-2"><Clock className="h-5 w-5 text-orange-400"/> Antrean Kurasi Artikel</h2>
                            </div>
                            <div className="p-6 grid gap-4">
                                {artikelDraft.filter(a => a.status === 'pending').length === 0 && <p className="text-slate-500 text-center">Bersih. Tidak ada draft antre.</p>}
                                {artikelDraft.filter(a => a.status === 'pending').map((art) => (
                                    <div key={art.id} className="border border-slate-800 bg-slate-950 p-4 rounded-xl flex justify-between items-center">
                                        <div>
                                            <h3 className="font-800 text-white text-lg">{art.judul}</h3>
                                            <p className="text-xs text-slate-400 mt-1">Target: <span className="text-emerald-400">{art.divisi}</span> &middot; Oleh: {art.penulis}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApprove(art.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-700 flex items-center gap-1.5"><Check className="h-4 w-4"/> Acc</button>
                                            <button onClick={() => handleReject(art.id)} className="bg-red-950 text-red-400 px-4 py-2 rounded-lg text-sm font-700"><Trash2 className="h-4 w-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (view === 'dashboard_relawan') {
        const dummyUser = relawanList[2]; // Simulasi masuk sebagai Relawan DakwahBerkah
        const pendapatanFlat = dummyUser.artikel * TARIF_PER_ARTIKEL;
        const pendapatanViews = (dummyUser.views / 1000) * TARIF_PER_1000_VIEWS;
        const totalPendapatan = pendapatanFlat + pendapatanViews;

        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center text-emerald-400 font-900 text-xl">
                                {dummyUser.nama.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-900 text-white">Halo, {dummyUser.nama}!</h1>
                                <p className="text-slate-400 text-xs mt-0.5">Kontributor &middot; <span className="text-emerald-400">{dummyUser.divisi}</span></p>
                            </div>
                        </div>
                        <button onClick={() => setView('landing')} className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-600 flex items-center gap-2"><LogIn className="h-4 w-4 rotate-180" /> Logout</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                            <FileText className="h-5 w-5 text-indigo-400 mb-2"/>
                            <p className="text-xs text-slate-400 font-600 mb-1">Artikel Terbit (PPS)</p>
                            <p className="text-2xl font-900 text-white">{dummyUser.artikel}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                            <Eye className="h-5 w-5 text-orange-400 mb-2"/>
                            <p className="text-xs text-slate-400 font-600 mb-1">Total Views (PPV)</p>
                            <p className="text-2xl font-900 text-white">{dummyUser.views.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2 bg-emerald-950/20 border border-emerald-900/50 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <Wallet className="h-5 w-5 text-emerald-400 mb-2"/>
                                <p className="text-xs text-emerald-500 font-600 mb-1">Saldo Bisa Ditarik</p>
                                <p className="text-3xl font-900 text-emerald-400">Rp {totalPendapatan.toLocaleString('id-ID')}</p>
                            </div>
                            <button className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-700 text-sm shadow-lg">Tarik Dana</button>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-base font-800 text-white">Riwayat Artikel Saya</h2>
                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-700 flex items-center gap-1.5"><Plus className="h-3.5 w-3.5"/> Submit Artikel</button>
                        </div>
                        <div className="p-6">
                             {artikelDraft.filter(a => a.penulis === dummyUser.nama).map((art) => (
                                 <div key={art.id} className="border border-slate-800 bg-slate-950 p-4 rounded-xl flex justify-between items-center mb-3">
                                     <div>
                                        <h3 className="font-800 text-white">{art.judul}</h3>
                                        <p className="text-xs text-slate-500 mt-1">Tanggal: {art.tanggal}</p>
                                     </div>
                                     <span className={`px-3 py-1 text-[10px] font-800 uppercase rounded-full ${art.status === 'pending' ? 'bg-orange-900/50 text-orange-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                                         {art.status === 'pending' ? 'Menunggu Acc' : 'Terbit'}
                                     </span>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-600 antialiased">
            {showLoginModal && <LoginModal />}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600"><Layers className="h-5 w-5 text-white" /></span>
                        <div>
                            <span className="font-display text-lg font-900 tracking-tight text-white block">RAYLIZIIE MEDIA DIGITAL</span>
                            <span className="text-[9px] font-700 tracking-widest text-indigo-400 uppercase block -mt-0.5">Dapur Redaksi Terpusat</span>
                        </div>
                    </div>
                    <button onClick={() => setShowLoginModal(true)} className="rounded-full bg-white px-5 py-2 text-xs font-700 text-slate-900 transition-all hover:bg-indigo-500 hover:text-white flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" /> Portal Tim
                    </button>
                </div>
            </header>
            
            <section className="relative pt-20 pb-12 text-center md:pt-28 md:pb-16">
                <div className="mx-auto max-w-4xl px-6 relative z-10">
                    <motion.span initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-4 py-1.5 text-xs font-600 uppercase tracking-wider text-indigo-400">
                        <Radio className="h-3.5 w-3.5 text-indigo-400" /> Ekosistem 5 Media Nasional
                    </motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 font-display text-4xl font-900 leading-[1.1] text-white md:text-5xl">
                        Kendalikan Masa Depan <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Jurnalisme & Media Siber</span>
                    </motion.h1>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-6 pb-28">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mediaNetwork.map((item) => (
                        <div key={item.name} className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-6 hover:-translate-y-1 hover:border-slate-700 transition-all">
                            <div>
                                <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${item.color} mb-4`}>
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <h3 className="font-800 text-base text-white">{item.name}</h3>
                                <p className="text-[10px] text-indigo-400 font-600 uppercase mt-1">{item.cat}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default App;
