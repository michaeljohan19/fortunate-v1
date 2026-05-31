'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

const characters = [
  // --- 5-STAR PROFESSORS ---
  { id: 'mahaguay', name: 'Sir Mahaguay', image: '/characters/mahaguay.png', rarity: '5-star', type: 'professor' },
  { id: 'master', name: 'Sir Rodriguez', rarity: '5-star', type: 'professor', image: '/characters/master.png' },
  { id: 'cherry', name: "Ma'am Cherry", rarity: '5-star', type: 'professor', image: '/characters/cherry.png' },
  { id: 'doc-a', name: 'Doc A.', rarity: '5-star', type: 'professor', image: '/characters/doc-a.png' },
  { id: 'rufo', name: 'Sir Rufo', rarity: '5-star', type: 'professor', image: '/characters/rufo.png' },
  { id: 'meann', name : "Ma'am Meann", rarity: '5-star', type: 'professor', image: '/characters/meann.png' },

  // --- 5-STAR CLASSMATES ---
  { id: 'aaron', name: 'Aaron', image: '/characters/aaron.png', rarity: '5-star', type: 'classmate' },
  { id: 'ablay', name: 'Ablay', image: '/characters/ablay.png', rarity: '5-star', type: 'classmate' },
  { id: 'johan', name: 'Johan', image: '/characters/johan.png', rarity: '5-star', type: 'classmate' },
  { id: 'tim', name: 'Tim', image: '/characters/tim.png', rarity: '5-star', type: 'classmate' },

  { id: 'ahsilei', name: 'Ahsilei', image: '/characters/ahsilei.png', rarity: '4-star', type: 'classmate' },
  { id: 'alleiah', name: 'Alleiah', image: '/characters/alleiah.png', rarity: '4-star', type: 'classmate' },
  { id: 'andrea', name: 'Andrea', image: '/characters/andrea.png', rarity: '4-star', type: 'classmate' },
  { id: 'angeline', name: 'Angeline', image: '/characters/angeline.png', rarity: '4-star', type: 'classmate' },
  { id: 'angge', name: 'Angge', image: '/characters/angge.png', rarity: '4-star', type: 'classmate' },
  { id: 'aritz', name: 'Aritz', image: '/characters/aritz.png', rarity: '4-star', type: 'classmate' },
  { id: 'cef', name: 'Cefren', image: '/characters/cef.png', rarity: '4-star', type: 'classmate' },
  { id: 'charisse', name: 'Charisse', image: '/characters/charisse.png', rarity: '4-star', type: 'classmate' },
  { id: 'chean', name: 'Chean', image: '/characters/chean.png', rarity: '4-star', type: 'classmate' },
  { id: 'codi', name: 'Codi', image: '/characters/codi.png', rarity: '4-star', type: 'classmate' },
  { id: 'daniel', name: 'Dan', image: '/characters/daniel.png', rarity: '4-star', type: 'classmate' },
  { id: 'derick', name: 'Derick', image: '/characters/derick.png', rarity: '4-star', type: 'classmate' },
  { id: 'ella', name: 'Ella', image: '/characters/ella.png', rarity: '4-star', type: 'classmate' },
  { id: 'gelo', name: 'Gelo', image: '/characters/gelo.png', rarity: '4-star', type: 'classmate' },
  { id: 'geonell', name: 'Geonell', image: '/characters/geonell.png', rarity: '4-star', type: 'classmate' },
  { id: 'irish', name: 'Irish', image: '/characters/irish.png', rarity: '4-star', type: 'classmate' },
  { id: 'jaero', name: 'Jaero', image: '/characters/jaero.png', rarity: '4-star', type: 'classmate' },
  { id: 'jk', name: 'John Karlo', image: '/characters/JK2.png', rarity: '4-star', type: 'classmate' },
  { id: 'jose', name: 'Jose', image: '/characters/jose.png', rarity: '4-star', type: 'classmate' },
  { id: 'kate', name: 'Kate', image: '/characters/kate.png', rarity: '4-star', type: 'classmate' },
  { id: 'kenneth', name: 'Kenneth', image: '/characters/kenneth.png', rarity: '4-star', type: 'classmate' },
  { id: 'kier', name: 'Kier', image: '/characters/kier.png', rarity: '4-star', type: 'classmate' },
  { id: 'kimberly', name: 'Kim', image: '/characters/kimberly.png', rarity: '4-star', type: 'classmate' },
  { id: 'lalei', name: 'Lalei', image: '/characters/lalei.png', rarity: '4-star', type: 'classmate' },
  { id: 'lana', name: 'Lana', image: '/characters/lana.png', rarity: '4-star', type: 'classmate' },
  { id: 'lea', name: 'Lea', image: '/characters/lea.png', rarity: '4-star', type: 'classmate' },
  { id: 'liesharain', name: 'Liesha', image: '/characters/liesharain.png', rarity: '4-star', type: 'classmate' },
  { id: 'matt', name: 'Matthew', image: '/characters/matt.png', rarity: '4-star', type: 'classmate' },
  { id: 'mildred', name: 'Mildred', image: '/characters/mildred.png', rarity: '4-star', type: 'classmate' },
  { id: 'pierre', name: 'Pierre', image: '/characters/pierre.png', rarity: '4-star', type: 'classmate' },
  { id: 'raphael', name: 'Raphael', image: '/characters/raphael.png', rarity: '4-star', type: 'classmate' },
  { id: 'reniel', name: 'Reniel', image: '/characters/reniel.png', rarity: '4-star', type: 'classmate' },
  { id: 'sam', name: 'Samantha', image: '/characters/sam.png', rarity: '4-star', type: 'classmate' },
  { id: 'shu', name: 'Shu', image: '/characters/shu.png', rarity: '4-star', type: 'classmate' },
  { id: 'trixie', name: 'Trixie', image: '/characters/trixie.png', rarity: '4-star', type: 'classmate' },
]

export const WishBanner: React.FC = () => {
  const [featured, setFeatured] = useState(() => {
    return characters[Math.floor(Math.random() * characters.length)];
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * characters.length)
      setFeatured(characters[randomIndex])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const is5Star = featured.rarity === '5-star'
  const charBorder = is5Star ? 'border-amber-400' : 'border-purple-400'
  const charGlow = is5Star ? 'shadow-amber-400/50' : 'shadow-purple-500/50'
  const charText = is5Star ? 'text-amber-300' : 'text-purple-300'
  const silhouette = is5Star ? 'bg-amber-300' : 'bg-purple-500'

  return (
    <div className="w-full h-full relative overflow-hidden bg-linear-to-b from-slate-900 via-slate-950 to-black rounded-2xl border-4 border-amber-400/30 shadow-2xl">
      
      {/* 👇 NEW: INFO BUTTON (Upper Right) */}
      <button 
        onClick={() => window.dispatchEvent(new Event('open-welcome-modal'))}
        className="absolute top-4 right-4 z-40 w-8 h-8 bg-slate-800/80 hover:bg-slate-700 border-2 border-slate-500 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:border-amber-400 font-black text-sm shadow-lg backdrop-blur-sm transition-all"
        title="Show Welcome Tour"
      >
        ?
      </button>

      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute top-0 left-1/2 w-96 h-96 blur-3xl rounded-full mix-blend-screen transition-colors duration-1000 ${is5Star ? 'bg-yellow-400' : 'bg-purple-600'}`} />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400 blur-3xl rounded-full mix-blend-screen" />
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
        {/* Silhouette shadow effect */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className={`w-64 h-96 rounded-full blur-3xl transition-colors duration-1000 ${silhouette}`} />
        </div>

        {/* Featured character */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="relative w-64 h-80 md:w-80 md:h-96">
            <Image
              src={featured.image}
              alt={featured.name}
              fill
              className="object-cover rounded-xl shadow-2xl"
              priority
            />
            {/* Dynamic INNER frame effect based on Rarity */}
            <div className={`absolute inset-0 rounded-xl border-4 shadow-lg transition-all duration-1000 ${charBorder} ${charGlow}`} />
          </div>

          {/* Character info */}
          <div className="relative z-20 mt-6 text-center">
            <p className={`text-xs md:text-sm font-bold uppercase tracking-widest mb-2 transition-colors duration-1000 ${charText}`}>
              {featured.rarity}
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">{featured.name}</h3>
            <p className="text-xs md:text-sm text-blue-300">Currently on Rate-Up!</p>
          </div>
        </div>

        <div className="absolute top-4 left-4 text-4xl opacity-30 animate-pulse">✨</div>
        <div className="absolute bottom-4 right-4 text-4xl opacity-30 animate-pulse z-0">✨</div>
      </div>
    </div>
  )
}