import Editor from "./editor.js";

import QueryParams from "../lib/queryparams";

function init() {
  readQueryParam();
  document
    .getElementById("sketch-checkbox")
    .addEventListener("change", (e) => toggleSketch(e.target.checked));
  document
    .getElementById("sketch-mobile-icon")
    .addEventListener("click", () => toggleSketch(QueryParams.get("sketch") === "0"));
  updateMobileIcon(QueryParams.get("sketch") === "1");
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

function toggleSketch(on) {
  const icon = document.getElementById("sketch-toggle-icon");
  if (on) {
    icon.src = "assets/icons/toggle_check.svg";
    QueryParams.set("sketch", "1");
  } else {
    icon.src = "assets/icons/toggle_x.svg";
    QueryParams.set("sketch", "0");
  }
  if (Editor.getDiagramSVG()) {
    Editor.compile();
  }

  updateMobileIcon(on);
}

function updateMobileIcon(on) {
  const icon = document.getElementById("sketch-mobile");

  if (on) {
    icon.classList.add("sketch-mobile-activated");
  } else {
    icon.classList.remove("sketch-mobile-activated");
  }
}

function getValue() {
  return document.getElementById("sketch-checkbox").checked ? "1" : "0";
}

export default {
  init,
  getValue,
};
