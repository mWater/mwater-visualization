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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let PivotChartLayoutComponent;
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const color_1 = __importDefault(require("color"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const classnames_1 = __importDefault(require("classnames"));
// Displays a pivot chart from a layout
exports.default = PivotChartLayoutComponent = (function () {
    PivotChartLayoutComponent = class PivotChartLayoutComponent extends react_1.default.Component {
        constructor(props) {
            super(props);
            // Records the cell components. This is to be able to calculate the bounds of sections
            // to allow floating hover controls
            this.recordCellComp = (rowIndex, columnIndex, comp) => {
                const key = `${rowIndex}:${columnIndex}`;
                if (comp) {
                    return (this.cellComps[key] = comp);
                }
                else {
                    return delete this.cellComps[key];
                }
            };
            this.renderHoverPlusIcon = (key, x, y, onClick) => {
                // Render a plus box
                return R("div", {
                    key,
                    onClick,
                    style: {
                        position: "absolute",
                        left: x - 7,
                        top: y - 6,
                        border: "solid 1px #337ab7",
                        backgroundColor: "white",
                        paddingLeft: 3,
                        paddingRight: 3,
                        paddingTop: 0,
                        color: "#337ab7",
                        fontSize: 9,
                        cursor: "pointer",
                        opacity: 0.8
                    }
                }, R(ui.Icon, { id: "fa-plus" }));
            };
            this.renderHoverRemoveIcon = (key, x, y, onClick) => {
                // Render a plus box
                return R("div", {
                    key,
                    onClick,
                    style: {
                        position: "absolute",
                        left: x - 7,
                        top: y - 6,
                        border: "solid 1px #337ab7",
                        backgroundColor: "white",
                        paddingLeft: 3,
                        paddingRight: 3,
                        paddingTop: 0,
                        color: "#337ab7",
                        fontSize: 9,
                        cursor: "pointer",
                        opacity: 0.8
                    }
                }, R(ui.Icon, { id: "fa-remove" }));
            };
            // Render floating hover controls
            this.renderHoverControls = () => {
                var _a, _b;
                let key, maxX, maxY, minY;
                if (!this.state.hoverSection) {
                    return;
                }
                // Determine hover rectangle and section type (row, column or intersection)
                let minX = (maxX = minY = maxY = null);
                let sectionType = null;
                for (key in this.cellComps) {
                    const cell = this.cellComps[key];
                    const rowIndex = parseInt(key.split(":")[0]);
                    const columnIndex = parseInt(key.split(":")[1]);
                    const cellTd = cell.getTdComponent();
                    if (!cellTd) {
                        continue;
                    }
                    // If hover
                    if (((_b = (_a = this.props.layout.rows[rowIndex]) === null || _a === void 0 ? void 0 : _a.cells[columnIndex]) === null || _b === void 0 ? void 0 : _b.section) === this.state.hoverSection) {
                        // Add bounds
                        minX = minX == null || cellTd.offsetLeft < minX ? cellTd.offsetLeft : minX;
                        minY = minY == null || cellTd.offsetTop < minY ? cellTd.offsetTop : minY;
                        maxX =
                            maxX == null || cellTd.offsetLeft + cellTd.offsetWidth > maxX
                                ? cellTd.offsetLeft + cellTd.offsetWidth
                                : maxX;
                        maxY =
                            maxY == null || cellTd.offsetTop + cellTd.offsetHeight > maxY
                                ? cellTd.offsetTop + cellTd.offsetHeight
                                : maxY;
                        // Record type
                        sectionType = this.props.layout.rows[rowIndex].cells[columnIndex].type;
                    }
                }
                if (minX == null || !sectionType) {
                    return null;
                }
                // Determine types of controls to show
                const controls = [];
                if (sectionType === "row" && this.props.onInsertBeforeSegment) {
                    controls.push(this.renderHoverPlusIcon("top", (minX + maxX) / 2, minY, this.props.onInsertBeforeSegment.bind(null, this.state.hoverSection)));
                }
                if (sectionType === "row" && this.props.onInsertAfterSegment) {
                    controls.push(this.renderHoverPlusIcon("bottom", (minX + maxX) / 2, maxY, this.props.onInsertAfterSegment.bind(null, this.state.hoverSection)));
                }
                if (sectionType === "row" && this.props.onAddChildSegment) {
                    controls.push(this.renderHoverPlusIcon("right", maxX, (minY + maxY) / 2, this.props.onAddChildSegment.bind(null, this.state.hoverSection)));
                }
                if (sectionType === "column" && this.props.onInsertBeforeSegment) {
                    controls.push(this.renderHoverPlusIcon("left", minX, (minY + maxY) / 2, this.props.onInsertBeforeSegment.bind(null, this.state.hoverSection)));
                }
                if (sectionType === "column" && this.props.onInsertAfterSegment) {
                    controls.push(this.renderHoverPlusIcon("right", maxX, (minY + maxY) / 2, this.props.onInsertAfterSegment.bind(null, this.state.hoverSection)));
                }
                if (sectionType === "column" && this.props.onAddChildSegment) {
                    controls.push(this.renderHoverPlusIcon("bottom", (minX + maxX) / 2, maxY, this.props.onAddChildSegment.bind(null, this.state.hoverSection)));
                }
                if (["row", "column"].includes(sectionType) && this.props.onRemoveSegment) {
                    controls.push(this.renderHoverRemoveIcon("topright", maxX, minY, this.props.onRemoveSegment.bind(null, this.state.hoverSection)));
                }
                return R("div", { key: "hover-controls" }, controls);
            };
            this.state = {
                hoverSection: null // Current section being hovered over
            };
            // Index of cell components by "<rowIndex>:<columnIndex>"
            this.cellComps = {};
        }
        static initClass() {
            this.propTypes = {
                layout: prop_types_1.default.object.isRequired,
                editable: prop_types_1.default.bool,
                onEditSection: prop_types_1.default.func,
                onRemoveSegment: prop_types_1.default.func,
                onInsertBeforeSegment: prop_types_1.default.func,
                onInsertAfterSegment: prop_types_1.default.func,
                onAddChildSegment: prop_types_1.default.func,
                onSummarizeSegment: prop_types_1.default.func
            };
            // Called with id of segment. Summarizes the segment
        }
        renderRow(row, rowIndex) {
            return R("tr", { key: rowIndex }, lodash_1.default.map(row.cells, (cell, columnIndex) => {
                return R(LayoutCellComponent, {
                    ref: this.recordCellComp.bind(null, rowIndex, columnIndex),
                    key: columnIndex,
                    layout: this.props.layout,
                    rowIndex,
                    columnIndex,
                    onHover: this.props.editable ? () => this.setState({ hoverSection: cell.section }) : undefined,
                    hoverSection: this.props.editable ? this.state.hoverSection : undefined,
                    onEditSection: this.props.onEditSection ? this.props.onEditSection.bind(null, cell.section) : undefined,
                    onSummarizeSegment: this.props.onSummarizeSegment
                        ? this.props.onSummarizeSegment.bind(null, cell.section)
                        : undefined
                });
            }));
        }
        render() {
            return R("div", {
                style: { position: "relative" },
                onMouseLeave: () => this.setState({ hoverSection: null })
            }, 
            // Define CSS classes to keep HTML as small as possible
            // https://stackoverflow.com/a/19047221/876117
            // https://github.com/mWater/mwater-portal/issues/1183
            // cell borders not visible in firefox when you have a cell with position relative inside a table with collapsed borders
            R("style", null, `\
.pivot-chart-table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  position: relative;
}

.pivot-chart-table .cell {
  padding: 5px;
  vertical-align: top;
  background-color: white;
}

.pivot-chart-table .bt1 { border-top: solid 1px #f4f4f4 }
.pivot-chart-table .bt2 { border-top: solid 1px #ccc }
.pivot-chart-table .bt3 { border-top: solid 1px #888 }

.pivot-chart-table .bb1 { border-bottom: solid 1px #f4f4f4 }
.pivot-chart-table .bb2 { border-bottom: solid 1px #ccc }
.pivot-chart-table .bb3 { border-bottom: solid 1px #888 }

.pivot-chart-table .bl1 { border-left: solid 1px #f4f4f4 }
.pivot-chart-table .bl2 { border-left: solid 1px #ccc }
.pivot-chart-table .bl3 { border-left: solid 1px #888 }

.pivot-chart-table .br1 { border-right: solid 1px #f4f4f4 }
.pivot-chart-table .br2 { border-right: solid 1px #ccc }
.pivot-chart-table .br3 { border-right: solid 1px #888 }\
`), this.props.layout.tooManyRows
                ? R("div", { className: "text-warning", style: { fontSize: 12 } }, R("i", { className: "fa fa-exclamation-circle" }), " Warning: Too many rows in table to display")
                : undefined, this.props.layout.tooManyColumns
                ? R("div", { className: "text-warning", style: { fontSize: 12 } }, R("i", { className: "fa fa-exclamation-circle" }), " Warning: Too many columns in table to display")
                : undefined, R("div", { style: { position: "relative" } }, R("table", { className: "pivot-chart-table" }, R("tbody", null, lodash_1.default.map(this.props.layout.rows, (row, rowIndex) => {
                return this.renderRow(row, rowIndex);
            }))), this.renderHoverControls()));
        }
    };
    PivotChartLayoutComponent.initClass();
    return PivotChartLayoutComponent;
})();
// Single layout cell
class LayoutCellComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleClick = (ev) => {
            // Ignore blanks
            const cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex];
            if (!cell.section) {
                return;
            }
            // Ignore unconfigured cells
            if (cell.unconfigured) {
                return;
            }
            if (this.props.onEditSection) {
                return this.props.onEditSection();
            }
        };
    }
    static initClass() {
        this.propTypes = {
            layout: prop_types_1.default.object.isRequired,
            rowIndex: prop_types_1.default.number.isRequired,
            columnIndex: prop_types_1.default.number.isRequired,
            hoverSection: prop_types_1.default.string,
            onHover: prop_types_1.default.func,
            onEditSection: prop_types_1.default.func,
            onSummarizeSegment: prop_types_1.default.func
        };
    }
    // Gets cell component
    getTdComponent() {
        return this.tdComponent;
    }
    // Render an unconfigured cell
    renderUnconfigured(cell) {
        return R("span", { style: { fontSize: "90%" } }, R("a", { style: { cursor: "pointer" }, onClick: this.props.onEditSection }, "Edit"), cell.summarize
            ? [
                R("span", { className: "text-muted" }, " / "),
                R("a", { style: { cursor: "pointer" }, onClick: this.props.onSummarizeSegment }, "Summarize")
            ]
            : undefined);
    }
    render() {
        var _a, _b;
        const cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex];
        if (cell.skip) {
            return null;
        }
        const isHover = this.props.hoverSection && cell.section === this.props.hoverSection;
        // Determine background color
        let backgroundColor = cell.unconfigured && this.props.onEditSection ? "#eff5fb" : cell.backgroundColor || null;
        if (isHover) {
            backgroundColor = color_1.default(backgroundColor || "#ffffff").darken(0.03);
        }
        // Add striping
        if (this.props.layout.striping === "columns" &&
            ["column", "intersection"].includes(cell.type) &&
            this.props.columnIndex % 2 === 0) {
            backgroundColor = color_1.default(backgroundColor || "#ffffff").darken(0.03);
        }
        else if (this.props.layout.striping === "rows" &&
            ["row", "intersection"].includes(cell.type) &&
            this.props.rowIndex % 2 === 0) {
            backgroundColor = color_1.default(backgroundColor || "#ffffff").darken(0.03);
        }
        const borderWeights = [null, "solid 1px #f4f4f4", "solid 1px #ccc", "solid 1px #888"];
        // Collapsed borders mean that weights need to be combined for adjacent cells
        const borderBottom = Math.max(cell.borderBottom || 0, ((_a = this.props.layout.rows[this.props.rowIndex + 1]) === null || _a === void 0 ? void 0 : _a.cells[this.props.columnIndex].borderTop) || 0);
        const borderRight = Math.max(cell.borderRight || 0, ((_b = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex + 1]) === null || _b === void 0 ? void 0 : _b.borderLeft) || 0);
        let textColor = null;
        if (backgroundColor) {
            const c = color_1.default(backgroundColor);
            textColor = (c.red() + c.green() + c.blue()) / 765 < 0.5 ? "rgb(204,204,204)" : undefined;
        }
        const style = {
            backgroundColor,
            textAlign: cell.align,
            cursor: isHover && !cell.unconfigured ? "pointer" : undefined,
            color: textColor
        };
        const classes = classnames_1.default({
            cell: true,
            // List out borders in compact way to keep HTML smaller
            bt1: cell.borderTop === 1,
            bt2: cell.borderTop === 2,
            bt3: cell.borderTop === 3,
            bb1: cell.borderBottom === 1,
            bb2: cell.borderBottom === 2,
            bb3: cell.borderBottom === 3,
            bl1: cell.borderLeft === 1,
            bl2: cell.borderLeft === 2,
            bl3: cell.borderLeft === 3,
            br1: cell.borderRight === 1,
            br2: cell.borderRight === 2,
            br3: cell.borderRight === 3
        });
        // Style that should not affect popup menu
        const innerStyle = {
            fontWeight: cell.bold ? "bold" : undefined,
            fontStyle: cell.italic ? "italic" : undefined,
            marginLeft: cell.indent ? cell.indent * 5 : undefined
        };
        return R("td", {
            ref: (c) => {
                return (this.tdComponent = c);
            },
            onMouseEnter: this.props.onHover,
            onClick: this.handleClick,
            className: classes,
            style,
            colSpan: cell.columnSpan || null,
            rowSpan: cell.rowSpan || null
        }, R("span", { style: innerStyle }, cell.unconfigured && this.props.onEditSection
            ? this.renderUnconfigured(cell)
            : cell.text || "\u00A0\u00A0\u00A0"));
    }
}
LayoutCellComponent.initClass(); // Placeholder
