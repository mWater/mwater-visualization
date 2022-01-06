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
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
const TextComponent_1 = __importDefault(require("../../text/TextComponent"));
const PivotChartUtils = __importStar(require("./PivotChartUtils"));
const PivotChartLayoutComponent_1 = __importDefault(require("./PivotChartLayoutComponent"));
const PivotChartLayoutBuilder_1 = __importDefault(require("./PivotChartLayoutBuilder"));
const SegmentDesignerComponent_1 = __importDefault(require("./SegmentDesignerComponent"));
const IntersectionDesignerComponent_1 = __importDefault(require("./IntersectionDesignerComponent"));
// Displays a pivot chart
class PivotChartViewComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleHeaderChange = (header) => {
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { header }));
        };
        this.handleFooterChange = (footer) => {
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { footer }));
        };
        this.handleEditSection = (sectionId) => {
            // If intersection
            if (sectionId.match(":")) {
                return this.setState({
                    editIntersectionId: sectionId,
                    editIntersection: this.props.design.intersections[sectionId] || {}
                });
            }
            else {
                // Find segment
                const segment = PivotChartUtils.findSegment(this.props.design.rows, sectionId) ||
                    PivotChartUtils.findSegment(this.props.design.columns, sectionId);
                return this.setState({ editSegment: segment });
            }
        };
        this.handleSaveEditSegment = () => {
            // Always has label when saved
            let segment = this.state.editSegment;
            if (segment.label == null) {
                segment = lodash_1.default.extend({}, segment, { label: "" });
            }
            const design = lodash_1.default.extend({}, this.props.design, {
                rows: PivotChartUtils.replaceSegment(this.props.design.rows, segment),
                columns: PivotChartUtils.replaceSegment(this.props.design.columns, segment)
            });
            this.props.onDesignChange(design);
            return this.setState({ editSegment: null });
        };
        this.handleCancelEditSegment = () => {
            return this.setState({ editSegment: null });
        };
        this.handleSaveEditIntersection = () => {
            const intersections = lodash_1.default.clone(this.props.design.intersections);
            intersections[this.state.editIntersectionId] = this.state.editIntersection;
            const design = lodash_1.default.extend({}, this.props.design, { intersections });
            this.props.onDesignChange(design);
            return this.setState({ editIntersectionId: null, editIntersection: null });
        };
        this.handleCancelEditIntersection = () => {
            return this.setState({ editIntersectionId: null, editIntersection: null });
        };
        this.handleRemoveSegment = (segmentId) => {
            const design = lodash_1.default.extend({}, this.props.design, {
                rows: PivotChartUtils.removeSegment(this.props.design.rows, segmentId),
                columns: PivotChartUtils.removeSegment(this.props.design.columns, segmentId)
            });
            return this.props.onDesignChange(design);
        };
        this.handleInsertBeforeSegment = (segmentId) => {
            const design = lodash_1.default.extend({}, this.props.design, {
                rows: PivotChartUtils.insertBeforeSegment(this.props.design.rows, segmentId),
                columns: PivotChartUtils.insertBeforeSegment(this.props.design.columns, segmentId)
            });
            return this.props.onDesignChange(design);
        };
        this.handleInsertAfterSegment = (segmentId) => {
            const design = Object.assign(Object.assign({}, this.props.design), { rows: PivotChartUtils.insertAfterSegment(this.props.design.rows, segmentId), columns: PivotChartUtils.insertAfterSegment(this.props.design.columns, segmentId) });
            return this.props.onDesignChange(design);
        };
        this.handleAddChildSegment = (segmentId) => {
            const design = lodash_1.default.extend({}, this.props.design, {
                rows: PivotChartUtils.addChildSegment(this.props.design.rows, segmentId),
                columns: PivotChartUtils.addChildSegment(this.props.design.columns, segmentId)
            });
            return this.props.onDesignChange(design);
        };
        this.handleSummarizeSegment = (segmentId) => {
            const design = PivotChartUtils.summarizeSegment(this.props.design, segmentId, "Summary");
            return this.props.onDesignChange(design);
        };
        this.state = {
            editSegment: null,
            editIntersectionId: null,
            editIntersection: null // value of intersection being edited
        };
    }
    renderHeader() {
        return R("div", { style: { paddingLeft: 10, paddingRight: 10 } }, R(TextComponent_1.default, {
            design: this.props.design.header,
            onDesignChange: this.props.onDesignChange ? this.handleHeaderChange : undefined,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            exprValues: this.props.data.header || {},
            width: this.props.width
        }));
    }
    renderFooter() {
        return R("div", { style: { paddingLeft: 10, paddingRight: 10 } }, R(TextComponent_1.default, {
            design: this.props.design.footer,
            onDesignChange: this.props.onDesignChange ? this.handleFooterChange : undefined,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            exprValues: this.props.data.footer || {},
            width: this.props.width
        }));
    }
    renderEditSegmentModal() {
        if (!this.state.editSegment) {
            return;
        }
        const segmentType = PivotChartUtils.findSegment(this.props.design.rows, this.state.editSegment.id)
            ? "row"
            : "column";
        return R(ActionCancelModalComponent_1.default, {
            title: `Edit ${segmentType}`,
            onAction: this.handleSaveEditSegment,
            onCancel: this.handleCancelEditSegment
        }, R(SegmentDesignerComponent_1.default, {
            segment: this.state.editSegment,
            table: this.props.design.table,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            segmentType,
            onChange: (segment) => this.setState({ editSegment: segment }),
            filters: this.props.filters
        }));
    }
    renderEditIntersectionModal() {
        if (!this.state.editIntersectionId) {
            return;
        }
        return R(ActionCancelModalComponent_1.default, {
            title: "Edit Value",
            onAction: this.handleSaveEditIntersection,
            onCancel: this.handleCancelEditIntersection
        }, R(IntersectionDesignerComponent_1.default, {
            intersection: this.state.editIntersection,
            table: this.props.design.table,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: (intersection) => this.setState({ editIntersection: intersection }),
            filters: this.props.filters
        }));
    }
    render() {
        const layout = new PivotChartLayoutBuilder_1.default({ schema: this.props.schema }).buildLayout(this.props.design, this.props.data, this.context.locale);
        return R("div", { style: { width: this.props.width, height: this.props.height } }, this.renderHeader(), this.renderEditSegmentModal(), this.renderEditIntersectionModal(), R("div", { key: "layout", style: { margin: 5, marginTop: 12, overflowX: "auto", padding: 7 } }, // Allow table to scroll since tables have hard minimum widths, Leave room for gear menu
        R(PivotChartLayoutComponent_1.default, {
            layout,
            editable: this.props.onDesignChange != null,
            onEditSection: this.props.onDesignChange != null ? this.handleEditSection : undefined,
            onRemoveSegment: this.props.onDesignChange != null ? this.handleRemoveSegment : undefined,
            onInsertBeforeSegment: this.props.onDesignChange != null ? this.handleInsertBeforeSegment : undefined,
            onInsertAfterSegment: this.props.onDesignChange != null ? this.handleInsertAfterSegment : undefined,
            onAddChildSegment: this.props.onDesignChange != null ? this.handleAddChildSegment : undefined,
            onSummarizeSegment: this.props.onDesignChange != null ? this.handleSummarizeSegment : undefined
        })), this.renderFooter());
    }
}
exports.default = PivotChartViewComponent;
PivotChartViewComponent.contextTypes = { locale: prop_types_1.default.string };
