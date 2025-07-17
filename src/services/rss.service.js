
const Parser = require('rss-parser');
const parser = new Parser();
const URL_DO_RSS = 'https://www.metropoles.com/feed';

async function buscarNoticias() {
    console.log('Serviço RSS: Buscando notícias...');
    const feed = await parser.parseURL(URL_DO_RSS);
    return feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet || (item.content ? item.content.substring(0, 150) : ''),
    }));
}

module.exports = { buscarNoticias };