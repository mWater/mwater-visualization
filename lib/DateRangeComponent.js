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
// Allows selection of a date range
class DateRangeComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleClickOut = () => {
            return this.setState({ dropdownOpen: false });
        };
        this.handleStartChange = (value) => {
            var _a, _b;
            // Go to start of day if datetime
            if (this.props.datetime) {
                value = moment_1.default(value);
                value.startOf("day");
            }
            // Clear end if after
            if (((_a = this.props.value) === null || _a === void 0 ? void 0 : _a[1]) && this.fromMoment(value) > this.props.value[1]) {
                return this.props.onChange([this.fromMoment(value), null]);
            }
            else {
                return this.props.onChange([this.fromMoment(value), (_b = this.props.value) === null || _b === void 0 ? void 0 : _b[1]]);
            }
        };
        this.handleEndChange = (value) => {
            var _a, _b;
            // Go to end of day if datetime
            if (this.props.datetime) {
                value = moment_1.default(value);
                value.endOf("day");
            }
            // Clear start if before
            if (((_a = this.props.value) === null || _a === void 0 ? void 0 : _a[0]) && this.fromMoment(value) < this.props.value[0]) {
                this.props.onChange([null, this.fromMoment(value)]);
            }
            else {
                this.props.onChange([(_b = this.props.value) === null || _b === void 0 ? void 0 : _b[0], this.fromMoment(value)]);
            }
            return this.setState({ dropdownOpen: false });
        };
        this.handlePreset = (preset) => {
            // Go to start/end of day if datetime
            let end, start;
            if (this.props.datetime) {
                start = moment_1.default(preset.value[0]);
                start.startOf("day");
                end = moment_1.default(preset.value[1]);
                end.endOf("day");
            }
            else {
                start = preset.value[0];
                end = preset.value[1];
            }
            this.props.onChange([this.fromMoment(start), this.fromMoment(end)]);
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
            return moment_1.default(value, moment_1.default.ISO_8601);
        }
        else {
            return moment_1.default(value, "YYYY-MM-DD");
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
    getPresets() {
        const presets = [
            { label: "Today", value: [moment_1.default(), moment_1.default()] },
            { label: "Yesterday", value: [moment_1.default().subtract(1, "days"), moment_1.default().subtract(1, "days")] },
            { label: "Last 7 Days", value: [moment_1.default().subtract(6, "days"), moment_1.default()] },
            { label: "Last 30 Days", value: [moment_1.default().subtract(29, "days"), moment_1.default()] },
            { label: "This Month", value: [moment_1.default().startOf("month"), moment_1.default().endOf("month")] },
            {
                label: "Last Month",
                value: [moment_1.default().subtract(1, "months").startOf("month"), moment_1.default().subtract(1, "months").endOf("month")]
            },
            { label: "This Year", value: [moment_1.default().startOf("year"), moment_1.default().endOf("year")] },
            {
                label: "Last Year",
                value: [moment_1.default().subtract(1, "years").startOf("year"), moment_1.default().subtract(1, "years").endOf("year")]
            }
        ];
        return presets;
    }
    renderSummary() {
        if (!this.props.value) {
            return R("span", { className: "text-muted" }, "All Dates");
        }
        const startDate = this.toMoment(this.props.value[0]);
        const endDate = this.toMoment(this.props.value[1]);
        return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "");
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
        }, R("ul", { className: "nav nav-pills nav-justified" }, lodash_1.default.map(this.getPresets(), (preset) => {
            return R("li", null, R("a", { style: { padding: 5 }, onClick: this.handlePreset.bind(null, preset) }, preset.label));
        }), R("li", null, R("a", { style: { padding: 5 }, onClick: () => this.setState({ custom: true }) }, "Custom Date Range..."))));
    }
    renderCustomDropdown() {
        var _a, _b;
        const startDate = this.toMoment((_a = this.props.value) === null || _a === void 0 ? void 0 : _a[0]);
        const endDate = this.toMoment((_b = this.props.value) === null || _b === void 0 ? void 0 : _b[1]);
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
            startDate,
            endDate,
            showYearDropdown: true,
            onChange: this.handleStartChange
        })), R("div", { style: { display: "inline-block", verticalAlign: "top" } }, R(react_datepicker_1.default, {
            inline: true,
            selectsEnd: true,
            selected: endDate,
            startDate,
            endDate,
            showYearDropdown: true,
            onChange: this.handleEndChange
        }))));
    }
    renderDropdown() {
        if (this.state.custom) {
            return this.renderCustomDropdown();
        }
        else {
            return this.renderPresets();
        }
    }
    render() {
        return R(react_onclickout_1.default, { onClickOut: this.handleClickOut }, R("div", { style: { display: "inline-block", position: "relative" } }, R("div", {
            style: { width: 220 },
            onClick: () => this.setState({ dropdownOpen: true, custom: false })
        }, this.renderSummary()), 
        // Clear button
        this.props.value && this.props.onChange != null ? this.renderClear() : undefined, this.state.dropdownOpen ? this.renderDropdown() : undefined));
    }
}
exports.default = DateRangeComponent;
