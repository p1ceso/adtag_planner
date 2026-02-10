import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
    CheckCircle, AlertCircle, Calendar, ChevronDown, Download,
    Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Search,
    ChevronLeft, ChevronRight, Save
} from 'lucide-react';

export const FinanceTracker = ({ currentYear, transactions, refreshData }) => {
    const { user } = useAuth();
    const [filterMonth, setFilterMonth] = useState('Março');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [notification, setNotification] = useState(null);
    const itemsPerPage = 10;

    // Local state for the form
    const [formData, setFormData] = useState({
        type: 'income',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Ofertas'
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDownload = () => {
        const csvContent = [
            ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'].join(','),
            ...transactions.map(t => [
                t.date,
                `"${t.description}"`,
                t.category,
                t.type === 'income' ? 'Entrada' : 'Saída',
                t.amount.toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `financeiro_${filterMonth}_${currentYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Relatório exportado com sucesso!');
    };

    const handleSave = async () => {
        if (!formData.description || !formData.amount) {
            showNotification('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        try {
            const newEntry = {
                user_id: user.id,
                ...formData,
                amount: parseFloat(formData.amount)
            };

            await supabase.from('finance_transactions').insert([newEntry]);
            await refreshData();

            setFormData({
                type: 'income',
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category: 'Ofertas'
            });
            showNotification('Transação adicionada com sucesso!');
        } catch (error) {
            console.error(error);
            showNotification('Erro ao salvar transação', 'error');
        }
    };

    const totals = transactions.reduce((acc, curr) => {
        if (curr.type === 'income') acc.income += curr.amount;
        else acc.expense += curr.amount;
        return acc;
    }, { income: 0, expense: 0 });

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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

            {/* Page Heading & Actions */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#111827]">Caixa Geral</h2>
                    <p className="text-[#6B7280] mt-1">Visão geral das finanças do ministério infantil</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-brand-orange" size={20} />
                        <select
                            value={`${filterMonth} ${currentYear}`}
                            onChange={(e) => setFilterMonth(e.target.value.split(' ')[0])}
                            className="pl-10 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option>Janeiro {currentYear}</option>
                            <option>Fevereiro {currentYear}</option>
                            <option>Março {currentYear}</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    <button
                        onClick={handleDownload}
                        className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-300 rounded-lg transition-all active:scale-95 hover:bg-gray-50"
                        title="Exportar CSV"
                    >
                        <Download className="block" size={24} />
                    </button>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Balance */}
                <motion.div
                    variants={item}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-200 border-l-4 border-l-blue-600 text-left cursor-default group"
                >
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="text-sm font-medium font-inter">Saldo Atual</span>
                            <Wallet className="bg-blue-50 text-blue-600 p-1.5 rounded-lg" size={24} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-[#111827] tracking-tight font-inter">{formatCurrency(totals.income - totals.expense)}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <TrendingUp size={14} /> +12%
                                </span>
                                <span className="text-gray-400 text-xs text-left">vs. mês anterior</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Total Incomes */}
                <motion.div
                    variants={item}
                    whileHover={{ y: -5 }}
                    className="rounded-xl bg-white border border-gray-200 border-l-4 border-l-emerald-500 p-6 shadow-sm text-left group"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="text-sm font-medium font-inter">Entradas Totais</span>
                            <ArrowDownToLine className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#111827] tracking-tight font-inter">{formatCurrency(totals.income)}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">+8%</span>
                                <span className="text-gray-400 text-xs">vs. mês anterior</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Total Expenses */}
                <motion.div
                    variants={item}
                    whileHover={{ y: -5 }}
                    className="rounded-xl bg-white border border-gray-200 border-l-4 border-l-red-500 p-6 shadow-sm text-left group"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="text-sm font-medium font-inter">Saídas Totais</span>
                            <ArrowUpFromLine className="text-red-600 bg-red-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#111827] tracking-tight font-inter">{formatCurrency(totals.expense)}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-red-600 text-sm font-medium flex items-center gap-1">-3%</span>
                                <span className="text-gray-400 text-xs">vs. mês anterior</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Area: Transactions & Quick Add */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction History Table */}
                <motion.div variants={item} className="lg:col-span-2 flex flex-col gap-4 text-left">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#111827]">Últimos Lançamentos</h3>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-brand-orange" size={18} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-orange/50 focus:border-transparent outline-none w-48 sm:w-64 transition-all"
                                placeholder="Buscar..."
                                type="text"
                            />
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto text-left">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F9FAFB] text-xs uppercase text-[#374151] font-bold border-b border-gray-200">
                                        <th className="px-6 py-4 whitespace-nowrap">Data</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Descrição</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Categoria</th>
                                        <th className="px-6 py-4 whitespace-nowrap text-right">Valor</th>
                                        <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <AnimatePresence mode='popLayout'>
                                        {paginatedTransactions.map(t => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                key={t.id}
                                                className="hover:bg-gray-50 transition-colors group cursor-default"
                                            >
                                                <td className="px-6 py-4 text-sm text-[#4B5563] whitespace-nowrap">{formatDate(t.date)}</td>
                                                <td className="px-6 py-4 text-sm text-[#111827] font-medium group-hover:text-brand-orange transition-colors">{t.description}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-all group-hover:scale-105 ${t.category === 'Ofertas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                        t.category === 'Alimentação' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                            t.category === 'Materiais' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                                'bg-gray-100 text-gray-700 border border-gray-200'
                                                        }`}>
                                                        {t.category}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-sm text-right font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className={`size-8 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                        {t.type === 'income' ? <ArrowDownToLine size={18} /> : <ArrowUpFromLine size={18} />}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 border-t border-gray-200 bg-[#F9FAFB] flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Mostrando {paginatedTransactions.length} de {filteredTransactions.length} transações
                                {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`size-8 flex items-center justify-center rounded-lg border border-gray-300 transition-all active:scale-95 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-white hover:text-gray-900'}`}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPages}
                                    className={`size-8 flex items-center justify-center rounded-lg border border-gray-300 transition-all active:scale-95 ${currentPage >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-white hover:text-gray-900'}`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Add Form */}
                <motion.div variants={item} className="flex flex-col gap-4 text-left">
                    <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-lg h-fit">
                        <h3 className="text-lg font-bold text-[#111827] mb-6">Nova Transação</h3>
                        <form className="flex flex-col gap-6">

                            {/* Amount Input - Big Number Style */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Valor da Transação</label>
                                <div className="flex items-end gap-2 border-b-2 border-slate-100 pb-2 transition-colors focus-within:border-brand-orange/50">
                                    <span className="text-3xl font-bold text-slate-300 mb-1">R$</span>
                                    <input
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full text-4xl font-bold text-[#111827] bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-200"
                                        placeholder="0,00"
                                        type="number"
                                    />
                                </div>
                            </div>

                            {/* Type Toggle Switches */}
                            <div className="grid grid-cols-2 gap-4">
                                <label className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={formData.type === 'income'}
                                        onChange={() => setFormData({ ...formData, type: 'income' })}
                                        className="peer sr-only"
                                    />
                                    <div className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-transparent bg-slate-50 text-slate-400 font-bold transition-all peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-emerald-500/20 group-hover:bg-slate-100 peer-checked:group-hover:bg-emerald-600">
                                        <div className="p-2 rounded-full bg-white/10">
                                            <ArrowDownToLine size={20} />
                                        </div>
                                        <span className="text-sm">Entrada</span>
                                    </div>
                                </label>
                                <label className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={formData.type === 'exit'}
                                        onChange={() => setFormData({ ...formData, type: 'exit' })}
                                        className="peer sr-only"
                                    />
                                    <div className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-transparent bg-slate-50 text-slate-400 font-bold transition-all peer-checked:bg-red-500 peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-red-500/20 group-hover:bg-slate-100 peer-checked:group-hover:bg-red-600">
                                        <div className="p-2 rounded-full bg-white/10">
                                            <ArrowUpFromLine size={20} />
                                        </div>
                                        <span className="text-sm">Saída</span>
                                    </div>
                                </label>
                            </div>

                            {/* Other Inputs */}
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Descrição</label>
                                    <input
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-orange/50 focus:border-transparent outline-none transition-all"
                                        placeholder="Ex: Oferta de Domingo"
                                        type="text"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Data</label>
                                        <input
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-brand-orange/50 focus:border-transparent outline-none transition-all [color-scheme:light]"
                                            type="date"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Categoria</label>
                                        <div className="relative">
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-brand-orange/50 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option>Ofertas</option>
                                                <option>Materiais</option>
                                                <option>Lanches</option>
                                                <option>Eventos</option>
                                                <option>Outros</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="mt-2 w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 active:scale-[0.98] group flex items-center justify-center gap-2 overflow-hidden relative"
                                type="button"
                            >
                                <Save className="group-hover:translate-x-1 transition-transform" size={24} />
                                Salvar Transação
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};


