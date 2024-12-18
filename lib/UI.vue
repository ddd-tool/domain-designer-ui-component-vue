<script setup lang="ts">
import Nomnoml from '#lib/components/nomnoml/Index.vue'
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
import Slider from 'primevue/slider'
import Fieldset from 'primevue/fieldset'
import { computed, ref, watch } from 'vue'
import { useI18nAgg } from './domain/i18n-agg'
import type { DomainDesigner, DomainDesignInfo, DomainDesignInfoType } from '@ddd-tool/domain-designer-core'
import { parseInfo } from './ui'

export type NonEmptyObject<T extends object> = keyof T extends never ? never : T
interface Props {
  designs: NonEmptyObject<Record<string, DomainDesigner>>
}

const props = defineProps<Props>()

const i18nAgg = useI18nAgg()
const t = i18nAgg.commands.$t
const diagramAgg = useDiagramAgg(props.designs)

// =========================== Focus Info ===========================
let focusInfoTask = '0'
const infoDetailCollapsed = ref(diagramAgg.states.currentInfo.value === undefined)
watch(infoDetailCollapsed, (v) => {
  if (v) {
    diagramAgg.commands.setCurrentInfo(undefined)
  }
})
const currentInfo = ref(diagramAgg.states.currentInfo.value)
const infoDetailVisible = computed(() => currentInfo.value !== undefined)
const infoDetail = computed(() => {
  if (!currentInfo.value) {
    return parseInfo(undefined)
  }
  const info = diagramAgg.states.design.value?._getContext().getIdMap()[currentInfo.value] as DomainDesignInfo<
    DomainDesignInfoType,
    string
  >
  return parseInfo(info)
})
diagramAgg.events.onFocusInfo.watchPublish(({ data, version }) => {
  focusInfoTask = version
  if (data.id === undefined) {
    if (!infoDetailVisible.value) {
      return
    }
    infoDetailCollapsed.value = true
    setTimeout(() => {
      if (focusInfoTask === version) {
        currentInfo.value = data.id
      }
    }, 500)
    return
  }
  currentInfo.value = data.id
  setTimeout(() => {
    if (focusInfoTask === version) {
      infoDetailCollapsed.value = false
    }
  }, 0)
})

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
const renderScale = ref(diagramAgg.states.renderScale.value)
watch(renderScale, (v) => {
  diagramAgg.commands.setRenderScale(v)
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
    <label>缩放: {{ renderScale * 100 + '%' }}</label>
    <Slider v-model="renderScale" :step="0.1" :min="0.5" :max="1"></Slider>
    <Divider></Divider>
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
  <Nomnoml />
  <Fieldset
    v-show="infoDetailVisible"
    v-model:collapsed="infoDetailCollapsed"
    :toggleable="true"
    style="position: absolute; right: 1.5rem; top: 0; width: 30%"
    :legend="infoDetail.name"
  >
    <h2>{{ infoDetail.name }}</h2>
    <Divider></Divider>
    <h3>{{ t('constant.type') }}:</h3>
    <p>{{ infoDetail.type }}</p>
    <Divider></Divider>
    <h3>{{ t('constant.subtype') }}:</h3>
    <p>{{ infoDetail.subtype }}</p>
    <Divider></Divider>
    <h3>{{ t('constant.description') }}:</h3>
    <p>{{ infoDetail.desc }}</p>
  </Fieldset>
</template>

<style scoped>
.container {
  width: auto;
  height: auto;
}
.focus-all-btn {
  font-weight: bold;
}
</style>
