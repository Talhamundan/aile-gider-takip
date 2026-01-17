# 🏡 Family Budget - Expense Tracker / Aile Bütçem - Gider Takip

[![Turkish](https://img.shields.io/badge/lang-TR-red)](#-aile-bütçem---gider-takip-uygulaması) [![English](https://img.shields.io/badge/lang-EN-blue)](#-family-budget---expense-tracker-app)

---

# 🏡 Family Budget - Expense Tracker App

**Modern, Family-Oriented Personal Finance Management**

This project is a comprehensive finance tracking application allowing families to manage their income, expenses, savings, and debts from a single, synchronized platform. Thanks to the Google Firebase infrastructure, data is updated instantly across all family members' devices.

## 🌟 Features

### 🔐 Secure Family Sharing
*   **Shared Pool**: Manage the same budget by logging in with a single "Family Code".
*   **Google Sign-In**: Secure and fast authentication.

### 💰 Comprehensive Finance Tracking
*   **Income/Expense Management**: Record your expenses by category (Market, Bills, Education, etc.).
*   **Account Management**: Track cash wallets, bank accounts, and credit cards separately.
*   **Transfers**: Transfer money between accounts (e.g., Bank to Wallet).

### 💳 Advanced Debt & Installment Tracking
*   **Installment Management**: Record installment purchases; automatically track remaining installments, paid amounts, and future payments.
*   **Credit Card Statements**: Get automatic reminders when the statement cut-off date arrives.

### 📅 Smart Reminders & Subscriptions
*   **Automatic Notifications**: Get alerts for unpaid bills, due subscriptions (Netflix, Spotify, etc.), and payday.
*   **Bill Tracking**: Never miss payment dates with the "Pending Bills" feature.

### 📊 Visual Analysis & Reporting
*   **Chart-Supported Reports**: Visualize your expenses with pie and bar charts.
*   **Daily Expense Analysis**: See which days of the month you spend the most.

### 📂 Data Management
*   **Excel Integration**: Export all data to Excel format or bulk upload from Excel with a single click.
*   **Incognito Mode**: Hide total balances to protect your privacy from prying eyes.

## 🛠 Technologies Used

*   **Frontend**: [React.js](https://reactjs.org/) (Hooks, Context API)
*   **Backend & Database**: [Google Firebase](https://firebase.google.com/) (Firestore, Authentication)
*   **Charting Library**: [Recharts](https://recharts.org/)
*   **UI Components**: SweetAlert2 (Notifications), React Toastify (Toast Messages)
*   **Data Processing**: SheetJS (XLSX)

## 🚀 Installation and Setup

Follow these steps to run the project locally.

### 1. Requirements
[Node.js](https://nodejs.org/) must be installed on your computer.

### 2. Clone the Project
```bash
git clone https://github.com/USERNAME/family-budget-tracker.git
cd family-budget-tracker
```

### 3. Install Packages
```bash
npm install
```

### 4. Set Environment Variables
Create a `.env` file in the project root directory and enter your own Firebase project details as shown below (You can get these from the Firebase console).

```env
REACT_APP_API_KEY=your_api_key
REACT_APP_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_PROJECT_ID=your_project_id
REACT_APP_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_APP_ID=your_app_id
```

### 5. Start the Application
```bash
npm start
```
Go to `http://localhost:3000` in your browser. The application will open automatically.

---

# 🏡 Aile Bütçem - Gider Takip Uygulaması

**Modern, Aile Odaklı Kişisel Finans Yönetimi**

Bu proje, ailelerin gelirlerini, giderlerini, birikimlerini ve borçlarını tek bir yerden, senkronize bir şekilde yönetmelerini sağlayan kapsamlı bir finans takip uygulamasıdır. Google Firebase altyapısı sayesinde veriler anlık olarak tüm aile bireylerinin cihazlarında güncellenir.

## 🌟 Özellikler

### 🔐 Güvenli Aile Paylaşımı
*   **Ortak Havuz**: Tek bir "Aile Kodu" ile giriş yaparak tüm aile bireyleri aynı bütçeyi yönetir.
*   **Google Girişi**: Güvenli ve hızlı oturum açma.

### 💰 Kapsamlı Finans Takibi
*   **Gelir/Gider Yönetimi**: Harcamalarınızı kategorilere ayırarak (Market, Fatura, Eğitim vb.) kaydedin.
*   **Hesap Yönetimi**: Nakit cüzdanlar, banka hesapları ve kredi kartlarını ayrı ayrı takip edin.
*   **Transferler**: Hesaplar arası para transferi yapın (Örn: Bankadan Cüzdana).

### 💳 Gelişmiş Borç & Taksit Takibi
*   **Taksit Yönetimi**: Taksitli alışverişlerinizi kaydedin; kalan taksit sayısını, ödenen tutarı ve gelecek ödemeleri otomatik takip edin.
*   **Kredi Kartı Ekstreleri**: Hesap kesim tarihi geldiğinde otomatik hatırlatma alın.

### 📅 Akıllı Hatırlatıcılar & Abonelikler
*   **Otomatik Bildirimler**: Ödenmemiş faturalar, günü gelen abonelikler (Netflix, Spotify vb.) ve maaş günleri için uyarılar alın.
*   **Fatura Takibi**: "Bekleyen Faturalar" özelliği ile son ödeme tarihi yaklaşan faturaları kaçırmayın.

### 📊 Görsel Analiz & Raporlama
*   **Grafik Destekli Raporlar**: Harcamalarınızı pasta ve sütun grafiklerle görselleştirin.
*   **Günlük Harcama Analizi**: Ayın hangi günlerinde daha çok harcama yapıldığını görün.

### 📂 Veri Yönetimi
*   **Excel Entegrasyonu**: Tüm verilerinizi tek tıkla Excel formatında dışarı aktarın veya Excel'den toplu veri yükleyin.
*   **Gizli Mod**: Toplam bakiyeleri gizleyerek ekranınızı meraklı gözlerden koruyun.

## 🛠 Kullanılan Teknolojiler

*   **Frontend**: [React.js](https://reactjs.org/) (Hooks, Context API)
*   **Backend & Veritabanı**: [Google Firebase](https://firebase.google.com/) (Firestore, Authentication)
*   **Grafik Kütüphanesi**: [Recharts](https://recharts.org/)
*   **UI Bileşenleri**: SweetAlert2 (Bildirimler), React Toastify (Toast Mesajları)
*   **Veri İşleme**: SheetJS (XLSX)

## 🚀 Kurulum ve Çalıştırma

Bu projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Gereksinimler
Bilgisayarınızda [Node.js](https://nodejs.org/) kurulu olmalıdır.

### 2. Projeyi İndirin
```bash
git clone https://github.com/KULLANICI_ADI/aile-gider-takip.git
cd aile-gider-takip
```

### 3. Paketleri Yükleyin
```bash
npm install
```

### 4. Çevre Değişkenlerini (Environment Variables) Ayarlayın
Projenin kök dizininde `.env` adında bir dosya oluşturun ve kendi Firebase proje bilgilerinizi aşağıdaki gibi girin. (Bu bilgiler Firebase konsolundan alınabilir).

```env
REACT_APP_API_KEY=your_api_key
REACT_APP_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_PROJECT_ID=your_project_id
REACT_APP_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_APP_ID=your_app_id
```

### 5. Uygulamayı Başlatın
```bash
npm start
```
Tarayıcınızda `http://localhost:3000` adresine gidin. Uygulama otomatik olarak açılacaktır.

## 🤝 Katkıda Bulunma
Projeyi geliştirmek için katkılarınızı bekliyoruz! Hataları bildirmek veya yeni özellikler önermek için lütfen "Issues" kısmını kullanın.

---
**Note / Not**: This project is developed for personal use and is continuously updated. / Bu proje kişisel kullanım amacıyla geliştirilmiştir ve sürekli güncellenmektedir.
