var AutoSizeComponent, H, MapComponent, MapDesignerComponent, MapViewComponent, React, UndoStack,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

MapViewComponent = require('./MapViewComponent');

MapDesignerComponent = require('./MapDesignerComponent');

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

UndoStack = require('../UndoStack');

module.exports = MapComponent = (function(superClass) {
  extend(MapComponent, superClass);

  MapComponent.propTypes = {
    layerFactory: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    titleElem: React.PropTypes.node,
    extraTitleButtonsElem: React.PropTypes.node
  };

  function MapComponent(props) {
    this.handleRedo = bind(this.handleRedo, this);
    this.handleUndo = bind(this.handleUndo, this);
    MapComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      undoStack: new UndoStack().push(props.design)
    };
  }

  MapComponent.prototype.componentWillReceiveProps = function(nextProps) {
    return this.setState({
      undoStack: this.state.undoStack.push(nextProps.design)
    });
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

  MapComponent.prototype.renderActionLinks = function() {
    return H.div(null, H.a({
      key: "undo",
      className: "btn btn-link btn-sm " + (!this.state.undoStack.canUndo() ? "disabled" : ""),
      onClick: this.handleUndo
    }, H.span({
      className: "glyphicon glyphicon-triangle-left"
    }), " Undo"), " ", H.a({
      key: "redo",
      className: "btn btn-link btn-sm " + (!this.state.undoStack.canRedo() ? "disabled" : ""),
      onClick: this.handleRedo
    }, H.span({
      className: "glyphicon glyphicon-triangle-right"
    }), " Redo"), this.props.extraTitleButtonsElem);
  };

  MapComponent.prototype.renderHeader = function() {
    return H.div({
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        padding: 4,
        borderBottom: "solid 2px #AAA"
      }
    }, H.div({
      style: {
        float: "right"
      }
    }, this.renderActionLinks()), this.props.titleElem);
  };

  MapComponent.prototype.render = function() {
    return H.div({
      style: {
        width: "100%",
        height: "100%",
        position: "relative"
      }
    }, H.div({
      style: {
        position: "absolute",
        width: "70%",
        height: "100%",
        paddingTop: 40
      }
    }, this.renderHeader(), H.div({
      style: {
        width: "100%",
        height: "100%"
      }
    }, React.createElement(AutoSizeComponent, {
      injectWidth: true,
      injectHeight: true
    }, React.createElement(MapViewComponent, {
      schema: this.props.schema,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      layerFactory: this.props.layerFactory
    })))), H.div({
      style: {
        position: "absolute",
        left: "70%",
        width: "30%",
        height: "100%",
        borderLeft: "solid 3px #AAA",
        overflowY: "auto"
      }
    }, React.createElement(MapDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      layerFactory: this.props.layerFactory
    })));
  };

  return MapComponent;

})(React.Component);
