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
let currentAnimationTask = 0
function startWorkflowAnimation(
  animationTask: number,
  nodes: readonly string[]
) {
  let t = 0
  for (const node of nodes) {
    const el = document.querySelector(`[data-name="${node}"]`) as SVGGElement
    setTimeout(() => {
      if (animationTask !== currentAnimationTask) return
      el.style.transition = `opacity 0s`
      el.style.opacity = '0.0'
      setTimeout(() => {
        if (animationTask !== currentAnimationTask) return
        el.style.transition = `opacity 0.5s`
        el.style.opacity = '1'
      }, 100)
    }, t)
    t += 500
  }
}
diagramAgg.events.onFocusFlow.watchPublish(({ data }) => {
  const items: readonly string[] =
    data.workflow === null ? [] : diagramAgg.states.workflows[data.workflow]
  const map: Record<string, boolean> = {}

  const doms = document.querySelectorAll('g')
  if (items.length === 0) {
    for (const dom of doms) {
      dom.style.transition = 'opacity 0s'
      dom.style.opacity = '1'
    }
    return
  }
  for (const dom of doms) {
    const dataName = dom.dataset.name
    if (!dataName || map[dataName]) {
      continue
    }
    dom.style.transition = 'opacity 0s'
    dom.style.opacity = '0.1'
    map[dataName] = true
  }
  setTimeout(() => {
    startWorkflowAnimation(++currentAnimationTask, items)
  })
})
</script>

<template>
  <div v-html="svgCode"></div>
</template>
