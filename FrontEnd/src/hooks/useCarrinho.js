import api from "../util/api";

function useCarrinho() {
    async function create() {
        const response = await api.post('/carrinho/create');
        return response.data.carrinho;
    }

    async function getById(id) {
        const response = await api.get(`/carrinho/getById/${id}`);
        return response.data;
    }

    async function adicionarItem(id, produtoId, quantidade = 1) {
        const response = await api.post(`/carrinho/${id}/adicionarItem`, { produtoId, quantidade });
        return response.data.carrinho;
    }

    async function atualizarItem(id, itemId, quantidade) {
        const response = await api.put(`/carrinho/${id}/atualizarItem/${itemId}`, { quantidade });
        return response.data.carrinho;
    }

    async function removerItem(id, itemId) {
        const response = await api.delete(`/carrinho/${id}/removerItem/${itemId}`);
        return response.data.carrinho;
    }

    async function limpar(id) {
        const response = await api.delete(`/carrinho/${id}/limpar`);
        return response.data.carrinho;
    }

    return { create, getById, adicionarItem, atualizarItem, removerItem, limpar };
}

export default useCarrinho;
