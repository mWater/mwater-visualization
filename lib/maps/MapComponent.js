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
const QuickfilterCompiler_1 = __importDefault(require("../quickfilter/QuickfilterCompiler"));
const QuickfiltersComponent_1 = __importDefault(require("../quickfilter/QuickfiltersComponent"));
const MapUtils_1 = require("./MapUtils");
/** Map with designer on right */
class MapComponent extends react_1.default.Component {
    constructor(props) {
        var _a;
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
        this.handleShowQuickfilters = () => {
            return this.setState({ hideQuickfilters: false });
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
        this.handleToggleDesignPanel = () => {
            this.handleDesignChange(Object.assign(Object.assign({}, this.getDesign()), { hideDesignPanel: !this.getDesign().hideDesignPanel }));
        };
        // Get the values of the quick filters
        this.getQuickfilterValues = () => {
            return this.state.quickfiltersValues || [];
        };
        this.state = {
            undoStack: new UndoStack_1.default().push(props.design),
            transientDesign: props.design,
            zoomLocked: true,
            quickfiltersValues: (_a = props.quickfiltersValues) !== null && _a !== void 0 ? _a : null,
            hideQuickfilters: false
        };
    }
    componentDidUpdate(prevProps) {
        // If design changes, save on stack and update transient design
        if (!lodash_1.default.isEqual(prevProps.design, this.props.design)) {
            // Save on stack
            this.setState({ undoStack: this.state.undoStack.push(this.props.design) });
            // Update transient design
            this.setState({ transientDesign: this.props.design });
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
            : undefined, this.state.hideQuickfilters && this.props.design.quickfilters && this.props.design.quickfilters.length > 0
            ? R("a", { key: "showQuickfilters", className: "btn btn-link btn-sm", onClick: this.handleShowQuickfilters }, R("span", { className: "fa fa-filter" }), R("span", { className: "hide-600px" }, " Show Quickfilters"))
            : undefined, this.props.extraTitleButtonsElem, R("a", { key: "toggleDesign", className: "btn btn-link btn-sm", onClick: this.handleToggleDesignPanel, alt: "Toggle design panel" }, this.getDesign().hideDesignPanel ?
            R("span", { className: "fas fa-angle-double-left" })
            : R("span", { className: "fas fa-angle-double-right" })));
    }
    renderHeader() {
        return R("div", {
            style: {
                padding: 4,
                borderBottom: "solid 1px #e8e8e8",
                gridArea: "header"
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
        let filters = this.props.extraFilters || [];
        // Compile quickfilters
        filters = filters.concat(new QuickfilterCompiler_1.default(this.props.schema).compile(this.props.design.quickfilters || [], this.state.quickfiltersValues, this.props.quickfilterLocks));
        return react_1.default.createElement(AutoSizeComponent_1.default, { injectWidth: true, injectHeight: true }, (size) => {
            return react_1.default.createElement(MapViewComponent_1.MapViewComponent, {
                mapDataSource: this.props.mapDataSource,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                design: this.getDesign(),
                onDesignChange: this.handleDesignChange,
                zoomLocked: this.state.zoomLocked,
                onRowClick: this.props.onRowClick,
                extraFilters: filters,
                locale: this.context.locale,
                width: size.width,
                height: size.height
            });
        });
    }
    // Get filters from props filters combined with maps filters
    getCompiledFilters() {
        let compiledFilters = (0, MapUtils_1.getCompiledFilters)(this.props.design, this.props.schema, (0, MapUtils_1.getFilterableTables)(this.props.design, this.props.schema));
        compiledFilters = compiledFilters.concat(this.props.extraFilters || []);
        return compiledFilters;
    }
    renderQuickfilter() {
        return R("div", { style: { gridArea: "quickfilters", borderBottom: "solid 1px #e8e8e8" } }, R(QuickfiltersComponent_1.default, {
            design: this.props.design.quickfilters || [],
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            quickfiltersDataSource: this.props.mapDataSource.getQuickfiltersDataSource(),
            values: this.state.quickfiltersValues || undefined,
            onValuesChange: (values) => this.setState({ quickfiltersValues: values }),
            locks: this.props.quickfilterLocks,
            filters: this.getCompiledFilters(),
            hideTopBorder: this.props.hideTitleBar,
            onHide: () => this.setState({ hideQuickfilters: true })
        }));
    }
    renderDesigner() {
        return R("div", { style: { gridArea: "designer", borderLeft: "solid 2px #e8e8e8" } }, this.props.onDesignChange ?
            react_1.default.createElement(MapDesignerComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                design: this.getDesign(),
                onDesignChange: this.handleDesignChange,
                enableQuickfilters: this.props.enableQuickfilters
            })
            :
                react_1.default.createElement(MapControlComponent_1.default, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    design: this.getDesign(),
                    onDesignChange: this.handleDesignChange
                }));
    }
    render() {
        const designerVisible = !this.getDesign().hideDesignPanel;
        console.log("designerVisible", designerVisible);
        return R("div", {
            style: {
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: designerVisible ? "70% 30%" : "100%",
                gridTemplateRows: "auto auto 1fr",
                gridTemplateAreas: `"header designer" "quickfilters designer" "view designer"`
            }
        }, this.renderHeader(), this.state.hideQuickfilters ? null : this.renderQuickfilter(), R("div", { style: { width: "100%", height: "100%", gridArea: "view", overflow: "hidden" } }, this.renderView()), designerVisible ? this.renderDesigner() : null);
    }
}
exports.default = MapComponent;
MapComponent.contextTypes = { locale: prop_types_1.default.string };
