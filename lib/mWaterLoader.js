"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const mwater_expressions_1 = require("mwater-expressions");
const MWaterDataSource_1 = __importDefault(require("mwater-expressions/lib/MWaterDataSource"));
const querystring_1 = __importDefault(require("querystring"));
function mWaterLoader(options, callback) {
    if (!callback) {
        return new Promise((resolve, reject) => {
            mWaterLoader(options, (err, config) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(config);
                }
            });
        });
    }
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
    if (options.locales) {
        query.locales = options.locales.join(",");
    }
    const url = options.apiUrl + "schema?" + querystring_1.default.stringify(query);
    jquery_1.default.getJSON(url, (schemaJson) => {
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
exports.default = mWaterLoader;
