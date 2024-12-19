import { isClassNodeLike, isNodeLike } from '#lib/domain/common'
import { useDiagramAgg } from '#lib/domain/diagram-agg'
import type { DomainDesignInfo, DomainDesignInfoType } from '@ddd-tool/domain-designer-core'

export function preprocessSvg(diagramAgg: ReturnType<typeof useDiagramAgg>, domStr: string): HTMLElement {
  const parser = new DOMParser()
  if (/^\s+$/.test(domStr)) {
    return document.createElement('svg')
  }
  const svgDoc = parser.parseFromString(domStr, 'image/svg+xml')
  const context = diagramAgg.states.design.value?._getContext()!
  for (const node of Object.values(context.getIdMap())) {
    if (!isNodeLike(node)) {
      continue
    }
    const nodeDoc = svgDoc.querySelector(`[data-name="${node._attributes.__id}"]`)! as HTMLElement
    if (!nodeDoc) {
      continue
    }
    let index = 0
    for (const p of nodeDoc.querySelectorAll('path')) {
      if (index !== 0) {
        p.setAttribute('stroke-width', '1')
      }
      index++
    }
    const nodeTitle = nodeDoc.querySelector('[data-compartment="0"]')! as HTMLElement
    nodeTitle.onmouseover = () => {
      nodeTitle.parentElement!.classList.add('highlight-node')
    }
    nodeTitle.onmouseout = () => {
      nodeTitle.parentElement!.classList.remove('highlight-node')
    }
    if (!isClassNodeLike(node)) {
      continue
    }
    index = 0
    for (const key of Object.keys(node.inner)) {
      index++
      const infoId = (node.inner[key] as DomainDesignInfo<DomainDesignInfoType, string>)._attributes.__id
      const infoDoc = nodeDoc.querySelector(`[data-compartment="${index}"]`)! as HTMLElement
      infoDoc.dataset.id = infoId
      {
        const text = infoDoc.querySelector('text')!
        text.setAttribute('font-family', 'Monaco, consolas')
        text.setAttribute('font-size', '0.99rem')
      }

      setTimeout(() => {
        infoDoc.onmouseover = () => {
          for (const el of document.body.querySelectorAll(`[data-id="${infoId}"]`)) {
            console.debug('highlight-info', (el as HTMLElement).dataset.id)
            el.classList.add('highlight-info')
          }
        }
        infoDoc.onclick = (evt: MouseEvent) => {
          evt.stopPropagation()
          const tar = (evt.target as HTMLElement).parentNode!.parentNode! as HTMLElement
          console.debug('click target', tar)
          const needActive = !tar.classList.contains('active')
          if (needActive) {
            diagramAgg.commands.setCurrentInfo(infoId)
          } else {
            diagramAgg.commands.setCurrentInfo(undefined)
          }
          for (const el of document.body.querySelectorAll(`[data-id]`)) {
            if ((el as HTMLElement).dataset.id === infoId && needActive) {
              el.classList.add('active')
            } else {
              el.classList.remove('active')
            }
          }
        }
        infoDoc.onmouseout = () => {
          for (const el of document.body.querySelectorAll(`[data-id="${infoId}"]`)) {
            el.classList.remove('highlight-info')
          }
        }
      })
    }
  }

  let svg: HTMLElement | Element | null = svgDoc.querySelector('*')
  if (!svg) {
    return document.createElement('svg')
  }
  return svg as HTMLElement
}
