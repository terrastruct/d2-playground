import Editor from "./editor.js";
import Export from "./export.js";

import QueryParams from "../lib/queryparams";

const rendererOptions = ["SVG", "Sketch", "ASCII"];

function init() {
  readQueryParams();
  hydrateRendererOptions();
  addListeners();

  document.getElementById("renderer-btn").addEventListener("click", toggleMenu);
  document.getElementById("renderer-menu").addEventListener("mouseleave", hideMenu);

  Export.updateExportButton();
}

function readQueryParams() {
  const sketchParam = QueryParams.get("sketch");
  const asciiParam = QueryParams.get("ascii");

  let current = "SVG";

  if (asciiParam === "1") {
    current = "ASCII";
  } else if (sketchParam === "1") {
    current = "Sketch";
  }

  document.getElementById("current-renderer").textContent = current;
}

function hydrateRendererOptions() {
  let itemEls = "";

  for (const option of rendererOptions) {
    itemEls += `<div class="btn-menu-item renderer-option">${option}</div>`;
  }

  document.getElementById("renderer-menu").innerHTML = itemEls;
}

function addListeners() {
  for (const el of document.getElementsByClassName("renderer-option")) {
    el.addEventListener("click", () => changeRenderer(el.textContent));
  }
}

function changeRenderer(name) {
  document.getElementById("current-renderer").textContent = name;
  hideMenu();

  // Clear both parameters first
  QueryParams.del("sketch");
  QueryParams.del("ascii");

  // Set the appropriate parameter
  if (name === "Sketch") {
    QueryParams.set("sketch", "1");
  } else if (name === "ASCII") {
    QueryParams.set("ascii", "1");
  }

  if (Editor.getDiagramSVG()) {
    Editor.compile();
  }
  Export.updateExportButton();
}

function toggleMenu() {
  const menu = document.getElementById("renderer-menu");
  if (menu.style.display == "none") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
}

function hideMenu() {
  document.getElementById("renderer-menu").style.display = "none";
}

function getCurrentRenderer() {
  return document.getElementById("current-renderer").textContent;
}

function getValue() {
  const current = getCurrentRenderer();
  if (current === "Sketch") {
    return "1";
  }
  return "0";
}

function getASCII() {
  return getCurrentRenderer() === "ASCII";
}

export default {
  init,
  getValue,
  getASCII,
};
