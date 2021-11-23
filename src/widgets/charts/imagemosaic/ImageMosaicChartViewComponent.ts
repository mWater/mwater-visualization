import _ from "lodash"
import React from "react"
const R = React.createElement

import { LazyLoadComponent as LazyLoad } from "react-lazy-load-image-component"
import RotationAwareImageComponent from "mwater-forms/lib/RotationAwareImageComponent"
import ImagePopupComponent from "./ImagePopupComponent"
import { DataSource } from "mwater-expressions"

export interface ImageMosaicChartViewComponentProps {
  /** Design of chart */
  design: any
  /** Data that the chart has requested. In format  [image: {image data or imagelist data}] */
  data: any
  /** Data source to use */
  dataSource: DataSource
  width?: number
  height?: number
  onRowClick?: any
}

// creates a d3 calendar visualization
export default class ImageMosaicChartViewComponent extends React.Component<ImageMosaicChartViewComponentProps> {
  shouldComponentUpdate(prevProps: any) {
    return !_.isEqual(prevProps, this.props)
  }

  handleClick = (primaryKey: any, image: any) => {
    if (this.props.onRowClick) {
      return this.props.onRowClick(this.props.design.table, primaryKey)
    } else {
      return this.imagePopup?.show(image)
    }
  }

  // Render a single image
  renderImage = (primaryKey: any, image: any, imageManager: any) => {
    return R(
      LazyLoad,
      { key: image.id },
      R(RotationAwareImageComponent, {
        imageManager,
        image,
        thumbnail: true,
        height: 120,
        width: 80,
        onClick: () => this.handleClick(primaryKey, image)
      })
    )
  }

  // Render images
  renderImages(imageManager: any) {
    const imageElems = []

    // For each image
    return (() => {
      const result = []
      for (var row of this.props.data) {
        let imageObj = row.image

        // Ignore nulls (https://github.com/mWater/mwater-server/issues/202)
        if (!imageObj) {
          continue
        }

        if (_.isString(imageObj)) {
          imageObj = JSON.parse(imageObj)
        }

        if (_.isArray(imageObj)) {
          result.push(imageObj.map((image) => this.renderImage(row.id, image, imageManager)))
        } else {
          result.push(this.renderImage(row.id, imageObj, imageManager))
        }
      }
      return result
    })()
  }

  render() {
    const titleStyle = {
      textAlign: "center",
      fontSize: "14px",
      fontWeight: "bold"
    }

    const style = {
      width: this.props.width,
      height: this.props.height,
      position: "relative",
      overflowY: "auto"
    }

    const title = this.props.design.titleText

    const imageManager = {
      getImageThumbnailUrl: (id: any, success: any, error: any) => success(this.props.dataSource.getImageUrl(id, 100)),
      getImageUrl: (id: any, success: any, error: any) => success(this.props.dataSource.getImageUrl(id))
    }

    return R(
      "div",
      { style, className: "image-mosaic" },
      title ? R("p", { style: titleStyle }, title) : undefined,

      R(ImagePopupComponent, {
        ref: (c: any) => {
          return (this.imagePopup = c)
        },
        imageManager
      }),
      R("div", null, this.renderImages(imageManager))
    )
  }
}
