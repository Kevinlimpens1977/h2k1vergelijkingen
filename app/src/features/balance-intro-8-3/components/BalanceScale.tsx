/**
 * BalanceScale — SVG visual balance with tilt animation.
 *
 * Visual design based on the reference image:
 *   - Left plate: blue "X" balls for variable terms, small blue "1" balls for constants
 *   - Right plate: pink/red "1" balls for constant terms
 *   - Realistic balance with fulcrum triangle, beam, chains, and plates
 *   - Equation shown below the balance in color-coded notation
 */
import React, { useMemo } from 'react';
import { exprToString } from '../engine/equationEngine';
import type { Expression } from '../engine/equationEngine';

interface BalanceScaleProps {
    leftExpr: Expression;
    rightExpr: Expression;
    variable: string;
    tiltAngle: number;        // -15..0..+15
    wobble?: boolean;
}

// ── Ball layout helpers ──

function arrangeCircles(count: number, cx: number, plateY: number, radius: number): { x: number; y: number }[] {
    if (count === 0) return [];
    const positions: { x: number; y: number }[] = [];
    const spacing = radius * 2.2;

    // Stack balls in rows of max 5 from bottom up (like the image)
    let remaining = count;
    let row = 0;
    while (remaining > 0) {
        const rowCount = Math.min(remaining, 5);
        const rowWidth = (rowCount - 1) * spacing;
        const rowStartX = cx - rowWidth / 2;
        const y = plateY - radius - 2 - row * (radius * 2.1);
        for (let c = 0; c < rowCount; c++) {
            positions.push({ x: rowStartX + c * spacing, y });
        }
        remaining -= rowCount;
        row++;
    }
    return positions;
}

export default function BalanceScale({ leftExpr, rightExpr, variable, tiltAngle, wobble }: BalanceScaleProps) {
    const leftLabel = useMemo(() => exprToString(leftExpr, variable), [leftExpr, variable]);
    const rightLabel = useMemo(() => exprToString(rightExpr, variable), [rightExpr, variable]);

    // Dimensions
    const cx = 250;
    const pivotY = 90;
    const beamHalf = 155;
    const chainLen = 45;

    // Tilt calculations
    const rad = (tiltAngle * Math.PI) / 180;
    const leftX = cx - beamHalf;
    const rightX = cx + beamHalf;
    const leftDY = Math.sin(rad) * beamHalf;
    const rightDY = -Math.sin(rad) * beamHalf;
    const leftPlateY = pivotY + chainLen + leftDY;
    const rightPlateY = pivotY + chainLen + rightDY;

    const ballR = 16;

    // Left side: variable balls + constant balls
    const varCount = Math.abs(leftExpr.coeff);
    const leftConst = Math.abs(leftExpr.constant);
    const leftConstPositive = leftExpr.constant >= 0;

    // Right side: variable balls (if any) + constant balls
    const rightVarCount = Math.abs(rightExpr.coeff);
    const rightConst = Math.abs(rightExpr.constant);

    // Arrange balls
    const leftVarBalls = arrangeCircles(varCount, leftX - (leftConst > 0 ? 25 : 0), leftPlateY, ballR);
    const leftConstBalls = arrangeCircles(Math.min(leftConst, 12), leftX + (varCount > 0 ? 30 : 0), leftPlateY, ballR * 0.7);
    const rightVarBalls = arrangeCircles(rightVarCount, rightX - (rightConst > 0 ? 25 : 0), rightPlateY, ballR);
    const rightConstBalls = arrangeCircles(Math.min(rightConst, 15), rightX + (rightVarCount > 0 ? 30 : 0), rightPlateY, ballR * 0.8);

    return (
        <div className={`bi-scale-container ${wobble ? 'bi-scale-wobble' : ''}`}>
            <svg viewBox="0 0 500 280" className="bi-scale-svg" style={{ '--tilt': `${tiltAngle}deg` } as React.CSSProperties}>

                {/* ── Base / Stand ── */}
                <rect x={cx - 8} y={pivotY + 25} width={16} height={55} rx={3} fill="#999" stroke="#888" strokeWidth={1} />
                <rect x={cx - 38} y={pivotY + 76} width={76} height={10} rx={5} fill="#aaa" stroke="#999" strokeWidth={1} />

                {/* ── Fulcrum triangle ── */}
                <polygon
                    points={`${cx},${pivotY - 8} ${cx - 18},${pivotY + 25} ${cx + 18},${pivotY + 25}`}
                    fill="#bbb"
                    stroke="#999"
                    strokeWidth={1.5}
                />

                {/* ── Dial arc (decorative) ── */}
                <path
                    d={`M ${cx - 35} ${pivotY + 45} A 35 35 0 0 1 ${cx + 35} ${pivotY + 45}`}
                    fill="none"
                    stroke="#ddd"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                />
                {/* Dial needle */}
                <line
                    x1={cx}
                    y1={pivotY + 45}
                    x2={cx + Math.sin(rad) * 20}
                    y2={pivotY + 45 - Math.cos(rad) * 20}
                    stroke="#c0392b"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                />
                <circle cx={cx} cy={pivotY + 45} r={3} fill="#c0392b" />

                {/* ── Beam ── */}
                <g
                    className="bi-scale-beam"
                    style={{ transform: `rotate(${tiltAngle}deg)` }}
                >
                    <line
                        x1={leftX}
                        y1={pivotY}
                        x2={rightX}
                        y2={pivotY}
                        stroke="#888"
                        strokeWidth={4}
                        strokeLinecap="round"
                    />
                    <circle cx={cx} cy={pivotY} r={6} fill="#aaa" stroke="#888" strokeWidth={1.5} />
                </g>

                {/* ── Left chains ── */}
                <line x1={leftX} y1={pivotY + leftDY} x2={leftX - 40} y2={leftPlateY} stroke="#888" strokeWidth={1.5} />
                <line x1={leftX} y1={pivotY + leftDY} x2={leftX + 40} y2={leftPlateY} stroke="#888" strokeWidth={1.5} />

                {/* ── Left plate ── */}
                <ellipse cx={leftX} cy={leftPlateY + 3} rx={65} ry={6} fill="#ccc" stroke="#aaa" strokeWidth={1} />
                <rect x={leftX - 62} y={leftPlateY - 2} width={124} height={5} rx={2} fill="#ddd" stroke="#bbb" strokeWidth={1} />

                {/* ── Left variable balls (blue X balls) ── */}
                {leftVarBalls.map((pos, i) => (
                    <g key={`lv-${i}`}>
                        <circle cx={pos.x} cy={pos.y} r={ballR} fill="#5b9bd5" stroke="#3a7cc0" strokeWidth={2} />
                        <text
                            x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
                            fill="#1a3a5c" fontWeight={900} fontSize={15} fontFamily="Inter, system-ui, sans-serif"
                        >X</text>
                    </g>
                ))}

                {/* ── Left constant balls (same pink/salmon as right side) ── */}
                {leftConstBalls.map((pos, i) => (
                    <g key={`lc-${i}`}>
                        <circle
                            cx={pos.x} cy={pos.y} r={ballR * 0.7}
                            fill={leftConstPositive ? '#f4a0a0' : '#e97070'}
                            stroke={leftConstPositive ? '#d97777' : '#c0392b'}
                            strokeWidth={1.5}
                        />
                        <text
                            x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
                            fill={leftConstPositive ? '#7a2222' : '#fff'}
                            fontWeight={800} fontSize={11} fontFamily="Inter, system-ui, sans-serif"
                        >{leftConstPositive ? '1' : '−1'}</text>
                    </g>
                ))}

                {/* ── Right chains ── */}
                <line x1={rightX} y1={pivotY + rightDY} x2={rightX - 40} y2={rightPlateY} stroke="#888" strokeWidth={1.5} />
                <line x1={rightX} y1={pivotY + rightDY} x2={rightX + 40} y2={rightPlateY} stroke="#888" strokeWidth={1.5} />

                {/* ── Right plate ── */}
                <ellipse cx={rightX} cy={rightPlateY + 3} rx={65} ry={6} fill="#ccc" stroke="#aaa" strokeWidth={1} />
                <rect x={rightX - 62} y={rightPlateY - 2} width={124} height={5} rx={2} fill="#ddd" stroke="#bbb" strokeWidth={1} />

                {/* ── Right variable balls (blue X balls - if right side has variables) ── */}
                {rightVarBalls.map((pos, i) => (
                    <g key={`rv-${i}`}>
                        <circle cx={pos.x} cy={pos.y} r={ballR} fill="#5b9bd5" stroke="#3a7cc0" strokeWidth={2} />
                        <text
                            x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
                            fill="#1a3a5c" fontWeight={900} fontSize={15} fontFamily="Inter, system-ui, sans-serif"
                        >X</text>
                    </g>
                ))}

                {/* ── Right constant balls (pink/red 1-balls) ── */}
                {rightConstBalls.map((pos, i) => (
                    <g key={`rc-${i}`}>
                        <circle
                            cx={pos.x} cy={pos.y} r={ballR * 0.8}
                            fill="#f4a0a0"
                            stroke="#d97777"
                            strokeWidth={1.5}
                        />
                        <text
                            x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
                            fill="#7a2222" fontWeight={800} fontSize={12} fontFamily="Inter, system-ui, sans-serif"
                        >1</text>
                    </g>
                ))}

                {/* ── Equation below (color-coded) ── */}
                <text
                    x={leftX} y={leftPlateY + 28}
                    textAnchor="middle" fill="#4d9eff"
                    fontWeight={800} fontSize={22}
                    fontFamily="Inter, system-ui, sans-serif"
                >{leftLabel}</text>

                <text
                    x={cx} y={Math.max(leftPlateY, rightPlateY) + 28}
                    textAnchor="middle" fill="rgba(255,255,255,0.4)"
                    fontWeight={800} fontSize={26}
                    fontFamily="Inter, system-ui, sans-serif"
                >=</text>

                <text
                    x={rightX} y={rightPlateY + 28}
                    textAnchor="middle" fill="#4d9eff"
                    fontWeight={800} fontSize={22}
                    fontFamily="Inter, system-ui, sans-serif"
                >{rightLabel}</text>

            </svg>
        </div>
    );
}
