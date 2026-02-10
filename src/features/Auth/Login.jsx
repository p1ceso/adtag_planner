import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/adtag-kids-logo.png';

export const Login = () => {
    const { signIn, signUp } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // For signup, first validate passwords match
            if (!isLogin) {
                if (password !== confirmPassword) {
                    throw new Error('As senhas não coincidem.');
                }

                // First validate password with the hardening middleware
                const checkRes = await fetch(`${import.meta.env.VITE_AUTH_MIDDLEWARE_URL}/check-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                const checkData = await checkRes.json();

                if (!checkData.ok) {
                    if (checkData.reason === 'too_short') {
                        throw new Error('A senha deve ter pelo menos 8 caracteres.');
                    } else if (checkData.reason === 'password_compromised') {
                        throw new Error(`Esta senha foi exposta em ${checkData.pwnedCount.toLocaleString()} vazamentos de dados. Por favor, escolha uma senha diferente.`);
                    } else if (checkData.reason === 'weak_password') {
                        throw new Error('Senha muito fraca. Use uma combinação de letras maiúsculas, minúsculas, números e símbolos.');
                    } else {
                        throw new Error('Não foi possível validar a senha. Tente novamente.');
                    }
                }
            }

            const { error } = isLogin
                ? await signIn({ email, password })
                : await signUp({ email, password });

            if (error) throw error;

            if (!isLogin) {
                alert('Verifique seu email para confirmar o cadastro!');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50">
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4">
                        <img src={logo} alt="ADTAG" className="h-16 w-auto object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                        {isLogin ? 'Entre para gerenciar seu ministério' : 'Comece a organizar seu time hoje'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="w-5 h-5 absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/50 border border-gray-200 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 rounded-xl py-3 pl-12 pr-4 outline-none transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Senha</label>
                        <div className="relative group">
                            <Lock className="w-5 h-5 absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/50 border border-gray-200 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 rounded-xl py-3 pl-12 pr-12 outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                            <label className="text-sm font-medium text-gray-700 ml-1">Confirmar Senha</label>
                            <div className="relative group">
                                <Lock className="w-5 h-5 absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-white/50 border border-gray-200 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 rounded-xl py-3 pl-12 pr-12 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-blue/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Entrar' : 'Cadastrar'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-gray-500 hover:text-brand-blue font-medium transition-colors"
                    >
                        {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
                    </button>
                </div>
            </div>
        </div>
    );
};
