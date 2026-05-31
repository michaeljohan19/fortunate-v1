'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useGame, Character } from '@/app/game-context'
import { InstructionModal, Rule } from '@/components/instruction-modal'

// --- UPDATED ECONOMY BALANCING ---
// 1 Hour, 3 Hours, 6 Hours.
const TASKS = [
  { id: '1-hr', name: 'Organize Server Racks', timeName: '1 Hour', duration: 60 * 60 * 1000, baseCoins: 20, gemChance: 0.05, icon: '🔌' },
  { id: '3-hr', name: 'Debug Legacy Code', timeName: '3 Hours', duration: 3 * 60 * 60 * 1000, baseCoins: 50, gemChance: 0.10, icon: '🐛' },
  { id: '6-hr', name: 'Compile Custom Kernel', timeName: '6 Hours', duration: 6 * 60 * 60 * 1000, baseCoins: 150, gemChance: 0.25, icon: '💻' }
]

interface Expedition {
  slotId: number;
  character: Character;
  taskId: string;
  endTime: number;
}

interface ClaimResult {
  character: Character;
  coins: number;
  gems: number;
}

export const LabDutyGame: React.FC = () => {
  const { gameState, addCoins, addGems, completeDailyTask } = useGame()
  
  const [expeditions, setExpeditions] = useState<Expedition[]>([])
  const [now, setNow] = useState(Date.now())
  const [isLoaded, setIsLoaded] = useState(false)

  // Modal States
  const [selectingForSlot, setSelectingForSlot] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<string>(TASKS[0].id)
  
  // NEW: State for the flashy reward pop-up
  const [claimReward, setClaimReward] = useState<ClaimResult | null>(null)

  const [showInstructions, setShowInstructions] = useState(false)

  // --- PERSISTENCE & TIMERS ---
  useEffect(() => {
    const saved = localStorage.getItem('labExpeditions')
    if (saved) setExpeditions(JSON.parse(saved))
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('labExpeditions', JSON.stringify(expeditions))
  }, [expeditions, isLoaded])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  // --- LOGIC ---
  const uniqueRoster = Array.from(new Map(
    gameState.collection
      .filter(c => c.type === 'classmate' || c.type === 'professor')
      .map(c => [c.name, c])
  ).values())

  const getAvailableCharacters = () => {
    const deployedNames = expeditions.map(e => e.character.name)
    return uniqueRoster.filter(c => !deployedNames.includes(c.name))
  }

  const handleDispatch = (character: Character) => {
    if (selectingForSlot === null) return
    const task = TASKS.find(t => t.id === selectedTask)!
    
    const newExpedition: Expedition = {
      slotId: selectingForSlot,
      character,
      taskId: task.id,
      endTime: Date.now() + task.duration
    }
    
    setExpeditions(prev => [...prev.filter(e => e.slotId !== selectingForSlot), newExpedition])
    setSelectingForSlot(null)
  }

  // THE FIX: Replaced alert() with a rich state update
  const handleClaim = (exp: Expedition) => {
    const task = TASKS.find(t => t.id === exp.taskId)!
    
    const multiplier = exp.character.rarity === '5-star' ? 1.5 : 1.0;
    const coinsEarned = Math.floor(task.baseCoins * multiplier);
    
    let gemsEarned = 0;
    if (Math.random() < task.gemChance) {
      gemsEarned = 1;
    }

    // Add to global bank
    addCoins(coinsEarned);
    if (gemsEarned > 0) addGems(gemsEarned);

    // Trigger the flashy UI Modal
    setClaimReward({
      character: exp.character,
      coins: coinsEarned,
      gems: gemsEarned
    });
    
    // Clear the slot
    setExpeditions(prev => prev.filter(e => e.slotId !== exp.slotId))
  }

  // --- RENDERING HELPERS ---
  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00'
    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
    const s = (totalSeconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}` // Updated to support hours visually!
  }

  if (!isLoaded) return null

  return (
    <div className="max-w-4xl mx-auto fade-in relative">
      
      {/* INFO BUTTON (Upper Right Corner) */}
      <button 
        onClick={() => setShowInstructions(true)}
        className="absolute top-0 md:top-2 right-4 md:right-0 z-30 w-8 h-8 bg-slate-800/80 hover:bg-slate-700 border-2 border-slate-500 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-400 font-black text-sm shadow-lg backdrop-blur-sm transition-all"
        title="Lab Protocol"
      >
        ?
      </button>

      {/* ==========================================
          INSTRUCTION MODAL (Pop-up Overlay)
          ========================================== */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
          <div className="bg-slate-800 border-4 border-slate-600 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-3 right-4 text-slate-400 hover:text-white font-black text-xl transition-colors"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-black text-cyan-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-cyan-400 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center text-lg">?</span>
              Lab Protocol
            </h3>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-amber-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">Passive Expeditions</h4>
                <p>Dispatch your unused Classmates and Professors to the lab to earn passive income. <strong className="text-white">Timers continue running in real-time</strong>, even when you log out of the game!</p>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-amber-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">Time vs. Yield</h4>
                <p>Longer tasks (like Compiling Custom Kernels) yield exponentially more <strong>Coins</strong> and have a significantly higher chance to drop premium <strong>Gems</strong> upon completion.</p>
              </div>

              <div className="bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/30">
                <h4 className="text-purple-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">The 5-Star Advantage</h4>
                <p>Assigning a <strong className="text-amber-400">5-Star character</strong> to any task will automatically grant a massive <strong className="text-amber-400">+50% Loot Bonus</strong> to the final coin payout.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 bg-slate-700 hover:bg-slate-600 hover:text-cyan-400 text-white font-black py-3 rounded-xl uppercase tracking-widest transition-colors shadow-lg"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8 mt-4 md:mt-0">
        <h2 className="text-4xl md:text-5xl font-black text-cyan-400 mb-2 drop-shadow-md">LAB DUTY</h2>
        <p className="text-blue-300">Dispatch your roster to complete tasks and earn passive resources.</p>
      </div>

      {/* EXPEDITION SLOTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(slotId => {
          const exp = expeditions.find(e => e.slotId === slotId)
          const task = exp ? TASKS.find(t => t.id === exp.taskId)! : null
          const timeRemaining = exp ? exp.endTime - now : 0
          const isFinished = timeRemaining <= 0
          
          const progressPercent = exp && task ? Math.min(100, Math.max(0, 100 - (timeRemaining / task.duration) * 100)) : 0

          return (
            <div key={slotId} className="relative w-full h-72 bg-slate-900 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col">
              {exp && task ? (
                <>
                  <div className="relative w-full h-32 bg-slate-800">
                    <Image src={exp.character.image} alt={exp.character.name} fill className={`object-cover opacity-80 ${isFinished ? 'grayscale-0' : 'grayscale transition-all'}`} />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs font-bold text-white border border-slate-600 backdrop-blur-sm">
                      {task.icon} {task.timeName}
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between z-10">
                    <div className="text-center">
                      <h3 className="font-black text-white text-lg leading-tight">{exp.character.name}</h3>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{task.name}</p>
                    </div>

                    {isFinished ? (
                      <button 
                        onClick={() => handleClaim(exp)}
                        className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-xl transform hover:scale-105 transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-bounce"
                      >
                        CLAIM REWARDS ✨
                      </button>
                    ) : (
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1 text-cyan-300">
                          <span>WORKING...</span>
                          <span>{formatTime(timeRemaining)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setSelectingForSlot(slotId)}
                  className="w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-600 group-hover:border-cyan-400 flex items-center justify-center text-3xl mb-4 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    +
                  </div>
                  <span className="font-black tracking-widest">DISPATCH</span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* CHARACTER SELECTION MODAL */}
      {selectingForSlot !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectingForSlot(null)}>
          <div className="w-full max-w-3xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-h-[80vh] transform animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            
            <div className="md:w-1/3 flex flex-col gap-2 border-r border-slate-800 pr-4 overflow-y-auto">
              <h3 className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-2">1. Select Task</h3>
              {TASKS.map(task => (
                <button 
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${selectedTask === task.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-800 hover:border-slate-600'}`}
                >
                  <div className="font-black text-white">{task.icon} {task.timeName}</div>
                  <div className="text-xs text-slate-400 mb-2">{task.name}</div>
                  <div className="text-[10px] font-bold text-amber-400">Yield: ~{task.baseCoins} 🪙 {task.gemChance > 0 ? `| ${task.gemChance * 100}% 💎` : ''}</div>
                </button>
              ))}
            </div>

            <div className="md:w-2/3 flex flex-col overflow-hidden">
              <h3 className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-4 shrink-0">2. Assign Personnel</h3>
              
              {getAvailableCharacters().length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
                  <span className="text-4xl mb-2">📭</span>
                  <p>All available classmates are deployed.</p>
                  <p className="text-xs mt-2">Pull more from the Wish Banner!</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto pr-2 pb-4 content-start">
                  {getAvailableCharacters().map((char, idx) => {
                    const is5Star = char.rarity === '5-star'
                    return (
                      <button 
                        key={idx}
                        onClick={() => {
                          handleDispatch(char);
                          completeDailyTask('lab-duty');
                        }}
                        className={`relative w-full h-32 sm:h-36 rounded-xl overflow-hidden border-2 group transition-all transform hover:scale-105 hover:z-10 shrink-0 ${is5Star ? 'border-amber-500 hover:shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]'}`}
                      >
                        <Image src={char.image} alt={char.name} fill className="object-cover" />
                        <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-sm p-1.5 text-center flex flex-col justify-center items-center">
                          <p className="text-[10px] md:text-xs font-black text-white truncate w-full">{char.name}</p>
                          <p className={`text-[8px] md:text-[9px] font-bold ${is5Star ? 'text-amber-400' : 'text-slate-300'}`}>{is5Star ? '+50% LOOT' : 'STANDARD'}</p>
                        </div>
                        
                        <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[2px] transition-all">
                          <span className="bg-cyan-500 text-slate-900 text-[10px] font-black px-2 py-1 rounded">SELECT</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* NEW: REWARD CLAIM MODAL */}
      {claimReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
          <div className="relative max-w-sm w-full bg-slate-900 border-4 border-amber-400/50 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(251,191,36,0.3)]">
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-linear-to-b from-amber-500/20 to-transparent rounded-3xl pointer-events-none" />
            
            <h2 className="text-3xl font-black text-white mb-1 drop-shadow-md relative z-10">MISSION CLEAR!</h2>
            <p className="text-amber-400 font-bold mb-6 relative z-10">Expedition Successful</p>

            <div className="relative w-32 h-32 mx-auto mb-6">
              <Image 
                src={claimReward.character.image} 
                alt={claimReward.character.name} 
                fill 
                className="object-cover rounded-full border-4 border-slate-700 shadow-xl" 
              />
              <div className="absolute -bottom-3 -right-3 text-4xl animate-bounce drop-shadow-md">📦</div>
            </div>

            <p className="text-slate-300 mb-4 font-bold">
              <span className="text-cyan-400">{claimReward.character.name}</span> returned with loot:
            </p>

            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-center justify-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-3xl">🪙</span>
                <span className="text-3xl font-black text-white">+{claimReward.coins}</span>
              </div>
              
              {claimReward.gems > 0 && (
                <div className="flex items-center justify-center gap-3 bg-cyan-900/50 p-3 rounded-xl border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse">
                  <span className="text-3xl">💎</span>
                  <span className="text-3xl font-black text-white">+{claimReward.gems}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setClaimReward(null)}
              className="w-full py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-200 transform hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              COLLECT
            </button>
          </div>
        </div>
      )}

    </div>
  )
}