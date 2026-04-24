<!--
Responsibility: host the app-level lifecycle bridge and global base styles, and forward app
show/hide signals into the home-rail coordinator.
Out of scope: page routing, feature-state assembly, and per-page interaction logic.
-->

<script lang="ts">
import {
  markHomeRailAppHidden,
  markHomeRailAppShown,
} from './services/home-rail/homeRailUpdateCoordinator.service'

export default {
  onLaunch() {
    // 当前应用无额外启动逻辑。
  },
  onShow() {
    markHomeRailAppShown()
  },
  onHide() {
    markHomeRailAppHidden()
  },
}
</script>

<style lang="scss">
html,
body,
#app,
uni-app,
uni-page,
uni-page-wrapper,
uni-page-body,
page {
  font-family: var(--aether-font-system, system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

view,
text,
button,
input,
textarea,
label,
navigator,
scroll-view,
swiper,
swiper-item {
  font-family: inherit;
}
</style>
