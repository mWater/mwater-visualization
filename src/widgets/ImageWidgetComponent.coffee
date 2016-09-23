React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

uuid = require 'node-uuid'
Dropzone = require 'react-dropzone'

AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'
AutoSizeComponent = require('react-library/lib/AutoSizeComponent')

DropdownWidgetComponent = require './DropdownWidgetComponent'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')
TabbedComponent = require('react-library/lib/TabbedComponent')
ExprComponent = require("mwater-expressions-ui").ExprComponent
TableSelectComponent = require '../TableSelectComponent'
ImageUploaderComponent = require './ImageUploaderComponent'
ImagelistCarouselComponent = require './ImagelistCarouselComponent'

module.exports = class ImageWidgetComponent extends AsyncLoadComponent
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly
    filters: React.PropTypes.array
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for widget
    widgetDataSource: React.PropTypes.object.isRequired

    width: React.PropTypes.number
    height: React.PropTypes.number

    singleRowTable: React.PropTypes.string  # Table that is filtered to have one row

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) ->
    return newProps.design.expr and (not _.isEqual(newProps.design.expr, oldProps.design.expr) or not _.isEqual(newProps.filters, oldProps.filters))

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # Get data
    props.widgetDataSource.getData(props.design, props.filters, (error, data) =>
      callback(error: error, data: data )
    )
    
  handleStartEditing: =>
    @refs.editor.edit()

  # Render a link to start editing
  renderEditLink: ->
    H.div style: { position: "absolute", bottom: @props.height / 2, left: 0, right: 0, textAlign: "center" },
      H.a className: "btn btn-link", onClick: @handleStartEditing, "Click Here to Edit"

  renderEditor: ->
    R ImageWidgetDesignComponent,
      ref: "editor"
      key: "editor"
      design: @props.design
      onDesignChange: @props.onDesignChange
      schema: @props.schema
      dataSource: @props.dataSource

  renderExpression: ->
    if @state.loading
      H.span null, "Loading"
    else if @state.data
      # Make into array if not
      if not _.isArray(@state.data)
        R AutoSizeComponent, { injectHeight: true }, 
          (size) =>
            R ImagelistCarouselComponent,
              widgetDataSource: @props.widgetDataSource
              imagelist: [@state.data]
              height: size.height
      else
        R AutoSizeComponent, { injectHeight: true }, 
          (size) =>
            R ImagelistCarouselComponent,
              widgetDataSource: @props.widgetDataSource
              imagelist: @state.data
              height: size.height

  renderContent: ->
    if @props.design.imageUrl or @props.design.uid
      # Determine approximate height
      imageHeight = null

      if @props.height <= 160
        imageHeight = 160
      else if @props.height <= 320
        imageHeight = 320
      else if @props.height <= 640
        imageHeight = 640
      else if @props.height <= 1280
        imageHeight = 1280

      source = @props.design.imageUrl or @props.widgetDataSource.getImageUrl(@props.design.uid, imageHeight)
      H.img style: { maxWidth: "100%", maxHeight: "100%"}, src: source
    else
      @renderExpression()

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    R DropdownWidgetComponent, 
      width: @props.width
      height: @props.height
      dropdownItems: dropdownItems,
        @renderEditor()
        if not @props.design.imageUrl and not @props.design.expr and not @props.design.uid and @props.onDesignChange
          @renderEditLink()
        else
          H.div className: "mwater-visualization-image-widget", style: { position: "relative", width: @props.width, height: @props.height },
            H.div className: "image",
              @renderContent()
            H.div className: "caption", @props.design.caption
  
class ImageWidgetDesignComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for widget

  constructor: (props) ->
    super(props)

    @state = {
      # Widget data
      data: null
      error: null
      editing: false
      imageUrl: null
      expr: null
      table: null
      uid: null
      files: null
      uploading: false
      caption: null
      currentTab: "url"
    }

  edit: =>
    @setCurrentTab()
    state =
      editing: true
      imageUrl: @props.design.imageUrl
      uid: @props.design.uid
      expr: @props.design.expr
      table: @props.design.expr?.table
      caption: @props.design.caption

    @setState(state)

  setCurrentTab: ->
    tab = "upload"

    if @props.design.url then tab = "url"
    if @props.design.expr then tab = "expression"

    @setState(currentTab: tab)

  handleUrlChange: (e) =>
    @setState(imageUrl: e.target.value, uid: null, expr: null)

  renderUploadEditor: ->
    R ImageUploaderComponent,
      dataSource: @props.dataSource
      onUpload: @handleFileUpload
      uid: @props.design.uid

  handleFileUpload: (uid) =>
    @setState(imageUrl: null, uid: uid, expr: null)

  handleExpressionChange: (expr) =>
    @setState(imageUrl: null, uid: null, expr: expr)

  handleTableChange: (table) => @setState(table: table)
  handleCaptionChange: (ev) => @setState(caption: ev.target.value)

  handleSave: () =>
    @setState(editing: false)
    updates =
      imageUrl: @state.imageUrl
      uid: @state.uid
      expr: @state.expr
      caption: @state.caption

    @props.onDesignChange(_.extend({}, @props.design, updates))

  handleCancel: () =>
    @setCurrentTab()
    @setState(editing: false, imageUrl: null, uid: null, expr: null, table: null, files: null, uploading: false)

  renderExpressionEditor: ->
    H.div className: "form-group",
      H.label className: "text-muted",
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R(TableSelectComponent, { schema: @props.schema, value: @state.table, onChange: @handleTableChange })
      H.br()

      if @state.table
        H.div className: "form-group",
          H.label className: "text-muted",
            "Field"
          ": "
          R ExprComponent,
            schema: @props.schema
            dataSource: @props.dataSource
            table: @state.table
            types: ['image', 'imagelist']
            value: @state.expr
            aggrStatuses: ["individual", "literal"]
            onChange: @handleExpressionChange

  renderUrlEditor: ->
    H.div className: "form-group",
      H.label null, "URL of image"
      H.input type: "text", className: "form-control", value: @state.imageUrl or "", onChange: @handleUrlChange
      H.p className: "help-block",
        'e.g. http://somesite.com/image.jpg'

  render: ->
    if not @state.editing
      return null

    content = H.div null,
      H.div className: "form-group",
        H.label null, "Caption"
        H.input type: "text", className: "form-control", value: @state.caption or "", onChange: @handleCaptionChange, placeholder: "Optional caption to display below image"

      R TabbedComponent,
        tabs: [
          { id: "upload", label: "Upload", elem: @renderUploadEditor() }
          { id: "expression", label: "From Data", elem: @renderExpressionEditor() }
          { id: "url", label: "From URL", elem: @renderUrlEditor() }
        ]
        initialTabId: @state.currentTab

    footer =
      H.div null,
        H.button(key: "save", type: "button", className: "btn btn-primary", onClick: @handleSave, "Save")
        H.button(key: "cancel", type: "button", className: "btn btn-default", onClick: @handleCancel, "Cancel")

    return R ModalPopupComponent,
      header: "Image"
      scrollDisabled: true
      footer: footer,
        content
