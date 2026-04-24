import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const whitelistPath = path.join(__dirname, 'external-resource-whitelist.json')
const scanTargets = [
  {
    kind: 'html',
    filePath: path.join(repoRoot, 'index.html'),
  },
  {
    kind: 'vite',
    filePath: path.join(repoRoot, 'vite.config.ts'),
  },
]
const externalUrlPattern = /^(https?:)?\/\//i
const htmlTagPattern = /<(script|link)\b([^>]*)>/gi
const attributePattern = /([:@\w-]+)\s*=\s*("([^"]*)"|'([^']*)')/g
const viteResourcePattern = /\b(tag|src|href|rel|integrity|crossorigin)\s*:\s*(['"`])([\s\S]*?)\2/g

const readWhitelist = () => {
  if (!fs.existsSync(whitelistPath)) {
    throw new Error(`白名单文件不存在：${path.relative(repoRoot, whitelistPath)}`)
  }

  const parsed = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'))
  const resources = Array.isArray(parsed.resources) ? parsed.resources : []

  return resources.map((entry) => ({
    kind: typeof entry.kind === 'string' ? entry.kind.trim() : '',
    url: typeof entry.url === 'string' ? entry.url.trim() : '',
  }))
}

const normalizeKind = (value) => value.trim().toLowerCase()

const findWhitelistHit = (whitelist, resource) =>
  whitelist.some((entry) => {
    if (!entry.url || entry.url !== resource.url) {
      return false
    }

    if (!entry.kind) {
      return true
    }

    return normalizeKind(entry.kind) === normalizeKind(resource.kind)
  })

const toLineNumber = (source, matchIndex) => source.slice(0, matchIndex).split('\n').length

const parseAttributes = (rawAttributes) => {
  const attributes = {}

  for (const match of rawAttributes.matchAll(attributePattern)) {
    const [, name, , doubleQuotedValue, singleQuotedValue] = match
    attributes[name.toLowerCase()] = doubleQuotedValue ?? singleQuotedValue ?? ''
  }

  return attributes
}

const detectLinkKind = (attributes) => {
  const rel = (attributes.rel ?? '').trim().toLowerCase()

  if (rel === 'stylesheet') {
    return 'stylesheet'
  }

  if (rel === 'preload') {
    return 'preload'
  }

  if (rel === 'modulepreload') {
    return 'modulepreload'
  }

  return ''
}

const scanHtmlFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return []
  }

  const source = fs.readFileSync(filePath, 'utf8')
  const findings = []

  for (const match of source.matchAll(htmlTagPattern)) {
    const [rawTag, tagName, rawAttributes = ''] = match
    const attributes = parseAttributes(rawAttributes)
    const normalizedTagName = tagName.toLowerCase()
    const url = normalizedTagName === 'script' ? attributes.src : attributes.href

    if (!url || !externalUrlPattern.test(url)) {
      continue
    }

    const resourceKind = normalizedTagName === 'script' ? 'script' : detectLinkKind(attributes)

    if (!resourceKind) {
      continue
    }

    findings.push({
      filePath,
      line: toLineNumber(source, match.index ?? 0),
      kind: resourceKind,
      url,
      integrity: attributes.integrity ?? '',
      crossorigin: attributes.crossorigin ?? '',
      raw: rawTag.trim(),
    })
  }

  return findings
}

const extractViteObjectSnippets = (source) => {
  const snippets = []
  const lines = source.split('\n')
  let current = []
  let startLine = 0

  lines.forEach((line, index) => {
    if (line.includes('{')) {
      if (current.length === 0) {
        startLine = index + 1
      }
      current.push(line)
      return
    }

    if (current.length > 0) {
      current.push(line)
      if (line.includes('}')) {
        snippets.push({
          content: current.join('\n'),
          startLine,
        })
        current = []
      }
    }
  })

  return snippets
}

const scanViteFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return []
  }

  const source = fs.readFileSync(filePath, 'utf8')
  const findings = []

  for (const snippet of extractViteObjectSnippets(source)) {
    const properties = {}

    for (const match of snippet.content.matchAll(viteResourcePattern)) {
      properties[match[1].toLowerCase()] = match[3]
    }

    const url = properties.src ?? properties.href
    if (!url || !externalUrlPattern.test(url)) {
      continue
    }

    const tag = (properties.tag ?? '').trim().toLowerCase()
    const rel = (properties.rel ?? '').trim().toLowerCase()
    const resourceKind =
      tag === 'script'
        ? 'script'
        : tag === 'link' && ['stylesheet', 'preload', 'modulepreload'].includes(rel)
          ? rel
          : ''

    if (!resourceKind) {
      continue
    }

    findings.push({
      filePath,
      line: snippet.startLine,
      kind: resourceKind,
      url,
      integrity: properties.integrity ?? '',
      crossorigin: properties.crossorigin ?? '',
      raw: snippet.content.trim(),
    })
  }

  return findings
}

const scanTargetsForExternalResources = () =>
  scanTargets.flatMap((target) =>
    target.kind === 'html' ? scanHtmlFile(target.filePath) : scanViteFile(target.filePath)
  )

const whitelist = readWhitelist()
const resources = scanTargetsForExternalResources()
const violations = []

for (const resource of resources) {
  if (!findWhitelistHit(whitelist, resource)) {
    violations.push({
      ...resource,
      reason: '未命中 external-resource-whitelist.json 白名单',
    })
  }

  if (!resource.integrity) {
    violations.push({
      ...resource,
      reason: '缺少 integrity 属性',
    })
  }

  if (resource.crossorigin !== 'anonymous') {
    violations.push({
      ...resource,
      reason: 'crossorigin 必须为 anonymous',
    })
  }
}

if (resources.length === 0) {
  console.log(
    'External resource check passed: 当前 H5 入口未发现外部 script / stylesheet / preload / modulepreload 资源。'
  )
  process.exit(0)
}

if (violations.length > 0) {
  console.error('External resource check failed:')
  for (const violation of violations) {
    console.error(
      `- ${path.relative(repoRoot, violation.filePath)}:${violation.line} [${violation.kind}] ${violation.reason} -> ${violation.url}`
    )
  }
  process.exit(1)
}

console.log(
  `External resource check passed: 共校验 ${resources.length} 个外链资源，均命中白名单并携带 SRI。`
)
