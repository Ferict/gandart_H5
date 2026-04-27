/**
 * Responsibility: provide the canonical mock identity-verification resource payload
 * consumed by the updating auth page through the formal content resource chain.
 * Out of scope: page-local interaction state, transport/provider selection, and
 * real backend submit side effects.
 */
import type {
  ContentIdentityVerificationFeatureDto,
  ContentIdentityVerificationPayloadDto,
  ContentIdentityVerificationResultDto,
} from '../../contracts/content-api.contract'

export interface ContentIdentityVerificationRecord {
  resourceId: string
  title: string
  status: string
  updatedAt: string
  summary: string
  payload: ContentIdentityVerificationPayloadDto
}

const cloneResult = (
  result: ContentIdentityVerificationResultDto
): ContentIdentityVerificationResultDto => ({
  ...result,
})

const cloneFeature = (
  feature: ContentIdentityVerificationFeatureDto
): ContentIdentityVerificationFeatureDto => ({
  ...feature,
})

const clonePayload = (
  payload: ContentIdentityVerificationPayloadDto
): ContentIdentityVerificationPayloadDto => ({
  ...payload,
  unlockedFeatures: payload.unlockedFeatures.map((feature) => cloneFeature(feature)),
  successResult: cloneResult(payload.successResult),
  failureResult: cloneResult(payload.failureResult),
})

const createRecord = (
  record: ContentIdentityVerificationRecord
): ContentIdentityVerificationRecord => ({
  ...record,
  payload: clonePayload(record.payload),
})

export const contentIdentityVerificationDb: ContentIdentityVerificationRecord[] = [
  createRecord({
    resourceId: 'auth',
    title: '实名认证',
    status: 'LIVE',
    updatedAt: '2026-04-27T09:41:00+08:00',
    summary: '实名认证页统一承接认证状态、资料补录、联网核验与审核结果反馈。',
    payload: {
      verificationStatus: 'unverified',
      legalName: '',
      idNumber: '',
      maskedIdNumber: '',
      namePlaceholder: '您的真实姓名',
      idNumberPlaceholder: '18位二代身份证号',
      verifiedAt: '2026.03.27 14:05:22',
      didNode: 'did:aether:0x8A9...3F92',
      unlockedFeatures: [
        {
          iconKey: 'box',
          title: '数字资产确权与铸造',
          description: '获得官方首发数字资产及衍生品的专属铸造与重构权限。',
        },
        {
          iconKey: 'repeat-2',
          title: '二级市场交易',
          description: '开通数字资产的流转、寄售及点对点安全转移功能。',
        },
        {
          iconKey: 'gift',
          title: '专属权益与空投',
          description: '自动纳入官方节点快照，获取平台生态相关权益及资产空投。',
        },
      ],
      securityStatementTitle: '数据安全与隐私保护',
      securityStatementCopy:
        '根据相关法律法规要求，您的身份信息已通过国家官方权威数据源核验，并采用不可逆的哈希加密技术进行脱敏处理。平台承诺严格遵守数据保护规范，不会明文存储您的敏感信息。',
      submitEnabled: true,
      agreementCheckedByDefault: false,
      privacyPolicyLabel: '《隐私权政策》',
      consentCopy: '我已阅读并同意《隐私权政策》。本人承诺提供的信息真实有效，并授权进行联网核验。',
      processingCode: 'CONNECTING_DATABASE',
      processingTitle: '信息联网核查中',
      processingDescription: '正在与官方安全数据库进行比对，请勿关闭页面。',
      auditOrganization: '官方联合验证系统',
      mockSubmitResult: 'success',
      successResult: {
        tone: 'success',
        title: '认证审核通过',
        code: 'VERIFICATION_PASSED',
        description: '您的身份信息已成功绑定。现已解锁完整的资产铸造与二级市场交易权限。',
        actionLabel: '完成并返回',
        auditFeedback: '信息真实有效',
      },
      failureResult: {
        tone: 'danger',
        title: '认证未通过',
        code: 'VERIFICATION_FAILED',
        description: '您提交的身份信息与权威数据库比对不一致，请仔细核对后重新提交。',
        actionLabel: '重新录入',
        auditFeedback: '数据不匹配',
      },
    },
  }),
]

export const cloneContentIdentityVerification = (resourceId: string) => {
  const matched = contentIdentityVerificationDb.find((item) => item.resourceId === resourceId)
  return matched ? createRecord(matched) : null
}
