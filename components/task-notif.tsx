'use client'

import React, { useEffect, useState } from 'react'
import { useGame } from '@/app/game-context' // Adjust path if needed!

export const TaskNotification: React.FC = () => {
  const { gameState } = useGame()
  const [visible, setVisible] = useState(false)
  const [currentNotif, setCurrentNotif] = useState<{ icon: string, title: string, desc: string } | null>(null)

  useEffect(() => {
    // If a new notification drops into the global context...
    if (gameState.taskNotification) {
      setCurrentNotif(gameState.taskNotification)
      setVisible(true)

      // Automatically hide it after 3.5 seconds
      const timer = setTimeout(() => {
        setVisible(false)
      }, 3500)

      return () => clearTimeout(timer)
    }
  }, [gameState.taskNotification])

  if (!currentNotif) return null

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
        visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] max-w-sm flex items-start gap-4 relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Icon */}
        <div className="bg-slate-800 border border-slate-700 w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
          {currentNotif.icon}
        </div>

        {/* Text Body */}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5 animate-pulse">
            Assignment Completed
          </p>
          <h4 className="text-white font-black text-lg truncate leading-tight mb-1">
            {currentNotif.title}
          </h4>
          <p className="text-slate-400 text-xs leading-snug mb-2">
            {currentNotif.desc}
          </p>
          
          {/* Action Prompt (Passive) */}
          <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1">
            <p className="text-[10px] font-bold text-emerald-300">
              Head to Assignments tab to claim reward 🪙
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}