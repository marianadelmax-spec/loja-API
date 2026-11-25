# Loja - API + Front-end

Projeto da aula: cadastro de produtos com imagem, painel de vendas com carrinho e finalização da venda.

- `Api/`: Node.js, Express, Sequelize e MariaDB (porta 5055 — a 5000 é usada pelo AirPlay do macOS)
- `FrontEnd/`: React (porta 3000)

## Como rodar

1. Criar o banco no MariaDB:

```sql
CREATE DATABASE IF NOT EXISTS loja;
CREATE USER IF NOT EXISTS 'loja'@'localhost' IDENTIFIED BY 'loja';
GRANT ALL PRIVILEGES ON loja.* TO 'loja'@'localhost';
FLUSH PRIVILEGES;
```

As tabelas são criadas automaticamente quando a API sobe. Se o banco estiver vazio, a API cadastra um produto de exemplo (Caneca de cerâmica, com imagem .png). Usuário e senha do banco ficam em `Api/db/conn.js`.

2. API:

```bash
cd Api
npm install
npm start
```

3. Front-end (em outro terminal):

```bash
cd FrontEnd
npm install
npm start
```

## Endpoints

### Produto
| Método | Rota | Descrição |
|---|---|---|
| POST | /produto/create | Cria produto (form-data: nome, preco, imagem) |
| GET | /produto/getAll | Lista produtos |
| GET | /produto/getById/:id | Busca um produto |
| PUT | /produto/update/:id | Atualiza produto (form-data: nome, preco, imagem opcional) |
| DELETE | /produto/delete/:id | Remove produto |

A imagem aceita apenas .jpeg/.jpg e .png (até 2MB). O preço não aceita valores negativos.

### Carrinho
| Método | Rota | Descrição |
|---|---|---|
| POST | /carrinho/create | Cria um carrinho |
| GET | /carrinho/getById/:id | Busca o carrinho com itens e total |
| POST | /carrinho/:id/adicionarItem | Adiciona produto (JSON: produtoId, quantidade) |
| PUT | /carrinho/:id/atualizarItem/:itemId | Altera a quantidade (JSON: quantidade) |
| DELETE | /carrinho/:id/removerItem/:itemId | Remove um item |
| DELETE | /carrinho/:id/limpar | Esvazia o carrinho |

### Venda
| Método | Rota | Descrição |
|---|---|---|
| POST | /venda/finalizar | Finaliza a venda (JSON: carrinhoId, formaPagamento) |
| GET | /venda/getAll | Lista as vendas |
| GET | /venda/getById/:id | Busca uma venda |

Formas de pagamento: Pix, Cartão de crédito, Cartão de débito, Dinheiro.
