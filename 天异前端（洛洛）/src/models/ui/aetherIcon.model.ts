/**
 * Responsibility: declare the canonical icon names, tones, and prop shape used by the shared
 * Aether icon component and icon registry helpers.
 * Out of scope: SVG rendering, registry implementation, and component-level style application.
 */
export type AetherIconName =
  | 'activity'
  | 'atom'
  | 'aperture'
  | 'arrow-left'
  | 'arrow-up-right'
  | 'award'
  | 'bell'
  | 'bell-ring'
  | 'box'
  | 'calendar-days'
  | 'chart-candlestick'
  | 'chevron-right'
  | 'copy'
  | 'cpu'
  | 'disc-3'
  | 'fingerprint'
  | 'emerald'
  | 'gift'
  | 'hexagon'
  | 'history'
  | 'house'
  | 'languages'
  | 'loader-2'
  | 'log-out'
  | 'megaphone'
  | 'menu'
  | 'message-circle-more'
  | 'octagon-alert'
  | 'package'
  | 'panel-right-open'
  | 'paintbrush'
  | 'qr-code'
  | 'refresh-cw'
  | 'repeat-2'
  | 'search'
  | 'settings'
  | 'share'
  | 'shield'
  | 'shield-alert'
  | 'shield-check'
  | 'shopping-cart'
  | 'sliders-horizontal'
  | 'square-arrow-out-up-right'
  | 'sparkles'
  | 'terminal-square'
  | 'triangle'
  | 'user'
  | 'user-plus'
  | 'user-round'
  | 'users'
  | 'wallet'
  | 'workflow'
  | 'wrench'
  | 'x'
  | 'zap'

export type AetherIconTone =
  | 'current'
  | 'default'
  | 'muted'
  | 'subtle'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'

export interface AetherIconProps {
  name: AetherIconName
  size?: number
  strokeWidth?: number
  tone?: AetherIconTone
}
