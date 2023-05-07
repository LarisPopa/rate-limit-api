import moment from "moment";
import { Request, Response, NextFunction } from "express";
import { ClientRequest } from "../types";
import { redisClient } from "../server";
import { MAX_WINDOW_REQUEST_COUNT, WINDOW_SIZE_IN_MINUTES } from "../constants";

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // fetch records of current IP address, returns null when no record is found
    const data = await redisClient.get(req.ip);

    const currentRequestTime = moment();
    let windowStartTimestamp = currentRequestTime
      .subtract(WINDOW_SIZE_IN_MINUTES, "minutes")
      .unix();
    // if no record is found , create a new record for IP address and store to redis
    if (!data) {
      const requestLog = {
        requestTimeStamp: currentRequestTime.unix(),
        requestCount: 1,
      } as ClientRequest;
      await redisClient.set(req.ip, JSON.stringify([requestLog]));
      next();
    } else {
      const records = JSON.parse(data) as ClientRequest[];

      // if record is found, calculate number of requests IP address has made within 10 mins
      let requestsWithinWindow = records.filter((entry) => {
        return entry.requestTimeStamp > windowStartTimestamp;
      });
      let totalWindowRequestsCount = requestsWithinWindow.reduce(
        (accumulator, entry) => {
          return accumulator + entry.requestCount;
        },
        0
      );
      // if number of requests made is greater than or equal to the desired maximum, return error
      if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
        res
          .status(429)
          .send(
            `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_MINUTES} minutes limit!`
          );
      } else {
        // if number of requests made is less than allowed maximum, log new entry
        let lastRequestLog = records[records.length - 1];

        //  if interval has not passed since last request log, increment counter
        if (lastRequestLog.requestTimeStamp > windowStartTimestamp) {
          lastRequestLog.requestCount++;
          records[records.length - 1] = lastRequestLog;
        } else {
          //  if interval has passed, log new entry for current IP address and timestamp
          records.push({
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1,
          });
        }
        await redisClient.set(req.ip, JSON.stringify(records));
        next();
      }
    }
  } catch (error) {
    next(error);
  }
};
