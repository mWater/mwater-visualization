PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
_ = require 'lodash'

Widget = require './Widget'
DropdownWidgetComponent = require './DropdownWidgetComponent'

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
    return React.createElement(TOCWidgetComponent,
      design: options.design
      onDesignChange: options.onDesignChange
      width: options.width
      height: options.height
      tocEntries: options.tocEntries
      onScrollToTOCEntry: options.onScrollToTOCEntry
    )

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

  # TODO Allow editing?
  # constructor: (props) ->
  #   super
  #   @state = { 
  #     # Design that is being edited. Change is propagated on closing window
  #     editDesign: null
  #   }  

  # handleStartEditing: =>
  #   @setState(editDesign: @props.design)

  # handleEndEditing: =>
  #   @props.onDesignChange(@state.editDesign)
  #   @setState(editDesign: null)

  # handleEditDesignChange: (design) =>
  #   @setState(editDesign: design)

  # renderEditor: ->
  #   if not @state.editDesign
  #     return null

  #   # Create editor
  #   editor = React.createElement(MarkdownWidgetDesignerComponent, 
  #     design: @state.editDesign
  #     onDesignChange: @handleEditDesignChange
  #   )

  #   # Create item (maxing out at half of width of screen)
  #   width = Math.min(document.body.clientWidth/2, @props.width)
  #   chart = @renderContent(@state.editDesign)

  #   content = H.div style: { height: "100%", width: "100%" },
  #     H.div style: { position: "absolute", left: 0, top: 0, border: "solid 2px #EEE", borderRadius: 8, padding: 10, width: width + 20, height: @props.height + 20 },
  #       chart
  #     H.div style: { width: "100%", height: "100%", paddingLeft: width + 40 },
  #       H.div style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" },
  #         editor

  #   React.createElement(ModalWindowComponent,
  #     isOpen: @state.editing
  #     onRequestClose: (=> @setState(editing: false)),
  #       content)

  render: ->
    React.createElement(TOCWidgetViewComponent, {
      design: @props.design
      onDesignChange: @props.onDesignChange
      width: @props.width
      height: @props.height
      tocEntries: @props.tocEntries
      onScrollToTOCEntry: @props.onScrollToTOCEntry
    })

  # renderContent: (design) ->
  #   React.createElement(TOCWidgetViewComponent, {
  #     design: design
  #     width: @props.width
  #     height: @props.height
  #     tocEntries: @props.tocEntries
  #     onScrollToTOCEntry: @props.onScrollToTOCEntry
  #   })

  # render: ->
  #   dropdownItems = []
  #   if @props.onDesignChange?
  #     dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

  #   # Wrap in a simple widget
  #   return H.div onDoubleClick: @handleStartEditing, 
  #     # if @props.onDesignChange?
  #     #   @renderEditor()
  #     React.createElement(DropdownWidgetComponent, 
  #       width: @props.width
  #       height: @props.height
  #       dropdownItems: dropdownItems,
  #         @renderContent(@props.design)
  #     )


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
    for level in [1..tocEntry.level]
      value = 0
      for i2 in [0..index]
        if @props.tocEntries[i2].level == level
          value += 1
        else if @props.tocEntries[i2].level < level
          value = 0

      indentation += "#{value}."

    H.div key: index, style: { paddingLeft: tocEntry.level * 8 - 8 },
      H.a onClick: @handleEntryClick.bind(null, tocEntry), style: { cursor: "pointer" },
        indentation
        " "
        H.span null, tocEntry.text

  render: ->
    # Render in a standard width container and then scale up to ensure that widget always looks consistent
    H.div 
      style: { 
        width: @props.standardWidth
        height: @props.height
      },
      _.map @props.tocEntries, (tocEntry, i) =>
        @renderTOCEntry(tocEntry, i)
      # Add placeholder if none and editable
      if @props.onDesignChange and @props.tocEntries.length == 0
        H.div className: "text-muted",
          "Table of Contents will appear here as text blocks with headings are added to the dashboard"

