import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; 
import Image from 'next/image';
import { characters } from '@/app/game-context';

interface LeaderboardPlayer {
  id: string;
  username: string;
  profilePicId: string | null;
  fiveStars: number;
  fourStars: number;
  rating: number;
}

export const ClassStanding = () => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  
  // 👇 NEW: State for the instruction modal
  const [showInstructions, setShowInstructions] = useState(false);

 // --- REAL-TIME DATABASE LISTENER ---
  useEffect(() => {
    // 👇 THE FIX: Wait until Firebase confirms the user is logged in
    const currentUserId = auth.currentUser?.uid;
    
    // If auth is still thinking, do nothing and wait.
    if (!currentUserId) return;

    const unsubscribe = onSnapshot(
      collection(db, 'player_saves'), 
      (snapshot) => {
        const fetchedPlayers = snapshot.docs.map(doc => {
          const data = doc.data();
          
          const collection = data.collection || [];
          const fiveStars = collection.filter((c: any) => c.rarity === '5-star').length;
          const fourStars = collection.filter((c: any) => c.rarity === '4-star').length;
          const threeStars = collection.filter((c: any) => c.rarity === '3-star').length;
          
          const rating = (fiveStars * 100) + (fourStars * 20) + (threeStars * 1);

          return {
            id: doc.id,
            username: data.username || 'Anonymous Student',
            profilePicId: data.profilePicId || null,
            fiveStars,
            fourStars,
            rating
          };
        });

        fetchedPlayers.sort((a, b) => b.rating - a.rating);
        setPlayers(fetchedPlayers.slice(0, 10));
      },
      (error) => {
        console.warn("Leaderboard syncing delayed.", error.message);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser?.uid]); // <-- Re-run this effect when the user logs in

  // --- GENERATE THE 10 SLOTS ---
  const displaySlots = Array.from({ length: 10 }).map((_, index) => players[index] || null);
  const currentUserId = auth.currentUser?.uid;

  return (
    // 👇 UPDATED: Added "relative" so our absolute-positioned info button aligns perfectly
    <div className="py-8 max-w-5xl mx-auto fade-in flex flex-col items-center relative">
      
      {/* INFO BUTTON (Upper Right) */}
      <button 
        onClick={() => setShowInstructions(true)}
        className="absolute top-8 md:top-10 right-4 md:right-8 z-30 w-8 h-8 bg-slate-800/80 hover:bg-slate-700 border-2 border-slate-500 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:border-amber-400 font-black text-sm shadow-lg backdrop-blur-sm transition-all"
        title="Leaderboard Rules"
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
            
            <h3 className="text-2xl font-black text-amber-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-amber-400 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center text-lg">?</span>
              Rating System
            </h3>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-cyan-400 font-bold uppercase tracking-widest mb-3 border-b border-slate-700 pb-1">Power Calculation</h4>
                <ul className="space-y-3 font-bold text-xs md:text-sm">
                  <li className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                    <span className="text-amber-400 tracking-wider">5-STAR PULLS</span>
                    <span className="text-white bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/50">+100 PTS</span>
                  </li>
                  <li className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                    <span className="text-purple-400 tracking-wider">4-STAR PULLS</span>
                    <span className="text-white bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/50">+20 PTS</span>
                  </li>
                  <li className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                    <span className="text-blue-400 tracking-wider">3-STAR ITEMS</span>
                    <span className="text-white bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/50">+1 PT</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30">
                <h4 className="text-green-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">Real-Time Sync</h4>
                <p>This leaderboard is connected directly to the server. Your ranking and score will automatically update globally in <strong className="text-green-400">real-time</strong> the moment you pull a new character from the Wish banner!</p>
              </div>
            </div>

            <button 
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 bg-slate-700 hover:bg-slate-600 hover:text-amber-400 text-white font-black py-3 rounded-xl uppercase tracking-widest transition-colors shadow-lg"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-black text-amber-400 mb-2 uppercase tracking-tight drop-shadow-md">
          Class Standing
        </h2>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">
          Ranked by Total Collection Power
        </p>
      </div>

      {/* The Dynamic Pyramid Board */}
      <div className="w-full flex flex-col items-center gap-3 md:gap-4 px-4">
        {displaySlots.map((player, idx) => {
          
          // 1. Dynamic Styling based on Rank
          let rankStyle = '';
          let widthClass = '';
          let textClass = '';

          if (idx === 0) {
            // GOLD - #1 
            rankStyle = 'bg-gradient-to-r from-yellow-600 to-yellow-400 border-2 border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.5)] z-30';
            widthClass = 'max-w-4xl w-full p-5 md:p-6';
            textClass = 'text-xl md:text-2xl text-yellow-950';
          } else if (idx === 1) {
            // SILVER - #2
            rankStyle = 'bg-gradient-to-r from-slate-400 to-slate-300 border-2 border-slate-100 shadow-[0_0_20px_rgba(203,213,225,0.4)] z-20';
            widthClass = 'max-w-3xl w-full p-4 md:p-5';
            textClass = 'text-lg md:text-xl text-slate-900';
          } else if (idx === 2) {
            // BRONZE - #3
            rankStyle = 'bg-gradient-to-r from-orange-700 to-orange-500 border-2 border-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.4)] z-10';
            widthClass = 'max-w-2xl w-full p-3 md:p-4';
            textClass = 'text-base md:text-lg text-white';
          } else {
            // REST - #4 to #10
            rankStyle = 'bg-slate-800/80 border border-slate-600 hover:bg-slate-700 transition-colors shadow-lg';
            widthClass = 'max-w-xl w-full p-3';
            textClass = 'text-sm md:text-base text-slate-200';
          }

          // Check if this row belongs to the current logged-in player
          const isPlayer = player?.id === currentUserId;

          // Highlight the player's own card!
          if (isPlayer && idx > 2) {
            rankStyle += ' border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-cyan-900/40';
          }

          return (
            <div 
              key={player ? player.id : `empty-${idx}`} 
              className={`rounded-2xl flex items-center justify-between transform transition-all duration-500 hover:scale-[1.02] ${rankStyle} ${widthClass}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              
              {/* LEFT: Rank & Avatar */}
              <div className="flex items-center gap-4">
                <div className={`font-black shrink-0 text-center ${idx < 3 ? 'w-10' : 'w-8 text-slate-500'}`}>
                  #{idx + 1}
                </div>
                
                {/* Avatar Display */}
                <div className={`flex items-center justify-center rounded-full bg-slate-900/30 border-2 border-white/20 shadow-inner shrink-0 overflow-hidden ${idx === 0 ? 'w-16 h-16 text-3xl' : idx === 1 ? 'w-14 h-14 text-2xl' : idx === 2 ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-lg'}`}>
                  {player?.profilePicId ? (
                    <Image 
                      src={characters.find(c => c.id === player.profilePicId)?.image || '/default-avatar.png'} 
                      alt="Avatar" 
                      width={64} height={64} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="opacity-50">👤</span>
                  )}
                </div>
                
                <div className={`font-black tracking-tight truncate ${textClass} ${isPlayer ? 'text-cyan-300' : ''}`}>
                  {player ? player.username : 'Empty Desk'}
                  {player && (
                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-60 mt-0.5">
                      Rating: {player.rating.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Stats Badges (Only render if player exists) */}
              {player ? (
                <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-4">
                  {/* 5-Star Badge */}
                  <div className="flex flex-col items-center bg-slate-900/60 rounded-lg px-3 md:px-4 py-1.5 border border-white/20 shadow-inner">
                    <span className="text-[9px] md:text-[11px] font-black uppercase text-amber-300 tracking-widest">5-Star</span>
                    <span className={`font-black leading-none mt-1 ${idx < 3 ? textClass : 'text-amber-400'}`}>
                      {player.fiveStars}
                    </span>
                  </div>
                  {/* 4-Star Badge */}
                  <div className="flex flex-col items-center bg-slate-900/40 rounded-lg px-2 md:px-3 py-1 border border-white/10">
                    <span className="text-[8px] md:text-[10px] font-black uppercase text-purple-300 tracking-widest">4-Star</span>
                    <span className={`font-black leading-none mt-0.5 ${idx < 3 ? textClass : 'text-purple-300'}`}>
                      {player.fourStars}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] md:text-xs font-bold opacity-30 uppercase tracking-widest pr-4">
                  Unclaimed
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};