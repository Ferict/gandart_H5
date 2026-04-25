import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// banner.getBannerList (POST /banner/show/getBanner)
export const BannerGetBannerListMeta: ApiOperationMeta = {
  operationId: "banner.getBannerList",
  method: "POST",
  paths: ["/banner/show/getBanner"],
  auth: false,
  status: "confirmed",
  evidence: ["api/banner/index.js:11"],
};

export interface BannerGetBannerListRequest {
  type?: string | number;
  [key: string]: FrontendUnknown;
}

export interface BannerGetBannerListRequestParts {
  body?: {
    type?: string | number;
  };
}

export interface BannerGetBannerListData {
  data?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type BannerGetBannerListResponse = FrontendApiResponse<BannerGetBannerListData>;
