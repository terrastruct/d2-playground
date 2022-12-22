import Editor from "./editor.js";

import QueryParams from "../lib/queryparams";

function init() {
  readQueryParam();
  document.getElementById("sketch-checkbox").addEventListener("change", toggleSketch);
}

function readQueryParam() {
  const param = QueryParams.get("sketch");
  if (param === "") {
    return;
  }

  if (param === "1") {
    document.getElementById("sketch-checkbox").checked = true;
    return;
  } else if (param === "0") {
    document.getElementById("sketch-checkbox").checked = false;
    return;
  } else {
    QueryParams.del("sketch");
  }
}

function toggleSketch(e) {
  const icon = document.getElementById("sketch-toggle-icon");
  if (e.target.checked) {
    icon.src = "assets/icons/toggle_check.svg";
    QueryParams.set("sketch", "1");
  } else {
    icon.src = "assets/icons/toggle_x.svg";
    QueryParams.set("sketch", "0");
  }
  if (Editor.getDiagramSVG()) {
    Editor.compile();
  }
}

function getValue() {
  return document.getElementById("sketch-checkbox").checked ? "1" : "0";
}

export default {
  init,
  getValue,
};
