import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// market.getMarketBoxList (POST /market/market/marketList)
export const MarketGetMarketBoxListMeta: ApiOperationMeta = {
  operationId: "market.getMarketBoxList",
  method: "POST",
  paths: ["/market/market/marketList"],
  auth: false,
  status: "confirmed",
  evidence: ["api/market/index.js:9"],
};

export interface MarketGetMarketBoxListRequest {
  [key: string]: FrontendUnknown;
}

export interface MarketGetMarketBoxListRequestParts {
  body?: Record<string, never>;
}

export interface MarketGetMarketBoxListData {
  total?: string | number;
  data?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type MarketGetMarketBoxListResponse = FrontendApiResponse<MarketGetMarketBoxListData>;

// market.ranking (POST /user/ranking)
export const MarketRankingMeta: ApiOperationMeta = {
  operationId: "market.ranking",
  method: "POST",
  paths: ["/user/ranking"],
  auth: false,
  status: "confirmed",
  evidence: ["api/market/index.js:22"],
};

export interface MarketRankingRequest {
  types?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface MarketRankingRequestParts {
  body?: {
    types?: FrontendUnknown;
  };
}

export type MarketRankingData = FrontendUnknown;

export type MarketRankingResponse = FrontendApiResponse<MarketRankingData>;

// market.getMarketList (POST /market/market/getMarketList)
export const MarketGetMarketListMeta: ApiOperationMeta = {
  operationId: "market.getMarketList",
  method: "POST",
  paths: ["/market/market/getMarketList"],
  auth: false,
  status: "confirmed",
  evidence: ["api/market/index.js:34"],
};

export interface MarketGetMarketListRequest {
  [key: string]: FrontendUnknown;
}

export interface MarketGetMarketListRequestParts {
  body?: Record<string, never>;
}

export type MarketGetMarketListData = FrontendUnknown;

export type MarketGetMarketListResponse = FrontendApiResponse<MarketGetMarketListData>;

// market.getMarketGoodsList (POST /market/market/getMarketGoodsListByGoodsId)
export const MarketGetMarketGoodsListMeta: ApiOperationMeta = {
  operationId: "market.getMarketGoodsList",
  method: "POST",
  paths: ["/market/market/getMarketGoodsListByGoodsId"],
  auth: false,
  status: "confirmed",
  evidence: ["api/market/index.js:44"],
};

export interface MarketGetMarketGoodsListRequest {
  [key: string]: FrontendUnknown;
}

export interface MarketGetMarketGoodsListRequestParts {
  body?: Record<string, never>;
}

export interface MarketGetMarketGoodsListData {
  list?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type MarketGetMarketGoodsListResponse = FrontendApiResponse<MarketGetMarketGoodsListData>;

// market.changeMarketGoods (POST /market/market/changeMarketGoods)
export const MarketChangeMarketGoodsMeta: ApiOperationMeta = {
  operationId: "market.changeMarketGoods",
  method: "POST",
  paths: ["/market/market/changeMarketGoods"],
  auth: false,
  status: "confirmed",
  evidence: ["api/market/index.js:53"],
};

export interface MarketChangeMarketGoodsRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface MarketChangeMarketGoodsRequestParts {
  body?: {
    id?: string | number;
  };
}

export type MarketChangeMarketGoodsData = FrontendUnknown;

export type MarketChangeMarketGoodsResponse = FrontendApiResponse<MarketChangeMarketGoodsData>;

// market.getMarketGoodsInfo (POST /market/market/marketGoodsDetail)
export const MarketGetMarketGoodsInfoMeta: ApiOperationMeta = {
  operationId: "market.getMarketGoodsInfo",
  method: "POST",
  paths: ["/market/market/marketGoodsDetail"],
  auth: false,
  status: "confirmed",
  evidence: ["api/market/index.js:63"],
};

export interface MarketGetMarketGoodsInfoRequest {
  id?: string | number;
  type?: string | number;
  [key: string]: FrontendUnknown;
}

export interface MarketGetMarketGoodsInfoRequestParts {
  body?: {
    id?: string | number;
    type?: string | number;
  };
}

export type MarketGetMarketGoodsInfoData = FrontendUnknown;

export type MarketGetMarketGoodsInfoResponse = FrontendApiResponse<MarketGetMarketGoodsInfoData>;

// market.getMarketDetails (POST /market/market/MarketDetail/ids/${id})
export const MarketGetMarketDetailsMeta: ApiOperationMeta = {
  operationId: "market.getMarketDetails",
  method: "POST",
  paths: ["/market/market/MarketDetail/ids/${id}"],
  auth: false,
  status: "confirmed",
  evidence: ["api/market/index.js:72"],
};

export interface MarketGetMarketDetailsRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface MarketGetMarketDetailsRequestParts {
  path?: {
    id?: string | number;
  };
}

export interface MarketGetMarketDetailsData {
  goods_type?: string | number;
  price?: string | number;
  [key: string]: FrontendUnknown;
}

export type MarketGetMarketDetailsResponse = FrontendApiResponse<MarketGetMarketDetailsData>;
