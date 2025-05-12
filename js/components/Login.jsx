import React, { useState } from 'react';
import { authService } from '../services/api';

export const Login = ({ setPage, setError, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            console.log('Tentando login com:', email);
            // Chama a API para fazer login
            const response = await authService.login(email, password);
            console.log('Login bem-sucedido para:', email);
            
            // Atualiza estado do usuário no componente App
            setUser(response.user);
            setPage('profile');
            
            setIsLoading(false);
        } catch (err) {
            console.error('Erro de login:', err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <h1>ConfLoto - Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Senha</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength="8"
                        disabled={isLoading}
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Processando...' : 'Entrar'}
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Não tem conta?{' '}
                <span className="text-link" onClick={() => setPage('register')}>
                    Registre-se
                </span>
            </p>
        </div>
    );
};