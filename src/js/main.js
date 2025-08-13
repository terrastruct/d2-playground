import Editor from "./modules/editor.js";
import { D2 } from "@terrastruct/d2";
import d2jsPackage from "../js/node_modules/@terrastruct/d2/package.json";

import WebTheme from "./modules/web_theme.js";
import Export from "./modules/export.js";
import Fullscreen from "./modules/fullscreen.js";
import Theme from "./modules/theme.js";
import Zoom from "./modules/zoom.js";
import Layout from "./modules/layout.js";
import Modal from "./modules/modal.js";
import Sketch from "./modules/sketch.js";

(async () => {
  await init();
})();

async function init() {
  WebTheme.init();

  await initD2();

  // These init before editor, they read query params and set toggles, which editor reads for first compile
  Sketch.init();
  Layout.init();
  Theme.init();

  await Editor.init();

  Export.init();
  Fullscreen.init();
  Zoom.init();
  Modal.init();

  const versionDOM = document.getElementById("hero-text-version");
  try {
    const version = await window.d2.version();
    versionDOM.innerHTML = `d2 version: ${version} | d2.js version: ${d2jsPackage.version}`;
  } catch (err) {
    console.warn("Could not get D2 version:", err);
  }

  // TODO defer load hero images all the way here

  // Make Editor available globally for snippets
  window.D2Editor = Editor;
}

async function initD2() {
  try {
    window.d2 = new D2();
    await window.d2.ready;
  } catch (err) {
    console.error("D2: Failed to initialize D2 instance", err);
    throw err;
  }
}
