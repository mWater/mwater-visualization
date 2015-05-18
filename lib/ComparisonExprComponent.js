var ComparisonExprComponent, H, ScalarExprComponent, literalComponents;

H = React.DOM;

ScalarExprComponent = require('./ScalarExprComponent');

literalComponents = require('./literalComponents');

module.exports = ComparisonExprComponent = React.createClass({
  propTypes: {
    expr: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    baseTableId: React.PropTypes.string.isRequired
  },
  handleLhsChange: function(lhs) {
    return this.props.onChange(_.extend({}, this.props.expr, {
      lhs: lhs
    }));
  },
  handleOpChange: function(ev) {
    return this.props.onChange(_.extend({}, this.props.expr, {
      op: ev.target.value
    }));
  },
  handleRhsChange: function(rhs) {
    return this.props.onChange(_.extend({}, this.props.expr, {
      rhs: rhs
    }));
  },
  render: function() {
    var lhsControl, lhsType, opControl, ops, rhsControl, rhsType;
    lhsControl = React.createElement(ScalarExprComponent, {
      key: "lhs",
      schema: this.props.schema,
      baseTableId: this.props.baseTableId,
      expr: this.props.expr.lhs,
      onChange: this.handleLhsChange
    });
    lhsType = this.props.schema.getExprType(this.props.expr.lhs);
    if (lhsType) {
      ops = this.props.schema.getComparisonOps(lhsType);
      opControl = H.select({
        key: "op",
        className: "form-control input-sm",
        style: {
          width: "auto",
          display: "inline-block",
          marginRight: 3
        },
        value: this.props.expr.op,
        onChange: this.handleOpChange
      }, _.map(ops, function(op) {
        return H.option({
          key: op.id,
          value: op.id
        }, op.name);
      }));
    }
    if (lhsType && this.props.expr.op) {
      rhsType = this.props.schema.getComparisonRhsType(lhsType, this.props.expr.op);
      switch (rhsType) {
        case "text":
          rhsControl = React.createElement(literalComponents.TextComponent, {
            key: "rhs",
            expr: this.props.expr.rhs,
            onChange: this.handleRhsChange
          });
          break;
        case "integer":
          rhsControl = React.createElement(literalComponents.IntegerComponent, {
            key: "rhs",
            expr: this.props.expr.rhs,
            onChange: this.handleRhsChange
          });
          break;
        case "decimal":
          rhsControl = React.createElement(literalComponents.DecimalComponent, {
            key: "rhs",
            expr: this.props.expr.rhs,
            onChange: this.handleRhsChange
          });
          break;
        case "date":
          rhsControl = React.createElement(literalComponents.DateComponent, {
            key: "rhs",
            expr: this.props.expr.rhs,
            onChange: this.handleRhsChange
          });
          break;
        case "enum":
          rhsControl = React.createElement(literalComponents.EnumComponent, {
            key: "rhs",
            expr: this.props.expr.rhs,
            enumValues: this.props.schema.getExprValues(this.props.expr.lhs),
            onChange: this.handleRhsChange
          });
      }
    }
    return H.div({
      style: {
        display: "inline-block"
      }
    }, lhsControl, opControl, rhsControl);
  }
});
