"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const classnames_1 = __importDefault(require("classnames"));
const bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
const AsyncLoadComponent_1 = __importDefault(require("react-library/lib/AsyncLoadComponent"));
const AutoSizeComponent_1 = __importDefault(require("react-library/lib/AutoSizeComponent"));
const DropdownWidgetComponent_1 = __importDefault(require("./DropdownWidgetComponent"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const TableSelectComponent_1 = __importDefault(require("../TableSelectComponent"));
const ImageUploaderComponent_1 = __importDefault(require("./ImageUploaderComponent"));
const ImagelistCarouselComponent_1 = __importDefault(require("./ImagelistCarouselComponent"));
class ImageWidgetComponent extends AsyncLoadComponent_1.default {
    constructor() {
        super(...arguments);
        this.handleStartEditing = () => {
            return this.editor.edit();
        };
    }
    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) {
        return (newProps.design.expr &&
            (!lodash_1.default.isEqual(newProps.design.expr, oldProps.design.expr) || !lodash_1.default.isEqual(newProps.filters, oldProps.filters)));
    }
    // Call callback with state changes
    load(props, prevProps, callback) {
        // Get data
        return props.widgetDataSource.getData(props.design, props.filters, (error, data) => {
            return callback({ error, data });
        });
    }
    // Render a link to start editing
    renderEditLink() {
        return R("div", { className: "mwater-visualization-widget-placeholder", onClick: this.handleStartEditing }, R("i", { className: "icon fa fa-image" }));
    }
    renderEditor() {
        return R(ImageWidgetDesignComponent, {
            ref: (c) => {
                return (this.editor = c);
            },
            key: "editor",
            design: this.props.design,
            onDesignChange: this.props.onDesignChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource
        });
    }
    renderExpression() {
        if (this.state.loading) {
            return R("span", null, "Loading");
        }
        else if (this.state.data) {
            // Make into array if not
            if (!lodash_1.default.isArray(this.state.data)) {
                return R(AutoSizeComponent_1.default, { injectHeight: true }, (size) => {
                    return R(ImagelistCarouselComponent_1.default, {
                        widgetDataSource: this.props.widgetDataSource,
                        imagelist: [this.state.data],
                        height: size.height
                    });
                });
            }
            else {
                return R(AutoSizeComponent_1.default, { injectHeight: true }, (size) => {
                    return R(ImagelistCarouselComponent_1.default, {
                        widgetDataSource: this.props.widgetDataSource,
                        imagelist: this.state.data,
                        height: size.height
                    });
                });
            }
        }
    }
    renderContent() {
        if (this.props.design.imageUrl || this.props.design.uid) {
            // Determine approximate height
            let imageHeight = null;
            if (this.props.height <= 160) {
                imageHeight = 160;
            }
            else if (this.props.height <= 320) {
                imageHeight = 320;
            }
            else if (this.props.height <= 640) {
                imageHeight = 640;
            }
            else if (this.props.height <= 1280) {
                imageHeight = 1280;
            }
            const source = this.props.design.imageUrl || this.props.widgetDataSource.getImageUrl(this.props.design.uid, imageHeight);
            return R(RotatedImageComponent, {
                imgUrl: source,
                url: this.props.design.url,
                rotation: this.props.design.rotation
            });
        }
        else {
            return this.renderExpression();
        }
    }
    render() {
        const dropdownItems = [];
        if (this.props.onDesignChange != null) {
            dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing });
        }
        const captionPosition = this.props.design.captionPosition || "bottom";
        return R(DropdownWidgetComponent_1.default, {
            width: this.props.width,
            height: this.props.height,
            dropdownItems
        }, this.renderEditor(), !this.props.design.imageUrl && !this.props.design.expr && !this.props.design.uid && this.props.onDesignChange
            ? this.renderEditLink()
            : R("div", {
                className: "mwater-visualization-image-widget",
                style: { position: "relative", width: this.props.width, height: this.props.height }
            }, captionPosition === "top" ? R("div", { className: "caption" }, this.props.design.caption) : undefined, R("div", { className: "image" }, this.renderContent()), captionPosition === "bottom" ? R("div", { className: "caption" }, this.props.design.caption) : undefined));
    }
}
exports.default = ImageWidgetComponent;
class ImageWidgetDesignComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.edit = () => {
            var _a;
            this.setCurrentTab();
            const state = {
                editing: true,
                imageUrl: this.props.design.imageUrl,
                uid: this.props.design.uid,
                expr: this.props.design.expr,
                table: (_a = this.props.design.expr) === null || _a === void 0 ? void 0 : _a.table,
                caption: this.props.design.caption,
                rotation: this.props.design.rotation,
                captionPosition: this.props.design.captionPosition,
                url: this.props.design.url
            };
            return this.setState(state);
        };
        this.handleImageUrlChange = (e) => {
            return this.setState({ imageUrl: e.target.value, uid: null, expr: null });
        };
        this.handleUrlChange = (e) => {
            return this.setState({ url: e.target.value });
        };
        this.handleFileUpload = (uid) => {
            return this.setState({ imageUrl: null, uid, expr: null });
        };
        this.handleExpressionChange = (expr) => {
            return this.setState({ imageUrl: null, uid: null, expr, url: null });
        };
        this.handleTableChange = (table) => {
            return this.setState({ table });
        };
        this.handleCaptionChange = (ev) => {
            return this.setState({ caption: ev.target.value });
        };
        this.handleRotationChange = (rotation) => {
            return this.setState({ rotation });
        };
        this.handleCaptionPositionChange = (captionPosition) => {
            return this.setState({ captionPosition });
        };
        this.handleSave = () => {
            this.setState({ editing: false });
            const updates = {
                imageUrl: this.state.imageUrl,
                url: this.state.url,
                uid: this.state.uid,
                expr: this.state.expr,
                caption: this.state.caption,
                rotation: this.state.rotation,
                captionPosition: this.state.captionPosition
            };
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, updates));
        };
        this.handleCancel = () => {
            this.setCurrentTab();
            return this.setState({
                editing: false,
                imageUrl: null,
                url: null,
                uid: null,
                expr: null,
                table: null,
                files: null,
                uploading: false,
                captionPosition: null
            });
        };
        this.state = {
            // Widget data
            data: null,
            error: null,
            editing: false,
            imageUrl: null,
            expr: null,
            table: null,
            uid: null,
            files: null,
            uploading: false,
            caption: null,
            currentTab: "url",
            rotation: null,
            captionPosition: null,
            url: null
        };
    }
    setCurrentTab() {
        let tab = "upload";
        if (this.props.design.url) {
            tab = "url";
        }
        if (this.props.design.expr) {
            tab = "expression";
        }
        return this.setState({ currentTab: tab });
    }
    renderUploadEditor() {
        return R("div", null, R(ImageUploaderComponent_1.default, {
            dataSource: this.props.dataSource,
            onUpload: this.handleFileUpload,
            uid: this.props.design.uid
        }), this.renderRotation());
    }
    renderExpressionEditor() {
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"), ": ", R(TableSelectComponent_1.default, { schema: this.props.schema, value: this.state.table, onChange: this.handleTableChange }), R("br"), this.state.table
            ? R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Field"), ": ", R(mwater_expressions_ui_1.ExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.state.table,
                types: ["image", "imagelist"],
                value: this.state.expr,
                aggrStatuses: ["individual", "literal"],
                onChange: this.handleExpressionChange
            }))
            : undefined);
    }
    renderRotation() {
        return R("div", { style: { paddingTop: 10 } }, "Rotation: ", R(bootstrap_1.default.Radio, { value: this.state.rotation || null, radioValue: null, onChange: this.handleRotationChange, inline: true }, "0 degrees"), R(bootstrap_1.default.Radio, { value: this.state.rotation || null, radioValue: 90, onChange: this.handleRotationChange, inline: true }, "90 degrees"), R(bootstrap_1.default.Radio, { value: this.state.rotation || null, radioValue: 180, onChange: this.handleRotationChange, inline: true }, "180 degrees"), R(bootstrap_1.default.Radio, { value: this.state.rotation || null, radioValue: 270, onChange: this.handleRotationChange, inline: true }, "270 degrees"));
    }
    renderImageUrlEditor() {
        return R("div", { className: "form-group" }, R("label", null, "URL of image"), R("input", {
            type: "text",
            className: "form-control",
            value: this.state.imageUrl || "",
            onChange: this.handleImageUrlChange
        }), R("p", { className: "help-block" }, "e.g. http://somesite.com/image.jpg"), this.renderRotation());
    }
    renderUrlEditor() {
        return R("div", { className: "form-group" }, R("label", null, "URL to open"), R("input", {
            type: "text",
            className: "form-control",
            value: this.state.url || "",
            onChange: this.handleUrlChange
        }), R("p", { className: "help-block" }, "e.g. http://somesite.com/"), R("p", { className: "help-block" }, "When clicked on image, this link will open in a new tab"));
    }
    render() {
        if (!this.state.editing) {
            return null;
        }
        const content = R("div", null, R("div", { className: "form-group" }, R("label", null, "Caption"), R("input", {
            type: "text",
            className: "form-control",
            value: this.state.caption || "",
            onChange: this.handleCaptionChange,
            placeholder: "Optional caption to display below image"
        })), this.state.caption
            ? R("div", { className: "form-group" }, R("label", null, "Caption position"), R(bootstrap_1.default.Select, {
                options: [
                    { value: "bottom", label: "Bottom" },
                    { value: "top", label: "Top" }
                ],
                value: this.state.captionPosition,
                onChange: this.handleCaptionPositionChange
            }))
            : undefined, R(TabbedComponent_1.default, {
            tabs: [
                { id: "upload", label: "Upload", elem: this.renderUploadEditor() },
                { id: "expression", label: "From Data", elem: this.renderExpressionEditor() },
                { id: "url", label: "From URL", elem: this.renderImageUrlEditor() }
            ],
            initialTabId: this.state.currentTab
        }), 
        // No target URL when using expressions
        this.state.imageUrl || this.state.uid ? this.renderUrlEditor() : undefined);
        const footer = R("div", null, R("button", { key: "save", type: "button", className: "btn btn-primary", onClick: this.handleSave }, "Save"), R("button", { key: "cancel", type: "button", className: "btn btn-default", onClick: this.handleCancel }, "Cancel"));
        return R(ModalPopupComponent_1.default, {
            header: "Image",
            scrollDisabled: true,
            footer
        }, content);
    }
}
// Image which is rotated by x degrees (0, 90, 180, 270)
class RotatedImageComponent extends react_1.default.Component {
    render() {
        return R(AutoSizeComponent_1.default, { injectWidth: true, injectHeight: true }, (size) => {
            const imageStyle = {};
            const containerStyle = {};
            // These css classes are defined in mwater-forms
            const classes = classnames_1.default({
                rotated: this.props.rotation,
                "rotate-90": this.props.rotation && this.props.rotation === 90,
                "rotate-180": this.props.rotation && this.props.rotation === 180,
                "rotate-270": this.props.rotation && this.props.rotation === 270
            });
            imageStyle.width = "100%";
            imageStyle.height = "100%";
            imageStyle.objectFit = "contain";
            // Set width if rotated left or right
            if (this.props.rotation === 90 || this.props.rotation === 270) {
                imageStyle.width = size.height;
            }
            const img = R("span", {
                className: "rotated-image-container",
                style: containerStyle
            }, R("img", {
                src: this.props.imgUrl,
                style: imageStyle,
                className: classes,
                onClick: this.props.onClick,
                alt: this.props.caption || ""
            }));
            if (!this.props.url) {
                return img;
            }
            else {
                return R("a", { href: this.props.url, target: "_blank" }, img);
            }
        });
    }
}
