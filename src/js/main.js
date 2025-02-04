// NOTE Editor must be imported before wasm_exec.
import Editor from "./modules/editor.js";
import "./vendor/wasm_exec_go122.js";

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
  await initD2();
  // TODO should this go after the rest?
  Editor.init();
  Sketch.init();
  Export.init();
  Fullscreen.init();
  Theme.init();
  Zoom.init();
  Layout.init();
  Modal.init();

  const versionDOM = document.getElementById("header-d2-version");
  const version = JSON.parse(d2.version());
  versionDOM.innerHTML = `${version.data}`;

  // TODO defer load hero images all the way here
}

async function initD2() {
  const go = new Go();
  const res = await WebAssembly.instantiateStreaming(
    fetch("../d2.wasm"),
    go.importObject
  );
  const callback = new Promise((resolve) => {
    // @ts-ignore
    window.onWasmInitialized = resolve;
  });
  go.run(res.instance);
  await callback;
  // Alert.show("9:41", 3000);
}
