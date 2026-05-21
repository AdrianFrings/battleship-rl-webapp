/* components/StatsPanel.tsx */

import React from 'react';
import styles from '../app/page.module.css';
import { Target, Shield, Eye } from 'lucide-react';

interface Score {
  sunk: number;
  hit: number;
}

interface StatsPanelProps {
  playerScore: Score;
  agentScore: Score;
  sunkShips: { p: Set<string>; a: Set<string> };
}

const SHIPS = [
  { key: 'CARRIER', name: 'Carrier', size: 5, char: 'C' },
  { key: 'BATTLESHIP', name: 'Battleship', size: 4, char: 'B' },
  { key: 'DESTROYER', name: 'Destroyer', size: 3, char: 'D' },
  { key: 'SUBMARINE', name: 'Submarine', size: 3, char: 'S' },
  { key: 'PATROL_BOAT', name: 'Patrol Boat', size: 2, char: 'P' },
];

export default function StatsPanel({ playerScore, agentScore, sunkShips }: StatsPanelProps) {
  const TOTAL_SHIPS = 5;

  const playerActiveCount = TOTAL_SHIPS - agentScore.sunk;
  const playerActivePercent = playerActiveCount * 20;
  const playerIntegrityWidth = `${playerActivePercent}%`;

  const enemySunkPercent = playerScore.sunk * 20;
  const enemySunkWidth = `${enemySunkPercent}%`;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Target size={20} />
        Battle Intelligence
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div style={{ border: '1px solid var(--border-slate)', padding: '0.75rem', borderRadius: '6px', backgroundColor: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--navy-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Shield size={14} /> Your Fleet
            </span>
            <span style={{ fontWeight: 'bold' }}>
              {playerActiveCount} of {TOTAL_SHIPS} Active
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div 
              style={{ 
                height: '100%', 
                backgroundColor: 'var(--state-ship)', 
                width: playerIntegrityWidth,
                transition: 'width 0.3s ease-in-out'
              }} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px dashed var(--border-slate)', paddingTop: '0.5rem' }}>
            {SHIPS.map(ship => {
              const isSunk = sunkShips.p.has(ship.key);
              return (
                <div 
                  key={ship.key} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '0.75rem', 
                    color: isSunk ? 'var(--state-sunk)' : 'var(--text-primary)',
                    textDecoration: isSunk ? 'line-through' : 'none', 
                    opacity: isSunk ? 0.65 : 1,
                    alignItems: 'center'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span 
                      style={{ 
                        display: 'inline-block', 
                        width: '14px', 
                        height: '14px', 
                        lineHeight: '14px', 
                        textAlign: 'center', 
                        backgroundColor: isSunk ? 'var(--state-sunk)' : 'var(--state-ship)', 
                        color: '#ffffff', 
                        borderRadius: '2px', 
                        fontSize: '0.65rem', 
                        fontWeight: 'bold' 
                      }}
                    >
                      {ship.char}
                    </span>
                    {ship.name} <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>({ship.size})</span>
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '0.7rem', color: isSunk ? 'var(--state-sunk)' : '#16a34a' }}>
                    {isSunk ? 'SUNK' : 'ACTIVE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-slate)', padding: '0.75rem', borderRadius: '6px', backgroundColor: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--state-hit)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Eye size={14} /> Enemy Fleet
            </span>
            <span style={{ fontWeight: 'bold' }}>
              {playerScore.sunk} of {TOTAL_SHIPS} Sunk
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div 
              style={{ 
                height: '100%', 
                backgroundColor: 'var(--state-hit)', 
                width: enemySunkWidth,
                transition: 'width 0.3s ease-in-out'
              }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px dashed var(--border-slate)', paddingTop: '0.5rem' }}>
            {SHIPS.map(ship => {
              const isSunk = sunkShips.a.has(ship.key);
              return (
                <div 
                  key={ship.key} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '0.75rem', 
                    color: isSunk ? 'var(--state-sunk)' : 'var(--text-primary)',
                    textDecoration: isSunk ? 'line-through' : 'none', 
                    opacity: isSunk ? 0.65 : 1,
                    alignItems: 'center'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span 
                      style={{ 
                        display: 'inline-block', 
                        width: '14px', 
                        height: '14px', 
                        lineHeight: '14px', 
                        textAlign: 'center', 
                        backgroundColor: isSunk ? 'var(--state-sunk)' : '#cbd5e1', 
                        color: isSunk ? '#ffffff' : '#334155', 
                        borderRadius: '2px', 
                        fontSize: '0.65rem', 
                        fontWeight: 'bold' 
                      }}
                    >
                      {ship.char}
                    </span>
                    {ship.name} <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>({ship.size})</span>
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '0.7rem', color: isSunk ? 'var(--state-sunk)' : 'var(--text-secondary)' }}>
                    {isSunk ? 'CONFIRMED SUNK' : 'FOG OF WAR'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ backgroundColor: 'var(--bg-ocean)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--border-slate)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>YOUR HITS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-primary)' }}>{playerScore.hit}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-ocean)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--border-slate)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ENEMY HITS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--state-hit)' }}>{agentScore.hit}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
