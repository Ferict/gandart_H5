import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// subscribe.subscribe (POST /subscribe/index | /subscribe/cancel)
export const SubscribeSubscribeMeta: ApiOperationMeta = {
  operationId: "subscribe.subscribe",
  method: "POST",
  paths: ["/subscribe/index","/subscribe/cancel"],
  auth: false,
  status: "confirmed",
  evidence: ["api/subscribe/index.js:7"],
};

export interface SubscribeSubscribeRequest {
  [key: string]: FrontendUnknown;
}

export interface SubscribeSubscribeRequestParts {
  body?: Record<string, never>;
}

export type SubscribeSubscribeData = FrontendUnknown;

export type SubscribeSubscribeResponse = FrontendApiResponse<SubscribeSubscribeData>;
