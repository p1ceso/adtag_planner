import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
    CheckCircle, AlertCircle, Plus, AlertTriangle,
    Calendar, CalendarRange, Trash2
} from 'lucide-react';

export const TaskBoard = ({ tasks, refreshData }) => {
    const { user } = useAuth();
    const [activeType, setActiveType] = useState('urgente');
    const [notification, setNotification] = useState(null);
    const [newTaskText, setNewTaskText] = useState('');

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredTasks = tasks.filter(t => t.type === activeType);

    const toggleTask = async (task) => {
        try {
            await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id);
            await refreshData();
        } catch (error) {
            console.error(error);
            showNotification('Erro ao atualizar tarefa', 'error');
        }
    };

    const deleteTask = async (id) => {
        try {
            await supabase.from('tasks').delete().eq('id', id);
            await refreshData();
            showNotification('Tarefa removida com sucesso!');
        } catch (error) {
            console.error(error);
            showNotification('Erro ao remover tarefa', 'error');
        }
    };

    const handleAddTask = async () => {
        if (!newTaskText.trim()) {
            showNotification('Digite o texto da tarefa', 'error');
            return;
        }

        try {
            const newTask = {
                user_id: user.id,
                text: newTaskText,
                type: activeType,
                done: false
            };

            await supabase.from('tasks').insert([newTask]);
            await refreshData();
            setNewTaskText('');
            showNotification('Tarefa criada com sucesso!');
        } catch (error) {
            console.error(error);
            showNotification('Erro ao criar tarefa', 'error');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddTask();
        }
    };

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
                <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <motion.div variants={item} className="flex flex-col gap-2 text-left">
                <h2 className="text-3xl font-bold text-[#111827]">Checklist Ministerial</h2>
                <p className="text-[#6B7280]">Organize as demandas do departamento por urgência e periodicidade</p>
            </motion.div>

            {/* Add Task Input */}
            <motion.div variants={item} className="bg-white border border-gray-300 rounded-xl p-4 flex gap-3 shadow-sm">
                <input
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all"
                    placeholder="Adicionar nova tarefa..."
                    type="text"
                />
                <button
                    onClick={handleAddTask}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Adicionar
                </button>
            </motion.div>

            {/* Filter Pills */}
            <motion.div variants={item} className="flex gap-3 flex-wrap">
                {[
                    { id: 'urgente', label: 'Urgentes', icon: AlertTriangle },
                    { id: 'semanal', label: 'Semanal', icon: Calendar },
                    { id: 'mensal', label: 'Mensal', icon: CalendarRange }
                ].map(type => (
                    <button
                        key={type.id}
                        onClick={() => setActiveType(type.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeType === type.id
                            ? 'bg-white text-black border border-gray-200 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <type.icon size={18} />
                        {type.label}
                        {activeType === type.id && (
                            <span className="ml-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {tasks.filter(t => t.type === type.id && !t.done).length}
                            </span>
                        )}
                    </button>
                ))}
            </motion.div>

            {/* Task List */}
            <motion.div variants={container} className="space-y-3">
                <AnimatePresence mode="popLayout" initial={false}>
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={task.id}
                                className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex gap-3 items-start transition-all ${task.done ? 'opacity-50' : 'hover:shadow-md'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={task.done}
                                    onChange={() => toggleTask(task)}
                                    className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <p className={`text-[#1F2937] text-base transition-all ${task.done ? 'line-through text-gray-400' : ''}`}>
                                        {task.text}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {task.type === 'urgente' && (
                                            <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                                                Urgente
                                            </span>
                                        )}
                                        {task.type === 'semanal' && (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                                                Semanal
                                            </span>
                                        )}
                                        {task.type === 'mensal' && (
                                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                                                Mensal
                                            </span>
                                        )}
                                        {task.done && (
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                                                Concluída
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                                    title="Remover tarefa"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                <CheckCircle className="text-gray-300" size={48} />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-500">Nenhuma tarefa pendente</p>
                                <p className="text-sm text-gray-400 mt-1">Todas as tarefas desta categoria foram concluídas</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};
