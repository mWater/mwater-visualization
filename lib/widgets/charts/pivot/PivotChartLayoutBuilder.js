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
    var borderBottoms, borderLefts, borderRights, borderTops, cell, cells, column, columnIndex, columns, columnsDepth, depth, i, i1, intersectionId, j, j1, k, k1, l, l1, layout, layoutRow, len, len1, len10, len2, len3, len4, len5, len6, len7, len8, len9, m, m1, n, n1, needsSpecialRowHeader, o, o1, p, p1, q, q1, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref38, ref39, ref4, ref40, ref41, ref42, ref43, ref44, ref45, ref46, ref47, ref48, ref49, ref5, ref50, ref51, ref52, ref53, ref54, ref55, ref56, ref57, ref58, ref59, ref6, ref60, ref61, ref62, ref63, ref64, ref65, ref66, ref67, ref68, ref69, ref7, ref70, ref71, ref72, ref73, ref74, ref75, ref76, ref77, ref8, ref9, refCell, row, rowIndex, rowSegments, rows, rowsDepth, s, segment, t, u, v, w, x, y, z;
    layout = {
      rows: [],
      striping: design.striping
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
            type: "column",
            subtype: "valueLabel",
            segment: (ref4 = column[depth]) != null ? ref4.segment : void 0,
            section: (ref5 = column[depth]) != null ? ref5.segment.id : void 0,
            text: (ref6 = column[depth]) != null ? ref6.segment.label : void 0,
            align: "center",
            bold: ((ref7 = column[depth]) != null ? ref7.segment.bold : void 0) || ((ref8 = column[depth]) != null ? ref8.segment.valueLabelBold : void 0),
            italic: (ref9 = column[depth]) != null ? ref9.segment.italic : void 0
          });
        }
        layout.rows.push({
          cells: cells
        });
      }
      cells = [];
      for (i = o = 1, ref10 = rowsDepth; 1 <= ref10 ? o <= ref10 : o >= ref10; i = 1 <= ref10 ? ++o : --o) {
        cells.push({
          type: "blank",
          text: null
        });
      }
      for (p = 0, len3 = columns.length; p < len3; p++) {
        column = columns[p];
        cells.push({
          type: "column",
          subtype: ((ref11 = column[depth]) != null ? (ref12 = ref11.segment) != null ? ref12.valueAxis : void 0 : void 0) ? "value" : "label",
          segment: (ref13 = column[depth]) != null ? ref13.segment : void 0,
          section: (ref14 = column[depth]) != null ? ref14.segment.id : void 0,
          text: (ref15 = column[depth]) != null ? ref15.label : void 0,
          align: "center",
          unconfigured: ((ref16 = column[depth]) != null ? ref16.segment : void 0) && (((ref17 = column[depth]) != null ? ref17.segment.label : void 0) == null) && !((ref18 = column[depth]) != null ? ref18.segment.valueAxis : void 0),
          bold: (ref19 = column[depth]) != null ? ref19.segment.bold : void 0,
          italic: (ref20 = column[depth]) != null ? ref20.segment.italic : void 0
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
      for (depth = s = 0, ref21 = rowsDepth; 0 <= ref21 ? s < ref21 : s > ref21; depth = 0 <= ref21 ? ++s : --s) {
        if (row[depth] && rowSegments[depth] !== row[depth].segment && row[depth].segment.label && row[depth].segment.valueAxis) {
          needsSpecialRowHeader.push(true);
        } else {
          needsSpecialRowHeader.push(false);
        }
      }
      if (_.any(needsSpecialRowHeader)) {
        cells = [];
        for (depth = t = 0, ref22 = rowsDepth; 0 <= ref22 ? t < ref22 : t > ref22; depth = 0 <= ref22 ? ++t : --t) {
          if (needsSpecialRowHeader[depth]) {
            cells.push({
              type: "row",
              subtype: "valueLabel",
              segment: (ref23 = row[depth]) != null ? ref23.segment : void 0,
              section: (ref24 = row[depth]) != null ? ref24.segment.id : void 0,
              text: row[depth].segment.label,
              bold: ((ref25 = row[depth]) != null ? ref25.segment.bold : void 0) || ((ref26 = row[depth]) != null ? ref26.segment.valueLabelBold : void 0),
              italic: (ref27 = row[depth]) != null ? ref27.segment.italic : void 0
            });
          } else {
            cells.push({
              type: "row",
              subtype: "label",
              segment: (ref28 = row[depth]) != null ? ref28.segment : void 0,
              section: (ref29 = row[depth]) != null ? ref29.segment.id : void 0,
              text: null,
              unconfigured: ((ref30 = row[depth]) != null ? ref30.segment : void 0) && (((ref31 = row[depth]) != null ? ref31.segment.label : void 0) == null) && !((ref32 = row[depth]) != null ? ref32.segment.valueAxis : void 0),
              bold: (ref33 = row[depth]) != null ? ref33.segment.bold : void 0,
              italic: (ref34 = row[depth]) != null ? ref34.segment.italic : void 0
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
            subtype: "filler",
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
      for (depth = v = 0, ref35 = rowsDepth; 0 <= ref35 ? v < ref35 : v > ref35; depth = 0 <= ref35 ? ++v : --v) {
        cells.push({
          type: "row",
          subtype: ((ref36 = row[depth]) != null ? (ref37 = ref36.segment) != null ? ref37.valueAxis : void 0 : void 0) ? "value" : "label",
          segment: (ref38 = row[depth]) != null ? ref38.segment : void 0,
          section: (ref39 = row[depth]) != null ? ref39.segment.id : void 0,
          text: (ref40 = row[depth]) != null ? ref40.label : void 0,
          unconfigured: ((ref41 = row[depth]) != null ? ref41.segment : void 0) && (((ref42 = row[depth]) != null ? ref42.segment.label : void 0) == null) && !((ref43 = row[depth]) != null ? ref43.segment.valueAxis : void 0),
          bold: (ref44 = row[depth]) != null ? ref44.segment.bold : void 0,
          italic: (ref45 = row[depth]) != null ? ref45.segment.italic : void 0,
          indent: ((ref46 = row[depth]) != null ? (ref47 = ref46.segment) != null ? ref47.valueAxis : void 0 : void 0) && ((ref48 = row[depth]) != null ? (ref49 = ref48.segment) != null ? ref49.label : void 0 : void 0) ? 1 : void 0
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
    for (columnIndex = x = 0, ref50 = layout.rows[0].cells.length; 0 <= ref50 ? x < ref50 : x > ref50; columnIndex = 0 <= ref50 ? ++x : --x) {
      for (rowIndex = y = 0, ref51 = layout.rows.length; 0 <= ref51 ? y < ref51 : y > ref51; rowIndex = 0 <= ref51 ? ++y : --y) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        cell.sectionTop = (cell.section != null) && (rowIndex === 0 || layout.rows[rowIndex - 1].cells[columnIndex].section !== cell.section);
        cell.sectionLeft = (cell.section != null) && (columnIndex === 0 || layout.rows[rowIndex].cells[columnIndex - 1].section !== cell.section);
        cell.sectionRight = (cell.section != null) && (columnIndex >= layout.rows[0].cells.length - 1 || layout.rows[rowIndex].cells[columnIndex + 1].section !== cell.section);
        cell.sectionBottom = (cell.section != null) && (rowIndex >= layout.rows.length - 1 || layout.rows[rowIndex + 1].cells[columnIndex].section !== cell.section);
      }
    }
    ref52 = layout.rows;
    for (z = 0, len7 = ref52.length; z < len7; z++) {
      layoutRow = ref52[z];
      refCell = null;
      ref53 = layoutRow.cells;
      for (i = i1 = 0, len8 = ref53.length; i1 < len8; i = ++i1) {
        cell = ref53[i];
        if (i === 0) {
          refCell = cell;
          continue;
        }
        if (cell.type === 'column' && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
          cell.skip = true;
          refCell.columnSpan = (refCell.columnSpan || 1) + 1;
          refCell.sectionRight = true;
        } else {
          refCell = cell;
        }
      }
    }
    ref54 = layout.rows;
    for (j1 = 0, len9 = ref54.length; j1 < len9; j1++) {
      layoutRow = ref54[j1];
      refCell = null;
      ref55 = layoutRow.cells;
      for (i = k1 = 0, len10 = ref55.length; k1 < len10; i = ++k1) {
        cell = ref55[i];
        if (i === 0) {
          refCell = cell;
          continue;
        }
        if (cell.type === 'intersection' && cell.subtype === "filler" && cell.type === refCell.type && cell.subtype === refCell.subtype) {
          cell.skip = true;
          refCell.columnSpan = (refCell.columnSpan || 1) + 1;
          refCell.sectionRight = true;
        } else {
          refCell = cell;
        }
      }
    }
    for (columnIndex = l1 = 0, ref56 = layout.rows[0].cells.length; 0 <= ref56 ? l1 < ref56 : l1 > ref56; columnIndex = 0 <= ref56 ? ++l1 : --l1) {
      refCell = null;
      for (rowIndex = m1 = 0, ref57 = layout.rows.length; 0 <= ref57 ? m1 < ref57 : m1 > ref57; rowIndex = 0 <= ref57 ? ++m1 : --m1) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (i === 0) {
          refCell = cell;
          continue;
        }
        if (cell.type === 'row' && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
          cell.skip = true;
          refCell.rowSpan = (refCell.rowSpan || 1) + 1;
          refCell.sectionBottom = true;
        } else {
          refCell = cell;
        }
      }
    }
    borderTops = [];
    borderBottoms = [];
    borderLefts = [];
    borderRights = [];
    for (columnIndex = n1 = 0, ref58 = layout.rows[0].cells.length; 0 <= ref58 ? n1 < ref58 : n1 > ref58; columnIndex = 0 <= ref58 ? ++n1 : --n1) {
      for (rowIndex = o1 = 0, ref59 = layout.rows.length; 0 <= ref59 ? o1 < ref59 : o1 > ref59; rowIndex = 0 <= ref59 ? ++o1 : --o1) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (cell.type === "row") {
          cell.borderLeft = 2;
          cell.borderRight = 2;
          if (cell.sectionTop) {
            if (((ref60 = cell.segment) != null ? ref60.borderBefore : void 0) != null) {
              cell.borderTop = (ref61 = cell.segment) != null ? ref61.borderBefore : void 0;
            } else {
              cell.borderTop = 2;
            }
          } else {
            if (((ref62 = cell.segment) != null ? ref62.borderWithin : void 0) != null) {
              cell.borderTop = (ref63 = cell.segment) != null ? ref63.borderWithin : void 0;
            } else {
              cell.borderTop = 1;
            }
          }
          if (cell.sectionBottom) {
            if (((ref64 = cell.segment) != null ? ref64.borderAfter : void 0) != null) {
              cell.borderBottom = (ref65 = cell.segment) != null ? ref65.borderAfter : void 0;
            } else {
              cell.borderBottom = 2;
            }
          } else {
            if (((ref66 = cell.segment) != null ? ref66.borderWithin : void 0) != null) {
              cell.borderBottom = (ref67 = cell.segment) != null ? ref67.borderWithin : void 0;
            } else {
              cell.borderBottom = 1;
            }
          }
          borderTops[rowIndex] = Math.max(borderTops[rowIndex] || 0, cell.borderTop);
          borderBottoms[rowIndex] = Math.max(borderBottoms[rowIndex] || 0, cell.borderBottom);
        }
        if (cell.type === "column") {
          cell.borderTop = 2;
          cell.borderBottom = 2;
          if (cell.sectionLeft) {
            if (((ref68 = cell.segment) != null ? ref68.borderBefore : void 0) != null) {
              cell.borderLeft = (ref69 = cell.segment) != null ? ref69.borderBefore : void 0;
            } else {
              cell.borderLeft = 2;
            }
          } else {
            if (((ref70 = cell.segment) != null ? ref70.borderWithin : void 0) != null) {
              cell.borderLeft = (ref71 = cell.segment) != null ? ref71.borderWithin : void 0;
            } else {
              cell.borderLeft = 1;
            }
          }
          if (cell.sectionRight) {
            if (((ref72 = cell.segment) != null ? ref72.borderAfter : void 0) != null) {
              cell.borderRight = (ref73 = cell.segment) != null ? ref73.borderAfter : void 0;
            } else {
              cell.borderRight = 2;
            }
          } else {
            if (((ref74 = cell.segment) != null ? ref74.borderWithin : void 0) != null) {
              cell.borderRight = (ref75 = cell.segment) != null ? ref75.borderWithin : void 0;
            } else {
              cell.borderRight = 1;
            }
          }
          borderLefts[columnIndex] = Math.max(borderLefts[columnIndex] || 0, cell.borderLeft);
          borderRights[columnIndex + (cell.columnSpan || 1) - 1] = Math.max(borderRights[columnIndex + (cell.columnSpan || 1) - 1] || 0, cell.borderRight);
        }
      }
    }
    for (columnIndex = p1 = 0, ref76 = layout.rows[0].cells.length; 0 <= ref76 ? p1 < ref76 : p1 > ref76; columnIndex = 0 <= ref76 ? ++p1 : --p1) {
      for (rowIndex = q1 = 0, ref77 = layout.rows.length; 0 <= ref77 ? q1 < ref77 : q1 > ref77; rowIndex = 0 <= ref77 ? ++q1 : --q1) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (cell.type === "intersection") {
          cell.borderLeft = borderLefts[columnIndex];
          cell.borderRight = borderRights[columnIndex];
          cell.borderTop = borderTops[rowIndex];
          cell.borderBottom = borderBottoms[rowIndex];
        }
      }
    }
    return layout;
  };

  PivotChartLayoutBuilder.prototype.buildIntersectionCell = function(design, data, locale, row, column) {
    var backgroundColor, cell, entry, intersection, intersectionData, intersectionId, ref, text, value;
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
      text = ((ref = intersection.valueAxis) != null ? ref.nullLabel : void 0) || null;
    }
    cell = {
      type: "intersection",
      subtype: "value",
      section: intersectionId,
      text: text,
      align: "right",
      bold: intersection.bold,
      italic: intersection.italic
    };
    if (intersection.backgroundColorAxis && ((entry != null ? entry.backgroundColor : void 0) != null)) {
      backgroundColor = this.axisBuilder.getValueColor(intersection.backgroundColorAxis, entry != null ? entry.backgroundColor : void 0);
    } else if (intersection.backgroundColor && !intersection.colorAxis) {
      backgroundColor = intersection.backgroundColor;
    }
    if (backgroundColor) {
      backgroundColor = Color(backgroundColor).alpha(intersection.backgroundColorOpacity).string();
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
