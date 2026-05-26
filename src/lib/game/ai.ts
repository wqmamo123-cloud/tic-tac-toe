/**
 * AI Engine for Tic Tac Toe
 * Supports 4 difficulty levels: Easy, Medium, Hard, Impossible
 * Works with any grid size (3x3, 4x4, 5x5, 10x10)
 */

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'impossible';
export type CellValue = 'X' | 'O' | null;
export type Board = CellValue[];

interface AIMove {
  index: number;
  score: number;
}

/**
 * Check for a winner on the board
 * Returns 'X', 'O', 'draw', or null
 */
export function checkWinner(
  board: Board,
  gridSize: number,
  winCondition: number
): 'X' | 'O' | 'draw' | null {
  const lines = generateWinLines(gridSize, winCondition);

  for (const line of lines) {
    const first = board[line[0]];
    if (!first) continue;
    if (line.every((idx) => board[idx] === first)) {
      return first as 'X' | 'O';
    }
  }

  if (board.every((cell) => cell !== null)) {
    return 'draw';
  }

  return null;
}

/**
 * Generate all possible winning lines for a grid
 */
export function generateWinLines(gridSize: number, winCondition: number): number[][] {
  const lines: number[][] = [];

  // Horizontal lines
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col <= gridSize - winCondition; col++) {
      const line: number[] = [];
      for (let k = 0; k < winCondition; k++) {
        line.push(row * gridSize + col + k);
      }
      lines.push(line);
    }
  }

  // Vertical lines
  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row <= gridSize - winCondition; row++) {
      const line: number[] = [];
      for (let k = 0; k < winCondition; k++) {
        line.push((row + k) * gridSize + col);
      }
      lines.push(line);
    }
  }

  // Diagonal (top-left to bottom-right)
  for (let row = 0; row <= gridSize - winCondition; row++) {
    for (let col = 0; col <= gridSize - winCondition; col++) {
      const line: number[] = [];
      for (let k = 0; k < winCondition; k++) {
        line.push((row + k) * gridSize + col + k);
      }
      lines.push(line);
    }
  }

  // Diagonal (top-right to bottom-left)
  for (let row = 0; row <= gridSize - winCondition; row++) {
    for (let col = winCondition - 1; col < gridSize; col++) {
      const line: number[] = [];
      for (let k = 0; k < winCondition; k++) {
        line.push((row + k) * gridSize + col - k);
      }
      lines.push(line);
    }
  }

  return lines;
}

/**
 * Get empty cells on the board
 */
function getEmptyCells(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, idx) => {
    if (cell === null) acc.push(idx);
    return acc;
  }, []);
}

/**
 * Count how many of a player's marks are in a line (with no opponent marks)
 */
function countInLine(board: Board, line: number[], player: CellValue): number {
  let count = 0;
  let blocked = false;
  for (const idx of line) {
    if (board[idx] === player) count++;
    else if (board[idx] !== null) blocked = true;
  }
  return blocked ? -1 : count;
}

/**
 * Easy AI: Random moves with occasional basic blocks
 */
function easyMove(board: Board, gridSize: number, winCondition: number, aiPlayer: 'X' | 'O'): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;

  // 30% chance to block or take a winning move
  if (Math.random() < 0.3) {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';
    const winLine = findWinningMove(board, gridSize, winCondition, aiPlayer);
    if (winLine !== -1) return winLine;

    const blockLine = findWinningMove(board, gridSize, winCondition, opponent);
    if (blockLine !== -1) return blockLine;
  }

  return empty[Math.floor(Math.random() * empty.length)];
}

/**
 * Medium AI: Uses basic heuristics to block wins or complete winning lines
 */
function mediumMove(board: Board, gridSize: number, winCondition: number, aiPlayer: 'X' | 'O'): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;

  const opponent = aiPlayer === 'X' ? 'O' : 'X';

  // First, check if AI can win
  const winMove = findWinningMove(board, gridSize, winCondition, aiPlayer);
  if (winMove !== -1) return winMove;

  // Then, block opponent's winning move
  const blockMove = findWinningMove(board, gridSize, winCondition, opponent);
  if (blockMove !== -1) return blockMove;

  // Try to take center or strategic positions
  const center = Math.floor((gridSize * gridSize) / 2);
  if (board[center] === null && gridSize % 2 === 1) return center;

  // Evaluate each move with heuristics
  let bestScore = -Infinity;
  let bestMove = empty[0];

  for (const move of empty) {
    const score = evaluateMove(board, move, gridSize, winCondition, aiPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Find a move that wins the game for the given player
 */
function findWinningMove(
  board: Board,
  gridSize: number,
  winCondition: number,
  player: 'X' | 'O'
): number {
  const empty = getEmptyCells(board);

  for (const move of empty) {
    const newBoard = [...board];
    newBoard[move] = player;
    if (checkWinner(newBoard, gridSize, winCondition) === player) {
      return move;
    }
  }

  return -1;
}

/**
 * Heuristic evaluation for a move
 */
function evaluateMove(
  board: Board,
  move: number,
  gridSize: number,
  winCondition: number,
  player: 'X' | 'O'
): number {
  const opponent = player === 'X' ? 'O' : 'X';
  const newBoard = [...board];
  newBoard[move] = player;

  const lines = generateWinLines(gridSize, winCondition);
  let score = 0;

  for (const line of lines) {
    if (!line.includes(move)) continue;
    const aiCount = countInLine(newBoard, line, player);
    const oppCount = countInLine(newBoard, line, opponent);

    if (aiCount === winCondition) score += 100;
    else if (aiCount > 0 && oppCount <= 0) score += aiCount * 3;
    else if (oppCount === winCondition - 1 && aiCount <= 0) score += 15;
  }

  // Prefer center positions
  const center = Math.floor((gridSize * gridSize) / 2);
  if (move === center) score += 5;

  // Prefer corners for 3x3
  if (gridSize === 3) {
    const corners = [0, 2, 6, 8];
    if (corners.includes(move)) score += 3;
  }

  return score;
}

/**
 * Hard AI: Uses Minimax algorithm with depth limiting for larger grids
 */
function hardMove(board: Board, gridSize: number, winCondition: number, aiPlayer: 'X' | 'O'): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;

  // For small grids, use full minimax
  if (gridSize <= 3) {
    const result = minimax(board, gridSize, winCondition, aiPlayer, aiPlayer, 0, 9);
    return result.index;
  }

  // For larger grids, limit depth and use heuristic ordering
  const maxDepth = gridSize <= 5 ? 5 : 3;
  const moves = empty
    .map((move) => {
      const newBoard = [...board];
      newBoard[move] = aiPlayer;
      const score = minimax(
        newBoard,
        gridSize,
        winCondition,
        aiPlayer,
        aiPlayer === 'X' ? 'O' : 'X',
        1,
        maxDepth
      ).score;
      return { index: move, score };
    })
    .sort((a, b) => b.score - a.score);

  return moves[0].index;
}

/**
 * Impossible AI: Minimax with Alpha-Beta Pruning - never loses on 3x3
 */
function impossibleMove(
  board: Board,
  gridSize: number,
  winCondition: number,
  aiPlayer: 'X' | 'O'
): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;

  // For small grids, use full alpha-beta
  if (gridSize <= 3) {
    const result = alphaBeta(
      board,
      gridSize,
      winCondition,
      aiPlayer,
      aiPlayer,
      0,
      -Infinity,
      Infinity,
      20
    );
    return result.index;
  }

  // For larger grids, limit depth
  const maxDepth = gridSize <= 5 ? 6 : 4;

  // Pre-sort moves by heuristic for better pruning
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  const prioritizedMoves = [...empty].sort((a, b) => {
    const scoreA = evaluateMove(board, a, gridSize, winCondition, aiPlayer);
    const scoreB = evaluateMove(board, b, gridSize, winCondition, aiPlayer);
    return scoreB - scoreA;
  });

  // Only consider top moves for performance on large grids
  const candidateMoves = gridSize >= 10 ? prioritizedMoves.slice(0, 15) : prioritizedMoves;

  let bestScore = -Infinity;
  let bestMove = candidateMoves[0];

  for (const move of candidateMoves) {
    const newBoard = [...board];
    newBoard[move] = aiPlayer;
    const result = alphaBeta(
      newBoard,
      gridSize,
      winCondition,
      aiPlayer,
      opponent,
      1,
      -Infinity,
      Infinity,
      maxDepth
    );

    if (result.score > bestScore) {
      bestScore = result.score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Minimax algorithm
 */
function minimax(
  board: Board,
  gridSize: number,
  winCondition: number,
  aiPlayer: 'X' | 'O',
  currentPlayer: 'X' | 'O',
  depth: number,
  maxDepth: number
): AIMove {
  const winner = checkWinner(board, gridSize, winCondition);

  if (winner === aiPlayer) return { index: -1, score: 10 - depth };
  if (winner === (aiPlayer === 'X' ? 'O' : 'X')) return { index: -1, score: depth - 10 };
  if (winner === 'draw') return { index: -1, score: 0 };
  if (depth >= maxDepth) return { index: -1, score: 0 };

  const empty = getEmptyCells(board);
  const isMaximizing = currentPlayer === aiPlayer;
  const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';

  let bestMove: AIMove = {
    index: -1,
    score: isMaximizing ? -Infinity : Infinity,
  };

  for (const move of empty) {
    const newBoard = [...board];
    newBoard[move] = currentPlayer;
    const result = minimax(newBoard, gridSize, winCondition, aiPlayer, nextPlayer, depth + 1, maxDepth);

    if (isMaximizing) {
      if (result.score > bestMove.score) {
        bestMove = { index: move, score: result.score };
      }
    } else {
      if (result.score < bestMove.score) {
        bestMove = { index: move, score: result.score };
      }
    }
  }

  return bestMove;
}

/**
 * Minimax with Alpha-Beta Pruning
 */
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

  if (winner === aiPlayer) return { index: -1, score: 100 - depth };
  if (winner === (aiPlayer === 'X' ? 'O' : 'X')) return { index: -1, score: depth - 100 };
  if (winner === 'draw') return { index: -1, score: 0 };
  if (depth >= maxDepth) {
    // Heuristic evaluation at depth limit
    return { index: -1, score: heuristicEval(board, gridSize, winCondition, aiPlayer) };
  }

  const empty = getEmptyCells(board);
  const isMaximizing = currentPlayer === aiPlayer;
  const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';

  let bestMove: AIMove = {
    index: -1,
    score: isMaximizing ? -Infinity : Infinity,
  };

  for (const move of empty) {
    const newBoard = [...board];
    newBoard[move] = currentPlayer;
    const result = alphaBeta(newBoard, gridSize, winCondition, aiPlayer, nextPlayer, depth + 1, alpha, beta, maxDepth);

    if (isMaximizing) {
      if (result.score > bestMove.score) {
        bestMove = { index: move, score: result.score };
      }
      alpha = Math.max(alpha, result.score);
    } else {
      if (result.score < bestMove.score) {
        bestMove = { index: move, score: result.score };
      }
      beta = Math.min(beta, result.score);
    }

    if (beta <= alpha) break;
  }

  return bestMove;
}

/**
 * Heuristic evaluation for alpha-beta depth limit
 */
function heuristicEval(
  board: Board,
  gridSize: number,
  winCondition: number,
  aiPlayer: 'X' | 'O'
): number {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  const lines = generateWinLines(gridSize, winCondition);
  let score = 0;

  for (const line of lines) {
    const aiCount = countInLine(board, line, aiPlayer);
    const oppCount = countInLine(board, line, opponent);

    if (aiCount > 0 && oppCount <= 0) {
      score += Math.pow(10, aiCount);
    } else if (oppCount > 0 && aiCount <= 0) {
      score -= Math.pow(10, oppCount);
    }
  }

  return score;
}

/**
 * Main AI move function
 */
export function getAIMove(
  board: Board,
  gridSize: number,
  winCondition: number,
  difficulty: AIDifficulty,
  aiPlayer: 'X' | 'O'
): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;

  // If only one empty cell, take it
  if (empty.length === 1) return empty[0];

  switch (difficulty) {
    case 'easy':
      return easyMove(board, gridSize, winCondition, aiPlayer);
    case 'medium':
      return mediumMove(board, gridSize, winCondition, aiPlayer);
    case 'hard':
      return hardMove(board, gridSize, winCondition, aiPlayer);
    case 'impossible':
      return impossibleMove(board, gridSize, winCondition, aiPlayer);
    default:
      return easyMove(board, gridSize, winCondition, aiPlayer);
  }
}

/**
 * Get the winning line indices if there's a winner
 */
export function getWinningLine(
  board: Board,
  gridSize: number,
  winCondition: number
): number[] | null {
  const lines = generateWinLines(gridSize, winCondition);

  for (const line of lines) {
    const first = board[line[0]];
    if (!first) continue;
    if (line.every((idx) => board[idx] === first)) {
      return line;
    }
  }

  return null;
}
