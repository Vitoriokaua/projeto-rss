import RSSParser from "rss-parser";
import { getObjectFromS3, insertObjectIntoS3 } from "../s3/s3.service.js";

const rssParser = new RSSParser();
const RSS_URL = "http://www.metropoles.com/rss";

async function fetchFeed() {
    try {
        const response = await fetch(RSS_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const text = await response.text();
        const feed = await rssParser.parseString(text);
        return feed;
    } catch (error) {
        throw { message: `Falha ao tentar obter o feed RSS: \n${error.message}` };
    }
}

function createModel(jsonData) {
    const categories = {};
    const tagRegex = /https:\/\/www\.metropoles\.com\/([^\/]+)/;

    const items = jsonData.items.map((item, index) => {
        const match = item.link.match(tagRegex);

        if (match) {
            const tag = match[1];
            if (!categories[tag]) {
                categories[tag] = [];
            }
            categories[tag].push(index);
        }

        return {
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            creator: item.creator,
            snippet: item.contentSnippet || (item.content ? item.content.substring(0, 150) : ''),
        };
    });

    return { categories, items };
}

export async function updateFeedData() {
    try {
        const feed = await fetchFeed();

        const model = createModel(feed);

        const data = {
            "items": model.items,
            "categories": model.categories
        }

        const updateResponse = await insertObjectIntoS3(data);

        return updateResponse;

    } catch (error) {
        throw { message: error.message };
    }
}

export async function getFeedData(tags) {
    try {
        const parsedData = await getObjectFromS3();
        
        if (tags) {
            let selectedIds = [];
            const categorieItems = parsedData["categories"];

            tags.forEach(param => {
                if (categorieItems[param]) {
                    selectedIds = [...selectedIds, ...categorieItems[param]];
                }
            });

            const result = selectedIds.map(id => parsedData.items[id]);

            return result;
        }

        return parsedData;
    } catch (error) {
        throw { message: error.message };
    }
}