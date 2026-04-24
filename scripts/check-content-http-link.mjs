/**
 * 文件职责：
 * 1. 校验当前内容域是否已切到 http provider。
 * 2. 校验 base URL 是否存在且格式正确。
 * 3. 对 5 个正式接口提供统一的最小联调验证矩阵。
 *
 * 不负责：
 * 1. 伪造真实后端样本数据。
 * 2. 替代 P2/P3 的审查或真实联通结论。
 */

import {
  createContentHttpSmokeConfig as createContentHttpSmokeConfigFromContract,
  createMergedEnv as createMergedEnvFromContract,
  loadContentApiContract as loadContentApiContractFromContract,
  resolveProjectRoot as resolveProjectRootFromContract,
  runContentHttpChecks as runContentHttpChecksFromContract,
} from './check-content-http-link.shared.mjs'

const runContractDrivenSmoke = async () => {
  const projectRoot = resolveProjectRootFromContract(import.meta.url)
  const contractArtifacts = loadContentApiContractFromContract(projectRoot)
  const mergedEnv = createMergedEnvFromContract(projectRoot)
  const config = createContentHttpSmokeConfigFromContract(mergedEnv, contractArtifacts)
  const { results } = await runContentHttpChecksFromContract(config)

  for (const result of results) {
    const prefix = result.status === 'pass' ? 'PASS' : result.status === 'skip' ? 'SKIP' : 'FAIL'
    const stream = result.status === 'fail' ? console.error : console.log
    stream(`[check-content-http-link] ${prefix} ${result.label} :: ${result.detail}`)
  }

  const passed = results.filter((item) => item.status === 'pass').length
  const skipped = results.filter((item) => item.status === 'skip').length
  const failed = results.filter((item) => item.status === 'fail').length

  console.log(
    `[check-content-http-link] summary passed=${passed} skipped=${skipped} failed=${failed} provider=${config.provider} baseUrl=${config.baseUrl} contract=${contractArtifacts.contractRelativePath}`
  )

  if (failed > 0) {
    process.exit(1)
  }
}

try {
  await runContractDrivenSmoke()
  process.exit(0)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
}
