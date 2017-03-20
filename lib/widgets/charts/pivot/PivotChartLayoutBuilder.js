var AxisBuilder, Color, ExprUtils, PivotChartLayoutBuilder, PivotChartUtils, _,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../../../axes/AxisBuilder');

Color = require('color');

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
    var cell, cells, column, columnIndex, columns, columnsDepth, depth, i, i1, intersectionId, j, j1, k, k1, l, layout, layoutRow, len, len1, len2, len3, len4, len5, len6, len7, len8, m, n, needsSpecialRowHeader, o, p, q, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref38, ref39, ref4, ref40, ref41, ref42, ref43, ref44, ref45, ref46, ref5, ref6, ref7, ref8, ref9, refCell, row, rowIndex, rowSegments, rows, rowsDepth, s, segment, t, u, v, w, x, y, z;
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
            align: "center",
            bold: (ref6 = column[depth]) != null ? ref6.segment.bold : void 0,
            italic: (ref7 = column[depth]) != null ? ref7.segment.italic : void 0
          });
        }
        layout.rows.push({
          cells: cells
        });
      }
      cells = [];
      for (i = o = 1, ref8 = rowsDepth; 1 <= ref8 ? o <= ref8 : o >= ref8; i = 1 <= ref8 ? ++o : --o) {
        cells.push({
          type: "blank",
          text: null
        });
      }
      for (p = 0, len3 = columns.length; p < len3; p++) {
        column = columns[p];
        cells.push({
          type: ((ref9 = column[depth]) != null ? (ref10 = ref9.segment) != null ? ref10.valueAxis : void 0 : void 0) ? "columnSegment" : "columnLabel",
          section: (ref11 = column[depth]) != null ? ref11.segment.id : void 0,
          text: (ref12 = column[depth]) != null ? ref12.label : void 0,
          align: "center",
          unconfigured: ((ref13 = column[depth]) != null ? ref13.segment : void 0) && (((ref14 = column[depth]) != null ? ref14.segment.label : void 0) == null) && !((ref15 = column[depth]) != null ? ref15.segment.valueAxis : void 0),
          bold: (ref16 = column[depth]) != null ? ref16.segment.bold : void 0,
          italic: (ref17 = column[depth]) != null ? ref17.segment.italic : void 0
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
      for (depth = s = 0, ref18 = rowsDepth; 0 <= ref18 ? s < ref18 : s > ref18; depth = 0 <= ref18 ? ++s : --s) {
        if (row[depth] && rowSegments[depth] !== row[depth].segment && row[depth].segment.label && row[depth].segment.valueAxis) {
          needsSpecialRowHeader.push(true);
        } else {
          needsSpecialRowHeader.push(false);
        }
      }
      if (_.any(needsSpecialRowHeader)) {
        cells = [];
        for (depth = t = 0, ref19 = rowsDepth; 0 <= ref19 ? t < ref19 : t > ref19; depth = 0 <= ref19 ? ++t : --t) {
          if (needsSpecialRowHeader[depth]) {
            cells.push({
              type: "rowLabel",
              section: (ref20 = row[depth]) != null ? ref20.segment.id : void 0,
              text: row[depth].segment.label,
              bold: (ref21 = row[depth]) != null ? ref21.segment.bold : void 0,
              italic: (ref22 = row[depth]) != null ? ref22.segment.italic : void 0
            });
          } else {
            cells.push({
              type: "rowLabel",
              section: (ref23 = row[depth]) != null ? ref23.segment.id : void 0,
              text: null,
              unconfigured: ((ref24 = row[depth]) != null ? ref24.segment : void 0) && (((ref25 = row[depth]) != null ? ref25.segment.label : void 0) == null) && !((ref26 = row[depth]) != null ? ref26.segment.valueAxis : void 0),
              bold: (ref27 = row[depth]) != null ? ref27.segment.bold : void 0,
              italic: (ref28 = row[depth]) != null ? ref28.segment.italic : void 0
            });
          }
        }
        for (u = 0, len5 = columns.length; u < len5; u++) {
          column = columns[u];
          intersectionId = _.map(row, function(r) {
            return r.segment.id;
          }).join(",") + ":" + _.map(column, function(c) {
            return c.segment.id;
          }).join(",");
          cells.push({
            type: "intersection",
            section: intersectionId,
            text: null
          });
        }
        layout.rows.push({
          cells: cells
        });
      }
      rowSegments = _.pluck(row, "segment");
      cells = [];
      for (depth = v = 0, ref29 = rowsDepth; 0 <= ref29 ? v < ref29 : v > ref29; depth = 0 <= ref29 ? ++v : --v) {
        cells.push({
          type: ((ref30 = row[depth]) != null ? (ref31 = ref30.segment) != null ? ref31.valueAxis : void 0 : void 0) ? "rowSegment" : "rowLabel",
          section: (ref32 = row[depth]) != null ? ref32.segment.id : void 0,
          text: (ref33 = row[depth]) != null ? ref33.label : void 0,
          unconfigured: ((ref34 = row[depth]) != null ? ref34.segment : void 0) && (((ref35 = row[depth]) != null ? ref35.segment.label : void 0) == null) && !((ref36 = row[depth]) != null ? ref36.segment.valueAxis : void 0),
          bold: (ref37 = row[depth]) != null ? ref37.segment.bold : void 0,
          italic: (ref38 = row[depth]) != null ? ref38.segment.italic : void 0
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
    for (columnIndex = x = 0, ref39 = layout.rows[0].cells.length; 0 <= ref39 ? x < ref39 : x > ref39; columnIndex = 0 <= ref39 ? ++x : --x) {
      for (rowIndex = y = 0, ref40 = layout.rows.length; 0 <= ref40 ? y < ref40 : y > ref40; rowIndex = 0 <= ref40 ? ++y : --y) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        cell.sectionTop = (cell.section != null) && (rowIndex === 0 || layout.rows[rowIndex - 1].cells[columnIndex].section !== cell.section);
        cell.sectionLeft = (cell.section != null) && (columnIndex === 0 || layout.rows[rowIndex].cells[columnIndex - 1].section !== cell.section);
        cell.sectionRight = (cell.section != null) && (columnIndex >= layout.rows[0].cells.length - 1 || layout.rows[rowIndex].cells[columnIndex + 1].section !== cell.section);
        cell.sectionBottom = (cell.section != null) && (rowIndex >= layout.rows.length - 1 || layout.rows[rowIndex + 1].cells[columnIndex].section !== cell.section);
      }
    }
    ref41 = layout.rows;
    for (z = 0, len7 = ref41.length; z < len7; z++) {
      layoutRow = ref41[z];
      refCell = null;
      ref42 = layoutRow.cells;
      for (i = i1 = 0, len8 = ref42.length; i1 < len8; i = ++i1) {
        cell = ref42[i];
        if (i === 0) {
          refCell = cell;
          continue;
        }
        if (((ref43 = cell.type) === 'columnLabel' || ref43 === 'columnSegment') && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
          cell.type = "skip";
          refCell.columnSpan = (refCell.columnSpan || 1) + 1;
          refCell.sectionRight = true;
        } else {
          refCell = cell;
        }
      }
    }
    for (columnIndex = j1 = 0, ref44 = layout.rows[0].cells.length; 0 <= ref44 ? j1 < ref44 : j1 > ref44; columnIndex = 0 <= ref44 ? ++j1 : --j1) {
      refCell = null;
      for (rowIndex = k1 = 0, ref45 = layout.rows.length; 0 <= ref45 ? k1 < ref45 : k1 > ref45; rowIndex = 0 <= ref45 ? ++k1 : --k1) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (i === 0) {
          refCell = cell;
          continue;
        }
        if (((ref46 = cell.type) === 'rowLabel' || ref46 === 'rowSegment') && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
          cell.type = "skip";
          refCell.rowSpan = (refCell.rowSpan || 1) + 1;
          refCell.sectionBottom = true;
        } else {
          refCell = cell;
        }
      }
    }
    return layout;
  };

  PivotChartLayoutBuilder.prototype.buildIntersectionCell = function(design, data, locale, row, column) {
    var backgroundColor, cell, entry, intersection, intersectionData, intersectionId, text, value;
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
    cell = {
      type: "intersection",
      section: intersectionId,
      text: text,
      align: "right",
      bold: intersection.bold,
      italic: intersection.italic
    };
    if (intersection.backgroundColorAxis && ((entry != null ? entry.backgroundColor : void 0) != null)) {
      backgroundColor = this.axisBuilder.getValueColor(intersection.backgroundColorAxis, entry != null ? entry.backgroundColor : void 0);
      if (backgroundColor) {
        backgroundColor = Color(backgroundColor).alpha(intersection.backgroundColorOpacity).string();
      }
      cell.backgroundColor = backgroundColor;
    }
    return cell;
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
