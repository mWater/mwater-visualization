"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const Widget_1 = __importDefault(require("./Widget"));
const DropdownWidgetComponent_1 = __importDefault(require("./DropdownWidgetComponent"));
const markdown_it_1 = __importDefault(require("markdown-it"));
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
class MarkdownWidget extends Widget_1.default {
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
    createViewElement(options) {
        return react_1.default.createElement(MarkdownWidgetComponent, {
            design: options.design,
            onDesignChange: options.onDesignChange,
            width: options.width,
            height: options.height
        });
    }
    // Determine if widget is auto-height, which means that a vertical height is not required.
    isAutoHeight() {
        return true;
    }
}
exports.default = MarkdownWidget;
class MarkdownWidgetComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleStartEditing = () => {
            return this.setState({ editDesign: this.props.design });
        };
        this.handleEndEditing = () => {
            this.props.onDesignChange(this.state.editDesign);
            return this.setState({ editDesign: null });
        };
        this.handleEditDesignChange = (design) => {
            return this.setState({ editDesign: design });
        };
        this.state = {
            // Design that is being edited. Change is propagated on closing window
            editDesign: null
        };
    }
    renderEditor() {
        if (!this.state.editDesign) {
            return null;
        }
        // Create editor
        const editor = react_1.default.createElement(MarkdownWidgetDesignerComponent, {
            design: this.state.editDesign,
            onDesignChange: this.handleEditDesignChange
        });
        // Create item (maxing out at half of width of screen)
        const width = Math.min(document.body.clientWidth / 2, this.props.width);
        const chart = this.renderContent(this.state.editDesign);
        const content = R("div", { style: { height: "100%", width: "100%" } }, R("div", {
            style: {
                position: "absolute",
                left: 0,
                top: 0,
                border: "solid 2px #EEE",
                borderRadius: 8,
                padding: 10,
                width: width + 20,
                height: this.props.height + 20
            }
        }, chart), R("div", { style: { width: "100%", height: "100%", paddingLeft: width + 40 } }, R("div", {
            style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" }
        }, editor)));
        return react_1.default.createElement(ModalWindowComponent_1.default, {
            isOpen: true,
            onRequestClose: this.handleEndEditing
        }, content);
    }
    renderContent(design) {
        return react_1.default.createElement(MarkdownWidgetViewComponent, {
            design,
            width: this.props.width,
            height: this.props.height
        });
    }
    render() {
        const dropdownItems = [];
        if (this.props.onDesignChange != null) {
            dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing });
        }
        // Wrap in a simple widget
        return R("div", { onDoubleClick: this.handleStartEditing }, this.props.onDesignChange != null ? this.renderEditor() : undefined, react_1.default.createElement(DropdownWidgetComponent_1.default, {
            width: this.props.width,
            height: this.props.height,
            dropdownItems
        }, this.renderContent(this.props.design)));
    }
}
class MarkdownWidgetViewComponent extends react_1.default.Component {
    render() {
        return R("div", {
            style: {
                width: this.props.width,
                height: this.props.height
            },
            className: "mwater-visualization-markdown",
            dangerouslySetInnerHTML: { __html: new markdown_it_1.default().render(this.props.design.markdown || "") }
        });
    }
}
class MarkdownWidgetDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleMarkdownChange = (ev) => {
            const design = lodash_1.default.extend({}, this.props.design, { markdown: ev.target.value });
            return this.props.onDesignChange(design);
        };
    }
    render() {
        return R("textarea", {
            className: "form-control",
            style: { width: "100%", height: "100%" },
            value: this.props.design.markdown,
            onChange: this.handleMarkdownChange
        });
    }
}
