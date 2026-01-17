import { useState, useEffect } from 'react'
import { db } from './firebase'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, increment, query, where, getDoc, setDoc, getDocs } from 'firebase/firestore'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import * as XLSX from 'xlsx';

// --- SWEETALERT2 & TOAST ---
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- AUTH ---
const auth = getAuth();
const provider = new GoogleAuthProvider();

// --- YARDIMCI FONKSİYON: Formatlı Para (Alertler İçin) ---
const formatCurrencyPlain = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

function App() {
    // --- STATE ---
    const [user, setUser] = useState(null);
    const [aileKodu, setAileKodu] = useState(localStorage.getItem("aile_kodu") || "");
    const [girilenKod, setGirilenKod] = useState("");
    const [loading, setLoading] = useState(true);

    const [hesaplar, setHesaplar] = useState([])
    const [islemler, setIslemler] = useState([])
    const [abonelikler, setAbonelikler] = useState([])
    const [taksitler, setTaksitler] = useState([])
    const [maaslar, setMaaslar] = useState([])
    const [bekleyenFaturalar, setBekleyenFaturalar] = useState([]);
    const [tanimliFaturalar, setTanimliFaturalar] = useState([]);
    const [bildirimler, setBildirimler] = useState([]);

    const [gizliMod, setGizliMod] = useState(false);
    const [aktifAy, setAktifAy] = useState(new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }));
    const [aylikLimit, setAylikLimit] = useState(10000);

    const [formTab, setFormTab] = useState("islem");
    const [aktifModal, setAktifModal] = useState(null);
    const [seciliVeri, setSeciliVeri] = useState(null);

    // --- FİLTRE STATE'LERİ ---
    const [aramaMetni, setAramaMetni] = useState("");
    const [filtreKategori, setFiltreKategori] = useState("Tümü");
    const [filtreKisi, setFiltreKisi] = useState("Tümü");

    // --- AYARLAR ---
    const [kategoriListesi, setKategoriListesi] = useState(["Market", "Pazar", "Araç", "Akaryakıt", "Fatura", "Kira/Aidat", "Giyim", "Eğitim", "Sağlık", "Eğlence", "Elektronik", "Mobilya", "Diğer", "Maaş/Gelir", "Kredi Kartı Ödemesi"]);
    const [aileUyeleri, setAileUyeleri] = useState(["Baba", "Anne", "Çocuk", "Ortak", "Araç Giderleri"]);

    const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
    const [yeniKisiAdi, setYeniKisiAdi] = useState("");

    // Kod Değişimi İçin
    const [yeniAileKoduInput, setYeniAileKoduInput] = useState("");
    const [tasimaIslemiSuruyor, setTasimaIslemiSuruyor] = useState(false);

    // Form Değişkenleri
    const [hesapAdi, setHesapAdi] = useState(""); const [hesapTipi, setHesapTipi] = useState("nakit"); const [baslangicBakiye, setBaslangicBakiye] = useState(""); const [hesapKesimGunu, setHesapKesimGunu] = useState("");
    const [secilenHesapId, setSecilenHesapId] = useState(""); const [islemTutar, setIslemTutar] = useState(""); const [islemAciklama, setIslemAciklama] = useState("")
    const [islemTipi, setIslemTipi] = useState("gider"); const [kategori, setKategori] = useState(""); const [islemTarihi, setIslemTarihi] = useState("")
    const [harcayanKisi, setHarcayanKisi] = useState("");

    const [transferKaynakId, setTransferKaynakId] = useState(""); const [transferHedefId, setTransferHedefId] = useState(""); const [transferTutar, setTransferTutar] = useState("");

    // Abonelik Form
    const [aboAd, setAboAd] = useState(""); const [aboTutar, setAboTutar] = useState(""); const [aboGun, setAboGun] = useState(""); const [aboHesapId, setAboHesapId] = useState("");
    const [aboKategori, setAboKategori] = useState("Fatura");
    const [aboKisi, setAboKisi] = useState("");

    // Taksit Form
    const [taksitBaslik, setTaksitBaslik] = useState("");
    const [taksitToplamTutar, setTaksitToplamTutar] = useState("");
    const [taksitSayisi, setTaksitSayisi] = useState("");
    const [taksitHesapId, setTaksitHesapId] = useState("");
    const [taksitKategori, setTaksitKategori] = useState("");
    const [taksitKisi, setTaksitKisi] = useState("");
    const [taksitAlisTarihi, setTaksitAlisTarihi] = useState("");

    // Maaş Form
    const [maasAd, setMaasAd] = useState("");
    const [maasTutar, setMaasTutar] = useState("");
    const [maasGun, setMaasGun] = useState("");
    const [maasHesapId, setMaasHesapId] = useState("");

    // Fatura Tanım Formu
    const [tanimBaslik, setTanimBaslik] = useState("");
    const [tanimKurum, setTanimKurum] = useState("");
    const [tanimAboneNo, setTanimAboneNo] = useState("");

    // Fatura Giriş Formu
    const [secilenTanimId, setSecilenTanimId] = useState("");
    const [faturaGirisTutar, setFaturaGirisTutar] = useState("");
    const [faturaGirisTarih, setFaturaGirisTarih] = useState("");
    const [faturaGirisAciklama, setFaturaGirisAciklama] = useState("");

    // Kredi Kartı Ödeme Formu
    const [kkOdemeKartId, setKkOdemeKartId] = useState("");
    const [kkOdemeKaynakId, setKkOdemeKaynakId] = useState("");
    const [kkOdemeTutar, setKkOdemeTutar] = useState("");

    // --- OTURUM ---
    useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }); return () => unsubscribe(); }, []);

    // --- AİLE KODU KAYDETME ---
    const aileKoduKaydet = (e) => {
        e.preventDefault();
        if (!girilenKod) return toast.warning("Lütfen bir kod girin");
        localStorage.setItem("aile_kodu", girilenKod);
        setAileKodu(girilenKod);
        window.location.reload();
    }

    const aileKoduCikis = () => {
        Swal.fire({
            title: 'Çıkış Yapılsın mı?',
            text: "Aile grubundan çıkmak istediğine emin misin?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, Çık',
            cancelButtonText: 'İptal'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("aile_kodu");
                setAileKodu("");
                window.location.reload();
            }
        });
    }

    // --- VERİ TAŞIMA ---
    const verileriTasi = async (e) => {
        e.preventDefault();
        if (!yeniAileKoduInput) return toast.warning("Yeni kodu girmelisiniz.");
        if (yeniAileKoduInput === aileKodu) return toast.warning("Yeni kod eskisiyle aynı olamaz.");

        const result = await Swal.fire({
            title: 'DİKKAT!',
            html: `Tüm verileriniz <b>"${aileKodu}"</b> kodundan <b>"${yeniAileKoduInput}"</b> koduna taşınacaktır.<br/>Bu işlem geri alınamaz!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, Taşı',
            cancelButtonText: 'Vazgeç'
        });

        if (!result.isConfirmed) return;

        setTasimaIslemiSuruyor(true);
        const yeniKod = yeniAileKoduInput;
        const eskiKod = aileKodu;

        try {
            const eskiAyarRef = doc(db, "ayarlar", eskiKod);
            const eskiAyarSnap = await getDoc(eskiAyarRef);
            if (eskiAyarSnap.exists()) {
                await setDoc(doc(db, "ayarlar", yeniKod), eskiAyarSnap.data());
                await deleteDoc(eskiAyarRef);
            }

            const koleksiyonlar = ["hesaplar", "nakit_islemleri", "abonelikler", "taksitler", "maaslar", "bekleyen_faturalar", "fatura_tanimlari"];
            for (const kolAdi of koleksiyonlar) {
                const q = query(collection(db, kolAdi), where("aileKodu", "==", eskiKod));
                const snapshot = await getDocs(q);
                const promises = snapshot.docs.map(belge =>
                    updateDoc(doc(db, kolAdi, belge.id), { aileKodu: yeniKod })
                );
                await Promise.all(promises);
            }

            Swal.fire('Başarılı!', 'Taşıma işlemi tamamlandı.', 'success');
            localStorage.setItem("aile_kodu", yeniKod);
            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            console.error("Taşıma hatası:", error);
            Swal.fire('Hata', 'Bir hata oluştu: ' + error.message, 'error');
            setTasimaIslemiSuruyor(false);
        }
    }

    // --- VERİLERİ ÇEKME ---
    useEffect(() => {
        if (!user || !aileKodu) return;

        const qHesaplar = query(collection(db, "hesaplar"), where("aileKodu", "==", aileKodu));
        const qIslemler = query(collection(db, "nakit_islemleri"), where("aileKodu", "==", aileKodu));
        const qAbonelik = query(collection(db, "abonelikler"), where("aileKodu", "==", aileKodu));
        const qTaksitler = query(collection(db, "taksitler"), where("aileKodu", "==", aileKodu));
        const qMaaslar = query(collection(db, "maaslar"), where("aileKodu", "==", aileKodu));
        const qFaturalar = query(collection(db, "bekleyen_faturalar"), where("aileKodu", "==", aileKodu));
        const qFaturaTanim = query(collection(db, "fatura_tanimlari"), where("aileKodu", "==", aileKodu));

        const u1 = onSnapshot(qHesaplar, (s) => setHesaplar(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u2 = onSnapshot(qIslemler, (s) => {
            const v = s.docs.map(d => ({ id: d.id, ...d.data() }));
            v.sort((a, b) => (b.tarih?.seconds || 0) - (a.tarih?.seconds || 0));
            setIslemler(v);
        });

        // ABONELİKLER: Gününe göre sırala (Küçükten büyüğe)
        const u4 = onSnapshot(qAbonelik, (s) => {
            const veri = s.docs.map(d => ({ id: d.id, ...d.data() }));
            veri.sort((a, b) => (parseInt(a.gun) || 0) - (parseInt(b.gun) || 0));
            setAbonelikler(veri);
        });

        // TAKSİTLER: Alış tarihinin gününe göre sırala (Küçükten büyüğe)
        const u5 = onSnapshot(qTaksitler, (s) => {
            const veri = s.docs.map(d => ({ id: d.id, ...d.data() }));
            veri.sort((a, b) => {
                const gunA = a.alisTarihi ? new Date(a.alisTarihi.seconds * 1000).getDate() : 32;
                const gunB = b.alisTarihi ? new Date(b.alisTarihi.seconds * 1000).getDate() : 32;
                return gunA - gunB;
            });
            setTaksitler(veri);
        });

        const u6 = onSnapshot(qMaaslar, (s) => setMaaslar(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u7 = onSnapshot(qFaturalar, (s) => setBekleyenFaturalar(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u8 = onSnapshot(qFaturaTanim, (s) => setTanimliFaturalar(s.docs.map(d => ({ id: d.id, ...d.data() }))));

        const ayarGetir = async () => {
            const d = await getDoc(doc(db, "ayarlar", aileKodu));
            if (d.exists()) {
                const data = d.data();
                setAylikLimit(data.limit || 10000);
                if (data.kategoriler?.length > 0) {
                    setKategoriListesi(data.kategoriler);
                    setKategori(data.kategoriler[0]);
                    setTaksitKategori(data.kategoriler[0]);
                    if (data.kategoriler.includes("Fatura")) setAboKategori("Fatura");
                    else setAboKategori(data.kategoriler[0]);
                }
                if (data.aileUyeleri?.length > 0) {
                    setAileUyeleri(data.aileUyeleri);
                    setHarcayanKisi(data.aileUyeleri[0]);
                    setTaksitKisi(data.aileUyeleri[0]);
                    setAboKisi(data.aileUyeleri[0]);
                }
            } else {
                setKategori(kategoriListesi[0]);
                setHarcayanKisi(aileUyeleri[0]);
                setTaksitKategori(kategoriListesi[0]);
                setTaksitKisi(aileUyeleri[0]);
                setAboKategori("Fatura");
                setAboKisi(aileUyeleri[0]);
            }
        }
        ayarGetir();
        return () => { u1(); u2(); u4(); u5(); u6(); u7(); u8(); }
    }, [user, aileKodu])

    // --- BİLDİRİM MOTORU ---
    useEffect(() => {
        if (islemler.length === 0 && abonelikler.length === 0 && taksitler.length === 0 && maaslar.length === 0 && hesaplar.length === 0 && bekleyenFaturalar.length === 0) return;
        const bugun = new Date();
        const mevcutAy = bugun.getMonth();
        const mevcutYil = bugun.getFullYear();
        const mevcutGun = bugun.getDate();
        let tempBildirimler = [];

        // 1. Kredi Kartı
        hesaplar.forEach(h => {
            if (h.hesapTipi === 'krediKarti' && h.kesimGunu) {
                if (mevcutGun >= parseInt(h.kesimGunu) && mevcutGun < parseInt(h.kesimGunu) + 10) {
                    tempBildirimler.push({
                        id: h.id + '_kk',
                        tip: 'kk_hatirlatma',
                        mesaj: `💳 ${h.hesapAdi} ekstresi kesildi! (${h.kesimGunu}. gün)`,
                        tutar: Math.abs(h.guncelBakiye),
                        data: h,
                        renk: 'orange'
                    });
                }
            }
        });

        // 2. Maaş
        maaslar.forEach(maas => {
            if (mevcutGun >= maas.gun) {
                const yattiMi = islemler.some(islem => {
                    const islemTarih = new Date(islem.tarih.seconds * 1000);
                    return islemTarih.getMonth() === mevcutAy &&
                        islemTarih.getFullYear() === mevcutYil &&
                        islem.aciklama.toLowerCase().includes(maas.ad.toLowerCase()) &&
                        islem.islemTipi === 'gelir';
                });
                if (!yattiMi) {
                    tempBildirimler.push({ id: maas.id, tip: 'maas', mesaj: `💰 ${maas.ad} günü geldi! Yatırmayı unutma.`, tutar: maas.tutar, data: maas, renk: 'green' });
                }
            }
        });

        // 3. Abonelik
        abonelikler.forEach(abo => {
            if (mevcutGun >= abo.gun) {
                const odendiMi = islemler.some(islem => {
                    const islemTarih = new Date(islem.tarih.seconds * 1000);
                    return islemTarih.getMonth() === mevcutAy &&
                        islemTarih.getFullYear() === mevcutYil &&
                        islem.aciklama.toLowerCase().includes(abo.ad.toLowerCase());
                });
                if (!odendiMi) tempBildirimler.push({ id: abo.id, tip: 'abonelik', mesaj: `⚠️ ${abo.ad} ödenmedi! (${abo.gun}. gün)`, tutar: abo.tutar, data: abo, renk: 'red' });
            }
        });

        // 4. Taksit
        taksitler.forEach(t => {
            let taksitGunu = 1;
            if (t.alisTarihi) {
                const d = new Date(t.alisTarihi.seconds * 1000);
                taksitGunu = d.getDate();
            }

            if (mevcutGun >= taksitGunu) {
                const odendiMi = islemler.some(islem => {
                    const islemTarih = new Date(islem.tarih.seconds * 1000);
                    return islemTarih.getMonth() === mevcutAy &&
                        islemTarih.getFullYear() === mevcutYil &&
                        islem.aciklama.toLowerCase().includes(t.baslik.toLowerCase());
                });
                if (!odendiMi) tempBildirimler.push({ id: t.id, tip: 'taksit', mesaj: `⚠️ ${t.baslik} taksiti ödenmedi! (${taksitGunu}. gün)`, tutar: t.aylikTutar, data: t, renk: 'red' });
            }
        });

        // 5. Fatura
        bekleyenFaturalar.forEach(f => {
            if (f.sonOdemeTarihi) {
                const sonOdeme = new Date(f.sonOdemeTarihi);
                const sO = new Date(sonOdeme.setHours(0, 0, 0, 0));
                const bG = new Date(bugun.setHours(0, 0, 0, 0));

                const kalanMilisaniye = sO - bG;
                const kalanGun = Math.ceil(kalanMilisaniye / (1000 * 60 * 60 * 24));

                const tanim = tanimliFaturalar.find(t => t.id === f.tanimId);
                const ad = tanim ? tanim.baslik : "Bilinmeyen Fatura";

                if (kalanGun < 0) {
                    tempBildirimler.push({ id: f.id, tip: 'fatura', mesaj: `🔥 ${ad} GECİKTİ! (${Math.abs(kalanGun)} gün)`, tutar: f.tutar, data: f, renk: 'red' });
                } else if (kalanGun <= 5) {
                    tempBildirimler.push({ id: f.id, tip: 'fatura', mesaj: `⚠️ ${ad} için son ${kalanGun} gün!`, tutar: f.tutar, data: f, renk: 'orange' });
                }
            }
        });

        setBildirimler(tempBildirimler);
    }, [islemler, abonelikler, taksitler, maaslar, hesaplar, bekleyenFaturalar, tanimliFaturalar]);


    // --- HESAPLAMALAR ---
    const formatPara = (tutar) => gizliMod ? "**** ₺" : (parseFloat(tutar) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
    const tarihFormatla = (t) => { if (!t) return ""; const d = new Date(t.seconds * 1000); return d.toLocaleDateString("tr-TR") + " " + d.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }); };
    const tarihSadeceGunAyYil = (t) => { if (!t) return ""; const d = new Date(t); return d.toLocaleDateString("tr-TR"); };

    const ayIsmiGetir = (firebaseTarih) => { if (!firebaseTarih) return "Bilinmiyor"; const date = new Date(firebaseTarih.seconds * 1000); return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }); }

    // --- GELİŞMİŞ FİLTRELEME MANTIĞI ---
    const filtrelenmisIslemler = islemler.filter(i => {
        // 1. Ay Filtresi
        const ayUyumu = aktifAy === "Tümü" ? true : ayIsmiGetir(i.tarih) === aktifAy;

        // 2. Metin Arama
        const aramaKucuk = aramaMetni.toLowerCase();
        const metinUyumu = !aramaMetni ? true : (
            (i.aciklama && i.aciklama.toLowerCase().includes(aramaKucuk)) ||
            (i.kategori && i.kategori.toLowerCase().includes(aramaKucuk)) ||
            (i.harcayan && i.harcayan.toLowerCase().includes(aramaKucuk)) ||
            i.tutar.toString().includes(aramaMetni)
        );

        // 3. Kategori Dropdown Filtresi
        const kategoriUyumu = filtreKategori === "Tümü" ? true : i.kategori === filtreKategori;

        // 4. Kişi Dropdown Filtresi
        const kisiUyumu = filtreKisi === "Tümü" ? true : i.harcayan === filtreKisi;

        return ayUyumu && metinUyumu && kategoriUyumu && kisiUyumu;
    });

    const mevcutAylar = ["Tümü", ...new Set(islemler.map(i => ayIsmiGetir(i.tarih)))];

    const toplamGider = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider').reduce((acc, i) => acc + i.tutar, 0);
    const toplamGelir = filtrelenmisIslemler.filter(i => i.islemTipi === 'gelir').reduce((acc, i) => acc + i.tutar, 0);
    const netToplam = filtrelenmisIslemler.reduce((acc, i) => { if (i.islemTipi === 'gelir') return acc + i.tutar; if (i.islemTipi === 'gider') return acc - i.tutar; return acc; }, 0);
    const bugun = new Date();
    const bugunGider = islemler.filter(i => { const d = new Date(i.tarih.seconds * 1000); return i.islemTipi === 'gider' && d.getDate() === bugun.getDate() && d.getMonth() === bugun.getMonth() && d.getFullYear() === bugun.getFullYear(); }).reduce((acc, i) => acc + i.tutar, 0);
    const harcananLimit = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider' && i.kategori !== 'Transfer' && i.kategori !== 'Kira' && i.kategori !== 'Kira/Aidat').reduce((acc, i) => acc + i.tutar, 0);
    const limitYuzdesi = Math.min((harcananLimit / aylikLimit) * 100, 100);
    const limitRenk = limitYuzdesi > 90 ? '#e53e3e' : limitYuzdesi > 75 ? '#dd6b20' : '#48bb78';
    const kategoriVerisi = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider' && i.kategori !== 'Transfer').reduce((acc, curr) => { const mevcut = acc.find(item => item.name === curr.kategori); if (mevcut) { mevcut.value += curr.tutar; } else { acc.push({ name: curr.kategori, value: curr.tutar }); } return acc; }, []);
    const gunlukVeri = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider').reduce((acc, curr) => { const gun = new Date(curr.tarih.seconds * 1000).getDate(); const mevcut = acc.find(item => item.name === gun); if (mevcut) mevcut.value += curr.tutar; else acc.push({ name: gun, value: curr.tutar }); return acc; }, []).sort((a, b) => a.name - b.name);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#e15fed', '#82ca9d'];
    let gunlukOrtalama = 0; if (aktifAy !== "Tümü") { const parcalar = aktifAy.split(" "); const ayIsmi = parcalar[0]; const yil = parseInt(parcalar[1]); const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]; const ayIndex = aylar.indexOf(ayIsmi); if (ayIndex > -1 && !isNaN(yil)) { const simdi = new Date(); let gunSayisi = 1; if (simdi.getMonth() === ayIndex && simdi.getFullYear() === yil) { gunSayisi = Math.max(1, simdi.getDate()); } else { gunSayisi = new Date(yil, ayIndex + 1, 0).getDate(); } gunlukOrtalama = toplamGider / gunSayisi; } }
    const toplamKalanTaksitBorcu = taksitler.reduce((acc, t) => acc + (t.toplamTutar - (t.aylikTutar * t.odenmisTaksit)), 0);
    const toplamAylikTaksitOdemesi = taksitler.reduce((acc, t) => acc + t.aylikTutar, 0);
    const toplamSabitGider = abonelikler.reduce((acc, abo) => acc + abo.tutar, 0);
    const toplamHesapBakiyesi = hesaplar.reduce((acc, h) => { if (aktifAy === "Tümü") { return acc + (parseFloat(h.guncelBakiye) || 0); } else { let aylikFark = 0; filtrelenmisIslemler.forEach(i => { if (i.hesapId === h.id) { if (i.islemTipi === 'gelir') aylikFark += i.tutar; if (i.islemTipi === 'gider') aylikFark -= i.tutar; } if (i.islemTipi === 'transfer') { if (i.kaynakId === h.id) aylikFark -= i.tutar; if (i.hedefId === h.id) aylikFark += i.tutar; } }); return acc + aylikFark; } }, 0);

    // --- FONKSİYONLAR ---
    const girisYap = async () => { try { await signInWithPopup(auth, provider); } catch (e) { console.error(e); toast.error("Giriş başarısız!"); } }
    const cikisYap = async () => { await signOut(auth); }

    const hesapEkle = async (e) => { e.preventDefault(); if (!hesapAdi) return; await addDoc(collection(db, "hesaplar"), { aileKodu, hesapAdi, hesapTipi, guncelBakiye: parseFloat(baslangicBakiye), kesimGunu: hesapTipi === 'krediKarti' ? hesapKesimGunu : "" }); toast.success("Hesap eklendi!"); setHesapAdi(""); setBaslangicBakiye(""); setHesapKesimGunu(""); }

    // SİLME İŞLEMİ (SWEETALERT2 İLE GÜNCELLENDİ)
    const islemSil = async (id) => {
        const docRef = doc(db, "nakit_islemleri", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();

            Swal.fire({
                title: 'Silmek istiyor musun?',
                html: `Bu işlemi geri alamazsın.<br/>Tutar: <b>${formatCurrencyPlain(data.tutar)}</b>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Evet, Sil!',
                cancelButtonText: 'Vazgeç'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    let duzeltmeMiktari = 0;
                    if (data.islemTipi === 'gider') duzeltmeMiktari = data.tutar;
                    if (data.islemTipi === 'gelir') duzeltmeMiktari = -data.tutar;
                    if (data.kategori === "Kredi Kartı Ödemesi") {
                        await updateDoc(doc(db, "hesaplar", data.kaynakId), { guncelBakiye: increment(data.tutar) });
                        await updateDoc(doc(db, "hesaplar", data.hedefId), { guncelBakiye: increment(-data.tutar) });
                    } else if (data.hesapId && duzeltmeMiktari !== 0) {
                        await updateDoc(doc(db, "hesaplar", data.hesapId), { guncelBakiye: increment(duzeltmeMiktari) });
                    }
                    if (data.kategori === "Taksit" && data.taksitId) {
                        await updateDoc(doc(db, "taksitler", data.taksitId), { odenmisTaksit: increment(-1) });
                    }
                    await deleteDoc(docRef);
                    Swal.fire('Silindi!', 'Kayıt başarıyla silindi.', 'success');
                }
            });
        }
    }

    // --- GÜVENLİ HESAP SİLME (VERİ BÜTÜNLÜĞÜ) ---
    const hesapSilGuvenli = async (hesapId, hesapAdi) => {
        // 1. Bu hesaba ait işlemleri bul
        const bagliIslemler = islemler.filter(i =>
            i.hesapId === hesapId || i.kaynakId === hesapId || i.hedefId === hesapId
        );
        const bagliTaksitler = taksitler.filter(t => t.hesapId === hesapId);
        const bagliAbonelikler = abonelikler.filter(a => a.hesapId === hesapId);

        const toplamKayit = bagliIslemler.length + bagliTaksitler.length + bagliAbonelikler.length;

        if (toplamKayit === 0) {
            // Temiz hesap, direkt sil
            normalSil("hesaplar", hesapId);
            return;
        }

        // 2. Dolu hesap, kullanıcıya sor
        Swal.fire({
            title: 'Dikkat! Veri Kaybı Riski',
            html: `Bu hesabı silerseniz:<br/>
               - <b>${bagliIslemler.length}</b> geçmiş işlem<br/>
               - <b>${bagliTaksitler.length}</b> taksit planı<br/>
               - <b>${bagliAbonelikler.length}</b> abonelik<br/>
               <b>KALICI OLARAK SİLİNECEK!</b><br/><br/>
               Onaylıyor musunuz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, Hepsini Sil!',
            cancelButtonText: 'Vazgeç'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true); // İşlem uzun sürebilir
                try {
                    // Bağlı her şeyi sil
                    const silinecekler = [
                        ...bagliIslemler.map(i => deleteDoc(doc(db, "nakit_islemleri", i.id))),
                        ...bagliTaksitler.map(t => deleteDoc(doc(db, "taksitler", t.id))),
                        ...bagliAbonelikler.map(a => deleteDoc(doc(db, "abonelikler", a.id))),
                        deleteDoc(doc(db, "hesaplar", hesapId)) // Hesabın kendisi
                    ];

                    await Promise.all(silinecekler);
                    setLoading(false);
                    Swal.fire('Temizlendi', 'Hesap ve tüm geçmişi silindi.', 'success');
                } catch (error) {
                    setLoading(false);
                    toast.error("Silme sırasında hata oluştu.");
                    console.error(error);
                }
            }
        });
    }

    const normalSil = async (koleksiyon, id) => {
        Swal.fire({
            title: 'Emin misin?',
            text: "Bu kayıt kalıcı olarak silinecek.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, Sil'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteDoc(doc(db, koleksiyon, id));
                toast.info("Kayıt silindi.");
            }
        });
    }

    const islemEkle = async (e) => { e.preventDefault(); if (!secilenHesapId || !islemTutar) return toast.warning("Tutar ve hesap seçmelisiniz"); const tutar = parseFloat(islemTutar); const tarih = islemTarihi ? new Date(islemTarihi) : new Date(); const secilenKategori = kategori || kategoriListesi[0]; const secilenKisi = harcayanKisi || aileUyeleri[0] || "Bilinmiyor"; await addDoc(collection(db, "nakit_islemleri"), { aileKodu, hesapId: secilenHesapId, islemTipi, kategori: secilenKategori, tutar, aciklama: islemAciklama, tarih, harcayan: secilenKisi }); await updateDoc(doc(db, "hesaplar", secilenHesapId), { guncelBakiye: increment(islemTipi === 'gelir' ? tutar : -tutar) }); toast.success("İşlem kaydedildi!"); setIslemTutar(""); setIslemAciklama(""); setIslemTarihi(""); }
    const taksitEkle = async (e) => { e.preventDefault(); if (!taksitHesapId || !taksitToplamTutar || !taksitSayisi) return toast.warning("Eksik bilgi!"); const toplam = parseFloat(taksitToplamTutar); const sayi = parseInt(taksitSayisi); const aylik = toplam / sayi; const secilenTaksitKategori = taksitKategori || kategoriListesi[0]; const secilenTaksitKisi = taksitKisi || aileUyeleri[0]; const tarih = taksitAlisTarihi ? new Date(taksitAlisTarihi) : new Date(); await addDoc(collection(db, "taksitler"), { aileKodu, baslik: taksitBaslik, toplamTutar: toplam, taksitSayisi: sayi, aylikTutar: aylik, odenmisTaksit: 0, hesapId: taksitHesapId, kategori: secilenTaksitKategori, alanKisi: secilenTaksitKisi, olusturmaTarihi: new Date(), alisTarihi: tarih }); toast.success("✅ Taksit planı oluşturuldu!"); setTaksitBaslik(""); setTaksitToplamTutar(""); setTaksitSayisi(""); setTaksitHesapId(""); setTaksitAlisTarihi(""); }

    // TAKSİT ÖDEME (SWEETALERT2 İLE GÜNCELLENDİ - FORMAT DÜZELTİLDİ)
    const taksitOde = async (t) => {
        const result = await Swal.fire({
            title: 'Taksit İşlensin mi?',
            html: `<b>${t.baslik}</b> için bu ayın taksiti işlenecek.<br/><br/><span style="font-size:1.2em; color:#4f46e5; font-weight:bold">${formatCurrencyPlain(t.aylikTutar)}</span>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet, İşle',
            cancelButtonText: 'İptal',
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#d33'
        });

        if (!result.isConfirmed) return;

        const odeyenKisi = t.alanKisi || harcayanKisi || aileUyeleri[0] || "Taksit";
        await addDoc(collection(db, "nakit_islemleri"), { aileKodu, hesapId: t.hesapId, islemTipi: "gider", kategori: t.kategori || "Taksit", tutar: t.aylikTutar, aciklama: `${t.baslik} (${t.odenmisTaksit + 1}/${t.taksitSayisi})`, tarih: new Date(), harcayan: odeyenKisi, taksitId: t.id });
        await updateDoc(doc(db, "hesaplar", t.hesapId), { guncelBakiye: increment(-t.aylikTutar) });

        const yeniSayac = t.odenmisTaksit + 1;
        if (yeniSayac >= t.taksitSayisi) {
            Swal.fire({
                title: 'Tebrikler!',
                text: 'Taksit bitti! Listeden kaldırılsın mı?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Evet, Kaldır',
                cancelButtonText: 'Hayır, Dursun'
            }).then(async (res) => {
                if (res.isConfirmed) {
                    await deleteDoc(doc(db, "taksitler", t.id));
                    toast.success("Taksit tamamlandı ve silindi.");
                } else {
                    await updateDoc(doc(db, "taksitler", t.id), { odenmisTaksit: yeniSayac });
                    toast.success("Taksit tamamlandı.");
                }
            });
        } else {
            await updateDoc(doc(db, "taksitler", t.id), { odenmisTaksit: yeniSayac });
            Swal.fire('İşlendi', 'Taksit başarıyla harcamalara eklendi.', 'success');
        }
    }

    const transferYap = async (e) => { e.preventDefault(); if (!transferKaynakId || !transferHedefId || !transferTutar) return toast.warning("Alanları seçin"); if (transferKaynakId === transferHedefId) return toast.warning("Aynı hesap"); const tutar = parseFloat(transferTutar); const k = hesaplar.find(h => h.id === transferKaynakId); const h = hesaplar.find(h => h.id === transferHedefId); await addDoc(collection(db, "nakit_islemleri"), { aileKodu, islemTipi: "transfer", kategori: "Transfer", tutar: tutar, aciklama: `${k?.hesapAdi} ➝ ${h?.hesapAdi}`, tarih: new Date(), kaynakId: transferKaynakId, hedefId: transferHedefId, harcayan: "Sistem" }); await updateDoc(doc(db, "hesaplar", transferKaynakId), { guncelBakiye: increment(-tutar) }); await updateDoc(doc(db, "hesaplar", transferHedefId), { guncelBakiye: increment(tutar) }); toast.success("✅ Transfer Başarılı!"); setTransferTutar(""); setTransferKaynakId(""); setTransferHedefId(""); }
    const abonelikEkle = async (e) => { e.preventDefault(); if (!aboAd || !aboTutar || !aboHesapId) return toast.warning("Eksik bilgi"); const secilenAboKategori = aboKategori || kategoriListesi[0]; const secilenAboKisi = aboKisi || aileUyeleri[0]; await addDoc(collection(db, "abonelikler"), { uid: user.uid, ad: aboAd, tutar: parseFloat(aboTutar), gun: aboGun, hesapId: aboHesapId, kategori: secilenAboKategori, kisi: secilenAboKisi, aileKodu }); toast.success("Abonelik eklendi"); setAboAd(""); setAboTutar(""); setAboGun(""); setAboHesapId(""); }

    // ABONELİK ÖDE (SWEETALERT2)
    const abonelikOde = async (abonelik) => {
        const result = await Swal.fire({
            title: 'Ödeme Onayı',
            html: `${abonelik.ad} (<b>${formatCurrencyPlain(abonelik.tutar)}</b>) ödensin mi?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet, Öde',
            cancelButtonText: 'İptal'
        });
        if (!result.isConfirmed) return;

        const odeyenKisi = abonelik.kisi || harcayanKisi || aileUyeleri[0] || "Abonelik";
        await addDoc(collection(db, "nakit_islemleri"), { aileKodu, hesapId: abonelik.hesapId, islemTipi: "gider", kategori: abonelik.kategori || "Fatura", tutar: abonelik.tutar, aciklama: abonelik.ad + " (Otomatik)", tarih: new Date(), harcayan: odeyenKisi });
        await updateDoc(doc(db, "hesaplar", abonelik.hesapId), { guncelBakiye: increment(-abonelik.tutar) });
        toast.success("Ödendi!");
    }

    const maasEkle = async (e) => { e.preventDefault(); if (!maasAd || !maasTutar || !maasHesapId) return toast.warning("Eksik bilgi"); await addDoc(collection(db, "maaslar"), { aileKodu, ad: maasAd, tutar: parseFloat(maasTutar), gun: maasGun, hesapId: maasHesapId }); toast.success("Maaş takibi eklendi"); setMaasAd(""); setMaasTutar(""); setMaasGun(""); setMaasHesapId(""); }

    // MAAŞ YATIR (SWEETALERT2)
    const maasYatir = async (maas) => {
        const result = await Swal.fire({
            title: 'Maaş Yatırılsın mı?',
            html: `💰 <b>${maas.ad}</b> tutarı (${formatCurrencyPlain(maas.tutar)}) hesaba işlensin mi?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet, Yatır',
            confirmButtonColor: 'green'
        });

        if (!result.isConfirmed) return;

        await addDoc(collection(db, "nakit_islemleri"), { aileKodu, hesapId: maas.hesapId, islemTipi: "gelir", kategori: "Maaş/Gelir", tutar: maas.tutar, aciklama: `${maas.ad} (Otomatik)`, tarih: new Date(), harcayan: "Gelir" });
        await updateDoc(doc(db, "hesaplar", maas.hesapId), { guncelBakiye: increment(maas.tutar) });
        Swal.fire('Bereketli Olsun!', 'Maaş hesaba geçti.', 'success');
    }

    // --- YENİ FATURA SİSTEMİ FONKSİYONLARI ---
    const faturaTanimEkle = async (e) => {
        e.preventDefault();
        if (!tanimBaslik) return toast.warning("Başlık giriniz (Örn: Ev Elektrik)");
        await addDoc(collection(db, "fatura_tanimlari"), {
            aileKodu,
            baslik: tanimBaslik,
            kurum: tanimKurum,
            aboneNo: tanimAboneNo
        });
        toast.success("✅ Fatura/Abone Tanımlandı!");
        setTanimBaslik(""); setTanimKurum(""); setTanimAboneNo("");
    }

    const faturaTanimDuzenle = async (e) => {
        e.preventDefault();
        await updateDoc(doc(db, "fatura_tanimlari", seciliVeri.id), {
            baslik: tanimBaslik,
            kurum: tanimKurum,
            aboneNo: tanimAboneNo
        });
        setAktifModal(null);
        setTanimBaslik(""); setTanimKurum(""); setTanimAboneNo("");
        toast.success("Tanım güncellendi");
    }

    const faturaGir = async (e) => {
        e.preventDefault();
        if (!secilenTanimId || !faturaGirisTutar || !faturaGirisTarih) return toast.warning("Tüm alanları doldurunuz.");

        await addDoc(collection(db, "bekleyen_faturalar"), {
            aileKodu,
            tanimId: secilenTanimId,
            tutar: parseFloat(faturaGirisTutar),
            sonOdemeTarihi: faturaGirisTarih,
            aciklama: faturaGirisAciklama,
            eklenmeTarihi: new Date()
        });

        toast.success("Fatura takibe alındı!");
        setFaturaGirisTutar(""); setFaturaGirisTarih(""); setFaturaGirisAciklama("");
    }

    const faturaOde = async (fatura, hesapId) => {
        if (!hesapId) return;
        const tanim = tanimliFaturalar.find(t => t.id === fatura.tanimId);
        const ad = tanim ? tanim.baslik : "Fatura";

        const result = await Swal.fire({
            title: 'Fatura Ödensin mi?',
            html: `${ad} (<b>${formatCurrencyPlain(fatura.tutar)}</b>) ödendi olarak işlenecek.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet, Öde',
            cancelButtonText: 'İptal'
        });

        if (!result.isConfirmed) return;

        await addDoc(collection(db, "nakit_islemleri"), {
            aileKodu,
            hesapId: hesapId,
            islemTipi: "gider",
            kategori: "Fatura",
            tutar: fatura.tutar,
            aciklama: `${ad} Ödeme (${fatura.aciklama || ''})`,
            tarih: new Date(),
            harcayan: "Sistem"
        });

        await updateDoc(doc(db, "hesaplar", hesapId), { guncelBakiye: increment(-fatura.tutar) });
        await deleteDoc(doc(db, "bekleyen_faturalar", fatura.id));

        toast.success("Fatura ödendi ve arşivlendi.");
        setAktifModal(null);
    }

    // --- Bekleyen Faturayı Düzenleme Fonksiyonu ---
    const bekleyenFaturaDuzenle = async (e) => {
        e.preventDefault();
        await updateDoc(doc(db, "bekleyen_faturalar", seciliVeri.id), {
            tutar: parseFloat(faturaGirisTutar),
            sonOdemeTarihi: faturaGirisTarih,
            aciklama: faturaGirisAciklama
        });
        setAktifModal(null);
        setFaturaGirisTutar(""); setFaturaGirisTarih(""); setFaturaGirisAciklama("");
        toast.success("Fatura güncellendi");
    }

    const krediKartiBorcOde = async (e) => { e.preventDefault(); if (!kkOdemeKartId || !kkOdemeKaynakId || !kkOdemeTutar) return toast.warning("Eksik bilgi"); const tutar = parseFloat(kkOdemeTutar); const kart = hesaplar.find(h => h.id === kkOdemeKartId); const kaynak = hesaplar.find(h => h.id === kkOdemeKaynakId); await addDoc(collection(db, "nakit_islemleri"), { aileKodu, islemTipi: "transfer", kategori: "Kredi Kartı Ödemesi", tutar: tutar, aciklama: `${kaynak.hesapAdi} ➝ ${kart.hesapAdi} Borç Ödeme`, tarih: new Date(), kaynakId: kkOdemeKaynakId, hedefId: kkOdemeKartId, harcayan: "Sistem" }); await updateDoc(doc(db, "hesaplar", kkOdemeKaynakId), { guncelBakiye: increment(-tutar) }); await updateDoc(doc(db, "hesaplar", kkOdemeKartId), { guncelBakiye: increment(tutar) }); toast.success("✅ Kredi kartı ödemesi yapıldı!"); setAktifModal(null); setKkOdemeTutar(""); setKkOdemeKaynakId(""); setKkOdemeKartId(""); }
    const excelIndir = () => { const veri = islemler.map(i => ({ Tarih: new Date(i.tarih.seconds * 1000).toLocaleDateString(), Kisi: i.harcayan, IslemTipi: i.islemTipi, Kategori: i.kategori, Aciklama: i.aciklama, Tutar: i.tutar, })); const ws = XLSX.utils.json_to_sheet(veri); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Islemler"); XLSX.writeFile(wb, "Aile_Butcesi.xlsx"); }
    const excelYukle = (e) => { const dosya = e.target.files[0]; if (!dosya) return; const reader = new FileReader(); reader.onload = (evt) => { const bstr = evt.target.result; const wb = XLSX.read(bstr, { type: 'binary' }); const wsname = wb.SheetNames[0]; const ws = wb.Sheets[wsname]; const data = XLSX.utils.sheet_to_json(ws); if (!secilenHesapId) return toast.warning("Hesap seçin!"); let sayac = 0; data.forEach(async (row) => { if (row.Tutar) { await addDoc(collection(db, "nakit_islemleri"), { aileKodu, tarih: new Date(), kategori: row.Kategori || "Genel", aciklama: row.Aciklama || "Excel", tutar: parseFloat(row.Tutar), islemTipi: "gider", hesapId: secilenHesapId, harcayan: "Excel" }); await updateDoc(doc(db, "hesaplar", secilenHesapId), { guncelBakiye: increment(-parseFloat(row.Tutar)) }); sayac++; } }); toast.success(`${sayac} işlem eklendi!`); }; reader.readAsBinaryString(dosya); }

    const modalAc = (tip, veri) => {
        setSeciliVeri(veri); setAktifModal(tip);
        if (tip === 'duzenle_hesap') { setHesapAdi(veri.hesapAdi); setBaslangicBakiye(veri.guncelBakiye); setHesapKesimGunu(veri.kesimGunu || ""); }
        if (tip === 'duzenle_islem') { setIslemAciklama(veri.aciklama); setIslemTutar(veri.tutar); setKategori(veri.kategori); setHarcayanKisi(veri.harcayan || aileUyeleri[0]); if (veri.tarih) { const date = new Date(veri.tarih.seconds * 1000); const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16); setIslemTarihi(isoString); } }
        if (tip === 'duzenle_abonelik') { setAboAd(veri.ad); setAboTutar(veri.tutar); setAboGun(veri.gun); setAboHesapId(veri.hesapId); setAboKategori(veri.kategori || kategoriListesi[0]); setAboKisi(veri.kisi || aileUyeleri[0]); }
        if (tip === 'duzenle_taksit') { setTaksitBaslik(veri.baslik); setTaksitToplamTutar(veri.toplamTutar); setTaksitSayisi(veri.taksitSayisi); setTaksitHesapId(veri.hesapId); setTaksitKategori(veri.kategori); setTaksitKisi(veri.alanKisi); if (veri.alisTarihi) { const d = new Date(veri.alisTarihi.seconds * 1000); setTaksitAlisTarihi(d.toISOString().split('T')[0]); } }
        if (tip === 'duzenle_maas') { setMaasAd(veri.ad); setMaasTutar(veri.tutar); setMaasGun(veri.gun); setMaasHesapId(veri.hesapId); }
        if (tip === 'kredi_karti_ode') { setKkOdemeKartId(veri.id); }
        if (tip === 'duzenle_fatura_tanim') { setTanimBaslik(veri.baslik); setTanimKurum(veri.kurum); setTanimAboneNo(veri.aboneNo); }
        if (tip === 'duzenle_bekleyen_fatura') { setFaturaGirisTutar(veri.tutar); setFaturaGirisTarih(veri.sonOdemeTarihi); setFaturaGirisAciklama(veri.aciklama || ""); }
    }

    const hesapDuzenle = async (e) => { e.preventDefault(); await updateDoc(doc(db, "hesaplar", seciliVeri.id), { hesapAdi, guncelBakiye: parseFloat(baslangicBakiye), kesimGunu: hesapKesimGunu }); setAktifModal(null); toast.success("Hesap güncellendi"); }
    const islemDuzenle = async (e) => { e.preventDefault(); const guncelTarih = islemTarihi ? new Date(islemTarihi) : new Date(); await updateDoc(doc(db, "nakit_islemleri", seciliVeri.id), { aciklama: islemAciklama, tutar: parseFloat(islemTutar), kategori, harcayan: harcayanKisi, tarih: guncelTarih }); setAktifModal(null); toast.success("İşlem güncellendi"); }
    const abonelikDuzenle = async (e) => { e.preventDefault(); await updateDoc(doc(db, "abonelikler", seciliVeri.id), { ad: aboAd, tutar: parseFloat(aboTutar), gun: aboGun, hesapId: aboHesapId, kategori: aboKategori, kisi: aboKisi }); setAktifModal(null); setAboAd(""); setAboTutar(""); setAboGun(""); setAboHesapId(""); toast.success("Abonelik güncellendi"); }
    const taksitDuzenle = async (e) => { e.preventDefault(); const toplam = parseFloat(taksitToplamTutar); const sayi = parseInt(taksitSayisi); const aylik = toplam / sayi; const tarih = taksitAlisTarihi ? new Date(taksitAlisTarihi) : new Date(); await updateDoc(doc(db, "taksitler", seciliVeri.id), { baslik: taksitBaslik, toplamTutar: toplam, taksitSayisi: sayi, aylikTutar: aylik, hesapId: taksitHesapId, kategori: taksitKategori, alanKisi: taksitKisi, alisTarihi: tarih }); setAktifModal(null); setTaksitBaslik(""); setTaksitToplamTutar(""); setTaksitSayisi(""); setTaksitHesapId(""); setTaksitAlisTarihi(""); toast.success("Taksit güncellendi"); }
    const maasDuzenle = async (e) => { e.preventDefault(); await updateDoc(doc(db, "maaslar", seciliVeri.id), { ad: maasAd, tutar: parseFloat(maasTutar), gun: maasGun, hesapId: maasHesapId }); setAktifModal(null); setMaasAd(""); setMaasTutar(""); setMaasGun(""); setMaasHesapId(""); toast.success("Maaş güncellendi"); }

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Yükleniyor...</div>;
    if (!user) return (<div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)', color: 'white', fontFamily: 'Segoe UI' }}> <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🏡 AİLE BÜTÇEM</h1> <p style={{ marginBottom: '40px' }}>Evin ekonomisi kontrol altında.</p> <button onClick={girisYap} style={{ padding: '15px 40px', fontSize: '1.1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', background: 'white', color: '#1a2980', fontWeight: 'bold' }}>Google ile Giriş Yap</button> <ToastContainer position="top-right" autoClose={3000} /> </div>);
    if (!aileKodu) return (<div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7fafc', fontFamily: 'Segoe UI' }}> <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🔑 Aile Girişi</h2> <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center' }}> <p style={{ fontSize: '14px', color: '#718096', marginBottom: '20px' }}>Tüm aile bireyleri aynı verileri görmek için aynı kodu girmelidir.</p> <form onSubmit={aileKoduKaydet}> <input placeholder="Aile Kodu (Örn: YILMAZLAR)" value={girilenKod} onChange={e => setGirilenKod(e.target.value.toUpperCase())} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', marginBottom: '15px', textAlign: 'center', fontSize: '16px', letterSpacing: '2px' }} required /> <button type="submit" style={{ width: '100%', padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>GİRİŞ YAP</button> </form> </div> <ToastContainer position="top-right" autoClose={3000} /> </div>);

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI', width: '100vw', boxSizing: 'border-box', background: '#f7f9fc', minHeight: '100vh', color: '#333', overflowX: 'hidden' }}>
            <ToastContainer position="top-right" autoClose={2000} theme="light" />

            {/* MODALLAR */}
            {aktifModal && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
                <div style={{ background: 'white', padding: '25px', borderRadius: '15px', width: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                    {/* MEVCUT DÜZENLEME MODALLARI */}
                    {aktifModal === 'duzenle_hesap' && <form onSubmit={hesapDuzenle}><h3>Düzenle</h3><input value={hesapAdi} onChange={e => setHesapAdi(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><input type="number" value={baslangicBakiye} onChange={e => setBaslangicBakiye(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />{seciliVeri.hesapTipi === 'krediKarti' && <input type="number" placeholder="Kesim Günü (1-31)" value={hesapKesimGunu} onChange={e => setHesapKesimGunu(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd' }} />}<button type="submit" style={{ width: '100%', background: 'blue', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>Kaydet</button><button type="button" onClick={() => setAktifModal(null)} style={{ width: '100%', marginTop: '10px', background: '#eee', padding: '10px', borderRadius: '5px' }}>İptal</button></form>}
                    {aktifModal === 'duzenle_islem' && <form onSubmit={islemDuzenle}><h3>Düzenle</h3><input value={islemAciklama} onChange={e => setIslemAciklama(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} /><input type="number" value={islemTutar} onChange={e => setIslemTutar(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} /><input type="datetime-local" value={islemTarihi} onChange={e => setIslemTarihi(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><select value={harcayanKisi} onChange={e => setHarcayanKisi(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select><select value={kategori} onChange={e => setKategori(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select><button type="submit" style={{ width: '100%', background: 'blue', color: 'white', padding: '10px', borderRadius: '5px', border: 'none' }}>Kaydet</button><button type="button" onClick={() => setAktifModal(null)} style={{ width: '100%', marginTop: '10px', background: '#eee', padding: '10px', borderRadius: '5px' }}>İptal</button></form>}
                    {aktifModal === 'duzenle_abonelik' && <form onSubmit={abonelikDuzenle}><h3>Sabit Gider Düzenle</h3><input value={aboAd} onChange={e => setAboAd(e.target.value)} placeholder="Gider Adı" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><input type="number" value={aboTutar} onChange={e => setAboTutar(e.target.value)} placeholder="Tutar" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><input type="number" value={aboGun} onChange={e => setAboGun(e.target.value)} placeholder="Gün (1-31)" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><select value={aboKategori} onChange={e => setAboKategori(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select><select value={aboKisi} onChange={e => setAboKisi(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select><select value={aboHesapId} onChange={e => setAboHesapId(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd' }}><option value="">Hangi Hesaptan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select><button type="submit" style={{ width: '100%', background: 'blue', color: 'white', padding: '10px', borderRadius: '5px', border: 'none' }}>Kaydet</button><button type="button" onClick={() => setAktifModal(null)} style={{ width: '100%', marginTop: '10px', background: '#eee', padding: '10px', borderRadius: '5px' }}>İptal</button></form>}
                    {aktifModal === 'duzenle_taksit' && <form onSubmit={taksitDuzenle}><h3>Taksit Planını Düzenle</h3><input value={taksitBaslik} onChange={e => setTaksitBaslik(e.target.value)} placeholder="Ne aldın?" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><input type="number" value={taksitToplamTutar} onChange={e => setTaksitToplamTutar(e.target.value)} placeholder="Toplam Borç" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><input type="number" value={taksitSayisi} onChange={e => setTaksitSayisi(e.target.value)} placeholder="Taksit Sayısı" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><select value={taksitKategori} onChange={e => setTaksitKategori(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select><select value={taksitKisi} onChange={e => setTaksitKisi(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select><select value={taksitHesapId} onChange={e => setTaksitHesapId(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }}><option value="">Hangi Karttan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select><label style={{ fontSize: '12px' }}>Alış Tarihi:</label><input type="date" value={taksitAlisTarihi} onChange={e => setTaksitAlisTarihi(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd' }} /><div style={{ marginBottom: '15px', fontSize: '13px', color: 'blue' }}>Yeni Aylık Tutar: {taksitToplamTutar && taksitSayisi ? formatPara(taksitToplamTutar / taksitSayisi) : '0 ₺'}</div><button type="submit" style={{ width: '100%', background: 'blue', color: 'white', padding: '10px', borderRadius: '5px', border: 'none' }}>Kaydet</button><button type="button" onClick={() => setAktifModal(null)} style={{ width: '100%', marginTop: '10px', background: '#eee', padding: '10px', borderRadius: '5px' }}>İptal</button></form>}
                    {aktifModal === 'duzenle_maas' && <form onSubmit={maasDuzenle}><h3>Maaş Düzenle</h3><input value={maasAd} onChange={e => setMaasAd(e.target.value)} placeholder="Maaş Adı (Örn: Baba Maaş)" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><input type="number" value={maasTutar} onChange={e => setMaasTutar(e.target.value)} placeholder="Tutar" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><input type="number" value={maasGun} onChange={e => setMaasGun(e.target.value)} placeholder="Yatma Günü (1-31)" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><select value={maasHesapId} onChange={e => setMaasHesapId(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd' }}><option value="">Hangi Hesaba?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select><button type="submit" style={{ width: '100%', background: 'blue', color: 'white', padding: '10px', borderRadius: '5px', border: 'none' }}>Kaydet</button><button type="button" onClick={() => setAktifModal(null)} style={{ width: '100%', marginTop: '10px', background: '#eee', padding: '10px', borderRadius: '5px' }}>İptal</button></form>}
                    {aktifModal === 'duzenle_fatura_tanim' && <form onSubmit={faturaTanimDuzenle}><h3>Fatura Tanımı Düzenle</h3><input value={tanimBaslik} onChange={e => setTanimBaslik(e.target.value)} placeholder="Başlık" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><input value={tanimKurum} onChange={e => setTanimKurum(e.target.value)} placeholder="Kurum" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} /><input value={tanimAboneNo} onChange={e => setTanimAboneNo(e.target.value)} placeholder="Abone No" style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd' }} /><button type="submit" style={{ width: '100%', background: 'blue', color: 'white', padding: '10px', borderRadius: '5px', border: 'none' }}>Kaydet</button><button type="button" onClick={() => setAktifModal(null)} style={{ width: '100%', marginTop: '10px', background: '#eee', padding: '10px', borderRadius: '5px' }}>İptal</button></form>}
                    {aktifModal === 'kredi_karti_ode' && <form onSubmit={krediKartiBorcOde}><h3>💳 Kredi Kartı Borcu Öde</h3>{(() => { const kart = hesaplar.find(h => h.id === kkOdemeKartId); const borc = Math.abs(kart?.guncelBakiye || 0); const asgari = borc * 0.20; return (<div style={{ marginBottom: '20px', padding: '10px', background: '#f3e8ff', borderRadius: '8px' }}> <p style={{ margin: 0 }}><strong>Kart:</strong> {kart?.hesapAdi}</p> <p style={{ margin: '5px 0' }}><strong>Güncel Borç:</strong> {formatPara(borc)}</p> <p style={{ margin: 0, color: '#6b46c1' }}><strong>Asgari (%20):</strong> {formatPara(asgari)}</p> </div>) })()} <select value={kkOdemeKaynakId} onChange={e => setKkOdemeKaynakId(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} required><option value="">Parayı Hangi Hesaptan Çekelim?</option>{hesaplar.filter(h => h.id !== kkOdemeKartId).map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({formatPara(h.guncelBakiye)})</option>)}</select> <input type="number" placeholder="Ödenecek Tutar (₺)" value={kkOdemeTutar} onChange={e => setKkOdemeTutar(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd' }} required /> <button type="submit" style={{ width: '100%', background: '#805ad5', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', fontWeight: 'bold' }}>ÖDEMEYİ YAP</button> <button type="button" onClick={() => setAktifModal(null)} style={{ width: '100%', marginTop: '10px', background: '#eee', padding: '10px', borderRadius: '5px' }}>İptal</button> </form>}

                    {/* FATURA ÖDEME MODALI */}
                    {aktifModal === 'fatura_ode' && <div style={{ textAlign: 'center' }}>
                        {(() => {
                            const tanim = tanimliFaturalar.find(t => t.id === seciliVeri.tanimId);
                            const ad = tanim ? tanim.baslik : "Fatura";
                            return (
                                <>
                                    <h3>🧾 Fatura Öde</h3>
                                    <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{ad}</p>
                                    <p style={{ color: '#c53030', fontSize: '20px', fontWeight: 'bold' }}>{formatPara(seciliVeri.tutar)}</p>
                                    <p style={{ fontSize: '13px', color: '#777' }}>Son Ödeme: {tarihSadeceGunAyYil(seciliVeri.sonOdemeTarihi)}</p>
                                </>
                            )
                        })()}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                            {hesaplar.map(h => (
                                <button key={h.id} onClick={() => faturaOde(seciliVeri, h.id)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{h.hesapAdi}</span>
                                    <span style={{ fontWeight: 'bold' }}>{formatPara(h.guncelBakiye)}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setAktifModal(null)} style={{ marginTop: '15px', padding: '10px', width: '100%', border: 'none', background: '#eee', borderRadius: '5px' }}>İptal</button>
                    </div>}

                    {/* BEKLEYEN FATURA DÜZENLEME MODALI */}
                    {aktifModal === 'duzenle_bekleyen_fatura' && <form onSubmit={bekleyenFaturaDuzenle}>
                        <h3>Faturayı Düzenle</h3>
                        <input type="number" value={faturaGirisTutar} onChange={e => setFaturaGirisTutar(e.target.value)} placeholder="Tutar" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} />
                        <input type="date" value={faturaGirisTarih} onChange={e => setFaturaGirisTarih(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} />
                        <input value={faturaGirisAciklama} onChange={e => setFaturaGirisAciklama(e.target.value)} placeholder="Açıklama" style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd' }} />
                        <button type="submit" style={{ width: '100%', background: 'blue', color: 'white', padding: '10px', borderRadius: '5px', border: 'none' }}>Kaydet</button>
                        <button type="button" onClick={() => setAktifModal(null)} style={{ width: '100%', marginTop: '10px', background: '#eee', padding: '10px', borderRadius: '5px' }}>İptal</button>
                    </form>}

                    {aktifModal === 'ayarlar_yonetim' && <div><h3>⚙️ Ayarlar</h3><hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} /><h4>👨‍👩‍👧‍👦 Aile Bireyleri</h4><ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{aileUyeleri.map(k => (<li key={k} style={{ background: '#edf2f7', padding: '5px 10px', borderRadius: '15px', fontSize: '13px' }}>{k} <span onClick={() => { if (window.confirm("Silinsin mi?")) { const y = aileUyeleri.filter(x => x !== k); setAileUyeleri(y); setDoc(doc(db, "ayarlar", aileKodu), { aileUyeleri: y }, { merge: true }); } }} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>X</span></li>))}</ul><form onSubmit={(e) => { e.preventDefault(); if (!yeniKisiAdi) return; const y = [...aileUyeleri, yeniKisiAdi]; setAileUyeleri(y); setDoc(doc(db, "ayarlar", aileKodu), { aileUyeleri: y }, { merge: true }); setYeniKisiAdi(""); toast.success("Kişi eklendi"); }} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}><input value={yeniKisiAdi} onChange={e => setYeniKisiAdi(e.target.value)} placeholder="Yeni Kişi Adı" style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }} /><button type="submit" style={{ background: '4299e1', color: 'white', border: 'none', padding: '8px', borderRadius: '5px' }}>Ekle</button></form><hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} /><h4>📂 Kategoriler</h4><ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{kategoriListesi.map(k => (<li key={k} style={{ background: '#f0fff4', padding: '5px 10px', borderRadius: '15px', fontSize: '13px' }}>{k} <span onClick={() => { if (window.confirm("Silinsin mi?")) { const y = kategoriListesi.filter(x => x !== k); setKategoriListesi(y); setDoc(doc(db, "ayarlar", aileKodu), { kategoriler: y }, { merge: true }); } }} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>X</span></li>))}</ul><form onSubmit={(e) => { e.preventDefault(); if (!yeniKategoriAdi) return; const y = [...kategoriListesi, yeniKategoriAdi]; setKategoriListesi(y); setDoc(doc(db, "ayarlar", aileKodu), { kategoriler: y }, { merge: true }); setYeniKategoriAdi(""); toast.success("Kategori eklendi"); }} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}><input value={yeniKategoriAdi} onChange={e => setYeniKategoriAdi(e.target.value)} placeholder="Yeni Kategori" style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }} /><button type="submit" style={{ background: 'green', color: 'white', border: 'none', padding: '8px', borderRadius: '5px' }}>Ekle</button></form><div style={{ marginTop: '30px', padding: '15px', background: '#fffaf0', border: '1px solid #fbd38d', borderRadius: '8px' }}><h4 style={{ margin: '0 0 10px 0', color: '#c05621' }}>🚚 Aile Kodunu Değiştir / Verileri Taşı</h4><p style={{ fontSize: '12px', color: '#7b341e' }}>Mevcut kodunuz: <b>{aileKodu}</b>. Verilerinizi yeni bir koda taşımak için yeni kodu yazın.</p><form onSubmit={verileriTasi} style={{ display: 'flex', gap: '5px' }}><input value={yeniAileKoduInput} onChange={e => setYeniAileKoduInput(e.target.value.toUpperCase())} placeholder="YENİ KOD" style={{ flex: 1, padding: '8px', border: '1px solid #fbd38d', borderRadius: '5px' }} /><button type="submit" disabled={tasimaIslemiSuruyor} style={{ background: '#c05621', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>{tasimaIslemiSuruyor ? 'Taşınıyor...' : 'TAŞI'}</button></form></div><button onClick={() => setAktifModal(null)} style={{ width: '100%', marginTop: '20px', padding: '10px', border: 'none', background: '#eee', borderRadius: '5px' }}>Kapat</button></div>}
                </div>
            </div>)}

            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#1a202c', letterSpacing: '-1px' }}>🏡 AİLE BÜTÇESİ</h1>
                    <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '5px', color: '#4a5568' }}>Kod: {aileKodu}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', marginRight: '5px' }}>Hoşgeldin, {user?.displayName?.split(' ')[0]}</span>
                    <button onClick={() => setAktifModal('ayarlar_yonetim')} style={{ background: '#e2e8f0', color: '#4a5568', border: 'none', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>⚙️ Ayarlar</button>
                    <button onClick={aileKoduCikis} style={{ background: '#e2e8f0', color: '#4a5568', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Kod Değiş</button>
                    <button onClick={cikisYap} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Çıkış</button>
                </div>
            </div>

            {/* BİLDİRİM ALANI (SADECE ACİL OLANLAR) */}
            {bildirimler.length > 0 && (
                <div style={{ marginBottom: '30px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '10px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ margin: 0, color: '#c53030', display: 'flex', alignItems: 'center', gap: '5px' }}>⚠️ Acil Durumlar</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                        {bildirimler.map((b, i) => (
                            <div key={i} style={{ background: 'white', padding: '10px', borderRadius: '8px', borderLeft: `4px solid ${b.renk === 'green' ? '#48bb78' : b.renk === 'orange' ? '#ed8936' : '#fc8181'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>{b.mesaj}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontWeight: 'bold', color: b.renk === 'green' ? '#48bb78' : b.renk === 'orange' ? '#ed8936' : '#e53e3e' }}>{formatPara(b.tutar)}</span>
                                    {b.tip !== 'kk_hatirlatma' && <button onClick={() => {
                                        if (b.tip === 'abonelik') abonelikOde(b.data);
                                        if (b.tip === 'taksit') taksitOde(b.data);
                                        if (b.tip === 'maas') maasYatir(b.data);
                                        if (b.tip === 'fatura') modalAc('fatura_ode', b.data);
                                    }} style={{ background: b.renk === 'green' ? '#48bb78' : '#c53030', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>{b.tip === 'maas' ? 'Yatır' : 'Öde'}</button>}
                                    {b.tip === 'kk_hatirlatma' && <button onClick={() => modalAc('kredi_karti_ode', b.data)} style={{ background: '#ed8936', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>Öde</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ÜST KARTLAR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #48bb78' }}>
                    <h3 style={{ margin: 0, color: '#888', fontSize: '11px', letterSpacing: '1px' }}>TOPLAM GELİR ({aktifAy})</h3>
                    <h1 style={{ fontSize: '26px', margin: '10px 0', color: '#333' }}>{formatPara(toplamGelir)}</h1>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #F59E0B' }}>
                    <span style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>BUGÜN HARCANAN</span>
                    <h2 style={{ color: '#333', margin: '10px 0', fontSize: '26px' }}>{formatPara(bugunGider)}</h2>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #f56565' }}>
                    <span style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>GİDER ({aktifAy})</span>
                    <h2 style={{ color: '#333', margin: '10px 0', fontSize: '24px' }}>{formatPara(toplamGider)}</h2>
                </div>
            </div>

            {/* YENİ SATIR: AİLE BİREYLERİ HARCAMALARI */}
            <div style={{ marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#4a5568' }}>👨‍👩‍👧‍👦 Kişi Bazlı Harcamalar ({aktifAy})</h4>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`, gap: '20px' }}>
                    {aileUyeleri.map(uye => {
                        const uyeTutar = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider' && i.harcayan === uye).reduce((acc, i) => acc + i.tutar, 0);
                        return (
                            <div key={uye} style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', borderLeft: '4px solid #805ad5' }}>
                                <span style={{ color: '#718096', fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{uye}</span>
                                <h3 style={{ margin: '5px 0 0 0', color: '#2d3748', fontSize: '20px' }}>{formatPara(uyeTutar)}</h3>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ORTA BÖLÜM: GRAFİKLER */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', minHeight: '300px' }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>📅 Günlük Harcama Trendi ({aktifAy})</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={gunlukVeri}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(val) => `${val} ₺`} />
                            <Bar dataKey="value" fill="#8884d8" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    {aktifAy !== "Tümü" && (
                        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#718096', fontStyle: 'italic' }}>
                            ✨ Bu ay günlük ortalama harcamanız: <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{formatPara(gunlukOrtalama)}</span>
                        </div>
                    )}
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h4 style={{ color: '#2d3748', marginBottom: '10px' }}>Kategori Dağılımı ({aktifAy})</h4>
                    <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={kategoriVerisi} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name }) => name}>{kategoriVerisi.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value) => formatPara(value)} /><Legend /></PieChart></ResponsiveContainer>
                </div>
            </div>

            {/* ALT BÖLÜM: (1fr 2fr) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>

                {/* SOL SÜTUN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {/* LİMİT KARTI */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: 0, color: '#2d3748' }}>🎯 Aylık Bütçe Limiti</h4>
                            <input type="number" value={aylikLimit} onChange={(e) => { setAylikLimit(e.target.value); setDoc(doc(db, "ayarlar", aileKodu), { limit: e.target.value }, { merge: true }); }} style={{ width: '70px', border: '1px solid #ddd', borderRadius: '5px', padding: '2px', fontSize: '12px' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}><span style={{ color: limitRenk }}>Harcanan: {formatPara(harcananLimit)}</span><span>{limitYuzdesi.toFixed(0)}%</span></div>
                            <div style={{ width: '100%', height: '15px', background: '#edf2f7', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}><div style={{ width: `${limitYuzdesi}%`, height: '100%', background: limitRenk, transition: 'width 0.5s', borderRadius: '10px' }}></div></div>
                            <p style={{ fontSize: '10px', color: '#718096', marginTop: '5px', textAlign: 'right' }}>*Kira ve Aidat dahil edilmemiştir.</p>
                        </div>
                    </div>

                    {/* FATURALAR KARTI (SOL TARAF) */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#2d3748' }}>🧾 Faturalar</h4>
                        <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '15px' }}>
                            {tanimliFaturalar.length === 0 && <p style={{ fontSize: '12px', color: '#aaa' }}>Henüz fatura tanımı yok. Aşağıdan ekleyin.</p>}
                            {tanimliFaturalar.map(tanim => {
                                // Bu tanıma ait bekleyen bir fatura var mı?
                                const bekleyen = bekleyenFaturalar.find(f => f.tanimId === tanim.id);
                                return (
                                    <div key={tanim.id} style={{ marginBottom: '10px', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ padding: '10px', background: '#f7fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#2d3748' }}>{tanim.baslik}</div>
                                                <div style={{ fontSize: '11px', color: '#718096' }}>{tanim.kurum} • {tanim.aboneNo}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <span onClick={() => modalAc('duzenle_fatura_tanim', tanim)} style={{ cursor: 'pointer', fontSize: '14px' }}>✏️</span>
                                                <span onClick={() => normalSil("fatura_tanimlari", tanim.id)} style={{ cursor: 'pointer', fontSize: '14px', color: '#e53e3e' }}>🗑️</span>
                                            </div>
                                        </div>
                                        {bekleyen ? (
                                            <div style={{ padding: '10px', background: '#fff5f5', borderTop: '1px solid #feb2b2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: '#c53030' }}>{formatPara(bekleyen.tutar)}</div>
                                                    <div style={{ fontSize: '11px', color: '#c53030' }}>Son: {tarihSadeceGunAyYil(bekleyen.sonOdemeTarihi)}</div>
                                                    {bekleyen.aciklama && <div style={{ fontSize: '10px', color: '#718096' }}>{bekleyen.aciklama}</div>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span onClick={() => modalAc('duzenle_bekleyen_fatura', bekleyen)} style={{ cursor: 'pointer', fontSize: '14px' }}>✏️</span>
                                                    <span onClick={() => normalSil("bekleyen_faturalar", bekleyen.id)} style={{ cursor: 'pointer', fontSize: '14px', color: '#c53030' }}>🗑️</span>
                                                    <button onClick={() => modalAc('fatura_ode', bekleyen)} style={{ background: '#c53030', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>ÖDE</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '8px', fontSize: '11px', color: '#a0aec0', textAlign: 'center', fontStyle: 'italic' }}>
                                                Bekleyen fatura yok
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* YENİ ABONE EKLEME */}
                        <form onSubmit={faturaTanimEkle} style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <p style={{ fontSize: '11px', color: '#718096', marginBottom: '5px' }}>Yeni Abone/Fatura Tanımı Ekle:</p>
                            <input placeholder="Başlık (Örn: Yazlık Elektrik)" value={tanimBaslik} onChange={e => setTanimBaslik(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '5px', border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box' }} required />
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input placeholder="Kurum" value={tanimKurum} onChange={e => setTanimKurum(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                                <input placeholder="Abone No" value={tanimAboneNo} onChange={e => setTanimAboneNo(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', marginTop: '5px', background: '#4a5568', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>Tanımla</button>
                        </form>
                    </div>

                    {/* MAAŞLAR */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#2d3748' }}>💰 Maaşlar & Düzenli Gelirler</h4>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '15px' }}>
                            {maaslar.map(m => {
                                const hesap = hesaplar.find(h => h.id === m.hesapId);
                                return (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{m.ad}</div>
                                            <div style={{ fontSize: '11px', color: '#999' }}>Her ayın {m.gun}. günü • {hesap?.hesapAdi}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ color: 'green', fontWeight: 'bold' }}>{formatPara(m.tutar)}</span>
                                            <span onClick={() => modalAc('duzenle_maas', m)} style={{ cursor: 'pointer', fontSize: '12px', marginLeft: '5px' }}>✏️</span>
                                            <span onClick={() => normalSil("maaslar", m.id)} style={{ cursor: 'pointer', color: 'red', fontSize: '12px' }}>🗑️</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <form onSubmit={maasEkle} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input placeholder="Ad (Örn: Baba Maaş)" value={maasAd} onChange={e => setMaasAd(e.target.value)} style={{ flex: 2, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                                <input placeholder="Tutar" type="number" value={maasTutar} onChange={e => setMaasTutar(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input placeholder="Gün" type="number" value={maasGun} onChange={e => setMaasGun(e.target.value)} style={{ width: '60px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                                <select value={maasHesapId} onChange={e => setMaasHesapId(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}><option value="">Hesap Seç</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                                <button type="submit" style={{ background: '#48bb78', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '0 10px', fontWeight: 'bold' }}>+</button>
                            </div>
                        </form>
                    </div>

                    {/* HESAPLAR */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#2d3748' }}>💳 Cüzdanlar & Kartlar {aktifAy !== "Tümü" && <span style={{ fontSize: '12px', color: '#e53e3e' }}>(Bu Ayki Değişim)</span>}</h4>
                        <div style={{ marginBottom: '15px' }}>
                            {hesaplar.map(h => {
                                let gosterilenBakiye = h.guncelBakiye;
                                if (aktifAy !== "Tümü") {
                                    let aylikFark = 0;
                                    filtrelenmisIslemler.forEach(i => {
                                        if (i.hesapId === h.id) {
                                            if (i.islemTipi === 'gelir') aylikFark += i.tutar;
                                            if (i.islemTipi === 'gider') aylikFark -= i.tutar;
                                        }
                                        if (i.islemTipi === 'transfer') {
                                            if (i.kaynakId === h.id) aylikFark -= i.tutar;
                                            if (i.hedefId === h.id) aylikFark += i.tutar;
                                        }
                                    });
                                    gosterilenBakiye = aylikFark;
                                }
                                return (
                                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                        <div><b>{h.hesapAdi}</b> <small style={{ color: '#aaa' }}>({h.hesapTipi})</small><span onClick={() => modalAc('duzenle_hesap', h)} style={{ fontSize: '10px', cursor: 'pointer', marginLeft: '5px', color: 'blue' }}>✏️</span></div>
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <span style={{ color: gosterilenBakiye < 0 ? 'red' : 'green', fontWeight: '600' }}>{gosterilenBakiye > 0 && '+'}{formatPara(gosterilenBakiye)}</span>
                                            {h.hesapTipi === 'krediKarti' && <button onClick={() => modalAc('kredi_karti_ode', h)} style={{ background: '#805ad5', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginLeft: '5px' }}>Borç Öde</button>}
                                            <span onClick={() => hesapSilGuvenli(h.id, h.hesapAdi)} style={{ cursor: 'pointer', color: 'red', fontSize: '12px' }}>🗑️</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee', textAlign: 'right', fontSize: '14px' }}>
                            <b>{aktifAy === "Tümü" ? "Toplam Varlık:" : "Bu Ay Toplam Değişim:"}</b> <span style={{ color: toplamHesapBakiyesi >= 0 ? 'green' : '#e53e3e', fontWeight: 'bold' }}>{formatPara(toplamHesapBakiyesi)}</span>
                        </div>

                        <form onSubmit={hesapEkle} style={{ display: 'flex', gap: '8px', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <input placeholder="Ad" value={hesapAdi} onChange={e => setHesapAdi(e.target.value)} style={{ flex: 2, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                            <select value={hesapTipi} onChange={e => setHesapTipi(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}><option value="nakit">Nakit</option><option value="krediKarti">Kart</option></select>
                            <input placeholder="Bakiye" type="number" value={baslangicBakiye} onChange={e => setBaslangicBakiye(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                            <button type="submit" style={{ background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '0 15px', fontWeight: 'bold' }}>+</button>
                        </form>
                    </div>

                    {/* TAKSİTLER */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#2d3748' }}>📦 Taksitli Alışverişler</h4>
                        {taksitler.length === 0 ? <p style={{ fontSize: '13px', color: '#aaa' }}>Aktif taksit borcu yok.</p> :
                            <div style={{ marginBottom: '15px' }}>
                                {taksitler.map(t => {
                                    const yuzde = (t.odenmisTaksit / t.taksitSayisi) * 100;
                                    let baslangic = "Bilinmiyor"; let bitis = "Bilinmiyor";
                                    if (t.alisTarihi) {
                                        const d = new Date(t.alisTarihi.seconds * 1000);
                                        baslangic = d.toLocaleDateString("tr-TR");
                                        d.setMonth(d.getMonth() + t.taksitSayisi - 1);
                                        bitis = d.toLocaleDateString("tr-TR");
                                    }
                                    return (
                                        <div key={t.id} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <div><b>{t.baslik}</b><div style={{ fontSize: '10px', color: '#999' }}>{t.alanKisi} • {t.kategori}</div></div>
                                                <span style={{ fontWeight: 'bold' }}>{formatPara(t.toplamTutar - (t.aylikTutar * t.odenmisTaksit))} <small style={{ color: '#999' }}>Kaldı</small></span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                                                <span>{t.odenmisTaksit}/{t.taksitSayisi} Ödendi</span>
                                                <span>Aylık: {formatPara(t.aylikTutar)}</span>
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#a0aec0', marginBottom: '5px' }}>{baslangic} - {bitis}</div>
                                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', marginBottom: '10px' }}><div style={{ width: `${yuzde}%`, height: '100%', background: '#805ad5', borderRadius: '4px', transition: 'width 0.5s' }}></div></div>
                                            <div style={{ textAlign: 'right' }}>
                                                <button onClick={() => taksitOde(t)} style={{ background: '#805ad5', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>Bu Ayı İşle ({formatPara(t.aylikTutar)})</button>
                                                <span onClick={() => modalAc('duzenle_taksit', t)} style={{ cursor: 'pointer', marginLeft: '10px' }}>✏️</span>
                                                <span onClick={() => normalSil("taksitler", t.id)} style={{ cursor: 'pointer', marginLeft: '10px' }}>🗑️</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#718096' }}>Aylık Yük: <b style={{ color: '#2d3748' }}>{formatPara(toplamAylikTaksitOdemesi)}</b></span>
                            <span style={{ color: '#718096' }}>Kalan Toplam Borç: <b style={{ color: '#e53e3e' }}>{formatPara(toplamKalanTaksitBorcu)}</b></span>
                        </div>
                    </div>

                    {/* ABONELİKLER */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#2d3748' }}>🔄 Sabit Abonelikler (Netflix vb.)</h4>
                        <div style={{ marginBottom: '15px' }}>
                            {abonelikler.map(abo => {
                                const hesap = hesaplar.find(h => h.id === abo.hesapId);
                                return (
                                    <div key={abo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{abo.ad}</div>
                                            <div style={{ fontSize: '11px', color: '#999' }}>
                                                {abo.gun}. gün • {abo.kategori} • {abo.kisi || "Belirtilmemiş"} • {hesap?.hesapAdi || "Hesap Yok"}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#e53e3e' }}>{formatPara(abo.tutar)}</div>
                                            <button onClick={() => abonelikOde(abo)} style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' }}>Öde</button>
                                            <span onClick={() => modalAc('duzenle_abonelik', abo)} style={{ cursor: 'pointer', fontSize: '12px' }}>✏️</span>
                                            <span onClick={() => normalSil("abonelikler", abo.id)} style={{ cursor: 'pointer', fontSize: '12px' }}>🗑️</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee', textAlign: 'right', fontSize: '13px' }}>
                            <span style={{ color: '#718096' }}>Aylık Sabit Gider: <b style={{ color: '#e53e3e' }}>{formatPara(toplamSabitGider)}</b></span>
                        </div>

                        <form onSubmit={abonelikEkle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
                            <input placeholder="Ad" value={aboAd} onChange={e => setAboAd(e.target.value)} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                            <input placeholder="Tutar" type="number" value={aboTutar} onChange={e => setAboTutar(e.target.value)} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                            <input placeholder="Gün" type="number" value={aboGun} onChange={e => setAboGun(e.target.value)} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                            <select value={aboKategori} onChange={e => setAboKategori(e.target.value)} style={{ gridColumn: 'span 3', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                            <select value={aboKisi} onChange={e => setAboKisi(e.target.value)} style={{ gridColumn: 'span 3', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select>
                            <select value={aboHesapId} onChange={e => setAboHesapId(e.target.value)} style={{ gridColumn: 'span 3', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}><option value="">Hangi Hesaptan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                            <button type="submit" style={{ gridColumn: 'span 3', background: '#805ad5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '10px', fontWeight: 'bold' }}>ABONELİK EKLE</button>
                        </form>
                    </div>
                </div>

                {/* --- SAĞ SÜTUN --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                    {/* 1. KART: VERİ GİRİŞ FORMLARI */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button onClick={() => setFormTab("islem")} style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "islem" ? '#ed8936' : '#edf2f7', color: formTab === "islem" ? 'white' : '#4a5568', fontWeight: 'bold' }}>Gelir / Gider</button>
                                <button onClick={() => setFormTab("transfer")} style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "transfer" ? '#3182ce' : '#edf2f7', color: formTab === "transfer" ? 'white' : '#4a5568', fontWeight: 'bold' }}>Transfer</button>
                                <button onClick={() => setFormTab("taksit")} style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "taksit" ? '#805ad5' : '#edf2f7', color: formTab === "taksit" ? 'white' : '#4a5568', fontWeight: 'bold' }}>Taksit</button>
                                <button onClick={() => setFormTab("fatura")} style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "fatura" ? '#c53030' : '#edf2f7', color: formTab === "fatura" ? 'white' : '#4a5568', fontWeight: 'bold' }}>Fatura Gir</button>
                            </div>
                        </div>

                        {/* GELİR GİDER FORMU */}
                        {formTab === "islem" && (
                            <form onSubmit={islemEkle} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select value={secilenHesapId} onChange={e => setSecilenHesapId(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f7fafc' }}><option value="">Hangi Hesaptan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({h.guncelBakiye}₺)</option>)}</select>
                                    <select value={islemTipi} onChange={e => setIslemTipi(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}><option value="gider">🔴 Gider</option><option value="gelir">🟢 Gelir</option></select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select value={harcayanKisi || aileUyeleri[0]} onChange={e => { const val = e.target.value; setHarcayanKisi(val); if (val === "Araç Giderleri") setKategori("Araç"); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select>
                                    <select value={kategori || kategoriListesi[0]} onChange={e => setKategori(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input placeholder="Açıklama" value={islemAciklama} onChange={e => setIslemAciklama(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} />
                                    <input type="number" placeholder="Tutar (₺)" value={islemTutar} onChange={e => setIslemTutar(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} />
                                </div>
                                <input type="datetime-local" value={islemTarihi} onChange={e => setIslemTarihi(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} />
                                <button type="submit" style={{ padding: '15px', background: '#ed8936', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>KAYDET</button>
                            </form>
                        )}

                        {/* TRANSFER FORMU */}
                        {formTab === "transfer" && (
                            <form onSubmit={transferYap} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#ebf8ff', padding: '20px', borderRadius: '10px' }}>
                                <div><label style={{ fontSize: '12px', color: '#2b6cb0' }}>Nereden?</label><select value={transferKaynakId} onChange={e => setTransferKaynakId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}><option value="">Seçiniz...</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({h.guncelBakiye}₺)</option>)}</select></div>
                                <div><label style={{ fontSize: '12px', color: '#2b6cb0' }}>Nereye?</label><select value={transferHedefId} onChange={e => setTransferHedefId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}><option value="">Seçiniz...</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({h.guncelBakiye}₺)</option>)}</select></div>
                                <input type="number" placeholder="Tutar (₺)" value={transferTutar} onChange={e => setTransferTutar(e.target.value)} style={{ gridColumn: 'span 2', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} />
                                <button type="submit" style={{ gridColumn: 'span 2', padding: '15px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>TRANSFER YAP / BORÇ ÖDE</button>
                            </form>
                        )}

                        {/* TAKSİT FORMU */}
                        {formTab === "taksit" && (
                            <form onSubmit={taksitEkle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f3e8ff', padding: '20px', borderRadius: '10px' }}>
                                <div style={{ gridColumn: 'span 2' }}><h4 style={{ margin: '0 0 10px 0', color: '#6b46c1' }}>📦 Yeni Taksit Planı Oluştur</h4></div>
                                <input placeholder="Ne aldın?" value={taksitBaslik} onChange={e => setTaksitBaslik(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }} required />
                                <select value={taksitHesapId} onChange={e => setTaksitHesapId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }} required><option value="">Hangi Karttan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                                <input type="number" placeholder="Toplam Borç (₺)" value={taksitToplamTutar} onChange={e => setTaksitToplamTutar(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }} required />
                                <input type="number" placeholder="Kaç Taksit?" value={taksitSayisi} onChange={e => setTaksitSayisi(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }} required />
                                <select value={taksitKisi || aileUyeleri[0]} onChange={e => setTaksitKisi(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select>
                                <select value={taksitKategori || kategoriListesi[0]} onChange={e => setTaksitKategori(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                                <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '12px', color: '#6b46c1' }}>Alış Tarihi</label><input type="date" value={taksitAlisTarihi} onChange={e => setTaksitAlisTarihi(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }} /></div>
                                <div style={{ gridColumn: 'span 2', fontSize: '14px', color: '#553c9a', fontWeight: 'bold', padding: '10px', background: 'white', borderRadius: '8px' }}>ℹ️ Aylık: {taksitToplamTutar && taksitSayisi ? formatPara(taksitToplamTutar / taksitSayisi) : '0,00 ₺'}</div>
                                <button type="submit" style={{ gridColumn: 'span 2', padding: '15px', background: '#805ad5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>KAYDET</button>
                            </form>
                        )}

                        {/* YENİ FATURA GİRİŞ FORMU */}
                        {formTab === "fatura" && (
                            <div style={{ background: '#fff5f5', padding: '20px', borderRadius: '10px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#c53030' }}>🧾 Dönemsel Fatura Tutarı Gir</h4>
                                {tanimliFaturalar.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#c53030', padding: '10px', fontSize: '13px' }}>
                                        ⚠️ Önce sol taraftaki panelden bir fatura/abone tanımı eklemelisiniz.
                                    </div>
                                ) : (
                                    <form onSubmit={faturaGir} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <select value={secilenTanimId} onChange={e => setSecilenTanimId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #feb2b2', boxSizing: 'border-box' }} required>
                                                <option value="">Hangi Fatura?</option>
                                                {tanimliFaturalar.map(t => <option key={t.id} value={t.id}>{t.baslik} ({t.kurum})</option>)}
                                            </select>
                                        </div>

                                        <input type="number" placeholder="Tutar (₺)" value={faturaGirisTutar} onChange={e => setFaturaGirisTutar(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #feb2b2', width: '100%', boxSizing: 'border-box' }} required />

                                        <input type="date" value={faturaGirisTarih} onChange={e => setFaturaGirisTarih(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #feb2b2', width: '100%', boxSizing: 'border-box' }} required />

                                        <input placeholder="Açıklama (Opsiyonel)" value={faturaGirisAciklama} onChange={e => setFaturaGirisAciklama(e.target.value)} style={{ gridColumn: 'span 2', padding: '12px', borderRadius: '8px', border: '1px solid #feb2b2', width: '100%', boxSizing: 'border-box' }} />

                                        <button type="submit" style={{ gridColumn: 'span 2', padding: '15px', background: '#c53030', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>KAYDET</button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. KART: GEÇMİŞ LİSTESİ */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>

                        {/* Üst Başlık ve Ay Seçimi */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                            <h4 style={{ marginTop: 0, color: '#2c3e50', margin: 0 }}>📜 Aile Harcama Geçmişi</h4>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {mevcutAylar.map(ay => (
                                    <button key={ay} onClick={() => setAktifAy(ay)} style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '15px', border: 'none', cursor: 'pointer', background: aktifAy === ay ? '#2c3e50' : '#edf2f7', color: aktifAy === ay ? 'white' : '#4a5568', fontWeight: 'bold' }}>{ay}</button>
                                ))}
                            </div>
                        </div>

                        {/* --- YENİ FİLTRE ALANI --- */}
                        <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '10px', marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', border: '1px solid #edf2f7' }}>
                            {/* Arama Kutusu */}
                            <div style={{ flex: 2, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px' }}>
                                <span style={{ fontSize: '16px' }}>🔍</span>
                                <input
                                    type="text"
                                    placeholder="Harcama, market, tutar ara..."
                                    value={aramaMetni}
                                    onChange={(e) => setAramaMetni(e.target.value)}
                                    style={{ border: 'none', outline: 'none', padding: '10px', width: '100%', fontSize: '13px' }}
                                />
                                {aramaMetni && <span onClick={() => setAramaMetni("")} style={{ cursor: 'pointer', color: '#aaa', fontWeight: 'bold' }}>X</span>}
                            </div>

                            {/* Kategori Filtresi */}
                            <select value={filtreKategori} onChange={e => setFiltreKategori(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '13px' }}>
                                <option value="Tümü">Tüm Kategoriler</option>
                                {kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}
                                <option value="Transfer">Transfer</option>
                            </select>

                            {/* Kişi Filtresi */}
                            <select value={filtreKisi} onChange={e => setFiltreKisi(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '13px' }}>
                                <option value="Tümü">Tüm Kişiler</option>
                                {aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>

                            {/* Excel Butonları */}
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={excelIndir} title="Excel İndir" style={{ background: '#276749', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>📥 XLS</button>
                                <label title="Ekstre Yükle" style={{ background: '#2b6cb0', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>📤 Yükle <input type="file" accept=".xlsx,.xls,.csv" onChange={excelYukle} style={{ display: 'none' }} /></label>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                            <thead><tr style={{ textAlign: 'left', color: '#718096', borderBottom: '2px solid #e2e8f0' }}><th style={{ padding: '10px' }}>Tarih</th><th style={{ padding: '10px' }}>Kişi</th><th style={{ padding: '10px' }}>Hesap</th><th style={{ padding: '10px' }}>Kategori</th><th style={{ padding: '10px' }}>Açıklama</th><th style={{ padding: '10px' }}>Tutar</th><th></th><th></th></tr></thead>
                            <tbody>
                                {filtrelenmisIslemler.map(i => {
                                    const hesap = hesaplar.find(h => h.id === i.hesapId);
                                    let hesapAdi = hesap?.hesapAdi || "Bilinmeyen";
                                    let renk = 'black';
                                    if (i.islemTipi === 'transfer') {
                                        const kaynak = hesaplar.find(h => h.id === i.kaynakId)?.hesapAdi;
                                        const hedef = hesaplar.find(h => h.id === i.hedefId)?.hesapAdi;
                                        hesapAdi = `${kaynak} ➝ ${hedef}`;
                                        renk = '#3182ce';
                                    } else if (i.islemTipi === 'gelir') {
                                        renk = 'green';
                                    } else {
                                        renk = '#e53e3e';
                                    }

                                    return (
                                        <tr key={i.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                                            <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', color: '#718096', cursor: 'pointer' }}>{tarihFormatla(i.tarih)}</td>
                                            <td style={{ padding: '10px', fontWeight: '600', color: '#4a5568', fontSize: '14px' }}>{i.harcayan || '-'}</td>
                                            <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>{hesapAdi}</td>
                                            <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', cursor: 'pointer' }}>{i.kategori}</td>
                                            <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', cursor: 'pointer' }}>{i.aciklama}</td>
                                            <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', fontWeight: 'bold', color: renk, cursor: 'pointer' }}>{formatPara(i.tutar)}</td>
                                            <td><span onClick={() => modalAc('duzenle_islem', i)} style={{ cursor: 'pointer' }}>✏️</span></td>
                                            <td><span onClick={() => islemSil(i.id)} style={{ cursor: 'pointer' }}>🗑️</span></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #f0f0f0', textAlign: 'right', color: '#2d3748', fontSize: '16px', fontWeight: 'bold' }}>
                            Net Toplam: <span style={{ color: netToplam >= 0 ? 'green' : '#e53e3e' }}>{formatPara(netToplam)}</span>
                        </div>

                        <footer style={{ textAlign: 'center', marginTop: '30px', padding: '10px', color: '#a0aec0', fontSize: '12px' }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>MUNDAN BİLİŞİM</p>
                            <p style={{ margin: 0 }}>v1.3.2 (Akıllı Sıralama)</p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;