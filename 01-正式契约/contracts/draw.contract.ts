import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';

export interface DrawInfoData {
  codeList?: FrontendUnknown[];
  winning_time?: string | number;
  remaining_invited?: string | number;
  remaining?: string | number;
  reg_start_time?: string | number;
  reg_end_time?: string | number;
  content?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type DrawCodeData = string;

// draw.getDraw (POST /draw/get)
export const DrawGetDrawMeta: ApiOperationMeta = {
  operationId: "draw.getDraw",
  method: "POST",
  paths: ["/draw/get"],
  auth: false,
  status: "confirmed",
  evidence: ["api/draw/index.js:5"],
};

export interface DrawGetDrawRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface DrawGetDrawRequestParts {
  body?: {
    id?: string | number;
  };
}

export type DrawGetDrawResponse = FrontendApiResponse<DrawInfoData>;

// draw.draw (POST /draw/draw)
export const DrawDrawMeta: ApiOperationMeta = {
  operationId: "draw.draw",
  method: "POST",
  paths: ["/draw/draw"],
  auth: false,
  status: "confirmed",
  evidence: ["api/draw/index.js:15"],
};

export interface DrawDrawRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface DrawDrawRequestParts {
  body?: {
    id?: string | number;
  };
}

export type DrawDrawResponse = FrontendApiResponse<DrawCodeData>;

// draw.drawLog (POST /draw/drawLog)
export const DrawDrawLogMeta: ApiOperationMeta = {
  operationId: "draw.drawLog",
  method: "POST",
  paths: ["/draw/drawLog"],
  auth: false,
  status: "confirmed",
  evidence: ["api/draw/index.js:26"],
};

export interface DrawDrawLogRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface DrawDrawLogRequestParts {
  body?: {
    id?: string | number;
  };
}

export type DrawDrawLogResponse = FrontendApiResponse<FrontendUnknown[]>;

// draw.drawRecord (POST /draw/drawRecord)
export const DrawDrawRecordMeta: ApiOperationMeta = {
  operationId: "draw.drawRecord",
  method: "POST",
  paths: ["/draw/drawRecord"],
  auth: false,
  status: "confirmed",
  evidence: ["api/draw/index.js:37"],
};

export interface DrawDrawRecordRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface DrawDrawRecordRequestParts {
  body?: {
    id?: string | number;
  };
}

export type DrawDrawRecordResponse = FrontendApiResponse<FrontendUnknown[]>;
