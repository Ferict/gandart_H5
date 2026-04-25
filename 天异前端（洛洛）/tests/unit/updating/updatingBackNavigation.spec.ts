import { describe, expect, it, vi } from 'vitest'
import { runUpdatingBackNavigation } from '../../../src/pages/updating/updatingBackNavigation'

describe('runUpdatingBackNavigation', () => {
  it('navigates back when there is page history', () => {
    const navigateBack = vi.fn()
    const reLaunch = vi.fn()

    const result = runUpdatingBackNavigation(2, {
      navigateBack,
      reLaunch,
    })

    expect(result).toBe('navigate-back')
    expect(navigateBack).toHaveBeenCalledTimes(1)
    expect(reLaunch).not.toHaveBeenCalled()
  })

  it('relaunches home when the updating page is the only page in stack', () => {
    const navigateBack = vi.fn()
    const reLaunch = vi.fn()

    const result = runUpdatingBackNavigation(1, {
      navigateBack,
      reLaunch,
    })

    expect(result).toBe('relaunch-home')
    expect(navigateBack).not.toHaveBeenCalled()
    expect(reLaunch).toHaveBeenCalledTimes(1)
    expect(reLaunch).toHaveBeenCalledWith({
      url: '/pages/home/index',
    })
  })
})
