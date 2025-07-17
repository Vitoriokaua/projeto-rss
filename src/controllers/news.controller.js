
const RssService = require('../services/rss.service.js');
const S3Service = require('../services/s3.service.js');

// Função para a rota /fetch-and-save
const fetchAndSave = async (req, res) => {
    try {
        const noticias = await RssService.buscarNoticias();
        await S3Service.salvar(noticias); 
        const mensagemSucesso = `${noticias.length} notícias salvas com sucesso no S3.`;
        res.status(200).json({ message: mensagemSucesso, data: noticias });
    } catch (erro) {
        console.error("Erro em /fetch-and-save:", erro);
        res.status(500).json({ message: `Falha ao buscar e salvar: ${erro.message}` });
    }
};

// Função para a rota /data
const loadData = async (req, res) => {
    try {
        const noticiasSalvas = await S3Service.carregar();
        res.status(200).json({ message: 'Dados carregados com sucesso do S3!', data: noticiasSalvas });
    } catch (erro) {
        if (erro.code === 'NoSuchKey') {
            return res.status(404).json({ message: 'Arquivo não encontrado. Clique em "Buscar e Salvar" primeiro.' });
        }
        console.error("Erro em /data:", erro);
        res.status(500).json({ message: `Falha ao consultar dados: ${erro.message}` });
    }
};


module.exports = {
    fetchAndSave,
    loadData
};