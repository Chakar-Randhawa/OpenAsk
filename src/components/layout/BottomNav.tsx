import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';

export const BottomNav: React.FC = () => {
  const { currentUser, userProfile } = useAuth();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5 flex items-center justify-around"
      style={{ maxHeight: '60px' }}
      aria-label="Mobile Navigation"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
            isActive
              ? 'text-neutral-950 dark:text-white font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`
        }
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/discover"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
            isActive
              ? 'text-neutral-950 dark:text-white font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`
        }
      >
        <Compass className="w-5 h-5 mb-0.5" />
        <span>Discover</span>
      </NavLink>

      <NavLink
        to="/ask"
        className="flex flex-col items-center py-1 px-3 text-[10px] font-semibold text-neutral-900 dark:text-white"
        aria-label="Ask a question"
      >
        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center -mt-3 shadow-md">
          <PlusCircle className="w-5 h-5" />
        </div>
        <span className="mt-0.5">Ask</span>
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors relative ${
            isActive
              ? 'text-neutral-950 dark:text-white font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`
        }
      >
        <Bell className="w-5 h-5 mb-0.5" />
        <span>Inbox</span>
      </NavLink>

      <NavLink
        to={currentUser ? `/user/${userProfile?.username || currentUser.uid}` : '/login'}
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
            isActive
              ? 'text-neutral-950 dark:text-white font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`
        }
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>{currentUser ? 'Profile' : 'Sign In'}</span>
      </NavLink>
    </nav>
  );
};
