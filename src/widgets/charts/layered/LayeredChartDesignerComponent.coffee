PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
LayeredChartLayerDesignerComponent = require './LayeredChartLayerDesignerComponent'
LayeredChartCompiler = require './LayeredChartCompiler'
TabbedComponent = require('react-library/lib/TabbedComponent')
uiComponents = require '../../../UIComponents'
ui = require('react-library/lib/bootstrap')

module.exports = class LayeredChartDesignerComponent extends React.Component
  @propTypes: 
    design: PropTypes.object.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  # Determine if axes labels needed
  areAxesLabelsNeeded: (layer) ->
    return @props.design.type not in ['pie', 'donut']

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTypeChange: (type) =>
    @updateDesign(type: type)

  handleTransposeChange: (ev) =>
    @updateDesign(transpose: ev.target.checked)

  handleStackedChange: (ev) => @updateDesign(stacked: ev.target.checked)
  handleProportionalChange: (ev) => @updateDesign(proportional: ev.target.checked)
  handleLabelsChange: (ev) => @updateDesign(labels: ev.target.checked)

  handleYThresholdsChange: (yThresholds) => @updateDesign(yThresholds: yThresholds)

  handleLayerChange: (index, layer) =>
    layers = @props.design.layers.slice()
    layers[index] = layer
    @updateDesign(layers: layers)

  handleRemoveLayer: (index) =>
    layers = @props.design.layers.slice()
    layers.splice(index, 1)
    @updateDesign(layers: layers)

  handleAddLayer: =>
    layers = @props.design.layers.slice()
    layers.push({})
    @updateDesign(layers: layers)

  handleXAxisLabelTextChange: (ev) =>  @updateDesign(xAxisLabelText: ev.target.value)
  handleYAxisLabelTextChange: (ev) =>  @updateDesign(yAxisLabelText: ev.target.value)

  handleToggleXAxisLabelClick: (ev) =>
    @updateDesign(xAxisLabelText: if @props.design.xAxisLabelText? then null else "")

  handleToggleYAxisLabelClick: (ev) =>
    @updateDesign(yAxisLabelText: if @props.design.yAxisLabelText? then null else "")

  renderLabels: ->
    if not @props.design.type
      return 

    compiler = new LayeredChartCompiler(schema: @props.schema)

    R 'div', null,
      R 'p', className: "help-block", "To edit title of chart, click on it directly"
      if @areAxesLabelsNeeded()
        R 'div', className: "form-group",
          R 'span', null,
            R 'label', className: "text-muted", if @props.design.transpose then "Vertical Axis Label" else "Horizontal Axis Label"
            " ",
            R('button', {className: "btn btn-default btn-xs", onClick: @handleToggleXAxisLabelClick}, if @props.design.xAxisLabelText? then "Hide" else "Show")
          if @props.design.xAxisLabelText?
            R 'input', type: "text", className: "form-control input-sm", value: @props.design.xAxisLabelText, onChange: @handleXAxisLabelTextChange, placeholder: compiler.compileDefaultXAxisLabelText(@props.design)
      if @areAxesLabelsNeeded()
        R 'div', className: "form-group",
          R 'span', null,
            R('label', {className: "text-muted"}, if not @props.design.transpose then "Vertical Axis Label" else "Horizontal Axis Label"),
            " ",
            R('button', {className: "btn btn-default btn-xs", onClick: @handleToggleYAxisLabelClick}, if @props.design.yAxisLabelText? then "Hide" else "Show")
          if @props.design.yAxisLabelText?
            R 'input', type: "text", className: "form-control input-sm", value: @props.design.yAxisLabelText, onChange: @handleYAxisLabelTextChange, placeholder: compiler.compileDefaultYAxisLabelText(@props.design)

  renderType: ->
    chartTypes =  [
      { id: "bar", name: "Bar", desc: "Best for most charts" }
      { id: "pie", name: "Pie", desc: "Compare ratios of one variable" }
      { id: "donut", name: "Donut", desc: "Pie chart with center removed" }
      { id: "line", name: "Line", desc: "Show how data changes smoothly over time" }
      { id: "spline", name: "Smoothed Line", desc: "For noisy data over time" }
      { id: "scatter", name: "Scatter", desc: "Show correlation between two number variables" }
      { id: "area", name: "Area", desc: "For cumulative data over time" }
    ]

    current = _.findWhere(chartTypes, { id: @props.design.type })

    R uiComponents.SectionComponent, icon: "glyphicon-th", label: "Chart Type",
      R uiComponents.ToggleEditComponent,
        forceOpen: not @props.design.type
        label: if current then current.name else ""
        editor: (onClose) =>
          R uiComponents.OptionListComponent, 
            hint: "Select a Chart Type"
            items: _.map(chartTypes, (ct) => { 
              name: ct.name
              desc: ct.desc
              onClick: () =>
                onClose() # Close editor first
                @handleTypeChange(ct.id)
            })
      @renderOptions()

  renderLayer: (index) =>
    style = {
      paddingTop: 10
      paddingBottom: 10
    }
    R 'div', style: style, key: index,
      R(LayeredChartLayerDesignerComponent, {
        design: @props.design
        schema: @props.schema
        dataSource: @props.dataSource
        index: index
        filters: @props.filters
        onChange: @handleLayerChange.bind(null, index)
        onRemove: @handleRemoveLayer.bind(null, index)
        })

  renderLayers: ->
    if not @props.design.type
      return 

    R 'div', null, 
      _.map(@props.design.layers, (layer, i) => @renderLayer(i))
      # Only add if last has table
      if @props.design.layers.length > 0 and _.last(@props.design.layers).table
        R 'button', className: "btn btn-link", type: "button", onClick: @handleAddLayer,
          R 'span', className: "glyphicon glyphicon-plus"
          " Add Another Series"

  renderOptions: ->
    design = @props.design
    if not design.type
      return 

    # Can only stack if multiple series or one with color and not polar
    canStack = design.type not in ['pie', 'donut'] and design.layers.length > 0
    if design.layers.length == 1 and not design.layers[0].axes.color
      canStack = false

    # Don't include if transpose
    canTranspose = design.type not in ['pie', 'donut']

    R 'div', className: "text-muted",
      if canTranspose
        R 'label', className: "checkbox-inline", key: "transpose",
          R 'input', type: "checkbox", checked: design.transpose, onChange: @handleTransposeChange
          "Horizontal"
      if canStack
        R 'label', className: "checkbox-inline", key: "stacked",
          R 'input', type: "checkbox", checked: design.stacked, onChange: @handleStackedChange
          "Stacked"
      if canStack
        R 'label', className: "checkbox-inline", key: "proportional",
          R 'input', type: "checkbox", checked: design.proportional, onChange: @handleProportionalChange
          "Proportional"
      R 'label', className: "checkbox-inline", key: "labels",
        R 'input', type: "checkbox", checked: design.labels or false, onChange: @handleLabelsChange
        "Show Values"

  renderThresholds: ->
    # Doesn't apply to polar
    if @props.design.type not in ['pie', 'donut']
      R uiComponents.SectionComponent, label: "Y Threshold Lines",
        R ThresholdsComponent, 
          thresholds: @props.design.yThresholds
          onThresholdsChange: @handleYThresholdsChange

  render: ->
    tabs = []

    tabs.push {
      id: "design"
      label: "Design"
      elem: R 'div', null, 
        R('br')
        @renderType()
        @renderLayers()
        @renderThresholds()
    }

    if @props.design.type
      tabs.push {
        id: "labels"
        label: "Labels"
        elem: R 'div', null,
          R('br')
          @renderLabels()
      }

    R TabbedComponent,
      initialTabId: "design"
      tabs: tabs      

# Thresholds are lines that are added at certain values
class ThresholdsComponent extends React.Component
  @propTypes: 
    thresholds: PropTypes.arrayOf(PropTypes.shape(value: PropTypes.number, label: PropTypes.string))
    onThresholdsChange: PropTypes.func.isRequired

  handleAdd: =>
    thresholds = (@props.thresholds or []).slice()
    thresholds.push({ value: null, label: "" })
    @props.onThresholdsChange(thresholds)

  handleChange: (index, value) =>
    thresholds = (@props.thresholds or []).slice()
    thresholds[index] = value
    @props.onThresholdsChange(thresholds)

  handleRemove: (index) =>
    thresholds = (@props.thresholds or []).slice()
    thresholds.splice(index, 1)
    @props.onThresholdsChange(thresholds)

  render: ->
    R 'div', null,
      _.map @props.thresholds, (threshold, index) =>
        R ThresholdComponent, threshold: threshold, onThresholdChange: @handleChange.bind(null, index), onRemove: @handleRemove.bind(null, index)

      R 'button', type: "button", className: "btn btn-xs btn-link", onClick: @handleAdd,
        R 'i', className: "fa fa-plus"
        " Add Y Threshold"

class ThresholdComponent extends React.Component
  @propTypes: 
    threshold: PropTypes.shape(value: PropTypes.number, label: PropTypes.string).isRequired
    onThresholdChange: PropTypes.func.isRequired
    onRemove: PropTypes.func.isRequired

  render: ->
    R 'div', null,
      R LabeledInlineComponent, key: "value", label: "Value:",
        R ui.NumberInput, style: { display: "inline-block" }, size: "sm", value: @props.threshold.value, onChange: (v) => @props.onThresholdChange(_.extend({}, @props.threshold, value: v))
      "  "
      R LabeledInlineComponent, key: "label", label: "Label:",
        R ui.TextInput, style: { display: "inline-block", width: "8em" }, size: "sm", value: @props.threshold.label, onChange: (v) => @props.onThresholdChange(_.extend({}, @props.threshold, label: v))
      "  "
      R 'button', className: "btn btn-xs btn-link", onClick: @props.onRemove, 
        R 'i', className: "fa fa-remove"

LabeledInlineComponent = (props) ->
  R 'div', style: { display: "inline-block" },
    R 'label', className: "text-muted", props.label
    props.children
