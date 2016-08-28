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

  constructor: (props) ->
    super(props)

    @state = {
      # Widget data
      data: []
      error: null
      editing: false
      imageUrl: null
      expr: null
      table: null
      uid: null
      files: null
      uploading: false
      currentTab: "url"
    }

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) ->
    return newProps.design.expr and (not _.isEqual(newProps.design.expr, oldProps.design.expr) or not _.isEqual(newProps.filters, oldProps.filters))

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # Get data
    props.widgetDataSource.getData(props.design, props.filters, (error, data) =>
      callback(error: error, data: data )
    )
    
  setCurrentTab: ->
    tab = "upload"

    if @props.design.url then tab = "url"
    if @props.design.expr then tab = "expression"

    @setState(currentTab: tab)

  handleStartEditing: =>
    @setCurrentTab()
    state =
      editing: true
      imageUrl: @props.design.imageUrl
      uid: @props.design.uid
      expr: @props.design.expr
      table: @props.design.expr?.table

    @setState(state)

  handleTableChange: (table) => @setState(table: table)

  # Render a link to start editing
  renderEditLink: ->
    H.div style: { position: "absolute", bottom: @props.height / 2, left: 0, right: 0, textAlign: "center" },
      H.a className: "btn btn-link", onClick: @handleStartEditing, "Click Here to Edit"

  onSave: () =>
    @setState(editing: false)
    updates =
      imageUrl: @state.imageUrl
      uid: @state.uid
      expr: @state.expr

    @props.onDesignChange(_.extend({}, @props.design, updates))
    return

  onCancel: () =>
    @setCurrentTab()
    @setState(editing: false, imageUrl: null, uid: null, expr: null, table: null, files: null, uploading: false)

  renderEditor: ->
    if not @state.editing
      return null

    content = R TabbedComponent,
      tabs: [
        { id: "upload", label: "Upload", elem: @renderUploadEditor() }
        { id: "expression", label: "From Data", elem: @renderExpressionEditor() }
        { id: "url", label: "From URL", elem: @renderUrlEditor() }
      ]
      initialTabId: @state.currentTab

    footer =
      H.div null,
        H.button(key: "save", type: "button", className: "btn btn-primary", onClick: @onSave, "Save")
        H.button(key: "cancel", type: "button", className: "btn btn-default", onClick: @onCancel, "Cancel")

    return R ModalPopupComponent,
      header: if @props.design.url or @props.design.expr or @props.design.uid then "Edit Image" else "Insert Image"
      onClose: @handleEndEditing
      scrollDisabled: true
      footer: footer,
      content

  renderUrlEditor: ->
    H.div className: "form-group",
      H.label null, "URL of image"
      H.input type: "text", className: "form-control", value: @state.imageUrl or "", onChange: @onUrlChange
      H.p className: "help-block",
        'e.g. http://somesite.com/image.jpg'

  onUrlChange: (e) =>
    @setState(imageUrl: e.target.value, uid: null, expr: null)

  renderUploadEditor: ->
    R ImageUploaderComponent,
      dataSource: @props.dataSource
      onUpload: @onFileUpload
      uid: @props.design.uid

  onFileUpload: (uid) =>
    @setState(imageUrl: null, uid: uid, expr: null)

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

  handleExpressionChange: (expr) =>
    @setState(imageUrl: null, uid: null, expr: expr)

  renderContent: ->
    if @props.design.imageUrl or @props.design.uid
      source = @props.design.imageUrl or @props.widgetDataSource.getImageUrl(@props.design.uid, 1024)
      H.img style: { maxWidth: "100%", maxHeight: "100%"}, src: source
    else
      @renderExpression()

  renderExpression: ->
    if @state.loading
      H.span null, "Loading"
    else if @state.data
      R ImagelistCarouselComponent,
        widgetDataSource: @props.widgetDataSource
        imagelist: @state.data
        height: @props.height

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
          H.div style: { position: "relative", width: @props.width, height: @props.height, textAlign: "center" },
            @renderContent()

          