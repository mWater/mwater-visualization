// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ImagePopupComponent
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

import ModalWindowComponent from "react-library/lib/ModalWindowComponent"
import RotationAwareImageComponent from "mwater-forms/lib/RotationAwareImageComponent"

// Displays an image in a popup
export default ImagePopupComponent = (function () {
  ImagePopupComponent = class ImagePopupComponent extends React.Component {
    static initClass() {
      this.propTypes = { imageManager: PropTypes.object.isRequired }
    }

    constructor(props: any) {
      super(props)

      this.state = {
        image: null, // Set to display
        url: null
      }
    }

    // Shows image object
    show(image: any) {
      return this.props.imageManager.getImageUrl(image.id, (url: any) => {
        return this.setState({ image, url })
      });
    }

    render() {
      if (!this.state.image || !this.state.url) {
        return null
      }

      return R(
        ModalWindowComponent,
        {
          isOpen: true,
          onRequestClose: () => this.setState({ image: null, url: null })
        },
        R(RotationAwareImageComponent, {
          imageManager: this.props.imageManager,
          image: this.state.image
        })
      )
    }
  }
  ImagePopupComponent.initClass()
  return ImagePopupComponent
})()
