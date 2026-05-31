'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useGame } from '@/app/game-context' // <-- Ensure this path is correct for your project!
import { InstructionModal } from '@/components/instruction-modal'

interface WordleGameProps {
  onComplete: (coins: number, stayInGame?: boolean) => void
}

const TECH_WORDS = [
  'REACT', 'LINUX', 'LOGIC', 'CACHE', 'ARRAY', 
  'DEBUG', 'QUERY', 'CLOUD', 'STACK', 'VIRUS', 
  'BYTES', 'PROXY', 'TOKEN', 'MACRO', 'PIXEL', 
  'MOUSE', 'BOARD', 'FRAME', 'SWIFT', 'ROBOT',
  'AGILE', 'ALIAS', 'APPLE', 'ASCII', 'ASYNC', 
  'AUDIO', 'BASIC', 'BLOCK', 'BUILD', 'CLICK', 
  'CLONE', 'COBOL', 'CODEC', 'CRASH', 'CRYPT', 
  'CYBER', 'DRIVE', 'ERROR', 'EVENT', 'EXCEL', 
  'FETCH', 'FIBER', 'FLASH', 'FLOAT', 'FORUM', 
  'GATES', 'GRAPH', 'IMAGE', 'INDEX', 'INPUT', 
  'INTEL', 'LAYER', 'LOGIN', 'MODEM', 'MOUNT', 
  'NODES', 'OCTAL', 'PANEL', 'PATCH', 'PRINT', 
  'QUEUE', 'RESET', 'ROUTE', 'SCOPE', 'SETUP', 
  'SHELL', 'SHIFT', 'THEME', 'VALUE', 'VIDEO'
]

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
]

export const WordleGame: React.FC<WordleGameProps> = ({ onComplete }) => {
  const { gameState: globalContext, addCoins, consumeBuff, completeDailyTask } = useGame();
  const { gameState } = useGame();
  
  const [gameStarted, setGameStarted] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [targetWord, setTargetWord] = useState('')
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  // METAGAME STATES
  const [streak, setStreak] = useState(0)
  const [gamesPlayed, setGamesPlayed] = useState(1)
  const [hints, setHints] = useState<Record<number, string>>({})
  const [gachaTile, setGachaTile] = useState<{row: number, col: number, claimed: boolean, bonus: number} | null>(null)

  // Setup the board
  const setupBoard = useCallback((isNextGame = false) => {
    setTargetWord(TECH_WORDS[Math.floor(Math.random() * TECH_WORDS.length)])
    setGuesses([])
    setCurrentGuess('')
    setGameOver(false)
    setWon(false)
    setHints({})

    const currentGameCount = isNextGame ? gamesPlayed + 1 : gamesPlayed;
    if (isNextGame) setGamesPlayed(currentGameCount);

    // GACHA TILE: Appears every 3rd game!
    if (currentGameCount % 3 === 0) {
      setGachaTile({
        row: Math.floor(Math.random() * 6),
        col: Math.floor(Math.random() * 5),
        claimed: false,
        bonus: Math.floor(Math.random() * 11) + 5 // Random 5 to 15 coins
      })
    } else {
      setGachaTile(null)
    }
  }, [gamesPlayed])

  // First load
  useEffect(() => {
    setupBoard(false)
  }, [setupBoard])

  // --- GAME LOGIC ---
const handleKeyPress = useCallback((key: string) => {
    // 👈 NEW: Check if the game has started!
    if (gameOver || !gameStarted) return 

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) return
      
      // 1. Process Gacha Tile Claim
      let tileClaimedThisTurn = false;
      if (gachaTile && !gachaTile.claimed && guesses.length === gachaTile.row) {
        if (currentGuess[gachaTile.col] === targetWord[gachaTile.col]) {
          setGachaTile(prev => ({ ...prev!, claimed: true }))
          tileClaimedThisTurn = true;
        }
      }

      // 2. Add Guess
      const newGuesses = [...guesses, currentGuess]
      setGuesses(newGuesses)
      setCurrentGuess('')

      // 3. Check Win/Loss
      if (currentGuess === targetWord) {
        setWon(true)
        setGameOver(true)
        setStreak(s => s + 1) // 🔥 STREAK GOES UP
        completeDailyTask('wordle')
      } else if (newGuesses.length >= 6) {
        setGameOver(true)
        setStreak(0) // 🧊 STREAK BROKEN
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key)
    }
  }, [currentGuess, gameOver, guesses, targetWord, gachaTile, gameStarted, completeDailyTask])

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKeyPress('ENTER')
      else if (e.key === 'Backspace') handleKeyPress('BACKSPACE')
      else handleKeyPress(e.key.toUpperCase())
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])

  // --- METAGAME LOGIC ---
  const buyHint = () => {
    // Check global coins instead of currentCoins
    if (gameState.coins < 25 || gameOver) return

    // Find slots that are NOT already revealed by green guesses or previous hints
    const knownGreenIndices = new Set<number>()
    guesses.forEach(g => g.split('').forEach((l, i) => { if (targetWord[i] === l) knownGreenIndices.add(i) }))
    Object.keys(hints).forEach(k => knownGreenIndices.add(Number(k)))

    const availableIndices = [0,1,2,3,4].filter(i => !knownGreenIndices.has(i))
    if (availableIndices.length === 0) return // Word is basically solved!

    addCoins(-25) // Deduct directly from the global bank!
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
    setHints(prev => ({ ...prev, [randomIndex]: targetWord[randomIndex] }))
  }

  // --- HELPER FUNCTIONS ---
  const getLetterStatus = (letter: string, index: number, wordObj: string) => {
    if (wordObj[index] === letter) return 'correct'
    if (wordObj.includes(letter)) return 'present'
    return 'absent'
  }

  // --- HELPER FUNCTIONS ---
  const getGuessStatuses = (guess: string, target: string) => {
    const statuses = Array(5).fill('absent')
    const targetCharCount: Record<string, number> = {}

    for (const char of target) {
      targetCharCount[char] = (targetCharCount[char] || 0) + 1
    }

    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        statuses[i] = 'correct'
        targetCharCount[guess[i]] -= 1
      }
    }

    for (let i = 0; i < 5; i++) {
      if (statuses[i] !== 'correct' && targetCharCount[guess[i]] > 0) {
        statuses[i] = 'present'
        targetCharCount[guess[i]] -= 1
      }
    }

    return statuses
  }

  const getKeyColor = (key: string) => {
    if (key === 'ENTER' || key === 'BACKSPACE') return 'bg-slate-700 text-white px-2'
    
    let status = 'bg-slate-800 text-white'
    guesses.forEach(guess => {
      // Get the full array of statuses for this past guess
      const statuses = getGuessStatuses(guess, targetWord)
      
      guess.split('').forEach((letter, i) => {
        if (letter === key) {
          const lStatus = statuses[i]
          if (lStatus === 'correct') status = 'bg-emerald-500 text-white'
          else if (lStatus === 'present' && status !== 'bg-emerald-500 text-white') status = 'bg-amber-500 text-white'
          else if (lStatus === 'absent' && status === 'bg-slate-800 text-white') status = 'bg-slate-900 text-slate-500 opacity-50'
        }
      })
    })
    return status
  }

  // --- RENDERING ---
  // NEW: Start Screen
  if (!gameStarted) {
    return (
      <>
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border-2 border-dashed border-emerald-500/30 max-w-lg mx-auto fade-in relative flex flex-col items-center">
          
          {/* THE '?' BUTTON */}
          <button 
            onClick={() => setShowRules(true)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-emerald-400 font-black text-xl flex items-center justify-center hover:bg-slate-700 hover:text-emerald-300 hover:scale-110 transition-all shadow-lg z-10"
            title="How to Play"
          >
            ?
          </button>

          <div className="text-7xl mb-6 mt-4">🟩🟨</div>
          <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">Tech Wordle</h2>
          
          <p className="text-emerald-300 mb-8 max-w-sm mx-auto px-4 text-sm">
            Hack the mainframe! Guess the 5-letter tech word in 6 tries.
          </p>

          <button 
            onClick={() => setGameStarted(true)} 
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-12 py-5 rounded-2xl text-2xl transform hover:scale-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
          >
            START HACKING 🔓
          </button>
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
          title="Tech Wordle" 
          titleIcon="🟩" 
          rules={[
            { icon: '🟩', text: <p><strong>Exact Match:</strong> The letter is in the word and in the correct spot.</p> },
            { icon: '🟨', text: <p><strong>Partial Match:</strong> The letter is in the word, but in the wrong spot.</p> },
            { icon: '🔥', text: <p><strong>Streaks & Gacha:</strong> Build win streaks for coin multipliers, and guess correctly on a <strong>Gacha Tile (✨)</strong> for bonus loot!</p> }
          ]} 
          themeColor="emerald" 
        />
      </>
    )
  }

  const emptyRows = Math.max(0, 6 - guesses.length - (gameOver ? 0 : 1))
  // ... rest of your existing gameOver and main game rendering code continues here!

  if (gameOver) {
    // 1. Check for Coffee Buff
    // (Ensure `const { gameState: globalContext, consumeBuff } = useGame();` is at the top of your component!)
    const hasCoffee = globalContext.activeBuffs?.arcadeDoubleCoins;

    const rewardScale = [60, 50, 40, 30, 20, 10]
    const baseCoins = won ? rewardScale[guesses.length - 1] : 5
    
    // 🔥 10% bonus per streak level! (Maxes out at 50% bonus)
    const streakBonus = won && streak > 1 ? Math.floor(baseCoins * (Math.min(streak, 5) * 0.1)) : 0
    const gachaCoins = gachaTile?.claimed ? gachaTile.bonus : 0
    
    // 2. Calculate Subtotal and Final Doubled Total
    const subTotalCoins = baseCoins + streakBonus + gachaCoins
    const finalCoins = hasCoffee ? subTotalCoins * 2 : subTotalCoins

    return (
      <div className="text-center py-8 max-w-lg mx-auto fade-in">
        <h2 className={`text-5xl font-black mb-6 drop-shadow-md ${won ? 'text-emerald-400' : 'text-red-400'}`}>
          {won ? 'HACKED! 🔓' : 'SYSTEM LOCKED 🔒'}
        </h2>
        
        {/* Added relative and overflow-hidden for the banner */}
        <div className="bg-slate-800/60 p-8 rounded-3xl border-2 border-slate-700 mb-8 inline-block min-w-75 shadow-xl text-left relative overflow-hidden">
          
          {/* NEW: ☕ Coffee Buff Banner */}
          {hasCoffee && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner text-center">
              ☕ Caffeine Rush Active
            </div>
          )}

          <p className={`text-xl mb-2 text-gray-400 text-center ${hasCoffee ? 'mt-4' : ''}`}>Target Word:</p>
          <p className="text-4xl font-black text-cyan-400 tracking-widest mb-6 text-center">{targetWord}</p>
          <div className="w-full h-1 bg-slate-700 mb-4 rounded-full" />
          
          <div className="space-y-2 font-bold text-slate-300">
            <div className="flex justify-between"><span>Base Reward:</span> <span>🪙 {baseCoins}</span></div>
            {streakBonus > 0 && <div className="flex justify-between text-orange-400"><span>Streak Bonus (x{streak}):</span> <span>+🪙 {streakBonus}</span></div>}
            {gachaCoins > 0 && <div className="flex justify-between text-amber-300"><span>✨ Gacha Tile:</span> <span>+🪙 {gachaCoins}</span></div>}
          </div>
          
          <div className="w-full h-1 bg-slate-700 my-4 rounded-full" />
          
          {/* NEW: Dynamic Coin Display */}
          <div className="text-center">
            {hasCoffee ? (
              <div className="flex items-center justify-center gap-4 mt-2">
                <p className="text-3xl font-bold text-slate-500 line-through opacity-70">🪙 {subTotalCoins}</p>
                <p className="text-2xl text-amber-500 font-black animate-pulse">➔</p>
                <p className="text-5xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
              </div>
            ) : (
              <p className="text-5xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-center w-full">
          <button 
            onClick={() => {
              // 3. CONSUME THE BUFF BEFORE LEAVING!
              if (hasCoffee) {
                consumeBuff('arcadeDoubleCoins');
              }
              // 4. Pass the FINAL coins and restart!
              onComplete(finalCoins, true); 
              setupBoard(true); 
            }} 
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-12 py-4 rounded-full text-xl transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            COLLECT & RESTART
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto fade-in flex flex-col items-center">
      
      {/* HEADER: STREAK & HINTS */}
      <div className="w-full flex justify-between items-center mb-2">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase font-black tracking-widest">Active Streak</span>
          <span className="text-2xl font-black text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">
            🔥 {streak}
          </span>
        </div>
        
        <button 
          onClick={buyHint}
          disabled={gameState.coins < 25 || Object.keys(hints).length >= 4}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 px-4 py-2 rounded-xl transition-all active:scale-95"
        >
          <span className="text-xl">💡</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-none">REVEAL LETTER</span>
            <span className="text-[10px] text-amber-400 font-bold">-25 🪙</span>
          </div>
        </button>
      </div>

      {/* REVEALED HINTS BAR */}
      {Object.keys(hints).length > 0 && (
        <div className="w-full flex justify-center gap-2 mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
          {Array.from({length: 5}).map((_, i) => (
            <div key={`hint-${i}`} className="w-8 h-8 flex items-center justify-center font-black text-xl text-cyan-300 border-b-2 border-cyan-500/30">
              {hints[i] || '?'}
            </div>
          ))}
        </div>
      )}

      {/* 6x5 GRID */}
      <div className="grid grid-rows-6 gap-2 mb-2">
        
        {/* 1. Past Guesses */}
        {guesses.map((guess, rowIdx) => {
          // THE FIX: Calculate the whole row's colors at once!
          const statuses = getGuessStatuses(guess, targetWord)

          return (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {guess.split('').map((letter, colIdx) => {
                // Grab the exact status for this specific column
                const status = statuses[colIdx] 
                const color = status === 'correct' ? 'bg-emerald-500 border-emerald-500' : status === 'present' ? 'bg-amber-500 border-amber-500' : 'bg-slate-700 border-slate-700'
                
                // Was this the claimed Gacha tile?
                const isClaimedTile = gachaTile?.claimed && gachaTile.row === rowIdx && gachaTile.col === colIdx;

                return (
                  <div key={colIdx} className={`relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-black text-white rounded-xl border-2 ${color} shadow-lg transition-all`}>
                    {letter}
                    {isClaimedTile && <div className="absolute -top-2 -right-2 text-lg drop-shadow-md">✨</div>}
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* 2. Current Active Row */}
        {!gameOver && (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, colIdx) => {
              const isGachaActive = gachaTile && !gachaTile.claimed && gachaTile.row === guesses.length && gachaTile.col === colIdx;

              return (
                <div key={colIdx} className={`relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-black rounded-xl border-2 transition-all ${
                  isGachaActive ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse' 
                  : currentGuess[colIdx] ? 'border-cyan-400 text-white border-b-4' 
                  : 'border-slate-700 bg-slate-800/50'
                }`}>
                  {currentGuess[colIdx] || ''}
                  {isGachaActive && <div className="absolute -top-1 -right-1 text-xs">🪙</div>}
                </div>
              )
            })}
          </div>
        )}

        {/* 3. Empty Remaining Rows */}
        {Array.from({ length: emptyRows }).map((_, rawRowIdx) => {
          const actualRowIdx = guesses.length + 1 + rawRowIdx; // Calculate which actual row this is
          return (
            <div key={`empty-${actualRowIdx}`} className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, colIdx) => {
                const isGachaDormant = gachaTile && !gachaTile.claimed && gachaTile.row === actualRowIdx && gachaTile.col === colIdx;
                
                return (
                  <div key={`empty-col-${colIdx}`} className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 transition-all ${
                    isGachaDormant ? 'border-amber-500/50 bg-amber-500/5 shadow-[0_0_10px_rgba(251,191,36,0.1)]' : 'border-slate-700/50 bg-slate-800/30'
                  }`}>
                    {isGachaDormant && <div className="absolute inset-0 flex items-center justify-center opacity-30 text-amber-500 font-bold text-xs">✨</div>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* ON-SCREEN KEYBOARD */}
      <div className="w-full flex flex-col gap-2 px-2">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1.5 md:gap-2">
            {row.map(key => {
              const isActionKey = key === 'ENTER' || key === 'BACKSPACE';
              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`h-12 flex-1 md:flex-none rounded-lg font-bold transition-all active:scale-90 ${
                    isActionKey ? 'px-2' : 'md:w-10'
                  } ${getKeyColor(key)}`}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>

    </div>
  )
}