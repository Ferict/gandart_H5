/**
 * 文件版本：v0002
 * 更新时间：2026-03-23 07:36:11
 * Encoding: UTF-8
 * 本次更新：补充文件头编码格式标记并同步基础文件更新记录
 */

/// <reference types='@dcloudio/types' />
import 'vue'

declare module '@vue/runtime-core' {
  type Hooks = App.AppInstance & Page.PageInstance

  interface ComponentCustomOptions extends Hooks {}
}
