/**
 * AI Worker Manager — manages the Web Worker lifecycle and provides
 * a Promise-based interface for off-thread AI computation.
 */

let worker: Worker | null = null;
let requestId = 0;
const pendingResolvers = new Map<number, { resolve: (move: number) => void; reject: (err: Error) => void }>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../game/aiWorker.ts', import.meta.url));
    worker.onmessage = (e: MessageEvent<{ move: number; requestId: number }>) => {
      const { move, requestId: id } = e.data;
      const pending = pendingResolvers.get(id);
      if (pending) {
        pendingResolvers.delete(id);
        pending.resolve(move);
      }
    };
    worker.onerror = (err) => {
      // Reject all pending on error
      for (const [id, pending] of pendingResolvers) {
        pendingResolvers.delete(id);
        pending.reject(new Error(err.message));
      }
    };
  }
  return worker;
}

/**
 * Request AI move via Web Worker. Returns a Promise that resolves to the move index.
 * Falls back to synchronous computation if the worker fails.
 */
export function requestAIMove(
  board: (string | null)[],
  gridSize: number,
  winCondition: number,
  difficulty: string,
  aiPlayer: 'X' | 'O'
): Promise<number> {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    pendingResolvers.set(id, { resolve, reject });

    try {
      const w = getWorker();
      w.postMessage({
        board,
        gridSize,
        winCondition,
        difficulty,
        aiPlayer,
        requestId: id,
      });
    } catch {
      pendingResolvers.delete(id);
      // Fallback: run synchronously
      import('../game/ai').then(({ getAIMove }) => {
        resolve(getAIMove(board, gridSize, winCondition, difficulty as 'easy' | 'medium' | 'hard' | 'impossible', aiPlayer));
      }).catch(reject);
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
  pendingResolvers.clear();
}
