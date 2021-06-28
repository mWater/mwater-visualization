let ImageMosaicChartViewComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import AxisBuilder from '../../../axes/AxisBuilder';
import { LazyLoadComponent as LazyLoad } from 'react-lazy-load-image-component';
import RotationAwareImageComponent from "mwater-forms/lib/RotationAwareImageComponent";
import ImagePopupComponent from './ImagePopupComponent';

// creates a d3 calendar visualization
export default ImageMosaicChartViewComponent = (function() {
  ImageMosaicChartViewComponent = class ImageMosaicChartViewComponent extends React.Component {
    constructor(...args) {
      super(...args);
      this.handleClick = this.handleClick.bind(this);
      this.renderImage = this.renderImage.bind(this);
    }

    static initClass() {
      this.propTypes = {
        design: PropTypes.object.isRequired, // Design of chart
        data: PropTypes.array.isRequired, // Data that the chart has requested. In format  [image: {image data or imagelist data}]
        dataSource: PropTypes.object.isRequired, // Data source to use
  
        width: PropTypes.number,
        height: PropTypes.number,
  
        onRowClick: PropTypes.func
      };
       // Called with (tableId, rowId) when item is clicked
    }

    shouldComponentUpdate(prevProps) {
      return !_.isEqual(prevProps, this.props);
    }

    handleClick(primaryKey, image) { 
      if (this.props.onRowClick) {
        return this.props.onRowClick(this.props.design.table, primaryKey);
      } else {
        return this.imagePopup?.show(image);
      }
    }

    // Render a single image
    renderImage(primaryKey, image, imageManager) {
      return R(LazyLoad, {key: image.id},
        R(RotationAwareImageComponent, { 
          imageManager, 
          image,
          thumbnail: true,
          height: 120,
          width: 80,
          onClick: () => this.handleClick(primaryKey, image)
        }
        )
      );
    }

    // Render images
    renderImages(imageManager) {
      const imageElems = [];

      // For each image
      return (() => {
        const result = [];
        for (var row of this.props.data) {
          let imageObj = row.image;

          // Ignore nulls (https://github.com/mWater/mwater-server/issues/202)
          if (!imageObj) {
            continue;
          }

          if (_.isString(imageObj)) {
            imageObj = JSON.parse(imageObj);
          }

          if (_.isArray(imageObj)) {
            result.push(imageObj.map((image) =>
              this.renderImage(row.id, image, imageManager)));
          } else {
            result.push(this.renderImage(row.id, imageObj, imageManager));
          }
        }
        return result;
      })();
    }

    render() {
      const titleStyle = {
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "bold"
      };

      const style = {
        width: this.props.width,
        height: this.props.height,
        position: "relative",
        overflowY: "auto"
      };

      const title = this.props.design.titleText;

      const imageManager = {
        getImageThumbnailUrl: (id, success, error) => success(this.props.dataSource.getImageUrl(id, 100)),
        getImageUrl: (id, success, error) => success(this.props.dataSource.getImageUrl(id))
      };

      return R('div', {style, className: 'image-mosaic'},
        title ?
          R('p', {style: titleStyle}, title) : undefined,

        R(ImagePopupComponent, { 
          ref: c => { return this.imagePopup = c; },
          imageManager
        }
        ),
        R('div', null,
          this.renderImages(imageManager))
      );
    }
  };
  ImageMosaicChartViewComponent.initClass();
  return ImageMosaicChartViewComponent;
})();

