import _ from "lodash";
export interface MemoizeDebouncedFunction<F extends (...args: any[]) => any> {
    (...args: Parameters<F>): void;
    flush: (...args: Parameters<F>) => void;
}
export declare function memoizedDebounce<F extends (...args: any[]) => any>(func: F, wait?: number, options?: _.DebounceSettings, resolver?: (...args: Parameters<F>) => unknown): MemoizeDebouncedFunction<F>;
