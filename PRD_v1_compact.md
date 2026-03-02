# PRD v1 — BalansLab MW2K

**Moderne Wiskunde 2 Kader · H8: Vergelijkingen oplossen (balansmethode)**
**Versie:** 1.0-compact | **Datum:** 2026-03-01
**Bron:** MW2K Hoofdstuk 8, p. 46–71, Noordhoff Uitgevers

---

## 1. Overview

Interactieve digibord- en leerling-webapp die H8 "Vergelijkingen" digitaliseert. De app volgt exact de didactische opbouw van het boek: §8.1 Gelijksoortige termen → §8.2 De balans → §8.3 Oplossen met balans → §8.4 Oplossen zonder balans → §8.5 Het omslagpunt. Centraal staat de **Balance Lab** — een altijd toegankelijk interactief gereedschap waar leerlingen vergelijkingen visueel oplossen met een weegschaal.

**Kernprincipes:**

- **Brongetrouw** — alle didactiek, voorbeelden en opgaven uit p. 46–71.
- **Drie modi** — Digibord, Leerling, Docent Dashboard.
- **Drie leerroutes** per paragraaf — ondersteunend / doorlopend / uitdagend (exact uit boek).
- **Balance Lab** — permanent beschikbaar via global header button.

---

## 2. Users & Roles

| Role | ID | Beschrijving | Rechten |
|------|----|-------------|---------|
| Leerling | `student` | Klas 2K leerling | Opgaven, Balance Lab, eigen voortgang |
| Docent | `teacher` | Wiskundedocent | + Digibord Mode, Dashboard, voortgang klassen |
| Admin | `admin` | Beheerder | + Gebruikersbeheer, content management |

**Auth:** Firebase Authentication (email/ww + optioneel Google SSO). Leerlingen via klascode. Docent via uitnodigingslink. Firestore custom claim `role`.

---

## 3. Information Architecture

```
[Global Header — altijd zichtbaar]
├── Logo / Home
├── Paragraaf-nav: 8.1 │ 8.2 │ 8.3 │ 8.4 │ 8.5
├── Balance Lab (global button)
├── Samenvatting
└── User menu

[Digibord Mode — per §]
├── Slides (lokale PDF uit public/slides/)
├── Theorie (interactief)
├── Klassikale inoefenopgave
└── Timer → start zelfstandig werk

[Leerling Mode — per §]
├── Theorie herlezen
├── Leerroute-keuze (O / D / U)
│   Opgavereeks conform boek-leerroutes
├── Leerdoelencheck
├── Extra oefening E#
└── Oneindige generator (Herhaal / Verdiep)

[Docent Dashboard]
├── Klasoverzicht (heatmap)
├── Per-leerling detail
├── Veelgemaakte fouten (error-tags)
└── Slide beheer (lokale PDFs)
```

### Leerroutes per paragraaf (exact uit boek)

| § | Ondersteunend | Doorlopend | Uitdagend |
|---|--------------|------------|-----------|
| 8.1 | 1→2→3→O4→5→O6→7 | 1→2→3→4→5→6→7 | 1→2→4→6→7→U1→U2 |
| 8.2 | 8→9→10→11→12→13→O14 | 8→9→10→11→12→13→14 | 9→10→11→12→13→14→U3 |
| 8.3 | 15→16→17→18→O19 | 15→16→17→18→19 | 16→17→18→19→U4 |
| 8.4 | 20→21→22→23→O24→25→26 | 20→21→22→23→24→25→26 | 20→21→22→24→26→U5→U6 |
| 8.5 | 27→28→29→30→31→O32→33 | 27→28→29→30→31→32→33 | 27→28→29→30→32→33→U7 |

---

## 4. Core Flows

### Flow A — Klassikale les (Digibord Mode)

1. Docent opent § in Digibord Mode.
2. Slides (lokale PDF uit `public/slides/`) worden getoond via in-app PDF viewer.
3. Theorie interactief doorgenomen met boek-voorbeelden.
4. Klassikale inoefenopgave (1 opgave, stapsgewijs op digibord).
5. Docent start timer → leerlingen schakelen naar Leerling Mode (45 min).

### Flow B — Zelfstandig werken (Leerling Mode)

1. Leerling kiest leerroute (O / D / U) of docent wijst toe.
2. Opgaven in volgorde van leerroute.
3. Per opgave: invoer → directe feedback met error-tags → volgende.
4. Na route: Leerdoelencheck.
5. Voldoende → Extra oefening (E#) of Oneindige generator.
6. Onvoldoende → Terugverwijzing theorie + extra uitleg.

### Flow C — Balance Lab (altijd beschikbaar)

Zie §6 hieronder.

### Flow D — Docent Dashboard

1. Klasoverzicht: heatmap voortgang per § per leerling.
2. Inzoomen op individuele leerling → pogingen, fouten, tijd.
3. Fout-analyse: top error-tags per § (aggregated).
4. Slides bekijken (lokale PDFs in `public/slides/`).

---

## 5. Slides (statische lokale PDFs)

Slides worden als statische PDF-bestanden meegeleverd in de repo. De app toont ze in Digibord Mode via een in-app PDF viewer. Er is geen upload-UI, geen versioning en geen Firebase Storage nodig.

**Bestanden:** `public/slides/8_1.pdf` … `public/slides/8_5.pdf` + optioneel `public/slides/samenvatting.pdf`

---

## 6. Balance Lab Spec

### Toegang

- **Global header button** — altijd zichtbaar, opent als overlay of volledige pagina.
- Beschikbaar in alle modi (Digibord, Leerling, standalone).

### Invoer

- Tekstveld voor vergelijking, bijv. `3a + 8 = 2a + 10`.
- Parseert automatisch naar linker- en rechterkant.
- Ondersteunt variabelen a–z (hoofdletter-insensitief).

### Visuele balans

- **Weegschaal** met twee schalen (links / rechts).
- **Letter-tiles** (zakjes) — variabele-termen.
- **Getal-tiles** (knikkers/gewichtjes) — constanten.
- **Balans tilt** als linker ≠ rechter waarde.
- **Animatie** bij elke stap: smooth transition.

### Interactie

- Leerling kiest actie: "Haal van beide kanten weg" of "Tel bij beide kanten op".
- Invoer: "Wat wil je aan beide kanten doen?" → bijv. `−3` of `−2a`.
- Na actie: balans + vergelijking updaten visueel.

### Stappenlog

- Chronologisch log rechts van de balans.
- Format: `Stap 1: beide kanten −8 → 3a = 2a + 2`

### Undo / Redo

- Undo/Redo knoppen + Ctrl+Z / Ctrl+Y.
- Volledige state-rollback (balans + vergelijking + log).

### Coach Hints (volgorde uit boek-aanpak p. 59)

1. **Letters samen:** Haal dezelfde letters aan één kant weg.
2. **Getallen apart:** Haal losse getallen naar de andere kant.
3. **Delen:** Deel door de coëfficiënt.
4. **Controleren:** Vul oplossing in oorspronkelijke vergelijking in.

Hints progressief onthuld (eerst richting, dan specifieke actie). Max 4 per vergelijking.

### Eindcontrole

- Automatische controle na oplossing.
- Toont: "Controle: links = …, rechts = …, klopt!"

### Digibord-variant

- Grotere font, high-contrast.
- Stap-voor-stap modus (docent klikt).

---

## 7. Data Model (Firestore)

```
/users/{uid}
  role, displayName, classId, createdAt

/classes/{classId}
  name, teacherUid, joinCode, createdAt

(Slides zijn lokale bestanden in public/slides/ — geen Firestore collectie)

/exercises/{exerciseId}
  paragraphId, exerciseCode (O14/U3/E4/1/2...),
  type (book|extra|leerdoelencheck),
  route[], content, generatorType

/progress/{uid}/paragraphs/{paragraphId}
  route, completedExercises[], leerdoelencheckPassed,
  extraCompleted[], generatorAttempts, lastActive

/attempts/{uid}/exercises/{attemptId}
  exerciseId, paragraphId, answer, correct,
  errorTags[], timestamp, durationMs

/balanceLabSessions/{sessionId}
  uid, equation, steps[], solved, hintsUsed, createdAt
```

### Error Tags (Feedback Engine)

| Tag | Beschrijving |
|-----|-------------|
| `BALANCE_ONE_SIDE` | Alleen aan één kant iets gedaan |
| `SIGN_ERROR` | Fout met +/− teken |
| `LIKE_TERMS_MISMATCH` | Niet-gelijksoortige termen samengevoegd |
| `DIVIDE_COEFF_MISS` | Vergeten te delen door coëfficiënt |
| `CHECK_FAILED` | Controle niet uitgevoerd of fout |
| `SETUP_EQUATION` | Vergelijking verkeerd opgesteld (§8.5) |
| `SIMPLIFY_ERROR` | Fout bij vereenvoudigen |
| `ARITHMETIC_ERROR` | Rekenfout |

---

## 8. Security Rules (samenvatting)

- **Users:** eigen profiel r/w; teacher leest klasleden.
- **Progress / Attempts:** eigen data r/w; teacher leest klasleden.
- **Exercises:** authenticated read; admin write.
- **Slides:** statische bestanden, geen Firestore rules nodig.
- **BalanceLabSessions:** eigen data r/w.

---

## 9. Build Phasing

### MVP (4–6 weken)

- Firebase Auth + Firestore setup
- Global header met paragraaf-nav + Balance Lab button
- **Balance Lab** volledige implementatie
- §8.2 + §8.3 als pilot (Leerling Mode met leerroutes)
- Basisversie Digibord Mode (slide viewer + timer)
- Basis Docent Dashboard (klasoverzicht)

### V1.1 (3–4 weken)

- §8.1, §8.4, §8.5 toevoegen
- Extra oefeningen E1–E11
- Samenvatting-pagina
- Oneindige generators per §
- Feedback engine met error-tags
- Dashboard foutanalyse + per-leerling detail
- Slide PDFs in `public/slides/` (al aanwezig in MVP)

### V2 (4+ weken)

- Adaptieve leerroute-suggestie
- Gamification (streaks, badges, XP)
- Offline support (PWA)
- Analytics dashboard
- Multi-hoofdstuk uitbreiding
- WCAG 2.1 AA compliance

---

## 10. Non-functional Requirements

| Requirement | Target |
|-------------|--------|
| Laadtijd | < 3s op 4G |
| Responsiveness | Digibord 1920×1080, tablet 1024×768, mobiel 375×667 |
| Browsers | Chrome 90+, Edge 90+, Safari 15+ |
| Uptime | 99.5% (Firebase hosted) |
| Privacy | AVG-compliant, geen externe tracking |
| Concurrency | 35 leerlingen per klas simultaan |
