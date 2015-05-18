var DesignValidator, H, HoverEditComponent, JoinExprTreeComponent, ReactSelect, SaveCancelModalComponent, ScalarExprComponent, ScalarExprEditorComponent;

H = React.DOM;

JoinExprTreeComponent = require('./JoinExprTreeComponent');

ReactSelect = require('react-select');

DesignValidator = require('./DesignValidator');

SaveCancelModalComponent = require('./SaveCancelModalComponent');

HoverEditComponent = require('./HoverEditComponent');

module.exports = ScalarExprComponent = React.createClass({
  render: function() {
    var editor;
    editor = React.createElement(SaveCancelModalComponent, {
      title: "Select Expression",
      initialValue: this.props.expr,
      onChange: this.props.onChange
    }, React.createElement(ScalarExprEditorComponent, {
      schema: this.props.schema,
      baseTableId: this.props.baseTableId
    }));
    return React.createElement(HoverEditComponent, {
      editor: editor
    }, H.input({
      className: "form-control input-sm",
      readOnly: true,
      type: "text",
      style: {
        backgroundColor: "white",
        cursor: "pointer"
      },
      value: this.props.expr ? this.props.schema.summarizeExpr(this.props.expr) : "Select..."
    }));
  }
});

ScalarExprEditorComponent = React.createClass({
  handleJoinExprSelect: function(joinExpr) {
    var scalar;
    scalar = _.extend({}, this.props.value, {
      type: "scalar",
      baseTableId: this.props.baseTableId,
      expr: joinExpr.expr,
      joinIds: joinExpr.joinIds
    });
    scalar = new DesignValidator(this.props.schema).cleanScalarExpr(scalar);
    return this.props.onChange(scalar);
  },
  handleAggrChange: function(aggrId) {
    var scalar;
    scalar = _.extend({}, this.props.value, {
      aggrId: aggrId
    });
    scalar = new DesignValidator(this.props.schema).cleanScalarExpr(scalar);
    return this.props.onChange(scalar);
  },
  handleWhereChange: function(where) {
    var scalar;
    scalar = _.extend({}, this.props.value, {
      where: where
    });
    scalar = new DesignValidator(this.props.schema).cleanScalarExpr(scalar);
    return this.props.onChange(scalar);
  },
  render: function() {
    var LogicalExprComponent, aggrs, options, tree, whereElem;
    tree = this.props.schema.getJoinExprTree({
      baseTableId: this.props.baseTableId
    });
    if (this.props.value && this.props.schema.isAggrNeeded(this.props.value.joinIds) && this.props.schema.getExprType(this.props.value.expr) !== "uuid") {
      options = _.map(this.props.schema.getAggrs(this.props.value.expr), function(aggr) {
        return {
          value: aggr.id,
          label: aggr.name
        };
      });
      aggrs = H.div(null, H.br(), H.label(null, "Aggregate by"), React.createElement(ReactSelect, {
        value: this.props.value.aggrId,
        options: options,
        onChange: this.handleAggrChange
      }));
    }
    if (this.props.value && this.props.schema.isAggrNeeded(this.props.value.joinIds)) {
      LogicalExprComponent = require('./LogicalExprComponent');
      whereElem = H.div(null, H.br(), H.label(null, "Filter Aggregation"), React.createElement(LogicalExprComponent, {
        schema: this.props.schema,
        baseTableId: this.props.schema.getExprTable(this.props.value.expr).id,
        expr: this.props.value.where,
        onChange: this.handleWhereChange
      }));
    }
    return H.div(null, H.label(null, "Expression"), H.div({
      style: {
        overflowY: "scroll",
        height: 350,
        border: "solid 1px #CCC"
      }
    }, React.createElement(JoinExprTreeComponent, {
      tree: tree,
      onSelect: this.handleJoinExprSelect,
      selectedValue: (this.props.value ? {
        expr: this.props.value.expr,
        joinIds: this.props.value.joinIds
      } : void 0)
    })), H.div({
      style: {
        width: "20em"
      }
    }, aggrs), H.br(), whereElem);
  }
});
