import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// box.getBoxDetails (POST /box/blind_box/BoxDetail/ids/${id})
export const BoxGetBoxDetailsMeta: ApiOperationMeta = {
  operationId: "box.getBoxDetails",
  method: "POST",
  paths: ["/box/blind_box/BoxDetail/ids/${id}"],
  auth: false,
  status: "confirmed",
  evidence: ["api/box/index.js:10"],
};

export interface BoxGetBoxDetailsRequest {
  id?: string | number;
  origin?: FrontendUnknown;
  crystal_goods_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface BoxGetBoxDetailsRequestParts {
  path?: {
    id?: string | number;
  };
  query?: {
    origin?: FrontendUnknown;
    crystal_goods_id?: string | number;
  };
}

export type BoxGetBoxDetailsData = FrontendUnknown;

export type BoxGetBoxDetailsResponse = FrontendApiResponse<BoxGetBoxDetailsData>;

// box.openBox (POST /user_collection/user_collection/openbox)
export const BoxOpenBoxMeta: ApiOperationMeta = {
  operationId: "box.openBox",
  method: "POST",
  paths: ["/user_collection/user_collection/openbox"],
  auth: false,
  status: "confirmed",
  evidence: ["api/box/index.js:22"],
};

export interface BoxOpenBoxRequest {
  openid?: string | number;
  [key: string]: FrontendUnknown;
}

export interface BoxOpenBoxRequestParts {
  body?: {
    openid?: string | number;
  };
}

export type BoxOpenBoxData = FrontendUnknown;

export type BoxOpenBoxResponse = FrontendApiResponse<BoxOpenBoxData>;

// box.openBoxs (POST /user_collection/user_collection/openBoxs)
export const BoxOpenBoxsMeta: ApiOperationMeta = {
  operationId: "box.openBoxs",
  method: "POST",
  paths: ["/user_collection/user_collection/openBoxs"],
  auth: false,
  status: "confirmed",
  evidence: ["api/box/index.js:32"],
};

export interface BoxOpenBoxsRequest {
  openid?: string | number;
  [key: string]: FrontendUnknown;
}

export interface BoxOpenBoxsRequestParts {
  body?: {
    openid?: string | number;
  };
}

export type BoxOpenBoxsData = FrontendUnknown;

export type BoxOpenBoxsResponse = FrontendApiResponse<BoxOpenBoxsData>;

// box.getOpenRecord (POST /box/blind_box/openlog)
export const BoxGetOpenRecordMeta: ApiOperationMeta = {
  operationId: "box.getOpenRecord",
  method: "POST",
  paths: ["/box/blind_box/openlog"],
  auth: false,
  status: "confirmed",
  evidence: ["api/box/index.js:49"],
};

export interface BoxGetOpenRecordRequest {
  [key: string]: FrontendUnknown;
}

export interface BoxGetOpenRecordRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export interface BoxGetOpenRecordData {
  total?: string | number;
  data?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type BoxGetOpenRecordResponse = FrontendApiResponse<BoxGetOpenRecordData>;
