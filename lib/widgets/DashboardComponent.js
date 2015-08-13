var AutoSizeComponent, DashboardComponent, DashboardDesignerComponent, DashboardViewComponent, H, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

DashboardViewComponent = require('./DashboardViewComponent');

DashboardDesignerComponent = require('./DashboardDesignerComponent');

AutoSizeComponent = require('./../AutoSizeComponent');

module.exports = DashboardComponent = (function(superClass) {
  extend(DashboardComponent, superClass);

  DashboardComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    widgetFactory: React.PropTypes.object.isRequired,
    initialIsDesigning: React.PropTypes.bool.isRequired
  };

  function DashboardComponent(props) {
    this.handleToggleDesigning = bind(this.handleToggleDesigning, this);
    this.handlePrint = bind(this.handlePrint, this);
    this.handleSelectedWidgetIdChange = bind(this.handleSelectedWidgetIdChange, this);
    DashboardComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      selectedWidgetId: null,
      isDesigning: props.initialIsDesigning
    };
  }

  DashboardComponent.prototype.handleSelectedWidgetIdChange = function(selectedWidgetId) {
    return this.setState({
      selectedWidgetId: selectedWidgetId
    });
  };

  DashboardComponent.prototype.handlePrint = function() {
    return this.refs.dashboardViewContainer.getChild().print();
  };

  DashboardComponent.prototype.handleToggleDesigning = function() {
    return this.setState({
      isDesigning: !this.state.isDesigning
    });
  };

  DashboardComponent.prototype.renderActionLinks = function() {
    return H.div({
      style: {
        textAlign: "right",
        position: "absolute",
        top: 0,
        right: 0
      }
    }, H.a({
      className: "btn btn-link btn-sm",
      onClick: this.handleToggleDesigning
    }, H.span({
      className: "glyphicon glyphicon-pencil"
    }), this.state.isDesigning ? " Close Editor" : " Edit"), H.a({
      className: "btn btn-link btn-sm",
      onClick: this.handlePrint
    }, H.span({
      className: "glyphicon glyphicon-print"
    })));
  };

  DashboardComponent.prototype.renderView = function() {
    return H.div({
      key: "view",
      style: {
        height: "100%",
        overflowY: "auto",
        paddingTop: 30,
        paddingRight: 20,
        position: "relative"
      }
    }, this.renderActionLinks(), React.createElement(AutoSizeComponent, {
      injectWidth: true,
      ref: "dashboardViewContainer"
    }, React.createElement(DashboardViewComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      selectedWidgetId: this.state.selectedWidgetId,
      onSelectedWidgetIdChange: this.handleSelectedWidgetIdChange,
      isDesigning: this.state.isDesigning,
      onIsDesigningChange: null,
      widgetFactory: this.props.widgetFactory
    })));
  };

  DashboardComponent.prototype.renderDesigner = function() {
    return React.createElement(DashboardDesignerComponent, {
      key: "designer",
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      selectedWidgetId: this.state.selectedWidgetId,
      onSelectedWidgetIdChange: this.handleSelectedWidgetIdChange,
      isDesigning: true,
      onIsDesigningChange: null,
      widgetFactory: this.props.widgetFactory
    });
  };

  DashboardComponent.prototype.render = function() {
    if (this.state.isDesigning) {
      return H.div({
        className: "row",
        style: {
          height: "100%"
        }
      }, H.div({
        className: "col-xs-8",
        style: {
          padding: 0,
          height: "100%"
        }
      }, this.renderView()), H.div({
        className: "col-xs-4",
        style: {
          borderLeft: "solid 3px #AAA",
          height: "100%",
          paddingTop: 10,
          overflow: "auto"
        }
      }, this.renderDesigner()));
    } else {
      return H.div({
        className: "row",
        style: {
          height: "100%"
        }
      }, this.renderView());
    }
  };

  return DashboardComponent;

})(React.Component);
