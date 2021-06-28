// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MapLayerViewDesignerComponent;
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import ActionCancelModalComponent from 'react-library/lib/ActionCancelModalComponent';
import { default as Rcslider } from 'rc-slider';
import LayerFactory from './LayerFactory';
import ui from 'react-library/lib/bootstrap';
import PopoverHelpComponent from 'react-library/lib/PopoverHelpComponent';

// A single row in the table of layer views. Handles the editor state
export default MapLayerViewDesignerComponent = (function() {
  MapLayerViewDesignerComponent = class MapLayerViewDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired,
        layerView: PropTypes.object.isRequired,  // See Map Design.md
        onLayerViewChange: PropTypes.func.isRequired, // Called with new layer view
        onRemove: PropTypes.func.isRequired,  // Called to remove
        connectDragSource: PropTypes.func,    // connector for reorderable
        connectDragPreview: PropTypes.func,  //connector for reorderable
        connectDropTarget: PropTypes.func, // connector for reorderable
        allowEditingLayer: PropTypes.bool.isRequired,
        filters: PropTypes.array
      };
         // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    }

    constructor(props) {
      super(props);

      const layer = LayerFactory.createLayer(this.props.layerView.type);

      this.state = { 
        editing: props.allowEditingLayer && layer.isIncomplete(this.props.layerView.design, this.props.schema) // Editing initially if incomplete
      };
    }

    update(updates) {
      return this.props.onLayerViewChange(_.extend({}, this.props.layerView, updates));
    }

    handleVisibleClick = () => {
      return this.update({visible: !this.props.layerView.visible});
    };

    handleHideLegend = hideLegend => {
      return this.update({hideLegend});
    };

    handleGroupChange = group => {
      return this.update({group});
    };

    handleToggleEditing = () => { return this.setState({editing: !this.state.editing}); };
    handleSaveEditing = design => { return this.update({design}); };

    handleRename = () => {
      if (this.props.allowEditingLayer) {
        const name = prompt("Enter new name", this.props.layerView.name);
        if (name) {
          return this.update({name});
        }
      }
    };

    renderVisible() {
      if (this.props.layerView.visible) {
        return R('i', {className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" }, onClick: this.handleVisibleClick});
      } else {
        return R('i', {className: "fa fa-fw fa-square", style: { color: "#DDDDDD" }, onClick: this.handleVisibleClick});
      }
    }

    renderAdvanced() {
      return R('div', {key: "advanced", style: { display: "grid", gridTemplateColumns: "50% auto auto 1fr", alignItems: "center", columnGap: 5 }},
        R(ui.Checkbox, {value: this.props.layerView.hideLegend, onChange: this.handleHideLegend, inline: true},
          "Hide Legend"),
        R('label', {className: "text-muted", key: "label"},
          "Group:"),
        R(ui.TextInput, {key: "input", value: this.props.layerView.group, onChange: this.handleGroupChange, style: { width: "5em" }, placeholder: "None"}),
        R('div', null,
          R(PopoverHelpComponent, {placement: "top", key: "help"},
            'Layers in the same group can only be selected one at a time')
        )
      );
    }

    renderName() {
      return R('span', {className: "hover-display-parent", onClick: this.handleRename, style: { cursor: "pointer" }},
        this.props.layerView.name,
        " ",
        R('span', {className: "hover-display-child glyphicon glyphicon-pencil text-muted"}));
    }

    renderEditor() {
      const layer = LayerFactory.createLayer(this.props.layerView.type);
      return R('div', null,
        layer.isEditable() ?
          layer.createDesignerElement({
            design: this.props.layerView.design,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onDesignChange: this.handleSaveEditing,
            filters: this.props.filters
          }) : undefined,
        this.renderOpacityControl(),
        this.renderAdvanced());
    }

    renderLayerEditToggle() {
      return R('div', {key: "edit", style: { marginBottom: (this.state.editing ? 10 : undefined) }},
        R('a', {onClick: this.handleToggleEditing, style: { fontSize: 12, cursor: "pointer" }},
          this.state.editing ?
            [
              R('i', {className: "fa fa-caret-up"}),
              " Close"
            ]
          :
            [
              R('i', {className: "fa fa-cog"}),
              " Customize..."
            ]));
    }

    handleOpacityChange = newValue => {
      return this.update({opacity: newValue/100});
    };

    handleRemove = () => {
      if (confirm("Delete layer?")) {
        return this.props.onRemove();
      }
    };

    renderOpacityControl() {
      return R('div', {className: 'form-group', style: { paddingTop: 10 }},
        R('label', {className: 'text-muted'},
          R('span', null,
            `Opacity: ${Math.round(this.props.layerView.opacity * 100) }%`)
        ),
        R('div', {style: {padding: '10px'}},
          React.createElement(Rcslider, {
            min: 0,
            max: 100,
            step: 1,
            tipTransitionName: "rc-slider-tooltip-zoom-down",
            value: this.props.layerView.opacity * 100,
            onChange: this.handleOpacityChange
          }
          )
        )
      );
    }

    renderDeleteLayer() {
      return R('div', {style: { float: "right", cursor: "pointer", marginLeft: 10 }, key: "delete"},
        R('a', {onClick: this.handleRemove},
          R('i', {className: "fa fa-remove"}))
      );
    }

    render() {
      const layer = LayerFactory.createLayer(this.props.layerView.type);
      const style = {
        cursor: "move",
        marginRight: 8,
        opacity: 0.5
      };
        // float: "right"

      return this.props.connectDragPreview(this.props.connectDropTarget(R('div', null,
        R('div', {style: { fontSize: 16 }, key: "layerView"},
          this.props.connectDragSource ?
            this.props.connectDragSource(R('i', {className: "fa fa-bars", style})) : undefined,
          this.props.allowEditingLayer ?
            this.renderDeleteLayer() : undefined,
          this.renderVisible(),
          "\u00A0",
          this.renderName()),
        this.props.allowEditingLayer ?
          this.renderLayerEditToggle() : undefined,
        this.state.editing ?
          this.renderEditor() : undefined
      )));
    }
  };
  MapLayerViewDesignerComponent.initClass();
  return MapLayerViewDesignerComponent;
})();

