import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';

export interface UserInfo {
  id?: string | number;
  mobile?: string;
  [key: string]: FrontendUnknown;
}

// user.oneLogin (POST /user/aliPhoneOauth)
export const UserOneLoginMeta: ApiOperationMeta = {
  operationId: "user.oneLogin",
  method: "POST",
  paths: ["/user/aliPhoneOauth"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/user/index.js:9"],
};

export interface UserOneLoginRequest {
  [key: string]: FrontendUnknown;
}

export interface UserOneLoginRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type UserOneLoginData = FrontendUnknown;

export type UserOneLoginResponse = FrontendApiResponse<UserOneLoginData>;

// user.login (POST /user/login | /user/LoginForMobile)
export const UserLoginMeta: ApiOperationMeta = {
  operationId: "user.login",
  method: "POST",
  paths: ["/user/login","/user/LoginForMobile"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:23"],
};

export interface UserLoginRequest {
  account?: string | number;
  password?: FrontendUnknown;
  mobile?: FrontendUnknown;
  captcha?: FrontendUnknown;
  inviter_code?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface UserLoginRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
    account?: string | number;
    password?: FrontendUnknown;
    mobile?: FrontendUnknown;
    captcha?: FrontendUnknown;
    inviter_code?: FrontendUnknown;
  };
}

export interface UserLoginData {
  userinfo?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type UserLoginResponse = FrontendApiResponse<UserLoginData>;

// user.getUserInfo (POST /user/getUserInfo)
export const UserGetUserInfoMeta: ApiOperationMeta = {
  operationId: "user.getUserInfo",
  method: "POST",
  paths: ["/user/getUserInfo"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:37"],
};

export interface UserGetUserInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface UserGetUserInfoRequestParts {
  body?: Record<string, never>;
}

export type UserGetUserInfoResponse = FrontendApiResponse<UserInfo>;

// user.sendSms (POST /sms/send)
export const UserSendSmsMeta: ApiOperationMeta = {
  operationId: "user.sendSms",
  method: "POST",
  paths: ["/sms/send"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:49"],
};

export interface UserSendSmsRequest {
  mobile?: FrontendUnknown;
  event?: FrontendUnknown;
  verify_token?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface UserSendSmsRequestParts {
  body?: {
    mobile?: FrontendUnknown;
    event?: FrontendUnknown;
    verify_token?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export type UserSendSmsData = FrontendUnknown;

export type UserSendSmsResponse = FrontendApiResponse<UserSendSmsData>;

// user.register (POST /user/register)
export const UserRegisterMeta: ApiOperationMeta = {
  operationId: "user.register",
  method: "POST",
  paths: ["/user/register"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:63"],
};

export interface UserRegisterRequest {
  mobile?: FrontendUnknown;
  password?: FrontendUnknown;
  code?: FrontendUnknown;
  inviter_code?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface UserRegisterRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
    mobile?: FrontendUnknown;
    password?: FrontendUnknown;
    code?: FrontendUnknown;
    inviter_code?: FrontendUnknown;
  };
}

export interface UserRegisterData {
  userinfo?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type UserRegisterResponse = FrontendApiResponse<UserRegisterData>;

// user.updateUserInfo (POST /user/profile)
export const UserUpdateUserInfoMeta: ApiOperationMeta = {
  operationId: "user.updateUserInfo",
  method: "POST",
  paths: ["/user/profile"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:75"],
};

export interface UserUpdateUserInfoRequest {
  avatar?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface UserUpdateUserInfoRequestParts {
  body?: {
    avatar?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export type UserUpdateUserInfoData = FrontendUnknown;

export type UserUpdateUserInfoResponse = FrontendApiResponse<UserUpdateUserInfoData>;

// user.applyCertAuth (POST /user/RealAuthentication)
export const UserApplyCertAuthMeta: ApiOperationMeta = {
  operationId: "user.applyCertAuth",
  method: "POST",
  paths: ["/user/RealAuthentication"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:87"],
};

export interface UserApplyCertAuthRequest {
  real_name?: FrontendUnknown;
  id_card?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface UserApplyCertAuthRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
    real_name?: FrontendUnknown;
    id_card?: FrontendUnknown;
  };
}

export type UserApplyCertAuthData = FrontendUnknown;

export type UserApplyCertAuthResponse = FrontendApiResponse<UserApplyCertAuthData>;

// user.getBankInfo (POST /user/getBankInfo)
export const UserGetBankInfoMeta: ApiOperationMeta = {
  operationId: "user.getBankInfo",
  method: "POST",
  paths: ["/user/getBankInfo"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/user/index.js:100"],
};

export interface UserGetBankInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface UserGetBankInfoRequestParts {
  body?: Record<string, never>;
}

export type UserGetBankInfoData = FrontendUnknown;

export type UserGetBankInfoResponse = FrontendApiResponse<UserGetBankInfoData>;

// user.bindBank (POST /user/bindBank)
export const UserBindBankMeta: ApiOperationMeta = {
  operationId: "user.bindBank",
  method: "POST",
  paths: ["/user/bindBank"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/user/index.js:111"],
};

export interface UserBindBankRequest {
  [key: string]: FrontendUnknown;
}

export interface UserBindBankRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type UserBindBankData = FrontendUnknown;

export type UserBindBankResponse = FrontendApiResponse<UserBindBankData>;

// user.setActionPwd (POST /user/setPayPassword)
export const UserSetActionPwdMeta: ApiOperationMeta = {
  operationId: "user.setActionPwd",
  method: "POST",
  paths: ["/user/setPayPassword"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:123"],
};

export interface UserSetActionPwdRequest {
  [key: string]: FrontendUnknown;
}

export interface UserSetActionPwdRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type UserSetActionPwdData = FrontendUnknown;

export type UserSetActionPwdResponse = FrontendApiResponse<UserSetActionPwdData>;

// user.resetLoginPwd (POST /user/resetpwd)
export const UserResetLoginPwdMeta: ApiOperationMeta = {
  operationId: "user.resetLoginPwd",
  method: "POST",
  paths: ["/user/resetpwd"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:135"],
};

export interface UserResetLoginPwdRequest {
  [key: string]: FrontendUnknown;
}

export interface UserResetLoginPwdRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type UserResetLoginPwdData = FrontendUnknown;

export type UserResetLoginPwdResponse = FrontendApiResponse<UserResetLoginPwdData>;

// user.searchUser (POST /user/ParamsToUser)
export const UserSearchUserMeta: ApiOperationMeta = {
  operationId: "user.searchUser",
  method: "POST",
  paths: ["/user/ParamsToUser"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:147"],
};

export interface UserSearchUserRequest {
  [key: string]: FrontendUnknown;
}

export interface UserSearchUserRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type UserSearchUserData = FrontendUnknown;

export type UserSearchUserResponse = FrontendApiResponse<UserSearchUserData>;

// user.applyIssuer (POST /user/applyIssuer)
export const UserApplyIssuerMeta: ApiOperationMeta = {
  operationId: "user.applyIssuer",
  method: "POST",
  paths: ["/user/applyIssuer"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/user/index.js:159"],
};

export interface UserApplyIssuerRequest {
  [key: string]: FrontendUnknown;
}

export interface UserApplyIssuerRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type UserApplyIssuerData = FrontendUnknown;

export type UserApplyIssuerResponse = FrontendApiResponse<UserApplyIssuerData>;

// user.getSelfIssuerInfo (GET /user/getIssuer)
export const UserGetSelfIssuerInfoMeta: ApiOperationMeta = {
  operationId: "user.getSelfIssuerInfo",
  method: "GET",
  paths: ["/user/getIssuer"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/user/index.js:171"],
};

export interface UserGetSelfIssuerInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface UserGetSelfIssuerInfoRequestParts {
  body?: Record<string, never>;
}

export type UserGetSelfIssuerInfoData = FrontendUnknown;

export type UserGetSelfIssuerInfoResponse = FrontendApiResponse<UserGetSelfIssuerInfoData>;

// user.cehckPayPassword (POST /user/checkPaypass)
export const UserCehckPayPasswordMeta: ApiOperationMeta = {
  operationId: "user.cehckPayPassword",
  method: "POST",
  paths: ["/user/checkPaypass"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:182"],
};

export interface UserCehckPayPasswordRequest {
  pay_password?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface UserCehckPayPasswordRequestParts {
  body?: {
    pay_password?: FrontendUnknown;
    [key: string]: FrontendUnknown;
  };
}

export interface UserCehckPayPasswordData {
  code?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type UserCehckPayPasswordResponse = FrontendApiResponse<UserCehckPayPasswordData>;

// user.flowDoc (POST /user_collection/user_collection/getRecord)
export const UserFlowDocMeta: ApiOperationMeta = {
  operationId: "user.flowDoc",
  method: "POST",
  paths: ["/user_collection/user_collection/getRecord"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:191"],
};

export interface UserFlowDocRequest {
  uc_id?: string | number;
  page?: string | number;
  [key: string]: FrontendUnknown;
}

export interface UserFlowDocRequestParts {
  body?: {
    uc_id?: string | number;
    page?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type UserFlowDocData = FrontendUnknown;

export type UserFlowDocResponse = FrontendApiResponse<UserFlowDocData>;

// user.delAccount (POST /user/delAccount)
export const UserDelAccountMeta: ApiOperationMeta = {
  operationId: "user.delAccount",
  method: "POST",
  paths: ["/user/delAccount"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:204"],
};

export interface UserDelAccountRequest {
  payPassword?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export interface UserDelAccountRequestParts {
  body?: {
    payPassword?: FrontendUnknown;
  };
}

export type UserDelAccountData = FrontendUnknown;

export type UserDelAccountResponse = FrontendApiResponse<UserDelAccountData>;

// user.commision_info (POST /user/commision_info)
export const UserCommisionInfoMeta: ApiOperationMeta = {
  operationId: "user.commision_info",
  method: "POST",
  paths: ["/user/commision_info"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:217"],
};

export interface UserCommisionInfoRequest {
  [key: string]: FrontendUnknown;
}

export interface UserCommisionInfoRequestParts {
  body?: Record<string, never>;
}

export type UserCommisionInfoData = FrontendUnknown;

export type UserCommisionInfoResponse = FrontendApiResponse<UserCommisionInfoData>;

// user.bei_yao_list (POST /user/bei_yao_list)
export const UserBeiYaoListMeta: ApiOperationMeta = {
  operationId: "user.bei_yao_list",
  method: "POST",
  paths: ["/user/bei_yao_list"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:224"],
};

export interface UserBeiYaoListRequest {
  [key: string]: FrontendUnknown;
}

export interface UserBeiYaoListRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type UserBeiYaoListData = FrontendUnknown;

export type UserBeiYaoListResponse = FrontendApiResponse<UserBeiYaoListData>;

// user.commison_rank (POST /user/commison_rank)
export const UserCommisonRankMeta: ApiOperationMeta = {
  operationId: "user.commison_rank",
  method: "POST",
  paths: ["/user/commison_rank"],
  auth: false,
  status: "confirmed",
  evidence: ["api/user/index.js:232"],
};

export interface UserCommisonRankRequest {
  type?: string | number;
  [key: string]: FrontendUnknown;
}

export interface UserCommisonRankRequestParts {
  body?: {
    type?: string | number;
    [key: string]: FrontendUnknown;
  };
}

export type UserCommisonRankData = FrontendUnknown;

export type UserCommisonRankResponse = FrontendApiResponse<UserCommisonRankData>;
