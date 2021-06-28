let ImagelistCarouselComponent;
import _ from 'lodash';
import PropTypes from 'prop-types';

// Carousel component for images. Starts with cover photo
import React from 'react';

const R = React.createElement;
import RotationAwareImageComponent from "mwater-forms/lib/RotationAwareImageComponent";

// Bootstrap carousel for an image list
export default ImagelistCarouselComponent = (function() {
  ImagelistCarouselComponent = class ImagelistCarouselComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        imagelist: PropTypes.array,  // Array of { id, cover: true/false }
        widgetDataSource: PropTypes.object.isRequired,
        height: PropTypes.number
      };
    }

    constructor(props) {
      this.handleLeft = this.handleLeft.bind(this);
      this.handleRight = this.handleRight.bind(this);
      super(props);
      this.state = {
        activeImage: _.findIndex(this.props.imagelist, { cover: true })
      };
      if (this.state.activeImage < 0) {
        this.state.activeImage = 0;
      }
    }

    handleLeft() {
      if (this.props.imagelist && (this.props.imagelist.length > 0)) {
        const activeImage = ((this.state.activeImage - 1) + this.props.imagelist.length) % this.props.imagelist.length;
        return this.setState({activeImage});
      }
    }

    handleRight() {
      if (this.props.imagelist && (this.props.imagelist.length > 0)) {
        const activeImage = (this.state.activeImage + 1 + this.props.imagelist.length) % this.props.imagelist.length;
        return this.setState({activeImage});
      }
    }

    renderImage(img, i, imageManager) {
      return R('div', {className: `item ${i === this.state.activeImage ? "active" : ""}`, style: {height: this.props.height}},
        R(RotationAwareImageComponent, {imageManager, image: img}));
    }

    renderImages(imageManager) {
      return this.props.imagelist.map((imageObj, i) =>
        this.renderImage(imageObj, i, imageManager));
    }

    render() {
      const imageManager = {
        getImageThumbnailUrl: (id, success, error) => success(this.props.widgetDataSource.getImageUrl(id, 100)),
        getImageUrl: (id, success, error) => success(this.props.widgetDataSource.getImageUrl(id, 640))
      };

      if (this.props.imagelist.length === 1) {
        return this.renderImage(this.props.imagelist[0], 0, imageManager);
      }

      if (this.props.imagelist.length === 0) {
        return null;
      }

      return R('div', {className: "image-carousel-component carousel slide", style: {height: this.props.height, overflow: 'hidden'}},
        this.props.imagelist.length < 10 ?
          R('ol', {className: "carousel-indicators"},
            _.map(this.props.imagelist, (img, i) => {
              return R('li', {className: i === this.state.activeImage ? "active" : undefined});
            })
          ) : undefined,

        // Wrapper for slides
        R('div', {className: "carousel-inner"},
          this.renderImages(imageManager)),

        R('a', {className: "left carousel-control"},
          R('span', {className: "glyphicon glyphicon-chevron-left", onClick: this.handleLeft})),
        R('a', {className: "right carousel-control"},
          R('span', {className: "glyphicon glyphicon-chevron-right", onClick: this.handleRight}))
      );
    }
  };
  ImagelistCarouselComponent.initClass();
  return ImagelistCarouselComponent;
})();
