import type { DomainDesignDesc, DomainDesignInfo, DomainDesignInfoType } from '@ddd-tool/domain-designer-core'
import { useI18nAgg } from './domain/i18n-agg'

export type InfoDetail = {
  name: string
  type: string
  subtype: string
  desc: string
}

const t = useI18nAgg().commands.$t

export function parseInfo(info?: DomainDesignInfo<DomainDesignInfoType, string>): InfoDetail {
  if (!info) {
    return {
      name: 'Unknown',
      type: 'Unknown',
      subtype: 'Unknown',
      desc: 'Unknown',
    }
  }
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
  return {
    name: info._attributes.name,
    type: typeStr,
    subtype: subtype.join(', '),
    desc: descriptionToCode(info._attributes.description),
  }
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
