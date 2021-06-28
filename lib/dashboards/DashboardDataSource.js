"use strict";
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
Object.defineProperty(exports, "__esModule", { value: true });
// Data source for a dashboard that allows client-server model that supports sharing of dashboards
let DashboardDataSource;
exports.default = DashboardDataSource = class DashboardDataSource {
    // Gets the widget data source for a specific widget
    getWidgetDataSource(widgetType, widgetId) {
        throw new Error("Not implemented");
    }
    // Gets the quickfilters data source
    getQuickfiltersDataSource() {
        throw new Error("Not implemented");
    }
};
