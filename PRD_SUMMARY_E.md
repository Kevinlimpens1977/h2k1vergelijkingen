# Feature Spec — Samenvatting leerdoelen + Extra oefening E1–E11

**Sectie-ID:** `samenvatting`
**Bronpagina's:** p. 66–71
**Doel:** Herhaling van alle leerdoelen H8 met voorbeelden + 11 extra oefeningen

---

## 1. Overzicht: E-opgaven per paragraaf

| § | Leerdoel | E-opgaven | Vaardigheid |
|---|---------|-----------|-------------|
| 8.1 | Gelijksoortige termen herkennen en samenvoegen | **E1**, **E2**, **E3** | Termen herkennen, formules vereenvoudigen |
| 8.2 | Vergelijking oplossen met balans (letters één kant) | **E4** | Balans `na + c = d` manipuleren |
| 8.3 | Vergelijking oplossen met balans (letters beide kanten) | **E5**, **E6** | Balans `pa + c = qa + d` stapsgewijs |
| 8.4 | Vergelijking formeel oplossen (4-stappen aanpak) | **E7**, **E8** | Formeel oplossen + controle |
| 8.5 | Omslagpunt berekenen | **E9**, **E10**, **E11** | Grafiek aflezen, vergelijking opstellen, oplossen |

---

## 2. Per E-opgave: volledige specificatie

### E1 — Gelijksoortige termen herkennen (§8.1)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 66 |
| **Toetst** | LD-8.1a — Herkennen welke termen gelijksoortig zijn |
| **Opgave** | Schrijf van elke formule de gelijksoortige termen op. |
| **Deelvragen** | a) `10x + 8x + 5 = y` · b) `k = 25a − 12a` · c) `m = 11,5d + 9 − 3e` |
| **Inputtype** | Tekst/selectie: leerling selecteert of typt de gelijksoortige termen |
| **Verwacht** | a) `10x` en `8x` · b) `25a` en `−12a` (of `25a` en `12a`) · c) geen gelijksoortige termen |
| **Feedback tags** | `LIKE_TERMS_MISMATCH` (verkeerde termen gekozen), `NOT_SIMPLIFIED` |

### E2 — Formules vereenvoudigen (§8.1)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 66 |
| **Toetst** | LD-8.1b — Gelijksoortige termen samenvoegen |
| **Opgave** | Schrijf, indien mogelijk, de formules uit opdracht E1 zo kort mogelijk. |
| **Deelvragen** | a) `10x + 8x + 5 = y` · b) `k = 25a − 12a` · c) `m = 11,5d + 9 − 3e` |
| **Inputtype** | Formule-invoer |
| **Verwacht** | a) `18x + 5 = y` · b) `k = 13a` · c) niet korter (geen gelijksoortige termen) |
| **Feedback tags** | `SIMPLIFY_ERROR`, `LIKE_TERMS_MISMATCH`, `ARITHMETIC_ERROR` |

### E3 — Formules zo kort mogelijk schrijven (§8.1)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 66 |
| **Toetst** | LD-8.1b — Vereenvoudigen, inclusief ×1 weglaten |
| **Opgave** | Schrijf, indien mogelijk, de formules zo kort mogelijk. |
| **Deelvragen** | a) `9 + 10 × k − 6 × k = m` · b) `z = 12x + 4y + 3` · c) `7m − 6m + 8 = a` · d) `b = 12c + 9 − 6c` |
| **Inputtype** | Formule-invoer |
| **Verwacht** | a) `9 + 4k = m` of `m = 4k + 9` · b) niet korter · c) `m + 8 = a` of `a = m + 8` · d) `b = 6c + 9` |
| **Feedback tags** | `SIMPLIFY_ERROR`, `COEFFICIENT_ONE_KEPT`, `SIGN_ERROR`, `ARITHMETIC_ERROR` |

### E4 — Balans eenvoudig (§8.2)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 67 |
| **Toetst** | LD-8.2 — Balans manipuleren (letters één kant) |
| **Opgave** | Balans in evenwicht. Vijf zakjes met a knikkers + 1 losse knikker = 16 losse knikkers. Vergelijking: `5a + 1 = 16`. |
| **Deelvragen** | a) Hoeveel knikkers kun je links en rechts maximaal weghalen? · b) Teken het juiste aantal knikkers in de tweede balans. · c) Hoeveel knikkers zitten er in één zakje? |
| **Inputtype** | a) Numeriek · b) Visueel (slepen/tekenen) · c) Numeriek |
| **Verwacht** | a) 1 · b) 5 zakjes links, 15 knikkers rechts · c) `a = 3` |
| **Feedback tags** | `BALANCE_ONE_SIDE`, `ARITHMETIC_ERROR`, `DIVIDE_COEFF_MISS` |
| **Balance Lab** | 🔬 Beschikbaar |

### E5 — Balans twee kanten (§8.3)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 68 |
| **Toetst** | LD-8.3 — Balans manipuleren (letters beide kanten) |
| **Opgave** | Balans bij vergelijking `6g = 3g + 6`. |
| **Deelvragen** | a) Hoeveel kazen kun je maximaal aan beide kanten weghalen? · b) Teken de nieuwe balans. · c) Schrijf de bijbehorende vergelijking ernaast. · d) Hoeveel weegt één kaas? |
| **Inputtype** | a) Numeriek · b) Visueel · c) Vergelijking-invoer · d) Numeriek |
| **Verwacht** | a) 3 kazen · b) 3 kazen = 6 gewicht · c) `3g = 6` · d) `g = 2` |
| **Feedback tags** | `BALANCE_ONE_SIDE`, `ARITHMETIC_ERROR`, `DIVIDE_COEFF_MISS` |
| **Balance Lab** | 🔬 Beschikbaar |

### E6 — Balans twee kanten uitgebreid (§8.3)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 69 |
| **Toetst** | LD-8.3 — Meerstaps balans (letters beide kanten) |
| **Opgave** | Balans bij vergelijking `2a + 14 = 4a + 2`. |
| **Deelvragen** | a) Hoeveel knikkers kun je maximaal aan beide kanten weghalen? · b) Teken de nieuwe balans. · c) Schrijf de vergelijking die bij de nieuwe balans hoort ernaast. · d) Los de vergelijking verder op (nog een balans tekenen + vergelijking). |
| **Inputtype** | a) Numeriek · b) Visueel · c) Vergelijking-invoer · d) Vergelijking-invoer + Numeriek |
| **Verwacht** | a) 2 knikkers · b/c) `2a + 12 = 4a` · d) `12 = 2a` → `a = 6` |
| **Feedback tags** | `BALANCE_ONE_SIDE`, `SIGN_ERROR`, `DIVIDE_COEFF_MISS`, `INCOMPLETE_SOLVE` |
| **Balance Lab** | 🔬 Beschikbaar |

### E7 — Kladblaadje invullen (§8.4)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 70 |
| **Toetst** | LD-8.4 — Formeel oplossen met tussenstappen |
| **Opgave** | Kladblaadje met begin: `8x − 33 = −2x + 7`, `+2x  +2x`. Vul de tussenstappen verder in. |
| **Inputtype** | Scaffolded invoer: lege plekken per stap |
| **Verwacht** | `10x − 33 = 7` → `+33 +33` → `10x = 40` → `x = 4`. Controle: `8×4−33 = −1`, `−2×4+7 = −1` ✓ |
| **Feedback tags** | `MOVE_TERM_WRONG`, `SIGN_ERROR`, `ARITHMETIC_ERROR`, `CHECK_FAILED` |

### E8 — Vergelijkingen oplossen + controle (§8.4)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 70 |
| **Toetst** | LD-8.4 — Zelfstandig formeel oplossen |
| **Opgave** | Los de vergelijkingen op en controleer je oplossing. |
| **Deelvragen** | a) `3b + 8 = 8 + 2b` · b) `3c + 16 = −5c − 16` · c) `14 + 8x = −4x + 86` |
| **Inputtype** | Antwoord-invoer + controle-veld |
| **Verwacht** | a) `b = 0` · b) `c = −4` · c) `x = 6` |
| **Feedback tags** | `MOVE_TERM_WRONG`, `SIGN_ERROR`, `DIVIDE_COEFF_MISS`, `CHECK_FAILED`, `ARITHMETIC_ERROR` |

### E9 — Omslagpunt aflezen (§8.5)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 71 |
| **Toetst** | LD-8.5a — Omslagpunt herkennen in grafiek |
| **Opgave** | De grafieken horen bij de formules `b = 40a + 120` en `195 + 15a = b`. Omcirkel het omslagpunt van de twee grafieken. |
| **Inputtype** | Grafiek-interactie (klik snijpunt) of numeriek |
| **Verwacht** | Omslagpunt bij `a = 3` |
| **Feedback tags** | `GRAPH_READING` |

### E10 — Omslagpunt berekenen (§8.5)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 71 |
| **Toetst** | LD-8.5b — Vergelijking opstellen + oplossen voor omslagpunt |
| **Opgave** | Bereken de eerste coördinaat van het omslagpunt uit E9. |
| **Deelvragen** | a) Maak de vergelijking af: `40a + 120 = ... + ...` · b) Los op, vergeet de controle niet. |
| **Inputtype** | a) Vergelijking-invoer · b) Antwoord + controle |
| **Verwacht** | a) `40a + 120 = 195 + 15a` · b) `a = 3`. Controle: `240 = 240` ✓ |
| **Feedback tags** | `SETUP_EQUATION`, `SIGN_ERROR`, `ARITHMETIC_ERROR`, `CHECK_FAILED` |

### E11 — Luchtballonnen omslagpunt (§8.5)

| Eigenschap | Waarde |
|-----------|--------|
| **Bron** | p. 71 |
| **Toetst** | LD-8.5a + LD-8.5b — Context, grafiek koppelen, vergelijking, oplossen |
| **Opgave** | Twee luchtballonnen: A: `h = 1000 − 5t`, B: `h = 550 − 2t`. |
| **Deelvragen** | a) Welke grafiek hoort bij A? · b) Welke ballon landt het laatst? · c) Welke vergelijking voor het omslagpunt? · d) Bereken de eerste coördinaat. |
| **Inputtype** | a) Meerkeuze · b) Meerkeuze · c) Vergelijking-invoer · d) Antwoord + controle |
| **Verwacht** | a) Steilere grafiek · b) B · c) `1000 − 5t = 550 − 2t` · d) `t = 150`. Controle: `250 = 250` ✓ |
| **Feedback tags** | `FORMULA_SWAP`, `SETUP_EQUATION`, `SIGN_ERROR`, `ARITHMETIC_ERROR`, `CHECK_FAILED` |

---

## 3. Samenvatting-modus in de app

### Navigatie

De Samenvatting is bereikbaar via het **Global Header** menu-item "Samenvatting".

### Structuur

```
[Samenvatting-pagina]
├── Kies modus:
│   ├── "Per paragraaf" → dropdown §8.1 | §8.2 | §8.3 | §8.4 | §8.5
│   └── "Alles" → alle leerdoelen sequentieel
│
├── Per gekozen §:
│   ├── Leerdoel (tekst + opsomming uit boek)
│   ├── Theorie-samenvatting (voorbeelden uit samenvatting p. 66–71)
│   ├── E-opgaven behorend bij deze §
│   └── Resultaat per E-opgave (✅ / ❌)
│
└── Totaaloverzicht:
    ├── Scorebalk per § (hoeveel E-opgaven correct)
    └── Eindoordeel: "Hoofdstuk beheerst" / "Nog oefenen"
```

### Flow "Per paragraaf"

1. Leerling kiest paragraaf (bijv. §8.3).
2. Theorie-samenvatting voor §8.3 wordt getoond (leerdoel + voorbeeld uit p. 68).
3. E-opgaven E5 en E6 worden aangeboden.
4. Na afronding: score voor deze § + optie om naar generator te gaan.

### Flow "Alles"

1. Theorie-samenvatting §8.1 → E1, E2, E3.
2. Theorie-samenvatting §8.2 → E4.
3. Theorie-samenvatting §8.3 → E5, E6.
4. Theorie-samenvatting §8.4 → E7, E8.
5. Theorie-samenvatting §8.5 → E9, E10, E11.
6. Na afronding: totaaloverzicht met eindoordeel.

### Theorie-samenvattingen (exact uit bronpagina's)

| § | Leerdoel-samenvatting (uit bron) |
|---|--------------------------------|
| 8.1 | "Je weet wat termen en gelijksoortige termen zijn en hoe je met gelijksoortige termen werkt." Incl. 3 voorbeelden: `14c = d`, `k = g + 2`, `4c + 3 + 7d = e` (niet korter). |
| 8.2 | "Je kunt bij het oplossen van een vergelijking een balans gebruiken." Incl. voorbeeld: `3a + 4 = 10` → `a = 2`. |
| 8.3 | "Je kunt een vergelijking oplossen met een balans." Incl. voorbeeld: `5g + 2 = 2g + 14` → `g = 4`. |
| 8.4 | "Je kunt een vergelijking oplossen waarin aan beide kanten van het '= teken' letters staan." Incl. 4-stappen aanpak + 2 voorbeelden: `a = 7` en `p = −6`. |
| 8.5 | "Je weet wat een omslagpunt is en je kunt de eerste coördinaat van een omslagpunt berekenen." Incl. 2-stappen aanpak + voorbeeld: `p = 5`. |

---

## 4. Slagingsregel "Hoofdstuk beheerst"

### Per paragraaf

| § | E-opgaven | Slagingsdrempel |
|---|-----------|----------------|
| 8.1 | E1 + E2 + E3 (totaal ~10 deelvragen) | ≥ 7 correct |
| 8.2 | E4 (3 deelvragen) | ≥ 2 correct |
| 8.3 | E5 + E6 (totaal ~8 deelvragen) | ≥ 6 correct |
| 8.4 | E7 + E8 (totaal ~4 deelvragen) | ≥ 3 correct (inclusief minstens 1 met controle) |
| 8.5 | E9 + E10 + E11 (totaal ~8 deelvragen) | ≥ 6 correct |

### Hoofdstuk-niveau

| Criterium | Vereiste |
|-----------|---------|
| Alle § voldoende | Elke § moet individueel de slagingsdrempel halen |
| Leerdoelencheck | Alle 5 leerdoelenchecks (LDC-8.1 t/m LDC-8.5) voldaan |
| Minimaal totaal | ≥ 80% van alle E-deelvragen correct |

### Resultaat

| Status | Voorwaarde | Weergave |
|--------|-----------|---------|
| 🟢 **Beheerst** | Alle § voldoende + alle LDC's voldaan + ≥ 80% totaal | "Goed gedaan! Je beheerst Hoofdstuk 8." + badge |
| 🟡 **Bijna** | ≥ 3 van 5 § voldoende + ≥ 60% totaal | "Je bent er bijna! Oefen nog even met §..." + link naar zwakste § |
| 🔴 **Nog oefenen** | < 3 § voldoende of < 60% totaal | "Er is nog werk te doen. Begin met §..." + aanbevolen route |

### Docentweergave

- Dashboard toont per leerling: status (🟢/🟡/🔴) per § + totaal.
- Klikbaar: detail per § met scores per E-opgave.
- Aggregatie: klasgemiddelde per § + verdeling 🟢/🟡/🔴.

---

## 5. E-opgaven samenvattingstabel

| E# | § | Leerdoel | Deelvragen | Inputtypes | Primaire feedback tags | Balance Lab |
|----|---|---------|------------|-----------|----------------------|-------------|
| E1 | 8.1 | Termen herkennen | 3 | Tekst/selectie | `LIKE_TERMS_MISMATCH` | — |
| E2 | 8.1 | Formules vereenvoudigen | 3 | Formule-invoer | `SIMPLIFY_ERROR`, `ARITHMETIC_ERROR` | — |
| E3 | 8.1 | Formules kort schrijven | 4 | Formule-invoer | `SIMPLIFY_ERROR`, `COEFFICIENT_ONE_KEPT`, `SIGN_ERROR` | — |
| E4 | 8.2 | Balans eenvoudig | 3 | Numeriek + visueel | `BALANCE_ONE_SIDE`, `DIVIDE_COEFF_MISS` | 🔬 |
| E5 | 8.3 | Balans twee kanten | 4 | Numeriek + visueel + vergelijking | `BALANCE_ONE_SIDE`, `DIVIDE_COEFF_MISS` | 🔬 |
| E6 | 8.3 | Balans meerstaps | 4 | Numeriek + visueel + vergelijking | `BALANCE_ONE_SIDE`, `SIGN_ERROR`, `INCOMPLETE_SOLVE` | 🔬 |
| E7 | 8.4 | Kladblaadje invullen | 1 (scaffolded) | Scaffolded invoer | `MOVE_TERM_WRONG`, `SIGN_ERROR`, `CHECK_FAILED` | — |
| E8 | 8.4 | Formeel oplossen | 3 | Antwoord + controle | `MOVE_TERM_WRONG`, `DIVIDE_COEFF_MISS`, `CHECK_FAILED` | — |
| E9 | 8.5 | Omslagpunt aflezen | 1 | Grafiek-klik | `GRAPH_READING` | — |
| E10 | 8.5 | Omslagpunt berekenen | 2 | Vergelijking + antwoord | `SETUP_EQUATION`, `CHECK_FAILED` | — |
| E11 | 8.5 | Context omslagpunt | 4 | Meerkeuze + vergelijking + antwoord | `FORMULA_SWAP`, `SETUP_EQUATION`, `CHECK_FAILED` | — |
