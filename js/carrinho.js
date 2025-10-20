/*
Objetivo 1 - quando clicar no botão de adicionar ao carrinho:
    - atualizar o contador
    - adicionar o produto no localStorage
    - atualizar a tabela HTML do carrinho

Objetivo 2 - remover produtos do carrinho:
    - ouvir o botão de deletar
    - remover do localStorage
    - atualizar o DOM e o total

Objetivo 3 - atualizar valores do carrinho:
    - ouvir mudanças de quantidade
    - recalcular total individual
    - recalcular total geral
*/

// Objetivo 1 - quando clicar no botão de adicionar ao carrinho:
//     - atualizar o contador
//     - adicionar o produto no localStorage
//     - atualizar a tabela HTML do carrinho

// passo 1 - pegar os botões de adicionar ao carrinho do html

const botoesAdicionarAoCarrinho = document.querySelectorAll('.adicionar');
console.log(botoesAdicionarAoCarrinho);

// passo 2 - adionar um evento de escuta nos botões para quando clicar disparar uma ação 

botoesAdicionarAoCarrinho.forEach(botao => {
    botao.addEventListener("click", (evento) => {
        //passo 3 - pegar as informações do produto clicado e adionar no localStorage
        const elementoProduto = evento.target.closest(".produto");
        const produtoId = elementoProduto.dataset.id;
        const produtoNome = elementoProduto.querySelector(".nome").textContent;
        const produtoImagem = elementoProduto.querySelector("img").getAttribute("src");
        const produtoPreco = parseFloat(elementoProduto.querySelector(".preco").textContent.replace("R$ ", "").replace(".", "").replace(",", "."));

        //buscar a lista de produtos do localStorage
        const carrinho = obterProdutosDoCarrinho();
        //testar se o produto já existe na carrinho
        const existeProduto = carrinho.find(produto => produto.id === produtoId);
        //se  existe produto, incrementar a quantidade
        if (existeProduto) {
            existeProduto.quantidade += 1;
        } else {
            // se não existe, adicionar o produto com quantidade 1 
            const produto = {
                id: produtoId,
                nome: produtoNome,
                imagem: produtoImagem,
                preco: produtoPreco,
                quantidade: 1
            };
            carrinho.push(produto);
        }

        salvarProdutoNoCarrinho(carrinho);
        atualizarContadorDoCarrinho();
    });
});

function salvarProdutoNoCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function obterProdutosDoCarrinho() {
    const produtos = localStorage.getItem("carrinho");
    return produtos ? JSON.parse(produtos) : [];
}

// passo 4 - atualizar o contador do carrinho de compras 
function atualizarContadorDoCarrinho () {
    const carrinho = obterProdutosDoCarrinho();
    let total = 0;
    
    carrinho.forEach(produto => {
        total += produto.quantidade;
    });

    document.getElementById("contador-carrinho").textContent = total;
}

atualizarContadorDoCarrinho();