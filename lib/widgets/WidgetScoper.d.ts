export default class WidgetScoper {
    constructor(scopes: any);
    applyScope(widgetId: any, scope: any): WidgetScoper;
    getScope(widgetId: any): any;
    getScopes(): any;
    getFilters(widgetId: any): any[];
    reset(): WidgetScoper;
}
