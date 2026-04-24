import type { Ref } from 'vue'
import {
  createResolvedTemplateRefAssigner,
  createResolvedTemplateRefForwarder,
  resolveTemplateRefElement,
} from '@/utils/resolveTemplateRefElement.util'

describe('resolveTemplateRefElement.util', () => {
  const originalHTMLElement = globalThis.HTMLElement

  class MockHTMLElement {}

  beforeAll(() => {
    globalThis.HTMLElement = MockHTMLElement as unknown as typeof HTMLElement
  })

  afterAll(() => {
    globalThis.HTMLElement = originalHTMLElement
  })

  it('returns the raw element when the ref is already a native element', () => {
    const element = new MockHTMLElement() as unknown as HTMLElement

    expect(resolveTemplateRefElement(element)).toBe(element)
  })

  it('resolves component-like refs from $el and vnode candidates', () => {
    const rootElement = new MockHTMLElement() as unknown as HTMLElement
    const vnodeElement = new MockHTMLElement() as unknown as HTMLElement

    expect(resolveTemplateRefElement({ $el: rootElement })).toBe(rootElement)
    expect(resolveTemplateRefElement({ $: { vnode: { el: vnodeElement } } })).toBe(vnodeElement)
    expect(resolveTemplateRefElement({ vnode: { el: vnodeElement } })).toBe(vnodeElement)
  })

  it('returns null for empty or non-element refs', () => {
    expect(resolveTemplateRefElement(null)).toBeNull()
    expect(resolveTemplateRefElement(undefined)).toBeNull()
    expect(resolveTemplateRefElement({ $el: {} })).toBeNull()
    expect(resolveTemplateRefElement('div')).toBeNull()
  })

  it('creates a stable assigner that writes the resolved native element into a ref', () => {
    const target = { value: null } as Ref<HTMLElement | null>
    const assignResolvedTemplateRef = createResolvedTemplateRefAssigner(target)
    const rootElement = new MockHTMLElement() as unknown as HTMLElement

    assignResolvedTemplateRef({ $el: rootElement })
    expect(target.value).toBe(rootElement)

    assignResolvedTemplateRef(null)
    expect(target.value).toBeNull()
  })

  it('creates a forwarder that resolves the native element before invoking a callback', () => {
    let assignedElement: HTMLElement | null = null
    const forwardResolvedTemplateRef = createResolvedTemplateRefForwarder((element) => {
      assignedElement = element
    })
    const vnodeElement = new MockHTMLElement() as unknown as HTMLElement

    forwardResolvedTemplateRef({ vnode: { el: vnodeElement } })
    expect(assignedElement).toBe(vnodeElement)

    forwardResolvedTemplateRef(undefined as unknown as null)
    expect(assignedElement).toBeNull()
  })
})
