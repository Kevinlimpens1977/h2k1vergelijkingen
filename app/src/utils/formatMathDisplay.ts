/**
 * formatMathDisplay — Display-only formatting for math expressions.
 *
 * Removes explicit multiplication symbols (·, ×, *) between numbers and
 * letters/parentheses so students see "7g" instead of "7·g" or "7×g".
 *
 * IMPORTANT: Only use on display strings. Do NOT use on values being
 * compared for answer checking or stored in Firestore.
 */

/**
 * Clean up multiplication symbols for student-facing display.
 *
 * Rules (applied in order):
 * A) "7·g" / "7 * g" / "7×g" → "7g"
 * B) "7·(" / "7×(" → "7("
 * C) ")·a" / ")×a" → ")a"
 * D) Does NOT break: decimals (3.5), negative signs (−3), equals, +/−, ÷
 */
export function formatMathDisplay(input: string): string {
    let s = input;

    // A) number · letter → number + letter (implicit multiplication)
    s = s.replace(/(\d)\s*[·×*]\s*([a-zA-Z])/g, '$1$2');

    // B) number · ( → number(
    s = s.replace(/(\d)\s*[·×*]\s*\(/g, '$1(');

    // C) ) · letter → )letter
    s = s.replace(/\)\s*[·×*]\s*([a-zA-Z])/g, ')$1');

    // D) "1·x" edge case: coefficient 1 before var can be simplified
    //    BUT we keep "1x" as-is since some exercises explicitly show it.

    return s;
}
