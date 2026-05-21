/* components/PlacementStage.tsx */

import React from 'react';
import styles from '../app/page.module.css';
import { RotateCw, Anchor } from 'lucide-react';

interface PlacementStageProps {
  shipName: string;
  shipSize: number;
  direction: 'right' | 'down';
  onRotate: () => void;
}

export default function PlacementStage({
  shipName,
  shipSize,
  direction,
  onRotate,
}: PlacementStageProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Anchor size={20} />
        Manual Ship Deployment
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: varName('--text-secondary'), textAlign: 'center' }}>
          Position your <strong>{shipName}</strong> (Size: {shipSize} cells) on your fleet board.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.25rem' }}>
          <div className={styles.statsBox} style={{ flex: 1, margin: 0, justifyContent: 'center', gap: '0.5rem' }}>
            Current Direction: <span style={{ fontWeight: 'bold', color: 'var(--navy-primary)' }}>{direction.toUpperCase()}</span>
          </div>
          
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ width: 'auto', padding: '0.5rem 1rem' }}
            onClick={onRotate}
            title="Right-click on the grid works too!"
          >
            <RotateCw size={16} />
            Rotate (90°)
          </button>
        </div>
        
        <p style={{ fontSize: '0.75rem', color: varName('--text-secondary'), fontStyle: 'italic', marginTop: '0.25rem' }}>
          * Right-click anywhere on your grid to quickly rotate!
        </p>
      </div>
    </div>
  );
}

// Simple helper to avoid TS syntax checks on dynamic css custom properties
function varName(cssVar: string) {
  return `var(${cssVar})`;
}
