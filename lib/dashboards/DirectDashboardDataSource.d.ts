import DirectWidgetDataSource from "../widgets/DirectWidgetDataSource";
export default class DirectDashboardDataSource {
    constructor(options: any);
    getWidgetDataSource(widgetType: any, widgetId: any): DirectWidgetDataSource;
    getQuickfiltersDataSource(): {
        getValues: (index: any, expr: any, filters: any, offset: any, limit: any, callback: any) => void;
    };
}
