"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let TextComponent;
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const RichTextComponent_1 = __importDefault(require("../../richtext/RichTextComponent"));
const ExprInsertModalComponent_1 = __importDefault(require("./ExprInsertModalComponent"));
const ExprUpdateModalComponent_1 = __importDefault(require("./ExprUpdateModalComponent"));
const ExprItemsHtmlConverter_1 = __importDefault(require("../../richtext/ExprItemsHtmlConverter"));
// Text component which is provided with the data it needs, rather than loading it.
// Used by TextWidgetComponent and also by other components that embed text fields
exports.default = TextComponent = (function () {
    TextComponent = class TextComponent extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.handleItemsChange = (items) => {
                const design = lodash_1.default.extend({}, this.props.design, { items });
                return this.props.onDesignChange(design);
            };
            this.handleInsertExpr = (item) => {
                const html = '<div data-embed="' + lodash_1.default.escape(JSON.stringify(item)) + '"></div>';
                return this.editor.pasteHTML(html);
            };
            this.handleItemClick = (item) => {
                return this.exprUpdateModal.open(item, (item) => {
                    // Replace in items
                    return this.replaceItem(item);
                });
            };
            this.handleAddExpr = (ev) => {
                ev.preventDefault();
                return this.exprInsertModal.open();
            };
            this.refRichTextComponent = (c) => {
                return (this.editor = c);
            };
        }
        static initClass() {
            this.propTypes = {
                design: prop_types_1.default.object.isRequired,
                onDesignChange: prop_types_1.default.func,
                schema: prop_types_1.default.object.isRequired,
                dataSource: prop_types_1.default.object.isRequired,
                exprValues: prop_types_1.default.object.isRequired,
                width: prop_types_1.default.number,
                height: prop_types_1.default.number,
                singleRowTable: prop_types_1.default.string,
                namedStrings: prop_types_1.default.object // Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
            };
            this.contextTypes = { locale: prop_types_1.default.string };
            // e.g. "en"
        }
        createItemsHtmlConverter() {
            return new ExprItemsHtmlConverter_1.default(this.props.schema, this.props.onDesignChange != null, this.props.exprValues, 
            // Display summaries if in design more and singleRowTable is set
            this.props.onDesignChange != null && this.props.singleRowTable != null, 
            // Only replace named strings if not editing
            this.props.onDesignChange == null ? this.props.namedStrings : undefined, this.context.locale);
        }
        replaceItem(item) {
            var replaceItemInItems = (items, item) => lodash_1.default.map(items, function (i) {
                if (i.id === item.id) {
                    return item;
                }
                else if (i.items) {
                    return lodash_1.default.extend({}, i, { items: replaceItemInItems(i.items, item) });
                }
                else {
                    return i;
                }
            });
            const items = replaceItemInItems(this.props.design.items || [], item);
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { items }));
        }
        renderExtraPaletteButtons() {
            return R("div", { key: "expr", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleAddExpr }, R("i", { className: "fa fa-plus" }), " Field");
        }
        renderModals() {
            return [
                R(ExprInsertModalComponent_1.default, {
                    key: "exprInsertModal",
                    ref: (c) => {
                        return (this.exprInsertModal = c);
                    },
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    onInsert: this.handleInsertExpr,
                    singleRowTable: this.props.singleRowTable
                }),
                R(ExprUpdateModalComponent_1.default, {
                    key: "exprUpdateModal",
                    ref: (c) => {
                        return (this.exprUpdateModal = c);
                    },
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    singleRowTable: this.props.singleRowTable
                })
            ];
        }
        render() {
            const style = {
                position: "relative"
            };
            style.width = this.props.width;
            style.height = this.props.height;
            return R("div", null, this.renderModals(), R(RichTextComponent_1.default, {
                ref: this.refRichTextComponent,
                className: `mwater-visualization-text-widget-style-${this.props.design.style || "default"}`,
                style,
                items: this.props.design.items,
                onItemsChange: this.props.onDesignChange ? this.handleItemsChange : undefined,
                onItemClick: this.handleItemClick,
                itemsHtmlConverter: this.createItemsHtmlConverter(),
                includeHeadings: this.props.design.style === "default" || !this.props.design.style,
                extraPaletteButtons: this.renderExtraPaletteButtons()
            }));
        }
    };
    TextComponent.initClass();
    return TextComponent;
})();
