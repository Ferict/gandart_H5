export type FrontendPrimitive = string | number | boolean | null;
export type FrontendUnknown = unknown;

export interface FrontendApiResponse<T = FrontendUnknown> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
  [key: string]: FrontendUnknown;
}

export interface FrontendPageData<T = FrontendUnknown> {
  list?: T[];
  data?: T[];
  total?: string | number;
  current_page?: string | number;
  last_page?: string | number;
  per_page?: string | number;
  [key: string]: FrontendUnknown;
}

export type FrontendErrorCode = 400 | 401 | 702 | 710 | 3003 | 4003 | number;

export interface WalletRedirectInfo {
  redirect_url: string;
  [key: string]: FrontendUnknown;
}

export interface RuntimeDerivedFieldNotice {
  fieldPath: string;
  sourceField: string;
  deriveRule: string;
}

export interface ApiOperationMeta {
  operationId: string;
  method: string;
  paths: string[];
  auth: boolean;
  status: 'confirmed' | 'exported-unused' | 'deprecated-dead' | 'missing-evidence' | 'inferred' | 'unresolved';
  evidence: string[];
}

// common.getUploadParams (POST /common/uploadaccess)
export const CommonGetUploadParamsMeta: ApiOperationMeta = {
  operationId: "common.getUploadParams",
  method: "POST",
  paths: ["/common/uploadaccess"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:9"],
};

export interface CommonGetUploadParamsRequest {
  [key: string]: FrontendUnknown;
}

export interface CommonGetUploadParamsRequestParts {
  body?: Record<string, never>;
}

export type CommonGetUploadParamsData = FrontendUnknown;

export type CommonGetUploadParamsResponse = FrontendApiResponse<CommonGetUploadParamsData>;

// common.getUserRank (POST /user/masterinfo)
export const CommonGetUserRankMeta: ApiOperationMeta = {
  operationId: "common.getUserRank",
  method: "POST",
  paths: ["/user/masterinfo"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:16"],
};

export interface CommonGetUserRankRequest {
  user_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CommonGetUserRankRequestParts {
  body?: {
    user_id?: string | number;
  };
}

export type CommonGetUserRankData = FrontendUnknown;

export type CommonGetUserRankResponse = FrontendApiResponse<CommonGetUserRankData>;

// common.getMasterRank (POST /user/masterlist)
export const CommonGetMasterRankMeta: ApiOperationMeta = {
  operationId: "common.getMasterRank",
  method: "POST",
  paths: ["/user/masterlist"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:27"],
};

export interface CommonGetMasterRankRequest {
  page?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CommonGetMasterRankRequestParts {
  body?: {
    page?: string | number;
  };
}

export type CommonGetMasterRankData = FrontendUnknown;

export type CommonGetMasterRankResponse = FrontendApiResponse<CommonGetMasterRankData>;

// common.setClickNum (POST /user/setbuynum)
export const CommonSetClickNumMeta: ApiOperationMeta = {
  operationId: "common.setClickNum",
  method: "POST",
  paths: ["/user/setbuynum"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:36"],
};

export interface CommonSetClickNumRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CommonSetClickNumRequestParts {
  body?: {
    id?: string | number;
  };
}

export type CommonSetClickNumData = FrontendUnknown;

export type CommonSetClickNumResponse = FrontendApiResponse<CommonSetClickNumData>;

// common.getConfig (POST /index/getConfig)
export const CommonGetConfigMeta: ApiOperationMeta = {
  operationId: "common.getConfig",
  method: "POST",
  paths: ["/index/getConfig"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:50"],
};

export interface CommonGetConfigRequest {
  key?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface CommonGetConfigRequestParts {
  body?: {
    key?: FrontendUnknown;
  };
}

export interface CommonGetConfigData {
  copyright?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type CommonGetConfigResponse = FrontendApiResponse<CommonGetConfigData>;

// common.getFileInfo (POST /common/getAttachment)
export const CommonGetFileInfoMeta: ApiOperationMeta = {
  operationId: "common.getFileInfo",
  method: "POST",
  paths: ["/common/getAttachment"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/common/index.js:66"],
};

export interface CommonGetFileInfoRequest {
  url?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface CommonGetFileInfoRequestParts {
  body?: {
    url?: FrontendUnknown;
  };
}

export type CommonGetFileInfoData = FrontendUnknown;

export type CommonGetFileInfoResponse = FrontendApiResponse<CommonGetFileInfoData>;

// common.getVersion (POST /index/getVersion)
export const CommonGetVersionMeta: ApiOperationMeta = {
  operationId: "common.getVersion",
  method: "POST",
  paths: ["/index/getVersion"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:80"],
};

export interface CommonGetVersionRequest {
  [key: string]: FrontendUnknown;
}

export interface CommonGetVersionRequestParts {
  body?: Record<string, never>;
}

export interface CommonGetVersionData {
  download_url?: FrontendUnknown;
  updateType?: string | number;
  version?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type CommonGetVersionResponse = FrontendApiResponse<CommonGetVersionData>;

// common.getRank (POST /user/newrank1)
export const CommonGetRankMeta: ApiOperationMeta = {
  operationId: "common.getRank",
  method: "POST",
  paths: ["/user/newrank1"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:88"],
};

export interface CommonGetRankRequest {
  [key: string]: FrontendUnknown;
}

export interface CommonGetRankRequestParts {
  body?: Record<string, never>;
}

export type CommonGetRankData = FrontendUnknown;

export type CommonGetRankResponse = FrontendApiResponse<CommonGetRankData>;

// common.getRankingList (POST /user/ranking)
export const CommonGetRankingListMeta: ApiOperationMeta = {
  operationId: "common.getRankingList",
  method: "POST",
  paths: ["/user/ranking"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:99"],
};

export interface CommonGetRankingListRequest {
  [key: string]: FrontendUnknown;
}

export interface CommonGetRankingListRequestParts {
  body?: Record<string, never>;
}

export interface CommonGetRankingListData {
  data?: FrontendUnknown;
  activityRule?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type CommonGetRankingListResponse = FrontendApiResponse<CommonGetRankingListData>;

// common.getPageConfig (POST /addons/diypage/index)
export const CommonGetPageConfigMeta: ApiOperationMeta = {
  operationId: "common.getPageConfig",
  method: "POST",
  paths: ["/addons/diypage/index"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:110"],
};

export interface CommonGetPageConfigRequest {
  [key: string]: FrontendUnknown;
}

export interface CommonGetPageConfigRequestParts {
  body?: Record<string, never>;
}

export type CommonGetPageConfigData = FrontendUnknown;

export type CommonGetPageConfigResponse = FrontendApiResponse<CommonGetPageConfigData>;

// common.getActiveActivities (POST /activity/accessNewActivities)
export const CommonGetActiveActivitiesMeta: ApiOperationMeta = {
  operationId: "common.getActiveActivities",
  method: "POST",
  paths: ["/activity/accessNewActivities"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/common/index.js:121"],
};

export interface CommonGetActiveActivitiesRequest {
  [key: string]: FrontendUnknown;
}

export interface CommonGetActiveActivitiesRequestParts {
  body?: Record<string, never>;
}

export type CommonGetActiveActivitiesData = FrontendUnknown;

export type CommonGetActiveActivitiesResponse = FrontendApiResponse<CommonGetActiveActivitiesData>;

// common.getWYYToken (POST /auth/index/gettoken)
export const CommonGetWYYTokenMeta: ApiOperationMeta = {
  operationId: "common.getWYYToken",
  method: "POST",
  paths: ["/auth/index/gettoken"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/common/index.js:133"],
};

export interface CommonGetWYYTokenRequest {
  [key: string]: FrontendUnknown;
}

export interface CommonGetWYYTokenRequestParts {
  body?: Record<string, never>;
}

export type CommonGetWYYTokenData = FrontendUnknown;

export type CommonGetWYYTokenResponse = FrontendApiResponse<CommonGetWYYTokenData>;

// common.getCapt (POST /sms/getCapt)
export const CommonGetCaptMeta: ApiOperationMeta = {
  operationId: "common.getCapt",
  method: "POST",
  paths: ["/sms/getCapt"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/common/index.js:147"],
};

export interface CommonGetCaptRequest {
  [key: string]: FrontendUnknown;
}

export interface CommonGetCaptRequestParts {
  body?: Record<string, never>;
}

export type CommonGetCaptData = FrontendUnknown;

export type CommonGetCaptResponse = FrontendApiResponse<CommonGetCaptData>;

// common.getTest (POST /index/gettest)
export const CommonGetTestMeta: ApiOperationMeta = {
  operationId: "common.getTest",
  method: "POST",
  paths: ["/index/gettest"],
  auth: false,
  status: "confirmed",
  evidence: ["api/common/index.js:157"],
};

export interface CommonGetTestRequest {
  [key: string]: FrontendUnknown;
}

export interface CommonGetTestRequestParts {
  body?: Record<string, never>;
}

export type CommonGetTestData = FrontendUnknown;

export type CommonGetTestResponse = FrontendApiResponse<CommonGetTestData>;
