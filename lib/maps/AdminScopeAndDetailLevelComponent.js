"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const RegionSelectComponent_1 = __importDefault(require("./RegionSelectComponent"));
const DetailLevelSelectComponent_1 = __importDefault(require("./DetailLevelSelectComponent"));
const react_select_1 = __importDefault(require("react-select"));
// Scope and detail level setter for AdminChoropleth layers when using admin_regions
class AdminScopeAndDetailLevelComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleScopeChange = (scope, scopeLevel) => {
            if (scope) {
                // Detail level will be set by DetailLevelSelectComponent
                return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, null);
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
        const basicDetailLevelOptions = [
            { value: 0, label: "Countries" },
            { value: 1, label: "Level 1 (State/Province/District)" }
        ];
        return R("div", null, R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Region to Map"), R(RegionSelectComponent_1.default, {
            region: this.props.scope,
            onChange: this.handleScopeChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource
        })), (() => {
            if (this.props.scope != null && this.props.detailLevel != null) {
                return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Detail Level"), R(DetailLevelSelectComponent_1.default, {
                    scope: this.props.scope,
                    scopeLevel: this.props.scopeLevel,
                    detailLevel: this.props.detailLevel,
                    onChange: this.handleDetailLevelChange,
                    schema: this.props.schema,
                    dataSource: this.props.dataSource
                }));
            }
            else if (this.props.scope == null && this.props.detailLevel != null) {
                // Case of whole world. Allow selecting country or admin level 1
                return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Detail Level"), R(react_select_1.default, {
                    value: lodash_1.default.findWhere(basicDetailLevelOptions, { value: this.props.detailLevel }) || null,
                    options: basicDetailLevelOptions,
                    onChange: (opt) => this.handleDetailLevelChange(opt.value)
                }));
            }
        })());
    }
}
exports.default = AdminScopeAndDetailLevelComponent;
