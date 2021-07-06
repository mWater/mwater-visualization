"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const querystring_1 = __importDefault(require("querystring"));
const DatagridDataSource_1 = __importDefault(require("./DatagridDataSource"));
const compressJson_1 = __importDefault(require("../compressJson"));
// Uses mWater server to get datagrid data to allow sharing with unprivileged users
class ServerDatagridDataSource extends DatagridDataSource_1.default {
    // options:
    //   apiUrl: API url to use for talking to mWater server
    //   client: client id to use for talking to mWater server
    //   share: share id to use for talking to mWater server
    //   datagridId: datagrid id to use on server
    //   rev: revision to use to allow caching
    constructor(options) {
        super();
        this.options = options;
    }
    // Get the data that the widget needs. The widget should implement getData method (see above) to get the data from the server
    //  design: design of the widget. Ignored in the case of server-side rendering
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    getRows(design, offset, limit, filters, callback) {
        const query = {
            client: this.options.client,
            share: this.options.share,
            filters: compressJson_1.default(filters),
            rev: this.options.rev,
            offset,
            limit
        };
        const url = this.options.apiUrl + `datagrids/${this.options.datagridId}/data?` + querystring_1.default.stringify(query);
        return jquery_1.default.getJSON(url, (data) => {
            return callback(null, data);
        }).fail((xhr) => {
            console.log(xhr.responseText);
            return callback(new Error(xhr.responseText));
        });
    }
    getQuickfiltersDataSource() {
        return new ServerQuickfilterDataSource(this.options);
    }
}
exports.default = ServerDatagridDataSource;
class ServerQuickfilterDataSource {
    // options:
    //   apiUrl: API url to use for talking to mWater server
    //   client: client id to use for talking to mWater server
    //   share: share id to use for talking to mWater server
    //   datagridId: datagrid id to use on server
    //   rev: revision to use to allow caching
    constructor(options) {
        this.options = options;
    }
    // Gets the values of the quickfilter at index
    getValues(index, expr, filters, offset, limit, callback) {
        const query = {
            client: this.options.client,
            share: this.options.share,
            filters: compressJson_1.default(filters),
            offset,
            limit,
            rev: this.options.rev
        };
        const url = this.options.apiUrl +
            `datagrids/${this.options.datagridId}/quickfilters/${index}/values?` +
            querystring_1.default.stringify(query);
        return jquery_1.default.getJSON(url, (data) => {
            return callback(null, data);
        }).fail((xhr) => {
            console.log(xhr.responseText);
            return callback(new Error(xhr.responseText));
        });
    }
}
