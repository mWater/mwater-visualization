var Cell, EditExprCellComponent, EnumEditComponent, ExprUtils, H, NumberEditComponent, R, React, TextEditComponent, _, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

moment = require('moment');

ExprUtils = require("mwater-expressions").ExprUtils;

Cell = require('fixed-data-table').Cell;

module.exports = EditExprCellComponent = (function(superClass) {
  extend(EditExprCellComponent, superClass);

  EditExprCellComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    value: React.PropTypes.any,
    expr: React.PropTypes.object.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  };

  function EditExprCellComponent(props) {
    this.handleChange = bind(this.handleChange, this);
    EditExprCellComponent.__super__.constructor.call(this, props);
    this.state = {
      value: props.value
    };
  }

  EditExprCellComponent.prototype.getValue = function() {
    return this.state.value;
  };

  EditExprCellComponent.prototype.hasChanged = function() {
    return !_.isEqual(this.props.value, this.state.value);
  };

  EditExprCellComponent.prototype.handleChange = function(value) {
    return this.setState({
      value: value
    });
  };

  EditExprCellComponent.prototype.render = function() {
    var exprType, exprUtils;
    exprUtils = new ExprUtils(this.props.schema);
    exprType = exprUtils.getExprType(this.props.expr);
    switch (exprType) {
      case "text":
        return R(TextEditComponent, {
          value: this.state.value,
          onChange: this.handleChange,
          onSave: this.props.onSave,
          onCancel: this.props.onCancel
        });
      case "number":
        return R(NumberEditComponent, {
          value: this.state.value,
          onChange: this.handleChange,
          onSave: this.props.onSave,
          onCancel: this.props.onCancel
        });
      case "enum":
        return R(EnumEditComponent, {
          value: this.state.value,
          onChange: this.handleChange,
          enumValues: exprUtils.getExprEnumValues(this.props.expr),
          onSave: this.props.onSave,
          onCancel: this.props.onCancel
        });
    }
    throw new Error("Unsupported type " + exprType + " for editing");
  };

  return EditExprCellComponent;

})(React.Component);

TextEditComponent = (function(superClass) {
  extend(TextEditComponent, superClass);

  function TextEditComponent() {
    return TextEditComponent.__super__.constructor.apply(this, arguments);
  }

  TextEditComponent.propTypes = {
    value: React.PropTypes.any,
    onChange: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  };

  TextEditComponent.prototype.componentDidMount = function() {
    var ref;
    return (ref = this.refs.input) != null ? ref.focus() : void 0;
  };

  TextEditComponent.prototype.render = function() {
    return H.div({
      style: {
        paddingTop: 3
      }
    }, H.input({
      ref: "input",
      type: "text",
      className: "form-control",
      value: this.props.value || "",
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(ev.target.value || null);
        };
      })(this),
      onKeyUp: (function(_this) {
        return function(ev) {
          if (ev.keyCode === 27) {
            _this.props.onCancel();
          }
          if (ev.keyCode === 13) {
            return _this.props.onSave();
          }
        };
      })(this)
    }));
  };

  return TextEditComponent;

})(React.Component);

NumberEditComponent = (function(superClass) {
  extend(NumberEditComponent, superClass);

  function NumberEditComponent() {
    return NumberEditComponent.__super__.constructor.apply(this, arguments);
  }

  NumberEditComponent.propTypes = {
    value: React.PropTypes.any,
    onChange: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  };

  NumberEditComponent.prototype.componentDidMount = function() {
    var ref;
    return (ref = this.refs.input) != null ? ref.focus() : void 0;
  };

  NumberEditComponent.prototype.render = function() {
    return H.div({
      style: {
        paddingTop: 3
      }
    }, H.input({
      ref: "input",
      type: "number",
      step: "any",
      className: "form-control",
      value: this.props.value != null ? this.props.value : "",
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(ev.target.value || null);
        };
      })(this),
      onKeyUp: (function(_this) {
        return function(ev) {
          if (ev.keyCode === 27) {
            _this.props.onCancel();
          }
          if (ev.keyCode === 13) {
            return _this.props.onSave();
          }
        };
      })(this)
    }));
  };

  return NumberEditComponent;

})(React.Component);

EnumEditComponent = (function(superClass) {
  extend(EnumEditComponent, superClass);

  function EnumEditComponent() {
    return EnumEditComponent.__super__.constructor.apply(this, arguments);
  }

  EnumEditComponent.propTypes = {
    value: React.PropTypes.any,
    enumValues: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  };

  EnumEditComponent.prototype.render = function() {
    return H.div({
      style: {
        paddingTop: 3
      }
    }, H.select({
      value: this.props.value || "",
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(ev.target.value || null);
        };
      })(this),
      className: "form-control"
    }, H.option({
      key: "",
      value: ""
    }, ""), _.map(this.props.enumValues, (function(_this) {
      return function(ev) {
        return H.option({
          key: ev.id,
          value: ev.id
        }, ExprUtils.localizeString(ev.name));
      };
    })(this))));
  };

  return EnumEditComponent;

})(React.Component);
