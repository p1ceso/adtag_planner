import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X, Plus, Settings, LayoutGrid, User, Users, Search,
    School, PartyPopper, BookOpen, Calendar, Globe, MessageCircle
} from 'lucide-react';

export const MinistryPillarsManagement = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dados Mockados baseados no code.html
    const pillars = [
        {
            id: 'ebd',
            title: 'EBD Kids',
            description: 'Educação Bíblica Dominical focada em formação teológica fundamental.',
            leader: 'Juliana Medeiros',
            teamStatus: '18 Voluntários',
            progressLabel: 'Progresso Curricular',
            progress: 85,
            status: 'Ativo',
            theme: 'brand-orange',
            icon: School
        },
        {
            id: 'culto',
            title: 'Culto Infantil',
            description: 'Experiência de adoração e mensagem adaptada para todas as idades.',
            leader: 'Pb. Lucas Silva',
            teamStatus: '12 Voluntários',
            progressLabel: 'Escala Mensal',
            progress: 100,
            status: 'Ativo',
            theme: 'primary',
            icon: PartyPopper
        },
        {
            id: 'discipulado',
            title: 'Discipulado',
            description: 'Acompanhamento individual e pequenos grupos para pré-adolescentes.',
            leader: 'Sarah Costa',
            teamStatus: '06 Voluntários',
            progressLabel: 'Prontidão de Material',
            progress: 45,
            status: 'Planejando',
            theme: 'brand-pink',
            icon: BookOpen
        },
        {
            id: 'eventos',
            title: 'Eventos & Campanhas',
            description: 'Planejamento de conferências, EBF e datas comemorativas.',
            leader: 'Marcos Oliveira',
            teamStatus: '08 Voluntários',
            progressLabel: 'EBF 2024 Prep.',
            progress: 20,
            status: 'Ativo',
            theme: 'brand-lime',
            icon: Calendar
        },
        {
            id: 'missoes',
            title: 'Missões Kids',
            description: 'Despertando o coração missionário através de projetos práticos.',
            leader: 'Débora Santos',
            teamStatus: '04 Voluntários',
            progressLabel: 'Meta de Arrecadação',
            progress: 60,
            status: 'Pausado',
            theme: 'blue-400',
            icon: Globe
        },
        {
            id: 'grude',
            title: 'GRUDE (Grupos de Decisão)',
            description: 'Pequenos grupos focados em comunhão e cuidado pastoral.',
            leader: 'Ricardo Lima',
            teamStatus: '06 Voluntários',
            progressLabel: 'Frequência Média',
            progress: 92,
            status: 'Ativo',
            theme: 'orange-400',
            icon: MessageCircle
        }
    ];

    const getThemeColors = (theme) => {
        const colors = {
            'brand-orange': { bg: 'bg-[#F58634]', text: 'text-[#F58634]', border: 'border-[#F58634]', bgSoft: 'bg-[#F58634]/10' },
            'primary': { bg: 'bg-[#2559A6]', text: 'text-[#2559A6]', border: 'border-[#2559A6]', bgSoft: 'bg-[#2559A6]/10' },
            'brand-pink': { bg: 'bg-[#EC2A91]', text: 'text-[#EC2A91]', border: 'border-[#EC2A91]', bgSoft: 'bg-[#EC2A91]/10' },
            'brand-lime': { bg: 'bg-[#A8CF45]', text: 'text-[#A8CF45]', border: 'border-[#A8CF45]', bgSoft: 'bg-[#A8CF45]/10' },
            'blue-400': { bg: 'bg-[#2559A6]', text: 'text-[#2559A6]', border: 'border-[#2559A6]', bgSoft: 'bg-[#2559A6]/10' },
            'orange-400': { bg: 'bg-[#F58634]', text: 'text-[#F58634]', border: 'border-[#F58634]', bgSoft: 'bg-[#F58634]/10' },
        };
        return colors[theme] || colors['primary'];
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Ativo': return 'bg-[#A8CF45]/20 text-[#A8CF45] border-[#A8CF45]/30';
            case 'Planejando': return 'bg-[#2559A6]/20 text-[#2559A6] border-[#2559A6]/30';
            case 'Pausado': return 'bg-slate-700/50 text-white/70 border-slate-600/30';
            default: return 'bg-slate-700/50 text-white/70';
        }
    };

    const filteredPillars = pillars.filter(pillar => {
        const matchesSearch = pillar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pillar.leader.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'Todos' ||
            (activeFilter === 'Ativos' && pillar.status === 'Ativo') ||
            (activeFilter === 'Em Planejamento' && pillar.status === 'Planejando') ||
            (activeFilter === 'Pausados' && pillar.status === 'Pausado');
        return matchesSearch && matchesFilter;
    });

    return (
        <>
            {/* Modal de Novo Pilar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="glass-popover w-full max-w-lg rounded-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Novo Pilar Ministerial</h2>
                                    <p className="text-white/70 text-sm mt-1">Configure os detalhes do novo núcleo de atuação.</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-2 text-left">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/70 ml-1">Nome do Pilar</label>
                                    <input className="w-full glass-input rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-white/50" placeholder="Ex: Berçário, Teatro Kids..." type="text" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-left">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/70 ml-1">Coordenador Líder</label>
                                        <select className="w-full glass-input rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all appearance-none">
                                            <option className="bg-slate-900">Selecione...</option>
                                            <option className="bg-slate-900">Juliana Medeiros</option>
                                            <option className="bg-slate-900">Pb. Lucas Silva</option>
                                            <option className="bg-slate-900">Sarah Costa</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/70 ml-1">Equipe Inicial</label>
                                        <input className="w-full glass-input rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all" placeholder="0" type="number" />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/70 ml-1">Objetivo / Descrição</label>
                                    <textarea className="w-full glass-input rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-white/50 resize-none" placeholder="Descreva o propósito deste pilar..." rows="3"></textarea>
                                </div>
                                <div className="space-y-3 text-left">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/70 ml-1">Cor de Identificação</label>
                                    <div className="flex gap-4">
                                        <label className="relative cursor-pointer group">
                                            <input defaultChecked className="peer sr-only" name="color" type="radio" />
                                            <div className="w-10 h-10 rounded-full bg-primary ring-offset-2 ring-offset-slate-900 peer-checked:ring-2 ring-brand-orange transition-all group-hover:scale-110"></div>
                                        </label>
                                        <label className="relative cursor-pointer group">
                                            <input className="peer sr-only" name="color" type="radio" />
                                            <div className="w-10 h-10 rounded-full bg-brand-orange ring-offset-2 ring-offset-slate-900 peer-checked:ring-2 ring-brand-orange transition-all group-hover:scale-110"></div>
                                        </label>
                                        <label className="relative cursor-pointer group">
                                            <input className="peer sr-only" name="color" type="radio" />
                                            <div className="w-10 h-10 rounded-full bg-brand-pink ring-offset-2 ring-offset-slate-900 peer-checked:ring-2 ring-brand-pink transition-all group-hover:scale-110"></div>
                                        </label>
                                        <label className="relative cursor-pointer group">
                                            <input className="peer sr-only" name="color" type="radio" />
                                            <div className="w-10 h-10 rounded-full bg-brand-lime ring-offset-2 ring-offset-slate-900 peer-checked:ring-2 ring-brand-lime transition-all group-hover:scale-110"></div>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
                                        type="button"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="flex-1 h-12 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-brand-orange/20 transition-all"
                                        type="submit"
                                    >
                                        Criar Pilar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full h-full relative">
                <header className="flex items-center justify-between mb-8">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Gestão de Pilares Ministeriais</h2>
                        <p className="text-sm text-[#4B5563]">Administre o desenvolvimento de cada núcleo do ministério infantil.</p>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="h-11 px-6 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Adicionar Novo Pilar
                        </button>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all border border-gray-200 bg-white">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl flex items-center gap-4 bg-white border border-[#E5E7EB] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-brand-orange">
                                    <LayoutGrid size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total de Pilares</p>
                                    <h3 className="text-3xl font-bold text-[#1F2937]">06</h3>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl flex items-center gap-4 bg-white border border-[#E5E7EB] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <User size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Alunos Ativos</p>
                                    <h3 className="text-3xl font-bold text-[#1F2937]">482</h3>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl flex items-center gap-4 bg-white border border-[#E5E7EB] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="w-12 h-12 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
                                    <Users size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Voluntários Alocados</p>
                                    <h3 className="text-3xl font-bold text-[#1F2937]">54</h3>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96 text-left">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} />
                                <input
                                    className="bg-white border border-[#D1D5DB] h-12 w-full rounded-xl pl-12 pr-4 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 transition-all shadow-sm"
                                    placeholder="Buscar pilar por nome ou líder..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                {['Todos', 'Ativos', 'Em Planejamento', 'Pausados'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-100'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pillars Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredPillars.map(pillar => {
                                const colors = getThemeColors(pillar.theme);
                                return (
                                    <div key={pillar.id} className="p-6 rounded-[16px] bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group border-l-4" style={{ borderLeftColor: pillar.theme === 'brand-orange' ? '#F97316' : '#2563EB' }}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 rounded-xl bg-gray-50 text-gray-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                                <pillar.icon size={32} />
                                            </div>
                                            <span className={`${getStatusStyle(pillar.status).replace('bg-slate-700/50', 'bg-gray-100').replace('text-white/70', 'text-gray-600')} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>
                                                {pillar.status}
                                            </span>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-[#111827] mb-1">{pillar.title}</h3>
                                            <p className="text-[#4B5563] text-sm mb-6 leading-relaxed">{pillar.description}</p>
                                        </div>
                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[#9CA3AF] font-bold uppercase tracking-wider flex items-center gap-2"><User size={14} /> Líder</span>
                                                <span className="text-[#374151] font-semibold">{pillar.leader}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[#9CA3AF] font-bold uppercase tracking-wider flex items-center gap-2"><Users size={14} /> Equipe</span>
                                                <span className="text-[#374151] font-semibold">{pillar.teamStatus}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#6B7280]">
                                                <span>{pillar.progressLabel}</span>
                                                <span>{pillar.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pillar.progress}%`, backgroundColor: pillar.theme === 'brand-orange' ? '#F97316' : '#2563EB' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <footer className="max-w-7xl mx-auto mt-12 border-t border-white/5 pt-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-white/60">
                            <p>© 2024 ADTAG Ministry Systems. All rights reserved.</p>
                            <div className="flex gap-4 mt-2 md:mt-0">
                                <a className="hover:text-white" href="#">Help Center</a>
                                <a className="hover:text-white" href="#">Privacy</a>
                                <a className="hover:text-white" href="#">Terms</a>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
};


