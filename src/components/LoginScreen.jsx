import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginScreen = ({
    user,
    loading,
    girisYap,
    girilenKod,
    setGirilenKod,
    aileKoduKaydet,
    cikisYap
}) => {

    // Yükleniyor durumu
    if (loading) return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '1.2rem',
            fontFamily: "'Georgia', 'Times New Roman', serif"
        }}>
            Yükleniyor...
        </div>
    );

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Arka Plan Dekoru */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '150px',
                fontWeight: 'bold',
                color: 'white',
                opacity: 0.03,
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                fontFamily: 'sans-serif'
            }}>
                BÜTÇEM
            </div>

            {/* Beyaz Kart */}
            <div style={{
                backgroundColor: '#ffffff',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                width: '90%',
                maxWidth: '400px',
                textAlign: 'center',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                position: 'relative',
                zIndex: 10
            }}>
                {/* İkon */}
                <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#fffaf0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                }}>
                    <span style={{ fontSize: '30px' }}>🔐</span>
                </div>

                {/* Başlık ve Açıklama */}
                <h2 style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#2d3748',
                    marginBottom: '10px',
                    marginTop: 0
                }}>
                    {user ? "Aile Alanı Girişi" : "Hoş Geldiniz"}
                </h2>

                <p style={{
                    fontSize: '14px',
                    color: '#718096',
                    marginBottom: '30px',
                    lineHeight: '1.5'
                }}>
                    {user
                        ? "Verilerinize erişmek için güvenlik kodunuzu girin."
                        : "Devam etmek için lütfen giriş yapın."}
                </p>

                {/* Ana İçerik: Form veya Google Login */}
                {!user ? (
                    <button
                        onClick={girisYap}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            backgroundColor: '#3182ce',
                            color: 'white',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            boxShadow: '0 4px 6px rgba(66, 153, 225, 0.4)',
                            transition: 'transform 0.1s'
                        }}
                    >
                        Google ile Giriş Yap
                    </button>
                ) : (
                    <form onSubmit={aileKoduKaydet}>
                        <input
                            type="text"
                            placeholder="Kodunuz"
                            value={girilenKod}
                            onChange={(e) => setGirilenKod(e.target.value.toUpperCase())}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                border: '2px solid #e2e8f0',
                                textAlign: 'center',
                                fontSize: '16px',
                                letterSpacing: '2px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
                                color: '#2d3748',
                                fontWeight: '600'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#4299e1'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                marginTop: '15px',
                                padding: '14px',
                                borderRadius: '12px',
                                backgroundColor: '#3182ce',
                                color: 'white',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                boxShadow: '0 4px 6px rgba(66, 153, 225, 0.4)'
                            }}
                        >
                            GİRİŞ YAP
                        </button>
                    </form>
                )}

                {/* Footer: Kullanıcı Bilgisi ve Çıkış */}
                {user && (
                    <div style={{ marginTop: '25px', borderTop: '1px solid #edf2f7', paddingTop: '15px' }}>
                        <p style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '5px' }}>
                            Giriş yapan hesap:
                        </p>
                        <p style={{ fontSize: '13px', color: '#4a5568', fontWeight: '500', marginBottom: '10px' }}>
                            {user.email}
                        </p>
                        <button
                            onClick={cikisYap}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#e53e3e',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                textDecoration: 'underline'
                            }}
                        >
                            Çıkış Yap
                        </button>
                    </div>
                )}
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default LoginScreen;
