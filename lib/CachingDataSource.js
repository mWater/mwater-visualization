"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let CachingDataSource;
const mwater_expressions_1 = require("mwater-expressions");
const lru_cache_1 = __importDefault(require("lru-cache"));
// Data source that caches requests. Designed to be simple for implementation
// Pass in option of perform which is function with signature (query, cb) where cb is called with (null, rows) on success
exports.default = CachingDataSource = class CachingDataSource extends mwater_expressions_1.DataSource {
    constructor(options) {
        super();
        this.perform = options.perform;
        this.cache = new lru_cache_1.default({ max: 500, maxAge: 1000 * 15 * 60 });
    }
    performQuery(query, cb) {
        // If no callback, use promise
        if (!cb) {
            return new Promise((resolve, reject) => {
                return this.performQuery(jsonql, (error, rows) => {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        return resolve(rows);
                    }
                });
            });
        }
        const cacheKey = JSON.stringify(query);
        const cachedRows = this.cache.get(cacheKey);
        if (cachedRows) {
            return cb(null, cachedRows);
        }
        return this.perform(query, (err, rows) => {
            if (!err) {
                // Cache rows
                this.cache.set(cacheKey, rows);
            }
            return cb(err, rows);
        });
    }
};
