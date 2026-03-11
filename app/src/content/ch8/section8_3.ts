// /app/src/content/ch8/section8_3.ts
// §8.3 Vergelijkingen oplossen met een balans — contentset (oefenen)
// gebaseerd op de bijgeleverde methodepagina's p.54–57.

import type { Task, PointsRule } from './section8_2';

const DEFAULT_POINTS: PointsRule = { firstTry: 4, afterHint1: 2, afterHint2: 1 };

export const section8_3 = {
    id: "8_3",
    title: "§8.3 Vergelijkingen oplossen met een balans",
    subtitle: "Letters aan beide kanten van het = teken",
    learningGoals: [
        "Ik weet hoe je een vergelijking oplost met een balans.",
        "Ik kan zakjes (letters) en knikkers (getallen) aan beide kanten weghalen.",
        "Ik kan de waarde van de letter berekenen door te delen."
    ],
    pointsRule: DEFAULT_POINTS,

    items: [
        // ═══════════════════════════════════════════════════════
        // OPGAVE 15 (p. 54) — 4g + 3 = 2g + 17
        // Drie balansen, kazen weghalen, gewicht berekenen
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_15a",
            type: "input",
            title: "Kazen weghalen (opgave 15a)",
            prompt: "Bij balans ❶ hoort de vergelijking 4g + 3 = 2g + 17. Hoeveel kazen zijn er links en rechts weggehaald om de situatie van balans ❷ te krijgen?",
            image: "/images/ch8/p54opg15.png",
            answer: "2",
            accept: ["2 kazen", "twee", "twee kazen", "2kazen"],
            hint1: "Kijk naar het verschil tussen balans ❶ en ❷. Hoeveel kazen zijn er verdwenen?",
            hint2: "Links gaat het van 4 kazen naar 2 kazen. Rechts gaat het van 2 kazen naar 0 kazen.",
            explainCorrect: "Goed! Er zijn 2 kazen aan beide kanten weggehaald.",
            explainWrong: "Vergelijk de twee balansen: hoeveel kazen zijn er aan elke kant verdwenen?",
            points: DEFAULT_POINTS,
            tags: ["balans", "begrip", "zakjes"],
            bookRef: { page: 54, exercise: "15a", label: "Kazen weghalen" }
        },
        {
            id: "8_3_15b",
            type: "mc",
            title: "Vergelijking bij balans ❷ (opgave 15b-c)",
            prompt: "Na het weghalen van 2 kazen aan beide kanten krijg je balans ❷. Scott schrijft hierbij: 2g + 3 = 17. Bij balans ❷ wordt links en rechts 3 kg weggehaald. Welke vergelijking hoort bij balans ❸?",
            image: "/images/ch8/p54opg15.png",
            options: ["2g = 14", "2g = 17", "2g + 3 = 14"],
            correctIndex: 0,
            hint1: "Haal 3 weg aan beide kanten van 2g + 3 = 17.",
            hint2: "2g + 3 − 3 = 17 − 3.",
            explainCorrect: "Klopt: 2g + 3 − 3 = 17 − 3 → 2g = 14.",
            explainWrong: "Je moet aan beide kanten 3 weghalen: links valt +3 weg, rechts 17 − 3 = 14.",
            points: DEFAULT_POINTS,
            tags: ["balansstap", "vergelijking"],
            bookRef: { page: 54, exercise: "15c-d", label: "Vergelijking balans ❸" }
        },
        {
            id: "8_3_15e",
            type: "input",
            title: "Gewicht per kaas (opgave 15e)",
            prompt: "2g = 14. Bereken het gewicht van één kaas (g).",
            image: "/images/ch8/p54opg15.png",
            answer: "7",
            accept: ["7kg", "7 kg", "7 kilo", "7kilo", "7kilogram", "7 kilogram"],
            hint1: "Deel 14 door 2.",
            explainCorrect: "Top: g = 7 kg per kaas!",
            explainWrong: "2g = 14 → g = 14 ÷ 2 = 7.",
            points: DEFAULT_POINTS,
            tags: ["delen", "oplossen"],
            bookRef: { page: 54, exercise: "15e", label: "Gewicht per kaas" }
        },

        // ═══════════════════════════════════════════════════════
        // OPGAVE 16 (p. 54) — 2a + 10 = 5a + 4
        // Zakjes weghalen, knikkers weghalen, berekenen
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_16a",
            type: "mc",
            title: "Zakjes weghalen (opgave 16a)",
            prompt: "Bij balans ❶ hoort de vergelijking 2a + 10 = 5a + 4. Balans ❷ en ❸ zijn nog niet ingetekend — die moet jij bedenken! Je haalt aan beide kanten twee zakjes met knikkers weg. Waarom kun je niet meer dan twee zakjes weghalen?",
            image: "/images/ch8/p54opg16.png",
            options: [
                "Omdat links maar 2 zakjes staan",
                "Omdat rechts maar 2 zakjes staan",
                "Omdat er 2 aan elke kant moeten blijven"
            ],
            correctIndex: 0,
            hint1: "Kijk naar de kant met de minste zakjes.",
            explainCorrect: "Juist: links staan maar 2 zakjes, dus meer dan 2 kun je niet weghalen.",
            explainWrong: "Je kunt nooit meer weghalen dan er op de kant staan. Links zijn er 2.",
            points: DEFAULT_POINTS,
            tags: ["balans", "begrip", "zakjes"],
            bookRef: { page: 54, exercise: "16a", label: "Zakjes weghalen" }
        },
        {
            id: "8_3_16b",
            type: "mc",
            title: "Vergelijking na zakjes weghalen (opgave 16b)",
            prompt: "Na −2a aan beide kanten van 2a + 10 = 5a + 4 krijg je balans ❷ (die is nog niet ingetekend). Welke vergelijking hoort hierbij?",
            image: "/images/ch8/p54opg16.png",
            options: ["10 = 3a + 4", "2a + 10 = 4", "10 = 5a"],
            correctIndex: 0,
            hint1: "Links: 2a − 2a + 10 = 10. Rechts: 5a − 2a + 4 = 3a + 4.",
            explainCorrect: "Klopt: 10 = 3a + 4.",
            explainWrong: "Haal aan beide kanten 2a weg: links blijft 10 over, rechts 3a + 4.",
            points: DEFAULT_POINTS,
            tags: ["balansstap"],
            bookRef: { page: 54, exercise: "16b", label: "Nieuwe vergelijking" }
        },
        {
            id: "8_3_16c",
            type: "input",
            title: "Knikkers weghalen (opgave 16c)",
            prompt: "Bij balans ❷ (niet ingetekend) heb je 10 = 3a + 4. Hoeveel knikkers kun je nu aan beide kanten maximaal weghalen?",
            image: "/images/ch8/p54opg16.png",
            answer: "4",
            accept: ["vier", "4 knikkers", "vier knikkers", "4knikkers"],
            hint1: "Kijk naar het kleinste losse-knikkers-getal.",
            hint2: "Rechts liggen 4 losse knikkers. Links liggen 10. Je kunt dus 4 weghalen.",
            explainCorrect: "Goed: je kunt 4 knikkers aan beide kanten weghalen.",
            explainWrong: "Je haalt het kleinste aantal losse knikkers weg: 4.",
            points: DEFAULT_POINTS,
            tags: ["balansstap"],
            bookRef: { page: 54, exercise: "16c", label: "Knikkers weghalen" }
        },
        {
            id: "8_3_16d",
            type: "input",
            title: "Bereken a (opgave 16d)",
            prompt: "Na −4 aan beide kanten krijg je balans ❸ (niet ingetekend): 6 = 3a. Bereken hoeveel knikkers er in één zakje zitten (a).",
            image: "/images/ch8/p54opg16.png",
            answer: "2",
            accept: ["twee"],
            hint1: "Deel 6 door 3.",
            explainCorrect: "Top: a = 2 knikkers per zakje!",
            explainWrong: "6 = 3a → a = 6 ÷ 3 = 2.",
            points: DEFAULT_POINTS,
            tags: ["delen", "oplossen"],
            bookRef: { page: 54, exercise: "16d", label: "a berekenen" }
        },

        // ═══════════════════════════════════════════════════════
        // OPGAVE 17 (p. 55) — Kladblaadje bij balans van opgave 16
        // Vergelijkingen bij balans ❶❷❸ invullen
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_17a",
            type: "mc",
            title: "Vergelijking bij balans ❶ (opgave 17a)",
            prompt: "Op het kladblaadje staat de vergelijking die bij balans ❶ hoort: 2a + 10 = 5a + 4. Bij balans ❷ (na het weghalen van zakjes) hoort de vergelijking: 10 = 3a + 4. Welke vergelijking hoort bij balans ❸ (na het weghalen van knikkers)?",
            image: "/images/ch8/p55opg17.png",
            options: ["6 = 3a", "10 = 3a", "4 = 3a"],
            correctIndex: 0,
            hint1: "Bij balans ❷: 10 = 3a + 4. Haal 4 weg aan beide kanten.",
            explainCorrect: "Klopt: 10 − 4 = 3a + 4 − 4 → 6 = 3a.",
            explainWrong: "Haal 4 weg aan beide kanten: 10 − 4 = 6, 3a + 4 − 4 = 3a.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking", "kladblaadje"],
            bookRef: { page: 55, exercise: "17a-b", label: "Kladblaadje" }
        },
        {
            id: "8_3_17c",
            type: "input",
            title: "Oplossing invullen (opgave 17c)",
            prompt: "Vul de oplossing in: 6 = 3a. De oplossing is a = ?",
            answer: "2",
            accept: ["twee"],
            hint1: "Deel 6 door 3.",
            explainCorrect: "Top: a = 2.",
            explainWrong: "6 = 3a → a = 6 ÷ 3 = 2.",
            points: DEFAULT_POINTS,
            tags: ["oplossen"],
            bookRef: { page: 55, exercise: "17c", label: "Oplossing" }
        },
        {
            id: "8_3_17d",
            type: "multiInput",
            title: "Controle (opgave 17d)",
            prompt: "Controleer je oplossing a = 2. Vul in bij: 2a + 10 en bij 5a + 4.",
            fields: [
                { key: "links", label: "2a + 10 met a = 2", placeholder: "vul in" },
                { key: "rechts", label: "5a + 4 met a = 2", placeholder: "vul in" }
            ],
            answers: { links: "14", rechts: "14" },
            hint1: "Vul a = 2 in: links = 2×2 + 10, rechts = 5×2 + 4.",
            hint2: "Links: 4 + 10 = 14. Rechts: 10 + 4 = 14.",
            explainCorrect: "Klopt: 14 = 14, dus a = 2 is correct! ✓",
            explainWrong: "Vul a = 2 in aan beide kanten: 2×2 + 10 = 14, 5×2 + 4 = 14.",
            points: DEFAULT_POINTS,
            tags: ["controle"],
            bookRef: { page: 55, exercise: "17d", label: "Controle" }
        },

        // ═══════════════════════════════════════════════════════
        // THEORIE-SLIDE (p. 55)
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_TH_01",
            type: "theory",
            title: "Theorie: vergelijkingen oplossen met een balans",
            prompt: "Bij een vergelijking kun je denken aan een balans. Je kunt de vergelijking oplossen door links en rechts van het '= teken' hetzelfde te doen.\n\nVoorbeeld: 4a + 1 = 2a + 5\n→ Links en rechts 1 knikker weghalen: 4a = 2a + 4\n→ Links en rechts 2 zakjes weghalen: 2a = 4\n→ In twee zakjes zitten 4 knikkers, dus a = 2",
            tags: ["theorie"],
            bookRef: { page: 55, label: "Theorie" }
        },

        // ═══════════════════════════════════════════════════════
        // OPGAVE 18 (p. 56) — Twee balansen
        // A: 5a + 4 = a + 20, B: 4a + 18 = 6a + 4
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_18a",
            type: "input",
            title: "Balans A: knikkers weghalen (opgave 18a)",
            prompt: "Bij balans A hoort de vergelijking 5a + 4 = a + 20. Hoeveel knikkers kun je maximaal aan beide kanten weghalen?",
            image: "/images/ch8/p56opg18.png",
            answer: "4",
            accept: ["vier", "4 knikkers", "vier knikkers"],
            hint1: "Kijk naar het kleinste aantal losse knikkers.",
            hint2: "Links zijn 4 losse knikkers, rechts 20. Je neemt het kleinste: 4.",
            explainCorrect: "Goed: je kunt 4 knikkers weghalen aan beide kanten.",
            explainWrong: "Je haalt het kleinste aantal losse knikkers weg. Links staan er 4.",
            points: DEFAULT_POINTS,
            tags: ["balansstap"],
            bookRef: { page: 56, exercise: "18a", label: "Balans A knikkers" }
        },
        {
            id: "8_3_18b",
            type: "mc",
            title: "Balans A: na knikkers weghalen (opgave 18b-c)",
            prompt: "Na −4 aan beide kanten van 5a + 4 = a + 20, welke vergelijking krijg je?",
            image: "/images/ch8/p56opg18.png",
            options: ["5a = a + 16", "5a + 4 = 16", "a = 16"],
            correctIndex: 0,
            hint1: "5a + 4 − 4 = a + 20 − 4.",
            explainCorrect: "Klopt: 5a = a + 16.",
            explainWrong: "Links: 5a + 4 − 4 = 5a. Rechts: a + 20 − 4 = a + 16.",
            points: DEFAULT_POINTS,
            tags: ["balansstap", "vergelijking"],
            bookRef: { page: 56, exercise: "18b-c", label: "Na knikkers weghalen" }
        },
        {
            id: "8_3_18d",
            type: "input",
            title: "Balans A: oplossen (opgave 18d)",
            prompt: "5a = a + 16. Haal a weg aan beide kanten → 4a = 16. Wat is a?",
            image: "/images/ch8/p56opg18.png",
            answer: "4",
            accept: ["vier"],
            hint1: "Deel 16 door 4.",
            explainCorrect: "Top: a = 4!",
            explainWrong: "4a = 16 → a = 16 ÷ 4 = 4.",
            points: DEFAULT_POINTS,
            tags: ["delen", "oplossen"],
            bookRef: { page: 56, exercise: "18d", label: "Balans A oplossen" }
        },
        {
            id: "8_3_18e",
            type: "mc",
            title: "Balans B: vergelijking (opgave 18e)",
            prompt: "Welke vergelijking hoort bij balans B?",
            image: "/images/ch8/p56opg18.png",
            options: ["4a + 18 = 6a + 4", "6a + 18 = 4a + 4", "4a + 4 = 6a + 18"],
            correctIndex: 0,
            hint1: "Kijk goed naar de afbeelding: links 4 zakjes + 18, rechts 6 zakjes + 4.",
            explainCorrect: "Klopt: 4a + 18 = 6a + 4.",
            explainWrong: "Links: 4 zakjes + 18 knikkers. Rechts: 6 zakjes + 4 knikkers.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking"],
            bookRef: { page: 56, exercise: "18e", label: "Balans B vergelijking" }
        },
        {
            id: "8_3_18f",
            type: "input",
            title: "Balans B: oplossen (opgave 18f)",
            prompt: "Los de vergelijking 4a + 18 = 6a + 4 op. Tip: haal 4a weg, dan 4 weg, dan delen.\nWat is a?",
            answer: "7",
            accept: ["zeven"],
            hint1: "Stap 1: −4a → 18 = 2a + 4.\nStap 2: −4 → 14 = 2a.\nStap 3: ÷2 → a = ...",
            hint2: "14 ÷ 2 = 7.",
            explainCorrect: "Top: a = 7!",
            explainWrong: "4a + 18 = 6a + 4 → −4a: 18 = 2a + 4 → −4: 14 = 2a → ÷2: a = 7.",
            points: DEFAULT_POINTS,
            tags: ["oplossen", "meerstaps"],
            bookRef: { page: 56, exercise: "18f", label: "Balans B oplossen" }
        },

        // ═══════════════════════════════════════════════════════
        // OPGAVE 19 (p. 56) — Drie balansen, los op
        // A: 3a + 2 = a + 12, B: 5a + 4 = 2a + 7 (→ a=1), C: 28 = 5a + 3
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_19a",
            type: "input",
            title: "Balans A (opgave 19a)",
            prompt: "Los op: 3a + 2 = a + 12.\na = ?",
            image: "/images/ch8/p56opg19.png",
            answer: "5",
            accept: ["vijf"],
            hint1: "Haal a weg aan beide kanten: 2a + 2 = 12.",
            hint2: "Haal 2 weg: 2a = 10. Deel door 2.",
            explainCorrect: "Top: a = 5!",
            explainWrong: "3a + 2 = a + 12 → −a: 2a + 2 = 12 → −2: 2a = 10 → ÷2: a = 5.",
            points: DEFAULT_POINTS,
            tags: ["oplossen"],
            bookRef: { page: 56, exercise: "19a", label: "Balans A" }
        },
        {
            id: "8_3_19b",
            type: "input",
            title: "Balans B (opgave 19b)",
            prompt: "Los op: 5a + 4 = 2a + 7.\na = ?",
            image: "/images/ch8/p56opg19.png",
            answer: "1",
            accept: ["een", "één"],
            hint1: "Haal 2a weg aan beide kanten: 3a + 4 = 7.",
            hint2: "Haal 4 weg: 3a = 3. Deel door 3.",
            explainCorrect: "Top: a = 1!",
            explainWrong: "5a + 4 = 2a + 7 → −2a: 3a + 4 = 7 → −4: 3a = 3 → ÷3: a = 1.",
            points: DEFAULT_POINTS,
            tags: ["oplossen"],
            bookRef: { page: 56, exercise: "19b", label: "Balans B" }
        },
        {
            id: "8_3_19c",
            type: "input",
            title: "Balans C (opgave 19c)",
            prompt: "Los op: 28 = 5a + 3.\na = ?",
            image: "/images/ch8/p56opg19.png",
            answer: "5",
            accept: ["vijf"],
            hint1: "Haal 3 weg aan beide kanten: 25 = 5a.",
            hint2: "Deel door 5: a = ...",
            explainCorrect: "Top: a = 5!",
            explainWrong: "28 = 5a + 3 → −3: 25 = 5a → ÷5: a = 5.",
            points: DEFAULT_POINTS,
            tags: ["oplossen"],
            bookRef: { page: 56, exercise: "19c", label: "Balans C" }
        },

        // ═══════════════════════════════════════════════════════
        // OPGAVE O19 (p. 57) — Ondersteunend
        // A: 6a + 5 = 3a + 11, B: 2a + 14 = 5a + 2
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_O19a",
            type: "mc",
            title: "Balans A: eerste stap (O19a)",
            prompt: "De vergelijking bij balans A is: 6a + 5 = 3a + 11. Lou haalt aan beide kanten vijf knikkers weg. Welke vergelijking krijgt Lou?",
            image: "/images/ch8/p57o19.png",
            options: ["6a = 3a + 6", "6a + 5 = 3a + 6", "a + 5 = 11"],
            correctIndex: 0,
            hint1: "6a + 5 − 5 = 3a + 11 − 5.",
            explainCorrect: "Klopt: 6a = 3a + 6.",
            explainWrong: "Links: 6a + 5 − 5 = 6a. Rechts: 3a + 11 − 5 = 3a + 6.",
            points: DEFAULT_POINTS,
            tags: ["balansstap"],
            bookRef: { page: 57, exercise: "O19a-b", label: "Balans A stap 1" }
        },
        {
            id: "8_3_O19c",
            type: "mc",
            title: "Balans A: zakjes weghalen (O19c)",
            prompt: "Na de knikkers: 6a = 3a + 6. Lou haalt nu aan beide kanten drie zakjes weg. Welke vergelijking krijgt hij?",
            image: "/images/ch8/p57o19.png",
            options: ["3a = 6", "6a = 6", "3a = 3"],
            correctIndex: 0,
            hint1: "6a − 3a = 3a. 3a + 6 − 3a = 6.",
            explainCorrect: "Klopt: 3a = 6.",
            explainWrong: "Links: 6a − 3a = 3a. Rechts: 3a + 6 − 3a = 6.",
            points: DEFAULT_POINTS,
            tags: ["balansstap"],
            bookRef: { page: 57, exercise: "O19c", label: "Balans A stap 2" }
        },
        {
            id: "8_3_O19d",
            type: "input",
            title: "Balans A: oplossen (O19d)",
            prompt: "3a = 6. Los op en schrijf de oplossing naast de balans.\na = ?",
            answer: "2",
            accept: ["twee"],
            hint1: "Deel 6 door 3.",
            explainCorrect: "Top: a = 2!",
            explainWrong: "3a = 6 → a = 6 ÷ 3 = 2.",
            points: DEFAULT_POINTS,
            tags: ["delen", "oplossen"],
            bookRef: { page: 57, exercise: "O19d", label: "Balans A oplossing" }
        },
        {
            id: "8_3_O19e",
            type: "mc",
            title: "Balans B: vergelijking (O19e)",
            prompt: "De vergelijking bij balans B is: 2a + 14 = 5a + 2. Wat is de eerste logische stap?",
            image: "/images/ch8/p57o19.png",
            options: [
                "−2a aan beide kanten (zakjes weghalen)",
                "−2 aan beide kanten (knikkers weghalen)",
                "−14 aan beide kanten"
            ],
            correctIndex: 0,
            hint1: "Haal eerst de zakjes (letters) weg van de kant met de minste.",
            explainCorrect: "Juist: links staan de minste zakjes (2), dus −2a.",
            explainWrong: "Begin met het weghalen van zakjes. Links staan er 2, rechts 5. Haal dus 2 weg.",
            points: DEFAULT_POINTS,
            tags: ["balansstap", "strategie"],
            bookRef: { page: 57, exercise: "O19e", label: "Balans B eerste stap" }
        },
        {
            id: "8_3_O19f",
            type: "input",
            title: "Balans B: oplossen (O19f)",
            prompt: "Los de vergelijking 2a + 14 = 5a + 2 helemaal op.\na = ?",
            answer: "4",
            accept: ["vier"],
            hint1: "−2a: 14 = 3a + 2. −2: 12 = 3a. ÷3: a = ?",
            hint2: "12 ÷ 3 = 4.",
            explainCorrect: "Top: a = 4!",
            explainWrong: "2a + 14 = 5a + 2 → −2a: 14 = 3a + 2 → −2: 12 = 3a → ÷3: a = 4.",
            points: DEFAULT_POINTS,
            tags: ["oplossen", "meerstaps"],
            bookRef: { page: 57, exercise: "O19f", label: "Balans B oplossing" }
        },

        // ═══════════════════════════════════════════════════════
        // LEERDOELENCHECK (p. 56)
        // 3a + 4 = a + 14
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_LDC",
            type: "multiInput",
            title: "Leerdoelencheck §8.3",
            prompt: "De balans hoort bij de vergelijking 3a + 4 = a + 14. Los de vergelijking op met de balans. Controleer je antwoord.",
            image: "/images/ch8/p56ldc.png",
            fields: [
                { key: "stap1", label: "Na −a aan beide kanten", placeholder: "vergelijking" },
                { key: "stap2", label: "Na −4 aan beide kanten", placeholder: "vergelijking" },
                { key: "a", label: "a =", placeholder: "getal" }
            ],
            answers: { stap1: "2a+4=14", stap2: "2a=10", a: "5" },
            accept: {
                stap1: ["2a + 4 = 14", "2a+4=14", "2a +4=14"].map(s => s.replace(/\s+/g, "")),
                stap2: ["2a = 10", "2a=10", "2a =10"].map(s => s.replace(/\s+/g, ""))
            },
            hint1: "Stap 1: haal a weg aan beide kanten. Stap 2: haal 4 weg aan beide kanten.",
            hint2: "2a + 4 = 14 → −4 → 2a = 10 → ÷2 → a = 5.",
            explainCorrect: "Perfect! a = 5. Controle: 3×5 + 4 = 19, 5 + 14 = 19 ✓",
            explainWrong: "3a + 4 = a + 14 → −a: 2a + 4 = 14 → −4: 2a = 10 → ÷2: a = 5.",
            points: { firstTry: 6, afterHint1: 3, afterHint2: 1 },
            tags: ["leerdoelencheck", "meerstaps"],
            bookRef: { page: 56, label: "Leerdoelencheck" }
        },

        // ═══════════════════════════════════════════════════════
        // EXTRA: E5 (p. 68) — 6g = 3g + 6
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_E5a",
            type: "input",
            title: "E5: Kazen weghalen (E5a)",
            prompt: "De balans hoort bij de vergelijking 6g = 3g + 6. Hoeveel kazen kun je maximaal aan beide kanten weghalen?",
            answer: "3",
            accept: ["drie", "3 kazen", "drie kazen"],
            hint1: "Rechts staan 3 kazen. Dat is het minimum.",
            explainCorrect: "Goed: 3 kazen aan beide kanten weghalen.",
            explainWrong: "Rechts staan er 3, links 6. Je kunt er maximaal 3 weghalen.",
            points: DEFAULT_POINTS,
            tags: ["balans", "zakjes"],
            bookRef: { page: 68, exercise: "E5a", label: "Kazen weghalen" }
        },
        {
            id: "8_3_E5c",
            type: "mc",
            title: "E5: Nieuwe vergelijking (E5c)",
            prompt: "Na −3g aan beide kanten van 6g = 3g + 6: welke vergelijking hoort erbij?",
            options: ["3g = 6", "6g = 6", "3g = 3"],
            correctIndex: 0,
            hint1: "6g − 3g = 3g. 3g + 6 − 3g = 6.",
            explainCorrect: "Klopt: 3g = 6.",
            explainWrong: "Links: 6g − 3g = 3g. Rechts: 3g + 6 − 3g = 6.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking"],
            bookRef: { page: 68, exercise: "E5c", label: "Nieuwe vergelijking" }
        },
        {
            id: "8_3_E5d",
            type: "input",
            title: "E5: Gewicht per kaas (E5d)",
            prompt: "3g = 6. Hoeveel weegt één kaas (g)?",
            answer: "2",
            accept: ["twee", "2 kg", "2kg"],
            hint1: "Deel 6 door 3.",
            explainCorrect: "Top: g = 2!",
            explainWrong: "3g = 6 → g = 6 ÷ 3 = 2.",
            points: DEFAULT_POINTS,
            tags: ["delen", "oplossen"],
            bookRef: { page: 68, exercise: "E5d", label: "Gewicht per kaas" }
        },

        // ═══════════════════════════════════════════════════════
        // EXTRA: E6 (p. 69) — 2a + 14 = 4a + 2
        // ═══════════════════════════════════════════════════════
        {
            id: "8_3_E6a",
            type: "input",
            title: "E6: Knikkers weghalen (E6a)",
            prompt: "De balans hoort bij de vergelijking 2a + 14 = 4a + 2. Hoeveel knikkers kun je maximaal aan beide kanten weghalen?",
            answer: "2",
            accept: ["twee", "2 knikkers", "twee knikkers"],
            hint1: "Kijk naar de kant met de minste losse knikkers.",
            explainCorrect: "Goed: 2 knikkers weghalen (rechts staan er het minst).",
            explainWrong: "Rechts staan 2 losse knikkers, dat is het minimum.",
            points: DEFAULT_POINTS,
            tags: ["balansstap"],
            bookRef: { page: 69, exercise: "E6a", label: "Knikkers weghalen" }
        },
        {
            id: "8_3_E6c",
            type: "mc",
            title: "E6: Nieuwe vergelijking (E6c)",
            prompt: "Na −2 aan beide kanten van 2a + 14 = 4a + 2: welke vergelijking krijg je?",
            options: ["2a + 12 = 4a", "2a + 14 = 4a", "12 = 2a"],
            correctIndex: 0,
            hint1: "Links: 2a + 14 − 2 = 2a + 12. Rechts: 4a + 2 − 2 = 4a.",
            explainCorrect: "Klopt: 2a + 12 = 4a.",
            explainWrong: "Links: 14 − 2 = 12, dus 2a + 12. Rechts: 4a + 2 − 2 = 4a.",
            points: DEFAULT_POINTS,
            tags: ["balansstap", "vergelijking"],
            bookRef: { page: 69, exercise: "E6c", label: "Nieuwe vergelijking" }
        },
        {
            id: "8_3_E6d",
            type: "input",
            title: "E6: Oplossen (E6d)",
            prompt: "2a + 12 = 4a. Los de vergelijking verder op.\na = ?",
            answer: "6",
            accept: ["zes"],
            hint1: "Haal 2a weg aan beide kanten: 12 = 2a. Deel door 2.",
            hint2: "12 ÷ 2 = 6.",
            explainCorrect: "Top: a = 6!",
            explainWrong: "2a + 12 = 4a → −2a: 12 = 2a → ÷2: a = 6.",
            points: DEFAULT_POINTS,
            tags: ["oplossen", "meerstaps"],
            bookRef: { page: 69, exercise: "E6d", label: "Oplossing" }
        },
    ] as Task[]
};
