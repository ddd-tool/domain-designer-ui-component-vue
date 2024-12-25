<script setup lang="ts">
import Nomnoml from '#lib/components/nomnoml/Index.vue'
import DragZoom from '#lib/components/drag-zoom/Index.vue'
import { useDiagramAgg } from '#domain/diagram-agg'
import Drawer from 'primevue/drawer'
import Select from 'primevue/select'
import Tabs from 'primevue/tabs'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import ToggleSwitch from 'primevue/toggleswitch'
import SelectButton from 'primevue/selectbutton'
import Divider from 'primevue/divider'
import Dock from 'primevue/dock'
import Fieldset from 'primevue/fieldset'
import Popover from 'primevue/popover'
import { computed, ref, watch } from 'vue'
import { useI18nAgg } from './domain/i18n-agg'
import type { DomainDesigner } from '@ddd-tool/domain-designer-core'
import { parseNode } from './ui'

export type NonEmptyObject<T extends object> = keyof T extends never ? never : T
interface Props {
  designs: NonEmptyObject<Record<string, DomainDesigner>>
}

const props = defineProps<Props>()

const i18nAgg = useI18nAgg()
const t = i18nAgg.commands.$t
const diagramAgg = useDiagramAgg(props.designs)

// =========================== Focus Node ===========================
let focusInfoTask = '0'
const nodeDetailCollapsed = ref(diagramAgg.states.currentNode.value === undefined)
watch(nodeDetailCollapsed, (v) => {
  if (v) {
    diagramAgg.commands.setCurrentNode(undefined)
  }
})
const currentNode = ref(diagramAgg.states.currentNode.value)
const nodeDetailVisible = computed(() => currentNode.value !== undefined)
const nodeDetail = computed(() => {
  if (!currentNode.value) {
    return parseNode(undefined)
  }
  const node = diagramAgg.states.design.value?._getContext().getIdMap()[currentNode.value]
  return parseNode(node)
})
diagramAgg.events.onFocusNode.watchPublish(({ data, version }) => {
  focusInfoTask = version
  if (data.id === undefined) {
    if (!nodeDetailVisible.value) {
      return
    }
    nodeDetailCollapsed.value = true
    setTimeout(() => {
      if (focusInfoTask === version) {
        currentNode.value = data.id
      }
    }, 500)
    return
  }
  currentNode.value = data.id
  setTimeout(() => {
    if (focusInfoTask === version) {
      nodeDetailCollapsed.value = false
    }
  }, 0)
})

// =========================== Help ===========================
const op = ref()
const toggle = (event: Event) => {
  op.value.toggle(event)
}

// =========================== Settings ===========================
const drawerVisible = ref(false)
const drawerType = ref<'UserStories' | 'Settings' | undefined>(undefined)
const displayReadModel = ref(diagramAgg.states.displayReadModel.value)
watch(displayReadModel, (v) => {
  diagramAgg.commands.setDisplayReadModel(v)
})
const displaySystem = ref(diagramAgg.states.displayReadModel.value)
watch(displaySystem, (v) => {
  diagramAgg.commands.setDisplaySystem(v)
})
const language = ref(i18nAgg.states.currentLanguage.value)
const languageOptions = ref([
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
])
watch(language, (v) => {
  i18nAgg.commands.setLanguage(v)
})
const currentDesignKey = ref(diagramAgg.states.currentDesignKey.value!)
watch(currentDesignKey, (v) => {
  handleNoFocus()
  diagramAgg.commands.switchDesign(v)
})
const designKeyOptions = computed(() => {
  const result: { label: string; value: string }[] = []
  for (const key of diagramAgg.states.designKeys.value) {
    result.push({ label: key, value: key })
  }
  return result
})

// =========================== User Stories ===========================
const currentStory = ref('Others')
const currentWorkflow = ref<undefined | string>()
const userStoriesOptions = computed(() => {
  const result: { name: string; code: string }[] = []
  for (const story in diagramAgg.states.userStories.value) {
    result.push({ name: story, code: story })
  }
  return result
})

// =========================== Dock ===========================
const dockItems = ref([
  {
    label: t('menu.replayWorkflow'),
    icon: 'pi pi-play-circle',
    disabled: computed(() => diagramAgg.states.currentWorkflow.value === undefined),
    command() {
      if (currentWorkflow.value === undefined) {
        diagramAgg.commands.focusFlow(currentWorkflow.value)
      } else {
        diagramAgg.commands.focusFlow(currentWorkflow.value, currentStory.value)
      }
    },
  },
  {
    label: t('menu.focusOnUserStory'),
    icon: 'pi pi-users',
    command() {
      drawerType.value = 'UserStories'
      drawerVisible.value = true
    },
  },
  {
    label: t('menu.settings'),
    icon: 'pi pi-cog',
    command() {
      drawerType.value = 'Settings'
      drawerVisible.value = true
    },
  },
  {
    label: t('menu.help'),
    icon: 'pi pi-question-circle',
    command(e: any) {
      toggle(e)
    },
  },
  {
    label: t('menu.exportSvg'),
    icon: 'pi pi-file-export',
    disabled: computed(() => !diagramAgg.states.downloadEnabled.value),
    command() {
      diagramAgg.commands.downloadSvg()
    },
  },
])
watch([currentStory, currentWorkflow], ([story, workflow]) => {
  if (workflow === undefined) {
    diagramAgg.commands.focusFlow(undefined)
    return
  }
  diagramAgg.commands.focusFlow(workflow!, story)
})
function handleNoFocus() {
  currentStory.value = 'Others'
  currentWorkflow.value = undefined
}
</script>

<template>
  <Dock :model="dockItems" position="right" style="position: fixed">
    <template #itemicon="{ item }">
      <Button
        v-tooltip.left="item.label"
        :disabled="(item.disabled as boolean)"
        :severity="item.disabled ? 'secondary' : 'info'"
        :icon="item.icon"
        :src="item.icon"
        @click="(e: Event) => item.command!(e as any)"
        style="width: 100%"
      ></Button>
    </template>
  </Dock>
  <Drawer
    v-model:visible="drawerVisible"
    v-if="drawerType === 'UserStories'"
    position="right"
    :header="t('menu.focusOnUserStory').value"
    style="width: 40%"
  >
    <Select
      v-model="currentStory"
      :options="userStoriesOptions"
      option-label="name"
      option-value="code"
      placeholder="Select a City"
    ></Select>
    <br />
    <Button :label="t('menu.focusOnUserStory.focusNothing').value" severity="info" @click="handleNoFocus"></Button>
    <Tabs v-model:value="currentStory" scrollable>
      <TabPanels>
        <TabPanel v-for="i in Object.keys(diagramAgg.states.userStories.value)" :key="i" :value="i">
          <div v-for="f of Object.values(diagramAgg.states.userStories.value[i])" :key="f">
            <RadioButton v-model="currentWorkflow" :inputId="f" :name="i" :value="f"></RadioButton>
            <label :for="f">{{ f }}</label>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Drawer>
  <Drawer
    v-model:visible="drawerVisible"
    v-if="drawerType === 'Settings'"
    position="right"
    :header="t('menu.settings').value"
    style="width: 40%"
  >
    <div>
      <ToggleSwitch v-model="displayReadModel" :true-value="true" :false-value="false" />
      <label> {{ t('menu.settings.renderReadModel') }} </label>
    </div>
    <div>
      <ToggleSwitch v-model="displaySystem" :true-value="true" :false-value="false" />
      <label> {{ t('menu.settings.renderExternalSystem') }} </label>
    </div>
    <Divider></Divider>
    <div>
      <label> {{ t('menu.settings.language') }} </label>
      <SelectButton
        v-model="language"
        :options="languageOptions"
        option-label="label"
        option-value="value"
      ></SelectButton>
    </div>
    <Divider></Divider>
    <div>
      <label> {{ t('menu.settings.dataSource') }} </label>
      <div v-for="(item, index) in designKeyOptions" :key="index">
        <RadioButton v-model="currentDesignKey" :input-id="item.value" :value="item.value"></RadioButton>
        <label :for="item.value"> {{ item.label }} </label>
      </div>
    </div>
  </Drawer>
  <DragZoom style="width: 100vw; height: 100vh">
    <Nomnoml />
  </DragZoom>
  <Fieldset
    v-show="nodeDetailVisible"
    v-model:collapsed="nodeDetailCollapsed"
    :toggleable="true"
    :legend="nodeDetail.name"
  >
    <h2>{{ nodeDetail.name }}: {{ nodeDetail.rule }}</h2>
    <Divider></Divider>
    <template v-if="nodeDetail.type">
      <h3>{{ t('constant.type') }}:</h3>
      <p>{{ nodeDetail.type }}</p>
    </template>
    <template v-if="nodeDetail.relatedTypes">
      <Divider></Divider>
      <h3>{{ t('constant.relatedTypes') }}:</h3>
      <p>{{ nodeDetail.relatedTypes }}</p>
      <Divider></Divider>
    </template>
    <h3>{{ t('constant.description') }}:</h3>
    <p :class="nodeDetail.desc ? 'desc' : ''">{{ nodeDetail.desc ?? `<${t('constant.empty').value}>` }}</p>
  </Fieldset>
  <Popover ref="op">
    <h3>缩放：</h3>
    <p>滚动鼠标滚轮</p>
    <h3>拖动画布：</h3>
    <p>按下鼠标中键 或者 按住空格+鼠标左键</p>
  </Popover>
</template>

<style>
.p-dock {
  opacity: 0.4;
  transition: 0.5s;
}
.p-dock:hover {
  opacity: 1;
}
.p-dock .p-dock-item:hover {
  scale: 1.1;
}
.p-fieldset {
  opacity: 0.9;
  white-space: pre-line;
  position: absolute;
  right: 4rem;
  top: 0;
  width: 30%;
}
.p-fieldset .desc::before {
  content: '';
  display: inline-block;
  height: 1rem;
  width: 0.5rem;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
  background-color: #4441ff;
}
</style>
