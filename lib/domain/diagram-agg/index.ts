import { computed, reactive, ref } from 'vue'
import { createBroadcastEvent, createSingletonAgg } from 'vue-fn/domain'
import type { DomainDesigner } from '@ddd-tool/domain-designer-core'
import { filterContext, nomnomlCodeGenerator } from './gen-code'
import { defaultRenderConfig, EMPTY_STORY, type EdgeType, type Ranker } from './define'
export { EMPTY_STORY }

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

    const renderConfig = reactive(defaultRenderConfig())

    // ======================== generating code ========================
    const linkReadModel = ref(true)
    const linkSystem = ref(true)
    const code = computed(() => {
      console.debug('generate nomnoml code')
      console.debug('current story', currentStory.value)
      if (!design.value) {
        return ''
      }
      const code: string[] = []
      const generator = nomnomlCodeGenerator({
        design: design.value,
        currentStory: currentStory.value,
        displayReadModel: linkReadModel.value,
        displaySystem: linkSystem.value,
      })
      let item = generator.next()
      while (!item.done) {
        code.push(item.value)
        item = generator.next()
      }
      return code.join('\n')
    })
    const currentStory = ref(EMPTY_STORY)
    const currentWorkflow = ref<string | undefined>()
    const workflows = computed(() => {
      if (!design.value) {
        return {}
      }
      return design.value._getContext().getWorkflows()
    })
    const userStories = computed(() => {
      if (!design.value) {
        return { [EMPTY_STORY]: [] }
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
      result[EMPTY_STORY] = workflowsTmp
      return result
    })

    // ======================== focus on workflow ========================
    const onFocusFlow = createBroadcastEvent({
      userStory: '' as string,
      workflow: '' as string | undefined,
      displayReadModel: linkReadModel,
      displaySystem: linkSystem,
    })

    function focusFlow(workflow: undefined): void
    function focusFlow(workflow: string, userStory: string): void
    function focusFlow(workflow: string | undefined, userStory: string = EMPTY_STORY) {
      currentStory.value = userStory
      if (
        userStory !== EMPTY_STORY &&
        (!workflow || !design.value?._getContext().getUserStories()[userStory].includes(workflow))
      ) {
        currentWorkflow.value = design.value?._getContext().getUserStories()[userStory][0] || undefined
      } else {
        currentWorkflow.value = workflow
      }
      onFocusFlow.publish({
        userStory,
        workflow: currentWorkflow.value,
        displayReadModel: linkReadModel.value,
        displaySystem: linkSystem.value,
      })
    }

    const workflowPlayInterval = ref(300)

    // ======================== focus on node ========================
    const currentNode = ref<string | undefined>()
    const onFocusNode = createBroadcastEvent({ id: '' as string | undefined })

    // ======================== export ========================
    const downloadEnabled = ref(true)
    const onDownloadSvg = createBroadcastEvent({})

    return {
      states: {
        renderConfig,
        design,
        designKeys,
        code,
        userStories,
        workflows,
        workflowPlayInterval,
        currentWorkflow,
        currentStory,
        currentDesignKey,
        currentNode,
        downloadEnabled,
        linkReadModel,
        linkSystem,
      },
      commands: {
        focusFlow: focusFlow as FocusFlowFn,
        downloadSvg() {
          onDownloadSvg.publish({})
        },
        filterContext() {
          return filterContext({
            design: design.value!,
            currentStory: currentStory.value,
            displayReadModel: linkReadModel.value,
            displaySystem: linkSystem.value,
          })
        },
        setRenderRanker(v: Ranker) {
          renderConfig.ranker = v
        },
        setRenderPadding(v: number) {
          if (v < 0) {
            throw new Error('RenderPadding must >= 0')
          }
          renderConfig.padding = v
        },
        setRenderFontSize(v: number) {
          renderConfig.fontSize = v
        },
        setRenderBendSize(v: number) {
          renderConfig.bendSize = v
        },
        setRenderEdgesType(v: EdgeType) {
          renderConfig.edges = v
        },
        setDownloadEnabled(b: boolean) {
          downloadEnabled.value = b
        },
        setWorkflowPlayInterval(i: number) {
          if (i >= 0) {
            workflowPlayInterval.value = i
          }
        },
        setDisplayReadModel(b: boolean) {
          linkReadModel.value = b
        },
        setDisplaySystem(b: boolean) {
          linkSystem.value = b
        },
        setCurrentNode(id: string | undefined) {
          currentNode.value = id
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
