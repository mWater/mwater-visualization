PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'
ui = require 'react-library/lib/bootstrap'
update = require 'react-library/lib/update'

Widget = require './Widget'
DropdownWidgetComponent = require './DropdownWidgetComponent'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')

# Table of contents widget that displays the h1, h2, etc entries from all text fields in one widget
# design is:
#   header: text of header. Defaults to "Contents"
#   borderWeight: border weight. Defaults to 0=None. 1=light, 2=medium, 3=heavy
#   numbering: true/false for prepending numbering to entries (e.g. 3.4.1)
module.exports = class TOCWidget extends Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design. null/undefined for readonly
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  tocEntries: entries in the table of contents
  #  onScrollToTOCEntry: called with (widgetId, tocEntryId) to scroll to TOC entry
  createViewElement: (options) ->
    return R TOCWidgetComponent,
      design: options.design
      onDesignChange: options.onDesignChange
      width: options.width
      height: options.height
      tocEntries: options.tocEntries
      onScrollToTOCEntry: options.onScrollToTOCEntry

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> true

class TOCWidgetComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: PropTypes.func # Called with new design. null/undefined for readonly

    width: PropTypes.number
    height: PropTypes.number
    tocEntries: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.any
      widgetId: PropTypes.string.isRequired
      level: PropTypes.number.isRequired
      text: PropTypes.string.isRequired
      }))
    onScrollToTOCEntry: PropTypes.func

  constructor: (props) ->
    super
    @state = { 
      editing: false # true if editing
    }  

  handleStartEditing: => @setState(editing: true)

  handleEndEditing: => @setState(editing: false)

  renderEditor: ->
    if not @state.editing
      return null

    # Create editor
    editor = R TOCWidgetDesignerComponent, 
      design: @props.design
      onDesignChange: @props.onDesignChange
    
    R ModalPopupComponent,
      showCloseX: true
      header: "Table of Contents Options"
      onClose: @handleEndEditing,
        editor

  renderContent: ->
    R TOCWidgetViewComponent, 
      design: @props.design
      onDesignChange: @props.onDesignChange
      width: @props.width
      height: @props.height
      tocEntries: @props.tocEntries
      onScrollToTOCEntry: @props.onScrollToTOCEntry

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return H.div onDoubleClick: @handleStartEditing, 
      if @props.onDesignChange?
        @renderEditor()
      R DropdownWidgetComponent, 
        width: @props.width
        height: @props.height
        dropdownItems: dropdownItems,
          @renderContent()

# Displays the contents of the widget
class TOCWidgetViewComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired # Design of chart
    onDesignChange: PropTypes.func # Called with new design. null/undefined for readonly

    width: PropTypes.number
    height: PropTypes.number

    tocEntries: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.any
      widgetId: PropTypes.string.isRequired
      level: PropTypes.number.isRequired
      text: PropTypes.string.isRequired
      }))
    onScrollToTOCEntry: PropTypes.func

  handleEntryClick: (tocEntry) =>
    @props.onScrollToTOCEntry?(tocEntry.widgetId, tocEntry.id)

  renderTOCEntry: (tocEntry, index) ->
    # Find indentation number (e.g "1.3.2") by counting # backwards that are same level with no level lower
    indentation = ""
    if @props.design.numbering
      for level in [1..tocEntry.level]
        value = 0
        for i2 in [0..index]
          if @props.tocEntries[i2].level == level
            value += 1
          else if @props.tocEntries[i2].level < level
            value = 0

        indentation += "#{value}."
      indentation += " "

    H.div key: index, style: { paddingLeft: tocEntry.level * 8 - 8 },
      H.a onClick: @handleEntryClick.bind(null, tocEntry), style: { cursor: "pointer" },
        indentation
        H.span null, tocEntry.text

  render: ->
    # Get border
    border = switch @props.design.borderWeight
      when 0 then "none"
      when 1 then "solid 1px #f4f4f4"
      when 2 then "solid 1px #ccc"
      when 3 then "solid 1px #888"

    # Render in a standard width container and then scale up to ensure that widget always looks consistent
    H.div 
      style: { 
        width: @props.standardWidth
        height: @props.height
        border: border
        padding: 5
        margin: 1
      },
      # Render header
      H.div style: { fontWeight: "bold" },
        @props.design.header
      _.map @props.tocEntries, (tocEntry, i) =>
        @renderTOCEntry(tocEntry, i)

      # Add placeholder if none and editable
      if @props.onDesignChange and @props.tocEntries.length == 0
        H.div className: "text-muted",
          "Table of Contents will appear here as text blocks with headings are added to the dashboard"

# Designer for TOC widget options
class TOCWidgetDesignerComponent extends React.Component 
  @propTypes: 
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired

  # Updates design with the specified changes
  update: => update(@props.design, @props.onDesignChange, arguments)

  handleMarkdownChange: (ev) =>
    design = _.extend({}, @props.design, markdown: ev.target.value)
    @props.onDesignChange(design)

  render: ->
    H.div null,
      R ui.FormGroup, label: "Header",
        R ui.TextInput, value: @props.design.header or "", onChange: @update("header"), placeholder: "None"
      R ui.FormGroup, label: "Border",
        R BorderComponent, value: @props.design.borderWeight or 0, onChange: @update("borderWeight")
      R ui.FormGroup, label: "Numbering",
        R ui.Radio, inline: true, value: @props.design.numbering or false, radioValue: true, onChange: @update("numbering"),
          "On"
        R ui.Radio, inline: true, value: @props.design.numbering or false, radioValue: false, onChange: @update("numbering"),
          "Off"

# Allows setting border heaviness
class BorderComponent extends React.Component
  @propTypes:
    value: PropTypes.number
    defaultValue: PropTypes.number
    onChange: PropTypes.func.isRequired

  render: ->
    value = if @props.value? then @props.value else @props.defaultValue

    H.div null,
      R ui.Radio, inline: true, value: value, radioValue: 0, onChange: @props.onChange,
        "None"
      R ui.Radio, inline: true, value: value, radioValue: 1, onChange: @props.onChange,
        "Light"
      R ui.Radio, inline: true, value: value, radioValue: 2, onChange: @props.onChange,
        "Medium"
      R ui.Radio, inline: true, value: value, radioValue: 3, onChange: @props.onChange,
        "Heavy"
