import type {
  DomainDesignAgg,
  DomainDesignDesc,
  DomainDesignFields,
  DomainDesigner,
} from '@ddd-tool/domain-designer-core'

export function* nomnomlCodeGenerator(design: DomainDesigner) {
  const context = design._getContext()
  for (const i in context.getAggs()) {
    const agg: DomainDesignAgg<any> = context.getAggs()[i]
    yield `[<aggregation id=${agg._attributes._code}> ${
      agg._attributes.name
    } ${fieldsToCode(agg._attributes.fields)} ${descriptionToCode(
      agg._attributes.description
    )}]`
  }
  for (const i in context.getCommands()) {
    const command = context.getCommands()[i]
    yield `[<command id=${command._attributes._code}> ${
      command._attributes.name
    } ${fieldsToCode(command._attributes.fields)} ${descriptionToCode(
      command._attributes.description
    )}]`
  }
  for (const i in context.getEvents()) {
    const event = context.getEvents()[i]
    yield `[<event id=${event._attributes._code}> ${
      event._attributes.name
    } ${fieldsToCode(event._attributes.fields)} ${descriptionToCode(
      event._attributes.description
    )}]`
  }
  for (const i in context.getServices()) {
    const service = context.getServices()[i]
    yield `[<service id=${service._attributes._code}> ${
      service._attributes.name
    } ${descriptionToCode(service._attributes.description)}]`
  }
  for (const i in context.getPersons()) {
    const person = context.getPersons()[i]
    yield `[<actor id=${person._attributes._code}> ${
      person._attributes.name
    } ${descriptionToCode(person._attributes.description)}]`
  }
  for (const i in context.getSystems()) {
    const system = context.getSystems()[i]
    yield `[<system id=${system._attributes._code}> ${
      system._attributes.name
    } ${descriptionToCode(system._attributes.description)}]`
  }
  for (const i in context.getPolicies()) {
    const policy = context.getPolicies()[i]
    yield `[<policy id=${policy._attributes._code}> ${
      policy._attributes.name
    } ${descriptionToCode(policy._attributes.description)}]`
  }
  for (const i in context.getFacadeCommands()) {
    const facadeCommand = context.getFacadeCommands()[i]
    yield `[<facadeCommand id=${facadeCommand._attributes._code}> ${
      facadeCommand._attributes.name
    } ${fieldsToCode(facadeCommand._attributes.fields)} ${descriptionToCode(
      facadeCommand._attributes.description
    )}]`
  }
  for (const i in context.getArrows()) {
    const [from, to] = i.split(',')
    yield `[${from}] -> [${to}]`
  }
}

function fieldsToCode(fields: DomainDesignFields): string {
  if (!fields) {
    return ''
  }
  const code = ['']
  for (const i in fields) {
    const field = fields[i]
    code.push(
      `|+ ${field._attributes.name}${
        field._attributes.type === 'Unknown' ? '' : `:${field._attributes.type}`
      }`
    )
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
