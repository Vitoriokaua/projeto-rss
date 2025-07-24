const express = require('express');
const router = express.Router();
const rssService = require('../services/rss.service');
const s3Service = require('../services/s3.service');

// Rota para buscar e salvar notícias no S3 por categoria
router.get('/buscar-e-salvar', async (req, res) => {
    const categoria = req.query.categoria || 'todas';

    if (!rssService.CATEGORIES_FEEDS[categoria]) {
        return res.status(400).send(`Categoria "${categoria}" inválida. As categorias válidas são: ${Object.keys(rssService.CATEGORIES_FEEDS).join(', ')}.`);
    }

    try {
        const noticias = await rssService.buscarNoticiasPorCategoria(categoria);
        const S3_FILE_NAME_CATEGORY = `noticias-${categoria}.json`;
        await s3Service.salvar(noticias, S3_FILE_NAME_CATEGORY);
        res.status(200).send(`Notícias da categoria "${categoria}" (${noticias.length} itens) buscadas e salvas no S3 com sucesso!`);
    } catch (error) {
        console.error(`Erro ao buscar e salvar notícias da categoria ${categoria}:`, error);
        res.status(500).send(`Erro ao buscar e salvar notícias da categoria ${categoria}. Detalhes: ${error.message}`);
    }
});

// Rota para carregar notícias do S3
router.get('/noticias', async (req, res) => {
    try {
        const { categoria } = req.query;

        let S3_FILE_NAME_TO_LOAD = 'noticias-todas.json';
        if (categoria && rssService.CATEGORIES_FEEDS[categoria]) {
            S3_FILE_NAME_TO_LOAD = `noticias-${categoria}.json`;
        } else if (categoria) {
            return res.status(400).send(`Categoria "${categoria}" inválida.`);
        }

        let noticias = [];
        try {
            noticias = await s3Service.carregar(S3_FILE_NAME_TO_LOAD);
        } catch (s3Error) {
            if (s3Error.code === 'NoSuchKey') {
                console.warn(`Arquivo S3 "${S3_FILE_NAME_TO_LOAD}" não encontrado. Retornando array vazio.`);
                return res.json([]);
            }
            throw s3Error;
        }

        
        res.json(noticias);
    } catch (error) {
        console.error('Erro ao carregar notícias do S3:', error);
        res.status(500).send(`Erro ao carregar notícias do S3. Detalhes: ${error.message}`);
    }
});

// Rota para obter a lista de categorias disponíveis para o frontend
router.get('/categorias', (req, res) => {
    res.json(Object.keys(rssService.CATEGORIES_FEEDS));
});

module.exports = router;
