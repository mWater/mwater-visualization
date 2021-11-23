"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const moment_1 = __importDefault(require("moment"));
const react_onclickout_1 = __importDefault(require("react-onclickout"));
const react_datepicker_1 = __importDefault(require("react-datepicker"));
// Allows selection of a date expressions for quickfilters
class DateExprComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleClickOut = () => {
            return this.setState({ dropdownOpen: false });
        };
        this.handleStartChange = (value) => {
            var _a, _b, _c;
            // Clear end if after
            if (((_a = this.props.value) === null || _a === void 0 ? void 0 : _a.exprs[1]) && this.fromMoment(value) > ((_b = this.props.value.exprs[1]) === null || _b === void 0 ? void 0 : _b.value)) {
                return this.props.onChange({ type: "op", op: "between", exprs: [this.toLiteral(this.fromMoment(value)), null] });
            }
            else {
                return this.props.onChange({
                    type: "op",
                    op: "between",
                    exprs: [this.toLiteral(this.fromMoment(value)), (_c = this.props.value) === null || _c === void 0 ? void 0 : _c.exprs[1]]
                });
            }
        };
        this.handleEndChange = (value) => {
            var _a, _b, _c;
            // Go to end of day if datetime
            if (this.props.datetime) {
                value = (0, moment_1.default)(value);
                value.endOf("day");
            }
            // Clear start if before
            if (((_a = this.props.value) === null || _a === void 0 ? void 0 : _a.exprs[0]) && this.fromMoment(value) < ((_b = this.props.value.exprs[0]) === null || _b === void 0 ? void 0 : _b.value)) {
                this.props.onChange({ type: "op", op: "between", exprs: [null, this.toLiteral(this.fromMoment(value))] });
            }
            else {
                this.props.onChange({
                    type: "op",
                    op: "between",
                    exprs: [(_c = this.props.value) === null || _c === void 0 ? void 0 : _c.exprs[0], this.toLiteral(this.fromMoment(value))]
                });
            }
            return this.setState({ dropdownOpen: false });
        };
        this.handlePreset = (preset) => {
            this.props.onChange({ type: "op", op: preset.id, exprs: [] });
            return this.setState({ dropdownOpen: false });
        };
        this.renderClear = () => {
            return R("div", {
                style: { position: "absolute", right: 10, top: 7, color: "#AAA" },
                onClick: () => this.props.onChange(null)
            }, R("i", { className: "fa fa-remove" }));
        };
        this.state = {
            dropdownOpen: false,
            custom: false // True when custom dates displayed
        };
    }
    toMoment(value) {
        if (!value) {
            return null;
        }
        if (this.props.datetime) {
            return (0, moment_1.default)(value, moment_1.default.ISO_8601);
        }
        else {
            return (0, moment_1.default)(value, "YYYY-MM-DD");
        }
    }
    fromMoment(value) {
        if (!value) {
            return null;
        }
        if (this.props.datetime) {
            return value.toISOString();
        }
        else {
            return value.format("YYYY-MM-DD");
        }
    }
    toLiteral(value) {
        if (this.props.datetime) {
            return { type: "literal", valueType: "datetime", value };
        }
        else {
            return { type: "literal", valueType: "date", value };
        }
    }
    renderSummary() {
        var _a, _b;
        if (!this.props.value) {
            return R("span", { className: "text-muted" }, "All");
        }
        const preset = lodash_1.default.findWhere(presets, { id: this.props.value.op });
        if (preset) {
            return preset.name;
        }
        if (this.props.value.op === "between") {
            const startDate = this.toMoment((_a = this.props.value.exprs[0]) === null || _a === void 0 ? void 0 : _a.value);
            const endDate = this.toMoment((_b = this.props.value.exprs[1]) === null || _b === void 0 ? void 0 : _b.value);
            // Add/subtract hours to work around https://github.com/moment/moment/issues/2749
            if (this.props.datetime) {
                return ((startDate ? startDate.add("hours", 3).format("ll") : "") +
                    " - " +
                    (endDate ? endDate.subtract("hours", 3).format("ll") : ""));
            }
            else {
                return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "");
            }
        }
        return "???";
    }
    renderPresets() {
        return R("div", {
            style: {
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 4000,
                padding: 5,
                border: "solid 1px #AAA",
                backgroundColor: "white",
                borderRadius: 4
            }
        }, R("ul", { className: "nav nav-pills flex-column" }, lodash_1.default.map(presets, (preset) => {
            return R("li", { className: "nav-item" }, R("a", { className: "nav-link", style: { padding: 5 }, onClick: this.handlePreset.bind(null, preset) }, preset.name));
        }), R("li", { className: "nav-item" }, R("a", { className: "nav-link", style: { padding: 5 }, onClick: () => this.setState({ custom: true }) }, "Custom Date Range..."))));
    }
    renderDropdown() {
        if (this.state.custom) {
            return this.renderCustomDropdown();
        }
        else {
            return this.renderPresets();
        }
    }
    renderCustomDropdown() {
        var _a, _b, _c, _d;
        const startDate = this.toMoment((_b = (_a = this.props.value) === null || _a === void 0 ? void 0 : _a.exprs[0]) === null || _b === void 0 ? void 0 : _b.value);
        const endDate = this.toMoment((_d = (_c = this.props.value) === null || _c === void 0 ? void 0 : _c.exprs[1]) === null || _d === void 0 ? void 0 : _d.value);
        return R("div", {
            style: {
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 4000,
                padding: 5,
                border: "solid 1px #AAA",
                backgroundColor: "white",
                borderRadius: 4
            }
        }, R("div", { style: { whiteSpace: "nowrap" } }, R("div", { style: { display: "inline-block", verticalAlign: "top" } }, R(react_datepicker_1.default, {
            inline: true,
            selectsStart: true,
            selected: startDate,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            showYearDropdown: true,
            onChange: this.handleStartChange
        })), R("div", { style: { display: "inline-block", verticalAlign: "top" } }, R(react_datepicker_1.default, {
            inline: true,
            selectsEnd: true,
            selected: endDate,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            showYearDropdown: true,
            onChange: this.handleEndChange
        }))));
    }
    render() {
        return R(react_onclickout_1.default, { onClickOut: this.handleClickOut }, R("div", { style: { display: "inline-block", position: "relative" } }, R("div", {
            style: { width: 220, height: 36 },
            onClick: () => this.setState({ dropdownOpen: true, custom: false })
        }, this.renderSummary()), 
        // Clear button
        this.props.value && this.props.onChange != null ? this.renderClear() : undefined, this.state.dropdownOpen ? this.renderDropdown() : undefined));
    }
}
exports.default = DateExprComponent;
var presets = [
    { id: "thisyear", name: "This Year" },
    { id: "lastyear", name: "Last Year" },
    { id: "thismonth", name: "This Month" },
    { id: "lastmonth", name: "Last Month" },
    { id: "today", name: "Today" },
    { id: "yesterday", name: "Yesterday" },
    { id: "last24hours", name: "In Last 24 Hours" },
    { id: "last7days", name: "In Last 7 Days" },
    { id: "last30days", name: "In Last 30 Days" },
    { id: "last365days", name: "In Last 365 Days" }
];
