import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundManager from './BackgroundManager';
import { cn } from '../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useAuth();
  const { mode, setMode, designSystem, setDesignSystem } = useTheme();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={24} /> },
    { name: 'Groups', path: '/groups', icon: <Users size={24} /> },
    { name: 'Profile', path: '/profile', icon: <UserIcon size={24} /> },
  ];

  return (
    <>
      <BackgroundManager />
      <div className="flex flex-col md:flex-row min-h-screen relative z-10">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex w-64 flex-col justify-between ui-panel m-4 p-4 sticky top-4 h-[calc(100vh-2rem)]">
          <div>
            <h1 className="text-3xl font-bold mb-8 px-4 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--success)]">
              <img src="/kitty2.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md bg-white rounded-full p-1" />
              DailySync
            </h1>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                    location.pathname === item.path
                      ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setDesignSystem(designSystem === 'glass' ? 'brutal' : 'glass')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left font-medium"
            >
              <Settings size={24} />
              <span>{designSystem === 'glass' ? 'Go Brutal' : 'Go Glass'}</span>
            </button>
            <button
              onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left font-medium"
            >
              <span className="text-xl w-6 text-center">{mode === 'dark' ? '☀️' : '🌙'}</span>
              <span>Toggle Theme</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors text-left font-medium"
            >
              <LogOut size={24} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 pb-24 md:pb-4 md:p-8 overflow-y-auto w-full max-w-4xl mx-auto overflow-x-hidden">
          {/* Mobile Header */}
          <header className="md:hidden flex justify-between items-center mb-6 px-2">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--success)]">
              <img src="/kitty2.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-md bg-white rounded-full p-1" />
              DailySync
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setDesignSystem(designSystem === 'glass' ? 'brutal' : 'glass')}
                className="p-2 rounded-xl ui-panel"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl ui-panel"
              >
                {mode === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </header>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={designSystem === 'brutal' ? { opacity: 0, x: -10 } : { opacity: 0, y: 20 }}
              animate={designSystem === 'brutal' ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
              exit={designSystem === 'brutal' ? { opacity: 0, x: 10 } : { opacity: 0, y: -20 }}
              transition={{ duration: designSystem === 'brutal' ? 0.1 : 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation for Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 ui-panel rounded-none border-x-0 border-b-0 pb-safe z-50">
          <div className="flex justify-around p-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  location.pathname === item.path
                    ? "text-[var(--accent)] bg-[var(--accent)]/20"
                    : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                {item.icon}
              </Link>
            ))}
            <button onClick={signOut} className="p-2 text-red-500 rounded-xl hover:bg-red-500/10">
              <LogOut size={24} />
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};
