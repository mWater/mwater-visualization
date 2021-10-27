"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
// Shows widget scopes
class WidgetScopesViewComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.renderScope = (id, scope) => {
            const style = {
                cursor: "pointer",
                borderRadius: 4,
                border: "solid 1px #BBB",
                padding: "1px 5px 1px 5px",
                color: "#666",
                backgroundColor: "#EEE",
                display: "inline-block",
                marginLeft: 4,
                marginRight: 4
            };
            if (!scope) {
                return null;
            }
            return R("div", { key: id, style, onClick: this.props.onRemoveScope.bind(null, id) }, scope.name, " ", R("span", { className: "fas fa-times" }));
        };
    }
    render() {
        const { scopes } = this.props;
        if (lodash_1.default.compact(lodash_1.default.values(scopes)).length === 0) {
            return null;
        }
        return R("div", { className: "alert alert-info" }, R("span", { className: "fas fa-filter" }), " Filters: ", lodash_1.default.map(lodash_1.default.keys(scopes), (id) => this.renderScope(id, scopes[id])));
    }
}
exports.default = WidgetScopesViewComponent;
