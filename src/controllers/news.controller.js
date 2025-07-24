
const RssService = require('../services/rss.service.js');
const S3Service = require('../services/s3.service.js');

const fetchAndSave = async (req, res) => {
    try {
        const categoria = req.query.categoria || 'todas';
        if (!RssService.CATEGORIES_FEEDS[categoria]) {
            return res.status(400).send(`Categoria "${categoria}" inválida.`);
        }
        const noticias = await RssService.buscarNoticiasPorCategoria(categoria);
        const nomeDoArquivo = `noticias-${categoria}.json`;
        await S3Service.salvar(noticias, nomeDoArquivo);
        
        res.status(200).json(noticias); 
    } catch (erro) {
        console.error("Erro em /buscar-e-salvar:", erro);
        res.status(500).json({ message: `Falha ao buscar e salvar: ${erro.message}` });
    }
};

const loadData = async (req, res) => {
    try {
        const categoria = req.query.categoria || 'todas';
        const nomeDoArquivo = `noticias-${categoria}.json`;
        const noticiasSalvas = await S3Service.carregar(nomeDoArquivo);
        res.status(200).json(noticiasSalvas);
    } catch (erro) {
        if (erro.code === 'NoSuchKey') {
            return res.status(404).json([]); 
        }
        console.error("Erro em /data:", erro);
        res.status(500).json({ message: `Falha ao consultar dados: ${erro.message}` });
    }
};

const getCategories = (req, res) => {
    try {
        res.json(Object.keys(RssService.CATEGORIES_FEEDS));
    } catch (erro) {
        console.error("Erro em /categorias:", erro);
        res.status(500).json({ message: `Falha ao buscar categorias: ${erro.message}` });
    }
};

module.exports = {
    fetchAndSave,
    loadData,
    getCategories
};