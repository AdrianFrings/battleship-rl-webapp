/* components/SetupStage.tsx */

import React, { useState } from 'react';
import styles from '../app/page.module.css';
import { Anchor, Settings, Zap } from 'lucide-react';

interface SetupStageProps {
  onStart: (config: {
    apiUrl: string;
    agent: string;
    placementMode: string;
    placementMethod: string;
  }) => void;
  isLoading: boolean;
}

export default function SetupStage({ onStart, isLoading }: SetupStageProps) {
  const [apiUrl, setApiUrl] = useState('http://localhost:8080');
  const [agent, setAgent] = useState('q-agent');
  const [placementMode, setPlacementMode] = useState('manual');
  const [placementMethod, setPlacementMethod] = useState('random');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      apiUrl: apiUrl.trim().replace(/\/$/, ''), // remove trailing slashes
      agent,
      placementMode,
      placementMethod
    });
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Settings size={20} className={styles.icon} />
        Battle Fleet Setup
      </h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.setupGrid}>
          {/* API Server URL */}
          <div className={styles.formGroup}>
            <label htmlFor="apiUrl">FastAPI Backend Server</label>
            <input
              id="apiUrl"
              type="text"
              className={styles.input}
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g., https://battleship-service-x.a.run.app"
              required
            />
          </div>

          {/* AI Opponent Agent */}
          <div className={styles.formGroup}>
            <label htmlFor="agent">Opponent AI Type</label>
            <select
              id="agent"
              className={styles.select}
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
            >
              <option value="q-agent">Q-Learning Agent (DQN)</option>
              <option value="bayes">Bayesian Probability Agent</option>
              <option value="hunt">Standard Hunt-Target Agent</option>
              <option value="random">Random Target Agent</option>
            </select>
          </div>

          {/* AI Fleet Placement Method */}
          <div className={styles.formGroup}>
            <label htmlFor="placementMethod">AI Placement Algorithm</label>
            <select
              id="placementMethod"
              className={styles.select}
              value={placementMethod}
              onChange={(e) => setPlacementMethod(e.target.value)}
            >
              <option value="random">Pure Random Fleet</option>
              <option value="dense_center">Dense Center Bias</option>
              <option value="edges">Perimeter Edge Bias</option>
              <option value="corners">Corner Fortification Bias</option>
              <option value="spread">Hyper-Dispersion (Spread)</option>
              <option value="clustered">Tightly Clustered</option>
              <option value="diagonal">Main Diagonal Alignment</option>
              <option value="gaussian">Gaussian Distribution Bias</option>
              <option value="quadrant">Quadrant Bias</option>
            </select>
          </div>

          {/* Player Fleet Placement Mode */}
          <div className={styles.formGroup}>
            <label htmlFor="placementMode">Your Fleet Placement</label>
            <select
              id="placementMode"
              className={styles.select}
              value={placementMode}
              onChange={(e) => setPlacementMode(e.target.value)}
            >
              <option value="manual">Manual Deployment (Tactical Placement)</option>
              <option value="random">Auto-Random Deployment (Quick Start)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className={styles.btn}
          disabled={isLoading}
        >
          {isLoading ? (
            <>Deploying Fleet...</>
          ) : (
            <>
              <Zap size={18} />
              Launch Battle Mission
            </>
          )}
        </button>
      </form>
    </div>
  );
}
