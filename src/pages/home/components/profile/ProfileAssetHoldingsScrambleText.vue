<!--
Responsibility: render the page-local holdings serial scramble effect used by the profile asset
bottom sheet.
Out of scope: list interaction policy, holdings data projection, and route transitions.
-->
<template>
  <text class="profile-asset-holdings-scramble-text">{{ displayText }}</text>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const props = defineProps<{
  text: string
  triggerSignal: number
}>()

const displayText = ref(props.text)

let scrambleTimer: ReturnType<typeof setInterval> | null = null

const stopScramble = () => {
  if (!scrambleTimer) {
    return
  }

  clearInterval(scrambleTimer)
  scrambleTimer = null
}

const resolveScrambledText = (text: string, iteration: number) => {
  return text
    .split('')
    .map((character, index) => {
      if (index < iteration || character === '#') {
        return character
      }

      const randomIndex = Math.floor(Math.random() * SCRAMBLE_CHARS.length)
      return SCRAMBLE_CHARS[randomIndex]
    })
    .join('')
}

const runScramble = () => {
  stopScramble()
  displayText.value = props.text

  let iteration = 0
  scrambleTimer = setInterval(() => {
    displayText.value = resolveScrambledText(props.text, iteration)

    if (iteration >= props.text.length) {
      displayText.value = props.text
      stopScramble()
      return
    }

    iteration += 1 / 3
  }, 30)
}

watch(
  () => [props.text, props.triggerSignal],
  () => {
    runScramble()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  stopScramble()
})
</script>

<style scoped lang="scss">
.profile-asset-holdings-scramble-text {
  display: inline-block;
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
}
</style>
