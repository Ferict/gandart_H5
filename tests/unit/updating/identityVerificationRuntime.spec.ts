import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  ContentEnvelope,
  ContentIdentityVerificationPayloadDto,
  ContentResourceDto,
  ContentSceneDto,
  ContentListDto,
  ContentActionResultDto,
} from '@/contracts/content-api.contract'
import { resetContentPort, setContentPort } from '@/services/content/content.service'
import type { ContentPort, ContentListPortResponse } from '@/ports/content.port'
import {
  IDENTITY_VERIFICATION_SUBMIT_DELAY_MS,
  useIdentityVerificationPageRuntime,
} from '@/pages/updating/runtime/identityVerification.runtime'

const createEnvelope = <T>(data: T | null): ContentEnvelope<T> => ({
  code: 0,
  message: 'OK',
  requestId: 'req_identity_verification',
  serverTime: '2026-04-27T09:41:00+08:00',
  data,
})

const createPayload = (
  overrides: Partial<ContentIdentityVerificationPayloadDto> = {}
): ContentIdentityVerificationPayloadDto => ({
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
    description: '您的身份信息已成功绑定。',
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
  ...overrides,
})

const createResource = (
  payloadOverrides: Partial<ContentIdentityVerificationPayloadDto> = {}
): ContentResourceDto => ({
  resourceType: 'identity_verification',
  resourceId: 'auth',
  title: '实名认证',
  status: 'LIVE',
  updatedAt: '2026-04-27T09:41:00+08:00',
  summary: '实名认证页统一承接认证状态、资料补录、联网核验与审核结果反馈。',
  asset: null,
  payload: createPayload(payloadOverrides),
  relations: [],
})

const createContentPort = (resource: ContentResourceDto): ContentPort => ({
  getScene: async () => createEnvelope<ContentSceneDto>(null),
  getResource: async () => createEnvelope(resource),
  getList: async () =>
    ({
      envelope: createEnvelope<ContentListDto>(null),
      notModified: false,
    }) as ContentListPortResponse,
  runAction: async () => createEnvelope<ContentActionResultDto>(null),
})

describe('identity verification runtime', () => {
  afterEach(() => {
    resetContentPort()
    vi.useRealTimers()
  })

  it('hydrates an unverified content resource into an editable form shell', async () => {
    setContentPort(createContentPort(createResource()))

    const runtime = useIdentityVerificationPageRuntime()
    await runtime.loadPage()

    expect(runtime.pageTitle.value).toBe('实名认证')
    expect(runtime.verificationStatus.value).toBe('unverified')
    expect(runtime.formData.legalName).toBe('')
    expect(runtime.formData.idNumber).toBe('')
    expect(runtime.isAgreed.value).toBe(false)
    expect(runtime.isReadOnly.value).toBe(false)
    expect(runtime.canSubmit.value).toBe(false)
    expect(runtime.statusSummary.value).toBeNull()
  })

  it('hydrates a verified content resource into a locked success state', async () => {
    setContentPort(
      createContentPort(
        createResource({
          verificationStatus: 'verified',
          legalName: '张三',
          idNumber: '110101199003071234',
          maskedIdNumber: '110101********1234',
          agreementCheckedByDefault: true,
        })
      )
    )

    const runtime = useIdentityVerificationPageRuntime()
    await runtime.loadPage()

    expect(runtime.verificationStatus.value).toBe('verified')
    expect(runtime.isReadOnly.value).toBe(true)
    expect(runtime.displayIdNumber.value).toBe('110101********1234')
    expect(runtime.statusSummary.value?.title).toBe('认证审核通过')
    expect(runtime.resultState.value).toBeNull()
  })

  it('blocks local submit until fields and agreement are ready', async () => {
    setContentPort(createContentPort(createResource()))

    const runtime = useIdentityVerificationPageRuntime()
    await runtime.loadPage()

    expect(runtime.handleSubmit()).toBe(false)

    runtime.formData.legalName = '张三'
    runtime.formData.idNumber = '110101199003071234'
    expect(runtime.handleSubmit()).toBe(false)

    runtime.isAgreed.value = true
    expect(runtime.canSubmit.value).toBe(true)
  })

  it('runs the local processing chain and resolves the success result from contract mock data', async () => {
    vi.useFakeTimers()
    setContentPort(createContentPort(createResource()))

    const runtime = useIdentityVerificationPageRuntime()
    await runtime.loadPage()

    runtime.formData.legalName = '张三'
    runtime.formData.idNumber = '110101199003071234'
    runtime.isAgreed.value = true

    expect(runtime.handleSubmit()).toBe(true)
    expect(runtime.verificationStatus.value).toBe('processing')
    expect(runtime.shouldShowProcessingOverlay.value).toBe(true)

    await vi.advanceTimersByTimeAsync(IDENTITY_VERIFICATION_SUBMIT_DELAY_MS)

    expect(runtime.verificationStatus.value).toBe('verified')
    expect(runtime.resultState.value).toBe('success')
    expect(runtime.activeResult.value?.title).toBe('认证审核通过')
    expect(runtime.shouldShowProcessingOverlay.value).toBe(false)
  })

  it('runs the local processing chain and exposes retry after a failed mock submit', async () => {
    vi.useFakeTimers()
    setContentPort(
      createContentPort(
        createResource({
          mockSubmitResult: 'failure',
        })
      )
    )

    const runtime = useIdentityVerificationPageRuntime()
    await runtime.loadPage()

    runtime.formData.legalName = '张三'
    runtime.formData.idNumber = '110101199003071234'
    runtime.isAgreed.value = true
    runtime.handleSubmit()

    await vi.advanceTimersByTimeAsync(IDENTITY_VERIFICATION_SUBMIT_DELAY_MS)

    expect(runtime.verificationStatus.value).toBe('failed')
    expect(runtime.resultState.value).toBe('failure')
    expect(runtime.activeResult.value?.title).toBe('认证未通过')
    expect(runtime.isReadOnly.value).toBe(false)

    runtime.handleRetry()

    expect(runtime.verificationStatus.value).toBe('unverified')
    expect(runtime.resultState.value).toBeNull()
    expect(runtime.formData.legalName).toBe('')
    expect(runtime.formData.idNumber).toBe('')
    expect(runtime.isAgreed.value).toBe(false)
  })
})
