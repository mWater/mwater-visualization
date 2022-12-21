"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
const ExprItemEditorComponent_1 = __importDefault(require("./ExprItemEditorComponent"));
// Modal that displays an expression builder for updating an expression
class ExprUpdateModalComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            exprItem: null,
            onUpdate: null
        };
    }
    open(item, onUpdate) {
        return this.setState({ open: true, exprItem: item, onUpdate });
    }
    render() {
        if (!this.state.open) {
            return null;
        }
        return R(ActionCancelModalComponent_1.default, {
            actionLabel: "Update",
            onAction: () => {
                // Close first to avoid strange effects when mixed with pojoviews
                this.setState({ open: false }, () => {
                    return this.state.onUpdate(this.state.exprItem);
                });
            },
            onCancel: () => this.setState({ open: false }),
            title: "Update Field",
            size: "x-large"
        }, R(ExprItemEditorComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            exprItem: this.state.exprItem,
            onChange: (exprItem) => this.setState({ exprItem }),
            singleRowTable: this.props.singleRowTable
        }));
    }
}
exports.default = ExprUpdateModalComponent;
