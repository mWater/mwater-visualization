import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import moment from "moment"
import { ExprUtils } from "mwater-expressions"
import { Cell } from "fixed-data-table-2"

interface EditExprCellComponentProps {
  /** schema to use */
  schema: any
  /** dataSource to use */
  dataSource: any
  /** Locale to use */
  locale?: string
  width: number
  height: number
  value?: any
  expr: any
  /** Called when save is requested (e.g. enter in text box) */
  onSave: any
  onCancel: any
}

interface EditExprCellComponentState {
  value: any
}

// Cell allows editing an expression column cell
// Store edited value here to prevent slow re-render of entire datagrid
export default class EditExprCellComponent extends React.Component<
  EditExprCellComponentProps,
  EditExprCellComponentState
> {
  constructor(props: any) {
    super(props)
    this.state = { value: props.value }
  }

  getValue() {
    return this.state.value
  }

  // Check if edit value has changed
  hasChanged() {
    return !_.isEqual(this.props.value, this.state.value)
  }

  handleChange = (value: any) => {
    return this.setState({ value })
  }

  render() {
    const exprUtils = new ExprUtils(this.props.schema)

    // Get expression type
    const exprType = exprUtils.getExprType(this.props.expr)

    switch (exprType) {
      case "text":
        return R(TextEditComponent, {
          value: this.state.value,
          onChange: this.handleChange,
          onSave: this.props.onSave,
          onCancel: this.props.onCancel
        })
        break
      case "number":
        return R(NumberEditComponent, {
          value: this.state.value,
          onChange: this.handleChange,
          onSave: this.props.onSave,
          onCancel: this.props.onCancel
        })
        break
      case "enum":
        return R(EnumEditComponent, {
          value: this.state.value,
          onChange: this.handleChange,
          enumValues: exprUtils.getExprEnumValues(this.props.expr),
          onSave: this.props.onSave,
          onCancel: this.props.onCancel,
          locale: this.props.locale
        })
        break
    }

    throw new Error(`Unsupported type ${exprType} for editing`)
  }
}

interface TextEditComponentProps {
  value?: any
  /** Called with new value */
  onChange: any
  /** Called when enter is pressed */
  onSave: any
  onCancel: any
}

// Simple text box
class TextEditComponent extends React.Component<TextEditComponentProps> {
  componentDidMount() {
    // Focus when created
    return this.input?.focus()
  }

  render() {
    return R(
      "div",
      { style: { paddingTop: 3 } },
      R("input", {
        ref: (c: any) => {
          return (this.input = c)
        },
        type: "text",
        className: "form-control",
        value: this.props.value || "",
        onChange: (ev: any) => this.props.onChange(ev.target.value || null),
        onKeyUp: (ev: any) => {
          if (ev.keyCode === 27) {
            this.props.onCancel()
          }
          if (ev.keyCode === 13) {
            return this.props.onSave()
          }
        }
      })
    )
  }
}

interface NumberEditComponentProps {
  value?: any
  /** Called with new value */
  onChange: any
  /** Called when enter is pressed */
  onSave: any
  onCancel: any
}

// Simple number box
class NumberEditComponent extends React.Component<NumberEditComponentProps> {
  componentDidMount() {
    // Focus when created
    return this.input?.focus()
  }

  handleChange = (ev: any) => {
    if (ev.target.value) {
      return this.props.onChange(parseFloat(ev.target.value))
    } else {
      return this.props.onChange(null)
    }
  }

  render() {
    return R(
      "div",
      { style: { paddingTop: 3 } },
      R("input", {
        ref: (c: any) => {
          return (this.input = c)
        },
        type: "number",
        step: "any",
        className: "form-control",
        value: this.props.value != null ? this.props.value : "",
        onChange: this.handleChange,
        onKeyUp: (ev: any) => {
          if (ev.keyCode === 27) {
            this.props.onCancel()
          }
          if (ev.keyCode === 13) {
            return this.props.onSave()
          }
        }
      })
    )
  }
}

interface EnumEditComponentProps {
  value?: any
  enumValues: any
  /** Locale to use */
  locale?: string
  /** Called with new value */
  onChange: any
  /** Called when enter is pressed */
  onSave: any
  onCancel: any
}

// Simple enum box
class EnumEditComponent extends React.Component<EnumEditComponentProps> {
  render() {
    return R(
      "div",
      { style: { paddingTop: 3 } },
      R(
        "select",
        {
          value: this.props.value || "",
          onChange: (ev: any) => this.props.onChange(ev.target.value || null),
          className: "form-select"
        },
        R("option", { key: "", value: "" }, ""),
        _.map(this.props.enumValues, (ev) => {
          return R("option", { key: ev.id, value: ev.id }, ExprUtils.localizeString(ev.name, this.props.locale))
        })
      )
    )
  }
}
