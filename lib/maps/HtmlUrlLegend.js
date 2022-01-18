"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlUrlLegend = void 0;
const react_1 = __importDefault(require("react"));
const dompurify_1 = __importDefault(require("dompurify"));
/** Loads a html legend and sanitizes it from a url */
class HtmlUrlLegend extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            html: ""
        };
    }
    componentDidMount() {
        this.loadLegend();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.url !== this.props.url) {
            this.loadLegend();
        }
    }
    loadLegend() {
        window
            .fetch(this.props.url)
            .then((response) => response.text())
            .then((html) => {
            const safeHtml = dompurify_1.default.sanitize(html);
            this.setState({ html: safeHtml });
        });
    }
    render() {
        return react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: this.state.html } });
    }
}
exports.HtmlUrlLegend = HtmlUrlLegend;
