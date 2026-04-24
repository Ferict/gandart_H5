import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// active.category (POST /Activity/category)
export const ActiveCategoryMeta: ApiOperationMeta = {
  operationId: "active.category",
  method: "POST",
  paths: ["/Activity/category"],
  auth: false,
  status: "confirmed",
  evidence: ["api/active/index.js:11"],
};

export interface ActiveCategoryRequest {
  [key: string]: FrontendUnknown;
}

export interface ActiveCategoryRequestParts {
  body?: Record<string, never>;
}

export type ActiveCategoryData = FrontendUnknown;

export type ActiveCategoryResponse = FrontendApiResponse<ActiveCategoryData>;
