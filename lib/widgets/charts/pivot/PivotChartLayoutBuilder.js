var AxisBuilder, ExprUtils, PivotChartLayoutBuilder, PivotChartUtils, _,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../../../axes/AxisBuilder');

PivotChartUtils = require('./PivotChartUtils');

module.exports = PivotChartLayoutBuilder = (function() {
  function PivotChartLayoutBuilder(options) {
    this.schema = options.schema;
    this.exprUtils = new ExprUtils(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  PivotChartLayoutBuilder.prototype.buildLayout = function(design, data, locale) {
    var cell, cells, column, columnIndex, columns, columnsDepth, depth, i, i1, j, k, l, layout, layoutRow, len, len1, len2, len3, len4, len5, len6, len7, len8, m, n, needsSpecialRowHeader, o, p, q, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref4, ref5, ref6, ref7, ref8, ref9, refCell, row, rowIndex, rowSegments, rows, rowsDepth, s, segment, t, u, v, w, x, y, z;
    layout = {
      rows: []
    };
    columns = [];
    ref = design.columns;
    for (j = 0, len = ref.length; j < len; j++) {
      segment = ref[j];
      columns = columns.concat(this.getRowsOrColumns(false, segment, data, locale));
    }
    rows = [];
    ref1 = design.rows;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      segment = ref1[k];
      rows = rows.concat(this.getRowsOrColumns(true, segment, data, locale));
    }
    rowsDepth = _.max(_.map(rows, function(row) {
      return row.length;
    }));
    columnsDepth = _.max(_.map(columns, function(column) {
      return column.length;
    }));
    for (depth = l = 0, ref2 = columnsDepth; 0 <= ref2 ? l < ref2 : l > ref2; depth = 0 <= ref2 ? ++l : --l) {
      if (_.any(columns, function(column) {
        return column[depth] && column[depth].segment.label && column[depth].segment.valueAxis;
      })) {
        cells = [];
        for (i = m = 1, ref3 = rowsDepth; 1 <= ref3 ? m <= ref3 : m >= ref3; i = 1 <= ref3 ? ++m : --m) {
          cells.push({
            type: "blank",
            text: null
          });
        }
        for (n = 0, len2 = columns.length; n < len2; n++) {
          column = columns[n];
          cells.push({
            type: "columnLabel",
            section: (ref4 = column[depth]) != null ? ref4.segment.id : void 0,
            text: (ref5 = column[depth]) != null ? ref5.segment.label : void 0,
            align: "center"
          });
        }
        layout.rows.push({
          cells: cells
        });
      }
      cells = [];
      for (i = o = 1, ref6 = rowsDepth; 1 <= ref6 ? o <= ref6 : o >= ref6; i = 1 <= ref6 ? ++o : --o) {
        cells.push({
          type: "blank",
          text: null
        });
      }
      for (p = 0, len3 = columns.length; p < len3; p++) {
        column = columns[p];
        cells.push({
          type: ((ref7 = column[depth]) != null ? (ref8 = ref7.segment) != null ? ref8.valueAxis : void 0 : void 0) ? "columnSegment" : "columnLabel",
          section: (ref9 = column[depth]) != null ? ref9.segment.id : void 0,
          text: (ref10 = column[depth]) != null ? ref10.label : void 0,
          align: "center",
          unconfigured: ((ref11 = column[depth]) != null ? ref11.segment : void 0) && (((ref12 = column[depth]) != null ? ref12.segment.label : void 0) == null) && !((ref13 = column[depth]) != null ? ref13.segment.valueAxis : void 0)
        });
      }
      layout.rows.push({
        cells: cells
      });
    }
    rowSegments = [];
    for (q = 0, len4 = rows.length; q < len4; q++) {
      row = rows[q];
      needsSpecialRowHeader = [];
      for (depth = s = 0, ref14 = rowsDepth; 0 <= ref14 ? s < ref14 : s > ref14; depth = 0 <= ref14 ? ++s : --s) {
        if (row[depth] && rowSegments[depth] !== row[depth].segment && row[depth].segment.label && row[depth].segment.valueAxis) {
          needsSpecialRowHeader.push(true);
        } else {
          needsSpecialRowHeader.push(false);
        }
      }
      if (_.any(needsSpecialRowHeader)) {
        cells = [];
        for (depth = t = 0, ref15 = rowsDepth; 0 <= ref15 ? t < ref15 : t > ref15; depth = 0 <= ref15 ? ++t : --t) {
          if (needsSpecialRowHeader[depth]) {
            cells.push({
              type: "rowLabel",
              section: (ref16 = row[depth]) != null ? ref16.segment.id : void 0,
              text: row[depth].segment.label
            });
          } else {
            cells.push({
              type: "rowLabel",
              section: (ref17 = row[depth]) != null ? ref17.segment.id : void 0,
              text: null,
              unconfigured: ((ref18 = row[depth]) != null ? ref18.segment : void 0) && (((ref19 = row[depth]) != null ? ref19.segment.label : void 0) == null) && !((ref20 = row[depth]) != null ? ref20.segment.valueAxis : void 0)
            });
          }
        }
        for (u = 0, len5 = columns.length; u < len5; u++) {
          column = columns[u];
          cells.push({
            type: "blank",
            text: null
          });
        }
        layout.rows.push({
          cells: cells
        });
      }
      rowSegments = _.pluck(row, "segment");
      cells = [];
      for (depth = v = 0, ref21 = rowsDepth; 0 <= ref21 ? v < ref21 : v > ref21; depth = 0 <= ref21 ? ++v : --v) {
        cells.push({
          type: ((ref22 = row[depth]) != null ? (ref23 = ref22.segment) != null ? ref23.valueAxis : void 0 : void 0) ? "rowSegment" : "rowLabel",
          section: (ref24 = row[depth]) != null ? ref24.segment.id : void 0,
          text: (ref25 = row[depth]) != null ? ref25.label : void 0,
          unconfigured: ((ref26 = row[depth]) != null ? ref26.segment : void 0) && (((ref27 = row[depth]) != null ? ref27.segment.label : void 0) == null) && !((ref28 = row[depth]) != null ? ref28.segment.valueAxis : void 0)
        });
      }
      for (w = 0, len6 = columns.length; w < len6; w++) {
        column = columns[w];
        cells.push(this.buildIntersectionCell(design, data, locale, row, column));
      }
      layout.rows.push({
        cells: cells
      });
    }
    ref29 = layout.rows;
    for (x = 0, len7 = ref29.length; x < len7; x++) {
      layoutRow = ref29[x];
      refCell = null;
      ref30 = layoutRow.cells;
      for (i = y = 0, len8 = ref30.length; y < len8; i = ++y) {
        cell = ref30[i];
        if (i === 0) {
          refCell = cell;
          continue;
        }
        if (((ref31 = cell.type) === 'columnLabel' || ref31 === 'columnSegment') && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
          cell.type = "skip";
          refCell.columnSpan = (refCell.columnSpan || 1) + 1;
        } else {
          refCell = cell;
        }
      }
    }
    for (columnIndex = z = 0, ref32 = layout.rows[0].cells.length; 0 <= ref32 ? z < ref32 : z > ref32; columnIndex = 0 <= ref32 ? ++z : --z) {
      refCell = null;
      for (rowIndex = i1 = 0, ref33 = layout.rows.length; 0 <= ref33 ? i1 < ref33 : i1 > ref33; rowIndex = 0 <= ref33 ? ++i1 : --i1) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (i === 0) {
          refCell = cell;
          continue;
        }
        if (((ref34 = cell.type) === 'rowLabel' || ref34 === 'rowSegment') && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
          cell.type = "skip";
          refCell.rowSpan = (refCell.rowSpan || 1) + 1;
        } else {
          refCell = cell;
        }
      }
    }
    return layout;
  };

  PivotChartLayoutBuilder.prototype.buildIntersectionCell = function(design, data, locale, row, column) {
    var entry, intersection, intersectionData, intersectionId, text, value;
    intersectionId = _.map(row, function(r) {
      return r.segment.id;
    }).join(",") + ":" + _.map(column, function(c) {
      return c.segment.id;
    }).join(",");
    intersection = design.intersections[intersectionId];
    if (!intersection) {
      return {
        type: "blank",
        text: null
      };
    }
    intersectionData = data[intersectionId];
    entry = _.find(intersectionData, function(e) {
      var i, j, k, len, len1, part;
      for (i = j = 0, len = row.length; j < len; i = ++j) {
        part = row[i];
        if (e["r" + i] !== part.value) {
          return false;
        }
      }
      for (i = k = 0, len1 = column.length; k < len1; i = ++k) {
        part = column[i];
        if (e["c" + i] !== part.value) {
          return false;
        }
      }
      return true;
    });
    value = entry != null ? entry.value : void 0;
    if (value != null) {
      text = this.axisBuilder.formatValue(intersection.valueAxis, value, locale);
    } else {
      text = null;
    }
    return {
      type: "intersection",
      section: intersectionId,
      text: text,
      align: "right"
    };
  };

  PivotChartLayoutBuilder.prototype.getRowsOrColumns = function(isRow, segment, data, locale, parentSegments, parentValues) {
    var allValues, categories, category, childResult, childResults, childSegment, intersectionData, intersectionId, j, k, l, len, len1, len2, ref, relevantData, results, segIds;
    if (parentSegments == null) {
      parentSegments = [];
    }
    if (parentValues == null) {
      parentValues = [];
    }
    if (!segment.valueAxis) {
      categories = [
        {
          value: null,
          label: segment.label
        }
      ];
    } else {
      allValues = [];
      for (intersectionId in data) {
        intersectionData = data[intersectionId];
        if (!intersectionId.match(":")) {
          continue;
        }
        if (isRow) {
          segIds = intersectionId.split(":")[0].split(",");
        } else {
          segIds = intersectionId.split(":")[1].split(",");
        }
        if (!_.isEqual(_.take(segIds, parentSegments.length + 1), _.pluck(parentSegments, "id").concat(segment.id))) {
          continue;
        }
        relevantData = _.filter(intersectionData, (function(_this) {
          return function(dataRow) {
            var i, j, len, parentValue;
            for (i = j = 0, len = parentValues.length; j < len; i = ++j) {
              parentValue = parentValues[i];
              if (isRow) {
                if (dataRow["r" + i] !== parentValue) {
                  return false;
                }
              } else {
                if (dataRow["c" + i] !== parentValue) {
                  return false;
                }
              }
            }
            return true;
          };
        })(this));
        if (isRow) {
          allValues = allValues.concat(_.pluck(relevantData, "r" + parentSegments.length));
        } else {
          allValues = allValues.concat(_.pluck(relevantData, "c" + parentSegments.length));
        }
      }
      categories = this.axisBuilder.getCategories(segment.valueAxis, allValues, locale);
      categories = _.filter(categories, function(category) {
        var ref;
        return ref = category.value, indexOf.call(segment.valueAxis.excludedValues || [], ref) < 0;
      });
      if (categories.length === 0) {
        categories = [
          {
            value: null,
            label: null
          }
        ];
      }
    }
    if (!segment.children || segment.children.length === 0) {
      return _.map(categories, function(category) {
        return [
          {
            segment: segment,
            value: category.value,
            label: category.label
          }
        ];
      });
    }
    results = [];
    for (j = 0, len = categories.length; j < len; j++) {
      category = categories[j];
      ref = segment.children;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        childSegment = ref[k];
        childResults = this.getRowsOrColumns(isRow, childSegment, data, locale, parentSegments.concat([segment]), parentValues.concat([category.value]));
        for (l = 0, len2 = childResults.length; l < len2; l++) {
          childResult = childResults[l];
          results.push([
            {
              segment: segment,
              value: category.value,
              label: category.label
            }
          ].concat(childResult));
        }
      }
    }
    return results;
  };

  return PivotChartLayoutBuilder;

})();
