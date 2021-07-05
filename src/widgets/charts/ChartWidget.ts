// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ChartWidget
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import Widget from "./../Widget"
import DropdownWidgetComponent from "./../DropdownWidgetComponent"
import CsvBuilder from "./../../CsvBuilder"
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent"
import ChartViewComponent from "./ChartViewComponent"
import ModalWindowComponent from "react-library/lib/ModalWindowComponent"
import ui from "react-library/lib/bootstrap"

// A widget which is a chart
export default ChartWidget = class ChartWidget extends Widget {
  constructor(chart: any) {
    super()
    this.chart = chart
  }

  // Creates a view of the widget.
  // options:
  //  schema: schema to use
  //  dataSource: data source to use
  //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  //  design: widget design
  //  scope: scope of the widget (when the widget self-selects a particular scope)
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  //  onDesignChange: called with new design. null/undefined for readonly
  //  width: width in pixels on screen
  //  height: height in pixels on screen
  //  onRowClick: Called with (tableId, rowId) when item is clicked
  createViewElement(options: any) {
    return R(ChartWidgetComponent, {
      chart: this.chart,
      design: options.design,
      schema: options.schema,
      widgetDataSource: options.widgetDataSource,
      dataSource: options.dataSource,
      scope: options.scope,
      filters: options.filters,
      onScopeChange: options.onScopeChange,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height,
      onRowClick: options.onRowClick
    })
  }

  // Get the data that the widget needs. This will be called on the server, typically.
  //   design: design of the chart
  //   schema: schema to use
  //   dataSource: data source to get data from
  //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  //   callback: (error, data)
  getData(design: any, schema: any, dataSource: any, filters: any, callback: any) {
    // Clean design first
    design = this.chart.cleanDesign(design, schema)

    return this.chart.getData(design, schema, dataSource, filters, callback)
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: any, schema: any) {
    // Clean design first
    design = this.chart.cleanDesign(design, schema)

    return this.chart.getFilterableTables(design, schema)
  }

  // Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight() {
    return this.chart.isAutoHeight()
  }
}

interface ChartWidgetComponentProps {
  /** schema to use */
  schema: any
  /** data source to use */
  dataSource: any
  widgetDataSource: any
  /** Chart object to use */
  chart: any
  /** Design of chart */
  design: any
  /** null/undefined for readonly */
  onDesignChange?: any
  /** Data source to use for chart */
  dataSource: any
  width?: number
  height?: number
  /** scope of the widget (when the widget self-selects a particular scope) */
  scope?: any
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  filters?: any
  /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  onScopeChange?: any
  /** Called with (tableId, rowId) when item is clicked */
  onRowClick?: any
  /** Connects move handle for dragging (see WidgetContainerComponent) TODO REMOVE */
  connectMoveHandle?: any
  /** Connects resize handle for dragging (see WidgetContainerComponent) TODO REMOVE */
  connectResizeHandle?: any
}

// Complete chart widget
class ChartWidgetComponent extends React.PureComponent<ChartWidgetComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  constructor(props: any) {
    super(props)

    this.state = {
      // Design that is being edited. Change is propagated on closing window
      editDesign: null
    }
  }

  // Saves a csv file to disk
  handleSaveCsvFile = () => {
    // Get the data
    return this.props.widgetDataSource.getData(this.props.design, this.props.filters, (err: any, data: any) => {
      if (err) {
        return alert("Failed to get data")
      }

      // Create data table
      const table = this.props.chart.createDataTable(
        this.props.design,
        this.props.schema,
        this.props.dataSource,
        data,
        this.context.locale
      )
      if (!table) {
        return
      }

      // Convert to csv
      let csv = new CsvBuilder().build(table)

      // Add BOM
      csv = "\uFEFF" + csv

      // Make a blob and save
      const blob = new Blob([csv], { type: "text/csv" })

      // Require at use as causes server problems
      const FileSaver = require("file-saver")
      return FileSaver.saveAs(blob, "Exported Data.csv")
    })
  }

  handleStartEditing = () => {
    // Can't edit if already editing
    if (this.state.editDesign) {
      return
    }
    return this.setState({ editDesign: this.props.design })
  }

  handleEndEditing = () => {
    this.props.onDesignChange(this.state.editDesign)
    return this.setState({ editDesign: null })
  }

  handleCancelEditing = () => {
    return this.setState({ editDesign: null })
  }

  handleEditDesignChange = (design: any) => {
    return this.setState({ editDesign: design })
  }

  renderChart(design: any, onDesignChange: any, width: any, height: any) {
    return R(ChartViewComponent, {
      chart: this.props.chart,
      design,
      onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      widgetDataSource: this.props.widgetDataSource,
      scope: this.props.scope,
      filters: this.props.filters,
      width,
      height,
      onScopeChange: this.props.onScopeChange,
      onRowClick: this.props.onRowClick
    })
  }

  renderEditor() {
    if (!this.state.editDesign) {
      return null
    }

    // Create editor
    const editor = this.props.chart.createDesignerElement({
      schema: this.props.schema,
      filters: this.props.filters,
      dataSource: this.props.dataSource,
      design: this.state.editDesign,
      onDesignChange: this.handleEditDesignChange
    })

    if (this.props.chart.hasDesignerPreview()) {
      // Create chart (maxing out at half of width of screen)
      const chartWidth = Math.min(document.body.clientWidth / 2, this.props.width)
      const chartHeight = this.props.height * (chartWidth / this.props.width)
      const chart = this.renderChart(
        this.state.editDesign,
        (design: any) => this.setState({ editDesign: design }),
        chartWidth,
        chartHeight,
        chartWidth
      )

      const content = R(
        "div",
        { style: { height: "100%", width: "100%" } },
        R(
          "div",
          {
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              border: "solid 2px #EEE",
              borderRadius: 8,
              padding: 10,
              width: chartWidth + 20,
              height: chartHeight + 20,
              overflow: "hidden"
            }
          },
          chart
        ),
        R(
          "div",
          { style: { width: "100%", height: "100%", paddingLeft: chartWidth + 40 } },
          R(
            "div",
            {
              style: {
                width: "100%",
                height: "100%",
                overflowY: "auto",
                paddingLeft: 20,
                paddingRight: 20,
                borderLeft: "solid 3px #AAA"
              }
            },
            editor
          )
        )
      )

      return R(
        ModalWindowComponent,
        {
          isOpen: true,
          onRequestClose: this.handleEndEditing
        },
        content
      )
    } else {
      return R(
        ActionCancelModalComponent,
        {
          size: "large",
          onCancel: this.handleCancelEditing,
          onAction: this.handleEndEditing
        },
        editor
      )
    }
  }

  // Render a link to start editing
  renderEditLink() {
    return R(
      "div",
      { className: "mwater-visualization-widget-placeholder", onClick: this.handleStartEditing },
      R(ui.Icon, { id: this.props.chart.getPlaceholderIcon() })
    )
  }

  render() {
    const design = this.props.chart.cleanDesign(this.props.design, this.props.schema)

    // Determine if valid design
    const validDesign = !this.props.chart.validateDesign(design, this.props.schema)

    // Determine if empty
    const emptyDesign = this.props.chart.isEmpty(design)

    // Create dropdown items
    const dropdownItems = this.props.chart.createDropdownItems(
      design,
      this.props.schema,
      this.props.widgetDataSource,
      this.props.filters
    )
    if (validDesign) {
      dropdownItems.push({ label: "Export Data", icon: "save-file", onClick: this.handleSaveCsvFile })
    }
    if (this.props.onDesignChange != null) {
      dropdownItems.unshift({
        label: this.props.chart.getEditLabel(),
        icon: "pencil",
        onClick: this.handleStartEditing
      })
    }

    // Wrap in a simple widget
    return R(
      "div",
      {
        onDoubleClick: this.props.onDesignChange != null ? this.handleStartEditing : undefined,
        style: { position: "relative", width: this.props.width }
      },
      this.props.onDesignChange != null ? this.renderEditor() : undefined,
      React.createElement(
        DropdownWidgetComponent,
        {
          width: this.props.width,
          height: this.props.height,
          dropdownItems
        },
        this.renderChart(design, this.props.onDesignChange, this.props.width, this.props.height)
      ),
      (emptyDesign || !validDesign) && this.props.onDesignChange != null ? this.renderEditLink() : undefined
    )
  }
}
