"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
const color_1 = __importDefault(require("color"));
const PivotChartUtils = __importStar(require("./PivotChartUtils"));
const canonical_json_1 = __importDefault(require("canonical-json"));
const maxRows = 500;
const maxColumns = 50;
// Builds pivot table layout from the design and data
// See PivotChart Design.md for more detauls
class PivotChartLayoutBuilder {
    // Pass in schema
    constructor(options) {
        this.schema = options.schema;
        this.exprUtils = new mwater_expressions_1.ExprUtils(this.schema);
        this.axisBuilder = new AxisBuilder_1.default({ schema: this.schema });
    }
    buildLayout(design, data, locale) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20;
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
        const rowsDepth = lodash_1.default.max(lodash_1.default.map(rows, (row) => row.length));
        const columnsDepth = lodash_1.default.max(lodash_1.default.map(columns, (column) => column.length));
        // Create indexed data (index each intersection's array by canonical json of rX and cX)
        const dataIndexed = lodash_1.default.mapValues(data, (list) => lodash_1.default.zipObject(lodash_1.default.map(list, (row) => [(0, canonical_json_1.default)(lodash_1.default.pick(row, (v, k) => k.match(/^[rc]\d$/))), row])));
        // Emit column headers, leaving blank space at left for row headers
        for (depth = 0, end = columnsDepth, asc = 0 <= end; asc ? depth < end : depth > end; asc ? depth++ : depth--) {
            // If any segment has label and axis, add a special row of just labels
            var asc2, end2;
            if (lodash_1.default.any(columns, (column) => column[depth] && column[depth].segment.label && column[depth].segment.valueAxis)) {
                var asc1, end1;
                cells = [];
                for (i = 1, end1 = rowsDepth, asc1 = 1 <= end1; asc1 ? i <= end1 : i >= end1; asc1 ? i++ : i--) {
                    cells.push({ type: "blank", text: null });
                }
                for (column of columns) {
                    cells.push({
                        type: "column",
                        subtype: "valueLabel",
                        segment: (_a = column[depth]) === null || _a === void 0 ? void 0 : _a.segment,
                        section: (_b = column[depth]) === null || _b === void 0 ? void 0 : _b.segment.id,
                        text: (_c = column[depth]) === null || _c === void 0 ? void 0 : _c.segment.label,
                        align: "center",
                        // Unconfigured if segment has no label or value
                        unconfigured: ((_d = column[depth]) === null || _d === void 0 ? void 0 : _d.segment) && ((_e = column[depth]) === null || _e === void 0 ? void 0 : _e.segment.label) == null && !((_f = column[depth]) === null || _f === void 0 ? void 0 : _f.segment.valueAxis),
                        bold: ((_g = column[depth]) === null || _g === void 0 ? void 0 : _g.segment.bold) || ((_h = column[depth]) === null || _h === void 0 ? void 0 : _h.segment.valueLabelBold),
                        italic: (_j = column[depth]) === null || _j === void 0 ? void 0 : _j.segment.italic
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
                    subtype: ((_l = (_k = column[depth]) === null || _k === void 0 ? void 0 : _k.segment) === null || _l === void 0 ? void 0 : _l.valueAxis) ? "value" : "label",
                    segment: (_m = column[depth]) === null || _m === void 0 ? void 0 : _m.segment,
                    section: (_o = column[depth]) === null || _o === void 0 ? void 0 : _o.segment.id,
                    text: (_p = column[depth]) === null || _p === void 0 ? void 0 : _p.label,
                    align: "center",
                    // Unconfigured if segment has no label or value
                    unconfigured: ((_q = column[depth]) === null || _q === void 0 ? void 0 : _q.segment) && ((_r = column[depth]) === null || _r === void 0 ? void 0 : _r.segment.label) == null && !((_s = column[depth]) === null || _s === void 0 ? void 0 : _s.segment.valueAxis),
                    bold: (_t = column[depth]) === null || _t === void 0 ? void 0 : _t.segment.bold,
                    italic: (_u = column[depth]) === null || _u === void 0 ? void 0 : _u.segment.italic
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
                if (row[depth] &&
                    rowSegments[depth] !== row[depth].segment &&
                    row[depth].segment.label &&
                    row[depth].segment.valueAxis) {
                    needsSpecialRowHeader.push(true);
                }
                else {
                    needsSpecialRowHeader.push(false);
                }
            }
            if (lodash_1.default.any(needsSpecialRowHeader)) {
                var asc4, end4;
                cells = [];
                for (depth = 0, end4 = rowsDepth, asc4 = 0 <= end4; asc4 ? depth < end4 : depth > end4; asc4 ? depth++ : depth--) {
                    if (needsSpecialRowHeader[depth]) {
                        cells.push({
                            type: "row",
                            subtype: "valueLabel",
                            segment: (_v = row[depth]) === null || _v === void 0 ? void 0 : _v.segment,
                            section: (_w = row[depth]) === null || _w === void 0 ? void 0 : _w.segment.id,
                            text: row[depth].segment.label,
                            bold: ((_x = row[depth]) === null || _x === void 0 ? void 0 : _x.segment.bold) || ((_y = row[depth]) === null || _y === void 0 ? void 0 : _y.segment.valueLabelBold),
                            italic: (_z = row[depth]) === null || _z === void 0 ? void 0 : _z.segment.italic
                        });
                    }
                    else {
                        cells.push({
                            type: "row",
                            subtype: "label",
                            segment: (_0 = row[depth]) === null || _0 === void 0 ? void 0 : _0.segment,
                            section: (_1 = row[depth]) === null || _1 === void 0 ? void 0 : _1.segment.id,
                            text: null,
                            // Unconfigured if segment has no label or value
                            unconfigured: ((_2 = row[depth]) === null || _2 === void 0 ? void 0 : _2.segment) && ((_3 = row[depth]) === null || _3 === void 0 ? void 0 : _3.segment.label) == null && !((_4 = row[depth]) === null || _4 === void 0 ? void 0 : _4.segment.valueAxis),
                            bold: (_5 = row[depth]) === null || _5 === void 0 ? void 0 : _5.segment.bold,
                            italic: (_6 = row[depth]) === null || _6 === void 0 ? void 0 : _6.segment.italic
                        });
                    }
                }
                // Add intersection columns
                for (column of columns) {
                    // Get intersection id
                    const intersectionId = PivotChartUtils.getIntersectionId(lodash_1.default.map(row, (r) => r.segment), lodash_1.default.map(column, (c) => c.segment));
                    cells.push({
                        type: "intersection",
                        subtype: "filler",
                        section: intersectionId,
                        text: null,
                        backgroundColor: lodash_1.default.reduce(row, (total, r) => { var _a; return total || ((_a = r.segment) === null || _a === void 0 ? void 0 : _a.fillerColor) || null; }, null)
                    });
                }
                layout.rows.push({ cells });
            }
            // Reset row segments
            rowSegments = lodash_1.default.pluck(row, "segment");
            // Emit normal row headers
            cells = [];
            for (depth = 0, end5 = rowsDepth, asc5 = 0 <= end5; asc5 ? depth < end5 : depth > end5; asc5 ? depth++ : depth--) {
                cells.push({
                    type: "row",
                    subtype: ((_8 = (_7 = row[depth]) === null || _7 === void 0 ? void 0 : _7.segment) === null || _8 === void 0 ? void 0 : _8.valueAxis) ? "value" : "label",
                    segment: (_9 = row[depth]) === null || _9 === void 0 ? void 0 : _9.segment,
                    section: (_10 = row[depth]) === null || _10 === void 0 ? void 0 : _10.segment.id,
                    text: (_11 = row[depth]) === null || _11 === void 0 ? void 0 : _11.label,
                    // Unconfigured if segment has no label or value
                    unconfigured: ((_12 = row[depth]) === null || _12 === void 0 ? void 0 : _12.segment) && ((_13 = row[depth]) === null || _13 === void 0 ? void 0 : _13.segment.label) == null && !((_14 = row[depth]) === null || _14 === void 0 ? void 0 : _14.segment.valueAxis),
                    bold: (_15 = row[depth]) === null || _15 === void 0 ? void 0 : _15.segment.bold,
                    italic: (_16 = row[depth]) === null || _16 === void 0 ? void 0 : _16.segment.italic,
                    // Indent if has value and label
                    indent: ((_18 = (_17 = row[depth]) === null || _17 === void 0 ? void 0 : _17.segment) === null || _18 === void 0 ? void 0 : _18.valueAxis) && ((_20 = (_19 = row[depth]) === null || _19 === void 0 ? void 0 : _19.segment) === null || _20 === void 0 ? void 0 : _20.label) ? 1 : undefined
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
                cell.sectionTop =
                    cell.section != null &&
                        (rowIndex === 0 || layout.rows[rowIndex - 1].cells[columnIndex].section !== cell.section);
                cell.sectionLeft =
                    cell.section != null &&
                        (columnIndex === 0 || layout.rows[rowIndex].cells[columnIndex - 1].section !== cell.section);
                cell.sectionRight =
                    cell.section != null &&
                        (columnIndex >= layout.rows[0].cells.length - 1 ||
                            layout.rows[rowIndex].cells[columnIndex + 1].section !== cell.section);
                cell.sectionBottom =
                    cell.section != null &&
                        (rowIndex >= layout.rows.length - 1 || layout.rows[rowIndex + 1].cells[columnIndex].section !== cell.section);
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
                if (cell.type === "column" &&
                    cell.text === refCell.text &&
                    cell.type === refCell.type &&
                    cell.section === refCell.section) {
                    cell.skip = true;
                    refCell.columnSpan = (refCell.columnSpan || 1) + 1;
                    refCell.sectionRight = true;
                    refCell.borderRight = cell.borderRight;
                }
                else {
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
                if (cell.type === "intersection" &&
                    cell.subtype === "filler" &&
                    cell.type === refCell.type &&
                    cell.subtype === refCell.subtype) {
                    cell.skip = true;
                    refCell.columnSpan = (refCell.columnSpan || 1) + 1;
                    refCell.sectionRight = true;
                    refCell.borderRight = cell.borderRight;
                }
                else {
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
                if (cell.type === "row" &&
                    cell.text === refCell.text &&
                    cell.type === refCell.type &&
                    cell.section === refCell.section) {
                    cell.skip = true;
                    refCell.rowSpan = (refCell.rowSpan || 1) + 1;
                    refCell.sectionBottom = true;
                    refCell.borderBottom = cell.borderBottom;
                }
                else {
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
                if (cell.type === "column" &&
                    cell.text === refCell.text &&
                    cell.type === refCell.type &&
                    cell.section === refCell.section) {
                    cell.skip = true;
                    refCell.rowSpan = (refCell.rowSpan || 1) + 1;
                    refCell.sectionBottom = true;
                    refCell.borderBottom = cell.borderBottom;
                }
                else {
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
        var _a;
        // Get intersection id
        let i, part, text;
        const intersectionId = PivotChartUtils.getIntersectionId(lodash_1.default.map(row, (r) => r.segment), lodash_1.default.map(column, (c) => c.segment));
        // Lookup intersection
        const intersection = design.intersections[intersectionId];
        if (!intersection) {
            // Should not happen
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
        const entry = intersectionData === null || intersectionData === void 0 ? void 0 : intersectionData[(0, canonical_json_1.default)(key)];
        const value = entry === null || entry === void 0 ? void 0 : entry.value;
        // Format using axis builder if present. Blank otherwise
        if (value != null) {
            text = this.axisBuilder.formatValue(intersection.valueAxis, value, locale);
        }
        else {
            text = ((_a = intersection.valueAxis) === null || _a === void 0 ? void 0 : _a.nullLabel) || null;
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
            if (entry === null || entry === void 0 ? void 0 : entry[`bcc${i}`]) {
                backgroundColor = backgroundColorCondition.color;
            }
        }
        if (!backgroundColor && intersection.backgroundColorAxis && (entry === null || entry === void 0 ? void 0 : entry.bc) != null) {
            backgroundColor = this.axisBuilder.getValueColor(intersection.backgroundColorAxis, entry === null || entry === void 0 ? void 0 : entry.bc);
        }
        if (!backgroundColor && intersection.backgroundColor && !intersection.colorAxis) {
            ;
            ({ backgroundColor } = intersection);
        }
        if (backgroundColor) {
            backgroundColor = (0, color_1.default)(backgroundColor).alpha(intersection.backgroundColorOpacity).string();
            cell.backgroundColor = backgroundColor;
        }
        return cell;
    }
    // Determine summarize value for unconfigured cells
    setupSummarize(design, layout) {
        return __range__(0, layout.rows[0].cells.length, false).map((columnIndex) => (() => {
            const result = [];
            for (let rowIndex = 0, end = layout.rows.length, asc = 0 <= end; asc ? rowIndex < end : rowIndex > end; asc ? rowIndex++ : rowIndex--) {
                const cell = layout.rows[rowIndex].cells[columnIndex];
                if (cell.unconfigured && cell.type === "row") {
                    cell.summarize = PivotChartUtils.canSummarizeSegment(design.rows, cell.section);
                }
                if (cell.unconfigured && cell.type === "column") {
                    result.push((cell.summarize = PivotChartUtils.canSummarizeSegment(design.columns, cell.section)));
                }
                else {
                    result.push(undefined);
                }
            }
            return result;
        })());
    }
    // Determine borders, mutating cells
    setupBorders(layout) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
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
                        if (((_a = cell.segment) === null || _a === void 0 ? void 0 : _a.borderBefore) != null) {
                            cell.borderTop = (_b = cell.segment) === null || _b === void 0 ? void 0 : _b.borderBefore;
                        }
                        else {
                            cell.borderTop = 2;
                        }
                        // Only border within if changed value (TODO: uses text right now)
                    }
                    else if (rowIndex > 0 && layout.rows[rowIndex - 1].cells[columnIndex].text !== cell.text) {
                        if (((_c = cell.segment) === null || _c === void 0 ? void 0 : _c.borderWithin) != null) {
                            cell.borderTop = (_d = cell.segment) === null || _d === void 0 ? void 0 : _d.borderWithin;
                        }
                        else {
                            cell.borderTop = 1;
                        }
                    }
                    else {
                        cell.borderTop = 0;
                    }
                    // Bottom is from segment (default 2) if section right, otherwise from segment (default 1)
                    if (cell.sectionBottom) {
                        if (((_e = cell.segment) === null || _e === void 0 ? void 0 : _e.borderAfter) != null) {
                            cell.borderBottom = (_f = cell.segment) === null || _f === void 0 ? void 0 : _f.borderAfter;
                        }
                        else {
                            cell.borderBottom = 2;
                        }
                        // Only border within if changed value (TODO: uses text right now)
                    }
                    else if (rowIndex < layout.rows.length - 1 &&
                        layout.rows[rowIndex + 1].cells[columnIndex].text !== cell.text) {
                        if (((_g = cell.segment) === null || _g === void 0 ? void 0 : _g.borderWithin) != null) {
                            cell.borderBottom = (_h = cell.segment) === null || _h === void 0 ? void 0 : _h.borderWithin;
                        }
                        else {
                            cell.borderBottom = 1;
                        }
                    }
                    else {
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
                        if (((_j = cell.segment) === null || _j === void 0 ? void 0 : _j.borderBefore) != null) {
                            cell.borderLeft = (_k = cell.segment) === null || _k === void 0 ? void 0 : _k.borderBefore;
                        }
                        else {
                            cell.borderLeft = 2;
                        }
                        // Only border within if changed value (TODO: uses text right now)
                    }
                    else if (columnIndex > 0 && layout.rows[rowIndex].cells[columnIndex - 1].text !== cell.text) {
                        if (((_l = cell.segment) === null || _l === void 0 ? void 0 : _l.borderWithin) != null) {
                            cell.borderLeft = (_m = cell.segment) === null || _m === void 0 ? void 0 : _m.borderWithin;
                        }
                        else {
                            cell.borderLeft = 1;
                        }
                    }
                    else {
                        cell.borderLeft = 0;
                    }
                    // Right is from segment (default 2) if section right, otherwise from segment (default 1)
                    if (cell.sectionRight) {
                        if (((_o = cell.segment) === null || _o === void 0 ? void 0 : _o.borderAfter) != null) {
                            cell.borderRight = (_p = cell.segment) === null || _p === void 0 ? void 0 : _p.borderAfter;
                        }
                        else {
                            cell.borderRight = 2;
                        }
                        // Only border within if changed value (TODO: uses text right now)
                    }
                    else if (columnIndex < layout.rows[rowIndex].cells.length - 1 &&
                        layout.rows[rowIndex].cells[columnIndex + 1].text !== cell.text) {
                        if (((_q = cell.segment) === null || _q === void 0 ? void 0 : _q.borderWithin) != null) {
                            cell.borderRight = (_r = cell.segment) === null || _r === void 0 ? void 0 : _r.borderWithin;
                        }
                        else {
                            cell.borderRight = 1;
                        }
                    }
                    else {
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
                            result1.push((cell.borderBottom = borderBottoms[rowIndex]));
                        }
                        else {
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
        }
        else {
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
                }
                else {
                    segIds = intersectionId.split(":")[1].split(",");
                }
                // Ensure that matches any parent segments passed in plus self
                if (!lodash_1.default.isEqual(lodash_1.default.take(segIds, parentSegments.length + 1), lodash_1.default.pluck(parentSegments, "id").concat(segment.id))) {
                    continue;
                }
                // Only take data that matches any parent values
                const relevantData = lodash_1.default.filter(intersectionData, (dataRow) => {
                    for (let i = 0; i < parentValues.length; i++) {
                        const parentValue = parentValues[i];
                        if (isRow) {
                            if (dataRow[`r${i}`] !== parentValue) {
                                return false;
                            }
                        }
                        else {
                            if (dataRow[`c${i}`] !== parentValue) {
                                return false;
                            }
                        }
                    }
                    return true;
                });
                if (isRow) {
                    allValues = allValues.concat(lodash_1.default.pluck(relevantData, `r${parentSegments.length}`));
                }
                else {
                    allValues = allValues.concat(lodash_1.default.pluck(relevantData, `c${parentSegments.length}`));
                }
            }
            // Get categories, mapping label
            categories = lodash_1.default.map(this.axisBuilder.getCategories(segment.valueAxis, allValues, locale), (category) => {
                return { value: category.value, label: this.axisBuilder.formatCategory(segment.valueAxis, category) };
            });
            // Filter excluded values
            categories = lodash_1.default.filter(categories, (category) => !(segment.valueAxis.excludedValues || []).includes(category.value));
            // Always have placeholder category
            if (categories.length === 0) {
                categories = [{ value: null, label: null }];
            }
            // Sort categories if segment is sorted
            if (segment.orderExpr) {
                // Index the ordering by the JSON.stringify to make it O(n)
                const orderIndex = {};
                const iterable = lodash_1.default.pluck(data[segment.id], "value");
                for (let index = 0; index < iterable.length; index++) {
                    value = iterable[index];
                    orderIndex[JSON.stringify(value)] = index;
                }
                // Sort the categories
                categories = lodash_1.default.sortBy(categories, (category) => orderIndex[JSON.stringify(category.value)]);
            }
        }
        // If no children segments, return
        if (!segment.children || segment.children.length === 0) {
            return lodash_1.default.map(categories, (category) => [{ segment, value: category.value, label: category.label }]);
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
}
exports.default = PivotChartLayoutBuilder;
function __range__(left, right, inclusive) {
    let range = [];
    let ascending = left < right;
    let end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}
