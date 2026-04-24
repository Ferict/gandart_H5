import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// compound.themeinfo (POST /synthesis/themeinfo)
export const CompoundThemeinfoMeta: ApiOperationMeta = {
  operationId: "compound.themeinfo",
  method: "POST",
  paths: ["/synthesis/themeinfo"],
  auth: false,
  status: "confirmed",
  evidence: ["api/compound/index.js:4"],
};

export interface CompoundThemeinfoRequest {
  thm?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface CompoundThemeinfoRequestParts {
  body?: {
    thm?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export interface CompoundThemeinfoData {
  rule_text?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type CompoundThemeinfoResponse = FrontendApiResponse<CompoundThemeinfoData>;

// compound.material (POST /synthesis/material)
export const CompoundMaterialMeta: ApiOperationMeta = {
  operationId: "compound.material",
  method: "POST",
  paths: ["/synthesis/material"],
  auth: false,
  status: "confirmed",
  evidence: ["api/compound/index.js:13"],
};

export interface CompoundMaterialRequest {
  play_id?: string | number;
  classify?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface CompoundMaterialRequestParts {
  body?: {
    play_id?: string | number;
    classify?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export type CompoundMaterialData = FrontendUnknown;

export type CompoundMaterialResponse = FrontendApiResponse<CompoundMaterialData>;

// compound.playInfo (POST /synthesis/playInfo)
export const CompoundPlayInfoMeta: ApiOperationMeta = {
  operationId: "compound.playInfo",
  method: "POST",
  paths: ["/synthesis/playInfo"],
  auth: false,
  status: "confirmed",
  evidence: ["api/compound/index.js:22"],
};

export interface CompoundPlayInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface CompoundPlayInfoRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type CompoundPlayInfoData = FrontendUnknown;

export type CompoundPlayInfoResponse = FrontendApiResponse<CompoundPlayInfoData>;

// compound.selectCollection (POST /synthesis/selectCollection)
export const CompoundSelectCollectionMeta: ApiOperationMeta = {
  operationId: "compound.selectCollection",
  method: "POST",
  paths: ["/synthesis/selectCollection"],
  auth: false,
  status: "confirmed",
  evidence: ["api/compound/index.js:31"],
};

export interface CompoundSelectCollectionRequest {
  collection_ids?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface CompoundSelectCollectionRequestParts {
  body?: {
    collection_ids?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export type CompoundSelectCollectionData = FrontendUnknown;

export type CompoundSelectCollectionResponse = FrontendApiResponse<CompoundSelectCollectionData>;

// compound.synthesizeNow (POST /synthesis/synthesizeNow)
export const CompoundSynthesizeNowMeta: ApiOperationMeta = {
  operationId: "compound.synthesizeNow",
  method: "POST",
  paths: ["/synthesis/synthesizeNow"],
  auth: false,
  status: "confirmed",
  evidence: ["api/compound/index.js:40"],
};

export interface CompoundSynthesizeNowRequest {
  [key: string]: FrontendUnknown;
}

export interface CompoundSynthesizeNowRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export interface CompoundSynthesizeNowData {
  recordId?: string | number;
  [key: string]: FrontendUnknown;
}

export type CompoundSynthesizeNowResponse = FrontendApiResponse<CompoundSynthesizeNowData>;

// compound.recordInfo (POST /synthesis/recordInfo)
export const CompoundRecordInfoMeta: ApiOperationMeta = {
  operationId: "compound.recordInfo",
  method: "POST",
  paths: ["/synthesis/recordInfo"],
  auth: false,
  status: "confirmed",
  evidence: ["api/compound/index.js:49"],
};

export interface CompoundRecordInfoRequest {
  record_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CompoundRecordInfoRequestParts {
  body?: {
    record_id?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type CompoundRecordInfoData = FrontendUnknown;

export type CompoundRecordInfoResponse = FrontendApiResponse<CompoundRecordInfoData>;

// compound.recordList (POST /synthesis/recordList)
export const CompoundRecordListMeta: ApiOperationMeta = {
  operationId: "compound.recordList",
  method: "POST",
  paths: ["/synthesis/recordList"],
  auth: false,
  status: "confirmed",
  evidence: ["api/compound/index.js:58"],
};

export interface CompoundRecordListRequest {
  page?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CompoundRecordListRequestParts {
  body?: {
    page?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type CompoundRecordListData = FrontendUnknown;

export type CompoundRecordListResponse = FrontendApiResponse<CompoundRecordListData>;
