# Daily Life Manager 📱💰🥗
**Repository:** [neeteshkhatry-art/daily-life-manager-khatry](https://github.com/neeteshkhatry-art/daily-life-manager-khatry)  
**Author:** Neetesh Khatry ([neetesh.khatry@gmail.com](mailto:neetesh.khatry@gmail.com))  
**Platform:** Android Mobile (PWA & Native APK) + Web  

A complete, modern Android application that seamlessly combines **personal finance management, budgeting, expense/income tracking, financial reporting, and daily diet & nutrition logging** in one integrated, offline-first application for everyday users.

---

## 🌟 Key Features

### 1. 💰 Financial & Transaction Management (Integer Paise Precision)
- **Zero Floating-Point Errors**: Stores all currency in integer paise ($1\text{ INR} = 100\text{ paise}$).
- **Indian Financial Ecosystem**: Tailored for UPI (GPay, PhonePe, Paytm), Cash in hand, Bank NEFT/IMPS, Debit Cards, and Credit Cards.
- **Rich Categories**: Groceries, Mandi Vegetables, Milk & Dairy, Rent, BESCOM/Electricity, Gas LPG/PNG, Mobile Recharge, Broadband, Metro & Fuel, Medical, Education, EMIs, and Shagun.
- **Passbook & Search**: Instant filter by type (Expense, Income, Transfer), account, category, and date range.
- **Receipt Attachments**: Attach bill receipts or capture photos directly.

### 2. 🏦 Accounts, Wallets & Transfers
- Multiple accounts (Cash in Hand, SBI Salary, HDFC Savings, Paytm/PhonePe Wallets, Credit Cards).
- Real-time balance calculations with **opening balance** tracking.
- **Inter-Account Transfers**: Move funds between bank and digital wallet without double-counting transfers as income or expenses.
- **Insufficient Funds Alert**: Warns before finalizing a transaction if account balance is insufficient.

### 3. 🎯 Budgets, Savings Goals & Khata Ledger
- Set overall monthly budgets and individual category caps with threshold alerts.
- **Savings Goals**: Track Emergency Fund, Festival trips, and gadget goals with target dates and deposit logging.
- **Udhar / Khata Ledger**: Track money lent (receivable) and borrowed (payable) with 1-tap settlement.

### 4. 📊 Financial Analytics & Reports
- Filter reports by: **Today, Yesterday, Current Week, Previous Week, Current Month, Previous Month, Current Year, Previous Year, or Custom Range**.
- Interactive SVG charts: Daily cash flow trend bars, category-wise donut chart, payment-method distribution, and largest single expenses.
- **Export & Share**: 1-tap **CSV spreadsheet export**, **print-ready PDF statement**, and **Web Share**.

### 5. 🥗 Diet & Nutrition Tracker
- Log meals by type: **Breakfast, Morning Snack, Lunch, Evening Snack, Dinner**.
- Pre-loaded Indian food database with serving multipliers:
  - *Wheat Roti, Dal Tadka, Basmati Rice, Paneer Butter Masala, Idli with Sambar, Masala Dosa, Kanda Poha, Vegetable Upma, Egg Bhurji, Chicken Curry, Masala Chai, Fresh Curd, etc.*
- **Custom Food Creator**: Add your own recipes and save them to your personal food library.
- **Hydration Tracker**: Target tracking with 1-tap `+250ml` glass logger.
- **Weight History**: Track body weight changes over time.
- **7-Day Nutrition Trend**: Compare daily caloric intake against your personal target.

### 6. 🔒 Security & Offline Privacy
- **100% Local Storage**: All data stays private on your device.
- **4-Digit PIN App Lock**: Built-in PIN keypad lock.
- **Backup & Restore**: Export full JSON snapshot and restore anytime.

---

## 🚀 Getting Started

### 1. Clone & Run Locally
```bash
# Clone the repository
git clone https://github.com/neeteshkhatry-art/daily-life-manager-khatry.git

# Navigate into the project folder
cd daily-life-manager-khatry

# Install dependencies
npm install

# Start development server
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📱 Android APK Generation

The repository includes ready-to-build Android Gradle configuration files in `/android-template/`.

### Output Paths

| Build Target | Exact Output Path | Build Command |
| :--- | :--- | :--- |
| **Debug APK** | `app/build/outputs/apk/debug/app-debug.apk` | `./gradlew assembleDebug` |
| **Signed Release APK** | `app/build/outputs/apk/release/app-release.apk` | `./gradlew assembleRelease` |

### Step 1: Package Web Assets
```bash
npm run build
```

### Step 2: Initialize & Sync Android Studio Project
```bash
npx cap add android
npx cap sync android
```

### Step 3: Compile Signed Release APK
Generate keystore:
```bash
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias dailylifemanager
```
Compile release APK:
```bash
cd android
./gradlew assembleRelease
```
The production signed release APK will be generated at:
`app/build/outputs/apk/release/app-release.apk`

---

## 💻 Tech Stack
- **Frontend Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (Material 3 Touch Design)
- **Icons**: Lucide Icons
- **Precision Storage**: Integer Paise Math + Offline LocalStorage / IndexedDB
- **Target OS**: Android 8.0+ (API 26+) & Modern Web Browsers

---

## 📄 License
Apache-2.0 License. Built by [Neetesh Khatry](https://github.com/neeteshkhatry-art).
