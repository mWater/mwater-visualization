import * as React from 'react'

declare class ColorComponent extends React.Component<{
  color: string | null | undefined
  onChange: (value: string | null) => void
}> {}

export = ColorComponent
