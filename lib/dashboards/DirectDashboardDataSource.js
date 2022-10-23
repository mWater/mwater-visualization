"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
const DirectWidgetDataSource_1 = __importDefault(require("../widgets/DirectWidgetDataSource"));
const QuickfilterUtils = __importStar(require("../quickfilter/QuickfilterUtils"));
const DashboardDataSource_1 = __importDefault(require("./DashboardDataSource"));
/** Uses direct DataSource queries */
class DirectDashboardDataSource extends DashboardDataSource_1.default {
    /** Create dashboard data source that uses direct jsonql calls */
    constructor(options) {
        super();
        this.options = options;
    }
    // Gets the widget data source for a specific widget
    getWidgetDataSource(widgetType, widgetId) {
        const widget = WidgetFactory_1.default.createWidget(widgetType);
        return new DirectWidgetDataSource_1.default({
            apiUrl: this.options.apiUrl,
            client: this.options.client,
            widget,
            schema: this.options.schema,
            dataSource: this.options.dataSource
        });
    }
    // Gets the quickfilters data source
    getQuickfiltersDataSource() {
        return {
            getValues: (index, expr, filters, offset, limit, callback) => {
                // Perform query
                return QuickfilterUtils.findExprValues(expr, this.options.schema, this.options.dataSource, filters, offset, limit, callback);
            }
        };
    }
}
exports.default = DirectDashboardDataSource;
