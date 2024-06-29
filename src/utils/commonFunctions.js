export const queryParamsBuilder = (query) => {
  if (typeof query !== "object") {
    return "";
  }
  const keys = Object.keys(query).filter(
    (b) => query[b] !== null && query[b] !== ""
  );
  if (keys.length) {
    return (
      "?" +
      new URLSearchParams(
        keys.reduce((a, b) => {
          a[b] = query[b];
          return a;
        }, {})
      ).toString()
    );
  }
  return "";
};

let timeout;
export const debounce = (callback, delay) => {
  clearTimeout(timeout);
  timeout = setTimeout(callback, delay);
};
