import Redis from "ioredis";
import { configDotenv } from "dotenv";
configDotenv();
const redisClient = new Redis({
    host: process.env.Redis_host || "redis-19399.c330.asia-south1-1.gce.redns.redis-cloud.com",
    port: process.env.Redis_port || 19399,
    password: process.env.Redis_password || "1FWvHHXpXAeyLIV6OoAezNsWcy4v7PNf",
});

redisClient.on('connect', () => {
    console.log("Redis Connected on port", process.env.Redis_port || 19399);
});

redisClient.on('error', (err) => {
    console.error("❌ Redis error:", err);
});

export default redisClient;
