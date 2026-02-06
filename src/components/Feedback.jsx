import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';

const Feedback = ({ userEmail }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    // Mesaj Gönder
    const sendFeedback = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            await addDoc(collection(db, "feedbacks"), {
                text: message,
                sender: userEmail || "Anonim",
                createdAt: serverTimestamp(),
                status: "new"
            });
            toast.success("Mesajınız iletildi. Teşekkürler!");
            setMessage("");
            setIsOpen(false);
        } catch (error) {
            console.error("Hata:", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* Tetikleyici Buton (Sağ Alt) */}
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#2d3748',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    fontSize: '24px',
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'transform 0.2s',
                    fontFamily: "'Segoe UI', sans-serif"
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                title="Öneri ve Şikayet"
            >
                💬
            </button>

            {/* Modal */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(3px)',
                    zIndex: 10000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        width: '90%',
                        maxWidth: '400px',
                        borderRadius: '15px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f7fafc'
                        }}>
                            <h3 style={{ margin: 0, color: '#2d3748', fontSize: '18px' }}>📣 Öneri & Şikayet Kutusu</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#a0aec0'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form Body */}
                        <div style={{ padding: '20px' }}>
                            <p style={{ fontSize: '14px', color: '#718096', marginBottom: '15px', lineHeight: '1.5' }}>
                                Uygulamayı geliştirmemize yardımcı olun. Fikirlerinizi, karşılaştığınız hataları veya şikayetlerinizi bizimle paylaşın.
                            </p>

                            <form onSubmit={sendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Mesajınız..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e0',
                                        resize: 'none',
                                        height: '120px',
                                        fontFamily: "'Segoe UI', sans-serif",
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !message.trim()}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: !message.trim() ? '#cbd5e0' : (sending ? '#718096' : '#3182ce'),
                                        color: 'white',
                                        fontWeight: 'bold',
                                        cursor: (!message.trim() || sending) ? 'not-allowed' : 'pointer',
                                        transition: 'background 0.2s',
                                        fontSize: '15px'
                                    }}
                                >
                                    {sending ? "Gönderiliyor..." : "GÖNDER"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Feedback;
