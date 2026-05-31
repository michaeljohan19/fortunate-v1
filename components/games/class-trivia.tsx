'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { TRIVIA_QUESTIONS, TriviaQuestion } from '@/data/class-trivia'
import { useGame } from '@/app/game-context'
import { InstructionModal, Rule } from '@/components/instruction-modal'

interface ClassTriviaProps {
  onComplete: (coins: number, stayInGame?: boolean) => void
}

export const ClassTriviaGame: React.FC<ClassTriviaProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'summary'>('start')
  const { gameState: globalContext, consumeBuff, completeDailyTask } = useGame();
  
  // Game Logic
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [shuffledQuestions, setShuffledQuestions] = useState<TriviaQuestion[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(15) // 15 seconds per question
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  
const [showRules, setShowRules] = useState(false);

  // --- INITIALIZATION ---
  const startGame = useCallback(() => {
    // Shuffle 10 random questions from your data file
    const shuffled = [...TRIVIA_QUESTIONS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);
    
    setShuffledQuestions(shuffled)
    setCurrentQuestionIdx(0)
    setScore(0)
    setLives(3)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setGameState('playing')
  }, [])

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (gameState !== 'playing' || selectedAnswer !== null) return;

    if (timeLeft <= 0) {
      handleAnswer(-1); // Count as wrong if time runs out
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, selectedAnswer]);

  // --- ANSWER HANDLING ---
  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent double clicking

    const currentQ = shuffledQuestions[currentQuestionIdx];
    const correct = index === currentQ.correctAnswer;
    
    setSelectedAnswer(index);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    } else {
      setLives(prev => prev - 1);
    }

    // Wait 1.5 seconds so player can see if they were right
    setTimeout(() => {
      if (lives <= 1 && !correct || currentQuestionIdx >= shuffledQuestions.length - 1) {
        setGameState('summary');
        completeDailyTask('trivia');
      } else {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(15);
      }
    }, 1500);
  };

  // --- ECONOMY ---
  const calculatePayout = () => {
    const basePerCorrect = 5;
    const flawlessBonus = (score === 10) ? 25 : 0;
    const livesBonus = lives * 5;
    return (score * basePerCorrect) + flawlessBonus + livesBonus;
  }

  // --- RENDER SCREENS ---
  if (gameState === 'start') {
    return (
      <>
        {/* Added 'relative' and 'flex flex-col items-center' for the ? button */}
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border-2 border-dashed border-cyan-500/30 max-w-lg mx-auto fade-in relative flex flex-col items-center">
          
          {/* THE NEW '?' BUTTON */}
          <button 
            onClick={() => setShowRules(true)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-cyan-400 font-black text-xl flex items-center justify-center hover:bg-slate-700 hover:text-cyan-300 hover:scale-110 transition-all shadow-lg z-10"
            title="How to Play"
          >
            ?
          </button>

          <div className="text-7xl mb-6 mt-4">🎓</div>
          <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">Class Trivia</h2>
          
          {/* Simplified on-screen text since the full rules are now in the modal */}
          <p className="text-cyan-300 mb-8 max-w-sm mx-auto px-4 text-sm">
            Test your knowledge! Answer 10 questions correctly to earn your reward.
          </p>
          
          <button 
            onClick={startGame} 
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-12 py-5 rounded-2xl text-2xl transform hover:scale-110 transition-all shadow-xl shadow-cyan-500/20"
          >
            BEGIN EXAM
          </button>
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
          title="Class Trivia" 
          titleIcon="🎓" 
          rules={[
            { icon: '⏱️', text: <p><strong>Fast Pace:</strong> You only have 15 seconds per question!</p> },
            { icon: '❤️', text: <p><strong>Three Lives:</strong> Three strikes and you're out. Be careful!</p> },
            { icon: '🪙', text: <p><strong>Payout:</strong> You receive bonus coins for every life you have remaining at the end.</p> }
          ]} 
          themeColor="cyan" 
        />
      </>
    )
  }
  
// --- GAME OVER & SUMMARY SCREENS ---
  if (gameState === 'summary') {
    // 1. Check for Coffee Buff and Calculate Coins
    const hasCoffee = globalContext.activeBuffs?.arcadeDoubleCoins;
    const baseCoins = calculatePayout();
    const finalCoins = hasCoffee ? baseCoins * 2 : baseCoins;

    return (
      <div className="text-center py-12 max-w-lg mx-auto fade-in">
        <h2 className="text-5xl font-black mb-6 text-amber-400 drop-shadow-md">EXAM FINISHED</h2>
        
        {/* Added relative and overflow-hidden for the banner */}
        <div className="bg-slate-800/60 p-8 rounded-3xl border-2 border-slate-700 mb-8 w-full shadow-xl relative overflow-hidden">
          
          {/* NEW: ☕ Coffee Buff Banner */}
          {hasCoffee && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner text-center">
              ☕ Caffeine Rush Active
            </div>
          )}

          <div className={`flex justify-between items-center mb-4 ${hasCoffee ? 'mt-4' : ''}`}>
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Score</span>
            <span className="text-3xl font-black text-white">{score} / 10</span>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Remaining Health</span>
            <span className="text-2xl text-red-400">{lives > 0 ? '❤️'.repeat(lives) : '💀'}</span>
          </div>
          
          <div className="w-full h-1 bg-slate-700 mb-6 rounded-full" />
          <p className="text-sm text-slate-400 font-bold mb-1 uppercase tracking-tighter">Tuition Refund</p>
          
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
             <p className="text-6xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
           )}
        </div>
        
        <button 
          onClick={() => { 
            // 2. CONSUME THE BUFF BEFORE LEAVING!
            if (hasCoffee) {
              consumeBuff('arcadeDoubleCoins');
            }
            // 3. Pass the FINAL coins to the master file
            onComplete(finalCoins, true); 
            setGameState('start'); 
          }} 
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-12 py-4 rounded-full text-xl transform hover:scale-105 transition-all shadow-lg"
        >
          COLLECT & RETAKE
        </button>
      </div>
    )
  }

  const currentQ = shuffledQuestions[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto fade-in">
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
           <span className="text-[10px] font-black text-slate-500 uppercase block leading-none mb-1">Question</span>
           <span className="text-xl font-black text-white">{currentQuestionIdx + 1} <span className="text-slate-600">/</span> 10</span>
        </div>
        <div className={`px-6 py-2 rounded-full border-2 font-black transition-all ${timeLeft <= 5 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-900 border-slate-700 text-amber-400'}`}>
           {timeLeft}s
        </div>
        <div className="text-right">
           <span className="text-[10px] font-black text-slate-500 uppercase block leading-none mb-1">Health</span>
           <span className="text-xl">{lives > 0 ? '❤️'.repeat(lives) : '💀'}</span>
        </div>
      </div>

      <div className="bg-slate-950 border-4 border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl min-h-50 flex flex-col items-center justify-center">
        <span className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em] mb-4">{currentQ.category}</span>
        <h3 className="text-xl md:text-2xl font-bold text-white text-center leading-relaxed mb-10">
          {currentQ.question}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrectOption = idx === currentQ.correctAnswer;
            
            let btnStyle = "bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-white";
            if (selectedAnswer !== null) {
              if (isCorrectOption) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
              else if (isSelected) btnStyle = "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
              else btnStyle = "bg-slate-900/50 border-slate-800 text-slate-600 opacity-50";
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleAnswer(idx)}
                className={`p-4 rounded-2xl border-2 font-bold text-left transition-all transform active:scale-95 ${btnStyle}`}
              >
                <span className="inline-block w-8 h-8 rounded-lg bg-black/30 text-center leading-8 mr-3 text-xs">{String.fromCharCode(65 + idx)}</span>
                {option}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}