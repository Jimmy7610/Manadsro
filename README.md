# Månadsro

> **Familjens ekonomi, lugnt och enkelt.**

Månadsro är en varm, lugn och modern hushållsekonomiapp för familjebudgetering. Appen är designad för att vara lokal-först – all data stannar på din enhet.

![Build](https://img.shields.io/badge/Build-15-teal)
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

## 📋 Build 15 – Innehåll

### ✅ Implementerat i Build 15
- Omdesignad Dashboard med insiktskort direkt på startsidan.
- Nytt kort för Månadens Netto.
- Nytt kort för Största Utgiftskategori.
- Nytt kort för Budgetvarningar.
- Nytt kort för Förväntade Inkomster.
- Polering av Kommande Räkningar-kortet.
- Nya Quick Actions på Dashboard.
- Bättre mobil-layout och rutnätsdesign för översikt.

### ✅ Implementerat i Build 14
- Ny Insikter-sida med månadsväljare.
- Visar en månadsöversikt (Inkomster, Utgifter, Räkningar, Netto).
- Visar andel utgifter per kategori och listar de största transaktionerna.
- Visar budgetvarningar om en kategori är nära eller över sin gräns.
- Saldojusteringar påverkar inte inkomst/utgifts-staplarna utan noteras separat.
- Bakåtkompatibilitet för localStorage och backups upprätthålls.

### ✅ Implementerat i Build 13
- Transaktionscenter med detaljerad sökning (fritext, belopp m.m.).
- Filtrering av transaktioner på datum, konto, kategori, profil och typ.
- Funktion för manuell saldojustering från Transaktioner- och Konton-sidorna.
- Saldojusteringar hanteras som separata transaktioner utan att ändra startsaldot.

### ✅ Implementerat i Build 12
- Ny månad-vy för att skapa en lugn plan för månadens inkomster och räkningar.
- Hantering av månad-nycklar (t.ex. "2026-05").
- Skapar och spårar förväntade inkomster från återkommande inkomster automatiskt när en månad förbereds.
- Visar återkommande räkningar som en plan för månaden utan att duplicera data.
- Bekräftelse av månadsplan och inbyggt skydd mot dubbletter.

### ✅ Implementerat i Build 11
- Återkommande inkomster och förväntade inkomster.
- Inkomstplanerings-sida.

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

### Build 16
- Export/import-förbättringar, avancerade rapporter, eller UI-polering.

### Framtid
- Tauri-integration och SQLite-databas.
- Statistik och grafer.
- Utökad hantering av återkommande data.

---

## 📄 Licens

Privat projekt.
