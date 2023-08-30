"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const mwater_expressions_1 = require("mwater-expressions");
const lodash_1 = require("lodash");
const valueFormatter_1 = require("../valueFormatter");
const valueFormatter_2 = require("../valueFormatter");
const HoverContent = props => {
    var _a;
    const [values, setValues] = (0, react_1.useState)({});
    const exprUtils = new mwater_expressions_1.ExprUtils(props.schema);
    (0, react_1.useEffect)(() => {
        var _a, _b;
        const items = (_b = (_a = props.design.hoverOver) === null || _a === void 0 ? void 0 : _a.items) !== null && _b !== void 0 ? _b : [];
        if (items.length > 0) {
            const exprCompiler = new mwater_expressions_1.ExprCompiler(props.schema);
            const query = {
                type: "query",
                selects: [],
                from: exprCompiler.compileTable(props.design.table, "main"),
                limit: 1
            };
            items.forEach((item) => {
                if (item.value) {
                    query.selects.push({
                        type: "select",
                        expr: exprCompiler.compileExpr({ expr: item.value, tableAlias: "main" }),
                        alias: item.id
                    });
                }
            });
            if (props.filters) {
                let whereClauses = props.filters.map(f => (0, mwater_expressions_1.injectTableAlias)(f.jsonql, "main"));
                whereClauses = (0, lodash_1.compact)(whereClauses);
                // Wrap if multiple
                if (whereClauses.length > 1) {
                    query.where = { type: "op", op: "and", exprs: whereClauses };
                }
                else {
                    query.where = whereClauses[0];
                }
            }
            props.dataSource.performQuery(query, (error, data) => {
                var _a;
                setValues((_a = data === null || data === void 0 ? void 0 : data[0]) !== null && _a !== void 0 ? _a : {});
            });
        }
    }, []);
    return (react_1.default.createElement("div", { className: "_mviz-map-hover-content" }, (_a = props.design.hoverOver) === null || _a === void 0 ? void 0 : _a.items.map((item) => {
        var _a;
        let value = values[item.id];
        if (value !== null && item.value) {
            // Get expression type
            const exprType = exprUtils.getExprType(item.value);
            // Format if can format
            if (exprType && (0, valueFormatter_1.canFormatType)(exprType)) {
                value = (0, valueFormatter_2.formatValue)(exprType, value, undefined);
            }
            else {
                value = exprUtils.stringifyExprLiteral(item.value, value);
            }
        }
        else {
            value = "■■■■";
        }
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("span", null,
                item.label,
                ":"),
            react_1.default.createElement("span", { className: "text-muted" }, values[item.id] === null ? "n/a" : (_a = values[item.id]) !== null && _a !== void 0 ? _a : "■■■■")));
    })));
};
exports.default = HoverContent;
