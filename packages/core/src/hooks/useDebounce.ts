import React, { useRef, useEffect } from 'react';
import { Func } from '../type';

const defaultOption = {
  leading: false,
  trailing: true,
  maxing: false,
  maxWait: 0,
};

export function createUseDebounce(options?: Partial<typeof defaultOption>) {
  const opt = Object.assign({}, defaultOption, options);
  const { leading, trailing, maxing } = opt;
  return <T extends Func>(func: T, wait: number) => {
    type Params = Parameters<T>;
    type Ret = ReturnType<T>;
    const maxWait = !maxing ? 0 : opt.maxWait ? opt.maxWait : wait;
    const useRAF =
      !wait &&
      wait !== 0 &&
      typeof window?.requestAnimationFrame === 'function';
    const lastArgsRef = useRef<Params>();
    const lastThisRef = useRef<any>();
    const resultRef = useRef<Ret>();

    const timerIdRef = useRef<number>();
    const lastCallTimeRef = useRef<number>();
    const lastInvokeTimeRef = useRef<number>();
    const funcRef = useRef<T>();

    // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.

    if (typeof func !== 'function') {
      throw new TypeError('Expected a function');
    }
    funcRef.current = func;
    wait = +wait || 0;

    function invokeFunc(time: number) {
      const args = lastArgsRef.current;
      const thisArg = lastThisRef.current;

      lastArgsRef.current = lastThisRef.current = undefined;
      lastInvokeTimeRef.current = time;
      resultRef.current = funcRef.current!.apply(thisArg, args!);
      return resultRef.current;
    }

    function startTimer(pendingFunc: Func, waitTime: number) {
      if (useRAF) {
        window.cancelAnimationFrame(timerIdRef.current!);
        return window.requestAnimationFrame(pendingFunc);
      }
      return setTimeout(pendingFunc, waitTime) as any as number;
    }

    function cancelTimer(id: number) {
      if (useRAF) {
        return window.cancelAnimationFrame(id);
      }
      clearTimeout(id);
    }

    function trailingEdge(time: number) {
      timerIdRef.current = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgsRef.current) {
        return invokeFunc(time);
      }
      lastArgsRef.current = lastThisRef.current = undefined;
      return resultRef.current;
    }
    function leadingEdge(time: number) {
      // Reset any `maxWait` timer.
      lastInvokeTimeRef.current = time;
      // Start the timer for the trailing edge.
      timerIdRef.current = startTimer(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : resultRef.current;
    }

    function remainingWait(time: number) {
      const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
      const timeSinceLastInvoke = time - (lastInvokeTimeRef.current || 0);
      const timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    }

    function shouldInvoke(time: number) {
      const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
      const timeSinceLastInvoke = time - (lastInvokeTimeRef.current || 0);

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (
        lastCallTimeRef.current === undefined ||
        timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= maxWait)
      );
    }

    function timerExpired() {
      const time = Date.now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerIdRef.current = startTimer(timerExpired, remainingWait(time));
    }

    function cancel() {
      if (timerIdRef.current !== undefined) {
        cancelTimer(timerIdRef.current);
      }
      lastInvokeTimeRef.current = 0;
      lastArgsRef.current =
        lastCallTimeRef.current =
        lastThisRef.current =
        timerIdRef.current =
          undefined;
    }

    function flush() {
      return timerIdRef.current === undefined
        ? resultRef.current
        : trailingEdge(Date.now());
    }

    function pending() {
      return timerIdRef.current !== undefined;
    }

    function debounced(this: any, ...args: Params) {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgsRef.current = args;
      lastThisRef.current = this;
      lastCallTimeRef.current = time;

      if (isInvoking) {
        if (timerIdRef.current === undefined) {
          return leadingEdge(lastCallTimeRef.current);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerIdRef.current = startTimer(timerExpired, wait);
          return invokeFunc(lastCallTimeRef.current);
        }
      }
      if (timerIdRef.current === undefined) {
        timerIdRef.current = startTimer(timerExpired, wait);
      }
      return resultRef.current;
    }
    /* eslint-disable */
    useEffect(() => cancel, []);
    return React.useMemo<
      [typeof debounced, typeof cancel, typeof flush, typeof pending]
    >(() => [debounced, cancel, flush, pending], [wait]);
  };
}

export const useDebounce = createUseDebounce();
export default useDebounce;
