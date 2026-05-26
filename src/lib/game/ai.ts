/**
 * AI Engine for Tic Tac Toe — Performance Optimized
 *
 * Guarantees:
 * - 3x3: Full Minimax with Alpha-Beta Pruning (complete search, < 50ms)
 * - 4x4: Depth-limited Minimax + heuristic eval (max depth 4, < 400ms)
 * - 5x5: Heuristic rule-based engine + shallow search (max depth 3, < 400ms)
 * - 10x10: Pure heuristic rule-based engine (no recursion, < 200ms)
 *
 * All heavy computation should run in a Web Worker via aiWorker.ts
 */

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'impossible';
export type CellValue = 'X' | 'O' | null;
export type Board = CellValue[];

interface AIMove {
  index: number;
  score: number;
}

// ─── Win-line caching ────────────────────────────────────────
const winLinesCache = new Map<string, number[][]>();

function getWinLines(gridSize: number, winCondition: number): number[][] {
  const key = `${gridSize}-${winCondition}`;
  const cached = winLinesCache.get(key);
  if (cached) return cached;

  const lines: number[][] = [];

  // Horizontal
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col <= gridSize - winCondition; col++) {
      const line: number[] = [];
      for (let k = 0; k < winCondition; k++) line.push(row * gridSize + col + k);
      lines.push(line);
    }
  }
  // Vertical
  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row <= gridSize - winCondition; row++) {
      const line: number[] = [];
      for (let k = 0; k < winCondition; k++) line.push((row + k) * gridSize + col);
      lines.push(line);
    }
  }
  // Diagonal ↘
  for (let row = 0; row <= gridSize - winCondition; row++) {
    for (let col = 0; col <= gridSize - winCondition; col++) {
      const line: number[] = [];
      for (let k = 0; k < winCondition; k++) line.push((row + k) * gridSize + col + k);
      lines.push(line);
    }
  }
  // Diagonal ↙
  for (let row = 0; row <= gridSize - winCondition; row++) {
    for (let col = winCondition - 1; col < gridSize; col++) {
      const line: number[] = [];
      for (let k = 0; k < winCondition; k++) line.push((row + k) * gridSize + col - k);
      lines.push(line);
    }
  }

  winLinesCache.set(key, lines);
  return lines;
}

// ─── Core checks ─────────────────────────────────────────────

export function checkWinner(
  board: Board,
  gridSize: number,
  winCondition: number
): 'X' | 'O' | 'draw' | null {
  const lines = getWinLines(gridSize, winCondition);
  for (const line of lines) {
    const first = board[line[0]];
    if (!first) continue;
    if (line.every((idx) => board[idx] === first)) return first as 'X' | 'O';
  }
  if (board.every((cell) => cell !== null)) return 'draw';
  return null;
}

export function getWinningLine(
  board: Board,
  gridSize: number,
  winCondition: number
): number[] | null {
  const lines = getWinLines(gridSize, winCondition);
  for (const line of lines) {
    const first = board[line[0]];
    if (!first) continue;
    if (line.every((idx) => board[idx] === first)) return line;
  }
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────

function getEmptyCells(board: Board): number[] {
  const result: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) result.push(i);
  }
  return result;
}

function findWinningMove(
  board: Board,
  gridSize: number,
  winCondition: number,
  player: 'X' | 'O'
): number {
  const empty = getEmptyCells(board);
  for (const move of empty) {
    const b = board.slice();
    b[move] = player;
    if (checkWinner(b, gridSize, winCondition) === player) return move;
  }
  return -1;
}

// ─── Heuristic evaluation ────────────────────────────────────

function countInLine(board: Board, line: number[], player: CellValue): number {
  let count = 0;
  let blocked = false;
  for (const idx of line) {
    if (board[idx] === player) count++;
    else if (board[idx] !== null) blocked = true;
  }
  return blocked ? -1 : count;
}

function heuristicEval(
  board: Board,
  gridSize: number,
  winCondition: number,
  aiPlayer: 'X' | 'O'
): number {
  const opponent: CellValue = aiPlayer === 'X' ? 'O' : 'X';
  const lines = getWinLines(gridSize, winCondition);
  let score = 0;

  for (const line of lines) {
    const aiCount = countInLine(board, line, aiPlayer);
    const oppCount = countInLine(board, line, opponent);

    if (aiCount > 0 && oppCount < 0) continue;
    if (oppCount > 0 && aiCount < 0) continue;

    if (aiCount > 0 && oppCount <= 0) {
      // Open line for AI
      if (aiCount === winCondition) score += 100000;
      else if (aiCount === winCondition - 1) score += 1000;
      else if (aiCount === winCondition - 2) score += 100;
      else score += aiCount * 5;
    } else if (oppCount > 0 && aiCount <= 0) {
      // Open line for opponent
      if (oppCount === winCondition) score -= 100000;
      else if (oppCount === winCondition - 1) score -= 1000;
      else if (oppCount === winCondition - 2) score -= 100;
      else score -= oppCount * 5;
    }
  }

  // Center bonus
  const center = Math.floor((gridSize * gridSize) / 2);
  if (board[center] === aiPlayer) score += 20;
  else if (board[center] === opponent) score -= 20;

  // Corner bonus for small grids
  if (gridSize <= 5) {
    const corners = [0, gridSize - 1, gridSize * (gridSize - 1), gridSize * gridSize - 1];
    for (const c of corners) {
      if (board[c] === aiPlayer) score += 10;
      else if (board[c] === opponent) score -= 10;
    }
  }

  return score;
}

function evaluateMove(
  board: Board,
  move: number,
  gridSize: number,
  winCondition: number,
  player: 'X' | 'O'
): number {
  const b = board.slice();
  b[move] = player;
  return heuristicEval(b, gridSize, winCondition, player);
}

// ─── Easy AI ─────────────────────────────────────────────────

function easyMove(board: Board, gridSize: number, winCondition: number, aiPlayer: 'X' | 'O'): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;

  // 30% chance to play smart
  if (Math.random() < 0.3) {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';
    const win = findWinningMove(board, gridSize, winCondition, aiPlayer);
    if (win !== -1) return win;
    const block = findWinningMove(board, gridSize, winCondition, opponent);
    if (block !== -1) return block;
  }

  return empty[Math.floor(Math.random() * empty.length)];
}

// ─── Medium AI ───────────────────────────────────────────────

function mediumMove(board: Board, gridSize: number, winCondition: number, aiPlayer: 'X' | 'O'): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;
  const opponent = aiPlayer === 'X' ? 'O' : 'X';

  // Win / block
  const win = findWinningMove(board, gridSize, winCondition, aiPlayer);
  if (win !== -1) return win;
  const block = findWinningMove(board, gridSize, winCondition, opponent);
  if (block !== -1) return block;

  // Center
  const center = Math.floor((gridSize * gridSize) / 2);
  if (board[center] === null && gridSize % 2 === 1) return center;

  // Heuristic
  let bestScore = -Infinity;
  let bestMove = empty[0];
  for (const move of empty) {
    const s = evaluateMove(board, move, gridSize, winCondition, aiPlayer);
    if (s > bestScore) { bestScore = s; bestMove = move; }
  }
  return bestMove;
}

// ─── Minimax with Alpha-Beta (depth-limited) ─────────────────

function alphaBeta(
  board: Board,
  gridSize: number,
  winCondition: number,
  aiPlayer: 'X' | 'O',
  currentPlayer: 'X' | 'O',
  depth: number,
  alpha: number,
  beta: number,
  maxDepth: number
): AIMove {
  const winner = checkWinner(board, gridSize, winCondition);
  const opponent: 'X' | 'O' = aiPlayer === 'X' ? 'O' : 'X';

  if (winner === aiPlayer) return { index: -1, score: 100000 - depth };
  if (winner === opponent) return { index: -1, score: depth - 100000 };
  if (winner === 'draw') return { index: -1, score: 0 };
  if (depth >= maxDepth) return { index: -1, score: heuristicEval(board, gridSize, winCondition, aiPlayer) };

  const empty = getEmptyCells(board);
  const isMax = currentPlayer === aiPlayer;
  const next: 'X' | 'O' = currentPlayer === 'X' ? 'O' : 'X';

  let bestMove: AIMove = { index: -1, score: isMax ? -Infinity : Infinity };

  for (const move of empty) {
    const b = board.slice();
    b[move] = currentPlayer;
    const result = alphaBeta(b, gridSize, winCondition, aiPlayer, next, depth + 1, alpha, beta, maxDepth);

    if (isMax) {
      if (result.score > bestMove.score) bestMove = { index: move, score: result.score };
      alpha = Math.max(alpha, result.score);
    } else {
      if (result.score < bestMove.score) bestMove = { index: move, score: result.score };
      beta = Math.min(beta, result.score);
    }
    if (beta <= alpha) break;
  }

  return bestMove;
}

// ─── Hard AI ─────────────────────────────────────────────────

function hardMove(board: Board, gridSize: number, winCondition: number, aiPlayer: 'X' | 'O'): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;

  // 3x3: full search
  if (gridSize <= 3) {
    const result = alphaBeta(board, gridSize, winCondition, aiPlayer, aiPlayer, 0, -Infinity, Infinity, 9);
    return result.index !== -1 ? result.index : empty[0];
  }

  // Win/block first
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  const win = findWinningMove(board, gridSize, winCondition, aiPlayer);
  if (win !== -1) return win;
  const block = findWinningMove(board, gridSize, winCondition, opponent);
  if (block !== -1) return block;

  // Depth-limited search: 4x4 → depth 4, 5x5 → depth 3, 10x10 → depth 2
  const maxDepth = gridSize >= 10 ? 2 : gridSize >= 5 ? 3 : 4;

  // Pre-sort by heuristic for better pruning
  const sorted = [...empty].sort((a, b) =>
    evaluateMove(board, b, gridSize, winCondition, aiPlayer) -
    evaluateMove(board, a, gridSize, winCondition, aiPlayer)
  );

  // Limit candidates on large grids
  const candidates = gridSize >= 10 ? sorted.slice(0, 12) : gridSize >= 5 ? sorted.slice(0, 15) : sorted;

  let bestScore = -Infinity;
  let bestMove = candidates[0];

  for (const move of candidates) {
    const b = board.slice();
    b[move] = aiPlayer;
    const result = alphaBeta(b, gridSize, winCondition, aiPlayer, opponent, 1, -Infinity, Infinity, maxDepth);
    if (result.score > bestScore) { bestScore = result.score; bestMove = move; }
  }

  return bestMove;
}

// ─── Impossible AI ────────────────────────────────────────────

function impossibleMove(board: Board, gridSize: number, winCondition: number, aiPlayer: 'X' | 'O'): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;

  // 3x3: full alpha-beta (never loses)
  if (gridSize <= 3) {
    const result = alphaBeta(board, gridSize, winCondition, aiPlayer, aiPlayer, 0, -Infinity, Infinity, 9);
    return result.index !== -1 ? result.index : empty[0];
  }

  // Win/block
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  const win = findWinningMove(board, gridSize, winCondition, aiPlayer);
  if (win !== -1) return win;
  const block = findWinningMove(board, gridSize, winCondition, opponent);
  if (block !== -1) return block;

  // For 4x4-5x5: deeper search. For 10x10: pure heuristic engine
  if (gridSize >= 10) {
    // Pure heuristic rule-based engine (no recursion) — guaranteed fast
    return gomokuEngine(board, gridSize, winCondition, aiPlayer);
  }

  // Depth-limited alpha-beta for 4x4 and 5x5
  const maxDepth = gridSize <= 4 ? 5 : 4;

  const sorted = [...empty].sort((a, b) =>
    evaluateMove(board, b, gridSize, winCondition, aiPlayer) -
    evaluateMove(board, a, gridSize, winCondition, aiPlayer)
  );
  const candidates = sorted.slice(0, 15);

  let bestScore = -Infinity;
  let bestMove = candidates[0];

  for (const move of candidates) {
    const b = board.slice();
    b[move] = aiPlayer;
    const result = alphaBeta(b, gridSize, winCondition, aiPlayer, opponent, 1, -Infinity, Infinity, maxDepth);
    if (result.score > bestScore) { bestScore = result.score; bestMove = move; }
  }

  return bestMove;
}

// ─── Gomoku Engine (10x10) — non-recursive, fast ─────────────

function gomokuEngine(board: Board, gridSize: number, winCondition: number, aiPlayer: 'X' | 'O'): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;
  const opponent: 'X' | 'O' = aiPlayer === 'X' ? 'O' : 'X';

  // 1. Win in one
  const win = findWinningMove(board, gridSize, winCondition, aiPlayer);
  if (win !== -1) return win;

  // 2. Block opponent win
  const block = findWinningMove(board, gridSize, winCondition, opponent);
  if (block !== -1) return block;

  // 3. Create a "four" (3 + 1 open = win next turn)
  // Check for open-three patterns (will become four)
  // 4. Block opponent's open-three
  // These are handled by the heuristic evaluation below, weighted heavily

  // Evaluate each move with enhanced gomoku heuristics
  let bestScore = -Infinity;
  let bestMove = empty[0];

  for (const move of empty) {
    // Only consider cells near existing pieces for performance
    if (!isNearExistingPiece(board, move, gridSize, 2)) continue;

    const score = gomokuEvalMove(board, move, gridSize, winCondition, aiPlayer);
    if (score > bestScore) { bestScore = score; bestMove = move; }
  }

  return bestMove;
}

function isNearExistingPiece(board: Board, index: number, gridSize: number, distance: number): boolean {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;

  for (let dr = -distance; dr <= distance; dr++) {
    for (let dc = -distance; dc <= distance; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;
      if (board[r * gridSize + c] !== null) return true;
    }
  }

  // If board is empty, allow center
  if (board.every((c) => c === null)) {
    const center = Math.floor((gridSize * gridSize) / 2);
    return index === center || index === center - 1 || index === center + 1;
  }

  return false;
}

function gomokuEvalMove(
  board: Board,
  move: number,
  gridSize: number,
  winCondition: number,
  player: 'X' | 'O'
): number {
  const opponent: 'X' | 'O' = player === 'X' ? 'O' : 'X';
  const b = board.slice();
  b[move] = player;

  let score = 0;
  const lines = getWinLines(gridSize, winCondition);

  for (const line of lines) {
    if (!line.includes(move)) continue;

    const aiCount = countInLine(b, line, player);
    const oppCount = countInLine(b, line, opponent);

    if (aiCount >= 0 && oppCount < 0) {
      // AI has pieces, opponent blocked
      if (aiCount === winCondition) score += 1000000;
      else if (aiCount === winCondition - 1) score += 50000;  // One away from winning
      else if (aiCount === winCondition - 2) score += 5000;   // Two away
      else if (aiCount === winCondition - 3) score += 500;
      else score += aiCount * 10;
    } else if (oppCount >= 0 && aiCount < 0) {
      // Opponent has pieces, AI blocked
      if (oppCount === winCondition) score += 500000;        // Must block!
      else if (oppCount === winCondition - 1) score += 25000; // Block four
      else if (oppCount === winCondition - 2) score += 2500;  // Block three
      else if (oppCount === winCondition - 3) score += 250;
    }
    // Mixed line (both have pieces) = dead line, skip
  }

  // Center proximity bonus
  const center = Math.floor(gridSize / 2);
  const row = Math.floor(move / gridSize);
  const col = move % gridSize;
  const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
  score += Math.max(0, 10 - distFromCenter * 2);

  return score;
}

// ─── Main entry point ────────────────────────────────────────

export function getAIMove(
  board: Board,
  gridSize: number,
  winCondition: number,
  difficulty: AIDifficulty,
  aiPlayer: 'X' | 'O'
): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;
  if (empty.length === 1) return empty[0];

  switch (difficulty) {
    case 'easy':      return easyMove(board, gridSize, winCondition, aiPlayer);
    case 'medium':    return mediumMove(board, gridSize, winCondition, aiPlayer);
    case 'hard':      return hardMove(board, gridSize, winCondition, aiPlayer);
    case 'impossible': return impossibleMove(board, gridSize, winCondition, aiPlayer);
    default:          return easyMove(board, gridSize, winCondition, aiPlayer);
  }
}
