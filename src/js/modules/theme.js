import Editor from "./editor.js";

import QueryParams from "../lib/queryparams";

const themes = [
  "Neutral default",
  "Neutral gray",
  "Flagship Terrastruct",
  "Mixed berry blue",
  "Cool classics",
  "Grape soda",
  "Aubergine",
  "Colorblind clear",
  "Vanilla nitro cola",
  "Orange creamsicle",
  "Shirley temple",
  "Earth tones",
  "Everglade green",
  "Buttered toast",
  "Dark mauve",
  "Terminal",
  "Terminal grayscale",
];

const themeIDs = {
  "Neutral default": 0,
  "Neutral grey": 1,
  "Flagship Terrastruct": 3,
  "Mixed berry blue": 5,
  "Cool classics": 4,
  "Grape soda": 6,
  Aubergine: 7,
  "Colorblind clear": 8,
  "Vanilla nitro cola": 100,
  "Orange creamsicle": 101,
  "Shirley temple": 102,
  "Earth tones": 103,
  "Everglade green": 104,
  "Buttered toast": 105,
  "Dark mauve": 200,
  Terminal: 300,
  "Terminal grayscale": 301,
};

const idToTheme = {};

function init() {
  for (const [name, id] of Object.entries(themeIDs)) {
    idToTheme[`${id}`] = name;
  }
  readQueryParam();
  hydrateThemeOptions();
  addListeners();

  document.getElementById("theme-btn").addEventListener("click", toggleMenu);
  document.getElementById("theme-menu").addEventListener("mouseleave", hideMenu);
}

function readQueryParam() {
  const paramTheme = QueryParams.get("theme");
  if (!paramTheme) {
    return;
  }

  const theme = idToTheme[paramTheme];
  if (theme) {
    document.getElementById("current-theme").textContent = theme;
    return;
  } else {
    QueryParams.del("theme");
  }
}

function hydrateThemeOptions() {
  let itemEls = "";

  for (const theme of themes) {
    itemEls += `<div class="btn-menu-item theme-option">${theme}</div>`;
  }

  document.getElementById("theme-menu").innerHTML = itemEls;
}

function addListeners() {
  for (const el of document.getElementsByClassName("theme-option")) {
    el.addEventListener("click", () => changeTheme(el.textContent));
  }
}

function changeTheme(name) {
  document.getElementById("current-theme").textContent = name;
  hideMenu();
  QueryParams.set("theme", themeIDs[name]);
  if (Editor.getDiagramSVG()) {
    Editor.compile();
  }
}

function getThemeID() {
  return themeIDs[document.getElementById("current-theme").textContent];
}

function toggleMenu() {
  const menu = document.getElementById("theme-menu");
  if (menu.style.display == "none") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
}

function hideMenu() {
  document.getElementById("theme-menu").style.display = "none";
}

export default {
  init,
  getThemeID,
};
