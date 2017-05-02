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

  PivotChartLayoutBuilder.prototype.buildLayout = function(design, data, locale, scope) {
    var cell, cells, column, columnIndex, columns, columnsDepth, depth, i, i1, intersectionId, j, j1, k, k1, l, l1, layout, layoutRow, len, len1, len10, len2, len3, len4, len5, len6, len7, len8, len9, m, m1, n, n1, needsSpecialRowHeader, o, o1, p, p1, q, q1, r1, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref38, ref39, ref4, ref40, ref41, ref42, ref43, ref44, ref45, ref46, ref47, ref48, ref49, ref5, ref50, ref51, ref52, ref53, ref54, ref55, ref56, ref57, ref58, ref59, ref6, ref60, ref61, ref62, ref63, ref64, ref65, ref66, ref67, ref68, ref69, ref7, ref70, ref8, ref9, refCell, row, rowIndex, rowSegments, rows, rowsDepth, s, s1, segment, segmentValues, subdepth, t, u, v, w, x, y, z;
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
            unconfigured: ((ref7 = column[depth]) != null ? ref7.segment : void 0) && (((ref8 = column[depth]) != null ? ref8.segment.label : void 0) == null) && !((ref9 = column[depth]) != null ? ref9.segment.valueAxis : void 0),
            bold: ((ref10 = column[depth]) != null ? ref10.segment.bold : void 0) || ((ref11 = column[depth]) != null ? ref11.segment.valueLabelBold : void 0),
            italic: (ref12 = column[depth]) != null ? ref12.segment.italic : void 0
          });
        }
        layout.rows.push({
          cells: cells
        });
      }
      cells = [];
      for (i = o = 1, ref13 = rowsDepth; 1 <= ref13 ? o <= ref13 : o >= ref13; i = 1 <= ref13 ? ++o : --o) {
        cells.push({
          type: "blank",
          text: null
        });
      }
      for (p = 0, len3 = columns.length; p < len3; p++) {
        column = columns[p];
        segmentValues = {};
        for (subdepth = q = 0, ref14 = depth; 0 <= ref14 ? q <= ref14 : q >= ref14; subdepth = 0 <= ref14 ? ++q : --q) {
          if ((ref15 = column[subdepth]) != null ? (ref16 = ref15.segment) != null ? ref16.valueAxis : void 0 : void 0) {
            segmentValues[column[subdepth].segment.id] = column[subdepth].value;
          }
        }
        cells.push({
          type: "column",
          subtype: ((ref17 = column[depth]) != null ? (ref18 = ref17.segment) != null ? ref18.valueAxis : void 0 : void 0) ? "value" : "label",
          segment: (ref19 = column[depth]) != null ? ref19.segment : void 0,
          section: (ref20 = column[depth]) != null ? ref20.segment.id : void 0,
          text: (ref21 = column[depth]) != null ? ref21.label : void 0,
          align: "center",
          unconfigured: ((ref22 = column[depth]) != null ? ref22.segment : void 0) && (((ref23 = column[depth]) != null ? ref23.segment.label : void 0) == null) && !((ref24 = column[depth]) != null ? ref24.segment.valueAxis : void 0),
          bold: (ref25 = column[depth]) != null ? ref25.segment.bold : void 0,
          italic: (ref26 = column[depth]) != null ? ref26.segment.italic : void 0,
          segmentValues: segmentValues
        });
      }
      layout.rows.push({
        cells: cells
      });
    }
    rowSegments = [];
    for (s = 0, len4 = rows.length; s < len4; s++) {
      row = rows[s];
      needsSpecialRowHeader = [];
      for (depth = t = 0, ref27 = rowsDepth; 0 <= ref27 ? t < ref27 : t > ref27; depth = 0 <= ref27 ? ++t : --t) {
        if (row[depth] && rowSegments[depth] !== row[depth].segment && row[depth].segment.label && row[depth].segment.valueAxis) {
          needsSpecialRowHeader.push(true);
        } else {
          needsSpecialRowHeader.push(false);
        }
      }
      if (_.any(needsSpecialRowHeader)) {
        cells = [];
        for (depth = u = 0, ref28 = rowsDepth; 0 <= ref28 ? u < ref28 : u > ref28; depth = 0 <= ref28 ? ++u : --u) {
          if (needsSpecialRowHeader[depth]) {
            cells.push({
              type: "row",
              subtype: "valueLabel",
              segment: (ref29 = row[depth]) != null ? ref29.segment : void 0,
              section: (ref30 = row[depth]) != null ? ref30.segment.id : void 0,
              text: row[depth].segment.label,
              bold: ((ref31 = row[depth]) != null ? ref31.segment.bold : void 0) || ((ref32 = row[depth]) != null ? ref32.segment.valueLabelBold : void 0),
              italic: (ref33 = row[depth]) != null ? ref33.segment.italic : void 0
            });
          } else {
            cells.push({
              type: "row",
              subtype: "label",
              segment: (ref34 = row[depth]) != null ? ref34.segment : void 0,
              section: (ref35 = row[depth]) != null ? ref35.segment.id : void 0,
              text: null,
              unconfigured: ((ref36 = row[depth]) != null ? ref36.segment : void 0) && (((ref37 = row[depth]) != null ? ref37.segment.label : void 0) == null) && !((ref38 = row[depth]) != null ? ref38.segment.valueAxis : void 0),
              bold: (ref39 = row[depth]) != null ? ref39.segment.bold : void 0,
              italic: (ref40 = row[depth]) != null ? ref40.segment.italic : void 0
            });
          }
        }
        for (v = 0, len5 = columns.length; v < len5; v++) {
          column = columns[v];
          intersectionId = PivotChartUtils.getIntersectionId(_.map(row, function(r) {
            return r.segment;
          }), _.map(column, function(c) {
            return c.segment;
          }));
          cells.push({
            type: "intersection",
            subtype: "filler",
            section: intersectionId,
            text: null,
            backgroundColor: _.reduce(row, (function(total, r) {
              var ref41;
              return total || ((ref41 = r.segment) != null ? ref41.fillerColor : void 0) || null;
            }), null)
          });
        }
        layout.rows.push({
          cells: cells
        });
      }
      rowSegments = _.pluck(row, "segment");
      cells = [];
      for (depth = w = 0, ref41 = rowsDepth; 0 <= ref41 ? w < ref41 : w > ref41; depth = 0 <= ref41 ? ++w : --w) {
        segmentValues = {};
        for (subdepth = x = 0, ref42 = depth; 0 <= ref42 ? x <= ref42 : x >= ref42; subdepth = 0 <= ref42 ? ++x : --x) {
          if ((ref43 = row[subdepth]) != null ? (ref44 = ref43.segment) != null ? ref44.valueAxis : void 0 : void 0) {
            segmentValues[row[subdepth].segment.id] = row[subdepth].value;
          }
        }
        cells.push({
          type: "row",
          subtype: ((ref45 = row[depth]) != null ? (ref46 = ref45.segment) != null ? ref46.valueAxis : void 0 : void 0) ? "value" : "label",
          segment: (ref47 = row[depth]) != null ? ref47.segment : void 0,
          section: (ref48 = row[depth]) != null ? ref48.segment.id : void 0,
          text: (ref49 = row[depth]) != null ? ref49.label : void 0,
          unconfigured: ((ref50 = row[depth]) != null ? ref50.segment : void 0) && (((ref51 = row[depth]) != null ? ref51.segment.label : void 0) == null) && !((ref52 = row[depth]) != null ? ref52.segment.valueAxis : void 0),
          bold: (ref53 = row[depth]) != null ? ref53.segment.bold : void 0,
          italic: (ref54 = row[depth]) != null ? ref54.segment.italic : void 0,
          indent: ((ref55 = row[depth]) != null ? (ref56 = ref55.segment) != null ? ref56.valueAxis : void 0 : void 0) && ((ref57 = row[depth]) != null ? (ref58 = ref57.segment) != null ? ref58.label : void 0 : void 0) ? 1 : void 0,
          segmentValues: segmentValues
        });
      }
      for (y = 0, len6 = columns.length; y < len6; y++) {
        column = columns[y];
        cells.push(this.buildIntersectionCell(design, data, locale, row, column));
      }
      layout.rows.push({
        cells: cells
      });
    }
    for (columnIndex = z = 0, ref59 = layout.rows[0].cells.length; 0 <= ref59 ? z < ref59 : z > ref59; columnIndex = 0 <= ref59 ? ++z : --z) {
      for (rowIndex = i1 = 0, ref60 = layout.rows.length; 0 <= ref60 ? i1 < ref60 : i1 > ref60; rowIndex = 0 <= ref60 ? ++i1 : --i1) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (scope && scope.data.section === cell.section && cell.segmentValues && _.isEqual(scope.data.segmentValues, cell.segmentValues)) {
          cell.scoped = true;
        }
      }
    }
    for (columnIndex = j1 = 0, ref61 = layout.rows[0].cells.length; 0 <= ref61 ? j1 < ref61 : j1 > ref61; columnIndex = 0 <= ref61 ? ++j1 : --j1) {
      for (rowIndex = k1 = 0, ref62 = layout.rows.length; 0 <= ref62 ? k1 < ref62 : k1 > ref62; rowIndex = 0 <= ref62 ? ++k1 : --k1) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        cell.sectionTop = (cell.section != null) && (rowIndex === 0 || layout.rows[rowIndex - 1].cells[columnIndex].section !== cell.section);
        cell.sectionLeft = (cell.section != null) && (columnIndex === 0 || layout.rows[rowIndex].cells[columnIndex - 1].section !== cell.section);
        cell.sectionRight = (cell.section != null) && (columnIndex >= layout.rows[0].cells.length - 1 || layout.rows[rowIndex].cells[columnIndex + 1].section !== cell.section);
        cell.sectionBottom = (cell.section != null) && (rowIndex >= layout.rows.length - 1 || layout.rows[rowIndex + 1].cells[columnIndex].section !== cell.section);
      }
    }
    this.setupSummarize(design, layout);
    this.setupBorders(layout);
    ref63 = layout.rows;
    for (l1 = 0, len7 = ref63.length; l1 < len7; l1++) {
      layoutRow = ref63[l1];
      refCell = null;
      ref64 = layoutRow.cells;
      for (i = m1 = 0, len8 = ref64.length; m1 < len8; i = ++m1) {
        cell = ref64[i];
        if (i === 0) {
          refCell = cell;
          continue;
        }
        if (cell.type === 'column' && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
          cell.skip = true;
          refCell.columnSpan = (refCell.columnSpan || 1) + 1;
          refCell.sectionRight = true;
          refCell.borderRight = cell.borderRight;
        } else {
          refCell = cell;
        }
      }
    }
    ref65 = layout.rows;
    for (n1 = 0, len9 = ref65.length; n1 < len9; n1++) {
      layoutRow = ref65[n1];
      refCell = null;
      ref66 = layoutRow.cells;
      for (i = o1 = 0, len10 = ref66.length; o1 < len10; i = ++o1) {
        cell = ref66[i];
        if (i === 0) {
          refCell = cell;
          continue;
        }
        if (cell.type === 'intersection' && cell.subtype === "filler" && cell.type === refCell.type && cell.subtype === refCell.subtype) {
          cell.skip = true;
          refCell.columnSpan = (refCell.columnSpan || 1) + 1;
          refCell.sectionRight = true;
          refCell.borderRight = cell.borderRight;
        } else {
          refCell = cell;
        }
      }
    }
    for (columnIndex = p1 = 0, ref67 = layout.rows[0].cells.length; 0 <= ref67 ? p1 < ref67 : p1 > ref67; columnIndex = 0 <= ref67 ? ++p1 : --p1) {
      refCell = null;
      for (rowIndex = q1 = 0, ref68 = layout.rows.length; 0 <= ref68 ? q1 < ref68 : q1 > ref68; rowIndex = 0 <= ref68 ? ++q1 : --q1) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (rowIndex === 0) {
          refCell = cell;
          continue;
        }
        if (cell.type === 'row' && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
          cell.skip = true;
          refCell.rowSpan = (refCell.rowSpan || 1) + 1;
          refCell.sectionBottom = true;
          refCell.borderBottom = cell.borderBottom;
        } else {
          refCell = cell;
        }
      }
    }
    for (columnIndex = r1 = 0, ref69 = layout.rows[0].cells.length; 0 <= ref69 ? r1 < ref69 : r1 > ref69; columnIndex = 0 <= ref69 ? ++r1 : --r1) {
      refCell = null;
      for (rowIndex = s1 = 0, ref70 = layout.rows.length; 0 <= ref70 ? s1 < ref70 : s1 > ref70; rowIndex = 0 <= ref70 ? ++s1 : --s1) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (rowIndex === 0) {
          refCell = cell;
          continue;
        }
        if (cell.type === 'column' && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
          cell.skip = true;
          refCell.rowSpan = (refCell.rowSpan || 1) + 1;
          refCell.sectionBottom = true;
          refCell.borderBottom = cell.borderBottom;
        } else {
          refCell = cell;
        }
      }
    }
    return layout;
  };

  PivotChartLayoutBuilder.prototype.buildIntersectionCell = function(design, data, locale, row, column) {
    var backgroundColor, backgroundColorCondition, cell, columnPart, entry, i, intersection, intersectionData, intersectionId, j, k, l, len, len1, len2, ref, ref1, rowPart, text, value;
    intersectionId = PivotChartUtils.getIntersectionId(_.map(row, function(r) {
      return r.segment;
    }), _.map(column, function(c) {
      return c.segment;
    }));
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
    cell.segmentValues = {};
    for (j = 0, len = row.length; j < len; j++) {
      rowPart = row[j];
      if (rowPart.segment.valueAxis != null) {
        cell.segmentValues[rowPart.segment.id] = rowPart.value;
      }
    }
    for (k = 0, len1 = column.length; k < len1; k++) {
      columnPart = column[k];
      if (columnPart.segment.valueAxis != null) {
        cell.segmentValues[columnPart.segment.id] = columnPart.value;
      }
    }
    backgroundColor = null;
    ref1 = intersection.backgroundColorConditions || [];
    for (i = l = 0, len2 = ref1.length; l < len2; i = ++l) {
      backgroundColorCondition = ref1[i];
      if (entry != null ? entry["bcc" + i] : void 0) {
        backgroundColor = backgroundColorCondition.color;
      }
    }
    if (!backgroundColor && intersection.backgroundColorAxis && ((entry != null ? entry.bc : void 0) != null)) {
      backgroundColor = this.axisBuilder.getValueColor(intersection.backgroundColorAxis, entry != null ? entry.bc : void 0);
    }
    if (!backgroundColor && intersection.backgroundColor && !intersection.colorAxis) {
      backgroundColor = intersection.backgroundColor;
    }
    if (backgroundColor) {
      backgroundColor = Color(backgroundColor).alpha(intersection.backgroundColorOpacity).string();
      cell.backgroundColor = backgroundColor;
    }
    return cell;
  };

  PivotChartLayoutBuilder.prototype.setupSummarize = function(design, layout) {
    var cell, columnIndex, j, ref, results1, rowIndex;
    results1 = [];
    for (columnIndex = j = 0, ref = layout.rows[0].cells.length; 0 <= ref ? j < ref : j > ref; columnIndex = 0 <= ref ? ++j : --j) {
      results1.push((function() {
        var k, ref1, results2;
        results2 = [];
        for (rowIndex = k = 0, ref1 = layout.rows.length; 0 <= ref1 ? k < ref1 : k > ref1; rowIndex = 0 <= ref1 ? ++k : --k) {
          cell = layout.rows[rowIndex].cells[columnIndex];
          if (cell.unconfigured && cell.type === "row") {
            cell.summarize = PivotChartUtils.canSummarizeSegment(design.rows, cell.section);
          }
          if (cell.unconfigured && cell.type === "column") {
            results2.push(cell.summarize = PivotChartUtils.canSummarizeSegment(design.columns, cell.section));
          } else {
            results2.push(void 0);
          }
        }
        return results2;
      })());
    }
    return results1;
  };

  PivotChartLayoutBuilder.prototype.setupBorders = function(layout) {
    var borderBottoms, borderLefts, borderRights, borderTops, cell, columnIndex, j, k, l, m, n, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref3, ref4, ref5, ref6, ref7, ref8, ref9, results1, rowIndex;
    borderTops = [];
    borderBottoms = [];
    borderLefts = [];
    borderRights = [];
    for (columnIndex = j = 0, ref = layout.rows[0].cells.length; 0 <= ref ? j < ref : j > ref; columnIndex = 0 <= ref ? ++j : --j) {
      for (rowIndex = k = 0, ref1 = layout.rows.length; 0 <= ref1 ? k < ref1 : k > ref1; rowIndex = 0 <= ref1 ? ++k : --k) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (cell.type === "row") {
          cell.borderLeft = 2;
          cell.borderRight = 2;
          if (cell.sectionTop) {
            if (((ref2 = cell.segment) != null ? ref2.borderBefore : void 0) != null) {
              cell.borderTop = (ref3 = cell.segment) != null ? ref3.borderBefore : void 0;
            } else {
              cell.borderTop = 2;
            }
          } else if (rowIndex > 0 && layout.rows[rowIndex - 1].cells[columnIndex].text !== cell.text) {
            if (((ref4 = cell.segment) != null ? ref4.borderWithin : void 0) != null) {
              cell.borderTop = (ref5 = cell.segment) != null ? ref5.borderWithin : void 0;
            } else {
              cell.borderTop = 1;
            }
          } else {
            cell.borderTop = 0;
          }
          if (cell.sectionBottom) {
            if (((ref6 = cell.segment) != null ? ref6.borderAfter : void 0) != null) {
              cell.borderBottom = (ref7 = cell.segment) != null ? ref7.borderAfter : void 0;
            } else {
              cell.borderBottom = 2;
            }
          } else if (rowIndex < layout.rows.length - 1 && layout.rows[rowIndex + 1].cells[columnIndex].text !== cell.text) {
            if (((ref8 = cell.segment) != null ? ref8.borderWithin : void 0) != null) {
              cell.borderBottom = (ref9 = cell.segment) != null ? ref9.borderWithin : void 0;
            } else {
              cell.borderBottom = 1;
            }
          } else {
            cell.borderBottom = 0;
          }
          borderTops[rowIndex] = Math.max(borderTops[rowIndex] || 0, cell.borderTop);
          borderBottoms[rowIndex] = Math.max(borderBottoms[rowIndex] || 0, cell.borderBottom);
        }
        if (cell.type === "column") {
          cell.borderTop = 2;
          cell.borderBottom = 2;
          if (cell.sectionLeft) {
            if (((ref10 = cell.segment) != null ? ref10.borderBefore : void 0) != null) {
              cell.borderLeft = (ref11 = cell.segment) != null ? ref11.borderBefore : void 0;
            } else {
              cell.borderLeft = 2;
            }
          } else if (columnIndex > 0 && layout.rows[rowIndex].cells[columnIndex - 1].text !== cell.text) {
            if (((ref12 = cell.segment) != null ? ref12.borderWithin : void 0) != null) {
              cell.borderLeft = (ref13 = cell.segment) != null ? ref13.borderWithin : void 0;
            } else {
              cell.borderLeft = 1;
            }
          } else {
            cell.borderLeft = 0;
          }
          if (cell.sectionRight) {
            if (((ref14 = cell.segment) != null ? ref14.borderAfter : void 0) != null) {
              cell.borderRight = (ref15 = cell.segment) != null ? ref15.borderAfter : void 0;
            } else {
              cell.borderRight = 2;
            }
          } else if (columnIndex < layout.rows[rowIndex].cells.length - 1 && layout.rows[rowIndex].cells[columnIndex + 1].text !== cell.text) {
            if (((ref16 = cell.segment) != null ? ref16.borderWithin : void 0) != null) {
              cell.borderRight = (ref17 = cell.segment) != null ? ref17.borderWithin : void 0;
            } else {
              cell.borderRight = 1;
            }
          } else {
            cell.borderRight = 0;
          }
          borderLefts[columnIndex] = Math.max(borderLefts[columnIndex] || 0, cell.borderLeft);
          borderRights[columnIndex] = Math.max(borderRights[columnIndex] || 0, cell.borderRight);
        }
      }
    }
    for (columnIndex = l = 1, ref18 = layout.rows[0].cells.length; 1 <= ref18 ? l < ref18 : l > ref18; columnIndex = 1 <= ref18 ? ++l : --l) {
      for (rowIndex = m = 1, ref19 = layout.rows.length; 1 <= ref19 ? m < ref19 : m > ref19; rowIndex = 1 <= ref19 ? ++m : --m) {
        cell = layout.rows[rowIndex].cells[columnIndex];
        if (cell.type === "row") {
          cell.borderTop = Math.max(layout.rows[rowIndex].cells[columnIndex - 1].borderTop, cell.borderTop);
          cell.borderBottom = Math.max(layout.rows[rowIndex].cells[columnIndex - 1].borderBottom, cell.borderBottom);
        }
        if (cell.type === "column") {
          cell.borderLeft = Math.max(layout.rows[rowIndex - 1].cells[columnIndex].borderLeft, cell.borderLeft);
          cell.borderRight = Math.max(layout.rows[rowIndex - 1].cells[columnIndex].borderRight, cell.borderRight);
        }
      }
    }
    results1 = [];
    for (columnIndex = n = 0, ref20 = layout.rows[0].cells.length; 0 <= ref20 ? n < ref20 : n > ref20; columnIndex = 0 <= ref20 ? ++n : --n) {
      results1.push((function() {
        var o, ref21, results2;
        results2 = [];
        for (rowIndex = o = 0, ref21 = layout.rows.length; 0 <= ref21 ? o < ref21 : o > ref21; rowIndex = 0 <= ref21 ? ++o : --o) {
          cell = layout.rows[rowIndex].cells[columnIndex];
          if (cell.type === "intersection") {
            cell.borderLeft = borderLefts[columnIndex];
            cell.borderRight = borderRights[columnIndex];
            cell.borderTop = borderTops[rowIndex];
            results2.push(cell.borderBottom = borderBottoms[rowIndex]);
          } else {
            results2.push(void 0);
          }
        }
        return results2;
      })());
    }
    return results1;
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
