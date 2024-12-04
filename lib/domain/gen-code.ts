import {
  type DomainDesignAgg,
  createDomainDesigner,
} from 'vue-fn/domain-design'

export function* nomnomlCodeGenerator(
  design: ReturnType<typeof createDomainDesigner>
) {
  const context = design._getContext()
  for (const i in context.getAggs()) {
    const agg: DomainDesignAgg<any> = context.getAggs()[i]
    const fieldsCode = []
    for (const j in agg._attributes.fields) {
      const field = agg._attributes.fields[j]
      fieldsCode.push(
        `|- ${field._attributes.name}${
          field._attributes.type === 'Unknown'
            ? ''
            : `:${field._attributes.type}`
        }`
      )
    }
    yield `[<aggregation id=${agg._attributes._code}> ${
      agg._attributes.name
    } ${fieldsCode.join('\n')}]`
  }
  for (const i in context.getCommands()) {
    const command = context.getCommands()[i]
    const fieldsCode = []
    for (const j in command._attributes.fields) {
      const field = command._attributes.fields[j]
      fieldsCode.push(
        `|- ${field._attributes.name}${
          field._attributes.type === 'Unknown'
            ? ''
            : `:${field._attributes.type}`
        }`
      )
    }
    yield `[<command id=${command._attributes._code}> ${
      command._attributes.name
    } ${fieldsCode.join('\n')}]`
  }
  for (const i in context.getEvents()) {
    const event = context.getEvents()[i]
    const fieldsCode = []
    for (const j in event._attributes.fields) {
      const field = event._attributes.fields[j]
      fieldsCode.push(
        `|- ${field._attributes.name}${
          field._attributes.type === 'Unknown'
            ? ''
            : `:${field._attributes.type}`
        }`
      )
    }
    yield `[<event id=${event._attributes._code}> ${
      event._attributes.name
    } ${fieldsCode.join('\n')}]`
  }
  for (const i in context.getServices()) {
    const service = context.getServices()[i]
    yield `[<service id=${service._attributes._code}> ${service._attributes.name}]`
  }
  for (const i in context.getPersons()) {
    const person = context.getPersons()[i]
    yield `[<actor id=${person._attributes._code}> ${person._attributes.name}]`
  }
  for (const i in context.getSystems()) {
    const system = context.getSystems()[i]
    yield `[<system id=${system._attributes._code}> ${system._attributes.name}]`
  }
  for (const i in context.getPolicies()) {
    const policy = context.getPolicies()[i]
    yield `[<policy id=${policy._attributes._code}> ${policy._attributes.name}]`
  }
  for (const i in context.getFacadeCommands()) {
    const facadeCommand = context.getFacadeCommands()[i]
    const fieldsCode = []
    for (const j in facadeCommand._attributes.fields) {
      const field = facadeCommand._attributes.fields[j]
      fieldsCode.push(
        `|- ${field._attributes.name}${
          field._attributes.type === 'Unknown'
            ? ''
            : `:${field._attributes.type}`
        }`
      )
    }
    yield `[<facadeCommand id=${facadeCommand._attributes._code}> ${
      facadeCommand._attributes.name
    } ${fieldsCode.join('\n')}]`
  }
  for (const i in context.getArrows()) {
    const [from, to] = i.split(',')
    yield `[${from}] -> [${to}]`
  }
}
