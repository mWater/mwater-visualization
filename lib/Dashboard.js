var AutoWidthComponent, Dashboard, DashboardDesignerComponent, DashboardViewComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

DashboardViewComponent = require('./DashboardViewComponent');

DashboardDesignerComponent = require('./DashboardDesignerComponent');

AutoWidthComponent = require('./AutoWidthComponent');

module.exports = Dashboard = (function() {
  function Dashboard(options) {
    this.handleIsDesigningChange = bind(this.handleIsDesigningChange, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    this.handleSelectedWidgetIdChange = bind(this.handleSelectedWidgetIdChange, this);
    this.design = options.design;
    this.viewNode = options.viewNode;
    this.isDesigning = options.isDesigning;
    this.onShowDesigner = options.onShowDesigner;
    this.onHideDesigner = options.onHideDesigner;
    this.onDesignChange = options.onDesignChange;
    this.widgetFactory = options.widgetFactory;
    this.selectedWidgetId = null;
    if (this.isDesigning) {
      this.designerNode = this.onShowDesigner();
    }
  }

  Dashboard.prototype.handleSelectedWidgetIdChange = function(id) {
    this.selectedWidgetId = id;
    return this.render();
  };

  Dashboard.prototype.handleDesignChange = function(design) {
    this.design = design;
    if (this.onDesignChange) {
      this.onDesignChange(design);
    }
    return this.render();
  };

  Dashboard.prototype.handleIsDesigningChange = function(isDesigning) {
    this.isDesigning = isDesigning;
    if (!this.isDesigning && this.designerNode) {
      React.unmountComponentAtNode(this.designerNode);
      this.designerNode = null;
      this.onHideDesigner();
    }
    if (this.isDesigning && !this.designerNode) {
      this.designerNode = this.onShowDesigner();
    }
    return this.render();
  };

  Dashboard.prototype.render = function() {
    var designerElem, viewElem;
    viewElem = React.createElement(DashboardViewComponent, {
      design: this.design,
      onDesignChange: this.handleDesignChange,
      selectedWidgetId: this.selectedWidgetId,
      onSelectedWidgetIdChange: this.handleSelectedWidgetIdChange,
      isDesigning: this.isDesigning,
      onIsDesigningChange: this.handleIsDesigningChange,
      widgetFactory: this.widgetFactory
    });
    React.render(viewElem, this.viewNode);
    if (this.isDesigning) {
      designerElem = React.createElement(DashboardDesignerComponent, {
        design: this.design,
        onDesignChange: this.handleDesignChange,
        selectedWidgetId: this.selectedWidgetId,
        onSelectedWidgetIdChange: this.handleSelectedWidgetIdChange,
        isDesigning: this.isDesigning,
        onIsDesigningChange: this.handleIsDesigningChange,
        width: this.width,
        widgetFactory: this.widgetFactory
      });
      return React.render(designerElem, this.designerNode);
    }
  };

  Dashboard.prototype.destroy = function() {
    if (this.viewNode) {
      React.unmountComponentAtNode(this.viewNode);
    }
    if (this.designerNode) {
      return React.unmountComponentAtNode(this.designerNode);
    }
  };

  return Dashboard;

})();
