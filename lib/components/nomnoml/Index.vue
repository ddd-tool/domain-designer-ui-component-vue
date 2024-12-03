<script setup lang="ts">
import nomnoml from 'nomnoml'
import { nextTick, ref, watchEffect } from 'vue'

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
})

const svgCode = ref('')
watchEffect(() => {
  svgCode.value = nomnoml.renderSvg(props.source)
  nextTick(() => {
    const dom = document.querySelector('svg')
    dom!.onclick = function (e: MouseEvent) {
      const tar = e.target as SVGSVGElement | undefined
      if (!tar) {
        return
      }
      const attributes: Record<string, any> =
        tar?.closest?.('g[data-name]')?.attributes || {}
      if (!attributes['data-name']) {
        return
      }
      console.log(attributes['data-name'])
    }
  })
})
</script>

<template>
  <div v-html="svgCode"></div>
</template>
