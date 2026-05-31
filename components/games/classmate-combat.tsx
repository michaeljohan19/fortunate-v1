'use client'

import React, { useState, useEffect } from 'react'
import { useGame, Character, characters, CEClass } from '@/app/game-context'
import Image from 'next/image'
import { CharacterCard } from '@/components/character-card'
// 1. IMPORT YOUR INSTRUCTION MODAL
import { InstructionModal, Rule } from '@/components/instruction-modal' // <-- Adjust path if needed!
import battleBackground from '@/public/battle-bg.png'

interface TerminalCombatProps {
  onComplete: (coins: number, stayInGame?: boolean) => void
}

type Move = { name: string; power: number; accuracy: number; type: 'attack' | 'heal' }
type Combatant = { 
  id: string; 
  name: string; 
  hp: number; 
  maxHp: number; 
  atk: number; 
  def: number; 
  image?: string; 
  sprite?: string;
  cLevel?: number;
  class?: string;
}


const PLAYER_MOVES: Move[] = [
  { name: 'Quick Strike', power: 20, accuracy: 100, type: 'attack' },
  { name: 'Take a Breather', power: 30, accuracy: 100, type: 'heal' },
  { name: 'Heavy Smash', power: 50, accuracy: 75, type: 'attack' },
  { name: 'Desperate Swing', power: 80, accuracy: 50, type: 'attack' } 
]

const ENEMY_MOVES: Move[] = [
  { name: 'Quick Strike', power: 20, accuracy: 100, type: 'attack' }, 
  { name: 'Heavy Smash', power: 35, accuracy: 80, type: 'attack' },   
  { name: 'Desperate Cramming', power: 60, accuracy: 50, type: 'attack' } // Lowered accuracy to 50%
]

export const ClassmateCombatGame: React.FC<TerminalCombatProps> = ({ onComplete }) => {
  const { gameState, consumeBuff, completeDailyTask } = useGame();
  
  const [currentScreen, setCurrentScreen] = useState<'start' | 'select' | 'battle' | 'victory' | 'defeat'>('start')
  const [turn, setTurn] = useState<'player' | 'enemy' | 'processing'>('player')
  const [combatLog, setCombatLog] = useState<string[]>(['A Challenger appears!'])
  
  const [player, setPlayer] = useState<Combatant | null>(null)
  const [enemy, setEnemy] = useState<Combatant | null>(null)

  // 2. NEW STATE: Controls the Rules Modal visibility
  const [showRules, setShowRules] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false);

  // 3. DEFINE THE RULES DATA
  const combatRules: Rule[] = [
    { icon: '⚔️', text: <span><strong className="text-white">Class Advantage:</strong> Striking a weakness deals <strong className="text-amber-400">1.5x Damage!</strong></span> },
    { icon: '💻', text: <span><strong className="text-cyan-400">Software</strong> crashes <strong className="text-amber-400">Data Analyst</strong></span> },
    { icon: '📊', text: <span><strong className="text-amber-400">Data Analyst</strong> parses <strong className="text-purple-400">ML</strong></span> },
    { icon: '🧠', text: <span><strong className="text-purple-400">ML</strong> predicts <strong className="text-emerald-400">Networks</strong></span> },
    { icon: '🌐', text: <span><strong className="text-emerald-400">Networks</strong> throttles <strong className="text-cyan-400">Software</strong></span> },
    { icon: '🌟', text: <span><strong className="text-white">Certifications:</strong> Duplicate pulls (C1-C6) unlock powerful hidden passives!</span> },
  ]

  const CLASS_INFO: Record<string, { name: string, icon: string, bg: string, text: string }> = {
      'Software': { name: 'Software', icon: '💻', bg: 'bg-cyan-950/80 border-cyan-500/50', text: 'text-cyan-400' },
      'Networks': { name: 'Networks', icon: '🌐', bg: 'bg-emerald-950/80 border-emerald-500/50', text: 'text-emerald-400' },
      'Data': { name: 'Data', icon: '📊', bg: 'bg-amber-950/80 border-amber-500/50', text: 'text-amber-400' },
      'ML': { name: 'ML', icon: '🧠', bg: 'bg-purple-950/80 border-purple-500/50', text: 'text-purple-400' },
    };

  const addToLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-3), message])
  }

  const selectCharacter = (selectedChar: Character) => {
    const totalOwned = gameState.collection.filter(c => c.id === selectedChar.id).length
    const cLevel = Math.min(6, Math.max(0, totalOwned - 1))

    const is5Star = selectedChar.rarity === '5-star'
    let baseHp = is5Star ? 150 : 120
    let baseAtk = is5Star ? 16 : 12
    let baseDef = is5Star ? 8 : 5

    if (cLevel >= 1) baseHp = Math.floor(baseHp * 1.15)
    if (cLevel >= 2) baseAtk = Math.floor(baseAtk * 1.15)
    if (cLevel >= 4) baseDef = Math.floor(baseDef * 1.20)

    setPlayer({ 
      id: selectedChar.id,
      name: selectedChar.name, 
      hp: baseHp, maxHp: baseHp, atk: baseAtk, def: baseDef, 
      image: selectedChar.image,
      sprite: is5Star ? '🌟' : '👤',
      cLevel: cLevel 
    })

    setCombatLog([`${selectedChar.name} stepped up to the challenge!`])
    setTurn('player')
    setCurrentScreen('battle')
  }

  const executeMove = (attacker: Combatant, defender: Combatant, move: Move) => {
    const effectiveAccuracy = (attacker.cLevel && attacker.cLevel >= 5) ? 100 : move.accuracy;
    if (Math.random() * 100 > effectiveAccuracy) {
      addToLog(`${attacker.name} used ${move.name}... but it missed!`)
      return { newAttackerHp: attacker.hp, newDefenderHp: defender.hp }
    }

    if (defender.cLevel === 6 && Math.random() < 0.25) {
      addToLog(`C6 PASSIVE: Agrivision YOLOv11 engaged!`)
      addToLog(`${defender.name} evaded and Counter-Struck!`)
      let counterDamage = Math.max(1, Math.floor((20 * (defender.atk / attacker.def)) / 3))
      return { newAttackerHp: Math.max(0, attacker.hp - counterDamage), newDefenderHp: defender.hp }
    }

    if (move.type === 'heal') {
      const healAmount = Math.floor(attacker.maxHp * (move.power / 100))
      return { newAttackerHp: Math.min(attacker.maxHp, attacker.hp + healAmount), newDefenderHp: defender.hp }
    }

    // 4. Base Damage Math (THE FIX: Changed divisor to / 4 to slow down combat)
    let damage = Math.max(1, Math.floor((move.power * (attacker.atk / defender.def)) / 4))

    // 5. Class Advantage Logic (The 4-Class Loop)
    if (gameState.classMap && gameState.classMap[attacker.id] && gameState.classMap[defender.id]) {
      const pClass = gameState.classMap[attacker.id]
      const dClass = gameState.classMap[defender.id]
      
      const advantageMap: Record<string, string> = {
        'Software': 'Data',
        'Data': 'ML',
        'ML': 'Networks',
        'Networks': 'Software'
      }

      if (advantageMap[pClass] === dClass) {
        // Attacker has the advantage!
        damage = Math.floor(damage * 1.5)
        addToLog(`💥 CLASS ADVANTAGE! ${attacker.name} deals massive damage!`)
      } else if (advantageMap[dClass] === pClass) {
        // Defender has the advantage! (Attacker is weak)
        damage = Math.floor(damage * 0.75)
        addToLog(`🛡️ RESISTED! ${defender.name} has the Class Advantage!`)
      }
    }
    
    const critChance = (attacker.cLevel && attacker.cLevel >= 3) ? 0.25 : 0.10;
    if (Math.random() < critChance) {
      damage = Math.floor(damage * 1.5)
      addToLog(`A Critical Hit!`)
    }

    const newHp = Math.max(0, defender.hp - damage)
    addToLog(`${attacker.name} used ${move.name} for ${damage} damage!`)
    
    return { newAttackerHp: attacker.hp, newDefenderHp: newHp }
  }

  const handlePlayerMove = (move: Move) => {
    if (turn !== 'player' || !player || !enemy) return
    setTurn('processing') 

    const { newAttackerHp, newDefenderHp } = executeMove(player, enemy, move)
    
    setPlayer(prev => prev ? { ...prev, hp: newAttackerHp } : null)
    setEnemy(prev => prev ? { ...prev, hp: newDefenderHp } : null)

    if (newDefenderHp <= 0) {
      completeDailyTask('combat');
      setTimeout(() => {
        addToLog(`${enemy.name} was defeated!`)
        setTimeout(() => setCurrentScreen('victory'), 1500)
      }, 1000)
      return
    }

    setTimeout(() => setTurn('enemy'), 1500)
  }

 // --- ENEMY AI LOOP ---
  useEffect(() => {
    if (turn === 'enemy' && currentScreen === 'battle' && player && enemy) {
      const enemyTimer = setTimeout(() => {
        
        // THE FIX: Immediately lock the turn state so React doesn't trigger a double-attack when the HP changes!
        setTurn('processing')

        const randomMove = ENEMY_MOVES[Math.floor(Math.random() * ENEMY_MOVES.length)]
        const { newAttackerHp, newDefenderHp } = executeMove(enemy, player, randomMove)
        
        setEnemy(prev => prev ? { ...prev, hp: newAttackerHp } : null)
        setPlayer(prev => prev ? { ...prev, hp: newDefenderHp } : null)

        if (newDefenderHp <= 0) {
          setTimeout(() => {
            addToLog(`${player.name} fainted...`)
            setTimeout(() => setCurrentScreen('defeat'), 1500)
          }, 1000)
          return
        }

        setTimeout(() => setTurn('player'), 1500)
      }, 1000) 

      return () => clearTimeout(enemyTimer)
    }
  }, [turn, currentScreen, enemy, player]) 


  // ==========================================
  // RENDER: START SCREEN
  // ==========================================
  if (currentScreen === 'start') {
    return (
      <>
        {/* Added 'relative' to this container so the ? button stays inside it */}
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border-2 border-dashed border-cyan-500/30 max-w-lg mx-auto fade-in flex flex-col items-center relative">
          
          {/* THE NEW '?' BUTTON (Start Screen) */}
          <button 
            onClick={() => setShowRules(true)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-cyan-400 font-black text-xl flex items-center justify-center hover:bg-slate-700 hover:text-cyan-300 hover:scale-110 transition-all shadow-lg z-10"
            title="How to Play"
          >
            ?
          </button>

          <div className="text-7xl mb-6 mt-4">🥊</div>
          <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">Classroom Combat</h2>
          <p className="text-cyan-300 mb-8 max-w-sm mx-auto px-4 text-sm">Choose your best student and battle for coins!</p>
          
          <button 
            onClick={() => {
              const fourStarClassmates = characters.filter(c => c.rarity === '4-star' && c.type === 'classmate')
              const randomEnemyChar = fourStarClassmates[Math.floor(Math.random() * fourStarClassmates.length)]
              
              setEnemy({ 
                id: randomEnemyChar.id, 
                name: randomEnemyChar.name, 
                hp: 150, // Dropped to 150
                maxHp: 150, 
                atk: 10, // Dropped ATK so they don't two-shot you!
                def: 8, 
                image: randomEnemyChar.image, 
                sprite: '😠',
                cLevel: 3 
              })
              setCurrentScreen('select')
            }} 
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-12 py-5 rounded-2xl text-2xl transform hover:scale-110 transition-all shadow-xl shadow-cyan-500/20"
          >
            SELECT FIGHTER
          </button>
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
          title="Combat Training" 
          titleIcon="🥊" 
          rules={combatRules} 
          themeColor="cyan" 
        />
      </>
    )
  }

  // ==========================================
  // RENDER: CHARACTER SELECTION SCREEN
  // ==========================================
  if (currentScreen === 'select') {
    const availableFighters = gameState.collection.filter(
      (item, index, self) => 
        (item.type === 'classmate' || item.type === 'professor') &&
        (item.rarity === '4-star' || item.rarity === '5-star') &&
        index === self.findIndex((t) => t.id === item.id)
    )
    
    const enemyClass = enemy ? gameState.classMap[enemy.id] : null;
    const enemyClassData = enemyClass ? CLASS_INFO[enemyClass] : null;

    return (
      <>
        <div className="max-w-4xl mx-auto py-8 fade-in text-center w-full relative">
          
          {/* THE NEW '?' BUTTON (Select Screen) */}
          <button 
            onClick={() => setShowRules(true)} 
            className="absolute top-2 right-4 md:right-0 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-cyan-400 font-black text-xl flex items-center justify-center hover:bg-slate-700 hover:text-cyan-300 hover:scale-110 transition-all shadow-lg z-20"
            title="Class Matchups"
          >
            ?
          </button>

          {/* OPPONENT SCOUTING BANNER */}
          {enemy && enemyClassData && (
            <div className="bg-slate-900/80 border-2 border-slate-700 p-4 md:px-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between shadow-xl max-w-2xl mx-auto backdrop-blur-md mt-6 md:mt-0">
              <div className="text-center md:text-left mb-3 md:mb-0">
                <p className="text-xs text-red-400 font-black tracking-widest uppercase animate-pulse mb-1">Incoming Opponent</p>
                <h3 className="text-2xl md:text-3xl font-black text-white">{enemy.name}</h3>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest hidden md:inline">Class Identified:</span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-inner ${enemyClassData.bg}`}>
                  <span className="text-xl">{enemyClassData.icon}</span>
                  <span className={`text-sm font-black uppercase tracking-widest ${enemyClassData.text}`}>
                    {enemyClass}
                  </span>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Select Counter-Measure</h2>
          <p className="text-slate-400 mb-8 text-sm">Choose a fighter with a Class Advantage!</p>
          
          {availableFighters.length === 0 ? (
            <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-700">
              <p className="text-xl text-red-400 font-bold mb-4">No Fighters Available!</p>
              <p className="text-slate-400 mb-6">You need to pull at least one 4-Star or 5-Star character from the Gacha to play this mode.</p>
              <button onClick={() => onComplete(0, false)} className="bg-slate-700 text-white font-bold px-6 py-3 rounded-lg hover:bg-slate-600">Return to Arcade</button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-5 px-4 justify-items-center w-full">
              {availableFighters.map(char => (
                <CharacterCard 
                  key={char.id}
                  character={char} 
                  onClick={() => selectCharacter(char)} 
                  layout="tall"
                />
              ))}
            </div>
          )}
        </div>

        {/* INSTRUCTION MODAL */}
        <InstructionModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
          title="Combat Training" 
          titleIcon="🥊" 
          rules={combatRules} 
          themeColor="cyan" 
        />
      </>
    )
  }

  // ==========================================
  // RENDER: VICTORY / DEFEAT
  // ==========================================
  if (currentScreen === 'victory' || currentScreen === 'defeat') {
    const isWin = currentScreen === 'victory'
    
    // 1. Check for Coffee Buff and Calculate Coins
    const hasCoffee = gameState.activeBuffs?.arcadeDoubleCoins;
    const baseCoins = isWin ? 100 : 20;
    const finalCoins = hasCoffee ? baseCoins * 2 : baseCoins;

    return (
      <div className="text-center py-12 max-w-lg mx-auto fade-in">
        <h2 className={`text-5xl font-black mb-6 drop-shadow-md ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
          {isWin ? 'VICTORY!' : 'DEFEATED'}
        </h2>
        
        {/* Added relative and overflow-hidden for the banner */}
        <div className="bg-slate-800/60 p-8 rounded-3xl border-2 border-slate-700 mb-8 w-full shadow-xl relative overflow-hidden">
           
           {/* NEW: ☕ Coffee Buff Banner */}
           {hasCoffee && (
             <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner">
               ☕ Caffeine Rush Active
             </div>
           )}

           <p className={`text-slate-400 font-bold uppercase tracking-widest mb-2 ${hasCoffee ? 'mt-4' : ''}`}>
             Prize Money
           </p>
           
           {/* NEW: Dynamic Coin Display */}
           {hasCoffee ? (
             <div className="flex items-center justify-center gap-4">
               {/* Original Amount Crossed Out */}
               <p className="text-4xl font-bold text-slate-500 line-through opacity-70">🪙 {baseCoins}</p>
               <p className="text-3xl text-amber-500 font-black animate-pulse">➔</p>
               {/* Doubled Amount */}
               <p className="text-6xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
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
            setCurrentScreen('start'); 
          }} 
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-12 py-4 rounded-full text-xl transform hover:scale-105 transition-all shadow-lg"
        >
          CONTINUE
        </button>
      </div>
    )
  }

  // ==========================================
  // RENDER: BATTLE UI
  // ==========================================
  if (!player || !enemy) return null

  const playerHpPct = Math.max(0, (player.hp / player.maxHp) * 100)
  const enemyHpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100)

  const enemyClass = gameState.classMap[enemy.id];
  const enemyClassData = enemyClass ? CLASS_INFO[enemyClass as keyof typeof CLASS_INFO] : null;

  const playerClass = gameState.classMap[player.id];
  const playerClassData = playerClass ? CLASS_INFO[playerClass as keyof typeof CLASS_INFO] : null;

  return (
    <div className="max-w-3xl mx-auto fade-in relative">
      
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
            
            <h3 className="text-2xl font-black text-amber-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-amber-400 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center text-lg">?</span>
              Battle Manual
            </h3>

            <div className="space-y-4 text-sm text-slate-300">
              {/* Stat Definitions */}
              <div>
                <h4 className="text-cyan-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">Move Stats</h4>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <strong className="text-white w-12 shrink-0">PWR:</strong> 
                    <span><strong className="text-amber-400">Power.</strong> The base damage the attack will deal to the enemy.</span>
                  </li>
                  <li className="flex gap-2">
                    <strong className="text-white w-12 shrink-0">ACC:</strong> 
                    <span><strong className="text-green-400">Accuracy.</strong> The percentage chance (%) the move will successfully hit.</span>
                  </li>
                </ul>
              </div>

              {/* Class Advantages */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mt-4">
                <h4 className="text-purple-400 font-bold uppercase tracking-widest mb-2 text-center">Class Advantages</h4>
                <p className="text-[10px] text-center text-slate-500 mb-3 font-bold uppercase tracking-wider">Stronger class deals bonus damage</p>
                
                {/* UPDATE THESE TO MATCH YOUR ACTUAL CLASSES */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-center items-center gap-3 font-black text-xs md:text-sm">
                    <span className="text-red-400 w-20 text-right">Software</span>
                    <span className="text-slate-600 text-[10px] uppercase"> ➔</span>
                    <span className="text-blue-400 w-20 text-left">Data</span>
                  </div>
                  <div className="flex justify-center items-center gap-3 font-black text-xs md:text-sm">
                    <span className="text-blue-400 w-20 text-right">Data</span>
                    <span className="text-slate-600 text-[10px] uppercase"> ➔</span>
                    <span className="text-green-400 w-20 text-left">ML</span>
                  </div>
                  <div className="flex justify-center items-center gap-3 font-black text-xs md:text-sm">
                    <span className="text-green-400 w-20 text-right">ML</span>
                    <span className="text-slate-600 text-[10px] uppercase">➔</span>
                    <span className="text-purple-400 w-20 text-left">Networks</span>
                  </div>
                  <div className="flex justify-center items-center gap-3 font-black text-xs md:text-sm">
                    <span className="text-purple-400 w-20 text-right">Networks</span>
                    <span className="text-slate-600 text-[10px] uppercase">➔</span>
                    <span className="text-red-400 w-20 text-left">Software</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white font-black py-3 rounded-xl uppercase tracking-widest transition-colors shadow-lg"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* 1. Main Wrapper */}
      <div className="rounded-t-2xl p-6 md:p-8 relative min-h-100 border-4 border-slate-700 overflow-hidden shadow-inner bg-slate-900">
        
        {/* INFO BUTTON (Upper Right Corner) */}
        <button 
          onClick={() => setShowInstructions(true)}
          className="absolute top-4 right-4 z-30 w-8 h-8 bg-slate-800/80 hover:bg-slate-700 border-2 border-slate-500 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:border-amber-400 font-black text-sm shadow-lg backdrop-blur-sm transition-all"
          title="Battle Manual"
        >
          ?
        </button>

        {/* The Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-200 blur-sm scale-105"
          style={{ backgroundImage: `url(${battleBackground.src})` }}
        />

        {/* 2. Dark Tint Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        {/* ==========================================
            ENEMY SECTION (Top Right)
            ========================================== */}
        <div className="absolute top-12 right-8 flex items-center gap-4 z-20">
          
          {/* Enemy HUD */}
          <div className="bg-white/95 backdrop-blur-sm border-4 border-slate-800 rounded-xl p-3 w-48 shadow-2xl">
            <div className="flex justify-between font-black text-slate-800 text-sm uppercase tracking-tighter">
              <span className="truncate pr-2">{enemy.name}</span>
              <span>Lv. 40</span>
            </div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 truncate">
              {enemyClassData ? enemyClassData.name : (enemyClass || 'Unknown Class')}
            </div>
            <div className="w-full bg-slate-700 h-3 rounded-full border-2 border-slate-800 overflow-hidden mb-1 shadow-inner">
              <div className={`h-full transition-all duration-500 ${enemyHpPct > 50 ? 'bg-green-500' : enemyHpPct > 20 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${enemyHpPct}%` }} />
            </div>
            <div className="text-right font-black text-slate-600 text-xs">
              {enemy.hp} / {enemy.maxHp}
            </div>
          </div>

          {/* Enemy Sprite */}
          <div className={`transform transition-transform ${turn === 'processing' ? 'animate-bounce' : ''}`}>
            {enemy.image ? (
              <div className="w-28 h-28 md:w-36 md:h-36 relative rounded-full overflow-hidden border-4 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.7)] bg-slate-800">
                 <Image src={enemy.image} alt={enemy.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="text-7xl md:text-8xl drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">{enemy.sprite}</div>
            )}
          </div>
        </div>

        {/* ==========================================
            PLAYER SECTION (Bottom Left)
            ========================================== */}
        <div className="absolute bottom-8 left-8 flex items-center gap-4 z-20">
          
          {/* Player Sprite */}
          <div className={`transform transition-transform ${turn === 'enemy' ? 'animate-bounce' : ''}`}>
            {player.image ? (
              <div className="w-28 h-28 md:w-36 md:h-36 relative rounded-full overflow-hidden border-4 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.7)] bg-slate-800">
                 <Image src={player.image} alt={player.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="text-7xl md:text-8xl drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">{player.sprite}</div>
            )}
          </div>

          {/* Player HUD */}
          <div className="bg-white/95 backdrop-blur-sm border-4 border-slate-800 rounded-xl p-3 w-56 shadow-2xl">
            <div className="flex justify-between font-black text-slate-800 text-sm uppercase tracking-tighter">
              <span className="truncate pr-2">{player.name}</span>
              <span>Lv. {player.maxHp > 120 ? '50' : '40'}</span>
            </div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 truncate">
              {playerClassData ? playerClassData.name : (playerClass || 'Unknown Class')}
            </div>
            <div className="w-full bg-slate-700 h-3 rounded-full border-2 border-slate-800 overflow-hidden mb-1 shadow-inner">
              <div className={`h-full transition-all duration-500 ${playerHpPct > 50 ? 'bg-green-500' : playerHpPct > 20 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${playerHpPct}%` }} />
            </div>
            <div className="text-right font-black text-slate-600 text-xs">
              {player.hp} / {player.maxHp}
            </div>
          </div>

        </div>
      </div>
  
      {/* Combat Log & Action Menu */}
      <div className="flex flex-col md:flex-row bg-slate-800 border-x-4 border-b-4 border-slate-700 rounded-b-2xl overflow-hidden min-h-35">
        
        <div className="flex-1 p-4 md:p-6 border-b-4 md:border-b-0 md:border-r-4 border-slate-700">
          <div className="font-mono text-slate-300 text-sm md:text-base space-y-1">
            {combatLog.map((log, idx) => (
              <p key={idx} className={idx === combatLog.length - 1 ? 'text-white font-bold animate-pulse' : 'opacity-60'}>
                &gt; {log}
              </p>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-2 grid grid-cols-2 gap-2 bg-slate-900">
          {PLAYER_MOVES.map((move, idx) => (
            <button
              key={idx}
              disabled={turn !== 'player'}
              onClick={() => handlePlayerMove(move)}
              className={`p-3 rounded-lg font-black border-2 transition-all flex flex-col items-center justify-center ${
                turn === 'player' 
                  ? 'bg-slate-800 border-slate-600 text-slate-200 hover:border-cyan-400 hover:bg-slate-700 hover:text-cyan-400 active:scale-95' 
                  : 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed'
              }`}
            >
              <span className="text-sm uppercase tracking-tighter text-center leading-tight">{move.name}</span>
              <span className="text-[10px] text-slate-500 mt-1 tracking-widest font-bold">
                {move.type === 'heal' 
                  ? 'RECOVERS HP' 
                  : `PWR: ${move.power} | ACC: ${move.accuracy}`
                }
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}