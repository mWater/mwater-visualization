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
var immer_1 = __importStar(require("immer"));
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var DatagridUtils = /** @class */ (function () {
    function DatagridUtils(schema) {
        this.schema = schema;
    }
    // Cleans a datagrid design, removing invalid columns
    DatagridUtils.prototype.cleanDesign = function (design) {
        var _this = this;
        if (!design.table) {
            return design;
        }
        var exprCleaner = new mwater_expressions_1.ExprCleaner(this.schema);
        // Erase all if table doesn't exist
        if (!this.schema.getTable(design.table)) {
            return { table: null, columns: [] };
        }
        // Clean columns
        design = immer_1.default(design, function (draft) {
            for (var _i = 0, _a = draft.columns; _i < _a.length; _i++) {
                var column = _a[_i];
                if (column.type === "expr") {
                    // Determine if subtable
                    var table;
                    if (column.subtable) {
                        var subtable = lodash_1.default.findWhere(design.subtables, { id: column.subtable });
                        // Now get destination table
                        table = new mwater_expressions_1.ExprUtils(_this.schema).followJoins(design.table, subtable.joins);
                    }
                    else {
                        table = design.table;
                    }
                    column.expr = exprCleaner.cleanExpr((column.expr ? immer_1.original(column.expr) || null : null), { table: table, aggrStatuses: ["individual", "literal", "aggregate"] });
                }
            }
        });
        return design;
    };
    DatagridUtils.prototype.validateDesign = function (design) {
        if (!design.table) {
            return "Missing table";
        }
        if (!design.columns || !design.columns[0]) {
            return "No columns";
        }
        // Validate column exprs
        for (var _i = 0, _a = design.columns; _i < _a.length; _i++) {
            var column = _a[_i];
            if (column.expr) {
                var error = new mwater_expressions_1.ExprValidator(this.schema).validateExpr(column.expr, { aggrStatuses: ["individual", "literal", "aggregate"] });
                if (error) {
                    return error;
                }
            }
        }
        return null;
    };
    return DatagridUtils;
}());
exports.default = DatagridUtils;
