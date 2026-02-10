import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { Login } from './features/Auth/Login';
import { ConfigProvider } from './context/ConfigContext';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileNav } from './components/Layout/MobileNav';
import { Header } from './components/Layout/Header';

// Features
import { Dashboard } from './features/Dashboard/Dashboard';
import { CalendarPlanner } from './features/Calendar/CalendarPlanner';
import { FinanceTracker } from './features/Finance/FinanceTracker';
import { SnackCalculator } from './features/Snacks/SnackCalculator';
import { TeamManager } from './features/Team/TeamManager';
import { TaskBoard } from './features/Tasks/TaskBoard';
import { AgendaFeed } from './features/Agenda/AgendaFeed';


function App() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('canvas');
    const [currentYear, setCurrentYear] = useState(2026);

    // Global States (Synced with Supabase)
    const [events, setEvents] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [team, setTeam] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [snacks, setSnacks] = useState([]);

    // Data Fetching
    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            const { data: teamData, error: teamError } = await supabase
                .from('team_members')
                .select('*')
                .order('created_at', { ascending: false });

            if (teamError) console.error('Error fetching team:', teamError);
            if (teamData) setTeam(teamData);

            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });

            if (eventsError) console.error('Error fetching events:', eventsError);
            if (eventsData) setEvents(eventsData);

            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (tasksError) console.error('Error fetching tasks:', tasksError);
            if (tasksData) setTasks(tasksData);

            const { data: financeData, error: financeError } = await supabase
                .from('finance_transactions')
                .select('*')
                .order('date', { ascending: false });

            if (financeError) console.error('Error fetching finance:', financeError);
            if (financeData) setTransactions(financeData);

            const { data: snacksData, error: snacksError } = await supabase
                .from('snacks')
                .select('*')
                .order('created_at', { ascending: false });

            if (snacksError) console.error('Error fetching snacks:', snacksError);
            if (snacksData) setSnacks(snacksData);

        } catch (err) {
            console.error('Unexpected error fetching data:', err);
        }

    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Legacy Notifications (Local for now)
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Lembrete de Evento: Culto Infantil amanhã',
            desc: 'Prepare os materiais e o currículo do próximo culto.',
            time: '2h atrás',
            icon: 'event_available',
            params: { textClass: 'text-blue-500', bgClass: 'bg-blue-500/20' },
            read: false
        },
    ]);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    // Render current feature
    const renderContent = () => {
        switch (activeTab) {
            case 'canvas': return <Dashboard team={team} tasks={tasks} refreshData={fetchData} events={events} />;
            case 'agenda': return <AgendaFeed events={events} refreshData={fetchData} />;
            case 'calendar': return <CalendarPlanner currentYear={currentYear} events={events} refreshData={fetchData} />;
            case 'budget': return <FinanceTracker currentYear={currentYear} transactions={transactions} refreshData={fetchData} />;
            case 'snacks': return <SnackCalculator events={events} snacks={snacks} refreshData={fetchData} currentYear={currentYear} />;
            case 'team': return <TeamManager team={team} refreshData={fetchData} events={events} />;

            case 'tasks': return <TaskBoard tasks={tasks} refreshData={fetchData} />;
            default: return <Dashboard team={team} tasks={tasks} refreshData={fetchData} events={events} />;
        }
    };

    if (authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <ConfigProvider>
            <div className="flex bg-gradient-mesh min-h-screen w-full overflow-hidden selection:bg-brand-blue/20 selection:text-brand-blue">
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    currentYear={currentYear}
                    setCurrentYear={setCurrentYear}
                />

                <main className="flex-1 flex flex-col h-screen overflow-hidden md:ml-72 relative">
                    <Header
                        notifications={notifications}
                        markAsRead={markAsRead}
                        markAllAsRead={markAllAsRead}
                    />
                    <div className={`flex-1 ${activeTab === 'agenda' ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 scroll-smooth'}`}>
                        <div className={activeTab === 'agenda' ? "h-full w-full" : "max-w-7xl mx-auto"}>
                            {renderContent()}
                        </div>
                    </div>
                    <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
                </main>
            </div>
        </ConfigProvider>
    );
}

export default App;

