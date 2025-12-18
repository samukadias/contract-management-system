import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const createPageUrl = (page) => {
    const routes = {
        "Dashboard": "/",
        "Contracts": "/contracts",
        "NewContract": "/contracts/new",
        "ViewContract": "/contracts/view",
        "EditContract": "/contracts/edit",
        "Analysis": "/analysis",
        "StageControl": "/stage-control",
        "Search": "/search",
        "DataManagement": "/data-management",
        "Timeline": "/timeline",
        "GestorDashboard": "/timeline", // Alias for Timeline
        "TermosConfirmacao": "/confirmation",
        "NewTC": "/confirmation/new",
        "ViewTC": "/confirmation/view",
        "EditTC": "/confirmation/edit",
        "Users": "/users",
        "UserManagement": "/users", // Alias
        "ClientDashboard": "/client-dashboard"
    };
    return routes[page] || "/";
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value || 0);
};

export const formatCompactCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: "compact",
        maximumFractionDigits: 2
    }).format(value || 0);
};
