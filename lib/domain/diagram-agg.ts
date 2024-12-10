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
    // ======================== 生成代码 ========================
    const design = ref(data)
    const displayReadModel = ref(true)
    const displaySystem = ref(true)
    const code = computed(() => {
      console.debug('generate code')
      const code: string[] = []
      const generator = nomnomlCodeGenerator(
        design.value,
        displayReadModel.value,
        displaySystem.value
      )
      let item = generator.next()
      while (!item.done) {
        code.push(item.value)
        item = generator.next()
      }
      return code.join('\n')
    })
    const currentStory = ref('Others')
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
      result['Others'] = workflowsTmp
      return result
    })

    // ======================== 聚焦流程 ========================
    const onFocusFlow = createBroadcastEvent({
      userStory: '' as string,
      workflow: '' as string | null,
      displayReadModel,
      displaySystem,
    })

    function focusFlow(workflow: null): void
    function focusFlow(workflow: string, userStory: string): void
    function focusFlow(workflow: string | null, userStory: string = 'Others') {
      currentWorkflow.value = workflow
      currentStory.value = userStory
      onFocusFlow.publish({
        userStory,
        workflow,
        displayReadModel: displayReadModel.value,
        displaySystem: displaySystem.value,
      })
    }

    // ======================== 下载功能 ========================
    const downloadEnabled = ref(true)
    const onDownloadSvg = createBroadcastEvent({})

    return {
      states: {
        code,
        userStories,
        workflows,
        currentWorkflow,
        currentStory,
        downloadEnabled,
        displayReadModel,
        displaySystem,
      },
      commands: {
        focusFlow: focusFlow as FocusFlowFn,
        downloadSvg() {
          onDownloadSvg.publish({})
        },
        setDownloadEnabled(b: boolean) {
          downloadEnabled.value = b
        },
        setDisplayReadModel(b: boolean) {
          displayReadModel.value = b
        },
        setDisplaySystem(b: boolean) {
          displaySystem.value = b
        },
        getIdMap() {
          return design.value._getContext().getIdMap()
        },
      },
      events: { onFocusFlow, onDownloadSvg },
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
