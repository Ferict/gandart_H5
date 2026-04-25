# HomeShellTrackStage.vue 问题摘录

问题：仍保留 `>=768` 自动切到 `mode-web` 的独立壳层分支，首页当前实际维护两套路径。

```vue
  15:         <template v-if="isWebPlaceholderMode">
  16:           <view class="home-web-shell">
  17:             <HomeShellNavRail
  18:               class="home-web-nav-rail"
  19:               :runtime-context="props.runtimeContext"
  20:               :can-expand-drawer="true"
  21:               :active-page="webPlaceholderPage"
  22:               @open-drawer="handleOpenDrawer"
  23:               @change-tab="handleChangeTab"
  24:             />
  25:
  26:             <view class="home-web-main">
  27:               <view v-if="webPlaceholderPage === HOME_PRIMARY_PAGE_KEY" class="home-web-topbar-shell">
  28:                 <HomeRailTopbar
  29:                   :can-open-drawer="true"
  30:                   :is-scrolled="homeTrackScrolled"
  31:                   @open-drawer="handleOpenDrawer"
  32:                 />
  33:               </view>
  34:
  35:               <view class="home-web-main-scroll" @scroll="handleTrackScroll(webPlaceholderPage, $event)">
  36:                 <template v-if="webPlaceholderPage === HOME_PRIMARY_PAGE_KEY">
  37:                   <HomeRailHomePanel />
  38:                 </template>
  39:
  40:                 <template v-else-if="webPlaceholderPage === HOME_ACTIVITY_PAGE_KEY">
  41:                   <HomeRailActivityPanel />
  42:                 </template>
  43:
  44:                 <template v-else>
  45:                   <HomeRailProfilePanel />
  46:                 </template>
  47:               </view>
  48:             </view>
  49:           </view>
```

```ts
 147: const WEB_PLACEHOLDER_ENTER_WIDTH = 768
 148: const WEB_PLACEHOLDER_EXIT_WIDTH = 744
 149: const isWebPlaceholderMode = ref(false)
 150: const homeTrackScrolled = ref(false)
 151:
 152: watch(
 153:   () => props.runtimeContext.viewportWidth,
 154:   (viewportWidth) => {
 155:     if (!isWebPlaceholderMode.value && viewportWidth >= WEB_PLACEHOLDER_ENTER_WIDTH) {
 156:       isWebPlaceholderMode.value = true
 157:       return
 158:     }
 159:
 160:     if (isWebPlaceholderMode.value && viewportWidth <= WEB_PLACEHOLDER_EXIT_WIDTH) {
 161:       isWebPlaceholderMode.value = false
 162:     }
 163:   },
 164:   { immediate: true },
 165: )
```
