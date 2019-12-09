import React from "react"

/** List of options with a name and description each */
export class OptionListComponent extends React.Component<{
  items: { 
    name: string
    desc?: string
    onClick: () => void
    onRemove?: () => void
  }[]
  hint?: string
}> {}
