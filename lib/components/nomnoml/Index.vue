<script setup lang="ts">
import nomnoml from 'nomnoml'
import { ref, watchEffect } from 'vue'
import style from './style'
import { useDiagramAgg } from '#lib/domain/diagram-agg'

const diagramAgg = useDiagramAgg()

const svgCode = ref('')
watchEffect(() => {
  svgCode.value = nomnoml.renderSvg(style + diagramAgg.states.code.value)
})

// ============================ 聚焦流程/播放动画 ============================
let currentAnimationTask = 0
function startWorkflowAnimation(
  animationTask: number,
  nodes: readonly string[]
) {
  diagramAgg.commands.setDownloadEnabled(false)
  let t = 0
  for (let i = 0; i < nodes.length; i++) {
    const el = document.querySelector(
      `[data-name="${nodes[i]}"]`
    ) as SVGGElement
    setTimeout(() => {
      if (animationTask !== currentAnimationTask) return
      el.style.transition = `opacity 0s`
      el.style.opacity = '0.0'
      setTimeout(() => {
        if (animationTask !== currentAnimationTask) return
        el.style.transition = `opacity 0.5s`
        el.style.opacity = '1'
        if (i === nodes.length - 1) {
          diagramAgg.commands.setDownloadEnabled(true)
        }
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

// ============================ 下载 ============================
diagramAgg.events.onDownloadSvg.watchPublish(() => {
  const el = document.querySelector('svg') as SVGSVGElement
  const svg = new XMLSerializer().serializeToString(el)
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)
  const tempLink = document.createElement('a')
  tempLink.href = svgUrl
  tempLink.setAttribute('download', 'diagram.svg')
  tempLink.click()
  URL.revokeObjectURL(svgUrl)
})
</script>

<template>
  <div v-html="svgCode"></div>
</template>
