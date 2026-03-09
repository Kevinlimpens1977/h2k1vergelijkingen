/**
 * TERMTRIS Field — 10 × 20 Tetris grid with active piece and next preview.
 */

import {
    COLS, ROWS,
    type FieldGrid,
    type ActivePiece,
    getPieceCells,
    PIECE_CSS_COLORS,
    PIECE_COLORS,
} from '../utils/fieldLogic';

interface FieldProps {
    field: FieldGrid;
    activePiece: ActivePiece | null;
    nextPieceType: string | null;
    flashRows?: number[];
}

const CELL = 28;
const GAP = 1;

/** Get the offsets for a piece type at rotation 0, for the preview. */
function getPreviewOffsets(type: string): number[][] {
    const shapes: Record<string, number[][]> = {
        I: [[0, 0], [0, 1], [0, 2], [0, 3]],
        O: [[0, 0], [0, 1], [1, 0], [1, 1]],
        T: [[0, 0], [0, 1], [0, 2], [1, 1]],
        S: [[0, 1], [0, 2], [1, 0], [1, 1]],
        Z: [[0, 0], [0, 1], [1, 1], [1, 2]],
        L: [[0, 0], [0, 1], [0, 2], [1, 0]],
        J: [[0, 0], [0, 1], [0, 2], [1, 2]],
    };
    return shapes[type] ?? [];
}

export default function Field({ field, activePiece, nextPieceType, flashRows = [] }: FieldProps) {
    // Build a display grid: field + active piece
    const displayGrid: { value: number; isActive: boolean }[][] =
        field.map(row => row.map(cell => ({ value: cell, isActive: false })));

    // Draw active piece
    if (activePiece) {
        const activeCells = getPieceCells(activePiece);
        for (const [r, c] of activeCells) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                displayGrid[r][c] = { value: PIECE_COLORS[activePiece.type], isActive: true };
            }
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            {/* Main field */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
                    gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
                    gap: GAP,
                    padding: GAP + 2,
                    background: 'rgba(10, 10, 31, 0.8)',
                    borderRadius: 12,
                    border: '2px solid rgba(108, 92, 231, 0.25)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(108, 92, 231, 0.05)',
                }}
            >
                {displayGrid.map((row, r) =>
                    row.map((cell, c) => {
                        const isFlashing = flashRows.includes(r);
                        const color = cell.value > 0 ? PIECE_CSS_COLORS[cell.value] || '#6c5ce7' : undefined;

                        let bg = 'rgba(108, 92, 231, 0.03)';
                        let border = '1px solid rgba(108, 92, 231, 0.05)';
                        let shadow = 'none';

                        if (cell.value > 0) {
                            bg = color || '#6c5ce7';
                            border = `1px solid rgba(255,255,255,0.3)`;
                            shadow = `0 1px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`;
                        }

                        return (
                            <div
                                key={`${r}-${c}`}
                                style={{
                                    width: CELL,
                                    height: CELL,
                                    borderRadius: 3,
                                    background: bg,
                                    border,
                                    boxShadow: shadow,
                                    transition: 'all 0.08s ease',
                                    animation: isFlashing ? 'tt-flash 0.4s ease' : undefined,
                                }}
                            />
                        );
                    })
                )}
            </div>

            {/* Next piece preview */}
            {nextPieceType && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                }}>
                    <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.08em',
                        color: 'rgba(226, 232, 240, 0.4)',
                    }}>
                        Volgende
                    </span>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1.5px solid rgba(108, 92, 231, 0.2)',
                        borderRadius: 10,
                        padding: 8,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        display: 'grid',
                        gridTemplateColumns: `repeat(4, 22px)`,
                        gridTemplateRows: `repeat(2, 22px)`,
                        gap: 1,
                    }}>
                        {Array.from({ length: 2 }, (_, r) =>
                            Array.from({ length: 4 }, (_, c) => {
                                const offsets = getPreviewOffsets(nextPieceType);
                                const isBlock = offsets.some(([or, oc]) => or === r && oc === c);
                                const colorVal = PIECE_COLORS[nextPieceType as keyof typeof PIECE_COLORS] || 3;
                                const color = PIECE_CSS_COLORS[colorVal];
                                return (
                                    <div
                                        key={`next-${r}-${c}`}
                                        style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: 3,
                                            background: isBlock ? color : 'transparent',
                                            border: isBlock ? '1px solid rgba(255,255,255,0.3)' : 'none',
                                            boxShadow: isBlock ? 'inset 0 1px 0 rgba(255,255,255,0.3)' : 'none',
                                        }}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
