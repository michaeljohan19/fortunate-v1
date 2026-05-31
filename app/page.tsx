'use client'

import { useState } from 'react'
import { GameProvider } from './game-context'
import { WishScreen } from '@/components/wish-screen'
import { TaskNotification } from '@/components/task-notif' 
// 👇 1. Import your new AuthScreen component (adjust path if needed)
import AuthScreen from '@/components/auth-screen' 

// Main gacha wish page
export default function Page() {
  // 👇 2. Add state to track if the player is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{ username: string; email: string; uid: string } | null>(null);

  // 👇 3. Handle successful login, signup, or auto-login
  const handleLoginSuccess = (user: { username: string; email: string; uid: string }) => {
    setUserData(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('arcade_user_session'); // Wipe the session
    setUserData(null);
    setIsAuthenticated(false); // Sends them back to the AuthScreen!
  };

  // 👇 4. Gatekeeper: If they aren't logged in, show the Auth Screen!
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 👇 5. If they are logged in, load up the game and context!
  return (
    <GameProvider userId={userData?.uid}>
      <WishScreen currentUser={userData} onLogout={handleLogout} />
      <TaskNotification />
    </GameProvider>
  )
}