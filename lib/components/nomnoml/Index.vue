<script setup lang="ts">
import nomnoml from 'nomnoml'
import { ref, watchEffect } from 'vue'
import style from './style'
import { useDiagramAgg } from '#lib/domain/diagram-agg'

const diagramAgg = useDiagramAgg()
const source = diagramAgg.states.code

const svgCode = ref('')
watchEffect(() => {
  svgCode.value = nomnoml.renderSvg(style + source.value)
})
diagramAgg.events.onFocusFlow.watchPublish(({ data }) => {
  const items: readonly string[] =
    data.workflow === null ? [] : diagramAgg.states.workflows[data.workflow]
  console.log('触发')

  const doms = document.querySelectorAll('g')
  for (const dom of doms) {
    const dataName = dom.dataset.name
    if (!dataName) {
      continue
    } else if (items.length === 0) {
      dom.style.transition = 'opacity 0.5s'
      dom.style.opacity = '1'
      continue
    }
    if (items.includes(dataName)) {
      dom.style.transition = 'opacity 0.5s'
      dom.style.opacity = '1'
    } else if (dataName) {
      dom.style.transition = 'opacity 0.5s'
      dom.style.opacity = '0.5'
    }
  }
})
</script>

<template>
  <div v-html="svgCode"></div>
</template>
