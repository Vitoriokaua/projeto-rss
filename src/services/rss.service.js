
const Parser = require('rss-parser');
const parser = new Parser();

const CATEGORIES_FEEDS = {
    'ultimas-noticias': 'https://canaltech.com.br/rss/',
    'analises-de-produtos': 'https://canaltech.com.br/rss/analises/',
    'mercado': 'https://canaltech.com.br/rss/mercado/',
    'ciencia': 'https://canaltech.com.br/rss/ciencia/'
  
};




async function buscarNoticiasPorCategoria(categoriaSlug) {
    const urlFeed = CATEGORIES_FEEDS[categoriaSlug];
    if (!urlFeed) {
        throw new Error(`Feed RSS para a categoria "${categoriaSlug}" não encontrado.`);
    }

    console.log(`Buscando notícias da categoria ${categoriaSlug} em ${urlFeed}...`);
    try {
        const feed = await parser.parseURL(urlFeed);
        if (feed.items && feed.items.length > 0) {
            return feed.items.map(item => {
                let snippet = item.contentSnippet || item.content || '';
                snippet = snippet.replace(/<[^>]*>/g, ''); 
                snippet = snippet.substring(0, 120) + (snippet.length > 120 ? '...' : '');

                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    snippet: snippet, 
                    category: categoriaSlug
                };
            });

        } else {
            console.warn(`O feed da categoria "${categoriaSlug}" veio vazio.`);
            return [];
        }
    } catch (error) {
        console.error(`Erro ao tentar acessar o feed da categoria ${categoriaSlug}:`, error.message);
        throw new Error(`Não foi possível acessar o feed da categoria "${categoriaSlug}".`);
    }
}

module.exports = { buscarNoticiasPorCategoria, CATEGORIES_FEEDS };