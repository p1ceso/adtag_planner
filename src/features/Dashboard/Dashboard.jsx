import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Church,
    Edit2,
    Users,
    HeartHandshake,
    Flag,
    Calendar,
    NotebookPen,
    User,
    Trash2,
    FolderOpen,
    FileText,
    Image as ImageIcon,
    File,
    Download,
    Upload,
    X,
    Cake,
    Clock,
    CheckSquare,
    Square,
    Check
} from 'lucide-react';
import { VisionGoals } from './VisionGoals';

export const Dashboard = ({ team = [], tasks = [], setTasks, events = [] }) => {
    // State Management
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('main');

    // Theme State
    const [theme, setTheme] = useState({
        title: "Sou Herança do Senhor",
        vision: "Capacitando a próxima geração através da fé, comunidade e orientação dedicada.",
        accentColor: "brand-blue",
        background: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtyHVY4GESuVj9lRUEXOBbigxA0t6pdd9bvyXWRntJiDKRYUS2JTE2PP_FdpitT5_TyaefwgDmqxJ3sLoOLkmN_4wvCvPqv-5qF4nmvzB1TnkWWIFS8hYrMc9-QDfmymOm4jFRhIz8HK4VS-7jI1NdZnUjk3hlrk0CGPJUEGpgaF68-ZlaZvZ6tNaAnIglQ3Pw4x5IsYfa-Ld_9vHOBZLfr1aQW7FkAm4ntojS0ilJW8pjfn-RZfZaRaTHsLtmYKGXcyrhk0LdgTw"
    });
    const [tempTheme, setTempTheme] = useState({ ...theme });

    // Data States (Logbook & Vault) - Local to Dashboard for now as they weren't in App.jsx
    const [logbookNotes, setLogbookNotes] = useState([
        { date: '24', month: 'OUT', title: 'Reunião de Estratégia Q4', desc: 'Discutimos a alocação de orçamento para a Cantata de Natal. Aprovamos a compra de novos figurinos.', color: 'brand-blue' },
        { date: '18', month: 'OUT', title: 'Treinamento de Voluntários', desc: 'Completamos a integração de 5 novos professores para as turmas de EBD.', color: 'brand-green' }
    ]);
    const [newNote, setNewNote] = useState('');

    const [vaultFiles, setVaultFiles] = useState([
        { name: 'Ministry_Budget_2024.pdf', size: '2.4 MB', updated: 'ontem', type: 'pdf', color: 'brand-magenta' }
    ]);

    // Refs
    const fileInputRef = useRef(null);
    const uploadInputRef = useRef(null);

    // --- DERIVED DATA (Source of Truth: Props via App.jsx) ---

    // 1. Birthdays (Current Month)
    const birthdays = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth(); // 0-11
        const currentDay = today.getDate();

        return Array.isArray(team) ? team.filter(p => {
            const dob = p.dob || p.birthDate;
            if (!dob) return false;
            // Parse YYYY-MM-DD
            const [, mesStr] = dob.split('-');
            const mes = parseInt(mesStr, 10);
            return (mes - 1) === currentMonth;
        }).map(p => {
            const dob = p.dob || p.birthDate;
            const [, , diaStr] = dob.split('-');
            const day = parseInt(diaStr, 10);
            return {
                ...p,
                day,
                isToday: day === currentDay,
                nome: p.name // standardization
            };
        }).sort((a, b) => a.day - b.day) : [];
    }, [team]);

    // 2. Upcoming Events (Current Month)
    const upcomingEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentMonth = today.getMonth();

        return Array.isArray(events) ? events.filter(e => {
            if (!e.date) return false;
            const evtDate = new Date(e.date); // ISO string or YYYY-MM-DD
            // Logic: Events in this month AND >= today
            return evtDate.getMonth() === currentMonth && evtDate >= today;
        }).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5) : [];
    }, [events]);

    // 3. Pending Tasks
    const pendingTasks = useMemo(() => {
        return Array.isArray(tasks) ? tasks.filter(t => !t.done).slice(0, 6) : [];
    }, [tasks]);

    // Stats
    const totalMembers = useMemo(() => Array.isArray(team) ? team.filter(t => t.type === 'kid' || t.type === 'staff').length : 0, [team]);
    const totalVolunteers = useMemo(() => Array.isArray(team) ? team.filter(t => t.type === 'volunteer' || t.type === 'staff').length : 0, [team]); // Assuming 'staff' counts too, or adjust logic

    // Handlers
    const toggleTaskCheck = (taskId) => {
        if (setTasks) {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
        }
    };

    const handleSaveTheme = () => {
        setTheme({ ...tempTheme });
        setIsThemeModalOpen(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setTempTheme(prev => ({ ...prev, background: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleAddNote = () => {
        if (newNote.trim()) {
            const today = new Date();
            const newLogNote = {
                date: today.getDate().toString(),
                month: today.toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
                title: 'Nova Anotação',
                desc: newNote,
                color: 'brand-blue'
            };
            setLogbookNotes([newLogNote, ...logbookNotes]);
            setNewNote('');
        }
    };

    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files).map(file => ({
                name: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                updated: 'agora mesmo',
                type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'other',
                color: 'brand-magenta'
            }));
            setVaultFiles([...fileArray, ...vaultFiles]);
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText size={20} />;
            case 'image': return <ImageIcon size={20} />;
            default: return <File size={20} />;
        }
    };

    // Sub-Views Navigation
    if (viewMode === 'goals') return <VisionGoals onBack={() => setViewMode('main')} />;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0"
            >
                {/* 1. VISION PANEL (Hero Section) */}
                <div
                    className="relative w-full h-64 md:h-80 rounded-[24px] overflow-hidden shadow-sm border border-gray-200 group"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${theme.background}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/90 to-blue-900/40 backdrop-blur-[2px]" />

                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center text-white">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
                                <Church size={16} strokeWidth={2.5} /> Tema Anual 2026
                            </span>
                            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4 text-white drop-shadow-md">
                                {theme.title}
                            </h1>
                            <p className="text-lg md:text-xl text-blue-50 font-light max-w-2xl leading-relaxed opacity-90">
                                "{theme.vision}"
                            </p>
                        </motion.div>

                        <button
                            onClick={() => { setTempTheme(theme); setIsThemeModalOpen(true); }}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Edit2 size={20} />
                        </button>
                    </div>
                </div>

                {/* 2. MAIN GRID (Stats & Quick Access) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-white rounded-[24px] border border-gray-200 p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Membros</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalMembers}</h3>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white rounded-[24px] border border-gray-200 p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center">
                            <HeartHandshake size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Voluntários</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalVolunteers}</h3>
                        </div>
                    </div>

                    {/* Action Card: Goals */}

                </div>

                {/* 3. QUADRO DE AVISOS (REAL-TIME BOARD) */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* COL 1: ANIVERSARIANTES */}
                    <div className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-pink-50 text-brand-magenta rounded-lg">
                                <Cake size={20} />
                            </div>
                            <h3 className="font-bold text-gray-800">Aniversariantes</h3>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {birthdays.length > 0 ? birthdays.map((p, idx) => (
                                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${p.isToday ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${p.isToday ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-600'}`}>
                                        {p.day}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">{p.nome || p.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">{p.role}</p>
                                    </div>
                                    {p.isToday && <span className="text-xl">🎂</span>}
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 text-sm">Nenhum aniversariante este mês.</div>
                            )}
                        </div>
                    </div>

                    {/* COL 2: AGENDA DO MÊS */}
                    <div className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-orange-50 text-brand-orange rounded-lg">
                                <Calendar size={20} />
                            </div>
                            <h3 className="font-bold text-gray-800">Agenda do Mês</h3>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {upcomingEvents.length > 0 ? upcomingEvents.map((evt, idx) => {
                                const d = new Date(evt.date); // Use evt.date from App.jsx state
                                return (
                                    <div key={idx} className="flex gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-brand-orange/30 transition-colors group">
                                        <div className="flex flex-col items-center justify-center w-12 bg-orange-50 rounded-lg text-brand-orange border border-orange-100">
                                            <span className="text-[10px] font-bold uppercase">{d.toLocaleString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                                            <span className="text-lg font-black leading-none">{d.getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{evt.title}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Clock size={12} />
                                                <span>{evt.time || '00:00'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-8 text-gray-400 text-sm">Sem eventos próximos.</div>
                            )}
                        </div>
                    </div>

                    {/* COL 3: CHECKLIST PENDENTE */}
                    <div className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-green-50 text-brand-green rounded-lg">
                                <CheckSquare size={20} />
                            </div>
                            <h3 className="font-bold text-gray-800">Pendências</h3>
                        </div>
                        <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {pendingTasks.length > 0 ? pendingTasks.map((task, idx) => (
                                <div key={idx}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white transition-all cursor-pointer group"
                                    onClick={() => toggleTaskCheck(task.id)}
                                >
                                    <div className="mt-0.5 text-gray-400 group-hover:text-brand-green transition-colors">
                                        <Square size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700 font-medium leading-snug group-hover:line-through transition-all">{task.text || task.title}</p>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{task.type || 'Geral'}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 text-sm flex flex-col items-center gap-2">
                                    <Check className="text-green-500" size={32} />
                                    Tudo em dia!
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 4. ACTIVITY & FILES (Two Columns Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Logbook Section (2 Cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <NotebookPen size={20} className="text-gray-400" />
                                Feed de Notas
                            </h3>
                            <button className="text-xs font-medium text-brand-blue hover:text-blue-700 hover:underline bg-transparent p-0 transition-colors">
                                Ver Histórico
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Input Area */}
                            <div className="bg-white rounded-[24px] p-4 border border-gray-200 shadow-sm">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-sm">
                                        <User size={20} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Registre uma decisão, ideia ou observação..."
                                            className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none resize-none min-h-[80px] text-gray-700 placeholder:text-gray-400"
                                        ></textarea>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleAddNote}
                                                disabled={!newNote.trim()}
                                                className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                Registrar Nota
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes List */}
                            <div className="max-h-[400px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                                {logbookNotes.map((note, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group flex gap-4">
                                        <div className="flex flex-col items-center min-w-[3.5rem] pt-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{note.month}</span>
                                            <span className={`text-2xl font-bold ${note.color === 'brand-blue' ? 'text-brand-blue' : 'text-brand-green'}`}>{note.date}</span>
                                        </div>
                                        <div className="flex-1 border-l border-gray-100 pl-4 py-1.5">
                                            <h5 className="text-gray-900 font-semibold text-base mb-1">{note.title}</h5>
                                            <p className="text-sm text-gray-600 leading-relaxed">{note.desc}</p>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all self-start cursor-pointer">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Files Vault (1 Col) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FolderOpen size={20} className="text-gray-400" />
                                Documentos
                            </h3>
                        </div>

                        <div className="bg-white rounded-[24px] border border-gray-200 p-4 min-h-[400px] flex flex-col shadow-sm">
                            <div className="space-y-2 flex-1">
                                {vaultFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group">
                                        <div className="w-10 h-10 rounded-lg bg-pink-50 text-brand-magenta flex items-center justify-center shrink-0">
                                            {getFileIcon(file.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">{file.size} • {file.updated}</p>
                                        </div>
                                        <Download size={20} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <input
                                    type="file"
                                    ref={uploadInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    multiple
                                />
                                <button
                                    onClick={() => uploadInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-brand-blue transition-all cursor-pointer rounded-xl flex flex-col items-center justify-center py-8 gap-3 group"
                                >
                                    <div className="p-2 bg-white rounded-full border border-gray-200 group-hover:border-blue-200 transition-colors">
                                        <Upload size={20} className="text-gray-400 group-hover:text-brand-blue" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500 group-hover:text-brand-blue">Upload Arquivo</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* THEME EDITOR DRAWER */}
            <AnimatePresence>
                {isThemeModalOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsThemeModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col rounded-l-[24px] overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold">Editar Tema Anual</h3>
                                <button onClick={() => setIsThemeModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8">
                                <div className="w-full">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Título do Tema</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        value={tempTheme.title}
                                        onChange={(e) => setTempTheme({ ...tempTheme, title: e.target.value })}
                                    />
                                </div>

                                <div className="w-full">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Visão</label>
                                    <textarea
                                        rows="5"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none leading-relaxed"
                                        value={tempTheme.vision}
                                        onChange={(e) => setTempTheme({ ...tempTheme, vision: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="w-full">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Imagem de Fundo</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-40 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-orange-50/10 transition-colors bg-cover bg-center relative group overflow-hidden"
                                        style={{ backgroundImage: `url('${tempTheme.background}')` }}
                                    >
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs font-bold bg-black/50 px-4 py-2 rounded-full uppercase tracking-wide backdrop-blur-sm">Alterar Imagem</p>
                                        </div>
                                        {!tempTheme.background && <ImageIcon size={32} className="text-gray-300" />}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                                <button onClick={() => setIsThemeModalOpen(false)} className="flex-1 py-3 rounded-lg border border-gray-200 bg-white font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancelar</button>
                                <button onClick={handleSaveTheme} className="flex-1 py-3 rounded-lg bg-brand-blue text-white font-bold hover:bg-blue-700 cursor-pointer">Salvar Alterações</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
