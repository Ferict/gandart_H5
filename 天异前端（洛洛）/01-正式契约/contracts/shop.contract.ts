import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// shop.shop.goodsList (POST /crystal_goods/list)
export const ShopShopGoodsListMeta: ApiOperationMeta = {
  operationId: "shop.shop.goodsList",
  method: "POST",
  paths: ["/crystal_goods/list"],
  auth: false,
  status: "confirmed",
  evidence: ["api/shop/shop.js:5"],
};

export interface ShopShopGoodsListRequest {
  [key: string]: FrontendUnknown;
}

export interface ShopShopGoodsListRequestParts {
  body?: Record<string, never>;
}

export type ShopShopGoodsListData = FrontendUnknown;

export type ShopShopGoodsListResponse = FrontendApiResponse<ShopShopGoodsListData>;

// shop.shop.crystalDetail (POST /crystal_goods/crystalDetail)
export const ShopShopCrystalDetailMeta: ApiOperationMeta = {
  operationId: "shop.shop.crystalDetail",
  method: "POST",
  paths: ["/crystal_goods/crystalDetail"],
  auth: false,
  status: "confirmed",
  evidence: ["api/shop/shop.js:14"],
};

export interface ShopShopCrystalDetailRequest {
  [key: string]: FrontendUnknown;
}

export interface ShopShopCrystalDetailRequestParts {
  body?: Record<string, never>;
}

export type ShopShopCrystalDetailData = FrontendUnknown;

export type ShopShopCrystalDetailResponse = FrontendApiResponse<ShopShopCrystalDetailData>;

// shop.shop.exchangeRecord (POST /crystal_goods/exchangeRecord)
export const ShopShopExchangeRecordMeta: ApiOperationMeta = {
  operationId: "shop.shop.exchangeRecord",
  method: "POST",
  paths: ["/crystal_goods/exchangeRecord"],
  auth: false,
  status: "confirmed",
  evidence: ["api/shop/shop.js:22"],
};

export interface ShopShopExchangeRecordRequest {
  [key: string]: FrontendUnknown;
}

export interface ShopShopExchangeRecordRequestParts {
  body?: Record<string, never>;
}

export type ShopShopExchangeRecordData = FrontendUnknown;

export type ShopShopExchangeRecordResponse = FrontendApiResponse<ShopShopExchangeRecordData>;

// shop.shop.getGoodsInfo (POST /crystal_goods/info)
export const ShopShopGetGoodsInfoMeta: ApiOperationMeta = {
  operationId: "shop.shop.getGoodsInfo",
  method: "POST",
  paths: ["/crystal_goods/info"],
  auth: false,
  status: "confirmed",
  evidence: ["api/shop/shop.js:33"],
};

export interface ShopShopGetGoodsInfoRequest {
  goods_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface ShopShopGetGoodsInfoRequestParts {
  body?: {
    goods_id?: string | number;
  };
}

export type ShopShopGetGoodsInfoData = FrontendUnknown;

export type ShopShopGetGoodsInfoResponse = FrontendApiResponse<ShopShopGetGoodsInfoData>;

// shop.shop.exchange (POST /crystal_goods/exchange)
export const ShopShopExchangeMeta: ApiOperationMeta = {
  operationId: "shop.shop.exchange",
  method: "POST",
  paths: ["/crystal_goods/exchange"],
  auth: false,
  status: "confirmed",
  evidence: ["api/shop/shop.js:44"],
};

export interface ShopShopExchangeRequest {
  goods_id?: string | number;
  number?: FrontendUnknown;
  address_id?: string | number;
  pay_password?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface ShopShopExchangeRequestParts {
  body?: {
    goods_id?: string | number;
    number?: FrontendUnknown;
    address_id?: string | number;
    pay_password?: FrontendUnknown;
  };
}

export interface ShopShopExchangeData {
  password_error?: FrontendUnknown;
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export type ShopShopExchangeResponse = FrontendApiResponse<ShopShopExchangeData>;

// shop.shop.getECardPass (POST /crystal_goods/getCardCode)
export const ShopShopGetECardPassMeta: ApiOperationMeta = {
  operationId: "shop.shop.getECardPass",
  method: "POST",
  paths: ["/crystal_goods/getCardCode"],
  auth: false,
  status: "confirmed",
  evidence: ["api/shop/shop.js:53"],
};

export interface ShopShopGetECardPassRequest {
  pay_password?: FrontendUnknown;
  sn?: FrontendUnknown;
  order_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface ShopShopGetECardPassRequestParts {
  body?: {
    pay_password?: FrontendUnknown;
    sn?: FrontendUnknown;
    order_id?: string | number;
  };
}

export type ShopShopGetECardPassData = FrontendUnknown;

export type ShopShopGetECardPassResponse = FrontendApiResponse<ShopShopGetECardPassData>;
