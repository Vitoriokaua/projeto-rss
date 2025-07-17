const AWS = require('aws-sdk');

const S3_BUCKET_NAME = 'projeto-rss-vitorio';
const AWS_REGION = 'us-east-1';
const S3_FILE_NAME = 'noticias.json';


const s3 = new AWS.S3({ region: AWS_REGION });

async function salvar(itens) {
    console.log('Serviço S3: Salvando no bucket...');
    const params = {
        Bucket: S3_BUCKET_NAME, Key: S3_FILE_NAME,
        Body: JSON.stringify(itens, null, 2), ContentType: 'application/json'
    };
    await s3.putObject(params).promise();
}

async function carregar() {
    console.log('Serviço S3: Carregando do bucket...');
    const params = { Bucket: S3_BUCKET_NAME, Key: S3_FILE_NAME };
    const data = await s3.getObject(params).promise();
    return JSON.parse(data.Body.toString('utf-8'));
}

module.exports = { salvar, carregar };





