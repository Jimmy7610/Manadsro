# Månadsro

> **Familjens ekonomi, lugnt och enkelt.**

Månadsro är en varm, lugn och modern hushållsekonomiapp för familjebudgetering. Appen är designad för att vara lokal-först – all data stannar på din enhet.

![Build](https://img.shields.io/badge/Build-1-teal)
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

## 📋 Build 1 – Innehåll

### ✅ Implementerat
- Komplett filstruktur och arkitektur
- Datamodeller (TypeScript-typer)
- Demodata (hushåll, profiler, konton, transaktioner, räkningar, budgetar)
- Dashboard med 7 kort:
  - Hero-kort med statusmeddelande
  - Fritt utrymme (kvar att röra sig med)
  - Kontosaldo-översikt
  - Kommande räkningar
  - Budgetstatus med framstegsindikatorer
  - Senaste transaktioner
  - Profilfördelning
- Responsiv layout (mobil + desktop)
- Ljust/mörkt tema med växlare
- Versionsbricka ("Månadsro • Build 1")
- Sidofält (desktop) med navigation
- Bottenmeny (mobil) med navigation
- Flytande plus-knapp med snabbmeny
- Platshållarsidor för alla sektioner
- Beräkningshjälpare (saldo, fritt utrymme, budgetanvändning)
- Lagringsadapter (förberedd för framtida IndexedDB/SQLite)

### ❌ Inte implementerat i Build 1
- PIN-inloggning
- Riktig databas (IndexedDB/SQLite)
- CRUD-formulär (skapa/redigera/ta bort)
- Import/export av data
- Kvittobilder
- Bankkoppling
- Molnsynk
- Autentisering
- Tauri-integration

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
│       ├── TransactionsPage.tsx   # Transaktioner (platshållare)
│       ├── BillsPage.tsx          # Räkningar (platshållare)
│       ├── BudgetPage.tsx         # Budget (platshållare)
│       ├── AccountsPage.tsx       # Konton (platshållare)
│       └── SettingsPage.tsx       # Inställningar (platshållare)
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

### Build 2
- CRUD-formulär för transaktioner
- IndexedDB-lagring
- Filtrering och sökning

### Build 3
- Tauri-integration
- SQLite-databas
- PIN-inloggning

### Build 4+
- Import/export
- Kvittobilder
- Statistik och grafer
- Budgethistorik

---

## 📄 Licens

Privat projekt.
