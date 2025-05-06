export async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Erro na requisição');
        }
        return result;
    } catch (err) {
        throw err;
    }
}