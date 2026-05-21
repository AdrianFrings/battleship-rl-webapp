/* components/SetupStage.tsx */

import React, { useState, useEffect } from 'react';
import styles from '../app/page.module.css';
import { Settings, Zap, User, BookOpen, Trophy, BarChart3, HelpCircle } from 'lucide-react';

interface SetupStageProps {
  onStart: (config: {
    apiUrl: string;
    agent: string;
    placementMode: string;
    placementMethod: string;
    nickname: string;
  }) => void;
  isLoading: boolean;
}

interface Highscore {
  name: string;
  agent: string;
  turns: number;
  date: string;
}

const AGENT_LABELS: Record<string, string> = {
  'q-agent': 'DQN (Q-Agent)',
  'bayes': 'Bayesian',
  'hunt': 'Hunt-Target',
  'random': 'Random Bot',
};

export default function SetupStage({ onStart, isLoading }: SetupStageProps) {
  const [apiUrl, setApiUrl] = useState('https://battleship-rl-2fw3ot52dq-uc.a.run.app');
  const [agent, setAgent] = useState('q-agent');
  const [placementMode, setPlacementMode] = useState('manual');
  const [nickname, setNickname] = useState('');
  const [leaderboard, setLeaderboard] = useState<Highscore[]>([]);

  // Load highscores on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('battleship_highscores');
      if (stored) {
        const parsed = JSON.parse(stored) as Highscore[];
        // Sort ascending by turns
        parsed.sort((a, b) => a.turns - b.turns);
        setLeaderboard(parsed.slice(0, 5)); // Keep top 5
      }
    } catch (e) {
      console.error('Failed to load highscores', e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onStart({
      apiUrl: apiUrl.trim().endsWith('/') ? apiUrl.trim().slice(0, -1) : apiUrl.trim(),
      agent,
      placementMode,
      placementMethod: 'random', // AI placement method is forced to random behind the scenes
      nickname: nickname.trim(),
    });
  };



  return (
    <div className={styles.setupContainer}>
      
      {/* Left Column: Command & Configuration */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Settings size={20} />
          Tactical Command Center
        </h2>

        {/* Short Game Explanation */}
        <div className={styles.gameDescBlock}>
          <p style={{ fontWeight: 'bold', color: 'var(--navy-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BookOpen size={16} /> MISSION BRIEFING:
          </p>
          <p>
            Welcome, Officer. Your objective is to deploy your fleet onto the grid coordinates and seek out the enemy fleet.
          </p>
          <p>
            Take turns launching missiles at the enemy radar grid. **Manual deployment** allows custom ship rotations using <strong>R</strong> or **Right-Click** on the board. Default enemy fleet placements are randomly distributed across the ocean. Good hunting.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Nickname Input */}
            <div className={styles.formGroup}>
              <label htmlFor="nickname" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <User size={12} /> Officer Callsign (Nickname)
              </label>
              <input
                id="nickname"
                type="text"
                className={styles.input}
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 16))}
                placeholder="Enter Nickname..."
                maxLength={16}
                required
              />
            </div>

            <div className={styles.setupGrid}>
              {/* AI Opponent Agent */}
              <div className={styles.formGroup}>
                <label htmlFor="agent">Opponent AI Level</label>
                <select
                  id="agent"
                  className={styles.select}
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                >
                  <option value="q-agent">Q-Learning DQN Agent (Elite)</option>
                  <option value="bayes">Biased Bayesian Agent (Hard)</option>
                  <option value="hunt">Hunt-Target Agent (Medium)</option>
                  <option value="random">Random Target Agent (Easy)</option>
                </select>
              </div>

              {/* Player Fleet Placement Mode */}
              <div className={styles.formGroup}>
                <label htmlFor="placementMode">Fleet Placement Strategy</label>
                <select
                  id="placementMode"
                  className={styles.select}
                  value={placementMode}
                  onChange={(e) => setPlacementMode(e.target.value)}
                >
                  <option value="manual">Manual Deployment (Tactical Place)</option>
                  <option value="random">Auto-Random Deployment (Quick Start)</option>
                </select>
              </div>
            </div>



            <button
              type="submit"
              className={styles.btn}
              style={{ marginTop: '0.5rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>Deploying Tactical Network...</>
              ) : (
                <>
                  <Zap size={18} />
                  Launch Firing Mission
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Battle Intelligence & Highscores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Winrate Visualization */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <BarChart3 size={20} />
            Intel: AI Agent Threat Levels
          </h3>
          <div className={styles.winrateContainer}>
            <div className={styles.winrateTitle}>
              <span>Opponent Model</span>
              <span>Estimated Winrate</span>
            </div>
            
            <div className={styles.winrateBarWrapper}>
              {/* DQN */}
              <div className={styles.winrateBarRow}>
                <div className={styles.winrateBarLabel}>Q-Learning (DQN)</div>
                <div className={styles.winrateBarOuter}>
                  <div 
                    className={styles.winrateBarInner} 
                    style={{ width: '22%', backgroundColor: '#dc2626' }} // bright red (hardest)
                  />
                </div>
                <div className={styles.winrateBarValue}>22%</div>
              </div>

              {/* Bayes */}
              <div className={styles.winrateBarRow}>
                <div className={styles.winrateBarLabel}>Bayesian</div>
                <div className={styles.winrateBarOuter}>
                  <div 
                    className={styles.winrateBarInner} 
                    style={{ width: '38%', backgroundColor: '#ea580c' }} // orange (hard)
                  />
                </div>
                <div className={styles.winrateBarValue}>38%</div>
              </div>

              {/* Hunt */}
              <div className={styles.winrateBarRow}>
                <div className={styles.winrateBarLabel}>Hunt-Target</div>
                <div className={styles.winrateBarOuter}>
                  <div 
                    className={styles.winrateBarInner} 
                    style={{ width: '58%', backgroundColor: '#eab308' }} // amber/yellow (medium)
                  />
                </div>
                <div className={styles.winrateBarValue}>58%</div>
              </div>

              {/* Random */}
              <div className={styles.winrateBarRow}>
                <div className={styles.winrateBarLabel}>Random Bot</div>
                <div className={styles.winrateBarOuter}>
                  <div 
                    className={styles.winrateBarInner} 
                    style={{ width: '85%', backgroundColor: '#16a34a' }} // green (easy)
                  />
                </div>
                <div className={styles.winrateBarValue}>85%</div>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
            * Stat matrices compiled from 1,000 simulated human placement games.
          </p>
        </div>

        {/* Highscores Leaderboard */}
        <div className={styles.leaderboardCard}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={20} style={{ color: '#eab308' }} />
              Combat Records (Leaderboard)
            </span>
          </h3>

          {leaderboard.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)', padding: '2rem 0' }}>
              <Trophy size={32} style={{ color: 'var(--border-slate)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>No combat operations registered yet.</p>
              <p style={{ fontSize: '0.7rem' }}>Sank an AI fleet to enter the highscore charts!</p>
            </div>
          ) : (
            <table className={styles.leaderboardTable}>
              <thead>
                <tr>
                  <th className={styles.leaderboardHeader} style={{ width: '40px' }}>Rank</th>
                  <th className={styles.leaderboardHeader}>Commander</th>
                  <th className={styles.leaderboardHeader}>Opponent</th>
                  <th className={styles.leaderboardHeader} style={{ textAlign: 'center', width: '60px' }}>Turns</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={index} className={styles.leaderboardRow}>
                    <td className={`${styles.leaderboardCell} ${styles.leaderboardRank}`}>#{index + 1}</td>
                    <td className={`${styles.leaderboardCell} ${styles.leaderboardName}`}>{row.name}</td>
                    <td className={styles.leaderboardCell} style={{ fontSize: '0.8rem' }}>{AGENT_LABELS[row.agent] || row.agent}</td>
                    <td className={`${styles.leaderboardCell} ${styles.leaderboardTurns}`}>{row.turns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
