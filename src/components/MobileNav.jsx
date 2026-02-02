import React from 'react';

const MobileNav = ({ modalAc, scrollToTop, scrollToHistory, scrollToForm }) => {
    const navStyle = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        paddingBottom: '10px', // iPhone Home indicator
        boxSizing: 'border-box'
    };

    const itemStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: '#718096',
        cursor: 'pointer',
        gap: '4px',
        background: 'none',
        border: 'none',
        padding: '5px'
    };

    // Center button (Add)
    const addButtonStyle = {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#805ad5', // Purple theme
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(128, 90, 213, 0.4)',
        border: 'none',
        cursor: 'pointer',
        marginBottom: '20px' // Push it up a bit
    };

    return (
        <div className="mobile-nav" style={navStyle}>
            {/* Home */}
            <button style={itemStyle} onClick={scrollToTop}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9.5L12 2L21 9.5V21C21 21.5523 20.5523 22 20 22H15V16H9V22H4C3.44772 22 3 21.5523 3 21V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Özet</span>
            </button>

            {/* History */}
            <button style={itemStyle} onClick={scrollToHistory}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 2 16.9706 2 12C2 7.02944 7.02944 2 12 2C16.9706 2 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Geçmiş</span>
            </button>

            {/* Add (Big Button) */}
            <button style={addButtonStyle} onClick={scrollToForm}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Analysis/Stats (Optional, replacing with 'Islemler' or keeping simplistic) */}
            {/* I'll use 'Settings' as requested */}

            <button style={itemStyle} onClick={() => modalAc('ayarlar_yonetim')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Ayarlar</span>
            </button>
        </div>
    );
};

export default MobileNav;
