/**
 * Responsibility: provide the retained identity-verification page with formal content-resource
 * loading, local form state, and the temporary mock submit chain used before the real submit
 * contract is introduced.
 * Out of scope: real backend submit action wiring, user-session identity injection, and shared
 * global auth-status synchronization.
 */
import { computed, reactive, ref } from 'vue'
import type {
  ContentIdentityVerificationMockSubmitResult,
  ContentIdentityVerificationPayloadDto,
  ContentIdentityVerificationResultDto,
  ContentIdentityVerificationStatus,
} from '../../../contracts/content-api.contract'
import { resolveContentResource } from '../../../services/content/content.service'

export const IDENTITY_VERIFICATION_RESOURCE_ID = 'auth'
export const IDENTITY_VERIFICATION_SUBMIT_DELAY_MS = 2800

const IDENTITY_VERIFICATION_SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

type IdentityVerificationResultState = ContentIdentityVerificationMockSubmitResult | null

export interface IdentityVerificationPageRuntimeOptions {
  resourceId?: string
  submitDelayMs?: number
}

const createDefaultPayload = (): ContentIdentityVerificationPayloadDto => ({
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
})

const maskIdentityNumber = (value: string) => {
  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return ''
  }

  if (normalizedValue.length <= 10) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, 6)}${'*'.repeat(normalizedValue.length - 10)}${normalizedValue.slice(-4)}`
}

const resolveScrambledText = (text: string, iteration: number) => {
  return text
    .split('')
    .map((character, index) => {
      if (index < iteration || !/[A-Z0-9]/.test(character)) {
        return character
      }

      const randomIndex = Math.floor(Math.random() * IDENTITY_VERIFICATION_SCRAMBLE_CHARS.length)
      return IDENTITY_VERIFICATION_SCRAMBLE_CHARS[randomIndex]
    })
    .join('')
}

export const useIdentityVerificationPageRuntime = (
  options: IdentityVerificationPageRuntimeOptions = {}
) => {
  const resourceId = options.resourceId ?? IDENTITY_VERIFICATION_RESOURCE_ID
  const submitDelayMs = options.submitDelayMs ?? IDENTITY_VERIFICATION_SUBMIT_DELAY_MS

  const pageTitle = ref('实名认证')
  const pageSummary = ref('')
  const payload = ref<ContentIdentityVerificationPayloadDto>(createDefaultPayload())
  const isLoading = ref(true)
  const loadErrorMessage = ref('')
  const verificationStatus = ref<ContentIdentityVerificationStatus>('unverified')
  const isAgreed = ref(false)
  const resultState = ref<IdentityVerificationResultState>(null)
  const processingCodeDisplay = ref(payload.value.processingCode)
  const maskedIdNumber = ref('')

  const formData = reactive({
    legalName: '',
    idNumber: '',
  })

  let processingScrambleTimer: ReturnType<typeof setInterval> | null = null
  let submitTimer: ReturnType<typeof setTimeout> | null = null

  const clearProcessingScrambleTimer = () => {
    if (processingScrambleTimer == null) {
      return
    }

    clearInterval(processingScrambleTimer)
    processingScrambleTimer = null
  }

  const clearSubmitTimer = () => {
    if (submitTimer == null) {
      return
    }

    clearTimeout(submitTimer)
    submitTimer = null
  }

  const stopProcessingVisual = () => {
    clearProcessingScrambleTimer()
    processingCodeDisplay.value = payload.value.processingCode
  }

  const startProcessingVisual = () => {
    clearProcessingScrambleTimer()
    const targetText = payload.value.processingCode

    if (!targetText) {
      processingCodeDisplay.value = ''
      return
    }

    let iteration = 0
    processingCodeDisplay.value = resolveScrambledText(targetText, iteration)

    processingScrambleTimer = setInterval(() => {
      processingCodeDisplay.value = resolveScrambledText(targetText, iteration)

      if (iteration >= targetText.length) {
        stopProcessingVisual()
        return
      }

      iteration += 1 / 3
    }, 30)
  }

  const successResult = computed<ContentIdentityVerificationResultDto | null>(
    () => payload.value.successResult ?? null
  )

  const failureResult = computed<ContentIdentityVerificationResultDto | null>(
    () => payload.value.failureResult ?? null
  )

  const activeResult = computed<ContentIdentityVerificationResultDto | null>(() => {
    if (resultState.value === 'success') {
      return successResult.value
    }

    if (resultState.value === 'failure') {
      return failureResult.value
    }

    return null
  })

  const statusSummary = computed<ContentIdentityVerificationResultDto | null>(() => {
    if (verificationStatus.value === 'verified') {
      return successResult.value
    }

    if (verificationStatus.value === 'failed') {
      return failureResult.value
    }

    return null
  })

  const shouldShowProcessingOverlay = computed(() => verificationStatus.value === 'processing')
  const shouldShowResultSheet = computed(() => activeResult.value != null)
  const isReadOnly = computed(
    () => verificationStatus.value === 'verified' || verificationStatus.value === 'processing'
  )

  const canSubmit = computed(() => {
    return Boolean(
      payload.value.submitEnabled &&
      !isReadOnly.value &&
      formData.legalName.trim() &&
      formData.idNumber.trim() &&
      isAgreed.value
    )
  })

  const displayIdNumber = computed(() => {
    if (verificationStatus.value !== 'verified') {
      return formData.idNumber
    }

    return maskedIdNumber.value || maskIdentityNumber(formData.idNumber)
  })

  const submitButtonLabel = computed(() => {
    if (verificationStatus.value === 'verified') {
      return '已完成认证'
    }

    if (verificationStatus.value === 'processing') {
      return '核查中'
    }

    return '提交审核'
  })

  const applyPayload = (
    nextPayload: ContentIdentityVerificationPayloadDto,
    nextTitle: string,
    nextSummary: string
  ) => {
    payload.value = {
      ...nextPayload,
      unlockedFeatures: nextPayload.unlockedFeatures.map((feature) => ({ ...feature })),
      successResult: { ...nextPayload.successResult },
      failureResult: { ...nextPayload.failureResult },
    }
    pageTitle.value = nextTitle || '实名认证'
    pageSummary.value = nextSummary
    verificationStatus.value = nextPayload.verificationStatus
    formData.legalName = nextPayload.legalName
    formData.idNumber = nextPayload.idNumber
    maskedIdNumber.value = nextPayload.maskedIdNumber
    isAgreed.value = nextPayload.agreementCheckedByDefault
    resultState.value = null
    processingCodeDisplay.value = nextPayload.processingCode

    if (nextPayload.verificationStatus === 'processing') {
      startProcessingVisual()
      return
    }

    stopProcessingVisual()
  }

  const resetEditableDraft = () => {
    formData.legalName = ''
    formData.idNumber = ''
    maskedIdNumber.value = ''
    isAgreed.value = payload.value.agreementCheckedByDefault
    verificationStatus.value = 'unverified'
    resultState.value = null
    stopProcessingVisual()
  }

  const finalizeMockSubmit = () => {
    clearSubmitTimer()
    stopProcessingVisual()

    if (payload.value.mockSubmitResult === 'success') {
      verificationStatus.value = 'verified'
      resultState.value = 'success'
      maskedIdNumber.value = maskIdentityNumber(formData.idNumber)
      isAgreed.value = true
      return
    }

    verificationStatus.value = 'failed'
    resultState.value = 'failure'
  }

  const loadPage = async () => {
    clearSubmitTimer()
    clearProcessingScrambleTimer()
    isLoading.value = true
    loadErrorMessage.value = ''

    try {
      const resource = await resolveContentResource({
        resourceType: 'identity_verification',
        resourceId,
      })

      if (resource.resourceType !== 'identity_verification') {
        throw new Error(
          `identity verification returned unexpected resourceType: ${resource.resourceType}`
        )
      }

      applyPayload(resource.payload, resource.title, resource.summary ?? '')
    } catch (error) {
      resetEditableDraft()
      const fallbackPayload = createDefaultPayload()
      payload.value = fallbackPayload
      processingCodeDisplay.value = fallbackPayload.processingCode
      loadErrorMessage.value =
        error instanceof Error ? error.message : '实名认证页加载失败，请稍后重试。'
    } finally {
      isLoading.value = false
    }
  }

  const handleSubmit = () => {
    if (!canSubmit.value) {
      return false
    }

    clearSubmitTimer()
    resultState.value = null
    verificationStatus.value = 'processing'
    startProcessingVisual()

    // Temporary front-end-only submit loop.
    // A later thread will replace this timer with the formal submit action contract once it lands.
    submitTimer = setTimeout(() => {
      finalizeMockSubmit()
    }, submitDelayMs)

    return true
  }

  const handleRetry = () => {
    clearSubmitTimer()
    resetEditableDraft()
  }

  const handleResultDismiss = () => {
    resultState.value = null
  }

  const toggleAgreement = () => {
    if (isReadOnly.value) {
      return
    }

    isAgreed.value = !isAgreed.value
  }

  const dispose = () => {
    clearSubmitTimer()
    clearProcessingScrambleTimer()
  }

  return {
    activeResult,
    canSubmit,
    displayIdNumber,
    dispose,
    formData,
    handleResultDismiss,
    handleRetry,
    handleSubmit,
    isAgreed,
    isLoading,
    isReadOnly,
    loadErrorMessage,
    loadPage,
    maskedIdNumber,
    pageSummary,
    pageTitle,
    payload,
    processingCodeDisplay,
    resultState,
    shouldShowProcessingOverlay,
    shouldShowResultSheet,
    statusSummary,
    submitButtonLabel,
    toggleAgreement,
    verificationStatus,
  }
}
