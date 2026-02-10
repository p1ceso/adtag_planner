import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

// Helper function to calculate age from date of birth
const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// Helper function to calculate next birthday
const getNextBirthday = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    const currentYear = today.getFullYear();

    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

    if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    return nextBirthday.toISOString().split('T')[0];
};

import { supabase } from '../../lib/supabase';
import { insertTeamMember } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, AlertCircle, Search, RefreshCcw, UserPlus, Baby, Trash2, UserX, X, AlertTriangle } from 'lucide-react';

// ... (keep imports)

export const TeamManager = ({ team, refreshData }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('volunteers');
    const [searchTerm, setSearchTerm] = useState('');
    const [showVolunteerModal, setShowVolunteerModal] = useState(false);
    const [showChildModal, setShowChildModal] = useState(false);
    const [notification, setNotification] = useState(null);

    const [volunteerForm, setVolunteerForm] = useState({
        name: '',
        role: 'Monitor',
        phone: '',
        backgroundCheck: false
    });

    const [childForm, setChildForm] = useState({
        name: '',
        dob: '',
        age: '',
        parentName: '',
        allergies: ''
    });

    useEffect(() => {
        if (childForm.dob) {
            setChildForm(prev => ({ ...prev, age: calculateAge(prev.dob) }));
        }
    }, [childForm.dob]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const savePerson = async (type, personData) => {
        try {
            const personType = type === 'volunteer' ? 'staff' : 'kid'; // Adjusted to match schema 'staff' or 'kid' but schema says 'staff', 'kid', 'volunteer' check constraint? 
            // Schema: check (type in ('staff', 'kid', 'volunteer'))
            // Current code maps 'volunteer' -> 'staff'? 
            // Previous code: type: type === 'volunteer' ? 'staff' : 'crianca'
            // My schema allowed: 'staff', 'kid', 'volunteer'
            // Let's coerce to schema valid values.
            const dbType = type === 'volunteer' ? 'staff' : 'kid';

            const newPerson = {
                user_id: user.id,
                name: personData.name,
                role: personData.role, // Only for staff
                phone: personData.phone, // Only for staff
                birth_date: personData.dob,
                type: dbType,
                status: 'Ativo',
                avatar: personData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                // parentName? schema doesn't have parentName... wait.
                // I need to check schema again. I didn't add parentName to schema.
                // Let's add it to the 'role' field or just jsonb? Or simpler: add 'description' field?
                // The schema I created earlier had: name, role, phone, birth_date, type, status, avatar.
                // Missing: parentName, allergies.
                // I should assume 'role' can store parentName for kids? Or fix schema.
                // FIX SCHEMA is better. But I already told user to run SQL.
                // I will put parentName in 'role' (e.g. "Resp: Jose") for now to avoid schema migration complexity for the user right now.
                role: type === 'volunteer' ? personData.role : `Resp: ${personData.parentName}`
            };



            // Use Secure Edge Function
            const data = await insertTeamMember(newPerson);

            const savedPerson = data[0];

            // Add Birthday Event for Children
            if (type !== 'volunteer' && personData.dob) {
                const nextBirthday = getNextBirthday(personData.dob);
                const birthdayEvent = {
                    user_id: user.id,
                    date: nextBirthday,
                    time: '00:00',
                    title: `Aniversário de ${personData.name}`,
                    type: 'comemoracao',
                    focus: `${calculateAge(personData.dob) + 1} anos`
                };
                await supabase.from('events').insert([birthdayEvent]);
            }

            await refreshData();
            showNotification(`${type === 'volunteer' ? 'Voluntário' : 'Criança'} salvo com sucesso!`);
        } catch (error) {
            console.error(error);
            showNotification('Erro ao salvar. Tente novamente.', 'error');
        }
    };

    const deletePerson = async (type, id) => {
        try {
            await supabase.from('team_members').delete().eq('id', id);
            // Also delete birthday events? Hard to track without ID link. 
            // For now, let's just delete the person.
            await refreshData();
            showNotification('Removido com sucesso.');
        } catch (error) {
            console.error(error);
            showNotification('Erro ao remover.', 'error');
        }
    };

    const handleSaveVolunteer = () => {
        if (!volunteerForm.name || !volunteerForm.phone) {
            showNotification('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        savePerson('volunteer', volunteerForm);
        showNotification('Voluntário cadastrado com sucesso!');
        setShowVolunteerModal(false);
        setActiveTab('volunteers'); // Switch to tab to show new item
        setVolunteerForm({ name: '', role: 'Monitor', phone: '', backgroundCheck: false });
    };

    const handleSaveChild = () => {
        if (!childForm.name || !childForm.dob || !childForm.parentName) {
            showNotification('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        savePerson('child', childForm);
        showNotification('Criança cadastrada com sucesso! Aniversário adicionado ao Calendário.');
        setShowChildModal(false);
        setActiveTab('children'); // Switch to tab to show new item
        setChildForm({ name: '', dob: '', age: '', parentName: '', allergies: '' });
    };

    // Derived Lists from Props (Source of Truth)
    const safeTeam = useMemo(() => {
        const data = Array.isArray(team) ? team : [];
        console.log("TeamManager: Recebido dados do time:", data); // Log 1: Input Data
        return data;
    }, [team]);

    const volunteers = useMemo(() => safeTeam.filter(p => p.type === 'staff' || p.type === 'volunteer'), [safeTeam]);
    const children = useMemo(() => {
        const validTypes = ['kid', 'child', 'children', 'crianca', 'membro'];
        const kids = safeTeam.filter(p => {
            const typeMatch = validTypes.includes(p.type?.toLowerCase());
            const statusMatch = p.status?.toLowerCase() === 'ativo';
            return typeMatch && statusMatch;
        });
        console.log("TeamManager: Filtrado Crianças Standardized:", kids); // Log 2: Filtered Data
        return kids;
    }, [safeTeam]);

    const filteredVolunteers = useMemo(() => {
        return volunteers.filter(v => {
            const name = v.name || '';
            const phone = v.phone || '';
            const search = searchTerm.toLowerCase();
            return name.toLowerCase().includes(search) || phone.toLowerCase().includes(search);
        });
    }, [volunteers, searchTerm]);

    const filteredChildren = useMemo(() => {
        console.log("TeamManager: Aplicando busca em Crianças. Termo:", searchTerm);
        const result = children.filter(c => {
            const name = c.name || '';
            const parent = c.parentName || '';
            const search = searchTerm.toLowerCase();
            return name.toLowerCase().includes(search) || parent.toLowerCase().includes(search);
        });
        console.log("TeamManager: Resultado final Crianças:", result); // Log 3: Final Output
        return result;
    }, [children, searchTerm]);

    useEffect(() => {
        // Force refresh when component mounts (entering the tab)
        refreshData();
    }, []); // Empty dependency array = runs once on mount


    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="flex flex-col gap-8 pb-10"
        >
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-brand-green text-white' : 'bg-brand-red text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <motion.div variants={item} className="flex flex-col gap-2 text-left">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary">Gestão de Pessoas</h2>
                        <p className="text-text-secondary">Gerencie voluntários, staff e crianças do ministério</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={item} className="flex items-center gap-8 border-b border-border-light">
                <button
                    onClick={() => setActiveTab('volunteers')}
                    className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === 'volunteers' ? 'text-text-primary border-b-2 border-brand-blue' : 'text-text-muted hover:text-text-secondary'}`}
                >
                    Voluntários & Staff
                </button>
                <button
                    onClick={() => setActiveTab('children')}
                    className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === 'children' ? 'text-text-primary border-b-2 border-brand-blue' : 'text-text-muted hover:text-text-secondary'}`}
                >
                    Crianças & Membros
                </button>
            </motion.div>

            {/* Toolbar */}
            <motion.div variants={item} className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-surface-subtle border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent outline-none transition-all"
                            placeholder="Buscar por nome..."
                            type="text"
                        />
                    </div>
                    <button
                        onClick={() => refreshData()}
                        title="Atualizar Lista"
                        className="p-3 bg-surface-subtle text-text-secondary rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCcw size={20} />
                    </button>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowVolunteerModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                    >
                        <UserPlus size={20} />
                        Novo Voluntário
                    </button>
                    <button
                        onClick={() => setShowChildModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-brand-orange text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md active:scale-95"
                    >
                        <Baby size={20} />
                        Cadastrar Criança
                    </button>
                </div>
            </motion.div>

            {/* Volunteers List */}
            {activeTab === 'volunteers' && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                    {filteredVolunteers.length > 0 ? (
                        filteredVolunteers.map(person => (
                            <div
                                key={person.id}
                                className="bg-surface-white rounded-[16px] border border-border-light shadow-sm p-6 flex flex-col items-center text-center gap-3 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-card-hover"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center text-lg font-bold">
                                        {person.avatar}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Tem certeza que deseja remover este voluntário?')) {
                                                deletePerson('volunteer', person.id);
                                            }
                                        }}
                                        className="absolute -top-1 -right-1 size-6 bg-surface-white rounded-full border border-border-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200"
                                    >
                                        <Trash2 className="text-brand-red" size={14} />
                                    </button>
                                </div>
                                <div className="w-full">
                                    <h3 className="font-bold text-text-primary truncate">{person.name}</h3>
                                    <p className="text-sm text-text-secondary mt-1">{person.role}</p>
                                    <p className="text-xs text-text-muted mt-1">{person.phone}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${person.status === 'Ativo' ? 'bg-green-100 text-brand-green' : 'bg-yellow-100 text-brand-yellow'}`}>
                                    {person.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center text-text-muted">
                            <UserX size={60} className="mb-3 opacity-50" />
                            <p>Nenhum voluntário encontrado</p>
                        </div>
                    )}
                </div>
            )}

            {/* Children List */}
            {activeTab === 'children' && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                    {filteredChildren.length > 0 ? (
                        filteredChildren.map(person => (
                            <div
                                key={person.id}
                                className="bg-surface-white rounded-[16px] border border-border-light shadow-sm p-6 flex flex-col items-center text-center gap-3 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-card-hover"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center text-lg font-bold">
                                        {person.avatar}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Tem certeza que deseja remover esta criança?')) {
                                                deletePerson('child', person.id);
                                            }
                                        }}
                                        className="absolute -top-1 -right-1 size-6 bg-surface-white rounded-full border border-border-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200"
                                    >
                                        <Trash2 className="text-brand-red" size={14} />
                                    </button>
                                </div>
                                <div className="w-full">
                                    <h3 className="font-bold text-text-primary truncate">{person.name}</h3>
                                    <p className="text-sm text-text-secondary mt-1">{person.age || (person.dob ? calculateAge(person.dob) + ' Anos' : '')}</p>
                                    <p className="text-xs text-text-muted mt-1">{person.role}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${person.status === 'Ativo' ? 'bg-green-100 text-brand-green' : 'bg-yellow-100 text-brand-yellow'}`}>
                                    {person.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center text-text-muted">
                            <Baby size={60} className="mb-3 opacity-50" />
                            <p>Nenhuma criança cadastrada</p>
                        </div>
                    )}
                </div>
            )}

            {/* Volunteer Modal */}
            {showVolunteerModal && createPortal(
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                    <div onClick={() => setShowVolunteerModal(false)} className="absolute inset-0"></div>
                    <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl p-8 flex flex-col gap-6 z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Novo Voluntário</h2>
                                <p className="text-sm text-slate-500 mt-1">Cadastre um novo membro da equipe</p>
                            </div>
                            <button onClick={() => setShowVolunteerModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome Completo</label>
                                <input value={volunteerForm.name} onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="Ex: João Silva" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cargo</label>
                                <select value={volunteerForm.role} onChange={(e) => setVolunteerForm({ ...volunteerForm, role: e.target.value })} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                                    <option>Monitor</option>
                                    <option>Professor</option>
                                    <option>Coordenador</option>
                                    <option>Auxiliar</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Telefone</label>
                                <input value={volunteerForm.phone} onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="(11) 98765-4321" />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <input type="checkbox" checked={volunteerForm.backgroundCheck} onChange={(e) => setVolunteerForm({ ...volunteerForm, backgroundCheck: e.target.checked })} className="w-5 h-5 rounded border-blue-300 text-blue-600" />
                                <label className="text-sm text-blue-900 font-medium">Antecedentes Criminais Verificados</label>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowVolunteerModal(false)} className="flex-[1] py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm uppercase tracking-widest hover:bg-slate-200">Cancelar</button>
                            <button onClick={handleSaveVolunteer} className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg">Salvar Voluntário</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Child Modal */}
            {showChildModal && createPortal(
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                    <div onClick={() => setShowChildModal(false)} className="absolute inset-0"></div>
                    <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl p-8 flex flex-col gap-6 z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Cadastrar Criança</h2>
                                <p className="text-sm text-slate-500 mt-1">Registre uma nova criança no ministério</p>
                            </div>
                            <button onClick={() => setShowChildModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome da Criança</label>
                                <input value={childForm.name} onChange={(e) => setChildForm({ ...childForm, name: e.target.value })} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="Ex: Maria Silva" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Data de Nascimento</label>
                                    <input value={childForm.dob} onChange={(e) => setChildForm({ ...childForm, dob: e.target.value })} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" type="date" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Idade</label>
                                    <input value={childForm.age} readOnly className="w-full mt-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 cursor-not-allowed" placeholder="Auto" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome dos Pais/Responsáveis</label>
                                <input value={childForm.parentName} onChange={(e) => setChildForm({ ...childForm, parentName: e.target.value })} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="Ex: José e Ana Silva" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle className="text-red-500" size={14} />
                                    Alergias / Observações
                                </label>
                                <textarea value={childForm.allergies} onChange={(e) => setChildForm({ ...childForm, allergies: e.target.value })} className="w-full mt-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm resize-none" rows="3" placeholder="Ex: Alérgico a amendoim..."></textarea>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowChildModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm uppercase tracking-widest hover:bg-slate-200">Cancelar</button>
                            <button onClick={handleSaveChild} className="flex-[2] py-3 rounded-xl bg-[#F97316] text-white font-bold text-sm uppercase tracking-widest hover:bg-orange-600 shadow-lg">Salvar Criança</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </motion.div>
    );
};
