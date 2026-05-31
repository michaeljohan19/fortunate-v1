'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useGame } from '@/app/game-context'
import { InstructionModal } from '@/components/instruction-modal'

interface Crop {
  id: number
  image: string
  type: 'healthy' | 'diseased' | 'poison'
}

interface CropSorterGameProps {
  onComplete: (coins: number) => void
}

// Time Attack Mode: Try to sort 20 crops before the timer hits 0!
const TOTAL_ROUNDS = 25;

const generateCrops = (): Crop[] => {
  return Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
    const rand = Math.random();
    let type: 'healthy' | 'diseased' | 'poison';
    let imgNum = 1;

    // 15% chance for Poison data, otherwise 50/50 Healthy/Diseased
    if (rand < 0.15) {
      type = 'poison';
      imgNum = Math.floor(Math.random() * 29) + 1; // Assuming you put 2 random junk images in the poison folder
    } else if (rand < 0.57) {
      type = 'diseased';
      imgNum = Math.floor(Math.random() * 100) + 1;
    } else {
      type = 'healthy';
      imgNum = Math.floor(Math.random() * 100) + 1;
    }
    
    return {
      id: i,
      type: type,
      image: `/crop/${type}/${imgNum}.${type === 'poison' ? 'png' : 'jpg'}`
    }
  })
}

export const CropSorterGame: React.FC<CropSorterGameProps> = ({ onComplete }) => {
  const { gameState: globalContext, consumeBuff } = useGame();
  const [crops, setCrops] = useState<Crop[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10) // <-- Change this to 10
  
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showRules, setShowRules] = useState(false)

  const startGame = useCallback(() => {
    setCrops(generateCrops())
    setCurrentIndex(0)
    setScore(0)
    setTimeLeft(15)
    setGameStarted(true)
    setGameOver(false)
    setLastFeedback(null)
  }, [])

  // --- THE TIMER MECHANIC ---
  useEffect(() => {
    // Only tick down if actively playing and not pausing for feedback
    if (!gameStarted || gameOver || lastFeedback !== null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, lastFeedback]);


  // --- SWIPE LOGIC ---
  const handleSwipe = useCallback((guess: 'healthy' | 'diseased' | 'poison') => {
    if (lastFeedback !== null || gameOver) return;

    const currentCrop = crops[currentIndex];
    const isCorrect = guess === currentCrop.type;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setLastFeedback('correct');
      // THE FIX: Drop the reward from +2 to +1 second!
      setTimeLeft(prev => prev + 1); 
    } else {
      setLastFeedback('wrong');
      // Keep the brutal -3 second penalty
      setTimeLeft(prev => Math.max(0, prev - 3)); 
    }

    setTimeout(() => {
      setLastFeedback(null);
      if (currentIndex >= TOTAL_ROUNDS - 1) {
        setGameOver(true); // Beat the game!
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  }, [crops, currentIndex, lastFeedback, gameOver]);

  // --- KEYBOARD CONTROLS HOOK ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || lastFeedback !== null) return;

      if (e.key === 'ArrowLeft') handleSwipe('diseased');
      if (e.key === 'ArrowRight') handleSwipe('healthy');
      if (e.code === 'Space' || e.key === 'ArrowUp') handleSwipe('poison'); // The new Discard button!
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, lastFeedback, handleSwipe]);


  // --- RENDERING ---
  if (!gameStarted) {
    return (
      <>
        {/* Added 'relative', 'fade-in', and 'flex flex-col items-center' */}
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border-2 border-dashed border-emerald-500/30 max-w-lg mx-auto fade-in relative flex flex-col items-center">
          
          {/* THE NEW '?' BUTTON */}
          <button 
            onClick={() => setShowRules(true)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-emerald-400 font-black text-xl flex items-center justify-center hover:bg-slate-700 hover:text-emerald-300 hover:scale-110 transition-all shadow-lg z-10"
            title="How to Play"
          >
            ?
          </button>

          <div className="text-7xl mb-6 mt-4">⏱️</div>
          <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">AGRIVISION RUSH</h2>
          
          {/* Simplified on-screen text since the rules are in the modal */}
          <p className="text-emerald-300 mb-8 max-w-sm mx-auto px-4 text-sm">
            Sort the dataset before the server overheats! Label as many items as you can.
          </p>
          
          <button 
            onClick={startGame} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-12 py-5 rounded-2xl text-2xl transform hover:scale-110 transition-all shadow-xl shadow-emerald-500/20"
          >
            START LABELING 🚀
          </button>
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
          title="Agrivision Rush" 
          titleIcon="⏱️" 
          rules={[
            { icon: '✅', text: <p><strong>Correct Labels:</strong> Earn points and add <strong>+1 Second</strong> to your timer.</p> },
            { icon: '❌', text: <p><strong>Wrong Labels:</strong> Mistakes will cost you <strong className="text-red-400">-3 Seconds</strong>!</p> },
            { icon: '⚠️', text: <p><strong>Corrupted Data:</strong> Watch out for anomalies! Hit <strong>SPACEBAR</strong> to discard them safely.</p> }
          ]} 
          themeColor="emerald" 
        />
      </>
    )
  }
// --- RENDER GAME OVER ---
  if (gameOver) {
    const isPerfect = score === TOTAL_ROUNDS;
    
    // 1. Check for Coffee Buff 
    // (Ensure `const { gameState: globalContext, consumeBuff } = useGame();` is at the top of your component!)
    const hasCoffee = globalContext.activeBuffs?.arcadeDoubleCoins;
    
    // 2. Calculate Coins (2 coins per correct crop, plus a flat 10-coin bonus for a perfect run)
    const baseEarned = score * 2;
    const bonusCoins = isPerfect ? 10 : 0;
    const totalBaseCoins = baseEarned + bonusCoins; 
    
    // Double it if the buff is active!
    const finalCoins = hasCoffee ? totalBaseCoins * 2 : totalBaseCoins;
    
    return (
      <div className="text-center py-12 max-w-lg mx-auto fade-in">
        <h2 className="text-5xl font-black mb-6 text-emerald-400 drop-shadow-md">
          {timeLeft === 0 ? 'TIME OUT!' : 'DATASET CLEARED!'}
        </h2>
        
        {/* Added relative and overflow-hidden for the banner */}
        <div className="bg-slate-800/60 p-8 rounded-3xl border-2 border-slate-700 mb-8 inline-block min-w-75 shadow-xl backdrop-blur-sm relative overflow-hidden">
          
          {/* NEW: ☕ Coffee Buff Banner */}
          {hasCoffee && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner text-center">
              ☕ Caffeine Rush Active
            </div>
          )}

          {/* Show off that perfect bonus! */}
          {isPerfect && (
            <p className={`text-amber-400 font-black mb-2 animate-pulse drop-shadow-md ${hasCoffee ? 'mt-4' : ''}`}>
              PERFECT CLEAR BONUS! (+10)
            </p>
          )}
          
          <p className={`text-xl mb-4 text-gray-400 font-bold ${hasCoffee && !isPerfect ? 'mt-4' : ''}`}>
            Correct Labels: <span className="text-emerald-400 font-black">{score}/{TOTAL_ROUNDS}</span>
          </p>
          
          <div className="w-full h-1 bg-slate-700 mb-4 rounded-full" />
          
          {/* NEW: Dynamic Coin Display */}
          {hasCoffee ? (
             <div className="flex items-center justify-center gap-4 mt-2">
               {/* Original Amount Crossed Out */}
               <p className="text-3xl font-bold text-slate-500 line-through opacity-70">🪙 {totalBaseCoins}</p>
               <p className="text-2xl text-amber-500 font-black animate-pulse">➔</p>
               {/* Doubled Amount */}
               <p className="text-5xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
             </div>
           ) : (
             <p className="text-4xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
           )}
        </div>
        
        {/* THE BUTTON */}
        <div className="mt-2 w-full flex justify-center">
          <button 
            onClick={() => {
              // 3. CONSUME THE BUFF BEFORE LEAVING!
              if (hasCoffee) {
                consumeBuff('arcadeDoubleCoins');
              }
              // 4. Pass the FINAL coins
              onComplete(finalCoins);
            }} 
            className="bg-white hover:bg-gray-200 text-slate-900 font-black px-12 py-4 rounded-full text-xl transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            COLLECT REWARD 🎊
          </button>
        </div>
      </div>
    )
  }

  const currentCrop = crops[currentIndex];

  return (
    <div className="max-w-4xl mx-auto fade-in relative flex flex-col items-center px-4">
      
      {/* Top HUD with Timer */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 bg-slate-900/80 px-6 py-4 rounded-2xl border-2 border-slate-700 backdrop-blur-sm shadow-lg">
        <div>
          <p className="text-[10px] text-emerald-300 font-black uppercase tracking-widest">Image</p>
          <p className="text-2xl font-black text-white">{currentIndex + 1} <span className="text-slate-500 text-lg">/ {TOTAL_ROUNDS}</span></p>
        </div>
        
        {/* BIG SHRINKING TIMER */}
        <div className="text-center">
          <p className="text-[10px] text-red-300 font-black uppercase tracking-widest">Server Time</p>
          <p className={`text-4xl font-mono font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-white'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-amber-300 font-black uppercase tracking-widest">Score</p>
          <p className="text-2xl font-black text-green-400">{score}</p>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="flex flex-col items-center justify-center gap-4 w-full relative">
        
        {/* THE DISCARD BUTTON: Moved to the top so it's impossible to miss! */}
        <button
            onClick={() => handleSwipe('poison')}
            className="hidden md:flex flex-row items-center justify-center gap-4 w-85 py-3 bg-slate-800 hover:bg-amber-500/20 border-2 border-amber-500/50 text-amber-400 hover:border-amber-400 font-black rounded-2xl text-xl transform active:scale-95 hover:scale-105 transition-all shadow-lg z-10"
          >
            <span className="text-2xl">⚠️</span>
            DISCARD BAD DATA
            <span className="text-[10px] text-slate-500 tracking-widest bg-slate-900 px-2 py-1 rounded">SPACEBAR</span>
        </button>

        {/* The Main Interaction Row */}
        <div className="flex flex-row items-center justify-center gap-6 md:gap-12 w-full z-10">
          
          <button
            onClick={() => handleSwipe('diseased')}
            className="hidden md:flex flex-col items-center justify-center w-48 h-48 bg-slate-800 hover:bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:border-red-400 font-black rounded-3xl text-xl transform active:scale-95 hover:scale-105 transition-all shadow-lg"
          >
            <span className="text-4xl mb-2">👈</span>
            DISEASED
          </button>

          {/* THE CENTER CARD: Resized to 340px to prevent screen clipping */}
          <div className="relative w-72 h-72 md:w-85 md:h-85 shrink-0 perspective-1000">
            <div className={`w-full h-full relative rounded-3xl overflow-hidden border-4 shadow-2xl transition-all duration-200 ${
              lastFeedback === 'correct' ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.5)] scale-95' : 
              lastFeedback === 'wrong' ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-95' : 
              'border-slate-600'
            }`}>
              {currentCrop && (
                <Image src={currentCrop.image} alt="Lettuce Sample" fill className="object-cover bg-slate-800" priority />
              )}
              {lastFeedback === 'correct' && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><span className="text-7xl">✅</span></div>}
              {lastFeedback === 'wrong' && <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center"><span className="text-7xl">❌</span></div>}
            </div>
          </div>

          <button
            onClick={() => handleSwipe('healthy')}
            className="hidden md:flex flex-col items-center justify-center w-48 h-48 bg-slate-800 hover:bg-green-500/20 border-2 border-green-500/50 text-green-400 hover:border-green-400 font-black rounded-3xl text-xl transform active:scale-95 hover:scale-105 transition-all shadow-lg"
          >
            <span className="text-4xl mb-2">👉</span>
            HEALTHY
          </button>
        </div>

      </div>

      {/* MOBILE LAYOUT (Stack of 3 buttons) */}
      <div className="flex md:hidden flex-col gap-2 w-full max-w-sm mt-4 z-20">
        {/* Also moved the mobile discard button to the top! */}
        <button onClick={() => handleSwipe('poison')} className="w-full bg-slate-800 border-2 border-amber-500/50 text-amber-400 font-black py-4 rounded-xl text-lg active:scale-95 mb-1">⚠️ DISCARD DATA</button>
        
        <div className="flex gap-2">
          <button onClick={() => handleSwipe('diseased')} className="flex-1 bg-slate-800 border-2 border-red-500/50 text-red-400 font-black py-4 rounded-xl text-lg active:scale-95">👈 DISEASED</button>
          <button onClick={() => handleSwipe('healthy')} className="flex-1 bg-slate-800 border-2 border-green-500/50 text-green-400 font-black py-4 rounded-xl text-lg active:scale-95">HEALTHY 👉</button>
        </div>
      </div>
      
    </div>
  )
}