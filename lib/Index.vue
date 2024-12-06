<script setup lang="ts">
import Nomnoml from '#lib/components/nomnoml/Index.vue'
import type { DomainDesigner } from '@ddd-tool/domain-designer-core'
import { useDiagramAgg } from '#domain/diagram-agg'
import { ref } from 'vue'

const props = defineProps({
  design: {
    type: Object,
    required: true,
    validator: (v: any): v is DomainDesigner => {
      return true
    },
  },
})

const diagramAgg = useDiagramAgg(props.design as any)
const sourceCode = diagramAgg.states.code
const flows = diagramAgg.states.flows
</script>

<template>
  <div class="flows">
    <button
      @click="diagramAgg.commands.focusFlow(null)"
      :class="`focus-all-btn ${
        diagramAgg.states.currentFlow.value === null ? 'focus' : ''
      }`"
    >
      【聚焦整体】
    </button>
    <button
      v-for="(_, key) in flows"
      :key="key"
      @click="diagramAgg.commands.focusFlow(key)"
      :class="`focus-btn ${
        diagramAgg.states.currentFlow.value === key ? 'focus' : ''
      }`"
    >
      {{ key }}
    </button>
  </div>
  <Nomnoml :source="sourceCode" />
</template>

<style scoped>
.container {
  width: auto;
  height: auto;
}
.flows {
  border: 1px solid #000;
  box-shadow: 0 0 10px #000;
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 0;
}
button {
  border: none;
  background-color: #eee;
}
button:hover {
  background-color: #fff;
}
.focus {
  background-color: lightblue !important;
}
.focus-all-btn {
  font-weight: bold;
}
</style>
