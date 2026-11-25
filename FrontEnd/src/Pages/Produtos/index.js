import { useEffect, useRef, useState } from "react";
import InputGroup from "../../Components/inputGroup";
import useProduto from "../../hooks/useProduto";
import { formatarPreco, mensagemErro, urlImagem } from "../../util/api";

const produtoVazio = { nome: "", preco: "" };
const tiposImagem = ["image/jpeg", "image/png"];
const extensoesImagem = [".jpeg", ".jpg", ".png"];

const Produto = () => {
    const [produto, setProduto] = useState(produtoVazio);
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);
    const [editandoId, setEditandoId] = useState(null);
    const [lstProdutos, setlstProdutos] = useState([]);
    const [salvando, setSalvando] = useState(false);
    const inputImagem = useRef();

    const { getAll, create, update, remove } = useProduto();

    async function carregarProdutos() {
        try {
            const produtos = await getAll();
            setlstProdutos(produtos);
        } catch (err) {
            alert(mensagemErro(err));
        }
    }

    useEffect(() => {
        carregarProdutos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function imagemValida(arquivo) {
        const nome = arquivo.name.toLowerCase();
        const extensaoOk = extensoesImagem.some((ext) => nome.endsWith(ext));
        return extensaoOk && tiposImagem.includes(arquivo.type);
    }

    function validateProduto(produto) {
        if (!produto.nome.trim()) {
            alert("O campo nome é obrigatório");
            return false;
        }
        if (produto.preco === "") {
            alert("O campo preço é obrigatório");
            return false;
        }
        if (Number(produto.preco) < 0) {
            alert("O preço não pode ser negativo");
            return false;
        }
        if (imagem && !imagemValida(imagem)) {
            alert("A imagem deve ser .jpeg ou .png");
            return false;
        }
        return true;
    }

    function handleChange(e) {
        setProduto({ ...produto, [e.target.name]: e.target.value });
    }

    // bloqueia o sinal de menos e a notação científica no campo de preço
    function bloquearNegativo(e) {
        if (["-", "+", "e", "E"].includes(e.key)) {
            e.preventDefault();
        }
    }

    function handleImagem(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        if (!imagemValida(arquivo)) {
            alert("Formato inválido! Envie apenas imagens .jpeg ou .png");
            e.target.value = "";
            setImagem(null);
            setPreview(null);
            return;
        }

        setImagem(arquivo);
        setPreview(URL.createObjectURL(arquivo));
    }

    function limparFormulario() {
        setProduto(produtoVazio);
        setImagem(null);
        setPreview(null);
        setEditandoId(null);
        if (inputImagem.current) inputImagem.current.value = "";
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateProduto(produto)) return;

        const formData = new FormData();
        formData.append("nome", produto.nome);
        formData.append("preco", produto.preco);
        if (imagem) formData.append("imagem", imagem);

        setSalvando(true);
        try {
            const resposta = editandoId
                ? await update(editandoId, formData)
                : await create(formData);
            alert(resposta.message);
            limparFormulario();
            carregarProdutos();
        } catch (err) {
            alert(mensagemErro(err));
        } finally {
            setSalvando(false);
        }
    }

    function handleEditar(item) {
        setEditandoId(item.id);
        setProduto({ nome: item.nome, preco: String(item.preco) });
        setImagem(null);
        setPreview(urlImagem(item.imagem));
        if (inputImagem.current) inputImagem.current.value = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleExcluir(item) {
        if (!window.confirm(`Deseja excluir o produto "${item.nome}"?`)) return;

        try {
            const resposta = await remove(item.id);
            alert(resposta.message);
            if (editandoId === item.id) limparFormulario();
            carregarProdutos();
        } catch (err) {
            alert(mensagemErro(err));
        }
    }

    return (
        <div className="container py-4">
            <h1 className="text-center fs-4 mb-4">
                {editandoId ? "Editar produto" : "Cadastrar produto"}
            </h1>

            <form onSubmit={handleSubmit} className="mb-4">
                <InputGroup
                    label="Nome"
                    onChange={handleChange}
                    type="text"
                    placeholder="Nome do produto"
                    name="nome"
                    value={produto.nome}
                />
                <InputGroup
                    label="Preço"
                    onChange={handleChange}
                    onKeyDown={bloquearNegativo}
                    type="number"
                    placeholder="Preço do produto"
                    name="preco"
                    value={produto.preco}
                    min="0"
                    step="0.01"
                />
                <InputGroup
                    label="Imagem"
                    onChange={handleImagem}
                    type="file"
                    name="imagem"
                    accept=".jpeg,.jpg,.png,image/jpeg,image/png"
                    ref={inputImagem}
                />

                {preview && (
                    <img src={preview} alt="Pré-visualização" className="preview-imagem mb-3" />
                )}

                <div className="d-flex gap-2">
                    <button className="btn btn-primary" type="submit" disabled={salvando}>
                        {salvando ? "Salvando..." : editandoId ? "Atualizar" : "Salvar"}
                    </button>
                    {editandoId && (
                        <button className="btn btn-secondary" type="button" onClick={limparFormulario}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <table className="table table-striped align-middle">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th className="text-end">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {lstProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">Nenhum produto cadastrado</td>
                        </tr>
                    ) : (
                        lstProdutos.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    {item.imagem ? (
                                        <img src={urlImagem(item.imagem)} alt={item.nome} className="miniatura" />
                                    ) : (
                                        <span className="text-muted small">Sem imagem</span>
                                    )}
                                </td>
                                <td>{item.nome}</td>
                                <td>{formatarPreco(item.preco)}</td>
                                <td className="text-end">
                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditar(item)}>
                                        Editar
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(item)}>
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Produto;
