import api from "../util/api";

function useVenda() {
    async function finalizar(carrinhoId, formaPagamento) {
        const response = await api.post('/venda/finalizar', { carrinhoId, formaPagamento });
        return response.data.venda;
    }

    async function getAll() {
        const response = await api.get('/venda/getAll');
        return response.data;
    }

    async function getById(id) {
        const response = await api.get(`/venda/getById/${id}`);
        return response.data;
    }

    return { finalizar, getAll, getById };
}

export default useVenda;
