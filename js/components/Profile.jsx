import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { firebase } from '../services/firebase';

export const Profile = ({ user, setUser, setError, handleLogout }) => {
    const [name, setName] = useState(user.name);
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        if (name.length < 2) {
            setError('O nome deve ter pelo menos 2 caracteres');
            return;
        }
        try {
            const token = await firebase.auth().currentUser.getIdToken(true);
            await apiRequest('/user/profile', 'PUT', { name }, token);
            console.log('Perfil atualizado');
            setUser({ ...user, name });
            setIsEditing(false);
        } catch (err) {
            console.error('Erro ao atualizar perfil:', err);
            setError(err.message);
        }
    };

    return (
        <div className="card">
            <h1>ConfLoto - Perfil</h1>
            {isEditing ? (
                <form onSubmit={handleUpdate}>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn-primary">Salvar</button>
                        <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <div>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {user.email}</p>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Nome:</strong> {user.name}</p>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Papel:</strong> {user.role}</p>
                    <p style={{ marginBottom: '1rem' }}><strong>Premium:</strong> {user.is_premium ? 'Sim' : 'Não'}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-primary" onClick={() => setIsEditing(true)}>
                            Editar Perfil
                        </button>
                        <button className="btn-danger" onClick={handleLogout}>
                            Sair
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};