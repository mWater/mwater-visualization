var Cell, EditExprCellComponent, EnumEditComponent, ExprUtils, NumberEditComponent, PropTypes, R, React, TextEditComponent, _, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

moment = require('moment');

ExprUtils = require("mwater-expressions").ExprUtils;

Cell = require('fixed-data-table').Cell;

module.exports = EditExprCellComponent = (function(superClass) {
  extend(EditExprCellComponent, superClass);

  EditExprCellComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    locale: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    value: PropTypes.any,
    expr: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
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
          onCancel: this.props.onCancel,
          locale: this.props.locale
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
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  };

  TextEditComponent.prototype.componentDidMount = function() {
    var ref;
    return (ref = this.input) != null ? ref.focus() : void 0;
  };

  TextEditComponent.prototype.render = function() {
    return R('div', {
      style: {
        paddingTop: 3
      }
    }, R('input', {
      ref: (function(_this) {
        return function(c) {
          return _this.input = c;
        };
      })(this),
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
    this.handleChange = bind(this.handleChange, this);
    return NumberEditComponent.__super__.constructor.apply(this, arguments);
  }

  NumberEditComponent.propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  };

  NumberEditComponent.prototype.componentDidMount = function() {
    var ref;
    return (ref = this.input) != null ? ref.focus() : void 0;
  };

  NumberEditComponent.prototype.handleChange = function(ev) {
    if (ev.target.value) {
      return this.props.onChange(parseFloat(ev.target.value));
    } else {
      return this.props.onChange(null);
    }
  };

  NumberEditComponent.prototype.render = function() {
    return R('div', {
      style: {
        paddingTop: 3
      }
    }, R('input', {
      ref: (function(_this) {
        return function(c) {
          return _this.input = c;
        };
      })(this),
      type: "number",
      step: "any",
      className: "form-control",
      value: this.props.value != null ? this.props.value : "",
      onChange: this.handleChange,
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
    value: PropTypes.any,
    enumValues: PropTypes.array.isRequired,
    locale: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  };

  EnumEditComponent.prototype.render = function() {
    return R('div', {
      style: {
        paddingTop: 3
      }
    }, R('select', {
      value: this.props.value || "",
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(ev.target.value || null);
        };
      })(this),
      className: "form-control"
    }, R('option', {
      key: "",
      value: ""
    }, ""), _.map(this.props.enumValues, (function(_this) {
      return function(ev) {
        return R('option', {
          key: ev.id,
          value: ev.id
        }, ExprUtils.localizeString(ev.name, _this.props.locale));
      };
    })(this))));
  };

  return EnumEditComponent;

})(React.Component);
