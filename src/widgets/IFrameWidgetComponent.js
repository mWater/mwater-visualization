PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'
ui = require 'react-library/lib/bootstrap'

DropdownWidgetComponent = require './DropdownWidgetComponent'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')

module.exports = class IFrameWidgetComponent extends React.Component
  @propTypes: 
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func # Called with new design. null/undefined for readonly
    width: PropTypes.number
    height: PropTypes.number

  constructor: (props) ->
    super(props)
    @state = { 
      # True when editing chart
      editing: false
      editUrl: null
    }  

  handleStartEditing: =>
    @setState(editing: true, editUrl: @props.design.url)

  handleEndEditing: =>
    @setState(editing: false)
    @props.onDesignChange(_.extend({}, @props.design, url: @state.editUrl))

  renderEditor: ->
    if not @state.editing
      return null

    content = R 'div', className: "form-group",
      R 'label', null, "URL to embed"
      R 'input', type: "text", className: "form-control", value: @state.editUrl or "", onChange: (ev) => @setState(editUrl: ev.target.value)
      R 'p', className: "help-block",
        'e.g. https://www.youtube.com/embed/dQw4w9WgXcQ'

    return R ModalPopupComponent,
      header: "Configure"
      showCloseX: true 
      onClose: @handleEndEditing,
        content

  # Render a link to start editing
  renderEditLink: ->
    R 'div', className: "mwater-visualization-widget-placeholder", onClick: @handleStartEditing,
      R ui.Icon, id: "fa-youtube-play"
    # R 'div', style: { position: "absolute", bottom: @props.height / 2, left: 0, right: 0, textAlign: "center" },
    #   R 'a', className: "btn btn-link", onClick: @handleStartEditing, "Click Here to Configure"

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    R DropdownWidgetComponent, 
      width: @props.width
      height: @props.height
      dropdownItems: dropdownItems,
        @renderEditor()
        if @props.design.url
          R 'iframe', 
            src: @props.design.url
            width: @props.width
            height: @props.height
            frameborder: 0
            allowfullscreen: true
        else
          if @props.onDesignChange?
            @renderEditLink()
