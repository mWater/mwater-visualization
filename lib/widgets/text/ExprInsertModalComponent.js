"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uuid_1 = __importDefault(require("uuid"));
const ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
const ExprItemEditorComponent_1 = __importDefault(require("./ExprItemEditorComponent"));
// Modal that displays an expression builder
class ExprInsertModalComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleInsert = () => {
            if (!this.state.exprItem) {
                return;
            }
            // Close first to avoid strange effects when mixed with pojoviews
            this.setState({ open: false }, () => {
                this.props.onInsert(this.state.exprItem);
            });
        };
        this.state = {
            open: false,
            exprItem: null
        };
    }
    open() {
        this.setState({ open: true, exprItem: { type: "expr", id: uuid_1.default(), expr: null } });
    }
    render() {
        if (!this.state.open) {
            return null;
        }
        return R(ActionCancelModalComponent_1.default, {
            actionLabel: "Insert",
            onAction: this.handleInsert,
            onCancel: () => this.setState({ open: false }),
            title: "Insert Field"
        }, R(ExprItemEditorComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            exprItem: this.state.exprItem,
            onChange: (exprItem) => this.setState({ exprItem }),
            singleRowTable: this.props.singleRowTable
        }));
    }
}
exports.default = ExprInsertModalComponent;
