<script setup lang="ts">
import Nomnoml from '#lib/components/nomnoml/Index.vue'
import { useDiagramAgg } from '#domain/diagram-agg'
import Drawer from 'primevue/drawer'
import Tabs from 'primevue/tabs'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import ToggleSwitch from 'primevue/toggleswitch'
import Dock from 'primevue/dock'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  design: {
    type: Object,
    required: true,
  },
})

const diagramAgg = useDiagramAgg(props.design as any)

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

const sourceCode = diagramAgg.states.code
const currentStory = ref('【其他流程】')
const currentWorkflow = ref<null | string>(null)
const dockItems = ref([
  {
    label: '播放选定流程',
    icon: 'pi pi-play-circle',
    disabled: computed(() => diagramAgg.states.currentWorkflow.value === null),
    command() {
      if (currentWorkflow.value === null) {
        diagramAgg.commands.focusFlow(currentWorkflow.value)
      } else {
        diagramAgg.commands.focusFlow(currentWorkflow.value, currentStory.value)
      }
    },
  },
  {
    label: '聚焦用户故事',
    icon: 'pi pi-users',
    command() {
      drawerType.value = 'UserStories'
      drawerVisible.value = true
    },
  },
  {
    label: '设置',
    icon: 'pi pi-cog',
    command() {
      drawerType.value = 'Settings'
      drawerVisible.value = true
    },
  },
  {
    label: '导出当前视图',
    icon: 'pi pi-file-export',
    disabled: computed(() => !diagramAgg.states.downloadEnabled.value),
    command() {
      diagramAgg.commands.downloadSvg()
    },
  },
])
watch([currentStory, currentWorkflow], ([story, workflow]) => {
  if (workflow === null) {
    diagramAgg.commands.focusFlow(null)
    return
  }
  diagramAgg.commands.focusFlow(workflow, story)
})
function handleNoFocus() {
  currentStory.value = '【其他流程】'
  currentWorkflow.value = null
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
    header="聚焦用户故事"
    style="width: 40%"
  >
    <Button label="无焦点" severity="info" @click="handleNoFocus"></Button>
    <Tabs v-model:value="currentStory" scrollable>
      <TabList>
        <Tab
          v-for="i in Object.keys(diagramAgg.states.userStories.value)"
          :key="i"
          :value="i"
          >{{ i }}</Tab
        >
      </TabList>
      <TabPanels>
        <TabPanel
          v-for="i in Object.keys(diagramAgg.states.userStories.value)"
          :key="i"
          :value="i"
        >
          <div v-for="f in diagramAgg.states.userStories.value[i]" :key="f">
            <RadioButton
              v-model="currentWorkflow"
              :inputId="f"
              :name="i"
              :value="f"
            ></RadioButton>
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
    header="设置"
    style="width: 40%"
  >
    <div>
      <ToggleSwitch
        v-model="displayReadModel"
        :true-value="true"
        :false-value="false"
      />
      <label> 渲染读模型 </label>
    </div>
    <div>
      <ToggleSwitch
        v-model="displaySystem"
        :true-value="true"
        :false-value="false"
      />
      <label> 渲染外部系统 </label>
    </div>
  </Drawer>
  <Nomnoml :source="sourceCode" />
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
