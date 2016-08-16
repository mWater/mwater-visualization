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

module.exports = class ImageWidgetComponent extends AsyncLoadComponent
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly
    filters: React.PropTypes.array
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: React.PropTypes.object.isRequired

    apiUrl: React.PropTypes.string.isRequired
    client: React.PropTypes.string.isRequired

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
    
  setCurrentTab: ->
    tab = "url"

    if @props.design.uid then tab = "upload"
    if @props.design.expr then tab = "expression"

    @setState(currentTab: tab)

  handleStartEditing: =>
    @setCurrentTab()
    @setState(editing: true, imageUrl: @props.design.imageUrl, uid: @props.design.uid, expr: @props.design.expr)

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
    @setState(editing: false, imageUrl: null, uid: null, expr: null)

  renderEditor: ->
    if not @state.editing
      return null

    content = R TabbedComponent,
      tabs: [
        { id: "url", label: "From URL", elem: @renderUrlEditor() }
        { id: "upload", label: "Upload", elem: @renderUploadEditor() }
        { id: "expression", label: "From Expression", elem: @renderExpressionEditor() }
      ]
      initialTabId: @state.currentTab

    footer =
      H.div null,
        H.button(type: "button", className: "btn btn-default", onClick: @onSave, "Save")
        H.button(type: "button", className: "btn btn-danger", onClick: @onCancel, "Cancel")

    return R ModalPopupComponent,
      header: "Configure"
      onClose: @handleEndEditing
      footer: footer,
      content

  renderUrlEditor: ->
    H.div className: "form-group",
      H.label null, "URL to image"
      H.input type: "text", className: "form-control", value: @state.imageUrl or "", onChange: @onUrlChange
      H.p className: "help-block",
        'e.g. http://somesite.com/image.jpg'

  onUrlChange: (e) =>
    @setState(imageUrl: e.target.value, uid: null, expr: null)

  renderUploadEditor: ->
    R ImageUploaderComponent,
      apiUrl: @props.apiUrl
      client: @props.client
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
    @setState(expr: expr)

  renderContent: ->
    if @props.design.imageUrl or @props.design.uid
      source = @props.design.imageUrl or @props.apiUrl + "images/"+@props.design.uid
      H.img style: { maxWidth: "100%", maxHeight: "100%"}, src: source
    else
      @renderExpression()

  renderExpression: ->
    H.img style: { maxWidth: "100%", maxHeight: "100%"}, src: "https://img0.etsystatic.com/119/0/6281042/il_570xN.1025495956_8oux.jpg"

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    R DropdownWidgetComponent, 
      width: @props.width
      height: @props.height
      dropdownItems: dropdownItems,
        @renderEditor()
        if not @props.design.imageUrl and not @props.design.expr and not @props.design.uid
          @renderEditLink()
        else
          H.div style: { position: "relative", width: @props.width, height: @props.height, textAlign: "center" },
            @renderContent()
