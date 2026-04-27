/**
 * Responsibility:
 * 1. Load the formal content endpoint matrix from the single contract source.
 * 2. Build the current 5-endpoint HTTP smoke matrix for handoff validation.
 * 3. Keep the CLI logic testable without introducing a second API truth source.
 *
 * Out of scope:
 * 1. Proving real backend connectivity when environment inputs are missing.
 * 2. Creating a second manually maintained endpoint constant file.
 * 3. Deleting files; any cleanup in this repo must move files into `垃圾桶/`.
 */

import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import typescript from 'typescript'

const ts = typescript

const CONTENT_CONTRACT_RELATIVE_PATH = path.join('src', 'contracts', 'content-api.contract.ts')
const ENV_FILE_CANDIDATES = [
  '.env.local',
  '.env.development.local',
  '.env.development',
  '.env',
  '.env.example',
]
const FORMAL_ENDPOINT_KEYS = ['scene', 'resource', 'list', 'noticeRead', 'serviceReminderConsume']
const DEFAULT_FORMAL_LIST_RESOURCE_TYPES = ['market_item', 'notice', 'profile_asset']

const isObjectRecord = (value) => typeof value === 'object' && value !== null

export const resolveProjectRoot = (currentFileUrl = import.meta.url) =>
  path.resolve(path.dirname(fileURLToPath(currentFileUrl)), '..')

const parseEnvFile = (filePath) => {
  const result = {}
  const content = fs.readFileSync(filePath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const eqIndex = line.indexOf('=')
    if (eqIndex <= 0) {
      continue
    }

    const key = line.slice(0, eqIndex).trim()
    const value = line
      .slice(eqIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
    result[key] = value
  }

  return result
}

export const createMergedEnv = (projectRoot, processEnv = process.env) => {
  const mergedEnv = {}
  for (const candidate of ENV_FILE_CANDIDATES) {
    const fullPath = path.join(projectRoot, candidate)
    if (fs.existsSync(fullPath)) {
      Object.assign(mergedEnv, parseEnvFile(fullPath))
    }
  }

  Object.assign(mergedEnv, processEnv)
  return mergedEnv
}

export const readEnv = (mergedEnv, key, fallback = '') => (mergedEnv[key] || fallback).trim()

export const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const readContractExports = (contractFilePath) => {
  const contractSource = fs.readFileSync(contractFilePath, 'utf8')
  const transpiled = ts.transpileModule(
    `${contractSource}\nmodule.exports = { CONTENT_API_ENDPOINTS, CONTENT_API_CURRENT_BOUNDARY };`,
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }
  )

  const sandbox = {
    module: {
      exports: {},
    },
  }
  sandbox.exports = sandbox.module.exports

  vm.runInNewContext(transpiled.outputText, sandbox, {
    filename: contractFilePath,
  })

  return sandbox.module.exports
}

const normalizeEndpointDescriptor = (key, value) => {
  if (!isObjectRecord(value)) {
    throw new Error(`[check-content-http-link] Contract endpoint "${key}" is missing or invalid.`)
  }

  const { method, path: pathname, request, response, summary } = value
  if (
    typeof method !== 'string' ||
    typeof pathname !== 'string' ||
    typeof request !== 'string' ||
    typeof response !== 'string' ||
    typeof summary !== 'string'
  ) {
    throw new Error(`[check-content-http-link] Contract endpoint "${key}" is incomplete.`)
  }

  return {
    method,
    path: pathname,
    request,
    response,
    summary,
  }
}

const normalizeFormalListResourceTypes = (boundary) => {
  if (!isObjectRecord(boundary) || !Array.isArray(boundary.formalListResourceTypes)) {
    return DEFAULT_FORMAL_LIST_RESOURCE_TYPES
  }

  const values = boundary.formalListResourceTypes.filter((value) => typeof value === 'string')
  return values.length > 0 ? values : DEFAULT_FORMAL_LIST_RESOURCE_TYPES
}

export const loadContentApiContract = (projectRoot) => {
  const contractFilePath = path.join(projectRoot, CONTENT_CONTRACT_RELATIVE_PATH)
  const exportsObject = readContractExports(contractFilePath)

  if (!isObjectRecord(exportsObject) || !isObjectRecord(exportsObject.CONTENT_API_ENDPOINTS)) {
    throw new Error('[check-content-http-link] Unable to read CONTENT_API_ENDPOINTS from contract.')
  }

  const endpoints = FORMAL_ENDPOINT_KEYS.reduce((result, key) => {
    result[key] = normalizeEndpointDescriptor(key, exportsObject.CONTENT_API_ENDPOINTS[key])
    return result
  }, {})

  return {
    contractFilePath,
    contractRelativePath: CONTENT_CONTRACT_RELATIVE_PATH,
    endpoints,
    formalListResourceTypes: normalizeFormalListResourceTypes(
      exportsObject.CONTENT_API_CURRENT_BOUNDARY
    ),
  }
}

const createConfigError = (message) => new Error(`[check-content-http-link] ${message}`)

export const createContentHttpSmokeConfig = (mergedEnv, contractArtifacts) => {
  const provider = readEnv(mergedEnv, 'VITE_CONTENT_PROVIDER', 'mock').toLowerCase()
  if (provider !== 'http') {
    throw createConfigError('provider is not http. Set VITE_CONTENT_PROVIDER=http first.')
  }

  const baseUrl = readEnv(mergedEnv, 'VITE_CONTENT_API_BASE_URL')
  if (!baseUrl) {
    throw createConfigError('VITE_CONTENT_API_BASE_URL is missing.')
  }

  let parsedBaseUrl
  try {
    parsedBaseUrl = new URL(baseUrl)
  } catch {
    throw createConfigError('VITE_CONTENT_API_BASE_URL is not a valid absolute URL.')
  }

  if (!['http:', 'https:'].includes(parsedBaseUrl.protocol)) {
    throw createConfigError('VITE_CONTENT_API_BASE_URL must use http:// or https://.')
  }

  const defaultListResourceType = contractArtifacts.formalListResourceTypes.includes('market_item')
    ? 'market_item'
    : contractArtifacts.formalListResourceTypes[0]
  const listResourceType = readEnv(
    mergedEnv,
    'VITE_CONTENT_SMOKE_LIST_RESOURCE_TYPE',
    defaultListResourceType
  )
  if (!contractArtifacts.formalListResourceTypes.includes(listResourceType)) {
    throw createConfigError(
      `VITE_CONTENT_SMOKE_LIST_RESOURCE_TYPE must be one of ${contractArtifacts.formalListResourceTypes.join(', ')}.`
    )
  }

  return {
    provider,
    baseUrl,
    parsedBaseUrl,
    contract: contractArtifacts,
    sceneId: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_SCENE_ID', 'home'),
    listResourceType,
    listPage: parsePositiveInt(readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_LIST_PAGE', '1'), 1),
    listPageSize: parsePositiveInt(
      readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_LIST_PAGE_SIZE', '20'),
      20
    ),
    resourceType: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_RESOURCE_TYPE'),
    resourceId: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_RESOURCE_ID'),
    noticeId: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_NOTICE_ID'),
    serviceId: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_SERVICE_ID'),
    latestMessageId: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_LATEST_MESSAGE_ID'),
    scenePlatform: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_SCENE_PLATFORM'),
    sceneChannel: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_SCENE_CHANNEL'),
    sceneLocale: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_SCENE_LOCALE'),
    listCategoryId: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_LIST_CATEGORY_ID'),
    listSubCategory: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_LIST_SUB_CATEGORY'),
    listKeyword: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_LIST_KEYWORD'),
    listTag: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_LIST_TAG'),
    listStartDate: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_LIST_START_DATE'),
    listEndDate: readEnv(mergedEnv, 'VITE_CONTENT_SMOKE_LIST_END_DATE'),
  }
}

const createSkipReason = (missingKeys) =>
  missingKeys.length === 0
    ? ''
    : `skipped because ${missingKeys.join(' and ')} ${missingKeys.length > 1 ? 'are' : 'is'} not set.`

const buildListQuery = (config) => {
  const common = {
    resourceType: config.listResourceType,
    keyword: config.listKeyword,
    page: config.listPage,
    pageSize: config.listPageSize,
  }

  if (config.listResourceType === 'market_item') {
    return {
      ...common,
      categoryId: config.listCategoryId,
    }
  }

  if (config.listResourceType === 'notice') {
    return {
      ...common,
      tag: config.listTag,
      startDate: config.listStartDate,
      endDate: config.listEndDate,
    }
  }

  return {
    ...common,
    categoryId: config.listCategoryId,
    subCategory: config.listSubCategory,
  }
}

export const createContentHttpChecks = (config) => {
  const { endpoints } = config.contract
  const resourceMissingKeys = [
    !config.resourceType ? 'VITE_CONTENT_SMOKE_RESOURCE_TYPE' : '',
    !config.resourceId ? 'VITE_CONTENT_SMOKE_RESOURCE_ID' : '',
  ].filter(Boolean)
  const noticeMissingKeys = [!config.noticeId ? 'VITE_CONTENT_SMOKE_NOTICE_ID' : ''].filter(Boolean)
  const serviceMissingKeys = [!config.serviceId ? 'VITE_CONTENT_SMOKE_SERVICE_ID' : ''].filter(
    Boolean
  )

  return [
    {
      endpointKey: 'scene',
      label: `${endpoints.scene.method} ${endpoints.scene.path}`,
      method: endpoints.scene.method,
      pathname: endpoints.scene.path,
      query: {
        sceneId: config.sceneId,
        platform: config.scenePlatform,
        channel: config.sceneChannel,
        locale: config.sceneLocale,
      },
      requiredEnvKeys: [],
      validate: (body) => {
        if (!body.data || typeof body.data !== 'object') {
          return 'returned an empty scene payload.'
        }
        if (body.data.sceneId !== config.sceneId) {
          return `returned sceneId=${String(body.data.sceneId)} instead of ${config.sceneId}.`
        }
        return ''
      },
    },
    {
      endpointKey: 'resource',
      label: `${endpoints.resource.method} ${endpoints.resource.path}`,
      method: endpoints.resource.method,
      pathname: endpoints.resource.path,
      query: {
        resourceType: config.resourceType,
        resourceId: config.resourceId,
      },
      requiredEnvKeys: ['VITE_CONTENT_SMOKE_RESOURCE_TYPE', 'VITE_CONTENT_SMOKE_RESOURCE_ID'],
      skipReason: createSkipReason(resourceMissingKeys),
      validate: (body) => {
        if (!body.data || typeof body.data !== 'object') {
          return 'returned an empty resource payload.'
        }
        if (body.data.resourceType !== config.resourceType) {
          return `returned resourceType=${String(body.data.resourceType)} instead of ${config.resourceType}.`
        }
        if (body.data.resourceId !== config.resourceId) {
          return `returned resourceId=${String(body.data.resourceId)} instead of ${config.resourceId}.`
        }
        return ''
      },
    },
    {
      endpointKey: 'list',
      label: `${endpoints.list.method} ${endpoints.list.path}`,
      method: endpoints.list.method,
      pathname: endpoints.list.path,
      query: buildListQuery(config),
      requiredEnvKeys: [],
      validate: (body) => {
        if (!body.data || typeof body.data !== 'object') {
          return 'returned an empty list payload.'
        }
        if (body.data.resourceType !== config.listResourceType) {
          return `returned resourceType=${String(body.data.resourceType)} instead of ${config.listResourceType}.`
        }
        if (!Array.isArray(body.data.items)) {
          return 'did not return items[].'
        }
        if (typeof body.data.page !== 'number' || typeof body.data.pageSize !== 'number') {
          return 'did not return numeric page/pageSize.'
        }
        return ''
      },
    },
    {
      endpointKey: 'noticeRead',
      label: `${endpoints.noticeRead.method} ${endpoints.noticeRead.path}`,
      method: endpoints.noticeRead.method,
      pathname: endpoints.noticeRead.path,
      body: {
        actionType: 'notice-read',
        noticeId: config.noticeId,
      },
      requiredEnvKeys: ['VITE_CONTENT_SMOKE_NOTICE_ID'],
      skipReason: createSkipReason(noticeMissingKeys),
      validate: (body) => {
        if (!body.data || typeof body.data !== 'object') {
          return 'returned an empty action payload.'
        }
        if (body.data.noticeId !== config.noticeId) {
          return `returned noticeId=${String(body.data.noticeId)} instead of ${config.noticeId}.`
        }
        if (!('isUnread' in body.data)) {
          return 'did not return isUnread.'
        }
        return ''
      },
    },
    {
      endpointKey: 'serviceReminderConsume',
      label: `${endpoints.serviceReminderConsume.method} ${endpoints.serviceReminderConsume.path}`,
      method: endpoints.serviceReminderConsume.method,
      pathname: endpoints.serviceReminderConsume.path,
      body: {
        actionType: 'service-reminder-consume',
        serviceId: config.serviceId,
        ...(config.latestMessageId
          ? {
              latestMessageId: config.latestMessageId,
            }
          : {}),
      },
      requiredEnvKeys: ['VITE_CONTENT_SMOKE_SERVICE_ID'],
      skipReason: createSkipReason(serviceMissingKeys),
      validate: (body) => {
        if (!body.data || typeof body.data !== 'object') {
          return 'returned an empty action payload.'
        }
        if (body.data.serviceId !== config.serviceId) {
          return `returned serviceId=${String(body.data.serviceId)} instead of ${config.serviceId}.`
        }
        if (!('hasReminder' in body.data) || !('unreadCount' in body.data)) {
          return 'did not return hasReminder/unreadCount.'
        }
        return ''
      },
    },
  ]
}

const hasEnvelope = (body) =>
  body &&
  typeof body === 'object' &&
  'code' in body &&
  'message' in body &&
  'requestId' in body &&
  'serverTime' in body &&
  'data' in body

const buildUrl = (parsedBaseUrl, pathname, query = {}) => {
  const url = new URL(pathname, parsedBaseUrl)
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') {
      continue
    }
    url.searchParams.set(key, String(value))
  }
  return url
}

const readResponseSnippet = async (response) => {
  try {
    const text = await response.text()
    return text.slice(0, 300)
  } catch {
    return ''
  }
}

const createPassedResult = (label, detail) => ({
  status: 'pass',
  label,
  detail,
})

const createSkippedResult = (label, detail) => ({
  status: 'skip',
  label,
  detail,
})

const createFailedResult = (label, detail) => ({
  status: 'fail',
  label,
  detail,
})

const runJsonCheck = async (parsedBaseUrl, check) => {
  if (check.skipReason) {
    return createSkippedResult(check.label, check.skipReason)
  }

  const url = buildUrl(parsedBaseUrl, check.pathname, check.query)
  try {
    const response = await fetch(url, {
      method: check.method,
      headers: {
        Accept: 'application/json',
        ...(check.body
          ? {
              'Content-Type': 'application/json',
            }
          : {}),
      },
      ...(check.body
        ? {
            body: JSON.stringify(check.body),
          }
        : {}),
    })

    if (!response.ok) {
      const snippet = await readResponseSnippet(response)
      return createFailedResult(
        check.label,
        `${check.method} ${url} failed with HTTP ${response.status}.${snippet ? ` body=${snippet}` : ''}`
      )
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.toLowerCase().includes('application/json')) {
      const snippet = await readResponseSnippet(response)
      return createFailedResult(
        check.label,
        `${check.method} ${url} did not return application/json.${snippet ? ` body=${snippet}` : ''}`
      )
    }

    const responseBody = await response.json()
    if (!hasEnvelope(responseBody)) {
      return createFailedResult(
        check.label,
        `${check.method} ${url} response is not a valid content envelope.`
      )
    }

    if (responseBody.code !== 0) {
      return createFailedResult(
        check.label,
        `${check.method} ${url} returned business code=${String(responseBody.code)} message=${String(responseBody.message)}.`
      )
    }

    if (check.validate) {
      const validationError = check.validate(responseBody)
      if (validationError) {
        return createFailedResult(check.label, `${check.method} ${url} ${validationError}`)
      }
    }

    return createPassedResult(check.label, `${check.method} ${url}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return createFailedResult(check.label, `${check.method} ${url} request failed. ${message}`)
  }
}

export const runContentHttpChecks = async (config) => {
  const checks = createContentHttpChecks(config)
  const results = []
  for (const check of checks) {
    results.push(await runJsonCheck(config.parsedBaseUrl, check))
  }

  return {
    checks,
    results,
  }
}
