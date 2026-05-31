'use client'

import image from 'next/image';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Rarity = '3-star' | '4-star' | '5-star';

export interface Character {
  id: string
  name: string
  image: string
  rarity: Rarity
  type: 'professor' | 'classmate' | 'powerup' | 'fragment' | 'junk' | 'modifier' 
  description?: string
  bonus?: string 
}

export type CEClass = 'Software' | 'Data' | 'ML' | 'Networks' ;

const CLASSES: CEClass[] = ['Software', 'Data', 'ML', 'Networks'];

// Helper to generate the random mapping
const generateInitialClassMap = () => {
  const mapping: Record<string, CEClass> = {};
  characters.forEach(char => {
    mapping[char.id] = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  });
  return mapping;
};

export interface GameState {
  coins: number
  gems: number
  collection: Character[]
  dailyLoginStreak: number
  lastLoginDate: string | null
  dailyProgress: {
    date: string;
    completedTasks: string[]; // Tracks what they actually played
    claimedTasks: string[];   // Tracks what they took the coins for
  };
  pulls: number
  pullsSince5Star: number
  pullsSince4Star: number
  lifetimePulls?: number
  classMap: Record<string, CEClass>
  activeBuffs: {
    arcadeDoubleCoins: boolean
    syntaxRevealBug: boolean
    memoryProtectHeart: boolean
    gachaDiscount: boolean
    gachaEarlyPity: boolean
    memoryHBPencil: boolean
  }
  taskNotification: { id: number; title: string; desc: string; icon: string } | null;
  userId?: string;
  profileBio?: string;
  profilePicId?: string | null;
}

interface GameProviderProps {
  children: React.ReactNode;
  userId?: string; 
}

export const characters: Character[] = [
  // --- 5-STAR PROFESSORS ---
  { id: 'mahaguay', name: 'Sir Mahaguay', image: '/characters/prof-alice.jpg', rarity: '5-star', type: 'professor' },
  { id: 'master', name: 'Sir Rodriguez', rarity: '5-star', type: 'professor', image: '/characters/prof-bob.jpg' },
  { id: 'cherry', name: "Ma'am Cherry", rarity: '5-star', type: 'professor', image: '/characters/prof-clara.jpg' },
  { id: 'doc-a', name: 'Doc A.', rarity: '5-star', type: 'professor', image: '/characters/prof-doc-a.jpg' },
  { id: 'rufo', name: 'Sir Rufo', rarity: '5-star', type: 'professor', image: '/characters/prof-rufo.jpg' },
  { id: 'meann', name : "Ma'am Meann", rarity: '5-star', type: 'professor', image: '/characters/prof-meann.jpg' },

  // --- 5-STAR CLASSMATES ---
  { id: 'aaron', name: 'Aaron', image: '/characters/aaron.png', rarity: '5-star', type: 'classmate' },
  { id: 'ablay', name: 'Ablay', image: '/characters/ablay.png', rarity: '5-star', type: 'classmate' },
  { id: 'johan', name: 'Johan', image: '/characters/johan.png', rarity: '5-star', type: 'classmate' },
  { id: 'tim', name: 'Tim', image: '/characters/tim.png', rarity: '5-star', type: 'classmate' },

  // --- 4-STAR CLASSMATES ---
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

  /// --- 3-STAR ITEMS ---
  { id: 'frag-class', name: 'Class Photo Fragment', image: '/fragments/frag-class.png', rarity: '3-star', type: 'fragment', bonus: 'Collect 4 to unlock 5 Free Pulls!' },
  { id: 'frag-agri', name: 'Agrivision Fragment', image: '/fragments/frag-agri.png', rarity: '3-star', type: 'fragment', bonus: 'Collect 4 to unlock 3 Free Pulls!' },
  { id: 'frag-team', name: 'Developers Fragment', image: '/fragments/frag-team.png', rarity: '3-star', type: 'fragment', bonus: 'Collect 4 to unlock 7 Free Pulls!' },
  { id: 'frag-prof', name: 'Professor Fragment', image: '/fragments/frag-prof.png', rarity: '3-star', type: 'fragment', bonus: 'Collect 3 to unlock 10 Free Pulls!' },

  { id: 'junk-resistor', name: 'Fried Resistor', image: '/items/fried-resistor.png', rarity: '3-star', type: 'junk', bonus: 'Recycle 3 Junk for 1 Gem' },
  { id: 'junk-breadboard', name: 'Burnt Breadboard', image: '/items/breadboard.png', rarity: '3-star', type: 'junk', bonus: 'Recycle 3 Junk for 1 Gem' },
  { id: 'junk-code', name: 'Broken Syntax', image: '/items/syntax.png', rarity: '3-star', type: 'junk', bonus: 'Recycle 3 Junk for 1 Gem' },
  { id: 'junk-wire', name: 'Snapped Wire', image: '/items/wire.png', rarity: '3-star', type: 'junk', bonus: 'Recycle 3 Junk for 1 Gem' },
  { id: 'junk-usb', name: 'Corrupt USB', image: '/items/usb.png', rarity: '3-star', type: 'junk', bonus: 'Recycle 3 Junk for 1 Gem' },
  
  { id: 'power-coffee', name: 'Instant Coffee', image: '/items/coffee.png', rarity: '3-star', type: 'powerup', bonus: 'Double Coins for 1 game' },
  { id: 'power-calc', name: 'Scientific Calc', image: '/items/calc.png', rarity: '3-star', type: 'powerup', bonus: 'Reveals 1 error in Syntax Spotter' },
  { id: 'power-eraser', name: 'Pink Eraser', image: '/items/eraser.png', rarity: '3-star', type: 'powerup', bonus: 'Protects 1 heart in Memory Match' },
  { id: 'power-pencil', name: 'HB Pencil', image: '/items/pencil.png', rarity: '3-star', type: 'powerup', bonus: 'Adds +5s to any game timer' },
  { id: 'power-bounty', name: 'Bug Bounty', image: '/items/bug-bounty.png', rarity: '3-star', type: 'powerup', bonus: 'Instantly grants 50 Coins' },
  { id: 'power-duck', name: 'Rubber Duck', image: '/items/duck.png', rarity: '3-star', type: 'powerup', bonus: 'Auto-squashes 1 bug in Syntax Spotter' },
  
  { id: 'meta-lucky-cat', name: 'Lucky Cat Figurine', image: '/items/cat.png', rarity: '3-star', type: 'modifier', bonus: 'Equip: 4-Star Soft Pity triggers 2 pulls earlier.' },
  { id: 'meta-overclock', name: 'Overclocked CPU', image: '/items/cpu.png', rarity: '3-star', type: 'modifier', bonus: 'Consume: Next 10-Pull costs only 900 Coins/9 Gems.' },
  { id: 'meta-priority', name: 'Priority Registration', image: '/items/prio.png', rarity: '3-star', type: 'modifier', bonus: 'Consume: Guarantees your next 4-Star is unowned.' },
]

// 📖 TASK DICTIONARY: Used to display notifications!
export const TASK_DICTIONARY: Record<string, { title: string; desc: string; icon: string }> = {
  'login': { icon: '👋', title: 'System Boot', desc: 'Claim your Daily Login Reward.' },
  'gacha': { icon: '✨', title: 'Gacha Addict', desc: 'Perform at least 1 pull at the gacha.' },
  'cafe': { icon: '☕', title: 'Barista', desc: 'Upgrade any Cafe item.' },
  'lab-duty': { icon: '🧪', title: 'Lab Assistant', desc: 'Send a character on Lab Duty.' },
  'trivia': { icon: '🎓', title: 'Mental Gymnastics', desc: 'Play one game of Class Trivia.' },
  'wordle': { icon: '🟩', title: 'Hacker', desc: 'Successfully crack the Tech Wordle.' },
  'bugshot': { icon: '🤖', title: 'Exterminator', desc: 'Survive Wave 1 in Bug-Shot.' },
  'combat': { icon: '⚔️', title: 'Gladiator', desc: 'Win a match in Classmate Combat.' },
  'crop-sorter': { icon: '🌾', title: 'Data Farmer', desc: 'Sort a full batch in Agrivision Rush.' },
  'memory-match': { icon: '🧠', title: 'Memory Master', desc: 'Clear the board in Memory Match.' },
  'syntax-spotter': { icon: '🔍', title: 'Bug Hunter', desc: 'Spot the bugs and win Syntax Spotter.' },
  'coffee-run': { icon: '🏃‍♂️', title: 'Caffeine Rush', desc: 'Score 100+ distance in Caffeine Dash.' },
  'syntax-sprint': { icon: '⚡', title: 'Fast Fingers', desc: 'Achieve 30+ WPM in Syntax Sprint.' },
};

export const getCharacterById = (id: string): Character | undefined => {
  return characters.find(c => c.id === id)
}

interface GameContextType {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  addCoins: (amount: number) => void
  addGems: (amount: number) => void
  pullCards: (amount: number) => Character[] 
  getCollection: () => Character[]
  checkDailyLogin: () => boolean
  completeDailyTask: (taskId: string) => void;
  claimDailyTask: (taskId: string, reward: number) => void;
  // THE FIX 1: Add consumeBuff to the Interface
  consumeBuff: (buffKey: keyof GameState['activeBuffs']) => void 
  updateProfile: (picId: string | null, bio: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider: React.FC<GameProviderProps> = ({ children, userId }) => {
  const [gameState, setGameState] = useState<GameState>({
    coins: 1000,
    gems: 10,
    collection: [],
    dailyLoginStreak: 0,
    lastLoginDate: null,
    dailyProgress: {
      date: new Date().toDateString(),
      completedTasks: [],
      claimedTasks: []
    },
    pulls: 0,
    pullsSince5Star: 0,
    pullsSince4Star: 0,
    classMap: generateInitialClassMap(),
    activeBuffs: {
      arcadeDoubleCoins: false,
      syntaxRevealBug: false,
      memoryProtectHeart: false,
      gachaDiscount: false,
      gachaEarlyPity: false,
      memoryHBPencil: false,
    },
    taskNotification: null,
    profileBio: 'New student at Tech Academy. Ready to code!',
    profilePicId: null,
  })

  // --- LOAD GAME STATE ---
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return; // If no user is logged in, do nothing
      
      try {
        const docRef = doc(db, 'player_saves', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          // 1. Catch the data from the database first
          const data = docSnap.data() as GameState;
          
          // 2. 👇 Put it in state, but explicitly force the notification to be null!
          setGameState({ ...data, taskNotification: null }); 
          
        } else {
          // First time player? Save the default starting state to the database
          await setDoc(docRef, gameState);
        }
      } catch (error) {
        console.error("Error loading save file:", error);
      }
    };
    
    loadData();
  }, [userId]); // This runs once when the component mounts or userId changes

  // --- SAFE SAVE HELPER (RACE-CONDITION PROOF) ---
  const updateAndSaveState = (newState: React.SetStateAction<GameState>) => {
    
    // 👇 By using setGameState with (prev), we force React to queue up rapid-fire changes!
    setGameState((prev) => {
      // 1. Calculate the new state based on the QUEUE, not the old closure
      const nextState = typeof newState === 'function' 
        ? (newState as (prevState: GameState) => GameState)(prev) 
        : newState;

      // 2. Because we sanitize our characters now (cleanChar), this is totally safe here!
      if (userId) {
        const docRef = doc(db, 'player_saves', userId);
        setDoc(docRef, nextState).catch(err => 
          console.error("Firestore Save Error:", err)
        );
      }

      // 3. Keep local storage perfectly synced instantly too
      localStorage.setItem('gachaGameState', JSON.stringify(nextState));

      return nextState;
    });
  };

  useEffect(() => {
    const today = new Date().toDateString();
    if (gameState.dailyProgress && gameState.dailyProgress.date !== today) {
      updateAndSaveState(prev => ({
        ...prev,
        dailyProgress: { date: today, completedTasks: [], claimedTasks: [] }
      }));
    }
  }, [gameState.dailyProgress?.date]);

  useEffect(() => {
    const savedState = localStorage.getItem('gachaGameState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        updateAndSaveState(prev => ({
          ...prev,
          ...parsed,
          pullsSince5Star: parsed.pullsSince5Star || 0,
          pullsSince4Star: parsed.pullsSince4Star || 0,
          taskNotification: null,
        }))
      } catch (e) {
        console.error('Failed to load saved state', e)
      }
    }
  }, [])

  const addCoins = (amount: number) => updateAndSaveState(prev => ({ ...prev, coins: prev.coins + amount }))
  const addGems = (amount: number) => updateAndSaveState(prev => ({ ...prev, gems: prev.gems + amount }))

  // THE FIX 2: Create the consumeBuff function
  const consumeBuff = (buffKey: keyof GameState['activeBuffs']) => {
    updateAndSaveState(prev => ({
      ...prev,
      activeBuffs: {
        ...prev.activeBuffs,
        [buffKey]: false // Finds the specific buff and turns it off!
      }
    }));
  };

  const updateProfile = (picId: string | null, bio: string) => {
    updateAndSaveState(prev => ({
      ...prev,
      profilePicId: picId,
      profileBio: bio
    }));
  };

  const pullCards = (amount: number): Character[] => {
    let current5Pity = gameState.pullsSince5Star
    let current4Pity = gameState.pullsSince4Star
    let currentTotalPulls = gameState.pulls
    const pulledResults: Character[] = []

    for (let i = 0; i < amount; i++) {
      // 👇 RESTORED: Increment pity counters first!
      current5Pity++
      current4Pity++
      currentTotalPulls++

      // 👇 RESTORED: Calculate chances and roll for rarity BEFORE checking it!
      let chance5 = 0.006 
      if (current5Pity >= 60) chance5 = 1.0 
      else if (current5Pity >= 50) chance5 += 0.1 * (current5Pity - 49) 

      let pityStart = gameState.activeBuffs?.gachaEarlyPity ? 7 : 10; 
      let chance4 = 0.051 
      if (current4Pity >= 10) chance4 = 1.0 
      else if (current4Pity >= pityStart) chance4 += 0.45

      const roll = Math.random()
      let rarity: Rarity = '3-star'

      if (roll < chance5) {
        rarity = '5-star'
      } else if (roll < chance5 + chance4) {
        rarity = '4-star'
      }

      // --- YOUR SNIPPET CONTINUES HERE ---

      if (rarity === '5-star') {
        current5Pity = 0;
      } else if (rarity === '4-star') {
        current4Pity = 0;
      }

      // 👇 NEW: We only need to figure out the type if it's a 3-star
      let targetType = ''; 

      if (rarity === '3-star') {
        const typeRoll = Math.random();
        
        if (typeRoll < 0.50) {
          targetType = 'junk';        // 50% chance
        } else if (typeRoll < 0.80) {
          targetType = 'powerup';     // 30% chance
        } else if (typeRoll < 0.95) {
          targetType = 'modifier';    // 15% chance
        } else {
          targetType = 'fragment';    // 5% chance (Rare, but obtainable!)
        }
      }

      const pool = characters.filter(c => {
        if (c.rarity !== rarity) return false;
        if (rarity === '3-star') return c.type === targetType;
        return true;
      });
      
      const safePool = pool.length > 0 ? pool : characters.filter(c => c.rarity === rarity);
      const pulledChar = safePool[Math.floor(Math.random() * safePool.length)];
      
      // 👇 THE FIX: We create a "Clean" version of the character. 
      // This strips out any React components or complex data that breaks Firestore!
      const cleanChar = {
        id: pulledChar.id,
        name: pulledChar.name,
        rarity: pulledChar.rarity,
        type: pulledChar.type,
        image: pulledChar.image, 
        // Add any other simple string/number properties your UI needs here.
        // DO NOT include things like React icons (e.g., <Icon/>) or functions!
      };
      
      // Force TypeScript to accept our clean object as a Character
      pulledResults.push(cleanChar as Character);
    } // <-- End of the for loop

    // 👇 Save to state (and automatically to Firebase!)
    updateAndSaveState(prev => ({
      ...prev,
      pulls: currentTotalPulls,
      pullsSince5Star: current5Pity,
      pullsSince4Star: current4Pity,
      collection: [...prev.collection, ...pulledResults],
      activeBuffs: {
        ...prev.activeBuffs,
        gachaDiscount: amount === 10 ? false : prev.activeBuffs.gachaDiscount 
      }
    }))

    return pulledResults
  }

  const getCollection = (): Character[] => gameState.collection

  const checkDailyLogin = (): boolean => {
    const today = new Date().toDateString()
    if (gameState.lastLoginDate === today) return false
    
    updateAndSaveState(prev => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const wasYesterday = prev.lastLoginDate === yesterday.toDateString()

      const newStreak = wasYesterday ? prev.dailyLoginStreak + 1 : 1
      const rewards = [100, 120, 140, 160, 180, 200, 300]
      const earnedCoins = rewards[(newStreak - 1) % 7]

      return {
        ...prev,
        lastLoginDate: today,
        dailyLoginStreak: newStreak,
        coins: prev.coins + earnedCoins,
      }
    })
    
    return true
  }

  // Assignment
  const completeDailyTask = (taskId: string) => {
    updateAndSaveState(prev => {
      // 1. Get today's exact list from localStorage
      const today = new Date().toDateString();
      const savedActive = localStorage.getItem(`active_tasks_${today}`);
      
      // If tasks haven't generated yet somehow, ignore the completion
      if (!savedActive) return prev; 
      
      const parsedTasks = JSON.parse(savedActive);

      // 2. Safely check if the task is in today's active list
      // (This works whether your array is strings or objects with an 'id'!)
      const isActive = parsedTasks.some((task: any) => 
        task === taskId || task.id === taskId
      );

      // 🛑 If it's NOT on today's list, silently ignore it! No notifications!
      if (!isActive) {
        return prev;
      }

      // 3. Is it already completed or claimed?
      const isCompleted = prev.dailyProgress.completedTasks.includes(taskId);
      const isClaimed = prev.dailyProgress.claimedTasks?.includes(taskId);

      if (isCompleted || isClaimed) {
        return prev; 
      }

      // 4. Process the completion and show the notification!
      const taskInfo = TASK_DICTIONARY[taskId];

      return {
        ...prev,
        taskNotification: taskInfo ? { ...taskInfo, id: Date.now() } : null,
        dailyProgress: {
          ...prev.dailyProgress,
          completedTasks: [...prev.dailyProgress.completedTasks, taskId]
        }
      };
    });
  };

  const claimDailyTask = (taskId: string, reward: number) => {
    updateAndSaveState(prev => {
      // 1. If it's already claimed, do nothing!
      if (prev.dailyProgress.claimedTasks.includes(taskId)) return prev;
      
      // 2. If it hasn't been completed yet, they can't claim it!
      if (!prev.dailyProgress.completedTasks.includes(taskId)) return prev;

      // 3. Give them the money and mark it as claimed!
      return {
        ...prev,
        coins: prev.coins + reward, 
        dailyProgress: {
          ...prev.dailyProgress,
          claimedTasks: [...prev.dailyProgress.claimedTasks, taskId]
        }
      };
    });
  };

  return (
    <GameContext.Provider value={{
      gameState,
      setGameState,
      addCoins,
      addGems,
      pullCards,
      getCollection,
      checkDailyLogin,
      completeDailyTask,
      claimDailyTask,
      consumeBuff, // THE FIX 3: Expose it to the rest of your app!
      updateProfile,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within GameProvider')
  }
  return context
}