/*
 * Responsibility: provide the local TypeScript module declaration for the
 * uview-plus Vue plugin used by the uni-app runtime entry.
 * Out of scope: component prop typing and global component auto-import rules.
 */
declare module 'uview-plus' {
  const uviewPlus: import('vue').Plugin
  export default uviewPlus
}
