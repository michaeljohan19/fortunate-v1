import React, { useState } from 'react';
import Image from 'next/image';
import { useGame, Character } from '@/app/game-context'; // Adjust path if needed

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Character | null;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ isOpen, onClose, item }) => {
  const { gameState, setGameState } = useGame();
  
  // State for the Lore Fragment "Full Screen Reveal"
  const [isAssembling, setIsAssembling] = useState(false);
  const [assembleReward, setAssembleReward] = useState(0);

  if (!isOpen || !item) return null;

  // --- LOGIC: LORE FRAGMENTS ---
  const fragmentRules: Record<string, { required: number, rewardGems: number, title: string }> = {
    'frag-class': { required: 4, rewardGems: 5, title: 'Complete Class Photo' },
    'frag-agri': { required: 4, rewardGems: 3, title: 'Agrivision Device Blueprint' },
    'frag-team': { required: 4, rewardGems: 7, title: 'The Developers' },
    'frag-prof': { required: 3, rewardGems: 10, title: 'The Professor' },
  };

  const ownedFragments = gameState.collection.filter(c => c.id === item.id).length;
  const fragRule = fragmentRules[item.id];
  const canAssemble = fragRule && ownedFragments >= fragRule.required;

  const handleAssemble = () => {
    setIsAssembling(true);
    setAssembleReward(fragRule.rewardGems);
  };

  const handleClaimAssembly = () => {
    setGameState(prev => {
      let removedCount = 0;
      const newCollection = prev.collection.filter(c => {
        if (c.id === item.id && removedCount < fragRule.required) {
          removedCount++;
          return false;
        }
        return true; 
      });

      return {
        ...prev,
        collection: newCollection,
        gems: prev.gems + fragRule.rewardGems
      };
    });
    setIsAssembling(false);
    onClose();
  };

  // --- LOGIC: JUNK RECYCLING ---
  const totalJunk = gameState.collection.filter(c => c.type === 'junk').length;
  const canRecycle = totalJunk >= 5;

  const handleRecycle = () => {
    setGameState(prev => {
      let removedCount = 0;
      const newCollection = prev.collection.filter(c => {
        if (c.type === 'junk' && removedCount < 5) {
          removedCount++;
          return false;
        }
        return true;
      });
      return { ...prev, collection: newCollection, gems: prev.gems + 1 };
    });
    onClose();
  };

  // --- LOGIC: BUFF ACTIVATION ---
  const handleActivateBuff = () => {
    setGameState(prev => {
      const indexToRemove = prev.collection.findIndex(c => c.id === item.id);
      const newCollection = [...prev.collection];
      if (indexToRemove !== -1) newCollection.splice(indexToRemove, 1);

      const newBuffs = { ...prev.activeBuffs };
      if (item.id === 'power-coffee') newBuffs.arcadeDoubleCoins = true;
      if (item.id === 'power-duck' || item.id === 'power-calc') newBuffs.syntaxRevealBug = true;
      if (item.id === 'power-pencil') newBuffs.memoryHBPencil = true;
      if (item.id === 'power-eraser') newBuffs.memoryProtectHeart = true;
      if (item.id === 'meta-overclock') newBuffs.gachaDiscount = true;
      if (item.id === 'meta-lucky-cat') newBuffs.gachaEarlyPity = true;
      const bonusCoins = item.id === 'power-bounty' ? 50 : 0;

      return { 
        ...prev, 
        collection: newCollection, 
        activeBuffs: newBuffs,
        coins: prev.coins + bonusCoins
      };
    });
    onClose();
  };

  // --- DEFINE THE PERK DATA ---
  const certificationPerks: Record<number, { title: string; perk: string }> = {
    1: { title: 'Freshman Resilience', perk: '+15% Base HP' },
    2: { title: 'Overclocked Logic', perk: '+15% Base ATK' },
    3: { title: 'Branch Prediction', perk: '25% Base Crit Chance' },
    4: { title: 'Multi-Threading', perk: '+20% Base DEF' },
    5: { title: 'ECC Memory', perk: '100% Accuracy on all moves' },
    6: { title: 'Agrivision YOLOv11', perk: '25% Dodge & Counter-Strike' },
  };

  const CLASS_INFO: Record<string, { color: string, icon: string, shadow: string }> = {
  'Software': { color: 'text-cyan-400', icon: '💻', shadow: 'shadow-cyan-500/50' },
  'Networks': { color: 'text-emerald-400', icon: '🌐', shadow: 'shadow-emerald-500/50' },
  'Data': { color: 'text-amber-400', icon: '📊', shadow: 'shadow-amber-500/50' },
  'ML': { color: 'text-purple-400', icon: '🧠', shadow: 'shadow-purple-500/50' },
};

  // ==========================================
  // RENDER: FULL SCREEN ASSEMBLY REVEAL
  // ==========================================
  if (isAssembling) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-500">
        <div className="max-w-2xl w-full flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-black text-amber-300 mb-2 animate-bounce">PUZZLE COMPLETE!</h2>
          <p className="text-xl text-blue-300 mb-8">{fragRule.title}</p>
          
          <div className="relative w-[90%] max-w-200 aspect-4/3 bg-slate-800 border-4 border-amber-400 rounded-xl mb-8 shadow-[0_0_40px_rgba(251,191,36,0.3)] flex items-center justify-center overflow-hidden">
             {/* THE FIX: Also ensuring the Image component (from previous turn) is here */}
             <Image 
               src={`/fragments/${item.id}-full.png`} 
               alt={fragRule.title}
               fill
               className="object-contain p-2" // Uses object-contain to preserve original art edges
               onError={(e) => { e.currentTarget.style.display = 'none'; }} 
             />
          </div>

          <div className="flex gap-4 w-full">
            <button onClick={() => setIsAssembling(false)} className="flex-1 py-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all">
              Keep as Memento
            </button>
            <button onClick={handleClaimAssembly} className="flex-1 py-4 rounded-xl font-black text-slate-900 bg-linear-to-r from-amber-400 to-yellow-500 hover:scale-105 transition-all shadow-lg shadow-amber-500/30">
              CONVERT TO {assembleReward} PULLS
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: STANDARD ITEM MODAL
  // ==========================================
  const isCharacter = item.type === 'professor' || item.type === 'classmate';
  const themeColor = item.rarity === '5-star' ? 'text-yellow-400 border-yellow-400' : item.rarity === '4-star' ? 'text-purple-400 border-purple-400' : item.type === 'junk' ? 'text-slate-400 border-slate-500' : 'text-blue-400 border-blue-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className={`relative max-w-md w-full bg-slate-900 border-2 rounded-2xl shadow-2xl overflow-hidden ${themeColor}`}>
        
        {/* Close Button: Absolute positioned to float above everything */}
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-sm text-slate-300 hover:text-white hover:bg-slate-800 z-50 transition-all font-bold shadow-lg border border-slate-700"
        >
          ✕
        </button>

        {/* ==========================================
            SECTION 1: THE HEADER (Image + Text Overlay)
            ========================================== */}
        {item.type !== 'fragment' ? (
          <div className={`relative w-full aspect-square flex flex-col justify-end overflow-hidden ${isCharacter ? 'bg-slate-900' : 'bg-white'}`}>
            
            {/* LAYER 1: The Image Background */}
            {item.image ? (
               <Image 
                 src={item.image} 
                 alt={item.name || 'Item'} 
                 fill 
                 className={`z-0 transition-transform duration-500 hover:scale-105 ${isCharacter ? 'object-cover' : 'object-contain p-4'}`} 
               />
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-8xl z-0">
                 {item.type === 'junk' ? '🗑️' : item.type === 'powerup' ? '⚡' : '🎒'}
               </div>
            )}
            
            {/* LAYER 2: The Gradient Shadow */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-slate-900 via-slate-900/80 to-transparent z-10" />
            
            {/* LAYER 3: The Text */}
            <div className="relative z-20 px-6 pb-4 w-full">
              <h3 className="text-3xl font-black text-white mb-2 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                {item.name}
              </h3>

              {/* THE FIX: Flex container with 'justify-between' pushes items to opposite edges */}
              <div className="flex justify-between items-center w-full mb-3">
                
                {/* LEFT SIDE: Rarity & Type */}
                <p className={`text-xs font-black uppercase tracking-widest m-0 ${themeColor.split(' ')[0]} drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]`}>
                  {item.rarity} {item.type}
                </p>

                {/* RIGHT SIDE: THE CLASS BADGE */}
                {isCharacter && gameState.classMap[item.id] && CLASS_INFO[gameState.classMap[item.id]] && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit bg-slate-900/90 border border-slate-700 backdrop-blur-md shadow-md ${CLASS_INFO[gameState.classMap[item.id]].shadow}`}>
                    <span className="text-xs">{CLASS_INFO[gameState.classMap[item.id]].icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${CLASS_INFO[gameState.classMap[item.id]].color}`}>
                      {gameState.classMap[item.id]}
                    </span>
                  </div>
                )}
              </div>

              {isCharacter ? (
                // --- RPG CHARACTER STATS VIEW ---
                <div className="space-y-3">
                  <p className="text-slate-200 text-sm drop-shadow-sm italic leading-tight line-clamp-2">
                    {item.description || `"A dedicated engineering student. Never leaves the lab without a fresh cup of coffee."`}
                  </p>
                  
                  {/* --- DYNAMIC STATS CALCULATION --- */}
                  {(() => {
                    const totalOwned = gameState.collection.filter(c => c.id === item.id).length;
                    const cLevel = Math.min(6, Math.max(0, totalOwned - 1));
                    
                    const is5Star = item.rarity === '5-star';
                    let displayHp = is5Star ? 150 : 120;
                    let displayAtk = is5Star ? 16 : 12;
                    let displayDef = is5Star ? 8 : 5;

                    // Apply the same multipliers from combat logic
                    if (cLevel >= 1) displayHp = Math.floor(displayHp * 1.15);
                    if (cLevel >= 2) displayAtk = Math.floor(displayAtk * 1.15);
                    if (cLevel >= 4) displayDef = Math.floor(displayDef * 1.20);

                    return (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 backdrop-blur-md shadow-inner">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-tighter">❤️ MAX HP</span>
                          <span className={`font-black ${cLevel >= 1 ? 'text-cyan-400' : 'text-green-400'}`}>
                            {displayHp}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-tighter">⚔️ ATTACK</span>
                          <span className={`font-black ${cLevel >= 2 ? 'text-cyan-400' : 'text-red-400'}`}>
                            {displayAtk}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-tighter">🛡️ DEFENSE</span>
                          <span className={`font-black ${cLevel >= 4 ? 'text-cyan-400' : 'text-blue-400'}`}>
                            {displayDef}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-tighter">⌨️ BASE WPM</span>
                          <span className="text-amber-400 font-black">
                            {/* C3 Logic: +10 WPM if we want to show it here too! */}
                            {is5Star ? (cLevel >= 3 ? 130 : 120) : (cLevel >= 3 ? 95 : 85)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* --- THE CONSTELLATION / CERTIFICATION MAP (Interactive) --- */}
                  <div className="mt-4 pt-3 border-t border-slate-700/50 relative z-20">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Certifications</span>
                      <span className="text-xs font-bold text-slate-600 italic">Hover node for details</span>
                      <span className="text-sm font-black text-amber-400">
                        C{Math.min(6, gameState.collection.filter(c => c.id === item.id).length - 1)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center px-2">
                      {[1, 2, 3, 4, 5, 6].map(level => {
                        const totalOwned = gameState.collection.filter(c => c.id === item.id).length;
                        const cLevel = Math.min(6, totalOwned - 1);
                        const isUnlocked = cLevel >= level;
                        const isC6 = level === 6;
                        
                        // Grab the perk data from the constant we defined earlier
                        const perkData = certificationPerks[level];

                        return (
                          // THE MAGIC CONTAINER: group relative is required for the group-hover logic!
                          <div key={level} className="flex flex-col items-center group relative">
                            
                            {/* --- THE HOVER TOOLTIP --- */}
                            {/* THE FIX: Dynamic positioning for edge nodes! */}
                            <div className={`absolute bottom-full mb-3 w-48 p-3 bg-slate-800 border-2 rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl ${
                              level === 1 ? 'left-0' : level === 6 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                            } ${
                              isUnlocked ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'border-slate-700'
                            }`}>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Certification Perk</p>
                              <strong className={`text-[11px] font-black ${
                                isUnlocked ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]' : 'text-slate-400'
                              }`}>
                                <span className={isUnlocked ? 'text-amber-300' : 'text-slate-500'}>C{level}:</span> {perkData.title}
                              </strong>
                              <p className="text-slate-300 text-xs mt-1 leading-tight">{perkData.perk}</p>
                            </div>

                            {/* --- THE NODE (unchanged, just nested inside the group parent) --- */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 ${
                              isUnlocked 
                                ? isC6 ? 'bg-amber-400 text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-110' : 'bg-cyan-400 text-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                : 'bg-slate-800 text-slate-600 border border-slate-700'
                            }`}>
                              {isC6 ? '★' : level}
                            </div>
                            
                            {/* Connector Line (except for the last one) */}
                            {level < 6 && (
                              <div className={`absolute top-4 left-8 w-full h-0.5 -z-10 ${
                                cLevel > level ? 'bg-cyan-400/50' : 'bg-slate-800'
                              }`} style={{ width: 'calc(100% + 1rem)' }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  
                </div>
              ) : (
                // --- STANDARD ITEM VIEW ---
                <div className="space-y-3">
                  <p className="text-slate-200 text-sm drop-shadow-sm min-h-6">
                    {item.bonus || item.description || "A mysterious item found in the engineering building."}
                  </p>

                  {/* NEW: Inventory Count for Consumables / Power-Ups */}
                  {(item.type === 'powerup' || item.type === 'modifier') && (
                    <div className="inline-block bg-slate-900/90 border border-slate-700/50 rounded-lg px-3 py-2 shadow-inner backdrop-blur-md">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">
                        Current Stockpile
                      </p>
                      <p className="text-base font-black text-amber-400 leading-none flex items-center gap-1.5">
                        📦 {gameState.collection.filter(c => c.id === item.id).length} 
                        <span className="text-slate-500 text-xs uppercase tracking-tighter">Units Available</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // IF IT'S A FRAGMENT (No top image, just text padding)
          <div className="px-6 pt-12 pb-2">
            <p className={`text-xs font-black uppercase tracking-widest mb-1 ${themeColor.split(' ')[0]}`}>
              {item.rarity} {item.type}
            </p>
            <h3 className="text-3xl font-black text-white mb-2 leading-tight">{item.name}</h3>
          </div>
        )}

        {/* ==========================================
            SECTION 2: DYNAMIC ACTION BUTTONS
            ========================================== */}
        <div className="px-6 pb-6 pt-2 relative z-20 bg-slate-900">
          
          {/* 1. LORE FRAGMENTS */}
          {item.type === 'fragment' && fragRule && (
            <div className="flex flex-col gap-4 mb-2 mt-4">
              <div className="relative w-full aspect-video bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner">
                <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-800 text-slate-600 text-xs italic">
                  [ Pending Image: {item.id}-full.png ]
                </div>
                <Image 
                  src={`/fragments/${item.id}-full.png`} 
                  alt={fragRule.title}
                  fill
                  className={`object-cover z-0 transition-all duration-1000 ${
                    ownedFragments >= fragRule.required ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale'
                  }`}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
                <div className={`absolute inset-0 z-10 w-full h-full grid ${
                  fragRule.required === 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3 grid-rows-1'
                }`}>
                  {Array.from({ length: fragRule.required }).map((_, i) => {
                    const isUnlocked = i < ownedFragments; 
                    return (
                      <div 
                        key={i} 
                        className={`border border-slate-950/80 backdrop-blur-md transition-all duration-700 flex items-center justify-center ${
                          isUnlocked ? 'opacity-0 pointer-events-none' : 'bg-slate-950/95'
                        }`}
                      >
                        {!isUnlocked && (
                          <span className="text-slate-700 text-3xl font-black drop-shadow-md">?</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <button 
                disabled={!canAssemble}
                onClick={handleAssemble}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                  canAssemble 
                    ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {canAssemble ? 'ASSEMBLE PUZZLE ✨' : `COLLECTED: ${ownedFragments} / ${fragRule.required}`}
              </button>
            </div>
          )}

          {/* 2. JUNK ITEMS */}
          {item.type === 'junk' && (
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-xs text-center text-slate-400">You have {totalJunk} pieces of junk.</p>
              <button 
                disabled={!canRecycle}
                onClick={handleRecycle}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                  canRecycle 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                RECYCLE 5 JUNK ♻️
              </button>
            </div>
          )}

          {/* 3. POWER-UPS & MODIFIERS */}
          {(item.type === 'powerup' || item.type === 'modifier') && (
            <button 
              onClick={handleActivateBuff}
              className="w-full py-4 mt-2 rounded-xl font-black text-lg text-slate-900 bg-linear-to-r from-amber-400 to-yellow-500 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            >
              USE NOW ⚡
            </button>
          )}


        </div>
      </div>
    </div>
  );
};