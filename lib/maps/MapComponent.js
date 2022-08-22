"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const MapViewComponent_1 = require("./MapViewComponent");
const MapDesignerComponent_1 = __importDefault(require("./MapDesignerComponent"));
const MapControlComponent_1 = __importDefault(require("./MapControlComponent"));
const AutoSizeComponent_1 = __importDefault(require("react-library/lib/AutoSizeComponent"));
const UndoStack_1 = __importDefault(require("../UndoStack"));
const PopoverHelpComponent_1 = __importDefault(require("react-library/lib/PopoverHelpComponent"));
/** Map with designer on right */
class MapComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleUndo = () => {
            const undoStack = this.state.undoStack.undo();
            // We need to use callback as state is applied later
            return this.setState({ undoStack }, () => this.props.onDesignChange(undoStack.getValue()));
        };
        this.handleRedo = () => {
            const undoStack = this.state.undoStack.redo();
            // We need to use callback as state is applied later
            return this.setState({ undoStack }, () => this.props.onDesignChange(undoStack.getValue()));
        };
        this.handleZoomLockClick = () => {
            return this.setState({ zoomLocked: !this.state.zoomLocked });
        };
        this.handleDesignChange = (design) => {
            if (this.props.onDesignChange) {
                return this.props.onDesignChange(design);
            }
            else {
                return this.setState({ transientDesign: design });
            }
        };
        this.state = {
            undoStack: new UndoStack_1.default().push(props.design),
            transientDesign: props.design,
            zoomLocked: true
        };
    }
    componentWillReceiveProps(nextProps) {
        // Save on stack
        this.setState({ undoStack: this.state.undoStack.push(nextProps.design) });
        if (!lodash_1.default.isEqual(nextProps.design, this.props.design)) {
            return this.setState({ transientDesign: nextProps.design });
        }
    }
    renderActionLinks() {
        return R("div", null, this.props.onDesignChange != null
            ? [
                R("a", { key: "lock", className: "btn btn-link btn-sm", onClick: this.handleZoomLockClick }, R("span", {
                    className: `fa ${this.state.zoomLocked ? "fa-lock red" : "fa-unlock green"}`,
                    style: { marginRight: 5 }
                }), R(PopoverHelpComponent_1.default, { placement: "bottom" }, "Changes to zoom level wont be saved in locked mode")),
                R("a", {
                    key: "undo",
                    className: `btn btn-link btn-sm ${!this.state.undoStack.canUndo() ? "disabled" : ""}`,
                    onClick: this.handleUndo
                }, R("span", { className: "fas fa-caret-left" }), R("span", { className: "hide-600px" }, " Undo")),
                " ",
                R("a", {
                    key: "redo",
                    className: `btn btn-link btn-sm ${!this.state.undoStack.canRedo() ? "disabled" : ""}`,
                    onClick: this.handleRedo
                }, R("span", { className: "fas fa-caret-right" }), R("span", { className: "hide-600px" }, " Redo"))
            ]
            : undefined, this.props.extraTitleButtonsElem);
    }
    renderHeader() {
        return R("div", {
            style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 40,
                padding: 4,
                borderBottom: "solid 2px #AAA"
            }
        }, R("div", { style: { float: "right" } }, this.renderActionLinks()), this.props.titleElem);
    }
    getDesign() {
        if (this.props.onDesignChange) {
            return this.props.design;
        }
        else {
            return this.state.transientDesign || this.props.design;
        }
    }
    renderView() {
        return react_1.default.createElement(AutoSizeComponent_1.default, { injectWidth: true, injectHeight: true }, (size) => {
            return react_1.default.createElement(MapViewComponent_1.MapViewComponent, {
                mapDataSource: this.props.mapDataSource,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                design: this.getDesign(),
                onDesignChange: this.handleDesignChange,
                zoomLocked: this.state.zoomLocked,
                onRowClick: this.props.onRowClick,
                extraFilters: this.props.extraFilters,
                locale: this.context.locale,
                width: size.width,
                height: size.height
            });
        });
    }
    renderDesigner() {
        if (this.props.onDesignChange) {
            return react_1.default.createElement(MapDesignerComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                design: this.getDesign(),
                onDesignChange: this.handleDesignChange
            });
        }
        else {
            return react_1.default.createElement(MapControlComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                design: this.getDesign(),
                onDesignChange: this.handleDesignChange
            });
        }
    }
    render() {
        return R("div", { style: { width: "100%", height: "100%", position: "relative" } }, R("div", { style: { position: "absolute", width: "70%", height: "100%", paddingTop: 40 } }, this.renderHeader(), R("div", { style: { width: "100%", height: "100%" } }, this.renderView())), R("div", {
            style: {
                position: "absolute",
                left: "70%",
                width: "30%",
                height: "100%",
                borderLeft: "solid 3px #AAA",
                overflowY: "auto"
            }
        }, this.renderDesigner()));
    }
}
exports.default = MapComponent;
MapComponent.contextTypes = { locale: prop_types_1.default.string };
