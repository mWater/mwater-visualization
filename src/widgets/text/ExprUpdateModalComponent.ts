import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

import { DataSource, ExprUtils, Schema } from "mwater-expressions"
import { ExprComponent } from "mwater-expressions-ui"
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent"
import TableSelectComponent from "../../TableSelectComponent"
import ExprItemEditorComponent from "./ExprItemEditorComponent"

interface ExprUpdateModalComponentProps {
  /** Schema to use */
  schema: Schema
  /** Data source to use to get values */
  dataSource: DataSource
  singleRowTable?: string
}

interface ExprUpdateModalComponentState {
  open: any
  onUpdate: any
  exprItem: any
}

// Modal that displays an expression builder for updating an expression
export default class ExprUpdateModalComponent extends React.Component<
  ExprUpdateModalComponentProps,
  ExprUpdateModalComponentState
> {
  constructor(props: any) {
    super(props)

    this.state = {
      open: false,
      exprItem: null,
      onUpdate: null
    }
  }

  open(item: any, onUpdate: any) {
    return this.setState({ open: true, exprItem: item, onUpdate })
  }

  render() {
    if (!this.state.open) {
      return null
    }

    return R(
      ActionCancelModalComponent,
      {
        actionLabel: "Update",
        onAction: () => {
          // Close first to avoid strange effects when mixed with pojoviews
          return this.setState({ open: false }, () => {
            return this.state.onUpdate(this.state.exprItem)
          })
        },
        onCancel: () => this.setState({ open: false }),
        title: "Update Field"
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
