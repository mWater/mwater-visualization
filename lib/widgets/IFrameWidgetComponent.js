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
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const DropdownWidgetComponent_1 = __importDefault(require("./DropdownWidgetComponent"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
class IFrameWidgetComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleStartEditing = () => {
            return this.setState({ editing: true, editUrl: this.props.design.url });
        };
        this.handleEndEditing = () => {
            this.setState({ editing: false });
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { url: this.state.editUrl }));
        };
        this.state = {
            // True when editing chart
            editing: false,
            editUrl: null
        };
    }
    renderEditor() {
        if (!this.state.editing) {
            return null;
        }
        const content = R("div", { className: "mb-3" }, R("label", null, "URL to embed"), R("input", {
            type: "text",
            className: "form-control",
            value: this.state.editUrl || "",
            onChange: (ev) => this.setState({ editUrl: ev.target.value })
        }), R("div", { className: "form-text text-muted" }, "e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"));
        return R(ModalPopupComponent_1.default, {
            header: "Configure",
            showCloseX: true,
            onClose: this.handleEndEditing
        }, content);
    }
    // Render a link to start editing
    renderEditLink() {
        return R("div", { className: "mwater-visualization-widget-placeholder", onClick: this.handleStartEditing }, R(ui.Icon, { id: "fa-youtube-play" }));
    }
    // R 'div', style: { position: "absolute", bottom: @props.height / 2, left: 0, right: 0, textAlign: "center" },
    //   R 'a', className: "btn btn-link", onClick: @handleStartEditing, "Click Here to Configure"
    render() {
        const dropdownItems = [];
        if (this.props.onDesignChange != null) {
            dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing });
        }
        return R(DropdownWidgetComponent_1.default, {
            width: this.props.width,
            height: this.props.height,
            dropdownItems
        }, this.renderEditor(), (() => {
            if (this.props.design.url) {
                return R("iframe", {
                    src: this.props.design.url,
                    width: this.props.width,
                    height: this.props.height,
                    frameborder: 0,
                    allowfullscreen: true
                });
            }
            else {
                if (this.props.onDesignChange != null) {
                    return this.renderEditLink();
                }
            }
            return null;
        })());
    }
}
exports.default = IFrameWidgetComponent;
