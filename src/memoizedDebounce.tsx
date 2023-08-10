import _, { Cancelable } from "lodash"

// taken from https://github.com/lodash/lodash/issues/2403#issuecomment-1158234729
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MemoizeDebouncedFunction<F extends (...args: any[]) => any> {
  (...args: Parameters<F>): void
  flush: (...args: Parameters<F>) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoizedDebounce<F extends (...args: any[]) => any>(
  func: F,
  wait = 0,
  options: _.DebounceSettings = {},
  resolver?: (...args: Parameters<F>) => unknown
): MemoizeDebouncedFunction<F> {
  const debounceMemo = _.memoize<(...args: Parameters<F>) => F & Cancelable>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (..._args: Parameters<F>) => _.debounce(func, wait, options),
    resolver
  )

  function wrappedFunction(...args: Parameters<F>): ReturnType<F> | undefined {
    return debounceMemo(...args)(...args)
  }

  wrappedFunction.flush = (...args: Parameters<F>): void => {
    debounceMemo(...args).cancel()
  }

  return wrappedFunction as unknown as MemoizeDebouncedFunction<F>
}
