"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const fixed_data_table_2_1 = require("fixed-data-table-2");
const mwater_expressions_1 = require("mwater-expressions");
const ExprCellComponent_1 = __importDefault(require("./ExprCellComponent"));
const EditExprCellComponent_1 = __importDefault(require("./EditExprCellComponent"));
// Datagrid table itself without decorations such as edit button etc.
// See README.md for description of datagrid format
// Design should be cleaned already before being passed in (see DatagridUtils)
class DatagridViewComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        // Reloads all data
        this.reload = () => {
            return this.setState({ rows: [], entirelyLoaded: false });
        };
        this.handleColumnResize = (newColumnWidth, columnKey) => {
            // Find index of column
            const columnIndex = lodash_1.default.findIndex(this.props.design.columns, { id: columnKey });
            // Set new width
            let column = this.props.design.columns[columnIndex];
            column = lodash_1.default.extend({}, column, { width: newColumnWidth });
            // Re-add to list
            const columns = this.props.design.columns.slice();
            columns[columnIndex] = column;
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { columns }));
        };
        this.handleCellClick = (rowIndex, columnIndex) => {
            var _a, _b;
            // Ignore if already editing
            if (((_a = this.state.editingCell) === null || _a === void 0 ? void 0 : _a.rowIndex) === rowIndex && ((_b = this.state.editingCell) === null || _b === void 0 ? void 0 : _b.columnIndex) === columnIndex) {
                return;
            }
            // Ignore if saving
            if (this.state.savingCell) {
                return;
            }
            // Save editing if editing and return
            if (this.state.editingCell) {
                this.handleSaveEdit();
                return;
            }
            // Check if can edit
            if (!this.props.canEditExpr) {
                return;
            }
            // Get column
            const column = this.props.design.columns[columnIndex];
            // // If not expr, return
            // if (!column.type === "expr") {
            //   return
            // }
            // Get expression type
            const exprType = new mwater_expressions_1.ExprUtils(this.props.schema).getExprType(column.expr);
            // If cannot edit type, return
            if (!["text", "number", "enum"].includes(exprType)) {
                return;
            }
            this.props.canEditExpr(this.props.design.table, this.state.rows[rowIndex].id, column.expr)
                .then(canEdit => {
                if (canEdit) {
                    // Start editing
                    return this.setState({ editingCell: { rowIndex, columnIndex } });
                }
            }).catch(error => {
                console.error(error);
            });
        };
        // Called to save
        this.handleSaveEdit = () => {
            // Ignore if not changed
            if (!this.editCellComp || !this.editCellComp.hasChanged()) {
                this.setState({ editingCell: null, savingCell: false });
                return;
            }
            const rowId = this.state.rows[this.state.editingCell.rowIndex].id;
            const { expr } = this.props.design.columns[this.state.editingCell.columnIndex];
            const value = this.editCellComp.getValue();
            this.setState({ savingCell: true }, () => {
                this.props.updateExprValues(this.props.design.table, [{ primaryKey: rowId, expr, value }])
                    .then(() => {
                    // Reload row
                    this.reloadRow(this.state.editingCell.rowIndex, () => {
                        this.setState({ editingCell: null, savingCell: false });
                    });
                }).catch(error => {
                    alert("Error saving data");
                    console.error(error);
                });
            });
        };
        this.handleCancelEdit = () => {
            this.setState({ editingCell: null, savingCell: false });
        };
        // Called with current ref edit. Save
        this.refEditCell = (comp) => {
            this.editCellComp = comp;
        };
        this.handleRowDoubleClick = (ev, rowIndex) => {
            if (this.props.onRowDoubleClick != null && this.state.rows[rowIndex].id) {
                this.props.onRowDoubleClick(this.props.design.table, this.state.rows[rowIndex].id, rowIndex);
            }
        };
        this.handleRowClick = (ev, rowIndex) => {
            if (this.props.onRowClick != null && this.state.rows[rowIndex].id) {
                this.props.onRowClick(this.props.design.table, this.state.rows[rowIndex].id, rowIndex);
            }
        };
        // Render a single cell. exprType is passed in for performance purposes and is calculated once per column
        this.renderCell = (column, columnIndex, exprType, cellProps) => {
            var _a, _b;
            // If rendering placeholder row
            if (cellProps.rowIndex >= this.state.rows.length) {
                // Load next tick as cannot update while rendering
                lodash_1.default.defer(() => {
                    this.loadMoreRows();
                });
                return R(fixed_data_table_2_1.Cell, cellProps, R("i", { className: "fa fa-spinner fa-spin" }));
            }
            // Special case for row number
            if (columnIndex === -1) {
                return R(fixed_data_table_2_1.Cell, {
                    width: cellProps.width,
                    height: cellProps.height,
                    style: {
                        whiteSpace: "nowrap",
                        textAlign: "right"
                    }
                }, cellProps.rowIndex + 1);
            }
            // Get value (columns are c0, c1, c2, etc.)
            const value = this.state.rows[cellProps.rowIndex][`c${columnIndex}`];
            // Render special if editing
            if (((_a = this.state.editingCell) === null || _a === void 0 ? void 0 : _a.rowIndex) === cellProps.rowIndex &&
                ((_b = this.state.editingCell) === null || _b === void 0 ? void 0 : _b.columnIndex) === columnIndex) {
                // Special if saving
                if (this.state.savingCell) {
                    return R(fixed_data_table_2_1.Cell, cellProps, R("i", { className: "fa fa-spinner fa-spin" }));
                }
                return R(EditExprCellComponent_1.default, {
                    ref: this.refEditCell,
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    locale: this.props.design.locale,
                    width: cellProps.width,
                    height: cellProps.height,
                    value,
                    expr: column.expr,
                    onSave: this.handleSaveEdit,
                    onCancel: this.handleCancelEdit
                });
            }
            if (column.type === "expr") {
                // Muted if from main and are displaying subtable
                const muted = !column.subtable && this.state.rows[cellProps.rowIndex].subtable >= 0;
                return R(ExprCellComponent_1.default, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    locale: this.props.design.locale,
                    width: cellProps.width,
                    height: cellProps.height,
                    value,
                    expr: column.expr,
                    format: column.format,
                    exprType,
                    muted,
                    onClick: this.handleCellClick.bind(null, cellProps.rowIndex, columnIndex)
                });
            }
            return null;
        };
        this.state = {
            rows: [],
            entirelyLoaded: false,
            editingCell: null,
            savingCell: false // True when saving a cell's contents
        };
    }
    componentWillReceiveProps(nextProps) {
        // If design or filters changed, delete all rows
        // TODO won't this reload on column resize?
        if (!lodash_1.default.isEqual(nextProps.design, this.props.design) || !lodash_1.default.isEqual(nextProps.filters, this.props.filters)) {
            return this.setState({ rows: [], entirelyLoaded: false });
        }
    }
    // Loads more rows because the placeholder last row has been rendered
    loadMoreRows() {
        // Get the current load state (the values that determine what to load and if the loaded results can still be used or are stale)
        const loadState = {
            design: this.props.design,
            offset: this.state.rows.length,
            limit: this.props.pageSize,
            filters: this.props.filters
        };
        // If already loading what we want, return
        if (lodash_1.default.isEqual(loadState, this.loadState)) {
            return;
        }
        // Record what we're loading
        this.loadState = loadState;
        // Perform the actual load
        return this.props.datagridDataSource.getRows(loadState.design, loadState.offset, loadState.limit, loadState.filters, (error, newRows) => {
            if (error) {
                console.error(error);
                alert("Error loading data");
                return;
            }
            // Check that the required load state has not changed
            if (lodash_1.default.isEqual(loadState, this.loadState)) {
                // Load is complete
                this.loadState = null;
                // Add rows, setting entirelyLoaded based on whether fewer than requested were returned
                const rows = this.state.rows.concat(newRows);
                return this.setState({ rows, entirelyLoaded: newRows.length < this.props.pageSize });
            }
        });
    }
    deleteRow(rowIndex, callback) {
        const newRows = this.state.rows.slice();
        lodash_1.default.pullAt(newRows, rowIndex);
        this.setState({ rows: newRows });
        return callback();
    }
    // Reload a single row
    reloadRow(rowIndex, callback) {
        return this.props.datagridDataSource.getRows(this.props.design, rowIndex, 1, this.props.filters, (error, rows) => {
            if (error || !rows[0]) {
                console.error(error);
                alert("Error loading data");
                callback();
                return;
            }
            // Set row
            const newRows = this.state.rows.slice();
            newRows[rowIndex] = rows[0];
            this.setState({ rows: newRows });
            return callback();
        });
    }
    // Render a single column
    renderColumn(column, columnIndex) {
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        // Get expression type
        const exprType = exprUtils.getExprType(column.expr);
        return R(fixed_data_table_2_1.Column, {
            key: column.id,
            header: R(fixed_data_table_2_1.Cell, { style: { whiteSpace: "nowrap" } }, column.label || exprUtils.summarizeExpr(column.expr, this.props.design.locale)),
            width: column.width,
            allowCellsRecycling: true,
            cell: this.renderCell.bind(null, column, columnIndex, exprType),
            columnKey: column.id,
            isResizable: this.props.onDesignChange != null
        });
    }
    // Render all columns
    renderColumns() {
        const columns = lodash_1.default.map(this.props.design.columns, (column, columnIndex) => this.renderColumn(column, columnIndex));
        if (this.props.design.showRowNumbers) {
            columns.unshift(this.renderColumn({
                label: "#",
                width: 50
            }, -1));
        }
        return columns;
    }
    render() {
        let rowsCount = this.state.rows.length;
        // Add loading row if not entirely loaded
        if (!this.state.entirelyLoaded) {
            rowsCount += 1;
        }
        return R(fixed_data_table_2_1.Table, {
            rowsCount,
            rowHeight: 40,
            headerHeight: 40,
            width: this.props.width,
            height: this.props.height,
            onRowDoubleClick: this.handleRowDoubleClick,
            onRowClick: this.handleRowClick,
            isColumnResizing: false,
            onColumnResizeEndCallback: this.handleColumnResize
        }, this.renderColumns());
    }
}
exports.default = DatagridViewComponent;
DatagridViewComponent.defaultProps = { pageSize: 100 };
