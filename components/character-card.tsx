'use client'

import Image from 'next/image'
import { Character, useGame } from '@/app/game-context'

interface CharacterCardProps {
  character: Character
  onClick?: () => void
  layout?: 'tall' | 'square' // NEW: Controls the shape of the card!
}

const rarityBorders = {
  '3-star': 'border-slate-400',
  '4-star': 'border-purple-400',
  '5-star': 'border-amber-400',
};

const rarityBgs = {
  '3-star': 'bg-slate-800', 
  '4-star': 'bg-purple-900/40',
  '5-star': 'bg-amber-900/40',
};

const rarityGlow = {
  '3-star': 'shadow-lg shadow-slate-500/20',
  '4-star': 'shadow-xl shadow-purple-500/40',
  '5-star': 'shadow-2xl shadow-amber-500/60',
};

const rarityTextColors = {
  '3-star': 'text-slate-300',
  '4-star': 'text-purple-400',
  '5-star': 'text-amber-400',
};

const CLASS_INFO: Record<string, { icon: string, bg: string }> = {
  'Software': { icon: '💻', bg: 'bg-cyan-950/80 border-cyan-500/50' },
  'Networks': { icon: '🌐', bg: 'bg-emerald-950/80 border-emerald-500/50' },
  'Data': { icon: '📊', bg: 'bg-amber-950/80 border-amber-500/50' },
  'ML': { icon: '🧠', bg: 'bg-purple-950/80 border-purple-500/50' },
};

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick, layout = 'tall' }) => {
  const { gameState } = useGame()
  
  const charClass = gameState.classMap?.[character.id]
  const classData = charClass ? CLASS_INFO[charClass] : null
  const isCharacter = character.type === 'classmate' || character.type === 'professor';
  const cardBackground = isCharacter ? rarityBgs[character.rarity] : 'bg-white';

  // DYNAMIC CLASSES based on the 'layout' prop
  const isSquare = layout === 'square';
  const shapeClasses = isSquare ? 'w-full aspect-square rounded-lg' : 'w-28 md:w-36 h-40 md:h-52 rounded-xl md:rounded-2xl';
  const hoverClasses = isSquare ? 'hover:scale-105' : 'hover:scale-105 hover:-rotate-2';

  return (
    <div
      onClick={onClick}
      // Added 'group' to trigger the text hover effect
      className={`relative ${shapeClasses} border-2 ${isSquare ? '' : 'md:border-4'} ${rarityBorders[character.rarity]} ${cardBackground} ${rarityGlow[character.rarity]} cursor-pointer transform transition-all ${hoverClasses} overflow-hidden group`}
    >
      {/* Class Icon Badge */}
      {isCharacter && classData && (
        <div 
          className={`absolute top-1.5 md:top-2 right-1.5 md:right-2 w-6 h-6 md:w-8 md:h-8 rounded-full border backdrop-blur-md shadow-md z-20 flex items-center justify-center ${classData.bg}`}
          title={charClass}
        >
          <span className="text-[10px] md:text-sm">{classData.icon}</span>
        </div>
      )}

      {/* The Image */}
      <Image
        src={character.image}
        alt={character.name}
        fill
        className={`${!isCharacter ? 'object-contain p-4' : 'object-cover'} ${isSquare ? 'transition-transform duration-500 group-hover:scale-110' : ''}`}
        sizes="(max-width: 768px) 112px, 144px"
      />
      
      {/* Bottom Gradient & Text Block */}
      <div className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-slate-950 via-slate-900/80 to-transparent ${isSquare ? 'pt-16' : 'pt-12'} pb-2 px-1 z-10 flex flex-col items-center justify-end text-center opacity-90 group-hover:opacity-100 transition-opacity`}>
        
        <p className="text-white font-black text-[11px] md:text-sm truncate w-full drop-shadow-[0_2px_2px_rgba(0,0,0,1)] leading-tight">
          {character.name}
        </p>
        
        <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] ${rarityTextColors[character.rarity]}`}>
          {character.type}
        </p>

        {/* Restore the Item Bonus Hover Text for the Square Grid! */}
        {!isCharacter && character.bonus && isSquare && (
          <p className="text-[9px] text-blue-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
            {character.bonus}
          </p>
        )}
      </div>
    </div>
  )
}