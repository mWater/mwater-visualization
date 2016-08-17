# Carousel component for images. Starts with cover photo
React = require 'react'
H = React.DOM
R = React.createElement

# Bootstrap carousel for an image list
module.exports = class ImagelistCarouselComponent extends React.Component
  @propTypes:
    imagelist: React.PropTypes.array  # Array of { id, cover: true/false }
    apiUrl: React.PropTypes.string.isRequired # The base api url

  constructor: ->
    super
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

  renderImage: (img, i) ->
    H.div className: "item #{if i == @state.activeImage then "active" else ""}",
      H.img style: { maxWidth: "100%", maxHeight: "100%"}, src: @props.apiUrl + 'images/' + img.id+ "?h=400"

  renderImages: ->
    counter = 0
    for row, i in @props.imagelist
      imageObj = row.value

      # Ignore nulls (https://github.com/mWater/mwater-server/issues/202)
      if not imageObj
        continue

      if _.isString(imageObj)
        imageObj = JSON.parse(imageObj)

      if _.isArray(imageObj)
        for image in imageObj
          @renderImage(image, counter++)
      else
        @renderImage(imageObj, counter++)

  render: ->
    H.div className: "carousel slide",
      H.ol className: "carousel-indicators",
        _.map @props.imagelist, (img, i) =>
          H.li className: if i == @state.activeImage then "active"

      # Wrapper for slides
      H.div className: "carousel-inner",
        @renderImages()

      H.a className: "left carousel-control",
        H.span className: "glyphicon glyphicon-chevron-left", onClick: @handleLeft
      H.a className: "right carousel-control",
        H.span className: "glyphicon glyphicon-chevron-right", onClick: @handleRight