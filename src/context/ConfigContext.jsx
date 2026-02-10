import React, { createContext, useContext, useState } from 'react';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({
        appName: "ADTAG KIDS",
        location: "Praça do Bicalho",
        theme: "SOU HERANÇA DO SENHOR",
        verse: "Salmos 127:3",
        year: 2026,
        colors: {
            primary: "bg-blue-600",
            secondary: "bg-emerald-600",
            accent: "bg-orange-500",
        },
        labels: {
            dashboard: "Painel & Visão",
            calendar: "Agenda Planner",
            budget: "Caixa Geral",
            snacks: "Cantina",
            team: "Equipe & Kids",
            tasks: "Tarefas",
        }
    });

    const updateConfig = (newConfig) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    };

    return (
        <ConfigContext.Provider value={{ config, updateConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

