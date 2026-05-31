'use client'

interface GamesListProps {
  onPlayGame: (gameId: string) => void
}

const games = [
  { id: 'classmate-combat', icon: '⚔️', name: 'Classmate Combat', description: 'Turn-based battle against classmates', reward: '+40-80 coins' },
  { id: 'lab-duty', icon: '🔬', name: 'Lab Duty', description: 'Expedition through the lab', reward: '+50-100 coins' },
  { id: 'class-trivia', icon: '🧠', name: 'Class Trivia', description: 'Answer questions, earn coins', reward: '+30-50 coins' },
  { id: 'clicker', icon: '☕', name: 'Cafe Clicker', description: 'Click click click! Faster = more coins', reward: '+20-100 coins' },
  { id: 'syntax', icon: '🔴', name: 'Syntax Spotter', description: 'Find the error in code', reward: '+25 coins' },
  { id: 'crop-sorter', icon: '🌱', name: 'Agrivision Rush', description: 'Swipe to sort diseased crops', reward: '+15-40 coins' },
  { id: 'runner', icon: '🏃', name: 'Coffee Run', description: 'Endless runner delivery game', reward: '+5-60 coins' },
  { id: 'bug-shot', icon: '🐛', name: 'Bug Shot', description: 'Defend against incoming bugs', reward: '+20-35 coins' },
  { id: 'memory', icon: '🎮', name: 'Memory Match', description: 'Match pairs and remember', reward: '+25-45 coins' },
  { id: 'syntax-sprint', icon: '⌨️', name: 'Syntax Sprint', description: 'Type code snippets quickly', reward: '+30-60 coins' },
  { id: 'wordle', icon: '🎯', name: 'Tech Wordle', description: 'Guess the CS term in 6 tries', reward: '+40 coins' },
]

export const GachaGamesList: React.FC<GamesListProps> = ({ onPlayGame }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onPlayGame(game.id)}
          className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl border-2 md:border-4 border-purple-200 hover:border-purple-400 transform transition-all hover:scale-105 text-left"
        >
          <div className="text-3xl md:text-4xl mb-2">{game.icon}</div>
          <h3 className="font-black text-sm md:text-lg text-gray-800 mb-1">{game.name}</h3>
          <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">{game.description}</p>
          <div className="bg-linear-to-r from-amber-100 to-yellow-100 rounded-lg px-2 md:px-3 py-1 inline-block">
            <p className="text-xs font-bold text-amber-700">{game.reward}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
