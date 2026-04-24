/**
 * Responsibility: provide the cross-platform icon registry and lookup helpers used by
 * Aether icon components on H5 and app iconfont targets.
 * Out of scope: icon rendering components, icon usage policy, and page-level visual
 * presentation logic.
 */
import type { Component } from 'vue'
import type { AetherIconName } from '../models/ui/aetherIcon.model'

// #ifdef H5
import {
  Activity,
  Atom,
  Aperture,
  ArrowLeft,
  ArrowUpRight,
  Award,
  Bell,
  BellRing,
  Box,
  CalendarDays,
  ChartCandlestick,
  ChevronRight,
  Copy,
  Cpu,
  Disc3,
  Fingerprint,
  Gift,
  Hexagon,
  History,
  House,
  Languages,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  MessageCircleMore,
  OctagonAlert,
  Package,
  PanelRightOpen,
  Paintbrush,
  QrCode,
  RefreshCw,
  Repeat2,
  Search,
  Settings,
  Share,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  SquareArrowOutUpRight,
  Sparkles,
  TerminalSquare,
  Triangle,
  User,
  UserPlus,
  UserRound,
  Users,
  Wallet,
  Workflow,
  Wrench,
  X,
  Zap,
} from 'lucide-vue-next'

const H5_ICON_COMPONENT_MAP: Record<AetherIconName, Component> = {
  activity: Activity,
  atom: Atom,
  aperture: Aperture,
  'arrow-left': ArrowLeft,
  'arrow-up-right': ArrowUpRight,
  award: Award,
  bell: Bell,
  'bell-ring': BellRing,
  box: Box,
  'calendar-days': CalendarDays,
  'chart-candlestick': ChartCandlestick,
  'chevron-right': ChevronRight,
  copy: Copy,
  cpu: Cpu,
  'disc-3': Disc3,
  fingerprint: Fingerprint,
  emerald: Sparkles,
  gift: Gift,
  hexagon: Hexagon,
  history: History,
  house: House,
  languages: Languages,
  'loader-2': Loader2,
  'log-out': LogOut,
  megaphone: Megaphone,
  menu: Menu,
  'message-circle-more': MessageCircleMore,
  'octagon-alert': OctagonAlert,
  package: Package,
  'panel-right-open': PanelRightOpen,
  paintbrush: Paintbrush,
  'qr-code': QrCode,
  'refresh-cw': RefreshCw,
  'repeat-2': Repeat2,
  search: Search,
  settings: Settings,
  share: Share,
  shield: Shield,
  'shield-alert': ShieldAlert,
  'shield-check': ShieldCheck,
  'shopping-cart': ShoppingCart,
  'sliders-horizontal': SlidersHorizontal,
  'square-arrow-out-up-right': SquareArrowOutUpRight,
  sparkles: Sparkles,
  'terminal-square': TerminalSquare,
  triangle: Triangle,
  user: User,
  'user-plus': UserPlus,
  'user-round': UserRound,
  users: Users,
  wallet: Wallet,
  workflow: Workflow,
  wrench: Wrench,
  x: X,
  zap: Zap,
}
// #endif

// #ifdef APP
const APP_ICONFONT_CLASS_MAP: Record<AetherIconName, string> = {
  activity: 'aether-icon-activity',
  atom: 'aether-icon-aperture',
  aperture: 'aether-icon-aperture',
  'arrow-left': 'aether-icon-arrow-left',
  'arrow-up-right': 'aether-icon-arrow-up-right',
  award: 'aether-icon-award',
  bell: 'aether-icon-bell',
  'bell-ring': 'aether-icon-bell-ring',
  box: 'aether-icon-box',
  'calendar-days': 'aether-icon-history',
  'chart-candlestick': 'aether-icon-sliders-horizontal',
  'chevron-right': 'aether-icon-chevron-right',
  copy: 'aether-icon-copy',
  cpu: 'aether-icon-cpu',
  'disc-3': 'aether-icon-disc-3',
  // APP iconfont 暂无 fingerprint glyph，先回退到 aperture 近似纹理形态
  fingerprint: 'aether-icon-aperture',
  emerald: 'aether-icon-sparkles',
  // APP iconfont 暂无 gift glyph，先回退到 package 近似礼盒形态
  gift: 'aether-icon-package',
  hexagon: 'aether-icon-hexagon',
  history: 'aether-icon-history',
  house: 'aether-icon-house',
  languages: 'aether-icon-languages',
  'loader-2': 'aether-icon-loader-2',
  'log-out': 'aether-icon-log-out',
  megaphone: 'aether-icon-megaphone',
  menu: 'aether-icon-menu',
  'message-circle-more': 'aether-icon-message-circle-more',
  // APP iconfont 暂无 octagon-alert glyph，先回退到 shield-alert 近似警示形态
  'octagon-alert': 'aether-icon-shield-alert',
  package: 'aether-icon-package',
  'panel-right-open': 'aether-icon-panel-right-open',
  paintbrush: 'aether-icon-paintbrush',
  'qr-code': 'aether-icon-qr-code',
  // APP iconfont 暂无 refresh-cw glyph，先回退到 workflow 近似循环刷新形态
  'refresh-cw': 'aether-icon-workflow',
  'repeat-2': 'aether-icon-workflow',
  search: 'aether-icon-search',
  settings: 'aether-icon-settings',
  // APP iconfont 暂无 share glyph，先回退到 arrow-up-right 近似分享外链形态
  share: 'aether-icon-arrow-up-right',
  shield: 'aether-icon-shield',
  'shield-alert': 'aether-icon-shield-alert',
  'shield-check': 'aether-icon-shield-check',
  'shopping-cart': 'aether-icon-package',
  'sliders-horizontal': 'aether-icon-sliders-horizontal',
  // APP iconfont 暂无 square-arrow-out-up-right glyph，先回退到 arrow-up-right 近似外跳转形态
  'square-arrow-out-up-right': 'aether-icon-arrow-up-right',
  sparkles: 'aether-icon-sparkles',
  'terminal-square': 'aether-icon-terminal-square',
  triangle: 'aether-icon-triangle',
  user: 'aether-icon-user',
  'user-plus': 'aether-icon-user-plus',
  'user-round': 'aether-icon-user-round',
  users: 'aether-icon-users',
  wallet: 'aether-icon-wallet',
  workflow: 'aether-icon-workflow',
  wrench: 'aether-icon-wrench',
  x: 'aether-icon-x',
  zap: 'aether-icon-sparkles',
}

const APP_ICONFONT_GLYPH_MAP: Record<AetherIconName, string> = {
  activity: '\uf66b',
  atom: '\uf1de',
  aperture: '\uf1de',
  'arrow-left': '\uf12f',
  'arrow-up-right': '\uf144',
  award: '\uf154',
  bell: '\uf18a',
  'bell-ring': '\uf189',
  box: '\uf1c8',
  'calendar-days': '\uf292',
  'chart-candlestick': '\uf56b',
  'chevron-right': '\uf285',
  copy: '\uf759',
  cpu: '\uf2d6',
  'disc-3': '\uf608',
  // APP iconfont 暂无 fingerprint glyph，先回退到 aperture 近似纹理形态
  fingerprint: '\uf1de',
  emerald: '\uf589',
  // APP iconfont 暂无 gift glyph，先回退到 package 近似礼盒形态
  gift: '\uf1c7',
  hexagon: '\uf41d',
  history: '\uf292',
  house: '\uf425',
  languages: '\uf658',
  'loader-2': '\uf130',
  'log-out': '\uf1c3',
  megaphone: '\uf484',
  menu: '\uf479',
  'message-circle-more': '\uf24a',
  // APP iconfont 暂无 octagon-alert glyph，先回退到 shield-alert 近似警示形态
  'octagon-alert': '\uf530',
  package: '\uf1c7',
  'panel-right-open': '\uf45e',
  paintbrush: '\uf1d8',
  'qr-code': '\uf6ae',
  // APP iconfont 暂无 refresh-cw glyph，先回退到 workflow 近似循环刷新形态
  'refresh-cw': '\uf2ee',
  'repeat-2': '\uf2ee',
  search: '\uf52a',
  settings: '\uf3e5',
  // APP iconfont 暂无 share glyph，先回退到 arrow-up-right 近似分享外链形态
  share: '\uf144',
  shield: '\uf53f',
  'shield-alert': '\uf530',
  'shield-check': '\uf52f',
  'shopping-cart': '\uf1c7',
  'sliders-horizontal': '\uf56b',
  // APP iconfont 暂无 square-arrow-out-up-right glyph，先回退到 arrow-up-right 近似外跳转形态
  'square-arrow-out-up-right': '\uf144',
  sparkles: '\uf589',
  'terminal-square': '\uf5c3',
  triangle: '\uf5e5',
  user: '\uf4e1',
  'user-plus': '\uf4dd',
  'user-round': '\uf4d7',
  users: '\uf4d0',
  wallet: '\uf614',
  workflow: '\uf2ee',
  wrench: '\uf621',
  x: '\uf659',
  zap: '\uf589',
}
// #endif

export const resolveAetherH5IconComponent = (name: AetherIconName): Component | null => {
  // #ifdef H5
  return H5_ICON_COMPONENT_MAP[name] ?? null
  // #endif
  // #ifndef H5
  void name
  return null
  // #endif
}

export const resolveAetherAppIconfontClass = (name: AetherIconName): string => {
  // #ifdef APP
  return APP_ICONFONT_CLASS_MAP[name]
  // #endif
  // #ifndef APP
  void name
  return ''
  // #endif
}

export const resolveAetherAppIconfontGlyph = (name: AetherIconName): string => {
  // #ifdef APP
  return APP_ICONFONT_GLYPH_MAP[name]
  // #endif
  // #ifndef APP
  void name
  return ''
  // #endif
}
