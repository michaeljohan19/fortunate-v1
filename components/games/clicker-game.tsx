'use client'

import React, { useState, useEffect } from 'react'
import { useGame } from '@/app/game-context'
import { InstructionModal } from '@/components/instruction-modal'

interface ClickerGameProps {
  onComplete: (coins: number) => void
}

const UPGRADE_COSTS = [0, 500, 1500, 4000, 10000]
const LEVEL_MULTIPLIERS = [0, 0.5, 1, 2, 3, 5]

type Drink = { id: string, emoji: string, name: string, cost: number, family: string }

const DRINKS: Drink[] = [
  // --- BASES (Free, unlocked from start) ---
  { id: 'base_coffee', emoji: '☕', name: 'Hot Coffee', cost: 0, family: 'coffee' },
  { id: 'base_boba', emoji: '🧋', name: 'Plain Boba', cost: 0, family: 'boba' },
  { id: 'base_matcha', emoji: '🍵', name: 'Hot Matcha', cost: 0, family: 'matcha' },
  { id: 'base_tea', emoji: '🍹', name: 'Iced Tea', cost: 0, family: 'tea' },
  
  // --- COFFEE EVOLUTIONS ---
  { id: 'iced_americano', emoji: '🧊☕', name: 'Iced Americano', cost: 500, family: 'coffee' },
  { id: 'caramel_macchiato', emoji: '🍯☕', name: 'Caramel Macchiato', cost: 2500, family: 'coffee' },
  { id: 'spanish_latte', emoji: '🥛☕', name: 'Spanish Latte', cost: 8000, family: 'coffee' },
  { id: 'mocha_frappe', emoji: '🍫🥤', name: 'Mocha Frappe', cost: 25000, family: 'coffee' }, // Whale Item!

  // --- BOBA EVOLUTIONS ---
  { id: 'brown_sugar', emoji: '🍮🧋', name: 'Brown Sugar Boba', cost: 1000, family: 'boba' },
  { id: 'taro_slush', emoji: '🍠🥤', name: 'Taro Slush', cost: 4000, family: 'boba' },

  // --- MATCHA EVOLUTIONS ---
  { id: 'iced_matcha', emoji: '🧊🍵', name: 'Iced Matcha', cost: 3000, family: 'matcha' },
  { id: 'matcha_frappe', emoji: '🍦🍵', name: 'Matcha Frappe', cost: 20000, family: 'matcha' }, // Whale Item!

  // --- TEA/REFRESHER EVOLUTIONS ---
  { id: 'blue_lemonade', emoji: '🍋🥤', name: 'Blue Lemonade', cost: 800, family: 'tea' },
  { id: 'hibiscus', emoji: '🌺🍹', name: 'Iced Hibiscus', cost: 2500, family: 'tea' },
  { id: 'soda', emoji: '🧊🥫', name: 'Craft Soda', cost: 10000, family: 'tea' },
]

export const ClickerGame: React.FC<ClickerGameProps> = ({ onComplete }) => {
  const { gameState, addCoins, consumeBuff, completeDailyTask } = useGame()
  
  // Game State
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [gameStarted, setGameStarted] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Progression State
  const [hasChosenStarter, setHasChosenStarter] = useState(false)
  const [clickLevel, setClickLevel] = useState(1)
  const [activeSkinId, setActiveSkinId] = useState('base_coffee')
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['base_coffee', 'base_boba', 'base_matcha', 'base_tea'])
  const [view, setView] = useState<'play' | 'shop'>('play')

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('clickerProgress')
    if (saved) {
      const parsed = JSON.parse(saved)
      setClickLevel(parsed.clickLevel || 1)
      setActiveSkinId(parsed.activeSkinId || 'base_coffee')
      setUnlockedSkins(parsed.unlockedSkins || ['base_coffee', 'base_boba', 'base_matcha', 'base_tea'])
      setHasChosenStarter(parsed.hasChosenStarter || false)
    }
  }, [])

  // Save progress
  useEffect(() => {
    if (hasChosenStarter) {
      localStorage.setItem('clickerProgress', JSON.stringify({
        clickLevel,
        activeSkinId,
        unlockedSkins,
        hasChosenStarter
      }))
    }
  }, [clickLevel, activeSkinId, unlockedSkins, hasChosenStarter])

  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem('clickerInstructions')
    if (!hasSeen) {
      setShowInstructions(true)
      localStorage.setItem('clickerInstructions', 'true')
    }
  }, [])

  // Timer logic - FIXED
  useEffect(() => {
    // If the game hasn't started, is already over, or the instructions are open, do nothing.
    if (!gameStarted || completed || showInstructions) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCompleted(true) // This triggers the game over screen
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Clean up the timer if the component unmounts or state changes
    return () => clearInterval(timer)
  }, [gameStarted, completed, showInstructions])

  const activeDrink = DRINKS.find(d => d.id === activeSkinId) || DRINKS[0]
  const currentMultiplier = LEVEL_MULTIPLIERS[clickLevel]
  const nextCost = UPGRADE_COSTS[clickLevel]

  const handleStarterChoice = (drinkId: string) => {
    setActiveSkinId(drinkId)
    setHasChosenStarter(true)
  }

  const handleUpgradeLevel = () => {
    if (clickLevel < 5 && gameState.coins >= nextCost) {
      addCoins(-nextCost)
      setClickLevel(prev => prev + 1)
      completeDailyTask('cafe');
    }
  }

  const handleBuySkin = (drink: Drink) => {
    if (gameState.coins >= drink.cost) {
      addCoins(-drink.cost)
      setUnlockedSkins(prev => [...prev, drink.id])
      setActiveSkinId(drink.id) // Auto-equip on buy
      completeDailyTask('cafe');
    }
  }

  // --- RENDER STARTER SCREEN ---
  if (!hasChosenStarter) {
    return (
      <div className="text-center fade-in py-8">
        <h2 className="text-4xl font-black mb-2 text-amber-300">Choose Your Starter</h2>
        <p className="text-blue-300 mb-8">Pick your preferred caffeine fix to begin grinding!</p>
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {DRINKS.filter(d => d.cost === 0).map(drink => (
            <button
              key={drink.id}
              onClick={() => handleStarterChoice(drink.id)}
              className="bg-slate-800 border-2 border-cyan-400/40 hover:border-cyan-300 rounded-2xl p-6 flex flex-col items-center gap-4 transform hover:scale-105 transition-all"
            >
              <span className="text-6xl">{drink.emoji}</span>
              <span className="font-black text-white">{drink.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const handleCollectReward = (coinsEarned: number) => {
    addCoins(coinsEarned) // Give them the money directly
    
    // Reset the game loop so they stay on the screen
    setCompleted(false)
    setGameStarted(false)
    setClicks(0)
    setTimeLeft(10)
  }

  // --- RENDER GAME OVER ---
  if (completed) {
    // 1. Check for Coffee Buff and Calculate Coins
    // (Assuming you have `const { gameState, consumeBuff } = useGame()` at the top of this component)
    const hasCoffee = gameState.activeBuffs?.arcadeDoubleCoins;
    const baseCoins = Math.floor(clicks * currentMultiplier);
    const finalCoins = hasCoffee ? baseCoins * 2 : baseCoins;

    return (
      <div className="text-center fade-in py-8 max-w-lg mx-auto">
        <h2 className="text-4xl font-black mb-6 drop-shadow-md">TIME'S UP! {activeDrink.emoji}</h2>
        
        {/* Added the standard dark container to match your other games! */}
        <div className="bg-slate-800/60 p-8 rounded-3xl border-2 border-slate-700 mb-8 w-full shadow-xl relative overflow-hidden">
          
          {/* NEW: ☕ Coffee Buff Banner */}
          {hasCoffee && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 uppercase tracking-widest border-b border-amber-500/30 shadow-inner text-center">
              ☕ Caffeine Rush Active
            </div>
          )}

          <p className={`text-xl mb-2 text-blue-100 uppercase tracking-widest font-bold ${hasCoffee ? 'mt-4' : ''}`}>Clicks</p>
          <p className="text-5xl font-black text-cyan-400 mb-6">{clicks}</p>
          
          <div className="w-full h-1 bg-slate-700 mb-4 rounded-full" />
          <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-tighter">Total Payout</p>

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
             <p className="text-5xl font-black text-amber-400 drop-shadow-md">🪙 {finalCoins}</p>
           )}
        </div>

        <button
          onClick={() => {
            // 2. CONSUME THE BUFF BEFORE LEAVING!
            if (hasCoffee) {
              consumeBuff('arcadeDoubleCoins');
            }
            
            // 3. Pass the FINAL coins to your collect function
            handleCollectReward(finalCoins);
          }}
          className="bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-black px-12 py-4 rounded-xl text-xl transform hover:scale-105 transition-all shadow-lg shadow-orange-500/30"
        >
          COLLECT 🎊
        </button>
      </div>
    )
  }

  // --- RENDER MAIN UI ---
  return (
    <div className="w-full relative">
      <InstructionModal 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Cafe Clicker"
        themeColor="amber"
        rules={[
          { icon: '☕', text: <p>Tap the drink as fast as you can before the <strong>10-second timer</strong> runs out.</p> },
          { icon: '📈', text: <p>Upgrade your <strong>Click Multiplier</strong> in the Evolution Menu to earn more coins per tap.</p> },
          { icon: '🍹', text: <p>Spend your hard-earned coins to unlock and evolve new premium drinks to flex your wealth!</p> }
        ]}
      />
      {/* Navigation Tabs */}
      {!gameStarted && (
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setShowInstructions(true)}
            className="absolute top-0 right-0 w-8 h-8 bg-slate-800 border-2 border-slate-600 rounded-full font-black text-slate-300 hover:text-white hover:border-slate-400 hover:scale-110 transition-all z-10 flex items-center justify-center shadow-lg"
          >
            ?
          </button>
          <button 
            onClick={() => setView('play')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'play' ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20' : 'bg-slate-800 text-gray-400 hover:text-white border border-slate-700'}`}
          >
            Play
          </button>
          <button 
            onClick={() => setView('shop')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'shop' ? 'bg-purple-400 text-slate-900 shadow-lg shadow-purple-400/20' : 'bg-slate-800 text-gray-400 hover:text-white border border-slate-700'}`}
          >
            Evolution Menu
          </button>
        </div>
      )}

      {/* Play Area */}
      {view === 'play' && (
        <div className="text-center">
          {!gameStarted ? (
            <div className="py-8">
              <div className="text-8xl mb-4 animate-bounce" style={{ letterSpacing: '-0.2em' }}>{activeDrink.emoji}</div>
              <h2 className="text-3xl font-black mb-2 text-white">{activeDrink.name}</h2>
              <div className="bg-slate-800 inline-block px-4 py-2 rounded-lg border border-slate-700 mb-8">
                <p className="text-amber-300 font-bold">Lvl {clickLevel} • {currentMultiplier} coins/click</p>
              </div>
              <br/>
              <button
                onClick={() => setGameStarted(true)}
                className="bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-black px-12 py-4 rounded-2xl text-2xl transform hover:scale-110 transition-all shadow-lg shadow-cyan-500/30"
              >
                START! 🚀
              </button>
            </div>
          ) : (
            <div className="py-4">
              <div className="flex justify-between items-center px-4 md:px-8 mb-8">
                <div className="bg-slate-900/60 border-2 border-cyan-400/40 rounded-xl px-4 md:px-6 py-3">
                  <p className="text-xs md:text-sm text-cyan-300 font-bold mb-1">TIME LEFT</p>
                  <p className="text-3xl md:text-4xl font-black text-white">{timeLeft}s</p>
                </div>
                <div className="bg-slate-900/60 border-2 border-amber-400/40 rounded-xl px-4 md:px-6 py-3">
                  <p className="text-xs md:text-sm text-amber-300 font-bold mb-1">CLICKS</p>
                  <p className="text-3xl md:text-4xl font-black text-white">{clicks}</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (gameStarted && !completed) setClicks(prev => prev + 1)
                }}
                className="text-[120px] md:text-[150px] leading-none select-none transform hover:scale-110 active:scale-90 transition-transform touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent', letterSpacing: '-0.2em' }}
              >
                {activeDrink.emoji}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Shop Area */}
      {view === 'shop' && (
        <div className="space-y-6">
          {/* Multiplier Upgrade Panel */}
          <div className="bg-slate-900/50 border-2 border-amber-400/30 rounded-2xl p-6">
            <h3 className="text-2xl font-black text-amber-400 mb-4">Click Multiplier</h3>
            
            <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4 mb-4 border border-slate-600">
              <div>
                <p className="font-bold text-white text-lg">Current: Level {clickLevel}</p>
                <p className="text-sm text-amber-300">{currentMultiplier} coins per click</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>

            {clickLevel < 5 ? (
              <button
                onClick={handleUpgradeLevel}
                disabled={gameState.coins < nextCost}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                  gameState.coins >= nextCost 
                    ? 'bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-lg shadow-amber-400/20' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Upgrade to Level {clickLevel + 1} (🪙 {nextCost})
              </button>
            ) : (
              <div className="w-full py-4 rounded-xl font-black text-lg text-center bg-amber-400/20 text-amber-400 border-2 border-amber-400 border-dashed">
                MAX LEVEL REACHED
              </div>
            )}
          </div>

          {/* Evolution Menu */}
          <div className="bg-slate-900/50 border-2 border-purple-400/30 rounded-2xl p-6">
            <h3 className="text-2xl font-black text-purple-400 mb-2">Drink Evolutions</h3>
            <p className="text-sm text-gray-300 mb-6">Upgrade your base drinks into premium recipes.</p>
            
            <div className="space-y-6">
              {['coffee', 'boba', 'matcha', 'tea'].map(family => {
                const familyDrinks = DRINKS.filter(d => d.family === family)
                return (
                  <div key={family} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <h4 className="text-white font-black capitalize mb-3 border-b border-slate-700 pb-2">{family} Family</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {familyDrinks.map((drink) => {
                        const isUnlocked = unlockedSkins.includes(drink.id)
                        const isActive = activeSkinId === drink.id

                        return (
                          <div key={drink.id} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                            isActive ? 'bg-purple-400/20 border-purple-400' : 'bg-slate-800 border-slate-700'
                          }`}>
                            <span className="text-3xl" style={{ letterSpacing: '-0.2em' }}>{drink.emoji}</span>
                            <span className="text-xs font-bold text-center w-full truncate text-gray-200">{drink.name}</span>
                            
                            {isUnlocked ? (
                              <button
                                onClick={() => setActiveSkinId(drink.id)}
                                disabled={isActive}
                                className={`w-full py-1.5 rounded-lg text-xs font-black transition-colors mt-auto ${
                                  isActive ? 'bg-purple-400 text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'
                                }`}
                              >
                                {isActive ? 'EQUIPPED' : 'EQUIP'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBuySkin(drink)}
                                disabled={gameState.coins < drink.cost}
                                className={`w-full py-1.5 rounded-lg text-xs font-black transition-all mt-auto ${
                                  gameState.coins >= drink.cost 
                                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-500' 
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                🪙 {drink.cost}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}