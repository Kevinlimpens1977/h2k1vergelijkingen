# Feature Spec — §8.1 Gelijksoortige termen

**Paragraaf-ID:** `8_1`
**Bronpagina's:** p. 46–48
**Vorige sectie:** —
**Volgende sectie:** §8.2 De balans

---

## 1. Leerdoelen (exact uit bron p. 46)

| ID | Je leert… |
|----|-----------|
| LD-8.1a | Wat termen en gelijksoortige termen zijn |
| LD-8.1b | Hoe je met gelijksoortige termen werkt |

---

## 2. Theorie-inhoud (uit bron p. 47)

### Kernbegrippen

- **Termen:** In formules kunnen stukjes voorkomen die bij elkaar opgeteld mogen worden. Zulke stukjes heten termen.
- **Gelijksoortige termen:** Termen waarin dezelfde letter of hetzelfde woord voorkomt, noem je gelijksoortige termen.
- **Regel:** In een formule kun je gelijksoortige termen bij elkaar nemen. Wanneer de termen niet gelijksoortig zijn, kun je ze niet bij elkaar nemen. De formule kan dan niet korter geschreven worden.
- **Extra regel:** Als in een formule de letter wordt vermenigvuldigd met het getal 1 of −1, mag je de 1 ook weglaten.

### Voorbeelden uit het boek

| # | Opgave | Uitwerking | Toelichting |
|---|--------|-----------|-------------|
| Vb 1 | Schrijf `4 × a + 7 × a = b` zo kort mogelijk | `4 × a` en `7 × a` zijn gelijksoortig → `11a = b` | Coëfficiënten optellen |
| Vb 2 | Schrijf `33d − 12d = g` zo kort mogelijk | `33d` en `−12d` zijn gelijksoortig → `21d = g` | Coëfficiënten aftrekken |
| Vb 3 | Schrijf `10K + 7 + 8n = m` zo kort mogelijk | Geen gelijksoortige termen → niet korter | Verschillende letters |
| Vb 4 | `b = 1a + 7` | `b = a + 7` | ×1 weglaten |
| Vb 5 | `4m − 1w = p` | `p = 4m − w` | ×1 weglaten bij −1 |

---

## 3. Digibord Mode — Lesflow §8.1

### Stap 1: Slides tonen
- App laadt `/slides/8_1.pdf` in de in-app PDF viewer.
- Docent bladert door slides (theorie gelijksoortige termen).

### Stap 2: Theorie interactief
- Scherm toont de drie voorbeelden (Vb 1–3) stapsgewijs.
- Per voorbeeld: eerst de formule, dan highlight van gelijksoortige termen (kleurmarkering), dan het resultaat.

### Stap 3: Klassikale inoefenopgave
- **Gekozen opgave: Opgave 1** (p. 46)
- Docent projecteert opgave 1 op digibord:
  - Context: Ad meet de lengte van de haag, stap = s, onderste deel = `6 × s`, totale haag-formule.
  - Deelvraag a t/m d worden stapsgewijs doorgenomen.
- Leerlingen beantwoorden klassikaal (mondeling of via persoonlijk device).

### Stap 4: Start zelfstandig werk
- Docent drukt op "Start zelfstandig werk" → timer start (45 min).
- Leerlingen schakelen naar Leerling Mode en kiezen leerroute.

---

## 4. Leerling Mode — Zelfstandig werk §8.1

### Leerroute-keuze

Leerling (of docent) kiest route. Opgaven worden in vaste volgorde aangeboden:

| Route | Opgavevolgorde |
|-------|---------------|
| **Ondersteunend** | 1 → 2 → 3 → **O4** → 5 → **O6** → 7 |
| **Doorlopend** | 1 → 2 → 3 → 4 → 5 → 6 → 7 |
| **Uitdagend** | 1 → 2 → 4 → 6 → 7 → **U1** → **U2** |

*Vetgedrukte opgaven (O4, O6, U1, U2) zijn route-specifiek.*

### Opgaven-overzicht

| ID | Bron | Type | Korte beschrijving | Deelvragen |
|----|------|------|--------------------|------------|
| 1 | p. 46 | Context | Ad meet lengte haag met stappen (s). Formule `6 × s`, lengte h berekenen. | a, b, c, d |
| 2 | p. 46 | Context | Marijn: formule `28s = h`. Vergelijken met opgave 1. | a, b, c |
| 3 | p. 46 | Context | Vlaggetjeslijn: breedte v, afstand a. Formule opstellen. | a, b, c |
| O4 | p. 47 | Ondersteunend | Formules korter schrijven (12 deelvragen). | a t/m l |
| 4 | p. 47 | Standaard | Formules korter schrijven (12 deelvragen). | a t/m l |
| 5 | p. 48 | Standaard | Formules zo kort mogelijk schrijven. | a t/m f |
| O6 | p. 48 | Ondersteunend | Delvin/Nik/Merijn: formules korter schrijven + vergelijken. | a, b, c |
| 6 | p. 48 | Standaard | Delvin/Nik/Merijn: formules korter schrijven + vergelijken. | a, b, c |
| 7 | p. 48 | Context | Jantine verkoopt loten voor KiKa. Opbrengstformule vereenvoudigen. | a, b, c |
| U1 | p. 48 | Uitdagend | Dit staat niet in de bronpagina's (verwezen op p. 48). | — |
| U2 | p. 48 | Uitdagend | Dit staat niet in de bronpagina's (verwezen op p. 48). | — |

---

## 5. Opgave-UX per inputtype

### Inputtype A — Formule vereenvoudigen
**Gebruikt bij:** O4, 4, 5, O6, 6, E1, E2, E3

| Element | Specificatie |
|---------|-------------|
| Invoerveld | Wiskunde-tekstveld met letter + getal invoer (bijv. `11a + b`) |
| Validatie | Parseert algebraïsche expressie, vergelijkt met canonical form |
| Feedback correct | ✅ "Goed! `4a + 7a = 11a`" met groene markering |
| Feedback fout | ❌ Foutmelding + error-tag + hint |
| Hint niveau 1 | "Welke termen zijn gelijksoortig?" (highlight dezelfde letters) |
| Hint niveau 2 | "Tel de getallen vóór de letter bij elkaar op." |

### Inputtype B — Formule opstellen (context)
**Gebruikt bij:** 1, 2, 3, 7

| Element | Specificatie |
|---------|-------------|
| Invoerveld | Wiskunde-tekstveld voor volledige formule |
| Validatie | Vergelijkt met verwacht antwoord (canonical form) |
| Feedback correct | ✅ Toon vereenvoudigde vorm als die bestaat |
| Feedback fout | ❌ Toon welk deel niet klopt + error-tag |
| Hint | Context-specifieke aanwijzing (bijv. "Kijk naar het patroon in de tekening") |

### Inputtype C — Meerkeuze / Open antwoord
**Gebruikt bij:** deelvragen als "Hoeveel cm/meter" of "Welke termen"

| Element | Specificatie |
|---------|-------------|
| Invoerveld | Numeriek veld of kort tekstveld |
| Validatie | Exact match of numerieke tolerantie |

---

## 6. Feedback Tags §8.1

| Error Tag | Wanneer | Voorbeeldfout |
|-----------|---------|--------------|
| `LIKE_TERMS_MISMATCH` | Niet-gelijksoortige termen samengevoegd | `4a + 3b` → fout: `7ab` |
| `SIMPLIFY_ERROR` | Coëfficiënten verkeerd opgeteld/afgetrokken | `4a + 7a` → fout: `10a` |
| `SIGN_ERROR` | Plus/min-teken verkeerd toegepast | `33d − 12d` → fout: `45d` |
| `ARITHMETIC_ERROR` | Rekenfout bij getallen | `6 × 5` → fout: `35` |
| `COEFFICIENT_ONE_KEPT` | Vergeten ×1 weg te laten | Antwoord `1a + 7` ipv `a + 7` |
| `NOT_SIMPLIFIED` | Formule kan korter maar leerling schrijft origineel over | Antwoord = invoer |

---

## 7. Leerdoelencheck §8.1

**Trigger:** Leerling heeft alle opgaven van gekozen route afgerond.

| # | Vraag (exact uit bron p. 48) | Gekoppeld aan |
|---|------------------------------|--------------|
| a | Welke termen staan er in de formule `2t + 30u = p`? | → E1 |
| b | Schrijf, indien mogelijk, de formules zo kort mogelijk: | → E2 en E3 |
|   | ❶ `p = 2q + 3q + 5` | |
|   | ❷ `14c + 9 − 13c = d` | |
|   | ❸ `a = b + 3c + 10` | |

### Beoordeling
- **Voldoende** (≥ 3 van 4 correct) → Doorgaan naar Extra oefening of Generator.
- **Onvoldoende** (< 3 correct) → Terugverwijzing naar theorie §8.1 + fout-specifieke uitleg.

---

## 8. Extra Oefeningen E1–E3 (uit Samenvatting p. 66)

| ID | Opgave (exact uit bron) | Inputtype |
|----|------------------------|-----------|
| **E1** | Schrijf van elke formule de gelijksoortige termen op: | Tekst/selectie |
|    | a) `10x + 8x + 5 = y` | |
|    | b) `k = 25a − 12a` | |
|    | c) `m = 11,5d + 9 − 3e` | |
| **E2** | Schrijf, indien mogelijk, de formules uit opdracht E1 zo kort mogelijk. | Formule-invoer |
| **E3** | Schrijf, indien mogelijk, de formules zo kort mogelijk: | Formule-invoer |
|    | a) `9 + 10 × k − 6 × k = m` | |
|    | b) `z = 12x + 4y + 3` | |
|    | c) `7m − 6m + 8 = a` | |
|    | d) `b = 12c + 9 − 6c` | |

---

## 9. Oneindige Generator §8.1

**Generator-ID:** `SIMPLIFY_LIKE_TERMS`

### Generatorlogica

| Parameter | Herhaal-modus | Verdiep-modus |
|-----------|--------------|---------------|
| Aantal termen | 2–3 | 3–5 |
| Coëfficiënten | gehele getallen 1–20 | gehele getallen −20 tot 20, decimaal mogelijk |
| Variabelen | 1 letter (a–z) | 1–2 letters |
| Operatoren | alleen + | + en − |
| Losse getallen | 0–1 constante term | 0–2 constante termen |
| ×1 / ×(−1) gevallen | nee | ja (soms) |

### Voorbeeldgeneratie

| Modus | Gegenereerde formule | Verwacht antwoord |
|-------|---------------------|-------------------|
| Herhaal | `5a + 3a + 2 = b` | `8a + 2 = b` of `b = 8a + 2` |
| Herhaal | `12p − 4p = q` | `8p = q` |
| Verdiep | `7x − 3x + 2y + 4 = z` | `4x + 2y + 4 = z` |
| Verdiep | `1m + 9 − 6m = n` | `n = −5m + 9` of `n = 9 − 5m` |

### Feedback bij generator

- Dezelfde error-tags als §6 hierboven.
- Na 3 opeenvolgende foute antwoorden → automatische hint + terugverwijzing naar theorie.
- Na 5 correcte antwoorden op rij → "Goed bezig! Je beheerst gelijksoortige termen." + optie om te stoppen of door te gaan.

---

## 10. Content Mapping Table §8.1 (samenvattend)

| Categorie | ID(s) | Route | Beschrijving |
|-----------|-------|-------|-------------|
| **Slides** | `/slides/8_1.pdf` | Digibord | Theorie-slides gelijksoortige termen |
| **Klassikale inoefenopgave** | Opgave 1 | Digibord | Haag-context intro termen |
| **Zelfstandig — Ondersteunend** | 1, 2, 3, **O4**, 5, **O6**, 7 | O | Basis vereenvoudigen met extra begeleiding |
| **Zelfstandig — Doorlopend** | 1, 2, 3, 4, 5, 6, 7 | D | Standaard vereenvoudigen |
| **Zelfstandig — Uitdagend** | 1, 2, 4, 6, 7, **U1**, **U2** | U | Verdiepend + extra uitdaging |
| **Leerdoelencheck** | LDC-8.1 (vraag a + b) | Alle | Termen herkennen + formules vereenvoudigen |
| **Extra oefening** | E1, E2, E3 | Alle | Herhaling gelijksoortige termen (samenvatting p. 66) |
| **Oneindige generator** | `SIMPLIFY_LIKE_TERMS` | Alle | Herhaal: basis · Verdiep: meerdere letters + negatief |
| **Feedback tags** | `LIKE_TERMS_MISMATCH`, `SIMPLIFY_ERROR`, `SIGN_ERROR`, `ARITHMETIC_ERROR`, `COEFFICIENT_ONE_KEPT`, `NOT_SIMPLIFIED` | — | Fout-classificatie voor dashboard |
