import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
    CheckCircle, X, Rocket, CalendarCheck, UtensilsCrossed,
    PlusCircle, Trash2, AlertTriangle
} from 'lucide-react';

export const SnackCalculator = ({ events, snacks, refreshData, currentYear }) => {
    const { user } = useAuth();
    const [notification, setNotification] = useState(null);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

    const [newItemDoc, setNewItemDoc] = useState({
        name: '',
        qty: '',
        cost: '',
        price: ''
    });

    // Use props snacks if available, otherwise empty (loading from DB should be handled by parent)
    const items = snacks && snacks.length > 0 ? snacks : [];

    // NEW: Dynamic Extra Expenses State (Local Scratchpad)
    const [extraExpenses, setExtraExpenses] = useState([
        { id: 'default-1', description: 'Despesas Gerais (Guardanapos, etc)', amount: 45.00 }
    ]);

    const calculateTotals = () => {
        // Sum Extra Expenses
        const totalExtraExpenses = extraExpenses.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

        let totalCost = totalExtraExpenses;
        let totalRevenue = 0;

        items.forEach(item => {
            totalCost += (item.qty || 0) * (item.cost || 0);
            totalRevenue += (item.qty || 0) * (item.price || 0);
        });

        const profit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return { totalCost, totalRevenue, profit, margin };
    };

    const { totalCost, totalRevenue, profit, margin } = calculateTotals();

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUpdateItem = async (id, field, value) => {
        try {
            await supabase.from('snacks').update({ [field]: value }).eq('id', id);
            refreshData();
        } catch (error) {
            console.error(error);
            showNotification('Erro ao atualizar item', 'error');
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await supabase.from('snacks').delete().eq('id', id);
            refreshData();
            showNotification('Item removido com sucesso!');
        } catch (error) {
            console.error(error);
            showNotification('Erro ao remover item', 'error');
        }
    };

    // NEW: Handlers for Extra Expenses
    const handleAddExpense = () => {
        const newExpense = {
            id: Date.now(),
            description: '',
            amount: ''
        };
        setExtraExpenses([...extraExpenses, newExpense]);
    };

    const handleUpdateExpense = (id, field, value) => {
        setExtraExpenses(extraExpenses.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleDeleteExpense = (id) => {
        setExtraExpenses(extraExpenses.filter(item => item.id !== id));
    };

    const handleAddItem = async () => {
        if (!newItemDoc.name) return;

        try {
            const newItem = {
                user_id: user.id,
                name: newItemDoc.name,
                qty: parseInt(newItemDoc.qty) || 0,
                cost: parseFloat(newItemDoc.cost) || 0,
                price: parseFloat(newItemDoc.price) || 0,
                icon: 'restaurant'
            };

            await supabase.from('snacks').insert([newItem]);
            await refreshData();

            setShowAddItemModal(false);
            setNewItemDoc({ name: '', qty: '', cost: '', price: '' });
            showNotification('Item adicionado com sucesso!');
        } catch (error) {
            console.error(error);
            showNotification('Erro ao adicionar item', 'error');
        }
    };

    const handleLaunchFinance = async () => {
        try {
            const newExpense = {
                user_id: user.id,
                description: 'Custos Totais - Planejamento Cantina',
                amount: totalCost,
                type: 'expense', // DB expects 'exit' or 'income'? check FinanceTracker. 
                // FinanceTracker used 'type'='exit' for negative.
                // Ah, FinanceTracker logic: t.type === 'income' ? ... else ...
                // The form in FinanceTracker uses 'income' and 'exit'.
                // So I should use 'exit' for expense.
                // Wait, my formData default was 'income'. 
                // Let's verify FinanceTracker logic. 
                // `t.type === 'income' ? 'bg-emerald-100...' : 'bg-red-100...'`
                // `t.type === 'income' ? 'Entrada' : 'Saída'`
                // So 'exit' is correct for expense.
                type: 'exit',
                date: eventDate,
                category: 'Alimentação'
            };
            const newIncome = {
                user_id: user.id,
                description: 'Receita Projetada - Vendas Cantina',
                amount: totalRevenue,
                type: 'income',
                date: eventDate,
                category: 'Vendas' // or 'Cantina' if category enum strict? schema didn't enforce enum on category usually.
            };

            await supabase.from('finance_transactions').insert([newExpense, newIncome]);
            await refreshData();
            showNotification('Custos e Receitas lançados com sucesso!');
        } catch (error) {
            console.error(error);
            showNotification('Erro ao lançar finanças', 'error');
        }
    };

    const handleSyncCalendar = async () => {
        try {
            const newEvent = {
                user_id: user.id,
                date: eventDate,
                time: '19:00',
                title: 'Planejamento Cantina',
                type: 'Local',
                focus: `Lucro Projetado: R$ ${profit.toFixed(2)}`
            };
            await supabase.from('events').insert([newEvent]);
            await refreshData();
            showNotification('Evento criado no Calendário para ' + eventDate.split('-').reverse().join('/'));
        } catch (error) {
            console.error(error);
            showNotification('Erro ao sincronizar calendário', 'error');
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-brand-green text-white' : 'bg-brand-blue text-white'}`}>
                    <CheckCircle size={20} />
                    <span className="font-bold text-sm">{notification.message}</span>
                </div>
            )}

            {/* Add Item Modal */}
            {showAddItemModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        onClick={() => setShowAddItemModal(false)}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    ></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] p-8 flex flex-col gap-6 z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-text-primary">Adicionar Novo Item</h2>
                                <p className="text-sm text-text-muted mt-1">Cadastre um item do cardápio</p>
                            </div>
                            <button
                                onClick={() => setShowAddItemModal(false)}
                                className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-full hover:bg-slate-50"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Nome do Item</label>
                                <input
                                    value={newItemDoc.name}
                                    onChange={(e) => setNewItemDoc({ ...newItemDoc, name: e.target.value })}
                                    className="w-full mt-2 px-4 py-3 bg-surface-subtle border border-border-light rounded-xl text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all"
                                    placeholder="Ex: Pipoca Gourmet"
                                    type="text"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Quantidade</label>
                                <input
                                    value={newItemDoc.qty}
                                    onChange={(e) => setNewItemDoc({ ...newItemDoc, qty: e.target.value })}
                                    className="w-full mt-2 px-4 py-3 bg-surface-subtle border border-border-light rounded-xl text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all"
                                    placeholder="0"
                                    type="number"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Custo Unitário</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">R$</span>
                                    <input
                                        value={newItemDoc.cost}
                                        onChange={(e) => setNewItemDoc({ ...newItemDoc, cost: e.target.value })}
                                        className="w-full mt-2 pl-10 pr-4 py-3 bg-surface-subtle border border-border-light rounded-xl text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all"
                                        placeholder="0,00"
                                        step="0.01"
                                        type="number"
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Preço de Venda</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green font-bold">R$</span>
                                    <input
                                        value={newItemDoc.price}
                                        onChange={(e) => setNewItemDoc({ ...newItemDoc, price: e.target.value })}
                                        className="w-full mt-2 pl-10 pr-4 py-3 bg-surface-subtle border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 placeholder-emerald-300 focus:ring-2 focus:ring-brand-green/50 outline-none transition-all"
                                        placeholder="0,00"
                                        step="0.01"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowAddItemModal(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddItem}
                                className="flex-[2] py-3 rounded-xl bg-brand-orange text-white font-bold text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-brand-orange/20"
                            >
                                Salvar Item
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface-white border border-border-light p-6 rounded-xl shadow-sm text-left">
                <div className="flex flex-col gap-2">
                    <h1 className="text-text-primary text-3xl font-bold tracking-tight">Calculadora de Cantina</h1>
                    <p className="text-text-secondary text-sm max-w-lg">
                        Estime custos e projete lucros para seus eventos ministeriais
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Data da Cantina</label>
                        <input
                            className="w-full px-4 py-3 bg-surface-white border border-border-light rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all [color-scheme:light]"
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleLaunchFinance}
                        className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                    >
                        <Rocket size={20} />
                        Lançar no Livro Caixa
                    </button>
                    <button
                        onClick={handleSyncCalendar}
                        className="flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                    >
                        <CalendarCheck size={20} />
                        Sincronizar
                    </button>
                </div>
            </div>

            {/* Main Calculator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Items */}
                <div className="lg:col-span-2 flex flex-col gap-6 text-left">


                    {/* Items List */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-text-primary text-lg font-bold flex items-center gap-2">
                                <UtensilsCrossed className="text-brand-orange" size={24} />
                                Itens do Cardápio
                            </h3>
                            <button
                                onClick={() => setShowAddItemModal(true)}
                                className="bg-brand-green hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
                            >
                                <PlusCircle size={16} />
                                Adicionar Item
                            </button>
                        </div>

                        {items.map(item => (
                            <div key={item.id} className="bg-surface-white border border-border-light rounded-xl p-4 md:p-5 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4 text-left">
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Nome do Item</label>
                                        <div className="flex items-center bg-surface-subtle rounded-lg border border-border-light px-3 py-2">
                                            <UtensilsCrossed className="text-text-muted mr-2" size={20} />
                                            <input
                                                className="bg-transparent border-none w-full text-text-primary text-sm focus:ring-0 p-0"
                                                value={item.name}
                                                onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 text-left">
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Qtd</label>
                                        <input
                                            className="w-full bg-surface-subtle rounded-lg border border-border-light text-text-primary text-sm px-3 py-2 focus:ring-2 focus:ring-brand-blue/50 outline-none"
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="md:col-span-2 text-left">
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Custo (Un)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">R$</span>
                                            <input
                                                className="w-full bg-surface-subtle rounded-lg border border-border-light text-text-primary text-sm pl-8 pr-3 py-2 focus:ring-2 focus:ring-brand-blue/50 outline-none"
                                                type="number"
                                                value={item.cost}
                                                onChange={(e) => handleUpdateItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 text-left">
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Preço Venda</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">R$</span>
                                            <input
                                                className="w-full bg-surface-subtle rounded-lg border border-border-light text-text-primary text-sm pl-8 pr-3 py-2 font-bold focus:ring-2 focus:ring-brand-blue/50 outline-none"
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex justify-end pb-1">
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors active:scale-95"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                {/* Item Footer Stats */}
                                <div className="mt-4 pt-4 border-t border-border-light bg-surface-subtle -mx-5 -mb-5 px-5 py-3 rounded-b-xl flex flex-wrap gap-4 text-xs md:text-sm">
                                    <div className="flex items-center gap-1 text-text-secondary">
                                        <span>Custo Total:</span>
                                        <span className="text-text-primary font-medium">R$ {(item.qty * item.cost).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-text-secondary">
                                        <span>Receita Est. :</span>
                                        <span className="text-text-primary font-medium">R$ {(item.qty * item.price).toFixed(2)}</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-text-secondary">Lucro:</span>
                                        <span className="text-brand-green font-bold">+R$ {(item.qty * (item.price - item.cost)).toFixed(2)}</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                            {item.price > 0 ? (((item.price - item.cost) / item.price) * 100).toFixed(0) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div id="lista-custos-extras" className="bg-orange-50 border border-orange-200 rounded-xl p-4 md:p-5 shadow-sm text-left">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="text-brand-orange" size={16} />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Despesas Extras / Operacionais</h3>
                                </div>
                                <button
                                    onClick={handleAddExpense}
                                    className="px-3 py-1.5 rounded-lg border border-border-light text-text-secondary bg-white hover:bg-surface-subtle text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    + Adicionar Despesa
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                {extraExpenses.map((expense) => (
                                    <div key={expense.id} className="flex flex-col md:flex-row gap-3 items-end md:items-center">
                                        <div className="flex-1 w-full">
                                            <input
                                                value={expense.description}
                                                onChange={(e) => handleUpdateExpense(expense.id, 'description', e.target.value)}
                                                placeholder="Descrição (ex: Gás de Cozinha)"
                                                className="w-full bg-white rounded-lg border border-border-light text-text-primary text-sm px-3 py-2.5 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="w-[150px] relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">R$</span>
                                            <input
                                                type="number"
                                                value={expense.amount}
                                                onChange={(e) => handleUpdateExpense(expense.id, 'amount', e.target.value)}
                                                className="input-valor-extra w-full bg-white rounded-lg border border-border-light text-text-primary text-sm pl-8 pr-3 py-2.5 font-bold text-right focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all"
                                                placeholder="0,00"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleDeleteExpense(expense.id)}
                                            className="p-2.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Financial Panel */}
                <div className="lg:col-span-1 text-left">
                    <div className="sticky top-6 flex flex-col gap-6">
                        {/* Financial Overview */}
                        <div className="bg-surface-white border border-border-light rounded-xl p-6 shadow-sm">
                            <h3 className="text-text-primary text-lg font-bold mb-6">Projeção Financeira</h3>
                            <div className="flex flex-col gap-4">
                                {/* Donut Chart */}
                                <div className="flex justify-center py-4">
                                    <div
                                        className="relative size-40 rounded-full border-[12px] border-surface-subtle flex items-center justify-center"
                                        style={{
                                            background: `conic-gradient(#2559A6 0% ${margin.toFixed(0)}%, #E5E7EB ${margin.toFixed(0)}% 100%)`
                                        }}
                                    >
                                        <div className="absolute inset-0 m-auto size-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                            <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Margem</span>
                                            <span className="text-text-primary text-3xl font-black">{margin.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 mt-2">
                                    <div className="flex justify-between items-center py-2 border-b border-border-light">
                                        <div className="flex items-center gap-2">
                                            <div className="size-3 rounded-full bg-brand-orange"></div>
                                            <span className="text-text-secondary text-sm">Custo Total</span>
                                        </div>
                                        <span id="display-custo-total" className="text-text-primary font-bold">R$ {totalCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border-light">
                                        <div className="flex items-center gap-2">
                                            <div className="size-3 rounded-full bg-brand-blue"></div>
                                            <span className="text-text-secondary text-sm">Receita Est.</span>
                                        </div>
                                        <span className="text-text-primary font-bold">R$ {totalRevenue.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-text-secondary text-sm font-medium">Lucro Projetado</span>
                                        <div className="text-right">
                                            <span id="display-lucro" className={`block text-2xl font-black ${profit >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                                                {profit >= 0 ? '+' : ''}R$ {profit.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Tip section removed */}
                            </div>
                        </div>

                        {/* Sync to Calendar Card */}
                        {/* Sync to Calendar Card REMOVED */}
                    </div>
                </div>
            </div>
        </div>
    );
};
