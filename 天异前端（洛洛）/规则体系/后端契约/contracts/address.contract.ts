import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// address.address_list (POST /user/address_list)
export const AddressAddressListMeta: ApiOperationMeta = {
  operationId: "address.address_list",
  method: "POST",
  paths: ["/user/address_list"],
  auth: false,
  status: "confirmed",
  evidence: ["api/address/index.js:11"],
};

export interface AddressAddressListRequest {
  [key: string]: FrontendUnknown;
}

export interface AddressAddressListRequestParts {
  body?: Record<string, never>;
}

export type AddressAddressListData = FrontendUnknown;

export type AddressAddressListResponse = FrontendApiResponse<AddressAddressListData>;

// address.add_edit_address (POST /user/edit_address)
export const AddressAddEditAddressMeta: ApiOperationMeta = {
  operationId: "address.add_edit_address",
  method: "POST",
  paths: ["/user/edit_address"],
  auth: false,
  status: "confirmed",
  evidence: ["api/address/index.js:19"],
};

export interface AddressAddEditAddressRequest {
  id?: string | number;
  s_name?: FrontendUnknown;
  s_phone?: FrontendUnknown;
  isdef?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface AddressAddEditAddressRequestParts {
  body?: {
    id?: string | number;
    s_name?: FrontendUnknown;
    s_phone?: FrontendUnknown;
    isdef?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export type AddressAddEditAddressData = FrontendUnknown;

export type AddressAddEditAddressResponse = FrontendApiResponse<AddressAddEditAddressData>;

// address.address_detail (POST /user/address_detail)
export const AddressAddressDetailMeta: ApiOperationMeta = {
  operationId: "address.address_detail",
  method: "POST",
  paths: ["/user/address_detail"],
  auth: false,
  status: "confirmed",
  evidence: ["api/address/index.js:28"],
};

export interface AddressAddressDetailRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface AddressAddressDetailRequestParts {
  body?: {
    id?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type AddressAddressDetailData = FrontendUnknown;

export type AddressAddressDetailResponse = FrontendApiResponse<AddressAddressDetailData>;

// address.address_delete (POST /user/delUserAddress)
export const AddressAddressDeleteMeta: ApiOperationMeta = {
  operationId: "address.address_delete",
  method: "POST",
  paths: ["/user/delUserAddress"],
  auth: false,
  status: "confirmed",
  evidence: ["api/address/index.js:37"],
};

export interface AddressAddressDeleteRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface AddressAddressDeleteRequestParts {
  body?: {
    id?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type AddressAddressDeleteData = FrontendUnknown;

export type AddressAddressDeleteResponse = FrontendApiResponse<AddressAddressDeleteData>;
