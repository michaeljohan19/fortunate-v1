'use client'

import React, { useState, useEffect } from 'react'
import { useGame } from '@/app/game-context'
import { InstructionModal } from '@/components/instruction-modal' // Adjust path if your ui folder is elsewhere!

interface Card {
  id: number
  emoji: string
  matched: boolean
  flipped: boolean
}

interface MemoryGameProps {
  onComplete: (coins: number, stayInGame?: boolean) => void
}

// Computer Engineering Theme: 
// React/Web, AI/CNN, MySQL/DBs, ESP32/Hardware, Signal Processing, Architecture, Storage, Networks
const CE_EMOJIS = ['⚛️', '🤖', '🗄️', '🎛️', '📻', '🧠', '💾', '🌐']

const initializeCards = (): Card[] => {
  const cards = [...CE_EMOJIS, ...CE_EMOJIS].sort(() => Math.random() - 0.5)
  return cards.map((emoji, idx) => ({
    id: idx,
    emoji,
    matched: false,
    flipped: false,
  }))
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete }) => {
  const { gameState: globalContext, consumeBuff, completeDailyTask } = useGame();
  const hasPencil = globalContext.activeBuffs?.memoryHBPencil;

  // Game State
  const [gameStarted, setGameStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  
  // Board State
  const [cards, setCards] = useState<Card[]>(initializeCards())
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45)
  const [coinsEarned, setCoinsEarned] = useState(0)

  // Instructions State
  const [showInstructions, setShowInstructions] = useState(false)

  // NEW: State for the HB Pencil Cheat!
  const [isRevealing, setIsRevealing] = useState(false)

  // NEW: Custom start function to trigger the cheat
  const handleStartGame = () => {
    setGameStarted(true)
    if (hasPencil) {
      setIsRevealing(true)
      consumeBuff('memoryHBPencil') // Consume it immediately!
      setTimeout(() => {
        setIsRevealing(false)
      }, 3000) // Shows the cards for 3 seconds
    }
  }

  // Check for first-time players
  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenMemoryInstructions')
    if (!hasSeen) {
      setShowInstructions(true)
    }
  }, [])

  const handleCloseInstructions = () => {
    setShowInstructions(false)
    localStorage.setItem('hasSeenMemoryInstructions', 'true')
  }

 // Timer Logic (Update the if-statement and dependency array!)
  useEffect(() => {
    // 👈 Added isRevealing to this line so the timer pauses!
    if (!gameStarted || completed || gameOver || showInstructions || isRevealing) return 

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // 👈 Added isRevealing to the array at the bottom!
    return () => clearInterval(timer)
  }, [gameStarted, completed, gameOver, showInstructions, isRevealing])

  // Matching Logic
  useEffect(() => {
    if (flipped.length !== 2) return

    const [first, second] = flipped
    const firstCard = cards[first]
    const secondCard = cards[second]

    if (firstCard.emoji === secondCard.emoji) {
      // Match found!
      setCards(prev => prev.map((card, idx) =>
        idx === first || idx === second ? { ...card, matched: true } : card
      ))
      setMatched(prev => prev + 1)
      setFlipped([])
      setMoves(prev => prev + 1)

      // Check for win
      if (matched + 1 === CE_EMOJIS.length) {
        handleWin()
      }
    } else {
      // No match, flip back after delay
      setTimeout(() => {
        setFlipped([])
        setMoves(prev => prev + 1)
      }, 800) // Slightly faster than 1s for better arcade feel
    }
  }, [flipped, cards, matched])

 // Card Click Logic (Update the if-statement!)
  const handleCardClick = (idx: number) => {
    // 👈 Added isRevealing to this line so they can't click during the cheat!
    if (!gameStarted || showInstructions || isRevealing || flipped.includes(idx) || cards[idx].matched || flipped.length === 2) return
    setFlipped([...flipped, idx])
  }

  const handleWin = () => {
    const baseReward = 50
    const timeBonus = timeLeft * 2 // +2 coins for every second left
    const movePenalty = Math.max(0, moves - 8) // Just -1 coin per extra move (very forgiving!)
    
    // Guarantee at least 25 coins just for finishing the game
    const total = Math.max(25, baseReward + timeBonus - movePenalty) 

    setCoinsEarned(total)
    setCompleted(true)
    completeDailyTask('memory-match');
  }

  const handleCollectAndRetry = (coinsToCollect: number) => {
    // 1. Bank the doubled (or standard) coins using onComplete instead of addCoins!
    // The 'true' tells the Arcade to keep the player at the machine instead of kicking them to the menu.
    if (coinsToCollect > 0) {
      onComplete(coinsToCollect, true)
    }
    
    // 2. Reset Board & Game States
    setCards(initializeCards())
    setFlipped([])
    setMatched(0)
    setMoves(0)
    setTimeLeft(45)
    setCoinsEarned(0)
    setCompleted(false)
    setGameOver(false)
    setGameStarted(false)
  }

// --- RENDER START SCREEN ---
  if (!gameStarted && !completed && !gameOver) {
    return (
      <>
        {/* Added 'flex flex-col items-center', dashed borders, and max-w-lg to match the Arcade standard! */}
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border-2 border-dashed border-purple-500/30 max-w-lg mx-auto fade-in relative flex flex-col items-center">
          
          {/* ✏️ Pencil Buff Banner (Adjusted slightly to sit perfectly on the new container) */}
          {hasPencil && (
            <div className="absolute -top-4 left-6 right-6 bg-yellow-500/20 text-yellow-400 text-xs font-black py-2 uppercase tracking-widest border border-yellow-500/30 shadow-inner rounded-xl animate-pulse z-20">
              ✏️ Cheat Sheet Active: 3-Second Reveal
            </div>
          )}

          {/* THE NEW '?' BUTTON */}
          <button 
            onClick={() => setShowInstructions(true)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-purple-400 font-black text-xl flex items-center justify-center hover:bg-slate-700 hover:text-purple-300 hover:scale-110 transition-all shadow-lg z-10"
            title="How to Play"
          >
            ?
          </button>

          <div className="text-7xl mb-6 mt-4">🧠</div>
          <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">Memory Match</h2>
          
          {/* Cleaned up text since the rules are in the modal now */}
          <p className="text-purple-300 mb-8 max-w-sm mx-auto px-4 text-sm">
            Test your hardware and software recall before time runs out!
          </p>
          
          <button
            onClick={handleStartGame} // 👈 Kept your custom pencil-buff start function!
            className="bg-purple-500 hover:bg-purple-600 text-white font-black px-12 py-5 rounded-2xl text-2xl transform hover:scale-110 transition-all shadow-xl shadow-purple-500/20"
          >
            START LAB 🚀
          </button>
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showInstructions}
          onClose={handleCloseInstructions} // Kept your custom close handler (for localStorage)
          title="Memory Match"
          titleIcon="🧠"
          themeColor="purple"
          rules={[
            { icon: '🧠', text: <p><strong>Flip and Match:</strong> Flip the hardware and software tiles to find matching pairs.</p> },
            { icon: '⏱️', text: <p><strong>Beat the Clock:</strong> You have <strong>45 seconds</strong> to clear the board. Faster times equal bigger coin bonuses!</p> },
            { icon: '🎯', text: <p><strong>Be Precise:</strong> Try to memorize positions. Taking too many moves will reduce your final payout.</p> }
          ]}
        />
      </>
    )
  }

  // --- RENDER GAME OVER / WIN SCREEN ---
  if (completed || gameOver) {
    // 1. Check for Coffee Buff
    // (Ensure `const { gameState: globalContext, consumeBuff } = useGame();` is at the top of your component!)
    const hasCoffee = globalContext.activeBuffs?.arcadeDoubleCoins;
    
    // Note: Assuming 'coinsEarned' is calculated right before this return block in your code!
    const baseCoins = coinsEarned;
    const finalCoins = hasCoffee ? baseCoins * 2 : baseCoins;

    return (
      <div className="text-center fade-in py-8 max-w-2xl mx-auto">
        <h2 className={`text-4xl font-black mb-4 ${completed ? 'text-purple-400' : 'text-red-400'}`}>
          {completed ? 'PERFECT MATCH! 🎮' : 'TIME OUT! ⏰'}
        </h2>
        
        {/* Added relative and overflow-hidden for the banner */}
        <div className="bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-6 mb-8 inline-block text-left min-w-62.5 shadow-xl relative overflow-hidden">
          
          {/* NEW: ☕ Coffee Buff Banner */}
          {hasCoffee && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner text-center">
              ☕ Caffeine Rush Active
            </div>
          )}

          <p className={`text-lg text-slate-300 flex justify-between mb-2 ${hasCoffee ? 'mt-6' : ''}`}>
            <span>Pairs Found:</span> 
            <span className={completed ? "text-green-400 font-black" : "text-amber-400 font-black"}>{matched}/8</span>
          </p>
          <p className="text-lg text-slate-300 flex justify-between mb-2">
            <span>Total Moves:</span> 
            <span className="text-cyan-400 font-black">{moves}</span>
          </p>
          {completed && (
            <p className="text-lg text-slate-300 flex justify-between mb-4 border-b border-slate-700 pb-4">
              <span>Time Left:</span> 
              <span className="text-amber-400 font-black">{timeLeft}s</span>
            </p>
          )}
          
          <p className="text-2xl text-white flex justify-between items-center mt-4">
            
            {/* NEW: Dynamic Coin Display */}
            {hasCoffee ? (
              <span className="flex items-center gap-3">
                <span className="text-lg text-slate-500 line-through opacity-70">{baseCoins}</span>
                <span className="text-xl text-amber-500 font-black animate-pulse">➔</span>
                <span className="text-amber-400 font-black">{finalCoins} 🪙</span>
              </span>
            ) : (
              <span className="text-amber-400 font-black flex items-center gap-2">
                {finalCoins} 🪙
              </span>
            )}
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              // 2. CONSUME THE BUFF BEFORE LEAVING!
              if (hasCoffee) {
                consumeBuff('arcadeDoubleCoins');
              }
              // 3. Pass the FINAL coins to your custom handler
              handleCollectAndRetry(finalCoins);
            }}
            className="bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-black px-8 py-4 rounded-xl text-xl transform hover:scale-105 transition-all shadow-lg"
          >
            {completed ? 'COLLECT & RETRY 🎊' : 'TRY AGAIN 🔄'}
          </button>
        </div>
      </div>
    )
  }

  // --- RENDER MAIN BOARD ---
  return (
    <div className="max-w-2xl mx-auto fade-in relative">
      <InstructionModal 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Memory Match"
        themeColor="purple"
        rules={[
          { icon: '🧠', text: <p>Flip the hardware and software tiles to find matching pairs.</p> },
          { icon: '⏱️', text: <p>You have <strong>45 seconds</strong> to clear the board. Faster times equal bigger coin bonuses!</p> },
          { icon: '🎯', text: <p>Try to memorize positions. Taking too many moves will reduce your final payout.</p> }
        ]}
      />

      {/* HUD */}
      <div className="flex justify-between items-center mb-6 bg-slate-900/60 p-4 rounded-2xl border-2 border-slate-700 relative">
        <button 
          onClick={() => setShowInstructions(true)}
          className="absolute -top-3 -right-3 w-8 h-8 bg-slate-800 border-2 border-slate-600 rounded-full font-black text-slate-300 hover:text-white hover:border-slate-400 hover:scale-110 transition-all z-10 flex items-center justify-center shadow-lg"
        >
          ?
        </button>

        <div className="flex gap-4 md:gap-8">
          <div>
            <p className="text-xs text-cyan-300 font-bold mb-1">MATCHED</p>
            <p className="text-2xl font-black text-white">{matched}/8</p>
          </div>
          <div>
            <p className="text-xs text-purple-300 font-bold mb-1">MOVES</p>
            <p className="text-2xl font-black text-white">{moves}</p>
          </div>
        </div>
        
        <div className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-4 gap-3 md:gap-4 p-4 md:p-6 bg-[#1e1e1e] rounded-2xl border-2 border-slate-700 shadow-2xl">
        {cards.map((card, idx) => {
          // 👈 CHANGED THIS LINE: Now they also flip if the cheat is active!
          const isFlipped = flipped.includes(idx) || isRevealing 
          const isMatched = card.matched

          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              disabled={isMatched || isRevealing} // 👈 CHANGED THIS LINE: Disable clicks during reveal
              className={`aspect-square w-full rounded-xl text-4xl md:text-5xl flex items-center justify-center transition-all duration-300 transform ${
                isMatched
                  ? 'bg-slate-900 border-2 border-slate-800 opacity-40 scale-95'
                  : isFlipped
                  ? 'bg-purple-500 border-b-4 border-purple-700 text-white scale-105 shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800 border-b-4 border-slate-900 hover:bg-slate-700 hover:-translate-y-1'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* Simple flip animation handled via scaling and color changing for arcade feel */}
              <span className={`transition-opacity duration-200 ${isFlipped || isMatched ? 'opacity-100' : 'opacity-0'}`}>
                {card.emoji}
              </span>
              
              {/* Card Back Design (when not flipped) */}
              {(!isFlipped && !isMatched) && (
                <span className="absolute text-slate-600 text-2xl font-black">?</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}