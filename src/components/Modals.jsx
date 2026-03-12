import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';

const KrediKartiBorcOdeModal = ({
    hesaplar,
    kkOdemeKartId,
    kkOdemeKaynakId,
    setKkOdemeKaynakId,
    kkOdemeTutar,
    setKkOdemeTutar,
    krediKartiBorcOde,
    formatPara,
    getButtonStyle,
    headerStyle,
    titleStyle,
    CloseButton,
    inputStyle
}) => {
    const [odemeSecenegi, setOdemeSecenegi] = useState('asgari'); // Varsayılan asgari olsun

    const kart = hesaplar.find(h => h.id === kkOdemeKartId);
    const guncelBorc = Math.abs(kart?.guncelBakiye || 0);
    const asgariBorc = guncelBorc * 0.20;

    useEffect(() => {
        if (odemeSecenegi === 'tamami') {
            setKkOdemeTutar(guncelBorc);
        } else if (odemeSecenegi === 'asgari') {
            setKkOdemeTutar(asgariBorc);
        } else if (odemeSecenegi === 'ozel') {
            // Özel seçildiğinde sıfırlayalım veya boş bırakalım, kullanıcı kendisi girsin
            // Ancak kullanıcı daha önce bir şey yazdıysa korumak isteyebiliriz, ama spec'e göre 'temizle' dendi.
            // Fakat 'manuel girişe izin ver' dendi.
            // Kullanıcı 'ozel' seçtiğinde, inputu boşaltmak daha mantıklı olabilir ilk geçişte.
            // Ancak döngüye girmemesi için sadece geçiş anında mı yapsak?
            // useEffect dependency'si [odemeSecenegi] olduğu için her değişimde çalışır.
            // Eğer 'ozel' ise ve tutar zaten kullanıcı tarafından girilmişse değiştirmeyelim.
            // Ama burası basit olsun: 'ozel'e geçince input'u temizleyelim ki kullanıcı girebilsin.
            if (kkOdemeTutar === guncelBorc || kkOdemeTutar === asgariBorc) {
                setKkOdemeTutar('');
            }
        }
    }, [odemeSecenegi, guncelBorc, asgariBorc, setKkOdemeTutar]);

    // Radyo buton stili
    const radioContainerStyle = { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' };
    const radioLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#2d3748' };

    return (
        <form onSubmit={krediKartiBorcOde}>
            <div style={headerStyle}>
                <h3 style={titleStyle}>💳 Kredi Kartı Borcu Öde</h3>
                <CloseButton />
            </div>

            {/* Borç Bilgi Kutusu */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f3e8ff', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>Kart:</span> {kart?.hesapAdi}
                </p>
                <p style={{ margin: '8px 0', fontSize: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>Güncel Borç:</span> {formatPara(guncelBorc)}
                </p>
                <p style={{ margin: 0, color: '#6b46c1', fontSize: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>Asgari (%20):</span> {formatPara(asgariBorc)}
                </p>
            </div>

            {/* Ödeme Seçenekleri (Radio Buttons) */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#4a5568' }}>Ödenecek Tutar Seçimi:</label>
                <div style={radioContainerStyle}>
                    <label style={radioLabelStyle}>
                        <input
                            type="radio"
                            name="odemeSecenegi"
                            value="tamami"
                            checked={odemeSecenegi === 'tamami'}
                            onChange={() => setOdemeSecenegi('tamami')}
                            style={{ accentColor: '#805ad5' }}
                        />
                        <span>
                            Tamamı ({formatPara(guncelBorc)})
                        </span>
                    </label>

                    <label style={radioLabelStyle}>
                        <input
                            type="radio"
                            name="odemeSecenegi"
                            value="asgari"
                            checked={odemeSecenegi === 'asgari'}
                            onChange={() => setOdemeSecenegi('asgari')}
                            style={{ accentColor: '#805ad5' }}
                        />
                        <span>
                            Asgari (%20) - {formatPara(asgariBorc)}
                        </span>
                    </label>

                    <label style={radioLabelStyle}>
                        <input
                            type="radio"
                            name="odemeSecenegi"
                            value="ozel"
                            checked={odemeSecenegi === 'ozel'}
                            onChange={() => setOdemeSecenegi('ozel')}
                            style={{ accentColor: '#805ad5' }}
                        />
                        <span>
                            Özel Tutar
                        </span>
                    </label>
                </div>
            </div>

            {/* Kaynak Hesap Seçimi */}
            <select
                value={kkOdemeKaynakId}
                onChange={e => setKkOdemeKaynakId(e.target.value)}
                style={inputStyle}
                required
            >
                <option value="">Parayı Hangi Hesaptan Çekelim?</option>
                {hesaplar.filter(h => h.id !== kkOdemeKartId).map(h => (
                    <option key={h.id} value={h.id}>{h.hesapAdi} ({formatPara(h.guncelBakiye)})</option>
                ))}
            </select>

            {/* Tutar Input */}
            <input
                type="number"
                placeholder="Ödenecek Tutar (₺)"
                value={kkOdemeTutar}
                onChange={e => setKkOdemeTutar(e.target.value)}
                style={{
                    ...inputStyle,
                    backgroundColor: odemeSecenegi !== 'ozel' ? '#e2e8f0' : '#f7fafc',
                    cursor: odemeSecenegi !== 'ozel' ? 'not-allowed' : 'text'
                }}
                required
                readOnly={odemeSecenegi !== 'ozel'}
            />

            <button
                type="submit"
                className="modal-primary-btn"
            >
                ÖDEMEYİ YAP
            </button>
        </form>
    );
};

const Modals = ({
    aktifModal,
    setAktifModal,
    seciliVeri,

    // Form States
    hesapAdi, setHesapAdi,
    baslangicBakiye, setBaslangicBakiye,
    hesapKesimGunu, setHesapKesimGunu,
    hesapTipi, setHesapTipi,
    islemAciklama, setIslemAciklama,
    islemTutar, setIslemTutar,
    islemTarihi, setIslemTarihi,
    harcayanKisi, setHarcayanKisi,
    kategori, setKategori,
    aboAd, setAboAd,
    aboTutar, setAboTutar,
    aboGun, setAboGun,
    aboHesapId, setAboHesapId,
    aboKategori, setAboKategori,
    aboKisi, setAboKisi,
    taksitBaslik, setTaksitBaslik,
    taksitToplamTutar, setTaksitToplamTutar,
    taksitSayisi, setTaksitSayisi,
    taksitHesapId, setTaksitHesapId,
    taksitKategori, setTaksitKategori,
    taksitKisi, setTaksitKisi,
    taksitAlisTarihi, setTaksitAlisTarihi,
    maasAd, setMaasAd,
    maasTutar, setMaasTutar,
    maasGun, setMaasGun,
    maasHesapId, setMaasHesapId,
    tanimBaslik, setTanimBaslik,
    tanimKurum, setTanimKurum,
    tanimAboneNo, setTanimAboneNo,
    kkOdemeKartId, setKkOdemeKartId,
    kkOdemeKaynakId, setKkOdemeKaynakId,
    kkOdemeTutar, setKkOdemeTutar,
    faturaGirisTutar, setFaturaGirisTutar,
    faturaGirisTarih, setFaturaGirisTarih,
    faturaGirisAciklama, setFaturaGirisAciklama,
    yeniKisiAdi, setYeniKisiAdi,
    yeniKategoriAdi, setYeniKategoriAdi,
    yeniAileKoduInput, setYeniAileKoduInput,
    tasimaIslemiSuruyor,

    // Lists & Helpers
    aileUyeleri, setAileUyeleri,
    kategoriListesi, setKategoriListesi,
    hesaplar,
    tanimliFaturalar,
    aileKodu,
    formatPara,
    tarihSadeceGunAyYil,

    // Handlers
    hesapDuzenle,
    hesapEkle,
    islemDuzenle,
    abonelikDuzenle,
    abonelikEkle,
    taksitDuzenle,
    maasDuzenle,
    maasEkle,
    faturaTanimDuzenle,
    faturaTanimEkle,
    krediKartiBorcOde,
    faturaOde,
    bekleyenFaturaDuzenle,
    verileriTasi,

    // Borclar
    borclar,
    borcAd, setBorcAd,
    borcToplamTutar, setBorcToplamTutar,
    borcKalanTutar, setBorcKalanTutar,
    borcSonOdemeTarihi, setBorcSonOdemeTarihi,
    borcKategori, setBorcKategori,
    borcOdemeHesapId, setBorcOdemeHesapId,
    borcOdemeTutar, setBorcOdemeTutar,
    borcEkle,
    borcDuzenle,
    borcOde

}) => {

    // --- SİLME ONAY MODALI İÇİN STATE ---
    const [deleteModal, setDeleteModal] = useState({ show: false, type: null, item: null });

    const handleDeleteRequest = (type, item) => {
        setDeleteModal({ show: true, type, item });
    };

    const confirmDelete = () => {
        const { type, item } = deleteModal;
        if (!item) return;

        if (type === 'member') {
            const y = aileUyeleri.filter(x => x !== item);
            setAileUyeleri(y);
            setDoc(doc(db, "ayarlar", aileKodu), { aileUyeleri: y }, { merge: true });
            toast.info(`${item} silindi.`);
        } else if (type === 'category') {
            const y = kategoriListesi.filter(x => x !== item);
            setKategoriListesi(y);
            setDoc(doc(db, "ayarlar", aileKodu), { kategoriler: y }, { merge: true });
            toast.info(`${item} kategorisi silindi.`);
        }
        setDeleteModal({ show: false, type: null, item: null });
    };

    const cancelDelete = () => {
        setDeleteModal({ show: false, type: null, item: null });
    };

    useEffect(() => {
        if (aktifModal === 'borc_ode') {
            setBorcOdemeHesapId("");
            setBorcOdemeTutar("");
        }
    }, [aktifModal, setBorcOdemeHesapId, setBorcOdemeTutar]);

    if (!aktifModal) return null;

    // Ortak Stiller
    const isSettings = aktifModal === 'ayarlar_yonetim';
    const modalContainerStyle = {
        background: 'var(--surface-solid, #ffffff)',
        padding: isSettings ? '20px' : '30px',
        borderRadius: '18px',
        width: '90%',
        maxWidth: isSettings ? '380px' : '420px',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.30)',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        maxHeight: '90vh',
        overflowY: 'auto'
    };
    const inputStyle = {
        width: '100%',
        padding: '11px 14px',
        borderRadius: 'var(--radius-input, 12px)',
        border: '1px solid var(--border, rgba(15, 23, 42, 0.12))',
        backgroundColor: 'var(--surface-solid, #fff)',
        marginBottom: '15px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box'
    };
    const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '13px', color: '#718096', fontWeight: 'bold' };
    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '10px'
    };
    const titleStyle = {
        margin: 0,
        color: '#0f172a',
        fontWeight: 700,
        fontSize: '1.05rem',
        letterSpacing: '0.1px'
    };
    const closeButtonStyle = { cursor: 'pointer', color: '#a0aec0', fontSize: '20px', lineHeight: '1' };

    // Buton stilleri fonksiyonu (renk parametresi ile)
    const getButtonStyle = (bgColor) => ({
        width: '100%',
        padding: '12px',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '15px',
        marginTop: '10px',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        border: 'none',
        background: bgColor,
        color: 'white'
    });

    const CloseButton = () => (
        <span onClick={() => setAktifModal(null)} style={closeButtonStyle}>✕</span>
    );

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
        }}>
            <div style={modalContainerStyle}>

                {/* --- YENİ EKLEME MODALLARI --- */}

                {/* YENİ HESAP EKLE */}
                {aktifModal === 'yeni_hesap' && <form onSubmit={(e) => { hesapEkle(e); setAktifModal(null); }}>
                    <div style={headerStyle}>
                        <h3 style={titleStyle}>Yeni Cüzdan/Hesap</h3>
                        <CloseButton />
                    </div>
                    <input placeholder="Hesap Adı" value={hesapAdi} onChange={e => setHesapAdi(e.target.value)} style={inputStyle} />
                    <select value={hesapTipi} onChange={e => setHesapTipi(e.target.value)} style={inputStyle}>
                        <option value="nakit">Nakit</option>
                        <option value="krediKarti">Kredi Kartı</option>
                    </select>
                    <input placeholder="Başlangıç Bakiyesi" type="number" value={baslangicBakiye} onChange={e => setBaslangicBakiye(e.target.value)} style={inputStyle} />
                    {hesapTipi === 'krediKarti' && <input placeholder="Kesim Günü (1-31)" type="number" value={hesapKesimGunu} onChange={e => setHesapKesimGunu(e.target.value)} style={inputStyle} />}
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {/* YENİ MAAŞ EKLE */}
                {aktifModal === 'yeni_maas' && <form onSubmit={(e) => { maasEkle(e); setAktifModal(null); }}>
                    <div style={headerStyle}>
                        <h3 style={titleStyle}>Yeni Maaş/Gelir</h3>
                        <CloseButton />
                    </div>
                    <input placeholder="Ad (Örn: Baba Maaş)" value={maasAd} onChange={e => setMaasAd(e.target.value)} style={inputStyle} />
                    <input placeholder="Tutar" type="number" value={maasTutar} onChange={e => setMaasTutar(e.target.value)} style={inputStyle} />
                    <input placeholder="Yatacağı Gün (1-31)" type="number" value={maasGun} onChange={e => setMaasGun(e.target.value)} style={inputStyle} />
                    <select value={maasHesapId} onChange={e => setMaasHesapId(e.target.value)} style={inputStyle}>
                        <option value="">Hangi Hesaba Yatsın?</option>
                        {hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}
                    </select>
                    <button type="submit" className="modal-success-btn">Kaydet</button>
                </form>}

                {/* YENİ FATURA TANIMI EKLE */}
                {aktifModal === 'yeni_fatura_tanim' && <form onSubmit={(e) => { faturaTanimEkle(e); setAktifModal(null); }}>
                    <div style={headerStyle}>
                        <h3 style={titleStyle}>Yeni Fatura Abonesi</h3>
                        <CloseButton />
                    </div>
                    <input placeholder="Başlık (Örn: Ev Elektrik)" value={tanimBaslik} onChange={e => setTanimBaslik(e.target.value)} style={inputStyle} required />
                    <input placeholder="Kurum Adı" value={tanimKurum} onChange={e => setTanimKurum(e.target.value)} style={inputStyle} />
                    <input placeholder="Abone No" value={tanimAboneNo} onChange={e => setTanimAboneNo(e.target.value)} style={inputStyle} />
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {/* YENİ ABONELİK EKLE */}
                {aktifModal === 'yeni_abonelik' && <form onSubmit={(e) => { abonelikEkle(e); setAktifModal(null); }}>
                    <div style={headerStyle}>
                        <h3 style={titleStyle}>Yeni Abonelik</h3>
                        <CloseButton />
                    </div>
                    <input placeholder="Ad (Netflix, Spotify vb.)" value={aboAd} onChange={e => setAboAd(e.target.value)} style={inputStyle} />
                    <input placeholder="Aylık Tutar" type="number" value={aboTutar} onChange={e => setAboTutar(e.target.value)} style={inputStyle} />
                    <input placeholder="Ödeme Günü (1-31)" type="number" value={aboGun} onChange={e => setAboGun(e.target.value)} style={inputStyle} />
                    <select value={aboKategori} onChange={e => setAboKategori(e.target.value)} style={inputStyle}>
                        {kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <select value={aboKisi} onChange={e => setAboKisi(e.target.value)} style={inputStyle}>
                        {aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <select value={aboHesapId} onChange={e => setAboHesapId(e.target.value)} style={inputStyle}>
                        <option value="">Hangi Hesaptan Çekilsin?</option>
                        {hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}
                    </select>
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {/* YENİ BORÇ EKLE */}
                {aktifModal === 'yeni_borc' && <form onSubmit={(e) => { borcEkle(e); setAktifModal(null); }}>
                    <div style={headerStyle}>
                        <h3 style={titleStyle}>Yeni Borç Tanımla</h3>
                        <CloseButton />
                    </div>
                    <input placeholder="Borç Adı (Örn: Ahmet'ten Borç)" value={borcAd} onChange={e => setBorcAd(e.target.value)} style={inputStyle} required />
                    <input placeholder="Toplam Borç Tutarı" type="number" step="0.01" value={borcToplamTutar} onChange={e => setBorcToplamTutar(e.target.value)} style={inputStyle} required />
                    <input placeholder="Kalan Tutar (Boşsa Toplam ile aynı olur)" type="number" step="0.01" value={borcKalanTutar} onChange={e => setBorcKalanTutar(e.target.value)} style={inputStyle} />
                    <label style={labelStyle}>Kategori</label>
                    <select value={borcKategori} onChange={e => setBorcKategori(e.target.value)} style={inputStyle}>
                        {kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <label style={labelStyle}>Son Ödeme Tarihi (Opsiyonel)</label>
                    <input type="date" value={borcSonOdemeTarihi} onChange={e => setBorcSonOdemeTarihi(e.target.value)} style={inputStyle} />
                    <button type="submit" className="modal-danger-btn">Kaydet</button>
                </form>}


                {/* MEVCUT DÜZENLEME MODALLARI */}
                {aktifModal === 'duzenle_hesap' && <form onSubmit={hesapDuzenle}>
                    <div style={headerStyle}><h3 style={titleStyle}>Hesap Düzenle</h3><CloseButton /></div>
                    <input value={hesapAdi} onChange={e => setHesapAdi(e.target.value)} style={inputStyle} />
                    <input type="number" value={baslangicBakiye} onChange={e => setBaslangicBakiye(e.target.value)} style={inputStyle} />
                    {seciliVeri.hesapTipi === 'krediKarti' && <input type="number" placeholder="Kesim Günü (1-31)" value={hesapKesimGunu} onChange={e => setHesapKesimGunu(e.target.value)} style={inputStyle} />}
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {aktifModal === 'duzenle_islem' && <form onSubmit={islemDuzenle}>
                    <div style={headerStyle}><h3 style={titleStyle}>İşlem Düzenle</h3><CloseButton /></div>
                    <input value={islemAciklama} onChange={e => setIslemAciklama(e.target.value)} style={inputStyle} />
                    <input type="number" value={islemTutar} onChange={e => setIslemTutar(e.target.value)} style={inputStyle} />
                    <input type="datetime-local" value={islemTarihi} onChange={e => setIslemTarihi(e.target.value)} max="9999-12-31T23:59" style={inputStyle} />
                    <select value={harcayanKisi} onChange={e => setHarcayanKisi(e.target.value)} style={inputStyle}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select>
                    <select value={kategori} onChange={e => setKategori(e.target.value)} style={inputStyle}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {aktifModal === 'duzenle_abonelik' && <form onSubmit={abonelikDuzenle}>
                    <div style={headerStyle}><h3 style={titleStyle}>Abonelik Düzenle</h3><CloseButton /></div>
                    <input value={aboAd} onChange={e => setAboAd(e.target.value)} placeholder="Gider Adı" style={inputStyle} />
                    <input type="number" value={aboTutar} onChange={e => setAboTutar(e.target.value)} placeholder="Tutar" style={inputStyle} />
                    <input type="number" value={aboGun} onChange={e => setAboGun(e.target.value)} placeholder="Gün (1-31)" style={inputStyle} />
                    <select value={aboKategori} onChange={e => setAboKategori(e.target.value)} style={inputStyle}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                    <select value={aboKisi} onChange={e => setAboKisi(e.target.value)} style={inputStyle}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select>
                    <select value={aboHesapId} onChange={e => setAboHesapId(e.target.value)} style={inputStyle}><option value="">Hangi Hesaptan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {aktifModal === 'duzenle_taksit' && <form onSubmit={taksitDuzenle}>
                    <div style={headerStyle}><h3 style={titleStyle}>Taksit Düzenle</h3><CloseButton /></div>
                    <input value={taksitBaslik} onChange={e => setTaksitBaslik(e.target.value)} placeholder="Ne aldın?" style={inputStyle} />
                    <input type="number" value={taksitToplamTutar} onChange={e => setTaksitToplamTutar(e.target.value)} placeholder="Toplam Borç" style={inputStyle} />
                    <input type="number" value={taksitSayisi} onChange={e => setTaksitSayisi(e.target.value)} placeholder="Taksit Sayısı" style={inputStyle} />
                    <select value={taksitKategori} onChange={e => setTaksitKategori(e.target.value)} style={inputStyle}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                    <select value={taksitKisi} onChange={e => setTaksitKisi(e.target.value)} style={inputStyle}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select>
                    <select value={taksitHesapId} onChange={e => setTaksitHesapId(e.target.value)} style={inputStyle}><option value="">Hangi Karttan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                    <label style={labelStyle}>Alış Tarihi:</label>
                    <input type="date" value={taksitAlisTarihi} onChange={e => setTaksitAlisTarihi(e.target.value)} max="9999-12-31" style={inputStyle} />
                    <div style={{ marginBottom: '15px', fontSize: '13px', color: 'blue' }}>Yeni Aylık Tutar: {taksitToplamTutar && taksitSayisi ? formatPara(taksitToplamTutar / taksitSayisi) : '0 ₺'}</div>
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {aktifModal === 'duzenle_maas' && <form onSubmit={maasDuzenle}>
                    <div style={headerStyle}><h3 style={titleStyle}>Maaş Düzenle</h3><CloseButton /></div>
                    <input value={maasAd} onChange={e => setMaasAd(e.target.value)} placeholder="Maaş Adı" style={inputStyle} />
                    <input type="number" value={maasTutar} onChange={e => setMaasTutar(e.target.value)} placeholder="Tutar" style={inputStyle} />
                    <input type="number" value={maasGun} onChange={e => setMaasGun(e.target.value)} placeholder="Yatma Günü (1-31)" style={inputStyle} />
                    <select value={maasHesapId} onChange={e => setMaasHesapId(e.target.value)} style={inputStyle}><option value="">Hangi Hesaba?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {aktifModal === 'duzenle_fatura_tanim' && <form onSubmit={faturaTanimDuzenle}>
                    <div style={headerStyle}><h3 style={titleStyle}>Fatura Tanımı Düzenle</h3><CloseButton /></div>
                    <input value={tanimBaslik} onChange={e => setTanimBaslik(e.target.value)} placeholder="Başlık" style={inputStyle} />
                    <input value={tanimKurum} onChange={e => setTanimKurum(e.target.value)} placeholder="Kurum" style={inputStyle} />
                    <input value={tanimAboneNo} onChange={e => setTanimAboneNo(e.target.value)} placeholder="Abone No" style={inputStyle} />
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {/* BORÇ DÜZENLE */}
                {aktifModal === 'duzenle_borc' && <form onSubmit={borcDuzenle}>
                    <div style={headerStyle}><h3 style={titleStyle}>Borç Düzenle</h3><CloseButton /></div>
                    <input value={borcAd} onChange={e => setBorcAd(e.target.value)} placeholder="Borç Adı" style={inputStyle} required />
                    <input type="number" step="0.01" value={borcToplamTutar} onChange={e => setBorcToplamTutar(e.target.value)} placeholder="Toplam Borç Tutarı" style={inputStyle} required />
                    <input type="number" step="0.01" value={borcKalanTutar} onChange={e => setBorcKalanTutar(e.target.value)} placeholder="Kalan Tutar" style={inputStyle} />
                    <label style={labelStyle}>Kategori</label>
                    <select value={borcKategori} onChange={e => setBorcKategori(e.target.value)} style={inputStyle}>
                        {kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <label style={labelStyle}>Son Ödeme Tarihi (Opsiyonel)</label>
                    <input type="date" value={borcSonOdemeTarihi} onChange={e => setBorcSonOdemeTarihi(e.target.value)} style={inputStyle} />
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {aktifModal === 'kredi_karti_ode' && <KrediKartiBorcOdeModal
                    hesaplar={hesaplar}
                    kkOdemeKartId={kkOdemeKartId}
                    kkOdemeKaynakId={kkOdemeKaynakId}
                    setKkOdemeKaynakId={setKkOdemeKaynakId}
                    kkOdemeTutar={kkOdemeTutar}
                    setKkOdemeTutar={setKkOdemeTutar}
                    krediKartiBorcOde={krediKartiBorcOde}
                    formatPara={formatPara}
                    getButtonStyle={getButtonStyle}
                    headerStyle={headerStyle}
                    titleStyle={titleStyle}
                    CloseButton={CloseButton}
                    inputStyle={inputStyle}
                />}

                {/* BORÇ ÖDEME MODALI */}
                {aktifModal === 'borc_ode' && <form onSubmit={borcOde}>
                    <div style={{ ...headerStyle, borderBottom: 'none', paddingBottom: '10px' }}>
                        <h3 style={{ ...titleStyle, fontSize: '20px', color: '#1f2937' }}>💳 Borç Öde</h3>
                        <CloseButton />
                    </div>
                    {(() => {
                        const ad = seciliVeri ? seciliVeri.ad : "Borç";
                        const kalan = seciliVeri ? parseFloat(seciliVeri.kalanTutar) : 0;
                        return (
                            <div style={{ background: '#fdf2f8', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#831843', margin: '0 0 8px 0' }}>{ad}</p>
                                <p style={{ color: '#9d174d', fontSize: '15px', margin: 0 }}>Kalan Borç: <b>{formatPara(kalan)}</b></p>
                            </div>
                        )
                    })()}

                    <input
                        type="number"
                        step="0.01"
                        placeholder="Kaç TL ödeyeceksin?"
                        value={borcOdemeTutar}
                        onChange={e => setBorcOdemeTutar(e.target.value)}
                        style={{ ...inputStyle, padding: '12px', fontSize: '15px', borderRadius: '8px', border: '1px solid #c4b5fd' }}
                        required
                    />

                    <select
                        value={borcOdemeHesapId}
                        onChange={e => setBorcOdemeHesapId(e.target.value)}
                        style={{ ...inputStyle, padding: '12px', fontSize: '15px', borderRadius: '8px' }}
                        required
                    >
                        <option value="">Ödeme Aracı (Hangi Hesaptan?)</option>
                        {hesaplar.map(h => (
                            <option key={h.id} value={h.id}>{h.hesapAdi} ({formatPara(h.guncelBakiye)})</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="modal-primary-btn"
                        style={{ marginTop: '10px' }}
                    >
                        ÖDEMEYİ YAP
                    </button>
                </form>}

                {/* FATURA ÖDEME MODALI */}
                {aktifModal === 'fatura_ode' && <div style={{ textAlign: 'center' }}>
                    <div style={headerStyle}><h3 style={titleStyle}>🧾 Fatura Öde</h3><CloseButton /></div>
                    {(() => {
                        const tanim = tanimliFaturalar.find(t => t.id === seciliVeri.tanimId);
                        const ad = tanim ? tanim.baslik : "Fatura";
                        return (
                            <>
                                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{ad}</p>
                                <p style={{ color: '#c53030', fontSize: '20px', fontWeight: 'bold' }}>{formatPara(seciliVeri.tutar)}</p>
                                <p style={{ fontSize: '13px', color: '#777', marginBottom: '20px' }}>Son Ödeme: {tarihSadeceGunAyYil(seciliVeri.sonOdemeTarihi)}</p>
                            </>
                        )
                    })()}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {hesaplar.map(h => (
                            <button key={h.id} onClick={() => faturaOde(seciliVeri, h.id)} style={{ padding: '14px', border: '1px solid #ddd', borderRadius: '12px', background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                                <span>{h.hesapAdi}</span>
                                <span style={{ fontWeight: 'bold' }}>{formatPara(h.guncelBakiye)}</span>
                            </button>
                        ))}
                    </div>
                </div>}

                {/* BEKLEYEN FATURA DÜZENLEME MODALI */}
                {aktifModal === 'duzenle_bekleyen_fatura' && <form onSubmit={bekleyenFaturaDuzenle}>
                    <div style={headerStyle}><h3 style={titleStyle}>Faturayı Düzenle</h3><CloseButton /></div>
                    <input type="number" value={faturaGirisTutar} onChange={e => setFaturaGirisTutar(e.target.value)} placeholder="Tutar" style={inputStyle} />
                    <input type="date" value={faturaGirisTarih} onChange={e => setFaturaGirisTarih(e.target.value)} max="9999-12-31" style={inputStyle} />
                    <input value={faturaGirisAciklama} onChange={e => setFaturaGirisAciklama(e.target.value)} placeholder="Açıklama" style={inputStyle} />
                    <button type="submit" className="modal-primary-btn">Kaydet</button>
                </form>}

                {aktifModal === 'ayarlar_yonetim' && <div>
                    <div style={headerStyle}><h3 style={titleStyle}>⚙️ Ayarlar</h3><CloseButton /></div>

                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} />
                    <h4 style={{ margin: '0 0 10px 0' }}>👨‍👩‍👧‍👦 Aile Bireyleri</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {aileUyeleri.map(k => (<li key={k} style={{ background: '#edf2f7', padding: '4px 8px', borderRadius: '12px', fontSize: '13px' }}>{k} <span onClick={() => handleDeleteRequest('member', k)} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>X</span></li>))}
                    </ul>
                    <form onSubmit={(e) => { e.preventDefault(); if (!yeniKisiAdi) return; const y = [...aileUyeleri, yeniKisiAdi]; setAileUyeleri(y); setDoc(doc(db, "ayarlar", aileKodu), { aileUyeleri: y }, { merge: true }); setYeniKisiAdi(""); toast.success("Kişi eklendi"); }} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                        <input value={yeniKisiAdi} onChange={e => setYeniKisiAdi(e.target.value)} placeholder="Yeni Kişi Adı" style={{ ...inputStyle, padding: '8px', fontSize: '13px', marginBottom: '10px' }} />
                        <button type="submit" className="btn-ui btn-ui-primary" style={{ padding: '8px 12px', marginTop: 0, marginBottom: '10px', fontSize: '13px' }}>Ekle</button>
                    </form>

                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} />
                    <h4 style={{ margin: '0 0 10px 0' }}>📂 Kategoriler</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {kategoriListesi.map(k => (<li key={k} style={{ background: '#f0fff4', padding: '4px 8px', borderRadius: '12px', fontSize: '13px' }}>{k} <span onClick={() => handleDeleteRequest('category', k)} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>X</span></li>))}
                    </ul>
                    <form onSubmit={(e) => { e.preventDefault(); if (!yeniKategoriAdi) return; const y = [...kategoriListesi, yeniKategoriAdi]; setKategoriListesi(y); setDoc(doc(db, "ayarlar", aileKodu), { kategoriler: y }, { merge: true }); setYeniKategoriAdi(""); toast.success("Kategori eklendi"); }} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                        <input value={yeniKategoriAdi} onChange={e => setYeniKategoriAdi(e.target.value)} placeholder="Yeni Kategori" style={{ ...inputStyle, padding: '8px', fontSize: '13px', marginBottom: '10px' }} />
                        <button type="submit" className="btn-ui btn-ui-success" style={{ padding: '8px 12px', marginTop: 0, marginBottom: '10px', fontSize: '13px' }}>Ekle</button>
                    </form>

                    <div style={{ marginTop: '20px', padding: '15px', background: '#fffaf0', border: '1px solid #fbd38d', borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#c05621', fontSize: '14px' }}>🚚 Aile Kodu / Veri Taşı</h4>
                        <p style={{ fontSize: '12px', color: '#7b341e', marginBottom: '10px' }}>Kodunuz: <b>{aileKodu}</b>. Taşımak için yeni kodu girin.</p>
                        <form onSubmit={verileriTasi} style={{ display: 'flex', gap: '5px' }}>
                            <input value={yeniAileKoduInput} onChange={e => setYeniAileKoduInput(e.target.value.toUpperCase())} placeholder="YENİ KOD" style={{ ...inputStyle, border: '1px solid #fbd38d', padding: '8px', marginBottom: 0, fontSize: '13px' }} />
                            <button type="submit" disabled={tasimaIslemiSuruyor} className="btn-ui btn-ui-danger" style={{ padding: '8px 12px', marginTop: 0, fontSize: '13px' }}>{tasimaIslemiSuruyor ? '...' : 'TAŞI'}</button>
                        </form>
                    </div>
                </div>}
            </div>

            {/* SİLME ONAY MODALI (OVERLAY) */}
            {deleteModal.show && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', // Arkası daha karanlık
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1001 // Ayarlar modalının üstünde
                }}>
                    <div style={{
                        background: 'var(--surface-solid, #ffffff)',
                        padding: '30px',
                        borderRadius: '18px',
                        width: '90%',
                        maxWidth: '350px',
                        textAlign: 'center',
                        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.30)',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: '#fee2e2',
                            color: '#e53e3e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            margin: '0 auto 20px auto'
                        }}>
                            !
                        </div>

                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1a202c',
                            marginBottom: '10px'
                        }}>
                            {deleteModal.type === 'category'
                                ? `${deleteModal.item} kategorisini silmek istediğinize emin misiniz?`
                                : `${deleteModal.item} kişisini silmek istediğinize emin misiniz?`}
                        </h3>

                        <p style={{
                            fontSize: '14px',
                            color: '#718096',
                            marginBottom: '25px',
                            lineHeight: '1.5'
                        }}>
                            Bu {deleteModal.type === 'category' ? 'kategoriye' : 'kişiye'} ait geçmiş veriler silinmeyecektir, sadece listeden kaldırılacaktır.
                        </p>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '25px',
                                    border: '1px solid #e2e8f0',
                                    background: '#f7fafc',
                                    color: '#4a5568',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    background: '#e53e3e',
                                    color: 'white',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(229, 62, 62, 0.4)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default Modals;
