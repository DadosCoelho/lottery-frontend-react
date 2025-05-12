import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Login } from './components/Login.jsx';
import { Register } from './components/Register.jsx';
import { Profile } from './components/Profile.jsx';
import { BetForm } from './components/BetForm.jsx';
import { apiRequest, authService } from './services/api';

const App = () => {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('login');
    const [error, setError] = useState('');
    const [errorType, setErrorType] = useState('error');
    const [loading, setLoading] = useState(true);

    // Verificar autenticação ao carregar
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                
                if (localStorage.getItem('auth_token')) {
                    try {
                        const response = await authService.getCurrentUser();
                        console.log('Dados do perfil:', response.user);
                        setUser(response.user);
                        setPage('profile');
                    } catch (err) {
                        console.error('Erro ao verificar autenticação:', err);
                        setError('Erro ao verificar autenticação: ' + err.message);
                        authService.logout();
                    }
                } else {
                    setUser(null);
                    setPage('login');
                }
            } catch (err) {
                console.error('Erro ao carregar aplicação:', err);
                setError('Erro ao inicializar aplicação: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogout = () => {
        console.log('Saindo...');
        authService.logout();
        setUser(null);
        setPage('login');
        setError('');
    };

    const setErrorWithType = (message, type = 'error') => {
        setError(message);
        setErrorType(type);
    };

    const renderPage = () => {
        if (loading) {
            return <div className="loading">Carregando...</div>;
        }
        
        if (page === 'login') {
            return <Login setPage={setPage} setError={setErrorWithType} setUser={setUser} />;
        } else if (page === 'register') {
            return <Register setPage={setPage} setError={setErrorWithType} setUser={setUser} />;
        } else if (page === 'profile' && user) {
            return <Profile user={user} setUser={setUser} setError={setErrorWithType} handleLogout={handleLogout} />;
        } else if (page === 'bet' && user) {
            return <BetForm user={user} setError={setErrorWithType} />;
        }
    };

    return (
        <div className="container">
            {error && (
                <div className={`alert ${errorType}`}>
                    {error}
                </div>
            )}
            {renderPage()}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));