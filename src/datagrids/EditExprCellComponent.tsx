import _ from "lodash"
import React, { useState } from "react"
const R = React.createElement
import { DataSource, EnumValue, Expr, ExprUtils, Schema } from "mwater-expressions"
import moment from "moment"

export interface EditExprCellComponentProps {
  /** schema to use */
  schema: Schema
  /** dataSource to use */
  dataSource: DataSource
  /** Locale to use */
  locale?: string

  /** Size of control */
  width: number
  height: number

  /** Expression being edited */
  expr: Expr
  /** Value of expression */
  value?: any
  /** Called when save is requested (e.g. enter in text box) */
  onSave: () => void
  /** Called when cancel is requested (e.g. esc in text box) */
  onCancel: () => void
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
    this.setState({ value })
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
      case "number":
        return R(NumberEditComponent, {
          value: this.state.value,
          onChange: this.handleChange,
          onSave: this.props.onSave,
          onCancel: this.props.onCancel
        })
      case "enum":
        return R(EnumEditComponent, {
          value: this.state.value,
          onChange: this.handleChange,
          enumValues: exprUtils.getExprEnumValues(this.props.expr)!,
          onSave: this.props.onSave,
          onCancel: this.props.onCancel,
          locale: this.props.locale
        })
      case "date":
      case "datetime":
        return R(DateEditComponent, {
          value: this.state.value,
          onChange: this.handleChange,
          onSave: this.props.onSave,
          onCancel: this.props.onCancel,
          datetime: exprType === "datetime"
        })
      }

    throw new Error(`Unsupported type ${exprType} for editing`)
  }
}

interface TextEditComponentProps {
  /** Current value */
  value?: any
  /** Called with new value */
  onChange: (value: any) => void
  /** Called when save is requested (e.g. enter in text box) */
  onSave: () => void
  /** Called when cancel is requested (e.g. esc in text box) */
  onCancel: () => void
}

// Simple text box
class TextEditComponent extends React.Component<TextEditComponentProps> {
  input: HTMLInputElement | null

  componentDidMount() {
    // Focus when created
    return this.input?.focus()
  }

  render() {
    return R(
      "div",
      { style: { paddingTop: 3 } },
      R("input", {
        ref: (c: HTMLInputElement | null) => {
          this.input = c
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
  /** Current value */
  value?: any
  /** Called with new value */
  onChange: (value: any) => void
  /** Called when save is requested (e.g. enter in text box) */
  onSave: () => void
  /** Called when cancel is requested (e.g. esc in text box) */
  onCancel: () => void
}

// Simple number box
class NumberEditComponent extends React.Component<NumberEditComponentProps> {
  input: HTMLInputElement | null

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
  /** Current value */
  value?: any
  /** Called with new value */
  onChange: (value: any) => void
  enumValues: EnumValue[]
  /** Locale to use */
  locale?: string
  /** Called when save is requested (e.g. enter in text box) */
  onSave: () => void
  /** Called when cancel is requested (e.g. esc in text box) */
  onCancel: () => void
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

/** Simple date editor */
function DateEditComponent(props: {
  /** Current value */
  value?: any
  /** Called with new value */
  onChange: (value: any) => void
  /** Called when save is requested (e.g. enter in text box) */
  onSave: () => void
  /** Called when cancel is requested (e.g. esc in text box) */
  onCancel: () => void
  /** True if datetime, not date */
  datetime: boolean
}) {
    // // Focus when created
    // return this.input?.focus()
  
  // Format date
  const [valueStr, setValueStr] = useState(props.datetime ?
    (props.value ? moment(props.value, moment.ISO_8601).format("YYYY-MM-DD HH:mm") : "")
    : props.value || ""
    )

  const [isValid, setIsValid] = useState(true)

  // Parse date
  function parseDate(value: string) {
    if (!value) {
      setIsValid(true)
      return null
    }
    const m = moment(value, props.datetime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD")
    if (!m.isValid()) {
      setIsValid(false)
      return null
    }
    setIsValid(true)
    if (props.datetime) {
      return m.toISOString()
    } else {
      return m.format("YYYY-MM-DD")
    }
  }

  return <div style={{ paddingTop: 3 }}>
    <input 
      type="text" 
      className="form-control" 
      value={valueStr} 
      style={{ backgroundColor: isValid ? "white" : "pink" }}
      onChange={ev => {
        setValueStr(ev.target.value)
        props.onChange(parseDate(ev.target.value))
      }}
      ref={c => {
        if (c) {
          c.focus()
        }
      }}
      onKeyUp={(ev) => {
        if (ev.keyCode === 27) {
          props.onCancel()
        }
        if (ev.keyCode === 13) {
          return props.onSave()
        }
      }}
    />
  </div>
}
