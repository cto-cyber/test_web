import { useState, useCallback, useRef, useEffect } from 'react'
import './App.css'

// --- Emoji Symbols & Paytable ---

const PAYTABLE: Record<string, { three: number; two: number }> = {
  '7️⃣': { three: 150, two: 10 },
  '💎': { three: 100, two: 8 },
  '⭐': { three: 75, two: 5 },
  '🔔': { three: 50, two: 4 },
  '🍀': { three: 40, two: 3 },
  '🍇': { three: 30, two: 3 },
  '🍊': { three: 20, two: 2 },
  '🍋': { three: 15, two: 2 },
  '🍒': { three: 10, two: 1 },
}

const BET_OPTIONS = [1, 5, 10, 25, 50]

function getRandomSymbol(): string {
  // Weighted: rarer symbols appear less often
  const weighted = [
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
  return weighted[Math.floor(Math.random() * weighted.length)]
}

function checkWin(reels: string[]): { multiplier: number; symbol: string; count: number } | null {
  const [a, b, c] = reels
  if (a === b && b === c) {
    const pay = PAYTABLE[a]
    return pay ? { multiplier: pay.three, symbol: a, count: 3 } : null
  }
  if (a === b) {
    const pay = PAYTABLE[a]
    return pay ? { multiplier: pay.two, symbol: a, count: 2 } : null
  }
  if (b === c) {
    const pay = PAYTABLE[b]
    return pay ? { multiplier: pay.two, symbol: b, count: 2 } : null
  }
  return null
}

// --- Spinning Reel Component ---
function SpinningReel({ finalSymbol, spinning, delay, onStop }: {
  finalSymbol: string
  spinning: boolean
  delay: number
  onStop: () => void
}) {
  const [displaySymbol, setDisplaySymbol] = useState(finalSymbol)
  const [isSpinning, setIsSpinning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (spinning) {
      setIsSpinning(true)
      intervalRef.current = setInterval(() => {
        setDisplaySymbol(getRandomSymbol())
      }, 80)

      const timeout = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplaySymbol(finalSymbol)
        setIsSpinning(false)
        onStop()
      }, 1000 + delay)

      return () => {
        clearTimeout(timeout)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [spinning, finalSymbol, delay, onStop])

  return (
    <div className={`w-24 h-28 sm:w-32 sm:h-36 bg-white rounded-2xl border-4 ${isSpinning ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-neutral-300'} flex items-center justify-center transition-all duration-200`}>
      <span className={`text-5xl sm:text-6xl select-none ${isSpinning ? 'blur-sm' : ''} transition-all duration-150`}>
        {displaySymbol}
      </span>
    </div>
  )
}

// --- Paytable Component ---
function PaytablePanel() {
  return (
    <div className="bg-neutral-800 rounded-2xl p-4 sm:p-6 border border-neutral-700">
      <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">💰 Paytable</h3>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-neutral-400 font-medium">Symbol</div>
        <div className="text-neutral-400 font-medium text-center">×3</div>
        <div className="text-neutral-400 font-medium text-center">×2</div>
        {Object.entries(PAYTABLE).map(([symbol, pay]) => (
          <div key={symbol} className="contents">
            <div className="text-2xl">{symbol}</div>
            <div className="text-green-400 font-bold text-center flex items-center justify-center">{pay.three}×</div>
            <div className="text-green-300 text-center flex items-center justify-center">{pay.two}×</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- History Entry ---
interface HistoryEntry {
  id: number
  reels: string[]
  bet: number
  win: number
}

// --- Main App ---
function App() {
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(10)
  const [reels, setReels] = useState(['🍒', '💎', '🍋'])
  const [spinning, setSpinning] = useState(false)
  const [triggerSpin, setTriggerSpin] = useState(false)
  const [winResult, setWinResult] = useState<{ multiplier: number; symbol: string; count: number } | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showPaytable, setShowPaytable] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [, setStoppedReels] = useState(0)
  const historyIdRef = useRef(0)
  const autoPlayRef = useRef(false)

  useEffect(() => {
    autoPlayRef.current = autoPlay
  }, [autoPlay])

  const handleSpin = useCallback(() => {
    if (spinning) return
    if (balance < bet) return

    setBalance(prev => prev - bet)
    setShowWin(false)
    setWinResult(null)
    setWinAmount(0)
    setStoppedReels(0)

    const newReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
    setReels(newReels)
    setSpinning(true)
    setTriggerSpin(true)
  }, [spinning, balance, bet])

  const handleReelStop = useCallback(() => {
    setStoppedReels(prev => {
      const newCount = prev + 1
      if (newCount >= 3) {
        setTriggerSpin(false)
        setSpinning(false)

        setReels(currentReels => {
          const result = checkWin(currentReels)
          const won = result ? result.multiplier * bet : 0

          if (result) {
            setWinResult(result)
            setWinAmount(won)
            setBalance(b => b + won)
            setShowWin(true)
            setTimeout(() => setShowWin(false), 3000)
          }

          historyIdRef.current += 1
          const entry: HistoryEntry = {
            id: historyIdRef.current,
            reels: [...currentReels],
            bet,
            win: won,
          }
          setHistory(h => [entry, ...h].slice(0, 20))

          // Auto-play next spin
          if (autoPlayRef.current) {
            setTimeout(() => {
              if (autoPlayRef.current) {
                handleSpin()
              }
            }, 1500)
          }

          return currentReels
        })
      }
      return newCount
    })
  }, [bet, handleSpin])

  const handleAutoPlayToggle = () => {
    if (autoPlay) {
      setAutoPlay(false)
    } else {
      setAutoPlay(true)
      if (!spinning) {
        setTimeout(() => handleSpin(), 100)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-purple-950 to-neutral-900 text-white">
      {/* Win overlay */}
      {showWin && winAmount > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="win-animation bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-10 py-6 rounded-3xl shadow-2xl shadow-yellow-500/50 text-center">
            <div className="text-2xl font-bold">🎉 WIN! 🎉</div>
            <div className="text-5xl font-black mt-2">${winAmount}</div>
            <div className="text-lg mt-1">{winResult?.count}× {winResult?.symbol}</div>
          </div>
          {/* Coin rain */}
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
      <header className="text-center pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          🎰 EMOJI SLOTS 🎰
        </h1>
        <p className="text-neutral-400 mt-2">Spin to win!</p>
      </header>

      {/* Balance bar */}
      <div className="max-w-lg mx-auto px-4 mb-6">
        <div className="flex justify-between items-center bg-neutral-800 rounded-xl px-5 py-3 border border-neutral-700">
          <div>
            <span className="text-neutral-400 text-sm">Balance</span>
            <div className="text-2xl font-bold text-green-400">${balance.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <span className="text-neutral-400 text-sm">Bet</span>
            <div className="text-2xl font-bold text-yellow-400">${bet}</div>
          </div>
        </div>
      </div>

      {/* Slot machine */}
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-3xl p-6 sm:p-8 border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/10">
          {/* Reels */}
          <div className="flex justify-center gap-3 sm:gap-5 mb-6">
            {reels.map((symbol, i) => (
              <SpinningReel
                key={i}
                finalSymbol={symbol}
                spinning={triggerSpin}
                delay={i * 400}
                onStop={handleReelStop}
              />
            ))}
          </div>

          {/* Win line indicator */}
          <div className="h-8 flex items-center justify-center mb-4">
            {winResult && !spinning && (
              <div className="text-yellow-400 font-bold text-lg animate-pulse">
                {winResult.count}× {winResult.symbol} — Won ${winAmount}!
              </div>
            )}
            {!winResult && !spinning && history.length > 0 && history[0].win === 0 && (
              <div className="text-neutral-500 text-sm">Try again!</div>
            )}
          </div>

          {/* Bet selector */}
          <div className="flex justify-center gap-2 mb-5">
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

          {/* Auto-play + Paytable buttons */}
          <div className="flex gap-3 mt-4">
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
        <div className="max-w-lg mx-auto px-4 mt-6">
          <PaytablePanel />
        </div>
      )}

      {/* Spin History */}
      {history.length > 0 && (
        <div className="max-w-lg mx-auto px-4 mt-6 pb-10">
          <h3 className="text-lg font-bold text-neutral-400 mb-3">Recent Spins</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map(entry => (
              <div
                key={entry.id}
                className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm ${
                  entry.win > 0 ? 'bg-green-900/30 border border-green-700/50' : 'bg-neutral-800/50 border border-neutral-700/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{entry.reels[0]}</span>
                  <span className="text-2xl">{entry.reels[1]}</span>
                  <span className="text-2xl">{entry.reels[2]}</span>
                </div>
                <div className="text-right">
                  <div className="text-neutral-400">Bet: ${entry.bet}</div>
                  <div className={entry.win > 0 ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {entry.win > 0 ? `+$${entry.win}` : '-$' + entry.bet}
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
