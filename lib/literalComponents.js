var H;

H = React.DOM;

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
        value: ev.target.value
      });
    } else {
      return this.props.onChange(null);
    }
  },
  render: function() {
    return H.select({
      className: "form-control input-sm",
      style: {
        width: "auto",
        display: "inline-block"
      },
      value: this.props.value ? this.props.value.value : void 0,
      onChange: this.handleChange
    }, H.option({
      key: "null",
      value: ""
    }, ""), _.map(this.props.enumValues, function(val) {
      return H.option({
        key: val.id,
        value: val.id
      }, val.name);
    }));
  }
});

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
