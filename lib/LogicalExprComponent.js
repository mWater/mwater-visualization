var ComparisonExprComponent, H, LogicalExprComponent;

H = React.DOM;

ComparisonExprComponent = require('./ComparisonExprComponent');

module.exports = LogicalExprComponent = React.createClass({
  propTypes: {
    expr: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    baseTableId: React.PropTypes.string.isRequired
  },
  handleExprChange: function(i, expr) {
    var exprs;
    exprs = this.props.expr.exprs.slice();
    exprs[i] = expr;
    return this.props.onChange(_.extend({}, this.props.expr, {
      exprs: exprs
    }));
  },
  handleAdd: function() {
    var expr, exprs;
    expr = this.props.expr || {
      type: "logical",
      op: "and",
      exprs: []
    };
    exprs = expr.exprs.concat([
      {
        type: "comparison"
      }
    ]);
    return this.props.onChange(_.extend({}, expr, {
      exprs: exprs
    }));
  },
  handleRemove: function(i) {
    var exprs;
    exprs = this.props.expr.exprs.slice();
    exprs.splice(i, 1);
    return this.props.onChange(_.extend({}, this.props.expr, {
      exprs: exprs
    }));
  },
  render: function() {
    var childElems;
    if (this.props.expr) {
      childElems = _.map(this.props.expr.exprs, (function(_this) {
        return function(e, i) {
          return H.div(null, React.createElement(ComparisonExprComponent, {
            expr: e,
            schema: _this.props.schema,
            baseTableId: _this.props.baseTableId,
            onChange: _this.handleExprChange.bind(null, i)
          }), H.button({
            type: "button",
            className: "btn btn-sm btn-link",
            onClick: _this.handleRemove.bind(null, i)
          }, H.span({
            className: "glyphicon glyphicon-remove"
          })));
        };
      })(this));
    }
    return H.div(null, childElems, H.button({
      className: "btn btn-sm btn-link",
      type: "button",
      onClick: this.handleAdd
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Filter"));
  }
});
