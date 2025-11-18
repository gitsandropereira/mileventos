
import React, { useState, useMemo, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Proposals from './components/Proposals';
import Agenda from './components/Agenda';
import Clients from './components/Clients';
import Finance from './components/Finance';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import EventDetail from './components/EventDetail';
import Auth from './components/Auth';
import { useMockData } from './hooks/useMockData';
import { authService } from './services/authService';
import { CogIcon, BellIcon, EyeIcon, EyeSlashIcon } from './components/icons';
import { Proposal, Client, Event, ProposalStatus, User } from './types';

type View = 'dashboard' | 'proposals' | 'agenda' | 'clients' | 'finance' | 'settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for Magic Proposal
  const [draftProposal, setDraftProposal] = useState<Partial<Proposal> | undefined>(undefined);

  // Check for active session on mount
  useEffect(() => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
          setUser(currentUser);
      }
      setLoading(false);
  }, []);

  const { 
    proposals, 
    kpis, 
    events, 
    clients, 
    businessProfile,
    transactions,
    notifications,
    historicalRevenue,
    suppliers,
    setProposals, 
    setClients,
    setBusinessProfile,
    updateTransactionStatus,
    markNotificationRead,
    toggleEventTask,
    updateMonthlyGoal,
    addEventCost,
    deleteEventCost,
    addSupplier,
    deleteSupplier
  } = useMockData(user?.id); // Pass userId to hook

  // Calculate all scheduled commitments (Operational Events + Closed Proposals)
  const allScheduledEvents = useMemo(() => {
      const closedProposalsAsEvents: Event[] = proposals
          .filter(p => p.status === ProposalStatus.Closed)
          .map(p => {
              const [year, month, day] = p.date.split('-').map(Number);
              return {
                  id: `prop-${p.id}`,
                  title: `(Contrato) ${p.eventName}`,
                  date: new Date(year, month - 1, day),
                  type: 'Outros',
                  clientName: p.clientName,
                  amount: p.amount,
                  startTime: '00:00',
                  endTime: '23:59'
              } as Event;
          });
      
      return [...events, ...closedProposalsAsEvents];
  }, [events, proposals]);

  const addProposal = (newProposal: Proposal) => {
    setProposals(prev => [newProposal, ...prev]);
  };

  const updateProposal = (updatedProposal: Proposal) => {
    setProposals(prev => prev.map(p => p.id === updatedProposal.id ? updatedProposal : p));
  };

  const addClient = (newClientData: Omit<Client, 'id' | 'proposals' | 'events'>) => {
    const newClient: Client = {
      ...newClientData,
      id: `c${clients.length + 1}`,
      proposals: 0,
      events: 0,
    };
    setClients(prev => [newClient, ...prev]);
  };

  const handleEventClick = (event: Event) => {
      setSelectedEvent(event);
  };

  const handleTaskToggle = (taskId: string) => {
      if (selectedEvent) {
          toggleEventTask(selectedEvent.id, taskId);
          // Optimistic UI update for the modal
          if (selectedEvent.checklist) {
            setSelectedEvent({
                ...selectedEvent,
                checklist: selectedEvent.checklist.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
            });
          }
      }
  };

  const handleAddCost = (eventId: string, cost: any) => {
      addEventCost(eventId, cost);
      // Optimistic update
      if (selectedEvent && selectedEvent.id === eventId) {
          const newCost = { ...cost, id: `temp-${Date.now()}` };
          setSelectedEvent({
              ...selectedEvent,
              costs: [...(selectedEvent.costs || []), newCost]
          });
      }
  };

  const handleDeleteCost = (eventId: string, costId: string) => {
      deleteEventCost(eventId, costId);
      if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent({
              ...selectedEvent,
              costs: selectedEvent.costs?.filter(c => c.id !== costId)
          });
      }
  };

  const handleMagicCreate = (data: any) => {
      setDraftProposal(data);
      setCurrentView('proposals');
  };
  
  const handleLogout = () => {
      authService.logout();
      setUser(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard kpis={kpis} events={events} onEventClick={handleEventClick} onMagicCreate={handleMagicCreate} privacyMode={privacyMode} />;
      case 'proposals':
        return <Proposals 
                  initialProposals={proposals} 
                  onAddProposal={addProposal} 
                  onUpdateProposal={updateProposal}
                  businessProfile={businessProfile}
                  draftProposal={draftProposal}
                  onClearDraft={() => setDraftProposal(undefined)}
                  existingEvents={allScheduledEvents}
                  privacyMode={privacyMode}
                />;
      case 'agenda':
        return <Agenda events={allScheduledEvents} onEventClick={handleEventClick} />;
      case 'clients':
        return <Clients 
                  clients={clients} 
                  onAddClient={addClient} 
                  suppliers={suppliers}
                  onAddSupplier={addSupplier}
                  onDeleteSupplier={deleteSupplier}
                />;
      case 'finance':
        return <Finance 
                  transactions={transactions} 
                  onUpdateStatus={updateTransactionStatus} 
                  historicalData={historicalRevenue}
                  businessProfile={businessProfile}
                  onUpdateGoal={updateMonthlyGoal}
                  privacyMode={privacyMode}
                />;
      case 'settings':
         return <Settings profile={businessProfile} onSave={setBusinessProfile} onLogout={handleLogout} />;
      default:
        return <Dashboard kpis={kpis} events={events} onEventClick={handleEventClick} onMagicCreate={handleMagicCreate} privacyMode={privacyMode} />;
    }
  };

  const getTitle = () => {
      switch(currentView) {
          case 'dashboard': return `Olá, ${businessProfile.name ? businessProfile.name.split(' ')[0] : 'Profissional'}!`;
          case 'settings': return 'Configurações';
          default: return 'Painel de Controle';
      }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
      return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!user) {
      return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans antialiased">
      <main className="pb-20">
        <div className="p-4 sm:p-6">
          <header className="mb-6 flex justify-between items-center relative">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Mil Eventos</h1>
                <p className="text-indigo-400 text-sm">
                    {getTitle()}
                </p>
            </div>
            <div className="flex items-center space-x-3">
                {/* Privacy Toggle */}
                <button 
                    onClick={() => setPrivacyMode(!privacyMode)}
                    className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                    {privacyMode ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                        <BellIcon className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-gray-800 transform translate-x-1/4 -translate-y-1/4"></span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                            <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                                <span className="font-bold text-sm text-white">Notificações</span>
                                <span className="text-xs text-gray-500">{unreadCount} novas</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => markNotificationRead(n.id)}
                                        className={`p-3 border-b border-gray-700 last:border-0 cursor-pointer hover:bg-gray-700 transition-colors ${n.read ? 'opacity-60' : 'bg-indigo-500/5'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm font-semibold ${n.type === 'success' ? 'text-green-400' : n.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-gray-500">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-300">{n.message}</p>
                                    </div>
                                ))}
                                {notifications.length === 0 && (
                                    <div className="p-4 text-center text-xs text-gray-500">Nenhuma notificação.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setCurrentView('settings')}
                    className={`p-2 rounded-full transition-colors ${currentView === 'settings' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    <CogIcon className="w-6 h-6" />
                </button>
                {businessProfile.logoUrl && (
                    <img src={businessProfile.logoUrl} alt="Logo" className="h-10 w-10 rounded-full object-cover border-2 border-indigo-500" />
                )}
            </div>
          </header>
          
          {/* Click outside to close notifications overlay (simplified) */}
          {isNotificationsOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
          )}

          {renderView()}

          {selectedEvent && (
              <EventDetail 
                event={selectedEvent} 
                onClose={() => setSelectedEvent(null)} 
                onToggleTask={handleTaskToggle}
                onAddCost={handleAddCost}
                onDeleteCost={handleDeleteCost}
                privacyMode={privacyMode}
                suppliers={suppliers}
              />
          )}
        </div>
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default App;
