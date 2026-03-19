import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { cardStyle } from '../utils/helpers';

const DashboardStats = ({
    user,
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
    gizliMod,
    gizliModDegistir,
    aileUyeleri,
    filtrelenmisIslemler,
    gunlukOrtalama,
    COLORS,
    abonelikOde,
    taksitOde,
    maasYatir
}) => {
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth <= 767 : false
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const kategoriModernData = kategoriVerisi
        .filter((item) => Number(item.value) > 0)
        .map((item, index) => ({
            ...item,
            color: COLORS[index % COLORS.length]
        }));

    const toplamKategoriTutar = kategoriModernData.reduce((acc, item) => acc + Number(item.value || 0), 0);
    const kategoriLegendData = [...kategoriModernData].sort((a, b) => Number(b.value) - Number(a.value));
    const kullaniciAdi = user?.displayName?.split(' ')[0] || 'Kullanıcı';

    return (
        <>
            {/* HEADER */}
            <div className="dashboard-header" style={{ textAlign: 'center', marginBottom: '30px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#1a202c', letterSpacing: '-1px' }}>🏡 AİLE BÜTÇESİ</h1>
                </div>
                <div className="dashboard-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="dashboard-user-badge">
                        <button
                            onClick={gizliModDegistir}
                            className={`dashboard-icon-btn dashboard-icon-btn-neutral ${gizliMod ? 'dashboard-icon-btn-active' : ''}`}
                            title={gizliMod ? 'Gizli modu kapat' : 'Gizli modu aç'}
                            aria-label={gizliMod ? 'Gizli modu kapat' : 'Gizli modu aç'}
                        >
                            👁️
                        </button>
                        <span>{kullaniciAdi}</span>
                    </div>
                    <button
                        onClick={() => setAktifModal('ayarlar_yonetim')}
                        className="dashboard-icon-btn dashboard-icon-btn-neutral"
                        title="Ayarlar"
                        aria-label="Ayarlar"
                    >
                        ⚙️
                    </button>
                    <button
                        onClick={aileKoduCikis}
                        className="dashboard-icon-btn dashboard-icon-btn-neutral"
                        title="Aile Kodunu Değiştir"
                        aria-label="Aile Kodunu Değiştir"
                    >
                        🔑
                    </button>
                    <button
                        onClick={cikisYap}
                        className="dashboard-icon-btn dashboard-icon-btn-danger"
                        title="Çıkış"
                        aria-label="Çıkış"
                    >
                        🚪
                    </button>
                </div>
            </div>

            {/* BİLDİRİM ALANI (SADECE ACİL OLANLAR) */}
            {bildirimler.length > 0 && (
                <div style={{ marginBottom: '30px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '10px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ margin: 0, color: '#c53030', display: 'flex', alignItems: 'center', gap: '5px' }}>⏳ Bekleyen İşlemler</h4>
                    <div className="dashboard-alert-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
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
            <div className="responsive-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div className="responsive-card" style={{ ...cardStyle, borderLeft: '5px solid #48bb78' }}>
                    <div className="card-title-sm responsive-title">TOPLAM GELİR ({aktifAy})</div>
                    <div className="kpi-amount responsive-amount">{formatPara(toplamGelir)}</div>
                </div>
                <div className="responsive-card" style={{ ...cardStyle, borderLeft: '5px solid #F59E0B' }}>
                    <div className="card-title-sm responsive-title">BUGÜN HARCANAN</div>
                    <div className="kpi-amount responsive-amount">{formatPara(bugunGider)}</div>
                </div>
                <div className="responsive-card" style={{ ...cardStyle, borderLeft: '5px solid #f56565' }}>
                    <div className="card-title-sm responsive-title">GİDER ({aktifAy})</div>
                    <div className="kpi-amount-sm responsive-amount">{formatPara(toplamGider)}</div>
                </div>
            </div>

            {/* YENİ SATIR: AİLE BİREYLERİ HARCAMALARI */}
            <div style={{ marginBottom: '30px' }}>
                <h4 className="card-title" style={{ margin: '0 0 15px 0' }}>👨‍👩‍👧‍👦 Kişi Bazlı Harcamalar ({aktifAy})</h4>
                <div className="dashboard-people-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`, gap: '20px' }}>
                    {aileUyeleri.map(uye => {
                        const uyeTutar = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider' && i.harcayan === uye).reduce((acc, i) => acc + i.tutar, 0);
                        return (
                            <div key={uye} className="responsive-card" style={{ ...cardStyle, borderLeft: '4px solid #805ad5' }}>
                                <div className="card-title-sm responsive-title">{uye}</div>
                                <div className="kpi-amount-sm responsive-amount">{formatPara(uyeTutar)}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ORTA BÖLÜM: GRAFİKLER */}
            <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px' }}>
                <div className="responsive-card dashboard-trend-card" style={{ ...cardStyle, minHeight: '300px' }}>
                    <h4 className="card-title" style={{ margin: '0 0 20px 0' }}>📅 Günlük Harcama Trendi ({aktifAy})</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={gunlukVeri}
                            margin={isMobile ? { top: 5, right: 5, left: -20, bottom: 0 } : undefined}
                        >
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

                <div
                    className="responsive-card dashboard-pie-card"
                    style={{
                        ...cardStyle,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
                    }}
                >
                    <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
                        <PieChart>
                            <Pie
                                data={kategoriModernData}
                                cx="50%"
                                cy="45%"
                                innerRadius={isMobile ? 52 : 64}
                                outerRadius={isMobile ? 84 : 96}
                                paddingAngle={3}
                                cornerRadius={8}
                                dataKey="value"
                                label={false}
                                stroke="#f8fafc"
                                strokeWidth={3}
                                isAnimationActive
                                animationDuration={900}
                            >
                                {kategoriModernData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => formatPara(value)}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 10px 24px rgba(15,23,42,0.10)',
                                    fontSize: '12px',
                                    fontWeight: 700
                                }}
                            />

                            <text
                                x="50%"
                                y={isMobile ? '43%' : '42%'}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: isMobile ? '11px' : '12px', fill: '#64748b', fontWeight: 700 }}
                            >
                                Toplam Gider
                            </text>
                            <text
                                x="50%"
                                y={isMobile ? '50%' : '49%'}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: isMobile ? '16px' : '20px', fill: '#0f172a', fontWeight: 900 }}
                            >
                                {formatPara(toplamKategoriTutar)}
                            </text>
                            <text
                                x="50%"
                                y={isMobile ? '57%' : '56%'}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: isMobile ? '10px' : '11px', fill: '#94a3b8', fontWeight: 700 }}
                            >
                                {aktifAy}
                            </text>
                        </PieChart>
                    </ResponsiveContainer>

                    <div style={{ width: '100%', marginTop: isMobile ? '-8px' : '-2px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
                        {kategoriLegendData.slice(0, isMobile ? 4 : 8).map((item) => {
                            const yuzde = toplamKategoriTutar > 0 ? Math.round((Number(item.value) / toplamKategoriTutar) * 100) : 0;
                            return (
                                <div
                                    key={item.name}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '4px 8px',
                                        borderRadius: '999px',
                                        border: '1px solid #e2e8f0',
                                        background: '#ffffff',
                                        fontSize: isMobile ? '10px' : '11px',
                                        color: '#334155',
                                        fontWeight: 700
                                    }}
                                >
                                    <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: item.color }} />
                                    <span>{item.name}</span>
                                    <span style={{ color: '#94a3b8' }}>%{yuzde}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardStats;
