// NOTE Editor must be imported before wasm_exec.
import Editor from "./modules/editor.js";
import "./vendor/wasm_exec.js";

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

  // TODO defer load hero images all the way here
}

async function initD2() {
  const go = new Go();
  const res = await WebAssembly.instantiateStreaming(
    fetch("../d2.wasm"),
    go.importObject
  );
  go.run(res.instance);
  // Alert.show("9:41", 3000);
}
