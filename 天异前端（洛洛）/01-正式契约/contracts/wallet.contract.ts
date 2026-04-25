import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';

export interface WalletOpenResult {
  redirect_url?: string;
  info?: WalletRedirectInfo;
  mer_cust_id?: string | number;
  price?: string | number;
  resp_code?: string | number;
  resp_desc?: string;
  [key: string]: FrontendUnknown;
}

export interface WalletOpenInfoResult {
  info: WalletRedirectInfo;
  [key: string]: FrontendUnknown;
}

// wallet.getWalletInfo (POST /user/getWalletInfo)
export const WalletGetWalletInfoMeta: ApiOperationMeta = {
  operationId: "wallet.getWalletInfo",
  method: "POST",
  paths: ["/user/getWalletInfo"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:10"],
};

export interface WalletGetWalletInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletGetWalletInfoRequestParts {
  body?: Record<string, never>;
}

export type WalletGetWalletInfoData = FrontendUnknown;

export type WalletGetWalletInfoResponse = FrontendApiResponse<WalletGetWalletInfoData>;

// wallet.sendMobileCodeForLL (POST /order/Ll/blindMobile)
export const WalletSendMobileCodeForLLMeta: ApiOperationMeta = {
  operationId: "wallet.sendMobileCodeForLL",
  method: "POST",
  paths: ["/order/Ll/blindMobile"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:25"],
};

export interface WalletSendMobileCodeForLLRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletSendMobileCodeForLLRequestParts {
  body?: Record<string, never>;
}

export type WalletSendMobileCodeForLLData = FrontendUnknown;

export type WalletSendMobileCodeForLLResponse = FrontendApiResponse<WalletSendMobileCodeForLLData>;

// wallet.verifyMobileCodeForLL (POST /order/Ll/blindMobileCheck)
export const WalletVerifyMobileCodeForLLMeta: ApiOperationMeta = {
  operationId: "wallet.verifyMobileCodeForLL",
  method: "POST",
  paths: ["/order/Ll/blindMobileCheck"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:38"],
};

export interface WalletVerifyMobileCodeForLLRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletVerifyMobileCodeForLLRequestParts {
  body?: Record<string, never>;
}

export type WalletVerifyMobileCodeForLLData = FrontendUnknown;

export type WalletVerifyMobileCodeForLLResponse = FrontendApiResponse<WalletVerifyMobileCodeForLLData>;

// wallet.supplementInfo (POST /order/Ll/userApply)
export const WalletSupplementInfoMeta: ApiOperationMeta = {
  operationId: "wallet.supplementInfo",
  method: "POST",
  paths: ["/order/Ll/userApply"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:53"],
};

export interface WalletSupplementInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletSupplementInfoRequestParts {
  body?: Record<string, never>;
}

export type WalletSupplementInfoData = FrontendUnknown;

export type WalletSupplementInfoResponse = FrontendApiResponse<WalletSupplementInfoData>;

// wallet.getApply (POST /order/Ll/getApply)
export const WalletGetApplyMeta: ApiOperationMeta = {
  operationId: "wallet.getApply",
  method: "POST",
  paths: ["/order/Ll/getApply"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:65"],
};

export interface WalletGetApplyRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletGetApplyRequestParts {
  body?: Record<string, never>;
}

export type WalletGetApplyData = FrontendUnknown;

export type WalletGetApplyResponse = FrontendApiResponse<WalletGetApplyData>;

// wallet.orderSmsCheck (POST /order/pay/paySmsCheck)
export const WalletOrderSmsCheckMeta: ApiOperationMeta = {
  operationId: "wallet.orderSmsCheck",
  method: "POST",
  paths: ["/order/pay/paySmsCheck"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:80"],
};

export interface WalletOrderSmsCheckRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletOrderSmsCheckRequestParts {
  body?: Record<string, never>;
}

export type WalletOrderSmsCheckData = FrontendUnknown;

export type WalletOrderSmsCheckResponse = FrontendApiResponse<WalletOrderSmsCheckData>;

// wallet.recharge (POST /order/pay/Recharge)
export const WalletRechargeMeta: ApiOperationMeta = {
  operationId: "wallet.recharge",
  method: "POST",
  paths: ["/order/pay/Recharge"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:92"],
};

export interface WalletRechargeRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletRechargeRequestParts {
  body?: Record<string, never>;
}

export type WalletRechargeData = FrontendUnknown;

export type WalletRechargeResponse = FrontendApiResponse<WalletRechargeData>;

// wallet.withdrawal (POST /order/cash/applyCash)
export const WalletWithdrawalMeta: ApiOperationMeta = {
  operationId: "wallet.withdrawal",
  method: "POST",
  paths: ["/order/cash/applyCash"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:105"],
};

export interface WalletWithdrawalRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletWithdrawalRequestParts {
  body?: Record<string, never>;
}

export type WalletWithdrawalData = FrontendUnknown;

export type WalletWithdrawalResponse = FrontendApiResponse<WalletWithdrawalData>;

// wallet.getWithdrawal (POST /order/cash/cashList)
export const WalletGetWithdrawalMeta: ApiOperationMeta = {
  operationId: "wallet.getWithdrawal",
  method: "POST",
  paths: ["/order/cash/cashList"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:118"],
};

export interface WalletGetWithdrawalRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletGetWithdrawalRequestParts {
  body?: Record<string, never>;
}

export type WalletGetWithdrawalData = FrontendUnknown;

export type WalletGetWithdrawalResponse = FrontendApiResponse<WalletGetWithdrawalData>;

// wallet.getWalletDetailList (POST /user/getLlOrder)
export const WalletGetWalletDetailListMeta: ApiOperationMeta = {
  operationId: "wallet.getWalletDetailList",
  method: "POST",
  paths: ["/user/getLlOrder"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:130"],
};

export interface WalletGetWalletDetailListRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletGetWalletDetailListRequestParts {
  body?: Record<string, never>;
}

export type WalletGetWalletDetailListData = FrontendUnknown;

export type WalletGetWalletDetailListResponse = FrontendApiResponse<WalletGetWalletDetailListData>;

// wallet.getLLBankList (POST /user/getllbank)
export const WalletGetLLBankListMeta: ApiOperationMeta = {
  operationId: "wallet.getLLBankList",
  method: "POST",
  paths: ["/user/getllbank"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:143"],
};

export interface WalletGetLLBankListRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletGetLLBankListRequestParts {
  body?: Record<string, never>;
}

export type WalletGetLLBankListData = FrontendUnknown;

export type WalletGetLLBankListResponse = FrontendApiResponse<WalletGetLLBankListData>;

// wallet.setLlDeaultBank (POST /user/setlldef)
export const WalletSetLlDeaultBankMeta: ApiOperationMeta = {
  operationId: "wallet.setLlDeaultBank",
  method: "POST",
  paths: ["/user/setlldef"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/wallet/index.js:156"],
};

export interface WalletSetLlDeaultBankRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletSetLlDeaultBankRequestParts {
  body?: Record<string, never>;
}

export type WalletSetLlDeaultBankData = FrontendUnknown;

export type WalletSetLlDeaultBankResponse = FrontendApiResponse<WalletSetLlDeaultBankData>;

// wallet.getHuiFuInfo (POST /wallet/huifu/wallet)
export const WalletGetHuiFuInfoMeta: ApiOperationMeta = {
  operationId: "wallet.getHuiFuInfo",
  method: "POST",
  paths: ["/wallet/huifu/wallet"],
  auth: false,
  status: "confirmed",
  evidence: ["api/wallet/index.js:170"],
};

export interface WalletGetHuiFuInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletGetHuiFuInfoRequestParts {
  body?: Record<string, never>;
}

export type WalletGetHuiFuInfoResponse = FrontendApiResponse<WalletOpenInfoResult>;

// wallet.openHuiFu (POST /wallet/huifu/openAccount)
export const WalletOpenHuiFuMeta: ApiOperationMeta = {
  operationId: "wallet.openHuiFu",
  method: "POST",
  paths: ["/wallet/huifu/openAccount"],
  auth: false,
  status: "confirmed",
  evidence: ["api/wallet/index.js:182"],
};

export interface WalletOpenHuiFuRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletOpenHuiFuRequestParts {
  body?: Record<string, never>;
}

export type WalletOpenHuiFuResponse = FrontendApiResponse<WalletOpenResult>;

// wallet.openYiBao (POST /wallet/yibao/openAccount)
export const WalletOpenYiBaoMeta: ApiOperationMeta = {
  operationId: "wallet.openYiBao",
  method: "POST",
  paths: ["/wallet/yibao/openAccount"],
  auth: false,
  status: "confirmed",
  evidence: ["api/wallet/index.js:195"],
};

export interface WalletOpenYiBaoRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletOpenYiBaoRequestParts {
  body?: Record<string, never>;
}

export type WalletOpenYiBaoResponse = FrontendApiResponse<WalletOpenInfoResult>;

// wallet.CreateHuifuAccountOrder (POST /order/pay/CreateHuifuAccountOrder)
export const WalletCreateHuifuAccountOrderMeta: ApiOperationMeta = {
  operationId: "wallet.CreateHuifuAccountOrder",
  method: "POST",
  paths: ["/order/pay/CreateHuifuAccountOrder"],
  auth: false,
  status: "confirmed",
  evidence: ["api/wallet/index.js:207"],
};

export interface WalletCreateHuifuAccountOrderRequest {
  [key: string]: FrontendUnknown;
}

export interface WalletCreateHuifuAccountOrderRequestParts {
  body?: Record<string, never>;
}

export type WalletCreateHuifuAccountOrderData = FrontendUnknown;

export type WalletCreateHuifuAccountOrderResponse = FrontendApiResponse<WalletCreateHuifuAccountOrderData>;
