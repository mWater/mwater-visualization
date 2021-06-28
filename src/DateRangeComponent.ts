// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let DateRangeComponent
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import moment from "moment"
import ClickOutHandler from "react-onclickout"
import { default as DatePicker } from "react-datepicker"

// Allows selection of a date range
export default DateRangeComponent = (function () {
  DateRangeComponent = class DateRangeComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        value: PropTypes.array, // Array of [start date, end date] in iso 8601 format
        onChange: PropTypes.func.isRequired, // Array of [start date, end date] in iso 8601 format
        datetime: PropTypes.bool
      }
      // true if for datetime, not date
    }

    constructor(props) {
      super(props)

      this.state = {
        dropdownOpen: false,
        custom: false // True when custom dates displayed
      }
    }

    toMoment(value) {
      if (!value) {
        return null
      }

      if (this.props.datetime) {
        return moment(value, moment.ISO_8601)
      } else {
        return moment(value, "YYYY-MM-DD")
      }
    }

    fromMoment(value) {
      if (!value) {
        return null
      }

      if (this.props.datetime) {
        return value.toISOString()
      } else {
        return value.format("YYYY-MM-DD")
      }
    }

    handleClickOut = () => {
      return this.setState({ dropdownOpen: false })
    }

    handleStartChange = (value) => {
      // Go to start of day if datetime
      if (this.props.datetime) {
        value = moment(value)
        value.startOf("day")
      }

      // Clear end if after
      if (this.props.value?.[1] && this.fromMoment(value) > this.props.value[1]) {
        return this.props.onChange([this.fromMoment(value), null])
      } else {
        return this.props.onChange([this.fromMoment(value), this.props.value?.[1]])
      }
    }

    handleEndChange = (value) => {
      // Go to end of day if datetime
      if (this.props.datetime) {
        value = moment(value)
        value.endOf("day")
      }

      // Clear start if before
      if (this.props.value?.[0] && this.fromMoment(value) < this.props.value[0]) {
        this.props.onChange([null, this.fromMoment(value)])
      } else {
        this.props.onChange([this.props.value?.[0], this.fromMoment(value)])
      }

      return this.setState({ dropdownOpen: false })
    }

    handlePreset = (preset) => {
      // Go to start/end of day if datetime
      let end, start
      if (this.props.datetime) {
        start = moment(preset.value[0])
        start.startOf("day")
        end = moment(preset.value[1])
        end.endOf("day")
      } else {
        start = preset.value[0]
        end = preset.value[1]
      }

      this.props.onChange([this.fromMoment(start), this.fromMoment(end)])
      return this.setState({ dropdownOpen: false })
    }

    getPresets() {
      const presets = [
        { label: "Today", value: [moment(), moment()] },
        { label: "Yesterday", value: [moment().subtract(1, "days"), moment().subtract(1, "days")] },
        { label: "Last 7 Days", value: [moment().subtract(6, "days"), moment()] },
        { label: "Last 30 Days", value: [moment().subtract(29, "days"), moment()] },
        { label: "This Month", value: [moment().startOf("month"), moment().endOf("month")] },
        {
          label: "Last Month",
          value: [moment().subtract(1, "months").startOf("month"), moment().subtract(1, "months").endOf("month")]
        },
        { label: "This Year", value: [moment().startOf("year"), moment().endOf("year")] },
        {
          label: "Last Year",
          value: [moment().subtract(1, "years").startOf("year"), moment().subtract(1, "years").endOf("year")]
        }
      ]
      return presets
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
        return R("span", { className: "text-muted" }, "All Dates")
      }

      const startDate = this.toMoment(this.props.value[0])
      const endDate = this.toMoment(this.props.value[1])
      return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "")
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
          { className: "nav nav-pills nav-stacked" },
          _.map(this.getPresets(), (preset) => {
            return R(
              "li",
              null,
              R("a", { style: { padding: 5 }, onClick: this.handlePreset.bind(null, preset) }, preset.label)
            )
          }),
          R(
            "li",
            null,
            R("a", { style: { padding: 5 }, onClick: () => this.setState({ custom: true }) }, "Custom Date Range...")
          )
        )
      )
    }

    renderCustomDropdown() {
      const startDate = this.toMoment(this.props.value?.[0])
      const endDate = this.toMoment(this.props.value?.[1])

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
              startDate,
              endDate,
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
              startDate,
              endDate,
              showYearDropdown: true,
              onChange: this.handleEndChange
            })
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
              className: "form-control",
              style: { width: 220 },
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
  DateRangeComponent.initClass()
  return DateRangeComponent
})()
