import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: "us-east-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    }
})

export async function insertObjectIntoS3(data) {
    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: "rss-bucket-demo",
            Key: "rss.json",
            Body: JSON.stringify(data),
            ContentType: "application/json"
        }));

        return { message: "Os dados foram atualizados no S3" };

    } catch (err) {
        throw { message: `Ocorreu um erro ao tentar salvar os dados no S3: \n${err.message}` };
    }
}

export async function getObjectFromS3() {
    try {
        const { Body } = await s3Client.send(new GetObjectCommand({
            Bucket: "rss-bucket-demo",
            Key: "rss.json"
        }));
        let string = await Body.transformToString();

        return JSON.parse(string);
    } catch (error) {
        throw { message: `Ocorreu um erro ao obter os dados do S3: \n${err.message}` };
    }
}