// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let EditExprCellComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import moment from "moment"
import { ExprUtils } from "mwater-expressions"
import { Cell } from "fixed-data-table-2"

// Cell allows editing an expression column cell
// Store edited value here to prevent slow re-render of entire datagrid
export default EditExprCellComponent = (function () {
  EditExprCellComponent = class EditExprCellComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // schema to use
        dataSource: PropTypes.object.isRequired, // dataSource to use

        locale: PropTypes.string, // Locale to use

        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,

        value: PropTypes.any,
        expr: PropTypes.object.isRequired,

        onSave: PropTypes.func.isRequired, // Called when save is requested (e.g. enter in text box)
        onCancel: PropTypes.func.isRequired
      }
      // Called when cancelled
    }

    constructor(props) {
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

    handleChange = (value) => {
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
  EditExprCellComponent.initClass()
  return EditExprCellComponent
})()

// Simple text box
class TextEditComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      value: PropTypes.any,
      onChange: PropTypes.func.isRequired, // Called with new value
      onSave: PropTypes.func.isRequired, // Called when enter is pressed
      onCancel: PropTypes.func.isRequired
    }
    // Called when cancelled
  }

  componentDidMount() {
    // Focus when created
    return this.input?.focus()
  }

  render() {
    return R(
      "div",
      { style: { paddingTop: 3 } },
      R("input", {
        ref: (c) => {
          return (this.input = c)
        },
        type: "text",
        className: "form-control",
        value: this.props.value || "",
        onChange: (ev) => this.props.onChange(ev.target.value || null),
        onKeyUp: (ev) => {
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
TextEditComponent.initClass()

// Simple number box
class NumberEditComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      value: PropTypes.any,
      onChange: PropTypes.func.isRequired, // Called with new value
      onSave: PropTypes.func.isRequired, // Called when enter is pressed
      onCancel: PropTypes.func.isRequired
    }
    // Called when cancelled
  }

  componentDidMount() {
    // Focus when created
    return this.input?.focus()
  }

  handleChange = (ev) => {
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
        ref: (c) => {
          return (this.input = c)
        },
        type: "number",
        step: "any",
        className: "form-control",
        value: this.props.value != null ? this.props.value : "",
        onChange: this.handleChange,
        onKeyUp: (ev) => {
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
NumberEditComponent.initClass()

// Simple enum box
class EnumEditComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      value: PropTypes.any,
      enumValues: PropTypes.array.isRequired,
      locale: PropTypes.string, // Locale to use
      onChange: PropTypes.func.isRequired, // Called with new value
      onSave: PropTypes.func.isRequired, // Called when enter is pressed
      onCancel: PropTypes.func.isRequired
    }
    // Called when cancelled
  }

  render() {
    return R(
      "div",
      { style: { paddingTop: 3 } },
      R(
        "select",
        {
          value: this.props.value || "",
          onChange: (ev) => this.props.onChange(ev.target.value || null),
          className: "form-control"
        },
        R("option", { key: "", value: "" }, ""),
        _.map(this.props.enumValues, (ev) => {
          return R("option", { key: ev.id, value: ev.id }, ExprUtils.localizeString(ev.name, this.props.locale))
        })
      )
    )
  }
}
EnumEditComponent.initClass()
