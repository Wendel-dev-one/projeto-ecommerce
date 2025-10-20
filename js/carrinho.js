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

// Seleciona botões de adicionar ao carrinho e delega tratamento de clique
// Melhoria: separação de responsabilidade — extraí lógica de criação/atualização do produto
const botoesAdicionarAoCarrinho = document.querySelectorAll('.adicionar');

botoesAdicionarAoCarrinho.forEach(botao => {
    botao.addEventListener('click', evento => {
        const elementoProduto = evento.target.closest('.produto');
        if (!elementoProduto) return; // validação: evita erros se estrutura HTML mudar

        const produto = extrairProdutoDoElemento(elementoProduto);
        if (!produto || !produto.id) return; // validação adicional

        adicionarProdutoAoCarrinho(produto, 1);
    });
});

function salvarProdutosNoCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function obterProdutosDoCarrinho() {
    const produtos = localStorage.getItem("carrinho");
    return produtos ? JSON.parse(produtos) : [];
}

// Melhoria: encapsula extração de dados do DOM em função reutilizável e testável
function extrairProdutoDoElemento(elementoProduto) {
    try {
        const produtoId = elementoProduto.dataset.id;
        const produtoNomeEl = elementoProduto.querySelector('.nome');
        const produtoImgEl = elementoProduto.querySelector('img');
        const produtoPrecoEl = elementoProduto.querySelector('.preco');

        if (!produtoId || !produtoNomeEl || !produtoPrecoEl) return null;

        const nome = produtoNomeEl.textContent.trim();
        const imagem = produtoImgEl ? produtoImgEl.getAttribute('src') : '';
        const preco = parsePrecoBrasileiro(produtoPrecoEl.textContent);

        return { id: produtoId, nome, imagem, preco };
    } catch (err) {
        // Falha ao extrair o produto — retorna nulo para o chamador lidar
        return null;
    }
}

// Converte string do tipo "R$ 1.234,56" em número 1234.56
function parsePrecoBrasileiro(precoStr) {
    if (!precoStr) return 0;
    return parseFloat(precoStr.replace(/[^0-9,-]+/g, '').replace('.', '').replace(',', '.')) || 0;
}

// Adiciona quantidade ao carrinho, criando o item se necessário
function adicionarProdutoAoCarrinho(produto, quantidade = 1) {
    const carrinho = obterProdutosDoCarrinho();
    const existente = carrinho.find(p => p.id === produto.id);
    if (existente) {
        existente.quantidade = (existente.quantidade || 0) + quantidade;
    } else {
        carrinho.push({ ...produto, quantidade });
    }

    salvarProdutosNoCarrinho(carrinho);
    atualizarCarrinhoETabela();
}

// passo 4 - atualizar o contador do carrinho de compras 
function atualizarContadorDoCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    let total = 0;

    produtos.forEach(produto => {
        total += produto.quantidade;
    });

    // Melhoria: proteção se o elemento não existir
    const contadorEl = document.getElementById('contador-carrinho');
    if (contadorEl) contadorEl.textContent = total;
}

// passo 5 - renderizar a tabela do carrinho de compras
function renderizarTabelaDoCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    const corpoTabela = document.querySelector("#modal-1-content table tbody");
    if (!corpoTabela) return; // validação: evita erro se modal não estiver no DOM

    // Limpa de forma segura
    corpoTabela.innerHTML = '';

    produtos.forEach(produto => {
        const tr = document.createElement('tr');

        // Evita injeção de HTML usando textContent quando possível
        const tdImg = document.createElement('td');
        tdImg.className = 'td-produto';
        const img = document.createElement('img');
        img.src = produto.imagem || '';
        img.alt = produto.nome;
        tdImg.appendChild(img);

        const tdNome = document.createElement('td');
        tdNome.textContent = produto.nome;

        const tdPrecoUnit = document.createElement('td');
        tdPrecoUnit.className = 'td-preco-unitario';
        tdPrecoUnit.textContent = `R$ ${formatarPrecoBrasileiro(produto.preco)}`;

        const tdQuantidade = document.createElement('td');
        tdQuantidade.className = 'td-quantidade';
        const inputQuantidade = document.createElement('input');
        inputQuantidade.type = 'number';
        inputQuantidade.className = 'input-quantidade';
        inputQuantidade.dataset.id = produto.id;
        inputQuantidade.value = produto.quantidade;
        inputQuantidade.min = 1;
        tdQuantidade.appendChild(inputQuantidade);

        const tdPrecoTotal = document.createElement('td');
        tdPrecoTotal.className = 'td-preco-total';
        tdPrecoTotal.textContent = `R$ ${formatarPrecoBrasileiro(produto.preco * produto.quantidade)}`;

        const tdRemover = document.createElement('td');
        const btnRemover = document.createElement('button');
        btnRemover.className = 'btn-remover';
        btnRemover.dataset.id = produto.id;
        btnRemover.id = 'deletar';
        tdRemover.appendChild(btnRemover);

        tr.appendChild(tdImg);
        tr.appendChild(tdNome);
        tr.appendChild(tdPrecoUnit);
        tr.appendChild(tdQuantidade);
        tr.appendChild(tdPrecoTotal);
        tr.appendChild(tdRemover);

        corpoTabela.appendChild(tr);
    });
}

function formatarPrecoBrasileiro(valor) {
    return (valor || 0).toFixed(2).replace('.', ',');
}

// Objetivo 2 - remover produtos do carrinho

// passo 1 - pegar o botão do html
const corpoTabela = document.querySelector('#modal-1-content table tbody');

// passo 2 - adicionar evento de escuta no tbody
corpoTabela.addEventListener("click", evento => {
    if (evento.target.classList.contains('btn-remover')) {
        const id = evento.target.dataset.id;
        // passo 3 - remover o produto do localStorage
        removerProdutoDoCarrinho(id);
    }

});

//Objetivo 3 - passo 1 - adicionar evento de escuta no input do tbody
corpoTabela.addEventListener("input", evento => {
    //Objetivo 3 - passo 2 - atualizar o valor total do produto
    if(evento.target.classList.contains("input-quantidade")){
        const id = evento.target.dataset.id;
        const novaQuantidade = parseInt(evento.target.value, 10) || 1;
        atualizarQuantidadeProduto(id, novaQuantidade);
    }
});

// passo 4 - atualizar o html do carrinho retirando o produto
function removerProdutoDoCarrinho(id) {
    const produtos = obterProdutosDoCarrinho();

    // filtrar os produtos que não tem o id passado por parametro
    const carrinhoAtualizado = produtos.filter(produto => produto.id !== id);

    salvarProdutosNoCarrinho(carrinhoAtualizado);
    atualizarCarrinhoETabela();
}

// Atualiza quantidade de um produto no carrinho de forma segura
function atualizarQuantidadeProduto(id, quantidade) {
    const produtos = obterProdutosDoCarrinho();
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    produto.quantidade = Math.max(1, quantidade);
    salvarProdutosNoCarrinho(produtos);
    atualizarCarrinhoETabela();
}

//Objetivo 3 - atualizar valores do carrinho:
// passo 3 - atualizar o valor total do carrinho
function atualizarValorTotalDoCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    let total = 0;

    produtos.forEach(produto => {
        total += produto.preco * produto.quantidade;
    });

    const totalEl = document.querySelector('#total-carrinho');
    if (totalEl) totalEl.textContent = `R$ ${formatarPrecoBrasileiro(total)}`;
}

function atualizarCarrinhoETabela(){
    atualizarContadorDoCarrinho();
    renderizarTabelaDoCarrinho();
    atualizarValorTotalDoCarrinho();
}

atualizarCarrinhoETabela();