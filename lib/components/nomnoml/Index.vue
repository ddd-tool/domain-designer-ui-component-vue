<script setup lang="ts">
import nomnoml from 'nomnoml'
import { nextTick, ref, watchEffect } from 'vue'
import style from './style'
import { useDiagramAgg } from '#lib/domain/diagram-agg'

const diagramAgg = useDiagramAgg()
const source = diagramAgg.states.code

const svgCode = ref('')
watchEffect(() => {
  svgCode.value = nomnoml.renderSvg(style + source.value)
  // nextTick(() => {
  //   const dom = document.querySelector('svg')
  //   dom!.onclick = function (e: MouseEvent) {
  //     const tar = e.target as SVGSVGElement | undefined
  //     if (!tar) {
  //       return
  //     }
  //     const attributes: Record<string, any> =
  //       tar?.closest?.('g[data-name]')?.attributes || {}
  //     if (!attributes['data-name']) {
  //       return
  //     }
  //     console.log(attributes['data-name'])
  //   }
  // })
})
diagramAgg.events.onFocusFlow.watchPublish(({ data }) => {
  const items = data.key === null ? [] : diagramAgg.states.flows.value[data.key]
  console.log('触发')

  const doms = document.querySelectorAll('g')
  for (const dom of doms) {
    const dataName = dom.dataset.name
    if (!dataName) {
      continue
    } else if (items.length === 0) {
      dom.style.opacity = '1'
      continue
    }
    if (items.includes(dataName)) {
      dom.style.opacity = '1'
    } else if (dataName) {
      dom.style.opacity = '0.5'
    }
  }
})
</script>

<template>
  <div v-html="svgCode"></div>
</template>
