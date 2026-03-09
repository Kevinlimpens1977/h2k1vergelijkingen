// /app/src/content/ch8/section8_2.ts
// §8.2 De balans — contentset (oefenen) gebaseerd op de bijgeleverde methodepagina's.

export type PointsRule = {
    firstTry: number;      // 4
    afterHint1: number;    // 2
    afterHint2: number;    // 1
};

export type TaskBase = {
    id: string;
    type: "mc" | "input" | "order" | "balanceStep" | "multiInput" | "theory";
    title?: string;
    prompt: string;
    image?: string;
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

export type TheoryTask = TaskBase & {
    type: "theory";
};

export type Task = McTask | InputTask | MultiInputTask | OrderTask | BalanceStepTask | TheoryTask;

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
            image: "/images/ch8/p50opg8.png",
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
            image: "/images/ch8/p50opg8.png",
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
            prompt: "Rechts staan gewichten van 300 g, 300 g en 200 g. Hoeveel gram is dat samen?",
            image: "/images/ch8/p50opg9.png",
            answer: "800",
            accept: ["800g", "800 g", "800gram", "800 gram", "800gr", "800 gr"],
            hint1: "Tel 300 + 300 + 200.",
            explainCorrect: "Yes: 800 g.",
            explainWrong: "Tel de gewichten nog eens stap voor stap op.",
            points: DEFAULT_POINTS,
            tags: ["optellen", "balans"],
            bookRef: { page: 50, exercise: "9", label: "Appelmoes" }
        },
        {
            id: "8_2_L1_02",
            type: "mc",
            title: "Vergelijking bij de balans",
            prompt: "Links staan 4 blikken appelmoes (a). Rechts is 800 gram. Welke vergelijking past erbij?",
            image: "/images/ch8/p50opg9.png",
            options: ["4a = 800", "a + 4 = 800", "800a = 4"],
            correctIndex: 0,
            hint1: "a is het gewicht van 1 blik.",
            explainCorrect: "Klopt: 4 blikken = 800 g → 4a = 800.",
            explainWrong: "Je vermenigvuldigt a met 4 omdat er 4 blikken zijn.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking", "variabele"],
            bookRef: { page: 50, exercise: "9", label: "Appelmoes" }
        },
        {
            id: "8_2_L1_03",
            type: "input",
            title: "Gewicht per blik",
            prompt: "4a = 800. Hoeveel gram weegt 1 blik appelmoes (a)?",
            answer: "200",
            accept: ["200g", "200 g", "200gram", "200 gram", "200gr", "200 gr"],
            hint1: "Deel 800 door 4.",
            hint2: "800 ÷ 4 = 200.",
            explainCorrect: "Top: a = 200 gram.",
            explainWrong: "Je moet delen door 4, omdat a één blik is.",
            points: DEFAULT_POINTS,
            tags: ["delen", "vergelijking"],
            bookRef: { page: 50, exercise: "9", label: "Appelmoes" }
        },

        // Level 2 — Kaas & koffie (opgave 10)
        {
            id: "8_2_L2_01",
            type: "input",
            title: "Kaas: totaalgewicht",
            prompt: "Balans A (kaas): 3 kazen links wegen samen 36 kg. Hoeveel kg weegt 1 kaas?",
            image: "/images/ch8/p50opg10.png",
            answer: "12",
            accept: ["12kg", "12 kg", "12kilo", "12 kilo", "12kilogram", "12 kilogram"],
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
            prompt: "Balans B (koffie): links staan gewichten van 300 g, 600 g en 600 g. Hoeveel gram is dat samen?",
            image: "/images/ch8/p50opg10.png",
            answer: "1500",
            accept: ["1500g", "1500 g", "1500gram", "1500 gram", "1500gr", "1500 gr"],
            hint1: "Tel 300 + 600 + 600.",
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
            prompt: "Balans B (koffie): 5 pakken koffie wegen samen 1500 gram. Hoeveel gram is 1 pak?",
            image: "/images/ch8/p50opg10.png",
            answer: "300",
            accept: ["300g", "300 g", "300gram", "300 gram", "300gr", "300 gr"],
            hint1: "Deel 1500 door 5.",
            hint2: "1500 ÷ 5 = 300.",
            explainCorrect: "Top: 300 g per pak koffie.",
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
            image: "/images/ch8/p51opg11.png",
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
            image: "/images/ch8/p51opg11.png",
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
            image: "/images/ch8/p51opg11.png",
            fields: [
                { key: "eq", label: "Vergelijking (met a)", placeholder: "bijv. 3x + 2 = 14" },
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
            image: "/images/ch8/p51opg12.png",
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
            image: "/images/ch8/p51opg12.png",
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
            image: "/images/ch8/p51opg12.png",
            answer: "3",
            accept: ["3kg", "3 kg", "3kilo", "3 kilo", "3kilogram", "3 kilogram"],
            hint1: "Deel 21 door 7.",
            explainCorrect: "Top: g = 3 kg.",
            explainWrong: "Je moet delen door 7 om g alleen te krijgen.",
            points: DEFAULT_POINTS,
            tags: ["delen", "oplossen"],
            bookRef: { page: 51, exercise: "12", label: "Kaas + 3 kg" }
        },

        // Theorie-slide — "Doe aan beide kanten hetzelfde" (boek p.51-52)
        {
            id: "8_2_TH_01",
            type: "theory",
            title: "Theorie: de balansmethode",
            prompt: "Lees de theorie hieronder goed door. Bij het oplossen van een vergelijking kun je denken aan een balans. Als je van beide kanten hetzelfde eraf haalt of erbij doet, blijft de balans in evenwicht.",
            image: "/images/ch8/8_2theorie.png",
            tags: ["theorie"],
            bookRef: { page: 51, label: "Theorie" }
        },

        // Opgave 13 — 2a + 3 = 9 (balans met zakjes en knikkers)
        {
            id: "8_2_X_01a",
            type: "input",
            title: "Knikkers weghalen",
            prompt: "De balans is in evenwicht. Links liggen 2 zakjes (a) en 3 losse knikkers. Rechts liggen 9 losse knikkers. Bij de balans past: 2a + 3 = 9. Hoeveel knikkers kun je links en rechts maximaal weghalen?",
            image: "/images/ch8/p52opg13.png",
            answer: "3",
            hint1: "Kijk hoeveel losse knikkers er links liggen.",
            hint2: "Links liggen 3 losse knikkers. Die kun je aan beide kanten weghalen.",
            explainCorrect: "Goed: je kunt 3 knikkers aan beide kanten weghalen.",
            explainWrong: "Links liggen 3 losse knikkers — dat is het maximum dat je kunt weghalen.",
            points: DEFAULT_POINTS,
            tags: ["balansstap", "begrip"],
            bookRef: { page: 52, exercise: "13a", label: "Knikkers weghalen" }
        },
        {
            id: "8_2_X_01b",
            type: "mc",
            title: "Na het weghalen",
            prompt: "Je haalt 3 knikkers weg aan beide kanten van 2a + 3 = 9. Welke vergelijking krijg je dan?",
            image: "/images/ch8/p52opg13.png",
            options: ["2a = 6", "2a = 9", "2a + 3 = 6"],
            correctIndex: 0,
            hint1: "2a + 3 − 3 = 9 − 3.",
            explainCorrect: "Klopt: 2a + 3 − 3 = 9 − 3 → 2a = 6.",
            explainWrong: "Je haalt aan beide kanten 3 eraf: links valt de +3 weg, rechts wordt 9 − 3 = 6.",
            points: DEFAULT_POINTS,
            tags: ["balansstap"],
            bookRef: { page: 52, exercise: "13b", label: "Tweede balans" }
        },
        {
            id: "8_2_X_01c",
            type: "input",
            title: "Knikkers per zakje",
            prompt: "2a = 6. Hoeveel knikkers zitten er in één zakje?",
            image: "/images/ch8/p52opg13.png",
            answer: "3",
            hint1: "Deel 6 door 2.",
            explainCorrect: "Top: a = 3 knikkers per zakje!",
            explainWrong: "Je moet 6 delen door 2 (want er zijn 2 zakjes).",
            points: DEFAULT_POINTS,
            tags: ["delen", "oplossen"],
            bookRef: { page: 52, exercise: "13c", label: "Oplossen" }
        },
        {
            id: "8_2_X_02a",
            type: "multiInput",
            title: "Balans A — vergelijking",
            prompt: "Bekijk balans A. Links staan 4 zakjes (a). Rechts staan 8 knikkers. Schrijf de vergelijking op en bereken a.",
            image: "/images/ch8/p52opg14.png",
            fields: [
                { key: "eq", label: "Vergelijking", placeholder: "bijv. 2x = 8" },
                { key: "a", label: "a =", placeholder: "getal" }
            ],
            answers: { eq: "4a=8", a: "2" },
            accept: {
                eq: ["4a = 8", "4a=8", "4a =8", "4a= 8"].map(s => s.replace(/\s+/g, ""))
            },
            hint1: "Links: 4 zakjes = 4a, geen losse knikkers. Rechts: 8 knikkers.",
            hint2: "4a = 8. Deel door 4.",
            explainCorrect: "Top: 4a = 8, dus a = 2 knikkers per zakje.",
            explainWrong: "Tel links: 4 zakjes (4a), geen losse knikkers. Rechts: 8. Dus 4a = 8.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking", "oplossen"],
            bookRef: { page: 52, exercise: "14a", label: "Balans A" }
        },
        {
            id: "8_2_X_02b",
            type: "multiInput",
            title: "Balans B — vergelijking",
            prompt: "Bekijk balans B. Links staan 4 zakjes (a) en 2 losse knikkers. Rechts staan 14 knikkers. Schrijf de vergelijking op en bereken a.",
            image: "/images/ch8/p52opg14.png",
            fields: [
                { key: "eq", label: "Vergelijking", placeholder: "bijv. 2x + 3 = 9" },
                { key: "a", label: "a =", placeholder: "getal" }
            ],
            answers: { eq: "4a+2=14", a: "3" },
            accept: {
                eq: ["4a + 2 = 14", "4a+2=14", "4a +2= 14", "4a+2 = 14"].map(s => s.replace(/\s+/g, ""))
            },
            hint1: "Links: 4 zakjes = 4a, plus 2 knikkers. Rechts: 14.",
            hint2: "4a + 2 = 14. Haal 2 eraf: 4a = 12. Deel door 4.",
            explainCorrect: "Top: 4a + 2 = 14, dus a = 3 knikkers per zakje.",
            explainWrong: "Tel links: 4 zakjes (4a) + 2 losse knikkers. Rechts: 14. Dus 4a + 2 = 14.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking", "oplossen"],
            bookRef: { page: 52, exercise: "14b", label: "Balans B" }
        },
        {
            id: "8_2_X_02c",
            type: "multiInput",
            title: "Balans C — vergelijking",
            prompt: "Bekijk balans C. Links staan 5 zakjes (a) en 4 losse knikkers. Rechts staan 24 knikkers. Schrijf de vergelijking op en bereken a.",
            image: "/images/ch8/p52opg14.png",
            fields: [
                { key: "eq", label: "Vergelijking", placeholder: "bijv. 2x + 3 = 9" },
                { key: "a", label: "a =", placeholder: "getal" }
            ],
            answers: { eq: "5a+4=24", a: "4" },
            accept: {
                eq: ["5a + 4 = 24", "5a+4=24", "5a +4= 24", "5a+4 = 24"].map(s => s.replace(/\s+/g, ""))
            },
            hint1: "Links: 5 zakjes = 5a, plus 4 knikkers. Rechts: 24.",
            hint2: "5a + 4 = 24. Haal 4 eraf: 5a = 20. Deel door 5.",
            explainCorrect: "Top: 5a + 4 = 24, dus a = 4 knikkers per zakje.",
            explainWrong: "Tel links: 5 zakjes (5a) + 4 losse knikkers. Rechts: 24. Dus 5a + 4 = 24.",
            points: DEFAULT_POINTS,
            tags: ["vergelijking", "oplossen"],
            bookRef: { page: 52, exercise: "14c", label: "Balans C" }
        }
    ] as Task[]
};
