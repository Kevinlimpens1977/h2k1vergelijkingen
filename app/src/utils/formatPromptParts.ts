/**
 * splitEquationPrompt — Split "equation. var = ?" prompts into structured parts.
 *
 * DISPLAY-ONLY: does not affect answer validation.
 *
 * Patterns matched:
 *   "5a = 700. Hoeveel gram weegt 1 blikje (a)?"  → equation + rest
 *   "7g = 21. g = ?"                               → equation + question "Wat is g?"
 *   "4a + 5 = 17. a = ?"                           → equation + question "Wat is a?"
 *   "12 = p + 3. p = ?"                            → equation + question "Wat is p?"
 */

export interface PromptParts {
    /** The equation portion, e.g. "5a + 6 = 16" */
    equation?: string;
    /** Auto-generated question, e.g. "Wat is a?" */
    question?: string;
    /** Remaining text that didn't fit the pattern (e.g. a longer question) */
    rest?: string;
}

/**
 * Try to split a prompt that ends with "equation. var = ?" into parts.
 *
 * Returns { equation, question } if matched, otherwise { rest: original }.
 */
export function splitEquationPrompt(prompt: string): PromptParts {
    // Pattern A: "<equation>. <var> = ?"
    // Pattern B: "<equation>, <var> = ?"
    // Supports optional whitespace around separators
    const regexVarEquals = /^(.+?=.+?)\s*[.,]\s*([a-zA-Z])\s*=\s*\?\s*$/;
    const match = prompt.match(regexVarEquals);

    if (match) {
        const equation = match[1].trim();
        const varName = match[2];
        return {
            equation,
            question: `Wat is ${varName}?`,
        };
    }

    // Pattern C: "Je hebt: <equation>. <rest>"
    const regexJeHebt = /^Je hebt:\s*(.+?=.+?)\s*\.\s*(.+)$/;
    const matchJeHebt = prompt.match(regexJeHebt);
    if (matchJeHebt) {
        return {
            equation: matchJeHebt[1].trim(),
            rest: matchJeHebt[2].trim(),
        };
    }

    // Pattern D: "Zet de stappen in de juiste volgorde voor: <equation>"
    const regexVolgorde = /^(.+?):\s*(\S+\s*[+\-*/]\s*\S+\s*=\s*\S+)\s*$/;
    const matchVolgorde = prompt.match(regexVolgorde);
    if (matchVolgorde) {
        return {
            rest: matchVolgorde[1].trim(),
            equation: matchVolgorde[2].trim(),
        };
    }

    // No match — return as-is
    return { rest: prompt };
}
