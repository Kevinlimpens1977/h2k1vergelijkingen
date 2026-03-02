// /app/src/content/ch8/section8_2.ts
// §8.2 De balans — contentset (oefenen) gebaseerd op de bijgeleverde methodepagina's.

export type PointsRule = {
    firstTry: number;      // 4
    afterHint1: number;    // 2
    afterHint2: number;    // 1
};

export type TaskBase = {
    id: string;
    type: "mc" | "input" | "order" | "balanceStep" | "multiInput";
    title?: string;
    prompt: string;
    hint1?: string;
    hint2?: string;
    explainCorrect?: string;
    explainWrong?: string;
    points?: PointsRule;
    tags?: string[];
    bookRef?: {
        page: number;
        exercise?: string;
        label?: string;
    };
};

export type McTask = TaskBase & {
    type: "mc";
    options: string[];
    correctIndex: number;
};

export type InputTask = TaskBase & {
    type: "input";
    answer: string;
    accept?: string[];
};

export type MultiInputTask = TaskBase & {
    type: "multiInput";
    fields: { key: string; label: string; placeholder?: string }[];
    answers: Record<string, string>;
    accept?: Record<string, string[]>;
};

export type OrderTask = TaskBase & {
    type: "order";
    steps: string[];
    correctOrder: number[];
};

export type BalanceStepTask = TaskBase & {
    type: "balanceStep";
    equation: string;
    choices: { label: string; op: string }[];
    correctOp: string;
    nextEquation: string;
};

export type Task = McTask | InputTask | MultiInputTask | OrderTask | BalanceStepTask;

const DEFAULT_POINTS: PointsRule = { firstTry: 4, afterHint1: 2, afterHint2: 1 };

export const section8_2 = {
    id: "8_2",
    title: "§8.2 De balans",
    subtitle: "Doe aan beide kanten hetzelfde",
    learningGoals: [
        "Ik weet: evenwicht betekent links en rechts even zwaar.",
        "Ik kan een balans omzetten naar een vergelijking.",
        "Ik kan een vergelijking oplossen door aan beide kanten hetzelfde te doen."
    ],
    pointsRule: DEFAULT_POINTS,

    items: [
        // Level 0 — Wip begrip (opgave 8)
        {
            id: "8_2_L0_01",
            type: "mc",
            title: "Wip in evenwicht",
            prompt: "Britt en Ellen zitten op een wip. De wip is in evenwicht. Wat kun je zeggen over hun gewicht?",
            options: ["Britt is zwaarder", "Ellen is zwaarder", "Britt en Ellen zijn even zwaar"],
            correctIndex: 2,
            hint1: "Evenwicht betekent: links en rechts even zwaar.",
            explainCorrect: "Juist: in evenwicht = even zwaar.",
            explainWrong: "Als de wip in evenwicht is, is geen kant zwaarder.",
            points: DEFAULT_POINTS,
            tags: ["balans", "begrip"],
            bookRef: { page: 50, exercise: "8", label: "Wip in evenwicht" }
        },
        {
            id: "8_2_L0_02",
            type: "mc",
            title: "Extra gewicht",
            prompt: "De hond springt bij Britt op schoot. Wat gebeurt er met de wip?",
            options: ["Britt-kant gaat omlaag", "Britt-kant gaat omhoog", "Niets verandert"],
            correctIndex: 0,
            hint1: "Meer gewicht = die kant zakt.",
            explainCorrect: "Klopt: extra gewicht aan Britt-kant → die kant gaat omlaag.",
            explainWrong: "Denk aan een weegschaal: meer gewicht → omlaag.",
            points: DEFAULT_POINTS,
            tags: ["balans", "begrip"],
            bookRef: { page: 50, exercise: "8", label: "Wip in evenwicht" }
        },

        // Level 1 — Appelmoes (opgave 9)
        {
            id: "8_2_L1_01",
            type: "input",
            title: "Gewichten optellen",
            prompt: "Rechts staan gewichten van 400 g, 200 g en 100 g. Hoeveel gram is dat samen?",
            answer: "700",
            hint1: "Tel 400 + 200 + 100.",
            explainCorrect: "Yes: 700 g.",
            explainWrong: "Tel de gewichten nog eens stap voor stap op.",
            points: DEFAULT_POINTS,
            tags: ["optellen", "balans"],
            bookRef: { page: 50, exercise: "9", label: "Appelmoes" }
        },
        {
            id: "8_2_L1_02",
            type: "mc",
            title: "Vergelijking bij de balans",
            prompt: "Links staan 5 blikjes appelmoes (a). Rechts is 700 gram. Welke vergelijking past erbij?",
            options: ["5a = 700", "a + 5 = 700", "700a = 5"],
            correctIndex: 0,
            hint1: "a is het gewicht van 1 blikje.",
            explainCorrect: "Klopt: 5 blikjes = 700 g → 5a = 700.",
            explainWrong: "Je vermenigvuldigt a met 5 omdat er 5 blikjes zijn.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking", "variabele"],
            bookRef: { page: 50, exercise: "9", label: "Appelmoes" }
        },
        {
            id: "8_2_L1_03",
            type: "input",
            title: "Gewicht per blikje",
            prompt: "5a = 700. Hoeveel gram weegt 1 blikje (a)?",
            answer: "140",
            hint1: "Deel 700 door 5.",
            hint2: "700 ÷ 5 = 140.",
            explainCorrect: "Top: a = 140 gram.",
            explainWrong: "Je moet delen door 5, omdat a één blikje is.",
            points: DEFAULT_POINTS,
            tags: ["delen", "vergelijking"],
            bookRef: { page: 50, exercise: "9", label: "Appelmoes" }
        },

        // Level 2 — Kaas & koffie (opgave 10)
        {
            id: "8_2_L2_01",
            type: "input",
            title: "Kaas: totaalgewicht",
            prompt: "Bij de kaas-balans wegen 3 kazen samen 36 kg. Hoeveel kg weegt 1 kaas?",
            answer: "12",
            hint1: "Deel 36 door 3.",
            hint2: "36 ÷ 3 = 12.",
            explainCorrect: "Juist: 12 kg per kaas.",
            explainWrong: "Omdat het 3 gelijke kazen zijn, deel je door 3.",
            points: DEFAULT_POINTS,
            tags: ["delen", "context"],
            bookRef: { page: 50, exercise: "10", label: "Kaas & koffie" }
        },
        {
            id: "8_2_L2_02",
            type: "input",
            title: "Koffie: gewichten optellen",
            prompt: "Links staan gewichten van 200 g, 900 g en 400 g. Hoeveel gram is dat samen?",
            answer: "1500",
            hint1: "Tel 200 + 900 + 400.",
            explainCorrect: "Yes: 1500 g.",
            explainWrong: "Tel de drie gewichten op.",
            points: DEFAULT_POINTS,
            tags: ["optellen"],
            bookRef: { page: 50, exercise: "10", label: "Kaas & koffie" }
        },
        {
            id: "8_2_L2_03",
            type: "input",
            title: "Koffie: gewicht per pak",
            prompt: "5 pakken koffie wegen samen 1500 gram. Hoeveel gram is 1 pak?",
            answer: "300",
            hint1: "Deel 1500 door 5.",
            hint2: "1500 ÷ 5 = 300.",
            explainCorrect: "Top: 300 g per pak.",
            explainWrong: "Je moet delen door 5 (vijf gelijke pakken).",
            points: DEFAULT_POINTS,
            tags: ["delen", "context"],
            bookRef: { page: 50, exercise: "10", label: "Kaas & koffie" }
        },

        // Level 3 — Knikkerzakjes: "zelfde eraf" (opgave 11)
        {
            id: "8_2_L3_01",
            type: "mc",
            title: "Waarom gaat links omhoog?",
            prompt: "Links zijn knikkers weggehaald. Waarom gaat de linkerkant omhoog?",
            options: ["Links is lichter geworden", "Links is zwaarder geworden", "Rechts is lichter geworden"],
            correctIndex: 0,
            hint1: "Als je gewicht weghaalt, wordt die kant lichter.",
            explainCorrect: "Klopt: lichter → omhoog.",
            explainWrong: "Wegnemen maakt die kant lichter, dus hij gaat omhoog.",
            points: DEFAULT_POINTS,
            tags: ["balans", "begrip"],
            bookRef: { page: 51, exercise: "11", label: "Knikkerzakjes" }
        },
        {
            id: "8_2_L3_02",
            type: "input",
            title: "Zelfde weghalen",
            prompt: "Links zijn 5 knikkers weggehaald. Hoeveel knikkers moet je rechts weghalen om weer eerlijk te maken?",
            answer: "5",
            hint1: "Op een balans doe je aan beide kanten hetzelfde.",
            explainCorrect: "Precies: 5 eraf aan beide kanten.",
            explainWrong: "Je moet hetzelfde aantal aan de andere kant weghalen.",
            points: DEFAULT_POINTS,
            tags: ["balansstap"],
            bookRef: { page: 51, exercise: "11", label: "Knikkerzakjes" }
        },
        {
            id: "8_2_L3_03",
            type: "multiInput",
            title: "Van balans naar vergelijking",
            prompt: "Schrijf de vergelijking bij: 4 zakjes (a) + 5 knikkers = 17 knikkers.",
            fields: [
                { key: "eq", label: "Vergelijking (met a)", placeholder: "bijv. 4a + 5 = 17" },
                { key: "a", label: "a =", placeholder: "getal" }
            ],
            answers: { eq: "4a+5=17", a: "3" },
            accept: {
                eq: ["4a + 5 = 17", "4a+5=17", "4a +5=17", "4a+ 5=17"].map(s => s.replace(/\s+/g, ""))
            },
            hint1: "Eerst de vergelijking: 4 zakjes = 4a.",
            hint2: "Haal 5 weg: 4a = 12, deel door 4: a = 3.",
            explainCorrect: "Top: 4a + 5 = 17 en a = 3.",
            explainWrong: "Zorg dat je 4 zakjes als 4a schrijft. Daarna reken je a uit.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking", "oplossen"],
            bookRef: { page: 51, exercise: "11", label: "Knikkerzakjes" }
        },

        // Level 4 — Kaas met +3 kg (opgave 12)
        {
            id: "8_2_L4_01",
            type: "input",
            title: "Vergelijking opstellen",
            prompt: "Links: 7 kazen (g) + 3 kg. Rechts: 24 kg. Vul in: 7g + 3 = 24. Wat staat er voor de g?",
            answer: "7",
            hint1: "Tel hoeveel kazen er links staan.",
            explainCorrect: "Yes: 7g + 3 = 24.",
            explainWrong: "Het getal voor g is het aantal kazen.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking"],
            bookRef: { page: 51, exercise: "12", label: "Kaas + 3 kg" }
        },
        {
            id: "8_2_L4_02",
            type: "balanceStep",
            title: "Balansstap kiezen",
            prompt: "Je wilt g alleen krijgen. Welke stap is geldig?",
            equation: "7g + 3 = 24",
            choices: [
                { label: "−3 aan beide kanten", op: "-3" },
                { label: "+3 aan beide kanten", op: "+3" },
                { label: "Alleen links −3", op: "left-3" }
            ],
            correctOp: "-3",
            nextEquation: "7g = 21",
            hint1: "Je moet aan beide kanten hetzelfde doen.",
            explainCorrect: "Goed: 7g + 3 − 3 = 24 − 3 → 7g = 21.",
            explainWrong: "Alleen links veranderen is niet eerlijk. Kies een bewerking aan beide kanten.",
            points: DEFAULT_POINTS,
            tags: ["balansstap"],
            bookRef: { page: 51, exercise: "12", label: "Kaas + 3 kg" }
        },
        {
            id: "8_2_L4_03",
            type: "input",
            title: "Los op",
            prompt: "7g = 21. Hoeveel kg weegt 1 kaas (g)?",
            answer: "3",
            hint1: "Deel 21 door 7.",
            explainCorrect: "Top: g = 3 kg.",
            explainWrong: "Je moet delen door 7 om g alleen te krijgen.",
            points: DEFAULT_POINTS,
            tags: ["delen", "oplossen"],
            bookRef: { page: 51, exercise: "12", label: "Kaas + 3 kg" }
        },

        // Extra: valkuil-validatie (nieuw, zelfde leerdoel)
        {
            id: "8_2_X_01",
            type: "mc",
            title: "Welke stap is geldig?",
            prompt: "Je hebt: 5a + 6 = 16. Welke stap is geldig?",
            options: [
                "Links −6 en rechts −6",
                "Links −6 en rechts +6",
                "Alleen links −6"
            ],
            correctIndex: 0,
            hint1: "Aan beide kanten hetzelfde doen.",
            explainCorrect: "Juist: −6 aan beide kanten houdt het eerlijk.",
            explainWrong: "Als je niet hetzelfde doet, verandert de balans.",
            points: DEFAULT_POINTS,
            tags: ["balansstap", "valkuil"]
        },
        {
            id: "8_2_X_02",
            type: "order",
            title: "Zet de stappen goed",
            prompt: "Zet de stappen in de juiste volgorde voor: 4x + 5 = 17",
            steps: [
                "4x = 12",
                "x = 3",
                "4x + 5 = 17",
                "4x + 5 − 5 = 17 − 5"
            ],
            correctOrder: [2, 3, 0, 1],
            hint1: "Eerst schrijf je de startvergelijking op.",
            hint2: "Haal daarna 5 weg aan beide kanten, dan deel je door 4.",
            explainCorrect: "Top: start → −5 aan beide kanten → 4x=12 → x=3.",
            explainWrong: "Kijk: eerst moet je de +5 wegwerken, daarna pas delen.",
            points: DEFAULT_POINTS,
            tags: ["stappenplan"]
        }
    ] as Task[]
};
