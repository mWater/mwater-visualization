"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DirectMapDataSource_1 = __importDefault(require("../maps/DirectMapDataSource"));
class DirectWidgetDataSource {
    constructor(options) {
        this.options = options;
    }
    /** Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
     * design: design of the widget. Ignored in the case of server-side rendering
     * filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
     * callback: (error, data)
     */
    getData(design, filters, callback) {
        this.options.widget.getData(design, this.options.schema, this.options.dataSource, filters, callback);
    }
    /** For map widgets, the following is required */
    getMapDataSource(design) {
        if (!this.options.apiUrl) {
            throw new Error("Maps not supported");
        }
        return new DirectMapDataSource_1.default({
            apiUrl: this.options.apiUrl,
            client: this.options.client,
            design,
            schema: this.options.schema,
            dataSource: this.options.dataSource
        });
    }
    /** Get the url to download an image (by id from an image or imagelist column)
     * Height, if specified, is minimum height needed. May return larger image */
    getImageUrl(imageId, height) {
        return this.options.dataSource.getImageUrl(imageId, height);
    }
}
exports.default = DirectWidgetDataSource;
