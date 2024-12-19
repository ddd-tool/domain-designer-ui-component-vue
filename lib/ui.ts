import {
  isDomainDesignInfo,
  type DomainDesignDesc,
  type DomainDesignInfo,
  type DomainDesignInfoType,
} from '@ddd-tool/domain-designer-core'
import { useI18nAgg } from './domain/i18n-agg'
import { isNodeLike } from './domain/common'

export type NodeDetail = {
  rule: string
  name: string
  type: string
  subtype?: string
  desc: string
}

const t = useI18nAgg().commands.$t

export function parseNode(node?: object): NodeDetail {
  if (!node || typeof node !== 'object') {
    return {
      rule: 'Unknown',
      name: 'Unknown',
      type: 'Unknown',
      subtype: 'Unknown',
      desc: 'Unknown',
    }
  }

  let detail: NodeDetail = {
    rule: '',
    name: '',
    type: '',
    subtype: '',
    desc: '',
  }
  detail = parseInfo(node, detail)
  detail = parseOthers(node, detail)
  return detail
}

function parseOthers(node: object, detail: NodeDetail): NodeDetail {
  if (detail.rule) {
    return detail
  }
  if (isNodeLike(node)) {
    detail.rule = node._attributes.rule
    detail.name = node._attributes.name
    detail.subtype = undefined
    detail.desc = descriptionToCode(node._attributes.description)
  }
  return detail
}

function parseInfo(node: object, detail: NodeDetail): NodeDetail {
  if (!isDomainDesignInfo(node)) {
    return detail
  }
  const info = node as DomainDesignInfo<DomainDesignInfoType, string>

  const type = info._attributes.type
  let typeStr = ''
  let subtype: string[] = []
  if (type === 'Document') {
    typeStr = t('constant.type.document').value
  } else if (type === 'Function') {
    typeStr = t('constant.type.function').value
    subtype = (info as DomainDesignInfo<'Function', string>)._attributes.subtype.map((i) => i._attributes.name)
  } else if (type === 'Id') {
    typeStr = t('constant.type.id').value
  } else if (type === 'ValueObject') {
    typeStr = t('constant.type.valueObject').value
    subtype = (info as DomainDesignInfo<'Function', string>)._attributes.subtype.map((i) => i._attributes.name)
  } else if (type === 'Version') {
    typeStr = t('constant.type.version').value
  } else {
    isNever(type)
  }
  if (subtype.length === 0) {
    subtype = [`<${t('constant.empty').value}>`]
  }
  detail.rule = 'Info'
  detail.name = info._attributes.name
  detail.type = typeStr
  detail.subtype = subtype.join(', ')
  detail.desc = descriptionToCode(info._attributes.description)
  return detail
}

function descriptionToCode(description?: DomainDesignDesc): string {
  if (!description) {
    return `<${t('constant.empty').value}>`
  }
  const templates = description._attributes.template
  const values = description._attributes.values
  return templates.reduce((result, str, i) => {
    const value = values[i] ? `<${values[i]._attributes.name}>` : ''
    return result + str + value
  }, '')
}
