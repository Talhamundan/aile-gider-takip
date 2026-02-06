import React from 'react';


const TransactionArea = ({
    formTab, setFormTab,
    hesaplar,
    kategoriListesi,
    aileUyeleri,
    islemEkle,
    transferYap,
    taksitEkle,
    faturaGir,
    filtrelenmisIslemler,
    aramaMetni, setAramaMetni,
    filtreKategori, setFiltreKategori,
    filtreKisi, setFiltreKisi,
    excelIndir,
    excelYukle,
    modalAc,
    islemSil,
    formatPara,
    tarihFormatla,
    netToplam,

    // Form States
    secilenHesapId, setSecilenHesapId,
    islemTipi, setIslemTipi,
    harcayanKisi, setHarcayanKisi,
    kategori, setKategori,
    islemAciklama, setIslemAciklama,
    islemTutar, setIslemTutar,
    islemTarihi, setIslemTarihi,
    transferKaynakId, setTransferKaynakId,
    transferHedefId, setTransferHedefId,
    transferTutar, setTransferTutar,
    transferUcreti, setTransferUcreti,
    transferTarihi, setTransferTarihi,
    taksitBaslik, setTaksitBaslik,
    taksitHesapId, setTaksitHesapId,
    taksitToplamTutar, setTaksitToplamTutar,
    taksitSayisi, setTaksitSayisi,
    taksitKisi, setTaksitKisi,
    taksitKategori, setTaksitKategori,
    taksitAlisTarihi, setTaksitAlisTarihi,
    tanimliFaturalar,
    secilenTanimId, setSecilenTanimId,
    faturaGirisTutar, setFaturaGirisTutar,
    faturaGirisTarih, setFaturaGirisTarih,
    faturaGirisAciklama, setFaturaGirisAciklama,
    faturaKisi, setFaturaKisi,

    // Filter States
    mevcutAylar,
    aktifAy, setAktifAy

}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

            {/* 1. KART: VERİ GİRİŞ FORMLARI */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => setFormTab("islem")} style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '11px', fontWeight: 'bold', padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "islem" ? '#ed8936' : '#edf2f7', color: formTab === "islem" ? 'white' : '#4a5568' }}>Gelir / Gider</button>
                        <button onClick={() => setFormTab("transfer")} style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '11px', fontWeight: 'bold', padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "transfer" ? '#3182ce' : '#edf2f7', color: formTab === "transfer" ? 'white' : '#4a5568' }}>Transfer</button>
                        <button onClick={() => setFormTab("taksit")} style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '11px', fontWeight: 'bold', padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "taksit" ? '#805ad5' : '#edf2f7', color: formTab === "taksit" ? 'white' : '#4a5568' }}>Taksit</button>
                        <button onClick={() => setFormTab("fatura")} style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '11px', fontWeight: 'bold', padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "fatura" ? '#c53030' : '#edf2f7', color: formTab === "fatura" ? 'white' : '#4a5568' }}>Fatura Gir</button>
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
                        <input type="datetime-local" value={islemTarihi} onChange={e => setIslemTarihi(e.target.value)} max="9999-12-31T23:59" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} />
                        <button type="submit" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", padding: '15px', background: '#ed8936', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>KAYDET</button>
                    </form>
                )}

                {/* TRANSFER FORMU */}
                {formTab === "transfer" && (
                    <form onSubmit={transferYap} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#ebf8ff', padding: '20px', borderRadius: '10px' }}>
                        <div><label style={{ fontSize: '12px', color: '#2b6cb0' }}>Nereden?</label><select value={transferKaynakId} onChange={e => setTransferKaynakId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}><option value="">Seçiniz...</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({h.guncelBakiye}₺)</option>)}</select></div>
                        <div><label style={{ fontSize: '12px', color: '#2b6cb0' }}>Nereye?</label><select value={transferHedefId} onChange={e => setTransferHedefId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}><option value="">Seçiniz...</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({h.guncelBakiye}₺)</option>)}</select></div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                            <input type="number" placeholder="İşlem Tutarı (₺)" value={transferTutar} onChange={e => setTransferTutar(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} required />
                            <input type="number" placeholder="Ücret (Opsiyonel)" value={transferUcreti} onChange={e => setTransferUcreti(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <input type="datetime-local" value={transferTarihi} onChange={e => setTransferTarihi(e.target.value)} max="9999-12-31T23:59" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} />
                        </div>

                        <button type="submit" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", gridColumn: 'span 2', padding: '15px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>TRANSFER YAP / BORÇ ÖDE</button>
                    </form>
                )}

                {/* TAKSİT FORMU */}
                {formTab === "taksit" && (
                    <form onSubmit={taksitEkle} className="taksit-form-grid">
                        <div className="span-full"><h4 style={{ margin: '0 0 10px 0', color: '#6b46c1' }}>📦 Yeni Taksit Planı Oluştur</h4></div>
                        <select value={taksitHesapId} onChange={e => setTaksitHesapId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }} required><option value="">Hangi Karttan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                        <input placeholder="Ne aldın?" value={taksitBaslik} onChange={e => setTaksitBaslik(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }} required />
                        <input type="number" placeholder="Toplam Borç (₺)" value={taksitToplamTutar} onChange={e => setTaksitToplamTutar(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }} required />
                        <input type="number" placeholder="Kaç Taksit?" value={taksitSayisi} onChange={e => setTaksitSayisi(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }} required />
                        <select value={taksitKisi || aileUyeleri[0]} onChange={e => setTaksitKisi(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }}>{aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}</select>
                        <select value={taksitKategori || kategoriListesi[0]} onChange={e => setTaksitKategori(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                        <input type="date" value={taksitAlisTarihi} onChange={e => setTaksitAlisTarihi(e.target.value)} max="9999-12-31" className="span-full" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d6bcfa', boxSizing: 'border-box' }} />
                        <div className="span-full" style={{ fontSize: '14px', color: '#553c9a', fontWeight: 'bold', padding: '10px', background: 'white', borderRadius: '8px' }}>ℹ️ Aylık: {taksitToplamTutar && taksitSayisi ? formatPara(taksitToplamTutar / taksitSayisi) : '0,00 ₺'}</div>
                        <button type="submit" className="span-full" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", padding: '15px', background: '#805ad5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>KAYDET</button>
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
                                    <select value={faturaKisi} onChange={e => setFaturaKisi(e.target.value)} style={{ fontFamily: "'Georgia', 'Times New Roman', serif", marginTop: '10px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #feb2b2', boxSizing: 'border-box' }} required>
                                        <option value="">Kime Ait?</option>
                                        {aileUyeleri.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>

                                <input type="number" placeholder="Tutar (₺)" value={faturaGirisTutar} onChange={e => setFaturaGirisTutar(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #feb2b2', width: '100%', boxSizing: 'border-box' }} required />

                                <input type="date" value={faturaGirisTarih} onChange={e => setFaturaGirisTarih(e.target.value)} max="9999-12-31" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #feb2b2', width: '100%', boxSizing: 'border-box' }} required />

                                <input placeholder="Açıklama (Opsiyonel)" value={faturaGirisAciklama} onChange={e => setFaturaGirisAciklama(e.target.value)} style={{ gridColumn: 'span 2', padding: '12px', borderRadius: '8px', border: '1px solid #feb2b2', width: '100%', boxSizing: 'border-box' }} />

                                <button type="submit" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", gridColumn: 'span 2', padding: '15px', background: '#c53030', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>KAYDET</button>
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
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '5px', WebkitOverflowScrolling: 'touch' }}>
                        {mevcutAylar.map(ay => (
                            <button key={ay} onClick={() => setAktifAy(ay)} style={{ flexShrink: 0, padding: '5px 10px', fontSize: '12px', borderRadius: '15px', border: 'none', cursor: 'pointer', background: aktifAy === ay ? '#2c3e50' : '#edf2f7', color: aktifAy === ay ? 'white' : '#4a5568', fontWeight: 'bold' }}>{ay}</button>
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
                </footer>
            </div>
        </div>
    );
};

export default TransactionArea;
