var AutoSizeComponent, MapComponent, MapControlComponent, MapDesignerComponent, MapViewComponent, PopoverHelpComponent, PropTypes, R, React, UndoStack, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

MapViewComponent = require('./MapViewComponent');

MapDesignerComponent = require('./MapDesignerComponent');

MapControlComponent = require('./MapControlComponent');

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

UndoStack = require('../UndoStack');

PopoverHelpComponent = require('react-library/lib/PopoverHelpComponent');

module.exports = MapComponent = (function(superClass) {
  extend(MapComponent, superClass);

  MapComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    mapDataSource: PropTypes.shape({
      getLayerDataSource: PropTypes.func.isRequired
    }).isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    onRowClick: PropTypes.func,
    titleElem: PropTypes.node,
    extraTitleButtonsElem: PropTypes.node
  };

  function MapComponent(props) {
    this.refMapView = bind(this.refMapView, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    this.handleZoomLockClick = bind(this.handleZoomLockClick, this);
    this.handleRedo = bind(this.handleRedo, this);
    this.handleUndo = bind(this.handleUndo, this);
    MapComponent.__super__.constructor.call(this, props);
    this.state = {
      undoStack: new UndoStack().push(props.design),
      transientDesign: props.design,
      zoomLocked: true
    };
  }

  MapComponent.prototype.componentWillReceiveProps = function(nextProps) {
    this.setState({
      undoStack: this.state.undoStack.push(nextProps.design)
    });
    if (!_.isEqual(nextProps.design, this.props.design)) {
      return this.setState({
        transientDesign: nextProps.design
      });
    }
  };

  MapComponent.prototype.handleUndo = function() {
    var undoStack;
    undoStack = this.state.undoStack.undo();
    return this.setState({
      undoStack: undoStack
    }, (function(_this) {
      return function() {
        return _this.props.onDesignChange(undoStack.getValue());
      };
    })(this));
  };

  MapComponent.prototype.handleRedo = function() {
    var undoStack;
    undoStack = this.state.undoStack.redo();
    return this.setState({
      undoStack: undoStack
    }, (function(_this) {
      return function() {
        return _this.props.onDesignChange(undoStack.getValue());
      };
    })(this));
  };

  MapComponent.prototype.getDesign = function() {
    return this.state.transientDesign || this.props.design;
  };

  MapComponent.prototype.handleZoomLockClick = function() {
    return this.setState({
      zoomLocked: !this.state.zoomLocked
    });
  };

  MapComponent.prototype.renderActionLinks = function() {
    return R('div', null, this.props.onDesignChange != null ? [
      R('a', {
        key: "lock",
        className: "btn btn-link btn-sm",
        onClick: this.handleZoomLockClick
      }, R('span', {
        className: "fa " + (this.state.zoomLocked ? "fa-lock red" : "fa-unlock green"),
        style: {
          marginRight: 5
        }
      }), R(PopoverHelpComponent, {
        placement: "bottom"
      }, 'Changes to zoom level wont be saved in locked mode')), R('a', {
        key: "undo",
        className: "btn btn-link btn-sm " + (!this.state.undoStack.canUndo() ? "disabled" : ""),
        onClick: this.handleUndo
      }, R('span', {
        className: "glyphicon glyphicon-triangle-left"
      }), " Undo"), " ", R('a', {
        key: "redo",
        className: "btn btn-link btn-sm " + (!this.state.undoStack.canRedo() ? "disabled" : ""),
        onClick: this.handleRedo
      }, R('span', {
        className: "glyphicon glyphicon-triangle-right"
      }), " Redo")
    ] : void 0, this.props.extraTitleButtonsElem);
  };

  MapComponent.prototype.renderHeader = function() {
    return R('div', {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        padding: 4,
        borderBottom: "solid 2px #AAA"
      }
    }, R('div', {
      style: {
        float: "right"
      }
    }, this.renderActionLinks()), this.props.titleElem);
  };

  MapComponent.prototype.handleDesignChange = function(design) {
    if (this.props.onDesignChange) {
      return this.props.onDesignChange(design);
    } else {
      return this.setState({
        transientDesign: design
      });
    }
  };

  MapComponent.prototype.getDesign = function() {
    if (this.props.onDesignChange) {
      return this.props.design;
    } else {
      return this.state.transientDesign;
    }
  };

  MapComponent.prototype.refMapView = function(el) {
    return this.mapView = el;
  };

  MapComponent.prototype.renderView = function() {
    return React.createElement(AutoSizeComponent, {
      injectWidth: true,
      injectHeight: true
    }, React.createElement(MapViewComponent, {
      ref: this.refMapView,
      mapDataSource: this.props.mapDataSource,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.getDesign(),
      onDesignChange: this.handleDesignChange,
      zoomLocked: this.state.zoomLocked,
      onRowClick: this.props.onRowClick
    }));
  };

  MapComponent.prototype.renderDesigner = function() {
    if (this.props.onDesignChange) {
      return React.createElement(MapDesignerComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        design: this.getDesign(),
        onDesignChange: this.handleDesignChange
      });
    } else {
      return React.createElement(MapControlComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        design: this.getDesign(),
        onDesignChange: this.handleDesignChange
      });
    }
  };

  MapComponent.prototype.render = function() {
    return R('div', {
      style: {
        width: "100%",
        height: "100%",
        position: "relative"
      }
    }, R('div', {
      style: {
        position: "absolute",
        width: "70%",
        height: "100%",
        paddingTop: 40
      }
    }, this.renderHeader(), R('div', {
      style: {
        width: "100%",
        height: "100%"
      }
    }, this.renderView())), R('div', {
      style: {
        position: "absolute",
        left: "70%",
        width: "30%",
        height: "100%",
        borderLeft: "solid 3px #AAA",
        overflowY: "auto"
      }
    }, this.renderDesigner()));
  };

  return MapComponent;

})(React.Component);
