var ExpandingComponent, H, LayerFactory, LinkComponent, MWaterAddLayerComponent, R, React, _, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('node-uuid');

LayerFactory = require('./LayerFactory');

module.exports = MWaterAddLayerComponent = (function(superClass) {
  extend(MWaterAddLayerComponent, superClass);

  MWaterAddLayerComponent.propTypes = {
    firstLayer: React.PropTypes.bool,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  function MWaterAddLayerComponent(props) {
    this.handleAddLayerView = bind(this.handleAddLayerView, this);
    this.handleAddLayer = bind(this.handleAddLayer, this);
    MWaterAddLayerComponent.__super__.constructor.call(this, props);
    this.state = {
      adding: false
    };
  }

  MWaterAddLayerComponent.prototype.handleAddLayer = function() {
    var design, layer, layerView;
    this.setState({
      adding: false
    });
    layerView = {
      id: uuid.v4(),
      name: "Water Points",
      desc: "",
      type: "Markers",
      visible: true,
      opacity: 1
    };
    design = {
      "axes": {
        "geometry": {
          "expr": {
            "type": "field",
            "table": "entities.water_point",
            "column": "location"
          }
        }
      },
      "color": "#0088FF",
      "filter": null,
      "table": "entities.water_point"
    };
    layer = LayerFactory.createLayer(layerView.type);
    layerView.design = layer.cleanDesign(design, this.props.schema);
    return this.handleAddLayerView(layerView);
  };

  MWaterAddLayerComponent.prototype.handleAddLayerView = function(layerView) {
    var design, layerViews;
    layerViews = this.props.design.layerViews.slice();
    layerViews.push(layerView);
    design = _.extend({}, this.props.design, {
      layerViews: layerViews
    });
    return this.props.onDesignChange(design);
  };

  MWaterAddLayerComponent.prototype.render = function() {
    if (!this.state.adding && !this.props.firstLayer) {
      return H.button({
        type: "button",
        className: "btn btn-primary",
        onClick: ((function(_this) {
          return function() {
            return _this.setState({
              adding: true
            });
          };
        })(this)),
        style: {
          marginLeft: 5
        }
      }, H.span({
        className: "glyphicon glyphicon-plus"
      }), " Add");
    }
    return H.div({
      style: {
        marginLeft: 5
      }
    }, H.label(null, "What do you want to map?", !this.props.firstLayer ? H.button({
      className: "btn btn-link btn-sm",
      onClick: ((function(_this) {
        return function() {
          return _this.setState({
            adding: false
          });
        };
      })(this))
    }, H.i({
      className: "fa fa-remove"
    })) : void 0), H.div({
      style: {
        marginLeft: 5
      }
    }, R(ExpandingComponent, {
      label: "Sites",
      initiallyOpen: true
    }, R(ExpandingComponent, {
      label: "Water Points"
    }, R(LinkComponent, {
      onClick: this.handleAddLayer
    }, "All Water Points"), R(LinkComponent, {
      onClick: this.handleAddLayer
    }, "Water Points By Type"), R(LinkComponent, {
      onClick: this.handleAddLayer
    }, "Safe Water Access")), R(ExpandingComponent, {
      label: "Communities"
    }), R(ExpandingComponent, {
      label: "Households"
    }), R(ExpandingComponent, {
      label: "Places of Worship"
    }), R(ExpandingComponent, {
      label: "Schools"
    }), R(ExpandingComponent, {
      label: "Sanitation Facilities"
    })), R(ExpandingComponent, {
      label: "Surveys"
    }, R(ExpandingComponent, {
      initiallyOpen: true,
      label: "My Surveys"
    }, R(ExpandingComponent, {
      label: "UWP Pre-Site Assessment"
    }, H.div({
      className: "form-group"
    }, H.div(null, "Location to map"), H.select({
      className: "form-control input-sm"
    }, H.option({
      value: "a"
    }, "Which water point is this associated with?"), H.option({
      value: "b"
    }, "Enter Pre-Site location"))), H.div({
      className: "form-group"
    }, H.div(null, "Answer to visualize"), H.select({
      className: "form-control input-sm"
    }, H.option({
      value: "a"
    }, "None"), H.option({
      value: "b"
    }, "What type of facility is this"), H.option({
      value: "c"
    }, "Is it stable?"))), H.button({
      className: "btn btn-sm btn-primary",
      type: "button"
    }, H.i({
      className: "fa fa-plus"
    }), " Create")), R(ExpandingComponent, {
      label: "GeMap 3"
    })), R(ExpandingComponent, {
      initiallyOpen: false,
      label: "Public Surveys"
    })), R(ExpandingComponent, {
      label: "Advanced"
    }, R(LinkComponent, {
      onClick: this.handleAddLayer
    }, "Markers"), R(LinkComponent, {
      onClick: this.handleAddLayer
    }, "Circles (radius map)"), R(LinkComponent, {
      onClick: this.handleAddLayer
    }, "Choropleth (color regions)"))), this.props.firstLayer ? H.div({
      style: {
        marginTop: 40
      }
    }, H.button({
      className: "btn btn-default",
      type: "button"
    }, H.i({
      className: "fa fa-magic"
    }), " Water P", H.i({
      className: "fa fa-dot-circle-o",
      style: {
        color: "#337ab7",
        fontSize: "80%"
      }
    }), "int Mapper Wizard")) : void 0);
  };

  return MWaterAddLayerComponent;

})(React.Component);

ExpandingComponent = (function(superClass) {
  extend(ExpandingComponent, superClass);

  function ExpandingComponent(props) {
    ExpandingComponent.__super__.constructor.call(this, props);
    this.state = {
      open: props.initiallyOpen
    };
  }

  ExpandingComponent.prototype.render = function() {
    return H.div({
      style: {
        marginBottom: 5,
        marginTop: 3
      }
    }, H.a({
      style: {
        cursor: "pointer",
        fontSize: 16
      },
      onClick: ((function(_this) {
        return function() {
          return _this.setState({
            open: !_this.state.open
          });
        };
      })(this))
    }, this.state.open ? H.i({
      className: "fa fa-caret-down"
    }) : H.i({
      className: "fa fa-caret-right"
    }), " ", this.props.label), this.state.open ? H.div({
      style: {
        marginLeft: 10
      }
    }, this.props.children) : void 0);
  };

  return ExpandingComponent;

})(React.Component);

LinkComponent = (function(superClass) {
  extend(LinkComponent, superClass);

  function LinkComponent() {
    return LinkComponent.__super__.constructor.apply(this, arguments);
  }

  LinkComponent.prototype.render = function() {
    return H.div({
      style: {
        cursor: "pointer",
        padding: 3
      }
    }, H.a({
      onClick: this.props.onClick
    }, H.i({
      className: "fa fa-plus"
    }), " ", this.props.children));
  };

  return LinkComponent;

})(React.Component);
