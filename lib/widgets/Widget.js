"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Widget {
    /** Creates a React element that is a view of the widget */
    createViewElement(options) {
        throw new Error("Not implemented");
    }
    /* Get the data that the widget needs. This will be called on the server, typically.
     *   design: design of the chart
     *   schema: schema to use
     *   dataSource: data source to get data from
     *   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
     *   callback: (error, data)
     */
    getData(design, schema, dataSource, filters, callback) {
        throw new Error("Not implemented");
    }
    /** Determine if widget is auto-height, which means that a vertical height is not required. */
    isAutoHeight() {
        return false;
    }
    /** Get a list of table ids that can be filtered on */
    getFilterableTables(design, schema) {
        return [];
    }
    /** Get table of contents entries for the widget, entries that should be displayed in the TOC.
     * returns `[{ id: "id that is unique within widget", text: "text of TOC entry", level: 1, 2, etc. }]
     */
    getTOCEntries(design, namedStrings) {
        return [];
    }
}
exports.default = Widget;
