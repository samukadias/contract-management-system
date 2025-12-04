import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoggingIn(true);
        const success = await login(email, password);

        if (success) {
            // O redirecionamento será tratado pelo componente de rotas protegidas ou aqui mesmo
            // Mas vamos deixar o AuthContext atualizar o estado primeiro
        }
        setIsLoggingIn(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-800 to-black p-4">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                        Acesso ao Sistema
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Digite seu email corporativo para entrar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    placeholder="seu.nome@empresa.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    placeholder="••••••••"
                                    type="password"
                                    autoComplete="current-password"
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar no Sistema
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center text-sm text-gray-500 pt-4 border-t bg-gray-50/50 rounded-b-xl">
                    <p>
                        Não tem acesso? Entre em contato com o administrador.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
