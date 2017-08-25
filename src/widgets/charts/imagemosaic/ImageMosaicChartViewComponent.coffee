PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

AxisBuilder = require '../../../axes/AxisBuilder'
LazyLoad = require('react-lazy-load').default
RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent")
ImagePopupComponent = require './ImagePopupComponent'

# creates a d3 calendar visualization
module.exports = class ImageMosaicChartViewComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired # Design of chart
    data: PropTypes.array.isRequired # Data that the chart has requested. In format  [image: {image data or imagelist data}]
    dataSource: PropTypes.object.isRequired # Data source to use

    width: PropTypes.number
    height: PropTypes.number
    standardWidth: PropTypes.number

    scope: PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

  shouldComponentUpdate: (prevProps) ->
    not _.isEqual(prevProps, @props)

  # Render a single image
  renderImage: (image, imageManager) ->
    R LazyLoad, key: image.id,
      R RotationAwareImageComponent, 
        imageManager: imageManager 
        image: image
        thumbnail: true
        height: 120
        width: 80
        onClick: => @imagePopup?.show(image)

  # Render images
  renderImages: (imageManager) ->
    imageElems = []

    # For each image
    for row in @props.data
      imageObj = row.image

      # Ignore nulls (https://github.com/mWater/mwater-server/issues/202)
      if not imageObj
        continue

      if _.isString(imageObj)
        imageObj = JSON.parse(imageObj)

      if _.isArray(imageObj)
        for image in imageObj
          @renderImage(image, imageManager)
      else
        @renderImage(imageObj, imageManager)

  render: ->
    titleStyle =
      textAlign: "center"
      fontSize: "14px"
      fontWeight: "bold"

    style =
      width: @props.width
      height: @props.height
      overflowY: "auto"

    title = @props.design.titleText

    imageManager = {
      getImageThumbnailUrl: (id, success, error) => success(@props.dataSource.getImageUrl(id, 100))
      getImageUrl: (id, success, error) => success(@props.dataSource.getImageUrl(id))
    }

    H.div style: style, className: 'image-mosaic',
      if title
        H.p style: titleStyle, title

      R ImagePopupComponent, 
        ref: (c) => @imagePopup = c
        imageManager: imageManager
      H.div null,
        @renderImages(imageManager)

