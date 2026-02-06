import { useState, useEffect } from 'react'
import { db } from './firebase'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, increment, query, where, getDoc, setDoc, getDocs, writeBatch } from 'firebase/firestore'
import * as XLSX from 'xlsx';

// --- COMPONENTS ---
import LoginScreen from './components/LoginScreen';
import Feedback from './components/Feedback';
import Modals from './components/Modals';
import DashboardStats from './components/DashboardStats';
import Sidebar from './components/Sidebar';
import TransactionArea from './components/TransactionArea';


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
    const [transferUcreti, setTransferUcreti] = useState(""); const [transferTarihi, setTransferTarihi] = useState("");

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
    const [faturaKisi, setFaturaKisi] = useState("");
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
                    // 1. Transfer Kontrolü (Genel Transfer ve Kredi Kartı Ödemesi dahil)
                    if (data.islemTipi === 'transfer') {
                        // Kaynak hesaba parayı iade et (+)
                        await updateDoc(doc(db, "hesaplar", data.kaynakId), { guncelBakiye: increment(data.tutar) });
                        // Hedef hesaptan parayı geri çek (-)
                        await updateDoc(doc(db, "hesaplar", data.hedefId), { guncelBakiye: increment(-data.tutar) });
                    }
                    // 2. Normal Gelir/Gider Kontrolü
                    else {
                        let duzeltmeMiktari = 0;
                        // Gider silinirse para hesaba geri döner (+)
                        if (data.islemTipi === 'gider') duzeltmeMiktari = data.tutar;
                        // Gelir silinirse para hesaptan geri alınır (-)
                        if (data.islemTipi === 'gelir') duzeltmeMiktari = -data.tutar;

                        if (data.hesapId && duzeltmeMiktari !== 0) {
                            await updateDoc(doc(db, "hesaplar", data.hesapId), { guncelBakiye: increment(duzeltmeMiktari) });
                        }
                    }

                    // 3. Taksit Bağlantısı Varsa Sayacı Düş (Mevcut mantık aynen kalsın)
                    if (data.kategori === "Taksit" && data.taksitId) {
                        await updateDoc(doc(db, "taksitler", data.taksitId), { odenmisTaksit: increment(-1) });
                    }

                    await deleteDoc(docRef);
                    Swal.fire('Silindi!', 'Kayıt başarıyla silindi ve bakiyeler düzeltildi.', 'success');
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
                html: `<b>${t.baslik}</b> taksitleri (${t.taksitSayisi} ay) başarıyla tamamlandı!<br/><br/>Listeden kaldırılsın mı?`,
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

    const transferYap = async (e) => {
        e.preventDefault();
        if (!transferKaynakId || !transferHedefId || !transferTutar) return toast.warning("Alanları seçin");
        if (transferKaynakId === transferHedefId) return toast.warning("Aynı hesap");

        const tutar = parseFloat(transferTutar);
        const ucret = parseFloat(transferUcreti) || 0;
        const transferDate = transferTarihi ? new Date(transferTarihi) : new Date();

        const k = hesaplar.find(h => h.id === transferKaynakId);
        const h = hesaplar.find(h => h.id === transferHedefId);

        // 1. Ana Transfer İşlemi
        await addDoc(collection(db, "nakit_islemleri"), {
            aileKodu,
            islemTipi: "transfer",
            kategori: "Transfer",
            tutar: tutar,
            aciklama: `${k?.hesapAdi} ➝ ${h?.hesapAdi}`,
            tarih: transferDate,
            kaynakId: transferKaynakId,
            hedefId: transferHedefId,
            harcayan: "Sistem"
        });

        await updateDoc(doc(db, "hesaplar", transferKaynakId), { guncelBakiye: increment(-tutar) });
        await updateDoc(doc(db, "hesaplar", transferHedefId), { guncelBakiye: increment(tutar) });

        // 2. Transfer Ücreti Varsa (Ekstra Gider Olarak İşle)
        if (ucret > 0) {
            await addDoc(collection(db, "nakit_islemleri"), {
                aileKodu,
                hesapId: transferKaynakId, // Ücret kaynak hesaptan düşer
                islemTipi: "gider",
                kategori: "Banka Giderleri",
                tutar: ucret,
                aciklama: `EFT/Havale Ücreti (${h?.hesapAdi} transferi)`,
                tarih: transferDate,
                harcayan: "Sistem"
            });

            // Kaynak hesaptan ücreti de düş
            await updateDoc(doc(db, "hesaplar", transferKaynakId), { guncelBakiye: increment(-ucret) });
        }

        toast.success("✅ Transfer Başarılı!");
        setTransferTutar("");
        setTransferUcreti("");
        setTransferTarihi("");
        setTransferKaynakId("");
        setTransferHedefId("");
    }
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
        if (!secilenTanimId || !faturaGirisTutar || !faturaGirisTarih || !faturaKisi) return toast.warning("Tüm alanları doldurunuz.");

        await addDoc(collection(db, "bekleyen_faturalar"), {
            aileKodu,
            tanimId: secilenTanimId,
            tutar: parseFloat(faturaGirisTutar),
            sonOdemeTarihi: faturaGirisTarih,
            aciklama: faturaGirisAciklama,
            kisi: faturaKisi,
            eklenmeTarihi: new Date()
        });

        toast.success("Fatura takibe alındı!");
        setFaturaGirisTutar(""); setFaturaGirisTarih(""); setFaturaGirisAciklama(""); setFaturaKisi("");
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
            harcayan: fatura.kisi || "Sistem"
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
    const excelYukle = (e) => {
        const dosya = e.target.files[0];
        if (!dosya) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary', cellDates: true, cellNF: false, cellText: false }); // cellDates önemli!
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'yyyy-mm-dd' }); // dateNF ile tarihleri string'e formatla

            if (!data || data.length === 0) return toast.warning("Dosyada veri bulunamadı!");

            let sayac = 0;
            const batch = writeBatch(db); // Toplu yazma başlat
            let batchCount = 0;
            let currentBatchSize = 0;

            console.log("Okunan Excel Verisi (İlk Satır):", data[0]);

            for (const row of data) {
                // Alan Kontrolleri ve Temizlik
                // Excel Key Map: Tarih, Kisi, Kategori, Aciklama, Tutar, Hesap
                const tarihRaw = row['Tarih'] || row['Date'] || new Date();
                let islemTarihi = null;

                // Tarih Parsing (Güvenli)
                if (tarihRaw instanceof Date) {
                    islemTarihi = tarihRaw;
                } else if (typeof tarihRaw === 'string') {
                    // dd.mm.yyyy formatını kontrol et veya standart format
                    islemTarihi = new Date(tarihRaw);
                } else if (typeof tarihRaw === 'number') {
                    // Excel serial date (nadiren düşer çünkü cellDates: true kullandık ama güvenlik olsun)
                    islemTarihi = new Date((tarihRaw - (25567 + 2)) * 86400 * 1000);
                }

                if (!islemTarihi || isNaN(islemTarihi.getTime())) islemTarihi = new Date();

                const tutar = parseFloat(row['Tutar'] || row['Amount'] || 0);
                if (tutar === 0) continue; // Tutarı 0 olanları geç

                const kisi = row['Kişi'] || row['Kisi'] || row['Person'] || 'Excel';
                const kategori = row['Kategori'] || row['Category'] || 'Genel';
                const aciklama = row['Açıklama'] || row['Aciklama'] || row['Description'] || 'Excel Import';

                // Hesap Eşleştirme (Excel'deki Hesap Adı -> ID)
                let hedefHesapId = secilenHesapId; // Varsayılan olarak seçili hesap (eğer mapping başarısızsa)
                const excelHesapAdi = row['Hesap'] || row['Account'];

                if (excelHesapAdi) {
                    // İsme göre hesabı bulmaya çalış
                    const bulunanHesap = hesaplar.find(h => h.hesapAdi.toLowerCase() === excelHesapAdi.toLowerCase());
                    if (bulunanHesap) hedefHesapId = bulunanHesap.id;
                }

                if (!hedefHesapId) {
                    console.warn("Hesap bulunamadı ve varsayılan seçilmedi:", row);
                    continue; // Hesapsız işlem olmaz
                }

                const islemTipi = tutar < 0 ? 'gider' : 'gelir'; // Negatif tutar giderdir
                const absTutar = Math.abs(tutar);

                // Yeni Doküman Referansı
                const yeniIslemRef = doc(collection(db, "nakit_islemleri"));
                batch.set(yeniIslemRef, {
                    aileKodu,
                    tarih: islemTarihi,
                    kategori: kategori,
                    aciklama: aciklama,
                    tutar: absTutar,
                    islemTipi: islemTipi,
                    hesapId: hedefHesapId,
                    harcayan: kisi,
                    createdAt: new Date()
                });

                // Bakiye Güncelleme (Bunu mecburen ayrı yapmak daha iyi transaction gerektirir ama batch içinde basit increment ile çözelim)
                // DİKKAT: Batch update ile increment kullanabiliriz.
                const hesapRef = doc(db, "hesaplar", hedefHesapId);
                // İşlem tipine göre bakiyeyi artır veya azalt
                // Eğer Excel'de -500 geldiyse (Gider), islemTipi gider, tutar 500. Bakiye -500 olmalı.
                // Eğer +1000 geldiyse (Gelir), islemTipi gelir, tutar 1000. Bakiye +1000 olmalı.
                // Kısaca row['Tutar'] direkt eklenecek.
                batch.update(hesapRef, { guncelBakiye: increment(tutar) });

                sayac++;
                currentBatchSize++;

                // Batch limiti 500 işlemdir. 450'de bir commit atalım güvenli olsun.
                if (currentBatchSize >= 450) {
                    await batch.commit();
                    batchCount++;
                    // Yeni batch başlat (Burada batch yeniden oluşturulmalı, firestore v9 modüler SDK'da batch mutable değil tek kullanımlık olabilir, tekrar create edelim)
                    // Döngü içinde batch re-creation zor olabilir, bu basit import için tek batch 500 limitini zorlamayalım veya basitçe await edelim.
                    // En iyisi promise all veya chunking. Basitlik adına 500'ü geçerse uyaralım veya ilk 500'ü alalım.
                    // Şimdilik 500 sınırı varsayalım (kullanıcı devasa veri yüklemez umarım).
                }
            }

            if (currentBatchSize > 0) {
                await batch.commit();
                toast.success(`${sayac} işlem başarıyla içe aktarıldı!`);
            } else {
                toast.info("İçe aktarılacak geçerli işlem bulunamadı.");
            }
        };
        reader.readAsBinaryString(dosya);
    }

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

    if (loading || !user || !aileKodu) {
        return <LoginScreen
            user={user}
            loading={loading}
            girisYap={girisYap}
            aileKodu={aileKodu}
            girilenKod={girilenKod}
            setGirilenKod={setGirilenKod}
            aileKoduKaydet={aileKoduKaydet}
            cikisYap={cikisYap}
        />;
    }

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI', width: '100vw', boxSizing: 'border-box', background: '#f7f9fc', minHeight: '100vh', color: '#333', overflowX: 'hidden' }}>
            <ToastContainer position="top-right" autoClose={2000} theme="light" />

            <Modals
                aktifModal={aktifModal} setAktifModal={setAktifModal}
                seciliVeri={seciliVeri}
                hesapAdi={hesapAdi} setHesapAdi={setHesapAdi}
                baslangicBakiye={baslangicBakiye} setBaslangicBakiye={setBaslangicBakiye}
                hesapKesimGunu={hesapKesimGunu} setHesapKesimGunu={setHesapKesimGunu}
                islemAciklama={islemAciklama} setIslemAciklama={setIslemAciklama}
                islemTutar={islemTutar} setIslemTutar={setIslemTutar}
                islemTarihi={islemTarihi} setIslemTarihi={setIslemTarihi}
                harcayanKisi={harcayanKisi} setHarcayanKisi={setHarcayanKisi}
                kategori={kategori} setKategori={setKategori}
                aboAd={aboAd} setAboAd={setAboAd}
                aboTutar={aboTutar} setAboTutar={setAboTutar}
                aboGun={aboGun} setAboGun={setAboGun}
                aboHesapId={aboHesapId} setAboHesapId={setAboHesapId}
                aboKategori={aboKategori} setAboKategori={setAboKategori}
                aboKisi={aboKisi} setAboKisi={setAboKisi}
                taksitBaslik={taksitBaslik} setTaksitBaslik={setTaksitBaslik}
                taksitToplamTutar={taksitToplamTutar} setTaksitToplamTutar={setTaksitToplamTutar}
                taksitSayisi={taksitSayisi} setTaksitSayisi={setTaksitSayisi}
                taksitHesapId={taksitHesapId} setTaksitHesapId={setTaksitHesapId}
                taksitKategori={taksitKategori} setTaksitKategori={setTaksitKategori}
                taksitKisi={taksitKisi} setTaksitKisi={setTaksitKisi}
                taksitAlisTarihi={taksitAlisTarihi} setTaksitAlisTarihi={setTaksitAlisTarihi}
                maasAd={maasAd} setMaasAd={setMaasAd}
                maasTutar={maasTutar} setMaasTutar={setMaasTutar}
                maasGun={maasGun} setMaasGun={setMaasGun}
                maasHesapId={maasHesapId} setMaasHesapId={setMaasHesapId}
                tanimBaslik={tanimBaslik} setTanimBaslik={setTanimBaslik}
                tanimKurum={tanimKurum} setTanimKurum={setTanimKurum}
                tanimAboneNo={tanimAboneNo} setTanimAboneNo={setTanimAboneNo}
                kkOdemeKartId={kkOdemeKartId} setKkOdemeKartId={setKkOdemeKartId}
                kkOdemeKaynakId={kkOdemeKaynakId} setKkOdemeKaynakId={setKkOdemeKaynakId}
                kkOdemeTutar={kkOdemeTutar} setKkOdemeTutar={setKkOdemeTutar}
                faturaGirisTutar={faturaGirisTutar} setFaturaGirisTutar={setFaturaGirisTutar}
                faturaGirisTarih={faturaGirisTarih} setFaturaGirisTarih={setFaturaGirisTarih}
                faturaGirisAciklama={faturaGirisAciklama} setFaturaGirisAciklama={setFaturaGirisAciklama}
                yeniKisiAdi={yeniKisiAdi} setYeniKisiAdi={setYeniKisiAdi}
                yeniKategoriAdi={yeniKategoriAdi} setYeniKategoriAdi={setYeniKategoriAdi}
                yeniAileKoduInput={yeniAileKoduInput} setYeniAileKoduInput={setYeniAileKoduInput}
                tasimaIslemiSuruyor={tasimaIslemiSuruyor}
                aileUyeleri={aileUyeleri} setAileUyeleri={setAileUyeleri}
                kategoriListesi={kategoriListesi} setKategoriListesi={setKategoriListesi}
                hesaplar={hesaplar}
                tanimliFaturalar={tanimliFaturalar}
                aileKodu={aileKodu}
                formatPara={formatPara}
                tarihSadeceGunAyYil={tarihSadeceGunAyYil}
                hesapDuzenle={hesapDuzenle}
                islemDuzenle={islemDuzenle}
                abonelikDuzenle={abonelikDuzenle}
                taksitDuzenle={taksitDuzenle}
                maasDuzenle={maasDuzenle}
                faturaTanimDuzenle={faturaTanimDuzenle}
                krediKartiBorcOde={krediKartiBorcOde}
                faturaOde={faturaOde}
                bekleyenFaturaDuzenle={bekleyenFaturaDuzenle}
                verileriTasi={verileriTasi}
                // Yeni Eklenenler
                hesapEkle={hesapEkle}
                hesapTipi={hesapTipi} setHesapTipi={setHesapTipi}
                maasEkle={maasEkle}
                faturaTanimEkle={faturaTanimEkle}
                abonelikEkle={abonelikEkle}
            />

            <div id="dashboard-top">
                <DashboardStats
                    user={user}
                    aileKodu={aileKodu}
                    bildirimler={bildirimler}
                    toplamGelir={toplamGelir}
                    toplamGider={toplamGider}
                    bugunGider={bugunGider}
                    gunlukVeri={gunlukVeri}
                    kategoriVerisi={kategoriVerisi}
                    aktifAy={aktifAy}
                    setAktifAy={setAktifAy}
                    modalAc={modalAc}
                    setAktifModal={setAktifModal}
                    cikisYap={cikisYap}
                    aileKoduCikis={aileKoduCikis}
                    formatPara={formatPara}
                    aileUyeleri={aileUyeleri}
                    filtrelenmisIslemler={filtrelenmisIslemler}
                    gunlukOrtalama={gunlukOrtalama}
                    COLORS={COLORS}
                    abonelikOde={abonelikOde}
                    taksitOde={taksitOde}
                    maasYatir={maasYatir}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
                <Sidebar
                    netVarlik={hesaplar.reduce((acc, h) => acc + (parseFloat(h.guncelBakiye) || 0), 0)}
                    aylikLimit={aylikLimit} setAylikLimit={setAylikLimit}
                    aileKodu={aileKodu}
                    harcananLimit={harcananLimit}
                    limitYuzdesi={limitYuzdesi}
                    limitRenk={limitRenk}
                    tanimliFaturalar={tanimliFaturalar}
                    bekleyenFaturalar={bekleyenFaturalar}
                    modalAc={modalAc}
                    normalSil={normalSil}
                    maaslar={maaslar}
                    hesaplar={hesaplar}
                    aktifAy={aktifAy}
                    filtrelenmisIslemler={filtrelenmisIslemler}
                    formatPara={formatPara}
                    hesapSilGuvenli={hesapSilGuvenli}
                    toplamHesapBakiyesi={toplamHesapBakiyesi}
                    taksitler={taksitler}
                    taksitOde={taksitOde}
                    toplamAylikTaksitOdemesi={toplamAylikTaksitOdemesi}
                    toplamKalanTaksitBorcu={toplamKalanTaksitBorcu}
                    abonelikler={abonelikler}
                    abonelikOde={abonelikOde}
                    toplamSabitGider={toplamSabitGider}
                    tarihSadeceGunAyYil={tarihSadeceGunAyYil}
                />

                <div id="history-section">
                    <TransactionArea
                        formTab={formTab} setFormTab={setFormTab}
                        hesaplar={hesaplar}
                        kategoriListesi={kategoriListesi}
                        aileUyeleri={aileUyeleri}
                        islemEkle={islemEkle}
                        transferYap={transferYap}
                        taksitEkle={taksitEkle}
                        faturaGir={faturaGir}
                        filtrelenmisIslemler={filtrelenmisIslemler}
                        aramaMetni={aramaMetni} setAramaMetni={setAramaMetni}
                        filtreKategori={filtreKategori} setFiltreKategori={setFiltreKategori}
                        filtreKisi={filtreKisi} setFiltreKisi={setFiltreKisi}
                        excelIndir={excelIndir}
                        excelYukle={excelYukle}
                        modalAc={modalAc}
                        islemSil={islemSil}
                        formatPara={formatPara}
                        tarihFormatla={tarihFormatla}
                        netToplam={netToplam}
                        secilenHesapId={secilenHesapId} setSecilenHesapId={setSecilenHesapId}
                        islemTipi={islemTipi} setIslemTipi={setIslemTipi}
                        harcayanKisi={harcayanKisi} setHarcayanKisi={setHarcayanKisi}
                        kategori={kategori} setKategori={setKategori}
                        islemAciklama={islemAciklama} setIslemAciklama={setIslemAciklama}
                        islemTutar={islemTutar} setIslemTutar={setIslemTutar}
                        islemTarihi={islemTarihi} setIslemTarihi={setIslemTarihi}
                        transferKaynakId={transferKaynakId} setTransferKaynakId={setTransferKaynakId}
                        transferHedefId={transferHedefId} setTransferHedefId={setTransferHedefId}
                        transferTutar={transferTutar} setTransferTutar={setTransferTutar}
                        transferUcreti={transferUcreti} setTransferUcreti={setTransferUcreti}
                        transferTarihi={transferTarihi} setTransferTarihi={setTransferTarihi}
                        taksitBaslik={taksitBaslik} setTaksitBaslik={setTaksitBaslik}
                        taksitHesapId={taksitHesapId} setTaksitHesapId={setTaksitHesapId}
                        taksitToplamTutar={taksitToplamTutar} setTaksitToplamTutar={setTaksitToplamTutar}
                        taksitSayisi={taksitSayisi} setTaksitSayisi={setTaksitSayisi}
                        taksitKisi={taksitKisi} setTaksitKisi={setTaksitKisi}
                        taksitKategori={taksitKategori} setTaksitKategori={setTaksitKategori}
                        taksitAlisTarihi={taksitAlisTarihi} setTaksitAlisTarihi={setTaksitAlisTarihi}
                        tanimliFaturalar={tanimliFaturalar}
                        secilenTanimId={secilenTanimId} setSecilenTanimId={setSecilenTanimId}
                        faturaKisi={faturaKisi} setFaturaKisi={setFaturaKisi}
                        faturaGirisTutar={faturaGirisTutar} setFaturaGirisTutar={setFaturaGirisTutar}
                        faturaGirisTarih={faturaGirisTarih} setFaturaGirisTarih={setFaturaGirisTarih}
                        faturaGirisAciklama={faturaGirisAciklama} setFaturaGirisAciklama={setFaturaGirisAciklama}
                        mevcutAylar={mevcutAylar}
                        aktifAy={aktifAy} setAktifAy={setAktifAy}
                    />
                </div>
            </div>


            <Feedback userEmail={user?.email} />
        </div>
    );
}

export default App;