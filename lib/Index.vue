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
import Dock from 'primevue/dock'
import { ref, watch } from 'vue'

const props = defineProps({
  design: {
    type: Object,
    required: true,
  },
})

const dockItems = ref([
  {
    label: '播放',
    icon: 'pi pi-play-circle',
    command() {
      if (currentWorkflow.value === null) {
        diagramAgg.commands.focusFlow(currentWorkflow.value)
      } else {
        diagramAgg.commands.focusFlow(currentWorkflow.value, currentStory.value)
      }
    },
  },
  {
    label: '用户故事',
    icon: 'pi pi-users',
    command() {
      drawerVisible.value = true
    },
  },
])
const drawerVisible = ref(false)
const diagramAgg = useDiagramAgg(props.design as any)
const sourceCode = diagramAgg.states.code
const currentStory = ref('【其他流程】')
const currentWorkflow = ref<null | string>(null)
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
        v-tooltip.top="item.label"
        :icon="item.icon"
        :src="item.icon"
        @click="(e: Event) => item.command!(e as any)"
        style="width: 100%"
      ></Button>
    </template>
  </Dock>
  <Drawer
    v-model:visible="drawerVisible"
    position="right"
    header="用户故事"
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
