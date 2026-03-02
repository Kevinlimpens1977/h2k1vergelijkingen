# Feature Spec — §8.2 De balans

**Paragraaf-ID:** `8_2`
**Bronpagina's:** p. 50–53
**Vorige sectie:** §8.1 Gelijksoortige termen
**Volgende sectie:** §8.3 Vergelijkingen oplossen met een balans

---

## 1. Leerdoelen (exact uit bron p. 50)

| ID | Je leert… |
|----|-----------|
| LD-8.2 | Hoe je bij het oplossen van een vergelijking een balans kunt gebruiken |

---

## 2. Theorie-inhoud (uit bron p. 51)

### Kernbegrip

> Bij het oplossen van een vergelijking kun je denken aan een **balans**.
> Als je van beide kanten van een balans hetzelfde eraf haalt of aan beide kanten hetzelfde erbij doet, blijft de balans in evenwicht.

### Voorbeeld uit het boek (p. 51)

| Stap | Balans | Vergelijking |
|------|--------|-------------|
| Start | 5 zakjes + 6 knikkers = 16 knikkers | `5a + 6 = 16` |
| Actie | Links en rechts 6 knikkers weghalen | `5a + 6 − 6 = 16 − 6` |
| Resultaat | 5 zakjes = 10 knikkers | `5a = 10` |
| Conclusie | In één zakje zitten twee knikkers | `a = 2` |

---

## 3. Digibord Mode — Lesflow §8.2

### Stap 1: Slides tonen
- App laadt `/slides/8_2.pdf` in de in-app PDF viewer.
- Docent bladert door slides (introductie balansconcept).

### Stap 2: Theorie interactief
- Visuele weegschaal op scherm met zakjes en knikkers (conform boek-illustraties).
- Docent demonstreert: "Als je links 6 weghaalt, moet je rechts ook 6 weghalen."
- Voorbeeld `5a + 6 = 16` wordt stapsgewijs doorgenomen met animatie.

### Stap 3: Klassikale inoefenopgave
- **Gekozen opgave: Opgave 13** (p. 52)
- Context: Balans met `2a + 3 = 9`.
  - a. Hoeveel knikkers kun je links en rechts maximaal weghalen?
  - b. Knikkers weghalen → nieuwe balans tekenen.
  - c. Hoeveel knikkers zitten er in één zakje?
- Docent voert stappen uit in **Balance Lab** op digibord (projectie-modus).

### Stap 4: Start zelfstandig werk
- Docent drukt op "Start zelfstandig werk" → timer start (45 min).
- Leerlingen schakelen naar Leerling Mode en kiezen leerroute.

---

## 4. Leerling Mode — Zelfstandig werk §8.2

### Leerroute-keuze

| Route | Opgavevolgorde |
|-------|---------------|
| **Ondersteunend** | 8 → 9 → 10 → 11 → 12 → 13 → **O14** |
| **Doorlopend** | 8 → 9 → 10 → 11 → 12 → 13 → 14 |
| **Uitdagend** | 9 → 10 → 11 → 12 → 13 → 14 → **U3** |

### Opgaven-overzicht

| ID | Bron | Type | Korte beschrijving | Deelvragen | Balance Lab |
|----|------|------|--------------------|------------|-------------|
| 8 | p. 50 | Conceptueel | Britt en Ellen op de wip — evenwicht. Hond springt op schaal → wat gebeurt er? | a, b | — |
| 9 | p. 50 | Balans aflezen | Balans met blikken appelmoes en gewichtjes. Vergelijking schrijven, gewicht berekenen. | a, b, c, d | 🔬 Open in Balance Lab |
| 10 | p. 50 | Balans aflezen | Balans A met kazen en gewichten. Vergelijking invullen, gewicht berekenen. | a, b, c, d | 🔬 Open in Balance Lab |
| 11 | p. 51 | Balans manipuleren | Vier zakjes + 5 losse knikkers = 17 losse knikkers. Weghalen → evenwicht. | a, b, c | 🔬 Open in Balance Lab |
| 12 | p. 51 | Balans manipuleren | Vergelijking `...g + 3 = 24`. Weghalen, tekenen, berekenen. | a, b, c | 🔬 Open in Balance Lab |
| 13 | p. 52 | Balans manipuleren | Balans `2a + 3 = 9`. Knikkers weghalen, zakje berekenen. | a, b, c | 🔬 Open in Balance Lab |
| O14 | p. 53 | Ondersteunend | Twee balanstekeningen ❶❷. Vergelijking invullen, knikkers weghalen, per zakje berekenen. | a, b, c, d, e | 🔬 Open in Balance Lab |
| 14 | p. 52 | Standaard | Drie balansen A, B, C. Vergelijking opschrijven en knikkers per zakje berekenen. | a, b | 🔬 Open in Balance Lab |
| U3 | p. 53 | Uitdagend | Drie appels kosten €1,20. Context met fruit-prijzen via balans-logica. | — | — |

### Balance Lab koppeling

Elke opgave met 🔬 toont een knop **"Open in Balance Lab"**:
- Klikt de leerling hierop → Balance Lab opent met de vergelijking uit de opgave vooringevuld.
- Na oplossen in Balance Lab → resultaat wordt teruggekoppeld naar de opgave.
- Leerling kan ook handmatig antwoord invoeren zonder Balance Lab.

---

## 5. Opgave-UX per inputtype

### Inputtype D — Vergelijking aflezen bij balans
**Gebruikt bij:** 9, 10, 12, O14, 14

| Element | Specificatie |
|---------|-------------|
| Visueel | Statische balansafbeelding (uit boek) met zakjes + knikkers |
| Invoerveld | Vergelijking-invoer: `... a + ... = ...` (template met lege plekken) |
| Validatie | Vergelijkt met correcte vergelijking (canonical form) |
| Feedback correct | ✅ "Goed! Bij deze balans hoort `5a + 6 = 16`" |
| Feedback fout | ❌ "Kijk nog eens goed naar de balans. Tel de zakjes en knikkers." |

### Inputtype E — Balans manipuleren (weghalen)
**Gebruikt bij:** 11, 12, 13

| Element | Specificatie |
|---------|-------------|
| Vraag | "Hoeveel kun je links en rechts maximaal weghalen?" |
| Invoerveld | Numeriek veld |
| Vervolg | "Hoeveel knikkers zitten er in één zakje?" → Numeriek veld |
| Alternatief | Knop "Open in Balance Lab" → volledige interactieve ervaring |

### Inputtype F — Contextopgave (U3)
**Gebruikt bij:** U3

| Element | Specificatie |
|---------|-------------|
| Context | Afbeelding fruit-prijzen: 3 appels = €1,20; appel + kokosnoot = €4,80; banaan = €0,20 |
| Invoervelden | Prijs per appel, prijs kokosnoot, prijs banaan |
| Validatie | Numerieke vergelijking met €-format |

---

## 6. Feedback Tags §8.2

| Error Tag | Wanneer | Voorbeeldfout |
|-----------|---------|--------------|
| `BALANCE_ONE_SIDE` | Leerling haalt alleen aan één kant iets weg | Links 3 weghalen, rechts niet |
| `SIGN_ERROR` | Plus/min verkeerd bij weghalen | `5a + 6 − 6 = 16 + 6` (optellen ipv aftrekken) |
| `ARITHMETIC_ERROR` | Rekenfout bij knikkers tellen of delen | `10 ÷ 5 = 3` |
| `EQUATION_READ_ERROR` | Vergelijking verkeerd afgelezen bij balans | Zakjes en knikkers verwisseld |
| `DIVIDE_COEFF_MISS` | Vergeten te delen door aantal zakjes | `5a = 10` → antwoord `a = 10` |
| `NOT_SIMPLIFIED` | Stap overgeslagen (niet maximaal weggehaald) | `5a + 6 = 16` → `5a + 3 = 13` (niet af) |

---

## 7. Leerdoelencheck §8.2

**Trigger:** Leerling heeft alle opgaven van gekozen route afgerond.

| Vraag (exact uit bron p. 52) | Gekoppeld aan |
|------------------------------|--------------|
| Bij de balans hoort de vergelijking `4a + 9 = 21`. Los de vergelijking op. | → opdracht E4 |

### Verwachte oplossingsstappen
1. Beide kanten −9 → `4a = 12`
2. Delen door 4 → `a = 3`

### Beoordeling
- **Correct** (`a = 3`) → Doorgaan naar Extra oefening E4 of Generator.
- **Incorrect** → Specifieke fout-feedback + terugverwijzing naar theorie §8.2.

---

## 8. Extra Oefening E4 (uit Samenvatting p. 67)

| ID | Opgave (exact uit bron) | Inputtype |
|----|------------------------|-----------|
| **E4** | De balans is in evenwicht. Aan de linkerkant liggen vijf zakjes met ieder a knikkers en een losse knikker. Op de rechter schaal liggen zestien losse knikkers. | Balance Lab |
|    | Bij de balans hoort de vergelijking `5a + 1 = 16`. | |
|    | a) Hoeveel knikkers kun je links en rechts maximaal weghalen? | Numeriek |
|    | b) Als je links en rechts het maximale aantal knikkers weghaalt, krijg je de tweede balans. Teken het juiste aantal knikkers in de tweede balans. | Visueel (tekenen/slepen) |
|    | c) Hoeveel knikkers zitten er in één zakje? | Numeriek |

### Verwacht antwoord
- a) 1 knikker
- b) Links: 5 zakjes, rechts: 15 knikkers
- c) `a = 3`

---

## 9. Oneindige Generator §8.2

**Generator-ID:** `BALANCE_SIMPLE`

### Vergelijkingstype
`n·a + c = d` (letter-termen alleen links, constante rechts)

### Generatorlogica

| Parameter | Herhaal-modus | Verdiep-modus |
|-----------|--------------|---------------|
| Coëfficiënt (n) | 2–6 | 2–10 |
| Constante links (c) | 1–10 (positief) | 1–20 (positief) |
| Constante rechts (d) | zo dat a ∈ ℕ, a ≥ 1 | zo dat a ∈ ℕ, a ≥ 1 |
| Variabele | a | a–z (random) |
| Visuele balans | altijd getoond | optioneel (toggle) |
| Balance Lab knop | altijd beschikbaar | altijd beschikbaar |

### Constraint
`d − c` moet deelbaar zijn door `n` (zodat `a` een geheel getal is).

### Voorbeeldgeneratie

| Modus | Vergelijking | Stap 1 | Stap 2 | Antwoord |
|-------|-------------|--------|--------|----------|
| Herhaal | `3a + 5 = 20` | −5 → `3a = 15` | ÷3 | `a = 5` |
| Herhaal | `4a + 2 = 18` | −2 → `4a = 16` | ÷4 | `a = 4` |
| Verdiep | `7b + 9 = 72` | −9 → `7b = 63` | ÷7 | `b = 9` |
| Verdiep | `6x + 14 = 50` | −14 → `6x = 36` | ÷6 | `x = 6` |

### Feedback bij generator
- Dezelfde error-tags als §6 hierboven.
- Elke opgave biedt "Open in Balance Lab" knop.
- Na 3 opeenvolgende fouten → automatische hint + theorie-popup.
- Na 5 correcte op rij → "Je beheerst de balansmethode!" + optie stoppen of doorgaan.

---

## 10. Content Mapping Table §8.2 (samenvattend)

| Categorie | ID(s) | Route | Beschrijving |
|-----------|-------|-------|-------------|
| **Slides** | `/slides/8_2.pdf` | Digibord | Theorie-slides balansconcept |
| **Klassikale inoefenopgave** | Opgave 13 | Digibord | `2a + 3 = 9` met Balance Lab demonstratie |
| **Zelfstandig — Ondersteunend** | 8, 9, 10, 11, 12, 13, **O14** | O | Balans concept + begeleide oefening |
| **Zelfstandig — Doorlopend** | 8, 9, 10, 11, 12, 13, 14 | D | Balans concept + drie balansen |
| **Zelfstandig — Uitdagend** | 9, 10, 11, 12, 13, 14, **U3** | U | Balans + context fruit-prijzen |
| **Balance Lab koppeling** | Opgaven 9–14, O14 | Alle | Knop "Open in Balance Lab" bij elke balansopdracht |
| **Leerdoelencheck** | LDC-8.2 | Alle | `4a + 9 = 21` oplossen |
| **Extra oefening** | E4 | Alle | Balans `5a + 1 = 16` (samenvatting p. 67) |
| **Oneindige generator** | `BALANCE_SIMPLE` | Alle | `n·a + c = d`, visuele balans, gehele oplossingen |
| **Feedback tags** | `BALANCE_ONE_SIDE`, `SIGN_ERROR`, `ARITHMETIC_ERROR`, `EQUATION_READ_ERROR`, `DIVIDE_COEFF_MISS`, `NOT_SIMPLIFIED` | — | Fout-classificatie voor dashboard |
