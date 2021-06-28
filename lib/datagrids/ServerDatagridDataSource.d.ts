/// <reference types="jquery" />
declare const _default: {
    new (options: any): {
        getRows(design: any, offset: any, limit: any, filters: any, callback: any): JQuery.jqXHR<any>;
        getQuickfiltersDataSource(): ServerQuickfilterDataSource;
    };
};
export default _default;
declare class ServerQuickfilterDataSource {
    constructor(options: any);
    getValues(index: any, expr: any, filters: any, offset: any, limit: any, callback: any): JQuery.jqXHR<any>;
}
