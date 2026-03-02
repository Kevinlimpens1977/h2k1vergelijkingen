# Exercise Engine + Generator Specification

**Document-ID:** `exercise_engine`
**Afhankelijk van:** PRD_v1_compact.md, PRD_8_1–8_5.md, PRD_SUMMARY_E.md

---

## 1. Exercise Data Schema

### 1.1 Unified Exercise Record

Elk exercise-item (boek, extra, leerdoelencheck, gegenereerd) volgt dit schema:

```
Exercise {
  id:             string        // uniek, bijv. "8_2_O14" of "gen_BALANCE_SIMPLE_xyz"
  paragraphId:    string        // "8_1" | "8_2" | "8_3" | "8_4" | "8_5" | "samenvatting"
  exerciseCode:   string        // "1" | "O14" | "U3" | "E4" | "LDC-8.2" | "GEN-001"
  source:         enum          // BOOK | EXTRA | LEERDOELENCHECK | GENERATED
  route:          string[]      // ["ondersteunend"] | ["doorlopend"] | ["uitdagend"] | ["alle"]
  sequenceIndex:  number        // volgorde binnen route (1-based)

  // Content
  title:          string        // korte titel
  context:        string | null // verhaaltekst (indien contextopgave)
  imageRef:       string | null // pad naar afbeelding (balans, grafiek, figuur)
  subQuestions:    SubQuestion[] // deelvragen

  // Generator metadata (alleen bij source=GENERATED)
  generatorType:  string | null // "SIMPLIFY_LIKE_TERMS" | "BALANCE_SIMPLE" | etc.
  difficulty:     string | null // "herhaal" | "verdiep"
  seed:           number | null // voor reproductie
}

SubQuestion {
  id:             string        // bijv. "a", "b", "c"
  prompt:         string        // vraagtekst
  inputType:      enum          // zie §2
  expectedAnswer: Answer        // verwacht antwoord
  tolerance:      object | null // numerieke tolerantie, equivalent forms
  hints:          string[]      // progressieve hints (max 3)
  feedbackTags:   string[]      // mogelijke error-tags bij deze deelvraag
}

Answer {
  type:           enum          // NUMERIC | FORMULA | EQUATION | TEXT | CHOICE | GRAPH_POINT
  value:          any           // primaire waarde
  equivalents:    any[]         // alternatieve correcte antwoorden
}
```

### 1.2 Bronnen per type

| Source | Aantal | Herkomst | Voorbeeld |
|--------|--------|----------|-----------|
| `BOOK` | ~33 opgaven | p. 46–64 | Opgave 1–33 |
| `EXTRA` | 11 opgaven | p. 66–71 | E1–E11 |
| `LEERDOELENCHECK` | 5 checks | p. 48,52,56,60,64 | LDC-8.1 t/m LDC-8.5 |
| `GENERATED` | oneindig | runtime | GEN-BALANCE_SIMPLE-001 |

---

## 2. Answer Validation per Input Type

| InputType | Validatie-aanpak | Canonical form | Tolerantie |
|-----------|-----------------|----------------|-----------|
| `NUMERIC` | Exact match na parsing | `parseFloat()` | ±0.01 (voor afrondfouten) |
| `FORMULA` | Algebraïsche normalisatie | Sorteer termen: letters (asc) → constanten. Bijv. `3a + 5` | Volgorde termen vrij (`5 + 3a` = ok), `×1` weglaten |
| `EQUATION` | Normaliseer beide kanten | Sorteer termen per kant; `a = 3` ↔ `3 = a` | Kanten verwisselbaar |
| `TEXT` | Lowercase trim match | — | Synoniemen in equivalents[] |
| `CHOICE` | Index match | — | — |
| `GRAPH_POINT` | Coördinaat match | `(x, y)` | ±0.5 eenheid per as |
| `SCAFFOLDED` | Per stap: actie + resultaat | Actie als algebraïsche operatie | Volgorde stappen flexibel (zie §2.1) |

### 2.1 Scaffolded Validation (kladblaadje-type)

Voor opgaven met stapsgewijze invoer (O24, E7):
1. Elke stap = (actie, resultaat-vergelijking).
2. Actie wordt geparst als algebraïsche operatie: `+2p`, `−8`, `÷5`.
3. Resultaat wordt algebraïsch gevalideerd: past actie toe op vorige vergelijking.
4. Alternatieve volgorde is toegestaan (bijv. eerst getallen dan letters) — mits wiskundig correct.

### 2.2 Formula Equivalence Rules

| Regel | Voorbeeld |
|-------|-----------|
| Commutatief | `3a + 5` = `5 + 3a` |
| Coëfficiënt 1 weglaten | `1a + 7` = `a + 7` |
| Coëfficiënt −1 weglaten | `−1x` = `−x` |
| Impliciete vermenigvuldiging | `3 × a` = `3a` |
| Minteken normalisatie | `a − (−3)` = `a + 3` |

---

## 3. Feedback Tagger Rules

### 3.1 Alle error-tags (consolidated)

| Tag | Detectie-regel | §§ |
|-----|---------------|-----|
| `LIKE_TERMS_MISMATCH` | Leerling voegt niet-gelijksoortige termen samen (bijv. `4a + 3b → 7ab`) | 8.1 |
| `SIMPLIFY_ERROR` | Coëfficiënten verkeerd opgeteld/afgetrokken | 8.1 |
| `COEFFICIENT_ONE_KEPT` | Antwoord bevat `1a` of `1x` ipv `a` of `x` | 8.1 |
| `NOT_SIMPLIFIED` | Antwoord = invoer terwijl vereenvoudiging mogelijk is | 8.1 |
| `BALANCE_ONE_SIDE` | Actie alleen aan één kant: links ≠ rechts mutatie | 8.2, 8.3 |
| `EQUATION_READ_ERROR` | Vergelijking bij balans verkeerd afgelezen | 8.2 |
| `SIGN_ERROR` | Plus/min verkeerd bij verplaatsen of weghalen | alle |
| `ARITHMETIC_ERROR` | Rekenfout (optellen, aftrekken, delen, vermenigvuldigen) | alle |
| `DIVIDE_COEFF_MISS` | Na isolatie `na = k`: vergeten ÷n | 8.2–8.5 |
| `WRONG_TERM_REMOVED` | Suboptimale eerste stap (niet fout, zachte hint) | 8.3 |
| `INCOMPLETE_SOLVE` | Gestopt vóór `x = ...` | 8.3, 8.4 |
| `MOVE_TERM_WRONG` | Term naar verkeerde kant verplaatst of met verkeerd teken | 8.4 |
| `LIKE_TERMS_NOT_COMBINED` | Meerdere gelijksoortige termen niet samengevoegd vóór oplossen | 8.4 |
| `DECIMAL_ERROR` | Fout met decimalen | 8.4 |
| `CHECK_FAILED` | Controle-stap ontbreekt of klopt niet | 8.3–8.5 |
| `SETUP_EQUATION` | Vergelijking verkeerd opgesteld uit twee formules | 8.5 |
| `GRAPH_READING` | Omslagpunt verkeerd afgelezen uit grafiek | 8.5 |
| `TABLE_CALC_ERROR` | Fout bij invullen tabelwaarden | 8.5 |
| `FORMULA_SWAP` | Verkeerde formule aan verkeerde grafiek gekoppeld | 8.5 |

### 3.2 Detectie-logica

```
function detectErrors(input, expected, exerciseType):
  errors = []

  if exerciseType in [FORMULA, EQUATION]:
    parsed = parseAlgebra(input)
    if parsed == null:
      return ["PARSE_ERROR"]

    if containsUnlikeTermsMerged(parsed, expected):
      errors.push("LIKE_TERMS_MISMATCH")
    if coefficientsWrong(parsed, expected):
      errors.push("SIMPLIFY_ERROR")
    if containsCoeffOne(parsed):
      errors.push("COEFFICIENT_ONE_KEPT")
    if signFlipped(parsed, expected):
      errors.push("SIGN_ERROR")

  if exerciseType == SCAFFOLDED:
    for each step in input.steps:
      if step.appliedOneSideOnly:
        errors.push("BALANCE_ONE_SIDE")
      if step.divisionMissing:
        errors.push("DIVIDE_COEFF_MISS")

  if exerciseType in [EQUATION_SOLVE]:
    if noControlStep(input):
      errors.push("CHECK_FAILED")
    if stoppedBeforeSolution(input):
      errors.push("INCOMPLETE_SOLVE")

  return errors (first match priority)
```

### 3.3 Prioriteit bij meerdere fouten

Als meerdere tags van toepassing zijn, toon de **meest specifieke** (hoogste prioriteit eerst):

1. `BALANCE_ONE_SIDE` (fundamenteel begrip)
2. `SETUP_EQUATION` (verkeerd begin)
3. `MOVE_TERM_WRONG` / `SIGN_ERROR` (procedureel)
4. `LIKE_TERMS_MISMATCH` / `LIKE_TERMS_NOT_COMBINED`
5. `DIVIDE_COEFF_MISS` / `INCOMPLETE_SOLVE`
6. `ARITHMETIC_ERROR` / `DECIMAL_ERROR`
7. `CHECK_FAILED` (controle-einde)
8. `COEFFICIENT_ONE_KEPT` / `NOT_SIMPLIFIED` (cosmetisch)

---

## 4. Generator Schemas

### 4.1 SIMPLIFY_LIKE_TERMS (§8.1)

| Veld | Herhaal | Verdiep |
|------|---------|---------|
| Template | `{c₁}{var} + {c₂}{var} + {const} = {result_var}` | `{c₁}{v1} + {c₂}{v1} + {c₃}{v2} + {const} = {result_var}` |
| c₁, c₂ | 1–20 (positief) | −20 tot 20 |
| c₃ | — | 1–15 |
| const | 0 of 1 constante (0–20) | 0–2 constanten |
| var | 1 letter | 1–2 letters |
| ×1/×(−1) | nee | ja (25% kans) |
| Antwoord | som coëfficiënten + const | per variabele som + const |
| Stappen | 1 | 1–2 |

### 4.2 BALANCE_SIMPLE (§8.2)

| Veld | Herhaal | Verdiep |
|------|---------|---------|
| Template | `{n}{var} + {c} = {d}` | `{n}{var} + {c} = {d}` |
| n | 2–6 | 2–10 |
| c | 1–10 | 1–20 |
| d | berekend: `n × a + c` (a ∈ ℕ, 1–10) | berekend: `n × a + c` (a ∈ ℕ, 1–15) |
| var | a | a–z random |
| Visuele balans | altijd | altijd |
| Stappen | 2 (−c, ÷n) | 2 |

**Constraint:** `d > c`, `a ≥ 1`, `a ∈ ℕ`.

### 4.3 BALANCE_TWO_SIDES (§8.3)

| Veld | Herhaal | Verdiep |
|------|---------|---------|
| Template | `{p}{var} + {c} = {q}{var} + {d}` | `{p}{var} + {c} = {q}{var} + {d}` |
| p | 3–8 | 2–12 |
| q | 1–(p−1) | 1–11 (q ≠ p) |
| c | 1–15 (positief) | 0–20 |
| d | berekend: `(p−q)×a + c` (a ∈ ℕ, 1–10) | berekend |
| var | a | a–z random |
| Visuele balans | altijd | altijd |
| Stappen | 3 (−qa, −c, ÷coeff) | 3 |
| q > p | nee | ja (50% kans) |

**Constraint:** `a ∈ ℕ, a ≥ 1`. In herhaal: `p > q`, `c < d` (natuurlijke volgorde).

### 4.4 SOLVE_EQUATION_FORMAL (§8.4)

| Veld | Herhaal | Verdiep |
|------|---------|---------|
| Template | `{a}{var} + {b} = {c}{var} + {d}` | `{a}{var} + {b} = {c}{var} + {d}` |
| a | 2–10 | −10 tot 10 (≠ 0) |
| c | 1–9 (c ≠ a) | −10 tot 10 (c ≠ a) |
| b | −20 tot 20 | −50 tot 50 |
| d | −20 tot 20 | −50 tot 50 |
| var | x, a, p | a–z random |
| Oplossing | ∈ ℤ | ∈ ℚ (max 1 decimaal) |
| Negatief | soms | vaak |
| Geen balans | ✓ | ✓ |
| Controle verplicht | ✓ | ✓ |
| Stappen | 3–4 | 3–4 |

**Constraint herhaal:** `(d − b) % (a − c) == 0`.
**Constraint verdiep:** `(d − b) / (a − c)` mag 1 decimaal hebben.

### 4.5 TURNING_POINT (§8.5)

| Veld | Herhaal | Verdiep |
|------|---------|---------|
| Template | Twee formules: `y = {a₁}x + {b₁}` en `y = {a₂}x + {b₂}` | idem |
| a₁ | 2–10 (positief) | −10 tot 10 |
| a₂ | 1–9 (a₂ ≠ a₁) | −10 tot 10 (≠ a₁) |
| b₁ | 0–50 | −50 tot 100 |
| b₂ | 0–50 | −50 tot 100 |
| Oplossing x | ∈ ℕ, 1–50 | ∈ ℕ, 1–50 |
| Context | altijd (random template) | 70% context, 30% abstract |
| Grafiek | altijd getoond | optioneel toggle |
| Stappen | vergelijking opstellen + oplossen + controle | idem |

**Context-templates:** Sportschool, Huurprijs, Telefoon-abonnement, Babysit-verdiensten (uit PRD_8_5).

---

## 5. Difficulty Ladders

### 5.1 Herhaal → Verdiep progressie per generator

| Generator | Herhaal-kenmerken | Verdiep-kenmerken |
|-----------|-------------------|-------------------|
| `SIMPLIFY_LIKE_TERMS` | 2 termen, 1 letter, alleen + | 3–5 termen, 2 letters, + en −, ×1 gevallen |
| `BALANCE_SIMPLE` | Kleine getallen, altijd balans | Grotere getallen, altijd balans |
| `BALANCE_TWO_SIDES` | p > q vast, positieve constanten | q > p mogelijk, nul-constanten |
| `SOLVE_EQUATION_FORMAL` | Gehele oplossing, positieve coëff. | Decimale oplossing, negatieve coëff. |
| `TURNING_POINT` | Altijd context, positieve coëff. | Soms abstract, negatieve coëff. |

### 5.2 Adaptive moeilijkheid (V2 scope)

In V2 kan de moeilijkheid adaptief worden op basis van:
- **Streak-based:** Na 3 correct herhaal → automatisch verdiep.
- **Error-based:** Bij herhaalde `SIGN_ERROR` → extra oefening met negatieve termen.
- **Time-based:** Snelle correcte antwoorden → verdiep; trage → meer herhaal.

---

## 6. Mastery Scoring per Paragraph

### 6.1 Score-componenten

| Component | Gewicht | Bron |
|-----------|---------|------|
| Leerroute-opgaven | 40% | Correcte deelvragen / totale deelvragen |
| Leerdoelencheck | 30% | Correct / totaal |
| Extra oefeningen (E#) | 20% | Correct / totaal |
| Generator streak | 10% | Langste streak / 5 (max 100%) |

### 6.2 Mastery-niveaus

| Niveau | Score | Badge | Betekenis |
|--------|-------|-------|-----------|
| ⭐⭐⭐ Beheerst | ≥ 85% | Goud | Alle aspecten goed |
| ⭐⭐ Voldoende | 60–84% | Zilver | Basis begrepen, details oefenen |
| ⭐ Onvoldoende | < 60% | — | Theorie herhalen + extra oefening |

### 6.3 Dashboard-aggregatie

- Per leerling: 5 paragraaf-scores → spider/radar chart.
- Per klas: gemiddelde + verdeling per niveau.
- Veelgemaakte fouten: top 3 error-tags per § (percentage leerlingen).
