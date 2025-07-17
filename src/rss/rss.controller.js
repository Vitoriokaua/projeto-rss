import { getFeedData, updateFeedData } from "./rss.service.js";

export async function getFeed(req, res) {
    const tags = req.query.tags ? req.query.tags.split(",") : null;

    try {
        const result = await getFeedData(tags);;
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message, error: true });
    }
}

export async function updateFeed(req, res) {
    try {
        const result = await updateFeedData();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message, error: true });
    }
}