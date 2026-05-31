'use client'

import React from 'react'

export interface Rule {
  icon: string
  text: React.ReactNode
}

interface InstructionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  titleIcon?: string
  rules: Rule[]
  themeColor?: 'red' | 'amber' | 'cyan' | 'purple' | 'emerald';
  buttonText?: string
}

export const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
  title,
  titleIcon = '⚠️',
  rules,
  themeColor = 'amber',
  buttonText = "GOT IT, LET'S PLAY! 🚀"
}) => {
  if (!isOpen) return null

  // Pre-define Tailwind classes so they don't get purged
  const themes = {
    red: {
      border: 'border-red-500/50',
      shadow: 'shadow-red-500/20 text-red-400',
      button: 'from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-red-500/30',
    },
    amber: {
      border: 'border-amber-500/50',
      shadow: 'shadow-amber-500/20 text-amber-400',
      button: 'from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-orange-500/30',
    },
    cyan: {
      border: 'border-cyan-500/50',
      shadow: 'shadow-cyan-500/20 text-cyan-400',
      button: 'from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 shadow-cyan-500/30',
    },
    purple: {
      border: 'border-purple-500/50',
      shadow: 'shadow-purple-500/20 text-purple-400',
      button: 'from-purple-400 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-600 shadow-purple-500/30',
    },
    emerald: {
      border: 'border-emerald-500/30',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]', // emerald shadow
      button: 'bg-emerald-500 hover:bg-emerald-400 text-slate-900',
    },
  }

  const theme = themes[themeColor]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 fade-in">
      <div className={`bg-slate-900 border-2 ${theme.border} rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl ${theme.shadow} text-left relative`}>
        <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 ${theme.shadow.split(' ')[1]}`}>
          <span>{titleIcon}</span> {title}
        </h3>
        
        <ul className="space-y-5 text-slate-300 mb-8 font-medium">
          {rules.map((rule, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{rule.icon}</span>
              <div>{rule.text}</div>
            </li>
          ))}
        </ul>
        
        <button
          onClick={onClose}
          className={`w-full bg-linear-to-r ${theme.button} text-white font-black py-4 rounded-xl text-lg transform hover:scale-105 transition-all shadow-lg`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}