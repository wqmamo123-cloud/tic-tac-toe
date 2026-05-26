/**
 * AI Web Worker — runs AI calculations off the main thread
 * Prevents UI freezing on large grids
 */

import { getAIMove, type Board, type AIDifficulty } from './ai';

interface AIWorkerRequest {
  board: Board;
  gridSize: number;
  winCondition: number;
  difficulty: AIDifficulty;
  aiPlayer: 'X' | 'O';
  requestId: number;
}

interface AIWorkerResponse {
  move: number;
  requestId: number;
}

self.onmessage = (e: MessageEvent<AIWorkerRequest>) => {
  const { board, gridSize, winCondition, difficulty, aiPlayer, requestId } = e.data;

  const move = getAIMove(board, gridSize, winCondition, difficulty, aiPlayer);

  const response: AIWorkerResponse = { move, requestId };
  self.postMessage(response);
};

export {};
