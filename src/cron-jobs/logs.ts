import cron from "node-cron";
import { CronLobsDataShape, RedisResponse } from "../types";
import moment from "moment";
import { WINDOW_SIZE_IN_MINUTES } from "../constants";

const mockRedisData = [
  {
    requestTimeStamp: 1683460155,
    requestCount: 7,
    userIp: "1",
  },
  {
    requestTimeStamp: 1683460155,
    requestCount: 1,
    userIp: "2",
  },
  {
    requestTimeStamp: 1683460155,
    requestCount: 1,
    userIp: "1",
  },
  {
    requestTimeStamp: 1683460155,
    requestCount: 2,
    userIp: "2",
  },
  {
    requestTimeStamp: 1683460155,
    requestCount: 1,
    userIp: "1",
  },
  {
    requestTimeStamp: 1683460155,
    requestCount: 1,
    userIp: "1",
  },
] as RedisResponse[];

export const scheduleLogJob = () => {
  cron.schedule("*/60 * * * * *", async () => {
    console.log("Running logs job every 60 seconds");

    //TODO: feth all data from redis within 60 seconds

    //find all data within last 10 mins and convert it to specific data shape
    let windowStartTimestamp = moment()
      .subtract(WINDOW_SIZE_IN_MINUTES, "minutes")
      .unix();
    let data = mockRedisData
      .filter((entry) => {
        return entry.requestTimeStamp > windowStartTimestamp;
      })
      .reduce((acc, entry) => {
        const findItem = acc.find((item) => item.userIp === entry.userIp);
        if (!findItem) {
          return [...acc, { userIp: entry.userIp, total: entry.requestCount }];
        } else {
          const arr = acc.filter((item) => item.userIp !== entry.userIp);
          return [
            ...arr,
            {
              userIp: entry.userIp,
              total: findItem.total + entry.requestCount,
            },
          ];
        }
      }, [] as CronLobsDataShape);

    if (!data.length)
      console.log(
        `There is no requests withint ${WINDOW_SIZE_IN_MINUTES} minutes`
      );

    data.forEach((item) => {
      console.log(
        `User with IP: ${item.userIp} has made ${item.total} request within last ${WINDOW_SIZE_IN_MINUTES} minutes`
      );
    });
  });
};
