import _ from "lodash"
import PropTypes from "prop-types"

// Carousel component for images. Starts with cover photo
import React from "react"

const R = React.createElement
import RotationAwareImageComponent from "mwater-forms/lib/RotationAwareImageComponent"

interface ImagelistCarouselComponentProps {
  /** Array of { id, cover: true/false } */
  imagelist?: any
  widgetDataSource: any
  height?: number
}

interface ImagelistCarouselComponentState {
  activeImage: any
}

// Bootstrap carousel for an image list
export default class ImagelistCarouselComponent extends React.Component<
  ImagelistCarouselComponentProps,
  ImagelistCarouselComponentState
> {
  constructor(props: any) {
    super(props)
    this.state = {
      activeImage: _.findIndex(this.props.imagelist, { cover: true })
    }
    if (this.state.activeImage < 0) {
      this.state.activeImage = 0
    }
  }

  handleLeft = () => {
    if (this.props.imagelist && this.props.imagelist.length > 0) {
      const activeImage = (this.state.activeImage - 1 + this.props.imagelist.length) % this.props.imagelist.length
      return this.setState({ activeImage })
    }
  }

  handleRight = () => {
    if (this.props.imagelist && this.props.imagelist.length > 0) {
      const activeImage = (this.state.activeImage + 1 + this.props.imagelist.length) % this.props.imagelist.length
      return this.setState({ activeImage })
    }
  }

  renderImage(img: any, i: any, imageManager: any) {
    return R(
      "div",
      {
        className: `carousel-item ${i === this.state.activeImage ? "active" : ""}`,
        style: { height: this.props.height }
      },
      R(RotationAwareImageComponent, { imageManager, image: img })
    )
  }

  renderImages(imageManager: any) {
    return this.props.imagelist.map((imageObj: any, i: any) => this.renderImage(imageObj, i, imageManager))
  }

  render() {
    const imageManager = {
      getImageThumbnailUrl: (id: any, success: any, error: any) =>
        success(this.props.widgetDataSource.getImageUrl(id, 100)),
      getImageUrl: (id: any, success: any, error: any) => success(this.props.widgetDataSource.getImageUrl(id, 640))
    }

    if (this.props.imagelist.length === 1) {
      return this.renderImage(this.props.imagelist[0], 0, imageManager)
    }

    if (this.props.imagelist.length === 0) {
      return null
    }

    return R(
      "div",
      {
        className: "image-carousel-component carousel slide",
        style: { height: this.props.height, overflow: "hidden" }
      },
      this.props.imagelist.length < 10
        ? R(
            "div",
            { className: "carousel-indicators" },
            _.map(this.props.imagelist, (img, i) => {
              return R("button", { className: i === this.state.activeImage ? "active" : undefined })
            })
          )
        : undefined,

      // Wrapper for slides
      R("div", { className: "carousel-inner" }, this.renderImages(imageManager)),

      R(
        "button",
        { className: "carousel-control-prev", onClick: this.handleLeft },
        R("span", { className: "carousel-control-prev-icon" })
      ),
      R(
        "button",
        { className: "carousel-control-next", onClick: this.handleRight },
        R("span", { className: "carousel-control-next-icon" })
      )
    )
  }
}
