'use client'

import React, { act, useEffect, useState } from 'react'
import Image from 'next/image'
import { useGame, Character, characters } from '@/app/game-context'
import { WishBanner } from './wish-banner'
import { PullModal } from './pull-modal'
import { GachaGamesList } from './games-list' // Add this
import { InstructionModal } from '@/components/instruction-modal'
import { ClickerGame } from '@/components/games/clicker-game' // Add this
import { SyntaxGame } from '@/components/games/syntax-game' // Add this
import { MemoryGame } from '@/components/games/memory-game' // Add this
import { CropSorterGame } from '@/components/games/crop-sorter-game' // Add this
import { ItemDetailsModal } from './item-details-modal'
import { RunnerGame } from '@/components/games/coffee-run'
import { WordleGame } from '@/components/games/wordle-game'
import { LabDutyGame } from '@/components/games/lab-duty'
import { BugShooterGame } from '@/components/games/bug-shot'
import { SyntaxSprintGame } from '@/components/games/syntax-sprint'
import { ClassTriviaGame } from '@/components/games/class-trivia'
import { ClassmateCombatGame } from '@/components/games/classmate-combat'
import { CharacterCard } from './character-card'
import { ClassStanding } from './class-standing';


type View = 'wish' | 'games' | 'daily' | 'collection' | 'leaderboard' | 'assignments' ;

interface WishScreenProps {
  currentUser?: { username: string; email: string; uid: string} | null;
  onLogout: () => void;
}

export const ActiveBuffsDisplay = () => {
  const { gameState } = useGame();
  const buffs = gameState.activeBuffs;

  // If no buffs are active, don't render anything!
  if (!Object.values(buffs).some(Boolean)) return null;

  return (
    <div className="flex gap-2 items-center bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50 shadow-inner">
      <span className="text-[10px] font-black text-slate-500 mr-1 hidden md:block uppercase tracking-wider">Active:</span>
      
      {/* ☕ Double Coins (Coffee) */}
      {buffs.arcadeDoubleCoins && (
        <div className="group relative cursor-help">
          <div className="w-8 h-8 flex items-center justify-center bg-amber-900/40 border border-amber-500/50 rounded-full text-lg shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse">☕</div>
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            <strong className="text-amber-400 block mb-1">Instant Coffee</strong>
            Double Coins earned. Expires after any 1 Arcade Game.
          </div>
        </div>
      )}

      {/* 🦆 Bug Reveal (Duck / Calculator) */}
      {buffs.syntaxRevealBug && (
        <div className="group relative cursor-help">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-900/40 border border-blue-500/50 rounded-full text-lg shadow-[0_0_10px_rgba(59,130,246,0.2)]">🦆</div>
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            <strong className="text-blue-400 block mb-1">Auto-Squash</strong>
            Automatically reveals 1 bug. Expires after 1 Syntax Spotter game.
          </div>
        </div>
      )}

      {/* 💻 Overclocked CPU (Discount) */}
      {buffs.gachaDiscount && (
        <div className="group relative cursor-help">
          <div className="w-8 h-8 flex items-center justify-center bg-cyan-900/40 border border-cyan-400/50 rounded-full text-lg shadow-[0_0_10px_rgba(34,211,238,0.3)]">💻</div>
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            <strong className="text-cyan-400 block mb-1">Overclocked</strong>
            Next 10-Pull costs 900 Coins/9 Gems. Consumed on use.
          </div>
        </div>
      )}

      {/* 🐱 Lucky Cat (Early Pity) */}
      {buffs.gachaEarlyPity && (
        <div className="group relative cursor-help">
          <div className="w-8 h-8 flex items-center justify-center bg-pink-900/40 border border-pink-400/50 rounded-full text-lg shadow-[0_0_10px_rgba(244,114,182,0.3)]">🐱</div>
          <div className="absolute top-full mt-2 right-0 md:left-1/2 md:-translate-x-1/2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            <strong className="text-pink-400 block mb-1">Lucky Aura</strong>
            4-Star Pity triggers at 7 pulls instead of 10. Persistent buff!
          </div>
        </div>
      )}

      {/* ✏️ HB Pencil (Memory Match Cheat) */}
      {buffs.memoryHBPencil && (
        <div className="group relative cursor-help">
          <div className="w-8 h-8 flex items-center justify-center bg-yellow-900/40 border border-yellow-400/50 rounded-full text-lg shadow-[0_0_10px_rgba(250,204,21,0.3)]">✏️</div>
          <div className="absolute top-full mt-2 right-0 md:left-1/2 md:-translate-x-1/2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            <strong className="text-yellow-400 block mb-1">Cheat Sheet</strong>
            Reveals all cards at the start of your next Memory Match game!
          </div>
        </div>
      )}
    </div>
  );
};

export const WishScreen: React.FC<WishScreenProps> = ({ currentUser, onLogout }) => {
  const { gameState, addCoins, addGems, checkDailyLogin, pullCards, claimDailyTask, completeDailyTask, updateProfile } = useGame()
  const hasUnclaimedAssignments = gameState.dailyProgress.completedTasks.some(
    taskId => !gameState.dailyProgress.claimedTasks.includes(taskId) && taskId !== 'login'
  );
  const today = new Date().toDateString();
  const hasUnclaimedLogin = gameState.lastLoginDate !== today;

  const [currentView, setCurrentView] = useState<View>('wish') 
  const [pullConfig, setPullConfig] = useState<{amount: number, cost: number, costType: 'coins' | 'gems'} | null>(null)
  const [conversionConfig, setConversionConfig] = useState<{coinsToSpend: number, gemsToGet: number, pullAmount: number} | null>(null)
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | '4-star' | '5-star' | 'items'>('all')
  const [showDailyInfo, setShowDailyInfo] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Character | null>(null);

  // NEW: Collection Filter & Sort States
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [sortMethod, setSortMethod] = useState<'rarity' | 'newest' | 'oldest'>('rarity');

  const pullsUntilGuaranteed = 60 - (gameState.pullsSince5Star || 0)
  const tenPullCoinCost = gameState.activeBuffs.gachaDiscount ? 900 : 1000;
  const tenPullGemCost = gameState.activeBuffs.gachaDiscount ? 9 : 10;

  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState(1); // NEW: Tracks the slider
  const [exchangeResult, setExchangeResult] = useState<{coins: number, gems: number} | null>(null);

  // 👇 2. NEW: Profile Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const [profileBio, setProfileBio] = useState('New student at Tech Academy. Ready to code!');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [draftBio, setDraftBio] = useState(gameState.profileBio || '');
  const activeAvatar = gameState.collection?.find(c => c.id === gameState.profilePicId);

  useEffect(() => {
    if (gameState.profileBio) setDraftBio(gameState.profileBio);
  }, [gameState.profileBio]);

  // ASSIGNMENTS 
  // NEW: Daily Assignments Tracking
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  
  useEffect(() => {
      const today = new Date().toDateString();

      // Load or Generate today's 5 randomized tasks
      const savedActive = localStorage.getItem(`active_tasks_${today}`);
      if (savedActive) {
        setActiveTasks(JSON.parse(savedActive));
      } else {
        // Shuffle the master pool and pick the first 5
        const shuffled = [...MASTER_TASKS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        setActiveTasks(selected);
        localStorage.setItem(`active_tasks_${today}`, JSON.stringify(selected));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const canAfford1x = gameState.gems >= 1 || gameState.coins >= 100;
  const canAfford10x = gameState.gems >= tenPullGemCost || gameState.coins >= tenPullCoinCost;
  const handleGameComplete = (earnedCoins: number, stayInGame: boolean = false) => {
    addCoins(earnedCoins);
    if (!stayInGame) {
      setActiveMiniGame(null);
    }
  }

  // 1. Calculate the true number of UNIQUE characters owned
  const uniqueCharacterCount = (gameState.collection || []).filter((item, index, self) => 
    (item.type === 'classmate' || item.type === 'professor') &&
    index === self.findIndex((t) => t.id === item.id)
  ).length;

  // 2. Create a filtered, sorted list just for Avatars (4/5 Stars only, 5 Stars first)
  const availableAvatars = (gameState.collection || [])
    .filter((char, index, self) => 
      (char.type === 'classmate' || char.type === 'professor') &&
      (char.rarity === '4-star' || char.rarity === '5-star') &&
      index === self.findIndex((t) => t.id === char.id) // Remove duplicates
    )
    .sort((a, b) => {
      // Sort logic: Put 5-stars at the front!
      if (a.rarity === '5-star' && b.rarity !== '5-star') return -1;
      if (b.rarity === '5-star' && a.rarity !== '5-star') return 1;
      return 0;
    });

// Available classes for the filter dropdown
const AVAILABLE_CLASSES = ['Software', 'Networks', 'Data', 'ML'];
  
const gameTitles: Record<string, string> = {
  'clicker': 'Cafe Clicker☕',
  'syntax': 'Syntax Spotter',
  'memory': 'Memory Match',
  'crop-sorter': 'Agrivision Rush',
  'runner': 'Caffeine Rush',
  'wordle': 'Tech Wordle',
  'lab-duty': 'Lab Duty',
  'bug-shot': 'Bug Shot',
  'syntax-sprint': 'Syntax Sprint',
  'class-trivia': 'Class Trivia',
  'classmate-combat': 'Classmate Combat',
}

// The Master Pool of all possible assignments
  const MASTER_TASKS = [
    // --- DAILY ROUTINE ---
    { id: 'login', icon: '👋', title: 'System Boot', desc: 'Claim your Daily Login Reward.', reward: 20 },
    { id: 'gacha', icon: '✨', title: 'Gacha Addict', desc: 'Perform at least 1 pull at the gacha.', reward: 30 },
    { id: 'cafe', icon: '☕', title: 'Barista', desc: 'Upgrade any Cafe item.', reward: 30 },
    { id: 'lab-duty', icon: '🧪', title: 'Lab Assistant', desc: 'Send a character on Lab Duty.', reward: 40 },
    
    // --- ARCADE CHALLENGES ---
    { id: 'trivia', icon: '🎓', title: 'Mental Gymnastics', desc: 'Play one game of Class Trivia.', reward: 40 },
    { id: 'wordle', icon: '🟩', title: 'Hacker', desc: 'Successfully crack the Tech Wordle.', reward: 50 },
    { id: 'bugshot', icon: '🤖', title: 'Exterminator', desc: 'Survive Wave 1 in Bug-Shot.', reward: 50 },
    { id: 'combat', icon: '⚔️', title: 'Gladiator', desc: 'Win a match in Classmate Combat.', reward: 50 },
    { id: 'crop-sorter', icon: '🌾', title: 'Data Farmer', desc: 'Sort a full batch in Agrivision Rush.', reward: 40 },
    { id: 'memory-match', icon: '🧠', title: 'Memory Master', desc: 'Clear the board in Memory Match.', reward: 40 },
    { id: 'syntax-spotter', icon: '🔍', title: 'Bug Hunter', desc: 'Spot the bugs and win Syntax Spotter.', reward: 40 },
    { id: 'coffee-run', icon: '🏃‍♂️', title: 'Caffeine Rush', desc: 'Score 100+ distance in Caffeine Dash.', reward: 40 },
    { id: 'syntax-sprint', icon: '⚡', title: 'Fast Fingers', desc: 'Achieve 30+ WPM in Syntax Sprint.', reward: 50 },
  ];

  return (
    <div className="w-screen h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      {/* 👇 UPDATED: Changed the bottom border from amber to cyan */}
      <nav className="w-full bg-slate-900/80 backdrop-blur-sm border-b-2 border-cyan-400/30 px-4 md:px-8 py-3 flex justify-between items-center z-40">
        
        {/* LEFT SIDE: Logo & Title */}
        <div className="flex items-center gap-3">
          
          {/* 👇 NEW: The Logo (Sized for the Nav Bar) */}
          <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
            <Image 
              src="/logo.png" 
              alt="Fortunate Logo" 
              fill 
              className="object-cover"
            />
          </div>
          
          {/* 👇 UPDATED: Cyan/Blue glowing text using Tailwind instead of inline styles */}
          <div className="text-xl md:text-2xl font-black italic tracking-wider text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            FORTUNATE
          </div>
        </div>

        {/* Navigation items - hidden on mobile */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => setCurrentView('wish')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              currentView === 'wish'
                ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/50'
                : 'text-blue-300 hover:text-amber-300'
            }`}
          >
            Wish
          </button>
          <button
            onClick={() => setCurrentView('games')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              currentView === 'games'
                ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/50'
                : 'text-blue-300 hover:text-amber-300'
            }`}
          >
            Arcade
          </button>

          {/* Daily Login Button Wrapper */}
          <div className="relative inline-block">
            <button 
              onClick={() => setCurrentView('daily')}
              className={`px-4 py-2 font-bold rounded-lg transition-all ${
                currentView === 'daily'
                  ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/50'
                : 'text-blue-300 hover:text-amber-300'
              }`}
            >
              Daily Login
            </button>
            
            {/* THE NOTIFICATION BADGE */}
            {hasUnclaimedLogin && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-slate-900 animate-bounce shadow-md pointer-events-none">
                !
              </span>
            )}
          </div>

          <button
            onClick={() => setCurrentView('collection')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              currentView === 'collection'
                ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/50'
                : 'text-blue-300 hover:text-amber-300'
            }`}
          >
            Collection
          </button>
          {/* Assignments Button Wrapper */}
          <div className="relative inline-block">
            <button 
              onClick={() => setCurrentView('assignments')}
              className={`px-4 py-2 font-bold rounded-lg transition-all ${
                currentView === 'assignments' 
                    ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/50'
                    : 'text-blue-300 hover:text-amber-300'
              }`}
            >
              Assignments
            </button>
            
            {/* THE NOTIFICATION BADGE */}
            {hasUnclaimedAssignments && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-slate-900 animate-bounce shadow-md pointer-events-none">
                !
              </span>
            )}
          </div>
          <button
            onClick={() => setCurrentView('leaderboard')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              currentView === 'leaderboard'
                ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/50'
                : 'text-blue-300 hover:text-amber-300'
            }`}
          >
            Class Standing
          </button>
        </div>
        
        <ActiveBuffsDisplay />

        {/* Currency Display - Top Right */}
        <div className="flex gap-3 md:gap-4">
          
          {/* UPDATED: Made Coins Clickable */}
          <button 
            onClick={() => setShowExchangeModal(true)}
            className="bg-slate-800/80 rounded-lg px-3 md:px-4 py-2 border-2 border-amber-400/40 shadow-lg hover:border-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl group-hover:animate-bounce">🪙</span>
              <div className="text-right">
                <p className="text-xs text-gray-400 group-hover:text-amber-200 transition-colors">COINS</p>
                <p className="text-lg md:text-xl font-black text-amber-300">{gameState.coins}</p>
              </div>
            </div>
          </button>

          {/* Gems (Static) */}
          <div className="bg-slate-800/80 rounded-lg px-3 md:px-4 py-2 border-2 border-blue-400/40 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl">💎</span>
              <div className="text-right">
                <p className="text-xs text-gray-400">GEMS</p>
                <p className="text-lg md:text-xl font-black text-blue-300">{gameState.gems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 👇 UPDATED: The Profile Button in Navigation Bar */}
      <button 
        onClick={() => setShowProfileModal(true)}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 border-2 border-purple-500 overflow-hidden flex items-center justify-center transform hover:scale-105 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] group relative"
      >
        {/* 🛑 I removed the hardcoded placeholders here! */}
        {activeAvatar?.image ? (
          // 👇 Displays the chosen character's image
          <img src={activeAvatar.image} alt="Profile" className="w-full h-full object-cover" />
        ) : activeAvatar ? (
          // Fallback to name initial if image is missing
          <span className="text-2xl font-black text-white flex items-center justify-center w-full h-full">{activeAvatar.name.charAt(0)}</span>
        ) : (
          // Default "Guest" icon if no avatar selected yet
          <span className="text-2xl group-hover:animate-pulse z-10">👾</span>
        )}
      </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {currentView === 'wish' && (
          <div className="relative w-full h-full">
            {/* Full-screen Banner Background */}
            <div className="absolute inset-0">
              <WishBanner />
            </div>

            {/* Overlay Controls - Bottom Left & Right */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end gap-4 p-4 md:p-8 z-30">
              {/* Guaranteed Counter - Bottom Left */}
              <div className="bg-slate-800/90 border-2 border-pink-400/60 rounded-lg px-4 md:px-6 py-3 md:py-4 backdrop-blur-md shadow-xl shrink-0">
                <p className="text-xs md:text-sm text-gray-300 mb-1 font-bold">GUARANTEED 5-STAR IN:</p>
                <p className="text-2xl md:text-4xl font-black text-pink-300" style={{ textShadow: '0 0 20px rgba(236, 72, 153, 0.8)' }}>{pullsUntilGuaranteed}</p>
              </div>

              {/* Pull Buttons - Bottom Right */}
              <div className="flex gap-2 md:gap-4 shrink-0">
                {/* 1x Pull Button */}
                <button
                  disabled={!canAfford1x}
                  onClick={() => {
                    completeDailyTask('gacha'); 
                    if (gameState.gems >= 1) {
                      setPullConfig({ amount: 1, cost: 1, costType: 'gems' })
                    } else if (gameState.coins >= 100) { // Fixed: Now checks for 100 coins
                      setConversionConfig({ coinsToSpend: 100, gemsToGet: 1, pullAmount: 1 })
                    }
                  }}
                  className={`group relative px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-black text-slate-900 overflow-hidden transition-all ${
                    canAfford1x 
                      ? 'transform hover:scale-110 active:scale-95' 
                      : 'opacity-50 grayscale cursor-not-allowed'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                    boxShadow: canAfford1x ? '0 0 40px rgba(255, 215, 0, 0.8), inset 0 -4px 8px rgba(0, 0, 0, 0.3), inset 0 4px 8px rgba(255, 255, 255, 0.4)' : 'none',
                  }}
                >
                  <span className="relative z-10 flex flex-col items-center gap-1">
                    <span className="text-sm md:text-xl leading-none">1X PULL</span>
                    <span className="text-[10px] md:text-xs font-bold bg-black/10 px-2 py-0.5 rounded-full text-slate-900">1 💎</span>
                  </span>
                  {canAfford1x && (
                    <>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity" />
                      <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity blur-lg" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }} />
                    </>
                  )}
                </button>

                {/* 10x Pull Button */}
                <button
                  disabled={!canAfford10x}
                  onClick={() => {
                    completeDailyTask('gacha');
                    // THE FIX: Use dynamic gem cost for the pull
                    if (gameState.gems >= tenPullGemCost) { 
                      setPullConfig({ amount: 10, cost: tenPullGemCost, costType: 'gems' }) 
                    } else if (gameState.coins >= tenPullCoinCost) {
                      // THE FIX: If converting coins to gems, only ask for 9 gems instead of 10!
                      setConversionConfig({ coinsToSpend: tenPullCoinCost, gemsToGet: tenPullGemCost, pullAmount: 10 }) 
                    } 
                  }}
                  className={`group relative px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-black text-slate-900 overflow-hidden transition-all ${
                    canAfford10x 
                      ? 'transform hover:scale-110 active:scale-95' 
                      : 'opacity-50 grayscale cursor-not-allowed'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #00BFFF 0%, #1E90FF 50%, #00BFFF 100%)',
                    boxShadow: canAfford10x ? '0 0 40px rgba(0, 191, 255, 0.8), inset 0 -4px 8px rgba(0, 0, 0, 0.3), inset 0 4px 8px rgba(255, 255, 255, 0.4)' : 'none',
                  }}
                >
                  <span className="relative z-10 flex flex-col items-center gap-1">
                    <span className="text-sm md:text-xl leading-none">10X PULL</span>
                    <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full ${
                      gameState.activeBuffs.gachaDiscount 
                        ? 'bg-cyan-400 text-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.8)]' 
                        : 'bg-black/10 text-slate-900'
                    }`}>
                      {/* THE FIX: Visually display the dynamic costs! */}
                      {tenPullGemCost} 💎 / {tenPullCoinCost} 🪙
                    </span>
                  </span>
                  {canAfford10x && (
                    <>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                      {/* This is the div you were looking for! It's the blue glow effect */}
                      <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity blur-lg" style={{ background: 'linear-gradient(135deg, #00BFFF, #1E90FF)' }} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'games' && (
          <div className="p-6 md:p-4">
            {/* Header with dynamic back button if inside a game */}
            <div className={activeMiniGame ? "inline-flex items-center gap-2 mb-4 w-fit" : "flex items-center gap-4 mb-6"}>
              {activeMiniGame ? (
                /* STATE 1: Playing a Game (Compact, Inline Header) */
                <>
                  <button 
                    onClick={() => setActiveMiniGame(null)}
                    className="text-white hover:text-amber-400 font-bold transition-colors text-xl flex items-center"
                  >
                    ← Back
                  </button>
                  <span className="text-slate-600 text-2xl font-light">|</span>
                  <h2 className="text-xl md:text-2xl font-black text-amber-300 uppercase pt-1">
                    {gameTitles[activeMiniGame]}
                  </h2>
                </>
              ) : (
                /* STATE 2: Main Arcade Menu (Large Header + Description) */
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-amber-300 mb-2">
                    The Arcade
                  </h2>
                  <p className="text-blue-300">Earn coins and gems to pull more cards!</p>
                </div>
              )}
            </div>

            {/* Conditional Game Routing */}
            {!activeMiniGame ? (
              <GachaGamesList onPlayGame={(gameId) => setActiveMiniGame(gameId)} />
            ) : activeMiniGame === 'clicker' ? (
              <div className="max-w-2xl mx-auto bg-slate-800/80 p-8 rounded-2xl border-4 border-amber-400/40 -mt-10">
                <ClickerGame onComplete={handleGameComplete} />
              </div>
            ) : activeMiniGame === 'syntax' ? (
              <div className="max-w-3xl mx-auto mt-10">
                {/* Notice I made the max-width slightly larger (max-w-3xl) for the code editor! */}
                <SyntaxGame onComplete={handleGameComplete} />
              </div>
            ) : activeMiniGame === 'memory' ? (
              <div className="max-w-3xl mx-auto -mt-10">
                <MemoryGame onComplete={handleGameComplete} />
              </div>
             ) : activeMiniGame === 'crop-sorter' ? (
              <div className="max-w-3xl mx-auto -mt-10">
                {/* The new Crop Sorter Game! */}
                <CropSorterGame onComplete={handleGameComplete} />
              </div>
             ) : activeMiniGame === 'runner' ? (
              <div className="max-w-3xl mx-auto -mt-10">
                {/* The new Coffee Run Game! */}
                <RunnerGame onComplete={handleGameComplete} />
              </div>
             ) : activeMiniGame === 'wordle' ? (
              <div className="max-w-3xl mx-auto -mt-10">
                <WordleGame onComplete={handleGameComplete} />
              </div>
             ) : activeMiniGame === 'lab-duty' ? (
              <div className="max-w-3xl mx-auto -mt-10">
                <LabDutyGame />
              </div>
             ) : activeMiniGame === 'bug-shot' ? (
              <div className="max-w-3xl mx-auto -mt-10">
                <BugShooterGame onComplete={handleGameComplete} />
              </div>
             ) : activeMiniGame === 'syntax-sprint' ? (
              <div className="max-w-3xl mx-auto -mt-10">
                <SyntaxSprintGame onComplete={handleGameComplete} />
              </div>
             ) : activeMiniGame === 'class-trivia' ? (
              <div className="max-w-3xl mx-auto -mt-10">
                <ClassTriviaGame onComplete={handleGameComplete} />
              </div>
             ) : activeMiniGame === 'classmate-combat' ? (
              <div className="max-w-3xl mx-auto -mt-10">
                <ClassmateCombatGame onComplete={handleGameComplete} />
              </div>
             ) : (
              <div className="text-center py-16 bg-slate-800/40 rounded-2xl border-2 border-dashed border-cyan-400/40">
                <p className="text-5xl mb-4">🚧</p>
                <p className="text-2xl font-black text-amber-300 mb-2">Under Construction</p>
                <p className="text-blue-300">This class is currently in session. Come back later!</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'daily' && (() => {
          const today = new Date().toDateString()
          const hasClaimedToday = gameState.lastLoginDate === today

          // THE FIX: Rock-solid logic to determine the active day
          // If claimed, the active day is their exact streak. If not, it's the next day.
          const activeDay = hasClaimedToday 
            ? (gameState.dailyLoginStreak % 7 === 0 ? 7 : gameState.dailyLoginStreak % 7)
            : (gameState.dailyLoginStreak % 7) + 1;

          return (
            <div className="p-6 md:p-8 flex flex-col items-center fade-in relative">
              
              {/* Daily Rules Modal */}
              <InstructionModal 
                isOpen={showDailyInfo}
                onClose={() => setShowDailyInfo(false)}
                title="Daily Rewards Guide"
                themeColor="amber"
                rules={[
                  { icon: '📅', text: <p>Log in consecutively to build your streak and earn larger rewards.</p> },
                  { icon: '⏰', text: <p>The reward cycle resets every day at exactly <strong>12:00 Midnight (Philippine Time)</strong>.</p> },
                  { icon: '🎁', text: <p>Reach Day 7 without breaking your streak to claim a massive <strong>300 Coin</strong> jackpot!</p> }
                ]}
              />

              {/* Help Button (Top Right) */}
              <button 
                onClick={() => setShowDailyInfo(true)}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-slate-800 border-2 border-slate-600 rounded-full font-black text-slate-300 hover:text-white hover:border-slate-400 hover:scale-110 transition-all flex items-center justify-center shadow-lg z-10"
              >
                ?
              </button>

              <h2 className="text-3xl md:text-4xl font-black text-amber-300 mb-2">Daily Rewards</h2>
              <p className="text-blue-300 mb-8">Log in daily to claim your rewards!</p>
              
              {/* Reward Track */}
              <div className="w-full max-w-4xl mb-8">
                <div className="flex gap-2 md:gap-4 justify-center items-end mb-8 overflow-x-auto pb-4 px-2">
                  {[100, 120, 140, 160, 180, 200, 300].map((reward, index) => {
                    const day = index + 1;
                    
                    // THE FIX: Cleaned up the boolean checks so they never conflict!
                    const isToday = day === activeDay;
                    const isClaimed = hasClaimedToday ? day <= activeDay : day < activeDay;
                    const isDay7 = day === 7;
                    
                    return (
                      <div key={day} className={`flex flex-col items-center min-w-16 transition-all duration-500 ${isDay7 ? 'scale-110 mx-2' : ''} ${isToday && !hasClaimedToday ? '-translate-y-2' : ''}`}>
                        
                        {/* Status Indicator */}
                        <div className="h-6 mb-1 flex items-center justify-center">
                          {isClaimed && <span className="text-green-400 text-lg drop-shadow-md">✓</span>}
                          {isToday && !hasClaimedToday && <span className="text-amber-400 text-xl animate-bounce">👇</span>}
                        </div>

                        <div className={`
                          ${isDay7 ? 'w-24 h-32 md:w-32 md:h-40' : 'w-16 h-20 md:w-20 md:h-24'} 
                          rounded-xl border-2 flex flex-col items-center justify-center font-black transition-all relative overflow-hidden
                          ${isClaimed ? 'bg-slate-800/40 border-slate-600 opacity-50 grayscale' : ''}
                          ${!isClaimed && isDay7 ? 'bg-linear-to-b from-yellow-400 to-yellow-600 border-yellow-300 shadow-lg shadow-yellow-400/50' : ''}
                          ${!isClaimed && !isDay7 && isToday ? 'bg-slate-800 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : ''}
                          ${!isClaimed && !isDay7 && !isToday ? 'bg-slate-800/60 border-cyan-400/40' : ''}
                        `}>
                          
                          {/* Inner Content */}
                          <div className="relative z-10 flex flex-col items-center">
                            <p className={`text-xs ${isDay7 && !isClaimed ? 'text-slate-900' : 'text-gray-400'}`}>
                              Day {day}
                            </p>
                            <p className={`text-center font-black mt-1 ${isDay7 && !isClaimed ? 'text-lg md:text-2xl text-slate-900 leading-tight' : 'text-sm text-amber-300'}`}>
                              {reward} 🪙
                            </p>
                          </div>

                          {/* Shine effect for today's unclaimed reward */}
                          {isToday && !hasClaimedToday && (
                            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white to-transparent opacity-20 animate-[shimmer_2s_infinite]" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Claim Button */}
                <div className="flex justify-center">
                  <button 
                    disabled={hasClaimedToday}
                    onClick={() => {
                      completeDailyTask('login')
                      checkDailyLogin()
                    }}
                    className={`group relative px-8 md:px-12 py-4 md:py-6 rounded-xl md:rounded-2xl font-black text-lg md:text-2xl text-slate-900 overflow-hidden transition-all duration-300 ${
                      hasClaimedToday 
                        ? 'opacity-50 grayscale cursor-not-allowed transform scale-95' 
                        : 'transform hover:scale-105 active:scale-95 cursor-pointer'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                      boxShadow: hasClaimedToday ? 'none' : '0 0 40px rgba(255, 215, 0, 0.8), inset 0 -4px 8px rgba(0, 0, 0, 0.3), inset 0 4px 8px rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span className="relative z-10 drop-shadow-md">
                      {hasClaimedToday ? 'COME BACK TOMORROW 🌙' : "CLAIM TODAY'S REWARD 🎁"}
                    </span>
                    {!hasClaimedToday && (
                      <>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity" />
                        <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity blur-lg" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ==========================================
            RENDER: DAILY ASSIGNMENTS
            ========================================== */}
        {currentView === 'assignments' && (
          <div className="p-6 md:p-8 max-w-4xl mx-auto fade-in">
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-emerald-400 mb-2">Daily Assignments</h2>
                <p className="text-slate-400 font-bold">Complete your tasks before the server resets at midnight.</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Available</p>
                <p className="text-2xl font-black text-amber-400">200 🪙</p>
              </div>
            </div>

            {/* Daily Progress Bar */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border-2 border-slate-700 mb-8 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-300">Completion</span>
                <span className="text-sm font-black text-emerald-400">{gameState.dailyProgress.claimedTasks.length} / 5</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 border border-slate-600 overflow-hidden">
                <div 
                  className="bg-linear-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-700"
                  style={{ width: `${(gameState.dailyProgress.claimedTasks.length / 5) * 100}%` }}
                />
              </div>
              {gameState.dailyProgress.claimedTasks.length === 5 && (
                <p className="text-center text-emerald-400 font-black text-xs uppercase tracking-widest mt-3 animate-pulse">
                  All assignments completed! Great work today.
                </p>
              )}
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {activeTasks.map((task, idx) => {
                // 👇 Read directly from the Global Context!
                const isCompleted = gameState.dailyProgress.completedTasks.includes(task.id);
                const isClaimed = gameState.dailyProgress.claimedTasks.includes(task.id);
                
                return (
                  <div 
                    key={task.id}
                    className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 rounded-2xl border-2 transition-all duration-500 ${
                      isClaimed 
                        ? 'bg-slate-800/40 border-slate-700/50 opacity-70' 
                        : isCompleted
                          ? 'bg-slate-800 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : 'bg-slate-800 border-slate-600 shadow-lg'
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner ${
                        isClaimed ? 'bg-slate-900 grayscale' : 'bg-slate-900'
                      }`}>
                        {task.icon}
                      </div>
                      <div>
                        <h4 className={`text-xl font-black ${isClaimed ? 'text-slate-400 line-through decoration-emerald-500/50' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-slate-400 font-medium">{task.desc}</p>
                      </div>
                    </div>

                    <button
                      disabled={!isCompleted || isClaimed} // Button is disabled if they haven't finished the game, OR if they already claimed it
                      onClick={() => claimDailyTask(task.id, task.reward)}
                      className={`w-full md:w-auto px-6 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                        isClaimed
                          ? 'bg-slate-900 text-emerald-500/50 border border-emerald-500/20 cursor-not-allowed'
                          : isCompleted
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 animate-pulse'
                            : 'bg-slate-700 text-slate-400 border border-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {isClaimed ? (
                        <><span>✓</span> Claimed</>
                      ) : isCompleted ? (
                        <>Claim <span className="text-lg">🪙</span> {task.reward}</>
                      ) : (
                        <>Incomplete</>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

          </div>
        )}

        {currentView === 'collection' && (() => {
          // Define a custom type so TypeScript knows about our new properties
          type DisplayItem = Character & { pullIndex: number; isCollected: boolean };

          // 1. Get unique collected items (using original index for newest/oldest sorting)
          const uniqueCollection = gameState.collection
            .map((item: Character, index: number) => ({ ...item, pullIndex: index }))
            .filter((item: Character & { pullIndex: number }, index: number, self: (Character & { pullIndex: number })[]) => 
              index === self.findIndex((t) => t.id === item.id)
            );

          // 2. Calculate Progress Bar Stats (Strictly Characters)
          const collectedCharacters = uniqueCollection.filter((char: Character & { pullIndex: number }) => 
            char.rarity === '4-star' || char.rarity === '5-star'
          );
          const unique4Stars = collectedCharacters.filter((c: Character & { pullIndex: number }) => c.rarity === '4-star').length;
          const unique5Stars = collectedCharacters.filter((c: Character & { pullIndex: number }) => c.rarity === '5-star').length;
          const MAX_CHARACTERS = 45;

          // 3. Merge Master List with Collected Data for Characters
          // We use your imported 'characters' array here!
          const mergedCharacters: DisplayItem[] = characters
            .filter((masterChar: Character) => masterChar.rarity === '4-star' || masterChar.rarity === '5-star') // Ensure we only get characters, not items
            .map((masterChar: Character) => {
              const collectedMatch = collectedCharacters.find((c: Character & { pullIndex: number }) => c.id === masterChar.id);
              return {
                ...masterChar,
                isCollected: !!collectedMatch,
                pullIndex: collectedMatch ? collectedMatch.pullIndex : -1 // -1 means uncollected
              };
            });

          // 4. Determine what to display based on active tab
          let displayCollection: DisplayItem[] = [];
          
          if (activeFilter === 'items') {
            // Format items to match the DisplayItem type
            displayCollection = uniqueCollection
              .filter((item: Character & { pullIndex: number }) => item.rarity === '3-star')
              .map((item: Character & { pullIndex: number }) => ({ ...item, isCollected: true }));
            
            // Standard sort for items
            if (sortMethod === 'newest') displayCollection.sort((a: DisplayItem, b: DisplayItem) => b.pullIndex - a.pullIndex);
            if (sortMethod === 'oldest') displayCollection.sort((a: DisplayItem, b: DisplayItem) => a.pullIndex - b.pullIndex);
          } else {
            // Apply Rarity Tab Filter
            let filteredChars = [...mergedCharacters];
            if (activeFilter === '4-star') filteredChars = filteredChars.filter((c: DisplayItem) => c.rarity === '4-star');
            if (activeFilter === '5-star') filteredChars = filteredChars.filter((c: DisplayItem) => c.rarity === '5-star');

            // Apply Class Dropdown Filter (if any classes are selected)
            if (selectedClasses.length > 0) {
              filteredChars = filteredChars.filter((c: DisplayItem) => 
                gameState.classMap[c.id] && selectedClasses.includes(gameState.classMap[c.id])
              );
            }

            // Apply Sort Method
            filteredChars.sort((a: DisplayItem, b: DisplayItem) => {
              // ALWAYS put uncollected characters at the bottom
              if (a.isCollected && !b.isCollected) return -1;
              if (!a.isCollected && b.isCollected) return 1;

              if (sortMethod === 'rarity') {
                // 5-stars first, then 4-stars
                if (a.rarity === '5-star' && b.rarity === '4-star') return -1;
                if (a.rarity === '4-star' && b.rarity === '5-star') return 1;
              } else if (sortMethod === 'newest') {
                return b.pullIndex - a.pullIndex;
              } else if (sortMethod === 'oldest') {
                return a.pullIndex - b.pullIndex;
              }
              return 0; // fallback
            });

            displayCollection = filteredChars;
          }

          // 5. Dynamic grid padding to keep UI clean
          const targetGridSize = activeFilter === 'items' ? 24 : MAX_CHARACTERS;

          return (
            <div className="p-6 md:p-8 fade-in">
              <h2 className="text-3xl md:text-4xl font-black text-amber-300 mb-2">Your Collection</h2>
              <p className="text-blue-300 mb-6">Collect all the characters!</p>
              
              {/* UPGRADED: Phone-Storage Style Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-bold text-cyan-300 flex gap-4">
                    <span>Class Completion</span>
                    <span className="text-purple-400">■ 4-Star ({unique4Stars})</span>
                    <span className="text-yellow-400">■ 5-Star ({unique5Stars})</span>
                  </p>
                  <p className="text-sm font-black text-amber-300">{collectedCharacters.length} / {MAX_CHARACTERS}</p>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-6 border-2 border-slate-600 overflow-hidden flex shadow-inner">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-700 border-r border-purple-700/50" 
                    style={{ width: `${(unique4Stars / MAX_CHARACTERS) * 100}%` }} 
                  />
                  <div 
                    className="bg-yellow-400 h-full transition-all duration-700" 
                    style={{ width: `${(unique5Stars / MAX_CHARACTERS) * 100}%` }} 
                  />
                </div>
              </div>

              {/* UPGRADED: Filter & Sort Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
                
                {/* Primary Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md border-2 ${
                      activeFilter === 'all' ? 'bg-amber-400 border-amber-400 text-slate-900' : 'bg-slate-800/60 border-amber-400/40 text-amber-300 hover:border-amber-300/80'
                    }`}
                  >
                    All Characters
                  </button>
                  <button 
                    onClick={() => setActiveFilter('4-star')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md border-2 ${
                      activeFilter === '4-star' ? 'bg-purple-400 border-purple-400 text-slate-900' : 'bg-slate-800/60 border-purple-400/40 text-purple-300 hover:border-purple-300/80'
                    }`}
                  >
                    4-Stars
                  </button>
                  <button 
                    onClick={() => setActiveFilter('5-star')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md border-2 ${
                      activeFilter === '5-star' ? 'bg-yellow-400 border-yellow-400 text-slate-900' : 'bg-slate-800/60 border-yellow-400/40 text-yellow-300 hover:border-yellow-300/80'
                    }`}
                  >
                    5-Stars
                  </button>
                  <button 
                    onClick={() => setActiveFilter('items')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md border-2 ml-auto md:ml-2 ${
                      activeFilter === 'items' ? 'bg-blue-400 border-blue-400 text-slate-900' : 'bg-slate-800/60 border-blue-400/40 text-blue-300 hover:border-blue-300/80'
                    }`}
                  >
                    Items 🎒
                  </button>
                </div>

                {/* Sub-Filters (Only show for Characters) */}
                {activeFilter !== 'items' && (
                  <div className="flex gap-2 w-full md:w-auto">
                    
                    {/* Class Toggle Dropdown */}
                    <div className="relative z-20">
                      <button 
                        onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                        className="bg-slate-800 border-2 border-slate-600 text-slate-300 px-4 py-2 rounded-lg font-bold text-sm hover:border-slate-400 transition-all flex items-center gap-2"
                      >
                        Classes {selectedClasses.length > 0 && `(${selectedClasses.length})`}
                        <span className="text-xs">▼</span>
                      </button>
                      
                      {isClassDropdownOpen && (
                        <div className="absolute top-full mt-2 w-48 bg-slate-800 border-2 border-slate-600 rounded-xl shadow-xl overflow-hidden p-2 flex flex-col gap-1">
                          {AVAILABLE_CLASSES.map(cls => (
                            <button
                              key={cls}
                              onClick={() => {
                                setSelectedClasses(prev => 
                                  prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
                                )
                              }}
                              className={`text-left px-3 py-2 rounded-md text-sm font-bold transition-all ${
                                selectedClasses.includes(cls) ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {selectedClasses.includes(cls) ? '✓ ' : ''}{cls}
                            </button>
                          ))}
                          {selectedClasses.length > 0 && (
                            <button 
                              onClick={() => setSelectedClasses([])}
                              className="mt-1 border-t border-slate-600 pt-2 text-xs text-red-400 hover:text-red-300 font-bold"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sort Dropdown */}
                    <select 
                      value={sortMethod}
                      onChange={(e) => setSortMethod(e.target.value as any)}
                      className="bg-slate-800 border-2 border-slate-600 text-slate-300 px-4 py-2 rounded-lg font-bold text-sm hover:border-slate-400 transition-all outline-none cursor-pointer"
                    >
                      <option value="rarity">Rarity (High to Low)</option>
                      <option value="newest">Recently Pulled</option>
                      <option value="oldest">Earliest Pulled</option>
                    </select>

                  </div>
                )}
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 relative z-0">
                
                {displayCollection.map((char: DisplayItem, idx: number) => {
                  const isJunk = char.type === 'junk';
                  const isCollected = char.isCollected;
                  
                  return (
                    <div 
                      key={`${char.id}-${idx}`} 
                      className={`transform transition-all ${
                        isJunk ? 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100' : ''
                      } ${
                        !isCollected ? 'grayscale opacity-50 brightness-50 contrast-125' : ''
                      }`}
                    >
                      <CharacterCard 
                        character={char} 
                        // Only allow clicking if the character is actually collected
                        onClick={() => isCollected ? setSelectedItem(char) : null} 
                        layout="square" 
                      />
                      
                      {/* Uncollected Lock Overlay */}
                      {!isCollected && (
                        <div className="absolute top-2 right-2 text-slate-400 text-xs font-black bg-slate-900/80 rounded-full px-2 py-1 shadow-md border border-slate-700">
                          🔒
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {/* Empty Slots Filler */}
                {Array.from({ length: Math.max(0, targetGridSize - displayCollection.length) }).map((_, idx) => (
                  <div key={`locked-${idx}`} className="relative w-full aspect-square rounded-lg border-2 border-slate-600/40 bg-slate-800/20 flex items-center justify-center cursor-pointer group hover:border-slate-500/60 hover:scale-105 transition-all">
                    <div className="text-3xl text-slate-600/50 group-hover:text-slate-500/70 transition-all">?</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ==========================================
            RENDER: CLASS STANDING (LEADERBOARD)
            ========================================== */}
        {currentView === 'leaderboard' && (
          <div className="w-full h-full overflow-y-auto">
            <ClassStanding />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden w-full bg-slate-900/80 backdrop-blur-sm border-t-2 border-amber-400/20 px-2 py-3 flex justify-around z-40">
        <button
          onClick={() => setCurrentView('wish')}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
            currentView === 'wish'
              ? 'bg-amber-400 text-slate-900'
              : 'text-blue-300 hover:text-amber-300'
          }`}
        >
          Wish
        </button>
        <button
          onClick={() => setCurrentView('games')}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
            currentView === 'games'
              ? 'bg-amber-400 text-slate-900'
              : 'text-blue-300 hover:text-amber-300'
          }`}
        >
          Arcade
        </button>
        <button
          onClick={() => setCurrentView('daily')}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
            currentView === 'daily'
              ? 'bg-amber-400 text-slate-900'
              : 'text-blue-300 hover:text-amber-300'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setCurrentView('collection')}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
            currentView === 'collection'
              ? 'bg-amber-400 text-slate-900'
              : 'text-blue-300 hover:text-amber-300'
          }`}
        >
          Collect
        </button>
        <button
          onClick={() => setCurrentView('leaderboard')}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
            currentView === 'leaderboard'
              ? 'bg-amber-400 text-slate-900'
              : 'text-blue-300 hover:text-amber-300'
          }`}
        >
          Whale
        </button>
      </nav>
      
      {/* --- CONVERSION MODAL --- */}
      {conversionConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 fade-in">
          <div className="bg-slate-800 border-2 border-cyan-400/50 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl shadow-cyan-500/20 text-center">
            <div className="text-5xl mb-4">💱</div>
            <h3 className="text-2xl font-black text-white mb-2">Insufficient Gems</h3>
            <p className="text-slate-300 mb-8 font-medium">
              Would you like to convert <strong className="text-amber-400">{conversionConfig.coinsToSpend} Coins</strong> into <strong className="text-purple-400">{conversionConfig.gemsToGet} {conversionConfig.gemsToGet === 1 ? 'Gem' : 'Gems'}</strong> to make this pull?
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setConversionConfig(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // 1. Do the currency math
                  addCoins(-conversionConfig.coinsToSpend)
                  addGems(conversionConfig.gemsToGet)
                  
                  // 2. Close this conversion modal
                  setConversionConfig(null)
                  
                  // 3. Immediately trigger the pull modal!
                  setPullConfig({ 
                    amount: conversionConfig.pullAmount, 
                    cost: conversionConfig.gemsToGet, 
                    costType: 'gems' 
                  })
                }}
                className="flex-1 bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-black py-3 rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105"
              >
                Convert & Pull
              </button>
            </div>
          </div>
        </div>
      )}
      
      {pullConfig && (
        <PullModal 
          amount={pullConfig.amount} 
          cost={pullConfig.cost} 
          costType={pullConfig.costType} 
          onClose={() => setPullConfig(null)} 
        />
      )}

      {/* ==========================================
          RENDER: CURRENCY EXCHANGE MODAL
          ========================================== */}
      {showExchangeModal && (() => {
        // --- SLIDER MATH ---
        const exchangeRate = 100; // 100 Coins = 1 Gem
        const maxGems = Math.floor(gameState.coins / exchangeRate);
        const sliderValue = maxGems === 0 ? 0 : Math.min(Math.max(1, exchangeAmount), maxGems);
        const totalCost = sliderValue * exchangeRate;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative max-w-md w-full bg-slate-900 border-2 border-amber-400 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.3)] overflow-hidden">
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowExchangeModal(false);
                  setExchangeAmount(1); // Reset slider when closed
                }} 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 z-50 transition-all font-bold border border-slate-600"
              >
                ✕
              </button>

              {/* Header */}
              <div className="px-6 pt-8 pb-6 text-center border-b border-slate-800 bg-slate-900/50">
                <div className="text-5xl mb-2">🏦</div>
                <h3 className="text-3xl font-black text-amber-400 tracking-tight uppercase">Black Market</h3>
                <p className="text-sm text-slate-400 mt-1">Convert your hard-earned arcade coins into premium gems.</p>
                <div className="mt-4 inline-block bg-slate-950 rounded-full px-4 py-1.5 border border-slate-700">
                  <span className="text-sm font-bold text-slate-300">Your Balance: <span className="text-amber-400">{gameState.coins} 🪙</span></span>
                </div>
              </div>

              {/* Slider Section */}
              <div className="p-6 space-y-6 bg-slate-950/50">
                
                {maxGems > 0 ? (
                  <>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Amount</span>
                      <span className="text-3xl font-black text-blue-400 flex items-center gap-1">
                        {sliderValue} <span className="text-xl">💎</span>
                      </span>
                    </div>

                    {/* The Range Slider */}
                    <div className="relative flex items-center gap-4">
                      <button 
                        onClick={() => setExchangeAmount(1)}
                        className="text-xs font-black text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded"
                      >
                        MIN
                      </button>
                      
                      <input 
                        type="range" 
                        min="1" 
                        max={maxGems} 
                        value={sliderValue} 
                        onChange={(e) => setExchangeAmount(Number(e.target.value))}
                        className="flex-1 accent-amber-400 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      
                      <button 
                        onClick={() => setExchangeAmount(maxGems)}
                        className="text-xs font-black text-amber-900 bg-amber-400 hover:bg-amber-300 px-2 py-1 rounded"
                      >
                        MAX
                      </button>
                    </div>

                    <div className="text-center text-sm font-bold text-slate-500">
                      Cost: <span className="text-amber-400">{totalCost} 🪙</span>
                    </div>

                    {/* Execute Button */}
                    <button 
                      onClick={() => {
                        addCoins(-totalCost);
                        addGems(sliderValue);
                        
                        // NEW: Save the receipt, close the shop, and reset the slider
                        setExchangeResult({ coins: totalCost, gems: sliderValue });
                        setShowExchangeModal(false);
                        setExchangeAmount(1); 
                      }}
                      className="w-full py-4 rounded-xl font-black text-xl text-slate-900 bg-linear-to-r from-amber-400 to-yellow-500 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] mt-4"
                    >
                      CONFIRM EXCHANGE
                    </button>
                  </>
                ) : (
                  // Broke State
                  <div className="text-center py-6">
                    <div className="text-4xl mb-4 opacity-50">💸</div>
                    <p className="text-red-400 font-bold">Insufficient Coins.</p>
                    <p className="text-slate-500 text-sm mt-1">You need at least {exchangeRate} 🪙 to buy 1 💎.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==========================================
          RENDER: EXCHANGE SUCCESS MODAL
          ========================================== */}
      {exchangeResult && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative max-w-sm w-full bg-slate-900 border-2 border-emerald-400 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] overflow-hidden text-center p-8">
            
            <div className="text-6xl mb-2 animate-bounce drop-shadow-lg">💎</div>
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-widest">Transaction<br/>Complete</h3>
            
            <div className="bg-slate-800/80 rounded-2xl p-5 mb-8 border border-slate-700 shadow-inner flex flex-col gap-3">
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Exchanged</p>
                <p className="text-2xl font-black text-amber-400 line-through opacity-80 decoration-red-500/50">
                  {exchangeResult.coins} 🪙
                </p>
              </div>
              
              <div className="w-full h-px bg-slate-700 relative">
                <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-slate-800 text-slate-500 text-xs px-2 rounded-full">▼</div>
              </div>
              
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1 mt-2">Received</p>
                <p className="text-4xl font-black text-blue-400 drop-shadow-md">
                  +{exchangeResult.gems} 💎
                </p>
              </div>
            </div>

            <button 
              onClick={() => setExchangeResult(null)} // Closes the popup
              className="w-full py-4 rounded-xl font-black text-lg text-slate-900 bg-emerald-400 hover:bg-emerald-300 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-400/20"
            >
              ACCEPT
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          PROFILE MODAL
          ========================================== */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
          
          {/* Main ID Card Container */}
          <div className="bg-slate-900 border-4 border-purple-500 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.3)] relative">
            
            {/* Header / ID Badge Tape */}
            <div className="bg-purple-600 py-3 text-center border-b-4 border-purple-800 relative">
              <h2 className="text-white font-black uppercase tracking-widest text-lg drop-shadow-md">
                Student ID Record
              </h2>
              <button 
                onClick={() => { setShowProfileModal(false); setShowAvatarSelect(false); }}
                className="absolute top-2 right-4 text-white/50 hover:text-white font-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              
              {/* TOP SECTION: Avatar & Basic Info */}
              <div className="flex gap-6 items-center mb-6">
                
                {/* 👇 UPDATED: Avatar Wrapper */}
                <div className="relative group cursor-pointer" onClick={() => setShowAvatarSelect(!showAvatarSelect)}>
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border-4 border-cyan-400 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] relative">
                    
                     {/* 🛑 I removed the hardcoded placeholders here too! */}
                     {activeAvatar?.image ? (
                       // 👇 Displays the chosen character's image
                       <img src={activeAvatar.image} alt="Profile" className="w-full h-full object-cover" />
                     ) : activeAvatar ? (
                       // Fallback to initial
                       <span className="text-5xl font-black text-white">{activeAvatar.name.charAt(0)}</span>
                     ) : (
                       // Default
                       <span className="text-5xl z-10">👾</span>
                     )}

                  </div>
                  {/* Edit Overlay */}
                  <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <span className="text-white font-bold text-xs uppercase tracking-wider">Change</span>
                  </div>
                </div>

                {/* Name & Level */}
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter truncate max-w-50">
                    {currentUser?.username || 'PlayerOne'}
                  </h3>
                  <div className="text-yellow-400 font-bold text-sm tracking-widest uppercase mb-1">
                    Lv. {Math.floor((gameState.collection?.length || 0) / 2) + 1} Hacker
                  </div>
                  <div className="text-slate-500 text-xs font-bold truncate max-w-50">
                    {currentUser?.email || 'No email linked'}
                  </div>
                </div>
              </div>

              {/* AVATAR SELECTION GRID (Expands when clicked) */}
              {showAvatarSelect && (
                <div className="mb-6 p-4 bg-slate-800 rounded-xl border-2 border-slate-700 h-48 overflow-y-auto">
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">Select Roster Avatar</h4>
                  <div className="grid grid-cols-4 gap-3">
                    
                    {/* 👇 FIX: We use the newly filtered availableAvatars array! */}
                    {availableAvatars.length > 0 ? (
                      availableAvatars.map((char, idx) => (
                        <button 
                          key={idx}
                          onClick={() => { updateProfile(char.id, gameState.profileBio || '', gameState.username); setShowAvatarSelect(false); }}
                          className={`aspect-square relative rounded-lg bg-slate-700 flex items-center justify-center border-2 transition-all overflow-hidden ${gameState.profilePicId === char.id ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border-transparent hover:border-slate-500'}`}
                        >
                          {/* Mini rarity indicator so they know it's a 5-star! */}
                          {char.rarity === '5-star' && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-bl-lg z-10 shadow-sm" />
                          )}

                          {char.image ? (
                            <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-3xl font-black text-white">{char.name.charAt(0)}</div>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 col-span-4 text-center py-4">Unlock 4-Star or 5-Star characters to use them as avatars!</p>
                    )}
                    
                  </div>
                </div>
              )}

              {/* STATS SECTION */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Roster Unlocked</div>
                  {/* 👇 FIX: Now shows the actual unique character count! */}
                  <div className="text-2xl font-black text-cyan-400">{uniqueCharacterCount}</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Lifetime Pulls</div>
                  {/* 👇 FIX: Uses lifetimePulls if you updated your context, or safely falls back to total collection length */}
                  <div className="text-2xl font-black text-yellow-400">{gameState.lifetimePulls || gameState.collection?.length || 0}</div>
                </div>
              </div>

              {/* EDITABLE BIO SECTION */}
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Bio</span>
                  <button 
                    onClick={() => {
                      if (isEditingBio) {
                        // 👇 Saves to database when they click 'Save'!
                        updateProfile(gameState.profilePicId || null, draftBio, gameState.username);
                      }
                      setIsEditingBio(!isEditingBio);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold uppercase"
                  >
                    {isEditingBio ? 'Save' : 'Edit'}
                  </button>
                </div>
                
                {isEditingBio ? (
                  <textarea 
                    value={draftBio} // Uses the draft state while typing
                    onChange={(e) => setDraftBio(e.target.value)}
                    maxLength={100}
                    className="w-full bg-slate-900 text-white text-sm p-2 rounded-lg border border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none h-20"
                  />
                ) : (
                  <p className="text-sm text-slate-300 min-h-10 italic">
                    "{gameState.profileBio}" {/* Displays the saved database version */}
                  </p>
                )}
              </div>

              {/* LOGOUT BUTTON */}
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  onLogout(); // Triggers the wipe in page.tsx!
                }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border-2 border-red-500/50 hover:border-red-400 font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all"
              >
                Disconnect / Switch Account
              </button>

            </div>
          </div>
        </div>
      )}

      <ItemDetailsModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  )
}
