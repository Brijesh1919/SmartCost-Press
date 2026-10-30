# Smart Press Cost Calculator (Android)

**Smart Press Cost Calculator** is an industrial-grade, 100% offline mobile costing and quotation application designed specifically for **Smart Printing Press, Dehradun, Uttarakhand**.

Built with **React Native (Expo)**, pure JavaScript (no TypeScript), and styled with the **Industrial Blue Press Utility** design system directly retrieved from **Google Stitch** (Project ID: `9223740624035460481`).

---

## 🚀 Features

- **100% Offline-First Architecture**: No backend server, no remote database, no authentication or login screens. Opens directly to the Home Dashboard.
- **Dedicated Pure JavaScript Costing Engine**:
  - Geometric Sheet Layout Optimizer (Straight 0° vs Rotated 90°, Ups calculation, and Sheet Area Utilization %).
  - Offset Press Running Cost (per 1,000-sheet slabs, sides, and colors).
  - CTP Thermal Plate calculation with manual override.
  - Multi-stock dual paper support (Cover Board + Inner Pages for Catalogues/Booklets).
  - Variable post-press finishing (Lamination, Folding, Die-cutting, Binding) and fixed charges (Guillotine Cutting, Packing).
  - Mathematical distinction between **Profit Markup on Cost** and **Target Profit Margin on Selling Price**.
  - Optional GST billing configuration (None, 5%, 12%, 18% - Exclusive / Inclusive).
- **Trilingual Parity**:
  - English
  - Hindi (हिन्दी)
  - Gujarati (ગુજરાતી)
- **Appearance & Theme**: Light Mode (दिन), Dark Mode (रात), and System Auto.
- **Local Persistence with AsyncStorage**:
  - Offline quotation storage with frozen input/calculation snapshots.
  - Quotation search, status filtering (Quoted, Approved, Delivered), and duplicate to new costing.
  - Shop floor rate configuration and JSON backup export.
- **Offline PDF Generation & Android Native Share**:
  - Printable PDF Job Slip generation using `expo-print`.
  - Native Android share sheet and WhatsApp plain text quotation sharing.

---

## 📁 Project Structure

```
SmartCost Press/
├── App.js                     # Root App container & Android hardware back button handler
├── app.json                   # Expo Android app configuration (com.smartprintingpress.costcalculator)
├── package.json               # Dependencies & test scripts
├── src/
│   ├── calculations/          # Pure JavaScript calculation engines (100% testable)
│   │   ├── layoutEngine.js    # Geometric Sheet layout, Ups, area utilization
│   │   ├── costEngine.js      # Paper, Offset printing, CTP plates, finishing, margins
│   │   ├── index.js           # Engine export
│   │   └── __tests__/         # Unit test suite
│   │       └── calculation.test.js
│   ├── constants/             # Design tokens, product definitions & translations
│   │   ├── theme.js           # Industrial Blue Press Utility tokens (Colors, Typography)
│   │   ├── products.js        # 12 printing press products & standard sheet sizes
│   │   ├── translations.js    # English, Hindi (हिन्दी), and Gujarati (ગુજરાતી)
│   │   └── defaultRates.js    # Dehradun standard shop floor rates
│   ├── storage/               # AsyncStorage offline persistence
│   │   ├── storageKeys.js     # Versioned keys
│   │   ├── settingsStorage.js # Local rate settings & preferences
│   │   └── quotationStorage.js# Quotation CRUD & JSON export
│   ├── context/               # React Context Providers
│   │   ├── AppSettingsContext.js # Theme, language, rates
│   │   └── CostingContext.js     # Multi-step costing state & live calculations
│   ├── components/            # Reusable UI components matching Stitch design
│   │   ├── Header.js          # Top bar with Logo, Language pill, Theme toggle
│   │   ├── BottomNav.js       # 4-Tab Bottom navigation
│   │   ├── StepProgressBar.js # 4-Step Progress indicator
│   │   ├── Card.js            # Industrial utility card
│   │   ├── InputField.js      # Paper ledger styled (#FFF8DF) numeric input with steppers
│   │   ├── PillGroup.js       # Segmented control chips
│   │   ├── StatRow.js         # Key-value metric rows
│   │   ├── LayoutVisualizer.js# 2D visual press sheet cut preview
│   │   └── ActionButton.js    # 48px tactile touch target action buttons
│   ├── screens/               # 8 Core Stitch Screens
│   │   ├── HomeScreen.js      # Home Dashboard
│   │   ├── Step1ProductScreen.js # Step 1: Product Selection & Dimensions
│   │   ├── Step2PaperScreen.js   # Step 2: Paper & Offset Printing
│   │   ├── Step3LayoutScreen.js  # Step 3: Sheet Layout & Finishing
│   │   ├── Step4SummaryScreen.js # Step 4: Cost Summary & Quotation Preview
│   │   ├── QuotationsListScreen.js # Quotations List with search & filters
│   │   ├── QuotationDetailScreen.js# Quotation detail breakdown & actions
│   │   └── SettingsScreen.js  # Shop Floor Rates & Preferences
│   └── utils/
│       ├── currency.js        # Indian Rupee (₹) formatting
│       └── pdfGenerator.js    # Offline PDF generator & WhatsApp text exporter
```

---

## 🛠️ Commands to Run and Build

### 1. Run Unit Tests
```bash
npm test
```

### 2. Start Expo Development Server
```bash
npm start
```
Or start directly targeting Android:
```bash
npm run android
```

### 3. Build Android APK (Offline / Standalone)
To build a standalone installable APK using EAS Build:
```bash
npx eas-cli build --platform android --profile preview
```
Or to generate a local Android native project (prebuild):
```bash
npx expo run:android
```

