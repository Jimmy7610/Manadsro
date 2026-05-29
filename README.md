# Månadsro

> **Familjens ekonomi, lugnt och enkelt.**

Månadsro är en varm, lugn och modern hushållsekonomiapp för familjebudgetering. Appen är designad för att vara lokal-först – all data stannar på din enhet.

![Build](https://img.shields.io/badge/Build-8-teal)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)

---

## 🌙 Om projektet

Månadsro hjälper familjer att hålla koll på sin ekonomi utan stress. Ingen bank-koppling, ingen molntjänst – bara enkel överblick och lugn kontroll.

### Design

- **Ljust tema**: Varm off-white bakgrund, mjuka beige/gråa kort, petrol-accenter
- **Mörkt tema**: Djup blågrå bakgrund, premiumkort, mint/petrol-accenter
- **Responsiv**: Mobil-först med bottenmeny, desktop med sidofält

---

## 🚀 Kom igång

```bash
npm install
npm run dev
```

Öppna [http://localhost:5173](http://localhost:5173) i din webbläsare.

### Bygg för produktion

```bash
npm run build
npm run preview
```

---

## 📦 Teknikstack

| Teknik | Version | Syfte |
|--------|---------|-------|
| React | 19 | UI-ramverk |
| TypeScript | 6 | Typsäkerhet |
| Vite | 8 | Byggverktyg |
| React Router | 7 | Routing |
| CSS | - | Styling (inga tunga ramverk) |

---

## 📋 Build 8 – Innehåll

### ✅ Implementerat i Build 8
- Hantering av räkningar (lägg till, redigera, hoppa över för aktuell månad).
- Stöd för återkommande räkningar.
- Förbättrad dashboard med månadens status för utgifter.
- Fortsatt robust localStorage persistens och backupkompatibilitet.

### ❌ Aktuella begränsningar
- Riktig databas (IndexedDB/SQLite kommer senare).
- Inget riktigt kvitto-uppladdningssystem eller bankkopplingar.
- Kategorihantering kommer i framtida builds.

---

## 🗂️ Filstruktur

```
src/
├── app/
│   ├── App.tsx                    # Huvudapp med routing
│   ├── layout/
│   │   ├── AppShell.tsx           # Huvudlayout
│   │   ├── Sidebar.tsx            # Desktop-sidofält
│   │   ├── BottomNav.tsx          # Mobilmeny
│   │   └── VersionBadge.tsx       # Versionsbricka
│   └── routes/
│       ├── DashboardPage.tsx      # Dashboard
│       ├── TransactionsPage.tsx   # Transaktioner
│       ├── BillsPage.tsx          # Räkningar
│       ├── BudgetPage.tsx         # Budget
│       ├── AccountsPage.tsx       # Konton
│       └── SettingsPage.tsx       # Inställningar
├── features/
│   ├── dashboard/                 # Dashboard-kort
│   ├── accounts/                  # Kontotjänster
│   ├── transactions/              # Transaktionstjänster
│   ├── bills/                     # Räkningstjänster
│   ├── budget/                    # Budgettjänster
│   ├── categories/                # Kategoritjänster
│   ├── onboarding/                # (förberett)
│   ├── security/                  # (förberett)
│   └── backup/                    # (förberett)
├── shared/
│   ├── components/                # Delade UI-komponenter
│   ├── hooks/                     # (förberett)
│   ├── utils/                     # Hjälpfunktioner
│   └── styles/                    # Design tokens & globala stilar
├── storage/
│   ├── adapters/                  # Lagringsadaptrar
│   └── services/                  # Datatjänster
├── data/
│   ├── demo/                      # Demodata
│   └── defaults/                  # Standardvärden
└── types/
    └── models.ts                  # TypeScript-datamodeller
```

---

## ⚙️ Inställningar

Alla ändringsbara parametrar i koden är markerade med kommentaren:
```
INSTÄLLNING - [beskrivning]
```

---

## 🔮 Planerade builds

### Build 9
- Förbättrad onboarding setup för första riktiga ekonomin, eller kategorihantering.

### Framtid
- Tauri-integration och SQLite-databas.
- Statistik och grafer
- Utökad hantering av återkommande data.

---

## 📄 Licens

Privat projekt.
