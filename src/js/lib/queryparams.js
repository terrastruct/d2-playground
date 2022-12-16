function del(k) {
  const url = new URL(window.location);
  const params = url.searchParams;
  params.delete(k);
  window.history.replaceState(null, null, `?${params.toString()}`);
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
    window.history.replaceState(null, null, `?${params.toString()}`);
  }
}

export default {
  get,
  set,
  del,
}
