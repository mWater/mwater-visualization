"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
class LegendGroup extends react_1.default.Component {
    render() {
        return R("div", { style: { marginBottom: 5 } }, react_1.default.createElement(LegendItem, {
            hasChildren: this.props.items.length > 0,
            symbol: this.props.symbol,
            markerSize: this.props.markerSize,
            color: this.props.defaultColor,
            name: this.props.name,
            key: this.props.name,
            radiusLayer: this.props.radiusLayer
        }), lodash_1.default.map(this.props.items, (item) => {
            return react_1.default.createElement(LegendItem, {
                isChild: true,
                symbol: this.props.symbol,
                markerSize: this.props.markerSize,
                color: item.color,
                name: item.name,
                key: item.name,
                radiusLayer: this.props.radiusLayer
            });
        }));
    }
}
exports.default = LegendGroup;
LegendGroup.defaultProps = {
    items: [],
    radiusLayer: false,
    symbol: null
};
class LegendItem extends react_1.default.Component {
    renderSymbol() {
        const symbolStyle = {
            color: this.props.color,
            display: "inline-block",
            marginRight: 4,
            fontSize: this.props.markerSize
        };
        const className = this.props.symbol.replace("font-awesome/", "fa fa-");
        return R("span", { className, style: symbolStyle }, "");
    }
    renderColorIndicator() {
        const indicatorStyle = {
            height: 10,
            width: 10,
            backgroundColor: this.props.color,
            display: "inline-block",
            marginRight: 4
        };
        if (this.props.radiusLayer) {
            indicatorStyle["borderRadius"] = 5;
        }
        return R("span", { style: indicatorStyle }, "");
    }
    renderIndicator() {
        if (this.props.symbol) {
            return this.renderSymbol();
        }
        else {
            return this.renderColorIndicator();
        }
    }
    render() {
        let titleStyle = {};
        if (!this.props.isChild) {
            titleStyle = {
                margin: 2,
                fontWeight: "bold"
            };
        }
        const containerStyle = { paddingLeft: this.props.isChild ? 5 : 0 };
        return R("div", { style: containerStyle }, !this.props.hasChildren ? this.renderIndicator() : undefined, R("span", { style: titleStyle }, this.props.name));
    }
}
LegendItem.defaultProps = {
    radiusLayer: false,
    hasChildren: false,
    isChild: false
};
