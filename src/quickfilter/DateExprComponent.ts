import _ from "lodash"
import React from "react"
const R = React.createElement
import moment from "moment"
import ClickOutHandler from "react-onclickout"
import { default as DatePicker } from "react-datepicker"

export interface DateExprComponentProps {
  /** Current value of quickfilter (state of filter selected) */
  value?: any
  /** Called when value changes */
  onChange?: any
  datetime?: boolean
}

interface DateExprComponentState {
  custom: any
  dropdownOpen: any
}

// Allows selection of a date expressions for quickfilters
export default class DateExprComponent extends React.Component<DateExprComponentProps, DateExprComponentState> {
  constructor(props: any) {
    super(props)

    this.state = {
      dropdownOpen: false,
      custom: false // True when custom dates displayed
    }
  }

  toMoment(value: any) {
    if (!value) {
      return null
    }

    if (this.props.datetime) {
      return moment(value, moment.ISO_8601)
    } else {
      return moment(value, "YYYY-MM-DD")
    }
  }

  fromMoment(value: any) {
    if (!value) {
      return null
    }

    if (this.props.datetime) {
      return value.toISOString()
    } else {
      return value.format("YYYY-MM-DD")
    }
  }

  toLiteral(value: any) {
    if (this.props.datetime) {
      return { type: "literal", valueType: "datetime", value }
    } else {
      return { type: "literal", valueType: "date", value }
    }
  }

  handleClickOut = () => {
    return this.setState({ dropdownOpen: false })
  }

  handleStartChange = (value: any) => {
    // Clear end if after
    if (this.props.value?.exprs[1] && this.fromMoment(value) > this.props.value.exprs[1]?.value) {
      return this.props.onChange({ type: "op", op: "between", exprs: [this.toLiteral(this.fromMoment(value)), null] })
    } else {
      return this.props.onChange({
        type: "op",
        op: "between",
        exprs: [this.toLiteral(this.fromMoment(value)), this.props.value?.exprs[1]]
      })
    }
  }

  handleEndChange = (value: any) => {
    // Go to end of day if datetime
    if (this.props.datetime) {
      value = moment(value)
      value.endOf("day")
    }

    // Clear start if before
    if (this.props.value?.exprs[0] && this.fromMoment(value) < this.props.value.exprs[0]?.value) {
      this.props.onChange({ type: "op", op: "between", exprs: [null, this.toLiteral(this.fromMoment(value))] })
    } else {
      this.props.onChange({
        type: "op",
        op: "between",
        exprs: [this.props.value?.exprs[0], this.toLiteral(this.fromMoment(value))]
      })
    }

    return this.setState({ dropdownOpen: false })
  }

  handlePreset = (preset: any) => {
    this.props.onChange({ type: "op", op: preset.id, exprs: [] })
    return this.setState({ dropdownOpen: false })
  }

  renderClear = () => {
    return R(
      "div",
      {
        style: { position: "absolute", right: 10, top: 7, color: "#AAA" },
        onClick: () => this.props.onChange(null)
      },
      R("i", { className: "fa fa-remove" })
    )
  }

  renderSummary() {
    if (!this.props.value) {
      return R("span", { className: "text-muted" }, "All")
    }

    const preset = _.findWhere(presets, { id: this.props.value.op })
    if (preset) {
      return preset.name
    }

    if (this.props.value.op === "between") {
      const startDate = this.toMoment(this.props.value.exprs[0]?.value)
      const endDate = this.toMoment(this.props.value.exprs[1]?.value)
      // Add/subtract hours to work around https://github.com/moment/moment/issues/2749
      if (this.props.datetime) {
        return (
          (startDate ? startDate.add("hours", 3).format("ll") : "") +
          " - " +
          (endDate ? endDate.subtract("hours", 3).format("ll") : "")
        )
      } else {
        return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "")
      }
    }

    return "???"
  }

  renderPresets() {
    return R(
      "div",
      {
        style: {
          position: "absolute",
          top: "100%",
          left: 0,
          zIndex: 4000,
          padding: 5,
          border: "solid 1px #AAA",
          backgroundColor: "white",
          borderRadius: 4
        }
      },
      R(
        "ul",
        { className: "nav nav-pills flex-column" },
        _.map(presets, (preset) => {
          return R(
            "li",
            { className: "nav-item" },
            R(
              "a",
              { className: "nav-link", style: { padding: 5 }, onClick: this.handlePreset.bind(null, preset) },
              preset.name
            )
          )
        }),
        R(
          "li",
          { className: "nav-item" },
          R(
            "a",
            { className: "nav-link", style: { padding: 5 }, onClick: () => this.setState({ custom: true }) },
            "Custom Date Range..."
          )
        )
      )
    )
  }

  renderDropdown() {
    if (this.state.custom) {
      return this.renderCustomDropdown()
    } else {
      return this.renderPresets()
    }
  }

  renderCustomDropdown() {
    const startDate = this.toMoment(this.props.value?.exprs[0]?.value)
    const endDate = this.toMoment(this.props.value?.exprs[1]?.value)

    return R(
      "div",
      {
        style: {
          position: "absolute",
          top: "100%",
          left: 0,
          zIndex: 4000,
          padding: 5,
          border: "solid 1px #AAA",
          backgroundColor: "white",
          borderRadius: 4
        }
      },
      R(
        "div",
        { style: { whiteSpace: "nowrap" } },
        R(
          "div",
          { style: { display: "inline-block", verticalAlign: "top" } },
          R(DatePicker, {
            inline: true,
            selectsStart: true,
            selected: startDate,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            showYearDropdown: true,
            onChange: this.handleStartChange
          })
        ),
        R(
          "div",
          { style: { display: "inline-block", verticalAlign: "top" } },
          R(DatePicker, {
            inline: true,
            selectsEnd: true,
            selected: endDate,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            showYearDropdown: true,
            onChange: this.handleEndChange
          })
        )
      )
    )
  }

  render() {
    return R(
      ClickOutHandler,
      { onClickOut: this.handleClickOut },
      R(
        "div",
        { style: { display: "inline-block", position: "relative" } },
        R(
          "div",
          {
            style: { width: 220, height: 36, paddingTop: "0.5rem" },
            className: "form-control",
            onClick: () => this.setState({ dropdownOpen: true, custom: false })
          },
          this.renderSummary()
        ),

        // Clear button
        this.props.value && this.props.onChange != null ? this.renderClear() : undefined,

        this.state.dropdownOpen ? this.renderDropdown() : undefined
      )
    )
  }
}

var presets = [
  { id: "thisyear", name: "This Year" },
  { id: "lastyear", name: "Last Year" },
  { id: "thismonth", name: "This Month" },
  { id: "lastmonth", name: "Last Month" },
  { id: "today", name: "Today" },
  { id: "yesterday", name: "Yesterday" },
  { id: "last24hours", name: "In Last 24 Hours" },
  { id: "last7days", name: "In Last 7 Days" },
  { id: "last30days", name: "In Last 30 Days" },
  { id: "last365days", name: "In Last 365 Days" }
]
