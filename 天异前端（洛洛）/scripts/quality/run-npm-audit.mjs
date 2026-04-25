import { spawnSync } from 'node:child_process'

const npmInvocation =
  process.platform === 'win32'
    ? {
        command: process.env.ComSpec || 'cmd.exe',
        args: ['/d', '/s', '/c', 'npm audit --omit=dev --json'],
      }
    : {
        command: 'npm',
        args: ['audit', '--omit=dev', '--json'],
      }

const acceptedProductionBaseline = {
  critical: 0,
  high: 18,
}

const result = spawnSync(npmInvocation.command, npmInvocation.args, {
  encoding: 'utf8',
  shell: false,
})

if (result.error?.code === 'ENOENT') {
  console.error('npm audit unavailable: npm command not found.')
  process.exit(1)
}

if (result.error) {
  console.error(`npm audit unavailable: ${result.error.message}`)
  process.exit(1)
}

const collectAuditOutput = () =>
  [result.stdout, result.stderr]
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim())
    .join('\n')

const parseAuditJson = (rawOutput) => {
  if (!rawOutput) {
    return null
  }

  try {
    return JSON.parse(rawOutput)
  } catch {
    const firstBrace = rawOutput.indexOf('{')
    const lastBrace = rawOutput.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null
    }

    try {
      return JSON.parse(rawOutput.slice(firstBrace, lastBrace + 1))
    } catch {
      return null
    }
  }
}

const rawOutput = collectAuditOutput()
const parsed = parseAuditJson(rawOutput)

if (!parsed) {
  console.log(`npm audit summary: unable to parse JSON output (status=${result.status ?? 'null'}).`)
  if (rawOutput) {
    console.log(rawOutput)
  }
  process.exit(1)
}

if (parsed.error) {
  const summary = typeof parsed.error.summary === 'string' ? parsed.error.summary : 'unknown'
  const detail = typeof parsed.error.detail === 'string' ? parsed.error.detail : ''

  console.log(`npm audit summary: audit error -> ${summary}`)
  if (detail) {
    console.log(detail)
  }
  process.exit(1)
}

const vulnerabilitySummary = parsed.metadata?.vulnerabilities ?? {}
const dependencySummary = parsed.metadata?.dependencies ?? {}
const advisoryValues = Object.values(parsed.vulnerabilities ?? {})

console.log('npm audit summary:')
console.log('- mode: production dependencies only (--omit=dev)')
console.log(
  `- dependencies: prod=${dependencySummary.prod ?? 0}, dev=${dependencySummary.dev ?? 0}, optional=${dependencySummary.optional ?? 0}, total=${dependencySummary.total ?? 0}`
)
console.log(
  `- vulnerabilities: info=${vulnerabilitySummary.info ?? 0}, low=${vulnerabilitySummary.low ?? 0}, moderate=${vulnerabilitySummary.moderate ?? 0}, high=${vulnerabilitySummary.high ?? 0}, critical=${vulnerabilitySummary.critical ?? 0}, total=${vulnerabilitySummary.total ?? 0}`
)
console.log(
  `- accepted production baseline: critical<=${acceptedProductionBaseline.critical}, high<=${acceptedProductionBaseline.high}`
)

if (advisoryValues.length === 0) {
  console.log('- advisories: none')
  process.exit(0)
}

const advisorySummary = advisoryValues.reduce(
  (summary, advisory) => {
    if (advisory.isDirect) {
      summary.direct += 1
    } else {
      summary.transitive += 1
    }

    return summary
  },
  {
    direct: 0,
    transitive: 0,
  }
)

console.log(
  `- affected packages: direct=${advisorySummary.direct}, transitive=${advisorySummary.transitive}`
)

const severityRank = {
  critical: 5,
  high: 4,
  moderate: 3,
  low: 2,
  info: 1,
  unknown: 0,
}

const topAdvisories = advisoryValues
  .map((item) => ({
    name: item.name ?? 'unknown',
    severity: item.severity ?? 'unknown',
    isDirect: Boolean(item.isDirect),
    fixAvailable:
      item.fixAvailable === true
        ? 'yes'
        : item.fixAvailable === false
          ? 'no'
          : typeof item.fixAvailable === 'object'
            ? 'partial'
            : 'unknown',
    viaCount: Array.isArray(item.via) ? item.via.length : 0,
  }))
  .sort((left, right) => (severityRank[right.severity] ?? 0) - (severityRank[left.severity] ?? 0))
  .slice(0, 10)

for (const advisory of topAdvisories) {
  console.log(
    `- ${advisory.name}: severity=${advisory.severity}, direct=${advisory.isDirect}, fix=${advisory.fixAvailable}, via=${advisory.viaCount}`
  )
}

const criticalCount = vulnerabilitySummary.critical ?? 0
const highCount = vulnerabilitySummary.high ?? 0
const exceedsAcceptedBaseline =
  criticalCount > acceptedProductionBaseline.critical || highCount > acceptedProductionBaseline.high

if (exceedsAcceptedBaseline) {
  console.error('npm audit baseline exceeded: production high/critical vulnerabilities regressed.')
  process.exit(1)
}

console.log('npm audit baseline complete: accepted production baseline not exceeded.')
process.exit(0)
