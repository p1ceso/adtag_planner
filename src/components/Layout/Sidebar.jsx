import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LayoutDashboard, CalendarDays, Calendar, Wallet, Calculator, Users, CheckSquare } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import logo from '../../assets/adtag-kids-logo.png';

export const Sidebar = ({ activeTab, setActiveTab, currentYear, setCurrentYear }) => {
    const { config } = useConfig();

    const menuItems = [
        { id: 'canvas', icon: LayoutDashboard, label: 'Dashboard', color: 'brand-blue' },
        { id: 'agenda', icon: CalendarDays, label: 'Agenda', color: 'brand-orange' },
        { id: 'calendar', icon: Calendar, label: 'Calendário', color: 'brand-yellow' },
        { id: 'budget', icon: Wallet, label: 'Caixa Geral', color: 'brand-magenta' },
        { id: 'snacks', icon: Calculator, label: 'Calculadora', color: 'brand-green' },
        { id: 'team', icon: Users, label: 'Equipes', color: 'brand-blue' },
        { id: 'tasks', icon: CheckSquare, label: 'Checklist', color: 'brand-orange' }
    ];

    const getLogoColor = (colorName) => {
        switch (colorName) {
            case 'brand-blue': return '#2559A6';
            case 'brand-orange': return '#F58634';
            case 'brand-yellow': return '#FFCC29';
            case 'brand-magenta': return '#EC2A91';
            case 'brand-green': return '#A8CF45';
            default: return '#2559A6';
        }
    };

    return (
        <aside
            className="w-72 flex-shrink-0 flex flex-col justify-between hidden md:flex h-full fixed z-30 font-inter"
            style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB', boxShadow: 'none' }}
        >
            <div className="flex flex-col">
                {/* Logo Section */}
                <div className="flex flex-col items-center justify-center pt-8 pb-4 px-6 sidebar-header">
                    <img
                        src={logo}
                        alt="ADTAG KIDS"
                        className="w-40 h-auto object-contain transition-all"
                    />
                    <input
                        type="text"
                        defaultValue="PRAÇA DO BICALHO"
                        className="bg-transparent border-none text-center text-gray-400 text-xs font-bold tracking-widest uppercase focus:ring-0 focus:outline-none placeholder-gray-300 hover:text-blue-600 transition-colors mt-2 p-0 sidebar-subtitle w-full"
                        style={{ fontFamily: 'Inter' }}
                    />
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 px-6 pb-6 pt-6">
                    {menuItems.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden ${isActive
                                    ? 'bg-blue-50 text-brand-blue shadow-sm ring-1 ring-black/5'
                                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                                    }`}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active-bar"
                                        className="absolute left-0 w-1 h-5 rounded-r-full bg-brand-blue"
                                    ></motion.div>
                                )}

                                <item.icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-110'}`}
                                />

                                <span className={`text-sm tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border-light space-y-4 bg-surface-subtle">
                <div className="flex flex-col gap-2 text-left">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Ano de Referência</label>
                    <div className="flex items-center justify-between bg-white border border-border-light rounded-xl p-1.5 shadow-sm">
                        <button onClick={() => setCurrentYear(currentYear - 1)} className="p-2 hover:bg-gray-50 rounded-lg text-text-muted hover:text-brand-blue transition-all active:scale-95"><ChevronLeft size={16} /></button>
                        <span className="font-bold text-text-primary text-sm tracking-tight">{currentYear}</span>
                        <button onClick={() => setCurrentYear(currentYear + 1)} className="p-2 hover:bg-gray-50 rounded-lg text-text-muted hover:text-brand-blue transition-all active:scale-95"><ChevronRight size={16} /></button>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:shadow-card-hover transition-all border border-border-light group shadow-card">
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 bg-cover bg-center ring-1 ring-black/5 group-hover:ring-brand-blue/20 transition-all" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/a/OdxA=s96-c')" }}></div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-green border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex flex-col overflow-hidden text-left min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate group-hover:text-brand-blue transition-colors">Pastor Miguel</p>
                        <p className="text-[10px] text-text-muted truncate font-semibold uppercase tracking-wider leading-none">Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

