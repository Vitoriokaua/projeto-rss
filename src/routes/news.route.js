const express = require('express');
const router = express.Router();


const newsController = require('../controllers/news.controller.js');


router.get('/buscar-e-salvar', newsController.fetchAndSave);
router.get('/noticias', newsController.loadData);
router.get('/categorias', newsController.getCategories);

module.exports = router;