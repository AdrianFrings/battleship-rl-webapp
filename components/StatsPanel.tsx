/* components/StatsPanel.tsx */

import React from 'react';
import styles from '../app/page.module.css';
import { Shield, Target } from 'lucide-react';

interface Score {
  sunk: number;
  hit: number;
}

interface StatsPanelProps {
  playerScore: Score;
  agentScore: Score;
}

export default function StatsPanel({ playerScore, agentScore }: StatsPanelProps) {
  // Accuracy = hits / (hits + misses) if we track it. But from backend we get 'sunk' and 'hit' counts out of 5 ships.
  // Hit count is the number of cells successfully hit. Sunk is the number of complete ships sunk.
  const TOTAL_SHIPS = 5;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Target size={20} />
        Battle Intelligence
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Your Fleet Status */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--navy-primary)' }}>Your Fleet Integrity</span>
            <span>{TOTAL_SHIPS - agentScore.sunk} / {TOTAL_SHIPS} Active</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                backgroundColor: 'var(--state-ship)', 
                width: `${((TOTAL_SHIPS - agentScore.sunk) / TOTAL_SHIPS) * 100}%`,
                transition: 'width 0.3s ease-in-out'
              }} 
            />
          </div>
        </div>

        {/* Enemy Fleet Status */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--state-hit)' }}>Enemy Fleet Sunk</span>
            <span>{playerScore.sunk} / {TOTAL_SHIPS} Confirmed</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                backgroundColor: 'var(--state-hit)', 
                width: `${(playerScore.sunk / TOTAL_SHIPS) * 100}%`,
                transition: 'width 0.3s ease-in-out'
              }} 
            />
          </div>
        </div>

        {/* Accuracy and cell hits */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ backgroundColor: 'var(--bg-ocean)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, uppercase: 'true' }}>YOUR HITS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-primary)' }}>{playerScore.hit}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-ocean)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, uppercase: 'true' }}>ENEMY HITS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--state-hit)' }}>{agentScore.hit}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
