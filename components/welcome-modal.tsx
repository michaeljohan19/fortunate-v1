'use client'

import React, { useState, useEffect } from 'react';

const SLIDES = [
  {
    title: "The Wish Banner",
    description: "Use your Coins to recruit Classmates and Professors. Build your ultimate roster to conquer assignments.",
    icon: "🌟",
    color: "text-amber-400",
    bgGlow: "bg-amber-400/20",
    borderColor: "border-amber-400/50"
  },
  {
    title: "4-star When?",
    description: "Within every 10 pulls, you get a random 4-star CLASSMATE. In every 60 pulls, you get a random PROFESSOR or an AGRIVISION member!",
    icon: "🎓",
    color: "text-amber-400",
    bgGlow: "bg-amber-400/20",
    borderColor: "border-amber-400/50"
  },
  {
    title: "Powerups or Junk?",
    description: "Every pull has a chance to drop a random 3-star item:\n\n Fragments: Collectfor free pulls!\n Powerups: Usefor game bonuses!\n\n Junk: Recycle into Gems!",
    icon: "🎁",
    color: "text-red-400",
    bgGlow: "bg-red-400/20",
    borderColor: "border-red-400/50"
  },
  {
    title: "No More Coins?",
    description: "Play our assortment of games in ARCADE to get more pulls! Each game is unique and offers different rewards, so try them all out and find your favorite!",
    icon: "💰",
    color: "text-amber-400",
    bgGlow: "bg-amber-400/20",
    borderColor: "border-amber-400/50"
  },
  {
    title: "Collect all 45 characters!",
    description: "Look at your roster in the COLLECTION tab. Can you collect all 45 characters? Each one has a unique profile with fun lore and stats about their personality, skills, and hobbies!",
    icon: "📚",
    color: "text-green-400",
    bgGlow: "bg-green-400/20",
    borderColor: "border-green-400/50"
  },
  {
    title: "Daily Rewards",
    description: "Claim your daily LOGIN and ASSIGNMENT rewards! Easy money for your daily grind (Resets every 12nn PHT)",
    icon: "📅",
    color: "text-blue-400",
    bgGlow: "bg-blue-400/20",
    borderColor: "border-blue-400/50"
  },
  {
    title: "Lab Duty",
    description: "Got extra characters? Send your benched roster to the Lab. They will earn passive income for you even while you are logged out!",
    icon: "💻",
    color: "text-cyan-400",
    bgGlow: "bg-cyan-400/20",
    borderColor: "border-cyan-400/50"
  },
  {
    title: "Battle & Rank",
    description: "Take your best team into battle, complete your assignments, and climb the real-time Class Standing leaderboard!",
    icon: "⚔️",
    color: "text-purple-400",
    bgGlow: "bg-purple-400/20",
    borderColor: "border-purple-400/50"
  }
];

export const WelcomeModal = ({ userId }: { userId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Check if they have seen the tour before
  useEffect(() => {
    if (!userId) return;
    
    // We tie the "seen" status to their specific account ID
    const hasSeenTour = localStorage.getItem(`has_seen_tour_${userId}`);
    if (!hasSeenTour) {
      // Small delay so it pops up smoothly after the game loads
      setTimeout(() => setIsOpen(true), 1000); 
    }
  }, [userId]);

  useEffect(() => {
    // When the event is heard, open the modal and reset to slide 1
    const handleOpen = () => {
      setCurrentSlide(0);
      setIsOpen(true);
    };

    window.addEventListener('open-welcome-modal', handleOpen);
    
    // Cleanup the listener when the component unmounts
    return () => window.removeEventListener('open-welcome-modal', handleOpen);
  }, []);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem(`has_seen_tour_${userId}`, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className={`relative max-w-md w-full bg-slate-900 border-4 ${slide.borderColor} rounded-3xl p-8 text-center shadow-2xl transition-all duration-500 transform`}>
        
        {/* Background Ambient Glow */}
        <div className={`absolute inset-0 ${slide.bgGlow} blur-3xl rounded-full pointer-events-none transition-all duration-500`} />

        {/* Skip Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-5 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors z-10"
        >
          Skip
        </button>

        {/* Icon */}
        <div className="relative z-10 mb-6 mt-4">
          <div className={`text-7xl md:text-8xl drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-bounce`}>
            {slide.icon}
          </div>
        </div>

        {/* Text Content */}
        <div className="relative z-10 min-h-35">
          <h2 className={`text-3xl font-black mb-3 uppercase tracking-tighter ${slide.color} transition-colors duration-500`}>
            {slide.title}
          </h2>
          <p className="text-slate-300 font-bold leading-relaxed text-sm md:text-base">
            {slide.description}
          </p>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 my-8 relative z-10">
          {SLIDES.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? `w-8 ${slide.bgGlow.replace('/20', '')}` : 'w-2 bg-slate-700'}`}
            />
          ))}
        </div>

        {/* Next/Start Button */}
        <button 
          onClick={handleNext}
          className={`relative z-10 w-full py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-200 transform hover:scale-[1.02] active:scale-95 transition-all shadow-lg text-lg tracking-widest uppercase`}
        >
          {currentSlide === SLIDES.length - 1 ? "Let's Go!" : "Next"}
        </button>

      </div>
    </div>
  );
};