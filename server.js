//Importação dos módulos necessários
const express = require('express');
const AWS = require('aws-sdk');
const Parser = require('rss-parser');
const cors = require('cors');

// --- CONFIGURAÇÕES ---

const RSS_URL = 'http://g1.globo.com/dynamo/tecnologia/rss2.xml';
const S3_BUCKET_NAME = 'projeto-rs-vitorio';
const AWS_REGION = 'us-east-2'; 

const S3_FILE_NAME = 'noticias.json';
const app = express();
const parser = new Parser();
const port = 3000;

// Configuração do AWS SDK
AWS.config.update({ region: AWS_REGION });
const s3 = new AWS.S3();

//midle
app.use(cors());
app.use(express.json());

// --- ROTAS DA API ---
app.get('/', (req, res) => {
   
    res.sendFile(__dirname + '/index.html');
});

app.get('/fetch-and-save', async (req, res) => {
    console.log('Iniciando extração do feed RSS...');
    try {
        const feed = await parser.parseURL(RSS_URL);
        const items = feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            creator: item.creator,
            snippet: item.contentSnippet || (item.content ? item.content.substring(0, 150) : ''),
        }));

        const params = {
            Bucket: S3_BUCKET_NAME,
            Key: S3_FILE_NAME,
            Body: JSON.stringify(items, null, 2),
            ContentType: 'application/json'
        };

        await s3.putObject(params).promise();
        const successMessage = `Dados salvos com sucesso em s3://${S3_BUCKET_NAME}/${S3_FILE_NAME}`;
        console.log(successMessage);
        res.status(200).json({ message: successMessage, data: items });

    } catch (error) {
        console.error('Ocorreu um erro:', error);
        res.status(500).json({ message: 'Falha ao extrair ou salvar.', error: error.message });
    }
});

app.get('/data', async (req, res) => {
    console.log(`Buscando arquivo do S3...`);
    try {
        const params = { Bucket: S3_BUCKET_NAME, Key: S3_FILE_NAME };
        const data = await s3.getObject(params).promise();
        const jsonData = JSON.parse(data.Body.toString('utf-8'));
        res.status(200).json(jsonData);
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            const message = 'Arquivo não encontrado. Clique em "Buscar RSS" primeiro.';
            console.warn(message);
            return res.status(404).json({ message });
        }
        console.error('Erro ao buscar dados do S3:', error);
        res.status(500).json({ message: 'Falha ao consultar dados.', error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
