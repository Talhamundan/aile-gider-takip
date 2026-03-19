import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const isAbortLikeError = (errorLike) => {
  if (!errorLike) return false;
  const codeOrName = String(errorLike.code || errorLike.name || '').toLowerCase();
  const message = String(errorLike.message || errorLike || '').toLowerCase();
  return (
    codeOrName.includes('abort') ||
    codeOrName.includes('cancel') ||
    message.includes('aborted') ||
    message.includes('cancelled') ||
    message.includes('user aborted a request')
  );
};

// Dev overlay'i sadece iptal edilen (abort/cancel) isteklerde sustur.
window.addEventListener('unhandledrejection', (event) => {
  if (isAbortLikeError(event.reason)) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (isAbortLikeError(event.error || event.message)) {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
