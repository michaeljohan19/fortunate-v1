'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useGame } from '@/app/game-context'
import { InstructionModal } from '@/components/instruction-modal'
import { SNIPPET_POOL, CodeSnippet } from '@/data/snippets' // <-- Import from data file


interface SyntaxGameProps {
  onComplete: (coins: number, stayInGame?: boolean) => void
}

export const SyntaxGame: React.FC<SyntaxGameProps> = ({ onComplete }) => {
  const { addCoins } = useGame()
  const { gameState: globalContext, consumeBuff, completeDailyTask } = useGame();
  const { gameState, setGameState } = useGame();
  
  // Buffs & Power-ups
  const hasAutoSquash = gameState.activeBuffs.syntaxRevealBug;
  const hasDoubleCoins = gameState.activeBuffs.arcadeDoubleCoins;
  
  // Game Session States
  const [sessionQueue, setSessionQueue] = useState<CodeSnippet[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  
  // Scoring & Stats
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(15)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [feedbackLine, setFeedbackLine] = useState<number | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showRules, setShowRules] = useState(false)

  // Initialization: Shuffle and Load
  const startNewSession = useCallback(() => {
    const shuffled = [...SNIPPET_POOL]
      .sort(() => Math.random() - 0.5)
      .slice(0, 15); // Players play 15 random bugs per session
    
    setSessionQueue(shuffled)
    
    // 🦆 THE RUBBER DUCK LOGIC 🦆
    if (hasAutoSquash) {
      setCurrentIndex(1) // Skip the first snippet
      setScore(1)        // Free point!
      setCoinsEarned(15) // Max payout (10 base + 5 speed)
    } else {
      setCurrentIndex(0)
      setScore(0)
      setCoinsEarned(0)
    }

    setGameStarted(true)
    setGameOver(false)
    setLives(3)
    setTimeLeft(15)
    setFeedbackLine(null)
  }, [hasAutoSquash]) // <-- Added dependency here!

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenSyntaxInstructions')
    if (!hasSeen) {
      setShowInstructions(true)
      localStorage.setItem('hasSeenSyntaxInstructions', 'true')
    }
  }, [])

  // Timer Logic
  useEffect(() => {
    if (!gameStarted || gameOver || feedbackLine !== null || showInstructions) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleWrongAnswer()
          return 15
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameStarted, gameOver, feedbackLine, showInstructions])

  const loadNextSnippet = () => {
    if (currentIndex >= sessionQueue.length - 1) {
      setGameOver(true) // Session finished!
      return
    }
    setCurrentIndex(prev => prev + 1)
    setTimeLeft(15)
    setFeedbackLine(null)
  }

  const handleWrongAnswer = () => {
    setLives(prev => {
      if (prev <= 1) {
        setGameOver(true)
        return 0
      }
      return prev - 1
    })
    setTimeout(loadNextSnippet, 1000)
  }

  const handleAnswer = (lineIndex: number) => {
    if (feedbackLine !== null) return
    const currentSnippet = sessionQueue[currentIndex]
    setFeedbackLine(lineIndex)

    if (lineIndex === currentSnippet.correct) {
      const speedBonus = Math.floor(timeLeft / 3)
      const totalReward = 10 + speedBonus
      setScore(prev => prev + 1)
      setCoinsEarned(prev => prev + totalReward)
      setTimeout(loadNextSnippet, 800)
    } else {
      handleWrongAnswer()
    }
  }

  const handleCollect = (coinsToCollect: number) => {
    // 1. Bank the money safely using your master Arcade system!
    onComplete(coinsToCollect, true);
    completeDailyTask('syntax-spotter'); // Mark the daily task as completed when they collect their reward

    // 2. Consume the Duck/Calc buff if it was used during this run! 
    // (Note: The Instant Coffee buff was already consumed when they clicked the button)
    if (globalContext.activeBuffs?.syntaxRevealBug) {
      consumeBuff('syntaxRevealBug');
    }

    // 3. Reset all your game states to prep for the next round
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
  }

  const currentSnippet = sessionQueue[currentIndex]

// --- RENDERING ---

  if (!gameStarted) {
    return (
      <>
        {/* Added 'relative', 'max-w-lg mx-auto fade-in', and 'flex flex-col items-center' */}
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border-2 border-dashed border-red-500/30 max-w-lg mx-auto fade-in relative flex flex-col items-center">
          
          {/* THE NEW '?' BUTTON */}
          <button 
            onClick={() => setShowRules(true)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-red-400 font-black text-xl flex items-center justify-center hover:bg-slate-700 hover:text-red-300 hover:scale-110 transition-all shadow-lg z-10"
            title="How to Play"
          >
            ?
          </button>

          <div className="text-7xl mb-6 mt-4">🐞</div>
          <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">SYNTAX SPOTTER</h2>
          
          <p className="text-blue-300 mb-8 max-w-sm mx-auto text-sm px-4">
            Compiler is crashing! Find the bugs in the code before the system overheats.
          </p>
          
          <button
            onClick={startNewSession}
            className="bg-red-500 hover:bg-red-600 text-white font-black px-12 py-5 rounded-2xl text-2xl transform hover:scale-110 transition-all shadow-xl shadow-red-500/20"
          >
            START DEBUGGING 🚀
          </button>
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
          title="Syntax Spotter" 
          titleIcon="🐞" 
          rules={[
            { icon: '🔎', text: <p><strong>Find the Bug:</strong> Inspect the code snippet and click exactly where the syntax error is located.</p> },
            { icon: '🔥', text: <p><strong>Beat the Heat:</strong> Squish the bug before the compiler overheats and your time runs out!</p> },
            { icon: '🪙', text: <p><strong>Collect Bounty:</strong> Earn coins for every bug you successfully squash.</p> }
          ]} 
          themeColor="red" 
        />
      </>
    )
  }

  // --- RENDER GAME OVER ---
  if (gameOver) {
    // 1. Check for Coffee Buff
    // (Ensure `const { gameState: globalContext, consumeBuff } = useGame();` is at the top of your component!)
    const hasCoffee = globalContext.activeBuffs?.arcadeDoubleCoins;
    
    // Using the coinsEarned value you calculated earlier in the file
    const baseCoins = coinsEarned;
    const finalCoins = hasCoffee ? baseCoins * 2 : baseCoins;

    return (
      <div className="text-center py-12 max-w-lg mx-auto fade-in">
        <h2 className="text-5xl font-black mb-6 text-red-400 drop-shadow-md">SESSION ENDED</h2>
        
        {/* Added relative and overflow-hidden for the banner */}
        <div className="bg-slate-800/60 p-8 rounded-3xl border-2 border-slate-700 mb-8 inline-block min-w-75 shadow-xl relative overflow-hidden">
          
          {/* NEW: ☕ Coffee Buff Banner */}
          {hasCoffee && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner text-center">
              ☕ Caffeine Rush Active
            </div>
          )}

          <p className={`text-2xl mb-4 text-gray-400 font-bold ${hasCoffee ? 'mt-4' : ''}`}>
            Bugs Squashed: <span className="text-green-400 font-black">{score}</span>
          </p>
          
          <div className="w-full h-1 bg-slate-700 mb-4 rounded-full" />
          <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-tighter">Bounty Payout</p>

          {/* NEW: Dynamic Coin Display */}
          {hasCoffee ? (
             <div className="flex items-center justify-center gap-4 mt-2">
               {/* Original Amount Crossed Out */}
               <p className="text-3xl font-bold text-slate-500 line-through opacity-70">🪙 {baseCoins}</p>
               <p className="text-2xl text-amber-500 font-black animate-pulse">➔</p>
               {/* Doubled Amount */}
               <p className="text-5xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
             </div>
           ) : (
             <p className="text-4xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
           )}
        </div>
        
        <div className="w-full flex justify-center">
          <button
            onClick={() => {
              // 2. CONSUME THE BUFF BEFORE LEAVING!
              if (hasCoffee) {
                consumeBuff('arcadeDoubleCoins');
              }
              // 3. Pass the FINAL coins to your collect function
              handleCollect(finalCoins);
            }}
            className="bg-white hover:bg-gray-200 text-slate-900 font-black px-12 py-4 rounded-full text-xl transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            COLLECT REWARD 🎊
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto fade-in relative">
      <InstructionModal 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Mission Briefing"
        themeColor="red"
        rules={[
          { icon: '🐞', text: <p>Read the code and <strong>click the line</strong> that has the error.</p> },
          { icon: '⏱️', text: <p><strong>15 seconds</strong> per file. Speed earns more coins!</p> },
          { icon: '❤️', text: <p>Wrong clicks cost a life. <strong>3 strikes and the server crashes!</strong></p> }
        ]}
      />

      {/* HUD */}
      
      {/* DUCK NOTIFICATION */}
      {hasAutoSquash && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-500/90 backdrop-blur text-white px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 animate-bounce shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10 whitespace-nowrap">
          🦆 Rubber Duck auto-squashed the first bug!
        </div>
      )}

      <div className="flex justify-between items-center mb-6 bg-slate-900/80 p-4 rounded-2xl border-2 border-slate-700 backdrop-blur-sm">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`text-2xl transition-all ${i < lives ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "grayscale opacity-20"}`}>❤️</span>
          ))}
        </div>
        
        <div className={`text-3xl font-black font-mono ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {timeLeft}s
        </div>

        <div className="text-right flex flex-col items-end">
          <p className="text-[10px] text-amber-300 font-black uppercase tracking-widest flex items-center gap-1">
            Payout
            {/* Show a cool 2x badge if coffee is active! */}
            {hasDoubleCoins && <span className="bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded text-[8px] animate-pulse">2x ☕</span>}
          </p>
          <p className="text-2xl font-black text-amber-400">
            {/* Multiply the display number if coffee is active */}
            🪙 {hasDoubleCoins ? coinsEarned * 2 : coinsEarned}
          </p>
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-[#0d1117] rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl">
        <div className="bg-[#161b22] px-6 py-3 flex justify-between items-center border-b border-slate-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">
            {currentSnippet.language} Module • {currentIndex + 1}/15
          </span>
        </div>

        <div className="p-6 font-mono text-base bg-slate-950/50">
          {currentSnippet.lines.map((line, idx) => {
            let lineStyle = "w-full text-left flex rounded px-3 py-2 mb-1 transition-all group "
            
            if (feedbackLine === idx) {
              lineStyle += idx === currentSnippet.correct 
                ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                : "bg-red-500/20 text-red-400 border border-red-500/50"
            } else if (feedbackLine !== null && idx === currentSnippet.correct) {
              lineStyle += "bg-green-500/10 text-green-400/50"
            } else {
              lineStyle += "hover:bg-slate-800 text-blue-300 cursor-pointer"
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={feedbackLine !== null}
                className={lineStyle}
              >
                <span className="text-slate-600 w-8 select-none border-r border-slate-800 mr-4 text-xs flex items-center">
                  {idx + 1}
                </span>
                <span className="whitespace-pre">{line}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}