import { computed, reactive, ref } from 'vue'
import { createBroadcastEvent, createSingletonAgg } from 'vue-fn/domain'
import type { DomainDesigner } from '@ddd-tool/domain-designer-core'
import { nomnomlCodeGenerator } from './gen-code'

let agg: ReturnType<typeof createAgg>
interface FocusFlowFn {
  (workflow: null, userStory?: string): void
  (workflow: string, userStory: string): void
}

function createAgg(data: DomainDesigner) {
  return createSingletonAgg(() => {
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
    // const flows = computed(() => {
    //   return design.value._getContext().getWorkflows()
    // })
    // const currentFlow = ref(null as string | null)
    const currentStory = ref('【其他流程】')
    const currentWorkflow = ref<null | string>(null)
    const workflows = reactive(design.value._getContext().getWorkflows())
    const userStories = computed(() => {
      const result: Record<string, string[]> = {}
      const workflowsTmp = Object.keys(workflows).map((w) => w)
      for (const story in design.value._getContext().getUserStories()) {
        const values = design.value._getContext().getUserStories()[story]
        for (const f of values) {
          if (workflowsTmp.includes(f)) {
            workflowsTmp.splice(workflowsTmp.indexOf(f), 1)
          }
        }
        result[story] = values
      }
      result['【其他流程】'] = workflowsTmp
      return result
    })

    // ======================== 聚焦流程 ========================
    const onFocusFlow = createBroadcastEvent({
      userStory: '' as string,
      workflow: '' as string | null,
    })

    function focusFlow(workflow: null): void
    function focusFlow(workflow: string, userStory: string): void
    function focusFlow(
      workflow: string | null,
      userStory: string = '【其他流程】'
    ) {
      currentWorkflow.value = workflow
      currentStory.value = userStory
      onFocusFlow.publish({ userStory, workflow })
    }

    return {
      states: {
        code,
        userStories,
        workflows,
        currentWorkflow,
        currentStory,
      },
      commands: {
        focusFlow: focusFlow as FocusFlowFn,
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
