// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let CategoryMapComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;
import { ExprCompiler } from 'mwater-expressions';
import AxisBuilder from './AxisBuilder';
import update from 'update-object';
import ColorComponent from '../ColorComponent';
import { ExprUtils } from 'mwater-expressions';
import ReorderableListComponent from "react-library/lib/reorderable/ReorderableListComponent";
import { default as produce } from 'immer';

// Category map for an axis. Controls the colorMap values and excludedValues
// Can be collapsed
export default CategoryMapComponent = (function() {
  CategoryMapComponent = class CategoryMapComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,
        axis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        categories: PropTypes.array,
        reorderable: PropTypes.bool,
        showColorMap: PropTypes.bool,  // True to allow editing the color map
        allowExcludedValues: PropTypes.bool, // True to allow excluding of values via checkboxes
        initiallyExpanded: PropTypes.bool
      };
        // True to start expanded
    }

    constructor(props) {
      super(props);

      this.state = {
        collapsed: !props.initiallyExpanded  // Start collapsed
      };
    }

    handleReorder = map => {
      const order = _.pluck(map, "value");
      return this.props.onChange(update(this.props.axis, { drawOrder: { $set: order }}));
    };

    handleColorChange = (value, color) => {
      // Delete if present for value
      const colorMap = _.filter(this.props.axis.colorMap, item => item.value !== value);

      // Add if color present
      if (color) {
        colorMap.push({ value, color });
      }

      return this.props.onChange(update(this.props.axis, { colorMap: { $set: colorMap }}));
    };

    handleExcludeChange = (value, ev) => {
      let excludedValues;
      if (ev.target.checked) {
        excludedValues = _.difference(this.props.axis.excludedValues, [value]);
      } else {
        excludedValues = _.union(this.props.axis.excludedValues, [value]);
      }

      return this.props.onChange(update(this.props.axis, { excludedValues: { $set: excludedValues }}));
    };

    // Gets the current color value if known
    lookupColor(value) {
      const item = _.find(this.props.axis.colorMap, item => item.value === value);
      if (item) {
        return item.color;
      }
      return null;
    }

    handleNullLabelChange = e => {
      const name = prompt("Enter label for none value", this.props.axis.nullLabel || "None");
      if (name) {
        return this.props.onChange(update(this.props.axis, { nullLabel: { $set: name }}));
      }
    };

    handleCategoryLabelChange = (category, e) => {
      let {
        label
      } = category;
      if (this.props.axis.categoryLabels) {
        label = this.props.axis.categoryLabels[JSON.stringify(category.value)] || label;
      }

      const name = prompt("Enter label or blank to reset", label);
      if (name != null) {
        if (name) {
          return this.props.onChange(produce(this.props.axis, draft => {
            draft.categoryLabels = draft.categoryLabels || {};
            draft.categoryLabels[JSON.stringify(category.value)] = name;
          }));
        } else {
          return this.props.onChange(produce(this.props.axis, draft => {
            draft.categoryLabels = draft.categoryLabels || {};
            delete draft.categoryLabels[JSON.stringify(category.value)];
          }));
        }
      }
    };

    handleToggle = () => {
      return this.setState({collapsed: !this.state.collapsed});
    };

    renderLabel(category) {
      let {
        label
      } = category;
      if (this.props.axis.categoryLabels) {
        label = this.props.axis.categoryLabels[JSON.stringify(category.value)] || label;
      }

      if (category.value != null) {
        return R('a', {onClick: this.handleCategoryLabelChange.bind(null, category), style: {cursor: 'pointer'}},
          label);
      } else {
        return R('a', {onClick: this.handleNullLabelChange, style: {cursor: 'pointer'}},
          label,
          R('span', {style: {fontSize: 12, marginLeft: 4}}, "(click to change label for none value)"));
      }
    }

    // Category is { value: category value, label: category label }
    renderCategory = (category, index, connectDragSource, connectDragPreview, connectDropTarget) => {
      const labelStyle = {
        verticalAlign: 'middle',
        marginLeft: 5
      };

      const iconStyle = {
        cursor: "move",
        marginRight: 8,
        opacity: 0.5,
        fontSize: 12,
        height: 20
      };

      const colorPickerStyle = {
        verticalAlign: 'middle',
        lineHeight: 1,
        display: 'inline-block',
        marginLeft: 5
      };

      let elem = R('div', {key: category.value},
        connectDragSource ?
          connectDragSource(R('i', {className: "fa fa-bars", style: iconStyle})) : undefined,

        this.props.allowExcludedValues ?
          R('input', {
            type: "checkbox",
            style: { marginLeft: 5, marginBottom: 5, verticalAlign: "middle" },
            checked: !_.includes(this.props.axis.excludedValues, category.value),
            onChange: this.handleExcludeChange.bind(null, category.value)
          }
          ) : undefined,

        this.props.showColorMap ?
          R('div', {style: colorPickerStyle},
            R(ColorComponent, {
              key: 'color',
              color: this.lookupColor(category.value),
              onChange: color => this.handleColorChange(category.value, color)
            }
            )
          ) : undefined,

        R('span', {style: labelStyle},
          this.renderLabel(category))
      );

      if (connectDropTarget) {
        elem = connectDropTarget(elem);
      }
      if (connectDragPreview) {
        elem = connectDragPreview(elem);
      }

      return elem;
    };

    renderReorderable() {
      const drawOrder = this.props.axis.drawOrder || _.pluck(this.props.axis.colorMap, "value");

      const orderedCategories = _.sortBy(this.props.categories, category => {
        return _.indexOf(drawOrder, category.value);
      });

      return R('div', null,
        this.renderToggle(),
        R(ReorderableListComponent, {
          items: orderedCategories,
          onReorder: this.handleReorder,
          renderItem: this.renderCategory,
          getItemId: item => item.value
        }
        )
      );
    }

    renderNonReorderable() {
      return R('div', null,
        this.renderToggle(),
        _.map(this.props.categories, category => this.renderCategory(category)));
    }

    renderToggle() {
      if (this.state.collapsed) {
        return R('div', null,
          R('a', {onClick: this.handleToggle}, 
            "Show Values ",
            R('i', {className: "fa fa-caret-down"}))
        );
      } else {
        return R('div', null,
          R('a', {onClick: this.handleToggle}, 
            "Hide Values ",
            R('i', {className: "fa fa-caret-up"}))
        );
      }
    }

    render() {
      if (this.state.collapsed) {
        return this.renderToggle();
      }

      if (this.props.reorderable) {
        return this.renderReorderable();
      } else {
        return this.renderNonReorderable();
      }
    }
  };
  CategoryMapComponent.initClass();
  return CategoryMapComponent;
})();
