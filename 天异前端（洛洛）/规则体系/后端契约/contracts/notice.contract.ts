import type { ApiOperationMeta, FrontendApiResponse, FrontendPageData, FrontendUnknown, WalletRedirectInfo } from './common.contract';


// notice.getNoticeClasses (POST /index/affichetypelist)
export const NoticeGetNoticeClassesMeta: ApiOperationMeta = {
  operationId: "notice.getNoticeClasses",
  method: "POST",
  paths: ["/index/affichetypelist"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:10"],
};

export interface NoticeGetNoticeClassesRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeGetNoticeClassesRequestParts {
  body?: Record<string, never>;
}

export type NoticeGetNoticeClassesData = FrontendUnknown;

export type NoticeGetNoticeClassesResponse = FrontendApiResponse<NoticeGetNoticeClassesData>;

// notice.getNoticeList (POST /index/afficheList)
export const NoticeGetNoticeListMeta: ApiOperationMeta = {
  operationId: "notice.getNoticeList",
  method: "POST",
  paths: ["/index/afficheList"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:21"],
};

export interface NoticeGetNoticeListRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeGetNoticeListRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export interface NoticeGetNoticeListData {
  data?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type NoticeGetNoticeListResponse = FrontendApiResponse<NoticeGetNoticeListData>;

// notice.getNoticeDetails (POST /index/afficheDetail/ids/${id})
export const NoticeGetNoticeDetailsMeta: ApiOperationMeta = {
  operationId: "notice.getNoticeDetails",
  method: "POST",
  paths: ["/index/afficheDetail/ids/${id}"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:33"],
};

export interface NoticeGetNoticeDetailsRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface NoticeGetNoticeDetailsRequestParts {
  path?: {
    id?: string | number;
  };
}

export type NoticeGetNoticeDetailsData = FrontendUnknown;

export type NoticeGetNoticeDetailsResponse = FrontendApiResponse<NoticeGetNoticeDetailsData>;

// notice.getMessageList (POST /user/newList)
export const NoticeGetMessageListMeta: ApiOperationMeta = {
  operationId: "notice.getMessageList",
  method: "POST",
  paths: ["/user/newList"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/notice/index.js:44"],
};

export interface NoticeGetMessageListRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeGetMessageListRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type NoticeGetMessageListData = FrontendUnknown;

export type NoticeGetMessageListResponse = FrontendApiResponse<NoticeGetMessageListData>;

// notice.readMessage (POST /user/readMsgById)
export const NoticeReadMessageMeta: ApiOperationMeta = {
  operationId: "notice.readMessage",
  method: "POST",
  paths: ["/user/readMsgById"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/notice/index.js:57"],
};

export interface NoticeReadMessageRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface NoticeReadMessageRequestParts {
  body?: {
    id?: string | number;
  };
}

export type NoticeReadMessageData = FrontendUnknown;

export type NoticeReadMessageResponse = FrontendApiResponse<NoticeReadMessageData>;

// notice.readAllMessage (POST /user/oneKeyRead)
export const NoticeReadAllMessageMeta: ApiOperationMeta = {
  operationId: "notice.readAllMessage",
  method: "POST",
  paths: ["/user/oneKeyRead"],
  auth: false,
  status: "exported-unused",
  evidence: ["api/notice/index.js:72"],
};

export interface NoticeReadAllMessageRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeReadAllMessageRequestParts {
  body?: Record<string, never>;
}

export type NoticeReadAllMessageData = FrontendUnknown;

export type NoticeReadAllMessageResponse = FrontendApiResponse<NoticeReadAllMessageData>;

// notice.getNewsClasses (POST /discover/ant_news/category)
export const NoticeGetNewsClassesMeta: ApiOperationMeta = {
  operationId: "notice.getNewsClasses",
  method: "POST",
  paths: ["/discover/ant_news/category"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:83"],
};

export interface NoticeGetNewsClassesRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeGetNewsClassesRequestParts {
  body?: Record<string, never>;
}

export type NoticeGetNewsClassesData = FrontendUnknown;

export type NoticeGetNewsClassesResponse = FrontendApiResponse<NoticeGetNewsClassesData>;

// notice.getNewsList (POST /discover/ant_news/list)
export const NoticeGetNewsListMeta: ApiOperationMeta = {
  operationId: "notice.getNewsList",
  method: "POST",
  paths: ["/discover/ant_news/list"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:94"],
};

export interface NoticeGetNewsListRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeGetNewsListRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export interface NoticeGetNewsListData {
  data?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type NoticeGetNewsListResponse = FrontendApiResponse<NoticeGetNewsListData>;

// notice.getNewsDetails (POST /discover/ant_news/info)
export const NoticeGetNewsDetailsMeta: ApiOperationMeta = {
  operationId: "notice.getNewsDetails",
  method: "POST",
  paths: ["/discover/ant_news/info"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:103"],
};

export interface NoticeGetNewsDetailsRequest {
  news_id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface NoticeGetNewsDetailsRequestParts {
  body?: {
    news_id?: string | number;
  };
}

export type NoticeGetNewsDetailsData = FrontendUnknown;

export type NoticeGetNewsDetailsResponse = FrontendApiResponse<NoticeGetNewsDetailsData>;

// notice.getWallList (POST /discover/rumor_wall/list)
export const NoticeGetWallListMeta: ApiOperationMeta = {
  operationId: "notice.getWallList",
  method: "POST",
  paths: ["/discover/rumor_wall/list"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:116"],
};

export interface NoticeGetWallListRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeGetWallListRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export interface NoticeGetWallListData {
  data?: FrontendUnknown;
  [key: string]: FrontendUnknown;
}

export type NoticeGetWallListResponse = FrontendApiResponse<NoticeGetWallListData>;

// notice.sendRumor (POST /discover/rumor_wall/release)
export const NoticeSendRumorMeta: ApiOperationMeta = {
  operationId: "notice.sendRumor",
  method: "POST",
  paths: ["/discover/rumor_wall/release"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:126"],
};

export interface NoticeSendRumorRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeSendRumorRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type NoticeSendRumorData = FrontendUnknown;

export type NoticeSendRumorResponse = FrontendApiResponse<NoticeSendRumorData>;

// notice.sendComment (POST /discover/rumor_wall/comment)
export const NoticeSendCommentMeta: ApiOperationMeta = {
  operationId: "notice.sendComment",
  method: "POST",
  paths: ["/discover/rumor_wall/comment"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:137"],
};

export interface NoticeSendCommentRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeSendCommentRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type NoticeSendCommentData = FrontendUnknown;

export type NoticeSendCommentResponse = FrontendApiResponse<NoticeSendCommentData>;

// notice.getRumorDetails (POST /discover/rumor_wall/info)
export const NoticeGetRumorDetailsMeta: ApiOperationMeta = {
  operationId: "notice.getRumorDetails",
  method: "POST",
  paths: ["/discover/rumor_wall/info"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:151"],
};

export interface NoticeGetRumorDetailsRequest {
  id?: string | number;
  [key: string]: FrontendUnknown;
}

export interface NoticeGetRumorDetailsRequestParts {
  body?: {
    id?: string | number;
  };
}

export type NoticeGetRumorDetailsData = FrontendUnknown;

export type NoticeGetRumorDetailsResponse = FrontendApiResponse<NoticeGetRumorDetailsData>;

// notice.getRumorComment (POST /discover/rumor_wall/getcomment)
export const NoticeGetRumorCommentMeta: ApiOperationMeta = {
  operationId: "notice.getRumorComment",
  method: "POST",
  paths: ["/discover/rumor_wall/getcomment"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:165"],
};

export interface NoticeGetRumorCommentRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeGetRumorCommentRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type NoticeGetRumorCommentData = FrontendUnknown;

export type NoticeGetRumorCommentResponse = FrontendApiResponse<NoticeGetRumorCommentData>;

// notice.getRumorReply (POST /discover/rumor_wall/getReply)
export const NoticeGetRumorReplyMeta: ApiOperationMeta = {
  operationId: "notice.getRumorReply",
  method: "POST",
  paths: ["/discover/rumor_wall/getReply"],
  auth: false,
  status: "confirmed",
  evidence: ["api/notice/index.js:180"],
};

export interface NoticeGetRumorReplyRequest {
  [key: string]: FrontendUnknown;
}

export interface NoticeGetRumorReplyRequestParts {
  body?: {
    [key: string]: FrontendUnknown;
  };
}

export type NoticeGetRumorReplyData = FrontendUnknown;

export type NoticeGetRumorReplyResponse = FrontendApiResponse<NoticeGetRumorReplyData>;
