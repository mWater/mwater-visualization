"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoizedDebounce = void 0;
const lodash_1 = __importDefault(require("lodash"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function memoizedDebounce(func, wait = 0, options = {}, resolver) {
    const debounceMemo = lodash_1.default.memoize(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (..._args) => lodash_1.default.debounce(func, wait, options), resolver);
    function wrappedFunction(...args) {
        return debounceMemo(...args)(...args);
    }
    wrappedFunction.flush = (...args) => {
        debounceMemo(...args).cancel();
    };
    return wrappedFunction;
}
exports.memoizedDebounce = memoizedDebounce;
