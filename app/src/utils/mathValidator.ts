/**
 * Centralized math answer validation.
 *
 * Handles:
 * 1. Input normalization (x/X/· → *, whitespace removal)
 * 2. Chained equations ("2*2+10=4+10=14" — all parts must evaluate equal)
 * 3. Safe numeric expression evaluation (no eval, no external deps)
 * 4. Case-insensitive multiplication symbols
 * 5. Formatting differences ignored
 * 6. Dutch number word recognition
 * 7. Algebraic term comparison (commutative: 4b+2a === 2a+4b)
 */

// ─── Dutch number words ──────────────────────────────────────
const DUTCH_NUMBERS: Record<string, number> = {
    nul: 0, een: 1, één: 1, twee: 2, drie: 3, vier: 4,
    vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10,
    elf: 11, twaalf: 12, dertien: 13, veertien: 14, vijftien: 15,
    zestien: 16, zeventien: 17, achttien: 18, negentien: 19, twintig: 20,
    dertig: 30, veertig: 40, vijftig: 50, zestig: 60,
    zeventig: 70, tachtig: 80, negentig: 90,
    honderd: 100, tweehonderd: 200, driehonderd: 300,
    vierhonderd: 400, vijfhonderd: 500, zeshonderd: 600,
    zevenhonderd: 700, achthonderd: 800, negenhonderd: 900,
    duizend: 1000,
};

// ─── Input normalization ─────────────────────────────────────

/**
 * Normalizes a math expression for comparison.
 * - Lowercase
 * - Replace x/X/· with * (multiplication)
 * - BUT only when x/X appears between digits or next to digits (not as variable!)
 * - Remove all whitespace
 * - Replace ,decimal with .decimal
 */
export function normalizeMathInput(s: string): string {
    let r = s.trim().toLowerCase();

    // Replace middle-dot (·) with *
    r = r.replace(/·/g, '*');

    // Replace × (multiplication sign) with *
    r = r.replace(/×/g, '*');

    // Replace x/X used as multiplication (between two digits: "2x3" → "2*3")
    // Pattern: digit followed by x/X followed by digit
    r = r.replace(/(\d)[xX](\d)/g, '$1*$2');

    // Replace comma decimal separator with dot
    r = r.replace(/(\d),(\d)/g, '$1.$2');

    // Remove all spaces
    r = r.replace(/\s+/g, '');

    return r;
}

// ─── Safe expression evaluator ───────────────────────────────

/**
 * Tokenizer for simple arithmetic expressions.
 * Supports: +, -, *, /, parentheses, integers, decimals, unary minus.
 */
type Token =
    | { type: 'number'; value: number }
    | { type: 'op'; value: '+' | '-' | '*' | '/' }
    | { type: 'lparen' }
    | { type: 'rparen' };

function tokenize(expr: string): Token[] | null {
    const tokens: Token[] = [];
    let i = 0;
    const s = expr.replace(/\s+/g, '');

    while (i < s.length) {
        const ch = s[i];

        // Number (integer or decimal)
        if (/\d/.test(ch) || (ch === '.' && i + 1 < s.length && /\d/.test(s[i + 1]))) {
            let num = '';
            while (i < s.length && (/\d/.test(s[i]) || s[i] === '.')) {
                num += s[i];
                i++;
            }
            const parsed = parseFloat(num);
            if (isNaN(parsed)) return null;
            tokens.push({ type: 'number', value: parsed });
            continue;
        }

        if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
            tokens.push({ type: 'op', value: ch as '+' | '-' | '*' | '/' });
            i++;
            continue;
        }

        if (ch === '(') {
            tokens.push({ type: 'lparen' });
            i++;
            continue;
        }

        if (ch === ')') {
            tokens.push({ type: 'rparen' });
            i++;
            continue;
        }

        // Unknown character — can't evaluate
        return null;
    }

    return tokens;
}

/**
 * Recursive descent parser for basic math expressions.
 * Grammar:
 *   expr     → term (('+' | '-') term)*
 *   term     → unary (('*' | '/') unary)*
 *   unary    → ('-')* primary
 *   primary  → NUMBER | '(' expr ')'
 */
function parseAndEval(tokens: Token[]): number | null {
    let pos = 0;

    function peek(): Token | undefined {
        return tokens[pos];
    }

    function consume(): Token {
        return tokens[pos++];
    }

    function parseExpr(): number | null {
        let left = parseTerm();
        if (left === null) return null;

        while (pos < tokens.length) {
            const t = peek();
            if (!t || t.type !== 'op' || (t.value !== '+' && t.value !== '-')) break;
            consume();
            const right = parseTerm();
            if (right === null) return null;
            left = t.value === '+' ? left + right : left - right;
        }

        return left;
    }

    function parseTerm(): number | null {
        let left = parseUnary();
        if (left === null) return null;

        while (pos < tokens.length) {
            const t = peek();
            if (!t || t.type !== 'op' || (t.value !== '*' && t.value !== '/')) break;
            consume();
            const right = parseUnary();
            if (right === null) return null;
            if (t.value === '*') {
                left = left * right;
            } else {
                if (right === 0) return null; // division by zero
                left = left / right;
            }
        }

        return left;
    }

    function parseUnary(): number | null {
        let negCount = 0;
        while (pos < tokens.length) {
            const t = peek();
            if (t && t.type === 'op' && t.value === '-') {
                negCount++;
                consume();
            } else {
                break;
            }
        }
        let val = parsePrimary();
        if (val === null) return null;
        if (negCount % 2 === 1) val = -val;
        return val;
    }

    function parsePrimary(): number | null {
        const t = peek();
        if (!t) return null;

        if (t.type === 'number') {
            consume();
            return t.value;
        }

        if (t.type === 'lparen') {
            consume();
            const val = parseExpr();
            if (val === null) return null;
            const closing = peek();
            if (!closing || closing.type !== 'rparen') return null;
            consume();
            return val;
        }

        return null;
    }

    const result = parseExpr();
    if (pos !== tokens.length) return null; // leftover tokens
    return result;
}

/**
 * Safely evaluate a simple arithmetic expression.
 * Returns null if the expression can't be evaluated.
 *
 * Examples:
 *   "2*2+10" → 14
 *   "4+10"   → 14
 *   "14"     → 14
 *   "3*5+4"  → 19
 */
export function safeEval(expr: string): number | null {
    const normalized = normalizeMathInput(expr);
    const tokens = tokenize(normalized);
    if (!tokens || tokens.length === 0) return null;
    return parseAndEval(tokens);
}

// ─── Chain equation check ────────────────────────────────────

/**
 * Handles chained equations like "2*2+10=4+10=14".
 * Splits on '=' and verifies all parts evaluate to the same number.
 */
function checkChainedEquation(input: string, expectedValue: number): boolean {
    const parts = input.split('=').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length === 0) return false;

    // Every part must evaluate to the expected value
    return parts.every(part => {
        const val = safeEval(part);
        if (val === null) return false;
        return Math.abs(val - expectedValue) < 0.0001;
    });
}

// ─── Dutch word number extraction ────────────────────────────

function extractDutchNumber(input: string): number | null {
    const lower = input.toLowerCase().trim();

    // Try each Dutch number word
    for (const [word, num] of Object.entries(DUTCH_NUMBERS)) {
        if (lower.includes(word)) return num;
    }

    return null;
}

// ─── Main validator ──────────────────────────────────────────

/**
 * Smart math answer comparison.
 *
 * Validates a student's answer against an expected answer with multiple
 * strategies:
 *
 * 1. Exact string match (after normalization)
 * 2. Numeric evaluation match (safe arithmetic parser)
 * 3. Chained equation check ("2*2+10=4+10=14")
 * 4. Algebraic term comparison (commutative: "2a+3" === "3+2a")
 * 5. Dutch number word recognition ("twee" → 2)
 * 6. Accept-list matching
 *
 * @param studentAnswer Raw student input
 * @param correctAnswer Expected correct answer
 * @param acceptList    Optional array of alternative accepted answers
 * @returns true if the answer should be marked correct
 */
export function matchAnswer(
    studentAnswer: string,
    correctAnswer: string,
    acceptList?: string[]
): boolean {
    const studentNorm = normalizeMathInput(studentAnswer);
    const correctNorm = normalizeMathInput(correctAnswer);

    // ① Exact normalized string match
    if (studentNorm === correctNorm) return true;

    // ② Accept list — normalized string match
    if (acceptList) {
        for (const alt of acceptList) {
            if (studentNorm === normalizeMathInput(alt)) return true;
        }
    }

    // ③ Numeric evaluation match
    const expectedVal = safeEval(correctAnswer);
    if (expectedVal !== null) {
        // Direct evaluation
        const studentVal = safeEval(studentAnswer);
        if (studentVal !== null && Math.abs(studentVal - expectedVal) < 0.0001) {
            return true;
        }

        // Chained equation check (student wrote "2*2+10=4+10=14")
        if (studentAnswer.includes('=')) {
            if (checkChainedEquation(studentAnswer, expectedVal)) return true;
        }
    }

    // ④ Algebraic term comparison (imports from algebraEquals)
    if (algebraTermsEqual(studentAnswer, correctAnswer)) return true;

    // ⑤ Accept list — algebraic + numeric
    if (acceptList) {
        for (const alt of acceptList) {
            if (algebraTermsEqual(studentAnswer, alt)) return true;

            const altVal = safeEval(alt);
            const stuVal = safeEval(studentAnswer);
            if (altVal !== null && stuVal !== null && Math.abs(stuVal - altVal) < 0.0001) {
                return true;
            }
        }
    }

    // ⑥ Dutch number word extraction
    const dutchNum = extractDutchNumber(studentAnswer);
    if (dutchNum !== null) {
        const expNum = parseInt(correctAnswer.trim(), 10);
        if (!isNaN(expNum) && dutchNum === expNum) return true;
    }

    // ⑦ Numeric extraction fallback (student wrote "5 kazen" and answer is "5")
    if (/^-?\d+$/.test(correctAnswer.trim())) {
        const digits = studentNorm.match(/-?\d+/g);
        if (digits && digits.length === 1 && digits[0] === correctAnswer.trim()) return true;
    }

    return false;
}

/**
 * Multi-input answer comparison.
 *
 * Compares all fields of a multi-input question.
 *
 * @param studentValues Record of field key → student answer
 * @param correctValues Record of field key → correct answer
 * @param acceptMap     Optional record of field key → accepted alternatives
 * @param fields        Array of field definitions (key, label)
 * @returns true if ALL fields match
 */
export function matchMultiAnswer(
    studentValues: Record<string, string>,
    correctValues: Record<string, string>,
    fields: { key: string }[],
    acceptMap?: Record<string, string[]>
): boolean {
    return fields.every((f) => {
        const studentVal = (studentValues[f.key] ?? '').trim();
        const correctVal = (correctValues[f.key] ?? '').trim();

        if (!studentVal) return false;

        // Use the main matchAnswer with per-field accept list
        const fieldAccepts = acceptMap?.[f.key];
        return matchAnswer(studentVal, correctVal, fieldAccepts);
    });
}

// ─── Algebraic comparison (inline, from algebraEquals) ───────

interface Term {
    coeff: number;
    variable: string;
}

function parseTerms(expr: string): Term[] | null {
    const s = expr.replace(/\s+/g, '').toLowerCase();
    if (!s) return null;

    const terms: Term[] = [];
    const regex = /([+-]?)(\d*)([a-z]?)/g;
    let match: RegExpExecArray | null;
    let consumed = 0;

    while ((match = regex.exec(s)) !== null) {
        if (match[0] === '') {
            regex.lastIndex++;
            if (regex.lastIndex > s.length) break;
            continue;
        }

        const sign = match[1] === '-' ? -1 : 1;
        const digits = match[2];
        const variable = match[3] || '';

        if (!digits && !variable) return null;

        let coeff: number;
        if (variable) {
            coeff = digits ? parseInt(digits, 10) * sign : sign;
        } else {
            coeff = parseInt(digits, 10) * sign;
        }

        terms.push({ coeff, variable });
        consumed += match[0].length;
    }

    if (consumed < s.length) return null;
    if (terms.length === 0) return null;

    return terms;
}

function normalizeTerms(terms: Term[]): Term[] {
    const map = new Map<string, number>();
    for (const t of terms) {
        map.set(t.variable, (map.get(t.variable) ?? 0) + t.coeff);
    }

    const result: Term[] = [];
    for (const [variable, coeff] of map) {
        if (coeff !== 0) {
            result.push({ coeff, variable });
        }
    }

    result.sort((a, b) => {
        if (a.variable === '' && b.variable !== '') return 1;
        if (a.variable !== '' && b.variable === '') return -1;
        return a.variable.localeCompare(b.variable);
    });

    return result;
}

function algebraTermsEqual(a: string, b: string): boolean {
    const stripA = a.replace(/\s+/g, '').toLowerCase();
    const stripB = b.replace(/\s+/g, '').toLowerCase();
    if (stripA === stripB) return true;

    const termsA = parseTerms(a);
    const termsB = parseTerms(b);
    if (!termsA || !termsB) return false;

    const normA = normalizeTerms(termsA);
    const normB = normalizeTerms(termsB);

    if (normA.length !== normB.length) return false;

    return normA.every((t, i) =>
        t.coeff === normB[i].coeff && t.variable === normB[i].variable
    );
}
