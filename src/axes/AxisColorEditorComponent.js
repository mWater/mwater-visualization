// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let AxisColorEditorComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;
import CategoryMapComponent from './CategoryMapComponent';
import ColorSchemeFactory from '../ColorSchemeFactory';
import ColorPaletteCollectionComponent from './ColorPaletteCollectionComponent';
import update from 'update-object';
import AxisBuilder from './AxisBuilder';

// Color editor for axis. Allows switching between editing individial colors (using CategoryMapComponent) 
// and setting the colors from a palette (using ColorPaletteCollectionComponent)
export default AxisColorEditorComponent = (function() {
  AxisColorEditorComponent = class AxisColorEditorComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,
        axis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired, // Called with new axis
        categories: PropTypes.array, // Categories of the axis
        reorderable: PropTypes.bool, // is the color map reorderable
        defaultColor: PropTypes.string,
        allowExcludedValues: PropTypes.bool, // True to allow excluding of values via checkboxes
        initiallyExpanded: PropTypes.bool,  // True to start values expanded
        autosetColors: PropTypes.bool      // True to automatically set the colors if blank
      };
  
      this.defaultProps = {
        reorderable: false,
        autosetColors: true
      };
    }

    constructor(props) {
      super(props);

      this.state = {
        mode: "normal"
      };
    }

    componentWillMount() {
      return this.updateColorMap();
    }

    componentDidUpdate() {
      return this.updateColorMap();
    }

    // Update color map if categories no longer match
    updateColorMap() {
      const axisBuilder = new AxisBuilder({schema: this.props.schema});

      // If no categories, can't do anything
      if (!this.props.categories) {
        return;
      }

      // If no color map or color map values have changed
      if (!this.props.axis.colorMap || !_.isEqual(_.pluck(this.props.axis.colorMap, "value").sort(), _.pluck(this.props.categories, "value").sort())) {
        let colorMap;
        if (this.props.autosetColors) {
          colorMap = ColorSchemeFactory.createColorMapForCategories(this.props.categories, axisBuilder.isCategorical(this.props.axis));
        } else { 
          // Keep existing 
          const existing = _.indexBy(this.props.axis.colorMap || [], "value");
          colorMap = _.map(this.props.categories, (category, i) => ({
            value: category.value,
            color: existing[category.value] ? existing[category.value].color : null
          }));
        }
      
        this.handlePaletteChange(colorMap);
        return this.setState({mode: "normal"});
      }
    }

    handleSelectPalette = () => {
      return this.setState({mode: "palette"});
    };

    handleResetPalette = () => {
      // Completely reset
      const colorMap = _.map(this.props.categories, (category, i) => ({
        value: category.value,
        color: null
      }));
      
      this.handlePaletteChange(colorMap);
      return this.setState({mode: "normal"});
    };

    handlePaletteChange = palette => {
      this.props.onChange(update(this.props.axis, { colorMap: { $set: palette }, drawOrder: { $set: _.pluck(palette, "value") }}));
      return this.setState({mode: "normal"});
    };

    handleCancelCustomize = () => {
      return this.setState({mode: "normal"});
    };

    renderPreview() {
      return R('div', {className: "axis-palette"},
        _.map(this.props.categories.slice(0,6), (category, i) => {
          const color = _.find(this.props.axis.colorMap, {value: category.value});
          const cellStyle = {
            display: 'inline-block',
            height: 20,
            width: 20,
            backgroundColor: color ? color.color : this.props.defaultColor
          };
          return R('div', {style: cellStyle, key: i}, " ");
        })
      );
    }

    render() {
      return R('div', null,
        (() => {
        if (this.state.mode === "palette") {
          if (this.props.categories) {
            return R(ColorPaletteCollectionComponent, {
              onPaletteSelected: this.handlePaletteChange,
              axis: this.props.axis,
              categories: this.props.categories,
              onCancel: this.handleCancelCustomize
            });
          }
        }
      })(),
        this.state.mode === "normal" ?
          R('div', null,
            R('p', null,
              R('a', {style: { cursor: "pointer" }, onClick: this.handleSelectPalette, key: "select-palette"}, "Change color scheme"),
              !this.props.autosetColors ?
                R('a', {style: { cursor: "pointer", marginLeft: 10 }, onClick: this.handleResetPalette, key: "reset-palette"}, "Reset colors") : undefined
            ),
            this.props.axis.colorMap ?
              R('div', {key: "selected-palette"},
                R('div', null,
                  R(CategoryMapComponent, {
                    schema: this.props.schema,
                    axis: this.props.axis,
                    onChange: this.props.onChange,
                    categories: this.props.categories,
                    key: "colorMap",
                    reorderable: this.props.reorderable,
                    allowExcludedValues: this.props.allowExcludedValues,
                    showColorMap: true,
                    initiallyExpanded: this.props.initiallyExpanded
                  }
                  )
                )
              ) : undefined
          ) : undefined
      );
    }
  };
  AxisColorEditorComponent.initClass();
  return AxisColorEditorComponent;
})();

