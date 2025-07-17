import { Router } from "express";
import { getFeed, updateFeed } from "./rss.controller.js";
const router = Router();

router.get("/rss", getFeed);
router.post("/rss", updateFeed);

export default router;