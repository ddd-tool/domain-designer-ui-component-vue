import type {
  DomainDesignAgg,
  DomainDesignDesc,
  DomainDesigner,
  DomainDesignInfo,
  DomainDesignInfoType,
} from '@ddd-tool/domain-designer-core'
import { isDomainDesignInfoFunc } from '@ddd-tool/domain-designer-core'

export function* nomnomlCodeGenerator<T extends DomainDesigner>(
  design: T,
  displayReadModel: boolean,
  displaySystem: boolean
) {
  const context = design._getContext()
  for (const i in context.getAggs()) {
    const agg: DomainDesignAgg<any> = context.getAggs()[i]
    yield `[<aggregation id=${agg._attributes.__code}> ${
      agg._attributes.name
    }: Aggregation ${fieldsToCode(agg._attributes.infos)} ${descriptionToCode(
      agg._attributes.description
    )}]`
  }
  for (const i in context.getCommands()) {
    const command = context.getCommands()[i]
    yield `[<command id=${command._attributes.__code}> ${
      command._attributes.name
    }: Command ${fieldsToCode(command._attributes.infos)} ${descriptionToCode(
      command._attributes.description
    )}]`
  }
  for (const i in context.getFacadeCommands()) {
    const facadeCommand = context.getFacadeCommands()[i]
    yield `[<facadeCommand id=${facadeCommand._attributes.__code}> ${
      facadeCommand._attributes.name
    }: FacadeCommand ${fieldsToCode(
      facadeCommand._attributes.infos
    )} ${descriptionToCode(facadeCommand._attributes.description)}]`
  }
  for (const i in context.getEvents()) {
    const event = context.getEvents()[i]
    yield `[<event id=${event._attributes.__code}> ${
      event._attributes.name
    }: Event ${fieldsToCode(event._attributes.infos)} ${descriptionToCode(
      event._attributes.description
    )}]`
  }
  for (const i in context.getServices()) {
    const service = context.getServices()[i]
    yield `[<service id=${service._attributes.__code}> ${
      service._attributes.name
    }: Service ${descriptionToCode(service._attributes.description)}]`
  }
  for (const i in context.getActors()) {
    const actor = context.getActors()[i]
    yield `[<actor id=${actor._attributes.__code}> ${
      actor._attributes.name
    }: Actor ${descriptionToCode(actor._attributes.description)}]`
  }
  for (const i in context.getPolicies()) {
    const policy = context.getPolicies()[i]
    yield `[<policy id=${policy._attributes.__code}> ${
      policy._attributes.name
    }: Policy ${descriptionToCode(policy._attributes.description)}]`
  }
  if (displayReadModel) {
    for (const i in context.getReadModels()) {
      const readModel = context.getReadModels()[i]
      yield `[<readModel id=${readModel._attributes.__code}> ${
        readModel._attributes.name
      }: ReadModel ${fieldsToCode(
        readModel._attributes.infos
      )} ${descriptionToCode(readModel._attributes.description)}]`
    }
  }
  if (displaySystem) {
    for (const i in context.getSystems()) {
      const system = context.getSystems()[i]
      yield `[<system id=${system._attributes.__code}> ${
        system._attributes.name
      }: System ${descriptionToCode(system._attributes.description)}]`
    }
  }
  for (const i in context.getLinks()) {
    const linkType = context.getLinks()[i]
    const [_rule1, from, _rule2, to] = i.split(',')
    if (
      !displayReadModel &&
      (_rule1 === 'ReadModel' || _rule2 === 'ReadModel')
    ) {
      continue
    }
    if (!displaySystem && (_rule1 === 'System' || _rule2 === 'System')) {
      continue
    }
    if (linkType === 'Association') {
      yield `[${from}] -> [${to}]`
    } else if (linkType === 'Aggregation') {
      yield `[${from}] o- [${to}]`
    } else if (linkType === 'Dependency') {
      yield `[${to}] <-- [${from}]`
    }
  }
}

function fieldsToCode<
  T extends Record<string, DomainDesignInfo<DomainDesignInfoType>>
>(infos: T): string {
  if (!infos) {
    return ''
  }
  const code = ['']
  for (const i in infos) {
    const info = infos[i]
    if (info._attributes.type === 'Document') {
      code.push(`|+ ${info._attributes.name}: Document`)
    } else if (isDomainDesignInfoFunc(info)) {
      let len = info._attributes.subtype.length
      let dependsOn = info._attributes.subtype
        .map((i) => i._attributes.name)
        .join(',\n' + (len > 1 ? '\t' : ''))
      if (len > 1) {
        dependsOn = `\n${dependsOn}\n`
      }
      code.push(`|+ ${info._attributes.name}: Function<${dependsOn}>`)
    } else if (info._attributes.type === 'Field') {
      code.push(
        `|+ ${info._attributes.name}: ${info._attributes.type}<${info._attributes.subtype}>`
      )
    }
  }
  return code.join('\n')
}

function descriptionToCode(description?: DomainDesignDesc): string {
  if (!description) {
    return ''
  }
  const templates = description._attributes.template
  const values = description._attributes.values
  const code = templates.reduce((result, str, i) => {
    const value = values[i] ? `<${values[i]._attributes.name}>` : ''
    return result + str + value
  }, '')
  return '|' + code
}
