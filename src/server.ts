import express, { Application } from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user";
import { scheduleLogJob } from "./cron-jobs/logs";
import { createClient } from "redis";

const app: Application = express();

dotenv.config();
//BodyParser Middleware
app.use(express.json());

app.use("/user", userRoutes);

const port = process.env.NODE_PORT || 4000;
//redis connection
export const redisClient = createClient({
  url: process.env.NODE_REDIS_URL,
});

redisClient.on("error", (err) => {
  throw err;
});

redisClient
  .connect()
  .then(() => {
    console.log("Redis Connected!");
  })
  .catch((err) => console.log("Error connecting to redis", err));

app.listen(port, () => {
  console.log(`Server run on port ${port}`);
});

//cron jobs
scheduleLogJob();

module.exports = app;
