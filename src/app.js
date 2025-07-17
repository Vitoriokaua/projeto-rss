import express from "express";
import cors from "cors"
import rssRoutes from "./rss/rss.routes.js";

console.log(">> Iniciandoee");

const PORT = 3000;
const HOST = "0.0.0.0";

const server = express();

server.use(cors());
server.use(express.json());

server.use("/api", rssRoutes);

server.listen(PORT, HOST);