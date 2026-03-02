# Implementation Plan — BalansLab MW2K

**Versie:** 1.0 | **Datum:** 2026-03-02
**Bron:** PRD.md + alle gelinkte documenten
**Stack:** Vite + vanilla JS/HTML/CSS + Firebase (Auth + Firestore) + pdf.js

---

## Fase-overzicht

| Fase | Scope | Duur | Gate |
|------|-------|------|------|
| **0** | Project bootstrap + infra | 1 dag | GO als dev server draait + Firebase connected |
| **1** | Balance Lab v1 | 3–4 dagen | GO als BL-* testcases uit QA_ACCEPTANCE slagen |
| **2** | Auth + Roles + Class join | 2 dagen | GO als login/logout + klascode werkt |
| **3** | Exercise Engine core | 3 dagen | GO als book exercise + validation + feedback tags werken |
| **4** | §8.2 + §8.3 pilot (Leerling Mode) | 3–4 dagen | GO als LM-01 t/m LM-13 slagen |
| **5** | Digibord Mode + PDF viewer | 2 dagen | GO als DM-01 t/m DM-08 slagen |
| **6** | Docent Dashboard basis | 2 dagen | GO als DD-01 t/m DD-03 slagen |
| **MVP GATE** | — | — | Alle MVP acceptance criteria (MVP-01 t/m MVP-10) |
| **7** | §8.1, §8.4, §8.5 + E1–E11 | 4–5 dagen | GO als P81/P84/P85 + SE-* slagen |
| **8** | Generators (5 types) | 3 dagen | GO als alle generator testcases slagen |
| **9** | Samenvatting + mastery | 2 dagen | GO als slagingsregel werkend |
| **10** | Polish + V1.1 gate | 2 dagen | V1.1 acceptance criteria |

---

## Fase 0 — Project Bootstrap + Infra

### Taken

| # | Taak | Bestanden | Details |
|---|------|----------|---------|
| 0.1 | Vite project init | `package.json`, `vite.config.js`, `index.html` | `npx -y create-vite@latest ./ --template vanilla`. SPA routing setup. |
| 0.2 | Mappenstructuur aanmaken | Zie hieronder | Conventie vastleggen |
| 0.3 | Firebase project aanmaken | `src/firebase/config.js` | Firebase console: project "balanslab-mw2k", EU-west1, Auth + Firestore enabled |
| 0.4 | Firebase SDK installeren | `package.json` | `npm install firebase` |
| 0.5 | CSS design tokens | `src/styles/tokens.css`, `src/styles/global.css` | Kleuren, fonts, spacing conform UI/UX Pro Max |
| 0.6 | Router setup | `src/router.js` | Hash-based SPA router: `/`, `/paragraaf/8_1`, `/balance-lab`, `/dashboard`, `/samenvatting` |
| 0.7 | Global header component | `src/components/Header.js`, `src/styles/header.css` | Paragraaf-nav, Balance Lab button, user menu |
| 0.8 | Slide PDFs plaatsen | `public/slides/8_1.pdf` t/m `8_5.pdf` | Placeholder PDFs (1 pagina met "Slides §8.X") |

### Mappenstructuur

```
/
├── public/
│   └── slides/
│       ├── 8_1.pdf ... 8_5.pdf
│       └── samenvatting.pdf (optioneel)
├── src/
│   ├── components/         # UI componenten
│   │   ├── Header.js
│   │   ├── BalanceLab.js
│   │   ├── ExerciseRunner.js
│   │   ├── SlideViewer.js
│   │   └── Dashboard.js
│   ├── engine/             # Exercise engine
│   │   ├── parser.js       # Algebraïsche parser
│   │   ├── validator.js    # Antwoord-validatie
│   │   ├── feedback.js     # Error-tag detectie
│   │   └── generators/     # 5 generator modules
│   │       ├── simplifyLikeTerms.js
│   │       ├── balanceSimple.js
│   │       ├── balanceTwoSides.js
│   │       ├── solveEquationFormal.js
│   │       └── turningPoint.js
│   ├── data/               # Seed data
│   │   ├── exercises/      # Per paragraaf
│   │   │   ├── 8_1.json ... 8_5.json
│   │   │   └── summary.json
│   │   └── routes.json     # Leerroute-definities
│   ├── firebase/
│   │   ├── config.js
│   │   ├── auth.js
│   │   └── firestore.js
│   ├── pages/              # Pagina-views
│   │   ├── Home.js
│   │   ├── Paragraph.js
│   │   ├── BalanceLabPage.js
│   │   ├── SummaryPage.js
│   │   ├── DigiboardMode.js
│   │   └── DashboardPage.js
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── [component].css
│   ├── router.js
│   └── main.js
└── index.html
```

### GO/NO-GO Gate Fase 0
- [ ] `npm run dev` start zonder errors
- [ ] `localhost:5173` toont header met paragraaf-nav
- [ ] Firebase console toont project met Auth + Firestore enabled
- [ ] Placeholder slide PDFs aanwezig in `public/slides/`

---

## Fase 1 — Balance Lab v1

**Bron:** PRD_v1_compact.md §6, QA_ACCEPTANCE.md §3

### Taken

| # | Taak | Bestanden | Details |
|---|------|----------|---------|
| 1.1 | Algebraïsche parser | `src/engine/parser.js` | Parset `3a + 8 = 2a + 10` → `{left: [{coeff:3, var:'a'}, {coeff:8, var:null}], right: [...]}`. Zie BL-P01 t/m BL-P10. |
| 1.2 | Balance Lab state machine | `src/components/BalanceLab.js` | State: equation, steps[], currentStep, undoStack, redoStack. Immutable snapshots. |
| 1.3 | Actie-systeem | `src/components/BalanceLab.js` | Input: "Wat wil je aan beide kanten doen?" → `−3`, `−2a`, `÷5`. Validatie: alleen paired actions. |
| 1.4 | Visuele balans rendering | `src/components/BalanceLab.js`, `src/styles/balancelab.css` | SVG weegschaal. Letter-tiles (zakjes) + getal-tiles (knikkers). Tilt-animatie als niet in evenwicht. |
| 1.5 | Stappenlog UI | `src/components/BalanceLab.js` | Panel rechts: `Stap 1: beide kanten −8 → 3a = 2a + 2`. Scrollbaar. |
| 1.6 | Undo / Redo | `src/components/BalanceLab.js` | Knoppen + Ctrl+Z/Y. Volledige state-rollback. Zie BL-U01 t/m BL-U06. |
| 1.7 | Coach Hints | `src/components/BalanceLab.js` | 4-staps hint systeem (letters→getallen→delen→controleren). Progressief. Max 4 per vergelijking. BL-H01 t/m BL-H06. |
| 1.8 | Eindcontrole | `src/components/BalanceLab.js` | Na `a = N`: automatische controle. "Links = …, rechts = …, klopt!" |
| 1.9 | Digibord-variant | `src/components/BalanceLab.js` | CSS class `--digiboard`: grotere font, high-contrast, stap-voor-stap modus. |
| 1.10 | Global header integratie | `src/components/Header.js` | Balance Lab button opent `/balance-lab` route of overlay. |

### Edge cases
- Ongeldige invoer (BL-P07, P08, P09): duidelijke foutmelding, geen crash.
- Division by zero (BL-A05): blokkeren + melding.
- Decimaal resultaat bij ÷ in Balance Lab (EC-12): waarschuwing.
- Rapid undo/redo (T-07): immutable snapshots voorkomen corruption.

### Testchecklist
- [ ] BL-P01 t/m BL-P10 (parser)
- [ ] BL-T01 t/m BL-T05 (visuele balans)
- [ ] BL-A01 t/m BL-A06 (paired actions)
- [ ] BL-U01 t/m BL-U06 (undo/redo)
- [ ] BL-H01 t/m BL-H06 (coach hints)

### GO/NO-GO Gate Fase 1
- [ ] Vergelijking `4a + 1 = 2a + 5` kan volledig worden opgelost in Balance Lab
- [ ] Stappenlog toont alle stappen correct
- [ ] Undo/redo werkt foutloos
- [ ] Coach hints volgen de 4-stappen volgorde
- [ ] Ongeldige invoer geeft foutmelding (geen crash)

---

## Fase 2 — Auth + Roles + Class Join

**Bron:** PRD_v1_compact.md §2 + §7 + §8

### Taken

| # | Taak | Bestanden | Firestore |
|---|------|----------|-----------|
| 2.1 | Login/registreer pagina | `src/pages/LoginPage.js`, `src/styles/login.css` | — |
| 2.2 | Firebase Auth setup | `src/firebase/auth.js` | Email/wachtwoord provider |
| 2.3 | User document aanmaken | `src/firebase/firestore.js` | `/users/{uid}` → role, displayName, classId, createdAt |
| 2.4 | Rollen-systeem | `src/firebase/auth.js` | Custom claims of Firestore-check: `student` / `teacher` / `admin` |
| 2.5 | Klas aanmaken (teacher) | `src/pages/DashboardPage.js` | `/classes/{classId}` → name, teacherUid, joinCode, createdAt |
| 2.6 | Klascode join (student) | `src/pages/LoginPage.js` | Student voert joinCode in → classId wordt gekoppeld |
| 2.7 | Route guards | `src/router.js` | Dashboard alleen voor teacher. Redirect naar login als niet ingelogd. |
| 2.8 | User menu in header | `src/components/Header.js` | Naam, rol-badge, uitloggen |
| 2.9 | Firestore security rules | Firebase console / `firestore.rules` | Per PRD_v1_compact.md §8 |

### Firestore writes
- `POST /users/{uid}` bij registratie
- `POST /classes/{classId}` bij klas aanmaken
- `PATCH /users/{uid}.classId` bij klascode join

### Testchecklist
- [ ] Student kan registreren + inloggen
- [ ] Teacher kan registreren + inloggen
- [ ] Teacher kan klas aanmaken → joinCode gegenereerd
- [ ] Student kan joinCode invoeren → classId gekoppeld
- [ ] Dashboard alleen zichtbaar voor teacher
- [ ] Uitloggen werkt, redirect naar login

### GO/NO-GO Gate Fase 2
- [ ] Volledige login/logout flow voor student en teacher
- [ ] Klascode join werkt
- [ ] Route guards actief

---

## Fase 3 — Exercise Engine Core

**Bron:** EXERCISE_ENGINE_SPEC.md

### Taken

| # | Taak | Bestanden | Details |
|---|------|----------|---------|
| 3.1 | Exercise data schema | `src/data/exercises/schema.js` | TypeDef conform §1.1 van EXERCISE_ENGINE_SPEC |
| 3.2 | Antwoord-validator | `src/engine/validator.js` | Per inputtype (NUMERIC, FORMULA, EQUATION, SCAFFOLDED, etc.). Canonical form normalisatie. |
| 3.3 | Formula equivalence | `src/engine/parser.js` | Commutatief, coëff-1 weglaten, impliciete ×, minteken normalisatie. |
| 3.4 | Feedback tagger | `src/engine/feedback.js` | 19 error-tags. Detectie-logica per tag. Prioriteit-volgorde. |
| 3.5 | ExerciseRunner component | `src/components/ExerciseRunner.js` | Toont opgave, deelvragen, invoervelden, feedback, hints. Ondersteunt alle inputtypes A–P. |
| 3.6 | Hint systeem | `src/components/ExerciseRunner.js` | Progressieve hints (max 3 per deelvraag). |
| 3.7 | Progress tracking | `src/firebase/firestore.js` | Schrijft naar `/progress/{uid}/paragraphs/{paragraphId}` en `/attempts/{uid}/exercises/{attemptId}` |

### Inputtypes te implementeren (Fase 3 = core set)

| Type | Naam | Prioriteit |
|------|------|-----------|
| A | Formule vereenvoudigen | P0 |
| D | Vergelijking aflezen bij balans | P0 |
| E | Balans manipuleren | P0 |
| G | Balans stapsgewijs oplossen | P0 |
| H | Vergelijking oplossen | P0 |
| J | Formeel stapsgewijs (scaffolded) | P1 |
| K | Volledig oplossen + controle | P0 |
| C | Numeriek antwoord | P0 |

Overige types (B, F, I, L, M, N, O, P) in Fase 7.

### Edge cases
- Meerdere correcte antwoorden (T-06): equivalents[] array.
- Alternatieve oplosroutes bij scaffolded (T-08): per-stap algebraïsche validatie.
- Komma vs punt als decimaalteken: altijd komma accepteren (NL).

### Testchecklist
- [ ] NUMERIC validatie met tolerantie
- [ ] FORMULA equivalence (5+ varianten per antwoord)
- [ ] EQUATION canonical form + kanten verwisselbaar
- [ ] Feedback tagger produceert correcte tags bij bekende fouten
- [ ] Progress wordt opgeslagen in Firestore
- [ ] Attempts worden gelogd met error-tags

### GO/NO-GO Gate Fase 3
- [ ] Opgave tonen → invoer → validatie → feedback → volgende opgave werkt
- [ ] Minimaal 3 inputtypes (NUMERIC, FORMULA, EQUATION) correct
- [ ] Feedback tags verschijnen bij bekende foutpatronen
- [ ] Firestore schrijft progress + attempts

---

## Fase 4 — §8.2 + §8.3 Pilot (Leerling Mode)

**Bron:** PRD_8_2.md, PRD_8_3.md

### Taken

| # | Taak | Bestanden | Details |
|---|------|----------|---------|
| 4.1 | Seed data §8.2 | `src/data/exercises/8_2.json` | Opgaven 8–14, O14, U3 conform PRD_8_2.md |
| 4.2 | Seed data §8.3 | `src/data/exercises/8_3.json` | Opgaven 15–19, O19, U4 conform PRD_8_3.md |
| 4.3 | Leerroute-definities | `src/data/routes.json` | O/D/U volgorde per § conform PRD_v1_compact.md IA |
| 4.4 | Paragraaf-pagina | `src/pages/Paragraph.js` | Leerroute-keuze → opgavenreeks → leerdoelencheck |
| 4.5 | Route-selector UI | `src/components/RouteSelector.js` | Keuze ondersteunend/doorlopend/uitdagend |
| 4.6 | Balance Lab koppeling | `src/components/ExerciseRunner.js` | "Open in Balance Lab" knop bij opgaven met 🔬 → voorgevulde vergelijking |
| 4.7 | Leerdoelencheck §8.2 | `src/data/exercises/8_2.json` | LDC-8.2: `4a + 9 = 21` |
| 4.8 | Leerdoelencheck §8.3 | `src/data/exercises/8_3.json` | LDC-8.3: `3a + 4 = a + 14` |
| 4.9 | Extra oefeningen E4, E5, E6 | `src/data/exercises/summary.json` | Conform PRD_SUMMARY_E.md |
| 4.10 | Voortgangsbalk per § | `src/components/ProgressBar.js` | Visueel: hoeveel opgaven af / totaal |

### Firestore writes
- `/progress/{uid}/paragraphs/8_2` en `8_3`
- `/attempts/{uid}/exercises/{attemptId}` per poging

### Testchecklist
- [ ] P82-01 t/m P82-06
- [ ] P83-01 t/m P83-06
- [ ] LM-01 t/m LM-13
- [ ] Balance Lab voorgevuld vanuit opgave

### GO/NO-GO Gate Fase 4
- [ ] §8.2 volledig speelbaar in alle 3 routes
- [ ] §8.3 volledig speelbaar in alle 3 routes
- [ ] Leerdoelenchecks werken met correcte beoordeling
- [ ] E4, E5, E6 beschikbaar na leerdoelencheck
- [ ] Balance Lab opent met voorgevulde vergelijking vanuit opgave
- [ ] Voortgang persistent na pagina-refresh

---

## Fase 5 — Digibord Mode + PDF Viewer

**Bron:** PRD_v1_compact.md §5, QA_ACCEPTANCE.md §4

### Taken

| # | Taak | Bestanden | Details |
|---|------|----------|---------|
| 5.1 | pdf.js installeren | `package.json` | `npm install pdfjs-dist` |
| 5.2 | SlideViewer component | `src/components/SlideViewer.js` | Laadt `/slides/8_X.pdf`. Pagina-navigatie (vorige/volgende). |
| 5.3 | Digibord-pagina | `src/pages/DigiboardMode.js` | Layout: slides links, theorie rechts, inoefenopgave onder |
| 5.4 | Timer component | `src/components/Timer.js` | 45 min countdown. Notificatie bij 5 min en 0 min. Aanpasbaar door docent. |
| 5.5 | Theorie-display | `src/components/TheoryDisplay.js` | Voorbeelden stapsgewijs onthullen (click-to-reveal) |
| 5.6 | Digibord CSS | `src/styles/digiboard.css` | High-contrast, grote fonts, 1920×1080 optimaal |
| 5.7 | Balance Lab digibord-modus | `src/components/BalanceLab.js` | Stap-voor-stap modus (docent klikt "Volgende stap") |
| 5.8 | Fallback bij ontbrekende PDF | `src/components/SlideViewer.js` | EC-01: "Slides nog niet beschikbaar" melding |

### Edge cases
- PDF ontbreekt (EC-01): graceful fallback.
- Grote PDF (>5MB): lazy page rendering.
- Digibord-resolutie: test op 1920×1080 en 1366×768.

### Testchecklist
- [ ] SV-01 t/m SV-06
- [ ] DM-01 t/m DM-08

### GO/NO-GO Gate Fase 5
- [ ] Slides laden voor alle 5 paragrafen
- [ ] Pagina-navigatie werkt
- [ ] Timer start, telt af, geeft notificaties
- [ ] Balance Lab werkt in digibord-variant
- [ ] Layout correct op 1920×1080

---

## Fase 6 — Docent Dashboard Basis

**Bron:** PRD_v1_compact.md §4 Flow D, QA_ACCEPTANCE.md §1.3

### Taken

| # | Taak | Bestanden | Details |
|---|------|----------|---------|
| 6.1 | Dashboard-pagina | `src/pages/DashboardPage.js` | Alleen voor role=teacher |
| 6.2 | Klasoverzicht heatmap | `src/components/ClassOverview.js` | Per leerling × per §: kleurindicatie (rood/geel/groen) |
| 6.3 | Firestore queries | `src/firebase/firestore.js` | Lees `/progress/{uid}` voor alle leerlingen in klas |
| 6.4 | Per-leerling detail | `src/components/StudentDetail.js` | Klik op leerling → scores per §, fouten, tijd |
| 6.5 | Fout-analyse | `src/components/ErrorAnalysis.js` | Top error-tags per § met percentage leerlingen |
| 6.6 | Lege staat | `src/pages/DashboardPage.js` | DD-06: bij 0 leerlingen → uitnodigingsinstructies |

### Firestore reads
- `/classes/{classId}` → leerlingenlijst
- `/progress/{uid}/paragraphs/*` voor elke leerling
- `/attempts/{uid}/exercises/*` voor fouten-aggregatie

### Testchecklist
- [ ] DD-01 t/m DD-07

### GO/NO-GO Gate Fase 6
- [ ] Klasoverzicht toont alle leerlingen met voortgang
- [ ] Per-leerling detail toont scores + fouten
- [ ] Fout-analyse toont top error-tags per §

---

## 🚦 MVP GATE

**Alle criteria uit QA_ACCEPTANCE.md §6 "MVP Acceptance Criteria":**

- [ ] MVP-01: Firebase Auth login werkt
- [ ] MVP-02: Global header met nav + Balance Lab
- [ ] MVP-03: Balance Lab volledig functioneel
- [ ] MVP-04: §8.2 + §8.3 speelbaar (3 routes)
- [ ] MVP-05: Leerdoelenchecks werken
- [ ] MVP-06: E4 + E5 + E6 beschikbaar
- [ ] MVP-07: Digibord Mode met slides + timer
- [ ] MVP-08: Basis Dashboard
- [ ] MVP-09: Voortgang in Firestore
- [ ] MVP-10: Responsief op digibord + tablet

**→ Bij GO: door naar Fase 7 (V1.1)**

---

## Fase 7 — §8.1, §8.4, §8.5 + E1–E11

**Bron:** PRD_8_1.md, PRD_8_4.md, PRD_8_5.md, PRD_SUMMARY_E.md

### Taken

| # | Taak | Bestanden | Details |
|---|------|----------|---------|
| 7.1 | Seed data §8.1 | `src/data/exercises/8_1.json` | Opgaven 1–7, O4, O6. U1/U2 niet in bronpagina's → placeholder of skip. |
| 7.2 | Seed data §8.4 | `src/data/exercises/8_4.json` | Opgaven 20–26, O24, U5, U6 incl. exacte vergelijkingen + antwoorden |
| 7.3 | Seed data §8.5 | `src/data/exercises/8_5.json` | Opgaven 27–33, O32. U7 niet in bronpagina's → placeholder of skip. |
| 7.4 | Extra inputtypes | `src/components/ExerciseRunner.js` | B (formule opstellen), L (context), M (tabel), N (grafiek aflezen), O (vergelijking opstellen), P (contextantwoord) |
| 7.5 | Tabel-invoer component | `src/components/TableInput.js` | Interactieve tabel met numerieke cellen (§8.5) |
| 7.6 | Grafiek-component | `src/components/GraphViewer.js` | Statische grafiek met klik-interactie voor snijpunt (§8.5) |
| 7.7 | Scaffolded invoer | `src/components/ScaffoldedInput.js` | Kladblaadje met lege plekken (O24, E7) |
| 7.8 | Seed E1–E11 | `src/data/exercises/summary.json` | Alle 11 extra oefeningen conform PRD_SUMMARY_E.md |
| 7.9 | LDC-8.1, LDC-8.4, LDC-8.5 | `src/data/exercises/*.json` | Leerdoelenchecks met beoordelingsdrempels |
| 7.10 | Leerroutes §8.1/8.4/8.5 | `src/data/routes.json` | O/D/U volgorden toevoegen |

### Testchecklist
- [ ] P81-01 t/m P81-09
- [ ] P84-01 t/m P84-08
- [ ] P85-01 t/m P85-07
- [ ] SE-01 t/m SE-03

### GO/NO-GO Gate Fase 7
- [ ] Alle 5 paragrafen speelbaar in alle 3 routes
- [ ] Alle 11 E-opgaven beschikbaar en gevalideerd
- [ ] Tabel, grafiek en scaffolded inputtypes werken

---

## Fase 8 — Generators (5 types)

**Bron:** EXERCISE_ENGINE_SPEC.md §4

### Taken

| # | Taak | Bestanden | Generator |
|---|------|----------|-----------|
| 8.1 | SIMPLIFY_LIKE_TERMS | `src/engine/generators/simplifyLikeTerms.js` | Herhaal: 2 termen, 1 letter. Verdiep: 3–5 termen, 2 letters, ±, ×1. |
| 8.2 | BALANCE_SIMPLE | `src/engine/generators/balanceSimple.js` | `na + c = d`. Constraint: geheel antwoord. Visuele balans altijd. |
| 8.3 | BALANCE_TWO_SIDES | `src/engine/generators/balanceTwoSides.js` | `pa + c = qa + d`. Constraint: geheel antwoord. Herhaal: p>q. Verdiep: q>p mogelijk. |
| 8.4 | SOLVE_EQUATION_FORMAL | `src/engine/generators/solveEquationFormal.js` | `ax + b = cx + d`. Herhaal: geheel. Verdiep: 1 decimaal. Controle verplicht. |
| 8.5 | TURNING_POINT | `src/engine/generators/turningPoint.js` | Twee formules → vergelijking → omslagpunt. Context-templates. |
| 8.6 | Generator UI | `src/components/GeneratorRunner.js` | Modus-keuze (herhaal/verdiep). Streak-tracking. Stop-na-5-correct. |
| 8.7 | Generator integratie per § | `src/pages/Paragraph.js` | Na E-opgaven: knop "Oefen oneindig" → generator |

### Testchecklist per generator
- [ ] Genereert 100 opgaven zonder crash
- [ ] Alle antwoorden zijn geheel (herhaal) of max 1 decimaal (verdiep)
- [ ] Geen duplicate opgaven in reeks van 20
- [ ] Feedback tags correct bij bekende foutpatronen
- [ ] Streak-detectie: 5 correct → succesmelding

### GO/NO-GO Gate Fase 8
- [ ] Alle 5 generators produceren valide opgaven in herhaal + verdiep
- [ ] Generator toegankelijk vanuit elke §-pagina
- [ ] Streak-tracking en stop-condities werken

---

## Fase 9 — Samenvatting + Mastery

**Bron:** PRD_SUMMARY_E.md §3 + §4

### Taken

| # | Taak | Bestanden | Details |
|---|------|----------|---------|
| 9.1 | Samenvatting-pagina | `src/pages/SummaryPage.js` | Twee modi: "Per paragraaf" of "Alles" |
| 9.2 | Theorie-samenvattingen | `src/data/summaries.json` | 5 leerdoel-teksten + voorbeelden uit bron |
| 9.3 | Slagingsregel | `src/engine/mastery.js` | Per-§ drempels + hoofdstuk-niveau (🟢/🟡/🔴) conform PRD_SUMMARY_E §4 |
| 9.4 | Mastery UI | `src/components/MasteryBadge.js` | Scorebalk per §, eindoordeel, badge |
| 9.5 | Dashboard mastery-view | `src/components/ClassOverview.js` | Per leerling 🟢/🟡/🔴 status, klasgemiddelde |
| 9.6 | Dashboard fout-analyse uitbreiden | `src/components/ErrorAnalysis.js` | Top 3 error-tags per § met % + klikbaar detail |

### Testchecklist
- [ ] SE-01 t/m SE-05
- [ ] Slagingsregel berekent correct bij edge cases (0 opgaven, alle correct, sommige §§ leeg)

### GO/NO-GO Gate Fase 9
- [ ] Samenvatting-pagina werkend in beide modi
- [ ] Slagingsregel geeft 🟢/🟡/🔴 correct
- [ ] Dashboard toont mastery per leerling

---

## Fase 10 — Polish + V1.1 Gate

### Taken

| # | Taak | Details |
|---|------|---------|
| 10.1 | Responsive audit | Test op 375px, 768px, 1024px, 1440px, 1920px |
| 10.2 | Accessibility audit | Focus states, labels, contrast, `prefers-reduced-motion` |
| 10.3 | Performance audit | Lighthouse: laadtijd < 3s op 4G |
| 10.4 | Error handling | Alle EC-* edge cases uit QA_ACCEPTANCE §5 |
| 10.5 | UI polish | Animaties, hover states, loading states, empty states |
| 10.6 | Cross-browser test | Chrome, Edge, Safari |

### V1.1 Acceptance Criteria (uit QA_ACCEPTANCE §6)
- [ ] V11-01: Alle 5 paragrafen speelbaar
- [ ] V11-02: Alle E1–E11 beschikbaar
- [ ] V11-03: Samenvatting-pagina met per-§ en alles modus
- [ ] V11-04: Alle 5 generators functioneel
- [ ] V11-05: Feedback engine met error-tags
- [ ] V11-06: Dashboard foutanalyse + per-leerling detail
- [ ] V11-07: Slagingsregel werkend

---

## Seed/Content Mapping Referentie

| Data file | Bron-PRD | Inhoud |
|-----------|---------|--------|
| `src/data/exercises/8_1.json` | PRD_8_1.md §4 | 11 opgaven (1–7, O4, O6, U1, U2) |
| `src/data/exercises/8_2.json` | PRD_8_2.md §4 | 9 opgaven (8–14, O14, U3) |
| `src/data/exercises/8_3.json` | PRD_8_3.md §4 | 7 opgaven (15–19, O19, U4) |
| `src/data/exercises/8_4.json` | PRD_8_4.md §4 + §6 | 10 opgaven (20–26, O24, U5, U6) + exacte vergelijkingen |
| `src/data/exercises/8_5.json` | PRD_8_5.md §4 | 9 opgaven (27–33, O32, U7) |
| `src/data/exercises/summary.json` | PRD_SUMMARY_E.md §2 | 11 E-opgaven + 5 LDC's |
| `src/data/routes.json` | PRD_v1_compact.md §3 tabel | 15 leerroutes (3 per §) |
| `src/data/summaries.json` | PRD_SUMMARY_E.md §3 | 5 theorie-samenvattingen |

---

**Waiting for GO for Phase 1 implementation.**
