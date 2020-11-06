export interface TextWidgetDesign {
  /** Text widget stores its content as array of items. See ItemsHtmlConverter TODO */
  items: any[]

  /** "title" for title block. default is "default" */
  style?: "title" | "default"
}

