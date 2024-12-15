import { useDiagramAgg } from '#lib/domain/diagram-agg'
import type { DomainDesignInfo, DomainDesignInfoType } from '@ddd-tool/domain-designer-core'

const RULES = Object.freeze(['Command', 'FacadeCommand', 'Event', 'Agg', 'ReadModel'] as const)
type ClassNodeLike = {
  _attributes: {
    __code: string
    rule: (typeof RULES)[number]
  }
  inner: Record<string, DomainDesignInfo<DomainDesignInfoType, string>>
}
function isClassNodeLike(node: any): node is ClassNodeLike {
  return (
    typeof node === 'object' &&
    typeof node.inner === 'object' &&
    typeof node._attributes === 'object' &&
    RULES.includes(node._attributes.rule)
  )
}

export function preprocessSvg(diagramAgg: ReturnType<typeof useDiagramAgg>, domStr: string): HTMLElement {
  const parser = new DOMParser()
  if (/^\s+$/.test(domStr)) {
    return document.createElement('svg')
  }
  const svgDoc = parser.parseFromString(domStr, 'image/svg+xml')
  const context = diagramAgg.states.design.value?._getContext()!
  for (const node of Object.values(context.getIdMap())) {
    if (!isClassNodeLike(node)) {
      continue
    }
    const nodeDoc = svgDoc.querySelector(`[data-name="${node._attributes.__code}"]`)! as HTMLElement
    let index = 0
    for (const key of Object.keys(node.inner)) {
      index++
      const infoCode = (node.inner[key] as DomainDesignInfo<DomainDesignInfoType, string>)._attributes.__code
      const infoDoc = nodeDoc.querySelector(`[data-compartment="${index}"]`)! as HTMLElement
      infoDoc.dataset.code = infoCode
      setTimeout(() => {
        infoDoc.onmouseover = () => {
          for (const el of document.body.querySelectorAll(`[data-code="${infoCode}"]`)) {
            console.debug('highlight', el)
            el.classList.add('highlight')
          }
        }
        infoDoc.onmouseout = () => {
          for (const el of document.body.querySelectorAll(`[data-code="${infoCode}"]`)) {
            el.classList.remove('highlight')
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
