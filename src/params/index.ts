const PARAMS = fromQueryString(location.search);

export default {
  get(name: string) {
    return PARAMS[name];
  },
  getBool(name: string) {
    return !!PARAMS[name];
  },
  getNumber(name: string) {
    var val = Number(PARAMS[name]);
    return isNaN(val) ? 0 : val;
  },
  getString(name: string) {
    return String(PARAMS[name] || "");
  },
  has(name: string) {
    return name in PARAMS;
  },
  isBool(name: string) {
    return PARAMS[name] === true || PARAMS[name] === false;
  },
  isString(name: string) {
    return typeof PARAMS[name] === "string";
  },
  isNumber(name: string) {
    return typeof PARAMS[name] === "number";
  },
  all() {
    return { ...PARAMS };
  },
};

function fromQueryString(queryString: string): {
  [key: string]: boolean | number | string;
} {
  if (queryString.startsWith("?")) {
    queryString = queryString.slice(1);
  }
  if (!queryString) {
    return {};
  }
  const obj: { [key: string]: boolean | number | string } = {};
  queryString.split("&").forEach((pairString) => {
    const pair = pairString.split("=");
    if (!pair[1]) {
      obj[pair[0]] = true;
    } else if (!isNaN(pair[1] as any)) {
      obj[pair[0]] = Number(pair[1]);
    } else {
      obj[pair[0]] = decodeURIComponent(pair[1]);
    }
  });
  return obj;
}
