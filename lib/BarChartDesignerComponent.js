var AestheticComponent, AggrScalarExprComponent, BarChart, BarChartDesignerComponent, EditableLinkComponent, ExpressionBuilder, H, LogicalExprComponent, PopoverComponent, React, ReactSelect, ScalarExprComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ScalarExprComponent = require('./ScalarExprComponent');

AggrScalarExprComponent = require('./AggrScalarExprComponent');

LogicalExprComponent = require('./LogicalExprComponent');

ExpressionBuilder = require('./ExpressionBuilder');

EditableLinkComponent = require('./EditableLinkComponent');

BarChart = require('./BarChart');

module.exports = BarChartDesignerComponent = (function(superClass) {
  extend(BarChartDesignerComponent, superClass);

  function BarChartDesignerComponent() {
    this.handleTitleChange = bind(this.handleTitleChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleAestheticChange = bind(this.handleAestheticChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    return BarChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  BarChartDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired
  };

  BarChartDesignerComponent.prototype.handleTableChange = function(table) {
    return this.updateDesign({
      table: table
    });
  };

  BarChartDesignerComponent.prototype.handleAestheticChange = function(aes, val) {
    var aesthetics;
    aesthetics = _.clone(this.props.design.aesthetics);
    aesthetics[aes] = val;
    return this.updateDesign({
      aesthetics: aesthetics
    });
  };

  BarChartDesignerComponent.prototype.handleFilterChange = function(val) {
    return this.updateDesign({
      filter: val
    });
  };

  BarChartDesignerComponent.prototype.handleTitleChange = function(ev) {
    var annotations;
    annotations = _.clone(this.props.design.annotations);
    annotations.title = ev.target.value;
    return this.updateDesign({
      annotations: annotations
    });
  };

  BarChartDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  BarChartDesignerComponent.prototype.renderTable = function() {
    var popover;
    if (!this.props.design.table) {
      popover = "Start by selecting a data source";
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-file"
    }), " ", "Data Source"), ": ", React.createElement(PopoverComponent, {
      html: popover
    }, React.createElement(EditableLinkComponent, {
      dropdownItems: this.props.schema.getTables(),
      onDropdownItemClicked: this.handleTableChange,
      onRemove: this.handleTableChange.bind(this, null)
    }, this.props.design.table ? this.props.schema.getTable(this.props.design.table).name : H.i(null, "Select..."))));
  };

  BarChartDesignerComponent.prototype.renderXAesthetic = function() {
    return React.createElement(AestheticComponent, {
      title: [
        H.span({
          className: "glyphicon glyphicon-resize-horizontal"
        }), " Horizontal Axis"
      ],
      schema: this.props.schema,
      table: this.props.design.table,
      types: ["enum", "text"],
      value: this.props.design.aesthetics.x,
      onChange: this.handleAestheticChange.bind(this, "x")
    });
  };

  BarChartDesignerComponent.prototype.renderYAesthetic = function() {
    return React.createElement(AestheticComponent, {
      title: [
        H.span({
          className: "glyphicon glyphicon-resize-vertical"
        }), " Vertical Axis"
      ],
      schema: this.props.schema,
      table: this.props.design.table,
      aggrRequired: true,
      value: this.props.design.aesthetics.y,
      onChange: this.handleAestheticChange.bind(this, "y")
    });
  };

  BarChartDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " ", "Filters"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(LogicalExprComponent, {
      schema: this.props.schema,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  BarChartDesignerComponent.prototype.renderTitle = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Title"), H.input({
      type: "text",
      className: "form-control",
      value: this.props.design.annotations.title,
      onChange: this.handleTitleChange,
      placeholder: "Untitled"
    }));
  };

  BarChartDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.props.design.table ? [this.renderXAesthetic(), this.renderYAesthetic(), this.renderFilter()] : void 0, H.hr(), this.renderTitle());
  };

  return BarChartDesignerComponent;

})(React.Component);

PopoverComponent = (function(superClass) {
  extend(PopoverComponent, superClass);

  function PopoverComponent() {
    return PopoverComponent.__super__.constructor.apply(this, arguments);
  }

  PopoverComponent.propTypes = {
    html: React.PropTypes.string,
    placement: React.PropTypes.string
  };

  PopoverComponent.prototype.componentDidMount = function() {
    return this.updatePopover(this.props, null);
  };

  PopoverComponent.prototype.componentWillUnmount = function() {
    return this.updatePopover(null, this.props);
  };

  PopoverComponent.prototype.componentDidUpdate = function(prevProps) {
    return this.updatePopover(this.props, prevProps);
  };

  PopoverComponent.prototype.updatePopover = function(props, oldProps) {
    if (oldProps && oldProps.html) {
      $(React.findDOMNode(this.refs.child)).popover("destroy");
    }
    if (props && props.html) {
      $(React.findDOMNode(this.refs.child)).popover({
        content: props.html,
        html: true,
        trigger: "manual",
        placement: this.props.placement
      });
      return $(React.findDOMNode(this.refs.child)).popover("show");
    }
  };

  PopoverComponent.prototype.render = function() {
    return React.cloneElement(React.Children.only(this.props.children), {
      ref: "child"
    });
  };

  return PopoverComponent;

})(React.Component);

AestheticComponent = (function(superClass) {
  extend(AestheticComponent, superClass);

  function AestheticComponent() {
    this.handleExprAggrChange = bind(this.handleExprAggrChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return AestheticComponent.__super__.constructor.apply(this, arguments);
  }

  AestheticComponent.propTypes = {
    title: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    table: React.PropTypes.string,
    types: React.PropTypes.array,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    aggrRequired: React.PropTypes.bool
  };

  AestheticComponent.prototype.handleExprChange = function(expr) {
    return this.props.onChange(_.extend({}, this.props.value, {
      expr: expr
    }));
  };

  AestheticComponent.prototype.handleExprAggrChange = function(exprAggr) {
    return this.props.onChange(_.extend({}, this.props.value, exprAggr));
  };

  AestheticComponent.prototype.renderComponent = function() {
    if (this.props.aggrRequired) {
      return React.createElement(AggrScalarExprComponent, {
        editorTitle: this.props.title,
        schema: this.props.schema,
        table: this.props.table,
        types: this.props.types,
        onChange: this.handleExprAggrChange,
        value: this.props.value ? this.props.value : void 0
      });
    } else {
      return React.createElement(ScalarExprComponent, {
        editorTitle: this.props.title,
        schema: this.props.schema,
        table: this.props.table,
        types: this.props.types,
        onChange: this.handleExprChange,
        value: this.props.value ? this.props.value.expr : void 0
      });
    }
  };

  AestheticComponent.prototype.render = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, this.props.title), H.div(null, this.renderComponent()));
  };

  return AestheticComponent;

})(React.Component);
