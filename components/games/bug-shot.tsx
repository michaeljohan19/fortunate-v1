'use client'

import { useGame } from '@/app/game-context';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { InstructionModal } from '@/components/instruction-modal'

interface BugShooterProps {
  onComplete: (coins: number, stayInGame?: boolean) => void
}

// Wave Balancing: [Wave 1, Wave 2, Wave 3]
const WAVE_KILLS_NEEDED = [15, 35, 60] // You win at 60 kills!
const BUG_SPEEDS = [0.8, 1.4, 2.2]     // Bugs get faster
const SPAWN_RATES = [0.03, 0.05, 0.08] // Bugs spawn more often

type Lane = 0 | 1 | 2;

export const BugShooterGame: React.FC<BugShooterProps> = ({ onComplete }) => {
  // THE FIX: The hook is now safely INSIDE the component!
  // We alias 'gameState' to 'globalContext' so it doesn't conflict with your local 'gameState' variable
  const { gameState: globalContext, consumeBuff, completeDailyTask } = useGame();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'victory'>('start')
  const [showRules, setShowRules] = useState(false)
  
  // Display States
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [wave, setWave] = useState(1)
  const [playerLane, setPlayerLane] = useState<Lane>(1)
  
  // Arrays for rendering
  const [bugs, setBugs] = useState<{id: number, lane: Lane, x: number, emoji: string}[]>([])
  const [bullets, setBullets] = useState<{id: number, lane: Lane, x: number}[]>([])

  // Engine Refs (To avoid stale state in our high-speed game loop)
  const engine = useRef({
    score: 0,
    lives: 3,
    wave: 1,
    bugs: [] as {id: number, lane: Lane, x: number, emoji: string}[],
    bullets: [] as {id: number, lane: Lane, x: number}[],
    playerLane: 1 as Lane,
    lastFired: 0,
    nextLaneSpawnTime: [0, 0, 0], 
  })

  // --- GAME INITIALIZATION ---
  const startGame = useCallback(() => {
    const startDelay = Date.now() + 1000
    engine.current = { 
      score: 0, lives: 3, wave: 1, bugs: [], bullets: [], playerLane: 1, lastFired: 0, 
      nextLaneSpawnTime: [startDelay, startDelay, startDelay]
    }
    setScore(0)
    setLives(3)
    setWave(1)
    setPlayerLane(1)
    setBugs([])
    setBullets([])
    setGameState('playing')
  }, [])

  // --- CONTROLS ---
  const movePlayer = useCallback((direction: 'up' | 'down') => {
    if (gameState !== 'playing') return
    const newLane = Math.max(0, Math.min(2, engine.current.playerLane + (direction === 'down' ? 1 : -1))) as Lane
    engine.current.playerLane = newLane
    setPlayerLane(newLane)
  }, [gameState])

  const fireBullet = useCallback(() => {
    if (gameState !== 'playing') return
    const now = Date.now()
    if (now - engine.current.lastFired < 250) return 
    
    engine.current.lastFired = now
    const newBullet = { id: now, lane: engine.current.playerLane, x: 15 } 
    engine.current.bullets.push(newBullet)
    setBullets([...engine.current.bullets])
  }, [gameState])

  const handleLaneClick = (lane: Lane) => {
    if (gameState !== 'playing') return
    engine.current.playerLane = lane
    setPlayerLane(lane)
    fireBullet()
  }

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') movePlayer('up')
      if (e.key === 'ArrowDown' || e.key === 's') movePlayer('down')
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault() 
        fireBullet()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [movePlayer, fireBullet])

  // --- THE GAME LOOP ---
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = setInterval(() => {
      const state = engine.current

      // 1. Check Wave Progression
      if (state.score >= WAVE_KILLS_NEEDED[0] && state.wave === 1) { state.wave = 2; setWave(2); completeDailyTask('bugshot');}
      if (state.score >= WAVE_KILLS_NEEDED[1] && state.wave === 2) { state.wave = 3; setWave(3) }
      if (state.score >= WAVE_KILLS_NEEDED[2]) {
        setGameState('victory')
        return
      }

      const now = Date.now()
      const bugEmojis = ['🦠', '🦟', '🐛', '👾']
      
      const currentWaveIdx = state.wave - 1
      const BUG_SPEEDS = [0.8, 1.3, 1.75]   
      const spawnChances = [0.015, 0.025, 0.05] 
      const minGaps = [1500, 900, 500]     
      const variances = [1000, 800, 400]   

      for (let i = 0; i < 3; i++) {
        if (now >= state.nextLaneSpawnTime[i]) {
          if (Math.random() < spawnChances[currentWaveIdx]) {
            state.bugs.push({
              id: now + i, 
              lane: i as Lane,
              x: 100,
              emoji: bugEmojis[Math.floor(Math.random() * bugEmojis.length)]
            })
            state.nextLaneSpawnTime[i] = now + minGaps[currentWaveIdx] + (Math.random() * variances[currentWaveIdx])
          }
        }
      }

      // 3. Move Entities
      state.bullets.forEach(b => b.x += 4) 
      state.bugs.forEach(b => b.x -= BUG_SPEEDS[currentWaveIdx])

      // 4. Collision Detection
      const survivingBugs: typeof state.bugs = []
      const survivingBullets: typeof state.bullets = []

      state.bugs.forEach(bug => {
        let hit = false
        for (let i = 0; i < state.bullets.length; i++) {
          const bullet = state.bullets[i]
          if (bullet.lane === bug.lane && bullet.x >= bug.x - 2 && bullet.x <= bug.x + 5) {
            hit = true
            state.bullets.splice(i, 1) 
            state.score += 1
            setScore(state.score)
            break
          }
        }

        // 5. Did the bug reach the server?
        if (!hit) {
          if (bug.x <= 5) {
            state.lives -= 1
            setLives(state.lives)
            if (state.lives <= 0) setGameState('gameover')
          } else {
            survivingBugs.push(bug)
          }
        }
      })

      // Clean up off-screen bullets
      state.bullets.forEach(b => { if (b.x < 100) survivingBullets.push(b) })

      // Update Engine
      state.bugs = survivingBugs
      state.bullets = survivingBullets

      // Trigger React Render
      setBugs([...state.bugs])
      setBullets([...state.bullets])

    }, 30) 

    return () => clearInterval(gameLoop)
  }, [gameState])


  // --- GAME OVER & VICTORY SCREENS ---
  if (gameState === 'gameover' || gameState === 'victory') {
    const isVictory = gameState === 'victory';
    
    // Reads from the safely aliased globalContext!
    const hasCoffee = globalContext.activeBuffs?.arcadeDoubleCoins;
    
    const baseCoins = isVictory ? 60 : Math.max(5, Math.floor(score * 0.8));
    const finalCoins = hasCoffee ? baseCoins * 2 : baseCoins;

    return (
      <div className="text-center py-12 max-w-lg mx-auto fade-in">
        <h2 className={`text-5xl font-black mb-6 drop-shadow-md ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>
          {isVictory ? 'SYSTEM SECURE! 🛡️' : 'SERVER CRASHED 💥'}
        </h2>
        
        <div className="bg-slate-800/60 p-8 rounded-3xl border-2 border-slate-700 mb-8 inline-block min-w-74 shadow-xl relative overflow-hidden">
          
          {hasCoffee && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner">
              ☕ Caffeine Rush Active
            </div>
          )}

          <p className={`text-xl mb-2 text-gray-400 ${hasCoffee ? 'mt-4' : ''}`}>Bugs Eliminated:</p>
          <p className="text-5xl font-black text-cyan-400 mb-6">{score}</p>
          <div className="w-full h-1 bg-slate-700 mb-4 rounded-full" />
          <p className="text-sm text-slate-500 font-bold mb-1">{isVictory ? "MAXIMUM PAYOUT!" : "CONSOLATION REWARD"}</p>
          
          {hasCoffee ? (
             <div className="flex items-center justify-center gap-4 mt-2">
               <p className="text-3xl font-bold text-slate-500 line-through opacity-70">🪙 {baseCoins}</p>
               <p className="text-2xl text-amber-500 font-black animate-pulse">➔</p>
               <p className="text-5xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
             </div>
           ) : (
             <p className="text-4xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
           )}
        </div>
        
        <div className="flex justify-center w-full">
          <button 
            onClick={() => {
              if (hasCoffee) {
                consumeBuff('arcadeDoubleCoins');
              }
              onComplete(finalCoins, true);
              setGameState('start'); 
            }} 
            className={`text-slate-900 font-black px-12 py-4 rounded-full text-xl transform hover:scale-105 active:scale-95 transition-all shadow-lg ${isVictory ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-400/40' : 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/40'}`}
          >
            COLLECT REWARDS 🎊
          </button>
        </div>
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

          <div className="text-7xl mb-6 mt-4">🤖🛡️</div>
          <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">BUG-SHOT</h2>
          
          {/* Cleaned up text since the controls are in the modal now */}
          <p className="text-cyan-300 mb-8 max-w-sm mx-auto px-4 text-sm">
            Defend the server from incoming bugs! Survive 3 waves to secure the system.
          </p>

          <button 
            onClick={startGame} 
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-8 py-5 rounded-2xl text-2xl transform hover:scale-110 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
          >
            INITIALIZE DEFENSES
          </button>
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
          title="Bug-Shot" 
          titleIcon="🤖🛡️" 
          rules={[
            { icon: '🕹️', text: <p><strong>Movement:</strong> Use <strong>Arrow Keys</strong> or <strong>W/S</strong> to switch lanes.</p> },
            { icon: '🚀', text: <p><strong>Shoot:</strong> Press <strong>SPACEBAR</strong> to fire your blaster at incoming bugs.</p> },
            { icon: '🖱️', text: <p><strong>Mobile/Mouse:</strong> Tap or click on a lane to automatically move and fire!</p> }
          ]} 
          themeColor="cyan" 
        />
      </>
    )
  }
  return (
    <div className="max-w-4xl mx-auto fade-in">
      {/* HEADER HUD */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-2xl transition-all ${i < lives ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-700 grayscale opacity-30'}`}>
              ❤️
            </span>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase">Threat Level</span>
          <span className={`text-2xl font-black ${wave === 1 ? 'text-green-400' : wave === 2 ? 'text-amber-400' : 'text-red-500 animate-pulse'}`}>
            WAVE {wave}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs font-black tracking-widest text-slate-400 uppercase">Eliminated</p>
          <p className="text-2xl font-black text-cyan-400 font-mono">{score} / 60</p>
        </div>
      </div>

      {/* GAME BOARD */}
      <div className="relative w-full h-100 bg-slate-950 border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-around py-4">
        
        {/* Background Grid Lines & Clickable Lanes */}
        {[0, 1, 2].map((lane) => (
          <div 
            key={lane} 
            onClick={() => handleLaneClick(lane as Lane)}
            className={`absolute w-full h-[33%] border-b border-slate-800/50 flex items-center cursor-crosshair hover:bg-white/5 transition-colors z-10 ${lane === 0 ? 'top-0' : lane === 1 ? 'top-[33%]' : 'top-[66%]'}`}
          />
        ))}

        {/* The Server (Far Left) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-blue-900 to-slate-900 border-r-2 border-blue-500/50 shadow-[5px_0_20px_rgba(59,130,246,0.2)] z-20 flex flex-col justify-center items-center gap-8">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>

        {/* The Player / Antivirus Turret */}
        <div 
          className="absolute left-10 w-12 h-12 flex items-center justify-center text-4xl z-30 transition-all duration-100 ease-out drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
          style={{ top: `calc(${playerLane * 33.33}% + 16.66%)`, transform: 'translateY(-50%)' }}
        >
          🤖
        </div>

        {/* Bullets */}
        {bullets.map(bullet => (
          <div 
            key={bullet.id}
            className="absolute h-2 w-6 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)] z-20"
            style={{ 
              left: `${bullet.x}%`, 
              top: `calc(${bullet.lane * 33.33}% + 16.66%)`,
              transform: 'translateY(-50%)'
            }}
          />
        ))}

        {/* Incoming Bugs */}
        {bugs.map(bug => (
          <div 
            key={bug.id}
            className="absolute w-10 h-10 flex items-center justify-center text-3xl z-20 drop-shadow-lg"
            style={{ 
              left: `${bug.x}%`, 
              top: `calc(${bug.lane * 33.33}% + 16.66%)`,
              transform: 'translateY(-50%)'
            }}
          >
            {bug.emoji}
          </div>
        ))}
      </div>
    </div>
  )
}