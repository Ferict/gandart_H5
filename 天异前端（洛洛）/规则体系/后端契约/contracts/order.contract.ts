import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';

export interface OrderTransport {
  id?: string | number;
  order_id?: string | number;
  order_sn?: string;
  batch_order_id?: string | number;
  num?: string | number;
  createtime?: string | number;
  updatetime?: string | number;
  order_status?: string | number;
  order_type?: string | number;
  surplus_time_text?: string;
  goods_type?: string | number;
  goods_cover_image?: string;
  goods_name?: string;
  collection_code?: string | string[] | FrontendUnknown[];
  pay_way?: string | number;
  price?: string | number;
  total_price?: string | number;
  income_type?: string | string[];
  card?: Array<{
    card_sn?: string;
    card_pwd?: string;
    card_keys?: string;
    show_pwd?: boolean | string | number;
    [key: string]: FrontendUnknown;
  }>;
  [key: string]: FrontendUnknown;
}

// order.getOderList (POST /order/order/orderList)
export const OrderGetOderListMeta: ApiOperationMeta = {
  operationId: "order.getOderList",
  method: "POST",
  paths: ["/order/order/orderList"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:10"],
};

export interface OrderGetOderListRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderGetOderListRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderGetOderListResponse = FrontendApiResponse<FrontendPageData<FrontendUnknown>>;

// order.createOrder (POST /order/pay/CreateOrder)
export const OrderCreateOrderMeta: ApiOperationMeta = {
  operationId: "order.createOrder",
  method: "POST",
  paths: ["/order/pay/CreateOrder"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:20"],
};

export interface OrderCreateOrderRequest {
  goods_type?: string | number;
  goods_id?: string | number;
  num?: string | number;
  pay_type?: string | number;
  pay_way?: FrontendUnknown;
  batch_id?: string | number;
  price?: string | number;
  [key: string]: FrontendUnknown;
}

export interface OrderCreateOrderRequestParts {
  body?: {
    goods_type?: string | number;
    goods_id?: string | number;
    num?: string | number;
    pay_type?: string | number;
    pay_way?: FrontendUnknown;
    batch_id?: string | number;
    price?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export interface OrderCreateOrderData {
  order_sn?: FrontendUnknown;
  order_id?: string | number;
  [key: string]: FrontendUnknown;
}

export type OrderCreateOrderResponse = FrontendApiResponse<OrderCreateOrderData>;

// order.createMarketOrder (POST /order/pay/CreateMarketOrder)
export const OrderCreateMarketOrderMeta: ApiOperationMeta = {
  operationId: "order.createMarketOrder",
  method: "POST",
  paths: ["/order/pay/CreateMarketOrder"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:30"],
};

export interface OrderCreateMarketOrderRequest {
  market_goods_id?: string | number;
  pay_type?: string | number;
  pay_way?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface OrderCreateMarketOrderRequestParts {
  body?: {
    market_goods_id?: string | number;
    pay_type?: string | number;
    pay_way?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export interface OrderCreateMarketOrderData {
  order_id?: string | number;
  order_sn?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type OrderCreateMarketOrderResponse = FrontendApiResponse<OrderCreateMarketOrderData>;

// order.createMarketOrderPush (POST /order/pay/CreateMarketOrderRush)
export const OrderCreateMarketOrderPushMeta: ApiOperationMeta = {
  operationId: "order.createMarketOrderPush",
  method: "POST",
  paths: ["/order/pay/CreateMarketOrderRush"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/index.js:38"],
};

export interface OrderCreateMarketOrderPushRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderCreateMarketOrderPushRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderCreateMarketOrderPushData = FrontendUnknown;

export type OrderCreateMarketOrderPushResponse = FrontendApiResponse<OrderCreateMarketOrderPushData>;

// order.getOrderDetails (POST /order/order/orderDetail/ids/${id} | /order/order/MarketOrderDetail/ids/${id})
export const OrderGetOrderDetailsMeta: ApiOperationMeta = {
  operationId: "order.getOrderDetails",
  method: "POST",
  paths: ["/order/order/orderDetail/ids/${id}","/order/order/MarketOrderDetail/ids/${id}"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:48"],
};

export interface OrderGetOrderDetailsRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface OrderGetOrderDetailsRequestParts {
  path?: {
    id?: string | number;
  };
}

export type OrderGetOrderDetailsResponse = FrontendApiResponse<OrderTransport>;

// order.getRegiftOrderDetails (POST /order/order/giveOrderDetail/ids/${id})
export const OrderGetRegiftOrderDetailsMeta: ApiOperationMeta = {
  operationId: "order.getRegiftOrderDetails",
  method: "POST",
  paths: ["/order/order/giveOrderDetail/ids/${id}"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:62"],
};

export interface OrderGetRegiftOrderDetailsRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface OrderGetRegiftOrderDetailsRequestParts {
  path?: {
    id?: string | number;
  };
}

export type OrderGetRegiftOrderDetailsResponse = FrontendApiResponse<OrderTransport>;

// order.getMarketOrderDetails (POST /order/order/saleMarketOrderDetail)
export const OrderGetMarketOrderDetailsMeta: ApiOperationMeta = {
  operationId: "order.getMarketOrderDetails",
  method: "POST",
  paths: ["/order/order/saleMarketOrderDetail"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:72"],
};

export interface OrderGetMarketOrderDetailsRequest {
  order_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface OrderGetMarketOrderDetailsRequestParts {
  body?: {
    order_id?: string | number;
  };
}

export type OrderGetMarketOrderDetailsResponse = FrontendApiResponse<OrderTransport>;

// order.changeOrderStatus (POST /order/order/changeOrderStatus | /order/order/changeMarketOrderStatus | /order/order/changeGiveOrderStatus)
export const OrderChangeOrderStatusMeta: ApiOperationMeta = {
  operationId: "order.changeOrderStatus",
  method: "POST",
  paths: ["/order/order/changeOrderStatus","/order/order/changeMarketOrderStatus","/order/order/changeGiveOrderStatus"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:86"],
};

export interface OrderChangeOrderStatusRequest {
  order_type?: string | number;
  status?: string | number;
  order_sn?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface OrderChangeOrderStatusRequestParts {
  body?: {
    order_type?: string | number;
    status?: string | number;
    order_sn?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export type OrderChangeOrderStatusData = FrontendUnknown;

export type OrderChangeOrderStatusResponse = FrontendApiResponse<OrderChangeOrderStatusData>;

// order.doPay (POST /order/pay/doPay)
export const OrderDoPayMeta: ApiOperationMeta = {
  operationId: "order.doPay",
  method: "POST",
  paths: ["/order/pay/doPay"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:112"],
};

export interface OrderDoPayRequest {
  pay_type?: string | number;
  order_number?: FrontendUnknown;
  order_type?: string | number;
  pay_way?: FrontendUnknown;
  pay_scene?: FrontendUnknown;
  returnurl?: FrontendUnknown;
  pay_password?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface OrderDoPayRequestParts {
  body?: {
    pay_type?: string | number;
    order_number?: FrontendUnknown;
    order_type?: string | number;
    pay_way?: FrontendUnknown;
    pay_scene?: FrontendUnknown;
    returnurl?: FrontendUnknown;
    pay_password?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export interface OrderDoPayData {
  balancePay?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type OrderDoPayResponse = FrontendApiResponse<OrderDoPayData>;

// order.signUpDraw (POST /order/pay/doQualification)
export const OrderSignUpDrawMeta: ApiOperationMeta = {
  operationId: "order.signUpDraw",
  method: "POST",
  paths: ["/order/pay/doQualification"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/index.js:125"],
};

export interface OrderSignUpDrawRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderSignUpDrawRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderSignUpDrawData = FrontendUnknown;

export type OrderSignUpDrawResponse = FrontendApiResponse<OrderSignUpDrawData>;

// order.queryDrawStatus (POST /order/pay/lookQualification)
export const OrderQueryDrawStatusMeta: ApiOperationMeta = {
  operationId: "order.queryDrawStatus",
  method: "POST",
  paths: ["/order/pay/lookQualification"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/index.js:138"],
};

export interface OrderQueryDrawStatusRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderQueryDrawStatusRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderQueryDrawStatusData = FrontendUnknown;

export type OrderQueryDrawStatusResponse = FrontendApiResponse<OrderQueryDrawStatusData>;

// order.queryDramOrSignUpList (POST /order/pay/qualification)
export const OrderQueryDramOrSignUpListMeta: ApiOperationMeta = {
  operationId: "order.queryDramOrSignUpList",
  method: "POST",
  paths: ["/order/pay/qualification"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/index.js:150"],
};

export interface OrderQueryDramOrSignUpListRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderQueryDramOrSignUpListRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderQueryDramOrSignUpListResponse = FrontendApiResponse<OrderTransport>;

// order.fastCreateOrder (POST /order/pay/fastOrderNew)
export const OrderFastCreateOrderMeta: ApiOperationMeta = {
  operationId: "order.fastCreateOrder",
  method: "POST",
  paths: ["/order/pay/fastOrderNew"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:161"],
};

export interface OrderFastCreateOrderRequest {
  goods_id?: string | number;
  key?: FrontendUnknown;
  pay_way?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface OrderFastCreateOrderRequestParts {
  body?: {
    goods_id?: string | number;
    key?: FrontendUnknown;
    pay_way?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export interface OrderFastCreateOrderData {
  order_sn?: FrontendUnknown;
  order_id?: string | number;
  [key: string]: FrontendUnknown;
}

export type OrderFastCreateOrderResponse = FrontendApiResponse<OrderFastCreateOrderData>;

// order.bacthCreateOrder (POST /order/pay/batchBuy)
export const OrderBacthCreateOrderMeta: ApiOperationMeta = {
  operationId: "order.bacthCreateOrder",
  method: "POST",
  paths: ["/order/pay/batchBuy"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:175"],
};

export interface OrderBacthCreateOrderRequest {
  goods_id?: string | number;
  key?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface OrderBacthCreateOrderRequestParts {
  body?: {
    goods_id?: string | number;
    key?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export type OrderBacthCreateOrderData = FrontendUnknown;

export type OrderBacthCreateOrderResponse = FrontendApiResponse<OrderBacthCreateOrderData>;

// order.cancelBatchOrder (POST /order/order/cancelbatchorder)
export const OrderCancelBatchOrderMeta: ApiOperationMeta = {
  operationId: "order.cancelBatchOrder",
  method: "POST",
  paths: ["/order/order/cancelbatchorder"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:185"],
};

export interface OrderCancelBatchOrderRequest {
  batch_order_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface OrderCancelBatchOrderRequestParts {
  body?: {
    batch_order_id?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type OrderCancelBatchOrderData = FrontendUnknown;

export type OrderCancelBatchOrderResponse = FrontendApiResponse<OrderCancelBatchOrderData>;

// order.getBatchOrderList (POST /order/order/batchPayOrder)
export const OrderGetBatchOrderListMeta: ApiOperationMeta = {
  operationId: "order.getBatchOrderList",
  method: "POST",
  paths: ["/order/order/batchPayOrder"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:195"],
};

export interface OrderGetBatchOrderListRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderGetBatchOrderListRequestParts {
  body?: Record<string, never>;
}

export type OrderGetBatchOrderListResponse = FrontendApiResponse<FrontendPageData<OrderTransport>>;

// order.createBatchPayOrder (POST /order/pay/batchdopay)
export const OrderCreateBatchPayOrderMeta: ApiOperationMeta = {
  operationId: "order.createBatchPayOrder",
  method: "POST",
  paths: ["/order/pay/batchdopay"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/index.js:204"],
};

export interface OrderCreateBatchPayOrderRequest {
  order_ids?: FrontendUnknown;
  batch_order_id?: string | number;
  pay_way?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface OrderCreateBatchPayOrderRequestParts {
  body?: {
    order_ids?: FrontendUnknown;
    batch_order_id?: string | number;
    pay_way?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export interface OrderCreateBatchPayOrderData {
  order_type?: string | number;
  [key: string]: FrontendUnknown;
}

export type OrderCreateBatchPayOrderResponse = FrontendApiResponse<OrderCreateBatchPayOrderData>;

// order.order.getOderList (POST /order/order/orderList)
export const OrderOrderGetOderListMeta: ApiOperationMeta = {
  operationId: "order.order.getOderList",
  method: "POST",
  paths: ["/order/order/orderList"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:9"],
};

export interface OrderOrderGetOderListRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderGetOderListRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderGetOderListResponse = FrontendApiResponse<FrontendPageData<FrontendUnknown>>;

// order.order.createOrder (POST /order/pay/CreateOrder)
export const OrderOrderCreateOrderMeta: ApiOperationMeta = {
  operationId: "order.order.createOrder",
  method: "POST",
  paths: ["/order/pay/CreateOrder"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:19"],
};

export interface OrderOrderCreateOrderRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderCreateOrderRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderCreateOrderData = FrontendUnknown;

export type OrderOrderCreateOrderResponse = FrontendApiResponse<OrderOrderCreateOrderData>;

// order.order.createMarketOrder (POST /order/pay/CreateMarketOrder)
export const OrderOrderCreateMarketOrderMeta: ApiOperationMeta = {
  operationId: "order.order.createMarketOrder",
  method: "POST",
  paths: ["/order/pay/CreateMarketOrder"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:29"],
};

export interface OrderOrderCreateMarketOrderRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderCreateMarketOrderRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderCreateMarketOrderData = FrontendUnknown;

export type OrderOrderCreateMarketOrderResponse = FrontendApiResponse<OrderOrderCreateMarketOrderData>;

// order.order.getOrderDetails (POST /order/order/orderDetail/ids/${id} | /order/order/MarketOrderDetail/ids/${id})
export const OrderOrderGetOrderDetailsMeta: ApiOperationMeta = {
  operationId: "order.order.getOrderDetails",
  method: "POST",
  paths: ["/order/order/orderDetail/ids/${id}","/order/order/MarketOrderDetail/ids/${id}"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:41"],
};

export interface OrderOrderGetOrderDetailsRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface OrderOrderGetOrderDetailsRequestParts {
  path?: {
    id?: string | number;
  };
}

export type OrderOrderGetOrderDetailsResponse = FrontendApiResponse<OrderTransport>;

// order.order.changeOrderStatus (POST /order/order/changeOrderStatus | /order/order/changeMarketOrderStatus)
export const OrderOrderChangeOrderStatusMeta: ApiOperationMeta = {
  operationId: "order.order.changeOrderStatus",
  method: "POST",
  paths: ["/order/order/changeOrderStatus","/order/order/changeMarketOrderStatus"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:56"],
};

export interface OrderOrderChangeOrderStatusRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderChangeOrderStatusRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderChangeOrderStatusData = FrontendUnknown;

export type OrderOrderChangeOrderStatusResponse = FrontendApiResponse<OrderOrderChangeOrderStatusData>;

// order.order.doPay (POST /order/pay/doPay)
export const OrderOrderDoPayMeta: ApiOperationMeta = {
  operationId: "order.order.doPay",
  method: "POST",
  paths: ["/order/pay/doPay"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:77"],
};

export interface OrderOrderDoPayRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderDoPayRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderDoPayData = FrontendUnknown;

export type OrderOrderDoPayResponse = FrontendApiResponse<OrderOrderDoPayData>;

// order.order.signUpDraw (POST /draw/doQualification)
export const OrderOrderSignUpDrawMeta: ApiOperationMeta = {
  operationId: "order.order.signUpDraw",
  method: "POST",
  paths: ["/draw/doQualification"],
  auth: false,
  status: "confirmed",
  evidence: ["api/order/order.js:90"],
};

export interface OrderOrderSignUpDrawRequest {
  goods_id?: string | number;
  goods_type?: string | number;
  helpucode?: FrontendUnknown;
  newuser?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface OrderOrderSignUpDrawRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
    goods_id?: string | number;
    goods_type?: string | number;
    helpucode?: FrontendUnknown;
    newuser?: FrontendUnknown;
  };
}

export type OrderOrderSignUpDrawData = FrontendUnknown;

export type OrderOrderSignUpDrawResponse = FrontendApiResponse<OrderOrderSignUpDrawData>;

// order.order.queryDrawStatus (POST /order/pay/lookQualification)
export const OrderOrderQueryDrawStatusMeta: ApiOperationMeta = {
  operationId: "order.order.queryDrawStatus",
  method: "POST",
  paths: ["/order/pay/lookQualification"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:103"],
};

export interface OrderOrderQueryDrawStatusRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderQueryDrawStatusRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderQueryDrawStatusData = FrontendUnknown;

export type OrderOrderQueryDrawStatusResponse = FrontendApiResponse<OrderOrderQueryDrawStatusData>;

// order.order.queryDramOrSignUpList (POST /order/pay/qualification)
export const OrderOrderQueryDramOrSignUpListMeta: ApiOperationMeta = {
  operationId: "order.order.queryDramOrSignUpList",
  method: "POST",
  paths: ["/order/pay/qualification"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:115"],
};

export interface OrderOrderQueryDramOrSignUpListRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderQueryDramOrSignUpListRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderQueryDramOrSignUpListResponse = FrontendApiResponse<OrderTransport>;

// order.order.openHfWallet (POST /wallet/huifu/openAccount)
export const OrderOrderOpenHfWalletMeta: ApiOperationMeta = {
  operationId: "order.order.openHfWallet",
  method: "POST",
  paths: ["/wallet/huifu/openAccount"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:124"],
};

export interface OrderOrderOpenHfWalletRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderOpenHfWalletRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderOpenHfWalletData = FrontendUnknown;

export type OrderOrderOpenHfWalletResponse = FrontendApiResponse<OrderOrderOpenHfWalletData>;

// order.order.getWalletAddr (POST /wallet/huifu/wallet)
export const OrderOrderGetWalletAddrMeta: ApiOperationMeta = {
  operationId: "order.order.getWalletAddr",
  method: "POST",
  paths: ["/wallet/huifu/wallet"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:131"],
};

export interface OrderOrderGetWalletAddrRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderGetWalletAddrRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderGetWalletAddrData = FrontendUnknown;

export type OrderOrderGetWalletAddrResponse = FrontendApiResponse<OrderOrderGetWalletAddrData>;

// order.order.CreateHuifuAccountOrder (POST /order/pay/CreateHuifuAccountOrder)
export const OrderOrderCreateHuifuAccountOrderMeta: ApiOperationMeta = {
  operationId: "order.order.CreateHuifuAccountOrder",
  method: "POST",
  paths: ["/order/pay/CreateHuifuAccountOrder"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/order/order.js:141"],
};

export interface OrderOrderCreateHuifuAccountOrderRequest {
  [key: string]: FrontendUnknown;
}

export interface OrderOrderCreateHuifuAccountOrderRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type OrderOrderCreateHuifuAccountOrderData = FrontendUnknown;

export type OrderOrderCreateHuifuAccountOrderResponse = FrontendApiResponse<OrderOrderCreateHuifuAccountOrderData>;
