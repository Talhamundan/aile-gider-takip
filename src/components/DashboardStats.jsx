import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const DashboardStats = ({
    user,
    aileKodu,
    bildirimler,
    toplamGelir,
    toplamGider,
    bugunGider,
    gunlukVeri,
    kategoriVerisi,
    aktifAy,
    setAktifAy,
    modalAc,
    setAktifModal,
    cikisYap,
    aileKoduCikis,
    formatPara,
    aileUyeleri,
    filtrelenmisIslemler,
    gunlukOrtalama,
    COLORS,
    abonelikOde,
    taksitOde,
    maasYatir
}) => {
    return (
        <>
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
                    <h4 style={{ margin: 0, color: '#c53030', display: 'flex', alignItems: 'center', gap: '5px' }}>⏳ Bekleyen İşlemler</h4>
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
        </>
    );
};

export default DashboardStats;
