import api from "../util/api";

function useProduto() {
    async function getAll() {
        const response = await api.get('/produto/getAll');
        return response.data;
    }

    async function getById(id) {
        const response = await api.get(`/produto/getById/${id}`);
        return response.data;
    }

    // produto é um FormData por causa da imagem
    async function create(produto) {
        const response = await api.post('/produto/create', produto);
        return response.data;
    }

    async function update(id, produto) {
        const response = await api.put(`/produto/update/${id}`, produto);
        return response.data;
    }

    async function remove(id) {
        const response = await api.delete(`/produto/delete/${id}`);
        return response.data;
    }

    return { getAll, getById, create, update, remove };
}

export default useProduto;
