import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { firebase } from './services/firebase';
import { Login } from './components/Login.jsx';
import { Register } from './components/Register.jsx';
import { Profile } from './components/Profile.jsx';
import { BetForm } from './components/BetForm.jsx';
import { apiRequest } from './services/api';

const App = () => {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('login');
    const [error, setError] = useState('');
    const [errorType, setErrorType] = useState('error');

    useEffect(() => {
        console.log('Configurando listener de autenticação');
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            console.log('Estado de autenticação:', user ? `Usuário ${user.email}` : 'Nenhum usuário');
            if (user) {
                user.getIdToken(true).then(idToken => {
                    console.log('ID Token:', idToken);
                    // Adicionar atraso de 1 segundo
                    setTimeout(() => {
                        apiRequest('/user/profile', 'GET', null, idToken)
                            .then(data => {
                                console.log('Dados do perfil:', data);
                                setUser(data);
                                setPage('profile');
                            })
                            .catch(err => {
                                console.error('Erro ao buscar perfil:', err);
                                setError('Erro ao carregar perfil: ' + err.message);
                                firebase.auth().signOut();
                            });
                    }, 1000);
                }).catch(err => {
                    console.error('Erro ao obter token:', err);
                    setError('Erro ao obter token: ' + err.message);
                    firebase.auth().signOut();
                });
            } else {
                setUser(null);
                setPage('login');
            }
        }, err => {
            console.error('Erro no listener de autenticação:', err);
            setError('Erro na autenticação: ' + err.message);
        });
        return () => {
            console.log('Limpando listener de autenticação');
            unsubscribe();
        };
    }, []);

    const handleLogout = () => {
        console.log('Saindo...');
        firebase.auth().signOut().then(() => {
            setError('');
            setPage('login');
        }).catch(err => {
            setError('Erro ao sair: ' + err.message);
        });
    };

    const setErrorWithType = (message, type = 'error') => {
        setError(message);
        setErrorType(type);
    };

    const renderPage = () => {
        if (page === 'login') {
            return <Login setPage={setPage} setError={setErrorWithType} />;
        } else if (page === 'register') {
            return <Register setPage={setPage} setError={setErrorWithType} />;
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