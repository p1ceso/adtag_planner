import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon, Plus, ArrowRight, ChevronDown, Building2,
    MapPin, CalendarDays, Download, Settings2, Filter, X, Check, Save,
    Settings, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export const CalendarPlanner = ({ currentYear, events, refreshData }) => {
    const { user } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [locationFilter, setLocationFilter] = useState('all'); // 'all', 'Sede', 'Local'
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [notification, setNotification] = useState(null);

    const [selectedEvent, setSelectedEvent] = useState(null);

    // Legacy localStorage loading removed. Data comes from props.

    const getMonthId = (monthName) => {
        const map = {
            'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04',
            'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
            'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
        };
        return map[monthName];
    };

    // Form state for new event
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        time: '',
        type: 'Sede',
        focus: 'ebd',
        description: '',
        recurring: false
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleExportPDF = () => {
        // Create printable content
        const printContent = `
            ADTAG Planner - Calendário Anual ${currentYear}
            ==========================================
            
            Eventos:
            ${events.map(e => `- ${e.date}: ${e.title} (${e.type})`).join('\n')}
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Calendário ADTAG ${currentYear}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { color: #1E4BA1; }
                        .event { padding: 10px; margin: 10px 0; background: #f5f5f5; border-radius: 8px; }
                        .sede { border-left: 4px solid #1E4BA1; }
                        .local { border-left: 4px solid #10B981; }
                    </style>
                </head>
                <body>
                    <h1>ADTAG Planner - Calendário Anual ${currentYear}</h1>
                    <hr/>
                    ${events.map(e => `
                        <div class="event ${e.type?.toLowerCase() || 'sede'}">
                            <strong>${e.title}</strong><br/>
                            <small>${e.date} às ${e.time || '00:00'} - ${e.type || 'Sede'}</small>
                        </div>
                    `).join('')}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        showNotification('PDF exportado com sucesso!');
    };

    const handleSaveEvent = async () => {
        if (!newEvent.title || !newEvent.date) {
            showNotification('Preencha o título e a data do evento', 'error');
            return;
        }

        try {
            const event = {
                user_id: user.id,
                title: newEvent.title,
                date: newEvent.date,
                time: newEvent.time || '09:00',
                type: newEvent.type,
                focus: newEvent.focus,
                description: newEvent.description
            };

            await supabase.from('events').insert([event]);
            await refreshData();

            setShowAddModal(false);
            setNewEvent({
                title: '',
                date: '',
                time: '',
                type: 'Sede',
                focus: 'ebd',
                description: '',
                recurring: false
            });
            showNotification('Evento criado com sucesso!');
        } catch (error) {
            console.error(error);
            showNotification('Erro ao criar evento', 'error');
        }
    };

    const rawMonths = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const processedMonths = rawMonths.map(name => {
        const id = getMonthId(name);
        const monthEvents = events.filter(e => e.date.split('-')[1] === id);
        return {
            name,
            id,
            count: monthEvents.length,
            active: monthEvents.length > 0,
            events: monthEvents.sort((a, b) => a.date.localeCompare(b.date))
        };
    });

    const filteredMonths = processedMonths.filter(month => {
        if (selectedMonth !== 'all' && month.name !== selectedMonth) return false;
        return true;
    });

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { scale: 0.9, opacity: 0 },
        show: { scale: 1, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="flex flex-col gap-8 pb-20"
        >
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{notification.message}</span>
                </div>
            )}

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-left">
                <span className="text-[#6B7280] font-medium">Home</span>
                <span className="text-[#6B7280]/50">/</span>
                <span className="text-[#6B7280] font-semibold tracking-wide">Calendário de Eventos</span>
            </nav>

            {/* Page Heading */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black text-[#111827] tracking-tight">Ciclo Anual {currentYear}</h1>
                    <p className="text-[#4B5563] font-medium">Gestão Ministerial Integrada - ADTAG Sede e Regionais</p>
                </div>
                {/* Action buttons moved to filter bar */}
            </motion.div>

            {/* Filters & Toolbar */}
            <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-[12px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E7EB] text-left">
                <div className="flex flex-wrap gap-2 relative">
                    <div className="relative">
                        <button
                            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                            className="flex items-center gap-3 px-5 py-2.5 bg-[#F3F4F6] text-[#1F2937] border border-[#D1D5DB] rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all hover:bg-gray-200"
                        >
                            <span>{selectedMonth === 'all' ? 'Todos os Meses' : selectedMonth}</span>
                            <ChevronDown className={`transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} size={18} />
                        </button>
                        {showMonthDropdown && (
                            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[200px] py-2 max-h-64 overflow-y-auto">
                                <button
                                    onClick={() => { setSelectedMonth('all'); setShowMonthDropdown(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedMonth === 'all' ? 'text-brand-orange font-bold' : 'text-[#1F2937]'}`}
                                >
                                    Todos os Meses
                                </button>
                                {processedMonths.map(month => (
                                    <button
                                        key={month.name}
                                        onClick={() => { setSelectedMonth(month.name); setShowMonthDropdown(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedMonth === month.name ? 'text-brand-orange font-bold' : 'text-[#1F2937]'}`}
                                    >
                                        {month.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setLocationFilter(locationFilter === 'Sede' ? 'all' : 'Sede')}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border ${locationFilter === 'Sede' ? 'bg-brand-orange/20 text-brand-orange border-brand-orange/30' : 'bg-[#F3F4F6] text-[#1F2937] border-[#D1D5DB] hover:bg-gray-200'}`}
                    >
                        <Building2 className="text-brand-orange" size={18} />
                        Sede
                    </button>
                    <button
                        onClick={() => setLocationFilter(locationFilter === 'Local' ? 'all' : 'Local')}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border ${locationFilter === 'Local' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#F3F4F6] text-[#1F2937] border-[#D1D5DB] hover:bg-gray-200'}`}
                    >
                        <MapPin className="text-emerald-500" size={18} />
                        Local
                    </button>
                </div>
                <div className="flex items-center gap-4 pr-2">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <CalendarDays className="text-brand-orange" size={24} />
                        <span className="uppercase tracking-widest text-[10px]">Exibição: Anual</span>
                    </div>

                    <div className="h-6 w-px bg-gray-200"></div>

                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-700 transition-all shadow-sm active:scale-95 text-white"
                        title="Exportar PDF"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-700 transition-all shadow-sm active:scale-95 text-white"
                        title="Ajustes"
                    >
                        <Settings2 size={18} />
                        <span className="hidden sm:inline">Ajustes</span>
                    </button>

                    <div className="h-6 w-px bg-gray-200"></div>

                    <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`p-2 transition-all active:scale-95 hover:rotate-180 duration-500 ${showFilterMenu ? 'text-brand-orange' : 'text-slate-400 hover:text-brand-orange'}`}
                    >
                        <Filter size={24} />
                    </button>
                </div>
            </motion.div>

            {/* Annual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                {filteredMonths.map((month, idx) => (
                    <motion.div
                        key={month.name}
                        variants={item}
                        whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        className={`group relative bg-white rounded-2xl p-6 border transition-all cursor-pointer shadow-sm ${month.active ? 'border-brand-orange/30 shadow-brand-orange/5' : 'border-slate-200'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h3 className={`text-2xl font-bold tracking-tight ${month.active ? 'text-slate-900' : 'text-slate-400'}`}>{month.name}</h3>
                            {month.active && (
                                <span className="bg-brand-orange/10 text-brand-orange text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-brand-orange/20">{month.count} Eventos</span>
                            )}
                        </div>

                        {month.active ? (
                            <div className="space-y-4">
                                {month.events.slice(0, 3).map((event) => (
                                    <div key={event.id} className="flex items-center gap-3 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                        <span className={`size-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] ${event.type === 'Sede' ? 'bg-brand-blue shadow-brand-blue/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}></span>
                                        <span className="truncate font-medium">{event.date.split('-')[2]}/{event.date.split('-')[1]} - {event.title}</span>
                                    </div>
                                ))}
                                {month.events.length > 3 && (
                                    <p className="text-xs text-slate-400 font-medium pl-5">
                                        + {month.events.length - 3} outros eventos
                                    </p>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); if (month.events[0]) setSelectedEvent(month.events[0]); }}
                                    className="mt-6 pt-4 w-full border-t border-slate-100 text-brand-orange text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all hover:underline"
                                >
                                    Ver Detalhes <ArrowRight size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="h-32 flex flex-col items-center justify-center text-center p-2 rounded-xl bg-slate-50 border border-slate-100 border-dashed">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-2 shadow-sm">
                                    <CalendarIcon size={16} className="text-slate-400" />
                                </div>
                                <p className="text-xs text-slate-500 font-medium mb-2">Nenhum evento planejado</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}
                                    className="text-[10px] font-bold text-brand-orange hover:text-orange-700 hover:underline uppercase tracking-wide flex items-center gap-1"
                                >
                                    <Plus size={12} /> Agendar
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Floating Action Button */}
            <motion.button
                onClick={() => setShowAddModal(true)}
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-10 right-10 flex items-center gap-3 bg-primary text-white p-5 rounded-3xl shadow-2xl shadow-brand-orange/40 hover:bg-orange-600 transition-all group z-40 active:scale-95 no-padding"
            >
                <Plus size={28} strokeWidth={3} />
                <span className="hidden group-hover:block font-black uppercase tracking-widest text-xs pr-2">Novo Evento</span>
            </motion.button>

            {/* Add Event Modal (Right Sidebar) */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[60] flex justify-end items-stretch p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="sidebar-right w-full max-w-[500px] flex flex-col h-full max-h-screen bg-white shadow-2xl relative overflow-hidden z-10 rounded-l-[32px]"
                            aria-label="Novo Evento"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6 bg-white shrink-0">
                                <div className="flex flex-col gap-1 text-left">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Novo Evento</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adicionar ao Calendário</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Form - Scroll Area */}
                            <div className="sidebar-content flex-1 flex flex-col gap-8 px-8 py-8 overflow-y-auto text-left custom-scrollbar">
                                <label className="flex flex-col gap-3">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Título do Evento</span>
                                    <input
                                        className="w-full rounded-xl border-2 border-[#E5E5E5] bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F97316] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all"
                                        placeholder="Ex: Culto de Missões Infantil"
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    />
                                </label>

                                <div className="flex flex-col sm:flex-row gap-6">
                                    <label className="flex flex-1 flex-col gap-3">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Data</span>
                                        <input
                                            className="w-full rounded-xl border-2 border-[#E5E5E5] bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-[#F97316] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all"
                                            type="date"
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        />
                                    </label>
                                    <label className="flex flex-1 flex-col gap-3">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Hora</span>
                                        <input
                                            className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-brand-orange focus:bg-white focus:outline-none transition-all"
                                            type="time"
                                            value={newEvent.time}
                                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                        />
                                    </label>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Tipo de Evento</span>
                                    <div className="flex w-full rounded-xl bg-gray-50 p-1.5 ring-1 ring-[#E5E5E5]">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                checked={newEvent.type === 'Sede'}
                                                onChange={() => setNewEvent({ ...newEvent, type: 'Sede' })}
                                                className="peer sr-only"
                                                name="location"
                                                type="radio"
                                                value="Sede"
                                            />
                                            <div className="flex h-10 items-center justify-center rounded-lg text-xs font-bold uppercase tracking-widest text-gray-400 transition-all peer-checked:bg-white peer-checked:text-[#F97316] peer-checked:shadow-sm">Sede</div>
                                        </label>
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                checked={newEvent.type === 'Local'}
                                                onChange={() => setNewEvent({ ...newEvent, type: 'Local' })}
                                                className="peer sr-only"
                                                name="location"
                                                type="radio"
                                                value="Local"
                                            />
                                            <div className="flex h-10 items-center justify-center rounded-lg text-xs font-bold uppercase tracking-widest text-gray-400 transition-all peer-checked:bg-white peer-checked:text-emerald-500 peer-checked:shadow-sm">Local</div>
                                        </label>
                                    </div>
                                </div>

                                <label className="flex flex-col gap-3">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Foco / Categoria</span>
                                    <div className="relative group">
                                        <select
                                            className="w-full appearance-none rounded-xl border-2 border-[#E5E5E5] bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-[#F97316] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all pr-10"
                                            value={newEvent.focus}
                                            onChange={(e) => setNewEvent({ ...newEvent, focus: e.target.value })}
                                        >
                                            <option value="ebd">E.B.D.</option>
                                            <option value="culto_infantil">Culto Infantil</option>
                                            <option value="evento_especial">Evento Especial</option>
                                            <option value="cantina">Cantina</option>
                                            <option value="ensaio">Ensaio</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-focus-within:text-[#F97316] transition-colors">
                                            <ChevronDown size={24} />
                                        </div>
                                    </div>
                                </label>

                                <label className="flex flex-col gap-3">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Descrição / Notas</span>
                                    <textarea
                                        className="min-h-[120px] w-full resize-none rounded-xl border-2 border-[#E5E5E5] bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F97316] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all"
                                        placeholder="Detalhes adicionais ou observações importantes..."
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    ></textarea>
                                </label>

                                <label className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-transparent p-3 hover:bg-gray-50 transition-all group">
                                    <div className="relative flex items-center pt-1">
                                        <input className="peer h-5 w-5 rounded border-2 border-gray-300 text-[#F97316] focus:ring-[#F97316] focus:ring-offset-0 transition-all checked:bg-[#F97316] checked:border-[#F97316]" type="checkbox" />
                                        <Check className="absolute opacity-0 peer-checked:opacity-100 text-white left-0 pointer-events-none transition-opacity" size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-800 uppercase tracking-tight">Evento Recorrente</span>
                                        <span className="text-[10px] font-medium text-gray-400">Repetir automaticamente nas próximas semanas.</span>
                                    </div>
                                </label>
                            </div>

                            {/* Footer - Sticky Bottom */}
                            <div className="sidebar-footer flex items-center gap-4 border-t border-gray-200 bg-white px-8 py-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
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
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettingsModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettingsModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md flex flex-col rounded-3xl bg-slate-900 shadow-2xl relative overflow-hidden z-10 border border-slate-700"
                        >
                            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                        <Settings size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Configurações do Calendário</h3>
                                </div>
                                <button
                                    onClick={() => setShowSettingsModal(false)}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Exibição Padrão</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Anual', 'Trimestral', 'Mensal'].map(view => (
                                            <button
                                                key={view}
                                                className="py-2.5 rounded-xl text-sm font-bold transition-all bg-slate-800 text-white/70 hover:bg-slate-700 hover:text-white border border-slate-700"
                                            >
                                                {view}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Notificações</label>
                                    <label className="flex items-center justify-between p-4 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors">
                                        <span className="text-sm text-white font-medium">Lembrar eventos próximos</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-brand-orange focus:ring-brand-orange border-slate-600 bg-slate-700" />
                                    </label>
                                    <label className="flex items-center justify-between p-4 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors">
                                        <span className="text-sm text-white font-medium">Sincronizar com Google Calendar</span>
                                        <input type="checkbox" className="w-5 h-5 rounded text-brand-orange focus:ring-brand-orange border-slate-600 bg-slate-700" />
                                    </label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-700 flex gap-3">
                                <button
                                    onClick={() => setShowSettingsModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSettingsModal(false);
                                        showNotification('Configurações salvas com sucesso!');
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-brand-orange/20"
                                >
                                    Salvar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Details Modal */}
            <AnimatePresence>
                {selectedEvent && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEvent(null)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] p-8 flex flex-col gap-6 z-10"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3 ${selectedEvent.type === 'Sede' ? 'bg-blue-50 text-brand-blue border border-blue-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                        <span className="size-2 rounded-full bg-current"></span>
                                        {selectedEvent.type}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                        {selectedEvent.title}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-orange shadow-sm">
                                        <Clock className="text-brand-orange" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data e Hora</p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {new Date(selectedEvent.date).toLocaleDateString('pt-BR')} às {selectedEvent.time}
                                        </p>
                                    </div>
                                </div>

                                {selectedEvent.description && (
                                    <div className="text-sm text-slate-600 leading-relaxed">
                                        <p className="font-bold text-slate-800 mb-1">Descrição:</p>
                                        {selectedEvent.description}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="w-full py-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Fechar
                            </button>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>
        </motion.div >
    );
};


