import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Dashboard from './pages/Dashboard';
import Contracts from './pages/Contracts';
import NewContract from './pages/NewContract';
import ViewContract from './pages/ViewContract';
import EditContract from './pages/EditContract';
import Analysis from './pages/Analysis';
import StageControl from './pages/StageControl';
import Search from './pages/Search';
import DataManagement from './pages/DataManagement';
import Timeline from './pages/Timeline';
import Confirmation from './pages/Confirmation';
import NewTC from './pages/NewTC';
import ViewTC from './pages/ViewTC';
import EditTC from './pages/EditTC';
import Users from './pages/Users';
import ClientDashboard from './pages/ClientDashboard';

// Components
import AppLayout from './components/layout/AppLayout';
import { Toaster } from 'sonner';


// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-lg">
                    <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
                    <p className="text-red-700 mb-4">The application encountered an error:</p>
                    <pre className="bg-white p-4 rounded border border-red-100 overflow-auto text-sm text-red-600 font-mono">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <details className="mt-4 text-sm text-red-500">
                        <summary>Stack Trace</summary>
                        <pre className="mt-2 whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AnalystDashboard from './pages/AnalystDashboard';
import { Navigate, useLocation } from 'react-router-dom';

// Componente para rotas protegidas
const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Carregando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.perfil)) {
        // Redirecionar para o dashboard apropriado se não tiver permissão
        if (user.perfil === 'ANALISTA') return <Navigate to="/analyst-dashboard" replace />;
        if (user.perfil === 'CLIENTE') return <Navigate to="/client-dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

// Layout Wrapper que decide se mostra o Sidebar ou não
const LayoutWrapper = ({ children }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    if (isLoginPage) {
        return children;
    }

    return <AppLayout>{children}</AppLayout>;
};

function AppRoutes() {
    const { user } = useAuth();

    return (
        <LayoutWrapper>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

                {/* Rotas Protegidas */}
                <Route path="/" element={
                    <PrivateRoute>
                        {user?.perfil === 'ANALISTA' ? <Navigate to="/analyst-dashboard" replace /> :
                            user?.perfil === 'CLIENTE' ? <Navigate to="/client-dashboard" replace /> :
                                <Dashboard />}
                    </PrivateRoute>
                } />

                <Route path="/analyst-dashboard" element={
                    <PrivateRoute allowedRoles={['ANALISTA', 'GESTOR']}>
                        <AnalystDashboard />
                    </PrivateRoute>
                } />

                <Route path="/client-dashboard" element={
                    <PrivateRoute allowedRoles={['CLIENTE', 'GESTOR']}>
                        <ClientDashboard />
                    </PrivateRoute>
                } />

                <Route path="/contracts" element={<PrivateRoute><Contracts /></PrivateRoute>} />
                <Route path="/contracts/new" element={<PrivateRoute><NewContract /></PrivateRoute>} />
                <Route path="/contracts/view" element={<PrivateRoute><ViewContract /></PrivateRoute>} />
                <Route path="/contracts/edit" element={<PrivateRoute><EditContract /></PrivateRoute>} />

                <Route path="/analysis" element={<PrivateRoute allowedRoles={['GESTOR']}><Analysis /></PrivateRoute>} />
                <Route path="/stage-control" element={<PrivateRoute><StageControl /></PrivateRoute>} />
                <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
                <Route path="/data-management" element={<PrivateRoute allowedRoles={['GESTOR']}><DataManagement /></PrivateRoute>} />
                <Route path="/timeline" element={<PrivateRoute allowedRoles={['GESTOR', 'ANALISTA']}><Timeline /></PrivateRoute>} />

                <Route path="/confirmation" element={<PrivateRoute><Confirmation /></PrivateRoute>} />
                <Route path="/confirmation/new" element={<PrivateRoute><NewTC /></PrivateRoute>} />
                <Route path="/confirmation/view" element={<PrivateRoute><ViewTC /></PrivateRoute>} />
                <Route path="/confirmation/edit" element={<PrivateRoute><EditTC /></PrivateRoute>} />

                <Route path="/users" element={<PrivateRoute allowedRoles={['GESTOR']}><Users /></PrivateRoute>} />
            </Routes>
            <Toaster />
        </LayoutWrapper>
    );
}

const queryClient = new QueryClient();

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
