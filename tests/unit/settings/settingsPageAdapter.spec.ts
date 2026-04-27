import { describe, expect, it } from 'vitest'
import { createContentSceneSnapshot } from '../../../src/implementations/content.mock'
import { mapSettingsSceneToPageView } from '../../../src/pages/settings/runtime/settingsPage.adapter'

describe('settings page adapter', () => {
  it('maps the current settings scene into a stable page view model', () => {
    const scene = createContentSceneSnapshot('settings')
    expect(scene).not.toBeNull()

    const view = mapSettingsSceneToPageView(scene)

    expect(view.summary.title).toBe('关于天异')
    expect(view.summary.actionLabel).toBe('问题反馈')
    expect(view.sections.map((section) => section.title)).toEqual(['账户与安全', '通知与显示'])
    expect(view.sections.map((section) => section.id)).toEqual([
      'account-security',
      'display-notify',
    ])
    expect(view.sections[0].items.map((item) => item.iconName)).toEqual([
      'user-round',
      'shield-check',
      'wallet',
    ])
    expect(view.sections[1].items.map((item) => item.iconName)).toEqual([
      'bell-ring',
      'paintbrush',
      'languages',
    ])
  })

  it('keeps settings actions as frontend seams instead of backend mutations', () => {
    const scene = createContentSceneSnapshot('settings')
    const view = mapSettingsSceneToPageView(scene)

    expect(view.summary.actionTarget.targetType).toBe('settings_action')
    expect(view.sections.flatMap((section) => section.items).every((item) => item.targetSeam)).toBe(
      true
    )
    expect(view.sections.flatMap((section) => section.items).every((item) => item.targetSeam)).toBe(
      true
    )
  })
})
