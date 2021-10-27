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
const react_1 = __importDefault(require("react"));
const H = react_1.default.DOM;
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const RegionSelectComponent_1 = __importDefault(require("./RegionSelectComponent"));
const ui = __importStar(require("react-library/lib/bootstrap"));
// Generic scope and detail level setter for AdminChoropleth layers
class ScopeAndDetailLevelComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleScopeChange = (scope, scopeLevel) => {
            if (scope) {
                return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, scopeLevel + 1);
            }
            else {
                return this.props.onScopeAndDetailLevelChange(null, null, 0);
            }
        };
        this.handleDetailLevelChange = (detailLevel) => {
            return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel);
        };
    }
    render() {
        // Determine number of levels by looking for levelN field
        let maxLevel = 0;
        const detailLevelOptions = [];
        for (let level = 0; level <= 9; level++) {
            const levelColumn = this.props.schema.getColumn(this.props.regionsTable, `level${level}`);
            if (levelColumn) {
                maxLevel = level;
                // Can't select same detail level as scope
                if (level > (this.props.scopeLevel != null ? this.props.scopeLevel : -1)) {
                    detailLevelOptions.push({ value: level, label: mwater_expressions_1.ExprUtils.localizeString(levelColumn.name) });
                }
            }
        }
        return R("div", null, R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Region to Map"), R(RegionSelectComponent_1.default, {
            region: this.props.scope,
            onChange: this.handleScopeChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            regionsTable: this.props.regionsTable,
            maxLevel: maxLevel - 1,
            placeholder: "All Regions"
        })), R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Detail Level"), R(ui.Select, {
            value: this.props.detailLevel,
            options: detailLevelOptions,
            onChange: this.handleDetailLevelChange
        })));
    }
}
exports.default = ScopeAndDetailLevelComponent;
