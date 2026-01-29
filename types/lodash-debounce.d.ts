declare module 'lodash.debounce' {
  type Func<T extends (...args: any[]) => any> = T & { cancel?: () => void; flush?: () => void };
  function debounce<T extends (...args: any[]) => any>(fn: T, wait?: number, options?: any): Func<T>;
  export default debounce;
}
