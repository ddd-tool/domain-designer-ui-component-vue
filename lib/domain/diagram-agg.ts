import { computed, ref } from 'vue'
import { createBroadcastEvent, createSingletonAgg } from 'vue-fn/domain'
import type { DomainDesigner } from '@ddd-tool/domain-designer-core'
import { nomnomlCodeGenerator } from './gen-code'

let agg: ReturnType<typeof createAgg>

function createAgg(data: DomainDesigner) {
  return createSingletonAgg((context) => {
    const design = ref(data)
    const code = computed(() => {
      const code: string[] = []
      const generator = nomnomlCodeGenerator(design.value)
      let item = generator.next()
      while (!item.done) {
        code.push(item.value)
        item = generator.next()
      }
      design.value._getContext
      return code.join('\n')
    })
    const flows = computed(() => {
      return design.value._getContext().getFlows()
    })
    const currentFlow = ref(null as string | null)
    const onFocusFlow = createBroadcastEvent({ key: '' as string | null })

    return {
      states: {
        code,
        flows,
        currentFlow,
      },
      commands: {
        focusFlow: (key: string | null) => {
          console.log('focusFlow', key)
          currentFlow.value = key
          onFocusFlow.publish({ key })
        },
      },
      events: { onFocusFlow },
    }
  })
}

export function useDiagramAgg(data?: DomainDesigner) {
  if (!agg) {
    if (!data) {
      throw new Error('need data')
    }
    agg = createAgg(data)
  }
  return agg.api
}
