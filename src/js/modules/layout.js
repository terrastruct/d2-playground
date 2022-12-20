import Modal from "./modal";
import Alert from "./alert";
import Editor from "./editor.js";

import QueryParams from "../lib/queryparams";
import LocalStorage from "../lib/localstorage";

let talaKey;
let layout = "dagre";

function init() {
  document.getElementById("layout-btn").addEventListener("click", toggleMenu);
  document.getElementById("layout-menu").addEventListener("mouseleave", hideMenu);
  document.getElementById("key").addEventListener("click", inputTALAKey);

  for (const el of document.getElementsByClassName("layout-menu-item")) {
    el.addEventListener("click", changeLayout);
  }

  const storedKey = LocalStorage.get("talaKey");
  if (storedKey) {
    talaKey = storedKey;
  }
  readQueryParam();
}

function inputTALAKey() {
  let content = `<div id="key-explanation">
    TALA is a proprietary layout engine. It is free to evaluate, but requires a valid license key to remove the watermark. You can find more information about TALA and license keys <a href="https://terrastruct.com/tala/">here</a>.
  </div>
  <textarea id="key-input" placeholder="tstruct_XXX">${talaKey || ""}</textarea>`;

  Modal.show("TALA License Key", content, "Attach to browser requests", attachKey);
}

function attachKey() {
  const input = document.getElementById("key-input").value;
  if (!input.startsWith("tstruct_")) {
    Alert.show("License key does not look valid.", 4000);
    return;
  }
  talaKey = input;
  LocalStorage.set("talaKey", talaKey);
  Modal.close();
}

function readQueryParam() {
  const paramLayout = QueryParams.get("layout");
  if (!paramLayout) {
    return;
  }

  let valid = false;
  for (const el of document.getElementsByClassName("layout-menu-item")) {
    if (paramLayout.toLowerCase() === el.textContent.toLowerCase()) {
      valid = true;
      document.getElementById("current-layout").textContent = el.textContent;
      layout = el.textContent.toLowerCase();
      setKeyVisibility();
    }
  }

  if (!valid) {
    QueryParams.del("layout");
  }
}

function changeLayout(e) {
  layout = e.target.textContent.toLowerCase();
  document.getElementById("current-layout").textContent = e.target.textContent;
  QueryParams.set("layout", layout);
  setKeyVisibility();
  hideMenu();
  if (Editor.getDiagramSVG()) {
    Editor.compile();
  }
}

function toggleMenu() {
  const menu = document.getElementById("layout-menu");
  if (menu.style.display == "none") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
}

function hideMenu() {
  document.getElementById("layout-menu").style.display = "none";
}

function getLayout() {
  return layout;
}

function setKeyVisibility() {
  if (layout === "tala") {
    document.getElementById("key").style.display = "block";
  } else {
    document.getElementById("key").style.display = "none";
  }
}

function getTALAKey() {
  return talaKey;
}

export default {
  init,
  getLayout,
  getTALAKey,
};
