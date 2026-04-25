import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// trad.getTradInfo (POST /market/trade/collectionDetail)
export const TradGetTradInfoMeta: ApiOperationMeta = {
  operationId: "trad.getTradInfo",
  method: "POST",
  paths: ["/market/trade/collectionDetail"],
  auth: false,
  status: "confirmed",
  evidence: ["api/trad/index.js:5"],
};

export interface TradGetTradInfoRequest {
  collection_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface TradGetTradInfoRequestParts {
  body?: {
    collection_id?: string | number;
  };
}

export type TradGetTradInfoData = FrontendUnknown;

export type TradGetTradInfoResponse = FrontendApiResponse<TradGetTradInfoData>;

// trad.createTradOrder (POST /market/trade/createBegBuyOrder)
export const TradCreateTradOrderMeta: ApiOperationMeta = {
  operationId: "trad.createTradOrder",
  method: "POST",
  paths: ["/market/trade/createBegBuyOrder"],
  auth: false,
  status: "confirmed",
  evidence: ["api/trad/index.js:17"],
};

export interface TradCreateTradOrderRequest {
  [key: string]: FrontendUnknown;
}

export interface TradCreateTradOrderRequestParts {
  body?: Record<string, never>;
}

export type TradCreateTradOrderData = FrontendUnknown;

export type TradCreateTradOrderResponse = FrontendApiResponse<TradCreateTradOrderData>;

// trad.getMyBegInfo (POST /market/trade/begBuyOrderInfo)
export const TradGetMyBegInfoMeta: ApiOperationMeta = {
  operationId: "trad.getMyBegInfo",
  method: "POST",
  paths: ["/market/trade/begBuyOrderInfo"],
  auth: false,
  status: "confirmed",
  evidence: ["api/trad/index.js:26"],
};

export interface TradGetMyBegInfoRequest {
  order_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface TradGetMyBegInfoRequestParts {
  body?: {
    order_id?: string | number;
  };
}

export type TradGetMyBegInfoData = FrontendUnknown;

export type TradGetMyBegInfoResponse = FrontendApiResponse<TradGetMyBegInfoData>;

// trad.getMyTradeList (POST /market/trade/begBuyOrderList)
export const TradGetMyTradeListMeta: ApiOperationMeta = {
  operationId: "trad.getMyTradeList",
  method: "POST",
  paths: ["/market/trade/begBuyOrderList"],
  auth: false,
  status: "confirmed",
  evidence: ["api/trad/index.js:36"],
};

export interface TradGetMyTradeListRequest {
  [key: string]: FrontendUnknown;
}

export interface TradGetMyTradeListRequestParts {
  body?: Record<string, never>;
}

export interface TradGetMyTradeListData {
  data?: FrontendUnknown;
  per_page?: string | number;
  total?: string | number;
  [key: string]: FrontendUnknown;
}

export type TradGetMyTradeListResponse = FrontendApiResponse<TradGetMyTradeListData>;

// trad.getBegBuyList (POST /market/trade/begBuyList)
export const TradGetBegBuyListMeta: ApiOperationMeta = {
  operationId: "trad.getBegBuyList",
  method: "POST",
  paths: ["/market/trade/begBuyList"],
  auth: false,
  status: "confirmed",
  evidence: ["api/trad/index.js:45"],
};

export interface TradGetBegBuyListRequest {
  [key: string]: FrontendUnknown;
}

export interface TradGetBegBuyListRequestParts {
  body?: Record<string, never>;
}

export interface TradGetBegBuyListData {
  data?: FrontendUnknown;
  per_page?: string | number;
  total?: string | number;
  [key: string]: FrontendUnknown;
}

export type TradGetBegBuyListResponse = FrontendApiResponse<TradGetBegBuyListData>;

// trad.cancelBegBuy (POST /market/trade/cancelBegBuyOrder)
export const TradCancelBegBuyMeta: ApiOperationMeta = {
  operationId: "trad.cancelBegBuy",
  method: "POST",
  paths: ["/market/trade/cancelBegBuyOrder"],
  auth: false,
  status: "confirmed",
  evidence: ["api/trad/index.js:54"],
};

export interface TradCancelBegBuyRequest {
  order_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface TradCancelBegBuyRequestParts {
  body?: {
    order_id?: string | number;
  };
}

export type TradCancelBegBuyData = FrontendUnknown;

export type TradCancelBegBuyResponse = FrontendApiResponse<TradCancelBegBuyData>;

// trad.getSellBegInfo (POST /market/trade/getSellCollectionInfo)
export const TradGetSellBegInfoMeta: ApiOperationMeta = {
  operationId: "trad.getSellBegInfo",
  method: "POST",
  paths: ["/market/trade/getSellCollectionInfo"],
  auth: false,
  status: "confirmed",
  evidence: ["api/trad/index.js:64"],
};

export interface TradGetSellBegInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface TradGetSellBegInfoRequestParts {
  body?: Record<string, never>;
}

export type TradGetSellBegInfoData = FrontendUnknown;

export type TradGetSellBegInfoResponse = FrontendApiResponse<TradGetSellBegInfoData>;

// trad.sell (POST /market/trade/sell)
export const TradSellMeta: ApiOperationMeta = {
  operationId: "trad.sell",
  method: "POST",
  paths: ["/market/trade/sell"],
  auth: false,
  status: "confirmed",
  evidence: ["api/trad/index.js:73"],
};

export interface TradSellRequest {
  sell_data?: FrontendUnknown;
  pay_way?: FrontendUnknown;
  pay_password?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface TradSellRequestParts {
  body?: {
    sell_data?: FrontendUnknown;
    pay_way?: FrontendUnknown;
    pay_password?: FrontendUnknown;
  };
}

export interface TradSellData {
  password_error?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type TradSellResponse = FrontendApiResponse<TradSellData>;

// trad.getSellInfo (POST /market/trade/tradingInformation)
export const TradGetSellInfoMeta: ApiOperationMeta = {
  operationId: "trad.getSellInfo",
  method: "POST",
  paths: ["/market/trade/tradingInformation"],
  auth: false,
  status: "confirmed",
  evidence: ["api/trad/index.js:82"],
};

export interface TradGetSellInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface TradGetSellInfoRequestParts {
  body?: Record<string, never>;
}

export type TradGetSellInfoData = FrontendUnknown;

export type TradGetSellInfoResponse = FrontendApiResponse<TradGetSellInfoData>;
