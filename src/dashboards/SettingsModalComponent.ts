import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import update from "update-object"
import languages from "languages"
import * as ui from "react-library/lib/bootstrap"
import { default as ReactSelect } from "react-select"
import * as DashboardUtils from "./DashboardUtils"
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent"
import QuickfiltersDesignComponent from "../quickfilter/QuickfiltersDesignComponent"
import FiltersDesignerComponent from "../FiltersDesignerComponent"
import { DataSource, Schema } from "mwater-expressions"

export interface SettingsModalComponentProps {
  onDesignChange: any
  schema: Schema
  dataSource: DataSource
}

interface SettingsModalComponentState {
  design: any
}

// Popup with settings for dashboard
export default class SettingsModalComponent extends React.Component<
  SettingsModalComponentProps,
  SettingsModalComponentState
> {
  static contextTypes = { globalFiltersElementFactory: PropTypes.func }

  constructor(props: any) {
    super(props)
    this.state = {
      design: null // Set when being edited
    }
  }

  show(design: any) {
    return this.setState({ design })
  }

  handleSave = () => {
    this.props.onDesignChange(this.state.design)
    return this.setState({ design: null })
  }

  handleCancel = () => {
    return this.setState({ design: null })
  }
  handleDesignChange = (design: any) => {
    return this.setState({ design })
  }

  handleFiltersChange = (filters: any) => {
    const design = _.extend({}, this.state.design, { filters })
    return this.handleDesignChange(design)
  }

  handleGlobalFiltersChange = (globalFilters: any) => {
    const design = _.extend({}, this.state.design, { globalFilters })
    return this.handleDesignChange(design)
  }

  render() {
    // Don't show if not editing
    if (!this.state.design) {
      return null
    }

    // Get filterable tables
    const filterableTables = DashboardUtils.getFilterableTables(this.state.design, this.props.schema)

    const localeOptions = _.map(languages.getAllLanguageCode(), (code) => {
      return {
        value: code,
        label: languages.getLanguageInfo(code).name + " (" + languages.getLanguageInfo(code).nativeName + ")"
      }
    })

    return R(
      ActionCancelModalComponent,
      {
        size: "large",
        onCancel: this.handleCancel,
        onAction: this.handleSave
      },
      R(
        "div",
        { style: { paddingBottom: 200 } },
        R("h4", null, "Quick Filters"),
        R(
          "div",
          { className: "text-muted" },
          "Quick filters are shown to the user as a dropdown at the top of the dashboard and can be used to filter data of widgets."
        ),

        filterableTables.length > 0
          ? R(QuickfiltersDesignComponent, {
              design: this.state.design.quickfilters || [],
              onDesignChange: (design: any) =>
                this.handleDesignChange(update(this.state.design, { quickfilters: { $set: design } })),
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              tables: filterableTables
            })
          : "Nothing to quickfilter. Add widgets to the dashboard",

        R("h4", { style: { paddingTop: 10 } }, "Filters"),
        R(
          "div",
          { className: "text-muted" },
          "Filters are built in to the dashboard and cannot be changed by viewers of the dashboard."
        ),

        filterableTables.length > 0
          ? R(FiltersDesignerComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              filters: this.state.design.filters,
              onFiltersChange: this.handleFiltersChange,
              filterableTables
            })
          : "Nothing to filter. Add widgets to the dashboard",

        this.context.globalFiltersElementFactory
          ? R(
              "div",
              null,
              R("h4", { style: { paddingTop: 10 } }, "Global Filters"),

              this.context.globalFiltersElementFactory({
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                filterableTables,
                globalFilters: this.state.design.globalFilters || [],
                onChange: this.handleGlobalFiltersChange
              })
            )
          : undefined,

        R("h4", { style: { paddingTop: 10 } }, "Language"),
        R(
          "div",
          { className: "text-muted" },
          "Controls the preferred language of widgets and uses specified language when available"
        ),

        R(ReactSelect, {
          value: _.findWhere(localeOptions, { value: this.state.design.locale || "en" }) || null,
          options: localeOptions,
          onChange: (locale: any) =>
            this.handleDesignChange(update(this.state.design, { locale: { $set: locale.value } }))
        }),

        R("h4", { style: { paddingTop: 10 } }, "Advanced"),
        R(
          ui.Checkbox,
          {
            value: this.state.design.implicitFiltersEnabled != null ? this.state.design.implicitFiltersEnabled : true,
            onChange: (value) =>
              this.handleDesignChange(update(this.state.design, { implicitFiltersEnabled: { $set: value } }))
          },
          "Enable Implicit Filtering (leave unchecked for new dashboards)"
        )
      )
    )
  }
}
