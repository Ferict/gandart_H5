import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';

export interface LotteryInfoData {
  id?: string | number;
  remaining?: string | number;
  type?: string | number;
  display_lottery_log?: string | number | boolean;
  content?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface LotteryStatisticsItem {
  lottery_image?: string;
  [key: string]: FrontendUnknown;
}

export interface LotteryRecordPage extends FrontendPageData<FrontendUnknown> {
  data?: FrontendUnknown[];
  last_page?: string | number;
}

// lottery.lotteryInfoApi (POST /lottery/info)
export const LotteryLotteryInfoApiMeta: ApiOperationMeta = {
  operationId: "lottery.lotteryInfoApi",
  method: "POST",
  paths: ["/lottery/info"],
  auth: false,
  status: "confirmed",
  evidence: ["api/lottery/index.js:4"],
};

export interface LotteryLotteryInfoApiRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface LotteryLotteryInfoApiRequestParts {
  body?: {
    id?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type LotteryLotteryInfoApiResponse = FrontendApiResponse<LotteryInfoData>;

// lottery.lotteryStartApi (POST /lottery/start)
export const LotteryLotteryStartApiMeta: ApiOperationMeta = {
  operationId: "lottery.lotteryStartApi",
  method: "POST",
  paths: ["/lottery/start"],
  auth: false,
  status: "confirmed",
  evidence: ["api/lottery/index.js:13"],
};

export interface LotteryLotteryStartApiRequest {
  lotteryId?: string | number;
  number?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface LotteryLotteryStartApiRequestParts {
  body?: {
    lotteryId?: string | number;
    number?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export type LotteryLotteryStartApiData = FrontendUnknown;

export type LotteryLotteryStartApiResponse = FrontendApiResponse<LotteryLotteryStartApiData>;

// lottery.lotteryStatistics (POST /lottery/statistics)
export const LotteryLotteryStatisticsMeta: ApiOperationMeta = {
  operationId: "lottery.lotteryStatistics",
  method: "POST",
  paths: ["/lottery/statistics"],
  auth: false,
  status: "confirmed",
  evidence: ["api/lottery/index.js:22"],
};

export interface LotteryLotteryStatisticsRequest {
  lottery_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface LotteryLotteryStatisticsRequestParts {
  body?: {
    lottery_id?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type LotteryLotteryStatisticsResponse = FrontendApiResponse<LotteryStatisticsItem[]>;

// lottery.lotteryRecord (POST /lottery/record)
export const LotteryLotteryRecordMeta: ApiOperationMeta = {
  operationId: "lottery.lotteryRecord",
  method: "POST",
  paths: ["/lottery/record"],
  auth: false,
  status: "confirmed",
  evidence: ["api/lottery/index.js:31"],
};

export interface LotteryLotteryRecordRequest {
  type?: string | number;
  lottery_id?: string | number;
  page?: string | number;
  [key: string]: FrontendUnknown;
}

export interface LotteryLotteryRecordRequestParts {
  body?: {
    type?: string | number;
    lottery_id?: string | number;
    page?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type LotteryLotteryRecordResponse = FrontendApiResponse<LotteryRecordPage>;
