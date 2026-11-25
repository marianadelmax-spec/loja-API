import { useEffect, useRef, useState } from "react";
import useProduto from "../../hooks/useProduto";
import useCarrinho from "../../hooks/useCarrinho";
import useVenda from "../../hooks/useVenda";
import { formatarPreco, mensagemErro, urlImagem } from "../../util/api";

const formasPagamento = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"];

const Home = () => {
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState(null);
    const [busca, setBusca] = useState("");
    const [formaPagamento, setFormaPagamento] = useState("Pix");
    const [vendaFinalizada, setVendaFinalizada] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const iniciou = useRef(false);

    const produtoApi = useProduto();
    const carrinhoApi = useCarrinho();
    const vendaApi = useVenda();

    // reaproveita o carrinho salvo no navegador, ou cria um novo
    async function iniciarCarrinho() {
        const idSalvo = localStorage.getItem("carrinhoId");

        if (idSalvo) {
            try {
                const salvo = await carrinhoApi.getById(idSalvo);
                if (salvo.status === "aberto") {
                    setCarrinho(salvo);
                    return;
                }
            } catch (err) {
                // carrinho não existe mais, cria outro abaixo
            }
        }

        const novo = await carrinhoApi.create();
        localStorage.setItem("carrinhoId", novo.id);
        setCarrinho(novo);
    }

    useEffect(() => {
        // evita criar dois carrinhos no modo de desenvolvimento (StrictMode)
        if (iniciou.current) return;
        iniciou.current = true;

        async function carregar() {
            try {
                setProdutos(await produtoApi.getAll());
                await iniciarCarrinho();
            } catch (err) {
                alert(mensagemErro(err));
            }
        }
        carregar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function executar(acao) {
        setCarregando(true);
        try {
            const atualizado = await acao();
            setCarrinho(atualizado);
        } catch (err) {
            alert(mensagemErro(err));
        } finally {
            setCarregando(false);
        }
    }

    function adicionar(produto) {
        setVendaFinalizada(null);
        executar(() => carrinhoApi.adicionarItem(carrinho.id, produto.id));
    }

    function alterarQuantidade(item, quantidade) {
        if (quantidade < 1) {
            remover(item);
            return;
        }
        executar(() => carrinhoApi.atualizarItem(carrinho.id, item.id, quantidade));
    }

    function remover(item) {
        executar(() => carrinhoApi.removerItem(carrinho.id, item.id));
    }

    function esvaziar() {
        if (!window.confirm("Deseja esvaziar o carrinho?")) return;
        executar(() => carrinhoApi.limpar(carrinho.id));
    }

    async function finalizarVenda() {
        if (!carrinho || carrinho.itens.length === 0) {
            alert("O carrinho está vazio");
            return;
        }

        setCarregando(true);
        try {
            const venda = await vendaApi.finalizar(carrinho.id, formaPagamento);
            setVendaFinalizada(venda);

            const novo = await carrinhoApi.create();
            localStorage.setItem("carrinhoId", novo.id);
            setCarrinho(novo);
        } catch (err) {
            alert(mensagemErro(err));
        } finally {
            setCarregando(false);
        }
    }

    const produtosFiltrados = produtos.filter((p) =>
        p.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="container py-4">
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
                        <h1 className="fs-4 mb-0">Produtos</h1>
                        <input
                            type="search"
                            className="form-control w-50"
                            placeholder="Buscar produto..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>

                    {produtosFiltrados.length === 0 ? (
                        <p className="text-muted">Nenhum produto encontrado.</p>
                    ) : (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                            {produtosFiltrados.map((produto) => (
                                <div className="col" key={produto.id}>
                                    <div className="card h-100 shadow-sm">
                                        {produto.imagem ? (
                                            <img src={urlImagem(produto.imagem)} className="card-img-top produto-imagem" alt={produto.nome} />
                                        ) : (
                                            <div className="produto-imagem sem-imagem">Sem imagem</div>
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h2 className="card-title fs-6">{produto.nome}</h2>
                                            <p className="fs-5 fw-bold text-success mb-3">{formatarPreco(produto.preco)}</p>
                                            <button
                                                className="btn btn-primary mt-auto"
                                                onClick={() => adicionar(produto)}
                                                disabled={!carrinho || carregando}
                                            >
                                                Adicionar ao carrinho
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm carrinho">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <strong>Carrinho</strong>
                            <span className="badge bg-primary">{carrinho?.quantidadeItens || 0} itens</span>
                        </div>

                        <div className="card-body">
                            {vendaFinalizada && (
                                <div className="alert alert-success">
                                    Venda #{vendaFinalizada.id} finalizada!<br />
                                    Total: {formatarPreco(vendaFinalizada.total)} ({vendaFinalizada.formaPagamento})
                                </div>
                            )}

                            {!carrinho || carrinho.itens.length === 0 ? (
                                <p className="text-muted mb-0">Seu carrinho está vazio.</p>
                            ) : (
                                <>
                                    <ul className="list-group list-group-flush mb-3">
                                        {carrinho.itens.map((item) => (
                                            <li className="list-group-item px-0" key={item.id}>
                                                <div className="d-flex justify-content-between">
                                                    <span>{item.produto.nome}</span>
                                                    <strong>{formatarPreco(item.produto.preco * item.quantidade)}</strong>
                                                </div>
                                                <div className="d-flex align-items-center gap-2 mt-2">
                                                    <div className="btn-group btn-group-sm">
                                                        <button className="btn btn-outline-secondary" disabled={carregando}
                                                            onClick={() => alterarQuantidade(item, item.quantidade - 1)}>-</button>
                                                        <span className="btn btn-outline-secondary disabled">{item.quantidade}</span>
                                                        <button className="btn btn-outline-secondary" disabled={carregando}
                                                            onClick={() => alterarQuantidade(item, item.quantidade + 1)}>+</button>
                                                    </div>
                                                    <small className="text-muted">{formatarPreco(item.produto.preco)} un.</small>
                                                    <button className="btn btn-sm btn-link text-danger ms-auto" disabled={carregando}
                                                        onClick={() => remover(item)}>Remover</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="d-flex justify-content-between fs-5 mb-3">
                                        <span>Total</span>
                                        <strong>{formatarPreco(carrinho.total)}</strong>
                                    </div>

                                    <label className="form-label">Forma de pagamento</label>
                                    <select className="form-select mb-3" value={formaPagamento}
                                        onChange={(e) => setFormaPagamento(e.target.value)}>
                                        {formasPagamento.map((forma) => (
                                            <option key={forma} value={forma}>{forma}</option>
                                        ))}
                                    </select>

                                    <button className="btn btn-success w-100 mb-2" onClick={finalizarVenda} disabled={carregando}>
                                        Finalizar compra
                                    </button>
                                    <button className="btn btn-outline-danger w-100" onClick={esvaziar} disabled={carregando}>
                                        Esvaziar carrinho
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
