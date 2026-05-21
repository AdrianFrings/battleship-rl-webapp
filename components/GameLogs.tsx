/* components/GameLogs.tsx */

import React, { useRef, useEffect } from 'react';
import styles from '../app/page.module.css';
import { Activity } from 'lucide-react';

export interface LogEntry {
  id: string;
  text: string;
  type: 'hit' | 'miss' | 'sunk' | 'info' | '';
}

interface GameLogsProps {
  playerLogs: LogEntry[];
  agentLogs: LogEntry[];
}

export default function GameLogs({ playerLogs, agentLogs }: GameLogsProps) {
  const playerEndRef = useRef<HTMLDivElement>(null);
  const agentEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when a new action is prepended
  useEffect(() => {
    // Actions are prepended, so the newest is at the top. No need to scroll down.
  }, [playerLogs, agentLogs]);

  const getLogClass = (type: string) => {
    switch (type) {
      case 'info':
        return styles.logItemInfo;
      case 'hit':
        return styles.logItemHit;
      case 'miss':
        return styles.logItemMiss;
      case 'sunk':
        return styles.logItemSunk;
      default:
        return '';
    }
  };

  return (
    <div className={`${styles.card} ${styles.logPanel}`}>
      <h2 className={styles.cardTitle}>
        <Activity size={20} />
        Live Operational Logs
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
        
        {/* Your Actions Column */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--navy-primary)', marginBottom: '0.5rem' }}>
            Your Offense
          </h3>
          <ul className={styles.logList}>
            {playerLogs.length === 0 ? (
              <li style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.75rem', padding: '0.5rem 0' }}>
                Awaiting firing orders...
              </li>
            ) : (
              playerLogs.map((log) => (
                <li key={log.id} className={`${styles.logItem} ${getLogClass(log.type)}`}>
                  {log.text}
                </li>
              ))
            )}
            <div ref={playerEndRef} />
          </ul>
        </div>

        {/* Agent Actions Column */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--state-hit)', marginBottom: '0.5rem' }}>
            AI Offense
          </h3>
          <ul className={styles.logList}>
            {agentLogs.length === 0 ? (
              <li style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.75rem', padding: '0.5rem 0' }}>
                Awaiting enemy radar...
              </li>
            ) : (
              agentLogs.map((log) => (
                <li key={log.id} className={`${styles.logItem} ${getLogClass(log.type)}`}>
                  {log.text}
                </li>
              ))
            )}
            <div ref={agentEndRef} />
          </ul>
        </div>

      </div>
    </div>
  );
}
