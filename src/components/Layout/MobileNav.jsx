import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, Wallet, Users } from 'lucide-react';

export const MobileNav = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'canvas', icon: LayoutDashboard, color: '#1E4BA1' },
        { id: 'calendar', icon: Calendar, color: '#FFCC00' },
        { id: 'budget', icon: Wallet, color: '#E11E86' },
        { id: 'team', icon: Users, color: '#8BC53F' },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] glass-drawer rounded-[2.5rem] p-3 px-8 flex justify-around z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 ring-1 ring-white/5 backdrop-blur-3xl">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="p-4 rounded-3xl transition-all relative active:scale-90"
                >
                    <tab.icon
                        size={26}
                        className={`transition-all duration-300 ${activeTab === tab.id ? 'scale-125' : 'text-slate-500 opacity-60'}`}
                        style={{ color: activeTab === tab.id ? tab.color : 'inherit' }}
                    />
                    {activeTab === tab.id && (
                        <motion.span
                            layoutId="mobile-nav-dot"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: tab.color,
                                boxShadow: `0 0 12px ${tab.color}80`
                            }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

