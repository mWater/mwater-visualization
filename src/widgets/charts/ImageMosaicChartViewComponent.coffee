_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

AxisBuilder = require '../../axes/AxisBuilder'
LazyLoad = require 'react-lazy-load'

# creates a d3 calendar visualization
module.exports = class ImageMosaicChartViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart
    data: React.PropTypes.array.isRequired # Data that the chart has requested. In format  [image: {image data or imagelist data}]
    dataSource: React.PropTypes.object.isRequired # Data source to use

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

  shouldComponentUpdate: (prevProps) ->
    not _.isEqual(prevProps, @props)

  # Render a single image
  renderImage: (image) ->
    R LazyLoad, key: image.id, height: 100,
      H.img src: @props.dataSource.getImageUrl(image.id, 100), alt: image.caption, className: "img-thumbnail", style: { height: 100, minWidth: 50 }

  # Render images
  renderImages: ->
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
          @renderImage(image)
      else
        @renderImage(imageObj)

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

    H.div style: style, className: 'image-mosaic',
      if title
        H.p style: titleStyle, title
      H.div null,
        @renderImages()

