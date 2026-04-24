# homeShellMenu.service.ts 相关定义摘录

问题关联：drawer 入口 routeUrl 在定义时就固定写成了 `shell-drawer` 来源。

```ts
  12: const HOME_SHELL_DRAWER_ENTRIES: ReadonlyArray<HomeShellDrawerEntry> = [
  13:   {
  14:     id: 'orders',
  15:     label: '我的订单',
  16:     englishLabel: 'Order Center',
  17:     iconKey: 'history',
  18:     routeUrl: buildHomeServiceEntryUrl('orders', 'shell-drawer'),
  19:   },
  20:   {
  21:     id: 'auth',
  22:     label: '实名认证',
  23:     englishLabel: 'Identity Verify',
  24:     iconKey: 'shield-check',
  25:     routeUrl: buildHomeServiceEntryUrl('auth', 'shell-drawer'),
  26:     badge: { label: '已认证', tone: 'success' },
  27:   },
  28:   {
  29:     id: 'wallet',
  30:     label: '钱包管理',
  31:     englishLabel: 'Wallet',
  32:     iconKey: 'wallet',
  33:     routeUrl: buildHomeServiceEntryUrl('wallet', 'shell-drawer'),
  34:     badge: { label: '已开通', tone: 'info' },
  35:   },
  36:   {
  37:     id: 'invite',
  38:     label: '邀请好友',
  39:     englishLabel: 'Invite Hub',
  40:     iconKey: 'user-plus',
  41:     routeUrl: buildHomeServiceEntryUrl('invite', 'shell-drawer'),
  42:     badge: { label: '已邀', value: '12人', tone: 'accent' },
  43:   },
  44:   {
  45:     id: 'community',
  46:     label: '官方社群',
  47:     englishLabel: 'Community',
  48:     iconKey: 'users',
  49:     routeUrl: buildHomeServiceEntryUrl('community', 'shell-drawer'),
  50:   },
  51:   {
  52:     id: 'settings',
  53:     label: '系统设置',
  54:     englishLabel: 'Settings',
  55:     iconKey: 'settings',
  56:     routeUrl: buildSettingsUrl('shell-drawer', 'account-security'),
  57:   },
  58: ]
```
