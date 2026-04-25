import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// integral.get_score_list (POST /user/score_list)
export const IntegralGetScoreListMeta: ApiOperationMeta = {
  operationId: "integral.get_score_list",
  method: "POST",
  paths: ["/user/score_list"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:4"],
};

export interface IntegralGetScoreListRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralGetScoreListRequestParts {
  body?: Record<string, never>;
}

export type IntegralGetScoreListData = FrontendUnknown;

export type IntegralGetScoreListResponse = FrontendApiResponse<IntegralGetScoreListData>;

// integral.get_my_share_details (GET /score/get_my_share_details)
export const IntegralGetMyShareDetailsMeta: ApiOperationMeta = {
  operationId: "integral.get_my_share_details",
  method: "GET",
  paths: ["/score/get_my_share_details"],
  auth: false,
  status: "confirmed",
  evidence: ["api/integral/index.js:15"],
};

export interface IntegralGetMyShareDetailsRequest {
  type?: string | number;
  [key: string]: FrontendUnknown;
}

export interface IntegralGetMyShareDetailsRequestParts {
  body?: {
    type?: string | number;
  };
}

export interface IntegralGetMyShareDetailsData {
  score?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type IntegralGetMyShareDetailsResponse = FrontendApiResponse<IntegralGetMyShareDetailsData>;

// integral.shareSub (POST /score/share)
export const IntegralShareSubMeta: ApiOperationMeta = {
  operationId: "integral.shareSub",
  method: "POST",
  paths: ["/score/share"],
  auth: false,
  status: "confirmed",
  evidence: ["api/integral/index.js:25"],
};

export interface IntegralShareSubRequest {
  images?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface IntegralShareSubRequestParts {
  body?: {
    images?: FrontendUnknown;
  };
}

export type IntegralShareSubData = FrontendUnknown;

export type IntegralShareSubResponse = FrontendApiResponse<IntegralShareSubData>;

// integral.getGoodsList (POST /goods/getlist)
export const IntegralGetGoodsListMeta: ApiOperationMeta = {
  operationId: "integral.getGoodsList",
  method: "POST",
  paths: ["/goods/getlist"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:34"],
};

export interface IntegralGetGoodsListRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralGetGoodsListRequestParts {
  body?: Record<string, never>;
}

export type IntegralGetGoodsListData = FrontendUnknown;

export type IntegralGetGoodsListResponse = FrontendApiResponse<IntegralGetGoodsListData>;

// integral.getGoodsCate (GET /goods/getcate)
export const IntegralGetGoodsCateMeta: ApiOperationMeta = {
  operationId: "integral.getGoodsCate",
  method: "GET",
  paths: ["/goods/getcate"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:43"],
};

export interface IntegralGetGoodsCateRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralGetGoodsCateRequestParts {
  body?: Record<string, never>;
}

export type IntegralGetGoodsCateData = FrontendUnknown;

export type IntegralGetGoodsCateResponse = FrontendApiResponse<IntegralGetGoodsCateData>;

// integral.goodsDetailsApi (POST /goods/detail)
export const IntegralGoodsDetailsApiMeta: ApiOperationMeta = {
  operationId: "integral.goodsDetailsApi",
  method: "POST",
  paths: ["/goods/detail"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:51"],
};

export interface IntegralGoodsDetailsApiRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralGoodsDetailsApiRequestParts {
  body?: Record<string, never>;
}

export type IntegralGoodsDetailsApiData = FrontendUnknown;

export type IntegralGoodsDetailsApiResponse = FrontendApiResponse<IntegralGoodsDetailsApiData>;

// integral.huodouOrder (POST /order/pay/huodouOrder)
export const IntegralHuodouOrderMeta: ApiOperationMeta = {
  operationId: "integral.huodouOrder",
  method: "POST",
  paths: ["/order/pay/huodouOrder"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:60"],
};

export interface IntegralHuodouOrderRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralHuodouOrderRequestParts {
  body?: Record<string, never>;
}

export type IntegralHuodouOrderData = FrontendUnknown;

export type IntegralHuodouOrderResponse = FrontendApiResponse<IntegralHuodouOrderData>;

// integral.huodouList (GET /goods/huodouList)
export const IntegralHuodouListMeta: ApiOperationMeta = {
  operationId: "integral.huodouList",
  method: "GET",
  paths: ["/goods/huodouList"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:69"],
};

export interface IntegralHuodouListRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralHuodouListRequestParts {
  body?: Record<string, never>;
}

export type IntegralHuodouListData = FrontendUnknown;

export type IntegralHuodouListResponse = FrontendApiResponse<IntegralHuodouListData>;

// integral.huodouDetail (POST /goods/huodouDetail)
export const IntegralHuodouDetailMeta: ApiOperationMeta = {
  operationId: "integral.huodouDetail",
  method: "POST",
  paths: ["/goods/huodouDetail"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:78"],
};

export interface IntegralHuodouDetailRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralHuodouDetailRequestParts {
  body?: Record<string, never>;
}

export type IntegralHuodouDetailData = FrontendUnknown;

export type IntegralHuodouDetailResponse = FrontendApiResponse<IntegralHuodouDetailData>;

// integral.getScoreGuessList (POST /scoreguess/getlist)
export const IntegralGetScoreGuessListMeta: ApiOperationMeta = {
  operationId: "integral.getScoreGuessList",
  method: "POST",
  paths: ["/scoreguess/getlist"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:90"],
};

export interface IntegralGetScoreGuessListRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralGetScoreGuessListRequestParts {
  body?: Record<string, never>;
}

export type IntegralGetScoreGuessListData = FrontendUnknown;

export type IntegralGetScoreGuessListResponse = FrontendApiResponse<IntegralGetScoreGuessListData>;

// integral.guess_detail (GET /scoreguess/guess_detail)
export const IntegralGuessDetailMeta: ApiOperationMeta = {
  operationId: "integral.guess_detail",
  method: "GET",
  paths: ["/scoreguess/guess_detail"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:99"],
};

export interface IntegralGuessDetailRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralGuessDetailRequestParts {
  body?: Record<string, never>;
}

export type IntegralGuessDetailData = FrontendUnknown;

export type IntegralGuessDetailResponse = FrontendApiResponse<IntegralGuessDetailData>;

// integral.get_my_score_guess_list (POST /scoreguess/get_my_score_guess_list)
export const IntegralGetMyScoreGuessListMeta: ApiOperationMeta = {
  operationId: "integral.get_my_score_guess_list",
  method: "POST",
  paths: ["/scoreguess/get_my_score_guess_list"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:108"],
};

export interface IntegralGetMyScoreGuessListRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralGetMyScoreGuessListRequestParts {
  body?: Record<string, never>;
}

export type IntegralGetMyScoreGuessListData = FrontendUnknown;

export type IntegralGetMyScoreGuessListResponse = FrontendApiResponse<IntegralGetMyScoreGuessListData>;

// integral.join_guess (POST /scoreguess/join_guess)
export const IntegralJoinGuessMeta: ApiOperationMeta = {
  operationId: "integral.join_guess",
  method: "POST",
  paths: ["/scoreguess/join_guess"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:117"],
};

export interface IntegralJoinGuessRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralJoinGuessRequestParts {
  body?: Record<string, never>;
}

export type IntegralJoinGuessData = FrontendUnknown;

export type IntegralJoinGuessResponse = FrontendApiResponse<IntegralJoinGuessData>;

// integral.guess_success (POST /scoreguess/guess_success)
export const IntegralGuessSuccessMeta: ApiOperationMeta = {
  operationId: "integral.guess_success",
  method: "POST",
  paths: ["/scoreguess/guess_success"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:126"],
};

export interface IntegralGuessSuccessRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralGuessSuccessRequestParts {
  body?: Record<string, never>;
}

export type IntegralGuessSuccessData = FrontendUnknown;

export type IntegralGuessSuccessResponse = FrontendApiResponse<IntegralGuessSuccessData>;

// integral.get_my_guess (POST /scoreguess/get_my_guess)
export const IntegralGetMyGuessMeta: ApiOperationMeta = {
  operationId: "integral.get_my_guess",
  method: "POST",
  paths: ["/scoreguess/get_my_guess"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/integral/index.js:135"],
};

export interface IntegralGetMyGuessRequest {
  [key: string]: FrontendUnknown;
}

export interface IntegralGetMyGuessRequestParts {
  body?: Record<string, never>;
}

export type IntegralGetMyGuessData = FrontendUnknown;

export type IntegralGetMyGuessResponse = FrontendApiResponse<IntegralGetMyGuessData>;
