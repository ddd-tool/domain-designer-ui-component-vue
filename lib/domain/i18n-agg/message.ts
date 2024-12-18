export type I18nMessageKeys =
  | 'constant.type'
  | 'constant.type.id'
  | 'constant.type.document'
  | 'constant.type.function'
  | 'constant.type.valueObject'
  | 'constant.type.version'
  | 'constant.subtype'
  | 'constant.description'
  | 'constant.empty'
  | 'constant.others'
  | 'menu.focusOnUserStory'
  | 'menu.focusOnUserStory.focusNothing'
  | 'menu.settings'
  | 'menu.settings.renderExternalSystem'
  | 'menu.settings.renderReadModel'
  | 'menu.settings.language'
  | 'menu.settings.dataSource'
  | 'menu.exportSvg'
  | 'menu.replayWorkflow'
export type I18nMessages = {
  [key in I18nMessageKeys]: string
}
