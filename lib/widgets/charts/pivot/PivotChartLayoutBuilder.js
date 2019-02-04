"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var AxisBuilder,
    Color,
    ExprUtils,
    PivotChartLayoutBuilder,
    PivotChartUtils,
    _,
    canonical,
    maxColumns,
    maxRows,
    indexOf = [].indexOf;

_ = require('lodash');
ExprUtils = require('mwater-expressions').ExprUtils;
AxisBuilder = require('../../../axes/AxisBuilder');
Color = require('color');
PivotChartUtils = require('./PivotChartUtils');
canonical = require('canonical-json');
maxRows = 500;
maxColumns = 50; // Builds pivot table layout from the design and data
// See PivotChart Design.md for more detauls

module.exports = PivotChartLayoutBuilder =
/*#__PURE__*/
function () {
  // Pass in schema
  function PivotChartLayoutBuilder(options) {
    (0, _classCallCheck2.default)(this, PivotChartLayoutBuilder);
    this.schema = options.schema;
    this.exprUtils = new ExprUtils(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  (0, _createClass2.default)(PivotChartLayoutBuilder, [{
    key: "buildLayout",
    value: function buildLayout(design, data, locale) {
      var cell, cells, column, columnIndex, columns, columnsDepth, dataIndexed, depth, i, i1, intersectionId, j, j1, k1, l, l1, layout, layoutRow, len, len1, len10, len2, len3, len4, len5, len6, len7, len8, len9, m, m1, n, n1, needsSpecialRowHeader, o, o1, p, p1, q, q1, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref38, ref39, ref4, ref40, ref41, ref42, ref43, ref44, ref45, ref46, ref47, ref48, ref49, ref5, ref50, ref51, ref52, ref53, ref54, ref55, ref56, ref57, ref58, ref59, ref6, ref60, ref61, ref62, ref7, ref8, ref9, refCell, row, rowIndex, rowSegments, rows, rowsDepth, s, segment, t, u, w, x, y, z; // Create empty layout

      layout = {
        rows: [],
        striping: design.striping
      }; // Get all columns

      columns = [];
      ref = design.columns;

      for (j = 0, len = ref.length; j < len; j++) {
        segment = ref[j];
        columns = columns.concat(this.getRowsOrColumns(false, segment, data, locale));
      } // Get all rows


      rows = [];
      ref1 = design.rows;

      for (l = 0, len1 = ref1.length; l < len1; l++) {
        segment = ref1[l];
        rows = rows.concat(this.getRowsOrColumns(true, segment, data, locale));
      } // Limit rows


      if (rows.length > maxRows) {
        rows = rows.slice(0, maxRows);
        layout.tooManyRows = true;
      } // Limit columns


      if (columns.length > maxColumns) {
        columns = columns.slice(0, maxColumns);
        layout.tooManyColumns = true;
      } // Determine depth of row headers and column headers (how deeply nested segments are)


      rowsDepth = _.max(_.map(rows, function (row) {
        return row.length;
      }));
      columnsDepth = _.max(_.map(columns, function (column) {
        return column.length;
      })); // Create indexed data (index each intersection's array by canonical json of rX and cX)

      dataIndexed = _.mapValues(data, function (list) {
        return _.zipObject(_.map(list, function (row) {
          return [canonical(_.pick(row, function (v, k) {
            return k.match(/^[rc]\d$/);
          })), row];
        }));
      }); // Emit column headers, leaving blank space at left for row headers

      for (depth = m = 0, ref2 = columnsDepth; 0 <= ref2 ? m < ref2 : m > ref2; depth = 0 <= ref2 ? ++m : --m) {
        // If any segment has label and axis, add a special row of just labels
        if (_.any(columns, function (column) {
          return column[depth] && column[depth].segment.label && column[depth].segment.valueAxis;
        })) {
          cells = [];

          for (i = n = 1, ref3 = rowsDepth; 1 <= ref3 ? n <= ref3 : n >= ref3; i = 1 <= ref3 ? ++n : --n) {
            cells.push({
              type: "blank",
              text: null
            });
          }

          for (o = 0, len2 = columns.length; o < len2; o++) {
            column = columns[o];
            cells.push({
              type: "column",
              subtype: "valueLabel",
              segment: (ref4 = column[depth]) != null ? ref4.segment : void 0,
              section: (ref5 = column[depth]) != null ? ref5.segment.id : void 0,
              text: (ref6 = column[depth]) != null ? ref6.segment.label : void 0,
              align: "center",
              // Unconfigured if segment has no label or value
              unconfigured: ((ref7 = column[depth]) != null ? ref7.segment : void 0) && ((ref8 = column[depth]) != null ? ref8.segment.label : void 0) == null && !((ref9 = column[depth]) != null ? ref9.segment.valueAxis : void 0),
              bold: ((ref10 = column[depth]) != null ? ref10.segment.bold : void 0) || ((ref11 = column[depth]) != null ? ref11.segment.valueLabelBold : void 0),
              italic: (ref12 = column[depth]) != null ? ref12.segment.italic : void 0
            });
          }

          layout.rows.push({
            cells: cells
          });
        } // Emit column labels


        cells = [];

        for (i = p = 1, ref13 = rowsDepth; 1 <= ref13 ? p <= ref13 : p >= ref13; i = 1 <= ref13 ? ++p : --p) {
          cells.push({
            type: "blank",
            text: null
          });
        }

        for (q = 0, len3 = columns.length; q < len3; q++) {
          column = columns[q];
          cells.push({
            type: "column",
            subtype: ((ref14 = column[depth]) != null ? (ref15 = ref14.segment) != null ? ref15.valueAxis : void 0 : void 0) ? "value" : "label",
            segment: (ref16 = column[depth]) != null ? ref16.segment : void 0,
            section: (ref17 = column[depth]) != null ? ref17.segment.id : void 0,
            text: (ref18 = column[depth]) != null ? ref18.label : void 0,
            align: "center",
            // Unconfigured if segment has no label or value
            unconfigured: ((ref19 = column[depth]) != null ? ref19.segment : void 0) && ((ref20 = column[depth]) != null ? ref20.segment.label : void 0) == null && !((ref21 = column[depth]) != null ? ref21.segment.valueAxis : void 0),
            bold: (ref22 = column[depth]) != null ? ref22.segment.bold : void 0,
            italic: (ref23 = column[depth]) != null ? ref23.segment.italic : void 0
          });
        }

        layout.rows.push({
          cells: cells
        });
      } // Emit main section
      // Keep track of current row segment, so we can re-emit headers for row segments that have both axis and label


      rowSegments = [];

      for (s = 0, len4 = rows.length; s < len4; s++) {
        row = rows[s]; // Emit special row header for any segments that have changed and have both axis and label

        needsSpecialRowHeader = [];

        for (depth = t = 0, ref24 = rowsDepth; 0 <= ref24 ? t < ref24 : t > ref24; depth = 0 <= ref24 ? ++t : --t) {
          if (row[depth] && rowSegments[depth] !== row[depth].segment && row[depth].segment.label && row[depth].segment.valueAxis) {
            needsSpecialRowHeader.push(true);
          } else {
            needsSpecialRowHeader.push(false);
          }
        }

        if (_.any(needsSpecialRowHeader)) {
          cells = [];

          for (depth = u = 0, ref25 = rowsDepth; 0 <= ref25 ? u < ref25 : u > ref25; depth = 0 <= ref25 ? ++u : --u) {
            if (needsSpecialRowHeader[depth]) {
              cells.push({
                type: "row",
                subtype: "valueLabel",
                segment: (ref26 = row[depth]) != null ? ref26.segment : void 0,
                section: (ref27 = row[depth]) != null ? ref27.segment.id : void 0,
                text: row[depth].segment.label,
                bold: ((ref28 = row[depth]) != null ? ref28.segment.bold : void 0) || ((ref29 = row[depth]) != null ? ref29.segment.valueLabelBold : void 0),
                italic: (ref30 = row[depth]) != null ? ref30.segment.italic : void 0
              });
            } else {
              cells.push({
                type: "row",
                subtype: "label",
                segment: (ref31 = row[depth]) != null ? ref31.segment : void 0,
                section: (ref32 = row[depth]) != null ? ref32.segment.id : void 0,
                text: null,
                // Unconfigured if segment has no label or value
                unconfigured: ((ref33 = row[depth]) != null ? ref33.segment : void 0) && ((ref34 = row[depth]) != null ? ref34.segment.label : void 0) == null && !((ref35 = row[depth]) != null ? ref35.segment.valueAxis : void 0),
                bold: (ref36 = row[depth]) != null ? ref36.segment.bold : void 0,
                italic: (ref37 = row[depth]) != null ? ref37.segment.italic : void 0
              });
            }
          } // Add intersection columns


          for (w = 0, len5 = columns.length; w < len5; w++) {
            column = columns[w]; // Get intersection id

            intersectionId = PivotChartUtils.getIntersectionId(_.map(row, function (r) {
              return r.segment;
            }), _.map(column, function (c) {
              return c.segment;
            }));
            cells.push({
              type: "intersection",
              subtype: "filler",
              section: intersectionId,
              text: null,
              backgroundColor: _.reduce(row, function (total, r) {
                var ref38;
                return total || ((ref38 = r.segment) != null ? ref38.fillerColor : void 0) || null;
              }, null)
            });
          }

          layout.rows.push({
            cells: cells
          });
        } // Reset row segments


        rowSegments = _.pluck(row, "segment"); // Emit normal row headers

        cells = [];

        for (depth = x = 0, ref38 = rowsDepth; 0 <= ref38 ? x < ref38 : x > ref38; depth = 0 <= ref38 ? ++x : --x) {
          cells.push({
            type: "row",
            subtype: ((ref39 = row[depth]) != null ? (ref40 = ref39.segment) != null ? ref40.valueAxis : void 0 : void 0) ? "value" : "label",
            segment: (ref41 = row[depth]) != null ? ref41.segment : void 0,
            section: (ref42 = row[depth]) != null ? ref42.segment.id : void 0,
            text: (ref43 = row[depth]) != null ? ref43.label : void 0,
            // Unconfigured if segment has no label or value
            unconfigured: ((ref44 = row[depth]) != null ? ref44.segment : void 0) && ((ref45 = row[depth]) != null ? ref45.segment.label : void 0) == null && !((ref46 = row[depth]) != null ? ref46.segment.valueAxis : void 0),
            bold: (ref47 = row[depth]) != null ? ref47.segment.bold : void 0,
            italic: (ref48 = row[depth]) != null ? ref48.segment.italic : void 0,
            // Indent if has value and label
            indent: ((ref49 = row[depth]) != null ? (ref50 = ref49.segment) != null ? ref50.valueAxis : void 0 : void 0) && ((ref51 = row[depth]) != null ? (ref52 = ref51.segment) != null ? ref52.label : void 0 : void 0) ? 1 : void 0
          });
        } // Emit contents


        for (y = 0, len6 = columns.length; y < len6; y++) {
          column = columns[y];
          cells.push(this.buildIntersectionCell(design, dataIndexed, locale, row, column));
        }

        layout.rows.push({
          cells: cells
        });
      } // Set up section top/left/bottom/right info


      for (columnIndex = z = 0, ref53 = layout.rows[0].cells.length; 0 <= ref53 ? z < ref53 : z > ref53; columnIndex = 0 <= ref53 ? ++z : --z) {
        for (rowIndex = i1 = 0, ref54 = layout.rows.length; 0 <= ref54 ? i1 < ref54 : i1 > ref54; rowIndex = 0 <= ref54 ? ++i1 : --i1) {
          cell = layout.rows[rowIndex].cells[columnIndex];
          cell.sectionTop = cell.section != null && (rowIndex === 0 || layout.rows[rowIndex - 1].cells[columnIndex].section !== cell.section);
          cell.sectionLeft = cell.section != null && (columnIndex === 0 || layout.rows[rowIndex].cells[columnIndex - 1].section !== cell.section);
          cell.sectionRight = cell.section != null && (columnIndex >= layout.rows[0].cells.length - 1 || layout.rows[rowIndex].cells[columnIndex + 1].section !== cell.section);
          cell.sectionBottom = cell.section != null && (rowIndex >= layout.rows.length - 1 || layout.rows[rowIndex + 1].cells[columnIndex].section !== cell.section);
        }
      }

      this.setupSummarize(design, layout);
      this.setupBorders(layout);
      ref55 = layout.rows; // Span column headers and column segments that have same segment and value (TODO: uses text right now)

      for (j1 = 0, len7 = ref55.length; j1 < len7; j1++) {
        layoutRow = ref55[j1];
        refCell = null;
        ref56 = layoutRow.cells;

        for (i = k1 = 0, len8 = ref56.length; k1 < len8; i = ++k1) {
          cell = ref56[i];

          if (i === 0) {
            refCell = cell;
            continue;
          } // If matches, span columns


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

      ref57 = layout.rows; // Span intersections that are fillers

      for (l1 = 0, len9 = ref57.length; l1 < len9; l1++) {
        layoutRow = ref57[l1];
        refCell = null;
        ref58 = layoutRow.cells;

        for (i = m1 = 0, len10 = ref58.length; m1 < len10; i = ++m1) {
          cell = ref58[i];

          if (i === 0) {
            refCell = cell;
            continue;
          } // If matches, span columns


          if (cell.type === 'intersection' && cell.subtype === "filler" && cell.type === refCell.type && cell.subtype === refCell.subtype) {
            cell.skip = true;
            refCell.columnSpan = (refCell.columnSpan || 1) + 1;
            refCell.sectionRight = true;
            refCell.borderRight = cell.borderRight;
          } else {
            refCell = cell;
          }
        }
      } // Span row headers and row segments that have same segment and value (TODO: uses text right now)


      for (columnIndex = n1 = 0, ref59 = layout.rows[0].cells.length; 0 <= ref59 ? n1 < ref59 : n1 > ref59; columnIndex = 0 <= ref59 ? ++n1 : --n1) {
        refCell = null;

        for (rowIndex = o1 = 0, ref60 = layout.rows.length; 0 <= ref60 ? o1 < ref60 : o1 > ref60; rowIndex = 0 <= ref60 ? ++o1 : --o1) {
          cell = layout.rows[rowIndex].cells[columnIndex];

          if (rowIndex === 0) {
            refCell = cell;
            continue;
          } // If matches, span rows


          if (cell.type === 'row' && cell.text === refCell.text && cell.type === refCell.type && cell.section === refCell.section) {
            cell.skip = true;
            refCell.rowSpan = (refCell.rowSpan || 1) + 1;
            refCell.sectionBottom = true;
            refCell.borderBottom = cell.borderBottom;
          } else {
            refCell = cell;
          }
        }
      } // Span column headers that have the same segment and value (TODO: uses text right now)


      for (columnIndex = p1 = 0, ref61 = layout.rows[0].cells.length; 0 <= ref61 ? p1 < ref61 : p1 > ref61; columnIndex = 0 <= ref61 ? ++p1 : --p1) {
        refCell = null;

        for (rowIndex = q1 = 0, ref62 = layout.rows.length; 0 <= ref62 ? q1 < ref62 : q1 > ref62; rowIndex = 0 <= ref62 ? ++q1 : --q1) {
          cell = layout.rows[rowIndex].cells[columnIndex];

          if (rowIndex === 0) {
            refCell = cell;
            continue;
          } // If matches, span rows


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
    } // Build a cell which is the intersection of a row and column, where row and column are nested arrays
    // from getRowsOrColumns
    // dataIndexed is created above. See there for format

  }, {
    key: "buildIntersectionCell",
    value: function buildIntersectionCell(design, dataIndexed, locale, row, column) {
      var backgroundColor, backgroundColorCondition, cell, entry, i, intersection, intersectionData, intersectionId, j, key, l, len, len1, len2, m, part, ref, ref1, text, value; // Get intersection id

      intersectionId = PivotChartUtils.getIntersectionId(_.map(row, function (r) {
        return r.segment;
      }), _.map(column, function (c) {
        return c.segment;
      })); // Lookup intersection 

      intersection = design.intersections[intersectionId];

      if (!intersection) {
        // Should not happen
        return {
          type: "blank",
          text: null
        };
      } // Lookup data


      intersectionData = dataIndexed[intersectionId]; // Create key to lookup value

      key = {};

      for (i = j = 0, len = row.length; j < len; i = ++j) {
        part = row[i];
        key["r".concat(i)] = part.value;
      }

      for (i = l = 0, len1 = column.length; l < len1; i = ++l) {
        part = column[i];
        key["c".concat(i)] = part.value;
      } // Lookup value by finding an entry which matches all of the row and column values


      entry = intersectionData != null ? intersectionData[canonical(key)] : void 0;
      value = entry != null ? entry.value : void 0; // Format using axis builder if present. Blank otherwise

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
      }; // Set background color

      backgroundColor = null;
      ref1 = intersection.backgroundColorConditions || [];

      for (i = m = 0, len2 = ref1.length; m < len2; i = ++m) {
        backgroundColorCondition = ref1[i];

        if (entry != null ? entry["bcc".concat(i)] : void 0) {
          backgroundColor = backgroundColorCondition.color;
        }
      }

      if (!backgroundColor && intersection.backgroundColorAxis && (entry != null ? entry.bc : void 0) != null) {
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
    } // Determine summarize value for unconfigured cells

  }, {
    key: "setupSummarize",
    value: function setupSummarize(design, layout) {
      var cell, columnIndex, j, ref, results1, rowIndex;
      results1 = [];

      for (columnIndex = j = 0, ref = layout.rows[0].cells.length; 0 <= ref ? j < ref : j > ref; columnIndex = 0 <= ref ? ++j : --j) {
        results1.push(function () {
          var l, ref1, results2;
          results2 = [];

          for (rowIndex = l = 0, ref1 = layout.rows.length; 0 <= ref1 ? l < ref1 : l > ref1; rowIndex = 0 <= ref1 ? ++l : --l) {
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
        }());
      }

      return results1;
    } // Determine borders, mutating cells

  }, {
    key: "setupBorders",
    value: function setupBorders(layout) {
      var borderBottoms, borderLefts, borderRights, borderTops, cell, columnIndex, j, l, m, n, o, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref3, ref4, ref5, ref6, ref7, ref8, ref9, results1, rowIndex; // Set up borders for row and column cells

      borderTops = []; // Array of border top information for intersections. index is layout row number

      borderBottoms = []; // Array of border bottom information for intersections. index is layout row number

      borderLefts = []; // Array of border left information for intersections. index is layout column number

      borderRights = []; // Array of border right information for intersections. index is layout column number

      for (columnIndex = j = 0, ref = layout.rows[0].cells.length; 0 <= ref ? j < ref : j > ref; columnIndex = 0 <= ref ? ++j : --j) {
        for (rowIndex = l = 0, ref1 = layout.rows.length; 0 <= ref1 ? l < ref1 : l > ref1; rowIndex = 0 <= ref1 ? ++l : --l) {
          cell = layout.rows[rowIndex].cells[columnIndex];

          if (cell.type === "row") {
            // Rows have always left and right = 2
            cell.borderLeft = 2;
            cell.borderRight = 2; // Top is from segment (default 2) if section left, otherwise from segment (default 1). 

            if (cell.sectionTop) {
              if (((ref2 = cell.segment) != null ? ref2.borderBefore : void 0) != null) {
                cell.borderTop = (ref3 = cell.segment) != null ? ref3.borderBefore : void 0;
              } else {
                cell.borderTop = 2;
              } // Only border within if changed value (TODO: uses text right now)

            } else if (rowIndex > 0 && layout.rows[rowIndex - 1].cells[columnIndex].text !== cell.text) {
              if (((ref4 = cell.segment) != null ? ref4.borderWithin : void 0) != null) {
                cell.borderTop = (ref5 = cell.segment) != null ? ref5.borderWithin : void 0;
              } else {
                cell.borderTop = 1;
              }
            } else {
              cell.borderTop = 0;
            } // Bottom is from segment (default 2) if section right, otherwise from segment (default 1)


            if (cell.sectionBottom) {
              if (((ref6 = cell.segment) != null ? ref6.borderAfter : void 0) != null) {
                cell.borderBottom = (ref7 = cell.segment) != null ? ref7.borderAfter : void 0;
              } else {
                cell.borderBottom = 2;
              } // Only border within if changed value (TODO: uses text right now)

            } else if (rowIndex < layout.rows.length - 1 && layout.rows[rowIndex + 1].cells[columnIndex].text !== cell.text) {
              if (((ref8 = cell.segment) != null ? ref8.borderWithin : void 0) != null) {
                cell.borderBottom = (ref9 = cell.segment) != null ? ref9.borderWithin : void 0;
              } else {
                cell.borderBottom = 1;
              }
            } else {
              cell.borderBottom = 0;
            } // Save for intersections


            borderTops[rowIndex] = Math.max(borderTops[rowIndex] || 0, cell.borderTop);
            borderBottoms[rowIndex] = Math.max(borderBottoms[rowIndex] || 0, cell.borderBottom);
          } // Columns have always top and bottom = 2


          if (cell.type === "column") {
            cell.borderTop = 2;
            cell.borderBottom = 2; // Left is from segment (default 2) if section left, otherwise from segment (default 1). 
            // TODO for nested segments, within is zero if data did not change

            if (cell.sectionLeft) {
              if (((ref10 = cell.segment) != null ? ref10.borderBefore : void 0) != null) {
                cell.borderLeft = (ref11 = cell.segment) != null ? ref11.borderBefore : void 0;
              } else {
                cell.borderLeft = 2;
              } // Only border within if changed value (TODO: uses text right now)

            } else if (columnIndex > 0 && layout.rows[rowIndex].cells[columnIndex - 1].text !== cell.text) {
              if (((ref12 = cell.segment) != null ? ref12.borderWithin : void 0) != null) {
                cell.borderLeft = (ref13 = cell.segment) != null ? ref13.borderWithin : void 0;
              } else {
                cell.borderLeft = 1;
              }
            } else {
              cell.borderLeft = 0;
            } // Right is from segment (default 2) if section right, otherwise from segment (default 1)


            if (cell.sectionRight) {
              if (((ref14 = cell.segment) != null ? ref14.borderAfter : void 0) != null) {
                cell.borderRight = (ref15 = cell.segment) != null ? ref15.borderAfter : void 0;
              } else {
                cell.borderRight = 2;
              } // Only border within if changed value (TODO: uses text right now)

            } else if (columnIndex < layout.rows[rowIndex].cells.length - 1 && layout.rows[rowIndex].cells[columnIndex + 1].text !== cell.text) {
              if (((ref16 = cell.segment) != null ? ref16.borderWithin : void 0) != null) {
                cell.borderRight = (ref17 = cell.segment) != null ? ref17.borderWithin : void 0;
              } else {
                cell.borderRight = 1;
              }
            } else {
              cell.borderRight = 0;
            } // Save for intersections, keeping heaviest


            borderLefts[columnIndex] = Math.max(borderLefts[columnIndex] || 0, cell.borderLeft);
            borderRights[columnIndex] = Math.max(borderRights[columnIndex] || 0, cell.borderRight);
          }
        }
      } // Propagate borders across row cells and down column cells so that heavier border win


      for (columnIndex = m = 1, ref18 = layout.rows[0].cells.length; 1 <= ref18 ? m < ref18 : m > ref18; columnIndex = 1 <= ref18 ? ++m : --m) {
        for (rowIndex = n = 1, ref19 = layout.rows.length; 1 <= ref19 ? n < ref19 : n > ref19; rowIndex = 1 <= ref19 ? ++n : --n) {
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
      } // Setup borders of intersections


      results1 = [];

      for (columnIndex = o = 0, ref20 = layout.rows[0].cells.length; 0 <= ref20 ? o < ref20 : o > ref20; columnIndex = 0 <= ref20 ? ++o : --o) {
        results1.push(function () {
          var p, ref21, results2;
          results2 = [];

          for (rowIndex = p = 0, ref21 = layout.rows.length; 0 <= ref21 ? p < ref21 : p > ref21; rowIndex = 0 <= ref21 ? ++p : --p) {
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
        }());
      }

      return results1;
    } // Get rows or columns in format of array of
    // [{ segment:, label:, value:  }, ...] 
    // For segments with no children, there will be an array of single value array entries (array of array)
    // data is lookup of query results by intersection id
    // parentSegments are ancestry of current segment, starting with root

  }, {
    key: "getRowsOrColumns",
    value: function getRowsOrColumns(isRow, segment, data, locale) {
      var parentSegments = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
      var parentValues = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];
      var allValues, categories, category, childResult, childResults, childSegment, index, intersectionData, intersectionId, j, l, len, len1, len2, len3, m, n, orderIndex, ref, ref1, relevantData, results, segIds, value; // If no axis, categories are just null

      if (!segment.valueAxis) {
        categories = [{
          value: null,
          label: segment.label
        }];
      } else {
        // Find all values (needed for category finding of axis)
        allValues = []; // To find all values, first need all intersections that are relevant

        for (intersectionId in data) {
          intersectionData = data[intersectionId]; // Ignore non-intersection data (header + footer)

          if (!intersectionId.match(":")) {
            continue;
          } // Get segment ids


          if (isRow) {
            segIds = intersectionId.split(":")[0].split(",");
          } else {
            segIds = intersectionId.split(":")[1].split(",");
          } // Ensure that matches any parent segments passed in plus self


          if (!_.isEqual(_.take(segIds, parentSegments.length + 1), _.pluck(parentSegments, "id").concat(segment.id))) {
            continue;
          } // Only take data that matches any parent values


          relevantData = _.filter(intersectionData, function (dataRow) {
            var i, j, len, parentValue;

            for (i = j = 0, len = parentValues.length; j < len; i = ++j) {
              parentValue = parentValues[i];

              if (isRow) {
                if (dataRow["r".concat(i)] !== parentValue) {
                  return false;
                }
              } else {
                if (dataRow["c".concat(i)] !== parentValue) {
                  return false;
                }
              }
            }

            return true;
          });

          if (isRow) {
            allValues = allValues.concat(_.pluck(relevantData, "r".concat(parentSegments.length)));
          } else {
            allValues = allValues.concat(_.pluck(relevantData, "c".concat(parentSegments.length)));
          }
        } // Get categories


        categories = this.axisBuilder.getCategories(segment.valueAxis, allValues, locale); // Filter excluded values

        categories = _.filter(categories, function (category) {
          var ref;
          return ref = category.value, indexOf.call(segment.valueAxis.excludedValues || [], ref) < 0;
        }); // Always have placeholder category

        if (categories.length === 0) {
          categories = [{
            value: null,
            label: null
          }];
        } // Sort categories if segment is sorted


        if (segment.orderExpr) {
          // Index the ordering by the JSON.stringify to make it O(n)
          orderIndex = {};
          ref = _.pluck(data[segment.id], "value");

          for (index = j = 0, len = ref.length; j < len; index = ++j) {
            value = ref[index];
            orderIndex[JSON.stringify(value)] = index;
          } // Sort the categories


          categories = _.sortBy(categories, function (category) {
            return orderIndex[JSON.stringify(category.value)];
          });
        }
      } // If no children segments, return 


      if (!segment.children || segment.children.length === 0) {
        return _.map(categories, function (category) {
          return [{
            segment: segment,
            value: category.value,
            label: category.label
          }];
        });
      } // For each category, get children and combine into results


      results = [];

      for (l = 0, len1 = categories.length; l < len1; l++) {
        category = categories[l];
        ref1 = segment.children;

        for (m = 0, len2 = ref1.length; m < len2; m++) {
          childSegment = ref1[m]; // Get child results

          childResults = this.getRowsOrColumns(isRow, childSegment, data, locale, parentSegments.concat([segment]), parentValues.concat([category.value]));

          for (n = 0, len3 = childResults.length; n < len3; n++) {
            childResult = childResults[n];
            results.push([{
              segment: segment,
              value: category.value,
              label: category.label
            }].concat(childResult));
          }
        }
      }

      return results;
    }
  }]);
  return PivotChartLayoutBuilder;
}();