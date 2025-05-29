import { watch } from 'vue'
import { DiagramPluginHelper } from '.'
import { defaultRenderConfig, type RenderConfig } from './define'

export const DIAGRAM_STORAGE_PLUGIN = DiagramPluginHelper.createSetupPlugin(() => {
  return {
    mount({ api }) {
      console.debug('加载diagram存储插件')
      const defRenderConfig = defaultRenderConfig()
      const existRenderConfig = localStorage.getItem('diagram-render-config')
      if (existRenderConfig) {
        const { ranker, padding, fontSize, edges, bendSize } = JSON.parse(existRenderConfig) as RenderConfig
        api.commands.setRenderBendSize(bendSize || defRenderConfig.bendSize)
        api.commands.setRenderEdgesType(edges || defRenderConfig.edges)
        api.commands.setRenderFontSize(fontSize || defRenderConfig.fontSize)
        api.commands.setRenderPadding(padding || defRenderConfig.padding)
        api.commands.setRenderRanker(ranker || defRenderConfig.ranker)
      }
      watch(api.states.renderConfig, () => {
        localStorage.setItem('diagram-render-config', JSON.stringify(api.states.renderConfig))
      })
    },
  }
})
