/**
 * TERMTRIS field logic — Real Tetris mechanics
 *
 * 10 columns × 20 rows grid with standard tetrominoes.
 *
 * Cell values:
 *   0 = empty
 *   1–7 = piece colors (I=1, O=2, T=3, S=4, Z=5, L=6, J=7)
 *   8 = garbage block
 *
 * Origin: row 0 = top, row 19 = bottom.
 */

export const COLS = 10;
export const ROWS = 20;

export type CellValue = number; // 0=empty, 1-7=piece colors, 8=garbage
export type FieldGrid = CellValue[][];

/* ── Tetromino definitions ──────────────────────────── */

// Each piece has 4 rotation states, each is a list of [row, col] offsets
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'L' | 'J';

export const PIECE_COLORS: Record<PieceType, number> = {
    I: 1, O: 2, T: 3, S: 4, Z: 5, L: 6, J: 7,
};

export const PIECE_CSS_COLORS: Record<number, string> = {
    1: '#00cec9', // I - cyan
    2: '#fdcb6e', // O - yellow
    3: '#6c5ce7', // T - purple
    4: '#00b894', // S - green
    5: '#e17055', // Z - red
    6: '#e17055', // L - orange (slightly diff shade)
    7: '#0984e3', // J - blue
    8: '#b2bec3', // garbage - grey
};

// Rotation states: [row, col] offsets from piece origin
const PIECES: Record<PieceType, number[][][]> = {
    I: [
        [[0, 0], [0, 1], [0, 2], [0, 3]],
        [[0, 0], [1, 0], [2, 0], [3, 0]],
        [[0, 0], [0, 1], [0, 2], [0, 3]],
        [[0, 0], [1, 0], [2, 0], [3, 0]],
    ],
    O: [
        [[0, 0], [0, 1], [1, 0], [1, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1]],
    ],
    T: [
        [[0, 0], [0, 1], [0, 2], [1, 1]],
        [[0, 0], [1, 0], [2, 0], [1, 1]],
        [[1, 0], [1, 1], [1, 2], [0, 1]],
        [[0, 0], [1, 0], [2, 0], [1, -1]],
    ],
    S: [
        [[0, 1], [0, 2], [1, 0], [1, 1]],
        [[0, 0], [1, 0], [1, 1], [2, 1]],
        [[0, 1], [0, 2], [1, 0], [1, 1]],
        [[0, 0], [1, 0], [1, 1], [2, 1]],
    ],
    Z: [
        [[0, 0], [0, 1], [1, 1], [1, 2]],
        [[0, 1], [1, 0], [1, 1], [2, 0]],
        [[0, 0], [0, 1], [1, 1], [1, 2]],
        [[0, 1], [1, 0], [1, 1], [2, 0]],
    ],
    L: [
        [[0, 0], [0, 1], [0, 2], [1, 0]],
        [[0, 0], [1, 0], [2, 0], [2, 1]],
        [[1, 0], [1, 1], [1, 2], [0, 2]],
        [[0, 0], [0, 1], [1, 1], [2, 1]],
    ],
    J: [
        [[0, 0], [0, 1], [0, 2], [1, 2]],
        [[0, 0], [1, 0], [2, 0], [0, 1]],
        [[0, 0], [1, 0], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [2, 0], [2, 1]],
    ],
};

export interface ActivePiece {
    type: PieceType;
    rotation: number; // 0-3
    row: number;      // top-left origin row
    col: number;      // top-left origin col
}

/** Create an empty grid. */
export function createEmptyField(): FieldGrid {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0) as CellValue[]);
}

/** Get the cells occupied by a piece at its current position. */
export function getPieceCells(piece: ActivePiece): [number, number][] {
    const offsets = PIECES[piece.type][piece.rotation % 4];
    return offsets.map(([dr, dc]) => [piece.row + dr, piece.col + dc]);
}

/** Check if a piece position is valid (no collisions, in bounds). */
export function isValidPosition(field: FieldGrid, piece: ActivePiece): boolean {
    const cells = getPieceCells(piece);
    for (const [r, c] of cells) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
        if (field[r][c] !== 0) return false;
    }
    return true;
}

/** Try to move a piece. Returns the new piece if valid, null otherwise. */
export function tryMove(field: FieldGrid, piece: ActivePiece, dr: number, dc: number): ActivePiece | null {
    const moved: ActivePiece = { ...piece, row: piece.row + dr, col: piece.col + dc };
    return isValidPosition(field, moved) ? moved : null;
}

/** Try to rotate a piece (clockwise). Returns new piece if valid, null otherwise (with wall-kick). */
export function tryRotate(field: FieldGrid, piece: ActivePiece): ActivePiece | null {
    const newRot = (piece.rotation + 1) % 4;
    const rotated: ActivePiece = { ...piece, rotation: newRot };

    // Try normal position first
    if (isValidPosition(field, rotated)) return rotated;

    // Wall-kick: try shifts
    const kicks = [
        { row: 0, col: -1 }, { row: 0, col: 1 },
        { row: 0, col: -2 }, { row: 0, col: 2 },
        { row: -1, col: 0 }, { row: -1, col: -1 }, { row: -1, col: 1 },
    ];
    for (const kick of kicks) {
        const kicked: ActivePiece = { ...rotated, row: rotated.row + kick.row, col: rotated.col + kick.col };
        if (isValidPosition(field, kicked)) return kicked;
    }
    return null;
}

/** Lock a piece into the field grid. Returns the new field. */
export function lockPiece(field: FieldGrid, piece: ActivePiece): FieldGrid {
    const next = field.map(row => [...row]) as FieldGrid;
    const colorVal = PIECE_COLORS[piece.type];
    const cells = getPieceCells(piece);
    for (const [r, c] of cells) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            next[r][c] = colorVal;
        }
    }
    return next;
}

/** Hard drop: move piece down as far as possible. */
export function hardDrop(field: FieldGrid, piece: ActivePiece): ActivePiece {
    let current = piece;
    while (true) {
        const next = tryMove(field, current, 1, 0);
        if (!next) break;
        current = next;
    }
    return current;
}

/** Get the ghost (preview) position of hard drop. */
export function getGhostPiece(field: FieldGrid, piece: ActivePiece): ActivePiece {
    return hardDrop(field, piece);
}

/**
 * Check and clear full rows. Returns the new field and how many rows were cleared.
 */
export function clearFullRows(field: FieldGrid): { field: FieldGrid; cleared: number; clearedRows: number[] } {
    const fullRows: number[] = [];
    for (let r = 0; r < ROWS; r++) {
        if (field[r].every(cell => cell !== 0)) {
            fullRows.push(r);
        }
    }

    if (fullRows.length === 0) return { field, cleared: 0, clearedRows: [] };

    const remaining = field.filter((_, i) => !fullRows.includes(i));
    const emptyRows: CellValue[][] = Array.from(
        { length: fullRows.length },
        () => Array(COLS).fill(0) as CellValue[],
    );

    return {
        field: [...emptyRows, ...remaining] as FieldGrid,
        cleared: fullRows.length,
        clearedRows: fullRows,
    };
}

/**
 * Add a garbage row at the bottom: shift entire field up by 1,
 * then fill bottom row with garbage blocks except 1 random hole.
 */
export function addGarbageRow(field: FieldGrid): { field: FieldGrid; gameOver: boolean } {
    const next = field.map(row => [...row]) as FieldGrid;
    const gameOver = next[0].some(cell => cell !== 0);

    for (let r = 0; r < ROWS - 1; r++) {
        next[r] = [...next[r + 1]];
    }

    const hole = Math.floor(Math.random() * COLS);
    const garbageRow: CellValue[] = Array(COLS).fill(8) as CellValue[];
    garbageRow[hole] = 0;
    next[ROWS - 1] = garbageRow;

    return { field: next, gameOver };
}

/** Generate a random piece type. */
export function randomPieceType(): PieceType {
    const types: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
    return types[Math.floor(Math.random() * types.length)];
}

/** Create a new piece at the spawn position (top-center). */
export function spawnPiece(type: PieceType): ActivePiece {
    return {
        type,
        rotation: 0,
        row: 0,
        col: Math.floor((COLS - 2) / 2), // roughly centered
    };
}

/** Count how many cells in the field are filled. */
export function countFilledCells(field: FieldGrid): number {
    let count = 0;
    for (const row of field) {
        for (const cell of row) {
            if (cell !== 0) count++;
        }
    }
    return count;
}
