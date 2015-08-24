var ExpressionBuilder, ExpressionCompiler, H, React, ReactSelect, TextArrayComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ExpressionCompiler = require('./ExpressionCompiler');

ExpressionBuilder = require('./ExpressionBuilder');

module.exports = TextArrayComponent = (function(superClass) {
  extend(TextArrayComponent, superClass);

  function TextArrayComponent() {
    this.getOptions = bind(this.getOptions, this);
    this.handleChange = bind(this.handleChange, this);
    return TextArrayComponent.__super__.constructor.apply(this, arguments);
  }

  TextArrayComponent.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    expr: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  TextArrayComponent.prototype.handleChange = function(val) {
    var value;
    value = val ? val.split("\n") : [];
    return this.props.onChange({
      type: "literal",
      valueType: "text[]",
      value: value
    });
  };

  TextArrayComponent.prototype.getOptions = function(input, cb) {
    var exprBuilder, exprCompiler, query;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    exprCompiler = new ExpressionCompiler(this.props.schema);
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: exprCompiler.compileExpr({
            expr: this.props.expr,
            tableAlias: "main"
          }),
          alias: "value"
        }, {
          type: "select",
          expr: {
            type: "op",
            op: "count",
            exprs: []
          },
          alias: "number"
        }
      ],
      from: exprCompiler.compileTable(exprBuilder.getExprTable(this.props.expr), "main"),
      where: {
        type: "op",
        op: "like",
        exprs: [
          exprCompiler.compileExpr({
            expr: this.props.expr,
            tableAlias: "main"
          }), input + "%"
        ]
      },
      groupBy: [1],
      orderBy: [
        {
          ordinal: 2,
          direction: "desc"
        }
      ],
      limit: 50
    };
    return this.props.dataSource.performQuery(query, (function(_this) {
      return function(err, rows) {
        if (err) {
          cb(err);
          return;
        }
        rows = _.filter(rows, function(r) {
          return r.value;
        });
        return cb(null, {
          options: _.map(rows, function(r) {
            return {
              value: r.value,
              label: r.value
            };
          }),
          complete: false
        });
      };
    })(this));
  };

  TextArrayComponent.prototype.render = function() {
    var options, value;
    value = null;
    if (this.props.value && this.props.value.value.length > 0) {
      value = this.props.value.value.join("\n");
    }
    options = _.map(this.props.enumValues, function(val) {
      return {
        value: val.id,
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
      asyncOptions: this.getOptions,
      onChange: this.handleChange
    }));
  };

  return TextArrayComponent;

})(React.Component);
