import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Menu, Search, Bell, CheckCircle, BellOff, Clock,
    CheckCheck, Settings, User, Sliders, Shield, LogOut
} from 'lucide-react';

export const Header = ({ notifications, markAsRead, markAllAsRead }) => {
    const { signOut } = useAuth();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Erro ao sair. Tente novamente.');
        }
    };

    // Fechar dropdowns ao clicar fora
    const notifRef = useRef(null);
    const settingsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-8 w-full transition-all">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-24 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 bg-gray-900 text-white">
                    <CheckCircle className="text-brand-green" size={20} />
                    <span className="font-bold text-sm text-surface-white">{notification}</span>
                </div>
            )}

            <div className="flex items-center gap-4 text-text-primary md:hidden">
                <button className="text-text-secondary hover:text-text-primary transition-colors">
                    <Menu size={24} />
                </button>
                <h2 className="text-lg font-bold">ADTAG Planner</h2>
            </div>

            <div className="hidden md:block">
                <h2 className="text-xl font-bold text-text-primary tracking-tight">Painel Estratégico</h2>
                <p className="text-sm text-text-secondary">Bem-vindo de volta, crie uma nova visão hoje.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        className="h-10 w-64 rounded-full pl-10 pr-4 text-sm bg-surface-subtle border border-border-light text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/50 placeholder:text-text-muted transition-all font-medium"
                        placeholder="Buscar estratégias..."
                        type="text"
                    />
                </div>

                {/* Notificações */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-all relative ${isNotificationsOpen ? 'bg-surface-subtle text-brand-blue ring-2 ring-brand-blue/10' : ''}`}
                    >
                        <Bell size={20} />
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-orange rounded-full border border-surface-white"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Notificações</h3>
                                {notifications.filter(n => !n.read).length > 0 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue text-[10px] font-bold uppercase">{notifications.filter(n => !n.read).length} novas</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase">Todas lidas</span>
                                )}
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-text-muted">
                                        <BellOff className="mx-auto mb-2 opacity-50" size={32} />
                                        <p className="text-sm">Nenhuma notificação</p>
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 ${notification.read ? 'opacity-60 bg-white' : 'bg-blue-50/30'}`}
                                        >
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-surface-subtle text-text-secondary`}>
                                                {/* Assuming notification.icon is string name, might need mapping or generic icon */}
                                                <Bell size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-medium truncate ${notification.read ? 'text-text-muted' : 'text-text-primary'}`}>{notification.title}</h4>
                                                <p className="text-xs text-text-secondary mt-0.5">{notification.desc}</p>
                                                <p className="text-[10px] text-text-muted mt-2 flex items-center gap-1">
                                                    <Clock size={12} /> {notification.time}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="flex-shrink-0 self-center">
                                                    <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={markAllAsRead}
                                    className="w-full py-2.5 rounded-xl bg-surface-white border border-border-light hover:bg-surface-subtle hover:border-gray-300 text-text-secondary text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <CheckCheck size={16} />
                                    Marcar todas como lidas
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Configurações */}
                <div className="relative" ref={settingsRef}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-all ${isSettingsOpen ? 'bg-surface-subtle text-brand-blue ring-2 ring-brand-blue/10' : ''}`}
                    >
                        <Settings size={20} />
                    </button>

                    {isSettingsOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-surface-white border border-border-light rounded-2xl shadow-modal overflow-hidden z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                            <span
                                onClick={() => { setIsSettingsOpen(false); showNotification('Perfil do Usuário em desenvolvimento'); }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-subtle text-text-primary transition-colors group cursor-pointer"
                            >
                                <User className="text-text-muted group-hover:text-brand-orange transition-colors" size={18} />
                                <span className="text-sm font-medium">Perfil do Usuário</span>
                            </span>
                            <span
                                onClick={() => { setIsSettingsOpen(false); showNotification('Preferências do Sistema em desenvolvimento'); }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-subtle text-text-primary transition-colors group cursor-pointer"
                            >
                                <Sliders className="text-text-muted group-hover:text-brand-orange transition-colors" size={18} />
                                <span className="text-sm font-medium">Preferências do Sistema</span>
                            </span>
                            <span
                                onClick={() => { setIsSettingsOpen(false); showNotification('Gerenciar Permissões em desenvolvimento'); }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-subtle text-text-primary transition-colors group cursor-pointer"
                            >
                                <Shield className="text-text-muted group-hover:text-brand-orange transition-colors" size={18} />
                                <span className="text-sm font-medium">Gerenciar Permissões</span>
                            </span>
                            <div className="h-px bg-border-light my-1"></div>
                            <span
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-brand-red transition-colors group cursor-pointer"
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-semibold">Sair</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

