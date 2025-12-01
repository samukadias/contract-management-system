import React from 'react';
import { Sidebar } from './Sidebar';

export default function AppLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Fixa */}
            <Sidebar />

            {/* Conteúdo Principal */}
            <div className="flex-1 ml-72 transition-all duration-300 ease-in-out">
                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
