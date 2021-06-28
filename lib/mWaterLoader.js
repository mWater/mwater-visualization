"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const jquery_1 = __importDefault(require("jquery"));
const mwater_expressions_1 = require("mwater-expressions");
const MWaterDataSource_1 = __importDefault(require("mwater-expressions/lib/MWaterDataSource"));
const querystring_1 = __importDefault(require("querystring"));
// Loads a schema and data source that is specific to mWater server
// options:
//   apiUrl: e.g. "https://api.mwater.co/v3/". required
//   client: client id if logged in. optional
//   share: share if using a share to get schema. optional
//   asUser: Load schema as a specific user (for shared dashboards, etc). optional
//   extraTables: Extra tables to load in schema. Forms are not loaded by default as they are too many
//   localCaching: default true. False to disable local caching of queries
// callback is called with (error, config) where config is { schema, dataSource }
function default_1(options, callback) {
    // Load schema
    const query = {};
    if (options.client) {
        query.client = options.client;
    }
    if (options.share) {
        query.share = options.share;
    }
    if (options.asUser) {
        query.asUser = options.asUser;
    }
    if (options.extraTables && options.extraTables.length > 0) {
        query.extraTables = options.extraTables.join(",");
    }
    const url = options.apiUrl + "schema?" + querystring_1.default.stringify(query);
    return jquery_1.default.getJSON(url, (schemaJson) => {
        const schema = new mwater_expressions_1.Schema(schemaJson);
        const dataSource = new MWaterDataSource_1.default(options.apiUrl, options.client, {
            serverCaching: false,
            localCaching: options.localCaching != null ? options.localCaching : true
        });
        return callback(null, {
            schema,
            dataSource
        });
    }).fail((xhr) => {
        return callback(new Error(xhr.responseText));
    });
}
exports.default = default_1;
