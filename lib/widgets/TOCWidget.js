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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const update_1 = __importDefault(require("react-library/lib/update"));
const Widget_1 = __importDefault(require("./Widget"));
const DropdownWidgetComponent_1 = __importDefault(require("./DropdownWidgetComponent"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
// Table of contents widget that displays the h1, h2, etc entries from all text fields in one widget
// design is:
//   header: text of header. Defaults to "Contents"
//   borderWeight: border weight. Defaults to 0=None. 1=light, 2=medium, 3=heavy
//   numbering: true/false for prepending numbering to entries (e.g. 3.4.1)
class TOCWidget extends Widget_1.default {
    // Creates a React element that is a view of the widget
    // options:
    //  schema: schema to use
    //  dataSource: data source to use
    //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
    //  design: widget design
    //  scope: scope of the widget (when the widget self-selects a particular scope)
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    //  onScopeChange: called with scope of widget
    //  onDesignChange: called with new design. null/undefined for readonly
    //  width: width in pixels on screen
    //  height: height in pixels on screen
    //  tocEntries: entries in the table of contents
    //  onScrollToTOCEntry: called with (widgetId, tocEntryId) to scroll to TOC entry
    createViewElement(options) {
        return R(TOCWidgetComponent, {
            design: options.design,
            onDesignChange: options.onDesignChange,
            width: options.width,
            height: options.height,
            tocEntries: options.tocEntries,
            onScrollToTOCEntry: options.onScrollToTOCEntry
        });
    }
    // Determine if widget is auto-height, which means that a vertical height is not required.
    isAutoHeight() {
        return true;
    }
}
exports.default = TOCWidget;
class TOCWidgetComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleStartEditing = () => {
            return this.setState({ editing: true });
        };
        this.handleEndEditing = () => {
            return this.setState({ editing: false });
        };
        this.state = {
            editing: false // true if editing
        };
    }
    renderEditor() {
        if (!this.state.editing) {
            return null;
        }
        // Create editor
        const editor = R(TOCWidgetDesignerComponent, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange
        });
        return R(ModalPopupComponent_1.default, {
            showCloseX: true,
            header: "Table of Contents Options",
            onClose: this.handleEndEditing
        }, editor);
    }
    renderContent() {
        return R(TOCWidgetViewComponent, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange,
            width: this.props.width,
            height: this.props.height,
            tocEntries: this.props.tocEntries,
            onScrollToTOCEntry: this.props.onScrollToTOCEntry
        });
    }
    render() {
        const dropdownItems = [];
        if (this.props.onDesignChange != null) {
            dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing });
        }
        // Wrap in a simple widget
        return R("div", { onDoubleClick: this.handleStartEditing }, this.props.onDesignChange != null ? this.renderEditor() : undefined, R(DropdownWidgetComponent_1.default, {
            width: this.props.width,
            height: this.props.height,
            dropdownItems
        }, this.renderContent()));
    }
}
TOCWidgetComponent.propTypes = {
    design: prop_types_1.default.object.isRequired,
    onDesignChange: prop_types_1.default.func,
    width: prop_types_1.default.number,
    height: prop_types_1.default.number,
    tocEntries: prop_types_1.default.arrayOf(prop_types_1.default.shape({
        id: prop_types_1.default.any,
        widgetId: prop_types_1.default.string.isRequired,
        level: prop_types_1.default.number.isRequired,
        text: prop_types_1.default.string.isRequired
    })),
    onScrollToTOCEntry: prop_types_1.default.func
};
// Displays the contents of the widget
class TOCWidgetViewComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleEntryClick = (tocEntry) => {
            var _a, _b;
            return (_b = (_a = this.props).onScrollToTOCEntry) === null || _b === void 0 ? void 0 : _b.call(_a, tocEntry.widgetId, tocEntry.id);
        };
    }
    renderTOCEntry(tocEntry, index) {
        // Find indentation number (e.g "1.3.2") by counting # backwards that are same level with no level lower
        let level;
        let indentation = "";
        if (this.props.design.numbering) {
            let asc, end;
            for (level = 1, end = tocEntry.level, asc = 1 <= end; asc ? level <= end : level >= end; asc ? level++ : level--) {
                let value = 0;
                for (let i2 = 0, end1 = index, asc1 = 0 <= end1; asc1 ? i2 <= end1 : i2 >= end1; asc1 ? i2++ : i2--) {
                    if (this.props.tocEntries[i2].level === level) {
                        value += 1;
                    }
                    else if (this.props.tocEntries[i2].level < level) {
                        value = 0;
                    }
                }
                indentation += `${value}.`;
            }
            indentation += " ";
        }
        return R("div", { key: index, style: { paddingLeft: tocEntry.level * 8 - 8 } }, R("a", { className: "link-plain", onClick: this.handleEntryClick.bind(null, tocEntry) }, indentation, R("span", null, tocEntry.text)));
    }
    render() {
        // Get border
        const border = (() => {
            switch (this.props.design.borderWeight) {
                case 0:
                    return "none";
                case 1:
                    return "solid 1px #f4f4f4";
                case 2:
                    return "solid 1px #ccc";
                case 3:
                    return "solid 1px #888";
            }
        })();
        return R("div", {
            style: {
                width: this.props.width,
                height: this.props.height,
                border,
                padding: 5,
                margin: 1
            }
        }, 
        // Render header
        R("div", { style: { fontWeight: "bold" } }, this.props.design.header), lodash_1.default.map(this.props.tocEntries, (tocEntry, i) => {
            return this.renderTOCEntry(tocEntry, i);
        }), 
        // Add placeholder if none and editable
        this.props.onDesignChange && this.props.tocEntries.length === 0
            ? R("div", { className: "text-muted" }, "Table of Contents will appear here as text blocks with headings are added to the dashboard")
            : undefined);
    }
}
TOCWidgetViewComponent.propTypes = {
    design: prop_types_1.default.object.isRequired,
    onDesignChange: prop_types_1.default.func,
    width: prop_types_1.default.number,
    height: prop_types_1.default.number,
    tocEntries: prop_types_1.default.arrayOf(prop_types_1.default.shape({
        id: prop_types_1.default.any,
        widgetId: prop_types_1.default.string.isRequired,
        level: prop_types_1.default.number.isRequired,
        text: prop_types_1.default.string.isRequired
    })),
    onScrollToTOCEntry: prop_types_1.default.func
};
// Designer for TOC widget options
class TOCWidgetDesignerComponent extends react_1.default.Component {
    constructor(...args) {
        super(...args);
        this.handleMarkdownChange = (ev) => {
            const design = lodash_1.default.extend({}, this.props.design, { markdown: ev.target.value });
            return this.props.onDesignChange(design);
        };
        this.update = this.update.bind(this);
    }
    // Updates design with the specified changes
    update() {
        return (0, update_1.default)(this.props.design, this.props.onDesignChange, arguments);
    }
    render() {
        return R("div", null, R(ui.FormGroup, { label: "Header" }, R(ui.TextInput, { value: this.props.design.header || "", onChange: this.update("header"), placeholder: "None" })), R(ui.FormGroup, { label: "Border" }, R(BorderComponent, { value: this.props.design.borderWeight || 0, onChange: this.update("borderWeight") })), R(ui.FormGroup, { label: "Numbering" }, R(ui.Radio, {
            inline: true,
            value: this.props.design.numbering || false,
            radioValue: true,
            onChange: this.update("numbering")
        }, "On"), R(ui.Radio, {
            inline: true,
            value: this.props.design.numbering || false,
            radioValue: false,
            onChange: this.update("numbering")
        }, "Off")));
    }
}
TOCWidgetDesignerComponent.propTypes = {
    design: prop_types_1.default.object.isRequired,
    onDesignChange: prop_types_1.default.func.isRequired
};
// Allows setting border heaviness
class BorderComponent extends react_1.default.Component {
    render() {
        const value = this.props.value != null ? this.props.value : this.props.defaultValue;
        return R("div", null, R(ui.Radio, { inline: true, value, radioValue: 0, onChange: this.props.onChange }, "None"), R(ui.Radio, { inline: true, value, radioValue: 1, onChange: this.props.onChange }, "Light"), R(ui.Radio, { inline: true, value, radioValue: 2, onChange: this.props.onChange }, "Medium"), R(ui.Radio, { inline: true, value, radioValue: 3, onChange: this.props.onChange }, "Heavy"));
    }
}
BorderComponent.propTypes = {
    value: prop_types_1.default.number,
    defaultValue: prop_types_1.default.number,
    onChange: prop_types_1.default.func.isRequired
};
