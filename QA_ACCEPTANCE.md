# QA + Acceptance Criteria

**Document-ID:** `qa_acceptance`
**Afhankelijk van:** Alle PRD-documenten

---

## 1. Test Checklist — Per Mode

### 1.1 Digibord Mode

| # | Testcase | Verwacht resultaat | Prioriteit |
|---|---------|-------------------|-----------|
| DM-01 | Docent opent § in Digibord Mode | Slide viewer toont `/slides/8_X.pdf` | P0 |
| DM-02 | PDF slides navigeren (volgende/vorige) | Pagina wisselt correct | P0 |
| DM-03 | Theorie-sectie laden | Voorbeelden uit boek tonen met stapsgewijze onthulling | P1 |
| DM-04 | Klassikale inoefenopgave tonen | Opgave verschijnt met deelvragen | P0 |
| DM-05 | Timer starten (45 min) | Countdown zichtbaar, notificatie bij 5 min en 0 min | P1 |
| DM-06 | Balance Lab openen vanuit Digibord | Balance Lab opent in digibord-variant (grote font, stap-voor-stap) | P0 |
| DM-07 | Schermresolutie 1920×1080 | Geen overflow, tekst leesbaar op 3m afstand | P0 |
| DM-08 | Navigeren tussen paragrafen | Paragraaf-nav werkt, huidige § gemarkeerd | P1 |

### 1.2 Leerling Mode

| # | Testcase | Verwacht resultaat | Prioriteit |
|---|---------|-------------------|-----------|
| LM-01 | Leerling kiest leerroute (O/D/U) | Correcte opgavevolgorde wordt geladen | P0 |
| LM-02 | Opgave beantwoorden (correct) | Groene feedback + volgende opgave ontgrendeld | P0 |
| LM-03 | Opgave beantwoorden (fout) | Rode feedback + error-tag + hint beschikbaar | P0 |
| LM-04 | Hint opvragen | Progressieve hint toont (niveau 1 → 2 → 3) | P1 |
| LM-05 | Alle route-opgaven afronden | Leerdoelencheck verschijnt automatisch | P0 |
| LM-06 | Leerdoelencheck voldoende | Doorgaan naar E-opgaven of generator | P0 |
| LM-07 | Leerdoelencheck onvoldoende | Terugverwijzing naar theorie + specifiek advies | P1 |
| LM-08 | Extra oefening (E#) afronden | Score opgeslagen, volgende E ontgrendeld | P1 |
| LM-09 | Generator starten (herhaal) | Eerste opgave verschijnt, herhaal-moeilijkheid | P1 |
| LM-10 | Generator starten (verdiep) | Eerste opgave verschijnt, verdiep-moeilijkheid | P1 |
| LM-11 | Generator: 5 correct op rij | Succesmelding + optie stoppen/doorgaan | P2 |
| LM-12 | Generator: 3 fout op rij | Hint + theorie-popup | P2 |
| LM-13 | Voortgang bewaard na pagina-refresh | Firestore laadt laatste state correct | P0 |
| LM-14 | Responsive op tablet (1024×768) | Geen overlap, invoervelden bruikbaar | P1 |
| LM-15 | Responsive op mobiel (375×667) | Scrollbaar, invoervelden bereikbaar | P2 |

### 1.3 Docent Dashboard

| # | Testcase | Verwacht resultaat | Prioriteit |
|---|---------|-------------------|-----------|
| DD-01 | Dashboard openen als teacher | Klasoverzicht heatmap verschijnt | P0 |
| DD-02 | Per-leerling detail openen | Voortgang per §, scores, fouten zichtbaar | P1 |
| DD-03 | Fout-analyse per § | Top error-tags met percentages getoond | P1 |
| DD-04 | Meerdere klassen | Docent kan wisselen tussen klassen | P2 |
| DD-05 | Realtime updates | Nieuwe attempt verschijnt zonder refresh (of na refresh) | P2 |
| DD-06 | Dashboard bij 0 leerlingen | Lege staat met uitnodigingsinstructies | P2 |
| DD-07 | Dashboard bij 35 leerlingen | Performant laden (< 3s), geen UI-freeze | P1 |

---

## 2. Test Checklist — Per Paragraaf

### §8.1 Gelijksoortige termen

| # | Testcase | Prioriteit |
|---|---------|-----------|
| P81-01 | Opgaven 1–7 laden in correcte route-volgorde | P0 |
| P81-02 | O4 verschijnt alleen in route Ondersteunend | P0 |
| P81-03 | U1/U2 verschijnen alleen in route Uitdagend | P0 |
| P81-04 | Formule-invoer accepteert `11a = b` en `b = 11a` als equivalent | P0 |
| P81-05 | `COEFFICIENT_ONE_KEPT` tag bij antwoord `1a + 7` | P1 |
| P81-06 | LDC-8.1 verschijnt na route-afronding | P0 |
| P81-07 | E1–E3 correct gevalideerd | P1 |
| P81-08 | Generator `SIMPLIFY_LIKE_TERMS` herhaal produceert valid opgaven | P1 |
| P81-09 | Generator verdiep: meerdere letters + negatief | P2 |

### §8.2 De balans

| # | Testcase | Prioriteit |
|---|---------|-----------|
| P82-01 | Opgaven 8–14 laden correct per route | P0 |
| P82-02 | O14 alleen in Ondersteunend, U3 alleen in Uitdagend | P0 |
| P82-03 | "Open in Balance Lab" knop bij opgaven 9–14 | P0 |
| P82-04 | Balance Lab voorgevuld met opgave-vergelijking | P0 |
| P82-05 | E4 correct gevalideerd (incl. visuele deelvraag) | P1 |
| P82-06 | Generator `BALANCE_SIMPLE` produceert `na + c = d` met geheel antwoord | P1 |

### §8.3 Vergelijkingen oplossen met balans

| # | Testcase | Prioriteit |
|---|---------|-----------|
| P83-01 | Opgaven 15–19 laden correct per route | P0 |
| P83-02 | O19 alleen in Ondersteunend, U4 alleen in Uitdagend | P0 |
| P83-03 | Balance Lab als primair oplosinstrument (voorgevuld) | P0 |
| P83-04 | Stappenlog registreert elke actie correct | P0 |
| P83-05 | E5 + E6 correct gevalideerd | P1 |
| P83-06 | Generator `BALANCE_TWO_SIDES` produceert `pa + c = qa + d` met geheel antwoord | P1 |

### §8.4 Vergelijkingen oplossen

| # | Testcase | Prioriteit |
|---|---------|-----------|
| P84-01 | Opgaven 20–26 laden correct per route | P0 |
| P84-02 | O24 alleen in Ondersteunend, U5+U6 alleen in Uitdagend | P0 |
| P84-03 | Scaffolded invoer (kladblaadje) werkt per stap | P0 |
| P84-04 | Controle-stap verplicht — waarschuwing bij ontbreken | P1 |
| P84-05 | Negatieve oplossingen correct gevalideerd | P0 |
| P84-06 | Decimale antwoorden (opg. 26c: x=3,5) correct geaccepteerd | P1 |
| P84-07 | E7 scaffolded + E8 volledig oplossen gevalideerd | P1 |
| P84-08 | Generator `SOLVE_EQUATION_FORMAL` verdiep: decimale oplossingen | P2 |

### §8.5 Het omslagpunt

| # | Testcase | Prioriteit |
|---|---------|-----------|
| P85-01 | Opgaven 27–33 laden correct per route | P0 |
| P85-02 | O32 alleen in Ondersteunend, U7 alleen in Uitdagend | P0 |
| P85-03 | Tabel-invoer valideert per cel | P0 |
| P85-04 | Grafiek-aflezen accepteert klik binnen tolerantie | P1 |
| P85-05 | Vergelijking opstellen uit twee formules gevalideerd | P0 |
| P85-06 | E9 grafiek-klik + E10 vergelijking + E11 context correct | P1 |
| P85-07 | Generator `TURNING_POINT` met context-template | P2 |

### Samenvatting + E-opgaven

| # | Testcase | Prioriteit |
|---|---------|-----------|
| SE-01 | Samenvatting-pagina toont alle 5 leerdoelen | P0 |
| SE-02 | "Per paragraaf" modus: selecteer §, toon E-opgaven | P1 |
| SE-03 | "Alles" modus: sequentieel alle E1–E11 | P1 |
| SE-04 | Slagingsregel correct berekend (🟢/🟡/🔴) | P1 |
| SE-05 | Eindoordeel "Hoofdstuk beheerst" bij alle § voldoende | P1 |

---

## 3. Balance Lab Testcases

### 3.1 Parser

| # | Testcase | Input | Verwacht | Prio |
|---|---------|-------|---------|------|
| BL-P01 | Simpele vergelijking | `3a + 5 = 14` | Links: [3a, 5], Rechts: [14] | P0 |
| BL-P02 | Letters beide kanten | `4g + 3 = 2g + 17` | Links: [4g, 3], Rechts: [2g, 17] | P0 |
| BL-P03 | Negatieve termen | `−2x + 8 = 5x − 6` | Links: [−2x, 8], Rechts: [5x, −6] | P0 |
| BL-P04 | Impliciete coëfficiënt | `x + 3 = 10` | Links: [1x, 3], Rechts: [10] | P0 |
| BL-P05 | Hoofdletter-insensitief | `3P + 8 = 2P + 10` | Behandeld als `3p + 8 = 2p + 10` | P1 |
| BL-P06 | Spaties en formatting | `3a+5 = 14` (geen spaties) | Correct geparst | P1 |
| BL-P07 | Ongeldige invoer | `3a + = 5` | Foutmelding: "Ongeldige vergelijking" | P0 |
| BL-P08 | Geen = teken | `3a + 5` | Foutmelding: "Voer een vergelijking in met =" | P0 |
| BL-P09 | Meerdere = tekens | `3a = 5 = 7` | Foutmelding | P1 |
| BL-P10 | Decimalen | `2,5a + 3 = 8` | Correct geparst (komma als decimaal) | P2 |

### 3.2 Visuele balans (tilt)

| # | Testcase | Verwacht | Prio |
|---|---------|---------|------|
| BL-T01 | Start evenwicht | Balans horizontaal bij correcte vergelijking | P0 |
| BL-T02 | Na actie aan één kant | Balans tilt naar zwaardere kant | P0 |
| BL-T03 | Na correcte actie beide kanten | Balans blijft horizontaal | P0 |
| BL-T04 | Oplossing bereikt (`a = 3`) | Balans horizontaal + visuele bevestiging | P0 |
| BL-T05 | Animatie bij tile-verwijdering | Smooth transition, tiles verdwijnen | P1 |

### 3.3 Paired actions (beide kanten gelijk)

| # | Testcase | Actie | Verwacht | Prio |
|---|---------|-------|---------|------|
| BL-A01 | Getallen weghalen | `−5` bij `3a + 5 = 14` | `3a = 9`, tiles updaten | P0 |
| BL-A02 | Letters weghalen | `−2g` bij `4g + 3 = 2g + 17` | `2g + 3 = 17`, tiles updaten | P0 |
| BL-A03 | Getallen erbij | `+3` bij `2a = 6` | `2a + 3 = 9` (geldig maar ongebruikelijk) | P1 |
| BL-A04 | Delen | `÷2` bij `2a = 8` | `a = 4` | P0 |
| BL-A05 | Ongeldige actie | `÷0` | Foutmelding: "Je kunt niet door 0 delen" | P0 |
| BL-A06 | Negatief resultaat | `−10` bij `3a + 5 = 8` | `3a − 5 = −2` (geldig) | P1 |

### 3.4 Undo / Redo

| # | Testcase | Verwacht | Prio |
|---|---------|---------|------|
| BL-U01 | Undo na 1 stap | Terug naar startstate, stappenlog verwijdert stap | P0 |
| BL-U02 | Undo na 3 stappen | Terug naar stap 2, stap 3 verwijderd | P0 |
| BL-U03 | Redo na undo | Stap opnieuw uitgevoerd | P0 |
| BL-U04 | Undo bij start (geen stappen) | Knop disabled / geen effect | P1 |
| BL-U05 | Ctrl+Z / Ctrl+Y | Zelfde effect als knoppen | P2 |
| BL-U06 | Nieuwe actie na undo | Redo-stack gewist | P1 |

### 3.5 Coach Hints

| # | Testcase | Vergelijking | Verwacht hint | Prio |
|---|---------|-------------|--------------|------|
| BL-H01 | Hint 1 bij start | `4a + 3 = 2a + 9` | "Haal dezelfde letters aan beide kanten weg." | P0 |
| BL-H02 | Hint 2 na letters verwijderd | `2a + 3 = 9` | "Haal de losse getallen aan beide kanten weg." | P0 |
| BL-H03 | Hint 3 na getallen verwijderd | `2a = 6` | "Deel door het getal voor de letter." | P0 |
| BL-H04 | Hint 4 na oplossing | `a = 3` | "Controleer je antwoord: vul in de oorspronkelijke vergelijking." | P0 |
| BL-H05 | Max hints bereikt | 4 hints gebruikt | Hint-knop disabled | P1 |
| BL-H06 | Hint bij eenvoudige vergelijking | `5a = 15` | "Deel door het getal voor de letter." (skip stap 1+2) | P1 |

---

## 4. PDF Slide Viewer Testcases

| # | Testcase | Verwacht | Prio |
|---|---------|---------|------|
| SV-01 | Laden `/slides/8_1.pdf` | PDF toont correcte eerste pagina | P0 |
| SV-02 | Laden `/slides/8_2.pdf` t/m `8_5.pdf` | Alle 5 PDFs laden zonder fout | P0 |
| SV-03 | Laden `/slides/samenvatting.pdf` (optioneel) | Foutloze weergave of graceful "niet beschikbaar" | P1 |
| SV-04 | Volgende/vorige pagina knoppen | Navigatie werkt correct | P0 |
| SV-05 | Zoom in/uit | PDF-pagina schaalt correct | P2 |
| SV-06 | Digibord resolutie (1920×1080) | PDF vult scherm passend | P0 |

---

## 5. Edge Cases

| # | Scenario | Verwacht gedrag | Prio |
|---|---------|----------------|------|
| EC-01 | PDF-bestand ontbreekt (`/slides/8_X.pdf` niet aanwezig) | Foutmelding: "Slides nog niet beschikbaar. Neem contact op met je docent." | P0 |
| EC-02 | Netwerk offline tijdens opgave | Lokale state behouden, sync bij reconnect | P1 |
| EC-03 | Netwerk offline bij inloggen | Foutmelding: "Geen internetverbinding." | P0 |
| EC-04 | Ongeldige vergelijking in Balance Lab | Duidelijke foutmelding (zie BL-P07/P08/P09) | P0 |
| EC-05 | Extreem lange vergelijking | Max 50 tekens, daarna afwijzing | P2 |
| EC-06 | Leerling opent § waarvoor content ontbreekt | "Deze paragraaf wordt binnenkort toegevoegd." | P1 |
| EC-07 | Docent opent Dashboard zonder klas | Lege staat met "Maak eerst een klas aan" | P1 |
| EC-08 | Twee tabs tegelijk open (zelfde leerling) | Geen data-corruptie, laatste schrijf wint | P2 |
| EC-09 | Browser back-button tijdens opgave | State bewaard, leerling kan terugkeren | P1 |
| EC-10 | Session timeout (Firebase) | Silent re-auth of login-prompt | P1 |
| EC-11 | Teacher probeert leerling-route te openen | Toegestaan (preview-modus) | P2 |
| EC-12 | Division `÷` resulteert in decimaal in Balance Lab | Waarschuwing: "Het antwoord is geen geheel getal. Controleer je stap." | P1 |

---

## 6. Acceptance Criteria per Build Phase

### MVP Acceptance Criteria

| ID | Criterium | Verificatie |
|----|----------|-------------|
| MVP-01 | Firebase Auth login (email/ww) werkt voor student en teacher | Handmatige test |
| MVP-02 | Global header toont paragraaf-nav + Balance Lab button | Visuele inspectie |
| MVP-03 | Balance Lab: invoer, parser, visuele balans, stappen, undo/redo, hints | BL-* testcases |
| MVP-04 | §8.2 + §8.3 volledig speelbaar in Leerling Mode (3 routes) | P82-*, P83-* testcases |
| MVP-05 | Leerdoelencheck §8.2 + §8.3 werkt | LM-05, LM-06, LM-07 |
| MVP-06 | E4 + E5 + E6 beschikbaar en gevalideerd | P82-05, P83-05 |
| MVP-07 | Digibord Mode: slides laden + timer | DM-01, DM-02, DM-05 |
| MVP-08 | Basis Dashboard: klasoverzicht | DD-01 |
| MVP-09 | Voortgang opgeslagen in Firestore | LM-13 |
| MVP-10 | Responsief op digibord (1920×1080) en tablet (1024×768) | DM-07, LM-14 |

### V1.1 Acceptance Criteria

| ID | Criterium | Verificatie |
|----|----------|-------------|
| V11-01 | §8.1, §8.4, §8.5 volledig speelbaar | P81-*, P84-*, P85-* testcases |
| V11-02 | Alle E-opgaven E1–E11 beschikbaar | SE-* testcases |
| V11-03 | Samenvatting-pagina met "per §" en "alles" modus | SE-01 t/m SE-05 |
| V11-04 | Alle 5 generators functioneel (herhaal + verdiep) | P81-08, P82-06, P83-06, P84-08, P85-07 |
| V11-05 | Feedback engine met error-tags operationeel | LM-03 + alle error-tag tests |
| V11-06 | Dashboard: foutanalyse + per-leerling detail | DD-02, DD-03 |
| V11-07 | Slagingsregel "Hoofdstuk beheerst" werkend | SE-04, SE-05 |

### V2 Acceptance Criteria

| ID | Criterium | Verificatie |
|----|----------|-------------|
| V2-01 | Adaptieve leerroute-suggestie op basis van fouten | Functionele test |
| V2-02 | Gamification: streaks, badges zichtbaar | Visuele inspectie |
| V2-03 | PWA: offline beschikbaar na eerste laden | EC-02 + offline test |
| V2-04 | WCAG 2.1 AA compliance | Automated a11y audit |
| V2-05 | Performance: < 3s laadtijd op 4G | Lighthouse audit |
