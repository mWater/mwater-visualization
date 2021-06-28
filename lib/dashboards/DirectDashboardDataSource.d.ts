declare const _default: {
    new (options: any): {
        getWidgetDataSource(widgetType: any, widgetId: any): {
            getData(design: any, filters: any, callback: any): any;
            getMapDataSource(design: any): any;
            getImageUrl(imageId: any, height: any): any;
        };
        getQuickfiltersDataSource(): {
            getValues: (index: any, expr: any, filters: any, offset: any, limit: any, callback: any) => void;
        };
    };
};
export default _default;
