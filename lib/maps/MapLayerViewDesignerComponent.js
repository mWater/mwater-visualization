var ActionCancelModalComponent, H, MapLayerViewDesignerComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

module.exports = MapLayerViewDesignerComponent = (function(superClass) {
  extend(MapLayerViewDesignerComponent, superClass);

  MapLayerViewDesignerComponent.propTypes = {
    layerView: React.PropTypes.object.isRequired,
    onLayerViewChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    layerFactory: React.PropTypes.object.isRequired
  };

  function MapLayerViewDesignerComponent() {
    this.handleRename = bind(this.handleRename, this);
    this.handleSaveEditing = bind(this.handleSaveEditing, this);
    this.handleToggleEditing = bind(this.handleToggleEditing, this);
    this.handleVisibleClick = bind(this.handleVisibleClick, this);
    var layer;
    MapLayerViewDesignerComponent.__super__.constructor.apply(this, arguments);
    layer = this.props.layerFactory.createLayer(this.props.layerView.type, this.props.layerView.design);
    this.state = {
      editing: layer.isIncomplete()
    };
  }

  MapLayerViewDesignerComponent.prototype.update = function(updates) {
    return this.props.onLayerViewChange(_.extend({}, this.props.layerView, updates));
  };

  MapLayerViewDesignerComponent.prototype.handleVisibleClick = function(index) {
    return this.update({
      visible: !this.props.layerView.visible
    });
  };

  MapLayerViewDesignerComponent.prototype.handleToggleEditing = function() {
    return this.setState({
      editing: !this.state.editing
    });
  };

  MapLayerViewDesignerComponent.prototype.handleSaveEditing = function(design) {
    return this.update({
      design: design
    });
  };

  MapLayerViewDesignerComponent.prototype.handleRename = function() {
    var name;
    name = prompt("Enter new name", this.props.layerView.name);
    if (name) {
      return this.update({
        name: name
      });
    }
  };

  MapLayerViewDesignerComponent.prototype.renderVisible = function() {
    if (this.props.layerView.visible) {
      return H.i({
        className: "fa fa-fw fa-check-square",
        style: {
          color: "#2E6DA4"
        },
        onClick: this.handleVisibleClick
      });
    } else {
      return H.i({
        className: "fa fa-fw fa-square",
        style: {
          color: "#DDDDDD"
        },
        onClick: this.handleVisibleClick
      });
    }
  };

  MapLayerViewDesignerComponent.prototype.renderName = function() {
    return H.span({
      className: "hover-display-parent"
    }, "\u00A0", this.props.layerView.name, " ", H.a({
      className: "hover-display-child glyphicon glyphicon-pencil",
      onClick: this.handleRename
    }));
  };

  MapLayerViewDesignerComponent.prototype.renderEditor = function() {
    var layer;
    layer = this.props.layerFactory.createLayer(this.props.layerView.type, this.props.layerView.design);
    return H.div(null, H.div({
      style: {
        textAlign: "right"
      }
    }, H.a({
      className: "btn btn-link btn-xs",
      onClick: this.props.onRemove
    }, "Delete Layer")), layer.isEditable() ? layer.createDesignerElement({
      onDesignChange: this.handleSaveEditing
    }) : void 0);
  };

  MapLayerViewDesignerComponent.prototype.renderLayerEditToggle = function() {
    var layer;
    layer = this.props.layerFactory.createLayer(this.props.layerView.type, this.props.layerView.design);
    return H.div({
      style: {
        float: "right"
      },
      key: "gear"
    }, H.a({
      onClick: this.handleToggleEditing
    }, this.state.editing ? H.i({
      className: "fa fa-caret-square-o-up"
    }) : H.i({
      className: "fa fa-caret-square-o-down"
    })));
  };

  MapLayerViewDesignerComponent.prototype.render = function() {
    var layer;
    layer = this.props.layerFactory.createLayer(this.props.layerView.type, this.props.layerView.design);
    return H.div(null, H.div({
      style: {
        fontSize: 16
      },
      key: "layerView"
    }, this.renderLayerEditToggle(), this.renderVisible(), this.renderName()), this.state.editing ? this.renderEditor() : void 0);
  };

  return MapLayerViewDesignerComponent;

})(React.Component);
