React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

uuid = require 'node-uuid'
Dropzone = require 'react-dropzone'

AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

DropdownWidgetComponent = require './DropdownWidgetComponent'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')
TabbedComponent = require('react-library/lib/TabbedComponent')
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent

module.exports = class ImageWidgetComponent extends AsyncLoadComponent
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly
    filters: React.PropTypes.array
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: React.PropTypes.object.isRequired

    width: React.PropTypes.number
    height: React.PropTypes.number

    singleRowTable: React.PropTypes.string  # Table that is filtered to have one row

  constructor: (props) ->
    super(props)

    @state = {
      # Widget data
      data: {}
      error: null
      editing: false
      imageURL: null
    }

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    # TODO load the expression value from the widget data source if needed
    return false

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # TODO load the expression value from the widget data source only if needed
    callback(null)
    return

    # Get data
    props.widgetDataSource.getData(props.filters, (error, data) =>
      callback(error: error, data: data )
    )

  handleStartEditing: =>
    @setState(editing: true, imageURL: @props.design.imageURL)

  handleEndEditing: =>
    @setState(editing: false)
  
  # TODO add editor 
  # TODO display "Click to edit" if image not specified: e.g.
  # Render a link to start editing
  # renderEditLink: ->
  #   H.div style: { position: "absolute", bottom: @props.height / 2, left: 0, right: 0, textAlign: "center" },
  #     H.a className: "btn btn-link", onClick: @handleStartEditing, "Click Here to Edit"

  renderEditor: ->
    if not @state.editing
      return null

    content = R TabbedComponent,
      tabs: [
        { id: "url", label: "From URL", elem: @renderUrlEditor() }
        { id: "upload", label: "Upload", elem: @renderUploadEditor() }
        { id: "expression", label: "From Expression", elem: @renderExpressionEditor() }
      ]
      initialTabId: "url"

    return R ModalPopupComponent,
      header: "Configure"
      showCloseX: true
      onClose: @handleEndEditing,
      content

  renderUrlEditor: ->
    H.div className: "form-group",
      H.label null, "URL to image"
      H.input type: "text", className: "form-control", value: @state.imageURL or "", onChange: (ev) => @setState(imageURL: ev.target.value)
      H.p className: "help-block",
        'e.g. http://lorempixel.com/sports/1'

  renderUploadEditor: ->
    H.div null,
      R Dropzone,
        onDrop: @onFileDrop,
        H.div null, "Drop files here or click to select files"

  renderExpressionEditor: ->
    H.div null,
      R FilterExprComponent,
        schema: @props.schema
        dataSource: @props.dataSource
        onChange: @handleFilterChange
        table: @props.design.table
        value: @props.design.filter

  onFileDrop: (files) =>
    console.log files

  handleFilterChange: (filter) =>
    console.log filter

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    R DropdownWidgetComponent, 
      width: @props.width
      height: @props.height
      dropdownItems: dropdownItems,
        @renderEditor()
        H.div style: { position: "relative", width: @props.width, height: @props.height, textAlign: "center" },
          H.img style: { maxWidth: "100%", maxHeight: "100%"}, src: "https://realfood.tesco.com/media/images/Orange-and-almond-srping-cake-hero-58d07750-0952-47eb-bc41-a1ef9b81c01a-0-472x310.jpg"
