/**
 * Game Types and Constants
 */

export type CellValue = 'X' | 'O' | null;
export type Board = CellValue[];
export type Player = 'X' | 'O';
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'impossible';
export type GameMode = 'single' | 'local' | 'online' | 'campaign' | 'tournament';
export type ScreenType =
  | 'welcome'
  | 'mode-select'
  | 'difficulty-select'
  | 'grid-select'
  | 'game'
  | 'campaign-map'
  | 'tournament-setup'
  | 'tournament-bracket'
  | 'online-lobby'
  | 'stats'
  | 'achievements'
  | 'settings'
  | 'time-attack-setup'
  | 'game-over';

export type ThemeName = 'light' | 'dark' | 'neon' | 'wooden' | 'cyberpunk' | 'minimalist';

export interface GridConfig {
  size: number;
  winCondition: number;
  label: string;
  description: string;
}

export const GRID_CONFIGS: GridConfig[] = [
  { size: 3, winCondition: 3, label: '3×3 Classic', description: 'Align 3 to win' },
  { size: 4, winCondition: 4, label: '4×4 Grid', description: 'Align 4 to win' },
  { size: 5, winCondition: 4, label: '5×5 Grid', description: 'Align 4 to win' },
  { size: 5, winCondition: 5, label: '5×5 Pro', description: 'Align 5 to win' },
  { size: 10, winCondition: 5, label: '10×10 Gomoku', description: 'Align 5 to win' },
];

export const TIME_ATTACK_OPTIONS = [
  { seconds: 3, label: '3s Blitz' },
  { seconds: 5, label: '5s Rapid' },
  { seconds: 10, label: '10s Normal' },
];

export const THEMES: Record<ThemeName, ThemeConfig> = {
  light: {
    name: 'Light',
    bg: 'bg-gray-50',
    bgGradient: 'from-gray-50 to-white',
    board: 'bg-white',
    boardBorder: 'border-gray-200',
    cell: 'bg-gray-100 hover:bg-gray-200',
    cellBorder: 'border-gray-300',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    xColor: 'text-blue-600',
    oColor: 'text-rose-500',
    accent: 'bg-blue-500',
    accentText: 'text-blue-500',
    accentHover: 'hover:bg-blue-600',
    button: 'bg-blue-500 hover:bg-blue-600 text-white',
    card: 'bg-white border border-gray-200',
    particle: '#3b82f6',
    winLine: '#3b82f6',
  },
  dark: {
    name: 'Dark',
    bg: 'bg-gray-950',
    bgGradient: 'from-gray-950 to-gray-900',
    board: 'bg-gray-800',
    boardBorder: 'border-gray-700',
    cell: 'bg-gray-700/50 hover:bg-gray-600/50',
    cellBorder: 'border-gray-600',
    text: 'text-gray-100',
    textSecondary: 'text-gray-400',
    xColor: 'text-cyan-400',
    oColor: 'text-orange-400',
    accent: 'bg-cyan-500',
    accentText: 'text-cyan-500',
    accentHover: 'hover:bg-cyan-600',
    button: 'bg-cyan-500 hover:bg-cyan-600 text-white',
    card: 'bg-gray-800 border border-gray-700',
    particle: '#06b6d4',
    winLine: '#06b6d4',
  },
  neon: {
    name: 'Neon Glow',
    bg: 'bg-gray-950',
    bgGradient: 'from-gray-950 via-purple-950/30 to-gray-950',
    board: 'bg-gray-900/80',
    boardBorder: 'border-purple-500/30',
    cell: 'bg-gray-800/50 hover:bg-purple-900/30',
    cellBorder: 'border-purple-500/20',
    text: 'text-purple-100',
    textSecondary: 'text-purple-300/70',
    xColor: 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]',
    oColor: 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]',
    accent: 'bg-purple-500',
    accentText: 'text-purple-400',
    accentHover: 'hover:bg-purple-600',
    button: 'bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    card: 'bg-gray-900/80 border border-purple-500/30',
    particle: '#a855f7',
    winLine: '#a855f7',
  },
  wooden: {
    name: 'Wooden Retro',
    bg: 'bg-amber-50',
    bgGradient: 'from-amber-50 to-amber-100',
    board: 'bg-amber-800',
    boardBorder: 'border-amber-900',
    cell: 'bg-amber-700/60 hover:bg-amber-600/60',
    cellBorder: 'border-amber-900/50',
    text: 'text-amber-950',
    textSecondary: 'text-amber-700',
    xColor: 'text-red-800',
    oColor: 'text-amber-100',
    accent: 'bg-amber-700',
    accentText: 'text-amber-700',
    accentHover: 'hover:bg-amber-800',
    button: 'bg-amber-700 hover:bg-amber-800 text-amber-50',
    card: 'bg-amber-100 border border-amber-300',
    particle: '#b45309',
    winLine: '#dc2626',
  },
  cyberpunk: {
    name: 'Cyberpunk',
    bg: 'bg-gray-950',
    bgGradient: 'from-gray-950 via-yellow-950/20 to-gray-950',
    board: 'bg-gray-900',
    boardBorder: 'border-yellow-500/30',
    cell: 'bg-gray-800/60 hover:bg-yellow-900/20',
    cellBorder: 'border-yellow-500/20',
    text: 'text-yellow-100',
    textSecondary: 'text-yellow-500/70',
    xColor: 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]',
    oColor: 'text-fuchsia-400 drop-shadow-[0_0_6px_rgba(217,70,239,0.5)]',
    accent: 'bg-yellow-500',
    accentText: 'text-yellow-400',
    accentHover: 'hover:bg-yellow-600',
    button: 'bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-bold',
    card: 'bg-gray-900 border border-yellow-500/30',
    particle: '#eab308',
    winLine: '#eab308',
  },
  minimalist: {
    name: 'Minimalist',
    bg: 'bg-white',
    bgGradient: 'from-white to-gray-50',
    board: 'bg-white',
    boardBorder: 'border-gray-200',
    cell: 'bg-white hover:bg-gray-50',
    cellBorder: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-400',
    xColor: 'text-gray-900',
    oColor: 'text-gray-400',
    accent: 'bg-gray-900',
    accentText: 'text-gray-900',
    accentHover: 'hover:bg-gray-800',
    button: 'bg-gray-900 hover:bg-gray-800 text-white',
    card: 'bg-white border border-gray-200',
    particle: '#111827',
    winLine: '#111827',
  },
};

export interface ThemeConfig {
  name: string;
  bg: string;
  bgGradient: string;
  board: string;
  boardBorder: string;
  cell: string;
  cellBorder: string;
  text: string;
  textSecondary: string;
  xColor: string;
  oColor: string;
  accent: string;
  accentText: string;
  accentHover: string;
  button: string;
  card: string;
  particle: string;
  winLine: string;
}

export const X_SKINS = [
  { id: 'default', label: 'X', render: 'X' },
  { id: 'cross', label: '✕', render: '✕' },
  { id: 'star', label: '★', render: '★' },
  { id: 'sword', label: '⚔', render: '⚔' },
  { id: 'fire', label: '🔥', render: '🔥' },
  { id: 'bolt', label: '⚡', render: '⚡' },
  { id: 'diamond', label: '◆', render: '◆' },
  { id: 'skull', label: '💀', render: '💀' },
];

export const O_SKINS = [
  { id: 'default', label: 'O', render: 'O' },
  { id: 'circle', label: '○', render: '○' },
  { id: 'heart', label: '♥', render: '♥' },
  { id: 'shield', label: '🛡', render: '🛡' },
  { id: 'snow', label: '❄', render: '❄' },
  { id: 'moon', label: '🌙', render: '🌙' },
  { id: 'flower', label: '✿', render: '✿' },
  { id: 'ghost', label: '👻', render: '👻' },
];

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', name: 'First Victory', description: 'Win your first game', icon: '🏆', unlocked: false },
  { id: 'win_streak_3', name: 'On Fire', description: 'Win 3 games in a row', icon: '🔥', unlocked: false },
  { id: 'win_streak_5', name: 'Unstoppable', description: 'Win 5 games in a row', icon: '⚡', unlocked: false },
  { id: 'win_streak_10', name: 'Legendary', description: 'Win 10 games in a row', icon: '👑', unlocked: false },
  { id: 'beat_medium', name: 'Getting Good', description: 'Beat Medium AI', icon: '🧠', unlocked: false },
  { id: 'beat_hard', name: 'Mastermind', description: 'Beat Hard AI', icon: '🎯', unlocked: false },
  { id: 'beat_impossible', name: 'The Impossible', description: 'Beat Impossible AI', icon: '💎', unlocked: false },
  { id: 'play_10', name: 'Regular', description: 'Play 10 games', icon: '🎮', unlocked: false },
  { id: 'play_50', name: 'Dedicated', description: 'Play 50 games', icon: '🌟', unlocked: false },
  { id: 'play_100', name: 'Veteran', description: 'Play 100 games', icon: '🎖', unlocked: false },
  { id: 'win_4x4', name: 'Grid Master', description: 'Win on a 4×4 grid', icon: '📐', unlocked: false },
  { id: 'win_5x5', name: 'Big Board', description: 'Win on a 5×5 grid', icon: '📏', unlocked: false },
  { id: 'win_gomoku', name: 'Gomoku Pro', description: 'Win on 10×10 Gomoku', icon: '🌐', unlocked: false },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Win a Time Attack game', icon: '⏱', unlocked: false },
  { id: 'campaign_5', name: 'Adventurer', description: 'Complete 5 campaign levels', icon: '🗺', unlocked: false },
  { id: 'campaign_15', name: 'Explorer', description: 'Complete 15 campaign levels', icon: '🏔', unlocked: false },
  { id: 'campaign_30', name: 'Conqueror', description: 'Complete all 30 campaign levels', icon: '🏰', unlocked: false },
  { id: 'tournament_win', name: 'Champion', description: 'Win a tournament', icon: '🥇', unlocked: false },
  { id: 'draw_master', name: 'Peacekeeper', description: 'Have 10 draws', icon: '🤝', unlocked: false },
  { id: 'quick_win', name: 'Lightning', description: 'Win in under 5 moves', icon: '💨', unlocked: false },
];

export interface CampaignLevel {
  id: number;
  name: string;
  description: string;
  gridSize: number;
  winCondition: number;
  difficulty: AIDifficulty;
  preFilled: { index: number; value: CellValue }[];
  completed: boolean;
  stars: number; // 0-3
}

export function generateCampaignLevels(): CampaignLevel[] {
  const levels: CampaignLevel[] = [];

  // Chapter 1: Basics (Levels 1-10)
  const chapter1 = [
    { name: 'First Steps', desc: 'A simple 3×3 grid against an easy AI', grid: 3, win: 3, diff: 'easy' as AIDifficulty, prefill: [] },
    { name: 'Learning Curve', desc: 'Try to get three in a row', grid: 3, win: 3, diff: 'easy' as AIDifficulty, prefill: [] },
    { name: 'First Block', desc: 'The AI is getting smarter', grid: 3, win: 3, diff: 'easy' as AIDifficulty, prefill: [{ index: 4, value: 'O' as CellValue }] },
    { name: 'Warm Up', desc: 'A slightly harder challenge', grid: 3, win: 3, diff: 'medium' as AIDifficulty, prefill: [] },
    { name: 'Corner Trap', desc: 'The AI starts in the corner', grid: 3, win: 3, diff: 'medium' as AIDifficulty, prefill: [{ index: 0, value: 'O' as CellValue }] },
    { name: 'Center Control', desc: 'The AI takes the center first', grid: 3, win: 3, diff: 'medium' as AIDifficulty, prefill: [{ index: 4, value: 'O' as CellValue }] },
    { name: 'Two Against One', desc: 'Start with a disadvantage', grid: 3, win: 3, diff: 'medium' as AIDifficulty, prefill: [{ index: 0, value: 'O' as CellValue }, { index: 8, value: 'O' as CellValue }] },
    { name: 'Mind Games', desc: 'Can you outsmart the AI?', grid: 3, win: 3, diff: 'hard' as AIDifficulty, prefill: [] },
    { name: 'No Mercy', desc: 'The AI plays to win', grid: 3, win: 3, diff: 'hard' as AIDifficulty, prefill: [{ index: 4, value: 'O' as CellValue }] },
    { name: 'Chapter Boss', desc: 'Defeat the hard AI with a handicap', grid: 3, win: 3, diff: 'hard' as AIDifficulty, prefill: [{ index: 0, value: 'O' as CellValue }, { index: 4, value: 'O' as CellValue }] },
  ];

  // Chapter 2: Expanding (Levels 11-20)
  const chapter2 = [
    { name: 'Bigger Board', desc: 'Move to the 4×4 grid', grid: 4, win: 4, diff: 'easy' as AIDifficulty, prefill: [] },
    { name: 'Four in a Row', desc: 'Align 4 on the 4×4 grid', grid: 4, win: 4, diff: 'easy' as AIDifficulty, prefill: [] },
    { name: 'Strategic Mind', desc: 'Medium AI on 4×4', grid: 4, win: 4, diff: 'medium' as AIDifficulty, prefill: [] },
    { name: 'Opening Gambit', desc: 'AI starts with two pieces', grid: 4, win: 4, diff: 'medium' as AIDifficulty, prefill: [{ index: 5, value: 'O' as CellValue }, { index: 10, value: 'O' as CellValue }] },
    { name: '5×5 Intro', desc: 'Welcome to the 5×5 grid', grid: 5, win: 4, diff: 'easy' as AIDifficulty, prefill: [] },
    { name: 'Connect Four', desc: 'Align 4 on 5×5', grid: 5, win: 4, diff: 'medium' as AIDifficulty, prefill: [] },
    { name: 'Five Star', desc: 'Align 5 on 5×5', grid: 5, win: 5, diff: 'easy' as AIDifficulty, prefill: [] },
    { name: 'Diagonal Danger', desc: 'AI controls the diagonal', grid: 5, win: 4, diff: 'hard' as AIDifficulty, prefill: [{ index: 6, value: 'O' as CellValue }, { index: 12, value: 'O' as CellValue }, { index: 18, value: 'O' as CellValue }] },
    { name: 'Fortress', desc: 'Break through the AI defense', grid: 4, win: 4, diff: 'hard' as AIDifficulty, prefill: [{ index: 5, value: 'O' as CellValue }, { index: 6, value: 'O' as CellValue }] },
    { name: 'Chapter Boss II', desc: 'Hard AI on 5×5', grid: 5, win: 4, diff: 'hard' as AIDifficulty, prefill: [] },
  ];

  // Chapter 3: Masters (Levels 21-30)
  const chapter3 = [
    { name: 'Gomoku Begins', desc: 'Enter the 10×10 arena', grid: 10, win: 5, diff: 'easy' as AIDifficulty, prefill: [] },
    { name: 'Pattern Play', desc: 'Learn gomoku patterns', grid: 10, win: 5, diff: 'easy' as AIDifficulty, prefill: [{ index: 44, value: 'O' as CellValue }] },
    { name: 'Rising Tide', desc: 'Medium AI on gomoku', grid: 10, win: 5, diff: 'medium' as AIDifficulty, prefill: [] },
    { name: 'Wall Builder', desc: 'AI blocks your every move', grid: 10, win: 5, diff: 'medium' as AIDifficulty, prefill: [{ index: 44, value: 'O' as CellValue }, { index: 45, value: 'O' as CellValue }] },
    { name: 'The Gauntlet', desc: 'Hard AI on 3×3', grid: 3, win: 3, diff: 'hard' as AIDifficulty, prefill: [{ index: 0, value: 'O' as CellValue }, { index: 4, value: 'O' as CellValue }] },
    { name: 'Impossible?', desc: 'Face the impossible AI', grid: 3, win: 3, diff: 'impossible' as AIDifficulty, prefill: [] },
    { name: 'Never Say Die', desc: 'Get a draw against impossible', grid: 3, win: 3, diff: 'impossible' as AIDifficulty, prefill: [] },
    { name: 'Gomoku Hard', desc: 'Hard AI on 10×10', grid: 10, win: 5, diff: 'hard' as AIDifficulty, prefill: [] },
    { name: 'Final Challenge', desc: 'Hard AI, pre-filled board', grid: 5, win: 5, diff: 'hard' as AIDifficulty, prefill: [{ index: 6, value: 'O' as CellValue }, { index: 12, value: 'O' as CellValue }, { index: 18, value: 'O' as CellValue }] },
    { name: 'Ultimate Boss', desc: 'The final test', grid: 10, win: 5, diff: 'impossible' as AIDifficulty, prefill: [{ index: 44, value: 'O' as CellValue }] },
  ];

  [...chapter1, ...chapter2, ...chapter3].forEach((level, idx) => {
    levels.push({
      id: idx + 1,
      name: level.name,
      description: level.desc,
      gridSize: level.grid,
      winCondition: level.win,
      difficulty: level.diff,
      preFilled: level.prefill,
      completed: false,
      stars: 0,
    });
  });

  return levels;
}

export interface TournamentPlayer {
  id: string;
  name: string;
  eliminated: boolean;
}

export interface TournamentMatch {
  id: string;
  round: number;
  player1: TournamentPlayer | null;
  player2: TournamentPlayer | null;
  winner: TournamentPlayer | null;
  played: boolean;
}

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  avgMoveTime: number;
  gamesByGrid: Record<string, { wins: number; losses: number; draws: number }>;
  gamesByDifficulty: Record<string, { wins: number; losses: number; draws: number }>;
}
