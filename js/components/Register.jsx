import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { firebase } from '../services/firebase';

export const Register = ({ setPage, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [passwordError, setPasswordError] = useState('');

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
        try {
            await apiRequest('/auth/register', 'POST', { email, password, name });
            console.log('Registro bem-sucedido');
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (err) {
            console.error('Erro de registro:', err);
            setError(err.message);
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
                    />
                    {passwordError && <p className="error">{passwordError}</p>}
                </div>
                <button type="submit" className="btn-primary">Registrar</button>
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