'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useGame, Character } from '@/app/game-context'
import { CharacterCard } from '@/components/character-card' 
import { ItemDetailsModal } from './item-details-modal' 

interface PullModalProps {
  amount: number
  cost: number
  costType: 'coins' | 'gems'
  onClose: () => void
}

export const PullModal: React.FC<PullModalProps> = ({ amount, cost, costType, onClose }) => {
  const { pullCards, addCoins, addGems, gameState, completeDailyTask } = useGame()
  const [pulling, setPulling] = useState(true)
  
  // 1. Expect a 'badgeText' string instead of an 'isNew' boolean
  const [pulledCharacters, setPulledCharacters] = useState<(Character & { badgeText: string })[]>([])
  
  const [selectedItem, setSelectedItem] = useState<Character | null>(null)
  const hasPulled = useRef(false)

  // 2. Change the snapshot to a Map to count EXACTLY how many copies we own
  const initialCollectionCounts = useRef<Map<string, number>>(new Map())

  // 3. THE MISSING USE-EFFECT (Re-added so the gacha actually pulls!)
  useEffect(() => {
    if (hasPulled.current) return
    hasPulled.current = true

    // Take a snapshot of your collection and COUNT every copy
    initialCollectionCounts.current = new Map()
    gameState.collection.forEach(c => {
      const currentCount = initialCollectionCounts.current.get(c.id) || 0
      initialCollectionCounts.current.set(c.id, currentCount + 1)
    })

    const executePull = () => {
      if (costType === 'coins') addCoins(-cost)
      if (costType === 'gems') addGems(-cost)

      setTimeout(() => {
        const results = pullCards(amount) 
        
        const processedResults = results.map(char => {
          // Check how many we owned BEFORE this specific pull
          const previousCount = initialCollectionCounts.current.get(char.id) || 0
          
          let badgeText = ''
          
          // Logic 1: Is it a 3-star item or junk? Hide the badge!
          if (char.rarity === '3-star' || char.type === 'junk') {
            badgeText = 'NONE'
          } 
          // Logic 2: Completely new character!
          else if (previousCount === 0) {
            badgeText = 'NEW'
          } 
          // Logic 3: Duplicate, but within C1 to C6 range
          else if (previousCount <= 6) {
            badgeText = `C${previousCount}`
          } 
          // Logic 4: Past C6? It's just a dupe now.
          else {
            badgeText = 'DUPE'
          }

          // IMPORTANT: Increment the count in our snapshot! 
          initialCollectionCounts.current.set(char.id, previousCount + 1)

          return { ...char, badgeText }
        })

        setPulledCharacters(processedResults)
        completeDailyTask('gacha')
        setPulling(false)
      }, 1500)
    }

    executePull()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      
      {/* 🎬 SUSPENSE ANIMATION */}
      {pulling && (
        <div className="text-center animate-pulse flex flex-col items-center">
          <div className="text-7xl md:text-9xl mb-6 animate-spin" style={{ animationDuration: '3s' }}>✨</div>
          <h2 className="text-3xl font-black text-amber-300 tracking-widest">WISHING...</h2>
        </div>
      )}

      {/* 🎉 RESULT REVEAL */}
      {!pulling && (
        <div className="py-8 max-w-5xl w-full flex flex-col items-center fade-in">
          <h2 className="text-4xl md:text-5xl font-black text-amber-300 mb-2 text-center" style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}>
            PULL SUCCESSFUL!
          </h2>
          <p className="text-blue-300 mb-8 font-bold text-center">New classmates have joined your roster.</p>
          
          {/* Card Grid */}
          <div className={`flex flex-wrap justify-center gap-4 mb-8 ${amount > 1 ? 'max-w-4xl' : ''}`}>
            {pulledCharacters.map((char, idx) => (
              
              // 1. We keep the wrapper div to handle the beautiful slide-up staggered animation
              <div 
                key={idx} 
                className={`flex flex-col items-center transform transition-all animate-slide-up ${amount === 1 ? 'scale-125 my-8 hover:scale-[1.30]' : 'scale-90 hover:scale-105 hover:z-10'}`}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                
                {/* 2. THE MAGIC: Render the component with absolute badges on top! */}
                <div className="relative">
                  <CharacterCard 
                    character={char} 
                    onClick={() => setSelectedItem(char)} 
                  />
                  
                  {/* THE BADGES */}
                  {char.badgeText === 'NEW' && (
                    <div className="absolute -top-3 -right-3 bg-red-500 text-white font-black px-3 py-1 rounded-lg transform rotate-12 shadow-[0_0_15px_rgba(239,68,68,0.8)] border-2 border-white animate-bounce z-20 text-xs md:text-sm tracking-widest">
                      NEW!
                    </div>
                  )}
                  
                  {char.badgeText.startsWith('C') && (
                    <div className="absolute -top-3 -right-3 bg-cyan-400 text-slate-900 font-black px-3 py-1 rounded-lg transform -rotate-6 shadow-[0_0_15px_rgba(34,211,238,0.6)] border-2 border-white z-20 text-xs md:text-sm animate-pulse">
                      {char.badgeText}
                    </div>
                  )}

                  {char.badgeText === 'DUPE' && (
                    <div className="absolute -top-3 -right-3 bg-slate-700 text-slate-300 font-black px-2 py-1 rounded-md shadow-lg border-2 border-slate-500 z-20 text-[10px] md:text-xs">
                      DUPE
                    </div>
                  )}
                  {/* If badgeText === 'NONE', we render nothing! */}
                </div>
                
                {/* 3. Keep the external text label for 10x pulls */}
                {amount > 1 && (
                  <div className="text-center mt-3">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${char.rarity === '5-star' ? 'text-amber-400' : char.rarity === '4-star' ? 'text-purple-400' : 'text-slate-400'}`}>
                    </p>
                  </div>
                )}
                
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-200 text-slate-900 font-black px-12 py-4 rounded-full text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            AWESOME!
          </button>
        </div>
      )}

      {/* RENDER THE MODAL ON TOP OF EVERYTHING ELSE */}
      <ItemDetailsModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
      
    </div>
  )
}