import axios from 'axios';

export const API_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
});

export function urlImagem(nomeArquivo) {
    return nomeArquivo ? `${API_URL}/uploads/${nomeArquivo}` : null;
}

export function mensagemErro(err) {
    return err.response?.data?.message || 'Não foi possível conectar com a API.';
}

export function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default api;
