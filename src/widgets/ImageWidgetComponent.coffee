PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'
classNames = require('classnames')
ui = require('react-library/lib/bootstrap')

uuid = require 'uuid'
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
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func # Called with new design. null/undefined for readonly
    filters: PropTypes.array
    
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use for widget
    widgetDataSource: PropTypes.object.isRequired

    width: PropTypes.number
    height: PropTypes.number

    singleRowTable: PropTypes.string  # Table that is filtered to have one row

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
    @editor.edit()

  # Render a link to start editing
  renderEditLink: ->
    R 'div', className: "mwater-visualization-widget-placeholder", onClick: @handleStartEditing, 
      R 'i', className: "icon fa fa-image"

  renderEditor: ->
    R ImageWidgetDesignComponent,
      ref: (c) => @editor = c
      key: "editor"
      design: @props.design
      onDesignChange: @props.onDesignChange
      schema: @props.schema
      dataSource: @props.dataSource

  renderExpression: ->
    if @state.loading
      R 'span', null, "Loading"
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
      R RotatedImageComponent, imgUrl: source, url: @props.design.url, rotation: @props.design.rotation
    else
      @renderExpression()

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    captionPosition = @props.design.captionPosition or "bottom"

    R DropdownWidgetComponent, 
      width: @props.width
      height: @props.height
      dropdownItems: dropdownItems,
        @renderEditor()
        if not @props.design.imageUrl and not @props.design.expr and not @props.design.uid and @props.onDesignChange
          @renderEditLink()
        else
          R 'div', className: "mwater-visualization-image-widget", style: { position: "relative", width: @props.width, height: @props.height },
            if captionPosition == "top"
              R 'div', className: "caption", @props.design.caption
            R 'div', className: "image",
              @renderContent()
            if captionPosition == "bottom"
              R 'div', className: "caption", @props.design.caption
  
class ImageWidgetDesignComponent extends React.Component
  @propTypes: 
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func # Called with new design. null/undefined for readonly
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use for widget

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
      rotation: null
      captionPosition: null
      url: null
    }

  edit: =>
    @setCurrentTab()
    state = {
      editing: true
      imageUrl: @props.design.imageUrl
      uid: @props.design.uid
      expr: @props.design.expr
      table: @props.design.expr?.table
      caption: @props.design.caption
      rotation: @props.design.rotation
      captionPosition: @props.design.captionPosition
      url: @props.design.url
    }

    @setState(state)

  setCurrentTab: ->
    tab = "upload"

    if @props.design.url then tab = "url"
    if @props.design.expr then tab = "expression"

    @setState(currentTab: tab)

  handleImageUrlChange: (e) =>
    @setState(imageUrl: e.target.value, uid: null, expr: null)

  handleUrlChange: (e) =>
    @setState(url: e.target.value)

  renderUploadEditor: ->
    R 'div', null,
      R ImageUploaderComponent,
        dataSource: @props.dataSource
        onUpload: @handleFileUpload
        uid: @props.design.uid
      @renderRotation()

  handleFileUpload: (uid) =>
    @setState(imageUrl: null, uid: uid, expr: null)

  handleExpressionChange: (expr) =>
    @setState(imageUrl: null, uid: null, expr: expr, url: null)

  handleTableChange: (table) => @setState(table: table)
  handleCaptionChange: (ev) => @setState(caption: ev.target.value)
  handleRotationChange: (rotation) => @setState(rotation: rotation)
  handleCaptionPositionChange: (captionPosition) => @setState(captionPosition: captionPosition)

  handleSave: () =>
    @setState(editing: false)
    updates =
      imageUrl: @state.imageUrl
      url: @state.url
      uid: @state.uid
      expr: @state.expr
      caption: @state.caption
      rotation: @state.rotation
      captionPosition: @state.captionPosition

    @props.onDesignChange(_.extend({}, @props.design, updates))

  handleCancel: () =>
    @setCurrentTab()
    @setState(editing: false, imageUrl: null, url: null, uid: null, expr: null, table: null, files: null, uploading: false, captionPosition: null)

  renderExpressionEditor: ->
    R 'div', className: "form-group",
      R 'label', className: "text-muted",
        R('i', className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R(TableSelectComponent, { schema: @props.schema, value: @state.table, onChange: @handleTableChange })
      R('br')

      if @state.table
        R 'div', className: "form-group",
          R 'label', className: "text-muted",
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

  renderRotation: ->
    R 'div', style: { paddingTop: 10 }, 
      "Rotation: "
      R ui.Radio, value: @state.rotation or null, radioValue: null, onChange: @handleRotationChange, inline: true, "0 degrees"
      R ui.Radio, value: @state.rotation or null, radioValue: 90, onChange: @handleRotationChange, inline: true, "90 degrees"
      R ui.Radio, value: @state.rotation or null, radioValue: 180, onChange: @handleRotationChange, inline: true, "180 degrees"
      R ui.Radio, value: @state.rotation or null, radioValue: 270, onChange: @handleRotationChange, inline: true, "270 degrees"

  renderImageUrlEditor: ->
    R 'div', className: "form-group",
      R 'label', null, "URL of image"
      R 'input', type: "text", className: "form-control", value: @state.imageUrl or "", onChange: @handleImageUrlChange
      R 'p', className: "help-block",
        'e.g. http://somesite.com/image.jpg'
      @renderRotation()

  renderUrlEditor: ->
    R 'div', className: "form-group",
      R 'label', null, "URL to open"
      R 'input', type: "text", className: "form-control", value: @state.url or "", onChange: @handleUrlChange
      R 'p', className: "help-block",
        'e.g. http://somesite.com/'
      R 'p', className: "help-block",
        'When clicked on image, this link will open in a new tab'

  render: ->
    if not @state.editing
      return null

    content = R 'div', null,
      R 'div', className: "form-group",
        R 'label', null, "Caption"
        R 'input', type: "text", className: "form-control", value: @state.caption or "", onChange: @handleCaptionChange, placeholder: "Optional caption to display below image"

      if @state.caption
        R 'div', className: "form-group",
          R 'label', null, "Caption position"
          R ui.Select, 
            options: [{ value: "bottom", label: "Bottom" }, { value: "top", label: "Top" }]
            value: @state.captionPosition
            onChange: @handleCaptionPositionChange

      R TabbedComponent,
        tabs: [
          { id: "upload", label: "Upload", elem: @renderUploadEditor() }
          { id: "expression", label: "From Data", elem: @renderExpressionEditor() }
          { id: "url", label: "From URL", elem: @renderImageUrlEditor() }
        ]
        initialTabId: @state.currentTab
      # No target URL when using expressions
      if @state.imageUrl or @state.uid
        @renderUrlEditor()

    footer =
      R 'div', null,
        R('button', key: "save", type: "button", className: "btn btn-primary", onClick: @handleSave, "Save")
        R('button', key: "cancel", type: "button", className: "btn btn-default", onClick: @handleCancel, "Cancel")

    return R ModalPopupComponent,
      header: "Image"
      scrollDisabled: true
      footer: footer,
        content


# Image which is rotated by x degrees (0, 90, 180, 270)
class RotatedImageComponent extends React.Component
  @propTypes: 
    imgUrl: PropTypes.string.isRequired # Url of the image
    rotation: PropTypes.number
    onClick: PropTypes.func
    caption: PropTypes.string
    url: PropTypes.string # Url to be opened when the image is clicked

  render: ->
    R AutoSizeComponent, injectWidth: true, injectHeight: true, 
      (size) =>
        imageStyle = {}
        containerStyle = {}

        # These css classes are defined in mwater-forms
        classes = classNames({
          "rotated": @props.rotation
          "rotate-90": @props.rotation and @props.rotation == 90
          "rotate-180": @props.rotation and @props.rotation == 180
          "rotate-270": @props.rotation and @props.rotation == 270 
        })

        imageStyle.maxWidth = "100%"
        imageStyle.maxHeight = "100%"

        # Set width if rotated left or right
        if @props.rotation == 90 or @props.rotation == 270
          imageStyle.width = size.height

        img = R 'span', 
          className: "rotated-image-container"
          style: containerStyle,
            R 'img',
              src: @props.imgUrl
              style: imageStyle
              className: classes
              onClick: @props.onClick
              alt: @props.caption or ""

        if not @props.url
          return img
        else
          return R 'a', href: @props.url, target: '_blank', img
