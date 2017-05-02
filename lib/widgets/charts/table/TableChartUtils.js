var AxisBuilder;

AxisBuilder = require('../../../axes/AxisBuilder');

exports.isTableAggr = function(design, schema) {
  var axisBuilder;
  axisBuilder = new AxisBuilder({
    schema: schema
  });
  return _.any(design.columns, (function(_this) {
    return function(column) {
      return axisBuilder.isAxisAggr(column.textAxis);
    };
  })(this)) || _.any(design.orderings, (function(_this) {
    return function(ordering) {
      return axisBuilder.isAxisAggr(ordering.axis);
    };
  })(this));
};

exports.createRowFilter = function(design, schema, row) {
  var axisBuilder, column, filter, i, index, j, len, len1, ordering, ref, ref1;
  axisBuilder = new AxisBuilder({
    schema: schema
  });
  filter = {
    table: design.table,
    jsonql: {
      type: "op",
      op: "and",
      exprs: []
    }
  };
  if (exports.isTableAggr(design, schema)) {
    ref = design.columns;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      column = ref[index];
      if (!axisBuilder.isAxisAggr(column.textAxis)) {
        filter.jsonql.exprs.push(axisBuilder.createValueFilter(column.textAxis, row["c" + index]));
      }
    }
    ref1 = design.orderings;
    for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
      ordering = ref1[index];
      if (!axisBuilder.isAxisAggr(ordering.axis)) {
        filter.jsonql.exprs.push(axisBuilder.createValueFilter(ordering.axis, row["o" + index]));
      }
    }
  } else {
    filter.jsonql.exprs.push({
      type: "op",
      op: "=",
      exprs: [
        {
          type: "field",
          tableAlias: "{alias}",
          column: schema.getTable(design.table).primaryKey
        }, {
          type: "literal",
          value: row.id
        }
      ]
    });
  }
  return filter;
};

exports.createRowScope = function(design, schema, row) {
  var axisBuilder, column, data, i, index, j, len, len1, ordering, ref, ref1;
  axisBuilder = new AxisBuilder({
    schema: schema
  });
  data = [{}];
  if (exports.isTableAggr(design, schema)) {
    ref = design.columns;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      column = ref[index];
      if (!axisBuilder.isAxisAggr(column.textAxis)) {
        data[0]["c" + index] = row["c" + index];
      }
    }
    ref1 = design.orderings;
    for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
      ordering = ref1[index];
      if (!axisBuilder.isAxisAggr(ordering.textAxis)) {
        data[0]["o" + index] = row["o" + index];
      }
    }
  } else {
    data[0].id = row.id;
  }
  return {
    name: "Selected Row",
    filter: exports.createRowFilter(design, schema, row),
    data: data
  };
};

exports.isRowScoped = function(row, scopeData) {
  var i, item, len;
  for (i = 0, len = scopeData.length; i < len; i++) {
    item = scopeData[i];
    if (_.all(_.keys(item), function(key) {
      return _.isEqual(row[key], item[key]);
    })) {
      return true;
    }
  }
  return false;
};
