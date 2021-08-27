"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Data source for a dashboard */
class DashboardDataSource {
    /** Gets the widget data source for a specific widget */
    getWidgetDataSource(widgetType, widgetId) {
        throw new Error("Not implemented");
    }
    /** Gets the quickfilters data source */
    getQuickfiltersDataSource() {
        throw new Error("Not implemented");
    }
}
exports.default = DashboardDataSource;
