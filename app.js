
const express = require('express');
const cors = require('cors');
const newsRoutes = require('./src/routes/news.route.js');

const app = express();

app.use(cors());
app.use(express.json());


app.use(express.static('public'));


app.use('/', newsRoutes);

module.exports = app; 