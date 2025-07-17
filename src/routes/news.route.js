
const express = require('express');
const router = express.Router();


const newsController = require('../controllers/news.controller.js');


router.get('/fetch-and-save', newsController.fetchAndSave);

router.get('/data', newsController.loadData);

module.exports = router;