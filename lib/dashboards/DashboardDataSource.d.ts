import { QuickfiltersDataSource } from "../quickfilter/QuickfiltersDataSource";
import { WidgetDataSource } from "../widgets/WidgetDataSource";
/** Data source for a dashboard */
export default class DashboardDataSource {
    /** Gets the widget data source for a specific widget */
    getWidgetDataSource(widgetType: string, widgetId: string): WidgetDataSource;
    /** Gets the quickfilters data source */
    getQuickfiltersDataSource(): QuickfiltersDataSource;
}
