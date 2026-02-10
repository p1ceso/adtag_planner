import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
    Plus, PieChart, Clock, Trash2, Music, Megaphone, School,
    Target, Calendar, MapPin, CalendarX, X, ChevronDown, Save,
    CheckCircle
} from 'lucide-react';

export const AgendaFeed = ({ events, refreshData }) => {
    const { user } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState('Janeiro');
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [showToast, setShowToast] = useState(false);

    // Form State
    const [newEventData, setNewEventData] = useState({
        title: '',
        date: '',
        time: '',
        scope: 'Local',
        focus: 'Adoração',
        notes: ''
    });

    const months = [
        { name: 'Janeiro', id: '01' },
        { name: 'Fevereiro', id: '02' },
        { name: 'Março', id: '03' },
        { name: 'Abril', id: '04' },
        { name: 'Maio', id: '05' },
        { name: 'Junho', id: '06' },
        { name: 'Julho', id: '07' },
        { name: 'Agosto', id: '08' },
        { name: 'Setembro', id: '09' },
        { name: 'Outubro', id: '10' },
        { name: 'Novembro', id: '11' },
        { name: 'Dezembro', id: '12' }
    ];

    // Filter events based on selected month
    const filteredEvents = useMemo(() => {
        const monthId = months.find(m => m.name === selectedMonth)?.id;
        if (!monthId || !events) return [];

        return events.filter(event => {
            const eventMonth = event.date.split('-')[1];
            return eventMonth === monthId;
        }).sort((a, b) => a.date.localeCompare(b.date));
    }, [events, selectedMonth]);

    // Calcular contagens para o menu
    const monthCounts = useMemo(() => {
        const counts = {};
        months.forEach(m => counts[m.id] = 0);

        events?.forEach(event => {
            const m = event.date.split('-')[1];
            if (counts[m] !== undefined) counts[m]++;
        });
        return counts;
    }, [events]);

    const getIconForFocus = (focus) => {
        switch (focus) {
            case 'Adoração': return 'Music';
            case 'Evangelismo': return 'Megaphone';
            case 'Educação': return 'School';
            case 'Estratégia': return 'Target';
            default: return 'Calendar';
        }
    };

    const IconDisplay = ({ iconName, color, size = 16 }) => {
        const icons = {
            'Music': Music, 'queue_music': Music,
            'Megaphone': Megaphone, 'campaign': Megaphone,
            'School': School, 'school': School,
            'Target': Target, 'chess_knight': Target,
            'Calendar': Calendar, 'event': Calendar
        };
        const Icon = icons[iconName] || Calendar;
        return <Icon size={size} color={color} />;
    };

    const handleSaveEvent = async () => {
        if (!newEventData.title || !newEventData.date) return;

        try {
            const newEvent = {
                user_id: user.id,
                ...newEventData,
                icon: getIconForFocus(newEventData.focus),
                location: newEventData.scope === 'Local' ? 'Sede Local' : newEventData.scope,
                type: newEventData.scope // mapping scope to type for consistency with other components
            };

            await supabase.from('events').insert([newEvent]);
            await refreshData();

            // Feedback
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            // Reset form
            setNewEventData({
                title: '',
                date: '',
                time: '',
                scope: 'Local',
                focus: 'Adoração',
                notes: ''
            });
        } catch (error) {
            console.error("Erro ao salvar evento", error);
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await supabase.from('events').delete().eq('id', id);
            await refreshData();
        } catch (error) {
            console.error("Erro ao excluir evento", error);
        }
    };

    const getWeekday = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
    };

    const getDay = (dateStr) => {
        return dateStr.split('-')[2];
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { x: -20, opacity: 0 },
        show: { x: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="flex-1 overflow-hidden flex flex-row h-full"
        >
            {/* Left Pane: Month Navigator */}
            <motion.div variants={item} className="hidden xl:flex w-64 flex-col border-r border-gray-200 bg-gray-50 overflow-y-auto text-left">
                <div className="p-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Linha do Tempo</h3>
                    <div className="flex flex-col gap-1">
                        {months.map(month => (
                            <button
                                key={month.name}
                                onClick={() => setSelectedMonth(month.name)}
                                className={`timeline-btn flex items-center justify-between p-3 rounded-lg transition-all group cursor-pointer relative overflow-hidden ${selectedMonth === month.name
                                    ? 'active'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {selectedMonth === month.name && (
                                    <motion.div layoutId="active-month" className="absolute inset-0 bg-[#EFF6FF] rounded-lg -z-10" />
                                )}
                                <span className={`text-sm tracking-wide transition-all z-10 ${selectedMonth === month.name ? 'font-bold text-[#2563EB]' : 'font-normal text-gray-600'}`}>{month.name}</span>
                                {monthCounts[month.id] > 0 && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full z-10 ${selectedMonth === month.name ? 'bg-blue-200 text-[#2563EB]' : 'bg-gray-200 text-gray-600'}`}>
                                        {monthCounts[month.id]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mini Stats Widget in Nav */}
                <div className="mt-auto p-4 border-t border-gray-200">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-2 text-gray-700">
                            <PieChart className="text-brand-orange" size={20} />
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Escopo Total</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Eventos</p>
                                <p className="text-xl font-black text-brand-orange">{events?.length || 0}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Hoje</p>
                                <p className="text-xl font-black text-gray-800">{new Date().getDate()}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Center Pane: Event Feed */}
            <div className="flex-1 overflow-y-auto scroll-smooth text-left no-scrollbar">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={selectedMonth}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="min-h-full"
                    >
                        <div className="flex items-center gap-4 sticky top-0 bg-white/95 backdrop-blur-md py-5 px-4 lg:px-8 z-10 border-b border-gray-200 shadow-sm transition-all">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedMonth}</h3>
                            <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 ml-4"></div>
                            <button
                                onClick={() => setIsPanelOpen(!isPanelOpen)}
                                className="lg:hidden p-2 bg-brand-orange text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
                            >
                                <Plus size={24} />
                            </button>
                        </div>

                        <div className="grid gap-4 p-4 lg:p-8 pb-20">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event, idx) => {
                                    const categoryColors = {
                                        'Adoração': '#EA580C', // Brand Orange
                                        'Evangelismo': '#16A34A', // Brand Green
                                        'Educação': '#CA8A04', // Brand Yellow
                                        'Estratégia': '#2559A6' // Brand Blue
                                    };
                                    const accentColor = categoryColors[event.focus] || '#6B7280';

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ x: 4, backgroundColor: '#F9FAFB' }}
                                            key={event.id}
                                            className="group bg-white rounded-2xl shadow-sm border border-gray-200 border-l-4 overflow-hidden flex flex-col sm:flex-row cursor-pointer hover:shadow-md transition-all"
                                            style={{ borderLeftColor: accentColor }}
                                        >
                                            <div className="w-24 bg-gray-50 flex flex-col items-center justify-center p-4 border-r border-gray-100 gap-0.5">
                                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                                                    {getWeekday(event.date)}
                                                </span>
                                                <span className="text-3xl font-black text-gray-800 shadow-sm text-shadow">
                                                    {getDay(event.date)}
                                                </span>
                                            </div>

                                            <div className="flex-1 p-5 flex flex-col justify-center relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                                        <Clock size={16} />
                                                        {event.time}
                                                    </div>

                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteEvent(event.id);
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h4 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-brand-orange transition-colors">
                                                    {event.title}
                                                </h4>

                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-2 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                                        <IconDisplay iconName={event.icon || 'Calendar'} color={accentColor} />
                                                        {event.focus}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <MapPin size={16} />
                                                        {event.location || 'Local'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="py-20 flex flex-col items-center opacity-40 gap-4 text-gray-400">
                                    <CalendarX size={60} />
                                    <p className="font-bold uppercase tracking-widest text-sm text-gray-500">Nenhum evento em {selectedMonth}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Right Pane: Quick Add Panel */}
            <motion.div
                variants={item}
                aria-label="Novo Evento"
                className={`${isPanelOpen ? 'flex' : 'hidden'} lg:flex w-[340px] xl:w-[400px] flex-col border-l border-gray-200 bg-white shadow-xl z-20 text-left sidebar-right`}
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 tracking-wide uppercase">Novo Evento</h3>
                    <button
                        onClick={() => setIsPanelOpen(false)}
                        className="text-gray-400 hover:text-gray-900 transition-all hover:rotate-90 lg:hidden"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-4 bg-white sidebar-content">
                    <div className="flex flex-col gap-1.5 group">
                        <label className="form-label text-[10px]">Título do Evento</label>
                        <input
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all h-9 text-sm"
                            placeholder="ex: Culto de Adoração"
                            type="text"
                            value={newEventData.title}
                            onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="flex flex-col gap-1.5 flex-1 group">
                            <label className="form-label text-[10px]">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2 text-gray-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                                <input
                                    type="date"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 pl-9 py-2 text-gray-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm h-9 shadow-sm transition-all"
                                    value={newEventData.date}
                                    onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 w-1/3 group">
                            <label className="form-label text-center text-[10px]">Hora</label>
                            <input
                                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-800 text-center outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm h-9 shadow-sm transition-all"
                                placeholder="00:00"
                                type="time"
                                value={newEventData.time}
                                onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="form-label text-[10px]">Abrangência</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Local', 'Sede', 'Regional'].map(scope => (
                                <label key={scope} className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="scope"
                                        className="hidden"
                                        checked={newEventData.scope === scope}
                                        onChange={() => setNewEventData({ ...newEventData, scope: scope })}
                                    />
                                    <div className={`py-2 rounded-lg text-center text-[10px] font-bold uppercase tracking-wide transition-all border ${newEventData.scope === scope
                                        ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}>
                                        {scope}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="form-label text-[10px]">Foco Ministerial</label>
                        <div className="relative group">
                            <select
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 appearance-none outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm h-9 shadow-sm transition-all cursor-pointer font-medium"
                                value={newEventData.focus}
                                onChange={(e) => setNewEventData({ ...newEventData, focus: e.target.value })}
                            >
                                <option>Adoração</option>
                                <option>Evangelismo</option>
                                <option>Comunhão</option>
                                <option>Discipulado</option>
                                <option>Serviço</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-2 text-gray-500 pointer-events-none group-hover:text-gray-700" size={18} />
                        </div>
                    </div>
                </div>
                <div className="px-4 py-5 border-t border-gray-200 bg-white flex gap-3 shrink-0 sidebar-footer">
                    <button
                        onClick={() => setIsPanelOpen(false)}
                        className="btn-secondary flex-1"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveEvent}
                        className="btn-primary flex-[2]"
                    >
                        <Save size={18} />
                        Salvar Evento
                    </button>


                    {/* Toast Notification */}
                    <AnimatePresence>
                        {showToast && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, x: '-50%' }}
                                animate={{ opacity: 1, y: 0, x: '-50%' }}
                                exit={{ opacity: 0, y: 20, x: '-50%' }}
                                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50"
                            >
                                <CheckCircle className="text-green-400" size={24} />
                                <span className="font-bold text-sm">Evento salvo com sucesso!</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};


