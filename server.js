const express = require('express');
const cors = require('cors');
const rotasDeNoticias = require('./src/rotas/noticias.rota.js');

const aplicacao = express();
const porta = 3000;

aplicacao.use(cors());
aplicacao.use(express.json());

// Aponta para a nossa  pasta de arquivos públicos
aplicacao.use(express.static('public'));

// Usa as nossas rotas organizadas
aplicacao.use('/', rotasDeNoticias);

aplicacao.listen(porta, () => {
    console.log(`Servidor  rodando em http://localhost:${porta}`);
});
