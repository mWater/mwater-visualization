PropTypes = require('prop-types')
# Carousel component for images. Starts with cover photo
React = require 'react'
R = React.createElement
RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent")

# Bootstrap carousel for an image list
module.exports = class ImagelistCarouselComponent extends React.Component
  @propTypes:
    imagelist: PropTypes.array  # Array of { id, cover: true/false }
    widgetDataSource: PropTypes.object.isRequired
    height: PropTypes.number

  constructor: (props) ->
    super(props)
    @state = {
      activeImage: _.findIndex(@props.imagelist, { cover: true })
    }
    if @state.activeImage < 0
      @state.activeImage = 0

  handleLeft: =>
    if @props.imagelist and @props.imagelist.length > 0
      activeImage = (@state.activeImage - 1 + @props.imagelist.length) % @props.imagelist.length
      @setState(activeImage: activeImage)

  handleRight: =>
    if @props.imagelist and @props.imagelist.length > 0
      activeImage = (@state.activeImage + 1 + @props.imagelist.length) % @props.imagelist.length
      @setState(activeImage: activeImage)

  renderImage: (img, i, imageManager) ->
    R 'div', className: "item #{if i == @state.activeImage then "active" else ""}", style: {height: @props.height},
      R RotationAwareImageComponent, imageManager: imageManager, image: img

  renderImages: (imageManager) ->
    for imageObj, i in @props.imagelist
      @renderImage(imageObj, i, imageManager)

  render: ->
    imageManager = {
      getImageThumbnailUrl: (id, success, error) => success(@props.widgetDataSource.getImageUrl(id, 100))
      getImageUrl: (id, success, error) => success(@props.widgetDataSource.getImageUrl(id, 640))
    }

    if @props.imagelist.length == 1
      return @renderImage(@props.imagelist[0], 0, imageManager)

    if @props.imagelist.length == 0
      return null

    R 'div', className: "image-carousel-component carousel slide", style: {height: @props.height, overflow: 'hidden'},
      if @props.imagelist.length < 10
        R 'ol', className: "carousel-indicators",
          _.map @props.imagelist, (img, i) =>
            R 'li', className: if i == @state.activeImage then "active"

      # Wrapper for slides
      R 'div', className: "carousel-inner",
        @renderImages(imageManager)

      R 'a', className: "left carousel-control",
        R 'span', className: "glyphicon glyphicon-chevron-left", onClick: @handleLeft
      R 'a', className: "right carousel-control",
        R 'span', className: "glyphicon glyphicon-chevron-right", onClick: @handleRight
