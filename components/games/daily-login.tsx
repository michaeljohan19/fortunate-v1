'use client'

import React, { useState } from 'react'
import { useGame } from '@/app/game-context'

interface DailyLoginProps {
  onComplete: (coins: number) => void
}

export const DailyLogin: React.FC<DailyLoginProps> = ({ onComplete }) => {
  const { gameState, checkDailyLogin, completeAssignment } = useGame()
  const [loggedIn, setLoggedIn] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)

  const handleDailyLogin = () => {
    const success = checkDailyLogin()
    if (success) {
      setLoggedIn(true)
    } else {
      alert('Already logged in today!')
    }
  }

  if (selectedAssignment) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-black mb-4">Assignment Complete! ✅</h2>
        <p className="text-2xl mb-4">+100 coins earned!</p>
        <button
          onClick={() => {
            completeAssignment(selectedAssignment)
            onComplete(100)
          }}
          className="bg-green-500 hover:bg-green-600 text-white font-black px-6 py-3 rounded-xl"
        >
          AWESOME! 🎊
        </button>
      </div>
    )
  }

  if (loggedIn) {
    const incomplete = gameState.assignments.filter(a => !a.completed)
    return (
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-black mb-4">Daily Login Bonus! 📅</h2>
        <p className="text-2xl font-bold mb-2">+50 coins awarded!</p>
        <p className="text-lg text-gray-600 mb-6">Streak: {gameState.dailyLoginStreak} days 🔥</p>

        <div className="mb-6">
          <h3 className="text-2xl font-black mb-4">Your Assignments</h3>
          <div className="space-y-2">
            {gameState.assignments.map(assignment => (
              <div
                key={assignment.id}
                className={`p-4 rounded-xl border-4 text-left ${
                  assignment.completed
                    ? 'bg-green-100 border-green-400 opacity-50'
                    : 'bg-white border-purple-300 hover:border-purple-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-bold">{assignment.name}</p>
                  {!assignment.completed && (
                    <button
                      onClick={() => setSelectedAssignment(assignment.id)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1 rounded-lg font-bold text-sm"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onComplete(50)}
          className="bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-black px-8 py-4 rounded-xl text-lg"
        >
          BACK TO HUB 🏠
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h2 className="text-3xl font-black mb-4">Daily Login Bonus! 📅</h2>
      <div className="text-6xl mb-4">🎁</div>
      <p className="text-lg mb-6 text-gray-700">Come back every day to get bonus coins!</p>
      <button
        onClick={handleDailyLogin}
        className="bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-black px-8 py-4 rounded-2xl text-2xl"
      >
        CLAIM BONUS! 🎊
      </button>
    </div>
  )
}
