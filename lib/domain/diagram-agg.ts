import { computed, ref } from 'vue'
import { createMultiInstanceAgg } from 'vue-fn/domain'
import { createDomainDesigner } from 'vue-fn/domain-design'
import { nomnomlCodeGenerator } from './gen-code'
import style1 from './style1'

const aggMap: Record<string, ReturnType<typeof createAgg>> = {}

function createAgg(id: string, data: ReturnType<typeof createDomainDesigner>) {
  return createMultiInstanceAgg(id, (context) => {
    context.onScopeDispose(() => {
      delete aggMap[id]
    })
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

    return {
      states: {
        code: computed(() => {
          return style1 + code.value
        }),
      },
      commands: {},
      events: {},
    }
  })
}

export function useDiagramAgg(
  id: string,
  data?: ReturnType<typeof createDomainDesigner>
) {
  if (!aggMap[id]) {
    if (!data) {
      throw new Error('data is required')
    }
    aggMap[id] = createAgg(id, data)
  }
  return aggMap[id].api
}
