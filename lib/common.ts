//函数节流
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timer: any = null
  const throttledFunction = function (this: any, ...args: Parameters<T>): void {
    if (!timer) {
      timer = setTimeout(() => {
        func.apply(this, args) // 保证上下文和参数传递正确
        timer = null
      }, wait)
    }
  }
  return throttledFunction as T // 强制返回与原函数签名一致的类型
}
