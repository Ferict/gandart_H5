import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';

export interface ProductTransport {
  id?: string | number;
  goods_id?: string | number;
  goods_name?: string;
  goods_type?: string | number;
  main_image?: string;
  listimg?: string;
  collectionlist?: FrontendUnknown[];
  [key: string]: FrontendUnknown;
}

export interface UserCollectionDetailData {
  product?: ProductTransport;
  types?: string | number;
  user_hash?: string;
  rz_code?: string | number;
  [key: string]: FrontendUnknown;
}

// collection.getCollectionList (POST /box/collection/CollectionList)
export const CollectionGetCollectionListMeta: ApiOperationMeta = {
  operationId: "collection.getCollectionList",
  method: "POST",
  paths: ["/box/collection/CollectionList"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:9"],
};

export interface CollectionGetCollectionListRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGetCollectionListRequestParts {
  body?: Record<string, never>;
}

export type CollectionGetCollectionListData = FrontendUnknown;

export type CollectionGetCollectionListResponse = FrontendApiResponse<CollectionGetCollectionListData>;

// collection.getCalenderList (POST /box/blind_box/list)
export const CollectionGetCalenderListMeta: ApiOperationMeta = {
  operationId: "collection.getCalenderList",
  method: "POST",
  paths: ["/box/blind_box/list"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:19"],
};

export interface CollectionGetCalenderListRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGetCalenderListRequestParts {
  body?: Record<string, never>;
}

export type CollectionGetCalenderListData = FrontendUnknown;

export type CollectionGetCalenderListResponse = FrontendApiResponse<CollectionGetCalenderListData>;

// collection.getCollectionDetails (POST /box/collection/ProductDetail/ids/${id})
export const CollectionGetCollectionDetailsMeta: ApiOperationMeta = {
  operationId: "collection.getCollectionDetails",
  method: "POST",
  paths: ["/box/collection/ProductDetail/ids/${id}"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:29"],
};

export interface CollectionGetCollectionDetailsRequest {
  id?: string | number;
  batch_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionGetCollectionDetailsRequestParts {
  path?: {
    id?: string | number;
  };
}

export type CollectionGetCollectionDetailsData = FrontendUnknown;

export type CollectionGetCollectionDetailsResponse = FrontendApiResponse<CollectionGetCollectionDetailsData>;

// collection.getUserSeriesList (POST /user_collection/user_collection/getList)
export const CollectionGetUserSeriesListMeta: ApiOperationMeta = {
  operationId: "collection.getUserSeriesList",
  method: "POST",
  paths: ["/user_collection/user_collection/getList"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:41"],
};

export interface CollectionGetUserSeriesListRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGetUserSeriesListRequestParts {
  body?: Record<string, never>;
}

export type CollectionGetUserSeriesListData = FrontendUnknown;

export type CollectionGetUserSeriesListResponse = FrontendApiResponse<CollectionGetUserSeriesListData>;

// collection.getListDetail (POST /user_collection/user_collection/ListDetail)
export const CollectionGetListDetailMeta: ApiOperationMeta = {
  operationId: "collection.getListDetail",
  method: "POST",
  paths: ["/user_collection/user_collection/ListDetail"],
  auth: true,
  status: "exported-unused",
  evidence: ["api/collection/index.js:50"],
};

export interface CollectionGetListDetailRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGetListDetailRequestParts {
  body?: Record<string, never>;
}

export type CollectionGetListDetailData = FrontendUnknown;

export type CollectionGetListDetailResponse = FrontendApiResponse<CollectionGetListDetailData>;

// collection.getUserCollectionDetailsList (POST /user_collection/user_collection/ListGoodsDetail)
export const CollectionGetUserCollectionDetailsListMeta: ApiOperationMeta = {
  operationId: "collection.getUserCollectionDetailsList",
  method: "POST",
  paths: ["/user_collection/user_collection/ListGoodsDetail"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:60"],
};

export interface CollectionGetUserCollectionDetailsListRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGetUserCollectionDetailsListRequestParts {
  body?: Record<string, never>;
}

export type CollectionGetUserCollectionDetailsListData = FrontendUnknown;

export type CollectionGetUserCollectionDetailsListResponse = FrontendApiResponse<CollectionGetUserCollectionDetailsListData>;

// collection.getUserCollectionDetails (POST /user_collection/user_collection/detail/ids/${id})
export const CollectionGetUserCollectionDetailsMeta: ApiOperationMeta = {
  operationId: "collection.getUserCollectionDetails",
  method: "POST",
  paths: ["/user_collection/user_collection/detail/ids/${id}"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:70"],
};

export interface CollectionGetUserCollectionDetailsRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionGetUserCollectionDetailsRequestParts {
  path?: {
    id?: string | number;
  };
}

export type CollectionGetUserCollectionDetailsResponse = FrontendApiResponse<UserCollectionDetailData>;

// collection.getSellConfig (POST /user_collection/user_collection/show_resale_money)
export const CollectionGetSellConfigMeta: ApiOperationMeta = {
  operationId: "collection.getSellConfig",
  method: "POST",
  paths: ["/user_collection/user_collection/show_resale_money"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:79"],
};

export interface CollectionGetSellConfigRequest {
  price?: string | number;
  user_collection_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionGetSellConfigRequestParts {
  body?: {
    price?: string | number;
    user_collection_id?: string | number;
  };
}

export type CollectionGetSellConfigData = FrontendUnknown;

export type CollectionGetSellConfigResponse = FrontendApiResponse<CollectionGetSellConfigData>;

// collection.sellProduct (POST /user_collection/user_collection/resale | /user_collection/user_collection/batch_resale)
export const CollectionSellProductMeta: ApiOperationMeta = {
  operationId: "collection.sellProduct",
  method: "POST",
  paths: ["/user_collection/user_collection/resale","/user_collection/user_collection/batch_resale"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:92"],
};

export interface CollectionSellProductRequest {
  user_collection_id?: string | number;
  price?: string | number;
  pay_password?: FrontendUnknown;
  income_type?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionSellProductRequestParts {
  body?: {
    user_collection_id?: string | number;
    price?: string | number;
    pay_password?: FrontendUnknown;
    income_type?: string | number;
  };
}

export interface CollectionSellProductData {
  password_error?: FrontendUnknown;
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export type CollectionSellProductResponse = FrontendApiResponse<CollectionSellProductData>;

// collection.givingProduct (POST /user_collection/user_collection/reGift)
export const CollectionGivingProductMeta: ApiOperationMeta = {
  operationId: "collection.givingProduct",
  method: "POST",
  paths: ["/user_collection/user_collection/reGift"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:108"],
};

export interface CollectionGivingProductRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGivingProductRequestParts {
  body?: Record<string, never>;
}

export type CollectionGivingProductData = FrontendUnknown;

export type CollectionGivingProductResponse = FrontendApiResponse<CollectionGivingProductData>;

// collection.givingProductOrder (POST /user_collection/user_collection/reGiftOrder)
export const CollectionGivingProductOrderMeta: ApiOperationMeta = {
  operationId: "collection.givingProductOrder",
  method: "POST",
  paths: ["/user_collection/user_collection/reGiftOrder"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:117"],
};

export interface CollectionGivingProductOrderRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGivingProductOrderRequestParts {
  body?: Record<string, never>;
}

export type CollectionGivingProductOrderData = FrontendUnknown;

export type CollectionGivingProductOrderResponse = FrontendApiResponse<CollectionGivingProductOrderData>;

// collection.getCompoundList (POST /user_collection/user_collection/BoxCollectionList)
export const CollectionGetCompoundListMeta: ApiOperationMeta = {
  operationId: "collection.getCompoundList",
  method: "POST",
  paths: ["/user_collection/user_collection/BoxCollectionList"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:127"],
};

export interface CollectionGetCompoundListRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGetCompoundListRequestParts {
  body?: Record<string, never>;
}

export type CollectionGetCompoundListData = FrontendUnknown;

export type CollectionGetCompoundListResponse = FrontendApiResponse<CollectionGetCompoundListData>;

// collection.getCompoundDetails (POST /user_collection/user_collection/HaveBoxCollection)
export const CollectionGetCompoundDetailsMeta: ApiOperationMeta = {
  operationId: "collection.getCompoundDetails",
  method: "POST",
  paths: ["/user_collection/user_collection/HaveBoxCollection"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:137"],
};

export interface CollectionGetCompoundDetailsRequest {
  box_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionGetCompoundDetailsRequestParts {
  body?: {
    box_id?: string | number;
  };
}

export type CollectionGetCompoundDetailsData = FrontendUnknown;

export type CollectionGetCompoundDetailsResponse = FrontendApiResponse<CollectionGetCompoundDetailsData>;

// collection.buildCollection (POST /user_collection/user_collection/doBoxCollection)
export const CollectionBuildCollectionMeta: ApiOperationMeta = {
  operationId: "collection.buildCollection",
  method: "POST",
  paths: ["/user_collection/user_collection/doBoxCollection"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:149"],
};

export interface CollectionBuildCollectionRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionBuildCollectionRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type CollectionBuildCollectionData = FrontendUnknown;

export type CollectionBuildCollectionResponse = FrontendApiResponse<CollectionBuildCollectionData>;

// collection.getCompoundRecord (POST /user_collection/user_collection/compoundLog)
export const CollectionGetCompoundRecordMeta: ApiOperationMeta = {
  operationId: "collection.getCompoundRecord",
  method: "POST",
  paths: ["/user_collection/user_collection/compoundLog"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:158"],
};

export interface CollectionGetCompoundRecordRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGetCompoundRecordRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type CollectionGetCompoundRecordData = FrontendUnknown;

export type CollectionGetCompoundRecordResponse = FrontendApiResponse<CollectionGetCompoundRecordData>;

// collection.getGiveRecord (POST /user/aboutGift)
export const CollectionGetGiveRecordMeta: ApiOperationMeta = {
  operationId: "collection.getGiveRecord",
  method: "POST",
  paths: ["/user/aboutGift"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:168"],
};

export interface CollectionGetGiveRecordRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGetGiveRecordRequestParts {
  body?: Record<string, never>;
}

export interface CollectionGetGiveRecordData {
  data?: FrontendUnknown;
  total?: string | number;
  [key: string]: FrontendUnknown;
}

export type CollectionGetGiveRecordResponse = FrontendApiResponse<CollectionGetGiveRecordData>;

// collection.getMoveRecord (POST /user_collection/user_collection/collectionCertificate)
export const CollectionGetMoveRecordMeta: ApiOperationMeta = {
  operationId: "collection.getMoveRecord",
  method: "POST",
  paths: ["/user_collection/user_collection/collectionCertificate"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:178"],
};

export interface CollectionGetMoveRecordRequest {
  user_collection_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionGetMoveRecordRequestParts {
  body?: {
    user_collection_id?: string | number;
  };
}

export type CollectionGetMoveRecordData = FrontendUnknown;

export type CollectionGetMoveRecordResponse = FrontendApiResponse<CollectionGetMoveRecordData>;

// collection.getSeriesList (POST /index/getSeries)
export const CollectionGetSeriesListMeta: ApiOperationMeta = {
  operationId: "collection.getSeriesList",
  method: "POST",
  paths: ["/index/getSeries"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:193"],
};

export interface CollectionGetSeriesListRequest {
  type?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionGetSeriesListRequestParts {
  body?: {
    type?: string | number;
  };
}

export type CollectionGetSeriesListData = FrontendUnknown;

export type CollectionGetSeriesListResponse = FrontendApiResponse<CollectionGetSeriesListData>;

// collection.getSelfSeries (POST /index/customSeriesList)
export const CollectionGetSelfSeriesMeta: ApiOperationMeta = {
  operationId: "collection.getSelfSeries",
  method: "POST",
  paths: ["/index/customSeriesList"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:207"],
};

export interface CollectionGetSelfSeriesRequest {
  type?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionGetSelfSeriesRequestParts {
  body?: {
    type?: string | number;
  };
}

export type CollectionGetSelfSeriesData = FrontendUnknown;

export type CollectionGetSelfSeriesResponse = FrontendApiResponse<CollectionGetSelfSeriesData>;

// collection.addSelfSeries (POST /index/customSeriesAdd)
export const CollectionAddSelfSeriesMeta: ApiOperationMeta = {
  operationId: "collection.addSelfSeries",
  method: "POST",
  paths: ["/index/customSeriesAdd"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:221"],
};

export interface CollectionAddSelfSeriesRequest {
  series_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionAddSelfSeriesRequestParts {
  body?: {
    series_id?: string | number;
  };
}

export type CollectionAddSelfSeriesData = FrontendUnknown;

export type CollectionAddSelfSeriesResponse = FrontendApiResponse<CollectionAddSelfSeriesData>;

// collection.removeSelfSeries (POST /index/customSeriesDel)
export const CollectionRemoveSelfSeriesMeta: ApiOperationMeta = {
  operationId: "collection.removeSelfSeries",
  method: "POST",
  paths: ["/index/customSeriesDel"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:237"],
};

export interface CollectionRemoveSelfSeriesRequest {
  series_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionRemoveSelfSeriesRequestParts {
  body?: {
    series_id?: string | number;
  };
}

export type CollectionRemoveSelfSeriesData = FrontendUnknown;

export type CollectionRemoveSelfSeriesResponse = FrontendApiResponse<CollectionRemoveSelfSeriesData>;

// collection.getSeriesGoodsList (POST /index/getCollectionGoods)
export const CollectionGetSeriesGoodsListMeta: ApiOperationMeta = {
  operationId: "collection.getSeriesGoodsList",
  method: "POST",
  paths: ["/index/getCollectionGoods"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:251"],
};

export interface CollectionGetSeriesGoodsListRequest {
  series_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionGetSeriesGoodsListRequestParts {
  body?: {
    series_id?: string | number;
  };
}

export type CollectionGetSeriesGoodsListData = FrontendUnknown;

export type CollectionGetSeriesGoodsListResponse = FrontendApiResponse<CollectionGetSeriesGoodsListData>;

// collection.searchUserCollection (POST /user_collection/exchange/usercollectionList)
export const CollectionSearchUserCollectionMeta: ApiOperationMeta = {
  operationId: "collection.searchUserCollection",
  method: "POST",
  paths: ["/user_collection/exchange/usercollectionList"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:266"],
};

export interface CollectionSearchUserCollectionRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionSearchUserCollectionRequestParts {
  body?: Record<string, never>;
}

export type CollectionSearchUserCollectionData = FrontendUnknown;

export type CollectionSearchUserCollectionResponse = FrontendApiResponse<CollectionSearchUserCollectionData>;

// collection.getDiscountBuy (POST /box.Collection/getCollectionEarlyPurchaseCoupons)
export const CollectionGetDiscountBuyMeta: ApiOperationMeta = {
  operationId: "collection.getDiscountBuy",
  method: "POST",
  paths: ["/box.Collection/getCollectionEarlyPurchaseCoupons"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/collection/index.js:279"],
};

export interface CollectionGetDiscountBuyRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionGetDiscountBuyRequestParts {
  body?: Record<string, never>;
}

export type CollectionGetDiscountBuyData = FrontendUnknown;

export type CollectionGetDiscountBuyResponse = FrontendApiResponse<CollectionGetDiscountBuyData>;

// collection.antMycollection (POST /user_collection/user_collection/antMycollection)
export const CollectionAntMycollectionMeta: ApiOperationMeta = {
  operationId: "collection.antMycollection",
  method: "POST",
  paths: ["/user_collection/user_collection/antMycollection"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:288"],
};

export interface CollectionAntMycollectionRequest {
  [key: string]: FrontendUnknown;
}

export interface CollectionAntMycollectionRequestParts {
  body?: Record<string, never>;
}

export type CollectionAntMycollectionData = FrontendUnknown;

export type CollectionAntMycollectionResponse = FrontendApiResponse<CollectionAntMycollectionData>;

// collection.isCollect (POST /user_collection/user_collection/dellike | /user_collection/user_collection/addlike)
export const CollectionIsCollectMeta: ApiOperationMeta = {
  operationId: "collection.isCollect",
  method: "POST",
  paths: ["/user_collection/user_collection/dellike","/user_collection/user_collection/addlike"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:297"],
};

export interface CollectionIsCollectRequest {
  types?: FrontendUnknown;
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionIsCollectRequestParts {
  body?: {
    types?: FrontendUnknown;
    id?: string | number;
  };
}

export type CollectionIsCollectData = FrontendUnknown;

export type CollectionIsCollectResponse = FrontendApiResponse<CollectionIsCollectData>;

// collection.likeCollection (POST /user_collection/user_collection/likeCollection)
export const CollectionLikeCollectionMeta: ApiOperationMeta = {
  operationId: "collection.likeCollection",
  method: "POST",
  paths: ["/user_collection/user_collection/likeCollection"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:307"],
};

export interface CollectionLikeCollectionRequest {
  keyword?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface CollectionLikeCollectionRequestParts {
  body?: {
    keyword?: FrontendUnknown;
  };
}

export type CollectionLikeCollectionData = FrontendUnknown;

export type CollectionLikeCollectionResponse = FrontendApiResponse<CollectionLikeCollectionData>;

// collection.user_collection_Detail (POST /user_collection/user_collection/getDetail)
export const CollectionUserCollectionDetailMeta: ApiOperationMeta = {
  operationId: "collection.user_collection_Detail",
  method: "POST",
  paths: ["/user_collection/user_collection/getDetail"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:316"],
};

export interface CollectionUserCollectionDetailRequest {
  collection_id?: string | number;
  types?: FrontendUnknown;
  page?: string | number;
  [key: string]: FrontendUnknown;
}

export interface CollectionUserCollectionDetailRequestParts {
  body?: {
    collection_id?: string | number;
    types?: FrontendUnknown;
    page?: string | number;
  };
}

export interface CollectionUserCollectionDetailData {
  list?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type CollectionUserCollectionDetailResponse = FrontendApiResponse<CollectionUserCollectionDetailData>;

// collection.myConsignment (POST /order/order/myConsignment)
export const CollectionMyConsignmentMeta: ApiOperationMeta = {
  operationId: "collection.myConsignment",
  method: "POST",
  paths: ["/order/order/myConsignment"],
  auth: false,
  status: "confirmed",
  evidence: ["api/collection/index.js:325"],
};

export interface CollectionMyConsignmentRequest {
  status?: string | number;
  goods_type?: string | number;
  page?: string | number;
  keyword?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface CollectionMyConsignmentRequestParts {
  body?: {
    status?: string | number;
    goods_type?: string | number;
    page?: string | number;
    keyword?: FrontendUnknown;
  };
}

export type CollectionMyConsignmentData = FrontendUnknown;

export type CollectionMyConsignmentResponse = FrontendApiResponse<CollectionMyConsignmentData>;
