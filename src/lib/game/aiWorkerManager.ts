/**
 * AI Worker Manager — manages the Web Worker lifecycle and provides
 * a Promise-based interface for off-thread AI computation.
 *
 * Robustness features:
 * - Auto-recreates the worker if it fails or is terminated
 * - Timeout-based fallback to synchronous computation
 * - Handles worker message ID mismatches gracefully
 */

import { getAIMove, type AIDifficulty, type Board } from './ai';

let worker: Worker | null = null;
let requestId = 0;
let workerFailed = false;
const pendingResolvers = new Map<number, {
  resolve: (move: number) => void;
  reject: (err: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}>();

function createWorker(): Worker | null {
  try {
    const w = new Worker(new URL('./aiWorker.ts', import.meta.url));

    w.onmessage = (e: MessageEvent<{ move: number; requestId: number }>) => {
      const { move, requestId: id } = e.data;
      const pending = pendingResolvers.get(id);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingResolvers.delete(id);
        pending.resolve(move);
      }
    };

    w.onerror = (err) => {
      console.error('AI Worker error:', err.message);
      workerFailed = true;
      // Reject all pending on error
      for (const [id, pending] of pendingResolvers) {
        clearTimeout(pending.timeout);
        pendingResolvers.delete(id);
        pending.reject(new Error(err.message || 'Worker error'));
      }
      // Terminate and null out the broken worker
      try { w.terminate(); } catch { /* already terminated */ }
      worker = null;
    };

    workerFailed = false;
    return w;
  } catch (err) {
    console.warn('Failed to create AI Worker, will use synchronous fallback:', err);
    workerFailed = true;
    return null;
  }
}

function getWorker(): Worker | null {
  if (!worker && !workerFailed) {
    worker = createWorker();
  }
  // If worker was previously created but might be dead, try to recreate
  if (!worker && workerFailed) {
    // Try once more — maybe the environment has changed
    workerFailed = false;
    worker = createWorker();
  }
  return worker;
}

const WORKER_TIMEOUT_MS = 3000; // 3 seconds max for worker computation

/**
 * Request AI move via Web Worker. Returns a Promise that resolves to the move index.
 * Falls back to synchronous computation if the worker fails or times out.
 */
export function requestAIMove(
  board: Board,
  gridSize: number,
  winCondition: number,
  difficulty: string,
  aiPlayer: 'X' | 'O'
): Promise<number> {
  return new Promise((resolve, reject) => {
    const id = ++requestId;

    // Set up timeout — if worker doesn't respond in time, run synchronously
    const timeout = setTimeout(() => {
      if (pendingResolvers.has(id)) {
        pendingResolvers.delete(id);
        console.warn('AI Worker timeout — running synchronously');
        try {
          const move = getAIMove(board, gridSize, winCondition, difficulty as AIDifficulty, aiPlayer);
          resolve(move);
        } catch (err) {
          reject(err);
        }
      }
    }, WORKER_TIMEOUT_MS);

    pendingResolvers.set(id, { resolve, reject, timeout });

    try {
      const w = getWorker();
      if (!w) {
        // Worker not available — run synchronously
        clearTimeout(timeout);
        pendingResolvers.delete(id);
        const move = getAIMove(board, gridSize, winCondition, difficulty as AIDifficulty, aiPlayer);
        resolve(move);
        return;
      }

      w.postMessage({
        board,
        gridSize,
        winCondition,
        difficulty,
        aiPlayer,
        requestId: id,
      });
    } catch {
      clearTimeout(timeout);
      pendingResolvers.delete(id);
      // Fallback: run synchronously
      try {
        const move = getAIMove(board, gridSize, winCondition, difficulty as AIDifficulty, aiPlayer);
        resolve(move);
      } catch (err) {
        reject(err);
      }
    }
  });
}

/**
 * Terminate the worker (cleanup)
 */
export function terminateAIWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  // Clear all pending timeouts
  for (const [, pending] of pendingResolvers) {
    clearTimeout(pending.timeout);
  }
  pendingResolvers.clear();
}
