import { runProfileAssetDetailPageOpenFlow } from '@/pages/profile-asset-detail/helpers/profileAssetDetailPageOpenFlow'

describe('profileAssetDetail page-open flow', () => {
  it('prepares the page before refreshing with page-open reason', async () => {
    const callOrder: string[] = []
    const prepareDetailPageForPageOpen = vi.fn(async () => {
      callOrder.push('prepare')
    })
    const refreshDetailContent = vi.fn(async (input: { reason: 'page-open' }) => {
      callOrder.push(`refresh:${input.reason}`)
    })

    await runProfileAssetDetailPageOpenFlow({
      prepareDetailPageForPageOpen,
      refreshDetailContent,
    })

    expect(prepareDetailPageForPageOpen).toHaveBeenCalledTimes(1)
    expect(refreshDetailContent).toHaveBeenCalledTimes(1)
    expect(refreshDetailContent).toHaveBeenCalledWith({ reason: 'page-open' })
    expect(callOrder).toEqual(['prepare', 'refresh:page-open'])
  })
})
