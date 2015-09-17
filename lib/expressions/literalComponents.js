var EnumArrComponent, H, React, ReactSelect,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

exports.TextComponent = React.createClass({
  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  },
  handleChange: function(ev) {
    return this.props.onChange({
      type: "literal",
      valueType: "text",
      value: ev.target.value
    });
  },
  render: function() {
    return H.input({
      className: "form-control input-sm",
      style: {
        width: "20em",
        display: "inline-block"
      },
      type: "text",
      onChange: this.handleChange,
      value: this.props.value ? this.props.value.value : void 0
    });
  }
});

exports.DecimalComponent = React.createClass({
  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      invalid: false,
      invalidText: null
    };
  },
  handleChange: function(ev) {
    var val;
    if (!ev.target.value) {
      this.setState({
        invalid: false,
        invalidText: null
      });
      return this.props.onChange(null);
    }
    val = parseFloat(ev.target.value);
    if (!_.isFinite(val) || !ev.target.value.match(/^[0-9]+(\.[0-9]+)?$/)) {
      return this.setState({
        invalid: true,
        invalidText: ev.target.value
      });
    }
    this.setState({
      invalid: false,
      invalidText: null
    });
    return this.props.onChange({
      type: "literal",
      valueType: "decimal",
      value: val
    });
  },
  render: function() {
    return H.div({
      className: (this.state.invalid ? "has-error" : void 0),
      style: {
        width: "6em",
        display: "inline-block"
      }
    }, H.input({
      className: "form-control input-sm",
      type: "text",
      style: {
        width: "6em",
        display: "inline-block"
      },
      onChange: this.handleChange,
      value: (this.state.invalid ? this.state.invalidText : void 0) || (this.props.value ? this.props.value.value : void 0)
    }));
  }
});

exports.IntegerComponent = React.createClass({
  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      invalid: false,
      invalidText: null
    };
  },
  handleChange: function(ev) {
    var val;
    if (!ev.target.value) {
      this.setState({
        invalid: false,
        invalidText: null
      });
      return this.props.onChange(null);
    }
    val = parseInt(ev.target.value);
    if (!_.isFinite(val) || !ev.target.value.match(/^[0-9]+$/)) {
      return this.setState({
        invalid: true,
        invalidText: ev.target.value
      });
    }
    this.setState({
      invalid: false,
      invalidText: null
    });
    return this.props.onChange({
      type: "literal",
      valueType: "integer",
      value: val
    });
  },
  render: function() {
    return H.div({
      className: (this.state.invalid ? "has-error" : void 0),
      style: {
        width: "6em",
        display: "inline-block"
      }
    }, H.input({
      className: "form-control input-sm",
      type: "text",
      onChange: this.handleChange,
      value: (this.state.invalid ? this.state.invalidText : void 0) || (this.props.value ? this.props.value.value : void 0)
    }));
  }
});

exports.EnumComponent = React.createClass({
  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    enumValues: React.PropTypes.array.isRequired
  },
  handleChange: function(ev) {
    if (ev.target.value) {
      return this.props.onChange({
        type: "literal",
        valueType: "enum",
        value: JSON.parse(ev.target.value)
      });
    } else {
      return this.props.onChange(null);
    }
  },
  render: function() {
    return H.select({
      className: "form-control input-sm",
      value: this.props.value && this.props.value.value ? JSON.stringify(this.props.value.value) : void 0,
      onChange: this.handleChange
    }, H.option({
      key: "null",
      value: ""
    }, ""), _.map(this.props.enumValues, function(val) {
      return H.option({
        key: val.id,
        value: JSON.stringify(val.id)
      }, val.name);
    }));
  }
});

exports.EnumArrComponent = EnumArrComponent = (function(superClass) {
  extend(EnumArrComponent, superClass);

  function EnumArrComponent() {
    this.handleChange = bind(this.handleChange, this);
    return EnumArrComponent.__super__.constructor.apply(this, arguments);
  }

  EnumArrComponent.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    enumValues: React.PropTypes.array.isRequired
  };

  EnumArrComponent.prototype.handleChange = function(val) {
    var value;
    value = val ? val.split("\n") : [];
    value = _.map(value, JSON.parse);
    console.log(value);
    return this.props.onChange({
      type: "literal",
      valueType: "enum[]",
      value: value
    });
  };

  EnumArrComponent.prototype.render = function() {
    var options, value;
    value = null;
    if (this.props.value && this.props.value.value.length > 0) {
      value = _.map(this.props.value.value, JSON.stringify).join("\n");
    }
    options = _.map(this.props.enumValues, function(val) {
      return {
        value: JSON.stringify(val.id),
        label: val.name
      };
    });
    return H.div({
      style: {
        width: "100%"
      }
    }, React.createElement(ReactSelect, {
      value: value,
      multi: true,
      delimiter: "\n",
      options: options,
      onChange: this.handleChange
    }));
  };

  return EnumArrComponent;

})(React.Component);

exports.DateComponent = React.createClass({
  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      invalid: false,
      invalidText: null
    };
  },
  handleChange: function(ev) {
    if (!ev.target.value) {
      this.setState({
        invalid: false,
        invalidText: null
      });
      return this.props.onChange(null);
    }
    if (!ev.target.value.match(/^\d\d\d\d(-\d\d(-\d\d)?)?$/)) {
      return this.setState({
        invalid: true,
        invalidText: ev.target.value
      });
    }
    this.setState({
      invalid: false,
      invalidText: null
    });
    return this.props.onChange({
      type: "literal",
      valueType: "date",
      value: ev.target.value
    });
  },
  render: function() {
    return H.div({
      className: (this.state.invalid ? "has-error" : void 0),
      style: {
        width: "9em",
        display: "inline-block"
      }
    }, H.input({
      className: "form-control input-sm",
      placeholder: "YYYY-MM-DD",
      type: "text",
      onChange: this.handleChange,
      value: (this.state.invalid ? this.state.invalidText : void 0) || (this.props.value ? this.props.value.value : void 0)
    }));
  }
});

exports.DatetimeComponent = React.createClass({
  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      invalid: false,
      invalidText: null
    };
  },
  handleChange: function(ev) {
    if (!ev.target.value) {
      this.setState({
        invalid: false,
        invalidText: null
      });
      return this.props.onChange(null);
    }
    if (!ev.target.value.match(/^\d\d\d\d(-\d\d(-\d\d)?)?$/)) {
      return this.setState({
        invalid: true,
        invalidText: ev.target.value
      });
    }
    this.setState({
      invalid: false,
      invalidText: null
    });
    return this.props.onChange({
      type: "literal",
      valueType: "datetime",
      value: ev.target.value
    });
  },
  render: function() {
    return H.div({
      className: (this.state.invalid ? "has-error" : void 0),
      style: {
        width: "9em",
        display: "inline-block"
      }
    }, H.input({
      className: "form-control input-sm",
      placeholder: "YYYY-MM-DD",
      type: "text",
      onChange: this.handleChange,
      value: (this.state.invalid ? this.state.invalidText : void 0) || (this.props.value ? this.props.value.value : void 0)
    }));
  }
});
