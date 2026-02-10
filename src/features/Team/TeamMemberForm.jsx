import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { insertTeamMember } from '../../services/api';

export default function TeamMemberForm({ initial = null, onSaved = () => { } }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        type: 'staff',
        role: '',
        phone: '',
        birth_date: '',
        status: 'Ativo',
        avatar: '',
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initial) {
            setForm({
                name: initial.name ?? '',
                type: initial.type ?? 'staff',
                role: initial.role ?? '',
                phone: initial.phone ?? '',
                birth_date: initial.birth_date ? initial.birth_date.substring(0, 10) : '',
                status: initial.status ?? 'Ativo',
                avatar: initial.avatar ?? '',
            });
        }
    }, [initial]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const validate = () => {
        if (!form.name || form.name.trim().length < 2) {
            return 'Nome deve ter pelo menos 2 caracteres.';
        }
        const validTypes = ['staff', 'kid', 'volunteer', 'child', 'membro']; // Extended for app compatibility
        if (!validTypes.includes(form.type.toLowerCase())) {
            return 'Tipo inválido.';
        }
        return null;
    };

    const fetchMembers = async () => {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) console.error('fetchMembers error', error);
        return data ?? [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const v = validate();
        if (v) {
            setError(v);
            return;
        }
        setLoading(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            const payload = {
                name: form.name,
                type: form.type,
                role: form.role || null,
                phone: form.phone || null,
                birth_date: form.birth_date || null,
                status: form.status || 'Ativo',
                avatar: form.avatar || null,
                user_id: user?.id ?? null,
            };

            if (initial && initial.id) {
                // Update
                const { error: upErr } = await supabase
                    .from('team_members')
                    .update(payload)
                    .eq('id', initial.id);
                if (upErr) throw upErr;
            } else {
                // Insert via Edge Function (Secure)
                await insertTeamMember(payload);
            }

            const latest = await fetchMembers();
            onSaved(latest);
            setForm({
                name: '',
                type: 'staff',
                role: '',
                phone: '',
                birth_date: '',
                status: 'Ativo',
                avatar: '',
            });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Erro ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nome *</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tipo *</label>
                <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="staff">Staff/Líder</option>
                    <option value="volunteer">Voluntário</option>
                    <option value="kid">Criança/Membro</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Função</label>
                    <input
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Telefone</label>
                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <input
                        type="date"
                        name="birth_date"
                        value={form.birth_date}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <input
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Avatar (Emoji/Texto)</label>
                <input
                    name="avatar"
                    value={form.avatar}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: 👨‍🏫"
                />
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                    {loading ? 'Salvando...' : initial ? 'Atualizar Membro' : 'Salvar Novo Membro'}
                </button>
            </div>
        </form>
    );
}
