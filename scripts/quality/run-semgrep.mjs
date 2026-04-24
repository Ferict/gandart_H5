import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const semgrepTargets = [
  'src',
  'scripts',
  '.editorconfig',
  '.eslintrc.cjs',
  '.prettierrc.json',
  '.stylelintrc.cjs',
  '.textlintrc.cjs',
  '.vale.ini',
  'commitlint.config.cjs',
  'index.html',
  'knip.json',
  'lefthook.yml',
  'package.json',
  'playwright.config.ts',
  'shims-uni.d.ts',
  'tsconfig.json',
  'vite.config.ts',
  'vitest.config.ts',
]

const semgrepArgs = ['scan', '--config', 'semgrep/rules', '--error', ...semgrepTargets]

const resolveSemgrepExecutable = () => {
  const resolved = spawnSync(
    'py',
    [
      '-c',
      "import os, site; print(os.path.join(os.path.dirname(site.getusersitepackages()), 'Scripts', 'semgrep.exe'))",
    ],
    {
      encoding: 'utf8',
      shell: false,
    }
  )

  const candidate = resolved.stdout?.trim()
  if (candidate && fs.existsSync(candidate)) {
    return candidate
  }

  return 'semgrep'
}

const semgrepCommand = process.platform === 'win32' ? resolveSemgrepExecutable() : 'semgrep'
const semgrepEnv =
  process.platform === 'win32' && semgrepCommand !== 'semgrep'
    ? {
        ...process.env,
        PATH: `${path.dirname(semgrepCommand)};${process.env.PATH ?? ''}`,
        PYTHONUTF8: '1',
        PYTHONIOENCODING: 'utf-8',
        SEMGREP_SEND_METRICS: 'off',
        SEMGREP_ENABLE_VERSION_CHECK: '0',
      }
    : {
        ...process.env,
        PYTHONUTF8: '1',
        PYTHONIOENCODING: 'utf-8',
        SEMGREP_SEND_METRICS: 'off',
        SEMGREP_ENABLE_VERSION_CHECK: '0',
      }

const result = spawnSync(semgrepCommand, semgrepArgs, {
  stdio: 'inherit',
  shell: false,
  env: semgrepEnv,
})

if (result.error?.code === 'ENOENT') {
  console.error(
    'Semgrep is not available. Run `npm run setup:quality:windows` or `py -m pip install --user semgrep`.'
  )
  process.exit(1)
}

if (result.error) {
  console.error(`Semgrep failed: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
