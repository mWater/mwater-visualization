"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatagridQueryBuilder_1 = __importDefault(require("./DatagridQueryBuilder"));
const QuickfilterUtils = __importStar(require("../quickfilter/QuickfilterUtils"));
/** Uses direct DataSource queries */
class DirectDatagridDataSource {
    // Create dashboard data source that uses direct jsonql calls
    // options:
    //   schema: schema to use
    //   dataSource: data source to use
    constructor(options) {
        this.options = options;
    }
    /** Gets the rows specified */
    getRows(design, offset, limit, filters, callback) {
        const queryBuilder = new DatagridQueryBuilder_1.default(this.options.schema);
        // Create query to get the page of rows at the specific offset
        const query = queryBuilder.createQuery(design, {
            offset,
            limit,
            extraFilters: filters
        });
        return this.options.dataSource.performQuery(query, callback);
    }
    // Gets the quickfilters data source
    getQuickfiltersDataSource() {
        return {
            getValues: (index, expr, filters, offset, limit, callback) => {
                // Perform query
                return QuickfilterUtils.findExprValues(expr, this.options.schema, this.options.dataSource, filters, offset, limit, callback);
            }
        };
    }
}
exports.default = DirectDatagridDataSource;
