/* components/GameBoard.tsx */

import React from 'react';
import styles from '../app/page.module.css';

interface GameBoardProps {
  board: string[][] | null;
  prefix: 'p' | 'a'; // p = player fleet, a = agent/enemy waters
  onCellClick?: (coordinate: string) => void;
  onPlayerCellClick?: (coordinate: string, r: number, c: number) => void;
  placementHoverCells?: { r: number; c: number }[];
  onMouseEnterCell?: (r: number, c: number) => void;
  onMouseLeaveCell?: () => void;
  sunkShips?: Set<string>;
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function GameBoard({
  board,
  prefix,
  onCellClick,
  onPlayerCellClick,
  placementHoverCells = [],
  onMouseEnterCell,
  onMouseLeaveCell,
  sunkShips = new Set(),
}: GameBoardProps) {
  
  const isHovered = (r: number, c: number) => {
    return placementHoverCells.some(cell => cell.r === r && cell.c === c);
  };

  const handleCellClick = (r: number, c: number) => {
    const coord = `${ROWS[r]}${COLS[c]}`;
    if (prefix === 'a' && onCellClick) {
      onCellClick(coord);
    } else if (prefix === 'p' && onPlayerCellClick) {
      onPlayerCellClick(coord, r, c);
    }
  };

  const cells = [];

  // Top header row: empty cell then 1-10
  cells.push(
    <div key={`${prefix}-header-empty`} className={`${styles.cell} ${styles.cellHeader}`}>
      
    </div>
  );
  COLS.forEach(c => {
    cells.push(
      <div key={`${prefix}-header-${c}`} className={`${styles.cell} ${styles.cellHeader}`}>
        {c}
      </div>
    );
  });

  // 10 Rows
  for (let r = 0; r < 10; r++) {
    // Row Letter Header
    cells.push(
      <div key={`${prefix}-row-header-${r}`} className={`${styles.cell} ${styles.cellHeader}`}>
        {ROWS[r]}
      </div>
    );

    // 10 Column Cells
    for (let c = 0; c < 10; c++) {
      const cellData = board ? board[r][c] : 'NONE:EMPTY';
      const [shipType, state] = cellData.split(':');
      
      let cellClass = `${styles.cell} ${prefix === 'p' ? styles.cellPlayer : styles.cellAgent}`;
      let content = '';

      const isCellPlayable = prefix === 'a' ? !!onCellClick : !!onPlayerCellClick;
      if (state === 'EMPTY') {
        if (isCellPlayable) {
          cellClass += ` ${styles.cellPlayable}`;
        }
        if (shipType !== 'NONE') {
          cellClass += ` ${styles.cellShip}`;
          // Only show ship letters on your own board, not in enemy fog-of-war
          if (prefix === 'p') {
            content = shipType.charAt(0);
          }
        }
      } else if (state === 'HIT') {
        cellClass += ` ${styles.cellHit}`;
        content = '✕';
        if (sunkShips.has(shipType)) {
          cellClass += ` ${styles.cellSunk}`;
          content = '☠'; // Skull icon for sunk vessels!
        }
      } else if (state === 'MISS') {
        cellClass += ` ${styles.cellMiss}`;
        content = '•';
      } else if (state === 'FIRING') {
        cellClass += ` ${styles.cellFiring}`;
        content = '◎';
      }

      // Overlap placement hover if manual ship placing is active
      if (prefix === 'p' && isHovered(r, c)) {
        cellClass += ` ${styles.cellPlacementHover}`;
      }

      cells.push(
        <div
          key={`${prefix}-cell-${r}-${c}`}
          className={cellClass}
          onClick={() => handleCellClick(r, c)}
          onMouseEnter={() => onMouseEnterCell && onMouseEnterCell(r, c)}
          onMouseLeave={() => onMouseLeaveCell && onMouseLeaveCell()}
          onContextMenu={(e) => {
            if (prefix === 'p') {
              e.preventDefault(); // allow right-click rotation without browser menus
            }
          }}
        >
          {content}
        </div>
      );
    }
  }

  return <div className={styles.grid}>{cells}</div>;
}
