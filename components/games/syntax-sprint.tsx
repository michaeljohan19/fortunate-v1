'use client'

import { useGame } from '@/app/game-context'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { InstructionModal } from '@/components/instruction-modal'

interface SyntaxSprintProps {
  onComplete: (coins: number, stayInGame?: boolean) => void
}

const SNIPPETS = [
  'git commit -m "fixed production database typo"',
  'const [coins, setCoins] = useState(0);',
  'npm install @types/react --save-dev',
  'SELECT * FROM users WHERE gems > 100 ORDER BY id DESC;',
  'document.getElementById("root").render(<App />);',
  'sudo rm -rf /node_modules && npm install',
  'display: flex; justify-content: center; align-items: center;',
  'export const getStaticProps = async () => {',
  'console.error("Uncaught TypeError: undefined is not a function");',
  'docker-compose up --build -d',
  'await supabase.from("profiles").select("*");',
  'border-radius: 0.75rem; backdrop-filter: blur(8px);',
  'python3 -m venv venv && source venv/bin/activate',
  'interface User { id: string; email: string; }',
  'import { SyntaxSprintGame } from "games/syntax-sprint"'
]

export const SyntaxSprintGame: React.FC<SyntaxSprintProps> = ({ onComplete }) => {
  const { gameState: globalContext, consumeBuff, completeDailyTask } = useGame();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start')
  const [showRules, setShowRules] = useState(false)
  
  // Game Flow
  const [currentLine, setCurrentLine] = useState(1)
  const totalLines = 5
  const [snippet, setSnippet] = useState('')
  const [input, setInput] = useState('')
  
  // Timing & Stats
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [liveWpm, setLiveWpm] = useState(0)
  const [accumulatedChars, setAccumulatedChars] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  // --- LOGIC ---
  const getRandomSnippet = () => SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]

  const startGame = useCallback(() => {
    setSnippet(getRandomSnippet())
    setCurrentLine(1)
    setInput('')
    setStartTime(Date.now())
    setEndTime(null)
    setMistakes(0)
    setTotalKeystrokes(0)
    setLiveWpm(0)
    setAccumulatedChars(0)
    setGameState('playing')
  }, [])

  const nextLine = () => {
    if (currentLine >= totalLines) {
      setEndTime(Date.now())
      setGameState('gameover')
    } else {
      setAccumulatedChars(prev => prev + snippet.length)
      setSnippet(getRandomSnippet())
      setInput('')
      setCurrentLine(prev => prev + 1)
    }
  }

  // Live WPM calculation
  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      timerInterval.current = setInterval(() => {
        const timeElapsedMin = (Date.now() - startTime) / 60000
        // Total characters = already finished lines + current input length
        const totalChars = accumulatedChars + input.length
        const currentWpm = Math.floor((totalChars / 5) / Math.max(timeElapsedMin, 0.01))
        setLiveWpm(currentWpm)
      }, 500)
    }
    return () => { if (timerInterval.current) clearInterval(timerInterval.current) }
  }, [gameState, startTime, input.length, accumulatedChars])

  // NEW: Restart Hotkey (Ctrl+R / Cmd+R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl or Cmd (Mac) + R
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        if (gameState === 'playing') {
          e.preventDefault(); // Stop the browser from refreshing!
          startGame();        // Reset the game and timer
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return
    const newValue = e.target.value
    if (newValue.length > snippet.length) return

    setTotalKeystrokes(prev => prev + 1)

    // Mistake detection
    if (newValue.length > input.length) {
      const lastCharTyped = newValue[newValue.length - 1]
      const expectedChar = snippet[newValue.length - 1]
      if (lastCharTyped !== expectedChar) {
        setMistakes(prev => prev + 1)
      }
    }
    setInput(newValue)

    // Auto-advance or wait for Enter? 
    // In speed typing, auto-advancing when the string matches is smoother.
    if (newValue === snippet) {
      nextLine()
    }
  }

  const renderText = () => {
    return snippet.split('').map((char, index) => {
      let colorClass = 'text-slate-500' 
      let bgClass = ''
      const isCurrentCaret = index === input.length && gameState === 'playing'

      if (index < input.length) {
        colorClass = input[index] === char 
          ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' 
          : 'text-red-200 bg-red-500/40 rounded-sm'
      }

      return (
        <span key={index} className={`relative transition-colors duration-75 ${colorClass} ${bgClass}`}>
          {isCurrentCaret && <span className="absolute bottom-0 left-0 w-full h-0.75 bg-amber-400 animate-pulse" />}
          {char}
        </span>
      )
    })
  }

  // --- ECONOMY ---
  if (gameState === 'gameover' && startTime && endTime) {
    const totalChars = accumulatedChars + snippet.length
    const timeElapsedMin = (endTime - startTime) / 60000
    const finalWpm = Math.floor((totalChars / 5) / timeElapsedMin)
    const accuracy = Math.max(0, Math.floor(((totalKeystrokes - mistakes) / totalKeystrokes) * 100))

    // 1. Base Payout Math
    const basePayout = 40;
    const speedBonus = finalWpm > 40 ? Math.floor((finalWpm - 40) / 1.5) : 0;
    const accuracyMultiplier = accuracy === 100 ? 1.5 : accuracy > 90 ? 1.0 : accuracy > 75 ? 0.6 : 0.2;
    const coinsEarned = Math.floor((basePayout + speedBonus) * accuracyMultiplier)

    // 2. Check for Coffee Buff and Calculate Final Coins
    const hasCoffee = globalContext.activeBuffs?.arcadeDoubleCoins;
    const finalCoins = hasCoffee ? coinsEarned * 2 : coinsEarned;

    return (
      <div className="text-center py-12 max-w-lg mx-auto fade-in">
        <h2 className="text-5xl font-black mb-6 text-emerald-400 drop-shadow-md italic">BUILD SUCCESS!</h2>
        
        {/* Added relative and overflow-hidden for the banner */}
        <div className="bg-slate-800/60 p-8 rounded-3xl border-2 border-slate-700 mb-8 w-full shadow-xl relative overflow-hidden">
          
          {/* NEW: ☕ Coffee Buff Banner */}
          {hasCoffee && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner text-center">
              ☕ Caffeine Rush Active
            </div>
          )}

          <div className={`flex justify-between items-center mb-4 ${hasCoffee ? 'mt-4' : ''}`}>
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Speed</span>
            <span className="text-3xl font-black text-cyan-400">{finalWpm} WPM</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Accuracy</span>
            <span className={`text-3xl font-black ${accuracy === 100 ? 'text-amber-400' : 'text-white'}`}>{accuracy}%</span>
          </div>
          <div className="w-full h-1 bg-slate-700 mb-6 rounded-full" />
          <p className="text-sm text-slate-400 font-bold mb-1 uppercase tracking-tighter">Reward Earned</p>
          
          {/* NEW: Dynamic Coin Display */}
          {hasCoffee ? (
             <div className="flex items-center justify-center gap-4 mt-2">
               {/* Original Amount Crossed Out */}
               <p className="text-3xl font-bold text-slate-500 line-through opacity-70">🪙 {coinsEarned}</p>
               <p className="text-2xl text-amber-500 font-black animate-pulse">➔</p>
               {/* Doubled Amount */}
               <p className="text-6xl font-black text-amber-400 drop-shadow-md tracking-tighter">🪙 {finalCoins}</p>
             </div>
           ) : (
             <p className="text-6xl font-black text-amber-400 drop-shadow-md tracking-tighter">🪙 {finalCoins}</p>
           )}
        </div>
        
        <button 
          onClick={() => { 
            // 3. CONSUME THE BUFF BEFORE LEAVING!
            if (hasCoffee) {
              consumeBuff('arcadeDoubleCoins');
            }
            if (finalWpm >= 30) {
              completeDailyTask('syntax-sprint'); // <-- Change this to your exact task ID!
            }
            // 4. Pass the FINAL coins and reset
            onComplete(finalCoins, true); 
            setGameState('start'); 
          }} 
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-12 py-4 rounded-full text-xl transform hover:scale-105 transition-all shadow-lg"
        >
          COLLECT & NEXT SPRINT 🎊
        </button>
      </div>
    )
  }

  // --- RENDERING ---
  if (gameState === 'start') {
    return (
      <>
        {/* Added 'relative', 'fade-in', and 'flex flex-col items-center' */}
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border-2 border-dashed border-cyan-500/30 max-w-lg mx-auto fade-in relative flex flex-col items-center">
          
          {/* THE NEW '?' BUTTON */}
          <button 
            onClick={() => setShowRules(true)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-cyan-400 font-black text-xl flex items-center justify-center hover:bg-slate-700 hover:text-cyan-300 hover:scale-110 transition-all shadow-lg z-10"
            title="How to Play"
          >
            ?
          </button>

          <div className="text-7xl mb-6 mt-4">⌨️⚡</div>
          <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">Syntax Sprint</h2>
          
          {/* Cleaned up text since the rules are in the modal now */}
          <p className="text-cyan-300 mb-8 max-w-sm mx-auto px-4 text-sm">
            Complete <strong>5 lines of code</strong> as fast as possible without making mistakes.
          </p>

          <button 
            onClick={startGame} 
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-12 py-5 rounded-2xl text-2xl transform hover:scale-110 transition-all shadow-xl shadow-cyan-500/20"
          >
            START SPRINT
          </button>
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
          title="Syntax Sprint" 
          titleIcon="⌨️⚡" 
          rules={[
            { icon: '🏎️', text: <p><strong>Speed:</strong> High WPM (Words Per Minute) boosts your base coin payout.</p> },
            { icon: '🎯', text: <p><strong>Accuracy:</strong> Achieving 100% accuracy gives you a massive <strong>1.5x Multiplier</strong>!</p> },
            { icon: '🔄', text: <p><strong>Flow:</strong> The game automatically moves to the next line when typed correctly.</p> }
          ]} 
          themeColor="cyan" 
        />
      </>
    )
  }

  // --- MAIN GAME RENDERING ---
  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="flex justify-between items-end mb-6 px-4">
        
        {/* LEFT: Progress */}
        <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
           <span className="text-[10px] font-black text-slate-500 uppercase block leading-none mb-1">Progress</span>
           <span className="text-xl font-black text-white">{currentLine} <span className="text-slate-600">/</span> {totalLines}</span>
        </div>

        {/* CENTER: Restart Button */}
        <button
          onClick={startGame}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl border border-slate-600 transition-all text-sm font-bold shadow-md group"
          title="Restart (Ctrl/Cmd + R)"
        >
          <span className="group-hover:-rotate-180 transition-transform duration-300">🔄</span> Restart 
          <span className="hidden md:inline-block text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700 ml-1">⌘R</span>
        </button>

        {/* RIGHT: Live Speed */}
        <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 text-right">
           <span className="text-[10px] font-black text-slate-500 uppercase block leading-none mb-1">Live Speed</span>
           <span className="text-xl font-black text-cyan-400">{liveWpm} <span className="text-xs">WPM</span></span>
        </div>
      </div>

      <div className="relative bg-slate-950 border-4 border-slate-800 rounded-3xl p-10 md:p-14 shadow-2xl cursor-text min-h-45 flex items-center justify-center" onClick={() => inputRef.current?.focus()}>
        <input ref={inputRef} type="text" value={input} onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-text" autoFocus spellCheck="false" autoComplete="off" />
        <div className="text-xl md:text-2xl lg:text-3xl font-mono leading-relaxed whitespace-pre-wrap text-center select-none tracking-wide font-medium w-full">
          {renderText()}
        </div>
      </div>
      <p className="text-center text-slate-600 mt-6 text-xs font-bold uppercase tracking-widest animate-pulse">
        Linetype active • Keep typing to advance
      </p>
    </div>
  )
}