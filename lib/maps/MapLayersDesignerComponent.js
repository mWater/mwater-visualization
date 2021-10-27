"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const AddLayerComponent_1 = __importDefault(require("./AddLayerComponent"));
const MapLayerViewDesignerComponent_1 = __importDefault(require("./MapLayerViewDesignerComponent"));
const ReorderableListComponent_1 = __importDefault(require("react-library/lib/reorderable/ReorderableListComponent"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
// Designer for layer selection in the map
class MapLayersDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleLayerViewChange = (index, layerView) => {
            const layerViews = this.props.design.layerViews.slice();
            // Update self
            layerViews[index] = layerView;
            // Unselect any in same group if selected
            if (layerView.group && layerView.visible) {
                lodash_1.default.each(this.props.design.layerViews, (lv, i) => {
                    if (lv.visible && i !== index && lv.group === layerView.group) {
                        return (layerViews[i] = lodash_1.default.extend({}, lv, { visible: false }));
                    }
                });
            }
            return this.updateDesign({ layerViews });
        };
        this.handleRemoveLayerView = (index) => {
            const layerViews = this.props.design.layerViews.slice();
            layerViews.splice(index, 1);
            return this.updateDesign({ layerViews });
        };
        this.handleReorder = (layerList) => {
            return this.updateDesign({ layerViews: layerList });
        };
        this.renderLayerView = (layerView, index, connectDragSource, connectDragPreview, connectDropTarget) => {
            const style = {
                padding: "10px 15px",
                border: "1px solid #ddd",
                marginBottom: -1,
                backgroundColor: "#fff"
            };
            const filters = lodash_1.default.clone(this.props.filters) || [];
            if (layerView.design.filter != null) {
                const exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
                const exprCleaner = new mwater_expressions_2.ExprCleaner(this.props.schema);
                // Clean filter first
                const filter = exprCleaner.cleanExpr(layerView.design.filter, { types: ["boolean"] });
                if (filter) {
                    const jsonql = exprCompiler.compileExpr({ expr: filter, tableAlias: "{alias}" });
                    if (jsonql) {
                        filters.push({ table: filter.table, jsonql });
                    }
                }
            }
            return R("div", { style }, react_1.default.createElement(MapLayerViewDesignerComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                layerView,
                onLayerViewChange: (lv) => this.handleLayerViewChange(index, lv),
                onRemove: () => this.handleRemoveLayerView(index),
                connectDragSource,
                connectDragPreview,
                connectDropTarget,
                allowEditingLayer: this.props.allowEditingLayers,
                filters: lodash_1.default.compact(filters)
            }));
        };
    }
    // Updates design with the specified changes
    updateDesign(changes) {
        const design = lodash_1.default.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
    }
    render() {
        return R("div", { className: "mb-3" }, this.props.design.layerViews.length > 0
            ? R("div", { style: { padding: 5 }, key: "layers" }, R("div", { className: "list-group", key: "layers", style: { marginBottom: 10 } }, 
            // _.map(@props.design.layerViews, @renderLayerView)
            react_1.default.createElement(ReorderableListComponent_1.default, {
                items: this.props.design.layerViews,
                onReorder: this.handleReorder,
                renderItem: this.renderLayerView,
                getItemId: (layerView) => layerView.id
            })))
            : undefined, this.props.allowEditingLayers
            ? R(AddLayerComponent_1.default, {
                key: "addlayer",
                layerNumber: this.props.design.layerViews.length,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                design: this.props.design,
                onDesignChange: this.props.onDesignChange
            })
            : undefined);
    }
}
exports.default = MapLayersDesignerComponent;
