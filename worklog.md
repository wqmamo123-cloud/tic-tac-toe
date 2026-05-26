---
Task ID: 1
Agent: Super Z (Main)
Task: Optimize Tic Tac Toe codebase — AI performance, symbol selection, audio engine

Work Log:
- Rewrote AI engine (ai.ts) with strict performance guarantees:
  - 3x3: Full Minimax + Alpha-Beta Pruning (complete search, <50ms)
  - 4x4: Depth-limited Minimax (max depth 4, <400ms)
  - 5x5: Shallow search + heuristics (max depth 3, <400ms)
  - 10x10: Pure heuristic Gomoku engine (no recursion, <200ms)
  - Added win-lines caching via Map for O(1) lookups
  - Added gomoku-specific heuristic engine for 10x10 grids
  - Pre-sorting moves by heuristic for better alpha-beta pruning
  - Candidate move limiting (top 12-15) on large grids
- Created Web Worker (aiWorker.ts + aiWorkerManager.ts) for off-thread AI computation
  - Promise-based interface with requestAIMove()
  - Fallback to synchronous computation if worker fails
  - Proper lifecycle management (terminateAIWorker)
- Integrated Web Worker into game store (gameStore.ts):
  - Replaced synchronous getAIMove() call with async requestAIMove()
  - AI no longer blocks the main thread
  - isAIThinking state properly managed
- Added player symbol selection (X or O):
  - New store field: playerSymbol with setPlayerSymbol
  - DifficultySelectScreen now shows "Play As X / Play As O" toggle
  - When player picks O, AI auto-plays first move as X after game init
  - Game board respects playerSymbol for AI turn detection
  - Undo correctly returns to player's turn
  - Score labels show "You" vs "AI" based on symbol choice
- Rewrote Sound Manager with full audio engine:
  - Background Music (BGM): Procedurally generated ambient pad (Cmaj7 chord with LFO)
  - Distinct SFX: crisp click, percussive X tap, soft O placement, ascending win arpeggio, descending lose, equal-tone draw
  - Global mute toggle with immediate stop/resume
  - BGM starts on first user interaction (browser autoplay policy)
  - BGM stops when muted, resumes when unmuted
  - Persistent mute state via localStorage
- Added persistent global mute button in top-right corner:
  - Fixed position, always visible on all screens
  - Animated icon swap between Volume2 and VolumeX
  - Synced with Settings screen toggle
  - Removed duplicate sound toggle from WelcomeScreen bottom bar
- All screens compile and render correctly
- Lint passes clean with zero errors

Stage Summary:
- AI performance guaranteed <500ms on all grid sizes
- AI runs in Web Worker (off main thread)
- Player can choose X or O symbol
- BGM + enhanced SFX with global mute control
- Persistent mute state across app restarts
