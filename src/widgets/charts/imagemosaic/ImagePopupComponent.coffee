PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement

ModalWindowComponent = require('react-library/lib/ModalWindowComponent')
RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent")

# Displays an image in a popup
module.exports = class ImagePopupComponent extends React.Component
  @propTypes:
    imageManager: PropTypes.object.isRequired

  constructor: ->
    super

    @state = {
      image: null # Set to display
      url: null
    }

  # Shows image object
  show: (image) -> 
    @props.imageManager.getImageUrl(image.id, (url) =>
      @setState(image: image, url: url)
    )

  render: ->
    if not @state.image or not @state.url
      return null

    return R ModalWindowComponent, 
      isOpen: true
      onRequestClose: (=> @setState(image: null, url: null)),
        R RotationAwareImageComponent, 
          imageManager: @props.imageManager
          image: @state.image
