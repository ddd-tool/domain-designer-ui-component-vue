import { computed, ref } from 'vue'
import { createBroadcastEvent, createSingletonAgg } from 'vue-fn/domain'
import type { DomainDesigner } from '@ddd-tool/domain-designer-core'
import { nomnomlCodeGenerator } from './gen-code'

let agg: ReturnType<typeof createAgg>
interface FocusFlowFn {
  (workflow: undefined, userStory?: string): void
  (workflow: string, userStory: string): void
}

function createAgg(data: Record<string, DomainDesigner>) {
  return createSingletonAgg(() => {
    const designRecords = ref(data)
    const currentDesignKey = ref(Object.keys(data).length ? Object.keys(data)[0] : undefined)
    const design = computed(() => {
      if (!currentDesignKey.value) {
        return undefined
      }
      return designRecords.value[currentDesignKey.value]
    })
    const designKeys = computed(() => {
      if (!currentDesignKey.value) {
        return []
      }
      return Object.keys(designRecords.value)
    })

    // ======================== generating code ========================
    const displayReadModel = ref(true)
    const displaySystem = ref(true)
    const code = computed(() => {
      console.debug('generate code')
      if (!design.value) {
        return ''
      }
      const code: string[] = []
      const generator = nomnomlCodeGenerator(design.value, displayReadModel.value, displaySystem.value)
      let item = generator.next()
      while (!item.done) {
        code.push(item.value)
        item = generator.next()
      }
      return code.join('\n')
    })
    const currentStory = ref('Others')
    const currentWorkflow = ref<string | undefined>()
    const workflows = computed(() => {
      if (!design.value) {
        return {}
      }
      return design.value._getContext().getWorkflows()
    })
    const userStories = computed(() => {
      if (!design.value) {
        return { Others: [] }
      }

      const result: Record<string, string[]> = {}
      const workflowsTmp = Object.keys(workflows.value).map((w) => w)
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

    // ======================== focus on workflow ========================
    const onFocusFlow = createBroadcastEvent({
      userStory: '' as string,
      workflow: '' as string | undefined,
      displayReadModel,
      displaySystem,
    })

    function focusFlow(workflow: undefined): void
    function focusFlow(workflow: string, userStory: string): void
    function focusFlow(workflow: string | undefined, userStory: string = 'Others') {
      currentWorkflow.value = workflow
      currentStory.value = userStory
      onFocusFlow.publish({
        userStory,
        workflow,
        displayReadModel: displayReadModel.value,
        displaySystem: displaySystem.value,
      })
    }

    // ======================== focus on node ========================
    const currentNode = ref<string | undefined>()
    const onFocusNode = createBroadcastEvent({ id: '' as string | undefined })

    // ======================== export ========================
    const downloadEnabled = ref(true)
    const onDownloadSvg = createBroadcastEvent({})

    return {
      states: {
        design,
        designKeys,
        code,
        userStories,
        workflows,
        currentWorkflow,
        currentStory,
        currentDesignKey,
        currentNode,
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
        setCurrentNode(id: string | undefined) {
          onFocusNode.publish({ id })
        },
        switchDesign(key: string) {
          currentDesignKey.value = key
        },
        getIdMap() {
          if (!design.value) {
            return {}
          }
          return design.value._getContext().getIdMap()
        },
      },
      events: { onFocusNode, onFocusFlow, onDownloadSvg },
    }
  })
}

export function useDiagramAgg(data?: Record<string, DomainDesigner>) {
  if (!agg) {
    if (!data) {
      throw new Error('need data')
    }
    agg = createAgg(data)
  }
  return agg.api
}
