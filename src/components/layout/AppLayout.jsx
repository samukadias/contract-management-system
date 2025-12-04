import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';

export default function AppLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Fixa */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Conteúdo Principal */}
            <div className="flex-1 ml-0 md:ml-72 transition-all duration-300 ease-in-out w-full">
                {/* Header Mobile com Botão de Menu */}
                <div className="md:hidden p-4 bg-white border-b flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <span className="font-bold text-lg">ContractPro</span>
                    </div>
                </div>

                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
