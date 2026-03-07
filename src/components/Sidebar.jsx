import React from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Sidebar = ({
    netVarlik,
    aylikLimit, setAylikLimit,
    aileKodu,
    harcananLimit,
    limitYuzdesi,
    limitRenk,
    tanimliFaturalar,
    bekleyenFaturalar,
    modalAc,
    normalSil,
    faturaTanimEkle,
    tanimBaslik, setTanimBaslik,
    tanimKurum, setTanimKurum,
    tanimAboneNo, setTanimAboneNo,
    maaslar,
    hesaplar,
    maasEkle,
    maasAd, setMaasAd,
    maasTutar, setMaasTutar,
    maasGun, setMaasGun,
    maasHesapId, setMaasHesapId,
    aktifAy,
    filtrelenmisIslemler,
    formatPara,
    hesapSilGuvenli,
    toplamHesapBakiyesi,
    hesapEkle,
    hesapAdi, setHesapAdi,
    hesapTipi, setHesapTipi,
    baslangicBakiye, setBaslangicBakiye,
    taksitler,
    taksitOde,
    toplamAylikTaksitOdemesi,
    toplamKalanTaksitBorcu,
    abonelikler,
    abonelikOde,
    toplamSabitGider,
    abonelikEkle,
    aboAd, setAboAd,
    aboTutar, setAboTutar,
    aboGun, setAboGun,
    aboKategori, setAboKategori,
    aboKisi, setAboKisi,
    aboHesapId, setAboHesapId,
    kategoriListesi,
    aileUyeleri,
    tarihSadeceGunAyYil,
    borclar = [],
    toplamKalanBorc = 0
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* LİMİT KARTI */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ margin: 0, color: '#2d3748' }}>🎯 Aylık Bütçe Limiti</h4>
                    </div>
                    <input type="number" value={aylikLimit} onChange={(e) => { setAylikLimit(e.target.value); setDoc(doc(db, "ayarlar", aileKodu), { limit: e.target.value }, { merge: true }); }} style={{ width: '70px', border: '1px solid #ddd', borderRadius: '5px', padding: '2px', fontSize: '12px' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}><span style={{ color: limitRenk }}>Harcanan: {formatPara(harcananLimit)}</span><span>{limitYuzdesi.toFixed(0)}%</span></div>
                    <div style={{ width: '100%', height: '15px', background: '#edf2f7', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}><div style={{ width: `${limitYuzdesi}%`, height: '100%', background: limitRenk, transition: 'width 0.5s', borderRadius: '10px' }}></div></div>
                    <p style={{ fontSize: '10px', color: '#718096', marginTop: '5px', textAlign: 'right' }}>*Kira ve Aidat dahil edilmemiştir.</p>
                </div>
            </div>

            {/* MAAŞLAR */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2d3748' }}>💰 Maaşlar & Düzenli Gelirler</h4>
                    <button onClick={() => modalAc('yeni_maas')} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: '#48bb78', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '4px' }}>+</span> Ekle
                    </button>
                </div>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
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
            </div>

            {/* HESAPLAR */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2d3748' }}>💳 Cüzdanlar & Kartlar</h4>
                    <button onClick={() => modalAc('yeni_hesap')} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: '#3182ce', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '4px' }}>+</span> Ekle
                    </button>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    {hesaplar.map(h => {
                        let gosterilenBakiye = h.guncelBakiye;
                        return (
                            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                <div><b>{h.hesapAdi}</b> <small style={{ color: '#aaa' }}>({h.hesapTipi})</small><span onClick={() => modalAc('duzenle_hesap', h)} style={{ fontSize: '10px', cursor: 'pointer', marginLeft: '5px', color: 'blue' }}>✏️</span></div>
                                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    <span style={{ color: gosterilenBakiye < 0 ? 'red' : 'green', fontWeight: '600' }}>{gosterilenBakiye > 0 && '+'}{formatPara(gosterilenBakiye)}</span>
                                    {h.hesapTipi === 'krediKarti' && parseFloat(h.guncelBakiye) !== 0 && <button onClick={() => modalAc('kredi_karti_ode', h)} style={{ background: '#805ad5', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginLeft: '5px' }}>Borç Öde</button>}
                                    <span onClick={() => hesapSilGuvenli(h.id, h.hesapAdi)} style={{ cursor: 'pointer', color: 'red', fontSize: '12px' }}>🗑️</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee', textAlign: 'right', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ color: '#2d3748', fontWeight: '600' }}>Toplam Net Varlık:</span>
                        <span style={{ color: netVarlik >= 0 ? '#2f855a' : '#c53030', fontWeight: 'bold', fontSize: '16px' }}>
                            {formatPara(netVarlik)}
                        </span>
                    </div>

                </div>
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

            {/* FATURALAR KARTI (SOL TARAF) */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2d3748' }}>🧾 Faturalar</h4>
                    <button onClick={() => modalAc('yeni_fatura_tanim')} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: '#718096', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '4px' }}>+</span> Ekle
                    </button>
                </div>
                <div style={{ marginBottom: '15px' }}>
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
            </div>

            {/* ABONELİKLER */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2d3748' }}>🔄 Sabit Giderler</h4>
                    <button onClick={() => modalAc('yeni_abonelik')} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: '#805ad5', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '4px' }}>+</span> Ekle
                    </button>
                </div>
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
            </div>

            {/* BORÇLAR KARTI */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2d3748' }}>💸 Borçlar</h4>
                    <button onClick={() => modalAc('yeni_borc')} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: '#e53e3e', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '4px' }}>+</span> Borç Tanımla
                    </button>
                </div>
                {(!borclar || borclar.length === 0) ? <p style={{ fontSize: '13px', color: '#aaa' }}>Aktif borç bulunmuyor.</p> :
                    <div style={{ marginBottom: '15px' }}>
                        {borclar.map(b => {
                            const kalan = parseFloat(b.kalanTutar) || 0;
                            const toplam = parseFloat(b.toplamTutar) || 0;
                            const yuzde = toplam > 0 ? ((toplam - kalan) / toplam) * 100 : 0;

                            return (
                                <div key={b.id} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{b.ad}</div>
                                        <span style={{ fontWeight: 'bold' }}>{formatPara(kalan)} <small style={{ color: '#999' }}>Kaldı</small></span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                                        <span>Toplam: {formatPara(toplam)}</span>
                                        {b.sonOdemeTarihi && <span>Son: {tarihSadeceGunAyYil(b.sonOdemeTarihi)}</span>}
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', marginBottom: '10px' }}><div style={{ width: `${yuzde}%`, height: '100%', background: '#e53e3e', borderRadius: '4px', transition: 'width 0.5s' }}></div></div>
                                    <div style={{ textAlign: 'right' }}>
                                        <button onClick={() => modalAc('borc_ode', b)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>Ödeme Yap</button>
                                        <span onClick={() => modalAc('duzenle_borc', b)} style={{ cursor: 'pointer', marginLeft: '10px' }}>✏️</span>
                                        <span onClick={() => normalSil("borclar", b.id)} style={{ cursor: 'pointer', marginLeft: '10px' }}>🗑️</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', fontSize: '13px' }}>
                    <span style={{ color: '#718096' }}>Toplam Kalan Borç: <b style={{ color: '#e53e3e', fontSize: '16px' }}>{formatPara(toplamKalanBorc)}</b></span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
