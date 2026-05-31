'use client'

import { useGame } from '@/app/game-context';
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { InstructionModal } from '@/components/instruction-modal'

interface RunnerGameProps {
  onComplete: (coins: number, stayInGame?: boolean) => void
}

// 0 = Left Lane, 1 = Center Lane, 2 = Right Lane
type Lane = 0 | 1 | 2;

interface GameObject {
  id: number;
  lane: Lane;
  y: number; // 0 (top) to 100 (bottom)
  type: 'obstacle' | 'coffee';
  emoji: string;
}

export const RunnerGame: React.FC<RunnerGameProps> = ({ onComplete }) => {
  const { gameState: globalContext, consumeBuff, completeDailyTask } = useGame();
  const [ showRules, setShowRules ] = useState(false);
  
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  
  const [playerLane, setPlayerLane] = useState<Lane>(1)
  const [objects, setObjects] = useState<GameObject[]>([])
  
  const [distance, setDistance] = useState(0)
  const [coffees, setCoffees] = useState(0)
  const [speed, setSpeed] = useState(1.5)

  const collectedCoffees = useRef<Set<number>>(new Set());

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setPlayerLane(1)
    setObjects([])
    setDistance(0)
    setCoffees(0)
    setSpeed(1.5)
    collectedCoffees.current.clear();
  }

  // --- GAME LOOP ---
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = setInterval(() => {
      setDistance(prev => prev + 1)
      
      // THE FIX: Tripled the acceleration and raised the top speed to 6!
      setSpeed(prev => Math.min(prev + 0.004, 6)) 

      setObjects(prev => {
        let updated = prev.map(obj => ({ ...obj, y: obj.y + speed }))

        // Collision Detection (Player sits around Y: 85 to 95)
        updated.forEach(obj => {
          if (obj.y > 85 && obj.y < 92 && obj.lane === playerLane) {
            if (obj.type === 'obstacle') {
              setGameOver(true)
            } else if (obj.type === 'coffee') {
              if (!collectedCoffees.current.has(obj.id)) {
                collectedCoffees.current.add(obj.id); // Add cup ID to memory
                setCoffees(c => c + 1);               // Give EXACTLY +1 point
              }
            }
          }
        })

        // Remove off-screen objects
        updated = updated.filter(obj => obj.y < 110 && !collectedCoffees.current.has(obj.id))

        // --- THE NEW WAVE SPAWNER ---
        // Find the 'y' position of the highest object currently on screen
        const topmostY = updated.length > 0 ? Math.min(...updated.map(o => o.y)) : 100;

        // Wait until the last wave has moved down enough to give the player breathing room
        if (topmostY > 45) {
          // 50% chance to trigger a spawn wave on this eligible tick
          if (Math.random() < 0.5) { 
            
            // 1. Shuffle the 3 lanes so the gaps are random
            let availableLanes = [0, 1, 2].sort(() => Math.random() - 0.5);
            
            // 2. Decide if this wave has 1 or 2 obstacles (NEVER 3!)
            const numObstacles = Math.random() < 0.4 ? 2 : 1;
            const obstacleEmojis = ['🚧', '🏋️', '🐌']; 
            
            // 3. Place the obstacles
            for (let i = 0; i < numObstacles; i++) {
              updated.push({
                id: Date.now() + i, // Add 'i' to guarantee unique React keys!
                lane: availableLanes.pop() as Lane, // Pluck a random lane from our shuffled array
                y: -10,
                type: 'obstacle',
                emoji: obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)]
              });
            }

            // 4. We now have 1 or 2 guaranteed empty safe lanes. 
            // Let's give a 35% chance to drop a Coffee right into the safe path!
            if (Math.random() < 0.35) {
              updated.push({
                id: Date.now() + 5,
                lane: availableLanes.pop() as Lane,
                y: -10,
                type: 'coffee',
                emoji: '🥤'
              });
            }
          }
        }

        return updated
      })
    }, 30) // 30ms tick rate

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, playerLane, speed])

  // --- REAL-TIME DISTANCE TRACKER ---
  useEffect(() => {
    // Use >= 100 just in case the game's frame rate skips exactly 1000 internal distance!
    if (Math.floor(distance / 10) >= 100 && !gameOver) {
      completeDailyTask('coffee-run');
    }
  }, [distance, gameOver, completeDailyTask]);

  // --- KEYBOARD CONTROLS ---
  const handleMoveLeft = useCallback(() => {
    if (gameStarted && !gameOver) setPlayerLane(prev => Math.max(0, prev - 1) as Lane)
  }, [gameStarted, gameOver])

  const handleMoveRight = useCallback(() => {
    if (gameStarted && !gameOver) setPlayerLane(prev => Math.min(2, prev + 1) as Lane)
  }, [gameStarted, gameOver])

  // --- KEYBOARD CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // THE FIX: Ignore the OS sending repeated keys if the button is held down!
      if (e.repeat) return; 
      
      if (e.key === 'ArrowLeft' || e.key === 'a') handleMoveLeft();
      if (e.key === 'ArrowRight' || e.key === 'd') handleMoveRight();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMoveLeft, handleMoveRight]);


  // --- RENDERING ---
  if (gameOver) {
    
    // 1. Check for Coffee Buff and Calculate Coins
    // (Assuming you have `const { gameState: globalContext, consumeBuff } = useGame()` at the top of the file)
    const hasCoffee = globalContext.activeBuffs?.arcadeDoubleCoins;
    
    const distanceBonus = Math.floor(distance / 70);
    const coffeeBonus = coffees * 2;  
    
    // Calculate the base (max 60) and then double it if they have the buff!
    const baseCoins = Math.min(60, distanceBonus + coffeeBonus);
    const finalCoins = hasCoffee ? baseCoins * 2 : baseCoins;

    return (
      <div className="text-center py-12 max-w-lg mx-auto fade-in">
        <h2 className="text-5xl font-black mb-6 text-red-400 drop-shadow-md">WIPEOUT! 💥</h2>
        
        {/* Added relative and overflow-hidden for the banner */}
        <div className="bg-slate-800/60 p-8 rounded-3xl border-2 border-slate-700 mb-8 inline-block min-w-75 shadow-xl relative overflow-hidden">
          
          {/* NEW: ☕ Coffee Buff Banner */}
          {hasCoffee && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner">
              ☕ Caffeine Rush Active
            </div>
          )}

          <p className={`text-xl mb-2 text-gray-400 ${hasCoffee ? 'mt-4' : ''}`}>
            Distance: <span className="text-cyan-400 font-black">{Math.floor(distance / 10)}m</span>
          </p>
          <p className="text-xl mb-4 text-gray-400">
            Coffees Grabbed: <span className="text-amber-400 font-black">{coffees} 🥤</span>
          </p>
          
          <div className="w-full h-1 bg-slate-700 mb-4 rounded-full" />
          
          <p className="text-sm text-slate-500 font-bold mb-1">
            BONUS PAYOUT {baseCoins === 60 ? '(MAXIMUM!)' : ''}
          </p>
          
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
        
        {/* THE SINGLE BUTTON */}
        <div className="flex justify-center w-full">
          <button 
            onClick={() => {
              // 2. CONSUME THE BUFF BEFORE LEAVING!
              if (hasCoffee) {
                consumeBuff('arcadeDoubleCoins');
              }
              // 3. Bank the doubled coins!
              onComplete(finalCoins, true); 
              startGame(); // Instantly restart the run!
            }} 
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-black px-12 py-4 rounded-full text-xl transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)]"
          >
            COLLECT 🎊
          </button>
        </div>
      </div>
    )
  }

  // --- RENDERING ---
  if (!gameStarted) {
    return (
      <>
        {/* Added 'relative', 'fade-in', and flex formatting for the button */}
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border-2 border-dashed border-cyan-500/30 max-w-lg mx-auto fade-in relative flex flex-col items-center">
          
          {/* THE NEW '?' BUTTON */}
          <button 
            onClick={() => setShowRules(true)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-cyan-400 font-black text-xl flex items-center justify-center hover:bg-slate-700 hover:text-cyan-300 hover:scale-110 transition-all shadow-lg z-10"
            title="How to Play"
          >
            ?
          </button>

          <div className="text-7xl mb-6 mt-4">🏃💨</div>
          <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">CAFFEINE DASH</h2>
          
          {/* Cleaned up text since the controls are in the modal now */}
          <p className="text-cyan-300 mb-8 max-w-sm mx-auto px-4 text-sm">
            Dodge the gym bros and grab the iced caramel macchiatos!
          </p>
          
          <button 
            onClick={startGame} 
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-12 py-5 rounded-2xl text-2xl transform hover:scale-110 transition-all shadow-xl shadow-cyan-500/20"
          >
            START RUN ☕
          </button>
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
          title="Caffeine Dash" 
          titleIcon="🏃💨" 
          rules={[
            { icon: '🕹️', text: <p><strong>Controls:</strong> Use <strong>Arrow Keys</strong> or <strong>A/D</strong> to switch lanes.</p> },
            { icon: '🥤', text: <p><strong>Fuel Up:</strong> Grab iced coffees along the way for bonus coins!</p> },
            { icon: '🚧', text: <p><strong>Dodge:</strong> Avoid obstacles and gym bros at all costs to keep your run alive.</p> }
          ]} 
          themeColor="cyan" 
        />
      </>
    )
  }

  return (
    <div className="max-w-md mx-auto fade-in flex flex-col items-center">
      
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-4 bg-slate-900/80 px-6 py-3 rounded-2xl border-2 border-slate-700 shadow-lg">
        <div className="text-left">
          <p className="text-[10px] text-cyan-300 font-black uppercase tracking-widest">Distance</p>
          <p className="text-2xl font-black text-white">{Math.floor(distance / 10)}m</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-amber-300 font-black uppercase tracking-widest">Macchiatos</p>
          <p className="text-2xl font-black text-amber-400">{coffees} 🥤</p>
        </div>
      </div>

      {/* GAME VIEWPORT */}
      <div className="relative w-full h-125 bg-slate-800 rounded-3xl border-4 border-slate-700 overflow-hidden shadow-2xl perspective-1000">
        
        {/* Animated Road Lines to simulate speed */}
        <div className="absolute inset-0 flex justify-evenly opacity-20 pointer-events-none">
          <div className="w-2 h-full bg-linear-to-b from-transparent via-white to-transparent animate-pulse" style={{ animationDuration: `${1 / speed}s` }} />
          <div className="w-2 h-full bg-linear-to-b from-transparent via-white to-transparent animate-pulse" style={{ animationDuration: `${1 / speed}s` }} />
        </div>

        {/* Objects */}
        {objects.map(obj => {
          // Convert lane (0,1,2) to a left percentage (16%, 50%, 84%)
          const leftPos = obj.lane === 0 ? '16%' : obj.lane === 1 ? '50%' : '84%';
          
          return (
            <div 
              key={obj.id} 
              className={`absolute w-12 h-12 flex items-center justify-center text-4xl transform -translate-x-1/2 transition-all duration-75 ${obj.type === 'coffee' ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]' : ''}`}
              style={{ left: leftPos, top: `${obj.y}%` }}
            >
              {obj.emoji}
            </div>
          )
        })}

        {/* Player */}
        <div 
          className="absolute bottom-8 w-14 h-14 flex items-center justify-center text-5xl transform -translate-x-1/2 transition-all duration-150 z-20 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
          style={{ left: playerLane === 0 ? '16%' : playerLane === 1 ? '50%' : '84%' }}
        >
          🏃
        </div>
        
        {/* Danger Gradient at bottom to show hit zone */}
        <div className="absolute bottom-0 w-full h-24 bg-linear-to-t from-red-500/10 to-transparent pointer-events-none" />
      </div>

      {/* MOBILE CONTROLS (Hidden on Desktop) */}
      <div className="flex md:hidden w-full gap-4 mt-6">
        <button onClick={handleMoveLeft} className="flex-1 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white font-black py-6 rounded-2xl text-2xl active:scale-95 transition-all shadow-lg">
          ⬅️
        </button>
        <button onClick={handleMoveRight} className="flex-1 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white font-black py-6 rounded-2xl text-2xl active:scale-95 transition-all shadow-lg">
          ➡️
        </button>
      </div>

    </div>
  )
}