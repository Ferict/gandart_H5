import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const valeTargets = ['AGENTS.md', 'README.md', '.continue/checks', 'promptfoo']
const wingetValePath = path.join(
  process.env.LOCALAPPDATA ?? '',
  'Microsoft',
  'WinGet',
  'Links',
  'vale.exe'
)
const wingetPackagesDir = path.join(
  process.env.LOCALAPPDATA ?? '',
  'Microsoft',
  'WinGet',
  'Packages'
)

const resolveValeExecutable = () => {
  if (fs.existsSync(wingetValePath)) {
    return wingetValePath
  }

  if (!fs.existsSync(wingetPackagesDir)) {
    return 'vale'
  }

  const matchedDir = fs
    .readdirSync(wingetPackagesDir, { withFileTypes: true })
    .find((entry) => entry.isDirectory() && entry.name.startsWith('errata-ai.Vale_'))

  if (!matchedDir) {
    return 'vale'
  }

  return path.join(wingetPackagesDir, matchedDir.name, 'vale.exe')
}

const result =
  process.platform === 'win32'
    ? spawnSync(resolveValeExecutable(), valeTargets, {
        stdio: 'inherit',
        shell: false,
      })
    : spawnSync('vale', valeTargets, {
        stdio: 'inherit',
        shell: false,
      })

if (result.error?.code === 'ENOENT') {
  console.error(
    'Vale is not available. Run `npm run setup:quality:windows` or `winget install --id errata-ai.Vale -e --accept-package-agreements --accept-source-agreements`.'
  )
  process.exit(1)
}

process.exit(result.status ?? 1)
