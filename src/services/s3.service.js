const AWS = require('aws-sdk');

const S3_BUCKET_NAME = 'projeto-rss-squad1';
const AWS_REGION = 'us-east-1';



const s3 = new AWS.S3({ region: AWS_REGION });

async function salvar(itens, fileName = 'noticias-todas.json') {
    console.log(`Serviço S3: Salvando ${itens.length} itens no bucket "${S3_BUCKET_NAME}" como "${fileName}"...`);
    const params = {
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
        Body: JSON.stringify(itens, null, 2),
        ContentType: 'application/json'
    };
    await s3.putObject(params).promise();
    console.log(`Dados salvos com sucesso em s3://${S3_BUCKET_NAME}/${fileName}`);
}

async function carregar(fileName = 'noticias-todas.json') {
    console.log(`Serviço S3: Carregando do bucket "${S3_BUCKET_NAME}" o arquivo "${fileName}"...`);
    const params = { Bucket: S3_BUCKET_NAME, Key: fileName };
    const data = await s3.getObject(params).promise();
    console.log(`Arquivo "${fileName}" carregado com sucesso.`);
    return JSON.parse(data.Body.toString('utf-8'));
}

module.exports = { salvar, carregar };