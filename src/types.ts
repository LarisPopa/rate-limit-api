export type ClientRequest = {
  requestCount: number;
  requestTimeStamp: number;
};

export type RedisResponse = ClientRequest & {
  userIp: string;
};

export type CronLobsDataShape = {
  userIp: string;
  total: number;
}[];
