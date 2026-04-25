import { spawnSync } from 'node:child_process'

const provider = process.env.PROMPTFOO_PROVIDER

if (!provider) {
  console.error('缺少 PROMPTFOO_PROVIDER。示例：set PROMPTFOO_PROVIDER=openai:gpt-4.1-mini')
  process.exit(1)
}

if (provider.startsWith('openai:') && !process.env.OPENAI_API_KEY) {
  console.error('当前 provider 需要 OPENAI_API_KEY，但环境变量未设置。')
  process.exit(1)
}

const result = spawnSync(
  'npx',
  [
    'promptfoo',
    'eval',
    '-c',
    'promptfoo/promptfooconfig.yaml',
    '-r',
    provider,
    '--no-progress-bar',
  ],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  }
)

process.exit(result.status ?? 1)
