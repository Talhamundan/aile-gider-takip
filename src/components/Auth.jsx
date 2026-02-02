import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Auth = ({
    user,
    loading,
    girisYap,
    aileKodu,
    girilenKod,
    setGirilenKod,
    aileKoduKaydet
}) => {

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Yükleniyor...
        </div>
    );

    if (!user) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)', color: 'white', fontFamily: 'Segoe UI' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🏡 AİLE BÜTÇEM</h1>
            <p style={{ marginBottom: '40px' }}>Evin ekonomisi kontrol altında.</p>
            <button onClick={girisYap} style={{ padding: '15px 40px', fontSize: '1.1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', background: 'white', color: '#1a2980', fontWeight: 'bold' }}>Google ile Giriş Yap</button>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );

    if (!aileKodu) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7fafc', fontFamily: 'Segoe UI' }}>
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🔑 Aile Girişi</h2>
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#718096', marginBottom: '20px' }}>Tüm aile bireyleri aynı verileri görmek için aynı kodu girmelidir.</p>
                <form onSubmit={aileKoduKaydet}>
                    <input
                        placeholder="Aile Kodu (Örn: YILMAZLAR)"
                        value={girilenKod}
                        onChange={e => setGirilenKod(e.target.value.toUpperCase())}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', marginBottom: '15px', textAlign: 'center', fontSize: '16px', letterSpacing: '2px' }}
                        required
                    />
                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>GİRİŞ YAP</button>
                </form>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );

    return null;
};

export default Auth;
