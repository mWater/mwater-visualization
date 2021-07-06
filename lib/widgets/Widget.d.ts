export default class Widget {
    createViewElement(options: any): void;
    getData(design: any, schema: any, dataSource: any, filters: any, callback: any): void;
    isAutoHeight(): boolean;
    getFilterableTables(design: any, schema: any): never[];
    getTOCEntries(design: any, namedStrings: any): never[];
}
