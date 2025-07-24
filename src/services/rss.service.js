
const Parser = require('rss-parser');
const parser = new Parser();

const CATEGORIES_FEEDS = {
    'todas': 'https://www.metropoles.com/feed',
    'brasil': 'https://www.metropoles.com/brasil/feed',
    'entretenimento': 'https://www.metropoles.com/entretenimento/feed',
    'celebridades': 'https://www.metropoles.com/celebridades/feed',
    'esportes': 'https://www.metropoles.com/esportes/feed',
    'saude': 'https://www.metropoles.com/saude/feed',
    'ciencia': 'https://www.metropoles.com/ciencia/feed',
    'mundo': 'https://www.metropoles.com/mundo/feed',
    'negocios': 'https://www.metropoles.com/negocios/feed',
};

async function buscarNoticiasPorCategoria(categoriaSlug) {
    const urlFeed = CATEGORIES_FEEDS[categoriaSlug];
    if (!urlFeed) {
        throw new Error(`Feed RSS para a categoria "${categoriaSlug}" não encontrado.`);
    }
    console.log(`Serviço RSS: Buscando notícias da categoria ${categoriaSlug} em ${urlFeed}...`);
    try {
        const feed = await parser.parseURL(urlFeed);
        if (feed.items && feed.items.length > 0) {
            return feed.items.map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                snippet: item.contentSnippet || (item.content ? item.content.substring(0, 150) : ''),
                category: categoriaSlug
            }));
        } else {
            console.warn(`A URL "${urlFeed}" para a categoria "${categoriaSlug}" não retornou itens de feed válidos. Pode não ser um feed RSS ou está vazio.`);
            return [];
        }
    } catch (error) {
        console.error(`Erro ao tentar parsear URL RSS ${urlFeed} para categoria ${categoriaSlug}:`, error.message);
        throw new Error(`Não foi possível acessar o feed da categoria "${categoriaSlug}". Provavelmente não é um feed RSS válido ou houve um erro de rede/parsing.`);
    }
}

module.exports = { buscarNoticiasPorCategoria, CATEGORIES_FEEDS };