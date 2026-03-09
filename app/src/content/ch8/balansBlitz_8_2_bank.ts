// /app/src/content/ch8/balansBlitz_8_2_bank.ts
// Balans Blitz — §8.2 challenge vraagbank (mix: mc, input, balanceStep).
// Gebaseerd op §8.2 thema's (wip, appelmoes, kaas/koffie, knikkers, "zelfde aan beide kanten").

export type BlitzQ =
    | { id: string; type: "mc"; prompt: string; options: string[]; correctIndex: number }
    | { id: string; type: "input"; prompt: string; answer: string; accept?: string[] }
    | { id: string; type: "balanceStep"; prompt: string; equation: string; options: { label: string; op: string; next: string }[]; correctOp: string };

export const BALANS_BLITZ_8_2: BlitzQ[] = [
    // Balans begrip
    { id: "b1", type: "mc", prompt: "Evenwicht betekent…", options: ["links zwaarder", "rechts zwaarder", "links en rechts even zwaar"], correctIndex: 2 },
    { id: "b2", type: "mc", prompt: "Je haalt 4 knikkers links weg. Wat moet je doen om eerlijk te blijven?", options: ["rechts ook 4 weg", "rechts 8 weg", "niets"], correctIndex: 0 },

    // Appelmoes / vergelijkingen
    { id: "b3", type: "mc", prompt: "Welke vergelijking past bij: 4 blikken appelmoes (a) wegen 800 g?", options: ["4a = 800", "a + 4 = 800", "800a = 4"], correctIndex: 0 },
    { id: "b4", type: "input", prompt: "4a = 800. a = ?", answer: "200", accept: ["200g", "200 g", "200gram", "200 gram", "200gr", "200 gr"] },

    // Kaas/koffie rekenen
    { id: "b5", type: "input", prompt: "3 kazen wegen 36 kg. 1 kaas weegt… kg", answer: "12", accept: ["12kg", "12 kg", "12kilo", "12 kilo", "12kilogram", "12 kilogram"] },
    { id: "b6", type: "input", prompt: "Balans B (koffie): 300 g + 600 g + 600 g = … g", answer: "1500", accept: ["1500g", "1500 g", "1500gram", "1500 gram", "1500gr", "1500 gr"] },
    { id: "b7", type: "input", prompt: "5 pakken koffie wegen 1500 g. 1 pak weegt… g", answer: "300", accept: ["300g", "300 g", "300gram", "300 gram", "300gr", "300 gr"] },

    // Knikkerzakjes
    { id: "b8", type: "mc", prompt: "Waarom gaat een kant omhoog als je knikkers wegneemt?", options: ["die kant wordt lichter", "die kant wordt zwaarder", "de andere kant wordt lichter"], correctIndex: 0 },
    { id: "b9", type: "input", prompt: "Links haal je 5 knikkers weg. Rechts moet je… knikkers weghalen.", answer: "5" },
    { id: "b10", type: "input", prompt: "4a + 5 = 17. a = ?", answer: "3" },

    // Balansstap keuzes
    {
        id: "b11",
        type: "balanceStep",
        prompt: "Kies de geldige stap (zelfde aan beide kanten):",
        equation: "7g + 3 = 24",
        options: [
            { label: "−3 aan beide kanten", op: "-3", next: "7g = 21" },
            { label: "+3 aan beide kanten", op: "+3", next: "7g + 6 = 27" },
            { label: "alleen links −3", op: "left-3", next: "7g = 24" }
        ],
        correctOp: "-3"
    },
    { id: "b12", type: "input", prompt: "7g = 21. g = ?", answer: "3" },

    // Variatie: "geldig of niet?"
    { id: "b13", type: "mc", prompt: "Je hebt: 5a + 6 = 16. Geldige stap?", options: ["−6 aan beide kanten", "−6 links en +6 rechts", "alleen links −6"], correctIndex: 0 },
    { id: "b14", type: "input", prompt: "5a + 6 = 16. a = ?", answer: "2" },

    // Snelle rekenchecks
    { id: "b15", type: "input", prompt: "12 = p + 3. p = ?", answer: "9" },
    {
        id: "b16", type: "balanceStep", prompt: "Kies stap om p alleen te krijgen:", equation: "12 = p + 3", options: [
            { label: "−3 aan beide kanten", op: "-3", next: "9 = p" },
            { label: "+3 aan beide kanten", op: "+3", next: "15 = p + 6" },
            { label: "÷3 aan beide kanten", op: "/3", next: "4 = p/3 + 1" }
        ], correctOp: "-3"
    },

    // Extra mix (steeds zelfde principe)
    { id: "b17", type: "input", prompt: "9 = p. p = ?", answer: "9" },
    { id: "b18", type: "input", prompt: "4x + 5 = 17. x = ?", answer: "3" },
    { id: "b19", type: "mc", prompt: "Welke stap eerst bij 4x + 5 = 17?", options: ["delen door 4", "5 weghalen aan beide kanten", "17 + 5"], correctIndex: 1 },

    // Nog wat variatie (kleine getallen, 2K-proof)
    { id: "b20", type: "input", prompt: "2n + 4 = 10. n = ?", answer: "3" },
    { id: "b21", type: "mc", prompt: "Welke stap is eerlijk bij 2n + 4 = 10?", options: ["−4 aan beide kanten", "−4 alleen links", "+4 aan beide kanten"], correctIndex: 0 },
    { id: "b22", type: "input", prompt: "2n = 6. n = ?", answer: "3" },

    // "zelfde weghalen" conceptueel
    { id: "b23", type: "mc", prompt: "Als je links 2 wegneemt, moet je rechts…", options: ["ook 2 wegnemen", "2 erbij doen", "niets"], correctIndex: 0 },
    { id: "b24", type: "input", prompt: "6 + a = 14. a = ?", answer: "8" },
    {
        id: "b25", type: "balanceStep", prompt: "Kies stap om a alleen te krijgen:", equation: "6 + a = 14", options: [
            { label: "−6 aan beide kanten", op: "-6", next: "a = 8" },
            { label: "+6 aan beide kanten", op: "+6", next: "12 + a = 20" },
            { label: "×6 aan beide kanten", op: "*6", next: "36 + 6a = 84" }
        ], correctOp: "-6"
    },

    // Eindmix
    { id: "b26", type: "input", prompt: "a = 8. a = ?", answer: "8" },
    { id: "b27", type: "input", prompt: "3y = 12. y = ?", answer: "4" },
    { id: "b28", type: "mc", prompt: "Welke stap eerst bij 3y = 12?", options: ["+3", "delen door 3", "−12"], correctIndex: 1 },
    { id: "b29", type: "input", prompt: "7g + 3 = 24. g = ?", answer: "3" },
    { id: "b30", type: "mc", prompt: "Balans in evenwicht = …", options: ["links = rechts", "links > rechts", "links < rechts"], correctIndex: 0 }
];
