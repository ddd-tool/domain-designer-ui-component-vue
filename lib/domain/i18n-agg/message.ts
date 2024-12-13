export type I18nMessageKeys =
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
