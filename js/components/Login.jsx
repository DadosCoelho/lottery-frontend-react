import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { firebase } from '../services/firebase';

export const Login = ({ setPage, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        console.log('Tentando login com:', email);
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('Login bem-sucedido para:', userCredential.user.email);
            const idToken = await userCredential.user.getIdToken();
            await apiRequest('/auth/login', 'POST', { idToken });
        } catch (err) {
            console.error('Erro de login:', err);
            setError(err.message);
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
                    />
                </div>
                <button type="submit" className="btn-primary">Entrar</button>
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