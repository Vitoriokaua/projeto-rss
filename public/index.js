
document.addEventListener('DOMContentLoaded', () => {
    const botaoBuscarTodas = document.getElementById('botaoBuscarTodas');
    const botaoCarregar = document.getElementById('botaoCarregar');
    const botaoFiltrar = document.getElementById('botaoFiltrar');
    const botaoLimparFiltro = document.getElementById('botaoLimparFiltro');
    const selectCategoria = document.getElementById('selectCategoria');
    const divStatus = document.getElementById('divStatus');
    const divConteudo = document.getElementById('divConteudo');
    
   
    const API_BASE_URL = window.location.origin;

    // Função para atualizar o status na interface
    function atualizarStatus(mensagem, tipo = 'info', showSpinner = false) {
        divStatus.innerHTML = showSpinner ? `<span class="loading-spinner"></span>` : '';
        let textColorClass = '';
        if (tipo === 'error') {
            textColorClass = 'text-red-600';
        } else if (tipo === 'success') {
            textColorClass = 'text-emerald-600';
        } else {
            textColorClass = 'text-blue-600';
        }
        divStatus.innerHTML += `<span class="${textColorClass}">${mensagem}</span>`;
    }

    // Função para exibir as notícias na interface
    function exibirNoticias(noticias) {
        divConteudo.innerHTML = '';
        if (!noticias || noticias.length === 0) {
            divConteudo.innerHTML = '<p class="no-news-message">Nenhuma notícia encontrada.</p>';
            return;
        }
        noticias.forEach(item => {
            const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString('pt-BR') : 'Data desconhecida';
            const card = `
                <div class="news-card">
                    <div>
                        <h2>${item.title}</h2>
                        <p class="pub-date">${pubDate}</p>
                        <p class="snippet">${item.snippet || 'Clique para ler mais.'}...</p>
                    </div>
                    <a href="${item.link}" target="_blank" class="read-more-link">Ler mais</a>
                </div>`;
            divConteudo.innerHTML += card;
        });
    }

    // Função para carregar notícias da API
    async function carregarNoticias(categoria) {
        if (!categoria) return;

        atualizarStatus(`Carregando notícias de "${categoria}"...`, 'info', true);
        try {
            const response = await fetch(`${API_BASE_URL}/noticias?categoria=${categoria}`);
            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }
            const noticias = await response.json();
            exibirNoticias(noticias);
            atualizarStatus(`Notícias de "${categoria}" carregadas! (${noticias.length} itens)`, 'success');
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            atualizarStatus(`Erro ao carregar notícias.`, 'error');
            exibirNoticias([]);
        }
    }

    // Função para buscar e salvar TODAS as notícias
    botaoBuscarTodas.addEventListener('click', async () => {
        atualizarStatus('Buscando e salvando todas as categorias...', 'info', true);
        try {
            const categoriasResponse = await fetch(`${API_BASE_URL}/categorias`);
            const categorias = await categoriasResponse.json();

            const promises = categorias.map(cat =>
                fetch(`${API_BASE_URL}/buscar-e-salvar?categoria=${cat}`)
            );
            
            
            await Promise.all(promises);

            atualizarStatus('Todas as categorias foram atualizadas!', 'success');
            carregarNoticias(selectCategoria.value);
        } catch (error) {
            console.error('Erro no processo de busca e salvamento:', error);
            atualizarStatus(`Erro ao salvar todas as notícias.`, 'error');
        }
    });

    // Função para preencher o menu de categorias
    async function preencherCategorias() {
        try {
            const response = await fetch(`${API_BASE_URL}/categorias`);
            const categorias = await response.json();
            selectCategoria.innerHTML = ''; // Limpa o menu
            
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                selectCategoria.appendChild(option);
            });
            
            // Retorna a primeira categoria da lista para ser usada como padrão
            return categorias.length > 0 ? categorias[0] : null;

        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            atualizarStatus('Erro ao carregar categorias do servidor.', 'error');
            return null;
        }
    }

    
    botaoFiltrar.addEventListener('click', () => {
        carregarNoticias(selectCategoria.value);
    });

    botaoLimparFiltro.addEventListener('click', async () => {
 const primeiraCategoria = await preencherCategorias();
        carregarNoticias(primeiraCategoria);
    });

   
    botaoCarregar.addEventListener('click', () => {
        carregarNoticias(selectCategoria.value);
    });


    async function init() {
        const primeiraCategoria = await preencherCategorias();
        carregarNoticias(primeiraCategoria);
    }

    init();
});