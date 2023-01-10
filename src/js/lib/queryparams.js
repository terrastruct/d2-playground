function del(k) {
  const url = new URL(window.location);
  const params = url.searchParams;
  params.delete(k);
  setParams(params.toString());
}

function get(k) {
  const url = new URL(window.location);
  const params = url.searchParams;
  return params.get(k);
}

function set(k, v) {
  const url = new URL(window.location);
  const params = url.searchParams;
  if (params.get("k") !== v) {
    params.set(k, v);
    setParams(params.toString());
  }
}

function setParams(v) {
  if (!v.startsWith("?")) {
    v = "?" + v;
  }
  if (!v.endsWith("&")) {
    v = v + "&";
  }
  window.history.replaceState(null, null, v);
}

export default {
  get,
  set,
  del,
};
