import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Printer, Church, Target, ListPlus, Users,
    Store, Music, Lightbulb, X, CheckCircle, AlertCircle, Verified
} from 'lucide-react';

export const VisionGoals = ({ onBack }) => {
    const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
    const [isEditVisionModalOpen, setIsEditVisionModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleExportReport = () => {
        const reportContent = `
Relatório de Metas Estratégicas
===============================
Data: ${new Date().toLocaleDateString('pt-BR')}

Resumo Geral:
- Progresso Geral: 65%
- Metas Ativas: ${goals.length}
- Metas Completas: ${goals.filter(g => g.progress === 100).length}

Detalhamento das Metas:
${goals.map(g => `
  ${g.title}
  - ${g.desc}
  - Progresso: ${g.progress}%
  - Status: ${g.status || 'Em Progresso'}
`).join('')}
        `;

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_metas_${new Date().toISOString().split('T')[0]}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Relatório exportado com sucesso!');
    };

    // Goals State
    const [goals, setGoals] = useState([
        { title: 'Treinamento de Voluntários', desc: 'Capacitando 50 novos professores até Q4', progress: 76, val: '38 / 50', color: 'brand-blue', hex: '#1E4BA1' },
        { title: 'Expansão da EBD', desc: 'Abrir 3 novas salas de aula na ala Sul', progress: 100, val: '100% (R$ 4.200)', color: 'brand-green', hex: '#8BC53F', status: 'Completo' },
        { title: 'Projeto Louvor Infantil', desc: 'Compra de novos instrumentos e equipamento de áudio', progress: 31, val: 'R$ 2.500 / 8.000', color: 'brand-magenta', hex: '#E11E86', status: 'Planejamento' }
    ]);

    const [newGoal, setNewGoal] = useState({
        title: '',
        desc: '',
        pillar: 'volunteers',
        deadline: '',
        kpi: '',
        current: '',
        target: ''
    });

    const handleAddGoal = (e) => {
        e.preventDefault();
        const goal = {
            title: newGoal.title,
            desc: newGoal.desc,
            progress: Math.round((Number(newGoal.current) / Number(newGoal.target)) * 100) || 0,
            val: `${newGoal.current} / ${newGoal.target}`,
            color: 'brand-blue',
            hex: '#1E4BA1',
            status: 'Em Progresso'
        };
        setGoals([...goals, goal]);
        setIsNewGoalModalOpen(false);
        setNewGoal({ title: '', desc: '', pillar: 'volunteers', deadline: '', kpi: '', current: '', target: '' });
        showNotification('Meta criada com sucesso!');
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    const cleanStyle = {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        content: 'none',
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="max-w-7xl mx-auto space-y-8 pb-20 font-inter"
        >
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-brand-green text-white' : 'bg-brand-magenta text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-[#111827] hover:bg-gray-100 transition-all flex items-center justify-center group cursor-pointer"
                    >
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-[#111827] tracking-tight font-inter tracking-[-0.02em]">Detalhes de Metas Estratégicas</h2>
                        <nav className="flex text-xs font-medium uppercase tracking-[0.05em] text-[#6B7280] gap-2 mt-1 font-inter">
                            <span>Estratégia</span>
                            <span>/</span>
                            <span className="text-brand-orange">Metas Anuais</span>
                        </nav>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExportReport}
                        className="h-11 px-5 rounded-xl bg-white border border-gray-200 text-[#4B5563] text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                        <Printer size={20} />
                        Exportar Relatório
                    </button>
                    <button
                        onClick={() => setIsEditVisionModalOpen(true)}
                        className="h-11 px-6 rounded-xl bg-brand-orange text-white text-sm font-black hover:brightness-90 shadow-xl shadow-brand-orange/20 transition-all active:scale-95 cursor-pointer"
                    >
                        Editar Visão
                    </button>
                </div>
            </header>

            {/* Custom CSS for Banner */}
            <style>{`
                    /* 1. O CONTAINER PRINCIPAL (O Fundo Azul) */
                    /* 1. O CONTAINER PRINCIPAL (O Fundo Azul) */
                    /* 1. O CONTAINER PRINCIPAL (O Fundo Azul) */
                    .banner-metas-container {
                        background: radial-gradient(circle at 100% 0%, #3b82f6 0%, #1e3a8a 50%, #172554 100%) !important;
                        background-image: 
                            radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                            linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
                            linear-gradient(to bottom, #1e3a8a, #0f172a) !important;
                        box-shadow: 
                            0 25px 50px -12px rgba(15, 23, 42, 0.5),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                        
                        border-radius: 32px;
                        padding: 56px;
                        position: relative;
                        overflow: hidden;
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }

                    .banner-metas-container:hover {
                        border-color: rgba(255,255,255,0.3);
                        transform: translateY(-2px);
                        cursor: text;
                    }

                    .banner-metas-container::after {
                        content: '✏️ Editar Tema';
                        position: absolute;
                        top: 24px;
                        right: 24px;
                        background-color: rgba(255,255,255,0.2);
                        color: white;
                        font-size: 12px;
                        font-weight: 600;
                        padding: 6px 12px;
                        border-radius: 20px;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        pointer-events: none;
                    }

                    .banner-metas-container:hover::after {
                        opacity: 1;
                    }

                    /* 2. O LABEL DE TOPO */
                    .banner-label-topo {
                        display: inline-flex;
                        align-items: center;
                        background-color: rgba(255, 255, 255, 0.15);
                        padding: 6px 12px;
                        border-radius: 99px;
                        margin-bottom: 20px;
                        backdrop-filter: blur(4px);
                    }

                    .banner-label-topo span.banner-icon {
                        color: #FCD34D;
                        margin-right: 8px;
                    }

                    .banner-label-topo span.text {
                        font-family: 'Inter', sans-serif;
                        font-weight: 400;
                        font-size: 13px;
                        color: rgba(255, 255, 255, 0.9);
                        letter-spacing: 0.05em;
                    }

                    /* 3. OS TEXTOS EDITÁVEIS */
                    .banner-titulo-principal {
                        font-family: 'Inter', sans-serif;
                        font-weight: 800;
                        font-size: 42px;
                        color: #FFFFFF;
                        margin-bottom: 20px;
                        outline: none;
                        letter-spacing: -0.03em;
                        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                        line-height: 1.1;
                    }

                    .banner-descricao {
                        font-family: 'Inter', sans-serif;
                        font-weight: 400;
                        font-size: 16px;
                        color: rgba(255, 255, 255, 0.85);
                        line-height: 1.6;
                        max-width: 800px;
                        outline: none;
                    }

                    .banner-titulo-principal:focus,
                    .banner-descricao:focus {
                        background-color: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        padding: 4px;
                    }
                `}</style>

            {/* Hero Section (Updated) */}
            <motion.div
                variants={item}
                className="banner-metas-container flex flex-col lg:flex-row items-center gap-12"
            >
                {/* Progress Circle (Kept but adapted colors if needed, keeping usage of brand-orange for contrast or adapting to white) */}
                <div className="relative w-56 h-56 flex-shrink-0 group">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-blue-900/30" cx="112" cy="112" fill="transparent" r="100" stroke="currentColor" strokeWidth="12"></circle>
                        <motion.circle
                            initial={{ strokeDashoffset: 628 }}
                            animate={{ strokeDashoffset: 628 * (1 - 0.65) }}
                            transition={{ duration: 2, ease: "circOut" }}
                            className="text-white" cx="112" cy="112" fill="transparent" r="100" stroke="currentColor" strokeDasharray="628" strokeLinecap="round" strokeWidth="12"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' }}
                        ></motion.circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-white font-inter">65%</span>
                        <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mt-1 font-inter">Completo</span>
                    </div>
                </div>

                <div className="flex-1 text-center lg:text-left z-10">
                    <div className="banner-label-topo backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg shadow-black/10 ring-1 ring-white/5">
                        <span className="banner-icon drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                            <Church size={18} strokeWidth={1.5} />
                        </span>
                        <div className="h-4 w-px bg-white/10 mx-3"></div>
                        <span className="text font-medium tracking-[0.2em] text-[10px] text-blue-100/90">TEMA ANUAL 2026</span>
                    </div>

                    {/* Editable Title */}
                    <h1
                        className="banner-titulo-principal"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                    >
                        Sou Herança do Senhor
                    </h1>

                    {/* Editable Description */}
                    <p
                        className="banner-descricao"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                    >
                        Nosso foco estratégico para este ano centra-se em estabelecer uma identidade firme para nossas crianças como herança do Senhor. Estamos construindo sistemas para nutrir, proteger e educar a próxima geração de líderes.
                    </p>

                    {/* Stats Section (Adapted for Blue Background) */}
                    <div className="flex flex-wrap gap-10 mt-10 justify-center lg:justify-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-200 text-[11px] font-bold uppercase tracking-widest font-inter">Orçamento Utilizado</span>
                            <span className="text-white text-2xl font-extrabold tracking-tight font-inter">R$ 12.450 <span className="text-blue-300 text-lg font-medium">/ 18.000</span></span>
                        </div>
                        <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-200 text-[11px] font-bold uppercase tracking-widest font-inter">Projetos Ativos</span>
                            <span className="text-white text-2xl font-extrabold tracking-tight font-inter">08 <span className="text-blue-300 text-lg font-medium">Em Andamento</span></span>
                        </div>
                        <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-200 text-[11px] font-bold uppercase tracking-widest font-inter">Data Limite</span>
                            <span className="text-white text-2xl font-extrabold tracking-tight font-inter">72 <span className="text-blue-300 text-lg font-medium">Dias Restantes</span></span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-semibold text-[#111827] flex items-center gap-3 font-inter">
                            <Target className="text-brand-orange" size={24} />
                            Objetivos Estratégicos
                        </h3>
                        <button
                            onClick={() => setIsNewGoalModalOpen(true)}
                            className="text-[11px] font-bold text-brand-orange hover:text-[#111827] uppercase tracking-widest transition-all p-2 bg-brand-orange/5 rounded-lg border border-brand-orange/10 flex items-center gap-2 group cursor-pointer active:scale-95"
                        >
                            <ListPlus className="group-hover:text-[#111827] transition-colors" size={18} />
                            Adicionar Objetivo
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {goals.map((goal, idx) => (
                            <motion.div
                                key={idx}
                                variants={item}
                                className="bg-white p-6 rounded-[24px] group transition-all relative cursor-pointer"
                                style={cleanStyle}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4 items-start">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 flex-shrink-0"
                                            style={{ backgroundColor: `${goal.hex}10`, color: goal.hex, border: `1px solid ${goal.hex}20` }}
                                        >
                                            <div className="flex items-center justify-center w-full h-full">
                                                {goal.title.includes('Treinamento') || goal.title.includes('Voluntários') ? <Users size={24} /> :
                                                    goal.title.includes('EBD') || goal.title.includes('Expansão') ? <Store size={24} /> : <Music size={24} />}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[#111827] font-bold text-lg group-hover:text-[#F97316] transition-colors font-inter">{goal.title}</h4>
                                            <p className="text-[#4B5563] text-sm mt-1 leading-relaxed font-inter font-regular">{goal.desc}</p>
                                        </div>
                                    </div>
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                                        style={{ backgroundColor: `${goal.hex}10`, color: goal.hex, borderColor: `${goal.hex}20` }}
                                    >
                                        {goal.status || 'Em Progresso'}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest font-inter">
                                        <span className="text-[#4B5563]">Acompanhamento Métrico</span>
                                        <span style={{ color: goal.hex }}>{goal.val}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${goal.progress}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: goal.hex, boxShadow: `0 0 10px ${goal.hex}40` }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-semibold text-[#111827] flex items-center gap-3 font-inter">
                            <div className="text-brand-orange"><ListPlus size={24} /></div>
                            Marcos Trimestrais
                        </h3>
                    </div>
                    <div
                        className="rounded-[24px] p-6 relative"
                        style={cleanStyle}
                    >
                        <div className="absolute left-9 top-12 bottom-12 w-px bg-gray-200"></div>
                        <div className="space-y-10 relative">
                            {[
                                { q: 'Q4 - 25 Out', title: 'Apresentação da Visão Anual', desc: 'Apresentando resultados ao conselho principal.', active: true, color: '#F48221' },
                                { q: 'Q4 - 15 Nov', title: 'Jantar de Reconhecimento da Equipe', desc: 'Celebrando mais de 120 membros da equipe.', color: '#94a3b8' },
                                { q: 'Q4 - 20 Dez', title: 'Cantata de Natal 2024', desc: 'O grande final do nosso tema anual.', color: '#94a3b8' }
                            ].map((milestone, idx) => (
                                <div key={idx} className={`flex gap-6 relative ${milestone.active ? 'opacity-100' : 'opacity-50'}`}>
                                    <div
                                        className="w-7 h-7 rounded-full flex-shrink-0 z-10 border-[4px] border-white ring-1 ring-gray-100 flex items-center justify-center shadow-sm"
                                        style={{ backgroundColor: milestone.active ? milestone.color : '#CBD5E1' }}
                                    >
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-widest block mb-1.5 font-inter" style={{ color: milestone.active ? milestone.color : '#64748b' }}>{milestone.q}</span>
                                        <h5 className="text-[#111827] font-semibold leading-tight text-sm font-inter">{milestone.title}</h5>
                                        <p className="text-[#4B5563] text-xs mt-1.5 leading-relaxed font-inter font-regular">{milestone.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="bg-brand-orange/5 rounded-xl p-5 border border-brand-orange/10 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-orange/10 blur-2xl group-hover:bg-brand-orange/20 transition-all"></div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Lightbulb className="text-brand-orange" size={20} />
                                    <span className="text-[11px] font-bold text-[#111827] uppercase tracking-widest font-inter">Insight Estratégico</span>
                                </div>
                                <p className="text-xs text-[#4B5563] leading-relaxed font-inter font-regular">
                                    Seu "Treinamento de Voluntários" está 15% à frente do cronograma. Considere realocar alguns recursos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="rounded-[24px] p-6"
                        style={cleanStyle}
                    >
                        <h4 className="text-[#111827] font-bold mb-5 tracking-tight text-lg font-inter">Resumo da Visão</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-[#F9FAFB] p-5 rounded-xl border border-gray-200 flex justify-between items-center group cursor-pointer hover:border-brand-orange/30 transition-all">
                                <span className="text-[11px] font-bold text-[#4B5563] uppercase tracking-widest font-inter">Crescimento</span>
                                <p className="text-[#111827] font-bold text-lg group-hover:text-[#F97316] transition-colors font-inter">+24.8% <span className="text-xs font-medium text-[#9CA3AF]">AaA</span></p>
                            </div>
                            <div className="bg-[#F9FAFB] p-5 rounded-xl border border-gray-200 flex justify-between items-center group cursor-pointer hover:border-brand-orange/30 transition-all">
                                <span className="text-[11px] font-bold text-[#4B5563] uppercase tracking-widest font-inter">Retenção</span>
                                <p className="text-[#111827] font-bold text-lg group-hover:text-[#F97316] transition-colors font-inter">92.4% <span className="text-xs font-medium text-[#9CA3AF]">Taxa</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Goal Modal (Novo Objetivo) */}
            <AnimatePresence>
                {isNewGoalModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNewGoalModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl rounded-[24px] overflow-hidden p-8"
                            style={cleanStyle}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20">
                                        <ListPlus size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#111827] tracking-tight font-inter">Novo Objetivo</h3>
                                        <p className="text-xs font-regular text-[#6B7280] uppercase tracking-widest mt-1 font-inter">Defina marcos de projeto para branding estratégico</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsNewGoalModalOpen(false)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form className="space-y-6 text-left" onSubmit={handleAddGoal}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest ml-1 font-inter block mb-1.5">Título do Objetivo</label>
                                        <input
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 h-[42px] text-[#111827] focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition-all placeholder:text-[#9CA3AF]"
                                            placeholder="ex: Expansão da Escola Dominical"
                                            type="text"
                                            value={newGoal.title}
                                            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest ml-1 font-inter block mb-1.5">Descrição Detalhada</label>
                                        <textarea
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#111827] focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition-all resize-none placeholder:text-[#9CA3AF]"
                                            placeholder="Descreva os resultados e relevância espiritual..."
                                            rows="3"
                                            value={newGoal.desc}
                                            onChange={(e) => setNewGoal({ ...newGoal, desc: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest ml-1 font-inter block mb-1.5">Pilares da Estratégia</label>
                                        <select
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 h-[42px] text-[#111827] focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition-all appearance-none cursor-pointer"
                                            value={newGoal.pillar}
                                            onChange={(e) => setNewGoal({ ...newGoal, pillar: e.target.value })}
                                        >
                                            <option value="volunteers">Equipe e Treinamento</option>
                                            <option value="education">Desenvolvimento Curricular</option>
                                            <option value="events">Eventos Gospel</option>
                                            <option value="missions">Missões e Evangelismo</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest ml-1 font-inter block mb-1.5">Data Limite</label>
                                        <input
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 h-[42px] text-[#111827] focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition-all"
                                            type="date"
                                            value={newGoal.deadline}
                                            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest ml-1 font-inter block mb-1.5">Indicador Chave (KPI)</label>
                                        <input
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 h-[42px] text-[#111827] focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition-all placeholder:text-[#9CA3AF]"
                                            placeholder="ex: Total de Professores Treinados"
                                            type="text"
                                            value={newGoal.kpi}
                                            onChange={(e) => setNewGoal({ ...newGoal, kpi: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest ml-1 font-inter block mb-1.5">Estado Atual</label>
                                        <input
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 h-[42px] text-[#111827] focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition-all placeholder:text-[#9CA3AF]"
                                            placeholder="0"
                                            type="number"
                                            value={newGoal.current}
                                            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest ml-1 font-inter block mb-1.5">Valor da Meta</label>
                                        <input
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 h-[42px] text-[#111827] focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition-all placeholder:text-[#9CA3AF]"
                                            placeholder="100"
                                            type="number"
                                            value={newGoal.target}
                                            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsNewGoalModalOpen(false)}
                                        className="px-6 py-3 rounded-lg border border-gray-200 text-[#4B5563] font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-wide cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 rounded-lg bg-brand-orange text-white font-semibold shadow-lg shadow-brand-orange/20 hover:bg-orange-600 transition-all flex items-center gap-2 active:scale-95 text-sm cursor-pointer"
                                    >
                                        <Verified size={20} />
                                        Firmar Objetivo
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Vision Modal */}
            <AnimatePresence>
                {isEditVisionModalOpen && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditVisionModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{
                                width: '90%',
                                maxWidth: '700px',
                                position: 'relative',
                                backgroundColor: '#FFFFFF',
                                padding: '32px',
                                borderRadius: '24px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #E5E7EB',
                                content: 'none'
                            }}
                            className="relative z-10 flex flex-col gap-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 w-full">
                                    <h2 className="text-[#111827] text-xl font-bold tracking-tight font-inter">
                                        VISÃO PARA O FUTURO
                                    </h2>
                                    <p className="text-[#4B5563] text-base leading-relaxed font-inter font-regular">
                                        Atualize a declaração de visão estratégica anual e defina os marcos principais.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsEditVisionModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 font-inter">Declaração de Visão</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none resize-none h-28 leading-relaxed font-inter"
                                        defaultValue="Formar 50 novos professores e expandir o ministério para mais 3 regiões da cidade até o final de 2025."
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 font-inter">Ano de Referência</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none cursor-pointer">
                                            <option>2025</option>
                                            <option>2026</option>
                                            <option>2027</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 font-inter">Meta de Progresso (%)</label>
                                        <input
                                            type="number"
                                            defaultValue="65"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none"
                                            placeholder="Porcentagem esperada"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    onClick={() => setIsEditVisionModalOpen(false)}
                                    className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all border border-gray-200 uppercase tracking-wide cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditVisionModalOpen(false);
                                        showNotification('Visão atualizada com sucesso!');
                                    }}
                                    className="flex-1 py-3.5 rounded-xl bg-brand-orange text-white font-bold text-sm hover:brightness-90 transition-all shadow-lg shadow-brand-orange/20 uppercase tracking-wide cursor-pointer"
                                >
                                    Salvar Visão
                                </button>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>
        </motion.div>
    );
};
