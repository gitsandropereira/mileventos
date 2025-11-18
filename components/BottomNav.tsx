
import React from 'react';
import { HomeIcon, BriefcaseIcon, CalendarIcon, UsersIcon, BanknotesIcon } from './icons';

type View = 'dashboard' | 'proposals' | 'agenda' | 'clients' | 'finance' | 'settings';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  const activeClass = 'text-indigo-400';
  const inactiveClass = 'text-gray-400 hover:text-indigo-300';
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}>
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: <HomeIcon className="w-6 h-6" /> },
    { id: 'proposals', label: 'Propostas', icon: <BriefcaseIcon className="w-6 h-6" /> },
    { id: 'agenda', label: 'Agenda', icon: <CalendarIcon className="w-6 h-6" /> },
    { id: 'clients', label: 'Contatos', icon: <UsersIcon className="w-6 h-6" /> },
    { id: 'finance', label: 'Financeiro', icon: <BanknotesIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-800 border-t border-gray-700 shadow-lg md:hidden z-40">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={currentView === item.id}
            onClick={() => setCurrentView(item.id as View)}
          />
        ))}
      </div>
    </div>
  );
};

export default BottomNav;