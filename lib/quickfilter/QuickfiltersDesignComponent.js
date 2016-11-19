var ExprComponent, H, QuickfilterDesignComponent, QuickfiltersDesignComponent, R, React, RemovableComponent, TableSelectComponent, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

update = require('update-object');

TableSelectComponent = require('../TableSelectComponent');

ExprComponent = require('mwater-expressions-ui').ExprComponent;

module.exports = QuickfiltersDesignComponent = (function(superClass) {
  extend(QuickfiltersDesignComponent, superClass);

  function QuickfiltersDesignComponent() {
    this.handleRemove = bind(this.handleRemove, this);
    this.handleAdd = bind(this.handleAdd, this);
    return QuickfiltersDesignComponent.__super__.constructor.apply(this, arguments);
  }

  QuickfiltersDesignComponent.propTypes = {
    design: React.PropTypes.array.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string
  };

  QuickfiltersDesignComponent.defaultProps = {
    design: []
  };

  QuickfiltersDesignComponent.prototype.renderQuickfilter = function(item, index) {
    return R(QuickfilterDesignComponent, {
      key: index,
      design: item,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      onChange: (function(_this) {
        return function(newItem) {
          var design;
          design = _this.props.design.slice();
          design[index] = newItem;
          return _this.props.onDesignChange(design);
        };
      })(this),
      onRemove: this.handleRemove.bind(null, index)
    });
  };

  QuickfiltersDesignComponent.prototype.handleAdd = function() {
    var design;
    design = this.props.design.concat([{}]);
    return this.props.onDesignChange(design);
  };

  QuickfiltersDesignComponent.prototype.handleRemove = function(index) {
    var design;
    design = this.props.design.slice();
    design.splice(index, 1);
    return this.props.onDesignChange(design);
  };

  QuickfiltersDesignComponent.prototype.render = function() {
    return H.div(null, _.map(this.props.design, (function(_this) {
      return function(item, index) {
        return _this.renderQuickfilter(item, index);
      };
    })(this)), H.button({
      type: "button",
      className: "btn btn-sm btn-default",
      onClick: this.handleAdd
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Quick Filter"));
  };

  return QuickfiltersDesignComponent;

})(React.Component);

QuickfilterDesignComponent = (function(superClass) {
  extend(QuickfilterDesignComponent, superClass);

  QuickfilterDesignComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string
  };

  function QuickfilterDesignComponent(props) {
    this.handleLabelChange = bind(this.handleLabelChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    var ref;
    QuickfilterDesignComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      table: props.table || ((ref = props.design.expr) != null ? ref.table : void 0)
    };
  }

  QuickfilterDesignComponent.prototype.componentWillReceiveProps = function(nextProps) {
    var ref, table;
    table = nextProps.table || ((ref = nextProps.design.expr) != null ? ref.table : void 0);
    if (table && table !== this.state.table) {
      return this.setState({
        table: table
      });
    }
  };

  QuickfilterDesignComponent.prototype.handleTableChange = function(table) {
    var design;
    this.setState({
      table: table
    });
    design = {
      expr: null,
      label: null
    };
    return this.props.onChange(design);
  };

  QuickfilterDesignComponent.prototype.handleExprChange = function(expr) {
    return this.props.onChange(update(this.props.design, {
      expr: {
        $set: expr
      }
    }));
  };

  QuickfilterDesignComponent.prototype.handleLabelChange = function(ev) {
    return this.props.onChange(update(this.props.design, {
      label: {
        $set: ev.target.value
      }
    }));
  };

  QuickfilterDesignComponent.prototype.render = function() {
    return R(RemovableComponent, {
      onRemove: this.props.onRemove
    }, H.div({
      className: "panel panel-default"
    }, H.div({
      className: "panel-body"
    }, !this.props.table ? H.div({
      className: "form-group",
      key: "table"
    }, H.label({
      className: "text-muted"
    }, "Data Source"), R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.state.table,
      onChange: this.handleTableChange
    })) : void 0, this.state.table ? H.div({
      className: "form-group",
      key: "expr"
    }, H.label({
      className: "text-muted"
    }, "Filter By"), H.div(null, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.state.table,
      value: this.props.design.expr,
      onChange: this.handleExprChange,
      types: ['enum', 'text', 'date', 'datetime']
    }))) : void 0, this.props.design.expr ? H.div({
      className: "form-group",
      key: "label"
    }, H.label({
      className: "text-muted"
    }, "Label"), H.input({
      type: "text",
      className: "form-control input-sm",
      value: this.props.design.label || "",
      onChange: this.handleLabelChange,
      placeholder: "Optional Label"
    })) : void 0)));
  };

  return QuickfilterDesignComponent;

})(React.Component);

RemovableComponent = (function(superClass) {
  extend(RemovableComponent, superClass);

  function RemovableComponent() {
    return RemovableComponent.__super__.constructor.apply(this, arguments);
  }

  RemovableComponent.propTypes = {
    onRemove: React.PropTypes.func.isRequired
  };

  RemovableComponent.prototype.render = function() {
    return H.div({
      style: {
        display: "flex"
      },
      className: "hover-display-parent"
    }, H.div({
      style: {
        flex: "1 1 auto"
      },
      key: "main"
    }, this.props.children), H.div({
      style: {
        flex: "0 0 auto",
        alignSelf: "center"
      },
      className: "hover-display-child",
      key: "remove"
    }, H.a({
      onClick: this.props.onRemove,
      style: {
        fontSize: "80%",
        cursor: "pointer",
        marginLeft: 5
      }
    }, H.span({
      className: "glyphicon glyphicon-remove"
    }))));
  };

  return RemovableComponent;

})(React.Component);
