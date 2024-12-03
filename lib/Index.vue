<script setup lang="ts">
import Nomnoml from '#lib/components/nomnoml/Index.vue'
import { useDiagramAgg } from '#domain/diagram-agg'
import { watch } from 'vue'

const props = defineProps({
  diagramId: {
    type: String,
    default: 'default',
  },
  design: {
    type: Object,
    required: true,
  },
})

let diagramAgg = useDiagramAgg(props.diagramId, props.design as any)
let sourceCode = diagramAgg.states.code
watch(
  () => props.diagramId,
  (v) => {
    diagramAgg = useDiagramAgg(v)
    sourceCode = diagramAgg.states.code
  }
)
</script>

<template>
  <Nomnoml :source="sourceCode" />
</template>

<style scoped>
.container {
  width: auto;
  height: auto;
}
</style>
