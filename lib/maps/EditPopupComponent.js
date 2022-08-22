"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const BlocksLayoutManager_1 = __importDefault(require("../layouts/blocks/BlocksLayoutManager"));
const WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
const DirectWidgetDataSource_1 = __importDefault(require("../widgets/DirectWidgetDataSource"));
const PopupFilterJoinsEditComponent_1 = __importDefault(require("./PopupFilterJoinsEditComponent"));
// Modal for editing design of popup
class EditPopupComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleItemsChange = (items) => {
            let popup = this.props.design.popup || {};
            popup = lodash_1.default.extend({}, popup, { items });
            const design = lodash_1.default.extend({}, this.props.design, { popup });
            return this.props.onDesignChange(design);
        };
        this.handleRemovePopup = () => {
            const design = lodash_1.default.omit(this.props.design, "popup");
            return this.props.onDesignChange(design);
        };
        this.state = { editing: false };
    }
    render() {
        var _a;
        return R("div", null, R("a", { className: "btn btn-link", onClick: () => this.setState({ editing: true }) }, R("i", { className: "fa fa-pencil" }), " Customize Popup"), this.props.design.popup
            ? R("a", { className: "btn btn-link", onClick: this.handleRemovePopup }, R("i", { className: "fa fa-times" }), " Remove Popup")
            : undefined, this.props.design.popup
            ? R(PopupFilterJoinsEditComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.table,
                idTable: this.props.idTable,
                defaultPopupFilterJoins: this.props.defaultPopupFilterJoins,
                popup: this.props.design.popup,
                design: this.props.design.popupFilterJoins,
                onDesignChange: (popupFilterJoins) => this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { popupFilterJoins }))
            })
            : undefined, this.state.editing
            ? R(ModalWindowComponent_1.default, { isOpen: true, onRequestClose: () => this.setState({ editing: false }) }, new BlocksLayoutManager_1.default().renderLayout({
                items: (_a = this.props.design.popup) === null || _a === void 0 ? void 0 : _a.items,
                style: "popup",
                onItemsChange: this.handleItemsChange,
                disableMaps: true,
                renderWidget: (options) => {
                    const widget = WidgetFactory_1.default.createWidget(options.type);
                    const widgetDataSource = new DirectWidgetDataSource_1.default({
                        widget,
                        schema: this.props.schema,
                        dataSource: this.props.dataSource
                    });
                    return widget.createViewElement({
                        schema: this.props.schema,
                        dataSource: this.props.dataSource,
                        widgetDataSource,
                        design: options.design,
                        scope: null,
                        filters: [],
                        onScopeChange: () => { },
                        onDesignChange: options.onDesignChange,
                        width: options.width,
                        height: options.height,
                        singleRowTable: this.props.table
                    });
                }
            }))
            : undefined);
    }
}
exports.default = EditPopupComponent;
