import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

import uuid from "uuid"
import { DataSource, ExprUtils, Schema } from "mwater-expressions"
import { ExprComponent } from "mwater-expressions-ui"
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent"
import TableSelectComponent from "../../TableSelectComponent"
import ExprItemEditorComponent from "./ExprItemEditorComponent"

export interface ExprInsertModalComponentProps {
  /** Schema to use */
  schema: Schema
  /** Data source to use to get values */
  dataSource: DataSource
  /** Called with expr item to insert */
  onInsert: any
  singleRowTable?: string
}

interface ExprInsertModalComponentState {
  exprItem: any
  open: any
}

// Modal that displays an expression builder
export default class ExprInsertModalComponent extends React.Component<
  ExprInsertModalComponentProps,
  ExprInsertModalComponentState
> {
  constructor(props: any) {
    super(props)

    this.state = {
      open: false,
      exprItem: null
    }
  }

  open() {
    return this.setState({ open: true, exprItem: { type: "expr", id: uuid() } })
  }

  handleInsert = (ev: any) => {
    if (!this.state.exprItem) {
      return
    }

    // Close first to avoid strange effects when mixed with pojoviews
    return this.setState({ open: false }, () => {
      return this.props.onInsert(this.state.exprItem)
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
        title: "Insert Field"
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
