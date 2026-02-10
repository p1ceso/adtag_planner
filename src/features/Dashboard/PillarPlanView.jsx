import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Share2, Printer, Calendar, Route, Edit2, Trash2,
    Package, Brush, Drama, Monitor, Plus, X, CheckCircle,
    AlertCircle, UserCheck, MessageSquare, ClipboardList, Verified,
    Box, Shield, BookOpen, HelpCircle, Check, Search
} from 'lucide-react';

export const PillarPlanView = ({ pillar, onBack }) => {
    const [notification, setNotification] = React.useState(null);
    const [showResourceModal, setShowResourceModal] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState('creative');
    const [newResourceName, setNewResourceName] = useState('');
    const [calendarEvents, setCalendarEvents] = React.useState([]);

    // Carregar eventos do localStorage
    React.useEffect(() => {
        const loadEvents = () => {
            const saved = localStorage.getItem('adtag_events');
            if (saved) {
                try {
                    setCalendarEvents(JSON.parse(saved));
                } catch (e) {
                    console.error("Erro ao ler eventos", e);
                }
            }
        };
        loadEvents();
        // Opcional: ouvir evento de storage se quisermos update em outras abas, mas aqui basta load no mount
        window.addEventListener('storage', loadEvents);
        return () => window.removeEventListener('storage', loadEvents);
    }, []);

    const eventsByMonth = React.useMemo(() => {
        const counts = {};
        const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        months.forEach(m => counts[m] = []); // Init array

        calendarEvents.forEach(evt => {
            const m = evt.date?.split('-')[1]; // YYYY-MM-DD -> MM
            if (counts[m]) counts[m].push(evt);
        });
        return counts;
    }, [calendarEvents]);

    const monthsNames = [
        { id: '01', name: 'Janeiro' }, { id: '02', name: 'Fevereiro' }, { id: '03', name: 'Março' },
        { id: '04', name: 'Abril' }, { id: '05', name: 'Maio' }, { id: '06', name: 'Junho' },
        { id: '07', name: 'Julho' }, { id: '08', name: 'Agosto' }, { id: '09', name: 'Setembro' },
        { id: '10', name: 'Outubro' }, { id: '11', name: 'Novembro' }, { id: '12', name: 'Dezembro' }
    ];

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleExportPDF = () => {
        showNotification('PDF exportado com sucesso!');
    };

    // Mock Data based on HTML template
    const [actionItems, setActionItems] = useState([
        { id: 1, text: 'Revisar material de apoio', sub: 'Garantir que todos os PDFs das lições estejam impressos.', done: true },
        { id: 2, text: 'Treinamento de Equipe', sub: 'Workshop sobre contação de histórias criativa (15/10).', done: false },
        { id: 3, text: 'Logística de Lanche', sub: 'Definir escala de doação para o mês de Novembro.', done: false },
        { id: 4, text: 'Compra de Figurinos', sub: 'Adquirir tecidos para a peça de Natal.', done: false }
    ]);

    const [resources, setResources] = useState({
        creative: ['Papel Kraft (10m)', 'Tintas Guache Laváveis', 'Pincéis variados'],
        props: ['Capas de heróis', 'Túnicas para teatro', 'Coroas de cartolina'],
        tech: ['Tablet p/ Check-in', 'Caixa de Som Ativa', 'Microfone sem fio']
    });

    const [lessons, setLessons] = useState([
        {
            id: 1, unit: 'Unidade 1: Heróis Improváveis', focus: 'Foco: Coragem e Dependência de Deus', items: [
                { id: 1, number: '01', title: 'Gideão e o pequeno exército', ref: 'Juízes 7' },
                { id: 2, number: '02', title: 'Débora e a vitória de Israel', ref: 'Juízes 4' },
                { id: 3, number: '03', title: 'Davi e o gigante Golias', ref: '1 Samuel 17' },
                { id: 4, number: '04', title: 'Ester salva seu povo', ref: 'Ester 4-8' }
            ]
        },
        {
            id: 2, unit: 'Unidade 2: O Nascimento do Rei', focus: 'Foco: O Verdadeiro Sentido do Natal', items: [
                { id: 5, number: '05', title: 'O Anúncio de Gabriel', ref: 'Lucas 1' },
                { id: 6, number: '06', title: 'A Estrela e os Reis Magos', ref: 'Mateus 2' }
            ]
        }
    ]);

    const handleToggleAction = (id) => {
        setActionItems(items => items.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        ));
    };

    const handleDeleteResource = (category, index) => {
        setResources(prev => ({
            ...prev,
            [category]: prev[category].filter((_, i) => i !== index)
        }));
        showNotification('Recurso removido!');
    };

    const handleAddResource = () => {
        if (!newResourceName.trim()) {
            showNotification('Digite o nome do recurso', 'error');
            return;
        }
        setResources(prev => ({
            ...prev,
            [selectedCategory]: [...prev[selectedCategory], newResourceName]
        }));
        setNewResourceName('');
        setShowResourceModal(false);
        showNotification('Recurso adicionado com sucesso!');
    };

    const handleDeleteLesson = (unitId, lessonId) => {
        setLessons(units => units.map(unit => {
            if (unit.id === unitId) {
                return { ...unit, items: unit.items.filter(lesson => lesson.id !== lessonId) };
            }
            return unit;
        }));
        showNotification('Lição removida!');
    };

    const handleEditLesson = (lessonId) => {
        showNotification('Função de editar lição em desenvolvimento');
    };

    const handleShare = () => {
        showNotification('Plano compartilhado com a liderança!');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[50] bg-[#FEFCFD] overflow-y-auto no-scrollbar"
        >
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-8 z-[60] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{notification.message}</span>
                </div>
            )}

            <div className="min-h-screen">
                <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-200"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Plano de Atividades</h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{pillar?.title || 'Ministerio'} • Q4 2024</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <Share2 size={18} /> Compartilhar
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="px-4 py-2 rounded-lg bg-brand-orange text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-orange/20 hover:bg-orange-600 transition-all"
                        >
                            <Printer size={18} /> Exportar PDF
                        </button>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-20">
                    {/* Calendar Overview Grid */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="text-purple-600" size={24} /> Visão Anual
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {monthsNames.map((month) => {
                                const count = eventsByMonth[month.id]?.length || 0;
                                const hasEvents = count > 0;
                                return (
                                    <div key={month.id} className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group hover:-translate-y-1 ${hasEvents ? 'bg-white border-purple-200 shadow-sm hover:shadow-md' : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-sm font-bold ${hasEvents ? 'text-purple-700' : 'text-gray-500'}`}>{month.name.substring(0, 3)}</span>
                                            {hasEvents && <span className="w-2 h-2 rounded-full bg-purple-500"></span>}
                                        </div>
                                        <div>
                                            <span className={`text-2xl font-black ${hasEvents ? 'text-gray-900' : 'text-gray-400'}`}>{count}</span>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Eventos</span>
                                        </div>
                                        {/* Preview rápida do primeiro evento on hover */}
                                        {hasEvents && (
                                            <div className="absolute inset-0 bg-purple-600 text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center text-center">
                                                <span className="text-[10px] font-bold uppercase mb-1">Destaque</span>
                                                <span className="text-xs font-medium truncate w-full">{eventsByMonth[month.id][0]?.title}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        <Route className="text-brand-blue" size={32} /> Roteiro de Currículo Trimestral
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 uppercase tracking-wide">Outubro - Dezembro</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {lessons.map((unit, idx) => (
                                        <div key={unit.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 ${idx === 0 ? 'border-l-brand-blue' : 'border-l-brand-magenta'}`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900">{unit.unit}</h4>
                                                    <p className="text-sm text-gray-500">{unit.focus}</p>
                                                </div>
                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-bold uppercase">{unit.items.length} LIÇÕES</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {unit.items.map((lesson) => (
                                                    <div key={lesson.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-all group cursor-pointer relative hover:bg-white hover:shadow-sm">
                                                        <p className={`text-[10px] font-bold ${idx === 0 ? 'text-blue-600' : 'text-pink-600'} mb-1 uppercase`}>LIÇÃO {lesson.number}</p>
                                                        <h5 className={`text-sm font-bold text-gray-800 ${idx === 0 ? 'group-hover:text-blue-600' : 'group-hover:text-pink-600'} transition-colors`}>{lesson.title}</h5>
                                                        <p className="text-xs text-gray-500 mt-1 italic">{lesson.ref}</p>

                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={(e) => { e.stopPropagation(); handleEditLesson(lesson.id); }} className="p-1 text-gray-400 hover:text-gray-700"><Edit2 size={14} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(unit.id, lesson.id); }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <Package className="text-[#84cc16]" size={24} /> Recursos Necessários
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Brush size={18} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">Materiais Criativos</h4>
                                        </div>
                                        <ul className="space-y-2">
                                            {resources.creative.map((item, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-center gap-2 group justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {item}
                                                    </div>
                                                    <button onClick={() => handleDeleteResource('creative', i)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                                </li>
                                            ))}
                                            <li className="pt-2">
                                                <button onClick={() => { setSelectedCategory('creative'); setShowResourceModal(true); }} className="text-[10px] font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 uppercase tracking-wider">
                                                    <Plus size={14} /> Adicionar
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                                <Drama size={18} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">Adereços & Figurinos</h4>
                                        </div>
                                        <ul className="space-y-2">
                                            {resources.props.map((item, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-center gap-2 group justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> {item}
                                                    </div>
                                                    <button onClick={() => handleDeleteResource('props', i)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                                </li>
                                            ))}
                                            <li className="pt-2">
                                                <button onClick={() => { setSelectedCategory('props'); setShowResourceModal(true); }} className="text-[10px] font-bold text-gray-500 hover:text-orange-600 flex items-center gap-1 uppercase tracking-wider">
                                                    <Plus size={14} /> Adicionar
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                                                <Monitor size={18} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">Tech & Áudio</h4>
                                        </div>
                                        <ul className="space-y-2">
                                            {resources.tech.map((item, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-center gap-2 group justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span> {item}
                                                    </div>
                                                    <button onClick={() => handleDeleteResource('tech', i)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                                </li>
                                            ))}
                                            <li className="pt-2">
                                                <button onClick={() => { setSelectedCategory('tech'); setShowResourceModal(true); }} className="text-[10px] font-bold text-gray-500 hover:text-pink-600 flex items-center gap-1 uppercase tracking-wider">
                                                    <Plus size={14} /> Adicionar
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <UserCheck className="text-orange-500" size={24} /> Voluntários Designados
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                                    {[
                                        { initial: 'RS', name: 'Ricardo Santos', role: 'Coordenador de Unidade' },
                                        { initial: 'ML', name: 'Maria Lúcia', role: 'Líder de Louvor' },
                                        { initial: 'AN', name: 'Ana Nogueira', role: 'Cenografia & Artes' }
                                    ].map((vol, i) => (
                                        <div key={i} className="p-4 flex items-center gap-4 group hover:bg-gray-50 transition-colors cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold border border-gray-200 text-gray-700">{vol.initial}</div>
                                            <div className="flex-1">
                                                <h5 className="text-sm font-bold text-gray-900 leading-tight">{vol.name}</h5>
                                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{vol.role}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {i === 0 && (
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                        <Verified size={14} />
                                                    </div>
                                                )}
                                                <button onClick={() => showNotification('Chat em desenvolvimento')} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-opacity">
                                                    <MessageSquare size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => showNotification('Gerenciamento de equipe em desenvolvimento')} className="w-full p-4 text-xs font-bold text-brand-orange hover:bg-orange-50 transition-colors text-center uppercase tracking-widest">
                                        + Gerenciar Equipe
                                    </button>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <ClipboardList className="text-pink-500" size={24} /> Plano de Ação
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Outubro</span>
                                </div>
                                <div className="space-y-3">
                                    {actionItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleToggleAction(item.id)}
                                            className={`p-4 rounded-xl flex items-start gap-3 border transition-all cursor-pointer select-none ${item.done ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 hover:border-brand-orange/50 hover:shadow-sm'}`}
                                        >
                                            <div className="mt-0.5">
                                                {item.done ? (
                                                    <CheckCircle className="text-green-600 animate-in zoom-in spin-in-180 duration-300" size={22} />
                                                ) : (
                                                    <div className="w-5 h-5 rounded border-2 border-gray-300 group-hover:border-gray-400"></div>
                                                )}
                                            </div>
                                            <div>
                                                <h5 className={`text-sm font-bold ${item.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.text}</h5>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>

                <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4 mt-8">
                    <p>© 2024 ADTAG Ministry Systems. Gestão de Planejamento Estratégico.</p>
                    <div className="flex gap-6">
                        <span className="hover:text-brand-orange transition-colors cursor-pointer" onClick={() => showNotification('Suporte Técnico em desenvolvimento')}>Suporte Técnico</span>
                        <span className="hover:text-brand-orange transition-colors cursor-pointer" onClick={() => showNotification('Privacidade em desenvolvimento')}>Privacidade</span>
                        <span className="hover:text-brand-orange transition-colors cursor-pointer" onClick={() => showNotification('Manual do Líder em desenvolvimento')}>Manual do Líder</span>
                    </div>
                </footer>
            </div>

            {/* Add Resource Modal */}
            <AnimatePresence>
                {showResourceModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowResourceModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl relative z-10 border border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Adicionar Recurso</h3>
                                        <p className="text-xs text-white/70">
                                            {selectedCategory === 'creative' ? 'Materiais Criativos' :
                                                selectedCategory === 'props' ? 'Adere\u00e7os & Figurinos' : 'Tech & \u00c1udio'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div>
                                    <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Nome do Recurso</label>
                                    <input
                                        value={newResourceName}
                                        onChange={(e) => setNewResourceName(e.target.value)}
                                        className="w-full mt-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none"
                                        placeholder="Ex: Tintas Acrílicas (5un)"
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-700 flex gap-3">
                                <button
                                    onClick={() => { setShowResourceModal(false); setNewResourceName(''); }}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddResource}
                                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


