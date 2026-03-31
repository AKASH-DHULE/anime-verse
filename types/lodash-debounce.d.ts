declare module 'lodash.debounce' {
  type Func<T extends (...args: unknown[]) => unknown> = T & { cancel?: () => void; flush?: () => void };
  function debounce<T extends (...args: unknown[]) => unknown>(fn: T, wait?: number, options?: { leading?: boolean; trailing?: boolean; maxWait?: number }): Func<T>;
  export default debounce;
}
