var AdvancedOptionsComponent, AttributionComponent, BaseLayerDesignerComponent, CheckboxComponent, ClickOutHandler, ExprCompiler, H, MapDesignerComponent, MapFiltersDesignerComponent, MapLayersDesignerComponent, MapUtils, NumberInputComponent, PopoverHelpComponent, PropTypes, R, React, TabbedComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

TabbedComponent = require('react-library/lib/TabbedComponent');

NumberInputComponent = require('react-library/lib/NumberInputComponent');

CheckboxComponent = require('../CheckboxComponent');

ClickOutHandler = require('react-onclickout');

MapLayersDesignerComponent = require('./MapLayersDesignerComponent');

MapFiltersDesignerComponent = require('./MapFiltersDesignerComponent');

BaseLayerDesignerComponent = require('./BaseLayerDesignerComponent');

PopoverHelpComponent = require('react-library/lib/PopoverHelpComponent');

MapUtils = require('./MapUtils');

ExprCompiler = require('mwater-expressions').ExprCompiler;

module.exports = MapDesignerComponent = (function(superClass) {
  extend(MapDesignerComponent, superClass);

  function MapDesignerComponent() {
    this.handleConvertToClusterMap = bind(this.handleConvertToClusterMap, this);
    this.handleAutoBoundsChange = bind(this.handleAutoBoundsChange, this);
    this.handleAttributionChange = bind(this.handleAttributionChange, this);
    return MapDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  MapDesignerComponent.childContextTypes = {
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)
  };

  MapDesignerComponent.prototype.getChildContext = function() {
    return {
      activeTables: MapUtils.getFilterableTables(this.props.design, this.props.schema)
    };
  };

  MapDesignerComponent.prototype.handleAttributionChange = function(text) {
    var design;
    design = _.extend({}, this.props.design, {
      attribution: text
    });
    return this.props.onDesignChange(design);
  };

  MapDesignerComponent.prototype.handleAutoBoundsChange = function(value) {
    var design;
    design = _.extend({}, this.props.design, {
      autoBounds: value
    });
    return this.props.onDesignChange(design);
  };

  MapDesignerComponent.prototype.handleConvertToClusterMap = function() {
    return this.props.onDesignChange(MapUtils.convertToClusterMap(this.props.design));
  };

  MapDesignerComponent.prototype.renderOptionsTab = function() {
    return H.div(null, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Map Style"), R(BaseLayerDesignerComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })), R(CheckboxComponent, {
      checked: this.props.design.autoBounds,
      onChange: this.handleAutoBoundsChange
    }, H.span({
      className: "text-muted"
    }, "Automatic zoom ", R(PopoverHelpComponent, {
      placement: "left"
    }, 'Automatically zoom to the complete data whenever the map is loaded or the filters change'))), MapUtils.canConvertToClusterMap(this.props.design) ? H.div({
      key: "tocluster"
    }, H.a({
      onClick: this.handleConvertToClusterMap,
      className: "btn btn-link btn-sm"
    }, "Convert to cluster map")) : void 0, R(AttributionComponent, {
      text: this.props.design.attribution,
      onTextChange: this.handleAttributionChange
    }), H.br(), R(AdvancedOptionsComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    }));
  };

  MapDesignerComponent.prototype.render = function() {
    var expr, exprCompiler, filters, jsonql, ref, table;
    filters = _.clone(this.props.filters) || [];
    exprCompiler = new ExprCompiler(this.props.schema);
    ref = this.props.design.filters || {};
    for (table in ref) {
      expr = ref[table];
      jsonql = exprCompiler.compileExpr({
        expr: expr,
        tableAlias: "{alias}"
      });
      if (jsonql) {
        filters.push({
          table: table,
          jsonql: jsonql
        });
      }
    }
    return H.div({
      style: {
        padding: 5
      }
    }, R(TabbedComponent, {
      initialTabId: "layers",
      tabs: [
        {
          id: "layers",
          label: [
            H.i({
              className: "fa fa-bars"
            }), " Layers"
          ],
          elem: R(MapLayersDesignerComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.props.design,
            onDesignChange: this.props.onDesignChange,
            allowEditingLayers: true,
            filters: _.compact(filters)
          })
        }, {
          id: "filters",
          label: [
            H.i({
              className: "fa fa-filter"
            }), " Filters"
          ],
          elem: R(MapFiltersDesignerComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.props.design,
            onDesignChange: this.props.onDesignChange
          })
        }, {
          id: "options",
          label: [
            H.i({
              className: "fa fa-cog"
            }), " Options"
          ],
          elem: this.renderOptionsTab()
        }
      ]
    }));
  };

  return MapDesignerComponent;

})(React.Component);

AttributionComponent = (function(superClass) {
  extend(AttributionComponent, superClass);

  AttributionComponent.propTypes = {
    text: PropTypes.string,
    onTextChange: PropTypes.func.isRequired
  };

  AttributionComponent.defaultProps = {
    text: null
  };

  function AttributionComponent() {
    this.handleTextClick = bind(this.handleTextClick, this);
    this.handleClickOut = bind(this.handleClickOut, this);
    this.handleTextChange = bind(this.handleTextChange, this);
    AttributionComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: false
    };
  }

  AttributionComponent.prototype.handleTextChange = function(e) {
    return this.props.onTextChange(e.target.value);
  };

  AttributionComponent.prototype.handleClickOut = function() {
    return this.setState({
      editing: false
    });
  };

  AttributionComponent.prototype.renderEditor = function() {
    return R(ClickOutHandler, {
      onClickOut: this.handleClickOut
    }, H.input({
      ref: "attributionInput",
      onChange: this.handleTextChange,
      value: this.props.text,
      className: 'form-control'
    }));
  };

  AttributionComponent.prototype.handleTextClick = function() {
    return this.setState({
      editing: true
    });
  };

  AttributionComponent.prototype.render = function() {
    var elem;
    elem = H.div({
      style: {
        marginLeft: 5
      }
    }, this.state.editing ? this.renderEditor() : this.props.text ? H.span({
      onClick: this.handleTextClick,
      style: {
        cursor: "pointer"
      }
    }, this.props.text) : H.a({
      onClick: this.handleTextClick,
      className: "btn btn-link btn-sm"
    }, "+ Add attribution"));
    if (this.props.text || this.state.editing) {
      elem = H.div({
        className: "form-group"
      }, H.label({
        className: "text-muted"
      }, "Attribution"), elem);
    }
    return elem;
  };

  return AttributionComponent;

})(React.Component);

AdvancedOptionsComponent = (function(superClass) {
  extend(AdvancedOptionsComponent, superClass);

  AdvancedOptionsComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };

  function AdvancedOptionsComponent(props) {
    AdvancedOptionsComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      expanded: false
    };
  }

  AdvancedOptionsComponent.prototype.render = function() {
    if (!this.state.expanded) {
      return H.div(null, H.a({
        className: "btn btn-link btn-xs",
        onClick: ((function(_this) {
          return function() {
            return _this.setState({
              expanded: true
            });
          };
        })(this))
      }, "Advanced options..."));
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Advanced"), H.div(null, H.span({
      className: "text-muted"
    }, "Maximum Zoom Level: "), " ", R(NumberInputComponent, {
      small: true,
      style: {
        display: "inline-block"
      },
      placeholder: "None",
      value: this.props.design.maxZoom,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onDesignChange(_.extend({}, _this.props.design, {
            maxZoom: v
          }));
        };
      })(this)
    })));
  };

  return AdvancedOptionsComponent;

})(React.Component);
