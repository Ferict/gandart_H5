import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// news.getActivityList (POST /activity/index)
export const NewsGetActivityListMeta: ApiOperationMeta = {
  operationId: "news.getActivityList",
  method: "POST",
  paths: ["/activity/index"],
  auth: false,
  status: "confirmed",
  evidence: ["api/news/index.js:8"],
};

export interface NewsGetActivityListRequest {
  [key: string]: FrontendUnknown;
}

export interface NewsGetActivityListRequestParts {
  body?: Record<string, never>;
}

export interface NewsGetActivityListData {
  total?: string | number;
  [key: string]: FrontendUnknown;
}

export type NewsGetActivityListResponse = FrontendApiResponse<NewsGetActivityListData>;

// news.getNoticeList (POST /content/list)
export const NewsGetNoticeListMeta: ApiOperationMeta = {
  operationId: "news.getNoticeList",
  method: "POST",
  paths: ["/content/list"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/news/index.js:21"],
};

export interface NewsGetNoticeListRequest {
  type?: string | number;
  [key: string]: FrontendUnknown;
}

export interface NewsGetNoticeListRequestParts {
  body?: {
    type?: string | number;
  };
}

export type NewsGetNoticeListData = FrontendUnknown;

export type NewsGetNoticeListResponse = FrontendApiResponse<NewsGetNoticeListData>;

// news.getDetails (POST /activity/detail)
export const NewsGetDetailsMeta: ApiOperationMeta = {
  operationId: "news.getDetails",
  method: "POST",
  paths: ["/activity/detail"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/news/index.js:33"],
};

export interface NewsGetDetailsRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface NewsGetDetailsRequestParts {
  body?: {
    id?: string | number;
  };
}

export type NewsGetDetailsData = FrontendUnknown;

export type NewsGetDetailsResponse = FrontendApiResponse<NewsGetDetailsData>;
