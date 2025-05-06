import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { firebase } from '../services/firebase';

export const BetForm = ({ user, setError }) => {
    const [modality, setModality] = useState('Mega-Sena');
    const [numbers, setNumbers] = useState([]);
    const [clovers, setClovers] = useState([]);
    const [initialContest, setInitialContest] = useState('');
    const [finalContest, setFinalContest] = useState('');

    const validateNumbers = () => {
        if (modality === 'Mega-Sena') {
            return numbers.length === 6 && numbers.every(n => n >= 1 && n <= 60);
        } else if (modality === '+Milionária') {
            return (
                numbers.length === 6 &&
                numbers.every(n => n >= 1 && n <= 50) &&
                clovers.length === 2 &&
                clovers.every(c => c >= 1 && c <= 6)
            );
        } else if (modality === 'Lotofácil') {
            return numbers.length === 15 && numbers.every(n => n >= 1 && n <= 25);
        } else if (modality === 'Quina') {
            return numbers.length === 5 && numbers.every(n => n >= 1 && n <= 80);
        } else if (modality === 'Dia de Sorte') {
            return numbers.length === 7 && numbers.every(n => n >= 1 && n <= 31);
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateNumbers()) {
            setError('Números ou trevos inválidos para a modalidade selecionada');
            return;
        }
        try {
            const token = await firebase.auth().currentUser.getIdToken(true);
            const result = await apiRequest('/bet/create', 'POST', {
                modality,
                initial_contest: initialContest,
                final_contest: finalContest,
                numbers,
                clovers
            }, token);
            setError('Aposta criada com sucesso!', 'success');
            console.log('Aposta criada:', result);
        } catch (err) {
            console.error('Erro ao criar aposta:', err);
            setError(err.message);
        }
    };

    return (
        <div className="card">
            <h1>Criar Aposta</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="modality">Modalidade</label>
                    <select id="modality" value={modality} onChange={e => setModality(e.target.value)}>
                        <option value="Mega-Sena">Mega-Sena</option>
                        <option value="+Milionária">+Milionária</option>
                        <option value="Lotofácil">Lotofácil</option>
                        <option value="Quina">Quina</option>
                        <option value="Dia de Sorte">Dia de Sorte</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="numbers">Números (separados por vírgula)</label>
                    <input
                        type="text"
                        id="numbers"
                        value={numbers.join(',')}
                        onChange={e => setNumbers(e.target.value.split(',').map(Number).filter(n => !isNaN(n)))}
                        required
                    />
                </div>
                {modality === '+Milionária' && (
                    <div className="form-group">
                        <label htmlFor="clovers">Trevos (separados por vírgula)</label>
                        <input
                            type="text"
                            id="clovers"
                            value={clovers.join(',')}
                            onChange={e => setClovers(e.target.value.split(',').map(Number).filter(n => !isNaN(n)))}
                            required
                        />
                    </div>
                )}
                <div className="form-group">
                    <label htmlFor="initialContest">Concurso Inicial</label>
                    <input
                        type="text"
                        id="initialContest"
                        value={initialContest}
                        onChange={e => setInitialContest(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="finalContest">Concurso Final</label>
                    <input
                        type="text"
                        id="finalContest"
                        value={finalContest}
                        onChange={e => setFinalContest(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary">Criar Aposta</button>
            </form>
        </div>
    );
};