document.addEventListener('DOMContentLoaded', () => {
    const botaoBuscarTodas = document.getElementById('botaoBuscarTodas');
    const botaoCarregar = document.getElementById('botaoCarregar');
    const botaoFiltrar = document.getElementById('botaoFiltrar');
    const botaoLimparFiltro = document.getElementById('botaoLimparFiltro');
    const selectCategoria = document.getElementById('selectCategoria');
    const divStatus = document.getElementById('divStatus');
    const divConteudo = document.getElementById('divConteudo');
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const appContainer = document.querySelector('.app-container');

    const API_BASE_URL = window.location.origin;

    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Lógica para abrir/fechar a sidebar (para mobile)
    openSidebarBtn.addEventListener('click', () => {
        appContainer.classList.add('sidebar-open');
    });

    closeSidebarBtn.addEventListener('click', () => {
        appContainer.classList.remove('sidebar-open');
    });

    // Fechar sidebar ao redimensionar (se estiver aberta em mobile e for para desktop)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1023) { // Se a tela for maior que o breakpoint mobile da sidebar
            appContainer.classList.remove('sidebar-open');
        }
    });

    // Função para atualizar o status na interface
    async function atualizarStatus(mensagem, tipo = 'info', showSpinner = false) {
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
        divStatus.className = 'status-message';
    }

    // Função para exibir as notícias na interface
    async function exibirNoticias(noticias) {
        divConteudo.innerHTML = '';
        const initialMessage = document.querySelector('.initial-message');
        if (initialMessage) {
            initialMessage.remove();
        }

        if (!noticias || noticias.length === 0) {
            divConteudo.innerHTML = '<p class="no-news-message">Nenhuma notícia encontrada para o filtro.</p>';
            return;
        }

        noticias.forEach(item => {
            const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString('pt-BR') : 'Data desconhecida';
            const snippet = item.snippet || 'Clique para ler mais.';
            const card = `
                <div class="news-card">
                    <div>
                        <h2>${item.title}</h2>
                        <p class="pub-date">${pubDate}</p>
                        <p class="snippet">${snippet}...</p>
                    </div>
                    <a href="${item.link}" target="_blank" class="read-more-link">
                        Ler mais
                    </a>
                </div>
            `;
            divConteudo.innerHTML += card;
        });
    }

    // Função principal para carregar notícias da API com filtro de categoria
    async function carregarNoticias(categoria = 'todas') {
        atualizarStatus('Carregando notícias...', 'info', true);
        try {
            let url = `${API_BASE_URL}/noticias`;
            const params = new URLSearchParams();
            if (categoria && categoria !== 'todas') {
                params.append('categoria', categoria);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Detalhes: ${errorText}`);
            }
            const noticias = await response.json();
            exibirNoticias(noticias);
            atualizarStatus(`Notícias carregadas! (${noticias.length} itens)`, 'success');
        }
        catch (error) {
            console.error('Erro ao carregar notícias:', error);
            if (error.message.includes("NoSuchKey")) {
                atualizarStatus(`Nenhum dado encontrado para a categoria selecionada. Tente 'Buscar e Salvar' primeiro.`, 'error');
            } else {
                atualizarStatus(`Erro ao carregar notícias: ${error.message}`, 'error');
            }
        }
    }

    // Event Listener para o botão "Buscar e Salvar Todas Notícias"
    botaoBuscarTodas.addEventListener('click', async () => {
        atualizarStatus('Iniciando busca e salvamento de todas as categorias. Isso pode levar um tempo...', 'info', true);
        try {
            const categoriasResponse = await fetch(`${API_BASE_URL}/categorias`);
            if (!categoriasResponse.ok) {
                throw new Error(`Erro ao buscar lista de categorias: ${categoriasResponse.status}`);
            }
            const categoriasParaBuscar = await categoriasResponse.json();

            let totalNoticiasSalvas = 0;
            const promises = [];

            for (const cat of categoriasParaBuscar) {
                promises.push(
                    fetch(`${API_BASE_URL}/buscar-e-salvar?categoria=${cat}`)
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(errorText => {
                                throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorText} for category ${cat}`);
                            });
                        }
                        return response.text();
                    })
                    .then(mensagem => {
                        console.log(`[${cat}]: ${mensagem}`);
                        const match = mensagem.match(/\((\d+) itens\)/);
                        if (match && match[1]) {
                         totalNoticiasSalvas += parseInt(match[1], 10);
                        }
                        return { status: 'success', category: cat };
                    })
                    .catch(error => {
                        console.error(`Erro ao salvar categoria ${cat}:`, error);
                        atualizarStatus(`Erro ao salvar ${cat}. Verifique o console.`, 'error', false);
                        return { status: 'error', category: cat, error: error };
                    })
                );
            }

            const results = await Promise.allSettled(promises);

            const successfulCategories = results.filter(p => p.status === 'fulfilled').length;
            const failedCategories = results.filter(p => p.status === 'rejected').length;

            if (failedCategories === 0) {
                 atualizarStatus(`Todas as categorias (${successfulCategories} no total) buscadas e salvas no S3! Total de ${totalNoticiasSalvas} notícias.`, 'success');
            } else {
                 atualizarStatus(`Operação de salvamento concluída. ${successfulCategories} categorias salvas, ${failedCategories} falharam. Veja o console para detalhes.`, 'info');
            }
            
            carregarNoticias(selectCategoria.value);
        } catch (error) {
            console.error('Erro geral no processo de busca e salvamento:', error);
            atualizarStatus(`Erro geral na operação de salvar: ${error.message}`, 'error');
        }
    });

    // Event Listener para o botão "Carregar Notícias"
    botaoCarregar.addEventListener('click', () => {
        carregarNoticias(selectCategoria.value);
    });

    // Event Listener para o botão "Filtrar"
    botaoFiltrar.addEventListener('click', () => {
        const categoria = selectCategoria.value;
        carregarNoticias(categoria);
    });

    // Event Listener para o botão "Limpar Filtro"
    botaoLimparFiltro.addEventListener('click', () => {
        selectCategoria.value = 'todas';
        carregarNoticias();
        atualizarStatus('Filtro limpo. Todas as notícias carregadas.', 'info');
    });

    async function preencherCategorias() {
        try {
            const response = await fetch(`${API_BASE_URL}/categorias`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const categorias = await response.json();
            selectCategoria.innerHTML = '';
            const allOption = document.createElement('option');
            allOption.value = 'todas';
            allOption.textContent = 'Todas as Notícias';
            selectCategoria.appendChild(allOption);

            categorias.filter(cat => cat !== 'todas' && cat !== 'ultimas-noticias').forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                selectCategoria.appendChild(option);
            });
            selectCategoria.value = 'todas';
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            atualizarStatus('Erro ao carregar categorias. Verifique o servidor.', 'error');
        }
    }

    // Chamadas iniciais ao carregar a página
    preencherCategorias();
    carregarNoticias();
});
