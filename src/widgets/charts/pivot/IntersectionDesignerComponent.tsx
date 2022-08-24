import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import * as ui from "react-library/lib/bootstrap"
import update from "react-library/lib/update"
import { default as Rcslider } from "rc-slider"
import AxisComponent from "../../../axes/AxisComponent"
import ColorComponent from "../../../ColorComponent"
import { FilterExprComponent } from "mwater-expressions-ui"
import { ExprComponent } from "mwater-expressions-ui"
import { DataSource, Expr, Schema } from "mwater-expressions"
import { PivotChartIntersection } from "./PivotChartDesign"
import { JsonQLFilter } from "../../../JsonQLFilter"
import { ListEditorComponent } from "react-library/lib/ListEditorComponent"

export interface IntersectionDesignerComponentProps {
  intersection: PivotChartIntersection
  table: string
  schema: Schema
  dataSource: DataSource
  onChange: (intersection: PivotChartIntersection) => void
  filters?: JsonQLFilter[]
}

// Design an intersection of a pivot table
export default class IntersectionDesignerComponent extends React.Component<IntersectionDesignerComponentProps> {
  constructor(props: IntersectionDesignerComponentProps) {
    super(props)

    this.update = this.update.bind(this)
  }

  // Updates intersection with the specified changes
  update(...args: any[]) {
    return update(this.props.intersection, this.props.onChange, arguments)
  }

  handleBackgroundColorAxisChange = (backgroundColorAxis: any) => {
    const opacity = this.props.intersection.backgroundColorOpacity || 1
    return this.update({ backgroundColorAxis, backgroundColorOpacity: opacity })
  }

  handleBackgroundColorChange = (backgroundColor: any) => {
    const opacity = this.props.intersection.backgroundColorOpacity || 1
    return this.update({ backgroundColor, backgroundColorOpacity: opacity })
  }

  handleBackgroundColorConditionsChange = (backgroundColorConditions: any) => {
    const opacity = this.props.intersection.backgroundColorOpacity || 1
    return this.update({ backgroundColorConditions, backgroundColorOpacity: opacity })
  }

  handleBackgroundColorOpacityChange = (newValue: any) => {
    return this.update({ backgroundColorOpacity: newValue / 100 })
  }

  handleFilterChange = (filter: any) => {
    return this.update({ filter })
  }

  renderValueAxis() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: "Calculation",
        help: "This is the calculated value that is displayed. Leave as blank to make an empty section"
      },
      R(AxisComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        types: ["enum", "text", "boolean", "date", "number"],
        aggrNeed: "required",
        value: this.props.intersection.valueAxis,
        onChange: this.update("valueAxis"),
        showFormat: true,
        filters: this.props.filters
      })
    )
  }

  renderNullValue() {
    if (this.props.intersection.valueAxis) {
      return R(
        ui.FormGroup,
        {
          labelMuted: true,
          label: "Show Empty Cells as"
        },
        R(ui.TextInput, {
          value: this.props.intersection.valueAxis.nullLabel ?? null,
          emptyNull: true,
          onChange: this.update("valueAxis.nullLabel"),
          placeholder: "Blank"
        })
      )
    }
  }

  renderFilter() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: [R(ui.Icon, { id: "glyphicon-filter" }), " Filters"]
      },
      R(FilterExprComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onChange: this.handleFilterChange,
        table: this.props.table,
        value: this.props.intersection.filter
      })
    )
  }

  renderStyling() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        key: "styling",
        label: "Styling"
      },
      R(
        ui.Checkbox,
        { key: "bold", inline: true, value: this.props.intersection.bold, onChange: this.update("bold") },
        "Bold"
      ),
      R(
        ui.Checkbox,
        { key: "italic", inline: true, value: this.props.intersection.italic, onChange: this.update("italic") },
        "Italic"
      )
    )
  }

  renderBackgroundColorConditions() {
    return R(BackgroundColorConditionsComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      colorConditions: this.props.intersection.backgroundColorConditions,
      onChange: this.handleBackgroundColorConditionsChange
    })
  }

  renderBackgroundColorAxis() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: "Background Color From Values",
        help: "This is an optional background color to set on cells that is controlled by the data"
      },
      R(AxisComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        types: ["enum", "text", "boolean", "date"],
        aggrNeed: "required",
        value: this.props.intersection.backgroundColorAxis,
        onChange: this.handleBackgroundColorAxisChange,
        showColorMap: true,
        filters: this.props.filters
      })
    )
  }

  renderBackgroundColor() {
    if (this.props.intersection.backgroundColorAxis) {
      return
    }

    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: "Background Color",
        help: "This is an optional background color to set on all cells"
      },
      R(ColorComponent, {
        color: this.props.intersection.backgroundColor,
        onChange: this.handleBackgroundColorChange
      })
    )
  }

  renderBackgroundColorOpacityControl() {
    if (
      !this.props.intersection.backgroundColorAxis &&
      !this.props.intersection.backgroundColor &&
      !this.props.intersection.backgroundColorConditions?.[0]
    ) {
      return
    }

    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: `Background Opacity: ${Math.round((this.props.intersection.backgroundColorOpacity ?? 1) * 100)}%`
      },
      R(Rcslider, {
        min: 0,
        max: 100,
        step: 1,
        tipTransitionName: "rc-slider-tooltip-zoom-down",
        value: (this.props.intersection.backgroundColorOpacity ?? 1) * 100,
        onChange: this.handleBackgroundColorOpacityChange
      })
    )
  }

  render() {
    return R(
      "div",
      null,
      this.renderValueAxis(),
      this.renderNullValue(),
      this.renderFilter(),
      this.renderStyling(),
      this.renderBackgroundColorAxis(),
      this.renderBackgroundColorConditions(),
      this.renderBackgroundColor(),
      this.renderBackgroundColorOpacityControl()
    )
  }
}

interface BackgroundColorConditionsComponentProps {
  colorConditions?: { condition?: Expr, color?: string }[]
  table: string
  schema: Schema
  dataSource: DataSource
  onChange: (colorConditions?: { condition?: Expr, color?: string }[]) => void
}

/** Displays background color conditions */
class BackgroundColorConditionsComponent extends React.Component<BackgroundColorConditionsComponentProps> {
  handleAdd = () => {
    const colorConditions = (this.props.colorConditions || []).slice()
    colorConditions.push({})
    this.props.onChange(colorConditions)
  }

  render() {
    // List conditions
    return R(
      ui.FormGroup,
      {
        label: "Color Conditions",
        labelMuted: true,
        help: "Add conditions that, if met, set the color of the cell. Useful for flagging certain values"
      },
      <ListEditorComponent<{ condition?: Expr, color?: string }>
        items={this.props.colorConditions || []}
        renderItem={(item, index, onItemChange) => {
          return R(BackgroundColorConditionComponent, {
            key: index,
            colorCondition: item,
            table: this.props.table,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: onItemChange
          })
        }}
        onItemsChange={this.props.onChange}
      />,
      R(
        ui.Button,
        { type: "link", size: "sm", onClick: this.handleAdd },
        R(ui.Icon, { id: "fa-plus" }),
        " Add Condition"
      )
    )
  }
}

interface BackgroundColorConditionComponentProps {
  colorCondition: any
  table: string
  schema: Schema
  dataSource: DataSource
  onChange: any
}

// Displays single background color condition
class BackgroundColorConditionComponent extends React.Component<BackgroundColorConditionComponentProps> {
  constructor(props: BackgroundColorConditionComponentProps) {
    super(props)
    this.update = this.update.bind(this)
  }

  // Updates intersection with the specified changes
  update(...args: any[]) {
    return update(this.props.colorCondition, this.props.onChange, arguments)
  }

  render() {
    return R(
      "div", {},
      R(
        ui.FormGroup,
        {
          labelMuted: true,
          label: "Condition"
        },
        R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.update("condition"),
          types: ["boolean"],
          aggrStatuses: ["aggregate", "literal"],
          table: this.props.table,
          value: this.props.colorCondition.condition
        })
      ),

      R(
        ui.FormGroup,
        {
          labelMuted: true,
          label: "Color",
          hint: "Color to display when condition is met"
        },
        R(ColorComponent, {
          color: this.props.colorCondition.color,
          onChange: this.update("color")
        })
      )
    )
  }
}
