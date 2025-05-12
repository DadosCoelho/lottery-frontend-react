import React, { useState } from 'react';
import { authService } from '../services/api';

export const Register = ({ setPage, setError, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return 'A senha deve ter pelo menos 8 caracteres';
        if (!/[A-Z]/.test(pwd)) return 'A senha deve ter pelo menos uma letra maiúscula';
        if (!/[0-9]/.test(pwd)) return 'A senha deve ter pelo menos um número';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const pwdError = validatePassword(password);
        if (pwdError) {
            setPasswordError(pwdError);
            return;
        }
        
        if (name.length < 2) {
            setError('O nome deve ter pelo menos 2 caracteres');
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Faz o registro através da API
            const response = await authService.register(name, email, password);
            console.log('Registro bem-sucedido:', response);
            
            // Atualiza estado do usuário no componente App
            setUser(response.user);
            setPage('profile');
            
            setIsLoading(false);
        } catch (err) {
            console.error('Erro de registro:', err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <h1>ConfLoto - Registro</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nome</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        minLength="2"
                        disabled={isLoading}
                    />
                </div>
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
                        onChange={e => {
                            setPassword(e.target.value);
                            setPasswordError(validatePassword(e.target.value));
                        }}
                        required
                        minLength="8"
                        disabled={isLoading}
                    />
                    {passwordError && <p className="error">{passwordError}</p>}
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Processando...' : 'Registrar'}
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Já tem conta?{' '}
                <span className="text-link" onClick={() => setPage('login')}>
                    Faça login
                </span>
            </p>
        </div>
    );
};