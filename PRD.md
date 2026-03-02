# PRD — BalansLab MW2K

**Moderne Wiskunde 2 Kader · H8: Vergelijkingen oplossen (balansmethode)**
**Versie:** 1.0 | **Datum:** 2026-03-01
**Bron:** Noordhoff Uitgevers, Hoofdstuk 8, p. 46–71

---

## Wat is dit?

Dit is de volledige Product Requirements Document suite voor **BalansLab MW2K** — een interactieve digibord- en leerling-webapp die Hoofdstuk 8 "Vergelijkingen" van Moderne Wiskunde 2 Kader digitaliseert. De suite bestaat uit 10 documenten die samen de complete specificatie vormen.

---

## Inhoudsopgave

| # | Document | Beschrijving |
|---|----------|-------------|
| 1 | [PRD_v1_compact.md](PRD_v1_compact.md) | **Kernspecificatie** — Overview, Users, IA, Core Flows, Slides, Balance Lab, Data Model, Security, Build Phasing, NFR |
| 2 | [PRD_8_1.md](PRD_8_1.md) | **§8.1 Gelijksoortige termen** — Leerdoelen, opgaven 1–7/O4/O6/U1/U2, inputtypes, generator `SIMPLIFY_LIKE_TERMS`, E1–E3 |
| 3 | [PRD_8_2.md](PRD_8_2.md) | **§8.2 De balans** — Leerdoelen, opgaven 8–14/O14/U3, Balance Lab koppeling, generator `BALANCE_SIMPLE`, E4 |
| 4 | [PRD_8_3.md](PRD_8_3.md) | **§8.3 Oplossen met balans** — Leerdoelen, opgaven 15–19/O19/U4, Balance Lab als primair tool, generator `BALANCE_TWO_SIDES`, E5–E6 |
| 5 | [PRD_8_4.md](PRD_8_4.md) | **§8.4 Vergelijkingen oplossen** — 4-stappen aanpak, opgaven 20–26/O24/U5/U6, formeel oplossen, generator `SOLVE_EQUATION_FORMAL`, E7–E8 |
| 6 | [PRD_8_5.md](PRD_8_5.md) | **§8.5 Het omslagpunt** — Tabel→grafiek→vergelijking, opgaven 27–33/O32/U7, generator `TURNING_POINT`, E9–E11 |
| 7 | [PRD_SUMMARY_E.md](PRD_SUMMARY_E.md) | **Samenvatting + E1–E11** — Alle extra oefeningen, per-§ koppeling, samenvatting-modus, slagingsregel "Hoofdstuk beheerst" |
| 8 | [EXERCISE_ENGINE_SPEC.md](EXERCISE_ENGINE_SPEC.md) | **Exercise Engine** — Data schema, answer validation, feedback tagger, 5 generator schemas, difficulty ladders, mastery scoring |
| 9 | [QA_ACCEPTANCE.md](QA_ACCEPTANCE.md) | **QA + Acceptatie** — Testchecklists per mode/§, Balance Lab testcases, PDF viewer tests, edge cases, acceptance criteria per fase |
| 10 | [RISKS.md](RISKS.md) | **Risico's** — 8 technisch, 7 didactisch, 8 organisatorisch + mitigaties + risicomatrix |

---

## Wat eerst lezen?

| Stap | Document | Waarom |
|------|----------|--------|
| **1** | [PRD_v1_compact.md](PRD_v1_compact.md) | Geeft het totaalbeeld: architectuur, flows, data model, build phasing |
| **2** | [PRD_8_3.md](PRD_8_3.md) | MVP pilot-paragraaf — Balance Lab als kern-feature |
| **3** | [EXERCISE_ENGINE_SPEC.md](EXERCISE_ENGINE_SPEC.md) | Begrijp hoe opgaven, validatie en generatoren werken |
| **4** | [PRD_8_2.md](PRD_8_2.md) | Tweede MVP-paragraaf — eenvoudigere vergelijkingen |
| **5** | [QA_ACCEPTANCE.md](QA_ACCEPTANCE.md) | Weet wanneer de MVP "af" is |
| **6** | Overige §-specs naar behoefte | §8.1, §8.4, §8.5 voor V1.1 |

---

## MVP scope (4–6 weken)

- ✅ Firebase Auth + Firestore (users, classes, roles, progress, attempts)
- ✅ Global header met paragraaf-navigatie + Balance Lab button
- ✅ **Balance Lab** — volledige implementatie (parser, visuele balans, stappen, undo/redo, coach hints)
- ✅ **§8.2 + §8.3** als pilot-paragrafen (Leerling Mode met 3 leerroutes)
- ✅ Leerdoelencheck §8.2 + §8.3 + Extra oefeningen E4, E5, E6
- ✅ Digibord Mode (lokale PDF slide viewer + timer)
- ✅ Basis Docent Dashboard (klasoverzicht)
- ✅ Responsief: digibord (1920×1080) + tablet (1024×768)

---

## Key architectural decisions

| Beslissing | Rationale |
|-----------|-----------|
| **Slides als lokale PDFs** (`public/slides/8_X.pdf`) | Geen Firebase Storage nodig, geen upload-UI, geen versioning. Simpelste pad naar werkend product. |
| **Balance Lab altijd beschikbaar** (global header button) | Centraal didactisch gereedschap. Leerlingen moeten het overal kunnen openen, ook buiten opgaven. |
| **3 leerroutes exact uit boek** (O/D/U) | Brongetrouw aan Moderne Wiskunde didactiek. Docenten herkennen de structuur direct. |
| **Firebase Auth + Firestore** | Laagdrempelig, gratis tier voldoende voor 1–3 klassen, EU-regio beschikbaar, geen eigen backend. |
| **Error-tags als feedback-systeem** | Gestructureerde fout-classificatie maakt dashboard-aggregatie mogelijk en verbetert didactische feedback. |
| **Generatoren client-side** | Geen server nodig voor opgave-generatie. Seed-based voor reproduceerbaarheid. |
| **§8.2 + §8.3 als MVP-pilot** | Balance Lab is de kern-feature; deze paragrafen gebruiken het het meest intensief. §8.1 is voorkennis, §8.4–8.5 bouwen erop voort. |
| **Controle-stap verplicht** (§8.4+8.5) | Boek benadrukt dit herhaaldelijk ("Vergeet de controle niet!"). Didactisch essentieel. |
| **Geen NotebookLM-koppeling in app** | Slides worden extern gegenereerd. App is alleen consumer, niet producer. Houdt scope beheersbaar. |

---

## Document-statistieken

| Metriek | Waarde |
|---------|--------|
| Totaal documenten | 10 |
| Paragrafen gespecificeerd | 5 (§8.1–§8.5) |
| Boek-opgaven gemapped | ~33 (opgaven 1–33) |
| Extra oefeningen (E#) | 11 (E1–E11) |
| Route-specifieke opgaven | O4, O6, O14, O19, O24, O32 (ondersteunend) + U1–U7 (uitdagend) |
| Leerdoelenchecks | 5 (LDC-8.1–8.5) |
| Generator-types | 5 |
| Error-tags | 19 unieke tags |
| Inputtypes | 16 (A t/m P) |
| QA testcases | 80+ |
| Geïdentificeerde risico's | 23 |
