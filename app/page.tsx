/* app/page.tsx */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import SetupStage from '../components/SetupStage';
import PlacementStage from '../components/PlacementStage';
import GameBoard from '../components/GameBoard';
import StatsPanel from '../components/StatsPanel';
import GameLogs, { LogEntry } from '../components/GameLogs';
import { Shield, RefreshCw, AlertCircle, Home as HomeIcon } from 'lucide-react';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const getSunkShipsFromBoard = (board: string[][] | null): Set<string> => {
  const sunk = new Set<string>();
  if (!board) return sunk;
  
  const hits: Record<string, number> = {
    CARRIER: 0,
    BATTLESHIP: 0,
    DESTROYER: 0,
    SUBMARINE: 0,
    PATROL_BOAT: 0,
  };

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cellData = board[r][c] || 'NONE:EMPTY';
      const [shipType, state] = cellData.split(':');
      if (state === 'HIT' && shipType in hits) {
        hits[shipType]++;
      }
    }
  }

  if (hits.CARRIER === 5) sunk.add('CARRIER');
  if (hits.BATTLESHIP === 4) sunk.add('BATTLESHIP');
  if (hits.DESTROYER === 3) sunk.add('DESTROYER');
  if (hits.SUBMARINE === 3) sunk.add('SUBMARINE');
  if (hits.PATROL_BOAT === 2) sunk.add('PATROL_BOAT');

  return sunk;
};

export default function Home() {
  // Game state
  const [gameState, setGameState] = useState<'setup' | 'placement' | 'active' | 'game_over'>('setup');
  const [apiUrl, setApiUrl] = useState('http://localhost:8080');
  const [gameId, setGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // WebSocket
  const socketRef = useRef<WebSocket | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  // Board Data
  const [yourBoard, setYourBoard] = useState<string[][] | null>(null);
  const [enemyBoard, setEnemyBoard] = useState<string[][] | null>(null);

  // Scores & Turn State
  const [myTurn, setMyTurn] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [playerScore, setPlayerScore] = useState({ sunk: 0, hit: 0 });
  const [agentScore, setAgentScore] = useState({ sunk: 0, hit: 0 });
  const [sunkShips, setSunkShips] = useState<{ p: Set<string>; a: Set<string> }>({
    p: new Set(),
    a: new Set(),
  });

  // Action Logs
  const [playerLogs, setPlayerLogs] = useState<LogEntry[]>([]);
  const [agentLogs, setAgentLogs] = useState<LogEntry[]>([]);

  // Manual placement parameters
  const [placingShip, setPlacingShip] = useState<string | null>(null);
  const [placingSize, setPlacingSize] = useState(0);
  const [placeDirection, setPlaceDirection] = useState<'right' | 'down'>('right');
  const [placementHoverCells, setPlacementHoverCells] = useState<{ r: number; c: number }[]>([]);
  const lastPlacementRef = useRef<{ r: number; c: number; dir: 'right' | 'down'; size: number } | null>(null);

  // Player callsign and Opponent tracking
  const [nickname, setNickname] = useState('');
  const nicknameRef = useRef(nickname);
  nicknameRef.current = nickname;

  const [opponentAgent, setOpponentAgent] = useState('q-agent');
  const opponentAgentRef = useRef(opponentAgent);
  opponentAgentRef.current = opponentAgent;

  // GameState ref to avoid stale closures in WS close handler
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Create refs to avoid stale closures in WebSocket event listeners
  const yourBoardRef = useRef<string[][] | null>(null);
  yourBoardRef.current = yourBoard;
  const placingShipRef = useRef<string | null>(null);
  placingShipRef.current = placingShip;
  const enemyBoardRef = useRef<string[][] | null>(null);
  enemyBoardRef.current = enemyBoard;

  // End game stats
  const [winner, setWinner] = useState<string | null>(null);
  const [totalTurns, setTotalTurns] = useState(0);

  // Screen shake and UI toasts
  const [isShaking, setIsShaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sound/Vibe triggers
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const triggerScreenShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  // Convert HTTP to WS/WSS
  const convertToWsUrl = (httpUrl: string, gid: string) => {
    const base = httpUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    return `${base}/games/${gid}/ws`;
  };

  const addLog = (text: string, type: 'hit' | 'miss' | 'sunk' | 'info' | '', owner: 'player' | 'agent') => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
    };
    if (owner === 'player') {
      setPlayerLogs(prev => [newEntry, ...prev.slice(0, 19)]);
    } else {
      setAgentLogs(prev => [newEntry, ...prev.slice(0, 19)]);
    }
  };

  // Clean and reset client state
  const resetGameEngine = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    gameStateRef.current = 'setup';
    setGameState('setup');
    setGameId(null);
    setYourBoard(null);
    setEnemyBoard(null);
    setMyTurn(false);
    setTurnCount(0);
    setPlayerScore({ sunk: 0, hit: 0 });
    setAgentScore({ sunk: 0, hit: 0 });
    setSunkShips({ p: new Set(), a: new Set() });
    setPlayerLogs([]);
    setAgentLogs([]);
    setPlacingShip(null);
    setPlacingSize(0);
    setPlaceDirection('right');
    setPlacementHoverCells([]);
    lastPlacementRef.current = null;
    setWinner(null);
    setTotalTurns(0);
    setErrorMessage(null);
  };

  // Handle game creation REST request
  const handleLaunchGame = async (config: {
    apiUrl: string;
    agent: string;
    placementMode: string;
    placementMethod: string;
    nickname: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setApiUrl(config.apiUrl);
    setNickname(config.nickname);
    setOpponentAgent(config.agent);

    try {
      const response = await fetch(`${config.apiUrl}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: config.agent,
          player_placement: config.placementMode,
          player_placement_method: config.placementMethod,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      setGameId(data.game_id);
      
      // Open WebSocket connection
      const wsUrl = convertToWsUrl(config.apiUrl, data.game_id);
      connectWebSocket(wsUrl, data.game_id);

    } catch (err: any) {
      console.error("Failed to post /games:", err);
      setErrorMessage(`Connection Error: ${err.message || 'Could not reach the FastAPI backend server.'}`);
      setIsLoading(false);
    }
  };

  // WebSocket Connection
  const connectWebSocket = (wsUrl: string, gid: string) => {
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsWsConnected(true);
      setIsLoading(false);
      // Client handshake
      ws.send(JSON.stringify({ type: "hello", role: "player" }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("WS Received:", msg);

      switch (msg.type) {
        case "welcome":
          addLog("Connected to tactical battle server.", "info", "player");
          addLog("AI Opponent online & scanning.", "info", "agent");
          break;

        case "place_ship":
          gameStateRef.current = 'placement';
          setGameState('placement');
          setPlacingShip(msg.ship);
          setPlacingSize(msg.size);
          setPlacementHoverCells([]);
          break;

        case "placement_ack":
          if (msg.valid) {
            const currentShip = placingShipRef.current || 'ship';
            addLog(`Deployed ship: ${currentShip}`, "info", "player");
            
            // Color ship locally for feedback before game_start
            const currentBoard = yourBoardRef.current;
            if (lastPlacementRef.current && currentBoard) {
              const { r, c, dir, size } = lastPlacementRef.current;
              const updatedBoard = currentBoard.map(row => [...row]); // Deep copy of rows
              for (let i = 0; i < size; i++) {
                const row = dir === 'down' ? r + i : r;
                const col = dir === 'right' ? c + i : c;
                if (row < 10 && col < 10) {
                  updatedBoard[row][col] = `${currentShip}:EMPTY`;
                }
              }
              setYourBoard(updatedBoard);
            }
            
            setPlacingShip(null);
            setPlacementHoverCells([]);
            lastPlacementRef.current = null;
          } else {
            addLog(`Invalid position: ${msg.error}`, "hit", "player");
          }
          break;

        case "game_start":
          setPlacingShip(null);
          gameStateRef.current = 'active';
          setGameState('active');
          addLog("All battle fleets deployed! Mission active.", "info", "player");
          addLog("AI opponent fleet deployed in fog of war.", "info", "agent");
          if (msg.your_board) {
            setYourBoard(msg.your_board);
          }
          // Initialize empty enemy board
          setEnemyBoard(Array(10).fill(null).map(() => Array(10).fill('NONE:EMPTY')));
          break;

        case "player_view":
          gameStateRef.current = 'active';
          setGameState('active');
          setMyTurn(true);
          setTurnCount(msg.turn);
          if (msg.enemy_board) setEnemyBoard(msg.enemy_board);
          if (msg.your_board) setYourBoard(msg.your_board);
          if (msg.ships_sunk) {
            setPlayerScore(prev => ({ ...prev, sunk: msg.ships_sunk.by_you }));
            setAgentScore(prev => ({ ...prev, sunk: msg.ships_sunk.against_you }));
          }
          break;

        case "move_ack":
          const hitSuccess = msg.result === "HIT";
          let typeVal: 'hit' | 'miss' | 'sunk' = hitSuccess ? 'hit' : 'miss';
          let logTxt = `Targeted ${msg.coordinate}: ${msg.result}`;
          
          if (msg.ship_sunk) {
            logTxt += ` (SUNK opponent's ${msg.ship_sunk}!)`;
            typeVal = 'sunk';
          } else if (msg.ship_hit) {
            logTxt += ` (Hit ${msg.ship_hit})`;
          }
          
          addLog(logTxt, typeVal, "player");
          setMyTurn(false);
          break;

        case "ship_sunk":
          const isPlayer = msg.attacker === "player";
          const side = isPlayer ? 'a' : 'p';
          
          setSunkShips(prev => {
            const updated = new Set(prev[side]);
            updated.add(msg.ship);
            return {
              ...prev,
              [side]: updated,
            };
          });

          const targetLabel = isPlayer ? "enemy's" : "your";
          const subjectLabel = isPlayer ? "You" : "AI opponent";
          triggerToast(`💥 ${subjectLabel} sunk ${targetLabel} ${msg.ship}!`);
          if (!isPlayer) {
            addLog(`CRITICAL: AI sunk your ${msg.ship}!`, "sunk", "agent");
          }
          triggerScreenShake();
          break;

        case "game_state":
          if (msg.player_board) {
            setYourBoard(msg.player_board.cells);
            setAgentScore({
              sunk: msg.player_board.ships_sunk,
              hit: msg.player_board.cells_hit
            });
          }
          if (msg.agent_board) {
            setEnemyBoard(msg.agent_board.cells);
            setPlayerScore({
              sunk: msg.agent_board.ships_sunk,
              hit: msg.agent_board.cells_hit
            });
          }

          // Opponent logs
          if (msg.last_move && msg.last_move.player === "agent") {
            const lm = msg.last_move;
            const hitAgent = lm.result === "HIT";
            let aType: 'hit' | 'miss' | 'sunk' = hitAgent ? 'hit' : 'miss';
            let aLog = `AI targeted ${lm.coordinate}: ${lm.result}`;
            
            if (lm.ship_sunk) {
              aLog += ` (SUNK your ${lm.ship_sunk}!)`;
              aType = 'sunk';
            } else if (lm.ship_hit) {
              aLog += ` (Hit your ${lm.ship_hit})`;
            }
            
            addLog(aLog, aType, "agent");
            if (hitAgent) {
              triggerScreenShake();
            }
          }
          break;

        case "game_over":
          gameStateRef.current = 'game_over';
          setGameState('game_over');
          setWinner(msg.winner);
          setTotalTurns(msg.total_turns);
          if (msg.scores) {
            setPlayerScore({
              sunk: msg.scores.player.ships_sunk,
              hit: msg.scores.player.cells_hit
            });
            setAgentScore({
              sunk: msg.scores.agent.ships_sunk,
              hit: msg.scores.agent.cells_hit
            });
          }
          // Register highscore in localStorage if player wins!
          if (msg.winner === "player") {
            try {
              const key = 'battleship_highscores';
              const stored = localStorage.getItem(key);
              const records = stored ? JSON.parse(stored) : [];
              records.push({
                name: nicknameRef.current || 'Commander',
                turns: msg.total_turns,
                agent: opponentAgentRef.current || 'q-agent',
                date: new Date().toLocaleDateString(),
              });
              // Sort ascending by turns (fewer turns is better)
              records.sort((a: any, b: any) => a.turns - b.turns);
              // Save only top 25 records
              localStorage.setItem(key, JSON.stringify(records.slice(0, 25)));
            } catch (e) {
              console.error("Failed to register combat record highscore", e);
            }
          }
          break;
      }
    };

    ws.onclose = () => {
      setIsWsConnected(false);
      setIsLoading(false);
      addLog("Disconnected from operational grid.", "hit", "player");
      if (gameStateRef.current !== 'game_over') {
        setErrorMessage("Disconnected from operational grid. The connection to the Battleship RL server was closed.");
      }
    };

    ws.onerror = (error) => {
      console.error("WS Connection Error:", error);
      setErrorMessage("Network Failure: Server connection lost or refused.");
      setIsLoading(false);
    };
  };

  // Board actions
  const handleCellClick = (coordinate: string) => {
    if (!myTurn || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const rowChar = coordinate.charAt(0);
    const colStr = coordinate.substring(1);
    const r = ROWS.indexOf(rowChar);
    const c = parseInt(colStr, 10) - 1;

    const currentEnemyBoard = enemyBoardRef.current;
    if (currentEnemyBoard && currentEnemyBoard[r] && currentEnemyBoard[r][c]) {
      const [ship, state] = currentEnemyBoard[r][c].split(':');
      if (state !== 'EMPTY') {
        // Cell already targeted, ignore click
        return;
      }
    }

    // Set firing visual feedback immediately
    if (currentEnemyBoard) {
      const updatedEnemy = currentEnemyBoard.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? 'NONE:FIRING' : cell))
      );
      setEnemyBoard(updatedEnemy);
    }

    // Lock board immediately by setting myTurn to false to prevent multiple firing clicks
    setMyTurn(false);

    // Send targeted coordinate to operational server
    socketRef.current.send(JSON.stringify({ type: "move", coordinate }));
  };

  const handlePlayerCellClick = (coordinate: string, r: number, c: number) => {
    if (gameState !== 'placement' || !placingShip || !socketRef.current) return;
    
    // Check bounds
    const endRow = placeDirection === 'down' ? r + placingSize - 1 : r;
    const endCol = placeDirection === 'right' ? c + placingSize - 1 : c;
    if (endRow >= 10 || endCol >= 10) {
      addLog("Ship placement exceeds tactical board boundaries.", "hit", "player");
      return;
    }

    lastPlacementRef.current = { r, c, dir: placeDirection, size: placingSize };
    socketRef.current.send(JSON.stringify({
      type: "placement",
      coordinate,
      direction: placeDirection,
    }));
  };

  const handleMouseEnterCell = (r: number, c: number) => {
    if (gameState !== 'placement' || !placingShip) return;
    const cells = [];
    for (let i = 0; i < placingSize; i++) {
      const row = placeDirection === 'down' ? r + i : r;
      const col = placeDirection === 'right' ? c + i : c;
      if (row < 10 && col < 10) {
        cells.push({ r: row, c: col });
      }
    }
    setPlacementHoverCells(cells);
  };

  const handleMouseLeaveCell = () => {
    setPlacementHoverCells([]);
  };

  const toggleDirection = () => {
    setPlaceDirection(prev => prev === 'right' ? 'down' : 'right');
  };

  // Keyboard rotation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        toggleDirection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync initial board before placing
  useEffect(() => {
    if (gameState === 'placement' && !yourBoard) {
      setYourBoard(Array(10).fill(null).map(() => Array(10).fill('NONE:EMPTY')));
    }
  }, [gameState, yourBoard]);

  // Derived sets of sunk ships to ensure UI consistency
  const derivedYourSunk = getSunkShipsFromBoard(yourBoard);
  const derivedEnemySunk = getSunkShipsFromBoard(enemyBoard);

  const mergedSunkShips = {
    p: new Set([...Array.from(sunkShips.p), ...Array.from(derivedYourSunk)]),
    a: new Set([...Array.from(sunkShips.a), ...Array.from(derivedEnemySunk)]),
  };

  return (
    <div className={`${styles.container} ${isShaking ? 'shake' : ''}`}>
      {/* Title Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Shield size={24} />
          Battleship <span>RL</span>
        </h1>
        <div className={styles.statusIndicator}>
          <span 
            className={`${styles.dot} ${
              isWsConnected ? styles.dotConnected : styles.dotDisconnected
            }`} 
          />
          {isWsConnected ? 'Radar Active' : 'Disconnected'}
        </div>
      </header>

      {/* Error Message banner */}
      {errorMessage && (
        <div 
          className={styles.card} 
          style={{ 
            backgroundColor: '#fee2e2', 
            border: '1px solid #f87171', 
            color: '#991b1b', 
            padding: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            fontWeight: 600
          }}
        >
          <AlertCircle size={20} />
          <div>{errorMessage}</div>
          <button 
            onClick={() => setErrorMessage(null)} 
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* SETUP / PLAYING AREAS */}
      {gameState === 'setup' && (
        <SetupStage onStart={handleLaunchGame} isLoading={isLoading} />
      )}

      {gameState !== 'setup' && (
        <div className={styles.gameLayout}>
          <div className={styles.battlefield}>
            {/* Turn Banner */}
            <div className={`${styles.turnIndicator} ${myTurn ? styles.turnActive : ''}`}>
              {gameState === 'placement' && placingShip && (
                `Deploying: ${placingShip} (Size: ${placingSize}) | Use R or Right-Click to Rotate`
              )}
              {gameState === 'active' && (
                myTurn ? `Your Turn — Firing Coordinates Active` : `Waiting for Agent Radar Response...`
              )}
              {gameState === 'game_over' && (
                `Operational Session Finished — ${winner === 'player' ? 'YOU WON!' : 'AI AGENT WON'}`
              )}
            </div>

            {/* Boards Grid */}
            <div className={styles.boards}>
              
              {/* Left Board: Player Board */}
              <div className={styles.boardWrapper}>
                <h3 className={styles.boardTitle}>Your Fleet (Ocean Area)</h3>
                <div className={styles.statsBox}>
                  Ships Sunk: <span>{agentScore.sunk} / 5</span>
                  Hits: <span>{agentScore.hit}</span>
                </div>
                <GameBoard
                  board={yourBoard}
                  prefix="p"
                  onPlayerCellClick={gameState === 'placement' ? handlePlayerCellClick : undefined}
                  placementHoverCells={placementHoverCells}
                  onMouseEnterCell={handleMouseEnterCell}
                  onMouseLeaveCell={handleMouseLeaveCell}
                  sunkShips={mergedSunkShips.p}
                />
              </div>

              {/* Right Board: Agent Board */}
              <div className={styles.boardWrapper}>
                <h3 className={styles.boardTitle}>Enemy Waters (Radar Grid)</h3>
                <div className={styles.statsBox}>
                  Ships Sunk: <span>{playerScore.sunk} / 5</span>
                  Hits: <span>{playerScore.hit}</span>
                </div>
                <GameBoard
                  board={enemyBoard}
                  prefix="a"
                  onCellClick={myTurn ? handleCellClick : undefined}
                  sunkShips={mergedSunkShips.a}
                />
              </div>

            </div>
          </div>

          {/* Right sidebar panel for stats & logs */}
          <div className={styles.sidebar}>
            {gameState === 'placement' && placingShip && (
              <PlacementStage
                shipName={placingShip}
                shipSize={placingSize}
                direction={placeDirection}
                onRotate={toggleDirection}
              />
            )}
            
            <StatsPanel 
              playerScore={playerScore} 
              agentScore={agentScore} 
              sunkShips={mergedSunkShips}
            />
            
            <GameLogs 
              playerLogs={playerLogs} 
              agentLogs={agentLogs} 
            />

            <button
              onClick={resetGameEngine}
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ display: 'flex', gap: '0.5rem', width: '100%', padding: '0.6rem' }}
            >
              <HomeIcon size={16} />
              Return to Control Room
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert Popups */}
      {toastMessage && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}

      {/* GAME OVER MODAL OVERLAY */}
      {gameState === 'game_over' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              {winner === 'player' ? '🏆 VICTORY CONFIRMED' : '💀 FLEET DEFEATED'}
            </h2>
            <div className={styles.modalDesc}>
              <p style={{ marginBottom: '1rem', fontWeight: 600 }}>
                {winner === 'player' 
                  ? 'You successfully navigated the operational theater and sank the AI fleet!'
                  : 'The AI successfully identified and eliminated all vessels in your fleet.'
                }
              </p>
              <div style={{ backgroundColor: 'var(--bg-ocean)', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                <p style={{ marginBottom: '0.5rem' }}><strong>Operational Report:</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'left' }}>
                  <div>Total Mission Turns:</div><div style={{ textAlign: 'right', fontWeight: 'bold' }}>{totalTurns}</div>
                  <div>Your Hits Fired:</div><div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--navy-primary)' }}>{playerScore.hit}</div>
                  <div>AI Hits Fired:</div><div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--state-hit)' }}>{agentScore.hit}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={resetGameEngine} 
                className={styles.btn}
                style={{ flex: 1 }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
