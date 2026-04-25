import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// ext.invitercompound (POST /ext/invitercompound/index)
export const ExtInvitercompoundMeta: ApiOperationMeta = {
  operationId: "ext.invitercompound",
  method: "POST",
  paths: ["/ext/invitercompound/index"],
  auth: false,
  status: "confirmed",
  evidence: ["api/ext/index.js:4"],
};

export interface ExtInvitercompoundRequest {
  [key: string]: FrontendUnknown;
}

export interface ExtInvitercompoundRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export interface ExtInvitercompoundData {
  stutus?: FrontendUnknown;
  inviter_count?: string | number;
  compound_param?: FrontendUnknown;
  collection_count?: string | number;
  [key: string]: FrontendUnknown;
}

export type ExtInvitercompoundResponse = FrontendApiResponse<ExtInvitercompoundData>;
