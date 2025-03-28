import type {
  DomainDesignAgg,
  DomainDesignNote,
  DomainDesigner,
  DomainDesignInfo,
  DomainDesignInfoType,
} from '@ddd-tool/domain-designer-core'

export function* nomnomlCodeGenerator<T extends DomainDesigner>(
  design: T,
  displayReadModel: boolean,
  displaySystem: boolean
) {
  const context = design._getContext()
  for (const i in context.getAggs()) {
    const agg: DomainDesignAgg<any> = context.getAggs()[i]
    yield `[<aggregation id=${agg._attributes.__id}> ${agg._attributes.name}: Aggregation ${infosToCode(
      agg._attributes.infos
    )} ${noteToCode(agg._attributes.note)}]`
  }
  for (const i in context.getCommands()) {
    const command = context.getCommands()[i]
    yield `[<command id=${command._attributes.__id}> ${command._attributes.name}: Command ${infosToCode(
      command._attributes.infos
    )} ${noteToCode(command._attributes.note)}]`
  }
  for (const i in context.getFacadeCommands()) {
    const facadeCommand = context.getFacadeCommands()[i]
    yield `[<facadeCommand id=${facadeCommand._attributes.__id}> ${
      facadeCommand._attributes.name
    }: FacadeCommand ${infosToCode(facadeCommand._attributes.infos)} ${noteToCode(facadeCommand._attributes.note)}]`
  }
  for (const i in context.getEvents()) {
    const event = context.getEvents()[i]
    yield `[<event id=${event._attributes.__id}> ${event._attributes.name}: Event ${infosToCode(
      event._attributes.infos
    )} ${noteToCode(event._attributes.note)}]`
  }
  for (const i in context.getServices()) {
    const service = context.getServices()[i]
    yield `[<service id=${service._attributes.__id}> ${service._attributes.name}: Service ${noteToCode(
      service._attributes.note
    )}]`
  }
  for (const i in context.getActors()) {
    const actor = context.getActors()[i]
    yield `[<actor id=${actor._attributes.__id}> ${actor._attributes.name}: Actor ${noteToCode(
      actor._attributes.note
    )}]`
  }
  for (const i in context.getPolicies()) {
    const policy = context.getPolicies()[i]
    yield `[<policy id=${policy._attributes.__id}> ${policy._attributes.name}: Policy ${noteToCode(
      policy._attributes.note
    )}]`
  }
  if (displayReadModel) {
    for (const i in context.getReadModels()) {
      const readModel = context.getReadModels()[i]
      yield `[<readModel id=${readModel._attributes.__id}> ${readModel._attributes.name}: ReadModel ${infosToCode(
        readModel._attributes.infos
      )} ${noteToCode(readModel._attributes.note)}]`
    }
  }
  if (displaySystem) {
    for (const i in context.getSystems()) {
      const system = context.getSystems()[i]
      yield `[<system id=${system._attributes.__id}> ${system._attributes.name}: System ${noteToCode(
        system._attributes.note
      )}]`
    }
  }
  for (const i in context.getLinks()) {
    const linkType = context.getLinks()[i]
    const [_rule1, from, _rule2, to] = i.split(',')
    if (!displayReadModel && (_rule1 === 'ReadModel' || _rule2 === 'ReadModel')) {
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

function infosToCode<T extends Record<string, DomainDesignInfo<DomainDesignInfoType, string>>>(infos: T): string {
  if (!infos) {
    return ''
  }
  function getFlag(note: any): string {
    if (note) {
      return '*'
    }
    return '-'
  }
  const code = ['']
  for (const i in infos) {
    const info = infos[i]
    const type = info._attributes.type
    const flag = getFlag(info._attributes.note)
    if (type === 'Document') {
      code.push(`|${flag} ${info._attributes.name}: Document`)
    } else if (type === 'Function') {
      code.push(`|${flag} ${info._attributes.name}: Function`)
    } else if (type === 'Id') {
      code.push(`|${flag} ${info._attributes.name}: Id`)
    } else if (type === 'ValueObject') {
      code.push(`|${flag} ${info._attributes.name}: Value`)
    } else if (type === 'Version') {
      code.push(`|${flag} ${info._attributes.name}: Version`)
    } else {
      isNever(type)
    }
  }
  return code.join('\n')
}

function noteToCode(note?: DomainDesignNote): string {
  if (!note) {
    return ''
  }
  const templates = note._attributes.template
  const values = note._attributes.inject
  const code = templates.reduce((result, str, i) => {
    const value = values[i] ? values[i].toFormat() : ''
    return result + str + value
  }, '')
  return '|' + code
}
