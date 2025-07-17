
const express = require('express');
const router = express.Router();
const RssServico = require('../servicos/rss.servico.js'); 
const S3Servico = require('../servicos/s3.servico.js');

router.get('/fetch-and-save', async (req, res) => {
    try {
        const noticias = await RssServico.buscarNoticias(); // Usa o especialista em RSS
        await S3Servico.salvar(noticias); // Usa o especialista em S3
        const mensagemSucesso = `${noticias.length} notícias salvas com sucesso no S3.`;
        res.status(200).json({ message: mensagemSucesso, data: noticias });
    } catch (erro) {
        console.error("Erro em /fetch-and-save:", erro);
        //Enviando a mensagem de erro real para o frontend === testt
        res.status(500).json({ message: `Falha ao buscar e salvar: ${erro.message}` });
    }
});

router.get('/data', async (req, res) => {
    try {
        const noticiasSalvas = await S3Servico.carregar(); // Usa o especialista em S3
        res.status(200).json({ message: 'Dados carregados com sucesso do S3!', data: noticiasSalvas });
    } catch (erro) {
        // Trata o erro específico de "arquivo não encontrado"
        if (erro.code === 'NoSuchKey') {
            return res.status(404).json({ message: 'Arquivo não encontrado. Clique em "Buscar e Salvar" primeiro.' });
        }
        // Para todos os outros erros (ex: nome do bucket errado), mostra o erro real
        console.error("Erro em /data:", erro);
        res.status(500).json({ message: `Falha ao consultar dados: ${erro.message}` });
    }
});

module.exports = router;