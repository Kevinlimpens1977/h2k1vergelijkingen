# Risks & Mitigations

**Document-ID:** `risks`
**Afhankelijk van:** Alle PRD-documenten

---

## 1. Technische risico's

| # | Risico | Impact | Kans | Mitigatie |
|---|--------|--------|------|----------|
| T-01 | **PDF viewer incompatibiliteit** — In-app PDF rendering verschilt per browser (Chrome vs Safari vs Edge). Sommige schoolchromebooks draaien oudere versies. | Slides niet zichtbaar in Digibord Mode | Medium | Gebruik bewezen library (pdf.js). Fallback: directe link naar PDF download. Test op Chrome 90+, Edge 90+, Safari 15+. |
| T-02 | **Algebraïsche parser fouten** — Parser herkent niet alle notatie-varianten van leerling-invoer (bijv. `3×a`, `3*a`, `3a`, spaties, komma vs punt decimaal). | Correcte antwoorden worden als fout beoordeeld | Hoog | Uitgebreide normalisatie-layer. Komma als decimaalteken (NL). Unit tests met 50+ edge cases. Beta-test met echte leerlingen. |
| T-03 | **Balance Lab performance** — Complexe vergelijkingen met veel termen kunnen animatie-lag veroorzaken, vooral op schoolchromebooks met beperkt geheugen. | Trage of hakkelende animaties | Laag | Max 10 termen per kant. Lightweight SVG-animaties. Precompute tile-posities. |
| T-04 | **Firebase Auth op schoolnetwerk** — Restrictieve school-firewalls blokkeren Firebase-domeinen. | Leerlingen kunnen niet inloggen | Medium | Documentatie voor IT-beheerders met whitelist-domeinen. Fallback: offline mode (V2). Vroegtijdig testen op schoolnetwerk. |
| T-05 | **Firestore read-limieten** — 35 leerlingen simultaan laden voortgang + attempts → burst reads. | Quota-overschrijding of vertraging | Laag | Firestore caching (persistence enabled). Batch reads. Dashboard: pagination + lazy loading. Free tier ruim voldoende voor 1 klas. |
| T-06 | **Formula equivalence** — Meerdere correcte antwoorden voor dezelfde vraag (bijv. `b = 11a` vs `11a = b` vs `b = a × 11`). | Correcte antwoorden afgewezen | Hoog | Canonical form normalisatie. Equivalents-array per antwoord. Meerdere algebra-representations testen. Feedback: "Je antwoord is wiskundig correct maar in een andere vorm." |
| T-07 | **Undo/redo state corruption** — Bij snelle opeenvolgende acties in Balance Lab kan de state-stack out-of-sync raken. | Undo gaat naar verkeerde state | Laag | Immutable state snapshots. Elke stap = deep copy. Unit tests voor rapid undo/redo sequences. |
| T-08 | **Scaffold-validatie complexiteit** — Bij kladblaadje-opgaven (E7, O24) zijn er meerdere geldige oplosroutes. Validatie moet alternatieve volgorden accepteren. | Correcte tussenstappen afgewezen | Medium | Valideer per stap: is het resultaat algebraïsch correct gegeven de actie? Accepteer elke wiskundig correcte route. |

---

## 2. Didactische risico's

| # | Risico | Impact | Kans | Mitigatie |
|---|--------|--------|------|----------|
| D-01 | **Over-reliance op Balance Lab** — Leerlingen gebruiken Balance Lab als crutch en leren niet formeel oplossen (§8.4 doel). | Leren §8.4 competentie niet | Medium | §8.4 toont Balance Lab als optioneel ("Bekijk op Balance Lab"). Generator `SOLVE_EQUATION_FORMAL` heeft geen balans-optie in verdiep-modus. LDC-8.4 vereist formele notatie. |
| D-02 | **Misconceptie "alleen positieve antwoorden"** — Leerlingen denken dat negatieve oplossingen fout zijn (door balans-metafoor met knikkers). | Foutief afwijzen van correcte antwoorden | Medium | Opgave 20 (Morris: "vreemde oplossing") expliciet bespreken. Feedback bij negatief antwoord: "Negatieve oplossingen zijn wiskundig correct!" Generator produceert regelmatig negatieve oplossingen. |
| D-03 | **Controle-stap overslaan** — Leerlingen beschouwen controle als optioneel, niet als essentieel onderdeel. | Onontdekte fouten, slordig werken | Hoog | Controle verplicht bij §8.4 en §8.5. Zachte waarschuwing bij eerste keer, daarna als fout geteld. Dashboard toont `CHECK_FAILED` percentage. |
| D-04 | **Gelijksoortige termen misconceptie** — Leerlingen voegen alle termen samen ongeacht letter (bijv. `4a + 3b = 7ab`). | Fundamentele rekenfout | Medium | Error-tag `LIKE_TERMS_MISMATCH` met specifieke uitleg: "Termen met verschillende letters kun je niet samenvoegen." Visuele kleurcodering van gelijksoortige termen. |
| D-05 | **Omslagpunt ≠ snijpunt verwarring** — Leerlingen begrijpen het concept "omslagpunt" niet in context (wanneer wisselt het voordeel?). | Fout antwoord op contextvragen | Laag | Grafiek-visualisatie met markering "vóór omslagpunt: A goedkoper" / "na omslagpunt: B goedkoper". Generator gebruikt altijd context-templates. |
| D-06 | **Digitale vermoeidheid** — 45 minuten schermwerk is lang voor klas 2K. | Concentratieverlies, meer fouten | Medium | Timer met pauze-optie. Variatie in opgavetypes (invoer, visueel, meerkeuze). Balance Lab als interactieve afwisseling. Docent kan timer aanpassen. |
| D-07 | **Leerroute-mismatch** — Leerling kiest te moeilijke of te makkelijke route. | Frustratie of verveling | Medium | Docent kan route toewijzen. Na LDC: suggestie voor aanpassing ("Je kunt de uitdagende route proberen"). V2: adaptieve suggestie. |

---

## 3. Organisatorische / School-risico's

| # | Risico | Impact | Kans | Mitigatie |
|---|--------|--------|------|----------|
| O-01 | **AVG / privacy** — Leerlinggegevens (naam, voortgang, fouten) worden opgeslagen in Firebase (Google Cloud, EU-regio). | Juridische bezwaren van school of ouders | Medium | Firebase EU-regio (europe-west1). Minimale persoonsgegevens (geen BSN, geen adres). Privacyverklaring voor ouders. Data retention: max 1 schooljaar, daarna automatisch verwijderd. |
| O-02 | **Schoolinfrastructuur variatie** — Scholen hebben wisselende netwerkkwaliteit, hardware (chromebooks vs iPads vs desktops), en browserbeperkingen. | App werkt niet op alle devices | Hoog | Responsive design (3 breakpoints). Lightweight assets. Test op chromebook, iPad, Windows desktop. Geen plugins/installaties vereist (pure webapp). |
| O-03 | **Docent-adoptie** — Docenten zijn niet gewend aan digitale les-tools of hebben weerstand tegen verandering. | Lage adoptie, app wordt niet gebruikt | Medium | Eenvoudige onboarding: 1 pagina quick start guide. Digibord Mode volgt exact de lesstructuur van het boek. Slides zijn direct herkenbaar (boek-content). Training: 15 minuten demonstratie. |
| O-04 | **Slide-bestanden niet aangemaakt** — Docent vergeet PDF-slides te genereren of in `/public/slides/` te plaatsen. | Lege slide viewer in Digibord Mode | Medium | Graceful fallback: "Slides nog niet beschikbaar." Directe link naar theorie-sectie als alternatief. Checklist bij eerste gebruik. |
| O-05 | **Copyright Noordhoff** — Gebruik van boek-content (opgaveteksten, afbeeldingen) in een digitale app kan auteursrechtelijk problematisch zijn. | Juridisch risico | Hoog | App is bedoeld als aanvulling op het boek, niet als vervanging. Opgaveteksten verwijzen naar het boek ("Zie opgave 14 in je boek"). Afbeeldingen worden niet gekopieerd maar beschreven. Overleg met schoolleiding / uitgever over educatieve licentie. |
| O-06 | **Single point of failure** — Als Firebase down is, werkt de hele app niet. | Geen les mogelijk met digitaal materiaal | Laag | Firebase SLA: 99.95% uptime. Docent heeft altijd het fysieke boek als backup. V2: PWA offline mode. Lesplan bevat altijd niet-digitaal alternatief. |
| O-07 | **Leerling zonder device** — Niet elke leerling heeft een device beschikbaar in de klas. | Uitsluiting van digitaal werken | Medium | App werkt op gedeelde devices (inlog per leerling). Minimum: 1 device per 2 leerlingen. Fysiek boek als fallback voor opgaven (zelfde nummering). |
| O-08 | **Ondersteuning en onderhoud** — Na oplevering is er geen budget voor doorlopend onderhoud. | Bugs worden niet opgelost, app veroudert | Medium | Firebase hosting: vrijwel geen onderhoudskosten. Statische slides: geen backend nodig. Documentatie voor overdracht. V2-features alleen bij bevestigd budget. |

---

## 4. Risicomatrix (samenvatting)

| | Laag kans | Medium kans | Hoog kans |
|---|----------|------------|----------|
| **Hoog impact** | T-07 State corruption | T-04 Schoolnetwerk, O-05 Copyright | T-02 Parser, T-06 Equivalence |
| **Medium impact** | T-03 Performance, D-05 Omslagpunt | D-01 Over-reliance, D-02 Negatief, D-06 Vermoeidheid, D-07 Route, O-01 AVG, O-03 Adoptie, O-08 Onderhoud | D-03 Controle skip, O-02 Infra, D-04 Like terms |
| **Laag impact** | T-05 Firestore limits, O-06 Firebase down | O-04 Slides ontbreken, O-07 Geen device | T-08 Scaffold |

### Top 5 kritieke risico's

1. **T-02 + T-06** — Parser + equivalence: grootste technische uitdaging. Vereist uitgebreide unit test suite.
2. **O-05** — Copyright: moet vroegtijdig worden uitgezocht vóór publieke release.
3. **D-03** — Controle overslaan: didactisch cruciaal, hard afdwingen in §8.4+8.5.
4. **O-02** — Schoolinfrastructuur: testen op daadwerkelijke school-hardware.
5. **D-01** — Over-reliance Balance Lab: §8.4 bewust ontwerpen zonder visuele balans als default.
