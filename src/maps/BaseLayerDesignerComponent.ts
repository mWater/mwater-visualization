// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let BaseLayerDesignerComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;
import { default as Rcslider } from 'rc-slider';
import PopoverHelpComponent from 'react-library/lib/PopoverHelpComponent';

// Designer for config
export default BaseLayerDesignerComponent = (function() {
  BaseLayerDesignerComponent = class BaseLayerDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        design: PropTypes.object.isRequired,  // See Map Design.md
        onDesignChange: PropTypes.func.isRequired
      };
       // Called with new design
    }

    // Updates design with the specified changes
    updateDesign(changes) {
      const design = _.extend({}, this.props.design, changes);
      return this.props.onDesignChange(design);
    }

    handleBaseLayerChange = baseLayer => {
      return this.updateDesign({baseLayer});
    };

    renderBaseLayer(id, name) {
      let className = "mwater-visualization-layer";
      if (id === this.props.design.baseLayer) {
        className += " checked";
      }
    
      return R('div', { 
        key: id,
        className,
        style: { display: "inline-block" },
        onClick: this.handleBaseLayerChange.bind(null, id)
      },
          name);
    }

    handleOpacityChange = newValue => {
      return this.updateDesign({baseLayerOpacity: newValue/100});
    };

    renderOpacityControl() {
      let opacity;
      if (this.props.design.baseLayerOpacity != null) {
        opacity = this.props.design.baseLayerOpacity;
      } else {
        opacity = 1;
      }

      return R('div', {className: 'form-group', style: { paddingTop: 10 }},
        R('label', {className: 'text-muted'},
          R('span', null,
            `Opacity: ${Math.round(opacity * 100) }%`)
        ),
        R('div', {style: {padding: '10px'}},
          React.createElement(Rcslider, {
            min: 0,
            max: 100,
            step: 1,
            tipTransitionName: "rc-slider-tooltip-zoom-down",
            value: opacity * 100,
            onChange: this.handleOpacityChange
          }
          )
        )
      );
    }

    render() {
      return R('div', {className: "form-group"},
        R('label', {className: "text-muted"}, 
          "Background Map"),

        R('div', {style: { marginLeft: 10 }}, 
          R('div', null, 
            this.renderBaseLayer("cartodb_positron", "Light"),
            this.renderBaseLayer("cartodb_dark_matter", "Dark"),
            this.renderBaseLayer("bing_road", "Roads"),
            this.renderBaseLayer("bing_aerial", "Satellite"),
            this.renderBaseLayer("blank", "Blank"),
            " ",
            R(PopoverHelpComponent, {placement: "bottom"},
              'Blank map backgrounds work best with chloropleth map layers')
          ),

  
          this.renderOpacityControl())
      );
    }
  };
  BaseLayerDesignerComponent.initClass();
  return BaseLayerDesignerComponent;
})();
