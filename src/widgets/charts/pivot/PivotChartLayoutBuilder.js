let PivotChartLayoutBuilder;
import _ from 'lodash';
import { ExprUtils } from 'mwater-expressions';
import AxisBuilder from '../../../axes/AxisBuilder';
import Color from 'color';
import PivotChartUtils from './PivotChartUtils';
import canonical from 'canonical-json';

const maxRows = 500;
const maxColumns = 50;

// Builds pivot table layout from the design and data
// See PivotChart Design.md for more detauls
export default PivotChartLayoutBuilder = class PivotChartLayoutBuilder { 
  // Pass in schema
  constructor(options) {
    this.schema = options.schema;
    this.exprUtils = new ExprUtils(this.schema);
    this.axisBuilder = new AxisBuilder({schema: this.schema});
  }

  buildLayout(design, data, locale) {
    // Create empty layout
    let cell, cells, column, columnIndex, depth, i, layoutRow, refCell, rowIndex, segment;
    let asc, end;
    let asc6, end6;
    let asc8, end8;
    let asc10, end10;
    const layout = {
      rows: [],
      striping: design.striping
    };

    // Get all columns
    let columns = [];
    for (segment of design.columns) {
      columns = columns.concat(this.getRowsOrColumns(false, segment, data, locale));
    }

    // Get all rows
    let rows = [];
    for (segment of design.rows) {
      rows = rows.concat(this.getRowsOrColumns(true, segment, data, locale));
    }

    // Limit rows
    if (rows.length > maxRows) {
      rows = rows.slice(0, maxRows);
      layout.tooManyRows = true;
    }

    // Limit columns
    if (columns.length > maxColumns) {
      columns = columns.slice(0, maxColumns);
      layout.tooManyColumns = true;
    }

    // Determine depth of row headers and column headers (how deeply nested segments are)
    const rowsDepth = _.max(_.map(rows, row => row.length));
    const columnsDepth = _.max(_.map(columns, column => column.length));

    // Create indexed data (index each intersection's array by canonical json of rX and cX)
    const dataIndexed = _.mapValues(data, list => _.zipObject(_.map(list, row => [canonical(_.pick(row, ((v, k) => k.match(/^[rc]\d$/)))), row])));

    // Emit column headers, leaving blank space at left for row headers
    for (depth = 0, end = columnsDepth, asc = 0 <= end; asc ? depth < end : depth > end; asc ? depth++ : depth--) {
      // If any segment has label and axis, add a special row of just labels
      var asc2, end2;
      if (_.any(columns, column => column[depth] && column[depth].segment.label && column[depth].segment.valueAxis)) {
        var asc1, end1;
        cells = [];
        for (i = 1, end1 = rowsDepth, asc1 = 1 <= end1; asc1 ? i <= end1 : i >= end1; asc1 ? i++ : i--) {
          cells.push({ type: "blank", text: null });
        }
        for (column of columns) {
          cells.push({ 
            type: "column",
            subtype: "valueLabel",
            segment: column[depth]?.segment,
            section: column[depth]?.segment.id,
            text: column[depth]?.segment.label,
            align: "center", 
            // Unconfigured if segment has no label or value
            unconfigured: column[depth]?.segment && (column[depth]?.segment.label == null) && !column[depth]?.segment.valueAxis,
            bold: column[depth]?.segment.bold || column[depth]?.segment.valueLabelBold, 
            italic: column[depth]?.segment.italic
          });
        }
        layout.rows.push({ cells });
      }
    
      // Emit column labels
      cells = [];
      for (i = 1, end2 = rowsDepth, asc2 = 1 <= end2; asc2 ? i <= end2 : i >= end2; asc2 ? i++ : i--) {
        cells.push({ type: "blank", text: null });
      }
      for (column of columns) {
        cells.push({ 
          type: "column",
          subtype: column[depth]?.segment?.valueAxis ? "value" : "label",
          segment: column[depth]?.segment,
          section: column[depth]?.segment.id,
          text: column[depth]?.label,
          align: "center",
          // Unconfigured if segment has no label or value
          unconfigured: column[depth]?.segment && (column[depth]?.segment.label == null) && !column[depth]?.segment.valueAxis,
          bold: column[depth]?.segment.bold,
          italic: column[depth]?.segment.italic
        });
      }

      layout.rows.push({ cells });
    }

    // Emit main section
    // Keep track of current row segment, so we can re-emit headers for row segments that have both axis and label
    let rowSegments = [];
    for (let row of rows) {
      // Emit special row header for any segments that have changed and have both axis and label
      var asc3, end3;
      var asc5, end5;
      const needsSpecialRowHeader = [];
      for (depth = 0, end3 = rowsDepth, asc3 = 0 <= end3; asc3 ? depth < end3 : depth > end3; asc3 ? depth++ : depth--) {
        if (row[depth] && (rowSegments[depth] !== row[depth].segment) && row[depth].segment.label && row[depth].segment.valueAxis) {
          needsSpecialRowHeader.push(true);
        } else {
          needsSpecialRowHeader.push(false);
        }
      }

      if (_.any(needsSpecialRowHeader)) {
        var asc4, end4;
        cells = [];
        for (depth = 0, end4 = rowsDepth, asc4 = 0 <= end4; asc4 ? depth < end4 : depth > end4; asc4 ? depth++ : depth--) {
          if (needsSpecialRowHeader[depth]) {
            cells.push({ 
              type: "row",
              subtype: "valueLabel",
              segment: row[depth]?.segment,
              section: row[depth]?.segment.id,
              text: row[depth].segment.label, 
              bold: row[depth]?.segment.bold || row[depth]?.segment.valueLabelBold, 
              italic: row[depth]?.segment.italic
            });
          } else {
            cells.push({ 
              type: "row",
              subtype: "label",
              segment: row[depth]?.segment,
              section: row[depth]?.segment.id,
              text: null, 
              // Unconfigured if segment has no label or value
              unconfigured: row[depth]?.segment && (row[depth]?.segment.label == null) && !row[depth]?.segment.valueAxis,
              bold: row[depth]?.segment.bold,
              italic: row[depth]?.segment.italic
            });
          }
        }

        // Add intersection columns
        for (column of columns) {
          // Get intersection id
          const intersectionId = PivotChartUtils.getIntersectionId(_.map(row, r => r.segment), _.map(column, c => c.segment));

          cells.push({ 
            type: "intersection",
            subtype: "filler",
            section: intersectionId,
            text: null,
            backgroundColor: _.reduce(row, ((total, r) => total || r.segment?.fillerColor || null), null) 
          });
        }

        layout.rows.push({ cells });
      }

      // Reset row segments
      rowSegments = _.pluck(row, "segment");
          
      // Emit normal row headers
      cells = [];
      for (depth = 0, end5 = rowsDepth, asc5 = 0 <= end5; asc5 ? depth < end5 : depth > end5; asc5 ? depth++ : depth--) {
        cells.push({ 
          type: "row",
          subtype: row[depth]?.segment?.valueAxis ? "value" : "label",
          segment: row[depth]?.segment,
          section: row[depth]?.segment.id,
          text: row[depth]?.label, 
          // Unconfigured if segment has no label or value
          unconfigured: row[depth]?.segment && (row[depth]?.segment.label == null) && !row[depth]?.segment.valueAxis,
          bold: row[depth]?.segment.bold,
          italic: row[depth]?.segment.italic,
          // Indent if has value and label
          indent: row[depth]?.segment?.valueAxis && row[depth]?.segment?.label ? 1 : undefined
        });
      }

      // Emit contents
      for (column of columns) {
        cells.push(this.buildIntersectionCell(design, dataIndexed, locale, row, column));
      }

      layout.rows.push({ cells });
    }

    // Set up section top/left/bottom/right info
    for (columnIndex = 0, end6 = layout.rows[0].cells.length, asc6 = 0 <= end6; asc6 ? columnIndex < end6 : columnIndex > end6; asc6 ? columnIndex++ : columnIndex--) {
      var asc7, end7;
      for (rowIndex = 0, end7 = layout.rows.length, asc7 = 0 <= end7; asc7 ? rowIndex < end7 : rowIndex > end7; asc7 ? rowIndex++ : rowIndex--) {
        cell = layout.rows[rowIndex].cells[columnIndex];

        cell.sectionTop = (cell.section != null) && ((rowIndex === 0) || (layout.rows[rowIndex - 1].cells[columnIndex].section !== cell.section)); 
        cell.sectionLeft = (cell.section != null) && ((columnIndex === 0) || (layout.rows[rowIndex].cells[columnIndex - 1].section !== cell.section)); 
        cell.sectionRight = (cell.section != null) && ((columnIndex >= (layout.rows[0].cells.length - 1)) || (layout.rows[rowIndex].cells[columnIndex + 1].section !== cell.section));
        cell.sectionBottom = (cell.section != null) && ((rowIndex >= (layout.rows.length - 1)) || (layout.rows[rowIndex + 1].cells[columnIndex].section !== cell.section));
      }
    }

    this.setupSummarize(design, layout);
    this.setupBorders(layout);

    // Span column headers and column segments that have same segment and value (TODO: uses text right now)
    for (layoutRow of layout.rows) {
      refCell = null;
      for (i = 0; i < layoutRow.cells.length; i++) {
        cell = layoutRow.cells[i];
        if (i === 0) {
          refCell = cell;
          continue;
        }

        // If matches, span columns
        if ((cell.type === 'column') && (cell.text === refCell.text) && (cell.type === refCell.type) && (cell.section === refCell.section)) {
          cell.skip = true;
          refCell.columnSpan = (refCell.columnSpan || 1) + 1;
          refCell.sectionRight = true;
          refCell.borderRight = cell.borderRight;
        } else {
          refCell = cell;
        }
      }
    }

    // Span intersections that are fillers
    for (layoutRow of layout.rows) {
      refCell = null;
      for (i = 0; i < layoutRow.cells.length; i++) {
        cell = layoutRow.cells[i];
        if (i === 0) {
          refCell = cell;
          continue;
        }

        // If matches, span columns
        if ((cell.type === 'intersection') && (cell.subtype === "filler") && (cell.type === refCell.type) && (cell.subtype === refCell.subtype)) {
          cell.skip = true;
          refCell.columnSpan = (refCell.columnSpan || 1) + 1;
          refCell.sectionRight = true;
          refCell.borderRight = cell.borderRight;
        } else {
          refCell = cell;
        }
      }
    }

    // Span row headers and row segments that have same segment and value (TODO: uses text right now)
    for (columnIndex = 0, end8 = layout.rows[0].cells.length, asc8 = 0 <= end8; asc8 ? columnIndex < end8 : columnIndex > end8; asc8 ? columnIndex++ : columnIndex--) {
      var asc9, end9;
      refCell = null;
      for (rowIndex = 0, end9 = layout.rows.length, asc9 = 0 <= end9; asc9 ? rowIndex < end9 : rowIndex > end9; asc9 ? rowIndex++ : rowIndex--) {
        cell = layout.rows[rowIndex].cells[columnIndex];

        if (rowIndex === 0) {
          refCell = cell;
          continue;
        }

        // If matches, span rows
        if ((cell.type === 'row') && (cell.text === refCell.text) && (cell.type === refCell.type) && (cell.section === refCell.section)) {
          cell.skip = true;
          refCell.rowSpan = (refCell.rowSpan || 1) + 1;
          refCell.sectionBottom = true;
          refCell.borderBottom = cell.borderBottom;
        } else {
          refCell = cell;
        }
      }
    }

    // Span column headers that have the same segment and value (TODO: uses text right now)
    for (columnIndex = 0, end10 = layout.rows[0].cells.length, asc10 = 0 <= end10; asc10 ? columnIndex < end10 : columnIndex > end10; asc10 ? columnIndex++ : columnIndex--) {
      var asc11, end11;
      refCell = null;
      for (rowIndex = 0, end11 = layout.rows.length, asc11 = 0 <= end11; asc11 ? rowIndex < end11 : rowIndex > end11; asc11 ? rowIndex++ : rowIndex--) {
        cell = layout.rows[rowIndex].cells[columnIndex];

        if (rowIndex === 0) {
          refCell = cell;
          continue;
        }

        // If matches, span rows
        if ((cell.type === 'column') && (cell.text === refCell.text) && (cell.type === refCell.type) && (cell.section === refCell.section)) {
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
  }

  // Build a cell which is the intersection of a row and column, where row and column are nested arrays
  // from getRowsOrColumns
  // dataIndexed is created above. See there for format
  buildIntersectionCell(design, dataIndexed, locale, row, column) {
    // Get intersection id
    let i, part, text;
    const intersectionId = PivotChartUtils.getIntersectionId(_.map(row, r => r.segment), _.map(column, c => c.segment));

    // Lookup intersection 
    const intersection = design.intersections[intersectionId];
    if (!intersection) { // Should not happen
      return { type: "blank", text: null };
    }
    
    // Lookup data
    const intersectionData = dataIndexed[intersectionId];

    // Create key to lookup value
    const key = {};
    for (i = 0; i < row.length; i++) {
      part = row[i];
      key[`r${i}`] = part.value;
    }
    for (i = 0; i < column.length; i++) {
      part = column[i];
      key[`c${i}`] = part.value;
    }

    // Lookup value by finding an entry which matches all of the row and column values
    const entry = intersectionData?.[canonical(key)];
    const value = entry?.value;

    // Format using axis builder if present. Blank otherwise
    if (value != null) {
      text = this.axisBuilder.formatValue(intersection.valueAxis, value, locale);
    } else {
      text = intersection.valueAxis?.nullLabel || null;
    }

    const cell = { 
      type: "intersection",
      subtype: "value",
      section: intersectionId,
      text,
      align: "right", 
      bold: intersection.bold,
      italic: intersection.italic
    };

    // Set background color
    let backgroundColor = null;

    const iterable = intersection.backgroundColorConditions || [];
    for (i = 0; i < iterable.length; i++) {
      const backgroundColorCondition = iterable[i];
      if (entry?.[`bcc${i}`]) {
        backgroundColor = backgroundColorCondition.color;
      }
    }

    if (!backgroundColor && intersection.backgroundColorAxis && (entry?.bc != null)) {
      backgroundColor = this.axisBuilder.getValueColor(intersection.backgroundColorAxis, entry?.bc);
    }

    if (!backgroundColor && intersection.backgroundColor && !intersection.colorAxis) {
      ({
        backgroundColor
      } = intersection);
    }

    if (backgroundColor) {
      backgroundColor = Color(backgroundColor).alpha(intersection.backgroundColorOpacity).string();
      cell.backgroundColor = backgroundColor;
    }

    return cell;
  }

  // Determine summarize value for unconfigured cells
  setupSummarize(design, layout) {
    return __range__(0, layout.rows[0].cells.length, false).map((columnIndex) =>
      (() => {
        const result = [];
        for (let rowIndex = 0, end = layout.rows.length, asc = 0 <= end; asc ? rowIndex < end : rowIndex > end; asc ? rowIndex++ : rowIndex--) {
          const cell = layout.rows[rowIndex].cells[columnIndex];

          if (cell.unconfigured && (cell.type === "row")) {
            cell.summarize = PivotChartUtils.canSummarizeSegment(design.rows, cell.section);
          }

          if (cell.unconfigured && (cell.type === "column")) {
            result.push(cell.summarize = PivotChartUtils.canSummarizeSegment(design.columns, cell.section));
          } else {
            result.push(undefined);
          }
        }
        return result;
      })());
  }

  // Determine borders, mutating cells
  setupBorders(layout) {
    // Set up borders for row and column cells
    let cell, columnIndex, rowIndex;
    let asc, end;
    let asc2, end2;
    const borderTops = []; // Array of border top information for intersections. index is layout row number
    const borderBottoms = []; // Array of border bottom information for intersections. index is layout row number
    const borderLefts = []; // Array of border left information for intersections. index is layout column number
    const borderRights = []; // Array of border right information for intersections. index is layout column number

    for (columnIndex = 0, end = layout.rows[0].cells.length, asc = 0 <= end; asc ? columnIndex < end : columnIndex > end; asc ? columnIndex++ : columnIndex--) {
      var asc1, end1;
      for (rowIndex = 0, end1 = layout.rows.length, asc1 = 0 <= end1; asc1 ? rowIndex < end1 : rowIndex > end1; asc1 ? rowIndex++ : rowIndex--) {
        cell = layout.rows[rowIndex].cells[columnIndex];

        if (cell.type === "row") {
          // Rows have always left and right = 2
          cell.borderLeft = 2;
          cell.borderRight = 2;

          // Top is from segment (default 2) if section left, otherwise from segment (default 1). 
          if (cell.sectionTop) {
            if (cell.segment?.borderBefore != null) {
              cell.borderTop = cell.segment?.borderBefore;
            } else {
              cell.borderTop = 2;
            }
          // Only border within if changed value (TODO: uses text right now)
          } else if ((rowIndex > 0) && (layout.rows[rowIndex - 1].cells[columnIndex].text !== cell.text)) {
            if (cell.segment?.borderWithin != null) {
              cell.borderTop = cell.segment?.borderWithin;
            } else {
              cell.borderTop = 1;
            }
          } else {
            cell.borderTop = 0;
          }

          // Bottom is from segment (default 2) if section right, otherwise from segment (default 1)
          if (cell.sectionBottom) {
            if (cell.segment?.borderAfter != null) {
              cell.borderBottom = cell.segment?.borderAfter;
            } else {
              cell.borderBottom = 2;
            }
          // Only border within if changed value (TODO: uses text right now)
          } else if ((rowIndex < (layout.rows.length - 1)) && (layout.rows[rowIndex + 1].cells[columnIndex].text !== cell.text)) {
            if (cell.segment?.borderWithin != null) {
              cell.borderBottom = cell.segment?.borderWithin;
            } else {
              cell.borderBottom = 1;
            }
          } else {
            cell.borderBottom = 0;
          }

          // Save for intersections
          borderTops[rowIndex] = Math.max(borderTops[rowIndex] || 0, cell.borderTop);
          borderBottoms[rowIndex] = Math.max(borderBottoms[rowIndex] || 0, cell.borderBottom);
        }

        // Columns have always top and bottom = 2
        if (cell.type === "column") {
          cell.borderTop = 2;
          cell.borderBottom = 2;

          // Left is from segment (default 2) if section left, otherwise from segment (default 1). 
          // TODO for nested segments, within is zero if data did not change
          if (cell.sectionLeft) {
            if (cell.segment?.borderBefore != null) {
              cell.borderLeft = cell.segment?.borderBefore;
            } else {
              cell.borderLeft = 2;
            }
          // Only border within if changed value (TODO: uses text right now)
          } else if ((columnIndex > 0) && (layout.rows[rowIndex].cells[columnIndex - 1].text !== cell.text)) {
            if (cell.segment?.borderWithin != null) {
              cell.borderLeft = cell.segment?.borderWithin;
            } else {
              cell.borderLeft = 1;
            }
          } else {
            cell.borderLeft = 0;
          }

          // Right is from segment (default 2) if section right, otherwise from segment (default 1)
          if (cell.sectionRight) {
            if (cell.segment?.borderAfter != null) {
              cell.borderRight = cell.segment?.borderAfter;
            } else {
              cell.borderRight = 2;
            }
          // Only border within if changed value (TODO: uses text right now)
          } else if ((columnIndex < (layout.rows[rowIndex].cells.length - 1)) && (layout.rows[rowIndex].cells[columnIndex + 1].text !== cell.text)) {
            if (cell.segment?.borderWithin != null) {
              cell.borderRight = cell.segment?.borderWithin;
            } else {
              cell.borderRight = 1;
            }
          } else {
            cell.borderRight = 0;
          }

          // Save for intersections, keeping heaviest
          borderLefts[columnIndex] = Math.max(borderLefts[columnIndex] || 0, cell.borderLeft);
          borderRights[columnIndex] = Math.max(borderRights[columnIndex] || 0, cell.borderRight);
        }
      }
    }

    // Propagate borders across row cells and down column cells so that heavier border win
    for (columnIndex = 1, end2 = layout.rows[0].cells.length, asc2 = 1 <= end2; asc2 ? columnIndex < end2 : columnIndex > end2; asc2 ? columnIndex++ : columnIndex--) {
      var asc3, end3;
      for (rowIndex = 1, end3 = layout.rows.length, asc3 = 1 <= end3; asc3 ? rowIndex < end3 : rowIndex > end3; asc3 ? rowIndex++ : rowIndex--) {
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

    // Setup borders of intersections
    return (() => {
      let asc4, end4;
      const result = [];
      for (columnIndex = 0, end4 = layout.rows[0].cells.length, asc4 = 0 <= end4; asc4 ? columnIndex < end4 : columnIndex > end4; asc4 ? columnIndex++ : columnIndex--) {
        result.push((() => {
          let asc5, end5;
          const result1 = [];
          for (rowIndex = 0, end5 = layout.rows.length, asc5 = 0 <= end5; asc5 ? rowIndex < end5 : rowIndex > end5; asc5 ? rowIndex++ : rowIndex--) {
            cell = layout.rows[rowIndex].cells[columnIndex];

            if (cell.type === "intersection") {
              cell.borderLeft = borderLefts[columnIndex];
              cell.borderRight = borderRights[columnIndex];

              cell.borderTop = borderTops[rowIndex];
              result1.push(cell.borderBottom = borderBottoms[rowIndex]);
            } else {
              result1.push(undefined);
            }
          }
          return result1;
        })());
      }
      return result;
    })();
  }


  // Get rows or columns in format of array of
  // [{ segment:, label:, value:  }, ...] 
  // For segments with no children, there will be an array of single value array entries (array of array)
  // data is lookup of query results by intersection id
  // parentSegments are ancestry of current segment, starting with root
  getRowsOrColumns(isRow, segment, data, locale, parentSegments = [], parentValues = []) {
    // If no axis, categories are just null
    let categories, value;
    if (!segment.valueAxis) {
      categories = [{ value: null, label: segment.label }];
    } else {
      // Find all values (needed for category finding of axis)
      let allValues = [];

      // To find all values, first need all intersections that are relevant
      for (let intersectionId in data) {
        // Ignore non-intersection data (header + footer)
        var segIds;
        const intersectionData = data[intersectionId];
        if (!intersectionId.match(":")) {
          continue;
        }

        // Get segment ids
        if (isRow) {
          segIds = intersectionId.split(":")[0].split(",");
        } else {
          segIds = intersectionId.split(":")[1].split(",");
        }

        // Ensure that matches any parent segments passed in plus self
        if (!_.isEqual(_.take(segIds, parentSegments.length + 1), _.pluck(parentSegments, "id").concat(segment.id))) {
          continue;
        }

        // Only take data that matches any parent values
        const relevantData = _.filter(intersectionData, dataRow => {
          for (let i = 0; i < parentValues.length; i++) {
            const parentValue = parentValues[i];
            if (isRow) {
              if (dataRow[`r${i}`] !== parentValue) {
                return false;
              }
            } else {
              if (dataRow[`c${i}`] !== parentValue) {
                return false;
              }
            }
          }

          return true;
        });

        if (isRow) {
          allValues = allValues.concat(_.pluck(relevantData, `r${parentSegments.length}`));
        } else {
          allValues = allValues.concat(_.pluck(relevantData, `c${parentSegments.length}`));
        }
      }

      // Get categories, mapping label
      categories = _.map(this.axisBuilder.getCategories(segment.valueAxis, allValues, locale), category => {
        return { value: category.value, label: this.axisBuilder.formatCategory(segment.valueAxis, category) };
    });

      // Filter excluded values
      categories = _.filter(categories, category => !(segment.valueAxis.excludedValues || []).includes(category.value));

      // Always have placeholder category
      if (categories.length === 0) {
        categories = [{ value: null, label: null }];
      }

      // Sort categories if segment is sorted
      if (segment.orderExpr) {
        // Index the ordering by the JSON.stringify to make it O(n)
        const orderIndex = {};
        const iterable = _.pluck(data[segment.id], "value");
        for (let index = 0; index < iterable.length; index++) {
          value = iterable[index];
          orderIndex[JSON.stringify(value)] = index;
        }

        // Sort the categories
        categories = _.sortBy(categories, category => orderIndex[JSON.stringify(category.value)]);
      }
    }

    // If no children segments, return 
    if (!segment.children || (segment.children.length === 0)) {
      return _.map(categories, category => [{ segment, value: category.value, label: category.label }]);
    }

    // For each category, get children and combine into results
    const results = [];
    for (let category of categories) {
      for (let childSegment of segment.children) {
        // Get child results
        const childResults = this.getRowsOrColumns(isRow, childSegment, data, locale, parentSegments.concat([segment]), parentValues.concat([category.value]));

        for (let childResult of childResults) {
          results.push([{ segment, value: category.value, label: category.label }].concat(childResult));
        }
      }
    }

    return results;
  }
};

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}