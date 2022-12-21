import React from "react"
const R = React.createElement

import uuid from "uuid"
import { DataSource, Schema } from "mwater-expressions"
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent"
import ExprItemEditorComponent from "./ExprItemEditorComponent"
import { HtmlItemExpr } from "../../richtext/ExprItemsHtmlConverter"

export interface ExprInsertModalComponentProps {
  /** Schema to use */
  schema: Schema
  /** Data source to use to get values */
  dataSource: DataSource
  /** Called with expr item to insert */
  onInsert: (exprItem: HtmlItemExpr) => void
  singleRowTable?: string
}

interface ExprInsertModalComponentState {
  exprItem: HtmlItemExpr | null
  open: boolean
}

// Modal that displays an expression builder
export default class ExprInsertModalComponent extends React.Component<
  ExprInsertModalComponentProps,
  ExprInsertModalComponentState
> {
  constructor(props: ExprInsertModalComponentProps) {
    super(props)

    this.state = {
      open: false,
      exprItem: null
    }
  }

  open() {
    this.setState({ open: true, exprItem: { type: "expr", id: uuid(), expr: null } })
  }

  handleInsert = () => {
    if (!this.state.exprItem) {
      return
    }

    // Close first to avoid strange effects when mixed with pojoviews
    this.setState({ open: false }, () => {
      this.props.onInsert(this.state.exprItem!)
    })
  }

  render() {
    if (!this.state.open) {
      return null
    }

    return R(
      ActionCancelModalComponent,
      {
        actionLabel: "Insert",
        onAction: this.handleInsert,
        onCancel: () => this.setState({ open: false }),
        title: "Insert Field",
        size: "x-large"
      },
      R(ExprItemEditorComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        exprItem: this.state.exprItem,
        onChange: (exprItem: any) => this.setState({ exprItem }),
        singleRowTable: this.props.singleRowTable
      })
    )
  }
}
