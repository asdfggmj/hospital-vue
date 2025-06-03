// 防抖工具js，用于限制搜索
export function debounce(func, delay = 500) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
