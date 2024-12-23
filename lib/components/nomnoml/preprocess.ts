import { isClassNodeLike, isNodeLike } from '#lib/domain/common'
import { useDiagramAgg } from '#lib/domain/diagram-agg'
import type { DomainDesignDesc, DomainDesignInfo, DomainDesignInfoType } from '@ddd-tool/domain-designer-core'

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

    // =========================== common styles ============================
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

    // =========================== description ============================
    if (node._attributes.description) {
      const descDocs = nodeDoc.querySelectorAll(
        `text[data-compartment="${node.inner ? Object.keys(node.inner).length + 1 : 1}"]`
      ) as unknown as HTMLElement[]
      handleDesc(diagramAgg, descDocs, node._attributes.description)
    }

    if (!isClassNodeLike(node)) {
      continue
    }

    // =========================== info ============================
    index = 0
    for (const key of Object.keys(node.inner)) {
      index++
      const infoId = (node.inner[key] as DomainDesignInfo<DomainDesignInfoType, string>)._attributes.__id
      const infoDoc = nodeDoc.querySelector(`[data-compartment="${index}"]`)! as HTMLElement
      infoDoc.dataset.id = infoId
      {
        const text = infoDoc.querySelector('text')!
        text.setAttribute('font-family', 'Monaco, Fira Code, consolas')
        text.setAttribute('font-size', '0.98rem')
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
            diagramAgg.commands.setCurrentNode(infoId)
          } else {
            diagramAgg.commands.setCurrentNode(undefined)
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

function handleDesc(diagramAgg: ReturnType<typeof useDiagramAgg>, els: HTMLElement[], desc: DomainDesignDesc) {
  if (!desc || !els) {
    return ''
  }
  out: for (const i of desc._attributes.values) {
    const name = i._attributes.name
    const id = i._attributes.__id
    for (const el of els) {
      if (el.innerHTML.includes(`&lt;${name}&gt;`)) {
        el.innerHTML = el.innerHTML.replace(`&lt;${name}&gt;`, `&lt;<tspan data-id="${id}">${name}</tspan>&gt;`)
        continue out
      } else {
        continue
      }
    }
  }
  setTimeout(() => {
    for (const i of desc._attributes.values) {
      const id = i._attributes.__id
      const descs = document.body.querySelectorAll(
        `[data-compartment] [data-id="${id}"]`
      ) as unknown as SVGTSpanElement[]
      for (const desc of descs) {
        if (desc.onmouseover) {
          continue
        }
        desc.onclick = (evt: MouseEvent) => {
          const tar = evt.target as HTMLElement
          const needActive = !tar.classList.contains('active')
          console.debug(tar)
          if (needActive) {
            diagramAgg.commands.setCurrentNode(id)
          } else {
            diagramAgg.commands.setCurrentNode(undefined)
          }
          for (const el of document.body.querySelectorAll(`[data-id]`)) {
            if ((el as HTMLElement).dataset.id === id && needActive) {
              el.classList.add('active')
            } else {
              el.classList.remove('active')
            }
          }
        }
        desc.onmouseover = () => {
          desc.classList.add('highlight-desc')
        }
        desc.onmouseout = () => {
          desc.classList.remove('highlight-desc')
        }
      }
    }
  })
}
