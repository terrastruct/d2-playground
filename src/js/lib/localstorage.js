function get(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}

function set(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {
    // don't care
  }
}

export default {
  get,
  set,
};
