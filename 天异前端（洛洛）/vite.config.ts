/**
 * 文件版本：v0002
 * 更新时间：2026-03-23 07:36:11
 * Encoding: UTF-8
 * 本次更新：补充文件头编码格式标记并同步基础文件更新记录
 */

import { networkInterfaces } from 'node:os'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
]

const resolveLanIpv4 = () => {
  const interfaces = networkInterfaces()

  for (const details of Object.values(interfaces)) {
    if (!details) {
      continue
    }

    for (const item of details) {
      if (item.family === 'IPv4' && !item.internal) {
        return item.address
      }
    }
  }

  return '127.0.0.1'
}

const resolveDevHost = () => {
  const explicitHost = process.env.UNI_DEV_HOST?.trim() || process.env.VITE_DEV_HOST?.trim()
  return explicitHost || resolveLanIpv4()
}

const injectBuildCspMeta = (html: string) => {
  if (/http-equiv=["']Content-Security-Policy["']/i.test(html)) {
    return html
  }

  const cspMeta = `    <meta http-equiv="Content-Security-Policy" content="${CSP_DIRECTIVES.join(
    '; '
  )}" />\n`
  return html.replace('</head>', `${cspMeta}  </head>`)
}

/**
 * 文件职责：
 * 1. 承载 uni-app + Vite 的最小构建入口。
 * 2. 当前阶段只保持官方主路径所需的最小配置，不提前引入自定义构建分支。
 * 3. 后续如需环境变量、别名增强或多端特殊配置，必须先经过单独审查。
 */
export default defineConfig(({ command }) => {
  const devHost = resolveDevHost()
  const plugins = [uni()]

  if (command === 'build') {
    plugins.push({
      name: 'inject-h5-csp',
      transformIndexHtml(html) {
        return injectBuildCspMeta(html)
      },
    })
  }

  return {
    plugins,
    server:
      command === 'serve'
        ? {
            host: '0.0.0.0',
            hmr: {
              host: devHost,
            },
          }
        : undefined,
  }
})
