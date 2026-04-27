<!--
Responsibility: render the retained identity-verification page inside the shared updating route,
switching between the approved verified snapshot and the editable verification flow while keeping
all interactions on the project-standard secondary-page shell.
Out of scope: real backend submit wiring, legal-document routing, and cross-page auth-state sync.
-->
<template>
  <page-meta :page-style="pageMetaStyle" />
  <SecondaryPageFrame
    route-source="updating-identity-verification"
    :title="frameTitle"
    @back="handleBack"
  >
    <view class="identity-verification-page">
      <view v-if="isLoading" class="identity-verification-loading-shell" aria-hidden="true">
        <view class="identity-verification-loading-card" />
        <view class="identity-verification-loading-block" />
        <view class="identity-verification-loading-block short" />
        <view class="identity-verification-loading-panel" />
      </view>

      <template v-else-if="isVerifiedView">
        <view class="identity-verification-verified-page">
          <view class="identity-verification-hero-card">
            <view class="identity-verification-hero-glow" aria-hidden="true" />

            <view class="identity-verification-hero-body">
              <view class="identity-verification-hero-indicator">
                <view class="identity-verification-hero-indicator-dot" />
                <text class="identity-verification-hero-indicator-copy">Identity Verified</text>
              </view>

              <view class="identity-verification-hero-heading">
                <text class="identity-verification-hero-title">认证已通过</text>
                <text class="identity-verification-hero-code">Identity Verified</text>
              </view>

              <view class="identity-verification-hero-details">
                <view class="identity-verification-hero-detail-row">
                  <text class="identity-verification-hero-detail-label">真实姓名</text>
                  <text class="identity-verification-hero-detail-value">
                    {{ verifiedLegalNameDisplay }}
                  </text>
                </view>
                <view class="identity-verification-hero-detail-row">
                  <text class="identity-verification-hero-detail-label">证件号码</text>
                  <text class="identity-verification-hero-detail-value is-mono">
                    {{ displayIdNumber || '--' }}
                  </text>
                </view>
              </view>

              <view class="identity-verification-node-pill">
                <text class="identity-verification-node-pill-label">链上节点</text>
                <text class="identity-verification-node-pill-value">{{ didNodeDisplay }}</text>
              </view>
            </view>
          </view>

          <view class="identity-verification-feature-stage">
            <view class="identity-verification-section-heading">
              <text class="identity-verification-section-title">已解锁权限</text>
              <text class="identity-verification-section-code">Privileges</text>
            </view>

            <view class="identity-verification-feature-panel">
              <view
                v-for="(feature, index) in verifiedFeatureList"
                :key="`${feature.title}-${index}`"
                class="identity-verification-feature-row"
                :class="{ 'is-last': index === verifiedFeatureList.length - 1 }"
              >
                <view class="identity-verification-feature-icon-shell">
                  <AetherIcon :name="feature.iconKey" :size="18" :stroke-width="2" />
                </view>
                <view class="identity-verification-feature-copy">
                  <text class="identity-verification-feature-title">{{ feature.title }}</text>
                  <text class="identity-verification-feature-description">
                    {{ feature.description }}
                  </text>
                </view>
              </view>
            </view>
          </view>

          <view class="identity-verification-security-stage">
            <view class="identity-verification-security-row">
              <view class="identity-verification-security-icon-shell">
                <AetherIcon name="shield" :size="15" :stroke-width="1.8" />
              </view>
              <view class="identity-verification-security-copy">
                <text class="identity-verification-security-title">
                  {{ payload.securityStatementTitle }}
                </text>
                <text class="identity-verification-security-description">
                  {{ payload.securityStatementCopy }}
                </text>
              </view>
            </view>

            <view class="identity-verification-verified-timestamp">
              <AetherIcon name="terminal-square" :size="12" :stroke-width="1.7" />
              <text class="identity-verification-verified-timestamp-copy">
                Verified at {{ payload.verifiedAt }}
              </text>
            </view>
          </view>
        </view>
      </template>

      <template v-else>
        <view class="identity-verification-form-page">
          <view v-if="loadErrorMessage" class="identity-verification-inline-alert tone-danger">
            <view class="identity-verification-inline-alert-icon">
              <AetherIcon name="octagon-alert" :size="16" :stroke-width="1.9" />
            </view>
            <view class="identity-verification-inline-alert-copy">
              <text class="identity-verification-inline-alert-title">认证资源加载异常</text>
              <text class="identity-verification-inline-alert-description">
                {{ loadErrorMessage }}
              </text>
            </view>
          </view>

          <view
            v-if="isFailedView && statusSummary"
            class="identity-verification-status-card tone-danger"
          >
            <view class="identity-verification-status-card-head">
              <view class="identity-verification-status-card-badge">
                <AetherIcon name="octagon-alert" :size="14" :stroke-width="2" />
                <text class="identity-verification-status-card-badge-copy">未通过</text>
              </view>
              <text class="identity-verification-status-card-code">{{ statusSummary.code }}</text>
            </view>

            <view class="identity-verification-status-card-body">
              <text class="identity-verification-status-card-title">{{ statusSummary.title }}</text>
              <text class="identity-verification-status-card-description">
                {{ statusSummary.description }}
              </text>
            </view>

            <view class="identity-verification-status-card-foot">
              <text class="identity-verification-status-card-foot-label">审核机构</text>
              <text class="identity-verification-status-card-foot-value">
                {{ payload.auditOrganization }}
              </text>
            </view>
          </view>

          <view class="identity-verification-intro">
            <text class="identity-verification-intro-title">填写身份信息</text>
            <text class="identity-verification-intro-code">Identity_Verification</text>
          </view>

          <view class="identity-verification-form-panel">
            <view class="identity-verification-field-group">
              <view class="identity-verification-field-head">
                <text class="identity-verification-field-label">真实姓名</text>
                <text class="identity-verification-field-code">Legal_Name</text>
              </view>

              <view class="identity-verification-field-shell">
                <view class="identity-verification-field-icon">
                  <AetherIcon name="user" :size="18" :stroke-width="1.8" />
                </view>
                <input
                  v-model="formData.legalName"
                  class="identity-verification-field-input"
                  type="text"
                  :disabled="isReadOnly"
                  placeholder="您的真实姓名"
                  placeholder-class="identity-verification-field-placeholder"
                />
              </view>
            </view>

            <view class="identity-verification-field-group">
              <view class="identity-verification-field-head">
                <text class="identity-verification-field-label">证件号码</text>
                <text class="identity-verification-field-code">ID_Number</text>
              </view>

              <view class="identity-verification-field-shell">
                <view class="identity-verification-field-icon">
                  <AetherIcon name="fingerprint" :size="18" :stroke-width="1.8" />
                </view>
                <input
                  v-model="formData.idNumber"
                  class="identity-verification-field-input is-mono"
                  type="text"
                  :disabled="isReadOnly"
                  placeholder="18位二代身份证号"
                  placeholder-class="identity-verification-field-placeholder"
                />
              </view>
            </view>
          </view>

          <HomeInteractiveTarget
            class="identity-verification-agreement-entry"
            interaction-mode="compact"
            :selected="isAgreed"
            :disabled="isReadOnly"
            :hit-width="360"
            :hit-height="52"
            label="同意实名认证协议"
            @activate="handleAgreementActivate"
          >
            <view
              class="identity-verification-agreement-visual"
              :class="{ 'is-selected': isAgreed, 'is-disabled': isReadOnly }"
            >
              <view class="identity-verification-agreement-check">
                <AetherIcon v-if="isAgreed" name="check-circle-2" :size="12" :stroke-width="2.2" />
              </view>
              <text class="identity-verification-agreement-copy">
                我已阅读并同意
                <text class="identity-verification-agreement-link">
                  {{ payload.privacyPolicyLabel }}
                </text>
                。本人承诺提供的信息真实有效，并授权进行联网核验。
              </text>
            </view>
          </HomeInteractiveTarget>

          <HomeInteractiveTarget
            class="identity-verification-submit-entry"
            :disabled="!canSubmit"
            label="提交实名认证审核"
            @activate="handleSubmitTap"
          >
            <view
              class="identity-verification-submit-visual"
              :class="{ 'is-disabled': !canSubmit }"
            >
              <view
                v-if="canSubmit"
                class="identity-verification-submit-shimmer"
                aria-hidden="true"
              />
              <text class="identity-verification-submit-copy">{{ submitButtonLabel }}</text>
              <AetherIcon
                v-if="canSubmit"
                name="arrow-right"
                :size="15"
                :stroke-width="2"
                tone="accent"
              />
            </view>
          </HomeInteractiveTarget>
        </view>
      </template>
    </view>
  </SecondaryPageFrame>

  <view
    v-if="shouldShowProcessingOverlay"
    class="identity-verification-processing-layer"
    @touchmove.stop.prevent
  >
    <view class="identity-verification-processing-orb">
      <view class="identity-verification-processing-orb-ring" />
      <view class="identity-verification-processing-orb-core">
        <AetherIcon name="search" :size="22" :stroke-width="2" tone="accent" />
      </view>
    </view>

    <view class="identity-verification-processing-copy">
      <text class="identity-verification-processing-title">{{ payload.processingTitle }}</text>
      <view class="identity-verification-processing-code-row">
        <AetherIcon name="activity" :size="14" :stroke-width="2" tone="accent" />
        <text class="identity-verification-processing-code">
          {{ processingCodeDisplay }}
        </text>
      </view>
    </view>

    <text class="identity-verification-processing-description">
      {{ payload.processingDescription }}
    </text>
  </view>

  <view v-if="shouldShowResultSheet && activeResult" class="identity-verification-result-layer">
    <view class="identity-verification-result-mask" @tap="handleResultMaskTap" />

    <view
      class="identity-verification-result-sheet"
      :class="resolveResultToneClass(activeResult.tone)"
    >
      <view class="identity-verification-result-handle" />

      <view class="identity-verification-result-head">
        <view class="identity-verification-result-icon-shell">
          <AetherIcon
            :name="activeResult.tone === 'success' ? 'check-circle-2' : 'octagon-alert'"
            :size="26"
            :stroke-width="2"
          />
        </view>
        <text class="identity-verification-result-title">{{ activeResult.title }}</text>
        <text class="identity-verification-result-code">{{ activeResult.code }}</text>
        <text class="identity-verification-result-description">
          {{ activeResult.description }}
        </text>
      </view>

      <view class="identity-verification-result-audit">
        <view class="identity-verification-result-audit-row">
          <view class="identity-verification-result-audit-labels">
            <text class="identity-verification-result-audit-label">审核机构</text>
            <text class="identity-verification-result-audit-code">ORG</text>
          </view>
          <text class="identity-verification-result-audit-value">{{
            payload.auditOrganization
          }}</text>
        </view>

        <view class="identity-verification-result-audit-row">
          <view class="identity-verification-result-audit-labels">
            <text class="identity-verification-result-audit-label">状态反馈</text>
            <text class="identity-verification-result-audit-code">RES</text>
          </view>
          <view class="identity-verification-result-audit-status">
            <AetherIcon
              :name="activeResult.tone === 'success' ? 'shield-check' : 'x'"
              :size="14"
              :stroke-width="2"
            />
            <text class="identity-verification-result-audit-status-copy">
              {{ activeResult.auditFeedback }}
            </text>
          </view>
        </view>
      </view>

      <HomeInteractiveTarget
        class="identity-verification-result-action-entry"
        :label="activeResult.actionLabel"
        @activate="handleResultActionTap"
      >
        <view
          class="identity-verification-result-action-visual"
          :class="{ 'is-primary': activeResult.tone === 'success' }"
        >
          <view
            v-if="activeResult.tone === 'success'"
            class="identity-verification-result-action-shimmer"
            aria-hidden="true"
          />
          <AetherIcon
            v-if="activeResult.tone !== 'success'"
            name="refresh-cw"
            :size="15"
            :stroke-width="2"
          />
          <text class="identity-verification-result-action-copy">
            {{ activeResult.actionLabel }}
          </text>
        </view>
      </HomeInteractiveTarget>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../components/HomeInteractiveTarget.vue'
import SecondaryPageFrame from '../../components/SecondaryPageFrame.vue'
import { useResponsiveRailLayout } from '../../composables/useResponsiveRailLayout'
import { useIdentityVerificationPageRuntime } from './runtime/identityVerification.runtime'

const DID_NODE_REVEAL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'

const emit = defineEmits<{
  back: []
}>()

const { runtimeContext } = useResponsiveRailLayout()

const {
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
  payload,
  processingCodeDisplay,
  resultState,
  shouldShowProcessingOverlay,
  shouldShowResultSheet,
  statusSummary,
  submitButtonLabel,
  toggleAgreement,
  verificationStatus,
} = useIdentityVerificationPageRuntime()

const didNodeDisplay = ref('')
let didNodeRevealTimer: ReturnType<typeof setInterval> | null = null

const frameTitle = computed(() =>
  verificationStatus.value === 'verified' ? '身份信息' : '实名认证'
)
const isVerifiedView = computed(() => verificationStatus.value === 'verified')
const isFailedView = computed(() => verificationStatus.value === 'failed')
const verifiedFeatureList = computed(() => payload.value.unlockedFeatures)

const pageMetaStyle = computed(() => {
  const viewportHeight = runtimeContext.value.viewportHeight
  const height = viewportHeight > 0 ? `${viewportHeight}px` : '100vh'
  return `height:${height};min-height:${height};overflow:hidden;background:var(--aether-page-background,#fafafa);`
})

const maskLegalName = (value: string) => {
  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return '--'
  }

  if (normalizedValue.length === 1) {
    return `*${normalizedValue}`
  }

  if (normalizedValue.length === 2) {
    return `*${normalizedValue.slice(1)}`
  }

  return `${normalizedValue.slice(0, 1)}*${normalizedValue.slice(-1)}`
}

const verifiedLegalNameDisplay = computed(() => maskLegalName(formData.legalName))

const resolveScrambledDidNode = (text: string, iteration: number) => {
  return text
    .split('')
    .map((character, index) => {
      if (index < iteration || character === ':' || character === '.' || character === 'x') {
        return character
      }

      const randomIndex = Math.floor(Math.random() * DID_NODE_REVEAL_CHARS.length)
      return DID_NODE_REVEAL_CHARS[randomIndex]
    })
    .join('')
}

const stopDidNodeReveal = () => {
  if (didNodeRevealTimer == null) {
    return
  }

  clearInterval(didNodeRevealTimer)
  didNodeRevealTimer = null
}

const startDidNodeReveal = (text: string) => {
  stopDidNodeReveal()

  if (!text) {
    didNodeDisplay.value = ''
    return
  }

  let iteration = 0
  didNodeDisplay.value = resolveScrambledDidNode(text, iteration)

  didNodeRevealTimer = setInterval(() => {
    didNodeDisplay.value = resolveScrambledDidNode(text, iteration)

    if (iteration >= text.length) {
      stopDidNodeReveal()
      didNodeDisplay.value = text
      return
    }

    iteration += 1 / 3
  }, 30)
}

watch(
  () => [verificationStatus.value, payload.value.didNode] as const,
  ([status, didNode]) => {
    if (status === 'verified') {
      startDidNodeReveal(didNode)
      return
    }

    stopDidNodeReveal()
    didNodeDisplay.value = didNode
  },
  { immediate: true }
)

onMounted(() => {
  void loadPage()
})

onBeforeUnmount(() => {
  stopDidNodeReveal()
  dispose()
})

const handleBack = () => {
  emit('back')
}

const handleAgreementActivate = () => {
  toggleAgreement()
}

const handleSubmitTap = () => {
  handleSubmit()
}

const handleResultMaskTap = () => {
  handleResultDismiss()
}

const handleResultActionTap = () => {
  if (resultState.value === 'success') {
    emit('back')
    return
  }

  handleRetry()
}

const resolveResultToneClass = (tone: 'success' | 'danger') => {
  return tone === 'success' ? 'tone-success' : 'tone-danger'
}
</script>

<style scoped lang="scss">
.identity-verification-page {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.identity-verification-loading-shell,
.identity-verification-verified-page,
.identity-verification-form-page {
  display: flex;
  flex-direction: column;
}

.identity-verification-loading-shell {
  gap: 16px;
}

.identity-verification-loading-card,
.identity-verification-loading-block,
.identity-verification-loading-panel {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: linear-gradient(90deg, #f3f4f6 0%, #ffffff 52%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: identity-verification-loading-shimmer 1.5s linear infinite;
}

.identity-verification-loading-card {
  height: 208px;
}

.identity-verification-loading-block {
  height: 18px;
  border-radius: 10px;
}

.identity-verification-loading-block.short {
  width: 68%;
}

.identity-verification-loading-panel {
  height: 196px;
}

.identity-verification-hero-card {
  position: relative;
  overflow: hidden;
  margin-bottom: 32px;
  border-radius: 24px;
  border: 1px solid #1f2937;
  background: #0a0d10;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.16);
}

.identity-verification-hero-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(270deg, rgba(13, 36, 41, 0.9) 0%, transparent 72%);
}

.identity-verification-hero-body {
  position: relative;
  z-index: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.identity-verification-hero-indicator,
.identity-verification-hero-heading,
.identity-verification-node-pill,
.identity-verification-verified-timestamp,
.identity-verification-processing-code-row,
.identity-verification-result-audit-status,
.identity-verification-result-audit-labels,
.identity-verification-result-audit-row {
  display: flex;
  align-items: center;
}

.identity-verification-hero-indicator {
  gap: 10px;
  margin-bottom: 16px;
}

.identity-verification-hero-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22d3ee;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.75);
}

.identity-verification-hero-indicator-copy,
.identity-verification-hero-code,
.identity-verification-node-pill-label,
.identity-verification-node-pill-value,
.identity-verification-section-code,
.identity-verification-verified-timestamp-copy,
.identity-verification-processing-code,
.identity-verification-result-code,
.identity-verification-result-audit-code {
  text-transform: uppercase;
}

.identity-verification-hero-indicator-copy {
  color: #9ca3af;
  font-size: 9px;
  line-height: 12px;
  font-weight: 900;
  letter-spacing: 0.28em;
}

.identity-verification-hero-heading {
  align-items: baseline;
  gap: 10px;
  margin-bottom: 18px;
}

.identity-verification-hero-title {
  color: #ffffff;
  font-size: 18px;
  line-height: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.identity-verification-hero-code {
  color: #6b7280;
  font-size: 9px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.identity-verification-hero-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.identity-verification-hero-detail-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  align-items: center;
  column-gap: 16px;
}

.identity-verification-hero-detail-label {
  color: #9ca3af;
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.12em;
}

.identity-verification-hero-detail-value {
  color: #e5e7eb;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.identity-verification-hero-detail-value.is-mono,
.identity-verification-node-pill-value,
.identity-verification-verified-timestamp-copy,
.identity-verification-field-input.is-mono,
.identity-verification-processing-code,
.identity-verification-result-code,
.identity-verification-result-audit-code {
  font-family: var(--aether-font-mono, var(--aether-font-system, system-ui, sans-serif));
}

.identity-verification-node-pill {
  width: fit-content;
  max-width: 100%;
  min-height: 32px;
  padding: 0 12px;
  box-sizing: border-box;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid #2a3439;
  background: transparent;
}

.identity-verification-node-pill-label {
  color: #9ca3af;
  font-size: 9px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.identity-verification-node-pill-value {
  max-width: 180px;
  color: #6b7280;
  font-size: 9px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.identity-verification-feature-stage {
  margin-bottom: 32px;
}

.identity-verification-section-heading {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
  padding-left: 4px;
}

.identity-verification-section-title {
  color: #111111;
  font-size: 14px;
  line-height: 20px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.identity-verification-section-code {
  color: #9ca3af;
  font-size: 10px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.identity-verification-feature-panel {
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid #f3f4f6;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.identity-verification-feature-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f9fafb;
}

.identity-verification-feature-row.is-last {
  border-bottom: none;
}

.identity-verification-feature-icon-shell {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ecfeff;
  color: #06b6d4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.identity-verification-feature-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-top: 2px;
}

.identity-verification-feature-title {
  color: #111111;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.identity-verification-feature-description,
.identity-verification-security-description,
.identity-verification-inline-alert-description,
.identity-verification-status-card-description,
.identity-verification-agreement-copy,
.identity-verification-result-description {
  color: #6b7280;
  font-size: 11px;
  line-height: 18px;
  font-weight: 500;
}

.identity-verification-security-stage {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

.identity-verification-security-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 0 4px;
}

.identity-verification-security-icon-shell {
  color: #9ca3af;
  padding-top: 2px;
}

.identity-verification-security-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.identity-verification-security-title {
  color: #111111;
  font-size: 12px;
  line-height: 18px;
  font-weight: 900;
}

.identity-verification-verified-timestamp {
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
  opacity: 0.4;
  color: #6b7280;
}

.identity-verification-verified-timestamp-copy {
  font-size: 9px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.identity-verification-form-page {
  gap: 24px;
}

.identity-verification-inline-alert,
.identity-verification-status-card {
  padding: 16px;
  border-radius: 20px;
  box-sizing: border-box;
}

.identity-verification-inline-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.identity-verification-inline-alert-icon {
  color: #ea580c;
  padding-top: 2px;
}

.identity-verification-inline-alert-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.identity-verification-inline-alert-title,
.identity-verification-status-card-title {
  color: #111111;
  font-size: 14px;
  line-height: 20px;
  font-weight: 800;
}

.identity-verification-status-card {
  background: #fff7f7;
  border: 1px solid #fee2e2;
}

.identity-verification-status-card-head,
.identity-verification-status-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.identity-verification-status-card-head {
  margin-bottom: 12px;
}

.identity-verification-status-card-badge {
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.identity-verification-status-card-badge-copy,
.identity-verification-status-card-code,
.identity-verification-status-card-foot-label,
.identity-verification-status-card-foot-value,
.identity-verification-field-code {
  font-size: 10px;
  line-height: 12px;
  font-weight: 700;
}

.identity-verification-status-card-badge-copy,
.identity-verification-status-card-code,
.identity-verification-field-code {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.identity-verification-status-card-code {
  color: #ef4444;
}

.identity-verification-status-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.identity-verification-status-card-foot-label {
  color: #9ca3af;
}

.identity-verification-status-card-foot-value {
  color: #111111;
}

.identity-verification-intro {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 4px;
}

.identity-verification-intro-title {
  color: #111111;
  font-size: 22px;
  line-height: 28px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.identity-verification-intro-code {
  color: #9ca3af;
  font-size: 10px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.identity-verification-form-panel {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.identity-verification-field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.identity-verification-field-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-left: 4px;
}

.identity-verification-field-label {
  color: #111111;
  font-size: 14px;
  line-height: 20px;
  font-weight: 900;
}

.identity-verification-field-code {
  color: #9ca3af;
}

.identity-verification-field-shell {
  min-height: 60px;
  padding: 0 20px;
  box-sizing: border-box;
  border-radius: 20px;
  border: 1px solid #f3f4f6;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
  display: flex;
  align-items: center;
  gap: 12px;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.identity-verification-field-icon {
  color: #cbd5e1;
}

.identity-verification-field-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 60px;
  color: #111111;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
}

.identity-verification-field-input[disabled] {
  opacity: 0.64;
}

.identity-verification-field-placeholder {
  color: #cbd5e1;
  font-size: 16px;
  font-weight: 500;
}

.identity-verification-agreement-entry {
  display: block;
  width: 100%;
  border-radius: 18px;
}

.identity-verification-agreement-visual {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px;
  box-sizing: border-box;
}

.identity-verification-agreement-visual.is-disabled {
  opacity: 0.68;
}

.identity-verification-agreement-check {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  margin-top: 2px;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.identity-verification-agreement-visual.is-selected .identity-verification-agreement-check {
  border-color: #06b6d4;
  background: #06b6d4;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.28);
  transform: scale(1.04);
}

.identity-verification-agreement-copy {
  flex: 1 1 auto;
  min-width: 0;
}

.identity-verification-agreement-link {
  color: #06b6d4;
  font-weight: 700;
}

.identity-verification-submit-entry {
  display: block;
  width: 100%;
  border-radius: 20px;
}

.identity-verification-submit-visual {
  position: relative;
  overflow: hidden;
  min-height: 60px;
  border-radius: 20px;
  background: #111111;
  color: #ffffff;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    opacity 180ms ease;
}

.identity-verification-submit-entry.is-entry-active .identity-verification-submit-visual {
  transform: scale(0.985);
}

.identity-verification-submit-visual.is-disabled {
  background: #f3f4f6;
  color: #cbd5e1;
  box-shadow: none;
}

.identity-verification-submit-copy,
.identity-verification-result-action-copy {
  position: relative;
  z-index: 1;
  font-size: 14px;
  line-height: 20px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.identity-verification-submit-shimmer,
.identity-verification-result-action-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 16%,
    rgba(255, 255, 255, 0.14) 50%,
    transparent 84%
  );
  transform: translateX(-100%);
  animation: identity-verification-shimmer 2s linear infinite;
}

.identity-verification-processing-layer,
.identity-verification-result-layer {
  position: fixed;
  inset: 0;
  z-index: 60;
}

.identity-verification-processing-layer {
  background: rgba(250, 250, 250, 0.92);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.identity-verification-processing-orb {
  position: relative;
  width: 112px;
  height: 112px;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.identity-verification-processing-orb-ring,
.identity-verification-processing-orb-core {
  position: absolute;
  border-radius: 999px;
}

.identity-verification-processing-orb-ring {
  inset: 0;
  border: 1px solid #e5e7eb;
}

.identity-verification-processing-orb-ring::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border-top: 3px solid #22d3ee;
  animation: identity-verification-spin 900ms linear infinite;
}

.identity-verification-processing-orb-core {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #111111;
  color: #22d3ee;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: identity-verification-pulse 1.4s ease-in-out infinite;
}

.identity-verification-processing-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.identity-verification-processing-title {
  color: #111111;
  font-size: 18px;
  line-height: 24px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.identity-verification-processing-code-row {
  gap: 8px;
}

.identity-verification-processing-code {
  color: #9ca3af;
  font-size: 11px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.identity-verification-processing-description {
  max-width: 220px;
  margin-top: 24px;
  color: #6b7280;
  font-size: 11px;
  line-height: 18px;
  font-weight: 500;
  text-align: center;
}

.identity-verification-result-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}

.identity-verification-result-sheet {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  border-radius: 32px;
  border: 1px solid #f3f4f6;
  background: #ffffff;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.12);
  padding: 28px 24px 24px;
  box-sizing: border-box;
  animation: identity-verification-sheet-enter 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

.identity-verification-result-sheet.tone-success::before,
.identity-verification-result-sheet.tone-danger::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  width: 32px;
  height: 2px;
  transform: translateX(-50%);
  border-radius: 0 0 999px 999px;
}

.identity-verification-result-sheet.tone-success::before {
  background: #22d3ee;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.42);
}

.identity-verification-result-sheet.tone-danger::before {
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.32);
}

.identity-verification-result-handle {
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: #e5e7eb;
  margin: 0 auto 20px;
  opacity: 0.7;
}

.identity-verification-result-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.identity-verification-result-icon-shell {
  width: 56px;
  height: 56px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.identity-verification-result-sheet.tone-success .identity-verification-result-icon-shell {
  background: #ecfeff;
  border-color: #cffafe;
  color: #06b6d4;
}

.identity-verification-result-sheet.tone-danger .identity-verification-result-icon-shell {
  background: #fef2f2;
  border-color: #fee2e2;
  color: #ef4444;
}

.identity-verification-result-title {
  color: #111111;
  font-size: 20px;
  line-height: 24px;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.identity-verification-result-code {
  color: #9ca3af;
  font-size: 10px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  margin-bottom: 18px;
}

.identity-verification-result-sheet.tone-success .identity-verification-result-code {
  color: rgba(6, 182, 212, 0.82);
}

.identity-verification-result-sheet.tone-danger .identity-verification-result-code {
  color: rgba(239, 68, 68, 0.82);
}

.identity-verification-result-description {
  margin-bottom: 24px;
  text-align: center;
}

.identity-verification-result-audit {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #f3f4f6;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.identity-verification-result-audit-labels {
  align-items: baseline;
  gap: 8px;
}

.identity-verification-result-audit-label {
  color: #6b7280;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
}

.identity-verification-result-audit-code {
  color: #9ca3af;
}

.identity-verification-result-audit-value,
.identity-verification-result-audit-status-copy {
  color: #111111;
  font-size: 13px;
  line-height: 18px;
  font-weight: 900;
}

.identity-verification-result-sheet.tone-danger .identity-verification-result-audit-status {
  color: #ef4444;
}

.identity-verification-result-audit-status {
  gap: 6px;
}

.identity-verification-result-action-entry {
  display: block;
  width: 100%;
  border-radius: 20px;
}

.identity-verification-result-action-visual {
  position: relative;
  overflow: hidden;
  min-height: 56px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111111;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease,
    color 180ms ease;
}

.identity-verification-result-action-entry.is-entry-active
  .identity-verification-result-action-visual {
  transform: scale(0.985);
}

.identity-verification-result-action-visual.is-primary {
  border-color: transparent;
  background: #111111;
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

@media screen and (width < 390px) {
  .identity-verification-hero-detail-row {
    grid-template-columns: 52px minmax(0, 1fr);
    column-gap: 12px;
  }

  .identity-verification-node-pill-value {
    max-width: 148px;
  }
}

@keyframes identity-verification-loading-shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

@keyframes identity-verification-shimmer {
  to {
    transform: translateX(100%);
  }
}

@keyframes identity-verification-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes identity-verification-pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.96);
  }
}

@keyframes identity-verification-sheet-enter {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
