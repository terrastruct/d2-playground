import Editor from "./modules/editor.js";
import { D2 } from "@terrastruct/d2";

import WebTheme from "./modules/web_theme.js";
import Export from "./modules/export.js";
import Fullscreen from "./modules/fullscreen.js";
import Theme from "./modules/theme.js";
import Zoom from "./modules/zoom.js";
import Layout from "./modules/layout.js";
import Modal from "./modules/modal.js";
import Sketch from "./modules/sketch.js";
// import Alert from "./modules/alert.js";

(async () => {
  await init();
})();

async function init() {
  WebTheme.init();
  
  await initD2();
  
  await Editor.init();
  
  Sketch.init();
  Export.init();
  Fullscreen.init();
  Theme.init();
  Zoom.init();
  Layout.init();
  Modal.init();

  // Version method will be available in the next d2.js release
  // const versionDOM = document.getElementById("hero-text-version");
  // try {
  //   const version = await window.d2.version();
  //   versionDOM.innerHTML = `d2 version: ${version}`;
  // } catch (err) {
  //   console.warn("Could not get D2 version:", err);
  // }

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
  // Alert.show("9:41", 3000);
}
