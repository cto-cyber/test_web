import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

// --- Constants ---
const ROWS = 3
const COLS = 5
const CELL_HEIGHT = 72 // px per symbol cell
const SPIN_SYMBOLS = 20 // extra symbols above final position for scrolling
const BET_OPTIONS = [1, 5, 10, 25, 50]

const PAYTABLE: Record<string, { five: number; four: number; three: number }> = {
  '7️⃣': { five: 500, four: 100, three: 30 },
  '💎': { five: 300, four: 75, three: 20 },
  '⭐': { five: 200, four: 50, three: 15 },
  '🔔': { five: 150, four: 40, three: 12 },
  '🍀': { five: 100, four: 30, three: 10 },
  '🍇': { five: 75, four: 20, three: 8 },
  '🍊': { five: 50, four: 15, three: 5 },
  '🍋': { five: 40, four: 10, three: 4 },
  '🍒': { five: 25, four: 8, three: 3 },
}

// Weighted random symbol generation
const WEIGHTED_POOL: string[] = [
  ...Array(8).fill('🍒'),
  ...Array(7).fill('🍋'),
  ...Array(6).fill('🍊'),
  ...Array(5).fill('🍇'),
  ...Array(4).fill('🔔'),
  ...Array(3).fill('🍀'),
  ...Array(2).fill('⭐'),
  ...Array(2).fill('💎'),
  ...Array(1).fill('7️⃣'),
]

function getRandomSymbol(): string {
  return WEIGHTED_POOL[Math.floor(Math.random() * WEIGHTED_POOL.length)]
}

// Generate a 3×5 grid of random symbols
function generateGrid(): string[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => getRandomSymbol())
  )
}

// --- Win Line Definitions ---
// Each line is an array of [row, col] positions across the 5 reels
type WinLine = [number, number][]

const WIN_LINES: WinLine[] = [
  // Row lines
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], // top
  [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]], // middle
  [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], // bottom
  // V shapes
  [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]], // V
  [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]], // inverted V
]

interface WinResult {
  lineIndex: number
  symbol: string
  count: number
  multiplier: number
  positions: [number, number][]
}

function checkWins(grid: string[][]): WinResult[] {
  const wins: WinResult[] = []

  for (let li = 0; li < WIN_LINES.length; li++) {
    const line = WIN_LINES[li]
    const firstSymbol = grid[line[0][0]][line[0][1]]
    let count = 1

    for (let i = 1; i < line.length; i++) {
      const sym = grid[line[i][0]][line[i][1]]
      if (sym === firstSymbol) {
        count++
      } else {
        break
      }
    }

    if (count >= 3) {
      const pay = PAYTABLE[firstSymbol]
      if (pay) {
        const multiplier = count === 5 ? pay.five : count === 4 ? pay.four : pay.three
        wins.push({
          lineIndex: li,
          symbol: firstSymbol,
          count,
          multiplier,
          positions: line.slice(0, count) as [number, number][],
        })
      }
    }
  }

  return wins
}

// --- Smooth Scrolling Reel ---
function ReelColumn({ colIndex, finalSymbols, spinning, onStop }: {
  colIndex: number
  finalSymbols: string[] // 3 symbols (top, middle, bottom)
  spinning: boolean
  onStop: () => void
}) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [strip, setStrip] = useState<string[]>(finalSymbols)
  const [offset, setOffset] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const animFrameRef = useRef<number>(0)
  const posRef = useRef(0)
  const stoppedRef = useRef(false)

  useEffect(() => {
    if (spinning) {
      stoppedRef.current = false
      // Build strip: SPIN_SYMBOLS random + 3 final symbols
      const randomPart = Array.from({ length: SPIN_SYMBOLS }, () => getRandomSymbol())
      const newStrip = [...randomPart, ...finalSymbols]
      setStrip(newStrip)

      // Start from top (showing random symbols)
      posRef.current = 0
      setOffset(0)
      setTransitioning(false)

      // Delay start per column for staggered stop effect
      const spinDelay = colIndex * 300
      const spinDuration = 1200 + spinDelay

      // Animate scrolling with requestAnimationFrame
      let startTime = 0
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime

        if (elapsed < spinDuration) {
          // Fast scroll phase - move through random symbols
          const progress = elapsed / spinDuration
          const totalDistance = SPIN_SYMBOLS * CELL_HEIGHT
          // Ease out - start fast, slow down near the end
          const eased = 1 - Math.pow(1 - progress, 3)
          posRef.current = eased * totalDistance
          setOffset(posRef.current)
          animFrameRef.current = requestAnimationFrame(animate)
        } else {
          // Snap to final position
          const finalOffset = SPIN_SYMBOLS * CELL_HEIGHT
          posRef.current = finalOffset
          setTransitioning(true)
          setOffset(finalOffset)
          stoppedRef.current = true
          onStop()
        }
      }

      // Small delay before starting animation
      const startTimeout = setTimeout(() => {
        animFrameRef.current = requestAnimationFrame(animate)
      }, 50)

      return () => {
        clearTimeout(startTimeout)
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [spinning, finalSymbols, colIndex, onStop])

  return (
    <div
      className="reel-viewport rounded-xl bg-white border-2 border-neutral-300 relative"
      style={{ height: ROWS * CELL_HEIGHT, width: CELL_HEIGHT }}
    >
      <div
        ref={stripRef}
        className={`reel-strip ${transitioning ? '' : 'spinning'}`}
        style={{ transform: `translateY(-${offset}px)` }}
      >
        {strip.map((sym, i) => (
          <div
            key={i}
            className="flex items-center justify-center select-none"
            style={{ height: CELL_HEIGHT, width: CELL_HEIGHT, fontSize: '2.5rem' }}
          >
            {sym}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Paytable ---
function PaytablePanel() {
  return (
    <div className="bg-neutral-800 rounded-2xl p-4 sm:p-6 border border-neutral-700">
      <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">💰 Paytable (×bet)</h3>
      <div className="grid grid-cols-4 gap-2 text-sm">
        <div className="text-neutral-400 font-medium">Symbol</div>
        <div className="text-neutral-400 font-medium text-center">×5</div>
        <div className="text-neutral-400 font-medium text-center">×4</div>
        <div className="text-neutral-400 font-medium text-center">×3</div>
        {Object.entries(PAYTABLE).map(([symbol, pay]) => (
          <div key={symbol} className="contents">
            <div className="text-2xl">{symbol}</div>
            <div className="text-green-400 font-bold text-center flex items-center justify-center">{pay.five}×</div>
            <div className="text-green-300 text-center flex items-center justify-center">{pay.four}×</div>
            <div className="text-green-200 text-center flex items-center justify-center">{pay.three}×</div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-neutral-700 pt-3">
        <h4 className="text-sm font-bold text-yellow-400 mb-2">Win Lines (5)</h4>
        <div className="text-xs text-neutral-400 space-y-1">
          <div>━━━━━ Top row</div>
          <div>━━━━━ Middle row</div>
          <div>━━━━━ Bottom row</div>
          <div>╲ ╱ ╲ ╱ V-shape</div>
          <div>╱ ╲ ╱ ╲ Inverted V</div>
        </div>
      </div>
    </div>
  )
}

// --- History ---
interface HistoryEntry {
  id: number
  middleRow: string[]
  bet: number
  win: number
}

// --- Main App ---
function App() {
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(10)
  const [grid, setGrid] = useState<string[][]>(generateGrid)
  const [spinning, setSpinning] = useState(false)
  const [wins, setWins] = useState<WinResult[]>([])
  const [totalWin, setTotalWin] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showPaytable, setShowPaytable] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const stoppedCountRef = useRef(0)
  const historyIdRef = useRef(0)
  const autoPlayRef = useRef(false)
  const balanceRef = useRef(balance)
  const spinningRef = useRef(false)
  const gridRef = useRef(grid)
  const betRef = useRef(bet)

  // Keep refs in sync
  useEffect(() => { autoPlayRef.current = autoPlay }, [autoPlay])
  useEffect(() => { balanceRef.current = balance }, [balance])
  useEffect(() => { spinningRef.current = spinning }, [spinning])
  useEffect(() => { gridRef.current = grid }, [grid])
  useEffect(() => { betRef.current = bet }, [bet])

  const handleSpin = useCallback(() => {
    if (spinningRef.current) return
    if (balanceRef.current < betRef.current) return

    const currentBet = betRef.current
    setBalance(prev => prev - currentBet)
    setShowWin(false)
    setWins([])
    setTotalWin(0)
    stoppedCountRef.current = 0

    const newGrid = generateGrid()
    gridRef.current = newGrid
    setGrid(newGrid)
    spinningRef.current = true
    setSpinning(true)
  }, [])

  const handleReelStop = useCallback(() => {
    stoppedCountRef.current += 1
    if (stoppedCountRef.current >= COLS) {
      spinningRef.current = false
      setSpinning(false)

      // Check wins using ref (pure read, no side effects in updaters)
      const currentGrid = gridRef.current
      const currentBet = betRef.current
      const results = checkWins(currentGrid)
      const won = results.reduce((sum, w) => sum + w.multiplier * currentBet, 0)

      setWins(results)
      if (won > 0) {
        setTotalWin(won)
        setBalance(b => b + won)
        setShowWin(true)
        setTimeout(() => setShowWin(false), 3000)
      }

      historyIdRef.current += 1
      const entry: HistoryEntry = {
        id: historyIdRef.current,
        middleRow: currentGrid[1],
        bet: currentBet,
        win: won,
      }
      setHistory(h => [entry, ...h].slice(0, 20))

      // Auto-play
      if (autoPlayRef.current) {
        setTimeout(() => {
          if (autoPlayRef.current) {
            handleSpin()
          }
        }, 1500)
      }
    }
  }, [handleSpin])

  const handleAutoPlayToggle = () => {
    if (autoPlay) {
      setAutoPlay(false)
    } else {
      setAutoPlay(true)
      if (!spinningRef.current) {
        setTimeout(() => handleSpin(), 100)
      }
    }
  }

  // Collect all winning positions for highlighting
  const winPositions = new Set<string>()
  wins.forEach(w => {
    w.positions.forEach(([r, c]) => winPositions.add(`${r}-${c}`))
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-purple-950 to-neutral-900 text-white">
      {/* Win overlay */}
      {showWin && totalWin > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="win-animation bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-10 py-6 rounded-3xl shadow-2xl shadow-yellow-500/50 text-center">
            <div className="text-2xl font-bold">🎉 WIN! 🎉</div>
            <div className="text-5xl font-black mt-2">${totalWin}</div>
            <div className="text-sm mt-1">
              {wins.map((w, i) => (
                <span key={i}>{i > 0 ? ' + ' : ''}{w.count}×{w.symbol}</span>
              ))}
            </div>
          </div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="coin-fall fixed text-3xl pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-30px',
                animationDelay: `${Math.random() * 1}s`,
              }}
            >
              🪙
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="text-center pt-6 pb-3">
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          🎰 EMOJI SLOTS 🎰
        </h1>
        <p className="text-neutral-400 mt-1 text-sm">3×5 Reels • 5 Win Lines</p>
      </header>

      {/* Balance bar */}
      <div className="max-w-2xl mx-auto px-4 mb-4">
        <div className="flex justify-between items-center bg-neutral-800 rounded-xl px-5 py-3 border border-neutral-700">
          <div>
            <span className="text-neutral-400 text-xs">Balance</span>
            <div className="text-xl font-bold text-green-400">${balance.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <span className="text-neutral-400 text-xs">Lines</span>
            <div className="text-xl font-bold text-purple-400">5</div>
          </div>
          <div className="text-right">
            <span className="text-neutral-400 text-xs">Bet</span>
            <div className="text-xl font-bold text-yellow-400">${bet}</div>
          </div>
        </div>
      </div>

      {/* Slot machine */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-3xl p-4 sm:p-6 border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/10">
          {/* Reel grid */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-4 relative">
            {/* Win line indicators (left side) */}
            {!spinning && wins.length > 0 && (
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around z-10 -ml-1">
                {wins.map(w => {
                  const rowIdx = WIN_LINES[w.lineIndex][0][0]
                  return (
                    <div
                      key={w.lineIndex}
                      className="win-line-glow text-xs font-bold text-yellow-400 bg-yellow-500/20 rounded px-1"
                      style={{ position: 'absolute', top: rowIdx * CELL_HEIGHT + CELL_HEIGHT / 2 - 8 }}
                    >
                      {w.symbol}
                    </div>
                  )
                })}
              </div>
            )}

            {Array.from({ length: COLS }).map((_, colIdx) => (
              <ReelColumn
                key={colIdx}
                colIndex={colIdx}
                finalSymbols={[grid[0][colIdx], grid[1][colIdx], grid[2][colIdx]]}
                spinning={spinning}
                onStop={handleReelStop}
              />
            ))}
          </div>

          {/* Win result overlay on grid */}
          {!spinning && wins.length > 0 && (
            <div className="flex justify-center gap-2 sm:gap-3 mb-2 -mt-2">
              {Array.from({ length: COLS }).map((_, colIdx) => (
                <div key={colIdx} style={{ width: CELL_HEIGHT }} className="flex flex-col">
                  {Array.from({ length: ROWS }).map((_, rowIdx) => (
                    <div
                      key={rowIdx}
                      style={{ height: 4 }}
                      className={winPositions.has(`${rowIdx}-${colIdx}`) ? 'bg-yellow-400 rounded-full win-line-glow' : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Win display */}
          <div className="h-8 flex items-center justify-center mb-3">
            {!spinning && wins.length > 0 && (
              <div className="text-yellow-400 font-bold text-base animate-pulse">
                {wins.map((w, i) => (
                  <span key={i}>{i > 0 ? ' | ' : ''}{w.count}×{w.symbol} = ${w.multiplier * bet}</span>
                ))}
              </div>
            )}
            {!spinning && wins.length === 0 && history.length > 0 && (
              <div className="text-neutral-500 text-sm">Try again!</div>
            )}
          </div>

          {/* Bet selector */}
          <div className="flex justify-center gap-2 mb-4">
            {BET_OPTIONS.map(b => (
              <button
                key={b}
                onClick={() => { if (!spinning) setBet(b) }}
                disabled={spinning}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  bet === b
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                } disabled:opacity-50`}
              >
                ${b}
              </button>
            ))}
          </div>

          {/* Spin button */}
          <button
            onClick={handleSpin}
            disabled={spinning || balance < bet}
            className="w-full py-4 rounded-2xl text-xl font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-95"
          >
            {spinning ? '🎰 Spinning...' : balance < bet ? '💸 Not enough!' : '🎰 SPIN!'}
          </button>

          {/* Auto-play + Paytable */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleAutoPlayToggle}
              disabled={balance < bet && !autoPlay}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                autoPlay
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
              } disabled:opacity-40`}
            >
              {autoPlay ? '⏹ Stop Auto' : '▶ Auto Play'}
            </button>
            <button
              onClick={() => setShowPaytable(!showPaytable)}
              className="flex-1 py-2 rounded-xl text-sm font-bold bg-neutral-700 hover:bg-neutral-600 text-neutral-300 transition-all"
            >
              {showPaytable ? '✕ Close' : '📋 Paytable'}
            </button>
          </div>
        </div>
      </div>

      {/* Paytable */}
      {showPaytable && (
        <div className="max-w-2xl mx-auto px-4 mt-6">
          <PaytablePanel />
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 mt-6 pb-10">
          <h3 className="text-base font-bold text-neutral-400 mb-3">Recent Spins</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map(entry => (
              <div
                key={entry.id}
                className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm ${
                  entry.win > 0 ? 'bg-green-900/30 border border-green-700/50' : 'bg-neutral-800/50 border border-neutral-700/30'
                }`}
              >
                <div className="flex items-center gap-1">
                  {entry.middleRow.map((sym, i) => (
                    <span key={i} className="text-xl">{sym}</span>
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-neutral-400 text-xs">Bet: ${entry.bet}</div>
                  <div className={entry.win > 0 ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {entry.win > 0 ? `+$${entry.win}` : `-$${entry.bet}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
