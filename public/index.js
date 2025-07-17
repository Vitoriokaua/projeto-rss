const botaoBuscar = document.getElementById('botaoBuscar');
const botaoCarregar = document.getElementById('botaoCarregar'); // Pega o novo botão
const divConteudo = document.getElementById('divConteudo');
const divStatus = document.getElementById('divStatus');


function mostrarStatus(mensagem, eErro = false) {
    divStatus.textContent = mensagem;
    divStatus.className = eErro ? 'text-red-600' : 'text-green-700';
}

function renderizarDados(itens) {
    divConteudo.innerHTML = '';
    if (!itens || itens.length === 0) {
        divConteudo.innerHTML = '<p class="text-center col-span-full">Nenhuma notícia encontrada.</p>';
        return;
    }
    itens.forEach(item => {
        const cartao = `
            <div class="bg-white p-5 rounded-lg shadow-md">
                <h3 class="text-lg font-bold mb-2">${item.title}</h3>
                <a href="${item.link}" target="_blank" class="text-blue-500 hover:underline">Ler mais &rarr;</a>
            </div>
        `;
        divConteudo.innerHTML += cartao;
    });
}

// Botão 1 agora chama a rota que SALVA na nuvem
botaoBuscar.addEventListener('click', async () => {
    mostrarStatus('Buscando e salvando na nuvem...');
    try {
        const resposta = await fetch('/fetch-and-save');
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.message);

        mostrarStatus(resultado.message);
        renderizarDados(resultado.data);
    } catch (erro) {
        mostrarStatus(`Erro: ${erro.message}`, true);
    }
});

// Botão 2 agora chama a rota que CARREGA da nuvem
botaoCarregar.addEventListener('click', async () => {
    mostrarStatus('Carregando dados da nuvem...');
    try {
        const resposta = await fetch('/data');
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.message);

        mostrarStatus(resultado.message);
        renderizarDados(resultado.data);
    } catch (erro) {
        mostrarStatus(`Erro: ${erro.message}`, true);
    }
});
