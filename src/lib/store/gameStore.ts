/**
 * Game Store — Central state management with Zustand
 * - AI moves run via Web Worker (off-thread)
 * - Player symbol selection (X or O)
 * - Persistent sound/music mute state
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type CellValue,
  type Board,
  type Player,
  type AIDifficulty,
  type GameMode,
  type ScreenType,
  type ThemeName,
  type Achievement,
  type CampaignLevel,
  type TournamentPlayer,
  type TournamentMatch,
  type GameStats,
  ACHIEVEMENTS,
  generateCampaignLevels,
  THEMES,
} from '../game/types';
import { checkWinner, getWinningLine } from '../game/ai';
import { requestAIMove } from '../game/aiWorkerManager';

interface GameState {
  // Screen navigation
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;

  // Game configuration
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  winCondition: number;
  setWinCondition: (wc: number) => void;
  aiDifficulty: AIDifficulty;
  setAIDifficulty: (diff: AIDifficulty) => void;
  timeLimit: number;
  setTimeLimit: (seconds: number) => void;

  // Player symbol choice
  playerSymbol: Player;
  setPlayerSymbol: (symbol: Player) => void;

  // Board state
  board: Board;
  currentPlayer: Player;
  gameActive: boolean;
  winner: 'X' | 'O' | 'draw' | null;
  winningLine: number[] | null;
  moveHistory: { index: number; player: Player }[];

  // Scores
  scores: { X: number; O: number; draws: number };

  // AI
  isAIThinking: boolean;

  // Time attack
  turnStartTime: number;
  timeRemaining: number;

  // Theme & customization
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  xSkin: string;
  setXSkin: (skin: string) => void;
  oSkin: string;
  setOSkin: (skin: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  hapticEnabled: boolean;
  setHapticEnabled: (enabled: boolean) => void;

  // Campaign
  campaignLevels: CampaignLevel[];
  currentCampaignLevel: number;
  setCurrentCampaignLevel: (level: number) => void;
  completeCampaignLevel: (levelId: number, stars: number) => void;
  startCampaignLevel: (levelId: number) => void;

  // Tournament
  tournamentPlayers: TournamentPlayer[];
  setTournamentPlayers: (players: TournamentPlayer[]) => void;
  tournamentMatches: TournamentMatch[];
  setTournamentMatches: (matches: TournamentMatch[]) => void;
  currentTournamentRound: number;
  setCurrentTournamentRound: (round: number) => void;
  currentTournamentMatch: number;
  setCurrentTournamentMatch: (match: number) => void;

  // Stats & achievements
  stats: GameStats;
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  updateStats: (result: 'win' | 'loss' | 'draw') => void;

  // Player names
  player1Name: string;
  setPlayer1Name: (name: string) => void;
  player2Name: string;
  setPlayer2Name: (name: string) => void;

  // Actions
  initGame: () => void;
  makeMove: (index: number) => void;
  undoMove: () => void;
  resetGame: () => void;
  startAITurn: () => void;

  // Move timing
  lastMoveTime: number;
}

const createEmptyBoard = (size: number): Board => Array(size * size).fill(null);

/** Determine if the current player is the AI in single/campaign mode */
function isAITurn(state: GameState): boolean {
  if (state.gameMode !== 'single' && state.gameMode !== 'campaign') return false;
  return state.currentPlayer !== state.playerSymbol;
}

/** Get the AI's symbol (opposite of player symbol) */
function getAISymbol(playerSymbol: Player): Player {
  return playerSymbol === 'X' ? 'O' : 'X';
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Screen
      currentScreen: 'welcome',
      setScreen: (screen) => set({ currentScreen: screen }),

      // Config
      gameMode: 'single',
      setGameMode: (mode) => set({ gameMode: mode }),
      gridSize: 3,
      setGridSize: (size) => set({ gridSize: size }),
      winCondition: 3,
      setWinCondition: (wc) => set({ winCondition: wc }),
      aiDifficulty: 'medium',
      setAIDifficulty: (diff) => set({ aiDifficulty: diff }),
      timeLimit: 0,
      setTimeLimit: (seconds) => set({ timeLimit: seconds }),

      // Player symbol
      playerSymbol: 'X',
      setPlayerSymbol: (symbol) => set({ playerSymbol: symbol }),

      // Board
      board: createEmptyBoard(3),
      currentPlayer: 'X',
      gameActive: false,
      winner: null,
      winningLine: null,
      moveHistory: [],

      // Scores
      scores: { X: 0, O: 0, draws: 0 },

      // AI
      isAIThinking: false,

      // Time attack
      turnStartTime: 0,
      timeRemaining: 0,

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      xSkin: 'default',
      setXSkin: (skin) => set({ xSkin: skin }),
      oSkin: 'default',
      setOSkin: (skin) => set({ oSkin: skin }),
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      hapticEnabled: true,
      setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),

      // Campaign
      campaignLevels: generateCampaignLevels(),
      currentCampaignLevel: 0,
      setCurrentCampaignLevel: (level) => set({ currentCampaignLevel: level }),
      completeCampaignLevel: (levelId, stars) => {
        const levels = [...get().campaignLevels];
        const idx = levels.findIndex((l) => l.id === levelId);
        if (idx !== -1) {
          levels[idx] = { ...levels[idx], completed: true, stars: Math.max(levels[idx].stars, stars) };
        }
        // Explicitly unlock the next level by ensuring this level is marked completed
        // (the isLevelUnlocked check in CampaignMapScreen depends on prevLevel.completed)
        set({ campaignLevels: levels });

        const completedCount = levels.filter((l) => l.completed).length;
        if (completedCount >= 5) get().unlockAchievement('campaign_5');
        if (completedCount >= 15) get().unlockAchievement('campaign_15');
        if (completedCount >= 30) get().unlockAchievement('campaign_30');
      },

      startCampaignLevel: (levelId) => {
        const level = get().campaignLevels.find((l) => l.id === levelId);
        if (!level) return;

        // Atomically set all campaign state in a single batch to avoid race conditions
        set({
          currentCampaignLevel: levelId,
          gridSize: level.gridSize,
          winCondition: level.winCondition,
          gameMode: 'campaign',
          aiDifficulty: level.difficulty,
        });

        get().initGame();
      },

      // Tournament
      tournamentPlayers: [],
      setTournamentPlayers: (players) => set({ tournamentPlayers: players }),
      tournamentMatches: [],
      setTournamentMatches: (matches) => set({ tournamentMatches: matches }),
      currentTournamentRound: 0,
      setCurrentTournamentRound: (round) => set({ currentTournamentRound: round }),
      currentTournamentMatch: 0,
      setCurrentTournamentMatch: (match) => set({ currentTournamentMatch: match }),

      // Stats
      stats: {
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        currentStreak: 0,
        bestStreak: 0,
        avgMoveTime: 0,
        gamesByGrid: {},
        gamesByDifficulty: {},
      },
      achievements: [...ACHIEVEMENTS],
      unlockAchievement: (id) => {
        const achievements = get().achievements.map((a) =>
          a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        );
        set({ achievements });
      },
      updateStats: (result) => {
        const stats = { ...get().stats };
        stats.totalGames++;

        const gridKey = `${get().gridSize}x${get().gridSize}`;
        if (!stats.gamesByGrid[gridKey]) stats.gamesByGrid[gridKey] = { wins: 0, losses: 0, draws: 0 };
        if (get().gameMode === 'single' && !stats.gamesByDifficulty[get().aiDifficulty])
          stats.gamesByDifficulty[get().aiDifficulty] = { wins: 0, losses: 0, draws: 0 };

        if (result === 'win') {
          stats.wins++;
          stats.currentStreak++;
          stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
          stats.gamesByGrid[gridKey].wins++;
          if (get().gameMode === 'single') stats.gamesByDifficulty[get().aiDifficulty].wins++;
        } else if (result === 'loss') {
          stats.losses++;
          stats.currentStreak = 0;
          stats.gamesByGrid[gridKey].losses++;
          if (get().gameMode === 'single') stats.gamesByDifficulty[get().aiDifficulty].losses++;
        } else {
          stats.draws++;
          stats.gamesByGrid[gridKey].draws++;
          if (get().gameMode === 'single') stats.gamesByDifficulty[get().aiDifficulty].draws++;
        }

        set({ stats });

        if (result === 'win') {
          get().unlockAchievement('first_win');
          if (stats.currentStreak >= 3) get().unlockAchievement('win_streak_3');
          if (stats.currentStreak >= 5) get().unlockAchievement('win_streak_5');
          if (stats.currentStreak >= 10) get().unlockAchievement('win_streak_10');
          if (get().gameMode === 'single') {
            if (get().aiDifficulty === 'medium') get().unlockAchievement('beat_medium');
            if (get().aiDifficulty === 'hard') get().unlockAchievement('beat_hard');
            if (get().aiDifficulty === 'impossible') get().unlockAchievement('beat_impossible');
          }
          if (get().gridSize === 4) get().unlockAchievement('win_4x4');
          if (get().gridSize === 5) get().unlockAchievement('win_5x5');
          if (get().gridSize === 10) get().unlockAchievement('win_gomoku');
          if (get().timeLimit > 0) get().unlockAchievement('speed_demon');
          if (get().moveHistory.length <= 5) get().unlockAchievement('quick_win');
        }
        if (stats.totalGames >= 10) get().unlockAchievement('play_10');
        if (stats.totalGames >= 50) get().unlockAchievement('play_50');
        if (stats.totalGames >= 100) get().unlockAchievement('play_100');
        if (stats.draws >= 10) get().unlockAchievement('draw_master');
      },

      // Player names
      player1Name: 'Player 1',
      setPlayer1Name: (name) => set({ player1Name: name }),
      player2Name: 'Player 2',
      setPlayer2Name: (name) => set({ player2Name: name }),

      // Actions
      initGame: () => {
        const state = get();
        let board = createEmptyBoard(state.gridSize);
        let currentPlayer: Player = 'X'; // X always goes first

        // For campaign mode, apply pre-filled cells
        if (state.gameMode === 'campaign' && state.currentCampaignLevel > 0) {
          const level = state.campaignLevels.find((l) => l.id === state.currentCampaignLevel);
          if (level) {
            for (const pf of level.preFilled) {
              board[pf.index] = pf.value;
            }
            const oCount = level.preFilled.filter((p) => p.value === 'O').length;
            const xCount = level.preFilled.filter((p) => p.value === 'X').length;
            if (oCount > xCount) currentPlayer = 'X';
            else if (xCount > oCount) currentPlayer = 'O';
          }
        }

        set({
          board,
          currentPlayer,
          gameActive: true,
          winner: null,
          winningLine: null,
          moveHistory: [],
          isAIThinking: false,
          turnStartTime: Date.now(),
          timeRemaining: state.timeLimit,
        });

        // If AI goes first (player chose O), trigger AI turn immediately
        if ((state.gameMode === 'single' || state.gameMode === 'campaign') && currentPlayer !== state.playerSymbol) {
          setTimeout(() => get().startAITurn(), 500);
        }
      },

      makeMove: (index) => {
        const state = get();
        if (!state.gameActive || state.board[index] !== null || state.isAIThinking) return;

        const newBoard = [...state.board];
        newBoard[index] = state.currentPlayer;

        const newHistory = [...state.moveHistory, { index, player: state.currentPlayer }];
        const result = checkWinner(newBoard, state.gridSize, state.winCondition);
        const winLine = getWinningLine(newBoard, state.gridSize, state.winCondition);

        if (result) {
          const newScores = { ...state.scores };
          if (result === 'draw') newScores.draws++;
          else if (result === 'X') newScores.X++;
          else newScores.O++;

          // Update stats based on who won relative to player symbol
          if (state.gameMode === 'single' || state.gameMode === 'campaign') {
            if (result === 'draw') state.updateStats('draw');
            else if (result === state.playerSymbol) state.updateStats('win');
            else state.updateStats('loss');
          } else if (state.gameMode === 'local' || state.gameMode === 'tournament') {
            if (result === 'draw') state.updateStats('draw');
            else if (result === 'X') state.updateStats('win');
            else state.updateStats('loss');
          }

          // Campaign: mark level as completed and award stars
          if (state.gameMode === 'campaign' && state.currentCampaignLevel > 0) {
            if (result === state.playerSymbol) {
              // Player won — award stars based on performance
              const movesUsed = newHistory.filter((m) => m.player === state.playerSymbol).length;
              const totalCells = state.gridSize * state.gridSize;
              let stars = 1; // At least 1 star for winning
              if (movesUsed <= Math.ceil(totalCells * 0.4)) stars = 3;   // Won quickly = 3 stars
              else if (movesUsed <= Math.ceil(totalCells * 0.6)) stars = 2; // Decent speed = 2 stars
              state.completeCampaignLevel(state.currentCampaignLevel, stars);
            } else if (result === 'draw') {
              // Draw — mark as completed with 0 stars (still unlocks next level)
              state.completeCampaignLevel(state.currentCampaignLevel, 0);
            }
            // Loss: don't complete the level
          }

          set({
            board: newBoard,
            winner: result,
            winningLine: winLine,
            gameActive: false,
            moveHistory: newHistory,
            scores: newScores,
            isAIThinking: false,
          });
          return;
        }

        const nextPlayer: Player = state.currentPlayer === 'X' ? 'O' : 'X';
        set({
          board: newBoard,
          currentPlayer: nextPlayer,
          moveHistory: newHistory,
          turnStartTime: Date.now(),
          timeRemaining: state.timeLimit,
        });

        // If next player is AI, trigger AI turn
        const updatedState = get();
        if (isAITurn(updatedState)) {
          setTimeout(() => get().startAITurn(), 200);
        }
      },

      undoMove: () => {
        const state = get();
        if (state.moveHistory.length === 0 || !state.gameActive) return;
        if (state.gameMode === 'single' || state.gameMode === 'campaign') {
          // Undo back to the player's own move (undo player + AI)
          const stepsToUndo = isAITurn({ ...state, currentPlayer: state.currentPlayer }) ? 1 : 2;
          if (state.moveHistory.length < stepsToUndo) return;
          const newHistory = state.moveHistory.slice(0, -stepsToUndo);
          const newBoard = createEmptyBoard(state.gridSize);
          for (const move of newHistory) {
            newBoard[move.index] = move.player;
          }
          set({
            board: newBoard,
            currentPlayer: state.playerSymbol, // Always return to player's turn
            moveHistory: newHistory,
          });
        } else {
          const lastMove = state.moveHistory[state.moveHistory.length - 1];
          const newHistory = state.moveHistory.slice(0, -1);
          const newBoard = [...state.board];
          newBoard[lastMove.index] = null;
          set({
            board: newBoard,
            currentPlayer: lastMove.player,
            moveHistory: newHistory,
          });
        }
      },

      resetGame: () => {
        get().initGame();
      },

      startAITurn: () => {
        const state = get();
        if (!state.gameActive || !isAITurn(state)) return;

        set({ isAIThinking: true });

        let difficulty = state.aiDifficulty;
        if (state.gameMode === 'campaign') {
          const level = state.campaignLevels.find((l) => l.id === state.currentCampaignLevel);
          if (level) difficulty = level.difficulty;
        }

        const aiSymbol = getAISymbol(state.playerSymbol);

        // Safety timeout: if AI doesn't respond in 2s, force fallback
        const safetyTimeout = setTimeout(() => {
          const current = get();
          if (current.isAIThinking) {
            console.warn('AI timeout — running fallback synchronously');
            try {
              // Dynamic import fallback to synchronous AI
              import('../game/ai').then(({ getAIMove }) => {
                const move = getAIMove(
                  current.board, current.gridSize, current.winCondition,
                  difficulty, aiSymbol
                );
                set({ isAIThinking: false });
                if (move !== -1 && current.gameActive) {
                  get().makeMove(move);
                }
              });
            } catch {
              set({ isAIThinking: false });
            }
          }
        }, 2000);

        // Use Web Worker for AI computation
        requestAIMove(
          state.board,
          state.gridSize,
          state.winCondition,
          difficulty,
          aiSymbol
        )
          .then((move) => {
            clearTimeout(safetyTimeout);
            // CRITICAL: Set isAIThinking to false BEFORE calling makeMove,
            // because makeMove has a guard that returns early when isAIThinking is true
            set({ isAIThinking: false });
            const currentState = get();
            if (!currentState.gameActive) return;
            if (move !== -1) {
              currentState.makeMove(move);
            }
          })
          .catch(() => {
            clearTimeout(safetyTimeout);
            // Fallback: run synchronously
            try {
              const current = get();
              import('../game/ai').then(({ getAIMove }) => {
                const fallbackMove = getAIMove(
                  current.board, current.gridSize, current.winCondition,
                  difficulty, aiSymbol
                );
                set({ isAIThinking: false });
                if (fallbackMove !== -1 && current.gameActive) {
                  get().makeMove(fallbackMove);
                }
              });
            } catch {
              set({ isAIThinking: false });
            }
          });
      },

      lastMoveTime: 0,
    }),
    {
      name: 'tictactoe-game-storage',
      partialize: (state) => ({
        theme: state.theme,
        xSkin: state.xSkin,
        oSkin: state.oSkin,
        soundEnabled: state.soundEnabled,
        hapticEnabled: state.hapticEnabled,
        stats: state.stats,
        achievements: state.achievements,
        campaignLevels: state.campaignLevels,
        currentCampaignLevel: state.currentCampaignLevel,
        scores: state.scores,
        player1Name: state.player1Name,
        player2Name: state.player2Name,
        aiDifficulty: state.aiDifficulty,
        playerSymbol: state.playerSymbol,
      }),
    }
  )
);
